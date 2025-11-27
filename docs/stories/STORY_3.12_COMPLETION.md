# Story 3.12: فلترة الطلبات حسب النوع - تقرير الإكمال

**التاريخ:** 2025-01-16  
**الحالة:** ✅ مكتمل

---

## 📋 ملخص القصة

**Story 3.12: فلترة الطلبات حسب النوع**

**As a** مستثمر/أدمن،  
**I want** فلترة الطلبات حسب النوع،  
**so that** يمكنني العثور على الطلبات المطلوبة بسهولة.

---

## ✅ Acceptance Criteria

| # | المعيار | الحالة |
|---|---------|--------|
| 1 | تحديث API endpoint GET /investor/requests لدعم فلترة حسب type | ✅ مكتمل |
| 2 | تحديث API endpoint GET /admin/requests لدعم فلترة حسب type | ✅ مكتمل |
| 3 | استخدام Supabase Filter: `.eq('type', requestType)` أو `.in('type', types)` | ✅ مكتمل |
| 4 | دعم فلترة متعددة (أكثر من نوع في نفس الوقت) | ✅ مكتمل |
| 5 | تحديث واجهة Frontend لإضافة فلاتر النوع | ✅ مكتمل |
| 6 | عرض عدد الطلبات لكل نوع في Dashboard | ✅ مكتمل |
| 7 | جميع الاختبارات تمر بنجاح | ✅ مكتمل |

---

## 📝 التغييرات المنفذة

### 1. تحديث Schema للـ Investor Requests

**الملف:** `backend/src/schemas/request-list.schema.ts`

- ✅ إضافة دعم `type` filter في `requestListQuerySchema`
- ✅ دعم أنواع الطلبات: `'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback'`
- ✅ دعم فلترة متعددة (single type أو array من types)
- ✅ معالجة قيمة `type` من query string (comma-separated أو array)

```typescript
const requestTypes = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'] as const;

type: z.preprocess(
  value => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    // Support both single type and comma-separated types for multi-filter
    if (typeof value === 'string') {
      const types = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
      return types.length > 0 ? types : undefined;
    }
    if (Array.isArray(value)) {
      return value.map(v => String(v).trim()).filter(v => v.length > 0);
    }
    return [String(value).trim()];
  },
  z
    .union([
      z.enum(requestTypes),
      z.array(z.enum(requestTypes)).min(1).max(5),
    ])
    .optional()
),
```

### 2. تحديث Service للـ Investor Requests

**الملف:** `backend/src/services/request.service.ts`

- ✅ تحديث `listInvestorRequests` لدعم فلترة حسب `type`
- ✅ استخدام `.eq()` للنوع الواحد و `.in()` للأنواع المتعددة

```typescript
// Filter by type(s) - support multiple types
if (params.query.type) {
  const types = Array.isArray(params.query.type) ? params.query.type : [params.query.type];
  if (types.length === 1) {
    queryBuilder = queryBuilder.eq('type', types[0]);
  } else if (types.length > 1) {
    queryBuilder = queryBuilder.in('type', types);
  }
}
```

### 3. تحديث Schema للـ Admin Requests

**الملف:** `backend/src/schemas/admin-requests.schema.ts`

- ✅ تحديث `requestTypes` لتشمل جميع أنواع الطلبات
- ✅ تحديث `type` filter لدعم فلترة متعددة
- ✅ نفس المعالجة مثل investor requests schema

```typescript
const requestTypes = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'] as const;

type: z.preprocess(
  value => {
    // ... same preprocessing logic as investor requests
  },
  z
    .union([
      z.enum(requestTypes),
      z.array(z.enum(requestTypes)).min(1).max(5),
    ])
    .optional()
),
```

### 4. تحديث Service للـ Admin Requests

**الملف:** `backend/src/services/admin-request.service.ts`

- ✅ تحديث `listAdminRequests` لدعم فلترة حسب `type` (متعددة)
- ✅ تحديث نوع `AdminRequestRow` لدعم جميع أنواع الطلبات
- ✅ تحديث نوع `AdminRequestDetailRow` لدعم جميع أنواع الطلبات
- ✅ تحديث معالجة `amount` لتكون nullable (لأن بعض أنواع الطلبات ليس لها amount)

```typescript
// Filter by type(s) - support multiple types
if (params.query.type) {
  const types = Array.isArray(params.query.type) ? params.query.type : [params.query.type];
  if (types.length === 1) {
    queryBuilder = queryBuilder.eq('type', types[0]);
  } else if (types.length > 1) {
    queryBuilder = queryBuilder.in('type', types);
  }
}

type AdminRequestRow = {
  // ...
  type: 'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback';
  amount: number | string | null;
  // ...
};
```

---

## 🔧 API Endpoints

### 1. GET /investor/requests

**Query Parameters:**
- `type` (optional): نوع الطلب أو أنواع متعددة (comma-separated)
  - Examples:
    - `?type=buy` - فلترة حسب buy فقط
    - `?type=partnership` - فلترة حسب partnership فقط
    - `?type=buy,sell` - فلترة حسب buy و sell
    - `?type=buy,sell,partnership` - فلترة حسب ثلاثة أنواع

**Response:**
```json
{
  "requests": [
    {
      "id": "...",
      "requestNumber": "...",
      "type": "buy",
      "status": "...",
      // ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pageCount": 1
  }
}
```

### 2. GET /admin/requests

**Query Parameters:**
- `type` (optional): نوع الطلب أو أنواع متعددة (comma-separated)
  - نفس المثال مثل `/investor/requests`

**Response:**
```json
{
  "requests": [
    {
      "id": "...",
      "requestNumber": "...",
      "type": "partnership",
      "status": "...",
      // ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 10,
    "pageCount": 1,
    "hasNext": false
  }
}
```

---

## 📊 الأنواع المدعومة

| النوع | الوصف | يدعم amount؟ |
|------|-------|--------------|
| `buy` | طلب شراء | ✅ نعم |
| `sell` | طلب بيع | ✅ نعم |
| `partnership` | طلب شراكة في مشاريع | ⚠️ قد يكون null |
| `board_nomination` | طلب ترشيح لعضوية المجلس | ❌ لا |
| `feedback` | تقديم ملاحظات وأفكار | ❌ لا |

---

## 🎯 استخدامات API

### مثال 1: فلترة حسب نوع واحد

```bash
GET /api/v1/investor/requests?type=buy
```

### مثال 2: فلترة حسب أنواع متعددة

```bash
GET /api/v1/investor/requests?type=buy,sell
```

### مثال 3: فلترة متعددة مع status

```bash
GET /api/v1/investor/requests?type=buy,sell&status=approved
```

### مثال 4: فلترة Admin مع types متعددة

```bash
GET /api/v1/admin/requests?type=partnership,board_nomination,feedback&page=1&limit=25
```

---

## 📁 الملفات المعدلة

### Backend
1. ✅ `backend/src/schemas/request-list.schema.ts` - تحديث schema للفلترة
2. ✅ `backend/src/services/request.service.ts` - تحديث `listInvestorRequests`
3. ✅ `backend/src/schemas/admin-requests.schema.ts` - تحديث schema للفلترة
4. ✅ `backend/src/services/admin-request.service.ts` - تحديث `listAdminRequests` و types

### Frontend
5. ✅ `frontend/src/types/request.ts` - إضافة `type` إلى `RequestListFilters`
6. ✅ `frontend/src/hooks/useInvestorRequests.ts` - دعم type filter
7. ✅ `frontend/src/pages/MyRequestsPage.tsx` - إضافة UI للفلترة حسب النوع
8. ✅ `frontend/src/locales/requestList.ts` - إضافة ترجمات للأنواع الجديدة
9. ✅ `frontend/src/types/dashboard.ts` - إضافة `byType` إلى `DashboardRequestSummary`
10. ✅ `frontend/src/locales/dashboard.ts` - إضافة ترجمات للأنواع في Dashboard
11. ✅ `frontend/src/pages/InvestorDashboardPage.tsx` - عرض عدد الطلبات لكل نوع

### Backend - Dashboard
12. ✅ `backend/src/services/investor-dashboard.service.ts` - إضافة `byType` counts

### Tests
13. ✅ `backend/tests/request.service.test.ts` - Tests للفلترة حسب النوع
14. ✅ `backend/tests/admin-request.service.test.ts` - Tests للفلترة المتعددة

---

### 5. تحديث Frontend - Investor Requests Page

**الملف:** `frontend/src/pages/MyRequestsPage.tsx`

- ✅ إضافة `typeFilterOptions` مع جميع أنواع الطلبات
- ✅ إضافة UI منفصل للفلترة حسب النوع
- ✅ تحديث `filters` state لدعم `type`
- ✅ إضافة `handleTypeFilterChange` function
- ✅ عرض فلاتر النوع بجانب فلاتر الحالة

```typescript
const typeFilterOptions: Array<{
  key: RequestType | 'all';
  labelKey: Parameters<typeof tRequestList>[0];
}> = [
  { key: 'all', labelKey: 'filters.typeAll' },
  { key: 'buy', labelKey: 'filters.typeBuy' },
  { key: 'sell', labelKey: 'filters.typeSell' },
  { key: 'partnership', labelKey: 'filters.typePartnership' },
  { key: 'board_nomination', labelKey: 'filters.typeBoardNomination' },
  { key: 'feedback', labelKey: 'filters.typeFeedback' },
];
```

### 6. تحديث Types

**الملف:** `frontend/src/types/request.ts`

- ✅ إضافة `type?: RequestType | 'all'` إلى `RequestListFilters`

### 7. تحديث Hooks

**الملف:** `frontend/src/hooks/useInvestorRequests.ts`

- ✅ تحديث `serializeFilters` لإضافة `type` parameter
- ✅ تحديث `queryKey` لتشمل `type` filter

### 8. تحديث Translations

**الملف:** `frontend/src/locales/requestList.ts`

- ✅ إضافة ترجمات للأنواع الجديدة:
  - `filters.typeAll`
  - `filters.typeBuy`
  - `filters.typeSell`
  - `filters.typePartnership`
  - `filters.typeBoardNomination`
  - `filters.typeFeedback`

---

### 9. تحديث Dashboard - عرض عدد الطلبات لكل نوع

**الملف:** `backend/src/services/investor-dashboard.service.ts`

- ✅ تحديث `RequestType` ليشمل جميع الأنواع الجديدة
- ✅ إضافة query للحصول على عدد الطلبات لكل نوع
- ✅ إضافة `byType` إلى `InvestorDashboardSummary`
- ✅ تحديث `averageAmountByType` ليشمل جميع الأنواع

**الملف:** `frontend/src/types/dashboard.ts`

- ✅ إضافة `byType` إلى `DashboardRequestSummary`

**الملف:** `frontend/src/locales/dashboard.ts`

- ✅ إضافة ترجمات للأنواع: `summary.byType`, `summary.typeBuy`, `summary.typeSell`, `summary.typePartnership`, `summary.typeBoardNomination`, `summary.typeFeedback`

**الملف:** `frontend/src/pages/InvestorDashboardPage.tsx`

- ✅ إضافة قسم جديد لعرض عدد الطلبات لكل نوع
- ✅ استخدام `SummaryCard` component لعرض الأرقام

### 10. إضافة Unit Tests

**الملف:** `backend/tests/request.service.test.ts`

- ✅ Test للفلترة حسب نوع واحد (`type: 'buy'`)
- ✅ Test للفلترة المتعددة (`type: ['buy', 'sell']`)

**الملف:** `backend/tests/admin-request.service.test.ts`

- ✅ Test للفلترة المتعددة في Admin Requests (`type: ['partnership', 'board_nomination']`)

---

## ✅ النتيجة النهائية

**Story 3.12 مكتمل 100%!**

- ✅ **Backend API:** مكتمل 100%
  - ✅ Schema validation
  - ✅ Service logic
  - ✅ Multi-type filtering support
  - ✅ جميع أنواع الطلبات مدعومة

- ✅ **Frontend:** مكتمل 100%
  - ✅ Investor Requests Page UI filters
  - ✅ Admin Requests Page UI filters (كان موجود مسبقاً)
  - ✅ Type filter integration
  - ✅ Translations for all types
  - ✅ Dashboard counts by type

- ✅ **Testing:** مكتمل 100%
  - ✅ Unit tests للفلترة حسب نوع واحد
  - ✅ Unit tests للفلترة المتعددة
  - ✅ Tests لـ Investor Requests
  - ✅ Tests لـ Admin Requests

---

## 📌 ملاحظات

1. **الفلترة المتعددة:**
   - يمكن تمرير أنواع متعددة كـ comma-separated string: `?type=buy,sell`
   - أو كـ array: `?type[]=buy&type[]=sell`
   - يتم معالجة كليهما بنفس الطريقة

2. **الأنواع الجديدة:**
   - جميع أنواع الطلبات الجديدة (`partnership`, `board_nomination`, `feedback`) مدعومة
   - `amount` يمكن أن يكون `null` للأنواع غير المالية

3. **التوافق مع الكود الحالي:**
   - جميع التغييرات متوافقة مع الكود الحالي
   - لا يوجد breaking changes

---

**تم الإنشاء بواسطة:** AI Assistant  
**تاريخ الإنشاء:** 2025-01-16

