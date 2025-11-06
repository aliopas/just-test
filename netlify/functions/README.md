# Netlify Functions

هذا المجلد يحتوي على Netlify Functions للمشروع.

## الملفات

- `server.ts` - Netlify Function wrapper للـ Express app

## كيفية العمل

1. Netlify يقوم ببناء `server.ts` إلى JavaScript
2. جميع الطلبات يتم توجيهها إلى `/.netlify/functions/server`
3. `serverless-http` يقوم بتحويل Express app إلى Netlify Function

## التحقق من النشر

بعد النشر، تحقق من:

1. **Function موجودة:**
   - اذهب إلى Netlify Dashboard > Functions
   - يجب أن ترى `server` function

2. **Function تعمل:**
   - اذهب إلى Netlify Dashboard > Functions > server > Logs
   - يجب أن ترى logs بدون أخطاء

3. **API تعمل:**
   - افتح `https://your-site.netlify.app/` - يجب أن ترى رسالة ترحيبية
   - افتح `https://your-site.netlify.app/api/v1/health` - يجب أن ترى health check

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
   - تأكد من إضافة جميع المتغيرات المطلوبة

