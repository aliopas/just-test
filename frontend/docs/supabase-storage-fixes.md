# إصلاحات Supabase Storage و Authentication

## المشاكل التي تم إصلاحها

### 1. مشاكل استرجاع الصور من Supabase Storage

#### المشكلة:
- الصور لا تُحمّل بشكل صحيح من Supabase Storage
- عدم وجود fallback عند فشل التحميل
- مشاكل في بناء URL للصور

#### الحلول المطبقة:

**أ. تحسين `getStoragePublicUrl`:**
- إضافة دعم للصور العامة والخاصة
- إضافة خيار `useDirectUrl` لاستخدام URL مباشر بدون Supabase client
- دعم تحويل الصور (transform) مع معالجة صحيحة للأنواع
- إضافة fallback تلقائي عند فشل استخدام Supabase client

**ب. إنشاء مكون `SupabaseImage`:**
- مكون React جاهز للاستخدام مع:
  - معالجة تلقائية للأخطاء
  - حالات التحميل
  - دعم الصور العامة والخاصة
  - Fallback images
  - دعم تحويل الصور

**مثال الاستخدام:**
```tsx
import { SupabaseImage } from '@/components/SupabaseImage';

<SupabaseImage
  bucket="news-images"
  path={item.cover_key}
  alt={item.title}
  isPublic={true}
  fallbackSrc="/placeholder.png"
  style={{ width: '100%', height: '200px' }}
/>
```

### 2. مشاكل Authentication في Supabase Client

#### المشكلة:
- Session لا يتم حفظه بشكل صحيح بعد تسجيل الدخول
- Tokens لا يتم تحديثها تلقائياً
- مشاكل في الوصول للصور المحمية

#### الحلول المطبقة:

**أ. تحسين `getSupabaseBrowserClient`:**
- إضافة `resetSupabaseClient()` لإعادة تهيئة العميل
- تحقق من صحة Session بشكل دوري
- إضافة `onAuthStateChange` listener لتحديث Session تلقائياً
- تحسين معالجة الأخطاء

**ب. تحسين `useLogin` hook:**
- معالجة أفضل للأخطاء عند تعيين Session
- رسائل console واضحة للمطورين
- Fallback mechanisms عند فشل تعيين Session
- التأكد من حفظ Tokens حتى لو فشل تعيين Session في Supabase

**مثال الاستخدام:**
```tsx
const { mutate: login } = useLogin();

login(
  { email: 'user@example.com', password: 'password' },
  {
    onSuccess: () => {
      // Session سيتم تعيينه تلقائياً في Supabase
      // Tokens محفوظة في localStorage
    },
  }
);
```

### 3. تحسينات إضافية

**أ. تحسين `buildDirectPublicUrl`:**
- إضافة fallback لبناء URL من SUPABASE config مباشرة
- معالجة أفضل للأخطاء

**ب. دعم أفضل للصور المحمية:**
- استخدام `getStorageSignedUrl` للصور في buckets خاصة
- تجديد تلقائي للـ signed URLs عند انتهاء صلاحيتها

## كيفية الاستخدام

### للصور العامة:
```tsx
import { getStoragePublicUrl, NEWS_IMAGES_BUCKET } from '@/utils/supabase-storage';

const imageUrl = getStoragePublicUrl(NEWS_IMAGES_BUCKET, coverKey);
// أو مع تحويلات
const optimizedUrl = getStoragePublicUrl(NEWS_IMAGES_BUCKET, coverKey, {
  transform: { width: 800, height: 600, quality: 80 }
});
```

### للصور المحمية:
```tsx
import { getStorageSignedUrl } from '@/utils/supabase-storage';

const signedUrl = await getStorageSignedUrl('private-bucket', path, 3600);
```

### استخدام المكون الجاهز:
```tsx
import { SupabaseImage } from '@/components/SupabaseImage';

<SupabaseImage
  bucket="news-images"
  path={coverKey}
  alt="News cover"
  isPublic={true}
  transform={{ width: 800, quality: 80 }}
  onLoad={() => console.log('Image loaded')}
  onError={(err) => console.error('Failed to load:', err)}
/>
```

## ملاحظات مهمة

1. **الصور العامة:** لا تحتاج authentication ويمكن الوصول إليها مباشرة
2. **الصور المحمية:** تحتاج signed URLs التي تنتهي صلاحيتها بعد فترة محددة
3. **Session Management:** يتم إدارة Session تلقائياً بعد تسجيل الدخول
4. **Error Handling:** جميع الدوال تحتوي على fallback mechanisms

## استكشاف الأخطاء

### الصور لا تظهر:
1. تحقق من أن bucket موجود و public (للصور العامة)
2. تحقق من أن path صحيح
3. استخدم `SupabaseImage` component للحصول على error messages
4. تحقق من console للأخطاء

### Authentication لا يعمل:
1. تحقق من أن `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` معرّفة
2. تحقق من console بعد تسجيل الدخول
3. استخدم `resetSupabaseClient()` لإعادة تهيئة العميل

