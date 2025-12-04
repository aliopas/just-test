# استخدام Supabase مباشرة في Frontend

هذا الدليل يوضح كيفية استخدام Supabase مباشرة لعرض البيانات على الصفحات بدون الحاجة لـ API backend.

## الملفات المُنشأة

### 1. `src/hooks/useSupabaseData.ts`
Hook عام لاستخدام Supabase مباشرة مع دعم:
- الفلترة (filters)
- الترتيب (ordering)
- التصفح (pagination)
- التحديثات الفورية (realtime updates)

### 2. `src/hooks/useSupabaseTables.ts`
Hooks مخصصة للجداول الشائعة في المشروع:
- `useNews()` - جلب الأخبار
- `useProjects()` - جلب المشاريع
- `useCompanyProfiles()` - جلب ملفات الشركة
- `useMarketValue()` - جلب القيمة السوقية
- وغيرها...

### 3. `app/(investor)/test-supabase-direct/page.tsx`
صفحة تجريبية توضح كيفية استخدام الـ hooks

## أمثلة الاستخدام

### مثال 1: جلب الأخبار

```tsx
import { useNews } from '@/hooks/useSupabaseTables';

function NewsList() {
  const { data: news, isLoading } = useNews({
    limit: 10,
    audience: 'public',
    enableRealtime: true, // تحديثات فورية
  });

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {news.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.body_md}</p>
        </div>
      ))}
    </div>
  );
}
```

### مثال 2: استخدام الـ Hook العام

```tsx
import { useSupabaseData } from '@/hooks/useSupabaseData';

function CustomData() {
  const { data, isLoading } = useSupabaseData({
    table: 'users',
    filters: [
      { column: 'role', value: 'investor' },
      { column: 'status', value: 'active' },
    ],
    orderBy: { column: 'created_at', ascending: false },
    limit: 20,
  });

  // استخدام البيانات...
}
```

### مثال 3: جلب صف واحد فقط

```tsx
import { useSupabaseSingle } from '@/hooks/useSupabaseData';

function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useSupabaseSingle({
    table: 'users',
    filters: [{ column: 'id', value: userId }],
  });

  if (!user) return <div>المستخدم غير موجود</div>;

  return <div>{user.email}</div>;
}
```

### مثال 4: العد فقط

```tsx
import { useSupabaseCount } from '@/hooks/useSupabaseData';

function NewsCount() {
  const { data: count } = useSupabaseCount({
    table: 'news',
    filters: [{ column: 'status', value: 'published' }],
  });

  return <div>عدد الأخبار: {count}</div>;
}
```

### مثال 5: جلب محتوى الشركة

```tsx
import { useCompanyProfiles, useCompanyPartners } from '@/hooks/useSupabaseTables';
import { useLanguage } from '@/context/LanguageContext';

function CompanyContent() {
  const { language } = useLanguage();
  const { data: profiles } = useCompanyProfiles();
  const { data: partners } = useCompanyPartners();

  return (
    <div>
      <h2>ملفات الشركة</h2>
      {profiles.map((profile) => (
        <div key={profile.id}>
          <h3>{language === 'ar' ? profile.title_ar : profile.title_en}</h3>
          <p>{language === 'ar' ? profile.content_ar : profile.content_en}</p>
        </div>
      ))}

      <h2>الشركاء</h2>
      {partners.map((partner) => (
        <div key={partner.id}>
          <h3>{language === 'ar' ? partner.name_ar : partner.name_en}</h3>
        </div>
      ))}
    </div>
  );
}
```

## الفلاتر المتاحة

يمكنك استخدام الفلاتر التالية:

- `eq` - يساوي (افتراضي)
- `neq` - لا يساوي
- `gt` - أكبر من
- `gte` - أكبر من أو يساوي
- `lt` - أصغر من
- `lte` - أصغر من أو يساوي
- `like` - يحتوي على (case-sensitive)
- `ilike` - يحتوي على (case-insensitive)
- `in` - موجود في القائمة
- `is` - هو (null check)

مثال:
```tsx
filters: [
  { column: 'status', value: 'published' },
  { column: 'title', operator: 'ilike', value: '%test%' },
  { column: 'created_at', operator: 'gte', value: '2024-01-01' },
]
```

## التحديثات الفورية (Realtime)

لتفعيل التحديثات الفورية، استخدم `enableRealtime: true`:

```tsx
const { data } = useSupabaseData({
  table: 'news',
  enableRealtime: true, // سيتم تحديث البيانات تلقائياً عند تغييرها في Supabase
});
```

## ملاحظات مهمة

1. **RLS Policies**: تأكد من أن Row Level Security (RLS) policies في Supabase تسمح بالوصول للبيانات المطلوبة
2. **الأمان**: لا تستخدم هذه الطريقة للبيانات الحساسة التي تحتاج لتحقق إضافي
3. **الأداء**: استخدم `limit` و `select` لتقليل كمية البيانات المُنقلة
4. **Caching**: البيانات يتم تخزينها مؤقتاً لمدة 5 دقائق افتراضياً

## الصفحة التجريبية

يمكنك زيارة `/test-supabase-direct` لرؤية مثال كامل على الاستخدام.

