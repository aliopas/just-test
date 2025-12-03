# 🚀 إعادة الرفع على Netlify الآن

**التاريخ:** اليوم  
**المشكلة:** Deploy canceled - يحتاج إعادة رفع

---

## ✅ إعادة الرفع السريع

### من Netlify Dashboard:

1. **اذهب إلى:** https://app.netlify.com
2. **اختر موقعك:** `investor-bacura`
3. **Deploys** tab
4. اضغط على **Trigger deploy** (أعلى الصفحة)
5. اختر: **Deploy site**
6. انتظر حتى ينتهي البناء (~3-5 دقائق)

---

## 🔍 التحقق بعد الرفع

### 1. فحص Build Logs

- **Deploys** > **[Latest]** > **Build log**
- تأكد من أن البناء نجح ✅

### 2. فحص Function Logs

- **Functions** > **server** > **Logs**
- يجب أن ترى:
  ```
  [Server Function] Environment check: {
    hasSupabaseUrl: true,
    hasSupabaseAnonKey: true,
    hasSupabaseServiceRoleKey: true
  }
  ```

### 3. اختبار Health Check

افتح:
```
https://investor-bacura.netlify.app/api/v1/health
```

**يجب أن ترى:** `{"status":"ok",...}` ✅

### 4. اختبار API

افتح:
```
https://investor-bacura.netlify.app/api/v1/public/company-profile?lang=ar
```

**يجب أن ترى البيانات من Supabase!** 🎉

---

## 📋 Checklist

- [ ] أعدت الرفع من Netlify Dashboard
- [ ] Build Logs تظهر نجاح
- [ ] Function Logs تظهر Environment Variables
- [ ] Health Check يعمل
- [ ] البيانات تظهر الآن

---

**الخطوة التالية:** إعادة الرفع من Netlify Dashboard

