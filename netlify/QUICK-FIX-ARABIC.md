# 🔧 حل سريع: البيانات لا تظهر في Backend

**المشكلة:** البيانات في Backend Supabase لا تظهر - 502 Bad Gateway

---

## ⚠️ السبب

**Environment Variables مفقودة في Netlify**

---

## ✅ الحل السريع

### 1. أضف Environment Variables في Netlify:

اذهب إلى: https://app.netlify.com
- اختر: `investor-bacura`
- **Site settings** > **Environment variables**

### 2. أضف هذه القيم:

**SUPABASE_URL:**
```
https://wtvvzthfpusnqztltkkv.supabase.co
```

**SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dnZ6dGhmcHVzbnF6dGx0a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzE2MDUsImV4cCI6MjA3NzgwNzYwNX0.6KttJmjGUsgp3xfGf3wBm6kPmrinXB5R6AJJsTB-LWA
```

**SUPABASE_SERVICE_ROLE_KEY:**
(انسخه من Supabase Dashboard)

### 3. أعد بناء الموقع:

- **Deploys** > **Trigger deploy** > **Clear cache and deploy site**

---

## ✅ التحقق

بعد البناء، افتح:
```
https://investor-bacura.netlify.app/api/v1/health
```

**إذا كان 200 OK → تم الحل!** 🎉

---

**راجع:** `netlify/SOLVE-SUPABASE-DATA-ISSUE.md` للحل التفصيلي

