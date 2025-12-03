# 🚀 تعليمات إعادة الرفع

**التاريخ:** اليوم  
**الحالة:** Deploy canceled - يحتاج إعادة رفع

---

## ✅ التغييرات المطبقة

1. ✅ تحسين مسارات Backend في `netlify/functions/server.ts`
2. ✅ تحديث Supabase config لاستخدام `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

---

## 🚀 إعادة الرفع

### الطريقة 1: من Netlify Dashboard (الأسرع)

1. **اذهب إلى:** https://app.netlify.com
2. **اختر:** `investor-bacura`
3. **Deploys** > **Trigger deploy** > **Deploy site**
4. انتظر حتى ينتهي البناء

### الطريقة 2: Push جديد (يفعل الرفع التلقائي)

```bash
git add netlify/functions/server.ts frontend/src/config/supabase.config.ts
git commit -m "fix: improve backend routes and supabase config"
git push
```

---

## 📋 بعد الرفع

تحقق من:
1. ✅ Build Logs - نجاح
2. ✅ Function Logs - Environment Variables موجودة
3. ✅ Health Check - `https://investor-bacura.netlify.app/api/v1/health`
4. ✅ البيانات - `https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar`

---

**الخطوة التالية:** إعادة الرفع من Netlify Dashboard

