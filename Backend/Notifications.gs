/**
 * Google Apps Script for HSE System - Notifications Module
 * 
 * موديول الإشعارات والتذكيرات
 * 
 * المميزات:
 * - تذكيرات تلقائية للمهام المستحقة
 * - تنبيهات للتصاريح المنتهية
 * - إشعارات للإجراءات المتأخرة
 * - تذكيرات للفحوصات المستحقة
 */

/**
 * الحصول على جميع الإشعارات للمستخدم
 * @param {string} userId - معرف المستخدم
 * @return {Object} قائمة الإشعارات
 */
function getUserNotifications(userId) {
    try {
        if (!userId) {
            return { success: false, message: 'معرف المستخدم غير محدد', data: [] };
        }
        
        const notifications = [];
        const now = new Date();
        
        // 0. إشعارات محفوظة في ورقة Notifications (مثل طلبات التغيير)
        try {
            const spreadsheetId = getSpreadsheetId();
            if (spreadsheetId) {
                const sheetNotifications = readFromSheet('Notifications', spreadsheetId);
                if (sheetNotifications && Array.isArray(sheetNotifications)) {
                    const userNotifs = sheetNotifications.filter(function(n) {
                        return n && (n.userId === userId || (n.userId && String(n.userId).toLowerCase() === String(userId).toLowerCase()));
                    });
                    userNotifs.forEach(function(n) {
                        notifications.push({
                            id: n.id,
                            type: n.type || 'info',
                            priority: n.priority || 'medium',
                            title: n.title || 'إشعار',
                            message: n.message || '',
                            relatedId: n.relatedId,
                            relatedType: n.relatedType,
                            createdAt: n.createdAt || now,
                            read: n.read
                        });
                    });
                }
            }
        } catch (e) {
            Logger.log('Error reading Notifications sheet: ' + e.toString());
        }
        
        // 1. إشعارات المهام المتأخرة
        try {
            const userTasks = getUserTasksByUserId(userId);
            if (userTasks.success && userTasks.data) {
                const overdueTasks = userTasks.data.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    return dueDate < now && 
                           task.status !== 'مكتمل' && 
                           task.status !== 'completed';
                });
                
                overdueTasks.forEach(task => {
                    notifications.push({
                        id: 'TASK-' + task.id,
                        type: 'task',
                        priority: 'high',
                        title: 'مهمة متأخرة',
                        message: `المهمة "${task.title || task.taskTitle || 'بدون عنوان'}" متأخرة`,
                        taskId: task.id,
                        dueDate: task.dueDate,
                        createdAt: new Date()
                    });
                });
            }
        } catch (error) {
            Logger.log('Error getting task notifications: ' + error.toString());
        }
        
        // 2. إشعارات الإجراءات المتأخرة
        try {
            const actions = readFromSheet('ActionTrackingRegister', getSpreadsheetId());
            const userActions = actions.filter(action => {
                return action.responsible === userId || 
                       (action.assignedTo && action.assignedTo === userId);
            });
            
            const overdueActions = userActions.filter(action => {
                if (!action.originalTargetDate) return false;
                const targetDate = new Date(action.originalTargetDate);
                return targetDate < now && 
                       action.status !== 'Closed' && 
                       action.status !== 'مغلق' && 
                       action.status !== 'مكتمل';
            });
            
            overdueActions.forEach(action => {
                notifications.push({
                    id: 'ACTION-' + action.id,
                    type: 'action',
                    priority: 'high',
                    title: 'إجراء متأخر',
                    message: `الإجراء "${action.observationIssueHazard || 'بدون وصف'}" متأخر`,
                    actionId: action.id,
                    dueDate: action.originalTargetDate,
                    createdAt: new Date()
                });
            });
        } catch (error) {
            Logger.log('Error getting action notifications: ' + error.toString());
        }
        
        // 3. إشعارات التصاريح المنتهية
        try {
            const ptwAlerts = getPTWAlerts();
            if (ptwAlerts.success && ptwAlerts.data) {
                const userPTWs = ptwAlerts.data.expired.filter(ptw => {
                    return ptw.responsible === userId || 
                           (ptw.assignedTo && ptw.assignedTo === userId);
                });
                
                userPTWs.forEach(ptw => {
                    notifications.push({
                        id: 'PTW-EXPIRED-' + ptw.id,
                        type: 'ptw',
                        priority: 'medium',
                        title: 'تصريح عمل منتهي',
                        message: `تصريح العمل "${ptw.workDescription || 'بدون وصف'}" منتهي`,
                        ptwId: ptw.id,
                        endDate: ptw.endDate,
                        createdAt: new Date()
                    });
                });
                
                // التصاريح التي تنتهي قريباً
                const expiringPTWs = ptwAlerts.data.expiringSoon.filter(ptw => {
                    return ptw.responsible === userId || 
                           (ptw.assignedTo && ptw.assignedTo === userId);
                });
                
                expiringPTWs.forEach(ptw => {
                    notifications.push({
                        id: 'PTW-EXPIRING-' + ptw.id,
                        type: 'ptw',
                        priority: 'medium',
                        title: 'تصريح عمل ينتهي قريباً',
                        message: `تصريح العمل "${ptw.workDescription || 'بدون وصف'}" ينتهي خلال 24 ساعة`,
                        ptwId: ptw.id,
                        endDate: ptw.endDate,
                        createdAt: new Date()
                    });
                });
            }
        } catch (error) {
            Logger.log('Error getting PTW notifications: ' + error.toString());
        }
        
        // 4. إشعارات الفحوصات المستحقة
        try {
            const inspections = readFromSheet('PeriodicInspectionSchedules', getSpreadsheetId());
            const upcomingInspections = inspections.filter(schedule => {
                if (!schedule.scheduledDate) return false;
                const scheduledDate = new Date(schedule.scheduledDate);
                const daysUntil = (scheduledDate - now) / (1000 * 60 * 60 * 24);
                return daysUntil >= 0 && daysUntil <= 7 && 
                       schedule.status !== 'مكتمل' && 
                       schedule.status !== 'Completed' &&
                       (schedule.assignedTo === userId || schedule.responsible === userId);
            });
            
            upcomingInspections.forEach(schedule => {
                notifications.push({
                    id: 'INSPECTION-' + schedule.id,
                    type: 'inspection',
                    priority: 'medium',
                    title: 'فحص دوري مستحق',
                    message: `الفحص "${schedule.categoryName || 'بدون فئة'}" مستحق في ${schedule.scheduledDate}`,
                    scheduleId: schedule.id,
                    scheduledDate: schedule.scheduledDate,
                    createdAt: new Date()
                });
            });
        } catch (error) {
            Logger.log('Error getting inspection notifications: ' + error.toString());
        }
        
        // 5. إشعارات التدريب القادم
        try {
            const trainings = readFromSheet('Training', getSpreadsheetId());
            const upcomingTrainings = trainings.filter(training => {
                if (!training.startDate) return false;
                const startDate = new Date(training.startDate);
                const daysUntil = (startDate - now) / (1000 * 60 * 60 * 24);
                return daysUntil >= 0 && daysUntil <= 7 && 
                       training.status !== 'مكتمل' && 
                       training.status !== 'Completed';
            });
            
            upcomingTrainings.forEach(training => {
                // التحقق من المشاركين
                let isParticipant = false;
                if (training.participants) {
                    if (typeof training.participants === 'string') {
                        isParticipant = training.participants.includes(userId);
                    } else if (Array.isArray(training.participants)) {
                        isParticipant = training.participants.includes(userId);
                    }
                }
                
                if (isParticipant || training.trainer === userId) {
                    notifications.push({
                        id: 'TRAINING-' + training.id,
                        type: 'training',
                        priority: 'low',
                        title: 'تدريب قادم',
                        message: `التدريب "${training.name || 'بدون اسم'}" يبدأ في ${training.startDate}`,
                        trainingId: training.id,
                        startDate: training.startDate,
                        createdAt: new Date()
                    });
                }
            });
        } catch (error) {
            Logger.log('Error getting training notifications: ' + error.toString());
        }
        
        // 6. إشعارات طلبات اعتماد المقاولين
        try {
            const approvalRequests = readFromSheet('ContractorApprovalRequests', getSpreadsheetId());
            if (approvalRequests && approvalRequests.length > 0) {
                // التحقق من صلاحيات المستخدم
                let isAdmin = false;
                try {
                    // محاولة الحصول على بيانات المستخدم والتحقق من الصلاحيات
                    if (typeof getUserById === 'function') {
                        const userData = getUserById(userId);
                        if (userData && typeof checkAdminPermissions === 'function') {
                            isAdmin = checkAdminPermissions(userData);
                        } else if (userData && (userData.role === 'admin' || userData.role === 'مدير النظام')) {
                            isAdmin = true;
                        }
                    }
                } catch (error) {
                    Logger.log('Error checking admin permissions: ' + error.toString());
                }
                
                approvalRequests.forEach(request => {
                    // للمدير: جميع الطلبات قيد المراجعة
                    // للمستخدم: طلباته الخاصة فقط
                    const shouldNotify = isAdmin 
                        ? (request.status === 'pending' || request.status === 'under_review')
                        : (request.createdBy === userId && 
                           (request.status === 'pending' || request.status === 'under_review' || 
                            request.status === 'approved' || request.status === 'rejected'));
                    
                    if (shouldNotify) {
                        let title, message, priority;
                        
                        if (isAdmin) {
                            const requestType = request.requestType === 'contractor' ? 'مقاول' : 
                                             request.requestType === 'evaluation' ? 'تقييم' : 'مورد';
                            title = 'طلب اعتماد جديد يحتاج مراجعة';
                            message = `طلب اعتماد ${requestType}: ${request.companyName || request.contractorName || 'غير محدد'}`;
                            priority = 'high';
                        } else {
                            if (request.status === 'approved') {
                                title = 'تم اعتماد طلبك';
                                message = `تم اعتماد طلب اعتماد: ${request.companyName || request.contractorName || 'غير محدد'}`;
                                priority = 'medium';
                            } else if (request.status === 'rejected') {
                                title = 'تم رفض طلبك';
                                message = `تم رفض طلب اعتماد: ${request.companyName || request.contractorName || 'غير محدد'}`;
                                priority = 'medium';
                            } else {
                                title = 'طلب اعتماد قيد المراجعة';
                                message = `طلب اعتماد: ${request.companyName || request.contractorName || 'غير محدد'} قيد المراجعة`;
                                priority = 'low';
                            }
                        }
                        
                        notifications.push({
                            id: 'CONTRACTOR-APPROVAL-' + request.id,
                            type: 'contractor_approval',
                            priority: priority,
                            title: title,
                            message: message,
                            requestId: request.id,
                            requestType: request.requestType,
                            status: request.status,
                            createdAt: request.createdAt || new Date()
                        });
                    }
                });
            }
        } catch (error) {
            Logger.log('Error getting contractor approval notifications: ' + error.toString());
        }
        
        // 7. إشعارات انتهاء عقود المقاولين
        // ✅ تم التحديث: استخدام ApprovedContractors فقط
        try {
            const approvedContractors = readFromSheet('ApprovedContractors', getSpreadsheetId());
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            // التحقق من صلاحيات المستخدم
            let isAdmin = false;
            try {
                if (typeof getUserById === 'function') {
                    const userData = getUserById(userId);
                    if (userData && typeof checkAdminPermissions === 'function') {
                        isAdmin = checkAdminPermissions(userData);
                    } else if (userData && (userData.role === 'admin' || userData.role === 'مدير النظام')) {
                        isAdmin = true;
                    }
                }
            } catch (error) {
                Logger.log('Error checking admin permissions: ' + error.toString());
            }
            
            // إشعارات للمدير فقط
            if (isAdmin) {
                // ✅ تم التحديث: استخدام ApprovedContractors فقط
                approvedContractors.forEach(approved => {
                    if (approved.expiryDate) {
                        const expiryDate = new Date(approved.expiryDate);
                        if (expiryDate >= now && expiryDate <= thirtyDaysFromNow) {
                            const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                            notifications.push({
                                id: 'APPROVED-EXPIRING-' + approved.id,
                                type: 'contractor_expiring',
                                priority: daysRemaining <= 7 ? 'high' : 'medium',
                                title: 'اعتماد مقاول قريب من الانتهاء',
                                message: `اعتماد "${approved.companyName || approved.name || 'غير محدد'}" سينتهي خلال ${daysRemaining} يوم`,
                                approvedId: approved.id,
                                contractorId: approved.id,
                                contractorName: approved.companyName || approved.name,
                                companyName: approved.companyName || approved.name,
                                expiryDate: approved.expiryDate,
                                endDate: approved.expiryDate,
                                daysRemaining: daysRemaining,
                                createdAt: new Date()
                            });
                        } else if (expiryDate < now) {
                            notifications.push({
                                id: 'APPROVED-EXPIRED-' + approved.id,
                                type: 'contractor_expired',
                                priority: 'high',
                                title: 'اعتماد مقاول منتهي',
                                message: `اعتماد "${approved.companyName || approved.name || 'غير محدد'}" منتهي`,
                                approvedId: approved.id,
                                contractorId: approved.id,
                                contractorName: approved.companyName || approved.name,
                                companyName: approved.companyName || approved.name,
                                expiryDate: approved.expiryDate,
                                endDate: approved.expiryDate,
                                createdAt: new Date()
                            });
                        }
                    }
                });
            }
        } catch (error) {
            Logger.log('Error getting contractor expiry notifications: ' + error.toString());
        }
        
        // ترتيب حسب الأولوية والتاريخ
        notifications.sort((a, b) => {
            const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        return { 
            success: true, 
            data: notifications, 
            count: notifications.length,
            unread: notifications.length // يمكن إضافة نظام قراءة لاحقاً
        };
    } catch (error) {
        Logger.log('Error in getUserNotifications: ' + error.toString());
        return { success: false, message: 'حدث خطأ أثناء الحصول على الإشعارات: ' + error.toString(), data: [] };
    }
}

/**
 * الحصول على عدد الإشعارات غير المقروءة
 */
function getUnreadNotificationsCount(userId) {
    try {
        const notifications = getUserNotifications(userId);
        if (notifications.success) {
            return { success: true, count: notifications.count || 0 };
        }
        return { success: true, count: 0 };
    } catch (error) {
        Logger.log('Error getting unread count: ' + error.toString());
        return { success: true, count: 0 };
    }
}

/**
 * تمييز إشعار كمقروء
 */
function markNotificationAsRead(userId, notificationId) {
    try {
        // يمكن إضافة نظام حفظ حالة القراءة لاحقاً
        // حالياً نرجع نجاح فقط
        return { success: true, message: 'تم تمييز الإشعار كمقروء' };
    } catch (error) {
        Logger.log('Error marking notification as read: ' + error.toString());
        return { success: false, message: 'حدث خطأ أثناء تحديث حالة الإشعار' };
    }
}

/**
 * حذف إشعار
 */
function deleteNotification(userId, notificationId) {
    try {
        // يمكن إضافة نظام حفظ الإشعارات المحذوفة لاحقاً
        return { success: true, message: 'تم حذف الإشعار' };
    } catch (error) {
        Logger.log('Error deleting notification: ' + error.toString());
        return { success: false, message: 'حدث خطأ أثناء حذف الإشعار' };
    }
}

/**
 * إضافة إشعار جديد
 * @param {Object} notificationData - بيانات الإشعار
 * @return {Object} نتيجة الإضافة
 */
function addNotification(notificationData) {
    try {
        if (!notificationData) {
            return { success: false, message: 'بيانات الإشعار غير موجودة' };
        }
        
        const sheetName = 'Notifications';
        const spreadsheetId = getSpreadsheetId();
        
        // ✅ حذف userData لمنع تخزينها في Google Sheets
        if (notificationData && notificationData.userData) {
            try { delete notificationData.userData; } catch (e) {}
        }
        
        // إضافة حقول تلقائية
        if (!notificationData.id) {
            notificationData.id = generateSequentialId('NOT', sheetName);
        }
        if (!notificationData.createdAt) {
            notificationData.createdAt = new Date();
        }
        if (!notificationData.updatedAt) {
            notificationData.updatedAt = new Date();
        }
        if (!notificationData.read) {
            notificationData.read = false;
        }
        
        // التحقق من وجود userId
        if (!notificationData.userId) {
            return { success: false, message: 'معرف المستخدم (userId) مطلوب' };
        }
        
        // حفظ الإشعار في Google Sheet
        const result = appendToSheet(sheetName, notificationData);
        
        if (result.success) {
            return { 
                success: true, 
                message: 'تم إضافة الإشعار بنجاح', 
                data: notificationData 
            };
        } else {
            return { 
                success: false, 
                message: result.message || 'فشل إضافة الإشعار' 
            };
        }
    } catch (error) {
        Logger.log('Error in addNotification: ' + error.toString());
        return { 
            success: false, 
            message: 'حدث خطأ أثناء إضافة الإشعار: ' + error.toString() 
        };
    }
}

/**
 * إشعار المدراء بطلب تغيير جديد (يُستدعى من موديول إدارة التغيرات)
 */
function notifyAdminsOfNewChangeRequest(changeRequestId, title, requestedBy) {
    try {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) return;
        const users = readFromSheet('Users', spreadsheetId);
        if (!users || !Array.isArray(users)) return;
        const admins = users.filter(function(u) {
            if (!u || !u.active) return false;
            const role = (u.role || '').toString().toLowerCase();
            return role === 'admin' || role === 'مدير' || role === 'مدير النظام';
        });
        const message = (requestedBy || 'مستخدم') + ': ' + (title || 'طلب تغيير جديد');
        admins.forEach(function(admin) {
            const userId = admin.email || admin.id;
            if (!userId) return;
            addNotification({
                userId: userId,
                type: 'change_request',
                priority: 'medium',
                title: 'طلب تغيير جديد',
                message: message,
                relatedId: changeRequestId,
                relatedType: 'ChangeRequest'
            });
        });
    } catch (e) {
        Logger.log('Error in notifyAdminsOfNewChangeRequest: ' + e.toString());
    }
}

/**
 * إرسال التقرير الدوري تلقائياً
 * @param {Object} reportData - بيانات التقرير
 * @param {string} periodType - نوع الفترة (monthly/yearly)
 * @param {string} periodLabel - وصف الفترة
 */
function sendPeriodicReportNotification(reportData, periodType, periodLabel) {
    try {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) return;
        
        // الحصول على إعدادات التقارير الدورية
        const settings = readFromSheet('Settings', spreadsheetId);
        const periodicSettings = settings.find(s => s.key === 'periodicReportsSettings');
        
        if (!periodicSettings || !periodicSettings.value || !JSON.parse(periodicSettings.value).enabled) {
            return; // التقارير الدورية غير مفعلة
        }
        
        const settingsValue = JSON.parse(periodicSettings.value);
        const notificationEmails = settingsValue.notificationEmails || [];
        
        if (notificationEmails.length === 0) {
            Logger.log('لا توجد عناوين بريد إلكتروني مخصصة للإشعارات');
            return;
        }
        
        // إعداد محتوى البريد الإلكتروني
        const subject = periodType === 'monthly' ? 
            `التقرير الشهري - ${periodLabel}` : 
            `التقرير السنوي - ${periodLabel}`;
            
        const body = `
السلام عليكم ورحمة الله وبركاته،

تم إعداد التقرير الدوري بنجاح.

معلومات التقرير:
- نوع التقرير: ${periodType === 'monthly' ? 'شهري' : 'سنوي'}
- الفترة: ${periodLabel}
- تاريخ الإعداد: ${new Date().toLocaleDateString('ar-SA')}

ملخص التقرير:
- عدد تصاريح العمل: ${reportData.workPermitsCount || 0}
- عدد الملاحظات: ${reportData.observationsCount || 0}
- عدد الحوادث: ${reportData.incidentsCount || 0}
- عدد الزيارات الطبية: ${reportData.clinicVisitsCount || 0}
- عدد برامج تدريب الموظفين: ${reportData.employeeTrainingPrograms || 0}
- عدد برامج تدريب المقاولين: ${reportData.contractorTrainingPrograms || 0}
- عدد مخالفات الموظفين: ${reportData.employeeViolationsCount || 0}
- عدد مخالفات المقاولين: ${reportData.contractorViolationsCount || 0}

لعرض التقرير الكامل، يرجى تسجيل الدخول إلى النظام.

مع أطيب التحية،
نظام إدارة السلامة والصحة المهنية
`;

        // إرسال البريد الإلكتروني إلى جميع المستلمين
        notificationEmails.forEach(function(email) {
            try {
                MailApp.sendEmail({
                    to: email,
                    subject: subject,
                    body: body
                });
                Logger.log('تم إرسال التقرير الدوري إلى: ' + email);
            } catch (emailError) {
                Logger.log('خطأ في إرسال البريد إلى ' + email + ': ' + emailError.toString());
            }
        });
        
        // تسجيل الإشعار في النظام
        notificationEmails.forEach(function(email) {
            addNotification({
                userId: email,
                type: 'periodic_report',
                priority: 'medium',
                title: subject,
                message: 'تم إرسال التقرير الدوري بنجاح',
                relatedId: 'PERIODIC-' + new Date().toISOString(),
                relatedType: 'PeriodicReport'
            });
        });
        
    } catch (e) {
        Logger.log('Error in sendPeriodicReportNotification: ' + e.toString());
    }
}

/**
 * التحقق من وإرسال التقارير الدورية المستحقة
 * تُستدعى هذه الدالة بشكل دوري (يومياً)
 */
function checkAndSendPeriodicReports() {
    try {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) return;
        
        const settings = readFromSheet('Settings', spreadsheetId);
        const periodicSettings = settings.find(s => s.key === 'periodicReportsSettings');
        
        if (!periodicSettings || !periodicSettings.value) {
            return; // لا توجد إعدادات للتقارير الدورية
        }
        
        const settingsValue = JSON.parse(periodicSettings.value);
        
        if (!settingsValue.enabled) {
            return; // التقارير الدورية غير مفعلة
        }
        
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // التحقق من التقارير الشهرية
        if (settingsValue.periodType === 'monthly' && currentDay === settingsValue.dayOfMonth) {
            // إعداد الفترة الشهرية (الشهر السابق)
            const lastMonth = new Date(currentYear, currentMonth - 1, 1);
            const startDate = new Date(currentYear, currentMonth - 1, 1);
            const endDate = new Date(currentYear, currentMonth, 0);
            const periodLabel = lastMonth.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
            
            // جمع البيانات وإرسال التقرير
            const reportData = collectPeriodicReportData(startDate, endDate);
            sendPeriodicReportNotification(reportData, 'monthly', periodLabel);
        }
        
        // التحقق من التقارير السنوية (في أول يناير من كل عام)
        if (settingsValue.periodType === 'yearly' && today.getMonth() === 0 && today.getDate() === 1) {
            const lastYear = currentYear - 1;
            const startDate = new Date(lastYear, 0, 1);
            const endDate = new Date(lastYear, 11, 31);
            const periodLabel = String(lastYear);
            
            // جمع البيانات وإرسال التقرير
            const reportData = collectPeriodicReportData(startDate, endDate);
            sendPeriodicReportNotification(reportData, 'yearly', periodLabel);
        }
        
    } catch (e) {
        Logger.log('Error in checkAndSendPeriodicReports: ' + e.toString());
    }
}

/**
 * جمع بيانات التقرير الدوري
 * @param {Date} startDate - تاريخ البداية
 * @param {Date} endDate - تاريخ النهاية
 * @return {Object} بيانات التقرير
 */
function collectPeriodicReportData(startDate, endDate) {
    try {
        const spreadsheetId = getSpreadsheetId();
        if (!spreadsheetId) return {};
        
        const data = {
            workPermitsCount: 0,
            observationsCount: 0,
            incidentsCount: 0,
            clinicVisitsCount: 0,
            employeeTrainingPrograms: 0,
            contractorTrainingPrograms: 0,
            employeeViolationsCount: 0,
            contractorViolationsCount: 0
        };
        
        // تصاريح العمل
        try {
            const workPermits = readFromSheet('WorkPermits', spreadsheetId);
            data.workPermitsCount = workPermits.filter(wp => {
                const date = new Date(wp.startDate || wp.date || wp.createdAt);
                return date >= startDate && date <= endDate;
            }).length;
        } catch (e) {
            Logger.log('Error counting work permits: ' + e.toString());
        }
        
        // الملاحظات
        try {
            const observations = readFromSheet('DailyObservations', spreadsheetId);
            data.observationsCount = observations.filter(obs => {
                const date = new Date(obs.date || obs.createdAt);
                return date >= startDate && date <= endDate;
            }).length;
        } catch (e) {
            Logger.log('Error counting observations: ' + e.toString());
        }
        
        // الحوادث
        try {
            const incidents = readFromSheet('Incidents', spreadsheetId);
            data.incidentsCount = incidents.filter(inc => {
                const date = new Date(inc.date || inc.incidentDate || inc.createdAt);
                return date >= startDate && date <= endDate;
            }).length;
        } catch (e) {
            Logger.log('Error counting incidents: ' + e.toString());
        }
        
        // الزيارات الطبية
        try {
            const clinicVisits = readFromSheet('ClinicVisits', spreadsheetId);
            data.clinicVisitsCount = clinicVisits.filter(visit => {
                const date = new Date(visit.visitDate || visit.date || visit.createdAt);
                return date >= startDate && date <= endDate;
            }).length;
        } catch (e) {
            Logger.log('Error counting clinic visits: ' + e.toString());
        }
        
        // تدريبات الموظفين
        try {
            const employeeTrainings = readFromSheet('Training', spreadsheetId);
            data.employeeTrainingPrograms = employeeTrainings.filter(training => {
                const date = new Date(training.startDate || training.date || training.createdAt);
                return date >= startDate && date <= endDate;
            }).length;
        } catch (e) {
            Logger.log('Error counting employee trainings: ' + e.toString());
        }
        
        // تدريبات المقاولين
        try {
            const contractorTrainings = readFromSheet('ContractorTrainings', spreadsheetId);
            data.contractorTrainingPrograms = contractorTrainings.filter(training => {
                const date = new Date(training.date || training.trainingDate || training.createdAt);
                return date >= startDate && date <= endDate;
            }).length;
        } catch (e) {
            Logger.log('Error counting contractor trainings: ' + e.toString());
        }
        
        // المخالفات
        try {
            const violations = readFromSheet('Violations', spreadsheetId);
            const periodViolations = violations.filter(violation => {
                const date = new Date(violation.date || violation.violationDate || violation.createdAt);
                return date >= startDate && date <= endDate;
            });
            
            data.employeeViolationsCount = periodViolations.filter(v => 
                v.violationType === 'موظفين' || 
                v.category === 'موظفين' || 
                (!v.contractorName && v.employeeName)
            ).length;
            
            data.contractorViolationsCount = periodViolations.filter(v => 
                v.violationType === 'مقاولين' || 
                v.category === 'مقاولين' || 
                v.contractorName
            ).length;
        } catch (e) {
            Logger.log('Error counting violations: ' + e.toString());
        }
        
        return data;
        
    } catch (e) {
        Logger.log('Error in collectPeriodicReportData: ' + e.toString());
        return {};
    }
}
