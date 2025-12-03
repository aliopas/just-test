# 🚀 دليل إعادة الرفع على Netlify

**التاريخ:** اليوم  
**المشكلة:** Deploy canceled - يحتاج إعادة رفع

---

## ✅ إعادة الرفع

### الطريقة 1: من Netlify Dashboard

1. **اذهب إلى:** https://app.netlify.com
2. **اختر موقعك:** `investor-bacura`
3. **Deploys** tab
4. **Trigger deploy** > **Deploy site**
5. انتظر حتى ينتهي البناء

### الطريقة 2: من GitHub

1. **اذهب إلى:** GitHub repository
2. **Actions** tab
3. ابحث عن آخر workflow run
4. **Re-run jobs** أو **Re-run failed jobs**

### الطريقة 3: Push جديد

1. **في Terminal:**
   ```bash
   git add .
   git commit -m "fix: improve backend routes path reconstruction"
   git push
   ```
2. Netlify سيرفع تلقائياً

---

## 🔍 أسباب الإلغاء المحتملة

1. ⏱️ **تجاوز وقت البناء** - Build timeout
2. 🔄 **إلغاء يدوي** - Manual cancel
3. ⚠️ **خطأ في البناء** - Build error
4. 💾 **مشاكل في الذاكرة** - Memory issues

---

## 📋 Checklist قبل إعادة الرفع

- [ ] Environment Variables موجودة في Netlify
- [ ] الكود محدث (تم إصلاح مسارات Backend)
- [ ] لا أخطاء في الكود المحلي
- [ ] جاهز للرفع

---

## 🚀 بعد الرفع

تحقق من:
1. **Build Logs** - يجب أن تكون ناجحة
2. **Function Logs** - يجب أن تظهر Environment Variables
3. **Health Check** - `https://investor-bacura.netlify.app/api/v1/health`

---

**الخطوة التالية:** إعادة الرفع من Netlify Dashboard

