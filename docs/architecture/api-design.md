# API Design

### API Structure

**Base URL:** `/api/v1`

### Authentication Endpoints

- `POST /api/v1/auth/register` - تسجيل مستثمر جديد
- `POST /api/v1/auth/verify-otp` - التحقق من OTP
- `POST /api/v1/auth/login` - تسجيل الدخول
- `POST /api/v1/auth/refresh` - تحديث الجلسة
- `POST /api/v1/auth/logout` - تسجيل الخروج
- `POST /api/v1/auth/2fa/setup` - إعداد 2FA
- `POST /api/v1/auth/2fa/verify` - التحقق من 2FA
- `POST /api/v1/auth/2fa/disable` - تعطيل 2FA

### Investor Endpoints

- `GET /api/v1/investor/profile` - الحصول على الملف الشخصي
- `PATCH /api/v1/investor/profile` - تحديث الملف الشخصي
- `GET /api/v1/investor/dashboard` - لوحة التحكم
- `GET /api/v1/investor/requests` - قائمة الطلبات
- `POST /api/v1/investor/requests` - إنشاء طلب جديد
- `GET /api/v1/investor/requests/:id` - تفاصيل الطلب
- `POST /api/v1/investor/requests/:id/submit` - إرسال الطلب
- `POST /api/v1/investor/requests/:id/files/presign` - Presigned URL للرفع

### Admin Endpoints

- `GET /api/v1/admin/users` - قائمة المستخدمين
- `POST /api/v1/admin/users` - إنشاء مستخدم جديد
- `PATCH /api/v1/admin/users/:id/status` - تغيير حالة المستخدم
- `POST /api/v1/admin/users/:id/reset-password` - إعادة تعيين كلمة المرور
- `GET /api/v1/admin/requests` - صندوق وارد الطلبات (يعيد `isRead` لكل طلب)
- `GET /api/v1/admin/requests/:id` - تفاصيل الطلب (يسجل القراءة تلقائياً)
- `PATCH /api/v1/admin/requests/:id/approve` - قبول الطلب
- `PATCH /api/v1/admin/requests/:id/reject` - رفض الطلب
- `POST /api/v1/admin/requests/:id/request-info` - طلب معلومات إضافية
- `POST /api/v1/admin/requests/:id/comments` - إضافة تعليق
- `PATCH /api/v1/admin/requests/:id/settle` - معالجة الطلب
- `GET /api/v1/admin/dashboard/stats` - إحصائيات لوحة التحكم
- `GET /api/v1/admin/reports/requests` - تقارير الطلبات
- `GET /api/v1/admin/audit-logs` - سجل التدقيق

### Content Management Endpoints

- `GET /api/v1/news` - قائمة الأخبار (عام)
- `GET /api/v1/news/:id` - تفاصيل الخبر
- `GET /api/v1/admin/news` - إدارة الأخبار
- `POST /api/v1/admin/news` - إنشاء خبر جديد
- `PATCH /api/v1/admin/news/:id` - تحديث الخبر
- `DELETE /api/v1/admin/news/:id` - حذف الخبر
- `POST /api/v1/admin/news/:id/publish` - نشر الخبر
- `POST /api/v1/admin/news/:id/approve` - الموافقة على الخبر
- `POST /api/v1/admin/news/images/presign` - Presigned URL للصور

### Notifications Endpoints

- `GET /api/v1/notifications` - قائمة الإشعارات
- `PATCH /api/v1/notifications/:id/read` - تحديد كمقروء
- `POST /api/v1/notifications/mark-all-read` - تحديد الكل كمقروء
- `GET /api/v1/notifications/preferences` - تفضيلات الإشعارات
- `PATCH /api/v1/notifications/preferences` - تحديث التفضيلات

