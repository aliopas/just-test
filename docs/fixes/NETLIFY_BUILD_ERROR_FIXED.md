# إصلاح خطأ البناء في Netlify - InvestorProjectDetailPage

## الخطأ في البناء

```
Type error: Property 'id' does not exist on type '{ id: string; } | null'.
  95 |   const { id: projectId } = useParams<{ id: string }>();
```

## ✅ الحل المطبق

تم إصلاح نفس المشكلة التي كانت في `InvestorNewsDetailPage.tsx`.

### التغيير:

**من (خطأ):**
```typescript
const { id: projectId } = useParams<{ id: string }>();
```

**إلى (صحيح):**
```typescript
const params = useParams<{ id: string }>();
const projectId = params?.id;
```

## السبب

في Next.js، `useParams()` قد يعيد `null` أثناء SSR أو في حالات معينة. لذلك يجب التحقق من القيمة قبل استخدام destructuring مباشرة.

## التحقق

- ✅ الكود محلياً صحيح
- ✅ لا توجد أخطاء linter محلياً
- ✅ نفس الحل مطبق في `InvestorNewsDetailPage.tsx`

## الملف المعدل

`frontend/src/pages/InvestorProjectDetailPage.tsx`

السطر 95-96:
```typescript
const params = useParams<{ id: string }>();
const projectId = params?.id;
```

---

**ملاحظة**: إذا استمر الخطأ في Netlify، قد يحتاج الملف إلى push إلى Git أولاً.


