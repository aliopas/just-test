# Epic 9: الصفحة الرئيسية العامة
## Public Landing Page

**Epic Goal:**  
إنشاء صفحة رئيسية شاملة للعامة تحتوي على بروفايل الشركة، نموذج العمل التجاري، الموارد المالية، نقاط القوة، كيفية الشراكة، القيمة السوقية، والأهداف العامة. كل قسم في أيقونة خاصة.

---

## Story 9.1: إنشاء جداول المحتوى العام

**As a** نظام،  
**I want** جداول قاعدة البيانات للمحتوى العام،  
**so that** يمكن تخزين محتوى الصفحة الرئيسية.

### Acceptance Criteria

1. إنشاء جداول `company_profile`, `company_partners`, `company_clients`, `company_resources`, `company_strengths`, `partnership_info`, `market_value`, `company_goals` باستخدام `mcp_supabase_apply_migration`
2. جدول `company_profile`: (id, title_ar, title_en, content_ar, content_en, icon_key, display_order, is_active, created_at, updated_at)
3. جدول `company_partners`: (id, name_ar, name_en, logo_key, description_ar, description_en, website_url, display_order, created_at, updated_at)
4. جدول `company_clients`: (id, name_ar, name_en, logo_key, description_ar, description_en, display_order, created_at, updated_at)
5. جدول `company_resources`: (id, title_ar, title_en, description_ar, description_en, icon_key, value, currency, display_order, created_at, updated_at)
6. جدول `company_strengths`: (id, title_ar, title_en, description_ar, description_en, icon_key, display_order, created_at, updated_at)
7. جدول `partnership_info`: (id, title_ar, title_en, content_ar, content_en, steps_ar, steps_en, icon_key, display_order, created_at, updated_at)
8. جدول `market_value`: (id, value, currency, valuation_date, source, is_verified, verified_at, created_at, updated_at)
9. جدول `company_goals`: (id, title_ar, title_en, description_ar, description_en, target_date, icon_key, display_order, created_at, updated_at)
10. إنشاء indexes للبحث السريع في Supabase
11. إعداد Foreign Keys والعلاقات
12. استخدام Supabase RLS Policies (قراءة عامة، كتابة للأدمن فقط)
13. جميع الاختبارات تمر بنجاح

---

## Story 9.2: API إدارة المحتوى العام

**As a** أدمن،  
**I want** إنشاء وتعديل المحتوى العام،  
**so that** يمكنني إدارة محتوى الصفحة الرئيسية.

### Acceptance Criteria

1. إنشاء API endpoints CRUD لجميع الجداول:
   - POST /admin/company-profile
   - GET /admin/company-profile
   - PATCH /admin/company-profile/:id
   - DELETE /admin/company-profile/:id
   - (نفس الشيء لباقي الجداول)
2. التحقق من الصلاحيات (Admin فقط)
3. دعم Markdown في حقول المحتوى
4. دعم رفع الأيقونات والصور إلى Supabase Storage
5. التحقق من صحة البيانات (العناوين، المحتوى، الترتيب)
6. جميع الاختبارات تمر بنجاح

---

## Story 9.3: API عرض المحتوى العام للزوار

**As a** زائر،  
**I want** رؤية محتوى الصفحة الرئيسية،  
**so that** يمكنني التعرف على الشركة.

### Acceptance Criteria

1. إنشاء API endpoints للقراءة العامة:
   - GET /public/company-profile
   - GET /public/company-partners
   - GET /public/company-clients
   - GET /public/company-resources
   - GET /public/company-strengths
   - GET /public/partnership-info
   - GET /public/market-value
   - GET /public/company-goals
2. إرجاع المحتوى حسب اللغة (ar/en) من query parameter
3. فلترة المحتوى النشط فقط (is_active = true)
4. ترتيب حسب display_order
5. لا يتطلب مصادقة (public endpoints)
6. جميع الاختبارات تمر بنجاح

---

## Story 9.4: واجهة الصفحة الرئيسية العامة

**As a** زائر،  
**I want** واجهة جذابة للصفحة الرئيسية،  
**so that** يمكنني التعرف على الشركة بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Landing Page في Frontend (`/` أو `/home`)
2. تصميم responsive وجذاب مع دعم RTL
3. عرض الأقسام في شبكة من الأيقونات:
   - بروفايل تعريفي عن الشركة
   - عملائنا وشركائنا (مع شعارات)
   - نموذج العمل التجاري
   - الموارد المالية (مع القيم)
   - نقاط قوة الشركة
   - كيف تكون شريك في باكورة (مع خطوات)
   - القيمة السوقية المعتمدة (مع تاريخ التحقق)
   - الأهداف العامة (مع تواريخ مستهدفة)
4. كل قسم في بطاقة (Card) مع أيقونة
5. دعم التبديل بين العربية والإنجليزية
6. عرض الأخبار/الإعلانات المختصرة (من Epic 5)
7. زر تسجيل مستثمر بارز
8. جميع الاختبارات تمر بنجاح

---

## Story 9.5: واجهة إدارة المحتوى العام للأدمن

**As a** أدمن،  
**I want** واجهة لإدارة المحتوى العام،  
**so that** يمكنني تحديث الصفحة الرئيسية بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Admin Company Content في Frontend
2. تبويبات منفصلة لكل قسم (Profile, Partners, Clients, Resources, etc.)
3. نماذج إنشاء/تعديل لكل قسم
4. رفع الأيقونات والصور مع معاينة
5. إدارة الترتيب (drag & drop أو أرقام)
6. تفعيل/تعطيل المحتوى
7. معاينة المحتوى قبل الحفظ
8. دعم Markdown editor
9. جميع الاختبارات تمر بنجاح

---

## Story 9.6: إدارة القيمة السوقية

**As a** أدمن،  
**I want** إدارة القيمة السوقية المعتمدة،  
**so that** يمكنني تحديثها عند الحاجة.

### Acceptance Criteria

1. إنشاء واجهة خاصة لإدارة القيمة السوقية
2. إدخال القيمة والعملة وتاريخ التقييم
3. إدخال المصدر (مؤسسة التقييم)
4. خيار التحقق (is_verified) مع تاريخ التحقق
5. عرض القيمة الحالية في الصفحة الرئيسية مع مؤشر التحقق
6. سجل التغييرات (audit log)
7. جميع الاختبارات تمر بنجاح

---

## Story 9.7: إدارة الشركاء والعملاء

**As a** أدمن،  
**I want** إدارة قائمة الشركاء والعملاء،  
**so that** يمكنني تحديثها بسهولة.

### Acceptance Criteria

1. إنشاء واجهة لإدارة الشركاء والعملاء
2. إضافة/تعديل/حذف شريك/عميل
3. رفع شعارات الشركاء/العملاء
4. إدخال الاسم والوصف (عربي/إنجليزي)
5. رابط الموقع (للشركاء)
6. ترتيب العرض
7. عرض الشعارات في الصفحة الرئيسية
8. جميع الاختبارات تمر بنجاح

---

## Story 9.8: قسم "كيف تكون شريك في باكورة"

**As a** أدمن،  
**I want** إدارة محتوى قسم الشراكة،  
**so that** يمكنني توضيح خطوات الشراكة.

### Acceptance Criteria

1. إنشاء واجهة لإدارة محتوى الشراكة
2. إدخال العنوان والمحتوى (عربي/إنجليزي)
3. إدخال خطوات الشراكة (قائمة خطوات)
4. رفع أيقونة القسم
5. عرض الخطوات بشكل منظم في الصفحة الرئيسية
6. ربط مع صفحة التسجيل
7. جميع الاختبارات تمر بنجاح

