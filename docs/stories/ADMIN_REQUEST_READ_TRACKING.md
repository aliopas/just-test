# نظام تتبع قراءة الطلبات من قبل الأدمن
# Admin Request Read Tracking System

**التاريخ:** 2025-01-15  
**الحالة:** مكتمل ✅  
**الإصدار:** 1.0

---

## نظرة عامة | Overview

تم تنفيذ نظام لتتبع قراءة طلبات الاستثمار من قبل المستخدمين الأدمن. يتيح هذا النظام للأدمن معرفة ما إذا كانوا قد قرأوا طلباً معيناً أم لا، مما يساعد في إدارة سير العمل وتحديد الطلبات التي تحتاج إلى مراجعة.

An admin request read tracking system has been implemented to track which investment requests have been viewed by admin users. This system helps admins know if they have read a specific request, aiding in workflow management and identifying requests that need review.

---

## الميزات | Features

### 1. تتبع القراءة التلقائي | Automatic Read Tracking
- عند فتح تفاصيل طلب من قبل أدمن، يتم تسجيل القراءة تلقائياً
- When an admin opens a request detail page, the read status is automatically recorded

### 2. حالة القراءة في القائمة | Read Status in List
- قائمة الطلبات تعرض حالة القراءة (`isRead`) لكل طلب
- The requests list displays the read status (`isRead`) for each request

### 3. تتبع لكل أدمن | Per-Admin Tracking
- كل أدمن له حالة قراءة منفصلة لكل طلب
- Each admin has a separate read status for each request

---

## بنية قاعدة البيانات | Database Schema

### جدول `admin_request_views`

```sql
CREATE TABLE admin_request_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, admin_id)
);
```

#### الحقول | Fields

- `id`: المعرف الفريد للسجل
- `request_id`: معرف الطلب (مرجع إلى جدول `requests`)
- `admin_id`: معرف الأدمن (مرجع إلى جدول `users`)
- `viewed_at`: تاريخ ووقت آخر قراءة للطلب
- `created_at`: تاريخ ووقت إنشاء السجل

#### الفهارس | Indexes

- `idx_admin_request_views_request_id`: فهرس على `request_id` للاستعلامات السريعة
- `idx_admin_request_views_admin_id`: فهرس على `admin_id` للاستعلامات السريعة
- `idx_admin_request_views_viewed_at`: فهرس على `viewed_at` للترتيب الزمني

#### القيود | Constraints

- `UNIQUE(request_id, admin_id)`: يضمن أن كل أدمن يمكنه تسجيل قراءة واحدة فقط لكل طلب

---

## API Endpoints

### 1. جلب تفاصيل الطلب | Get Request Detail

**Endpoint:** `GET /api/v1/admin/requests/:id`

**الوصف:** عند جلب تفاصيل طلب، يتم تسجيل القراءة تلقائياً للأدمن الحالي.

**Response:**
```json
{
  "request": {
    "id": "uuid",
    "requestNumber": "REQ-2024-001",
    "status": "submitted",
    "type": "buy",
    "amount": 100000,
    "currency": "SAR",
    "isRead": true,
    // ... other fields
  },
  "attachments": [],
  "events": [],
  "comments": []
}
```

### 2. قائمة الطلبات | List Requests

**Endpoint:** `GET /api/v1/admin/requests`

**الوصف:** يعيد قائمة الطلبات مع حالة القراءة لكل طلب بالنسبة للأدمن الحالي.

**Query Parameters:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد العناصر في الصفحة (افتراضي: 25)
- `status`: فلتر حسب الحالة
- `type`: فلتر حسب النوع (buy/sell)
- `search`: البحث في رقم الطلب أو اسم المستثمر
- `sortBy`: حقل الترتيب (created_at, amount, status)
- `order`: اتجاه الترتيب (asc, desc)

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "requestNumber": "REQ-2024-001",
      "status": "submitted",
      "type": "buy",
      "amount": 100000,
      "currency": "SAR",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "investor": {
        "id": "uuid",
        "email": "investor@example.com",
        "fullName": "John Doe",
        "preferredName": "John",
        "language": "en"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "pageCount": 4,
    "hasNext": true
  }
}
```

---

## Backend Implementation

### الملفات المعدلة | Modified Files

#### 1. `backend/src/services/admin-request.service.ts`

##### الدوال المضافة | Added Functions

**`markRequestAsRead(params)`**
```typescript
export async function markRequestAsRead(params: {
  requestId: string;
  adminId: string;
}): Promise<{ viewedAt: string }>
```

- تسجيل قراءة طلب من قبل أدمن
- يستخدم `upsert` للتعامل مع القراءات الجديدة والتحديثات
- Records a request read by an admin
- Uses `upsert` to handle both new reads and updates

**`isRequestReadByAdmin(params)`**
```typescript
export async function isRequestReadByAdmin(params: {
  requestId: string;
  adminId: string;
}): Promise<boolean>
```

- التحقق من حالة قراءة طلب من قبل أدمن معين
- Checks if a request has been read by a specific admin

##### الدوال المعدلة | Modified Functions

**`getAdminRequestDetail(params)`**
- تمت إضافة تسجيل القراءة التلقائي عند جلب تفاصيل الطلب
- Automatic read tracking added when fetching request details

**`listAdminRequests(params)`**
- تمت إضافة جلب حالة القراءة لكل طلب في القائمة
- Read status fetching added for each request in the list
- إرجاع حقل `isRead` في الاستجابة
- Returns `isRead` field in the response

---

## Frontend Implementation

### الملفات المعدلة | Modified Files

#### 1. `frontend/src/types/admin.ts`

**التعديل:** إضافة حقل `isRead` إلى واجهة `AdminRequest`

```typescript
export interface AdminRequest {
  id: string;
  requestNumber: string;
  status: RequestStatus;
  type: RequestType;
  amount: number;
  currency: RequestCurrency;
  targetPrice: number | null | undefined;
  expiryAt: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;  // ✅ Added
  investor: AdminRequestInvestor;
}
```

---

## Migration

### اسم الملف | Migration File

`supabase/migrations/20250115140000_admin_request_views_tracking.sql`

### المحتوى | Content

```sql
-- Create table to track admin views of requests
CREATE TABLE IF NOT EXISTS admin_request_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, admin_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_admin_request_views_request_id 
  ON admin_request_views(request_id);

CREATE INDEX IF NOT EXISTS idx_admin_request_views_admin_id 
  ON admin_request_views(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_request_views_viewed_at 
  ON admin_request_views(viewed_at DESC);

-- Add comment
COMMENT ON TABLE admin_request_views IS 'Tracks which admin users have viewed which investment requests and when';
```

---

## استخدام النظام | Usage

### في الواجهة الأمامية | In Frontend

يمكن استخدام حقل `isRead` لعرض الطلبات غير المقروءة بشكل مختلف:

```typescript
// Example: Highlight unread requests
{requests.map(request => (
  <div 
    key={request.id}
    style={{
      backgroundColor: request.isRead ? 'white' : '#f0f9ff',
      borderLeft: request.isRead ? 'none' : '4px solid #3b82f6'
    }}
  >
    <h3>{request.requestNumber}</h3>
    {!request.isRead && <Badge>غير مقروء</Badge>}
  </div>
))}
```

### في Backend | In Backend

```typescript
// Check if request is read
const isRead = await isRequestReadByAdmin({
  requestId: 'request-uuid',
  adminId: 'admin-uuid'
});

// Mark request as read
await markRequestAsRead({
  requestId: 'request-uuid',
  adminId: 'admin-uuid'
});
```

---

## ملاحظات الأداء | Performance Notes

1. **الفهارس:** تم إنشاء فهارس على `request_id` و `admin_id` و `viewed_at` لتحسين أداء الاستعلامات
2. **Batch Queries:** عند جلب قائمة الطلبات، يتم جلب حالة القراءة لجميع الطلبات في استعلام واحد (batch query) لتقليل عدد الاستعلامات
3. **Upsert:** استخدام `upsert` يضمن عدم وجود سجلات مكررة ويحدث `viewed_at` عند إعادة القراءة

---

## حالات الاستخدام | Use Cases

1. **فلترة الطلبات غير المقروءة:** يمكن للأدمن تصفية القائمة لعرض الطلبات التي لم يقرأها بعد
2. **إحصائيات:** يمكن استخدام البيانات لحساب عدد الطلبات غير المقروءة لكل أدمن
3. **إشعارات:** يمكن إرسال إشعارات للأدمن عند وجود طلبات جديدة غير مقروءة
4. **تقارير:** يمكن إنشاء تقارير عن نشاط قراءة الطلبات من قبل الأدمن

---

## التطويرات المستقبلية | Future Enhancements

1. **فلترة حسب حالة القراءة:** إضافة فلتر في API للبحث عن الطلبات المقروءة/غير المقروءة
2. **تتبع القراءة الجزئية:** تتبع الوقت الذي قضاه الأدمن في قراءة الطلب
3. **إشعارات القراءة:** إشعار الأدمن الآخرين عند قراءة طلب معين
4. **إحصائيات متقدمة:** لوحة تحكم تعرض إحصائيات عن قراءة الطلبات

---

## الاختبار | Testing

### اختبارات مقترحة | Suggested Tests

1. **تسجيل القراءة التلقائية:**
   - عند جلب تفاصيل طلب، يجب أن يتم تسجيل القراءة
   - When fetching request details, read status should be recorded

2. **حالة القراءة في القائمة:**
   - يجب أن تعرض القائمة حالة القراءة الصحيحة لكل طلب
   - List should display correct read status for each request

3. **تتبع متعدد الأدمن:**
   - كل أدمن يجب أن يكون له حالة قراءة منفصلة
   - Each admin should have separate read status

4. **تحديث `viewed_at`:**
   - عند إعادة قراءة طلب، يجب تحديث `viewed_at`
   - When re-reading a request, `viewed_at` should be updated

---

## المراجع | References

- Migration: `supabase/migrations/20250115140000_admin_request_views_tracking.sql`
- Service: `backend/src/services/admin-request.service.ts`
- Types: `frontend/src/types/admin.ts`
- API Controller: `backend/src/controllers/admin-request.controller.ts`

---

**آخر تحديث:** 2025-01-15  
**المساهمون:** AI Assistant

