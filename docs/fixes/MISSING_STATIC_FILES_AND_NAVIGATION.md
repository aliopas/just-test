# إصلاح ملفات Static المفقودة ومشكلة التنقل

## المشاكل

1. **404 Error**: `/logo.png` غير موجود في `public/`
2. **404 Error**: `/icons/icon-192x192.png` غير موجود في `public/icons/`
3. **Navigation Issue**: لا ينتقل بين الصفحات - `PublicLandingPage` يستخدم `react-router-dom` Link بدلاً من Next.js navigation

## الحلول

### 1. نسخ logo.png إلى public/

```powershell
Copy-Item "frontend\src\assets\logo.png" -Destination "frontend\public\logo.png" -Force
```

### 2. إنشاء ملفات icons المفقودة

يجب إنشاء ملفات icons التالية في `frontend/public/icons/`:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png`
- `icon-512x512-maskable.png`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`

### 3. استبدال react-router-dom Link بـ Next.js navigation

في `PublicLandingPage.tsx`:
- استبدال `import { Link } from 'react-router-dom'` بـ `import Link from 'next/link'`
- استبدال `to=` بـ `href=`
- استخدام Next.js navigation

---

**ملاحظة**: يجب على المستخدم نسخ logo.png يدوياً أو استخدام الأوامر أعلاه.

