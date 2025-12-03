# Netlify Functions

هذا المجلد يحتوي على Netlify Functions للمشروع.

## الملفات

- `server.ts` - Netlify Function wrapper للـ Express app

## كيفية العمل

1. Netlify يقوم ببناء `server.ts` إلى JavaScript
2. جميع الطلبات إلى `/api/v1/*` يتم توجيهها إلى `/.netlify/functions/server/:splat` عبر redirects في `netlify.toml`
3. `serverless-http` يقوم بتحويل Express app إلى Netlify Function
4. الدالة تقوم بإعادة بناء المسار إلى `/api/v1/*` لتعمل مع Express routes

## التنسيق الحديث

الدالة تستخدم `export default` (الصيغة الحديثة) ولكن تحتفظ بصيغة Lambda القديمة (`event, context`) بسبب:
- استخدام `serverless-http` الذي يتطلب صيغة Lambda
- Express app يحتاج إلى هذا التنسيق للعمل بشكل صحيح

للحصول على معلومات عن الصيغة الحديثة (Request/Context)، راجع [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/).

## التحقق من النشر

بعد النشر، تحقق من:

1. **Function موجودة:**
   - اذهب إلى Netlify Dashboard > Functions
   - يجب أن ترى `server` function

2. **Function تعمل:**
   - اذهب إلى Netlify Dashboard > Functions > server > Logs
   - يجب أن ترى logs بدون أخطاء

3. **API تعمل:**
   - افتح `https://your-site.netlify.app/api/v1/health` - يجب أن ترى health check response

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. **تحقق من Build logs:**
   - اذهب إلى Netlify Dashboard > Deploys > [Latest Deploy] > Build log
   - تأكد من أن البناء نجح

2. **تحقق من Function logs:**
   - اذهب إلى Netlify Dashboard > Functions > server > Logs
   - ابحث عن أخطاء

3. **تحقق من Environment Variables:**
   - اذهب إلى Netlify Dashboard > Site settings > Environment variables
   - تأكد من إضافة جميع المتغيرات المطلوبة من `backend/.env`

4. **تحقق من Redirects:**
   - تأكد من أن redirect في `netlify.toml` يعمل بشكل صحيح
   - المسار: `/api/v1/*` → `/.netlify/functions/server/:splat`

## ملاحظات

- الدالة تستورد مباشرة من `backend/src/app` (TypeScript source)
- Netlify's esbuild يقوم بالتحويل التلقائي
- تأكد من أن `backend/src/**` مدرج في `included_files` في `netlify.toml`
