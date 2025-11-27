# توضيح مشاكل حقول طلب الشراكة وحلولها

## المشاكل التي تم حلها

### 1. مشكلة `projectId` (معرف المشروع)

#### المشكلة:
- الحقل `projectId` اختياري، لكن Zod كان يتحقق من صحة UUID حتى عندما يكون الحقل فارغًا
- عند إرسال قيمة فارغة (`''`)، كان يظهر خطأ: `"Invalid project ID format (must be UUID)"`
- المشكلة كانت في ترتيب عمليات التحقق في Zod schema

#### الحل:
```typescript
projectId: z
  .union([
    z.literal(''),  // قبول القيمة الفارغة أولاً
    z.string().trim().uuid('Invalid project ID format (must be UUID)'),
  ])
  .transform((val) => (val === '' ? undefined : val))
  .optional()
```

**كيف يعمل الحل:**
1. `z.union()` يقبل إما string فارغ (`''`) أو UUID صحيح
2. `.transform()` يحول القيمة الفارغة إلى `undefined`
3. `.optional()` يجعل الحقل اختياريًا

### 2. مشكلة `proposedAmount` (المبلغ المقترح)

#### المشكلة:
- الحقل اختياري، لكن عند إرسال قيمة فارغة كان يظهر خطأ
- المشكلة كانت في كيفية التعامل مع القيم الفارغة في Zod

#### الحل:
```typescript
proposedAmount: z
  .union([
    z.literal(''),  // قبول القيمة الفارغة
    z.coerce
      .number()
      .positive('Proposed amount must be greater than zero'),
  ])
  .transform((val) => (val === '' ? undefined : val))
  .optional()
```

**كيف يعمل الحل:**
1. `z.union()` يقبل إما string فارغ أو رقم موجب
2. `z.coerce.number()` يحول القيمة إلى رقم تلقائيًا
3. `.transform()` يحول القيمة الفارغة إلى `undefined`

### 3. مشكلة `partnershipPlan` (خطة الشراكة)

#### المشكلة:
- الحقل مطلوب ويجب أن يكون على الأقل 50 حرف
- لم تكن هناك مشاكل في هذا الحقل، لكن تم التأكد من أن `.trim()` يعمل بشكل صحيح

#### الحل:
```typescript
partnershipPlan: z
  .string()
  .trim()
  .min(50, 'Partnership plan must be at least 50 characters')
  .max(5000, 'Partnership plan must be 5000 characters or fewer')
```

### 4. مشكلة `notes` (ملاحظات)

#### المشكلة:
- الحقل اختياري، لكن عند إرسال قيمة فارغة كان يظهر خطأ
- نفس مشكلة `projectId`

#### الحل:
```typescript
notes: z
  .union([
    z.literal(''),  // قبول القيمة الفارغة
    z.string().trim().max(1000, 'Notes must be 1000 characters or fewer'),
  ])
  .transform((val) => (val === '' ? undefined : val))
  .optional()
```

## التغييرات في Backend

### تحديث `createPartnershipRequestSchema` في `backend/src/schemas/request.schema.ts`

تم تطبيق نفس الحلول على الـ backend schema لضمان التطابق مع الـ frontend:

```typescript
export const createPartnershipRequestSchema = z.object({
  projectId: z
    .union([
      z.literal(''),
      z.string().trim().uuid('Invalid project ID format (must be UUID)'),
    ])
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  // ... باقي الحقول
});
```

### تحديث `createPartnershipRequest` في `backend/src/services/request.service.ts`

تم تحديث الكود لبناء كائن `metadata` بشكل صحيح:

```typescript
// Build metadata object - only include defined values
const metadata: Record<string, unknown> = {
  partnershipPlan: params.payload.partnershipPlan,
};

if (params.payload.projectId) {
  metadata.projectId = params.payload.projectId;
}

if (params.payload.proposedAmount != null) {
  metadata.proposedAmount = params.payload.proposedAmount;
}
```

**التحسينات:**
- يتم إضافة `projectId` فقط إذا كان موجودًا
- يتم إضافة `proposedAmount` فقط إذا كان موجودًا
- `partnershipPlan` مطلوب دائمًا

## التغييرات في Frontend

### تحديث `PartnershipRequestForm` في `frontend/src/components/request/PartnershipRequestForm.tsx`

1. **تحديث Schema:**
   - استخدام `z.union()` مع `z.literal('')` لقبول القيم الفارغة
   - استخدام `.transform()` لتحويل القيم الفارغة إلى `undefined`

2. **تحديث `onSubmit`:**
   - إزالة `.trim()` من `onSubmit` لأن الـ schema يقوم بذلك
   - إرسال القيم مباشرة من الـ form

## قاعدة البيانات (Supabase)

### التحقق من البنية:
- عمود `metadata` موجود في جدول `requests` (نوع JSONB)
- القيمة الافتراضية: `'{}'::jsonb`
- البيانات تُحفظ بشكل صحيح في `metadata`

### مثال على البيانات المحفوظة:
```json
{
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "proposedAmount": 100000,
  "partnershipPlan": "This is a detailed partnership plan..."
}
```

## الدروس المستفادة

1. **ترتيب العمليات في Zod مهم جدًا:**
   - يجب وضع `z.literal('')` أولاً في `z.union()` لقبول القيم الفارغة
   - `.transform()` يجب أن يأتي بعد `.union()` لتحويل القيم الفارغة

2. **التطابق بين Frontend و Backend:**
   - يجب أن تكون الـ schemas متطابقة في Frontend و Backend
   - هذا يضمن التحقق من صحة البيانات في كلا الجانبين

3. **التعامل مع القيم الاختيارية:**
   - استخدام `z.union()` مع `z.literal('')` أفضل من `.optional()` فقط
   - `.transform()` ضروري لتحويل القيم الفارغة إلى `undefined`

## الاختبار

للتحقق من أن كل شيء يعمل بشكل صحيح:

1. **اختبار مع `projectId` فارغ:**
   - يجب أن يتم قبول الطلب بدون أخطاء
   - `projectId` يجب أن يكون `undefined` في `metadata`

2. **اختبار مع `projectId` صحيح:**
   - يجب أن يتم قبول UUID صحيح
   - `projectId` يجب أن يُحفظ في `metadata`

3. **اختبار مع `projectId` غير صحيح:**
   - يجب أن يظهر خطأ التحقق من صحة البيانات
   - يجب أن يمنع إرسال الطلب

4. **اختبار `partnershipPlan`:**
   - يجب أن يرفض القيم أقل من 50 حرف
   - يجب أن يقبل القيم من 50 إلى 5000 حرف

## الخلاصة

تم حل جميع المشاكل المتعلقة بالحقول الاختيارية في طلب الشراكة:
- ✅ `projectId` - يعمل بشكل صحيح (اختياري، UUID عند التوفير)
- ✅ `proposedAmount` - يعمل بشكل صحيح (اختياري، رقم موجب عند التوفير)
- ✅ `partnershipPlan` - يعمل بشكل صحيح (مطلوب، 50-5000 حرف)
- ✅ `notes` - يعمل بشكل صحيح (اختياري، حتى 1000 حرف)

جميع البيانات تُحفظ بشكل صحيح في عمود `metadata` في قاعدة البيانات.

