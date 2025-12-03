# 🚨 ملخص: إصلاح 502 Bad Gateway

**الحالة:** ⚠️ عاجل  
**المشكلة:** Netlify Function لا تعمل

---

## ⚠️ المشكلة

```
GET /api/v1/public/company-profile?lang=ar 502 (Bad Gateway)
POST /api/v1/auth/login 502 (Bad Gateway)
```

**السبب:** Netlify Function لا تعمل بسبب:
- ❌ Environment Variables مفقودة في Netlify Dashboard
- أو
- ❌ Backend app فشل في التحميل

---

## ✅ الحل في 3 خطوات

### الخطوة 1: أضف Environment Variables في Netlify

1. **اذهب إلى:** https://app.netlify.com
2. **اختر:** investor-bacura
3. **Site settings** > **Environment variables**

**أضف:**

| Key | Value | من أين |
|-----|-------|--------|
| `SUPABASE_URL` | `https://wtvvzthfpusnqztltkkv.supabase.co` | Supabase Dashboard |
| `SUPABASE_ANON_KEY` | (انسخ من Supabase) | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | (انسخ من Supabase) ⚠️ | Supabase Dashboard |

**مهم:**
- ✅ Scopes = **All scopes**
- ✅ Context = **All contexts**

### الخطوة 2: أعد بناء الموقع

1. **Deploys** > **Trigger deploy**
2. **Clear cache and deploy site**
3. انتظر حتى ينتهي البناء

### الخطوة 3: تحقق من النجاح

1. **Function Logs:**
   - Functions > server > Logs
   - يجب أن ترى: `hasSupabaseUrl: true`

2. **Health Check:**
   - افتح: `https://investor-bacura.netlify.app/api/v1/health`
   - يجب أن ترى: `{"status":"ok"}`

---

## 📚 الأدلة المتاحة

- `netlify/FIX-502-NOW.md` - حل سريع خطوة بخطوة
- `netlify/URGENT-502-FIX.md` - حل عاجل
- `netlify/502-DIAGNOSIS-GUIDE.md` - دليل تشخيص شامل

---

**الخطوة التالية:** اتبع `netlify/FIX-502-NOW.md`

