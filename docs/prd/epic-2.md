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

1. إنشاء جداول `roles` و`permissions` و`role_permissions` و`user_roles` باستخدام `mcp_supabase_apply_migration` مع الحقول التالية:
   - `roles`: id (uuid, PK), slug (text, UNIQUE, lowercase), name (text), description (text), is_system (boolean, default true), created_at (timestamptz)
   - `permissions`: id (uuid, PK), slug (text, UNIQUE), name (text), description (text), category (text), created_at (timestamptz)
   - `role_permissions`: role_id (uuid, FK), permission_id (uuid, FK), grant_type (enum: allow|deny), PRIMARY KEY (role_id, permission_id)
   - `user_roles`: user_id (uuid, FK), role_id (uuid, FK), assigned_by (uuid, FK), assigned_at (timestamptz), UNIQUE (user_id, role_id)
2. تهيئة بيانات أولية باستخدام `mcp_supabase_execute_sql` تتضمن الأدوار الافتراضية Investor وAdmin مع وصف واضح لغرض كل دور.
3. تعريف مجموعة صلاحيات قياسية (مثل `investor.profile.read`, `investor.profile.update`, `admin.users.manage`, `admin.audit.read`) وربطها بالأدوار في جدول `role_permissions`.
4. إنشاء VIEW أو MATERIALIZED VIEW باسم `v_user_permissions` لتجميع صلاحيات المستخدم (الأدوار + الصلاحيات المباشرة مستقبلاً) للاستخدام من الـ middleware.
5. إنشاء دالة Postgres `fn_user_has_permission(user_id uuid, permission_slug text)` تُعيد boolean، وربطها بـ RPC `supabase.rpc('fn_user_has_permission')`.
6. تطبيق سياسات Supabase RLS على `user_roles` و`role_permissions` بحيث:
   - القراءة متاحة فقط للأدمن أو صاحب الحساب (لـ `user_roles`)
   - التعديل/الإضافة/الحذف متاح للأدمن فقط
7. بناء Middleware (`backend/src/middleware/rbac.middleware.ts`) يستخدم Supabase Auth للتحقق من الجلسة ثم يستدعي `fn_user_has_permission` أو يقوم بقراءة `v_user_permissions` مع caching لمدة 5 دقائق.
8. تحديث جميع المسارات المحمية (investor/*, admin/*) للاعتماد على الـ middleware والتأكد من أن الصلاحيات موثقة في كل Endpoint.
9. إضافة اختبارات وحدات وتكامل تغطي:
   - إنشاء الأدوار والصلاحيات
   - مستخدم بدون صلاحية يتم رفضه (403)
   - مستخدم بصلاحية صحيحة يصل إلى المسار
10. توثيق مصفوفة الأدوار/الصلاحيات في `docs/prd/rbac-matrix.md` وربطها من README (إن وُجدت).
11. جميع الاختبارات تمر بنجاح

---

## Story 2.2: إنشاء ملف شخصي للمستثمر

**As a** مستثمر،  
**I want** إنشاء وتعديل ملفي الشخصي،  
**so that** يمكنني إدارة بياناتي وتفضيلاتي.

### Acceptance Criteria

1. إنشاء جدول `investor_profiles` باستخدام `mcp_supabase_apply_migration` مع الحقول:
   - user_id (uuid, PK, FK -> users.id, ON DELETE CASCADE)
   - full_name (text), preferred_name (text)
   - id_type (enum: national_id, iqama, passport, other)
   - id_number (text, UNIQUE), id_expiry (date)
   - nationality (text, ISO-3166 alpha-2), residency_country (text), city (text)
   - kyc_status (enum: pending|in_review|approved|rejected), kyc_updated_at (timestamptz)
   - language (enum: ar|en, default ar)
   - communication_preferences (jsonb مع مفاتيح email|sms|push)
   - risk_profile (enum: conservative|balanced|aggressive, nullable)
   - kyc_documents (jsonb, nullable) لتخزين قائمة مفاتيح المستندات المرفوعة
   - created_at/updated_at (timestamptz, default now())
2. إضافة Index على `user_id` و`kyc_status` وتحضير VIEW `v_investor_profiles` للأدمن تحتوي على بيانات المستخدم الأساسية (email, phone).
3. تعريف RLS Policies:
   - المستثمر يرى/يعدل سجله فقط باستخدام `auth.uid() = user_id`
   - الأدمن يستطيع القراءة والتعديل لأغراض خدمة العملاء.
4. إنشاء Schema للتحقق من صحة البيانات في backend (`backend/src/schemas/investor-profile.schema.ts`) باستخدام Zod (أو Validator مستخدم) مع رسائل خطأ مترجمة.
5. إنشاء API endpoint `GET /investor/profile` يعتمد على `supabase.from('investor_profiles').select('*').single()` ويعيد 404 إذا لم يوجد سجل.
6. إنشاء API endpoint `PATCH /investor/profile` يدعم upsert باستخدام `supabase.from('investor_profiles').upsert(...)` ويحفظ `updated_at`.
7. دعم رفع المستندات KYC (قائمة storage keys) وتمريرها إلى Story 3 لاحقًا عبر حقل `kyc_documents` (jsonb nullable).
8. تسجيل أي تحديث على الملف الشخصي في جدول `audit_logs` مع تفاصيل التغيير والفرق (diff) في payload.
9. دعم الترجمة للعربية/الإنجليزية في الرسائل القادمة من الـ API باستخدام Localization layer (مثلاً i18next backend).
10. كتابة اختبارات Integration تغطي:
    - مستخدم بدون جلسة يحصل على 401
    - مستخدم يحاول تعديل ملف شخص آخر يحصل على 403
    - مسار PATCH يقوم بإنشاء السجل عند أول تحديث (upsert)
11. جميع الاختبارات تمر بنجاح

---

## Story 2.3: واجهة الملف الشخصي للمستثمر

**As a** مستثمر،  
**I want** واجهة لرؤية وتعديل ملفي الشخصي،  
**so that** يمكنني إدارة بياناتي بسهولة.

### Acceptance Criteria

1. إنشاء صفحة `/app/profile` في الواجهة (React + Vite) مع تقسيم إلى تبويبات: البيانات الأساسية، الهوية الشخصية، تفضيلات التواصل.
2. استدعاء `GET /investor/profile` عند التحميل باستخدام React Query ( caching + retry ) مع Skeleton Loading وEmpty State في حال عدم وجود بيانات.
3. بناء نموذج تعديل البيانات باستخدام `react-hook-form` (أو Form library المعتمدة) مع ربطه بمخطط التحقق من Story 2.2 لعرض الأخطاء inline باللغتين.
4. دعم حقول اللغة (Switch بين العربية/الإنجليزية) وتحديث الـ UI ديناميكيًا باستخدام i18n.
5. حفظ التغييرات عبر استدعاء `PATCH /investor/profile`، مع عرض مؤشر حفظ (loading state) وتعطيل الأزرار أثناء العملية.
6. عرض رسائل نجاح/خطأ عبر Toast Notifications موحدة (`useToast`) مترجمة، وتحديث الـ cache محليًا بدون إعادة تحميل الصفحة.
7. توفير مكون رفع المستندات (KYC documents) مع عرض حالة كل ملف (تم الرفع، قيد المراجعة، مرفوض مع تعليق).
8. اعتماد تصميم Responsive ودعم RTL الكامل (عكس الاتجاه، محاذاة النصوص، قلب الآيقونات) مع اختبار في لغتي العرض.
9. إضافة تتبّع أحداث UX (مثلاً Segment أو analytics المتفق عليه) عند تحديث الملف أو تغيير التفضيلات.
10. كتابة اختبارات E2E (Playwright أو Cypress) تغطي السيناريوهات الأساسية (عرض البيانات، تعديلها، رسالة النجاح، صلاحيات غير كافية).
11. جميع الاختبارات تمر بنجاح

---

## Story 2.4: إدارة المستخدمين من لوحة الأدمن

**As a** أدمن،  
**I want** إدارة المستخدمين من لوحة التحكم،  
**so that** يمكنني تعليق/تنشيط/إعادة تعيين كلمات المرور.

### Acceptance Criteria

1. إنشاء API endpoint `GET /admin/users` مع دعم:
   - Pagination (`page`, `limit` query params)
   - Filtering حسب `status`، `role`, `kyc_status`, وتاريخ التسجيل (`created_from`, `created_to`)
   - بحث نصي عن `email`, `phone`, `full_name` باستخدام `.ilike()`
   - ترتيب (`sort_by`, `order`) للحقول الشائعة
2. endpoint `GET /admin/users` يجب أن يستخدم `supabase.from('users').select(...)` مع joins على `user_roles`, `roles`, `investor_profiles`, مع Projection خفيف (no sensitive data).
3. إنشاء API endpoint `PATCH /admin/users/:id/status` يدعم الحالات (active, suspended, deactivated) مع التحقق من صلاحية الأدمن.
4. تطبيق Side Effects عند تغيير الحالة:
   - تعليق الجلسات الفعّالة للمستخدم (استدعاء Supabase Auth Admin API)
   - تسجيل الحدث في `audit_logs`
   - إرسال إشعار عبر نظام الإشعارات (Epic 6) عند الحاجة.
5. إنشاء API endpoint `POST /admin/users/:id/reset-password` يقوم:
   - باستدعاء Supabase Admin API لإرسال رابط إعادة التعيين أو توليد كلمة مرور مؤقتة
   - تسجيل التنفيذ في `audit_logs`
6. إنشاء API endpoint `POST /admin/users` يسمح للأدمن بإضافة مستخدم داخلي أو مستثمر مع الحقول (email, phone, full_name, role, status, locale) ويستدعي Story 2.6 عند اختيار الدور Investor.
7. دعم استرجاع قائمة الصلاحيات/الأدوار (`GET /admin/roles`) لإعادة استخدامها في الواجهة.
8. ضمان أن جميع Endpoints محمية بصلاحية `admin.users.manage` وتعيد 403 عند غيابها.
9. إضافة اختبارات وحدات وتكامل لتغطية حالات:
   - فلترة النتائج
   - تعليق مستخدم
   - إعادة تعيين كلمة المرور
   - إنشاء مستخدم
10. تحديث توثيق API في `docs/api/admin-users.md` مع أمثلة طلب/استجابة.
11. جميع الاختبارات تمر بنجاح

---

## Story 2.5: واجهة إدارة المستخدمين للأدمن

**As a** أدمن،  
**I want** واجهة لإدارة المستخدمين،  
**so that** يمكنني إدارتهم بسهولة.

### Acceptance Criteria

1. إنشاء صفحة `/admin/users` في الواجهة تحتوي على جدول بيانات (DataGrid) مع أعمدة: الاسم، البريد، الجوال، الدور، الحالة، تاريخ الإنشاء، آخر نشاط.
2. ربط الجدول بـ API `GET /admin/users` مع Pagination وServer-side filtering/search، مع حفظ حالة الفلاتر في URL Query Params لسهولة المشاركة.
3. توفير مكونات فلترة: dropdown للحالة، dropdown للأدوار، تاريخ من/إلى، وحقل بحث حي (debounced) للاسم/البريد.
4. إضافة أزرار سياقية لكل صف (تعليق/تنشيط، إعادة تعيين كلمة المرور، إرسال دعوة) مع حوار تأكيد (Modal) ورسائل تنبيه مترجمة.
5. إنشاء لوحة جانبية (Drawer) أو Modal لعرض تفاصيل المستخدم الكاملة (الملف الشخصي، الطلبات، السجل) باستخدام `v_investor_profiles`.
6. تطوير نموذج إنشاء مستخدم جديد (Wizard خطوة واحدة) يدعم اختيار الدور، اللغة، وإرسال دعوة مباشرة، مع رفع مستندات اختيارية للمستثمرين.
7. دمج مكونات Toast/Notification للنجاح أو الخطأ، وتحديث بيانات الجدول بمجرد إتمام أي إجراء (optimistic update أو refetch).
8. دعم dark mode وRTL بالكامل، مع اختبارات Snapshot/Visual لضمان سلامة التصميم.
9. إضافة تتبع استخدام (analytics event) عند استخدام الفلاتر أو إنشاء مستخدم جديد، لتقييم تفاعل الأدمن.
10. كتابة اختبارات E2E تغطي السيناريوهات الأساسية (الفلترة، التعليق، إعادة تعيين كلمة المرور، إنشاء مستخدم، عرض التفاصيل).
11. جميع الاختبارات تمر بنجاح

---

## Story 2.6: إنشاء مستثمر من لوحة الأدمن

**As a** أدمن،  
**I want** إنشاء مستثمر جديد يدوياً،  
**so that** يمكنني إضافة مستثمرين بناءً على عقود خارجية.

### Acceptance Criteria

1. إنشاء API endpoint POST /admin/investors
2. قبول payload يحتوي على:
   - بيانات الحساب: email (مطلوب)، phone (E.164)، full_name، preferred_language، marketing_opt_in
   - بيانات الملف الشخصي: nationality، residency_country، city، id_type، id_number، risk_profile
   - خيارات التحكم: `send_invite` (boolean)، `temporary_password` (string optional)، `status` (active|pending|suspended)
   - قائمة `documents` (array من presigned storage keys) للاحتفاظ بالوثائق الأولية
3. التحقق من صحة البيانات باستخدام Schema مشتركة (Story 2.2) مع رسائل خطأ مترجمة وتخزين الأخطاء في نظام logging.
4. استخدام Supabase Admin API `auth.admin.createUser` لإنشاء المستخدم وإسناد كلمة مرور مؤقتة أو إرسال رابط دعوة بحسب القيم الواردة.
5. إنشاء سجل في جدول `investor_profiles` تلقائيًا وربطه بالمستخدم الجديد، مع إمكانية تحديد حالة KYC الأولية (pending).
6. ربط المستخدم الجديد بدور Investor عبر إدخال في `user_roles`، وتسجيل من قام بالعملية (`assigned_by`).
7. في حال تم توفير وثائق، حفظ Metadata في جدول `attachments` وربطها بالـ user_id (أو request مستقل) لإعادة استخدامها في KYC.
8. تسجيل كل عملية في `audit_logs` مع payload كامل (masked للحقول الحساسة) بما في ذلك من نفذ العملية وزمنها.
9. إرسال إشعار للمستثمر (Email/SMS + In-App) يوضح خطوات تسجيل الدخول الأولى، وربط ذلك بـ Story 6 (نظام الإشعارات).
10. إعادة استجابة تحتوي على تفاصيل المستخدم الجديد، حالة الدعوة، ورابط التفعيل (إن وجد) ليتم عرضها للأدمن.
11. كتابة اختبارات Integration تضمن:
    - عدم السماح بإنشاء مستخدم مكرر (email أو phone موجود)
    - فشل إنشاء المستخدم يتم التراجع عنه (transaction rollback)
    - نجاح تدفق إرسال الدعوة/الكلمة المؤقتة
12. جميع الاختبارات تمر بنجاح

