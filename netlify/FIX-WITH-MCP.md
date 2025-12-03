# 🔧 إصلاح المشكلة باستخدام MCP

**التاريخ:** اليوم  
**الهدف:** استخدام Netlify MCP لإصلاح مشكلة 502 Bad Gateway

---

## 🎯 الخطة

1. ✅ التحقق من Supabase (تم - يعمل)
2. 🔄 فحص Environment Variables في Netlify
3. 🔄 إضافة Environment Variables المفقودة
4. 🔄 إعادة بناء الموقع

---

## 📊 حالة Supabase

- ✅ **Project URL:** `https://wtvvzthfpusnqztltkkv.supabase.co`
- ✅ **Anon Key:** متاح
- ✅ **الاتصال:** يعمل بشكل صحيح
- ✅ **قاعدة البيانات:** 34 جدول، 6 مستخدمين

---

## 🔄 الخطوات باستخدام MCP

### الخطوة 1: العثور على Site ID

**نحتاج Site ID للتحقق من Environment Variables**

**الخيارات:**
1. الحصول عليه يدوياً من Netlify Dashboard
2. البحث عن المشروع باستخدام MCP

### الخطوة 2: التحقق من Environment Variables

بعد الحصول على Site ID:
- فحص Environment Variables الحالية
- تحديد المتغيرات المفقودة

### الخطوة 3: إضافة Environment Variables

- `SUPABASE_URL` = `https://wtvvzthfpusnqztltkkv.supabase.co`
- `SUPABASE_ANON_KEY` = (من Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` = (من Supabase)

### الخطوة 4: إعادة بناء الموقع

بعد إضافة Environment Variables، نحتاج إلى إعادة البناء.

---

## 📝 ملاحظات

- Netlify MCP يتطلب Site ID للوصول إلى Environment Variables
- يمكن الحصول على Site ID من Netlify Dashboard
- بعد الحصول على Site ID، يمكن استخدام MCP لإضافة Environment Variables

---

**الخطوة التالية:** الحصول على Site ID من Netlify Dashboard

