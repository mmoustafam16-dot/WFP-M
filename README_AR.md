# Water Footprint Decision Tool - Full Stack Website

هذه نسخة احترافية كاملة من الموقع تشمل:

- صفحة تعريفية قوية Landing Page
- تسجيل دخول وإنشاء حساب
- Dashboard للمستخدم
- حفظ المشروعات أونلاين في Supabase PostgreSQL
- إدماج البرنامج الحالي داخل صفحة Tool
- نموذج تواصل بالبريد الإلكتروني باستخدام Resend
- ملفات إعداد الدومين والاستضافة

## التشغيل المحلي

```bash
npm install
cp .env.example .env.local
npm run dev
```

افتح:

```text
http://localhost:3000
```

## إعداد قاعدة البيانات

1. أنشئ مشروع في Supabase.
2. افتح SQL Editor.
3. شغّل الملف:

```text
supabase/schema.sql
```

4. انسخ Project URL وAnon Key إلى `.env.local`.

## النشر

الأفضل نشر المشروع على Vercel ثم ربط الدومين أو Subdomain مثل:

```text
wfp.yourdomain.com
```

## البريد الإلكتروني

استخدم Resend أو Google Workspace/Zoho Mail. نموذج التواصل يستخدم Resend API.
