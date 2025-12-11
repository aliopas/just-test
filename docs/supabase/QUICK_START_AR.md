# دليل سريع للتعامل مع Supabase

## الإعداد الأولي

### 1. تثبيت Supabase CLI

```bash
npm install -g supabase
```

### 2. تسجيل الدخول

```bash
supabase login
```

سيطلب منك فتح المتصفح وتسجيل الدخول.

### 3. ربط المشروع

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**كيفية الحصول على PROJECT_REF:**
- من Supabase Dashboard: Settings > General > Reference ID
- أو من URL المشروع: `https://YOUR_PROJECT_REF.supabase.co`

## نشر Edge Functions

### الطريقة السريعة (جميع الدوال)

```bash
npm run supabase:deploy
```

أو:

```bash
# Windows PowerShell
.\scripts\deploy-supabase-functions.ps1

# Linux/Mac
./scripts/deploy-supabase-functions.sh
```

### نشر دالة محددة

```bash
# إنشاء مستخدم
npm run supabase:deploy:create

# تحديث مستخدم
npm run supabase:deploy:update

# حذف مستخدم
npm run supabase:deploy:delete

# الموافقة على طلب تسجيل
npm run supabase:deploy:approve

# إرسال إشعارات
npm run supabase:deploy:notifications
```

أو عبر CLI مباشرة:

```bash
supabase functions deploy admin-update-user
```

## إدارة متغيرات البيئة

### إضافة متغيرات البيئة

```bash
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### عرض المتغيرات

```bash
supabase secrets list
```

### حذف متغير

```bash
supabase secrets unset VARIABLE_NAME
```

## عرض السجلات

### جميع الدوال

```bash
npm run supabase:logs
```

### دالة محددة

```bash
supabase functions logs admin-update-user
```

### متابعة السجلات في الوقت الفعلي

```bash
supabase functions logs admin-update-user --follow
```

## قائمة الدوال المنشورة

```bash
npm run supabase:list
```

أو:

```bash
supabase functions list
```

## اختبار الدوال محلياً

### 1. تشغيل Supabase محلياً

```bash
supabase start
```

### 2. استدعاء الدالة محلياً

```bash
supabase functions serve admin-update-user
```

### 3. اختبار عبر curl

```bash
curl -X POST http://localhost:54321/functions/v1/admin-create-user \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## استكشاف الأخطاء الشائعة

### مشكلة: "Project not linked"

**الحل:**
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### مشكلة: "Not authenticated"

**الحل:**
```bash
supabase login
```

### مشكلة: CORS errors

**الحل:**
- تأكد من أن الدالة تحتوي على CORS headers صحيحة
- تأكد من أن OPTIONS request يعيد status 200
- راجع ملف `supabase/functions/admin-update-user/index.ts` كمثال

### مشكلة: "Missing environment variables"

**الحل:**
```bash
supabase secrets set VARIABLE_NAME=value
```

## الأوامر المفيدة

```bash
# عرض معلومات المشروع
supabase projects list

# عرض معلومات المشروع المربوط
supabase status

# إعادة تشغيل Supabase محلياً
supabase stop
supabase start

# عرض جميع الأوامر المتاحة
supabase --help
```

## المراجع

- [دليل النشر الكامل](./deploy-edge-functions.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)

