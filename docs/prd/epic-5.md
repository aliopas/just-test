# Epic 5: إدارة المحتوى (الأخبار والإعلانات)
## Content Management System

**Epic Goal:**  
إنشاء نظام إدارة المحتوى الكامل مع Markdown، الصور، والجدولة. هذا Epic يوفر الأدوات لإدارة الأخبار والإعلانات.

---

## Story 5.1: إنشاء جداول المحتوى

**As a** نظام،  
**I want** جداول قاعدة البيانات للمحتوى،  
**so that** يمكن تخزين الأخبار والإعلانات.

### Acceptance Criteria

1. إنشاء جداول news وnews_categories باستخدام `mcp_supabase_apply_migration`
2. جدول news: (id, title, slug, body_md, cover_key, category, status, scheduled_at, published_at, author_id, created_at, updated_at)
3. جدول news_categories: (id, name, slug, description)
4. إنشاء indexes للبحث السريع في Supabase
5. إعداد Full-Text Search في Supabase للبحث في المحتوى
6. إعداد Foreign Keys والعلاقات
7. استخدام Supabase RLS Policies لحماية البيانات
8. جميع الاختبارات تمر بنجاح

---

## Story 5.2: API إدارة المحتوى (CRUD)

**As a** أدمن،  
**I want** إنشاء وتعديل المحتوى،  
**so that** يمكنني إدارة الأخبار والإعلانات.

### Acceptance Criteria

1. إنشاء API endpoint POST /admin/news
2. إنشاء API endpoint GET /admin/news مع pagination
3. إنشاء API endpoint GET /admin/news/:id
4. إنشاء API endpoint PATCH /admin/news/:id
5. إنشاء API endpoint DELETE /admin/news/:id
6. التحقق من الصلاحيات (Admin فقط)
7. دعم Markdown في body_md
8. جميع الاختبارات تمر بنجاح

---

## Story 5.3: رفع ومعالجة الصور

**As a** أدمن،  
**I want** رفع ومعالجة صور المحتوى،  
**so that** يمكنني إضافة صور عالية الجودة.

### Acceptance Criteria

1. إنشاء API endpoint POST /admin/news/images/presign
2. رفع الصورة إلى Supabase Storage مع Presigned URLs
3. تحجيم تلقائي للصور
4. ضغط الصور (optimization)
5. إنشاء نسخ متعددة الأحجام (thumbnail, medium, large)
6. حفظ معلومات الصورة
7. جميع الاختبارات تمر بنجاح

---

## Story 5.4: جدولة النشر

**As a** أدمن،  
**I want** جدولة نشر المحتوى،  
**so that** يمكنني نشر المحتوى في وقت محدد.

### Acceptance Criteria

1. إضافة حقل scheduled_at في النموذج
2. إنشاء Job Queue للتحقق من المحتوى المجدول
3. تغيير الحالة تلقائياً من Scheduled إلى Published في الوقت المحدد
4. إرسال إشعار عند النشر
5. جميع الاختبارات تمر بنجاح

---

## Story 5.5: واجهة إدارة المحتوى

**As a** أدمن،  
**I want** واجهة لإدارة المحتوى،  
**so that** يمكنني إنشاء وتعديل الأخبار بسهولة.

### Acceptance Criteria

1. إنشاء صفحة News Management في Frontend
2. عرض قائمة الأخبار مع الفلترة
3. نموذج إنشاء/تعديل مع Markdown editor
4. رفع الصور بالسحب والإفلات
5. معاينة المحتوى قبل النشر
6. اختيار التصنيف (صفقات، توسعات، أخبار عامة، إعلانات)
7. اختيار الحالة (Draft, Scheduled, Published)
8. جميع الاختبارات تمر بنجاح

---

## Story 5.6: نظام الموافقة على المحتوى

**As a** أدمن،  
**I want** مراجعة والموافقة على المحتوى قبل النشر،  
**so that** يمكن ضمان جودة المحتوى.

### Acceptance Criteria

1. إنشاء API endpoint POST /admin/news/:id/approve
2. إنشاء API endpoint POST /admin/news/:id/reject
3. التحقق من صلاحية Admin
4. تغيير الحالة بعد الموافقة
5. إضافة تعليقات المراجعة
6. إرسال إشعار عند النشر
7. تسجيل في audit_logs
8. جميع الاختبارات تمر بنجاح

---

## Story 5.7: عرض المحتوى للمستثمرين

**As a** مستثمر،  
**I want** رؤية الأخبار والإعلانات،  
**so that** أبقى على اطلاع بالتحديثات.

### Acceptance Criteria

1. إنشاء API endpoint GET /news?status=published
2. عرض عناوين مختصرة للعامة
3. إنشاء API endpoint GET /news/:id للمسجلين فقط
4. إنشاء صفحة News في Frontend
5. عرض قائمة الأخبار مع الصور المصغرة
6. صفحة تفاصيل الخبر الكاملة
7. دعم Markdown rendering
8. جميع الاختبارات تمر بنجاح

