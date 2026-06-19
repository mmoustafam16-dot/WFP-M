# Water Footprint Decision Tool — Website Version

تم تحويل البرنامج من ملف HTML واحد إلى موقع إلكتروني ثابت جاهز للنشر.

## محتويات الموقع

- `index.html`: الصفحة الرئيسية للبرنامج.
- `assets/css/styles.css`: كل التنسيقات المفصولة من الملف الأصلي.
- `assets/js/app.js`: كل أكواد JavaScript والحسابات والبيانات.
- `assets/img/`: الصور والأيقونات المستخرجة من الملف الأصلي.
- `vercel.json`: إعدادات نشر Vercel.
- `netlify.toml`: إعدادات نشر Netlify.
- `site.webmanifest`: إعدادات PWA أولية.
- `robots.txt` و `sitemap.xml`: ملفات أساسية لمحركات البحث.

## التشغيل محليًا

افتح `index.html` مباشرة، أو شغل سيرفر محلي:

```bash
python -m http.server 8000
```

ثم افتح:

```text
http://localhost:8000
```

## النشر كـ Website

### على Vercel
1. ارفع هذا المجلد إلى GitHub.
2. افتح Vercel.
3. اختر New Project.
4. اختر Repository.
5. اضغط Deploy.

### على Netlify
1. افتح Netlify.
2. اسحب المجلد كله داخل صفحة Deploy.
3. سيتم نشر الموقع مباشرة.

### على GitHub Pages
1. ارفع المجلد إلى Repository.
2. من Settings > Pages اختر Branch.
3. سيتم إنشاء رابط للموقع.

## ملاحظات مهمة

- البرنامج يعمل كـ Static Website ولا يحتاج قاعدة بيانات حاليًا.
- حفظ البيانات، إن وجد، يتم محليًا داخل المتصفح باستخدام localStorage.
- يمكن لاحقًا إضافة تسجيل دخول وقاعدة بيانات Supabase لحفظ مشروعات المستخدمين.
- يجب تغيير `https://example.com` داخل `sitemap.xml` و`robots.txt` إلى رابط الدومين الحقيقي.
