# إصلاح مشكلة البناء في Netlify

## المشكلة

البناء في Netlify فشل بسبب عدم العثور على `react-router-dom`:

```
Module not found: Can't resolve 'react-router-dom'
```

## الحل

### 1. تأكد من تثبيت الحزمة

تم إضافة `react-router-dom` إلى `package.json` في dependencies. تأكد من أن الحزمة موجودة:

```json
{
  "dependencies": {
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/react-router-dom": "^5.3.3"
  }
}
```

### 2. تنظيف Cache في Netlify

إذا استمرت المشكلة، قد يكون هناك cache قديم. جرب:

1. اذهب إلى Netlify Dashboard
2. Site settings > Build & deploy > Clear cache and retry deploy
3. أو أضف `package-lock.json` إلى git وتأكد من أنه محدث

### 3. التحقق من أن npm install يعمل

تأكد من أن `npm install` في Netlify يثبت جميع الحزم بشكل صحيح. يمكنك إضافة script للتحقق:

```json
{
  "scripts": {
    "postinstall": "npm ls react-router-dom"
  }
}
```

### 4. الحل البديل: استخدام Next.js Routing فقط

على المدى الطويل، يجب تحويل جميع الصفحات لاستخدام Next.js routing بدلاً من `react-router-dom`. لكن هذا يحتاج إلى وقت.

## الخطوات الفورية

1. ✅ تم إضافة `react-router-dom` إلى dependencies
2. ✅ تم إضافة `@types/react-router-dom` إلى devDependencies
3. ⏳ تأكد من commit وpush التغييرات إلى git
4. ⏳ أعد المحاولة في Netlify بعد push التغييرات

## ملاحظة

الصفحات في `src/pages/` لا تزال تستخدم `react-router-dom`. يجب تحويلها تدريجياً لاستخدام Next.js routing. لكن في الوقت الحالي، `react-router-dom` موجود في dependencies لضمان عمل البناء.

