# إصلاح مشاكل Netlify - Netlify Issues Fix

## 🔴 **المشاكل المكتشفة:**

### **1. ملفات Static غير موجودة (404):**
- ❌ `logo.png` غير موجود في `public/`
- ❌ ملفات الـ icons غير موجودة في `public/icons/`
- ❌ `manifest.json` يشير إلى `/icons/icon-144x144.png` غير موجود

### **2. API Rewrite لا يعمل (404):**
- ❌ `GET /api/v1/investor/profile` → 404

### **3. React Router Error:**
- ❌ `Cannot destructure property 'basename'` - مكون يستخدم React Router context لكن BrowserRouter غير موجود

---

## ✅ **الحلول:**

### **🔧 1. نسخ ملفات Static:**

```bash
cd frontend

# نسخ logo
cp src/assets/logo.png public/logo.png
cp src/assets/logo.jpg public/logo.jpg

# إنشاء ملفات الـ icons (يجب إنشاؤها)
# يمكن استخدام الأداة في public/icons/generate-placeholder-icons.html
```

**أو في PowerShell:**
```powershell
Copy-Item frontend/src/assets/logo.png frontend/public/logo.png
Copy-Item frontend/src/assets/logo.jpg frontend/public/logo.jpg
```

---

### **🔧 2. إنشاء ملفات الـ Icons:**

ملفات الـ icons المطلوبة (حسب `manifest.json`):
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png`
- `icon-512x512-maskable.png`

**الحل:** استخدم الأداة في `public/icons/generate-placeholder-icons.html` أو أنشئها يدوياً.

---

### **🔧 3. إصلاح API Rewrite في Netlify:**

في `netlify.toml`، تأكد من وجود rewrite صحيح:

```toml
[[redirects]]
  from = "/api/v1/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
```

**أو** إذا كنت تستخدم Next.js API Routes:

```toml
[[redirects]]
  from = "/api/v1/*"
  to = "https://your-backend-api.com/api/v1/:splat"
  status = 200
  force = true
```

---

### **🔧 4. إصلاح React Router Error:**

المشكلة: هناك مكون يستخدم React Router hooks/context لكن `BrowserRouter` غير موجود في Next.js.

**الحل:** تأكد من أن جميع المكونات التي تستخدم React Router قد تم تحديثها لاستخدام Next.js routing.

**الملفات التي تحتاج تحديث:**
- أي مكون يستخدم `useLocation()`, `useNavigate()`, `Link` من `react-router-dom`
- استبدلها بـ `usePathname()`, `useRouter()`, `Link` من `next/link`

---

## 🚀 **خطوات التنفيذ:**

### **الخطوة 1: نسخ ملفات Static**

```bash
# من root directory
cd frontend
cp src/assets/logo.png public/logo.png
cp src/assets/logo.jpg public/logo.jpg
```

### **الخطوة 2: إنشاء ملفات Icons**

يمكنك:
1. استخدام tool online لإنشاء favicons من logo
2. أو استخدام الأداة في `public/icons/generate-placeholder-icons.html`
3. أو نسخ ملفات موجودة وتغيير أحجامها

### **الخطوة 3: التحقق من netlify.toml**

تأكد من أن الـ redirects صحيحة للـ API.

### **الخطوة 4: إصلاح React Router**

ابحث عن المكونات التي تستخدم React Router واستبدلها بـ Next.js equivalents.

---

## 📝 **ملاحظات:**

1. ⚠️ **ملفات Icons مهمة للـ PWA** - بدونها قد لا يعمل التطبيق كـ Progressive Web App بشكل صحيح

2. ⚠️ **API Rewrite** - تأكد من أن Backend API يعمل وأن الـ URL صحيح

3. ⚠️ **React Router** - في Next.js، لا حاجة لـ BrowserRouter. جميع الـ routing يتم عبر Next.js App Router.

---

**تاريخ الإنشاء:** الآن  
**الحالة:** يحتاج إلى تنفيذ

