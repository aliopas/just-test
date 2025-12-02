# API Proxy Troubleshooting Guide

## المشكلة المستمرة (Persistent Issue)

إذا كانت طلبات API لا زالت تفشل بعد إنشاء Route Handler، اتبع الخطوات التالية:

## الخطوة 1: التحقق من أن Backend يعمل

```bash
# في terminal منفصل
npm run dev

# يجب أن ترى:
# Server is running on port 3001
```

اختبر Backend مباشرة:
```bash
curl http://localhost:3001/api/v1/health
```

يجب أن تحصل على:
```json
{"status":"ok","version":"1.0.0"}
```

## الخطوة 2: التحقق من أن Frontend يعمل

```bash
cd frontend
npm run dev

# يجب أن ترى:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3002
```

## الخطوة 3: التحقق من Console Logs

افتح Developer Tools (F12) في المتصفح وتحقق من:

1. **Console Tab**: ابحث عن أي أخطاء
2. **Network Tab**: 
   - افتح طلب API فاشل
   - تحقق من:
     - **Request URL**: يجب أن يكون `http://localhost:3002/api/v1/...`
     - **Status**: إذا كان 500، اقرأ Response Body

## الخطوة 4: التحقق من Route Handler Logs

في terminal حيث يعمل Frontend، يجب أن ترى logs مثل:
```
[API Proxy] GET request received: /api/v1/public/company-profile
[API Proxy] GET /api/v1/public/company-profile -> http://localhost:3001/api/v1/public/company-profile
[API Proxy] Response: 200 OK from http://localhost:3001/api/v1/public/company-profile
```

إذا لم ترَ هذه الـ logs، فهذا يعني أن Route Handler لا يتم استدعاؤه.

## الخطوة 5: اختبار Route Handler مباشرة

اختبر Route Handler مباشرة في المتصفح:
```
http://localhost:3002/api/v1/health
```

يجب أن تحصل على نفس النتيجة مثل:
```
http://localhost:3001/api/v1/health
```

## الأخطاء الشائعة (Common Errors)

### Error 1: "Cannot connect to backend server"

**السبب**: Backend لا يعمل أو على port مختلف

**الحل**:
1. تأكد من أن Backend يعمل على port 3001
2. تحقق من `NEXT_PUBLIC_API_BASE_URL` في `.env` files

### Error 2: Route Handler لا يتم استدعاؤه

**السبب**: قد تكون هناك مشكلة في Next.js routing

**الحل**:
1. تأكد من أن الملف موجود في `frontend/app/api/v1/[...path]/route.ts`
2. أعد تشغيل Frontend server
3. تأكد من أن middleware لا يحجب الطلبات

### Error 3: CORS Error

**السبب**: Backend لا يسمح بـ CORS requests

**الحل**: Route Handler يضيف CORS headers تلقائياً، لكن تأكد من أن Backend يسمح بـ requests من Frontend

## Debugging Steps

### 1. تفعيل Detailed Logging

في `frontend/app/api/v1/[...path]/route.ts`، تأكد من أن logging مفعل:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(`[API Proxy] ${request.method} ${request.nextUrl.pathname} -> ${fullUrl}`);
}
```

### 2. اختبار Backend مباشرة

```bash
curl http://localhost:3001/api/v1/public/company-profile?lang=ar
```

### 3. اختبار Frontend Proxy

```bash
curl http://localhost:3002/api/v1/public/company-profile?lang=ar
```

يجب أن تحصل على نفس النتيجة.

## الحل البديل (Alternative Solution)

إذا كان Route Handler لا يعمل، يمكن استخدام rewrites مباشرة:

```javascript
// frontend/next.config.js
async rewrites() {
  const isNetlify = 
    process.env.NETLIFY === 'true' || 
    process.env.CONTEXT === 'production';
  
  if (isNetlify) {
    return [];
  }
  
  return [
    {
      source: '/api/v1/:path*',
      destination: 'http://localhost:3001/api/v1/:path*',
    },
  ];
},
```

**ملاحظة**: rewrites في Next.js قد لا تعمل بشكل موثوق في بعض الحالات.

## الحصول على المساعدة

إذا استمرت المشكلة:

1. افتح Developer Tools (F12)
2. اذهب إلى Network tab
3. افتح طلب API فاشل
4. انسخ:
   - Request URL
   - Status Code
   - Response Body
5. شارك هذه المعلومات للتحليل

