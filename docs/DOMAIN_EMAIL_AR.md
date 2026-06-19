# إعداد الدومين والبريد الإلكتروني

## الدومين المقترح

لأن هذا البرنامج واحد من عدة برامج مستقلة، استخدم Subdomain:

```text
wfp.3magritools.com
```

أو دومين مستقل:

```text
waterfootprintdecisiontool.com
```

## ربط الدومين مع Vercel

1. Vercel Dashboard.
2. افتح المشروع.
3. Settings > Domains.
4. Add Domain.
5. أضف DNS Records التي يطلبها Vercel عند شركة الدومين.

## البريد الإلكتروني الاحترافي

مقترحات البريد:

```text
contact@yourdomain.com
support@yourdomain.com
info@yourdomain.com
admin@yourdomain.com
```

## اختيار خدمة البريد

### خيار 1: Google Workspace
مناسب لو عايز Gmail رسمي باسم الدومين.

### خيار 2: Zoho Mail
مناسب وأرخص كبداية.

### خيار 3: Resend
مناسب لإرسال رسائل من الموقع، مثل Contact Form وEmail Notifications.

## DNS Records المطلوبة غالبًا

- A أو CNAME للدومين/الساب دومين.
- MX للبريد.
- SPF لتوثيق الإرسال.
- DKIM لتوقيع الرسائل.
- DMARC للحماية من انتحال البريد.

مثال عام، لا تستخدمه كما هو قبل الحصول على القيم من مزود الخدمة:

```text
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```
