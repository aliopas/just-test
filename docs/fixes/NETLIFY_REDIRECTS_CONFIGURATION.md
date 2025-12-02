# إعدادات Netlify Redirects - Netlify Redirects Configuration

## ✅ **الإعداد النهائي:**

### **المشكلة الأساسية:**
في Netlify، **Next.js rewrites لا تعمل في production build**. يجب الاعتماد على **Netlify redirects** في `netlify.toml` فقط.

---

## 📋 **الإعدادات الصحيحة:**

### **1. `netlify.toml` - Netlify Redirects:**

```toml
# API redirects - MUST come before other redirects
# This redirects all /api/v1/* requests to the serverless function
[[redirects]]
  from = "/api/v1/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
  force = true  # Force redirect even if static file exists
```

**كيف يعمل:**
- Client يطلب: `/api/v1/investor/profile`
- Netlify redirect: `/.netlify/functions/server/investor/profile`
- Serverless function: يعيد بناء المسار إلى `/api/v1/investor/profile`
- Express app: يتلقى المسار الصحيح

---

### **2. `frontend/next.config.js` - Next.js Rewrites:**

```javascript
async rewrites() {
  // ✅ Check Netlify environment
  const isNetlify = 
    process.env.NETLIFY === 'true' || 
    process.env.CONTEXT === 'production';
  
  // ✅ Disable rewrites in Netlify
  if (isNetlify) {
    return [];  // Empty array = no rewrites
  }
  
  // ✅ Only use rewrites in local development
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
    ];
  }
  
  return [];
}
```

**التحقق من البيئة:**
- `NETLIFY === 'true'` → Netlify build
- `CONTEXT === 'production'` → Netlify production deploy
- `NODE_ENV === 'development'` → Local development

---

### **3. `netlify/functions/server.ts` - Serverless Function:**

```typescript
export const handler = async (event: any, context: any) => {
  // Reconstruct path: /.netlify/functions/server/investor/profile
  // → /api/v1/investor/profile
  if (event.path?.startsWith('/.netlify/functions/server')) {
    const splat = event.path.replace('/.netlify/functions/server', '');
    event.path = `/api/v1${splat}`;
  }
  
  return serverless(app, {...})(event, context);
};
```

---

## 🔄 **كيف يعمل النظام:**

### **Local Development:**
```
Client → /api/v1/investor/profile
      → Next.js Rewrite (next.config.js)
      → http://localhost:3001/api/v1/investor/profile
      → Express Backend
```

### **Netlify Production:**
```
Client → /api/v1/investor/profile
      → Netlify Redirect (netlify.toml)
      → /.netlify/functions/server/investor/profile
      → Serverless Function (rebuilds path)
      → /api/v1/investor/profile
      → Express App
```

---

## ✅ **التحقق من الإعداد:**

### **1. في Local Development:**
```bash
cd frontend
npm run dev
# ✅ Next.js rewrites تعمل
# ✅ الطلبات تذهب إلى http://localhost:3001
```

### **2. في Netlify Build:**
```bash
# ✅ Next.js rewrites معطلة (return [])
# ✅ Netlify redirects تعمل
# ✅ الطلبات تذهب إلى serverless function
```

---

## 🔍 **ملاحظات مهمة:**

1. ⚠️ **Next.js rewrites في production على Netlify = لا تعمل**
   - حتى لو كانت موجودة في `next.config.js`
   - يجب الاعتماد على Netlify redirects فقط

2. ✅ **`force = true` في netlify.toml**
   - يضمن أن الـ redirect يعمل حتى لو كان هناك ملف static

3. ✅ **Serverless function path handling**
   - يجب إعادة بناء المسار من `/.netlify/functions/server/:splat` إلى `/api/v1/:splat`

4. ✅ **Environment detection**
   - استخدام `NETLIFY === 'true'` و `CONTEXT === 'production'` للتحقق

---

## 🚀 **بعد التصحيح:**

1. **Commit:**
   ```bash
   git add .
   git commit -m "Fix: Disable Next.js rewrites in Netlify, rely on redirects only"
   git push
   ```

2. **Netlify Build:**
   - ✅ Next.js rewrites = معطلة (empty array)
   - ✅ Netlify redirects = تعمل
   - ✅ API requests = تعمل بشكل صحيح

---

**تاريخ الإنشاء:** الآن  
**الحالة:** ✅ جاهز - Next.js rewrites معطلة في Netlify

