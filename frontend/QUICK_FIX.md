# إصلاح سريع للمشاكل - Quick Fix Guide

## ✅ **تم إصلاح:**

### **1. API Rewrite ✅**
تم تحديث `netlify.toml`:
```toml
[[redirects]]
  from = "/api/v1/*"  # كان "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
```

---

## ⚠️ **ما يجب إصلاحه يدوياً:**

### **1. نسخ ملفات Logo:**

**في PowerShell:**
```powershell
cd frontend
Copy-Item "src/assets/logo.png" "public/logo.png" -Force
Copy-Item "src/assets/logo.jpg" "public/logo.jpg" -Force
```

**أو في Git Bash/WSL:**
```bash
cd frontend
cp src/assets/logo.png public/logo.png
cp src/assets/logo.jpg public/logo.jpg
```

---

### **2. إنشاء ملفات Icons:**

ملفات الـ icons المطلوبة في `public/icons/`:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png`
- `icon-512x512-maskable.png`
- `icon-144x144.png` (مذكور في الخطأ لكن غير موجود في manifest)

**الحل:**
1. استخدم tool online لإنشاء favicons من `logo.png`
2. أو افتح `public/icons/generate-placeholder-icons.html` في المتصفح
3. أو أنشئها يدوياً باستخدام image editor

---

### **3. React Router Error:**

المشكلة: مكون يستخدم React Router context لكن BrowserRouter غير موجود.

**الحل المؤقت:** 
- تأكد من أن `src/App.tsx` و `src/main.tsx` غير مستخدمين
- جميع الصفحات يجب أن تستخدم Next.js routing

**الملفات التي تحتاج تحديث (لاحقاً):**
- `src/pages/LoginPage.tsx`
- `src/pages/VerifyOtpPage.tsx`
- `src/pages/InvestorNewsDetailPage.tsx`
- `src/pages/InvestorProjectDetailPage.tsx`
- `src/pages/NonFinancialRequestsPage.tsx`

لكن هذه الملفات تعمل الآن لأنها داخل `ClientOnly` wrapper، المشكلة قد تكون في build.

---

## 🚀 **بعد الإصلاح:**

1. **Commit التغييرات:**
   ```bash
   git add .
   git commit -m "Fix: Update API redirects in netlify.toml and add logo files"
   ```

2. **Push إلى repository:**
   ```bash
   git push
   ```

3. **Netlify سيبنى تلقائياً** ✅

---

**تاريخ الإنشاء:** الآن  
**الحالة:** جاهز بعد نسخ ملفات logo و icons

