# Epic 7: التقارير ولوحات المتابعة
## Reports & Dashboards

**Epic Goal:**  
إنشاء لوحات المتابعة للمستثمر والأدمن مع التقارير والإحصائيات. هذا Epic يوفر الرؤية والتحليلات للمنصة.

---

## Story 7.1: لوحة متابعة المستثمر

**As a** مستثمر،  
**I want** لوحة متابعة تعرض ملخص محافظي وطلباتي،  
**so that** أبقى على اطلاع بحالة استثماراتي.

### Acceptance Criteria

1. إنشاء API endpoint GET /investor/dashboard
2. استخدام Supabase Client مع Aggregations: `supabase.from('requests').select('status', { count: 'exact' })`
3. عرض ملخص الطلبات (الإجمالي، قيد المعالجة، مكتملة، مرفوضة) باستخدام `.count()`
4. عرض الطلبات الأخيرة باستخدام `.order('created_at', { ascending: false }).limit(5)`
5. عرض الإشعارات غير المقروءة من جدول notifications
6. عرض الإجراءات المطلوبة (Pending Info) باستخدام `.eq('status', 'pending_info')`
7. استخدام Supabase Realtime للتحديثات الفورية
8. إنشاء صفحة Dashboard في Frontend
9. تصميم responsive وجذاب
10. جميع الاختبارات تمر بنجاح

---

## Story 7.2: لوحة متابعة الأدمن - الإحصائيات

**As a** أدمن،  
**I want** لوحة متابعة تعرض إحصائيات الطلبات،  
**so that** يمكنني مراقبة أداء النظام.

### Acceptance Criteria

1. إنشاء API endpoint GET /admin/dashboard/stats
2. استخدام Supabase Client مع Aggregations وGrouping
3. عرض عدد الطلبات حسب الحالة باستخدام `.select('status', { count: 'exact' })`
4. حساب متوسط زمن المعالجة باستخدام Supabase Function أو Database View
5. عرض الطلبات المتعثرة (> X أيام) باستخدام `.lt('created_at', date)`
6. عرض نشاط المحتوى (مشاهدات/تفاعلات) من جدول news
7. استخدام Supabase Realtime للتحديثات الفورية
8. إنشاء صفحة Admin Dashboard في Frontend
9. عرض الرسوم البيانية (Charts) مع بيانات من Supabase
10. جميع الاختبارات تمر بنجاح

---

## Story 7.3: تقارير الطلبات

**As a** أدمن،  
**I want** تقارير مفصلة للطلبات،  
**so that** يمكنني تحليل الأداء.

### Acceptance Criteria

1. إنشاء API endpoint GET /admin/reports/requests
2. فلترة حسب الفترة الزمنية
3. فلترة حسب الحالة والنوع
4. تجميع البيانات حسب الفئات
5. تصدير CSV مع ترقيم فريد (INV-YYYY-####)
6. إنشاء واجهة Reports في Frontend
7. عرض الجداول والرسوم البيانية
8. جميع الاختبارات تمر بنجاح

---

## Story 7.4: سجل التدقيق (Audit Log)

**As a** أدمن،  
**I want** سجل تدقيق شامل،  
**so that** يمكن تتبع جميع الإجراءات.

### Acceptance Criteria

1. إنشاء API endpoint GET /admin/audit-logs مع pagination وfiltering
2. استخدام Supabase Client: `supabase.from('audit_logs').select()`
3. فلترة حسب المستخدم والإجراء والنوع باستخدام `.eq()`
4. فلترة حسب الفترة الزمنية باستخدام `.gte()` و`.lte()`
5. عرض التفاصيل الكاملة (المستخدم، الإجراء، الهدف، IP، User Agent)
6. عرض الاختلافات (diff) عند التعديل من حقل diff في الجدول
7. Pagination باستخدام `.range()`
8. استخدام Supabase RLS للتحقق من صلاحيات Admin
9. إنشاء واجهة Audit Logs في Frontend
10. تصدير السجلات باستخدام Supabase Export أو CSV generation
11. جميع الاختبارات تمر بنجاح

---

## Story 7.5: تحليلات المحتوى

**As a** أدمن،  
**I want** تحليلات للمحتوى،  
**so that** يمكنني قياس التفاعل.

### Acceptance Criteria

1. تتبع مشاهدات الأخبار
2. تتبع التفاعلات (CTR)
3. إنشاء API endpoint GET /admin/analytics/content
4. عرض الإحصائيات في لوحة التحكم
5. رسوم بيانية للاتجاهات
6. جميع الاختبارات تمر بنجاح

---

## Story 7.6: KPIs والمقاييس

**As a** أدمن،  
**I want** عرض KPIs والمقاييس،  
**so that** يمكنني مراقبة الأداء.

### Acceptance Criteria

1. حساب TAT معالجة الطلب (متوسط/90th percentile)
2. حساب نسبة الطلبات Pending Info > X أيام
3. حساب معدل إتمام الرفع بنجاح
4. حساب معدل فشل الإشعارات
5. عرض KPIs في Dashboard
6. تنبيهات عند تجاوز العتبات
7. جميع الاختبارات تمر بنجاح

