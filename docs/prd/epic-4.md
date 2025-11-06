# Epic 4: لوحة تحكم الأدمن - إدارة الطلبات
## Admin Dashboard - Request Management

**Epic Goal:**  
إنشاء لوحة تحكم شاملة للأدمن لإدارة الطلبات مع الفلترة والفرز والقرارات (قبول/رفض/طلب معلومات إضافية). هذا Epic يوفر الأدوات الأساسية للأدمن لمعالجة الطلبات.

---

## Story 4.1: صندوق وارد الطلبات للأدمن

**As a** أدمن،  
**I want** صندوق وارد للطلبات،  
**so that** يمكنني مراجعة جميع الطلبات.

### Acceptance Criteria

1. إنشاء API endpoint GET /admin/requests مع pagination وfiltering
2. استخدام Supabase Client: `supabase.from('requests').select()` مع joins
3. استخدام Supabase Filters: `.eq()`, `.gte()`, `.lte()`, `.ilike()` للفلترة
4. فلترة حسب الحالة (Submitted, Screening, Pending Info, etc.)
5. فلترة حسب النوع (شراء/بيع)
6. فلترة حسب المبلغ (نطاق) باستخدام `.gte()` و`.lte()`
7. فلترة حسب التاريخ باستخدام `.gte()` و`.lte()`
8. فرز حسب التاريخ/المبلغ/الحالة باستخدام `.order()`
9. البحث بالرقم أو اسم المستثمر باستخدام `.ilike()`
10. Pagination باستخدام `.range()`
11. استخدام Supabase RLS للتحقق من صلاحيات الأدمن
12. جميع الاختبارات تمر بنجاح

---

## Story 4.2: واجهة صندوق وارد الطلبات

**As a** أدمن،  
**I want** واجهة شبيهة بالبريد الإلكتروني للطلبات،  
**so that** يمكنني مراجعة الطلبات بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Requests Inbox في Frontend
2. عرض قائمة الطلبات مع الفلترة والفرز
3. تصميم شبيه بالبريد مع Inbox
4. عرض معلومات مختصرة لكل طلب (الرقم، المستثمر، المبلغ، الحالة، التاريخ)
5. تمييز الطلبات الجديدة/المتعثرة
6. Pagination للنتائج
7. جميع الاختبارات تمر بنجاح

---

## Story 4.3: لوحة قرار الطلب للأدمن

**As a** أدمن،  
**I want** لوحة قرار لمراجعة الطلب،  
**so that** يمكنني اتخاذ القرار المناسب.

### Acceptance Criteria

1. إنشاء API endpoint GET /admin/requests/:id مع جميع التفاصيل
2. إنشاء صفحة Request Details في Frontend
3. عرض بيانات الطلب الكاملة
4. عرض الملفات المرفوعة مع إمكانية التنزيل
5. عرض سجل الأحداث (Timeline)
6. عرض التعليقات الداخلية
7. أزرار القرار (قبول/رفض/طلب معلومات إضافية)
8. جميع الاختبارات تمر بنجاح

---

## Story 4.4: قبول/رفض الطلب

**As a** أدمن،  
**I want** قبول أو رفض الطلب،  
**so that** يمكنني اتخاذ القرار.

### Acceptance Criteria

1. إنشاء API endpoint PATCH /admin/requests/:id/approve
2. إنشاء API endpoint PATCH /admin/requests/:id/reject
3. التحقق من الصلاحيات
4. تغيير الحالة إلى Approved أو Rejected
5. تسجيل الحدث في request_events
6. إضافة تعليق داخلي (اختياري)
7. إرسال إشعار للمستثمر
8. تسجيل في audit_logs
9. جميع الاختبارات تمر بنجاح

---

## Story 4.5: طلب معلومات إضافية

**As a** أدمن،  
**I want** طلب معلومات إضافية من المستثمر،  
**so that** يمكنني الحصول على البيانات المطلوبة.

### Acceptance Criteria

1. إنشاء API endpoint POST /admin/requests/:id/request-info
2. إدخال رسالة الطلب
3. تغيير الحالة إلى Pending Info
4. تسجيل الحدث في request_events
5. إرسال إشعار للمستثمر مع الرسالة
6. فتح حقل رد للمستثمر
7. تسجيل في audit_logs
8. جميع الاختبارات تمر بنجاح

---

## Story 4.6: إضافة تعليقات داخلية

**As a** أدمن،  
**I want** إضافة تعليقات داخلية على الطلب،  
**so that** يمكنني التواصل مع الفريق.

### Acceptance Criteria

1. إنشاء جدول request_comments
2. إنشاء API endpoint POST /admin/requests/:id/comments
3. إنشاء API endpoint GET /admin/requests/:id/comments
4. إضافة تعليق مع المستخدم والوقت
5. عرض التعليقات في لوحة القرار
6. تسجيل في audit_logs
7. جميع الاختبارات تمر بنجاح

---

## Story 4.7: معالجة الطلب (Settling → Completed)

**As a** أدمن،  
**I want** معالجة الطلب بعد الموافقة،  
**so that** يمكن إكمال العملية.

### Acceptance Criteria

1. إنشاء API endpoint PATCH /admin/requests/:id/settle
2. تغيير الحالة إلى Settling
3. إثبات الدفع/المقاصة
4. رفع مستندات المقاصة
5. تغيير الحالة إلى Completed بعد الإثبات
6. تسجيل جميع الأحداث
7. إرسال إشعار للمستثمر
8. جميع الاختبارات تمر بنجاح

