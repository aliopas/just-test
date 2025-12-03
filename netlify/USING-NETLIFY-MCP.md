# استخدام Netlify MCP للتحقق من المشروع

## 🔍 لماذا Netlify MCP؟

Netlify MCP (Model Context Protocol) يسمح لنا بـ:
- ✅ التحقق من حالة المشروع مباشرة
- ✅ فحص Deployments و Build Logs
- ✅ التحقق من Functions و Logs
- ✅ فحص Environment Variables
- ✅ اكتشاف المشاكل بسرعة

---

## 📋 ما تم التحقق منه حتى الآن

### معلومات المستخدم:
- ✅ Email: rafrs2030@gmail.com
- ✅ Site Count: 2 sites
- ✅ Account ID: 691838e462d40b491c7486d1

---

## 🔄 الخطوات التالية

### 1. الحصول على قائمة المشاريع

**المشروع المتوقع:** `investor-bacura` أو مشابه

### 2. الحصول على Site ID

بعد العثور على المشروع، نحتاج Site ID للوصول إلى:
- Deployments
- Functions
- Environment Variables

### 3. فحص آخر Deployment

- حالة البناء (Success/Failed/Canceled)
- Build logs
- الأخطاء

### 4. فحص Functions

- Function: `server`
- Logs
- Environment Variables status

---

## 🚀 استخدام Netlify CLI (بديل)

إذا كان Netlify CLI مثبتاً:

```bash
# الحصول على حالة المشروع
netlify status

# عرض Environment Variables
netlify env:list

# عرض Functions
netlify functions:list

# عرض Logs
netlify functions:log server

# عرض Deployments
netlify deploy:list
```

---

## 📝 ملاحظات

1. **Netlify MCP يتطلب Site ID:**
   - نحتاج Site ID للوصول إلى تفاصيل المشروع
   - يمكن البحث عن المشروع بالاسم

2. **التحقق اليدوي:**
   - يمكن التحقق من Netlify Dashboard مباشرة
   - https://app.netlify.com

---

## 🔗 روابط مفيدة

- Netlify Dashboard: https://app.netlify.com
- Netlify Docs: https://docs.netlify.com
- Netlify MCP Docs: (راجع MCP documentation)

---

**جاهز للتحقق!** 🔍

