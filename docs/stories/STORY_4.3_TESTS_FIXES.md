# Story 4.3: إصلاحات الاختبارات

## المشاكل المكتشفة:

1. **جميع الاختبارات الجديدة تحتاج mock كامل لـ `markRequestAsRead`**
   - `markRequestAsRead` يُستدعى في بداية `getAdminRequestDetail`
   - يحتاج mock لـ:
     - `admin_request_views.select('id').eq('request_id').limit(1)`
     - `requests.select('status').eq('id').single()`
     - `admin_request_views.upsert(...).select('viewed_at').single()`

2. **call counter للـ requests table**
   - أول استدعاء: من `markRequestAsRead` (للحصول على status فقط)
   - ثاني استدعاء: من `getAdminRequestDetail` (للحصول على التفاصيل الكاملة)

3. **storage_key parsing في download URLs**
   - Format: `bucket/path/to/file`
   - Example: `request-attachments/req-1/doc.pdf`
   - يجب تقسيمه: bucket = `request-attachments`, path = `req-1/doc.pdf`

## الحل:

- ✅ تم إنشاء helper function `createMarkRequestAsReadMocks(requestStatus?)`
- ✅ تم إصلاح الاختبار الأول (`includes metadata in request response`)
- ✅ تم إصلاح الاختبار الثاني (`generates download URLs for attachments`)
- ⏳ باقي الاختبارات تحتاج إصلاح:
  - `handles attachment download URL generation failure gracefully`
  - `handles invalid storage_key format gracefully`
  - `returns metadata for feedback request type`

## الحالة:

- ✅ Helper function موجود
- ✅ جميع الاختبارات الخمسة تم إصلاحها:
  1. ✅ `includes metadata in request response`
  2. ✅ `generates download URLs for attachments`
  3. ✅ `handles attachment download URL generation failure gracefully`
  4. ✅ `handles invalid storage_key format gracefully`
  5. ✅ `returns metadata for feedback request type`

## الإصلاحات المطبقة:

جميع الاختبارات الآن تستخدم:
- ✅ Helper function `createMarkRequestAsReadMocks` لتسهيل mock `markRequestAsRead`
- ✅ Call counter للتمييز بين استدعاءات `requests` table (status check vs full detail)
- ✅ Mock كامل لـ `admin_request_views` table
- ✅ Mock صحيح لـ `storage.from()` مع bucket handling

**الحالة النهائية: ✅ جميع الاختبارات جاهزة للتشغيل**

