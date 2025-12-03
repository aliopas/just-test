# 🔧 إصلاح خطأ Build Configuration

**التاريخ:** اليوم  
**المشكلة:** `Configuration property functions.external must be an object`

---

## ❌ الخطأ

```
Failed during stage 'Reading and parsing configuration files': 
When resolving config file /opt/build/repo/netlify.toml:
Configuration property functions.external must be an object.

Invalid syntax
  [functions]
  external = []
```

---

## ✅ الحل

تم إزالة السطر الخاطئ `external = []` من `netlify.toml`.

**قبل:**
```toml
[functions]
  node_bundler = "esbuild"
  included_files = [...]
  external = []  # ← خطأ: يجب أن يكون object
```

**بعد:**
```toml
[functions]
  node_bundler = "esbuild"
  included_files = [...]
  # تم إزالة external = []
```

---

## 🚀 إعادة الرفع

الآن يمكنك إعادة الرفع:

```bash
git add netlify.toml
git commit -m "fix: remove invalid external property from functions config"
git push
```

أو من Netlify Dashboard:
1. اذهب إلى: https://app.netlify.com
2. اختر: `investor-bacura`
3. **Deploys** > **Trigger deploy** > **Deploy site**

---

## ✅ التحقق

بعد الرفع، يجب أن يبدأ البناء بنجاح بدون أخطاء configuration.

---

**تم الإصلاح!** ✅

