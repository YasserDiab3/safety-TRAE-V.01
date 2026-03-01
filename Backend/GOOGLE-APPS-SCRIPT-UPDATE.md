# تحديث مشروع Google Apps Script لتفعيل أكواد المستندات (addDocumentCode)

رسالة الخطأ: **«الـ action addDocumentCode غير معترف به»** تعني أن **مشروع Google Apps Script المنشور** لا يزال يستخدم نسخة قديمة من الملفات. التحديثات في المستودع (Git) **لا تُطبَّق تلقائياً** على مشروعك في [script.google.com](https://script.google.com).

---

## ما الذي يجب تحديثه في مشروع Google Apps Script؟

يجب نسخ المحتوى المحدث من مجلد **`Backend`** (أو `vercel-deploy/backend`) إلى مشروعك في محرر Google Apps Script، ثم **إعادة نشر** Web App.

### الملفات المطلوبة (بالترتيب المنطقي):

| الملف في المستودع | دوره |
|-------------------|------|
| **Headers.gs** | إضافة رؤوس أوراق `DocumentCodes` و `DocumentVersions` |
| **ISO.gs** | دوال `getDocumentCodes`, `addDocumentCodeToSheet`, `updateDocumentCode`, `deleteDocumentCode`, `getDocumentVersions`, `addDocumentVersionToSheet`, `updateDocumentVersion`, `getDocumentCodeAndVersion` |
| **Code.gs** | توجيه الـ actions الجديدة في الـ `switch` + إضافتها إلى `readOnlyActions` |
| **Config.gs** | إضافة `DocumentCodes` و `DocumentVersions` إلى قائمة `getRequiredSheets()` |

---

## خطوات التحديث خطوة بخطوة

### 1. فتح مشروع Google Apps Script

- ادخل إلى [Google Apps Script](https://script.google.com).
- افتح المشروع المرتبط بتطبيقك (نفس المشروع الذي يُستخدم فيه رابط Web App في إعدادات التطبيق).

### 2. تحديث الملفات واحدة تلو الأخرى

- في الشريط الجانبي اضغط على اسم كل ملف (مثلاً **Headers**, **ISO**, **Code**, **Config**).
- **استبدل** كل المحتوى المعروض بمحتوى الملف **المطابق** من مجلد `Backend` في المستودع (انسخ من المشروع المحلي أو من GitHub).
- احفظ (Ctrl+S أو أيقونة القرص).

**ملاحظة:** إذا كان لديك أكثر من ملف بنفس الاسم (مثلاً أكثر من ISO)، تأكد أنك تعدّل الملف الذي يُستخدم مع نفس مشروع الـ Web App.

### 3. التحقق من عدم وجود أخطاء

- من القائمة: **تشغيل** → اختر أي دالة بسيطة (مثلاً `doPost` لا تُشغَّل من القائمة مباشرة، لكن يمكنك التحقق من **عرض** → **سجلات التنفيذ** بعد طلب من التطبيق).
- تأكد أن القائمة اليسرى لا تظهر أخطاء حمراء (أخطاء بناء) في أي ملف.

### 4. إعادة نشر Web App

- من القائمة: **نشر** → **إدارة عمليات النشر** (Deploy → Manage deployments).
- بجانب النشر الحالي (مثلاً «نسخة ويب» أو Web app) اضغط **تعديل** (أيقونة القلم).
- في **الإصدار** اختر **إصدار جديد** (New version).
- (اختياري) أضف وصفاً مثل: «تحديث ISO – addDocumentCode».
- اضغط **نشر** (Deploy).
- **لا تغيّر** رابط التطبيق (URL) في إعدادات التطبيق الأمامي؛ نفس الرابط سيعمل بالإصدار الجديد.

### 5. إنشاء أوراق DocumentCodes و DocumentVersions (إن لم تكن موجودة)

- إما من واجهة التطبيق: تشغيل **تهيئة الأوراق** (Initialize Sheets) إن وُجدت،  
- أو يدوياً من Google Sheets: إنشاء ورقتين باسم **DocumentCodes** و **DocumentVersions** مع الرؤوس التالية:

**DocumentCodes:**  
`id` | `code` | `documentName` | `documentType` | `department` | `status` | `description` | `createdAt` | `updatedAt` | `createdBy`

**DocumentVersions:**  
`id` | `documentCodeId` | `documentCode` | `versionNumber` | `issueDate` | `revisionDate` | `status` | `notes` | `isActive` | `createdAt` | `updatedAt` | `createdBy`

---

## تحقق سريع بعد التحديث

1. **تحديث قوي للصفحة** في المتصفح (Ctrl+Shift+R أو Cmd+Shift+R) أو فتح التطبيق في نافذة خاصة.
2. الدخول إلى موديول ISO → **إضافة كود مستند جديد** → تعبئة الحقول ثم **حفظ**.
3. إذا ظهرت نفس رسالة «addDocumentCode غير معترف به»، راجع:
   - أنك عدّلت **نفس** المشروع المستخدم في رابط Web App.
   - أنك اخترت **إصدار جديد** عند النشر وضغطت **نشر**.
   - أن أسماء الملفات في المشروع (Headers.gs, ISO.gs, Code.gs, Config.gs) تطابق المستودع.

---

## ملخص

- التحديث يكون **دائماً** في مشروع Google Apps Script (script.google.com) ثم **إعادة نشر** Web App.
- المستودع (Git) يحتوي على الكود المرجعي؛ النسخة التي تُنفَّذ هي نسخة المشروع المنشورة.
- بعد نسخ الملفات الأربعة وإعادة النشر وإنشاء الأوراق إن لزم، يجب أن يعمل **addDocumentCode** بدون رسالة «غير معترف به».
