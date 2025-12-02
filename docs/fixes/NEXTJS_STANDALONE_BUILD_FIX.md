# إصلاح خطأ البناء: Next.js Standalone Output

## المشكلة

فشل بناء Next.js مع الخطأ التالي:

```
⚠ Failed to copy traced files for C:\Users\USER\Documents\GitHub\invastors-bacura\frontend\.next\server\app\(investor)\page.js 
Error: ENOENT: no such file or directory, copyfile 
'C:\Users\USER\Documents\GitHub\invastors-bacura\frontend\.next\server\app\(investor)\page_client-reference-manifest.js' 
-> 'C:\Users\USER\Documents\GitHub\invastors-bacura\frontend\.next\standalone\frontend\.next\server\app\(investor)\page_client-reference-manifest.js'
```

## السبب

تم تفعيل `output: 'standalone'` في `next.config.js`، لكن:

1. **Netlify Plugin يدعم Next.js تلقائياً**: Netlify يستخدم `@netlify/plugin-nextjs` الذي يتعامل مع Next.js بشكل كامل بدون الحاجة إلى standalone output
2. **تعارض مع Client Components**: standalone output قد يسبب مشاكل مع Client Components التي تستخدم dynamic rendering
3. **ملفات مفقودة**: أثناء إنشاء standalone build، Next.js يحاول نسخ ملفات client reference manifest ولكنها غير موجودة

## الحل

تم إزالة `output: 'standalone'` من `next.config.js` لأن:

- Netlify plugin يدعم Next.js App Router تلقائياً
- standalone output مخصص بشكل أساسي للنشر على Docker أو الخوادم الذاتية
- غير مطلوب للنشر على Netlify

### التغييرات:

#### قبل:
```javascript
// Output configuration
output: 'standalone',
```

#### بعد:
```javascript
// Output configuration
// Note: Removed 'standalone' output as it conflicts with Netlify plugin
// Netlify's @netlify/plugin-nextjs handles Next.js deployment automatically
// output: 'standalone', // Only needed for Docker/self-hosted deployments
```

## الملفات المعدلة:

- `frontend/next.config.js` - إزالة `output: 'standalone'`

## النتيجة

✅ تم إصلاح خطأ البناء  
✅ Netlify plugin سيتعامل مع Next.js بشكل تلقائي  
✅ لا حاجة لـ standalone output مع Netlify  

## ملاحظات إضافية

إذا كنت تحتاج إلى standalone output في المستقبل (مثل Docker deployment)، يمكنك:

1. إضافة شرط للتحقق من البيئة:
```javascript
output: process.env.STANDALONE_BUILD === 'true' ? 'standalone' : undefined,
```

2. أو إنشاء ملف config منفصل للـ Docker:
```javascript
// next.config.docker.js
module.exports = {
  ...require('./next.config.js'),
  output: 'standalone',
};
```

## التاريخ

2025-12-02

