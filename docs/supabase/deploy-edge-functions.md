# نشر Supabase Edge Functions

دليل شامل لنشر Edge Functions إلى Supabase.

## المتطلبات الأساسية

1. **تثبيت Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **تسجيل الدخول إلى Supabase:**
   ```bash
   supabase login
   ```

3. **ربط المشروع:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   يمكنك الحصول على `PROJECT_REF` من:
   - Supabase Dashboard > Settings > General > Reference ID
   - أو من URL المشروع: `https://YOUR_PROJECT_REF.supabase.co`

## نشر Edge Functions

### نشر دالة واحدة

```bash
# نشر دالة إنشاء مستخدم
supabase functions deploy admin-create-user

# نشر دالة تحديث مستخدم
supabase functions deploy admin-update-user

# نشر دالة حذف مستخدم
supabase functions deploy admin-delete-user

# نشر دالة الموافقة على طلب التسجيل
supabase functions deploy approve-signup-request

# نشر دالة إرسال الإشعارات
supabase functions deploy notification-dispatch
```

### نشر جميع الدوال

```bash
supabase functions deploy
```

## إعداد متغيرات البيئة

قبل النشر، تأكد من إعداد متغيرات البيئة في Supabase Dashboard:

1. اذهب إلى **Supabase Dashboard** > **Edge Functions** > **Settings**
2. أضف المتغيرات التالية:
   - `SUPABASE_URL` - URL مشروع Supabase
   - `SUPABASE_ANON_KEY` - المفتاح العام (Anon Key)
   - `SUPABASE_SERVICE_ROLE_KEY` - مفتاح الخدمة (Service Role Key)

أو عبر CLI:

```bash
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## التحقق من النشر

### 1. التحقق من الدوال المنشورة

```bash
supabase functions list
```

### 2. اختبار الدالة محلياً

```bash
# تشغيل Supabase محلياً
supabase start

# استدعاء الدالة محلياً
supabase functions serve admin-update-user
```

### 3. اختبار الدالة المنشورة

```bash
# الحصول على URL الدالة
supabase functions list

# اختبار عبر curl
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-create-user \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## استكشاف الأخطاء

### مشاكل CORS

إذا واجهت مشاكل CORS:
1. تأكد من أن الدالة تحتوي على CORS headers صحيحة
2. تأكد من أن OPTIONS request يعيد status 200
3. تأكد من وجود `Access-Control-Allow-Methods` header

### مشاكل المصادقة

إذا فشلت المصادقة:
1. تأكد من إرسال `Authorization` header
2. تأكد من صحة JWT token
3. تحقق من RLS policies في قاعدة البيانات

### عرض السجلات

```bash
# عرض سجلات دالة محددة
supabase functions logs admin-update-user

# عرض السجلات في الوقت الفعلي
supabase functions logs admin-update-user --follow
```

## سكريبتات مفيدة

### نشر جميع الدوال مع التحقق

```bash
#!/bin/bash
# deploy-all-functions.sh

echo "🚀 نشر جميع Edge Functions..."

functions=(
  "admin-create-user"
  "admin-update-user"
  "admin-delete-user"
  "approve-signup-request"
  "notification-dispatch"
)

for func in "${functions[@]}"; do
  echo "📦 نشر $func..."
  supabase functions deploy "$func"
  
  if [ $? -eq 0 ]; then
    echo "✅ تم نشر $func بنجاح"
  else
    echo "❌ فشل نشر $func"
    exit 1
  fi
done

echo "🎉 تم نشر جميع الدوال بنجاح!"
```

## أفضل الممارسات

1. **اختبار محلياً أولاً:**
   - استخدم `supabase start` لتشغيل Supabase محلياً
   - اختبر الدوال محلياً قبل النشر

2. **استخدام Git:**
   - احفظ جميع التغييرات في Git
   - استخدم branches منفصلة للتطوير

3. **مراقبة السجلات:**
   - راقب سجلات الدوال بانتظام
   - استخدم `supabase functions logs` للتحقق من الأخطاء

4. **إدارة الإصدارات:**
   - استخدم tags في Git للإصدارات
   - وثّق التغييرات في كل إصدار

## المراجع

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)

