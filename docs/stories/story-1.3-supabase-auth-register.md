# Story 1.3: تكامل Supabase Auth مع التسجيل

## Context
- Epic: Epic 1 - البنية الأساسية والمصادقة
- Goal: ربط المشروع بـ Supabase Auth وتمكين التسجيل الأساسي كبنية تحتية للمصادقة.

## Scope
- تهيئة Supabase Auth والعميل في المشروع (Frontend/Backend حسب الحاجة)
- إعداد قوالب البريد في Supabase
- إعداد موفر SMS (اختياري)
- مسارات API أساسية للتسجيل والتحقق الأولي

## Out of Scope
- تدفق OTP الكامل (ضمن Story 1.4)
- تسجيل الدخول وإدارة الجلسات (ضمن Story 1.5)

## Dependencies
- Story 1.1 (تهيئة المشروع والبيئة)
- Story 1.2 (تهيئة قاعدة البيانات والهجرات)

## Acceptance Criteria
1. تم إعداد Supabase Client مع المفاتيح من البيئة (URL, ANON KEY)
2. تم تفعيل Supabase Auth في المشروع وربط البريد من Dashboard
3. تم تهيئة قوالب البريد الافتراضية (Sign up, Magic link) وملء بيانات From/Reply-To
4. تم إنشاء Endpoint: `POST /api/v1/auth/register` يقبل (email, phone?, password)
5. يتحقق من صحة البيانات ويرجع أخطاء واضحة عند الفشل
6. يستخدم Supabase Auth API للتسجيل (`supabase.auth.signUp`)
7. عند النجاح يرجع 201 وجسم JSON يحتوي user id/email وحالة التأكيد
8. توثيق الخطوات في README (قسم Supabase Auth)
9. اختبارات مبدئية تمر (وحدة/تكامل)

## API Contract - Registration
- Method: POST
- Path: `/api/v1/auth/register`
- Request Body (JSON):
```
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd",
  "phone": "+9665xxxxxxx" // اختياري
}
```
- Responses:
  - 201 Created
```
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "emailConfirmationSent": true
}
```
  - 400 Bad Request (validation)
```
{ "error": { "code": "VALIDATION_ERROR", "message": "email is invalid" } }
```
  - 409 Conflict (email exists)
```
{ "error": { "code": "CONFLICT", "message": "email already registered" } }
```
  - 500 Internal Error

## Validation Rules
- email: مطلوب، صيغة بريد صحيحة
- password: 8+ حروف، حروف كبيرة/صغيرة/أرقام، يفضل رموز
- phone (اختياري): E.164 إن وجد

## Implementation Notes
- إنشاء عميل Supabase:
  - Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Backend: استخدام Service Key فقط عند الحاجة وبحذر (ليس لهذه الـ Story)
- إرسال `emailRedirectTo` إن لزم لتأكيد البريد (بيئة Frontend)
- تأكد من سياسة CORS للـ API

## Tasks
- إضافة تهيئة Supabase Client (frontend/lib/supabase/client.ts)
- إضافة Endpoint `POST /api/v1/auth/register` في الـ Backend
- التحقق من body عبر Zod
- استدعاء `supabase.auth.signUp({ email, password, phone })`
- التعامل مع أخطاء Supabase وإرجاع أكواد صحيحة
- تحديث README بقسم Supabase Auth (إعدادات، قوالب البريد، المتغيرات)
- كتابة اختبار تكاملي للنهاية (supertest)

## Environment Variables
```
# Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Backend
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Definition of Done
- Endpoint يعمل ويعيد 201 عند تسجيل جديد
- فشل واضح مع 400/409 عند الإدخال الخاطئ أو التعارض
- توثيق README محدث
- اختبارات التسجيل تمر محلياً وضمن CI

## Test Cases (High-level)
- نجاح التسجيل ببريد/كلمة مرور صالحين → 201 + emailConfirmationSent=true
- بريد غير صالح → 400 VALIDATION_ERROR
- كلمة مرور ضعيفة → 400 VALIDATION_ERROR
- بريد مسجل سابقاً → 409 CONFLICT
- فشل داخلي في Supabase → 500 INTERNAL_ERROR
