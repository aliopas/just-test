# Epic 1: البنية الأساسية والمصادقة
## Foundation & Authentication

**Epic Goal:**  
إنشاء البنية الأساسية للمشروع مع إعداد CI/CD، وإنشاء نظام المصادقة الكامل مع OTP و2FA. هذا Epic يوفر الأساس الآمن الذي ستبنى عليه جميع الوظائف الأخرى.

---

## Story 1.1: إعداد البنية الأساسية للمشروع

**As a** مطور،  
**I want** إعداد البنية الأساسية للمشروع مع Git وCI/CD وDocker،  
**so that** يمكن البدء في التطوير بشكل منظم وآمن.

### Acceptance Criteria

1. إنشاء مستودع Git مع .gitignore مناسب
2. إعداد Supabase Project مع Supabase CLI وMCP Server
3. إعداد CI/CD pipeline (GitHub Actions) مع خطوات Build وTest
4. إعداد ESLint وPrettier للكود
5. إنشاء ملف README.md مع تعليمات التشغيل
6. إعداد متغيرات البيئة (.env.example)
7. إنشاء health-check endpoint يعيد 200 OK
8. جميع الاختبارات تمر بنجاح

---

## Story 1.2: إعداد الهوية البصرية ونظام الألوان

**As a** مصمم/مطور،  
**I want** إعداد الهوية البصرية ونظام الألوان للمنصة،  
**so that** يمكن تطبيق تصميم موحد ومتسق في جميع أنحاء المنصة.

### Acceptance Criteria

1. إنشاء ملف `src/styles/theme.ts` أو `src/styles/colors.ts` يحتوي على لوحة الألوان من PRD
2. تعريف الألوان الأساسية:
   - Primary (Bacura Blue): `#2D6FA3`
   - Primary Dark (Navy Tech): `#1E3A5F`
   - Text/Ink (Near Black): `#111418`
   - Border/Muted (Gray 400): `#9CA3AF`
   - Surface (Gray 50): `#F9FAFB`
   - Accent Success (Emerald): `#10B981`
   - Accent Warning (Amber): `#F59E0B`
   - Accent Error (Red): `#EF4444`
3. إضافة الشعار (`docs/images/logo.jpg`) إلى `src/assets/logo.jpg` أو `public/logo.jpg`
4. إنشاء مكون Logo Component قابل لإعادة الاستخدام
5. تطبيق قواعد استخدام الشعار (الحد الأدنى للحجم، المساحات الفارغة)
6. إنشاء Theme Provider أو CSS Variables للألوان
7. دعم RTL في التصميم (اتجاه العناصر حسب اللغة)
8. إنشاء ملف توثيق للهوية البصرية (`docs/design-system.md` أو قسم في `front-end-spec.md`)
9. جميع الاختبارات تمر بنجاح

---

## Story 1.3: إعداد قاعدة البيانات والهجرة مع Supabase MCP

**As a** مطور،  
**I want** إعداد قاعدة البيانات مع Supabase MCP Server،  
**so that** يمكن إدارة قاعدة البيانات والهجرات بشكل فعال.

### Acceptance Criteria

1. إعداد Supabase Project وربطه مع MCP Server
2. استخدام Supabase MCP tools (list_tables, execute_sql, apply_migration)
3. إنشاء Migration أولية باستخدام `mcp_supabase_apply_migration`
4. إنشاء جدول users مع الحقول الأساسية (id, email, phone, role, status, created_at)
5. إنشاء جدول sessions للجلسات
6. إنشاء جدول audit_logs للسجل
7. استخدام `mcp_supabase_list_tables` للتحقق من الجداول
8. إنشاء seed data للاختبار باستخدام `mcp_supabase_execute_sql`
9. جميع الاختبارات تمر بنجاح

---

## Story 1.4: تكامل Supabase Auth مع التسجيل

**As a** مطور،  
**I want** تكامل Supabase Auth مع نظام التسجيل،  
**so that** يمكن استخدام خدمات المصادقة المدمجة في Supabase.

### Acceptance Criteria

1. إعداد Supabase Auth في المشروع
2. استخدام Supabase Client للاتصال بـ Auth API
3. تكوين Email Templates في Supabase Dashboard
4. تكوين SMS Provider (إن أمكن) في Supabase
5. اختبار التسجيل عبر Supabase Auth
6. جميع الاختبارات تمر بنجاح

---

## Story 1.5: إنشاء نظام التسجيل مع OTP

**As a** مستثمر،  
**I want** التسجيل في المنصة مع تفعيل عبر OTP،  
**so that** يمكنني الوصول إلى المنصة بشكل آمن.

### Acceptance Criteria

1. إنشاء API endpoint POST /auth/register
2. التحقق من صحة البيانات (email, phone, password)
3. إرسال OTP عبر Email أو SMS
4. تخزين OTP مع expiration time
5. إنشاء API endpoint POST /auth/verify-otp
6. تفعيل الحساب بعد التحقق من OTP
7. إرسال إشعار ترحيبي بعد التفعيل
8. جميع الاختبارات تمر بنجاح

---

## Story 1.6: إنشاء نظام تسجيل الدخول مع Supabase Auth

**As a** مستثمر،  
**I want** تسجيل الدخول إلى المنصة مع Supabase Auth،  
**so that** يمكنني الوصول إلى حسابي بشكل آمن.

### Acceptance Criteria

1. استخدام Supabase Client للاتصال بـ Auth API
2. إنشاء API endpoint POST /auth/login يستخدم `supabase.auth.signInWithPassword()`
3. التحقق من credentials (email/phone + password)
4. Supabase يقوم بإنشاء JWT token تلقائياً (قصير المدى)
5. Supabase يقوم بإنشاء Refresh token تلقائياً (طويل المدى)
6. استخدام Supabase Session Management
7. إنشاء API endpoint POST /auth/refresh يستخدم `supabase.auth.refreshSession()`
8. إنشاء API endpoint POST /auth/logout يستخدم `supabase.auth.signOut()`
9. حماية endpoints بـ Supabase Auth middleware
10. استخدام `supabase.auth.getSession()` للتحقق من الجلسة
11. جميع الاختبارات تمر بنجاح

---

## Story 1.7: إضافة 2FA مع Supabase Auth

**As a** مستثمر،  
**I want** تفعيل 2FA لحسابي،  
**so that** أزيد من أمان حسابي.

### Acceptance Criteria

1. إنشاء API endpoint POST /auth/2fa/setup
2. إنشاء QR code لـ TOTP
3. إنشاء API endpoint POST /auth/2fa/verify
4. تفعيل 2FA بعد التحقق
5. طلب 2FA عند تسجيل الدخول إذا كان مفعلاً
6. إنشاء API endpoint POST /auth/2fa/disable
7. جميع الاختبارات تمر بنجاح

---

## Story 1.8: إضافة Rate Limiting وCSRF Protection

**As a** نظام،  
**I want** Rate Limiting وCSRF Protection،  
**so that** أحمي النظام من الهجمات.

### Acceptance Criteria

1. إضافة Rate Limiting على جميع endpoints (100 requests/minute)
2. إضافة CSRF Protection للواجهات
3. إضافة XSS Protection headers
4. إضافة SQL Injection protection
5. إضافة Content Security Policy (CSP)
6. جميع الاختبارات تمر بنجاح

