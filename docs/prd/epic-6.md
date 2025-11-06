# Epic 6: الإشعارات والتواصل
## Notifications & Communication

**Epic Goal:**  
إنشاء نظام الإشعارات الشامل مع Email، SMS، وإشعارات داخل المنصة. هذا Epic يوفر التواصل الفعال مع المستخدمين.

---

## Story 6.1: إنشاء جداول الإشعارات

**As a** نظام،  
**I want** جداول قاعدة البيانات للإشعارات،  
**so that** يمكن تخزين وإدارة الإشعارات.

### Acceptance Criteria

1. إنشاء جداول notifications وnotification_preferences باستخدام `mcp_supabase_apply_migration`
2. جدول notifications: (id, user_id, type, channel, payload, read_at, created_at)
3. جدول notification_preferences: (user_id, channel, type, enabled)
4. إنشاء indexes للبحث السريع في Supabase
5. إعداد Foreign Keys والعلاقات
6. استخدام Supabase RLS Policies لحماية البيانات
7. إعداد Supabase Realtime Subscription على جدول notifications
8. جميع الاختبارات تمر بنجاح

---

## Story 6.2: نظام قوالب Email

**As a** نظام،  
**I want** قوالب Email جاهزة،  
**so that** يمكن إرسال إشعارات منسقة.

### Acceptance Criteria

1. إنشاء قوالب Email للحالات: Submitted, Pending Info, Approved, Rejected, Settling, Completed
2. دعم HTML وPlain Text
3. دعم المتغيرات الديناميكية (اسم المستخدم، رقم الطلب، إلخ)
4. تصميم responsive للبريد
5. دعم العربية والإنجليزية
6. جميع الاختبارات تمر بنجاح

---

## Story 6.3: إرسال إشعارات Email مع Supabase

**As a** نظام،  
**I want** إرسال إشعارات Email عبر Supabase،  
**so that** يمكن التواصل مع المستخدمين.

### Acceptance Criteria

1. استخدام Supabase Auth Email Templates
2. تكوين Email Templates في Supabase Dashboard
3. استخدام Supabase Edge Functions لإرسال الإشعارات
4. إضافة إلى Queue للمعالجة غير المتزامنة
5. معالجة الأخطاء وإعادة المحاولة
6. تسجيل حالة الإرسال في Supabase Database
7. جميع الاختبارات تمر بنجاح

---

## Story 6.4: إرسال إشعارات SMS

**As a** نظام،  
**I want** إرسال إشعارات SMS،  
**so that** يمكن التواصل مع المستخدمين عبر الرسائل النصية.

### Acceptance Criteria

1. تكامل مع مزود SMS (Twilio/SMS Gateway)
2. إنشاء Service لإرسال SMS
3. إضافة إلى Queue للمعالجة غير المتزامنة
4. معالجة الأخطاء وإعادة المحاولة
5. تسجيل حالة الإرسال
6. جميع الاختبارات تمر بنجاح

---

## Story 6.5: مركز الإشعارات داخل المنصة مع Supabase Realtime

**As a** مستثمر،  
**I want** مركز إشعارات داخل المنصة مع تحديثات فورية،  
**so that** أبقى على اطلاع بالتحديثات.

### Acceptance Criteria

1. إنشاء API endpoint GET /notifications مع pagination
2. إنشاء API endpoint PATCH /notifications/:id/read
3. إنشاء API endpoint POST /notifications/mark-all-read
4. استخدام Supabase Realtime للاستماع للتحديثات الفورية
5. إنشاء Supabase Channel للإشعارات لكل مستخدم
6. إنشاء صفحة Notifications في Frontend
7. عرض قائمة الإشعارات مع تحديثات فورية
8. تمييز الإشعارات غير المقروءة
9. عداد الإشعارات غير المقروءة مع تحديث فوري
10. جميع الاختبارات تمر بنجاح

---

## Story 6.6: تفضيلات الإشعارات

**As a** مستثمر،  
**I want** تخصيص تفضيلات الإشعارات،  
**so that** أتحكم في نوع الإشعارات التي أتلقاها.

### Acceptance Criteria

1. إنشاء API endpoint GET /notifications/preferences
2. إنشاء API endpoint PATCH /notifications/preferences
3. اختيار القنوات (Email, SMS, In-App)
4. اختيار أنواع الإشعارات (Mute/Enable)
5. إنشاء واجهة Preferences في Frontend
6. حفظ التفضيلات
7. جميع الاختبارات تمر بنجاح

---

## Story 6.7: سجل المراسلات (Timeline)

**As a** مستثمر/أدمن،  
**I want** رؤية سجل المراسلات لكل طلب،  
**so that** يمكن تتبع التواصل.

### Acceptance Criteria

1. ربط الإشعارات بالطلبات
2. عرض Timeline في صفحة تفاصيل الطلب
3. عرض جميع الإشعارات المرسلة
4. عرض التعليقات والردود
5. ترتيب زمني للأحداث
6. جميع الاختبارات تمر بنجاح

