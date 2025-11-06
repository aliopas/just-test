# Story 1.4: نظام التسجيل مع OTP

## Context
- Epic: Epic 1 - البنية الأساسية والمصادقة
- Goal: تمكين التحقق عبر OTP بعد التسجيل لتفعيل الحساب بأمان.

## Scope
- إرسال OTP عبر البريد/الرسائل
- حفظ OTP مع مدة صلاحية ومحاولات
- Endpoint للتحقق من OTP وتفعيل الحساب

## Out of Scope
- تسجيل الدخول (Story 1.5)
- 2FA TOTP (Story 1.6)

## Dependencies
- Story 1.3 (Supabase Auth التسجيل)

## Acceptance Criteria
1. Endpoint: `POST /api/v1/auth/verify-otp` يستقبل (email, otp)
2. تخزين OTP مع `expires_at` وحد أقصى للمحاولات (مثلاً 5)
3. عند النجاح: تفعيل الحساب وإرجاع 200 + رسالة نجاح
4. عند الفشل: 400 لرمز خاطئ/منتهي، 429 عند تجاوز المحاولات
5. إرسال إشعار ترحيبي بعد التفعيل
6. اختبارات وحدة وتكامل تمر بنجاح

## Data Model (suggested)
- Table: `user_otps`
  - id (uuid), user_id (uuid), code (varchar), expires_at (timestamptz), attempts (int), created_at

## API Contract
- POST `/api/v1/auth/verify-otp`
Request:
```
{ "email": "user@example.com", "otp": "123456" }
```
Responses:
- 200 OK `{ "activated": true }`
- 400 VALIDATION_ERROR / EXPIRED_OTP / INVALID_OTP
- 429 TOO_MANY_ATTEMPTS

## Tasks
- إنشاء جدول `user_otps` وهجرة مرتبطة
- مولد OTP بطول 6 أرقام وتخزينه مع expiry (5-10 دقائق)
- إرسال البريد عبر Supabase (أو Edge Function لاحقاً)
- Endpoint التحقق، زيادة attempts، وإبطال الكود بعد النجاح/انتهاء الصلاحية
- اختبارات

## Definition of Done
- تفعيل مستخدم جديد عبر OTP يعمل نهايةً إلى نهاية
- تغطية اختبارات أساسية وتمرير CI
