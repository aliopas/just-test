# Fix: API Proxy Route Handler for Local Development

## المشكلة (Problem)

عند تشغيل التطبيق محلياً (localhost)، كانت طلبات API تفشل بـ 500 Internal Server Error لأن:
- Next.js rewrites لم تكن تعمل بشكل موثوق في development mode
- الطلبات كانت تذهب إلى `http://localhost:3002/api/v1/...` (Frontend) بدلاً من `http://localhost:3001/api/v1/...` (Backend)
- الـ rewrites في `next.config.js` لم تكن تعيد التوجيه بشكل صحيح

## الحل (Solution)

تم إنشاء Next.js API Route Handler في `frontend/app/api/v1/[...path]/route.ts` لمعالجة جميع طلبات API وإعادة توجيهها إلى Backend.

### كيف يعمل الحل:

1. **API Route Handler**: 
   - يتم إنشاء route handler في `frontend/app/api/v1/[...path]/route.ts`
   - يعالج جميع طلبات HTTP (GET, POST, PUT, PATCH, DELETE, OPTIONS)
   - يعيد توجيه الطلبات إلى Backend server على `http://localhost:3001`

2. **التوجيه (Proxying)**:
   - عندما يرسل Frontend طلب إلى `/api/v1/public/company-profile`
   - Route handler يلتقط الطلب ويعيد توجيهه إلى `http://localhost:3001/api/v1/public/company-profile`
   - النتيجة تُعاد إلى Frontend

3. **البيئة (Environment)**:
   - في **Development**: Route handler يعيد التوجيه إلى `http://localhost:3001`
   - في **Production (Netlify)**: Netlify redirects في `netlify.toml` تتعامل مع التوجيه

## الملفات المعدلة (Modified Files)

1. **`frontend/app/api/v1/[...path]/route.ts`** (جديد):
   - Route handler جديد لمعالجة جميع طلبات API
   - يدعم جميع HTTP methods
   - يتعامل مع CORS headers
   - يعيد توجيه الطلبات إلى Backend

2. **`frontend/next.config.js`**:
   - تم تبسيط rewrites configuration
   - إزالة rewrites لأن Route handler يتعامل معها الآن

## كيفية الاستخدام (How to Use)

### 1. التأكد من أن Backend يعمل:
```bash
# في terminal منفصل
npm run dev  # يعمل Backend على port 3001
```

### 2. تشغيل Frontend:
```bash
cd frontend
npm run dev  # يعمل Frontend على port 3002
```

### 3. التحقق من أن الطلبات تعمل:
- افتح `http://localhost:3002` في المتصفح
- افتح Developer Tools (F12) → Network tab
- يجب أن ترى طلبات API تذهب إلى `/api/v1/...` وتنجح (200 OK)

## المميزات (Features)

✅ **يعمل بشكل موثوق في Development**: Route handler يعمل دائماً
✅ **يدعم جميع HTTP Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
✅ **CORS Support**: يدعم CORS headers
✅ **Error Handling**: معالجة أخطاء شاملة
✅ **Production Ready**: في Production، Netlify يتعامل مع التوجيه

## ملاحظات مهمة (Important Notes)

1. **في Development**: Route handler يعيد التوجيه إلى `http://localhost:3001`
2. **في Production**: Netlify redirects في `netlify.toml` تتعامل مع التوجيه
3. **Environment Variable**: يمكن تعديل `NEXT_PUBLIC_API_BASE_URL` لتغيير Backend URL

## اختبار الحل (Testing the Fix)

### اختبار مباشر:
```bash
# Test Backend health endpoint
curl http://localhost:3001/api/v1/health

# Test through Frontend proxy
curl http://localhost:3002/api/v1/health
```

### في المتصفح:
1. افتح `http://localhost:3002`
2. افتح Developer Tools (F12)
3. اذهب إلى Network tab
4. يجب أن ترى طلبات API تنجح (200 OK) بدلاً من 500

## المراجع (References)

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

