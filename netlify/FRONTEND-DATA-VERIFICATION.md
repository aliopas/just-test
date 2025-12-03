# ✅ التحقق من عرض البيانات في Frontend

**التاريخ:** اليوم  
**الحالة:** دليل شامل للتحقق من عرض البيانات

---

## 🔍 نظرة عامة على تدفق البيانات

### 1. **API Client Configuration**
- **الملف:** `frontend/src/utils/api-client.ts`
- **Base URL:** `/api/v1` (افتراضي)
- **يمكن التخصيص:** عبر `NEXT_PUBLIC_API_BASE_URL` أو `window.__ENV__?.API_BASE_URL`

### 2. **Data Fetching Hook**
- **الملف:** `frontend/src/hooks/usePublicContent.ts`
- **Hook:** `usePublicCompanyProfiles()`
- **API Endpoint:** `/public/company-profile?lang={language}`
- **المكتبة:** React Query (`@tanstack/react-query`)

### 3. **Component Display**
- **الملف:** `frontend/src/components/landing/CompanyContentSection.tsx`
- **يستخدم:** `usePublicCompanyProfiles()` hook
- **يعرض:** البيانات في cards مع إمكانية فتح modal للتفاصيل

---

## 🧪 خطوات التحقق

### الخطوة 1: التحقق من API Endpoint

افتح في المتصفح أو استخدم curl:
```bash
# اختبار مباشر للـ API
curl https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar
```

**النتيجة المتوقعة:**
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

### الخطوة 2: التحقق من Frontend Configuration

#### أ. فحص Environment Variables

في **Netlify Dashboard**:
1. **Site Settings** > **Environment Variables**
2. تأكد من وجود:
   - `NEXT_PUBLIC_API_BASE_URL` (اختياري - يستخدم `/api/v1` افتراضياً)
   - `NEXT_PUBLIC_SUPABASE_URL` (لـ Supabase client)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (لـ Supabase client)

#### ب. فحص Next.js Config

**الملف:** `frontend/next.config.js`

يجب أن يحتوي على:
```javascript
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/v1/:path*`,
    },
  ];
}
```

#### ج. فحص Layout (window.__ENV__)

**الملف:** `frontend/app/layout.tsx`

يجب أن يحتوي على:
```javascript
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.__ENV__ = {
        API_BASE_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1')},
        // ... other env vars
      };
    `,
  }}
/>
```

### الخطوة 3: التحقق من Browser Console

افتح **Developer Tools** (F12) في المتصفح:

#### أ. Network Tab
1. افتح **Network** tab
2. ابحث عن طلبات إلى `/api/v1/public/company-profile`
3. تحقق من:
   - ✅ Status: 200
   - ✅ Response: يحتوي على `profiles` array
   - ✅ Headers: Content-Type: application/json

#### ب. Console Tab
ابحث عن:
- ✅ لا توجد أخطاء (errors)
- ✅ قد ترى logs من React Query (في development mode)
- ✅ تحذيرات Supabase (إذا كانت Environment Variables مفقودة)

### الخطوة 4: التحقق من React Component

#### أ. فحص Component State

في **React DevTools**:
1. افتح **Components** tab
2. ابحث عن `CompanyContentSection`
3. تحقق من:
   - ✅ `isLoading: false` (بعد تحميل البيانات)
   - ✅ `isError: false`
   - ✅ `data.profiles` يحتوي على البيانات

#### ب. فحص React Query Cache

في **React Query DevTools** (إن كان مثبتاً):
- ✅ Query Key: `['publicCompanyProfiles', 'ar']`
- ✅ Status: `success`
- ✅ Data: يحتوي على `profiles` array

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: البيانات لا تظهر

**الأعراض:**
- الصفحة فارغة أو تظهر "لا توجد بيانات متاحة"

**الحلول:**

1. **تحقق من API Response:**
   ```bash
   curl https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar
   ```

2. **تحقق من Browser Console:**
   - ابحث عن أخطاء في Network tab
   - تحقق من React Query errors

3. **تحقق من Component State:**
   - افتح React DevTools
   - تحقق من `CompanyContentSection` props

4. **تحقق من Language Context:**
   - تأكد من أن `LanguageContext` يعمل بشكل صحيح
   - اللغة الافتراضية: `ar`

### المشكلة 2: 404 Not Found

**الأعراض:**
- Network request يعيد 404

**الحلول:**

1. **تحقق من Netlify Redirects:**
   - في `netlify.toml`:
   ```toml
   [[redirects]]
   from = "/api/v1/*"
   to = "/.netlify/functions/server/:splat"
   status = 200
   force = true
   ```

2. **تحقق من Function Deployment:**
   - في Netlify Dashboard > Functions
   - تأكد من وجود `server` function

3. **تحقق من Build Logs:**
   - في Netlify Dashboard > Deploys
   - تحقق من أن البناء نجح

### المشكلة 3: 502 Bad Gateway

**الأعراض:**
- Network request يعيد 502

**الحلول:**

1. **تحقق من Environment Variables:**
   - في Netlify Dashboard
   - تأكد من وجود:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

2. **تحقق من Function Logs:**
   - في Netlify Dashboard > Functions > server > Logs
   - ابحث عن أخطاء Supabase

3. **تحقق من Backend App Loading:**
   - في Function Logs، ابحث عن:
     ```
     [Server Function] Backend app loaded successfully
     ```

### المشكلة 4: CORS Errors

**الأعراض:**
- Console يعرض CORS errors

**الحلول:**

1. **تحقق من CORS Configuration:**
   - في `backend/src/middleware/security.ts`
   - تأكد من أن Netlify domain مسموح

2. **تحقق من API Base URL:**
   - تأكد من أن Frontend يستخدم نفس domain للـ API
   - في Netlify، استخدم relative paths (`/api/v1`)

### المشكلة 5: البيانات تظهر لكن فارغة

**الأعراض:**
- API يعيد 200 لكن `profiles` array فارغ

**الحلول:**

1. **تحقق من Supabase Data:**
   ```sql
   SELECT COUNT(*) FROM company_profile WHERE is_active = true;
   ```

2. **تحقق من Language Parameter:**
   - تأكد من أن `lang=ar` أو `lang=en` صحيح
   - تحقق من أن البيانات موجودة باللغة المطلوبة

3. **تحقق من Service Role Key:**
   - تأكد من وجود `SUPABASE_SERVICE_ROLE_KEY`
   - هذا مطلوب للعمليات الإدارية

---

## ✅ Checklist للتحقق الكامل

### قبل التحقق:
- [ ] البيانات موجودة في Supabase
- [ ] Environment Variables موجودة في Netlify
- [ ] Netlify Function تم رفعه بنجاح
- [ ] Build logs تظهر نجاح

### أثناء التحقق:
- [ ] API endpoint يعيد 200 مع البيانات
- [ ] Browser Network tab يظهر request ناجح
- [ ] Browser Console لا توجد أخطاء
- [ ] React Component يعرض البيانات
- [ ] البيانات صحيحة ومطابقة للـ API response

### بعد التحقق:
- [ ] البيانات تظهر بشكل صحيح في UI
- [ ] اللغة تعمل بشكل صحيح (ar/en)
- [ ] Modal يعمل عند النقر على card
- [ ] Loading states تعمل بشكل صحيح
- [ ] Error states تعمل بشكل صحيح

---

## 🔧 أدوات مفيدة

### 1. Browser DevTools
- **Network Tab:** لمراقبة API requests
- **Console Tab:** لرؤية الأخطاء والتحذيرات
- **React DevTools:** لفحص Component state

### 2. React Query DevTools
```bash
npm install @tanstack/react-query-devtools
```

### 3. curl / Postman
لاختبار API مباشرة بدون Frontend

### 4. Netlify Function Logs
في Netlify Dashboard > Functions > server > Logs

---

## 📝 مثال على التحقق الكامل

### 1. اختبار API مباشرة:
```bash
curl "https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar" | jq
```

### 2. فحص في Browser:
1. افتح: `https://investor-bacura.netlify.app`
2. افتح DevTools (F12)
3. Network tab > ابحث عن `company-profile`
4. تحقق من Response

### 3. فحص Component:
1. افتح React DevTools
2. ابحث عن `CompanyContentSection`
3. تحقق من props و state

---

## 🎯 النتيجة المتوقعة

بعد التحقق الكامل، يجب أن ترى:

1. ✅ **API Response:** 200 مع بيانات صحيحة
2. ✅ **Network Request:** ناجح بدون أخطاء
3. ✅ **Component State:** `isLoading: false`, `isError: false`, `data` موجود
4. ✅ **UI Display:** البيانات تظهر في cards
5. ✅ **Language Support:** البيانات تظهر باللغة الصحيحة (ar/en)
6. ✅ **Interactivity:** Modal يعمل عند النقر

---

**الخطوة التالية:** افتح الموقع واختبر عرض البيانات! ✅

