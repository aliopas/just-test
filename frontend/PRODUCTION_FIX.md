# إصلاح مشاكل Production - Production Fix Guide

## 🔴 **المشاكل في Production:**

1. ❌ `logo.png` 404 - الملف غير موجود في `public/`
2. ❌ `icons/icon-144x144.png` 404 - ملفات icons غير موجودة
3. ❌ `/api/v1/investor/profile` 404 - API rewrite لا يعمل بشكل صحيح
4. ❌ React Router error - مكون يستخدم React Router context

---

## ✅ **الحلول:**

### **1. نسخ ملفات Static:**

**في PowerShell (من root directory):**
```powershell
Copy-Item "frontend/src/assets/logo.png" "frontend/public/logo.png" -Force
Copy-Item "frontend/src/assets/logo.jpg" "frontend/public/logo.jpg" -Force
```

**أو في Git Bash:**
```bash
cp frontend/src/assets/logo.png frontend/public/logo.png
cp frontend/src/assets/logo.jpg frontend/public/logo.jpg
```

---

### **2. إنشاء ملفات Icons:**

ملفات الـ icons المطلوبة في `frontend/public/icons/`:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png` ⚠️ (مذكور في الخطأ لكن غير موجود في manifest)
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png`
- `icon-512x512-maskable.png`

**الحل:** استخدم أداة online مثل:
- https://realfavicongenerator.net/
- أو افتح `frontend/public/icons/generate-placeholder-icons.html` في المتصفح

---

### **3. إصلاح API Rewrite:**

**تم إصلاح `next.config.js`:**
- في development: يستخدم Next.js rewrites
- في production: يعتمد على Netlify redirects في `netlify.toml`

**التحقق:**
- `netlify.toml` يحتوي على redirect صحيح: `/api/v1/*` → `/.netlify/functions/server/:splat`
- Function موجودة في `netlify/functions/server.ts`

---

### **4. React Router Error:**

**المشكلة:** مكون لا يزال يستخدم React Router context (`useContext` مع Router context).

**الحل:**
1. تأكد من أن جميع الصفحات في `app/` تستخدم Next.js routing فقط
2. المكونات في `src/pages/` التي تستخدم React Router يجب تحديثها لاحقاً
3. الخطأ قد يكون من build cache - حاول:
   ```bash
   rm -rf frontend/.next
   npm run build
   ```

---

## 🚀 **خطوات التنفيذ:**

### **الخطوة 1: نسخ ملفات Static**
```powershell
Copy-Item "frontend/src/assets/logo.png" "frontend/public/logo.png" -Force
Copy-Item "frontend/src/assets/logo.jpg" "frontend/public/logo.jpg" -Force
```

### **الخطوة 2: إنشاء ملفات Icons**
استخدم أداة online أو أنشئها يدوياً.

### **الخطوة 3: Commit و Push**
```bash
git add .
git commit -m "Fix: Add static files and fix API rewrites for production"
git push
```

### **الخطوة 4: Redeploy على Netlify**
- Netlify سيبنى تلقائياً بعد push
- أو يمكنك عمل manual deploy من Dashboard

---

## 🔍 **التحقق:**

بعد الـ deploy، تحقق من:

1. **Static Files:**
   - ✅ https://investor-bacura.netlify.app/logo.png
   - ✅ https://investor-bacura.netlify.app/icons/icon-192x192.png

2. **API:**
   - ✅ https://investor-bacura.netlify.app/api/v1/health
   - ✅ https://investor-bacura.netlify.app/api/v1/investor/profile (بعد login)

3. **Console:**
   - ✅ لا توجد أخطاء React Router
   - ✅ لا توجد 404 errors للـ static files

---

## 📝 **ملاحظات مهمة:**

1. ⚠️ **ملفات Icons ضرورية للـ PWA** - بدونها قد لا يعمل التطبيق بشكل صحيح

2. ⚠️ **API Rewrites** - في Netlify، Next.js rewrites لا تعمل في production build. يجب استخدام Netlify redirects فقط.

3. ⚠️ **React Router** - الخطأ قد يكون من build cache. حاول مسح `.next` folder وإعادة build.

---

**تاريخ الإنشاء:** الآن  
**الحالة:** جاهز بعد نسخ الملفات وإنشاء icons

