// ===== تهيئة مباشرة لشاشة تسجيل الدخول - نسخة محسنة ومحلولة =====

// عزل هذا الملف بالكامل لتجنب تلويث الـ global scope (خصوصاً اسم log)
(function () {
    'use strict';

    // Logger صامت في الإنتاج (لتقليل الضوضاء في Console)
    const log = (...args) => {
        try {
            if (typeof window !== 'undefined' && window.Utils && typeof window.Utils.safeLog === 'function') {
                window.Utils.safeLog(...args);
                return;
            }
        } catch (e) { /* ignore */ }
        // fallback: log فقط في localhost
        try {
            if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                console.log(...args);
            }
        } catch (e) { /* ignore */ }
    };

    log('🚀 تحميل login-init-fixed.js...');

    // ===== إعداد محدد اللغة (Language Selector) =====
    const LanguageSelectorSetup = (function () {
        function setLanguage(lang) {
            if (lang !== 'ar' && lang !== 'en') return;
            
            // حفظ التفضيل (using standard key 'language' for compatibility)
            localStorage.setItem('language', lang);
            
            // تحديث الواجهة
            updateUI(lang);
        }

        function updateUI(lang) {
            const isRTL = lang === 'ar';
            const html = document.documentElement;
            const body = document.body;
            
            // تحديث اتجاه الصفحة
            html.setAttribute('lang', lang);
            html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
            body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

            // تحديث الأزرار
            const btnEn = document.getElementById('lang-en-login');
            const btnAr = document.getElementById('lang-ar-login');
            
            if (btnEn && btnAr) {
                if (lang === 'en') {
                    // Active English
                    btnEn.classList.remove('bg-white', 'text-gray-900', 'hover:bg-gray-100', 'hover:text-blue-700');
                    btnEn.classList.add('bg-blue-50', 'text-blue-700', 'hover:bg-blue-100');
                    
                    // Inactive Arabic
                    btnAr.classList.remove('bg-blue-50', 'text-blue-700', 'hover:bg-blue-100');
                    btnAr.classList.add('bg-white', 'text-gray-900', 'hover:bg-gray-100', 'hover:text-blue-700');
                } else {
                    // Active Arabic
                    btnAr.classList.remove('bg-white', 'text-gray-900', 'hover:bg-gray-100', 'hover:text-blue-700');
                    btnAr.classList.add('bg-blue-50', 'text-blue-700', 'hover:bg-blue-100');
                    
                    // Inactive English
                    btnEn.classList.remove('bg-blue-50', 'text-blue-700', 'hover:bg-blue-100');
                    btnEn.classList.add('bg-white', 'text-gray-900', 'hover:bg-gray-100', 'hover:text-blue-700');
                }
            }
            
            // تحديث النصوص
            updateLoginTexts(lang);
        }
        
        function updateLoginTexts(lang) {
            const texts = {
                ar: {
                    title: 'نظام إدارة السلامة والصحة المهنية',
                    company: 'الشركة العالمية للانتاج والتصنيع الزراعي',
                    emailLabel: 'البريد الإلكتروني',
                    passwordLabel: 'كلمة المرور',
                    rememberMe: 'تذكرني',
                    forgotPassword: 'نسيت كلمة المرور؟',
                    loginBtn: 'تسجيل الدخول',
                    helpBtn: 'مساعدة / Help',
                    emailPlaceholder: 'example@americana.com',
                    passwordPlaceholder: '••••••••'
                },
                en: {
                    title: 'HSE Management System',
                    company: 'International Company for Agricultural Production & Processing',
                    emailLabel: 'Email Address',
                    passwordLabel: 'Password',
                    rememberMe: 'Remember Me',
                    forgotPassword: 'Forgot Password?',
                    loginBtn: 'Login',
                    helpBtn: 'Help / مساعدة',
                    emailPlaceholder: 'example@americana.com',
                    passwordPlaceholder: '••••••••'
                }
            };
            
            const t = texts[lang];
            
            // Helper to safe update
            const setText = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            };
            
            const setPlaceholder = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.placeholder = text;
            };
            
            setText('login-title', t.title);
            setText('login-company-name', t.company);
            
            // Labels (Text Node update)
            try {
                const emailLabel = document.querySelector('label[for="username"]');
                if (emailLabel) {
                    // Find the text node (usually the last node or check type)
                    for (let i = 0; i < emailLabel.childNodes.length; i++) {
                        if (emailLabel.childNodes[i].nodeType === 3 && emailLabel.childNodes[i].textContent.trim().length > 0) {
                            emailLabel.childNodes[i].textContent = ' ' + t.emailLabel;
                            break;
                        }
                    }
                }
                
                const passLabel = document.querySelector('label[for="password"]');
                if (passLabel) {
                    for (let i = 0; i < passLabel.childNodes.length; i++) {
                        if (passLabel.childNodes[i].nodeType === 3 && passLabel.childNodes[i].textContent.trim().length > 0) {
                            passLabel.childNodes[i].textContent = ' ' + t.passwordLabel;
                            break;
                        }
                    }
                }

                const rememberLabel = document.querySelector('label input[name="remember"] + span');
                if (rememberLabel) rememberLabel.textContent = t.rememberMe;
                
                setText('forgot-password-link', t.forgotPassword);
                
                // Buttons with icons
                const loginBtn = document.querySelector('button[type="submit"]');
                if (loginBtn) {
                     for (let i = 0; i < loginBtn.childNodes.length; i++) {
                        if (loginBtn.childNodes[i].nodeType === 3 && loginBtn.childNodes[i].textContent.trim().length > 0) {
                            loginBtn.childNodes[i].textContent = ' ' + t.loginBtn;
                            break;
                        }
                    }
                }
                
                const helpBtn = document.getElementById('help-btn');
                if (helpBtn) {
                     for (let i = 0; i < helpBtn.childNodes.length; i++) {
                        if (helpBtn.childNodes[i].nodeType === 3 && helpBtn.childNodes[i].textContent.trim().length > 0) {
                            helpBtn.childNodes[i].textContent = ' ' + t.helpBtn;
                            break;
                        }
                    }
                }
                
                setPlaceholder('username', t.emailPlaceholder);
                setPlaceholder('password', t.passwordPlaceholder);
            } catch(e) {
                console.warn('Error updating login texts', e);
            }
        }

        function init() {
            const savedLang = localStorage.getItem('language') || 'ar';
            updateUI(savedLang);
            
            const btnEn = document.getElementById('lang-en-login');
            const btnAr = document.getElementById('lang-ar-login');
            
            if (btnEn) btnEn.addEventListener('click', (e) => { e.preventDefault(); setLanguage('en'); });
            if (btnAr) btnAr.addEventListener('click', (e) => { e.preventDefault(); setLanguage('ar'); });
        }

        return { init, setLanguage };
    })();

    // جعل LanguageSelectorSetup متاحاً بشكل global
    if (typeof window !== 'undefined') {
        window.LanguageSelectorSetup = LanguageSelectorSetup;
        log('✅ تم تسجيل LanguageSelectorSetup في window');
    }

    // منع ظهور بيانات الدخول في رابط الموقع (إن وُجدت بالـ query params)
    (function sanitizeLoginQueryParams() {
        function applyAndCleanup() {
            try {
                const params = new URLSearchParams(window.location.search || '');
                const urlUsername = params.get('username') || params.get('email') || '';
                // ⚠️ أمان: لا نقبل تمرير كلمة المرور عبر URL في الإنتاج
                const isDev = (window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '' ||
                    window.location.search.includes('dev=true'));
                const urlPassword = isDev ? (params.get('password') || '') : '';

                // تعبئة الحقول (إن كانت موجودة) ثم حذفها من الرابط
                const usernameInput = document.getElementById('username');
                const passwordInput = document.getElementById('password');

                if (usernameInput && urlUsername) usernameInput.value = urlUsername;
                if (passwordInput && urlPassword) passwordInput.value = urlPassword;

                if (params.has('username')) params.delete('username');
                if (params.has('email')) params.delete('email');
                if (params.has('password')) params.delete('password');

                const remaining = params.toString();
                const newUrl = window.location.pathname + (remaining ? `?${remaining}` : '') + (window.location.hash || '');
                // لا نعمل replaceState إذا لم يتغير شيء
                const currentCleanUrl = window.location.pathname + window.location.search + (window.location.hash || '');
                if (newUrl !== currentCleanUrl) {
                    window.history.replaceState(null, document.title, newUrl);
                }
            } catch (e) {
                // تجاهل أي خطأ (مهم: لا نكسر شاشة الدخول)
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyAndCleanup);
        } else {
            applyAndCleanup();
        }
    })();

// تهيئة فورية للأزرار - تعمل حتى لو لم تكن الوحدات محملة
(function initLoginButtonsImmediately() {
    'use strict';
    
    function setupPasswordToggle() {
        const passwordToggleBtn = document.getElementById('password-toggle-btn');
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('password-toggle-icon');
        
        if (!passwordToggleBtn || !passwordInput || !toggleIcon) {
            return false;
        }
        
        // إزالة جميع المعالجات القديمة
        const newBtn = passwordToggleBtn.cloneNode(true);
        passwordToggleBtn.parentNode.replaceChild(newBtn, passwordToggleBtn);
        
        // إزالة جميع المعالجات السابقة من الزر الجديد
        const cleanBtn = newBtn.cloneNode(true);
        newBtn.parentNode.replaceChild(cleanBtn, newBtn);
        
        cleanBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const currentPasswordInput = document.getElementById('password');
            const currentToggleIcon = document.getElementById('password-toggle-icon');
            
            if (currentPasswordInput && currentToggleIcon) {
                if (currentPasswordInput.type === 'password') {
                    currentPasswordInput.type = 'text';
                    currentToggleIcon.classList.remove('fa-eye');
                    currentToggleIcon.classList.add('fa-eye-slash');
                } else {
                    currentPasswordInput.type = 'password';
                    currentToggleIcon.classList.remove('fa-eye-slash');
                    currentToggleIcon.classList.add('fa-eye');
                }
            }
        }, true);
        
        log('✅ تم تفعيل زر إظهار/إخفاء كلمة المرور');
        return true;
    }
    
    function setupForgotPassword() {
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        
        if (!forgotPasswordLink) {
            return false;
        }
        
        // إزالة جميع المعالجات القديمة
        const newLink = forgotPasswordLink.cloneNode(true);
        forgotPasswordLink.parentNode.replaceChild(newLink, forgotPasswordLink);
        
        // إزالة جميع المعالجات السابقة من الرابط الجديد
        const cleanLink = newLink.cloneNode(true);
        newLink.parentNode.replaceChild(cleanLink, newLink);
        
        cleanLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // محاولة استخدام UI.showForgotPasswordModal
            if (typeof window.UI !== 'undefined' && typeof window.UI.showForgotPasswordModal === 'function') {
                try {
                    window.UI.showForgotPasswordModal();
                } catch (error) {
                    console.error('❌ خطأ في عرض نافذة استعادة كلمة المرور:', error);
                    alert('ميزة استعادة كلمة المرور قيد التطوير.\n\nيرجى التواصل مع:\nYasser.diab@icapp.com.eg');
                }
            } else {
                alert('ميزة استعادة كلمة المرور قيد التطوير.\n\nيرجى التواصل مع:\nYasser.diab@icapp.com.eg');
            }
        }, true);
        
        log('✅ تم تفعيل رابط استعادة كلمة المرور');
        return true;
    }
    
    function setupHelpButton() {
        const helpBtn = document.getElementById('help-btn');
        
        if (!helpBtn) {
            return false;
        }
        
        // إزالة جميع المعالجات القديمة
        const newHelpBtn = helpBtn.cloneNode(true);
        helpBtn.parentNode.replaceChild(newHelpBtn, helpBtn);
        
        // إزالة جميع المعالجات السابقة من الزر الجديد
        const cleanHelpBtn = newHelpBtn.cloneNode(true);
        newHelpBtn.parentNode.replaceChild(cleanHelpBtn, newHelpBtn);
        
        cleanHelpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // محاولة استخدام UI.showHelpModal
            if (typeof window.UI !== 'undefined' && typeof window.UI.showHelpModal === 'function') {
                try {
                    window.UI.showHelpModal();
                } catch (error) {
                    console.error('❌ خطأ في عرض نافذة المساعدة:', error);
                    const helpMessage = `📋 مساعدة تسجيل الدخول

📞 للدعم:
Yasser.diab@icapp.com.eg`;
                    alert(helpMessage);
                }
            } else {
                const helpMessage = `📋 مساعدة تسجيل الدخول

📞 للدعم:
Yasser.diab@icapp.com.eg`;
                alert(helpMessage);
            }
        }, true);
        
        log('✅ تم تفعيل زر المساعدة');
        return true;
    }

    function setupLanguageSelector() {
        if (typeof window.LanguageSelectorSetup !== 'undefined' && typeof window.LanguageSelectorSetup.init === 'function') {
            window.LanguageSelectorSetup.init();
            return true;
        }
        return false;
    }
    
    // محاولة التهيئة الفورية
    function tryInit() {
        const passwordOk = setupPasswordToggle();
        const forgotOk = setupForgotPassword();
        const helpOk = setupHelpButton();
        const langOk = setupLanguageSelector();
        
        if (passwordOk && forgotOk && helpOk) {
            log('✅ تم تهيئة جميع أزرار تسجيل الدخول بنجاح');
            return true;
        }
        return false;
    }
    
    // محاولة فورية
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (!tryInit()) {
                // إعادة المحاولة بعد قليل
                setTimeout(tryInit, 100);
            }
        });
    } else {
        if (!tryInit()) {
            // إعادة المحاولة بعد قليل
            setTimeout(tryInit, 100);
        }
    }
    
    // إعادة المحاولة عند تحميل الصفحة بالكامل
    window.addEventListener('load', function() {
        setTimeout(tryInit, 200);
    });
    
    // إعادة المحاولة كل ثانية حتى تنجح (لمدة 10 ثوان)
    let retryCount = 0;
    const retryInterval = setInterval(function() {
        if (tryInit() || retryCount >= 10) {
            clearInterval(retryInterval);
        }
        retryCount++;
    }, 1000);

    // التأكد من تفعيل محدد اللغة
    window.addEventListener('load', function() {
        setTimeout(function() {
            setupLanguageSelector();
        }, 500);
    });
})();

// ===== تهيئة نموذج تسجيل الدخول =====
(function initLoginForm() {
    'use strict';
    
    function checkDependencies() {
        return typeof window.Auth !== 'undefined' && 
               typeof window.DataManager !== 'undefined' && 
               typeof window.UI !== 'undefined' && 
               typeof window.Notification !== 'undefined';
    }
    
    function setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        
        if (!loginForm) {
            return false;
        }
        
        // إزالة جميع المعالجات القديمة
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);

        // ⚠️ مهم: استبدال الـ form بالـ clone يمسح معالجات الأزرار الموجودة داخله
        // لذلك نعيد تفعيل (عرض كلمة المرور / نسيت كلمة المرور / مساعدة) بعد الاستبدال مباشرة
        (function rebindLoginAuxButtons() {
            // Password toggle
            const passwordToggleBtn = newForm.querySelector('#password-toggle-btn');
            const passwordInput = newForm.querySelector('#password');
            const toggleIcon = newForm.querySelector('#password-toggle-icon');

            if (passwordToggleBtn && passwordInput && toggleIcon) {
                // منع تكرار الربط لو تم استدعاء setupLoginForm أكثر من مرة
                if (passwordToggleBtn.dataset.handlerBound !== 'true') {
                    passwordToggleBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (passwordInput.type === 'password') {
                            passwordInput.type = 'text';
                            toggleIcon.classList.remove('fa-eye');
                            toggleIcon.classList.add('fa-eye-slash');
                            passwordToggleBtn.setAttribute('aria-label', 'إخفاء كلمة المرور');
                            passwordToggleBtn.setAttribute('title', 'إخفاء كلمة المرور');
                        } else {
                            passwordInput.type = 'password';
                            toggleIcon.classList.remove('fa-eye-slash');
                            toggleIcon.classList.add('fa-eye');
                            passwordToggleBtn.setAttribute('aria-label', 'إظهار كلمة المرور');
                            passwordToggleBtn.setAttribute('title', 'إظهار كلمة المرور');
                        }

                        passwordInput.focus();
                    }, true);
                    passwordToggleBtn.dataset.handlerBound = 'true';
                }
            }

            // Forgot password link
            const forgotPasswordLink = newForm.querySelector('#forgot-password-link');
            if (forgotPasswordLink) {
                if (forgotPasswordLink.dataset.handlerBound !== 'true') {
                    forgotPasswordLink.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (typeof window.UI !== 'undefined' && typeof window.UI.showForgotPasswordModal === 'function') {
                            try {
                                window.UI.showForgotPasswordModal();
                            } catch (error) {
                                console.error('❌ خطأ في عرض نافذة استعادة كلمة المرور:', error);
                                alert('ميزة استعادة كلمة المرور قيد التطوير.\n\nيرجى التواصل مع:\nYasser.diab@icapp.com.eg');
                            }
                        } else {
                            alert('ميزة استعادة كلمة المرور قيد التطوير.\n\nيرجى التواصل مع:\nYasser.diab@icapp.com.eg');
                        }
                    }, true);
                    forgotPasswordLink.dataset.handlerBound = 'true';
                }
            }

            // Help button
            const helpBtn = newForm.querySelector('#help-btn');
            if (helpBtn) {
                if (helpBtn.dataset.handlerBound !== 'true') {
                    helpBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (typeof window.UI !== 'undefined' && typeof window.UI.showHelpModal === 'function') {
                            try {
                                window.UI.showHelpModal();
                            } catch (error) {
                                console.error('❌ خطأ في عرض نافذة المساعدة:', error);
                                const helpMessage = `📋 مساعدة تسجيل الدخول

📞 للدعم:
Yasser.diab@icapp.com.eg`;
                                alert(helpMessage);
                            }
                        } else {
                            const helpMessage = `📋 مساعدة تسجيل الدخول

📞 للدعم:
Yasser.diab@icapp.com.eg`;
                            alert(helpMessage);
                        }
                    }, true);
                    helpBtn.dataset.handlerBound = 'true';
                }
            }
        })();
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            log('📝 محاولة تسجيل الدخول...');
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const rememberCheckbox = document.getElementById('remember-me');
            const submitBtn = newForm.querySelector('button[type="submit"]');
            
            if (!usernameInput || !passwordInput) {
                const errorMsg = 'خطأ في تحميل نموذج تسجيل الدخول';
                console.error('❌', errorMsg);
                if (typeof window.Notification !== 'undefined') {
                    window.Notification.error(errorMsg);
                } else {
                    alert(errorMsg);
                }
                return;
            }
            
            const email = usernameInput.value.trim();
            const password = passwordInput.value;
            const remember = rememberCheckbox ? rememberCheckbox.checked : false;
            
            if (!email || !password) {
                const errorMsg = 'يرجى إدخال البريد الإلكتروني وكلمة المرور';
                console.warn('⚠️', errorMsg);
                if (typeof window.Notification !== 'undefined') {
                    window.Notification.warning(errorMsg);
                } else {
                    alert(errorMsg);
                }
                return;
            }
            
            // التحقق من الوحدات
            if (!checkDependencies()) {
                const errorMsg = 'نظام المصادقة غير جاهز. يرجى تحديث الصفحة.';
                console.error('❌', errorMsg);
                alert(errorMsg);
                return;
            }
            
            // تعطيل الزر
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري تسجيل الدخول...';
            
            try {
                log('🔐 استدعاء Auth.login...');
                
                const result = await window.Auth.login(email, password, remember);
                log('📥 نتيجة تسجيل الدخول:', result);
                
                // فحص النتيجة
                let success = false;
                let requiresPasswordChange = false;
                let isFirstLogin = false;
                
                if (result === true) {
                    success = true;
                } else if (result && typeof result === 'object') {
                    success = result.success === true;
                    requiresPasswordChange = result.requiresPasswordChange === true;
                    isFirstLogin = result.isFirstLogin === true;
                }
                
                if (success) {
                    log('✅ تسجيل دخول ناجح!');
                    
                    // عدم إخفاء شاشة الدخول هنا — showMainApp يخفيها بعد تحميل الإعدادات ثم يعرض السياسة مباشرة (بدون شاشة تحضيرية)
                    // معالجة تغيير كلمة المرور إذا لزم الأمر
                    if (requiresPasswordChange || isFirstLogin) {
                        log('🔐 يتطلب تغيير كلمة المرور');
                    }
                    
                    // showMainApp يحمّل الإعدادات (الشاشة تبقى كما هي) ثم يخفي الدخول ويعرض السياسة مباشرة أو لوحة التحكم
                    if (typeof window.UI !== 'undefined' && window.UI.showMainApp) {
                        try {
                            await window.UI.showMainApp();
                        } catch (err) {
                            log('⚠️ خطأ في showMainApp:', err);
                            const loginScreen = document.getElementById('login-screen');
                            if (loginScreen) { loginScreen.style.display = 'none'; loginScreen.classList.remove('active', 'show'); }
                            document.body.classList.add('app-active');
                            const mainApp = document.getElementById('main-app');
                            if (mainApp) mainApp.style.display = 'flex';
                        }
                    } else if (typeof window.App !== 'undefined' && window.App.load) {
                        window.App.load();
                        const mainApp = document.getElementById('main-app');
                        if (mainApp) mainApp.style.display = 'flex';
                    }
                } else {
                    // تحسين رسالة الخطأ
                    let errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                    
                    if (result && typeof result === 'object') {
                        if (result.message) {
                            errorMsg = result.message;
                        } else if (result.error) {
                            errorMsg = result.error;
                        }
                    } else if (typeof result === 'string') {
                        errorMsg = result;
                    }
                    
                    // التحقق من أخطاء الاتصال بـ Google Services
                    const errorStr = JSON.stringify(result || '').toLowerCase();
                    if (errorStr.includes('cert_authority_invalid') || 
                        errorStr.includes('certificate') ||
                        errorStr.includes('err_cert') ||
                        errorStr.includes('ssl') ||
                        errorStr.includes('tls')) {
                        errorMsg = 'خطأ في الاتصال بخدمات Google. قد تكون هناك مشكلة في شهادة الأمان. يرجى التحقق من إعدادات الإنترنت والمتصفح.';
                    } else if (errorStr.includes('networkerror') || 
                               errorStr.includes('failed to fetch') ||
                               errorStr.includes('timeout') ||
                               errorStr.includes('network')) {
                        errorMsg = 'فشل الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت وإعادة المحاولة.';
                    } else if (errorStr.includes('google') && 
                               (errorStr.includes('غير متاح') || 
                                errorStr.includes('not available') ||
                                errorStr.includes('خطأ') ||
                                errorStr.includes('error'))) {
                        errorMsg = 'خدمات Google غير متاحة حالياً. يرجى المحاولة لاحقاً أو التحقق من إعدادات Google Sheets.';
                    }
                    
                    // تسجيل قصير للمستخدم
                    var _shortMsg = (result && result.message && typeof result.message === 'string') ? result.message.split('\n')[0] : errorMsg;
                    console.error('❌ فشل تسجيل الدخول:', _shortMsg);
                    
                    if (typeof window.Notification !== 'undefined') {
                        window.Notification.error(errorMsg);
                    } else {
                        alert(errorMsg);
                    }
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                console.error('❌ خطأ في تسجيل الدخول:', error);
                let errorMsg = 'حدث خطأ: ' + (error.message || error);
                
                // التحقق من أخطاء الاتصال
                const errorStr = String(error.message || error || '').toLowerCase();
                if (errorStr.includes('cert_authority_invalid') || 
                    errorStr.includes('certificate') ||
                    errorStr.includes('err_cert') ||
                    errorStr.includes('ssl') ||
                    errorStr.includes('tls')) {
                    errorMsg = 'خطأ في الاتصال بخدمات Google. قد تكون هناك مشكلة في شهادة الأمان. يرجى التحقق من إعدادات الإنترنت والمتصفح.';
                } else if (errorStr.includes('networkerror') || 
                           errorStr.includes('failed to fetch') ||
                           errorStr.includes('timeout') ||
                           errorStr.includes('network')) {
                    errorMsg = 'فشل الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت وإعادة المحاولة.';
                } else if (errorStr.includes('google') && 
                           (errorStr.includes('غير متاح') || 
                            errorStr.includes('not available') ||
                            errorStr.includes('خطأ') ||
                            errorStr.includes('error'))) {
                    errorMsg = 'خدمات Google غير متاحة حالياً. يرجى المحاولة لاحقاً أو التحقق من إعدادات Google Sheets.';
                }
                
                if (typeof window.Notification !== 'undefined') {
                    window.Notification.error(errorMsg);
                } else {
                    alert(errorMsg);
                }
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }, true);
        
        log('✅ تم تفعيل نموذج تسجيل الدخول');
        return true;
    }
    
    // انتظار تحميل الوحدات
    function waitForDependenciesAndInit() {
        if (checkDependencies()) {
            log('✅ جميع الوحدات محملة - تهيئة نموذج تسجيل الدخول...');
            setupLoginForm();
            return;
        }
        
        log('⏳ انتظار تحميل الوحدات المطلوبة...');
        let attempts = 0;
        const maxAttempts = 200; // 20 ثانية كحد أقصى
        
        const checkInterval = setInterval(function() {
            attempts++;
            
            if (checkDependencies()) {
                clearInterval(checkInterval);
                log('✅ جميع الوحدات محملة بعد ' + attempts + ' محاولة - تهيئة نموذج تسجيل الدخول...');
                setupLoginForm();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ انتهت محاولات انتظار الوحدات');
                console.error('الوحدات المفقودة:', {
                    Auth: typeof window.Auth === 'undefined' ? '❌' : '✅',
                    DataManager: typeof window.DataManager === 'undefined' ? '❌' : '✅',
                    UI: typeof window.UI === 'undefined' ? '❌' : '✅',
                    Notification: typeof window.Notification === 'undefined' ? '❌' : '✅'
                });
            }
        }, 100);
    }
    
    // بدء العملية
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            waitForDependenciesAndInit();
        });
    } else {
        waitForDependenciesAndInit();
    }
    
    // إعادة المحاولة عند تحميل الصفحة بالكامل
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (checkDependencies()) {
                setupLoginForm();
            }
        }, 500);
    });
})();

// تحميل بيانات "تذكرني"
(function loadRememberMe() {
    'use strict';
    
    function loadRememberedUser() {
        try {
            const rememberedUser = localStorage.getItem('hse_remember_user');
            if (rememberedUser) {
                const userData = JSON.parse(rememberedUser);
                const usernameInput = document.getElementById('username');
                const rememberCheckbox = document.getElementById('remember-me');
                
                if (usernameInput && userData.email) {
                    usernameInput.value = userData.email;
                }
                if (rememberCheckbox) {
                    rememberCheckbox.checked = true;
                }
                log('✅ تم تحميل بيانات "تذكرني"');
            }
        } catch (error) {
            console.warn('⚠️ خطأ في تحميل "تذكرني":', error);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadRememberedUser);
    } else {
        loadRememberedUser();
    }
})();

// تهيئة الشعار في شاشة تسجيل الدخول عند تحميل الصفحة
(function initLoginLogo() {
    'use strict';
    
    function updateLoginLogo() {
        // التحقق من وجود UI و AppState
        if (typeof window.UI === 'undefined' || typeof window.UI.updateLoginLogo !== 'function') {
            return false;
        }
        
        // محاولة تحديث الشعار
        try {
            window.UI.updateLoginLogo();
            log('✅ تم تحديث شعار الشركة في شاشة تسجيل الدخول');
            return true;
        } catch (error) {
            console.warn('⚠️ خطأ في تحديث شعار الشركة:', error);
            return false;
        }
    }
    
    // تحديث الشعار عند تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // انتظار تحميل UI و AppState
            let attempts = 0;
            const maxAttempts = 50; // 5 ثوانٍ
            const checkInterval = setInterval(function() {
                attempts++;
                if (updateLoginLogo() || attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                }
            }, 100);
        });
    } else {
        // DOM محمل بالفعل - محاولة مباشرة
        setTimeout(function() {
            let attempts = 0;
            const maxAttempts = 50;
            const checkInterval = setInterval(function() {
                attempts++;
                if (updateLoginLogo() || attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                }
            }, 100);
        }, 500);
    }
    
    // تحديث الشعار عند تحميل الصفحة بالكامل
    window.addEventListener('load', function() {
        setTimeout(updateLoginLogo, 1000);
    });
    
    // الاستماع لتحديثات الشعار
    window.addEventListener('storage', function(e) {
        if (e.key === 'hse_company_logo' || e.key === 'company_logo') {
            setTimeout(updateLoginLogo, 100);
        }
    });
    
    // الاستماع للأحداث المخصصة لتحديث الشعار
    window.addEventListener('companyLogoUpdated', function(e) {
        if (e.detail && e.detail.logoUrl) {
            setTimeout(updateLoginLogo, 100);
        }
    });
})();

// تحديث عدد تسجيلات الدخول في الفوتر
(function updateLoginCount() {
    'use strict';
    
    function calculateLoginCount() {
        try {
            // محاولة الحصول على عدد تسجيلات الدخول الإجمالي من systemStatistics
            if (typeof window.AppState !== 'undefined' && window.AppState.appData) {
                // أولوية: استخدام systemStatistics.totalLogins إذا كان موجوداً
                if (window.AppState.appData.systemStatistics && 
                    typeof window.AppState.appData.systemStatistics.totalLogins === 'number') {
                    return window.AppState.appData.systemStatistics.totalLogins;
                }
                
                // إذا لم يكن موجوداً، حساب من loginHistory (للتوافق مع البيانات القديمة)
                if (window.AppState.appData.users && Array.isArray(window.AppState.appData.users)) {
                    let totalLogins = 0;
                    window.AppState.appData.users.forEach(user => {
                        if (user.loginHistory && Array.isArray(user.loginHistory)) {
                            totalLogins += user.loginHistory.length;
                        }
                    });
                    
                    // حفظ القيمة المحسوبة في systemStatistics للمرة القادمة
                    if (!window.AppState.appData.systemStatistics) {
                        window.AppState.appData.systemStatistics = {};
                    }
                    window.AppState.appData.systemStatistics.totalLogins = totalLogins;
                    
                    // حفظ التحديث
                    if (typeof window.DataManager !== 'undefined' && window.DataManager.save) {
                        window.DataManager.save();
                    }
                    
                    return totalLogins;
                }
            }
            
            // محاولة الحصول على البيانات من localStorage
            try {
                const appDataStr = localStorage.getItem('hse_app_data');
                if (appDataStr) {
                    const appData = JSON.parse(appDataStr);
                    
                    // أولوية: استخدام systemStatistics.totalLogins إذا كان موجوداً
                    if (appData.systemStatistics && 
                        typeof appData.systemStatistics.totalLogins === 'number') {
                        return appData.systemStatistics.totalLogins;
                    }
                    
                    // إذا لم يكن موجوداً، حساب من loginHistory
                    if (appData.users && Array.isArray(appData.users)) {
                        let totalLogins = 0;
                        appData.users.forEach(user => {
                            if (user.loginHistory && Array.isArray(user.loginHistory)) {
                                totalLogins += user.loginHistory.length;
                            }
                        });
                        return totalLogins;
                    }
                }
            } catch (e) {
                // تجاهل الأخطاء
            }
            
            return 0;
        } catch (error) {
            console.warn('⚠️ خطأ في حساب عدد تسجيلات الدخول:', error);
            return 0;
        }
    }
    
    function updateLoginCountDisplay() {
        const loginCountElement = document.getElementById('login-count');
        if (loginCountElement) {
            const count = calculateLoginCount();
            loginCountElement.textContent = count.toLocaleString('ar-EG');
        }
    }
    
    function setupPrivacyPolicyLink() {
        const privacyLink = document.getElementById('privacy-policy-link');
        if (privacyLink) {
            privacyLink.addEventListener('click', function(e) {
                e.preventDefault();
                // يمكن إضافة نافذة سياسة الخصوصية هنا لاحقاً
                alert('سياسة الخصوصية\n\nنحن ملتزمون بحماية خصوصية المستخدمين. يتم تخزين البيانات بشكل آمن ولا يتم مشاركتها مع أطراف ثالثة.\n\nللمزيد من المعلومات، يرجى التواصل مع:\nYasser.diab@icapp.com.eg');
            });
        }
    }
    
    // تحديث العدد عند تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                updateLoginCountDisplay();
                setupPrivacyPolicyLink();
                
                // تحديث العدد بشكل دوري
                let attempts = 0;
                const maxAttempts = 50;
                const checkInterval = setInterval(function() {
                    attempts++;
                    updateLoginCountDisplay();
                    if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                    }
                }, 200);
            }, 500);
        });
    } else {
        setTimeout(function() {
            updateLoginCountDisplay();
            setupPrivacyPolicyLink();
        }, 500);
    }
    
    // تحديث العدد عند تحميل الصفحة بالكامل
    window.addEventListener('load', function() {
        setTimeout(updateLoginCountDisplay, 1000);
    });
    
    // تحديث العدد عند تغيير البيانات
    window.addEventListener('storage', function(e) {
        if (e.key === 'hse_app_data' || e.key === 'hse_current_session') {
            setTimeout(updateLoginCountDisplay, 100);
        }
    });
    
    // تحديث العدد عند تسجيل الدخول
    document.addEventListener('loginSuccess', function() {
        setTimeout(updateLoginCountDisplay, 500);
    });
})();

    log('✅ login-init-fixed.js تم تحميله بنجاح');
})();
