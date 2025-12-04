# إعداد وتشغيل Backend Server

## 🚀 تشغيل الـ Backend Server

### الخطوة 1: الانتقال إلى مجلد Backend

```bash
cd backend
```

### الخطوة 2: تثبيت Dependencies

```bash
npm install
```

### الخطوة 3: إعداد متغيرات البيئة

أنشئ ملف `.env` في مجلد `backend` مع المحتوى التالي:

```env
# Supabase Configuration
SUPABASE_URL=https://wtvvzthfpusnqztltkkv.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3002
```

### الخطوة 4: تشغيل الـ Server

```bash
# Development mode (with hot reload)
npm run dev

# أو Production mode
npm start
```

**المنفذ المتوقع:** `3001`

### الخطوة 5: التحقق من أن الـ Server يعمل

افتح المتصفح وانتقل إلى:
```
http://localhost:3001
```

يجب أن ترى رسالة:
```json
{
  "message": "Bakurah Investors Portal API",
  "version": "1.0.0",
  "status": "ok",
  ...
}
```

## ✅ اختبار الـ API Endpoints

بعد تشغيل الـ backend، اختبر الـ endpoints:

```bash
# اختبار health endpoint
curl http://localhost:3001/api/v1/health

# اختبار market-value endpoint
curl http://localhost:3001/api/v1/public/market-value

# اختبار company-goals endpoint
curl http://localhost:3001/api/v1/public/company-goals?lang=ar
```

## 🔍 التحقق من السجلات

عند طلب البيانات، يجب أن ترى في سجلات الـ backend:

```
[Public Content Controller] Fetching market value...
[Company Content Service] Retrieved 2 market values (includeUnverified: false)
[Public Content Controller] Successfully fetched market value: 25000000 SAR
```

أو رسائل خطأ توضح المشكلة.

## 🐛 حل المشاكل الشائعة

### المشكلة 1: Port 3001 مستخدم

**الحل:**
```bash
# تغيير المنفذ في ملف .env
PORT=3003

# أو إيقاف العملية التي تستخدم المنفذ 3001
```

### المشكلة 2: خطأ في Supabase Connection

**الحل:**
- تأكد من أن `SUPABASE_SERVICE_ROLE_KEY` صحيح
- تأكد من أن `SUPABASE_URL` صحيح
- تحقق من سجلات الـ backend لمعرفة الخطأ الفعلي

### المشكلة 3: CORS Error

**الحل:**
- تأكد من أن `FRONTEND_URL` في `.env` يشير إلى `http://localhost:3002`
- تحقق من إعدادات CORS في `backend/src/middleware/security.ts`

## 📝 ملاحظات مهمة

1. **الـ Backend يجب أن يعمل قبل الـ Frontend** في وضع التطوير المحلي
2. **المنفذ الافتراضي:** `3001` للـ backend و `3002` للـ frontend
3. **الـ Rewrites في Next.js** تعمل تلقائياً في وضع التطوير لتحويل `/api/v1/*` إلى `http://localhost:3001/api/v1/*`

## ✅ التحقق من البيانات

البيانات موجودة في Supabase:
- ✅ company_profile: 6 سجلات
- ✅ company_clients: 9 سجلات  
- ✅ company_resources: 4 سجلات
- ✅ company_strengths: 6 سجلات
- ✅ partnership_info: 5 سجلات
- ✅ market_value: 2 سجلات (verified)
- ✅ company_goals: 2 سجلات

المشكلة الوحيدة هي أن الـ backend server لا يعمل. بعد تشغيله، يجب أن تعمل جميع الـ endpoints بشكل صحيح.

