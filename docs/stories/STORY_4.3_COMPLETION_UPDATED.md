# Story 4.3: لوحة قرار الطلب للأدمن – إكمال المتبقي

**التاريخ:** 2025-01-16  
**الحالة:** 🔄 قيد الإكمال

---

## ✅ ما تم إنجازه في التحديث الحالي

### 1. Backend API Updates ✅

#### إضافة Metadata إلى Request Detail
- ✅ إضافة `metadata` إلى SELECT query في `getAdminRequestDetail`
- ✅ إضافة `metadata` إلى `AdminRequestDetailRow` type
- ✅ إضافة `metadata` إلى return type في `getAdminRequestDetail`

#### إضافة Download URLs للـ Attachments
- ✅ إنشاء presigned URLs للـ attachments في `getAdminRequestDetail`
- ✅ إضافة `downloadUrl` إلى `AdminAttachment` type في Frontend

**الملفات المعدلة:**
- `backend/src/services/admin-request.service.ts`
- `frontend/src/types/admin.ts`

---

### 2. Frontend Updates (قيد التنفيذ)

#### إضافة Download Button للـ Attachments ✅
- ✅ إضافة زر تنزيل للـ attachments مع استخدام `downloadUrl`
- ✅ عرض حالة عدم وجود URL

#### إضافة Mutations للأزرار
- ⏳ إضافة `rejectMutation` لرفض الطلب
- ⏳ إضافة `requestInfoMutation` لطلب معلومات إضافية

#### عرض Metadata حسب نوع الطلب
- ⏳ عرض بيانات partnership (projectId, proposedAmount, partnershipPlan)
- ⏳ عرض بيانات board_nomination (cvSummary, experience, motivations, qualifications)
- ⏳ عرض بيانات feedback (subject, category, description, priority)

#### تحديث عرض Request Info
- ⏳ عرض بيانات إضافية حسب نوع الطلب (target_price, expiry_at للـ buy/sell)
- ⏳ عرض metadata بشكل منظم

---

## 📋 TODO: ما يجب إكماله

### 1. إضافة Mutations للأزرار
```typescript
// في AdminRequestDetailPage.tsx
const rejectMutation = useMutation({
  mutationFn: async (payload: { note?: string }) => {
    return apiClient(`/admin/requests/${requestId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  // ... onSuccess, onError
});

const requestInfoMutation = useMutation({
  mutationFn: async (payload: { message: string }) => {
    return apiClient(`/admin/requests/${requestId}/request-info`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  // ... onSuccess, onError
});
```

### 2. إضافة أزرار القرارات
```typescript
// في AdminRequestDetailPage.tsx - بعد Card "Approve Request"
<Card>
  <CardTitle>{tAdminRequests('detail.rejectTitle', language)}</CardTitle>
  {/* Reject form */}
</Card>

<Card>
  <CardTitle>{tAdminRequests('detail.requestInfoTitle', language)}</CardTitle>
  {/* Request Info form */}
</Card>
```

### 3. عرض Metadata حسب نوع الطلب
```typescript
// Helper function لعرض metadata
function renderMetadataSection(request: AdminRequest, language: 'ar' | 'en') {
  if (!request.metadata) return null;
  
  switch (request.type) {
    case 'partnership':
      return (
        <Card>
          <CardTitle>Partnership Details</CardTitle>
          <InfoGrid items={[
            { label: 'Project ID', value: request.metadata.projectId },
            { label: 'Proposed Amount', value: request.metadata.proposedAmount },
            { label: 'Partnership Plan', value: request.metadata.partnershipPlan },
          ]} />
        </Card>
      );
    // ... other types
  }
}
```

### 4. تحديث Request Info Section
```typescript
// إضافة حقول إضافية حسب نوع الطلب
const requestInfoItems = [
  // ... existing items
  ...(request.type === 'buy' || request.type === 'sell' ? [
    { label: 'Target Price', value: request.targetPrice },
    { label: 'Expiry Date', value: formatDate(request.expiryAt) },
  ] : []),
];
```

---

## 🔍 Acceptance Criteria Status

1. ✅ إنشاء API endpoint GET /admin/requests/:id مع جميع التفاصيل
2. ✅ إنشاء صفحة Request Details في Frontend
3. ⏳ عرض بيانات الطلب الكاملة حسب نوعه:
   - ✅ شراء/بيع: المبلغ، العملة (partial - يحتاج target_price, expiry_at)
   - ⏳ شراكة: المشروع، المبلغ المقترح، خطة الشراكة
   - ⏳ ترشيح مجلس: السيرة الذاتية، الخبرات، الدوافع
   - ⏳ ملاحظات: الموضوع، الفئة، الوصف، الأولوية
4. ✅ عرض الملفات المرفوعة مع إمكانية التنزيل
5. ✅ عرض سجل الأحداث (Timeline)
6. ✅ عرض التعليقات الداخلية
7. ⏳ أزرار القرار (قبول/رفض/طلب معلومات إضافية) - حسب نوع الطلب
   - ✅ زر قبول موجود
   - ⏳ زر رفض - يحتاج mutation
   - ⏳ زر طلب معلومات - يحتاج mutation
8. ⏳ عرض البيانات الإضافية من حقل metadata بشكل منظم
9. ⏳ جميع الاختبارات تمر بنجاح

---

## 📝 ملاحظات

- Backend routes موجودة: `/admin/requests/:id/reject` و `/admin/requests/:id/request-info`
- Controllers موجودة: `rejectRequest` و `requestInfo`
- يبقى فقط ربط Frontend mutations وإضافة UI components

---

**آخر تحديث:** 2025-01-16

