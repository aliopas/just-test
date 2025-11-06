# Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "timestamp": "2024-11-06T10:00:00Z"
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - خطأ في التحقق من البيانات
- `AUTHENTICATION_ERROR` - خطأ في المصادقة
- `AUTHORIZATION_ERROR` - خطأ في الصلاحيات
- `NOT_FOUND` - المورد غير موجود
- `CONFLICT` - تعارض في البيانات
- `RATE_LIMIT_EXCEEDED` - تجاوز حد الطلبات
- `INTERNAL_ERROR` - خطأ داخلي في الخادم

