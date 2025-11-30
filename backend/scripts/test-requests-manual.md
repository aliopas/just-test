# دليل اختبار الطلبات التجريبية

هذا الدليل يوضح كيفية اختبار جميع أنواع الطلبات للتأكد من عملها بشكل صحيح.

## أنواع الطلبات المطلوب اختبارها:

### 1. طلبات مالية (تتطلب amount و currency)

#### طلب شراء (Buy)
```json
{
  "type": "buy",
  "amount": 10000,
  "currency": "SAR",
  "notes": "طلب شراء تجريبي"
}
```

#### طلب بيع (Sell)
```json
{
  "type": "sell",
  "amount": 5000,
  "currency": "USD",
  "targetPrice": 150,
  "notes": "طلب بيع تجريبي"
}
```

### 2. طلبات الشراكة (Partnership)
```json
{
  "type": "partnership",
  "amount": 50000,
  "currency": "SAR",
  "metadata": {
    "companyName": "شركة تجريبية",
    "partnershipType": "strategic",
    "partnershipDetails": "تفاصيل الشراكة التجريبية",
    "contactPerson": "أحمد محمد",
    "contactEmail": "ahmed@example.com",
    "contactPhone": "+966501234567"
  },
  "notes": "طلب شراكة تجريبي"
}
```

### 3. طلبات الترشيح للمجلس (Board Nomination)

#### مع amount و currency (الطريقة الحالية)
```json
{
  "type": "board_nomination",
  "amount": 1,
  "currency": "SAR",
  "metadata": {
    "nomineeName": "سارة أحمد",
    "nomineePosition": "عضو مجلس إدارة",
    "nomineeQualifications": "خبرة واسعة في التمويل",
    "nominationReason": "مهارات قيادية قوية",
    "nomineeEmail": "sara@example.com",
    "nomineePhone": "+966502345678"
  },
  "notes": "طلب ترشيح تجريبي"
}
```

#### بدون amount و currency (يجب أن يعمل أيضاً)
```json
{
  "type": "board_nomination",
  "metadata": {
    "nomineeName": "سارة أحمد",
    "nomineePosition": "عضو مجلس إدارة",
    "nomineeQualifications": "خبرة واسعة في التمويل",
    "nominationReason": "مهارات قيادية قوية"
  },
  "notes": "طلب ترشيح تجريبي بدون amount"
}
```

### 4. طلبات الملاحظات (Feedback)

#### بدون amount و currency (الطريقة المفضلة)
```json
{
  "type": "feedback",
  "metadata": {
    "feedbackType": "suggestion",
    "subject": "ملاحظة تجريبية",
    "priority": "high"
  },
  "notes": "هذه رسالة ملاحظات تجريبية"
}
```

#### مع amount و currency (يجب أن يعمل أيضاً)
```json
{
  "type": "feedback",
  "amount": 1,
  "currency": "SAR",
  "metadata": {
    "feedbackType": "complaint",
    "subject": "شكوى تجريبية",
    "priority": "medium"
  },
  "notes": "هذه شكوى تجريبية"
}
```

## كيفية الاختبار:

### 1. اختبار من الواجهة الأمامية (Frontend)

1. افتح التطبيق في المتصفح
2. سجل الدخول كمستثمر
3. انتقل إلى صفحة إنشاء طلب جديد
4. جرب كل نوع من أنواع الطلبات:
   - اختر نوع الطلب من القائمة
   - املأ الحقول المطلوبة
   - اضغط "إرسال الطلب"
   - تحقق من رسالة النجاح

### 2. اختبار من API مباشرة (Postman/curl)

#### مثال باستخدام curl:

```bash
# طلب شراء
curl -X POST http://localhost:3000/api/v1/investor/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "buy",
    "amount": 10000,
    "currency": "SAR",
    "notes": "طلب شراء تجريبي"
  }'

# طلب ترشيح (بدون amount)
curl -X POST http://localhost:3000/api/v1/investor/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "board_nomination",
    "metadata": {
      "nomineeName": "سارة أحمد",
      "nomineePosition": "عضو مجلس إدارة"
    },
    "notes": "طلب ترشيح تجريبي"
  }'

# طلب ملاحظات (بدون amount)
curl -X POST http://localhost:3000/api/v1/investor/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "feedback",
    "metadata": {
      "feedbackType": "suggestion",
      "subject": "ملاحظة تجريبية",
      "priority": "high"
    },
    "notes": "هذه رسالة ملاحظات تجريبية"
  }'
```

### 3. اختبار Schema مباشرة

قم بتشغيل السكريبت:
```bash
cd backend
npx tsx scripts/test-request-schemas.ts
```

## النتائج المتوقعة:

✅ **يجب أن تعمل:**
- جميع طلبات الشراء والبيع (مع amount و currency)
- طلبات الشراكة (مع amount و currency)
- طلبات الترشيح (مع أو بدون amount و currency)
- طلبات الملاحظات (مع أو بدون amount و currency)

❌ **يجب أن تفشل:**
- طلبات الشراء/البيع بدون amount أو currency
- طلبات ببيانات غير صحيحة (مثل amount = 0 أو سالب)

## ملاحظات:

1. **طلبات الشراء والبيع**: تتطلب `amount` و `currency` بشكل إلزامي
2. **طلبات الشراكة**: يمكن إرسال `amount` و `currency` (لأنها تحتوي على investmentAmount)
3. **طلبات الترشيح والملاحظات**: `amount` و `currency` اختياريان تماماً

## التحقق من النجاح:

بعد إرسال كل طلب، تحقق من:
1. ✅ رسالة نجاح في الواجهة
2. ✅ ظهور الطلب في قائمة الطلبات
3. ✅ إمكانية فتح تفاصيل الطلب
4. ✅ عدم وجود أخطاء في console المتصفح
5. ✅ عدم وجود أخطاء في logs الخادم

