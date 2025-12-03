# 🔧 إصلاح رسالة الخطأ "حدث خطأ في تحميل البيانات"

**التاريخ:** اليوم  
**المشكلة:** Frontend يعرض "حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقاً."

---

## 🔍 تشخيص المشكلة

### الخطأ الأساسي:
```
Error: Cannot find module 'serverless-http'
```

هذا يعني أن Netlify Function لا تجد dependency `serverless-http` المطلوبة.

---

## ✅ الحل المطبق

### 1. إضافة `netlify/functions/package.json`
تم إنشاء ملف يحتوي على dependencies المطلوبة:
```json
{
  "dependencies": {
    "serverless-http": "^3.2.0",
    "dotenv": "^17.2.3"
  }
}
```

### 2. تحديث `netlify.toml`
تم إضافة `package.json` إلى `included_files`:
```toml
[functions]
  included_files = [
    "../backend/src/**", 
    "../backend/dist/**", 
    "../backend/package.json",
    "../package.json",
    "package.json"  # ← جديد
  ]
```

---

## 🚀 خطوات الإصلاح

### الخطوة 1: Commit التغييرات

```bash
git add netlify/functions/package.json netlify.toml
git commit -m "fix: add package.json for Netlify Functions dependencies"
git push
```

### الخطوة 2: إعادة الرفع على Netlify

**من Netlify Dashboard:**
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
Installing dependencies
```

يجب أن ترى:
```
✓ Installing dependencies in netlify/functions
✓ serverless-http@3.2.0 installed
✓ dotenv@17.2.3 installed
```

### 2. فحص Function Logs

في **Functions** > **server** > **Logs**:

يجب أن ترى:
```
[Server Function] Environment check: {
  hasSupabaseUrl: true,
  hasSupabaseAnonKey: true,
  hasSupabaseServiceRoleKey: true
}
[Server Function] Backend app loaded successfully
```

### 3. اختبار API مباشرة

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
      "iconKey": "...",
      "displayOrder": 0
    },
    {
      "id": "...",
      "title": "رؤيتنا",
      "content": "...",
      "iconKey": "vision",
      "displayOrder": 1
    }
    // ... المزيد
  ],
  "language": "ar"
}
```

### 4. اختبار Frontend

افتح:
```
https://investor-bacura.netlify.app
```

**يجب أن ترى:**
- ✅ البيانات تظهر في cards
- ✅ لا توجد رسالة خطأ
- ✅ يمكن النقر على cards لفتح Modal

---

## 🐛 إذا استمرت المشكلة

### الحل البديل 1: استخدام npm install في build command

حدث `netlify.toml`:
```toml
[build]
  command = "cd netlify/functions && npm install && cd ../.. && chmod +x scripts/netlify-build.sh && bash scripts/netlify-build.sh"
```

### الحل البديل 2: تضمين node_modules مباشرة

حدث `netlify.toml`:
```toml
[functions]
  included_files = [
    "../backend/src/**", 
    "../backend/dist/**", 
    "../backend/package.json",
    "../package.json",
    "package.json",
    "../node_modules/serverless-http/**"
  ]
```

---

## 📋 Checklist

- [ ] أضفت `netlify/functions/package.json`
- [ ] حدثت `netlify.toml` لتشمل `package.json`
- [ ] Commit و Push التغييرات
- [ ] أعدت الرفع على Netlify
- [ ] Build logs تظهر نجاح
- [ ] Function logs لا توجد أخطاء
- [ ] API endpoint يعمل ويعيد البيانات
- [ ] Frontend يعرض البيانات بدون أخطاء

---

## ⏱️ الوقت المتوقع

- **Commit & Push:** 1 دقيقة
- **Netlify Build:** 5-10 دقائق
- **التحقق:** 2 دقيقة

**المجموع:** ~15 دقيقة

---

**الخطوة التالية:** Commit و Push ثم إعادة الرفع على Netlify! 🚀

