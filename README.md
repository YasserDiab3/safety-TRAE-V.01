# Google App-2026-03

مشروع ويب (Frontend + Backend) جاهز للنشر على **GitHub** و **Vercel**.

## هيكل المشروع

| المجلد | الوصف |
|--------|--------|
| `Frontend/` | مصدر الواجهة الأمامية (HTML, CSS, JS) |
| `vercel-deploy/frontend/` | نسخة معدّة للنشر على Vercel (تحتوي على `vercel.json`) |
| `Backend/` | سكربتات Google Apps Script (`.gs`) — تعمل على سيرفرات جوجل |

## رفع المشروع على GitHub

1. **إنشاء مستودع جديد على GitHub**
   - اذهب إلى [github.com/new](https://github.com/new)
   - اسم المستودع: `Google-App-2026-03` (أو كما تفضل)
   - اختر Public، ولا تُفعّل "Add a README" إن كنت سترفع من جهازك

2. **من جهازك (مجلد المشروع):**

```bash
git init
git add .
git commit -m "Initial commit: Google App-2026-03"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Google-App-2026-03.git
git push -u origin main
```

استبدل `YOUR_USERNAME` باسم مستخدمك على GitHub.

## النشر على Vercel

1. ادخل إلى [vercel.com](https://vercel.com) وسجّل الدخول (يفضل عبر GitHub).
2. **New Project** ← استيراد المستودع `Google-App-2026-03`.
3. **مهم:** في إعدادات المشروع حدد:
   - **Root Directory:** `vercel-deploy/frontend`
   - اترك **Build Command** فارغاً (أو لا تشغّل بناء إن لم يكن مطلوباً).
   - **Output Directory:** اتركه افتراضي (أو `./`).
4. اضغط **Deploy**.

بهذا يكون النشر مطابقاً لملف `vercel.json` الموجود داخل `vercel-deploy/frontend` (روابط نظيفة، SPA rewrite، وخدمة الـ Service Worker).

## التشغيل محلياً

- افتح `Frontend/index.html` أو `vercel-deploy/frontend/index.html` في المتصفح، أو استخدم خادم محلي (مثلاً من داخل `vercel-deploy/frontend`):

```bash
cd vercel-deploy/frontend
npx serve .
```

---

**اسم المشروع:** Google App-2026-03
