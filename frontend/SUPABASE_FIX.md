# إصلاح مشكلة Supabase Storage URL

## 🔴 **المشكلة:**

```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
xxxxx.supabase.co/storage/v1/company-content-images/...
```

**السبب:** متغيرات البيئة لـ Supabase غير مضبوطة بشكل صحيح أو تحتوي على قيم placeholder.

---

## ✅ **الحل:**

### **1. التحقق من متغيرات البيئة:**

تأكد من وجود القيم الصحيحة في:

#### **أ. ملف `.env.local` (للـ development):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project-id.supabase.co/storage/v1/object/public
```

**أو** يمكنك ترك `NEXT_PUBLIC_SUPABASE_STORAGE_URL` فارغاً وسيتم بناءه تلقائياً من `NEXT_PUBLIC_SUPABASE_URL`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### **ب. إعدادات Netlify (للـ production):**

اذهب إلى:
1. Netlify Dashboard → Site Settings → Environment Variables
2. تأكد من وجود:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_URL = https://your-project-id.supabase.co/storage/v1/object/public
```

---

### **2. كيف تحصل على القيم الصحيحة:**

1. **اذهب إلى Supabase Dashboard:** https://supabase.com/dashboard
2. **اختر مشروعك**
3. **Settings → API:**
   - `Project URL` = `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `Storage URL` = `Project URL` + `/storage/v1/object/public`

---

### **3. التحقق من القيم في الكود:**

افتح **Developer Console** في المتصفح وتحقق من:

```javascript
console.log(window.__ENV__);
```

يجب أن ترى:
```javascript
{
  SUPABASE_URL: "https://your-project-id.supabase.co",
  SUPABASE_ANON_KEY: "...",
  SUPABASE_STORAGE_URL: "https://your-project-id.supabase.co/storage/v1/object/public"
}
```

---

### **4. إذا كانت القيم صحيحة لكن المشكلة مستمرة:**

قد تكون المشكلة في كيفية بناء الـ URL. تحقق من:

#### **في `supabase-storage.ts`:**

الوظيفة `getStorageBaseUrl()` تحاول:
1. استخدام `window.__ENV__?.SUPABASE_STORAGE_URL`
2. أو `process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL`
3. أو بناءه من `SUPABASE_URL` + `/storage/v1/object/public`

#### **الحل البديل:**

إذا كان `SUPABASE_STORAGE_URL` فارغاً، سيتم بناءه تلقائياً من `SUPABASE_URL`. تأكد من أن `NEXT_PUBLIC_SUPABASE_URL` مضبوط بشكل صحيح.

---

## 🔍 **Debug Steps:**

1. **افتح Console في المتصفح:**
   ```javascript
   // تحقق من القيم
   console.log('SUPABASE_URL:', window.__ENV__?.SUPABASE_URL);
   console.log('SUPABASE_STORAGE_URL:', window.__ENV__?.SUPABASE_STORAGE_URL);
   ```

2. **تحقق من Network Tab:**
   - ابحث عن طلبات فاشلة لـ `xxxxx.supabase.co`
   - تحقق من الـ Request URL الفعلي

3. **تحقق من Source Code:**
   - افتح `app/layout.tsx`
   - تحقق من أن `window.__ENV__` يتم تعيينه بشكل صحيح

---

## 🛠️ **إصلاح مؤقت:**

إذا كانت المشكلة في أن الـ URL يتم بناؤه بشكل خاطئ، يمكنك إضافة fallback في `supabase-storage.ts`:

```typescript
function getStorageBaseUrl(): string | null {
  // ... الكود الحالي ...
  
  // Fallback: إذا كانت جميع القيم غير موجودة
  const defaultUrl = 'https://your-project-id.supabase.co/storage/v1/object/public';
  console.warn('Using default storage URL. Please configure environment variables.');
  return defaultUrl;
}
```

**⚠️ هذا حل مؤقت فقط. يجب ضبط متغيرات البيئة بشكل صحيح.**

---

## ✅ **بعد التصحيح:**

1. **أعد تشغيل Next.js dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **أعد بناء المشروع (لـ production):**
   ```bash
   npm run build
   ```

3. **تحقق من أن الصور تعمل الآن**

---

## 📝 **ملاحظات مهمة:**

- ⚠️ **لا تضع القيم الحساسة في الكود مباشرة** - استخدم متغيرات البيئة دائماً
- ✅ **استخدم `NEXT_PUBLIC_` prefix** للقيم التي تحتاجها في المتصفح
- ✅ **تأكد من إعادة البناء** بعد تغيير متغيرات البيئة
- ✅ **في Netlify، قد تحتاج إلى Redeploy** بعد تغيير Environment Variables

---

**تاريخ الإنشاء:** الآن  
**الحالة:** يحتاج إلى ضبط متغيرات البيئة

