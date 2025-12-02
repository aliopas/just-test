# إصلاح خطأ البناء في Netlify

## الخطأ

```
Type error: Property 'id' does not exist on type '{ id: string; } | null'.
  95 |   const { id: projectId } = useParams<{ id: string }>();
```

في `frontend/src/pages/InvestorProjectDetailPage.tsx`

## الحل

تم إصلاح نفس المشكلة في `InvestorNewsDetailPage.tsx` سابقاً، لكن نسينا إصلاحها في `InvestorProjectDetailPage.tsx`.

### التغيير المطبق:

**من:**
```typescript
const { id: projectId } = useParams<{ id: string }>();
```

**إلى:**
```typescript
const params = useParams<{ id: string }>();
const projectId = params?.id;
```

## السبب

في Next.js، `useParams()` قد يعيد `null`، لذلك يجب التحقق من القيمة قبل استخدام destructuring مباشرة.

## النتيجة

✅ تم إصلاح الخطأ
✅ لا توجد أخطاء TypeScript
✅ البناء يجب أن يعمل الآن

