# استكشاف أخطاء البناء في Netlify

## المشكلة: البناء يتم إلغاؤه (Canceled) في Netlify

### الأسباب المحتملة

#### 1. البناء يستغرق وقتًا طويلاً (Timeout)

**المشكلة:**
- البناء يستغرق وقتًا طويلاً ويتجاوز الحد الأقصى المسموح به
- Netlify Free: 5 دقائق
- Netlify Pro: 15 دقيقة

**الحل:**
1. **تحسين سرعة البناء:**
   - ✅ تم تحسين الـ build script لعدم حذف `node_modules` (Netlify يخبئه)
   - ✅ استخدام `npm ci` بدلاً من `npm install` (أسرع)
   - ✅ استخدام `--prefer-offline` للاعتماد على الـ cache

2. **تفعيل Build Caching في Netlify:**
   - Netlify يخبئ `node_modules` تلقائيًا
   - تأكد من تفعيل Build caching في Settings

3. **زيادة Build Timeout (للخطط المدفوعة):**
   - في `netlify.toml`:
   ```toml
   [build]
     timeout = 900  # 15 دقيقة (للخطط المدفوعة فقط)
   ```

#### 2. خطأ في الـ Build Script

**المشكلة:**
- خطأ في الـ build script يؤدي إلى إيقاف البناء

**الحل:**
1. **تحقق من Build Logs:**
   - اذهب إلى Netlify Dashboard > **Deploys**
   - اختر آخر deploy
   - تحقق من Build logs للبحث عن الأخطاء

2. **تحسين الـ Build Script:**
   - ✅ تم تحسين `frontend/scripts/netlify-build.sh`
   - ✅ إضافة معالجة أفضل للأخطاء
   - ✅ إضافة logging أفضل

#### 3. مشاكل في المسارات (Paths)

**المشكلة:**
- `base = "frontend"` قد يسبب مشاكل في المسارات

**الحل:**
- ✅ تم إعداد `base = "frontend"` بشكل صحيح
- ✅ جميع المسارات نسبية من `base`

## التحسينات المطبقة

### 1. تحسين Build Script

**قبل:**
- كان يحذف `node_modules` في كل مرة (بطيء جدًا)
- كان يستخدم `npm install` فقط

**بعد:**
- ✅ يحذف `.next` فقط
- ✅ يستخدم `npm ci` (أسرع وأكثر موثوقية)
- ✅ يستخدم `--prefer-offline` للاعتماد على الـ cache
- ✅ يتحقق من وجود `fix-build-paths.js` قبل استدعائه
- ✅ إضافة logging أفضل

### 2. تحسين netlify.toml

**الإضافات:**
- ✅ `NPM_FLAGS = "--prefer-offline --no-audit --no-fund"` لتسريع `npm install`
- ✅ تعليقات توضيحية حول timeout

## خطوات التشخيص

### 1. تحقق من Build Logs

```bash
# في Netlify Dashboard:
# Deploys > [Latest Deploy] > Build log
```

ابحث عن:
- وقت البناء (Build time)
- أي أخطاء أو تحذيرات
- أي خطوات تأخذ وقتًا طويلاً

### 2. تحقق من Build Settings

في Netlify Dashboard:
- **Site settings** > **Build & deploy** > **Build settings**
- تأكد من:
  - Base directory: `frontend`
  - Build command: `chmod +x scripts/netlify-build.sh && bash scripts/netlify-build.sh`
  - Publish directory: `.next`

### 3. تحقق من Build Caching

في Netlify Dashboard:
- **Site settings** > **Build & deploy** > **Build plugins**
- تأكد من تفعيل Build caching

### 4. تحقق من Build Timeout

```bash
# Free plan: 5 دقائق (300 ثانية)
# Pro plan: 15 دقيقة (900 ثانية)
```

إذا كان البناء يستغرق أكثر من 5 دقائق:
- فكر في ترقية الخطة
- أو قم بتحسين البناء أكثر

## نصائح لتسريع البناء

### 1. استخدام Build Cache

Netlify يخبئ تلقائيًا:
- `node_modules` (إذا لم يتم حذفه)
- `.next/cache` (للـ Next.js)

### 2. تقليل Dependencies

- استخدم فقط الـ dependencies المطلوبة
- احذف الـ dependencies غير المستخدمة

### 3. استخدام npm ci

- `npm ci` أسرع من `npm install`
- يضمن نفس الـ dependencies في كل مرة

### 4. تقليل حجم المشروع

- احذف الملفات غير الضرورية
- استخدم `.netlifyignore` لتجاهل الملفات الكبيرة

## حلول إضافية

### إذا استمرت المشكلة:

1. **قسّم البناء:**
   - استخدم Netlify Build Plugins
   - قسّم البناء إلى خطوات أصغر

2. **استخدم Build Optimization:**
   - في `next.config.js`:
   ```js
   module.exports = {
     // تحسينات البناء
     swcMinify: true,
     compiler: {
       removeConsole: process.env.NODE_ENV === 'production',
     },
   }
   ```

3. **استخدم Build Hooks:**
   - استخدم Netlify Build Hooks لبناء أجزاء محددة فقط

## ملاحظات مهمة

1. **Build Timeout:**
   - Free plan: 5 دقائق
   - Pro plan: 15 دقيقة
   - Enterprise: قابل للتخصيص

2. **Build Cache:**
   - Netlify يخبئ `node_modules` تلقائيًا
   - لا تحذف `node_modules` في الـ build script

3. **Build Logs:**
   - تحقق من Build logs بعد كل deploy
   - ابحث عن الخطوات التي تأخذ وقتًا طويلاً

## الاتصال بالدعم

إذا استمرت المشكلة بعد تجربة جميع الحلول:
1. شارك Build logs كاملة
2. شارك وقت البناء
3. شارك حجم المشروع (`du -sh`)

