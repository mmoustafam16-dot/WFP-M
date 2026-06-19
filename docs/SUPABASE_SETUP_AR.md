# إعداد Supabase

## الجداول

- profiles: بيانات المستخدمين.
- projects: المشروعات المحفوظة.
- contact_messages: رسائل التواصل، للاستخدام الإداري لاحقًا.

## الحماية

تم تفعيل Row Level Security على الجداول. كل مستخدم يستطيع قراءة وتعديل وحذف مشروعاته فقط.

## Auth

من Supabase > Authentication:

- فعّل Email/Password.
- أضف Site URL:

```text
https://wfp.yourdomain.com
```

- أضف Redirect URLs:

```text
https://wfp.yourdomain.com/dashboard
http://localhost:3000/dashboard
```
