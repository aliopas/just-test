# Story 1.6: تفعيل المصادقة الثنائية (2FA) باستخدام TOTP

## Context
- Epic: Epic 1 - البنية الأساسية والمصادقة
- Goal: تمكين المستخدم من تفعيل 2FA (TOTP) والتحقق عند الدخول.

## Scope
- إنشاء مسارات إعداد/تحقق/تعطيل 2FA
- تخزين سر TOTP وتحديث حالة المستخدم

## Out of Scope
- تدفق OTP للتسجيل (Story 1.4)

## Dependencies
- Story 1.5 (تسجيل الدخول)

## Acceptance Criteria
1. Endpoint: `POST /api/v1/auth/2fa/setup` يرجع `otpauth://` + qr data (و/أو svg/png) + secret
2. Endpoint: `POST /api/v1/auth/2fa/verify` يستقبل `token` ويُفعّل 2FA عند صحة الرمز
3. Endpoint: `POST /api/v1/auth/2fa/disable` لتعطيل 2FA بعد تحقق بسيط
4. عند تسجيل الدخول وكان 2FA مفعل: يطلب التحقق بـ token إضافي قبل إصدار session نهائية
5. تخزين `mfa_enabled=true` و`mfa_secret` مشفر/محمّي
6. اختبارات تغطي التدفق بالكامل

## API Contracts
- POST `/api/v1/auth/2fa/setup`
Response 200:
```
{ "secret": "base32", "otpauthUrl": "otpauth://...", "qr": "data:image/png;base64,..." }
```

- POST `/api/v1/auth/2fa/verify`
Request:
```
{ "token": "123456" }
```
Response 200: `{ "enabled": true }`

- POST `/api/v1/auth/2fa/disable`
Response 200: `{ "disabled": true }`

## Implementation Notes
- استخدام مكتبة TOTP (مثل `otplib`) لتوليد/التحقق
- حماية سر TOTP (تشفير/كتم في السجلات)
- تصميم الجلسة على مرحلتين: pre-2FA → post-2FA

## Tasks
- إنشاء endpoints الثلاثة
- توليد secret + otpauth url + qr
- التحقق من token وتفعيل/تعطيل الحالة
- تحديث نموذج المستخدم وتخزين آمن للسر
- اختبارات

## Definition of Done
- تفعيل/تعطيل 2FA يعمل ويجتاز الاختبارات
- تدفق تسجيل الدخول يرفض بدون رمز صحيح عند تفعيل 2FA
