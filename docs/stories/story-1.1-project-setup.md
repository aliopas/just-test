# Story 1.1: إعداد البنية الأساسية للمشروع

## Context
- Epic: Epic 1 - البنية الأساسية والمصادقة
- Goal: تجهيز المستودع، أدوات التطوير، CI/CD، وتهيئة Supabase كبنية أساسية.

## Scope
- إنشاء مستودع Git وإعداد قواعد الجودة
- إعداد أدوات التطوير والتنسيق
- إعداد CI/CD عبر GitHub Actions
- تهيئة Supabase وملفّات البيئة
- نقطة فحص صحة النظام (health-check)

## Out of Scope
- إنشاء جداول قاعدة البيانات (ضمن Story 1.2)
- بناء شاشات الواجهة الأمامية

## Dependencies
- Node.js 18+ / 20+
- حساب Supabase ومفاتيح المشروع
- GitHub repository

## Acceptance Criteria
1. مستودع Git مهيأ مع `.gitignore` مناسب (Node, logs, envs, .next, dist)
2. إعداد ESLint + Prettier مع سكربتات `lint` و`format`
3. إعداد Husky + lint-staged لتشغيل الفحوص قبل الالتزام (اختياري لكن موصى به)
4. إعداد CI/CD (GitHub Actions): يقوم بتثبيت الاعتمادات، بناء المشروع، وتشغيل الاختبارات
5. إنشاء ملف `.env.example` يغطي مفاتيح Supabase وبيئة التطبيق
6. تهيئة Supabase URL وAnon Key في بيئة التطوير
7. توفير `health-check` endpoint يعيد 200 OK وجسم JSON بسيط
8. تحديث `README.md` بتعليمات التشغيل محلياً وتشغيل الاختبارات
9. جميع خطوات الـ CI تمر بنجاح على الفرع الرئيسي

## Tasks
- إعداد Git و `.gitignore`
- تثبيت ESLint/Prettier وضبط التهيئة
- إضافة سكربتات npm: `lint`, `format`, `typecheck`, `test`
- إعداد GitHub Actions workflow: node setup, cache, build, test
- إنشاء `.env.example` وتوثيق المتغيرات
- إعداد Supabase (روابط المشروع + مفاتيح)
- إنشاء `/health` في الـ Backend وإرجاع `{ status: 'ok' }`
- تحديث `README.md`

## Environment Variables (.env.example)
```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Security
JWT_SECRET=
SESSION_SECRET=
```

## API Contract - Health Check
- Method: GET
- Path: `/api/v1/health`
- Response: `200 OK`
```
{ "status": "ok", "uptime": <number>, "timestamp": "<iso>" }
```

## Definition of Done
- قبول جميع معايير القبول
- تشغيل `npm run lint` و `npm test` بدون أخطاء
- نجاح الـ CI على الفرع الرئيسي
- توثيق تعليمات التشغيل في `README.md`

## Test Cases (High-level)
- Health check يعيد 200 وجسم JSON صحيح
- فشل الـ CI عند وجود أخطاء lint
- تمرير اختبار بسيط للـ API (supertest) لطلب `/api/v1/health`
