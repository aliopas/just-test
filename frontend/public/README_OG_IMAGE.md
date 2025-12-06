# إنشاء صورة og-image.png

## 📋 المطلوب

يجب إنشاء ملف `og-image.png` بحجم 1200x630 بكسل من اللوجو الحقيقي في `docs/images/logo.png`.

هذه الصورة ستستخدم في:
- ✅ Google Search Results
- ✅ Facebook Open Graph
- ✅ Twitter Cards
- ✅ LinkedIn Sharing

## 🛠️ الخطوات

### الطريقة 1: باستخدام أدوات التصميم (مُوصى بها)

1. افتح `docs/images/logo.png` في Photoshop/GIMP/Canva/Figma
2. أنشئ canvas جديد بحجم 1200x630 بكسل
3. ضع اللوجو في منتصف الصورة
4. أضف خلفية بلون العلامة التجارية (مثلاً: #2D6FA3 أو أبيض)
5. احفظ الملف كـ `og-image.png` في مجلد `frontend/public/`

### الطريقة 2: باستخدام أدوات Online

استخدم أحد الأدوات التالية:
- [Canva](https://www.canva.com/) - ابحث عن "Open Graph Image"
- [og-image.vercel.app](https://og-image.vercel.app/)
- [Bannerbear](https://www.bannerbear.com/tools/open-graph-image-generator/)

### الطريقة 3: باستخدام ImageMagick

```bash
cd frontend/public

# نسخ اللوجو
cp ../../docs/images/logo.png logo-temp.png

# إنشاء صورة 1200x630 مع اللوجو في المنتصف
magick logo-temp.png -resize 800x800 -gravity center -extent 1200x630 -background "#2D6FA3" og-image.png

# حذف الملف المؤقت
rm logo-temp.png
```

## ✅ التحقق

بعد إنشاء `og-image.png`:

1. تأكد من وجود الملف في `frontend/public/og-image.png`
2. افتح الملف وتأكد من أن اللوجو واضح ومركّز
3. اختبر في [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
4. اختبر في [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 📐 المواصفات

- **الحجم**: 1200x630 بكسل
- **التنسيق**: PNG
- **الخلفية**: بلون العلامة التجارية أو أبيض
- **اللوجو**: يجب أن يكون واضحاً ومركّزاً

