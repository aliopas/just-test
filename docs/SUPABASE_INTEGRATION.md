# دليل تكامل Supabase و MCP
## Supabase & MCP Integration Guide

هذا المستند يوضح كيفية استخدام Supabase و MCP (Model Context Protocol) في مشروع منصة باكورة الاستثمارية.

---

## نظرة عامة

المشروع يستخدم:
- **Supabase** كـ Backend-as-a-Service (BaaS)
- **Supabase MCP Server** لإدارة قاعدة البيانات والهجرات
- **Supabase Client** للاتصال بقاعدة البيانات
- **Supabase Auth** للمصادقة
- **Supabase Storage** لتخزين الملفات
- **Supabase Realtime** للتحديثات الفورية

---

## إعداد Supabase MCP

### 1. تثبيت Supabase CLI

```bash
npm install -g supabase
```

### 2. تسجيل الدخول إلى Supabase

```bash
supabase login
```

### 3. ربط المشروع

```bash
supabase link --project-ref your-project-ref
```

### 4. استخدام MCP Tools

المشروع يستخدم Supabase MCP Server الذي يوفر الأدوات التالية:

- `mcp_supabase_list_tables` - عرض جميع الجداول
- `mcp_supabase_apply_migration` - تطبيق الهجرات
- `mcp_supabase_execute_sql` - تنفيذ SQL مباشر
- `mcp_supabase_get_logs` - الحصول على السجلات
- `mcp_supabase_get_advisors` - الحصول على النصائح الأمنية والأداء

---

## استخدام Supabase Client

### إعداد Supabase Client

```typescript
import { supabase, requireSupabaseAdmin } from '../lib/supabase'
```

> **مهم:** أي عملية كتابة على الجداول التي تم تفعيل RLS لها (مثل `users`, `user_roles`, `user_otps`) يجب أن تستخدم عميل الخدمة (`requireSupabaseAdmin`) مع المتغير `SUPABASE_SERVICE_ROLE_KEY`.

### أمثلة الاستخدام

#### 1. القراءة (SELECT)

```typescript
// قراءة بيانات
const { data, error } = await supabase
  .from('requests')
  .select('*')
  .eq('status', 'submitted')
  .order('created_at', { ascending: false })
  .range(0, 9)

// مع JOIN
const { data, error } = await supabase
  .from('requests')
  .select(`
    *,
    users:user_id (
      name,
      email
    )
  `)
```

#### 2. الإدراج (INSERT)

```typescript
const adminClient = requireSupabaseAdmin()

const { data, error } = await adminClient
  .from('requests')
  .insert({
    user_id: userId,
    type: 'buy',
    amount: 1000,
    currency: 'SAR',
    status: 'draft'
  })
```

#### 3. التحديث (UPDATE)

```typescript
const adminClient = requireSupabaseAdmin()

const { data, error } = await adminClient
  .from('requests')
  .update({ status: 'approved' })
  .eq('id', requestId)
```

#### 4. الحذف (DELETE)

```typescript
const adminClient = requireSupabaseAdmin()

const { error } = await adminClient
  .from('requests')
  .delete()
  .eq('id', requestId)
```

#### 5. الفلترة والبحث

```typescript
// فلترة متعددة
const { data, error } = await supabase
  .from('requests')
  .select('*')
  .eq('status', 'submitted')
  .gte('amount', 1000)
  .lte('amount', 10000)
  .ilike('user_name', '%ahmed%')
```

---

## Supabase Auth

### تسجيل الدخول

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### تسجيل الخروج

```typescript
const { error } = await supabase.auth.signOut()
```

### التحقق من الجلسة

```typescript
const { data: { session } } = await supabase.auth.getSession()
```

### تحديث الجلسة

```typescript
const { data, error } = await supabase.auth.refreshSession()
```

---

## Supabase Storage

### رفع ملف

```typescript
const { data, error } = await supabase.storage
  .from('attachments')
  .upload('path/to/file.pdf', file)
```

### إنشاء Presigned URL للرفع

```typescript
const { data, error } = await supabase.storage
  .from('attachments')
  .createSignedUploadUrl('path/to/file.pdf')
```

### تنزيل ملف

```typescript
const { data, error } = await supabase.storage
  .from('attachments')
  .download('path/to/file.pdf')
```

### إنشاء Presigned URL للتنزيل

```typescript
const { data, error } = await supabase.storage
  .from('attachments')
  .createSignedUrl('path/to/file.pdf', 3600) // 1 hour
```

---

## Supabase Realtime

### الاشتراك في التحديثات

```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, 
    (payload) => {
      console.log('New notification:', payload.new)
    }
  )
  .subscribe()
```

### إلغاء الاشتراك

```typescript
await supabase.removeChannel(channel)
```

---

## Row Level Security (RLS)

### مثال على Policy

```sql
-- السماح للمستخدمين بقراءة إشعاراتهم فقط
CREATE POLICY "Users can read their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);
```

### تفعيل RLS

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

---

## الهجرات (Migrations)

### إنشاء Migration

```bash
supabase migration new create_requests_table
```

### تطبيق Migration باستخدام MCP

```typescript
// في الكود، استخدام MCP tool
await mcp_supabase_apply_migration({
  name: 'create_requests_table',
  query: `
    CREATE TABLE requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      type VARCHAR(10) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
})
```

---

## أفضل الممارسات

1. **استخدم RLS دائماً** لحماية البيانات
2. **استخدم Indexes** للبحث السريع
3. **استخدم Pagination** للاستعلامات الكبيرة
4. **استخدم Realtime** للتحديثات الفورية
5. **استخدم Edge Functions** للمعالجة المعقدة
6. **راقب الأداء** باستخدام Supabase Dashboard
7. **استخدم MCP** لإدارة الهجرات والاستعلامات

---

## المراجع

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase MCP Server](https://github.com/supabase/mcp-server)

