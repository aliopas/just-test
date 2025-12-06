# التحقق من بيانات الطلبات (Requests Data Verification)

هذا المستند يشرح كيفية التحقق من أن البيانات تُعرض بشكل صحيح من جداول Supabase في:
- `/api/v1/investor/requests` - طلبات المستثمر
- `/api/v1/admin/requests` - طلبات الإدارة

## الجداول والـ Views المستخدمة

### 1. جدول `requests`
- **الاستخدام**: الجدول الرئيسي لجميع الطلبات
- **المستخدم في**: 
  - Admin requests (`listAdminRequests`)
  - Investor dashboard
  - Reports

### 2. View `v_request_workflow`
- **الاستخدام**: عرض مبسط للطلبات مع آخر حدث في workflow
- **المستخدم في**: 
  - Investor requests (`listInvestorRequests`)
- **المكونات**:
  - جميع حقول `requests`
  - `last_event`: آخر حدث في workflow (JSON object)

### 3. جدول `users`
- **الاستخدام**: بيانات المستخدمين
- **المستخدم في**: 
  - Admin requests (لجلب بيانات المستثمر)

### 4. جدول `investor_profiles`
- **الاستخدام**: ملفات المستثمرين الشخصية
- **المستخدم في**: 
  - Admin requests (لجلب اسم المستثمر)

### 5. جدول `admin_request_views`
- **الاستخدام**: تتبع الطلبات المقروءة من قبل الإدارة
- **المستخدم في**: 
  - Admin requests (لتعيين `isRead` و `isNew`)

## كيفية التحقق

### 1. تشغيل سكريبت التحقق

```bash
# تأكد من وجود ملف .env مع متغيرات Supabase
npx ts-node backend/scripts/verify-requests-data.ts
```

هذا السكريبت سيفحص:
- ✅ وجود جدول `requests` وإمكانية الوصول إليه
- ✅ وجود view `v_request_workflow` وإمكانية الوصول إليه
- ✅ وجود جداول `users` و `investor_profiles`
- ✅ نجاح استعلامات Admin requests
- ✅ نجاح استعلامات Investor requests

### 2. التحقق من البيانات في Supabase Dashboard

1. افتح Supabase Dashboard
2. اذهب إلى **Table Editor**
3. تحقق من وجود البيانات في:
   - `requests` - يجب أن يحتوي على طلبات
   - `users` - يجب أن يحتوي على مستخدمين
   - `investor_profiles` - يجب أن يحتوي على ملفات مستثمرين
4. اذهب إلى **SQL Editor**
5. تحقق من وجود view:
   ```sql
   SELECT * FROM v_request_workflow LIMIT 5;
   ```

### 3. التحقق من API Endpoints

#### Admin Requests
```bash
# تأكد من تسجيل الدخول كـ admin أولاً
curl -X GET "http://localhost:3000/api/v1/admin/requests?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**الاستجابة المتوقعة:**
```json
{
  "requests": [
    {
      "id": "...",
      "requestNumber": "...",
      "status": "...",
      "type": "...",
      "investor": {
        "id": "...",
        "email": "...",
        "fullName": "..."
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pageCount": 10
  }
}
```

#### Investor Requests
```bash
# تأكد من تسجيل الدخول كـ investor أولاً
curl -X GET "http://localhost:3000/api/v1/investor/requests?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_INVESTOR_TOKEN"
```

**الاستجابة المتوقعة:**
```json
{
  "requests": [
    {
      "id": "...",
      "requestNumber": "...",
      "status": "...",
      "type": "...",
      "lastEvent": {
        "id": "...",
        "fromStatus": "...",
        "toStatus": "...",
        "createdAt": "..."
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pageCount": 5
  }
}
```

## المشاكل الشائعة وحلولها

### 1. لا توجد بيانات في `requests`
**الحل:**
- تأكد من وجود طلبات في قاعدة البيانات
- تحقق من RLS policies - قد تكون تمنع الوصول
- استخدم `requireSupabaseAdmin()` للوصول كـ admin

### 2. خطأ في `v_request_workflow`
**الحل:**
- تحقق من وجود migration `20241108074500_request_workflow_view.sql`
- شغّل migration إذا لم يكن موجوداً:
  ```sql
  CREATE OR REPLACE VIEW v_request_workflow AS
  SELECT
    r.id,
    r.request_number,
    r.user_id,
    r.type,
    r.amount,
    r.currency,
    r.target_price,
    r.expiry_at,
    r.status,
    r.created_at,
    r.updated_at,
    COALESCE(
      (
        SELECT jsonb_build_object(
          'id', ev.id,
          'from_status', ev.from_status,
          'to_status', ev.to_status,
          'actor_id', ev.actor_id,
          'note', ev.note,
          'created_at', ev.created_at
        )
        FROM request_events ev
        WHERE ev.request_id = r.id
        ORDER BY ev.created_at DESC
        LIMIT 1
      ),
      jsonb_build_object(
        'id', NULL,
        'from_status', NULL,
        'to_status', r.status,
        'actor_id', NULL,
        'note', NULL,
        'created_at', r.created_at
      )
    ) AS last_event
  FROM requests r;
  ```

### 3. بيانات المستثمر غير موجودة في Admin Requests
**الحل:**
- تحقق من وجود `user_id` في جدول `requests`
- تحقق من وجود المستخدم في جدول `users`
- تحقق من وجود ملف في `investor_profiles`
- الكود يجلب البيانات بشكل منفصل ثم يربطها - هذا صحيح

### 4. `isRead` و `isNew` غير صحيحة
**الحل:**
- تحقق من وجود بيانات في `admin_request_views`
- تحقق من أن `admin_id` صحيح
- تحقق من أن `request_id` موجود في `requests`

## ملاحظات مهمة

1. **Admin Requests** يستخدم:
   - جدول `requests` مباشرة
   - يجلب `users` و `investor_profiles` بشكل منفصل
   - يجلب `admin_request_views` لتحديد `isRead` و `isNew`

2. **Investor Requests** يستخدم:
   - View `v_request_workflow` مباشرة
   - هذا View يجلب البيانات من `requests` و `request_events`

3. **الأداء**:
   - Admin requests يجلب البيانات في استعلامات منفصلة لتحسين الأداء
   - Investor requests يستخدم view محسّن

4. **RLS Policies**:
   - الكود يستخدم `requireSupabaseAdmin()` للوصول كـ admin
   - هذا يتجاوز RLS policies
   - تأكد من أن `SUPABASE_SERVICE_ROLE_KEY` موجود في environment variables

## التحقق من Logs

عند حدوث مشاكل، تحقق من:
1. **Backend logs**: ابحث عن `[AdminRequestService]` أو `[RequestService]`
2. **Supabase logs**: في Supabase Dashboard > Logs
3. **Browser console**: للأخطاء في Frontend

## الخطوات التالية

إذا كانت البيانات لا تظهر:
1. ✅ شغّل سكريبت التحقق
2. ✅ تحقق من وجود البيانات في Supabase Dashboard
3. ✅ تحقق من RLS policies
4. ✅ تحقق من environment variables
5. ✅ تحقق من logs للأخطاء
