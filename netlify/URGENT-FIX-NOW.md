# 🚨 إصلاح عاجل - Function Dependencies

**المشكلة:** `Cannot find module 'serverless-http'`  
**الحالة:** يحتاج إعادة رفع فوري

---

## ⚡ الحل السريع

### الخطوة 1: Commit و Push التغييرات

```bash
git add netlify/functions/package.json netlify.toml
git commit -m "fix: add package.json for Netlify Functions to resolve serverless-http dependency"
git push
```

### الخطوة 2: إعادة الرفع على Netlify

**الطريقة الأسرع:**
1. اذهب إلى: https://app.netlify.com
2. اختر: `investor-bacura`
3. **Deploys** tab
4. اضغط على **Trigger deploy** (أعلى الصفحة)
5. اختر: **Deploy site**
6. انتظر حتى ينتهي البناء (~5-10 دقائق)

---

## 🔍 التحقق بعد الرفع

### 1. فحص Build Logs

في **Netlify Dashboard** > **Deploys** > **[Latest]** > **Build log**:

ابحث عن:
```
Installing dependencies for netlify/functions
```

يجب أن ترى:
```
✓ serverless-http installed
✓ dotenv installed
```

### 2. فحص Function

في **Functions** > **server**:

- ✅ Function موجودة
- ✅ Size > 0 (يجب أن يكون > 1MB إذا تم bundle dependencies)

### 3. اختبار API

افتح:
```
https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar
```

**يجب أن ترى:**
```json
{
  "profiles": [
    {
      "id": "...",
      "title": "باكورة التقنيات",
      "content": "...",
      ...
    }
  ],
  "language": "ar"
}
```

---

## 🐛 إذا استمرت المشكلة

### الحل البديل: استخدام External Dependencies

إذا لم يعمل `package.json` في `netlify/functions`، جرب:

#### 1. تحديث `netlify.toml`:

```toml
[functions]
  node_bundler = "esbuild"
  included_files = [
    "../backend/src/**", 
    "../backend/dist/**", 
    "../backend/package.json",
    "../package.json",
    "../node_modules/serverless-http/**"
  ]
```

#### 2. أو استخدام npm install في build command:

```toml
[build]
  command = "cd netlify/functions && npm install && cd ../.. && chmod +x scripts/netlify-build.sh && bash scripts/netlify-build.sh"
```

---

## 📋 الملفات المضافة/المعدلة

1. ✅ `netlify/functions/package.json` - جديد
2. ✅ `netlify.toml` - محدث (included_files)

---

## ⏱️ الوقت المتوقع

- **Commit & Push:** 1 دقيقة
- **Netlify Build:** 5-10 دقائق
- **التحقق:** 2 دقيقة

**المجموع:** ~15 دقيقة

---

**الخطوة التالية:** Commit و Push ثم إعادة الرفع على Netlify! 🚀

