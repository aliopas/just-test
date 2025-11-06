# Story 1.5: تسجيل الدخول/تحديث الجلسة/تسجيل الخروج (Supabase Auth)

## Context
- Epic: Epic 1 - البنية الأساسية والمصادقة
- Goal: تمكين تسجيل الدخول وإدارة الجلسات (JWT + Refresh) عبر Supabase Auth.

## Scope
- Endpoint لتسجيل الدخول
- Endpoint لتحديث الجلسة
- Endpoint لتسجيل الخروج
- Middleware للتحقق من الجلسة

## Out of Scope
- 2FA TOTP (Story 1.6)

## Dependencies
- Story 1.3 (التسجيل)
- Story 1.4 (تفعيل الحساب عبر OTP)

## Acceptance Criteria
1. Endpoint: `POST /api/v1/auth/login` يستخدم `supabase.auth.signInWithPassword()`
2. التحقق من البريد/الهاتف + كلمة المرور وإرجاع 200 مع session info (آمن عبر HttpOnly cookie إذا أمكن)
3. Endpoint: `POST /api/v1/auth/refresh` يستخدم `supabase.auth.refreshSession()` لإصدار Access token جديد
4. Endpoint: `POST /api/v1/auth/logout` يستخدم `supabase.auth.signOut()` وإبطال الجلسة
5. Middleware `authGuard` يتحقق من الجلسة قبل الوصول للـ protected routes
6. اختبارات تكامل للـ endpoints الثلاثة

## API Contracts
- POST `/api/v1/auth/login`
Request:
```
{ "email": "user@example.com", "password": "StrongP@ssw0rd" }
```
Response 200:
```
{ "user": {"id":"uuid","email":"user@example.com"}, "expiresIn": 3600 }
```

- POST `/api/v1/auth/refresh`
Request: (Cookie/Authorization as applicable)
Response 200: `{ "refreshed": true }`

- POST `/api/v1/auth/logout`
Response 200: `{ "loggedOut": true }`

## Implementation Notes
- حفظ الـ Access/Refresh Tokens في Cookies (HttpOnly + Secure) على الخادم إن أمكن
- على الواجهة الأمامية، استخدام Supabase client لإدارة الجلسة عند الحاجة
- الحرص على CORS وSameSite للكوكيز

## Tasks
- إنشاء endpoints المذكورة
- auth middleware للتحقق من Authorization header أو Cookie
- التعامل مع أخطاء Supabase وإرجاع أكواد ملائمة
- اختبارات (supertest) لتدفق login→refresh→logout

## Definition of Done
- تدفق login/refresh/logout يعمل بلا أخطاء
- تغطية اختبارات أساسية وتمرير CI
