# إعادة رفع التغييرات إلى Netlify

## التغييرات المطبقة:
1. ✅ إصلاح جميع الـ controllers لترجع `Response` بشكل صحيح
2. ✅ تبسيط الـ build command في netlify.toml
3. ✅ تحديث AdminCompanyContentPage لاستخدام apiClient بدلاً من Supabase مباشرة

## خطوات الرفع:

### 1. افتح Terminal في مجلد المشروع

### 2. تحقق من التغييرات:
```bash
git status
```

### 3. أضف التغييرات:
```bash
git add backend/src/controllers/company-content.controller.ts
git add frontend/src/spa-pages/AdminCompanyContentPage.tsx
git add netlify.toml
```

### 4. اعمل commit:
```bash
git commit -m "fix: ensure all controllers return Response + simplify build command

- Fixed all company-content controllers to return Response
- Updated AdminCompanyContentPage to use apiClient hooks
- Simplified Netlify build command to prevent cancellation"
```

### 5. ادفع إلى GitHub:
```bash
git push origin main
```

## بعد الـ Push:
- Netlify سيبدأ deployment تلقائياً
- راقب العملية من: https://app.netlify.com
- الـ build يجب أن يكتمل بدون إلغاء

## إذا استمرت المشكلة:
1. تحقق من Netlify Dashboard > Site Settings > Build & Deploy
2. تأكد من أن timeout = 1200 ثانية
3. تحقق من Build logs لمعرفة سبب الإلغاء

