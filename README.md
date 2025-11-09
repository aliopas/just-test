# منصة باكورة الاستثمارية
## Bakurah Investors Portal

منصة استثمارية شاملة لإدارة طلبات الاستثمار والمستثمرين.

---

## 🚀 البدء السريع

### المتطلبات

- Node.js 18+ أو 20+ LTS
- npm أو pnpm
- حساب Supabase (للحصول على مفاتيح المشروع)

### التثبيت

```bash
# تثبيت الاعتمادات
npm install

# نسخ ملف البيئة
cp .env.example .env

# ملء متغيرات البيئة في .env
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### التشغيل

```bash
# وضع التطوير (Backend)
npm run dev

# البناء
npm run build

# التشغيل (Production)
npm start
```

### الاختبارات

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع Coverage
npm run test:coverage

# تشغيل الاختبارات في وضع Watch
npm run test:watch
```

### Code Quality

```bash
# فحص الكود (Lint)
npm run lint

# تنسيق الكود (Format)
npm run format

# فحص الأنواع (Type Check)
npm run typecheck
```

---

## 📁 هيكل المشروع

```
invastors-bacura/
├── backend/          # Express.js Backend
│   ├── src/
│   │   ├── routes/   # API Routes
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   └── tests/
├── frontend/         # Design system assets & UI building blocks
│   └── src/
│       ├── components/
│       ├── styles/
│       └── assets/
├── docs/             # Documentation
│   ├── prd/         # PRD and Epics
│   ├── architecture/
│   └── stories/
└── supabase/         # Supabase configuration
```

---

## 🔧 متغيرات البيئة

انظر `.env.example` للحصول على قائمة كاملة بمتغيرات البيئة المطلوبة.

### متغيرات Supabase

- `SUPABASE_URL` - رابط مشروع Supabase
- `SUPABASE_ANON_KEY` - المفتاح العام (Anonymous Key)
- `SUPABASE_SERVICE_ROLE_KEY` - مفتاح الخدمة (Service Role Key)

### متغيرات التطبيق

- `NODE_ENV` - بيئة التطبيق (development/production)
- `PORT` - منفذ الخادم (افتراضي: 3001)
- `API_BASE_URL` - رابط API الأساسي

### متغيرات الأمان

- `JWT_SECRET` - سر JWT
- `SESSION_SECRET` - سر الجلسة
- `CORS_ORIGINS` - قائمة أصول موثوقة مفصولة بفواصل (افتراضي: `http://localhost:3000`)
- `ENABLE_CSRF` - تفعيل حماية CSRF عبر cookies (ضع `true` لتمكينها في بيئات تستخدم cookies)

---

## 🧪 الاختبارات

المشروع يستخدم Jest وSupertest للاختبارات.

```bash
# تشغيل جميع الاختبارات
npm test

# اختبار محدد
npm test -- health.test.ts
```

> **تنبيه:** تتطلب اختبارات المصادقة وجود المتغير `SUPABASE_SERVICE_ROLE_KEY` لكي تتمكن الخدمات من الكتابة إلى الجداول المحمية بـ RLS.

---

## 📚 الوثائق

- **PRD:** `docs/prd.md`
- **Epics:** `docs/prd/epic-*.md`
- **Architecture:** `docs/architecture/`
- **Stories:** `docs/stories/`
- **Story 2.3 (Investor Profile UI):** `docs/stories/STORY_2.3_COMPLETION.md`
- **Story 3.1–3.8 (Requests Backend & Investor Tracking):** `docs/stories/STORY_3.1_COMPLETION.md`, `STORY_3.2_COMPLETION.md`, `STORY_3.3_COMPLETION.md`, `STORY_3.5_COMPLETION.md`, `STORY_3.6_COMPLETION.md`, `STORY_3.7_COMPLETION.md`, `STORY_3.8_COMPLETION.md`
- **Story 4.1 (Admin Requests Inbox API):** `docs/stories/STORY_4.1_COMPLETION.md`
- **Story 4.2 (Admin Requests Inbox UI):** `docs/stories/STORY_4.2_COMPLETION.md`
- **Story 4.3 (Admin Request Detail View):** `docs/stories/STORY_4.3_COMPLETION.md`
- **Story 4.4 (Admin Request Decision APIs & UI):** `docs/stories/STORY_4.4_COMPLETION.md`
- **Story 4.5 (Admin Request Info Workflow):** `docs/stories/STORY_4.5_COMPLETION.md`
- **Story 4.6 (Admin Internal Comments):** `docs/stories/STORY_4.6_COMPLETION.md`
- **Story 4.7 (Settlement Workflow):** `docs/stories/STORY_4.7_COMPLETION.md`
- **Story 5.1 (News Schema):** `docs/stories/STORY_5.1_COMPLETION.md`
- **Story 5.2 (News CRUD API):** `docs/stories/STORY_5.2_COMPLETION.md`
- **Design System:** `docs/design-system.md` (مع ملفات `frontend/src/styles/theme.ts` و`frontend/src/components/Logo.tsx`)
- **Supabase Integration:** `docs/SUPABASE_INTEGRATION.md`
- **RBAC Matrix:** `docs/prd/rbac-matrix.md`

---

## 🔗 API Endpoints

### Health Check

```
GET /api/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "uptime": 123,
  "timestamp": "2024-11-06T10:00:00.000Z"
}
```

### Authentication

#### Register

```
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd",
  "phone": "+9665xxxxxxx" // optional
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "emailConfirmationSent": true
}
```

**Error Responses:**

- **400 Bad Request (Validation Error):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

- **409 Conflict (Email Already Registered):**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, and number
- `phone`: Optional, must be in E.164 format (e.g., +9665xxxxxxx)

#### Verify OTP

```
POST /api/v1/auth/verify-otp
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "activated": true,
  "message": "Account activated successfully"
}
```

**Error Responses:**

- **400 Bad Request (Invalid OTP):**
```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "Invalid or expired OTP"
  }
}
```

- **429 Too Many Requests (Max Attempts Exceeded):**
```json
{
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Maximum OTP verification attempts exceeded"
  }
}
```

- **404 Not Found (User Not Found):**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `otp`: Required, exactly 6 digits

#### Resend OTP

```
POST /api/v1/auth/resend-otp
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "OTP resent successfully",
  "expiresAt": "2024-11-06T10:10:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request (Validation Error):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [...]
  }
}
```

- **404 Not Found (User Not Found):**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Validation Rules:**
- `email`: Required, valid email format

#### Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd"
}
```

**Success Response (200):**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

**Error Responses:**
- 401 INVALID_CREDENTIALS

#### Refresh Session

```
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{ "refresh_token": "<refresh_token>" }
```

**Success Response (200):**
```json
{
  "session": { "access_token": "...", "refresh_token": "..." },
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

**Error Responses:**
- 401 INVALID_REFRESH_TOKEN

#### Logout

```
POST /api/v1/auth/logout
```

- 204 No Content (العميل يقوم بمسح الرموز محلياً)

#### 2FA TOTP

##### Setup 2FA

```
POST /api/v1/auth/2fa/setup
```

**Headers:** `Authorization: Bearer <access_token>`

**Success Response (200):**
```json
{
  "secret": "base32_secret",
  "otpauthUrl": "otpauth://totp/...",
  "qr": "data:image/png;base64,..."
}
```

**Error Responses:**
- 401 UNAUTHORIZED (User not authenticated)
- 400 ALREADY_ENABLED (2FA already enabled)

##### Verify 2FA

```
POST /api/v1/auth/2fa/verify
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "token": "123456",
  "secret": "base32_secret"
}
```

**Success Response (200):**
```json
{
  "enabled": true,
  "message": "2FA enabled successfully"
}
```

**Error Responses:**
- 401 UNAUTHORIZED (User not authenticated)
- 400 INVALID_TOTP_TOKEN (Invalid token)
- 400 VALIDATION_ERROR (Missing token/secret)

##### Disable 2FA

```
POST /api/v1/auth/2fa/disable
```

**Headers:** `Authorization: Bearer <access_token>`

**Success Response (200):**
```json
{
  "disabled": true,
  "message": "2FA disabled successfully"
}
```

**Error Responses:**
- 401 UNAUTHORIZED (User not authenticated)
- 400 NOT_ENABLED (2FA not enabled)

##### Login with 2FA

```
POST /api/v1/auth/login
```

**Request Body (when 2FA is enabled):**
```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd",
  "totpToken": "123456"
}
```

**Response (200) - 2FA Required:**
```json
{
  "requires2FA": true,
  "message": "2FA token required"
}
```

**Response (200) - Success:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

**Error Responses:**
- 401 INVALID_TOTP_TOKEN (Invalid 2FA token)

---

## 🛠️ التطوير

### إعداد Supabase

1. إنشاء مشروع جديد في [Supabase](https://supabase.com)
2. الحصول على `SUPABASE_URL` و`SUPABASE_ANON_KEY` من Settings > API
3. الحصول على `SUPABASE_SERVICE_ROLE_KEY` من Settings > API (Service Role)
4. إضافة المفاتيح إلى `.env`

### إعداد Supabase Auth

1. **تفعيل Email Auth:**
   - اذهب إلى Authentication > Providers في Supabase Dashboard
   - تأكد من تفعيل "Email" provider

2. **إعداد قوالب البريد:**
   - اذهب إلى Authentication > Email Templates
   - قم بتخصيص قوالب "Sign up" و"Magic link" حسب الحاجة
   - تأكد من ملء بيانات "From" و"Reply-To"

3. **إعداد Email Redirect (اختياري):**
   - أضف `EMAIL_REDIRECT_TO` إلى `.env` إذا كنت تريد توجيه المستخدمين بعد تأكيد البريد
   - مثال: `EMAIL_REDIRECT_TO=http://localhost:3000/auth/confirm`

4. **التحقق من الإعدادات:**
   - تأكد من أن `SUPABASE_URL` و`SUPABASE_ANON_KEY` موجودة في `.env`
   - شغّل الاختبارات: `npm test -- auth.test.ts`

### CI/CD

المشروع يستخدم GitHub Actions للـ CI/CD. الـ workflow موجود في `.github/workflows/ci.yml`.

### النشر على Netlify

المشروع جاهز للنشر على Netlify. راجع `NETLIFY_DEPLOYMENT.md` للحصول على دليل شامل.

**ملخص سريع:**
1. تأكد من تثبيت الاعتمادات: `npm install`
2. أضف متغيرات البيئة في Netlify Dashboard
3. اربط المشروع مع GitHub repository
4. Netlify سيقوم بالبناء والنشر تلقائياً

**ملفات التكوين:**
- `netlify.toml` - تكوين Netlify
- `netlify/functions/server.ts` - Netlify Function wrapper

---

## 📝 الترخيص

ISC

---

## 👥 المساهمون

---

**ملاحظة:** هذا المشروع في مرحلة التطوير النشط.

---

## 🔌 Supabase MCP Steps

لإعداد قاعدة البيانات عبر MCP:

1) تطبيق الهجرات:
- `supabase/migrations/20241106000000_initial_core.sql`
- `supabase/migrations/20241106000001_business_core.sql`

2) الأوامر (عبر MCP):
```
# قائمة الجداول
mcp_supabase_list_tables()

# تطبيق هجرة
mcp_supabase_apply_migration(name="20241106000000_initial_core", query=FILE_CONTENTS)

# Seed
mcp_supabase_execute_sql(query=FILE_CONTENTS_OF_SEED)
```

3) راجع الدليل الكامل: `docs/SUPABASE_MCP_STEPS.md`

---

## 🔒 Security

- Rate Limiting:
  - Global: 200 req / 15 min per IP
  - Auth routes: 10 req / min per IP
- HTTP Headers: Helmet enabled with CSP (self, data: for images)
- CORS: configurable via `CORS_ORIGINS` (comma-separated)
- HPP: HTTP Parameter Pollution protection enabled
- CSRF (اختياري): فعّل عبر `ENABLE_CSRF=true` (يتطلب cookies)

### Environment
```
CORS_ORIGINS=http://localhost:3000
ENABLE_CSRF=false
```

