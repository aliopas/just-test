# Story 3.3: API تقديم طلب جديد – حالة الإكمال

**التاريخ:** 2025-11-08  
**الحالة:** ✅ مكتمل

---

## ✅ ما تم إنجازه

1. **مخطط التحقق (Zod)**
   - `createRequestSchema` في `backend/src/schemas/request.schema.ts` يتحقق من الحقول (النوع، المبلغ، العملة، السعر المستهدف، تاريخ الصلاحية، الملاحظات).
   - يتأكد من أن تاريخ الصلاحية ≥ اليوم وأن الملاحظات لا تتجاوز 500 حرف.

2. **توليد رقم الطلب**
   - إضافة تسلسل `request_number_seq` ودالة `generate_request_number()` مع trigger `assign_request_number`.
   - fallback داخل التطبيق في حال غياب `SUPABASE_SERVICE_ROLE_KEY`.

3. **خدمة إنشاء الطلب**
   - `createInvestorRequest` تحفظ السجل في `requests` وتصلح الحدث الأولي في `request_events`.
   - استخدام `transitionRequestStatus` للتحول التلقائي من `draft` إلى `submitted`.

4. **المسار والـ Controller**
   - `POST /api/v1/investor/requests` (في `investor.routes.ts`) متاح للمستخدمين الذين يمتلكون صلاحية `investor.requests.create`.
   - يعيد `requestId`, `requestNumber`, `status`.

5. **الاختبارات**
   - `backend/tests/request.controller.test.ts` يغطي:
     - حالة عدم وجود جلسة مصادقة.
     - إنشاء طلب بنجاح واستدعاء الخدمات المساندة.

---

## 🧪 الاختبارات

| الأمر | النتيجة |
|-------|---------|
| `npm test -- request.controller.test.ts` | تمر ✓ |
| `npm test -- request-state.service.test.ts` | تمر ✓ |
| `npm run lint` | يمر ✓ |
| `npm run build` | يمر ✓ |

---

## 📁 الملفات المنشأة / المحدثة

- `supabase/migrations/20241108075000_request_number_sequence.sql` (sequence)
- `supabase/migrations/20241108075200_generate_request_number_function.sql`
- `backend/src/schemas/request.schema.ts`
- `backend/src/services/request-number.service.ts`
- `backend/src/services/request.service.ts`
- `backend/src/controllers/request.controller.ts`
- `backend/src/routes/investor.routes.ts` (تحديث المسار الجديد)
- `backend/tests/request.controller.test.ts`
- `docs/stories/STORY_3.3_COMPLETION.md` (هذا الملف)

---

## 📌 ملاحظات

- لاحقًا ستُكمّل Story 3.4 وما بعدها التعامل مع رفع الملفات والتحولات الإضافية للأدمن.
- من المناسب إضافة اختبارات متكاملة (Integration) عند بناء API فعلي يتصل بـ Supabase في بيئة الاختبار.

---

**تم الإنشاء بواسطة:** GPT-5 Codex (Cursor)  
**آخر تحديث:** 2025-11-08  

