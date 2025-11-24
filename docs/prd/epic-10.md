# Epic 10: الصفحة الخاصة بالشريك
## Partner Portal Page

**Epic Goal:**  
إنشاء صفحة خاصة بكل شريك تحتوي على اتفاقية عدم الإفصاح، ملفات الشركة الثابتة، التقارير المالية، المشاريع، الأخبار الحصرية، وتقارير الموارد المالية الخارجية.

---

## Story 10.1: إنشاء جداول الملفات والوثائق

**As a** نظام،  
**I want** جداول قاعدة البيانات للملفات والوثائق،  
**so that** يمكن تخزين ملفات الشركة والوثائق.

### Acceptance Criteria

1. إنشاء جداول `company_static_files`, `financial_reports`, `external_financial_resources`, `nda_agreements` باستخدام `mcp_supabase_apply_migration`
2. جدول `company_static_files`: (id, category, title_ar, title_en, description_ar, description_en, file_key, file_type, file_size, display_order, is_readonly, created_at, updated_at)
   - category: enum ('company_profile', 'business_model', 'regulations', 'strategic_plan', 'financial_statements', 'certificates')
3. جدول `financial_reports`: (id, title_ar, title_en, description_ar, description_en, file_key, report_date, report_type, file_size, created_at, updated_at)
   - report_type: enum ('quarterly', 'annual', 'special')
4. جدول `external_financial_resources`: (id, title_ar, title_en, description_ar, description_en, file_key, resource_type, source_name, source_url, icon_key, file_size, created_at, updated_at)
5. جدول `nda_agreements`: (id, user_id, agreement_version, agreed_at, ip_address, user_agent, created_at)
6. إنشاء indexes للبحث السريع في Supabase
7. إعداد Foreign Keys والعلاقات
8. استخدام Supabase RLS Policies:
   - المستثمرون يقرأون فقط
   - الأدمن يقرأ ويكتب
   - الملفات الثابتة للاطلاع فقط (لا تنزيل)
9. جميع الاختبارات تمر بنجاح

---

## Story 10.2: اتفاقية عدم الإفصاح (NDA) الإلكترونية

**As a** مستثمر،  
**I want** الموافقة على اتفاقية عدم الإفصاح عند التسجيل،  
**so that** يمكنني الوصول للمحتوى الحصري.

### Acceptance Criteria

1. إنشاء جدول `nda_templates` لتخزين نسخ الاتفاقية (id, version, content_ar, content_en, is_active, created_at)
2. إنشاء API endpoint GET /public/nda/latest للحصول على أحدث نسخة
3. تحديث عملية التسجيل لتتضمن الموافقة على NDA
4. حفظ الموافقة في جدول `nda_agreements` مع:
   - user_id
   - agreement_version
   - agreed_at (timestamp)
   - ip_address
   - user_agent
5. منع الوصول للمحتوى الحصري بدون الموافقة
6. إرسال نسخة من الاتفاقية بالبريد الإلكتروني
7. جميع الاختبارات تمر بنجاح

---

## Story 10.3: API ملفات الشركة الثابتة

**As a** مستثمر،  
**I want** الوصول لملفات الشركة الثابتة،  
**so that** يمكنني الاطلاع عليها.

### Acceptance Criteria

1. إنشاء API endpoint GET /investor/company-files
2. فلترة حسب الفئة (category)
3. إرجاع معلومات الملفات فقط (لا روابط تنزيل)
4. استخدام Presigned URLs للعرض فقط (read-only, expiration)
5. منع التنزيل (view-only URLs)
6. التحقق من موافقة NDA
7. ترتيب حسب display_order
8. جميع الاختبارات تمر بنجاح

---

## Story 10.4: واجهة ملفات الشركة الثابتة

**As a** مستثمر،  
**I want** واجهة لعرض ملفات الشركة،  
**so that** يمكنني الاطلاع عليها بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Company Files في Frontend (`/app/company-files`)
2. عرض الملفات في تبويبات حسب الفئة:
   - بروفايل الشركة
   - نموذج العمل التجاري
   - اللوائح الإدارية والمالية
   - الخطة الاستراتيجية والمالية
   - القوائم المالية السابقة
   - الشهادات الرسمية
3. عرض كل ملف في بطاقة مع:
   - العنوان والوصف
   - نوع الملف
   - حجم الملف
   - أيقونة النوع
4. زر "عرض" يفتح الملف في نافذة جديدة (view-only)
5. لا يوجد زر تنزيل
6. رسالة توضيحية أن الملفات للاطلاع فقط
7. دعم RTL والترجمة
8. جميع الاختبارات تمر بنجاح

---

## Story 10.5: API التقارير المالية

**As a** مستثمر،  
**I want** الوصول للتقارير المالية،  
**so that** يمكنني متابعة الأداء المالي.

### Acceptance Criteria

1. إنشاء API endpoint GET /investor/financial-reports
2. فلترة حسب نوع التقرير (quarterly, annual, special)
3. فلترة حسب التاريخ (من/إلى)
4. ترتيب حسب تاريخ التقرير (الأحدث أولاً)
5. إرجاع معلومات التقرير مع Presigned URL للتنزيل
6. التحقق من موافقة NDA
7. Pagination للنتائج
8. جميع الاختبارات تمر بنجاح

---

## Story 10.6: واجهة التقارير المالية

**As a** مستثمر،  
**I want** واجهة لعرض وتنزيل التقارير المالية،  
**so that** يمكنني متابعة الأداء المالي.

### Acceptance Criteria

1. إنشاء صفحة Financial Reports في Frontend (`/app/financial-reports`)
2. عرض قائمة التقارير مع:
   - العنوان والوصف
   - نوع التقرير (ربعي/سنوي/خاص)
   - تاريخ التقرير
   - حجم الملف
   - زر تنزيل
3. فلترة حسب نوع التقرير
4. فلترة حسب التاريخ
5. بحث في العناوين
6. Pagination
7. دعم RTL والترجمة
8. جميع الاختبارات تمر بنجاح

---

## Story 10.7: إنشاء جداول المشاريع

**As a** نظام،  
**I want** جداول قاعدة البيانات للمشاريع،  
**so that** يمكن تخزين معلومات المشاريع.

### Acceptance Criteria

1. إنشاء جداول `projects`, `project_milestones` باستخدام `mcp_supabase_apply_migration`
2. جدول `projects`: (id, title_ar, title_en, description_ar, description_en, status, start_date, completion_date, completion_percentage, cover_image_key, is_completed_2025, created_at, updated_at)
   - status: enum ('planning', 'in_progress', 'on_hold', 'completed')
3. جدول `project_milestones`: (id, project_id, title_ar, title_en, description_ar, description_en, target_date, completed_date, is_completed, display_order, created_at, updated_at)
4. إنشاء indexes للبحث السريع في Supabase
5. إعداد Foreign Keys والعلاقات
6. استخدام Supabase RLS Policies (قراءة للمستثمرين، كتابة للأدمن)
7. جميع الاختبارات تمر بنجاح

---

## Story 10.8: API المشاريع

**As a** مستثمر،  
**I want** الوصول لمعلومات المشاريع،  
**so that** يمكنني متابعة التقدم.

### Acceptance Criteria

1. إنشاء API endpoint GET /investor/projects
2. فلترة حسب الحالة (status)
3. فلترة حسب المشاريع المكتملة في 2025 (is_completed_2025)
4. إرجاع المشاريع مع:
   - المعلومات الأساسية
   - نسبة الإنجاز (completion_percentage)
   - صورة الغلاف
   - المعالم (milestones)
5. ترتيب حسب تاريخ البدء (الأحدث أولاً)
6. التحقق من موافقة NDA
7. جميع الاختبارات تمر بنجاح

---

## Story 10.9: واجهة المشاريع

**As a** مستثمر،  
**I want** واجهة لعرض المشاريع،  
**so that** يمكنني متابعة التقدم.

### Acceptance Criteria

1. إنشاء صفحة Projects في Frontend (`/app/projects`)
2. عرض المشاريع في شبكة (Grid) أو قائمة
3. كل مشروع في بطاقة مع:
   - صورة الغلاف
   - العنوان والوصف
   - شريط تقدم (progress bar) بنسبة الإنجاز
   - الحالة (قيد التنفيذ/مكتمل/متوقف)
   - تاريخ البدء والانتهاء
4. قسم منفصل للمشاريع المكتملة في 2025
5. عرض المعالم (Milestones) لكل مشروع
6. فلترة حسب الحالة
7. دعم RTL والترجمة
8. جميع الاختبارات تمر بنجاح

---

## Story 10.10: API الأخبار الحصرية

**As a** مستثمر،  
**I want** الوصول للأخبار الحصرية،  
**so that** يمكنني البقاء على اطلاع.

### Acceptance Criteria

1. تحديث جدول `news` لإضافة حقل `is_exclusive` (boolean)
2. إنشاء API endpoint GET /investor/exclusive-news
3. فلترة الأخبار الحصرية فقط (is_exclusive = true)
4. إرجاع الأخبار مع الصور والمرفقات
5. التحقق من موافقة NDA
6. Pagination
7. ترتيب حسب تاريخ النشر (الأحدث أولاً)
8. جميع الاختبارات تمر بنجاح

---

## Story 10.11: واجهة الأخبار الحصرية

**As a** مستثمر，  
**I want** واجهة لعرض الأخبار الحصرية،  
**so that** يمكنني البقاء على اطلاع.

### Acceptance Criteria

1. إنشاء صفحة Exclusive News في Frontend (`/app/exclusive-news`)
2. عرض الأخبار في قائمة مع:
   - صورة الخبر
   - العنوان والمقتطف
   - تاريخ النشر
   - زر "قراءة المزيد"
3. صفحة تفاصيل الخبر مع:
   - المحتوى الكامل (Markdown)
   - معرض الصور
   - المرفقات (إن وجدت)
4. دعم RTL والترجمة
5. جميع الاختبارات تمر بنجاح

---

## Story 10.12: API تقارير الموارد المالية الخارجية

**As a** مستثمر،  
**I want** الوصول لتقارير الموارد المالية الخارجية،  
**so that** يمكنني الاطلاع على المعلومات الخارجية.

### Acceptance Criteria

1. إنشاء API endpoint GET /investor/external-financial-resources
2. فلترة حسب نوع المورد (resource_type)
3. إرجاع الموارد مع:
   - العنوان والوصف
   - أيقونة المورد
   - اسم المصدر ورابطه
   - Presigned URL للتنزيل
4. التحقق من موافقة NDA
5. ترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
6. جميع الاختبارات تمر بنجاح

---

## Story 10.13: واجهة تقارير الموارد المالية الخارجية

**As a** مستثمر،  
**I want** واجهة لعرض الموارد المالية الخارجية،  
**so that** يمكنني الاطلاع عليها.

### Acceptance Criteria

1. إنشاء صفحة External Financial Resources في Frontend (`/app/external-resources`)
2. عرض الموارد في شبكة من الأيقونات
3. كل مورد في بطاقة مع:
   - أيقونة المورد
   - العنوان والوصف
   - اسم المصدر
   - رابط المصدر (إن وجد)
   - زر تنزيل الملف
4. فلترة حسب نوع المورد
5. بحث في العناوين
6. دعم RTL والترجمة
7. جميع الاختبارات تمر بنجاح

---

## Story 10.14: لوحة الشريك الرئيسية

**As a** مستثمر،  
**I want** لوحة رئيسية تجمع جميع الأقسام،  
**so that** يمكنني الوصول بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Partner Portal Dashboard (`/app/partner-portal`)
2. عرض الأقسام في شبكة من البطاقات:
   - ملفات الشركة الثابتة
   - التقارير المالية
   - المشاريع
   - الأخبار الحصرية
   - الموارد المالية الخارجية
3. كل بطاقة تحتوي على:
   - أيقونة القسم
   - العنوان
   - وصف مختصر
   - عدد العناصر الجديدة (إن وجد)
   - رابط للقسم
4. عرض حالة موافقة NDA
5. تذكير بالموافقة على NDA إذا لم يتم الموافقة
6. دعم RTL والترجمة
7. جميع الاختبارات تمر بنجاح

---

## Story 10.15: واجهة إدارة المحتوى للأدمن

**As a** أدمن،  
**I want** واجهة لإدارة جميع محتويات الشريك،  
**so that** يمكنني تحديثها بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Admin Partner Content في Frontend
2. تبويبات منفصلة لكل قسم:
   - الملفات الثابتة
   - التقارير المالية
   - المشاريع
   - الموارد المالية الخارجية
   - قوالب NDA
3. نماذج CRUD لكل قسم
4. رفع الملفات مع معاينة
5. إدارة الترتيب والعرض
6. تفعيل/تعطيل المحتوى
7. جميع الاختبارات تمر بنجاح

