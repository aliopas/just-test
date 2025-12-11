# إصلاح مشكلة MCP في نظام الدردشة

## المشكلة المكتشفة

عند محاولة إدراج رسائل جديدة في جدول `chat_messages`، كان يحدث خطأ:

```
ERROR: 42703: column "username" does not exist
QUERY: SELECT username FROM users WHERE id = NEW.sender_id
CONTEXT: PL/pgSQL function create_chat_message_notification() line 25
```

## السبب

دالة الـ trigger `create_chat_message_notification()` كانت تحاول الوصول إلى عمود `username` في جدول `users`، لكن هذا العمود غير موجود. جدول `users` يحتوي فقط على `email` وليس `username`.

## الحل

تم إصلاح الدالة `create_chat_message_notification()` لتستخدم:
- `email` من جدول `users`
- `full_name` من جدول `investor_profiles` (إن وجد)
- إذا لم يوجد `full_name`، يتم استخدام `email` كاسم افتراضي

## Migration المطبقة

تم إنشاء migration جديد: `fix_chat_notification_username`

```sql
CREATE OR REPLACE FUNCTION public.create_chat_message_notification()
-- يستخدم email و full_name بدلاً من username
```

## الاختبارات

تم إنشاء 6 رسائل تجريبية في محادثتين:

### المحادثة 1 (3 رسائل):
- رسالة من المستثمر: "مرحباً، هذه رسالة تجريبية من المستثمر"
- رسالة من الأدمن: "Hello, this is a test message from admin"
- رسالة من المستثمر: "رسالة ثانية للتأكد من عمل النظام"

### المحادثة 2 (3 رسائل):
- Test message 1 from investor
- Test message 2 from admin
- Test message 3 from investor

## النتائج

✅ تم إدراج جميع الرسائل بنجاح  
✅ تم تحديث `last_message_at` في المحادثات تلقائياً  
✅ تم إنشاء إشعارات للمستلمين بشكل صحيح  
✅ الدالة تعمل بدون أخطاء  

## التحقق من البيانات

```sql
-- عدد الرسائل في كل محادثة
SELECT 
  cc.id,
  cc.user_id as investor_id,
  cc.admin_id,
  cc.last_message_at,
  COUNT(cm.id) as message_count
FROM chat_conversations cc
LEFT JOIN chat_messages cm ON cm.conversation_id = cc.id
GROUP BY cc.id, cc.user_id, cc.admin_id, cc.last_message_at
ORDER BY cc.last_message_at DESC;
```

## ملاحظات أمنية

هناك تحذيرات أمنية حول `search_path` في بعض الدوال، لكنها تحذيرات وليست أخطاء. يمكن معالجتها لاحقاً لتحسين الأمان.

## الحالة النهائية

✅ **تم إصلاح المشكلة بنجاح**  
✅ **نظام الدردشة يعمل بشكل صحيح**  
✅ **جميع الرسائل التجريبية تم إدراجها**  
✅ **الإشعارات تعمل بشكل صحيح**

