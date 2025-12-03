# 🔧 إصلاح مشكلة Function Dependencies

**التاريخ:** اليوم  
**المشكلة:** `Cannot find module 'serverless-http'` في Netlify Function

---

## ❌ المشكلة

عند محاولة الوصول إلى API endpoint:
```
https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar
```

**الخطأ:**
```
Error: Cannot find module 'serverless-http'
Require stack:
- /var/task/netlify/functions/server.cjs
```

---

## 🔍 السبب

1. **Build Context:** البناء يعمل من `frontend/` (بسبب `base = "frontend"`)
2. **Functions Location:** Functions موجودة في `../netlify/functions`
3. **Dependencies Location:** Dependencies موجودة في root `package.json`
4. **Bundling:** esbuild لا يجد `serverless-http` لأنه يبحث في `frontend/node_modules`

---

## ✅ الحل

### الحل 1: إضافة package.json للـ Functions (موصى به)

تم إنشاء `netlify/functions/package.json` يحتوي على:
- `serverless-http` - مطلوب للـ Function
- `dotenv` - مطلوب لتحميل Environment Variables

### الحل 2: تحديث included_files

تم تحديث `netlify.toml` لتشمل:
- `../package.json` - للوصول إلى dependencies من root

---

## 🚀 خطوات إعادة الرفع

### 1. Commit التغييرات

```bash
git add netlify/functions/package.json netlify.toml
git commit -m "fix: add package.json for Netlify Functions dependencies"
git push
```

### 2. إعادة الرفع من Netlify Dashboard

1. اذهب إلى: https://app.netlify.com
2. اختر: `investor-bacura`
3. **Deploys** > **Trigger deploy** > **Deploy site**

### 3. التحقق بعد الرفع

#### أ. فحص Build Logs
- **Deploys** > **[Latest]** > **Build log**
- تأكد من:
  - ✅ `npm install` في `netlify/functions` نجح
  - ✅ `serverless-http` تم تثبيته
  - ✅ البناء اكتمل بنجاح

#### ب. فحص Function Logs
- **Functions** > **server** > **Logs**
- يجب أن ترى:
  ```
  [Server Function] Environment check: {...}
  [Server Function] Backend app loaded successfully
  ```

#### ج. اختبار API
افتح:
```
https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar
```

**يجب أن ترى البيانات الآن!** ✅

---

## 📋 Checklist

- [ ] أضفت `netlify/functions/package.json`
- [ ] حدثت `netlify.toml` لتشمل `../package.json`
- [ ] أعدت الرفع على Netlify
- [ ] Build logs تظهر نجاح
- [ ] Function logs لا توجد أخطاء
- [ ] API endpoint يعمل ويعيد البيانات

---

## 🔍 إذا استمرت المشكلة

### 1. تحقق من Build Logs
- ابحث عن `npm install` في `netlify/functions`
- تأكد من أن `serverless-http` تم تثبيته

### 2. تحقق من Function Bundle
- في Netlify Dashboard > Functions > server
- تحقق من حجم Function (يجب أن يكون > 1MB إذا كان يحتوي على dependencies)

### 3. تحقق من included_files
- تأكد من أن `../package.json` موجود في `included_files`
- تأكد من أن المسارات صحيحة

### 4. بديل: استخدام External Dependencies
إذا استمرت المشكلة، يمكن إضافة dependencies مباشرة في Function:
```typescript
// في server.ts
import serverless from 'serverless-http';
```

وتأكد من أن `serverless-http` موجود في root `package.json` (موجود ✅)

---

**الخطوة التالية:** إعادة الرفع والتحقق من نجاح الإصلاح ✅

