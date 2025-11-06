# Epic 2: إدارة المستخدمين والملفات الشخصية
## User Management & Profiles

**Epic Goal:**  
إنشاء نظام إدارة المستخدمين الكامل مع الملفات الشخصية، الصلاحيات (RBAC)، وإدارة الأدمن للمستخدمين. هذا Epic يوفر الأساس لإدارة المستخدمين والصلاحيات.

---

## Story 2.1: إنشاء نظام الصلاحيات (RBAC)

**As a** نظام،  
**I want** نظام صلاحيات دقيق (RBAC)،  
**so that** يمكن التحكم في الوصول بشكل آمن.

### Acceptance Criteria

1. إنشاء جداول roles وpermissions وrole_permissions باستخدام `mcp_supabase_apply_migration`
2. الأدوار: Investor, Admin
3. إنشاء جدول user_roles لربط المستخدمين بالأدوار
4. استخدام Supabase RLS Policies للتحقق من الصلاحيات
5. إنشاء middleware للتحقق من الصلاحيات باستخدام Supabase Auth
6. استخدام `supabase.from('user_roles').select()` للتحقق من أدوار المستخدم
7. حماية جميع endpoints بالصلاحيات المناسبة
8. جميع الاختبارات تمر بنجاح

---

## Story 2.2: إنشاء ملف شخصي للمستثمر

**As a** مستثمر،  
**I want** إنشاء وتعديل ملفي الشخصي،  
**so that** يمكنني إدارة بياناتي وتفضيلاتي.

### Acceptance Criteria

1. إنشاء جدول investor_profiles باستخدام `mcp_supabase_apply_migration` مع الحقول (user_id, id_type, id_number, nationality, kyc_status, language)
2. استخدام Supabase Client للاستعلامات
3. إنشاء API endpoint GET /investor/profile يستخدم `supabase.from('investor_profiles').select()`
4. إنشاء API endpoint PATCH /investor/profile يستخدم `supabase.from('investor_profiles').update()`
5. التحقق من صحة البيانات المدخلة
6. دعم اللغة (عربي/إنجليزي)
7. حفظ تفضيلات التواصل
8. استخدام Row Level Security (RLS) في Supabase لحماية البيانات
9. جميع الاختبارات تمر بنجاح

---

## Story 2.3: واجهة الملف الشخصي للمستثمر

**As a** مستثمر،  
**I want** واجهة لرؤية وتعديل ملفي الشخصي،  
**so that** يمكنني إدارة بياناتي بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Profile في Frontend
2. عرض البيانات الحالية
3. نموذج تعديل البيانات
4. التحقق من صحة البيانات في Frontend
5. حفظ التغييرات
6. عرض رسائل نجاح/خطأ
7. دعم RTL للعربية
8. جميع الاختبارات تمر بنجاح

---

## Story 2.4: إدارة المستخدمين من لوحة الأدمن

**As a** أدمن،  
**I want** إدارة المستخدمين من لوحة التحكم،  
**so that** يمكنني تعليق/تنشيط/إعادة تعيين كلمات المرور.

### Acceptance Criteria

1. إنشاء API endpoint GET /admin/users مع pagination وfiltering
2. إنشاء API endpoint PATCH /admin/users/:id/status (suspend/activate)
3. إنشاء API endpoint POST /admin/users/:id/reset-password
4. إنشاء API endpoint POST /admin/users (إنشاء مستخدم جديد)
5. تسجيل جميع الإجراءات في audit_logs
6. جميع الاختبارات تمر بنجاح

---

## Story 2.5: واجهة إدارة المستخدمين للأدمن

**As a** أدمن،  
**I want** واجهة لإدارة المستخدمين،  
**so that** يمكنني إدارتهم بسهولة.

### Acceptance Criteria

1. إنشاء صفحة Users Management في Frontend
2. عرض قائمة المستخدمين مع pagination
3. فلترة حسب الحالة والدور
4. أزرار تعليق/تنشيط/إعادة تعيين كلمة المرور
5. نموذج إنشاء مستخدم جديد
6. عرض تفاصيل المستخدم
7. جميع الاختبارات تمر بنجاح

---

## Story 2.6: إنشاء مستثمر من لوحة الأدمن

**As a** أدمن،  
**I want** إنشاء مستثمر جديد يدوياً،  
**so that** يمكنني إضافة مستثمرين بناءً على عقود خارجية.

### Acceptance Criteria

1. إنشاء API endpoint POST /admin/investors
2. إدخال البيانات الأساسية (الاسم، الجوال، البريد، الدولة، المدينة، نوع الحساب)
3. تحديد كلمة مرور مؤقتة أو إرسال رابط تفعيل
4. رفع الوثائق (اختياري)
5. تعيين الدور "Investor"
6. تفعيل الحساب مباشرة أو انتظار التأكيد
7. إرسال إشعار للمستثمر
8. جميع الاختبارات تمر بنجاح

