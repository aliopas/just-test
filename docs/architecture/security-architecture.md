# Security Architecture

### Authentication Flow

1. المستخدم يسجل أو يسجل دخول
2. Supabase Auth يتحقق من Credentials
3. Supabase يرجع JWT Token + Refresh Token
4. Frontend يحفظ Tokens في Secure HttpOnly Cookies
5. كل Request يحتوي على JWT في Header
6. Middleware يتحقق من Token ويستخرج User Info

### Authorization (RBAC)

- **Investor:** يمكنه الوصول لطلباته وملفه الشخصي فقط
- **Admin:** وصول كامل لجميع الوظائف الإدارية (معالجة الطلبات، إدارة المستخدمين، إدارة المحتوى، التقارير، سجل التدقيق)

### Row Level Security (RLS)

جميع الجداول تستخدم RLS Policies في Supabase:

```sql
-- مثال: المستخدمون يقرأون إشعاراتهم فقط
CREATE POLICY "Users can read their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- مثال: المستخدمون يقرأون طلباتهم فقط
CREATE POLICY "Users can read their own requests"
ON requests
FOR SELECT
USING (auth.uid() = user_id);
```

### Security Best Practices

1. **HTTPS Only:** جميع الاتصالات عبر HTTPS
2. **CORS:** تكوين CORS بشكل صارم
3. **Rate Limiting:** 100 requests/minute لكل IP
4. **Input Validation:** Zod validation على جميع المدخلات
5. **SQL Injection:** استخدام Parameterized Queries فقط
6. **XSS Protection:** Content Security Policy (CSP)
7. **CSRF Protection:** CSRF tokens للـ state-changing operations
8. **Security Headers:** Helmet.js للـ security headers

