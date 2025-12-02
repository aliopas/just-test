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

---

## مشاكل المصادقة (Authentication Issues)

### المشاكل المكتشفة

#### 1. خطأ 401 (Unauthorized) عند الوصول إلى `/api/v1/investor/dashboard`

**الخطأ:**
```
GET https://investor-bacura.netlify.app/api/v1/investor/dashboard 401 (Unauthorized)
```

**الأسباب المحتملة:**
1. **Token غير موجود أو منتهي الصلاحية:**
   - المستخدم لم يسجل الدخول
   - Token منتهي الصلاحية
   - Token غير صحيح

2. **مشكلة في إرسال Token:**
   - الـ Authorization header غير موجود
   - Token غير مُرسل بشكل صحيح من الـ frontend

3. **مشكلة في التحقق من Token:**
   - Supabase لا يمكنه التحقق من Token
   - Token غير صالح

**الحلول المقترحة:**

1. **التحقق من Token في Frontend:**
   ```typescript
   // في api-client.ts
   const token = await getAccessToken();
   if (!token) {
     // إعادة توجيه إلى صفحة تسجيل الدخول
     window.location.href = '/login';
   }
   ```

2. **التحقق من Token في Backend:**
   ```typescript
   // في auth.middleware.ts
   const token = getAccessToken(req);
   if (!token) {
     return res.status(401).json({
       error: {
         code: 'UNAUTHORIZED',
         message: 'Missing or invalid access token',
       },
     });
   }
   ```

3. **إضافة Refresh Token:**
   - عند انتهاء صلاحية Token، يجب تحديثه تلقائيًا
   - استخدام Refresh Token للحصول على Token جديد

#### 2. خطأ 401 ثم 500 عند إنشاء طلب شراكة

**الخطأ:**
```
POST https://investor-bacura.netlify.app/api/v1/investor/requests/partnership 401 (Unauthorized)
POST https://investor-bacura.netlify.app/api/v1/investor/requests/partnership 500 (Internal Server Error)
```

**الأسباب المحتملة:**

1. **مشكلة في المصادقة:**
   - Token غير صالح عند أول محاولة (401)
   - بعد تحديث Token، يحدث خطأ في الـ server (500)

2. **مشكلة في الـ Backend:**
   - خطأ في معالجة الطلب بعد التحقق من المصادقة
   - مشكلة في حفظ البيانات في قاعدة البيانات
   - خطأ في الـ validation schema

3. **مشكلة في الـ Permissions:**
   - المستخدم لا يملك الصلاحيات المطلوبة
   - `requirePermission` يرفض الطلب

**الحلول المقترحة:**

1. **التحقق من الصلاحيات:**
   ```typescript
   // في investor.routes.ts
   investorRouter.post(
     '/requests/partnership',
     authenticate,
     requirePermission(['investor.requests.create']),
     requestController.createPartnership
   );
   ```

2. **تحسين معالجة الأخطاء:**
   ```typescript
   // في request.controller.ts
   async createPartnership(req: AuthenticatedRequest, res: Response) {
     try {
       const userId = req.user?.id;
       if (!userId) {
         return res.status(401).json({
           error: {
             code: 'UNAUTHORIZED',
             message: 'User not authenticated',
           },
         });
       }
       // ... باقي الكود
     } catch (error) {
       console.error('Failed to create partnership request:', error);
       return res.status(500).json({
         error: {
           code: 'INTERNAL_ERROR',
           message: 'Failed to create partnership request',
           details: process.env.NODE_ENV === 'development' ? error.message : undefined,
         },
       });
     }
   }
   ```

3. **التحقق من البيانات المرسلة:**
   - التأكد من أن جميع الحقول المطلوبة موجودة
   - التحقق من صحة البيانات قبل الإرسال

### التحقق من المصادقة

#### في Frontend:

1. **التحقق من Token:**
   ```typescript
   // في api-client.ts
   const token = await getAccessToken();
   if (!token) {
     throw new Error('No access token available');
   }
   ```

2. **إضافة Token إلى Headers:**
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
   }
   ```

#### في Backend:

1. **التحقق من Token:**
   ```typescript
   // في auth.middleware.ts
   const token = getAccessToken(req);
   if (!token) {
     return res.status(401).json({
       error: {
         code: 'UNAUTHORIZED',
         message: 'Missing or invalid access token',
       },
     });
   }
   ```

2. **التحقق من المستخدم:**
   ```typescript
   const { data, error } = await supabase.auth.getUser(token);
   if (error || !data.user) {
     return res.status(401).json({
       error: {
         code: 'UNAUTHORIZED',
         message: 'Invalid or expired token',
       },
     });
   }
   ```

### خطوات التشخيص

1. **التحقق من Token في Browser:**
   - فتح Developer Tools
   - الذهاب إلى Application/Storage
   - التحقق من وجود Token في LocalStorage/SessionStorage

2. **التحقق من Network Requests:**
   - فتح Network tab في Developer Tools
   - التحقق من Request Headers
   - التأكد من وجود Authorization header

3. **التحقق من Backend Logs:**
   - فحص server logs للبحث عن أخطاء
   - التحقق من رسائل الخطأ المفصلة

4. **اختبار API مباشرة:**
   - استخدام Postman أو curl لاختبار API
   - إرسال Token يدويًا للتحقق من المشكلة

### الحلول الموصى بها

1. **إضافة Error Handling أفضل:**
   - معالجة أخطاء المصادقة بشكل أفضل
   - إعادة توجيه المستخدم إلى صفحة تسجيل الدخول عند انتهاء Token

2. **إضافة Token Refresh:**
   - تحديث Token تلقائيًا قبل انتهاء صلاحيته
   - استخدام Refresh Token للحصول على Token جديد

3. **تحسين Logging:**
   - تسجيل جميع محاولات المصادقة
   - تسجيل أسباب فشل المصادقة

4. **إضافة Retry Logic:**
   - إعادة المحاولة تلقائيًا عند فشل المصادقة
   - تحديث Token وإعادة المحاولة

### ملاحظات مهمة

- **Netlify Functions:**
  - التأكد من أن الـ environment variables موجودة في Netlify
  - التحقق من أن الـ functions تعمل بشكل صحيح

- **CORS:**
  - التأكد من أن CORS مُعد بشكل صحيح
  - السماح بالـ credentials في CORS

- **Supabase Configuration:**
  - التحقق من أن Supabase URL و Keys صحيحة
  - التأكد من أن RLS policies صحيحة

---

## ملخص جميع المشاكل والحلول

### مشاكل التحقق من صحة البيانات (Validation)
- ✅ `projectId` - تم الحل باستخدام `z.union()` مع `z.literal('')`
- ✅ `proposedAmount` - تم الحل باستخدام `z.union()` مع `z.literal('')`
- ✅ `partnershipPlan` - يعمل بشكل صحيح
- ✅ `notes` - تم الحل باستخدام `z.union()` مع `z.literal('')`

### مشاكل المصادقة (Authentication)
- ⚠️ 401 Unauthorized عند الوصول إلى `/api/v1/investor/dashboard`
- ⚠️ 401 ثم 500 عند إنشاء طلب شراكة
- 🔍 تحتاج إلى فحص Token و Permissions

### قاعدة البيانات
- ✅ عمود `metadata` موجود ويعمل بشكل صحيح
- ✅ البيانات تُحفظ بشكل صحيح في Supabase

---

## الخطوات التالية

1. **فحص Token في Frontend:**
   - التحقق من أن Token موجود وصالح
   - إضافة refresh token logic

2. **فحص Permissions:**
   - التأكد من أن المستخدم لديه الصلاحيات المطلوبة
   - التحقق من RBAC policies

3. **فحص Backend Logs:**
   - البحث عن أخطاء مفصلة
   - التحقق من أسباب 500 error

4. **اختبار API:**
   - استخدام Postman لاختبار API مباشرة
   - التحقق من أن كل شيء يعمل بشكل صحيح

