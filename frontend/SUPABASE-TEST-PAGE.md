# صفحة اختبار Supabase - Supabase Test Page

## نظرة عامة / Overview

صفحة اختبار شاملة لفحص كيفية عرض بيانات Supabase في React واختبار عمليات GET و POST.

A comprehensive test page to check how Supabase data is displayed in React and test GET and POST operations.

## كيفية الوصول / How to Access

بعد تسجيل الدخول كمستثمر، انتقل إلى:
After logging in as an investor, navigate to:

```
/test-supabase
```

أو الرابط الكامل:
Or the full URL:

```
http://localhost:3000/test-supabase
```

## الميزات / Features

### 1. اختبار جلب البيانات (GET) / Test Data Fetching

الصفحة تختبر جلب البيانات من Supabase عبر:
- **الأخبار (News)**: استخدام `useInvestorNewsList`
- **المشاريع (Projects)**: استخدام `usePublicProjects`
- **الملفات الشخصية (Profiles)**: استخدام `usePublicCompanyProfiles`

The page tests fetching data from Supabase via:
- **News**: Using `useInvestorNewsList`
- **Projects**: Using `usePublicProjects`
- **Profiles**: Using `usePublicCompanyProfiles`

### 2. اختبار إرسال البيانات (POST) / Test Data Posting

- **اختبار POST**: إنشاء طلب جديد (feedback request)
- **اختبار API مباشر**: اختبار الاتصال بالـ API endpoint

- **Test POST**: Create a new request (feedback request)
- **Test Direct API**: Test connection to API endpoint

### 3. عرض النتائج / Display Results

- ✅ عرض حالة النجاح مع البيانات
- ❌ عرض الأخطاء مع تفاصيل الخطأ
- 📊 عرض البيانات الخام في JSON format
- 📈 ملخص حالة جميع الاختبارات

- ✅ Display success status with data
- ❌ Display errors with error details
- 📊 Display raw data in JSON format
- 📈 Summary of all test statuses

## كيفية الاستخدام / How to Use

1. **افتح الصفحة**: انتقل إلى `/test-supabase`
2. **راقب عمليات الجلب**: ستظهر البيانات تلقائياً عند تحميل الصفحة
3. **اختبر POST**: اضغط على زر "اختبار POST" لإرسال بيانات تجريبية
4. **اختبر API**: اضغط على زر "اختبار API مباشر" للتحقق من الاتصال
5. **راجع النتائج**: تحقق من حالة كل اختبار في الأقسام المختلفة

1. **Open the page**: Navigate to `/test-supabase`
2. **Monitor fetching**: Data will appear automatically when the page loads
3. **Test POST**: Click "Test POST" button to send test data
4. **Test API**: Click "Test Direct API" button to verify connection
5. **Review results**: Check the status of each test in different sections

## الأخطاء الشائعة / Common Issues

### مشكلة: لا تظهر البيانات / Issue: Data not showing

**الحلول المحتملة / Possible Solutions:**
1. تحقق من إعدادات Supabase في `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. تحقق من أن Backend API يعمل بشكل صحيح

3. افتح Developer Console (F12) للتحقق من الأخطاء

**Possible Solutions:**
1. Check Supabase settings in `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Verify that Backend API is running correctly

3. Open Developer Console (F12) to check for errors

### مشكلة: خطأ في POST / Issue: POST Error

**الحلول المحتملة / Possible Solutions:**
1. تأكد من تسجيل الدخول (Authentication required)
2. تحقق من صلاحيات المستخدم (User permissions)
3. تحقق من صحة البيانات المرسلة (Data validation)

**Possible Solutions:**
1. Make sure you're logged in (Authentication required)
2. Check user permissions
3. Verify the data being sent is valid

## البنية التقنية / Technical Structure

```
frontend/
├── app/
│   └── (investor)/
│       └── test-supabase/
│           └── page.tsx          # Next.js route
└── src/
    └── pages/
        └── SupabaseTestPage.tsx  # Main test component
```

## الملفات ذات الصلة / Related Files

- `frontend/src/hooks/useInvestorNews.ts` - Hook لجلب الأخبار
- `frontend/src/hooks/usePublicProjects.ts` - Hook لجلب المشاريع
- `frontend/src/hooks/usePublicContent.ts` - Hook لجلب المحتوى
- `frontend/src/hooks/useCreateRequest.ts` - Hook لإنشاء الطلبات
- `frontend/src/utils/api-client.ts` - API client utility

## ملاحظات / Notes

- هذه الصفحة مخصصة للاختبار والتطوير فقط
- لا تستخدم في الإنتاج (Production)
- جميع البيانات المعروضة هي للاختبار فقط

- This page is for testing and development only
- Do not use in production
- All displayed data is for testing purposes only

