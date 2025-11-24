# Epic 3: نظام الطلبات (شراء/بيع/شراكة/ترشيح/ملاحظات)
## Investment Requests System

**Epic Goal:**  
إنشاء نظام الطلبات الكامل مع دورة الحياة (State Machine)، رفع الملفات، والتحقق من الصحة. النظام يدعم أنواع طلبات متعددة: شراء/بيع، شراكة في مشاريع، ترشيح لعضوية المجلس، وملاحظات وأفكار. هذا Epic يوفر الوظيفة الأساسية للمنصة.

---

## Story 3.1: إنشاء جداول الطلبات والملفات

**As a** نظام،  
**I want** جداول قاعدة البيانات للطلبات والملفات،  
**so that** يمكن تخزين بيانات الطلبات بشكل منظم.

### Acceptance Criteria

1. إنشاء جداول requests وrequest_events وattachments باستخدام `mcp_supabase_apply_migration`
2. جدول requests: (id, user_id, type, amount, currency, target_price, expiry_at, status, notes, metadata, created_at, updated_at)
   - type: enum ('buy', 'sell', 'partnership', 'board_nomination', 'feedback')
   - metadata: jsonb (لتخزين بيانات إضافية حسب نوع الطلب)
3. جدول request_events: (id, request_id, from_status, to_status, actor_id, note, created_at)
4. جدول attachments: (id, request_id, filename, mime, size, storage_key, created_at)
5. إنشاء indexes للبحث السريع في Supabase
6. إعداد Foreign Keys والعلاقات
7. استخدام Supabase RLS Policies لحماية البيانات
8. التحقق من الجداول باستخدام `mcp_supabase_list_tables`
9. جميع الاختبارات تمر بنجاح

---

## Story 3.2: إنشاء State Machine لدورة حياة الطلب

**As a** نظام،  
**I want** State Machine لدورة حياة الطلب،  
**so that** يمكن تتبع حالة الطلب بشكل دقيق.

### Acceptance Criteria

1. تعريف الحالات: Draft, Submitted, Screening, Pending Info, Compliance Review, Approved, Rejected, Settling, Completed
2. تعريف التحولات المسموحة بين الحالات
3. إنشاء دالة للتحقق من صحة التحول
4. تسجيل كل تحول في request_events مع الوقت والمنفذ والملاحظة
5. منع التحولات غير المسموحة
6. جميع الاختبارات تمر بنجاح

---

## Story 3.3: API تقديم طلب جديد

**As a** مستثمر،  
**I want** تقديم طلب شراء أو بيع،  
**so that** يمكنني إدارة استثماراتي.

### Acceptance Criteria

1. إنشاء API endpoint POST /investor/requests
2. استخدام Supabase Client: `supabase.from('requests').insert()`
3. التحقق من صحة البيانات حسب نوع الطلب:
   - شراء/بيع: المبلغ، العملة، السعر المستهدف، تاريخ الصلاحية
   - شراكة: المشروع المستهدف، المبلغ المقترح، خطة الشراكة
   - ترشيح مجلس: السيرة الذاتية، الخبرات، الدوافع
   - ملاحظات/أفكار: الموضوع، الوصف، الفئة
4. التحقق من أن المبلغ موجب والعملة مدعومة (للطلبات المالية)
5. التحقق من أن تاريخ الصلاحية ≥ اليوم (إن وجد)
6. إنشاء الطلب بحالة Draft أولاً
7. إنشاء رقم الطلب الفريد (INV-YYYY-####) باستخدام Supabase Function أو Database Trigger
8. حفظ البيانات الإضافية في حقل metadata (jsonb)
9. إرجاع رقم الطلب الفريد
10. تسجيل الحدث الأولي في request_events
11. جميع الاختبارات تمر بنجاح

---

## Story 3.4: رفع الملفات مع Presigned URLs

**As a** مستثمر،  
**I want** رفع مرفقات للطلب،  
**so that** يمكنني إرفاق المستندات المطلوبة.

### Acceptance Criteria

1. إنشاء API endpoint POST /investor/requests/:id/files/presign
2. استخدام `supabase.storage.from('attachments').createSignedUploadUrl()` لإنشاء Presigned URL
3. التحقق من نوع الملف (PDF/JPG/PNG فقط)
4. التحقق من حجم الملف (≤ 10MB)
5. فحص الملف للفيروسات (إن أمكن) - يمكن استخدام Supabase Edge Function
6. رفع الملف إلى Supabase Storage bucket 'attachments'
7. حفظ معلومات الملف في جدول attachments باستخدام `supabase.from('attachments').insert()`
8. استخدام Supabase Storage Policies لحماية الملفات
9. جميع الاختبارات تمر بنجاح

---

## Story 3.5: واجهة تقديم طلب جديد

**As a** مستثمر،  
**I want** واجهة لتقديم طلب جديد،  
**so that** يمكنني تقديم الطلبات بسهولة.

### Acceptance Criteria

1. إنشاء صفحة New Request في Frontend
2. نموذج ديناميكي يتغير حسب نوع الطلب المختار
3. اختيار نوع الطلب من قائمة:
   - شراء/بيع
   - شراكة في مشاريع الشركة
   - ترشيح لعضوية المجلس
   - تقديم ملاحظات وأفكار
4. لكل نوع طلب حقول مخصصة:
   - شراء/بيع: المبلغ، العملة، السعر المستهدف، تاريخ الصلاحية
   - شراكة: اختيار المشروع، المبلغ المقترح، خطة الشراكة (textarea)
   - ترشيح مجلس: السيرة الذاتية (textarea)، الخبرات (textarea)، الدوافع (textarea)
   - ملاحظات: الموضوع، الفئة (dropdown)، الوصف (textarea)
5. رفع الملفات بالسحب والإفلات (لجميع الأنواع)
6. عرض مصغّر للملفات المرفوعة
7. التحقق من صحة البيانات في Frontend حسب نوع الطلب
8. إرسال الطلب
9. عرض رسائل نجاح/خطأ
10. جميع الاختبارات تمر بنجاح

---

## Story 3.6: إرسال الطلب (Submit)

**As a** مستثمر،  
**I want** إرسال الطلب بعد المراجعة،  
**so that** يبدأ معالجته.

### Acceptance Criteria

1. إنشاء API endpoint POST /investor/requests/:id/submit
2. التحقق من أن الطلب في حالة Draft
3. التحقق من وجود الملفات المطلوبة
4. تغيير الحالة إلى Submitted
5. تسجيل الحدث في request_events
6. إرسال إشعار للمستثمر
7. إرسال إشعار للأدمن
8. جميع الاختبارات تمر بنجاح

---

## Story 3.7: متابعة الطلبات للمستثمر

**As a** مستثمر،  
**I want** متابعة طلباتي،  
**so that** أعرف حالة كل طلب.

### Acceptance Criteria

1. إنشاء API endpoint GET /investor/requests مع pagination
2. فلترة حسب الحالة
3. إنشاء صفحة My Requests في Frontend
4. عرض قائمة الطلبات مع الحالة
5. مؤشرات حالة بصرية (ألوان/أيقونات)
6. شريط تقدم لكل طلب
7. عرض تفاصيل الطلب عند النقر
8. جميع الاختبارات تمر بنجاح

---

## Story 3.8: عرض تفاصيل الطلب للمستثمر

**As a** مستثمر،  
**I want** رؤية تفاصيل طلبي،  
**so that** أعرف كل المعلومات المتعلقة به.

### Acceptance Criteria

1. إنشاء API endpoint GET /investor/requests/:id
2. عرض جميع بيانات الطلب حسب نوعه
3. عرض الملفات المرفوعة مع إمكانية التنزيل
4. عرض سجل الأحداث (Timeline)
5. عرض التعليقات (إن وجدت)
6. عرض البيانات الإضافية من حقل metadata بشكل منظم
7. جميع الاختبارات تمر بنجاح

---

## Story 3.9: API طلب شراكة في مشاريع

**As a** مستثمر،  
**I want** تقديم طلب شراكة في مشاريع الشركة،  
**so that** يمكنني المشاركة في المشاريع.

### Acceptance Criteria

1. إنشاء API endpoint POST /investor/requests/partnership
2. قبول payload يحتوي على:
   - project_id (اختياري - للمشروع المحدد)
   - proposed_amount (المبلغ المقترح)
   - partnership_plan (نص خطة الشراكة)
   - notes (ملاحظات إضافية)
3. حفظ البيانات في حقل metadata
4. التحقق من وجود المشروع (إن تم تحديده)
5. التحقق من أن المبلغ موجب
6. إنشاء الطلب بحالة Draft
7. تسجيل الحدث في request_events
8. جميع الاختبارات تمر بنجاح

---

## Story 3.10: API طلب ترشيح لعضوية المجلس

**As a** مستثمر،  
**I want** تقديم طلب ترشيح لعضوية المجلس،  
**so that** يمكنني الترشح للعضوية.

### Acceptance Criteria

1. إنشاء API endpoint POST /investor/requests/board-nomination
2. قبول payload يحتوي على:
   - cv_summary (ملخص السيرة الذاتية)
   - experience (الخبرات)
   - motivations (الدوافع)
   - qualifications (المؤهلات)
   - notes (ملاحظات إضافية)
3. حفظ البيانات في حقل metadata
4. التحقق من أن جميع الحقول المطلوبة موجودة
5. إنشاء الطلب بحالة Draft
6. تسجيل الحدث في request_events
7. جميع الاختبارات تمر بنجاح

---

## Story 3.11: API تقديم ملاحظات وأفكار

**As a** مستثمر،  
**I want** تقديم ملاحظات وأفكار للشركة،  
**so that** يمكنني المساهمة في التطوير.

### Acceptance Criteria

1. إنشاء API endpoint POST /investor/requests/feedback
2. قبول payload يحتوي على:
   - subject (الموضوع)
   - category (الفئة: suggestion, complaint, question, other)
   - description (الوصف)
   - priority (الأولوية: low, medium, high)
   - notes (ملاحظات إضافية)
3. حفظ البيانات في حقل metadata
4. التحقق من أن الموضوع والوصف موجودان
5. إنشاء الطلب بحالة Draft
6. تسجيل الحدث في request_events
7. إرسال إشعار للأدمن (طبقاً للأولوية)
8. جميع الاختبارات تمر بنجاح

---

## Story 3.12: فلترة الطلبات حسب النوع

**As a** مستثمر/أدمن،  
**I want** فلترة الطلبات حسب النوع،  
**so that** يمكنني العثور على الطلبات المطلوبة بسهولة.

### Acceptance Criteria

1. تحديث API endpoint GET /investor/requests لدعم فلترة حسب type
2. تحديث API endpoint GET /admin/requests لدعم فلترة حسب type
3. استخدام Supabase Filter: `.eq('type', requestType)`
4. دعم فلترة متعددة (أكثر من نوع في نفس الوقت)
5. تحديث واجهة Frontend لإضافة فلاتر النوع
6. عرض عدد الطلبات لكل نوع في Dashboard
7. جميع الاختبارات تمر بنجاح

