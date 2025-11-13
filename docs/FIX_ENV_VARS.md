# إصلاح متغيرات البيئة

## المشكلة
المتغيرات في `.env.local` لا تبدأ بـ `VITE_`، لذلك Vite لا يحملها.

## الحل

### عدّل ملف `frontend/.env.local` ليصبح:

```env
VITE_SUPABASE_URL=https://wtvvzthfpusnqztltkkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dnZ6dGhmcHVzbnF6dGx0a2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzE2MDUsImV4cCI6MjA3NzgwNzYwNX0.6KttJmjGUsgp3xfGf3wBm6kPmrinXB5R6AJJsTB-LWA
```

**⚠️ مهم:**
- يجب أن تبدأ المتغيرات بـ `VITE_`
- `SUPABASE_SERVICE_ROLE_KEY` لا يُستخدم في frontend (فقط في backend)

### بعد التعديل:
1. احفظ الملف
2. أوقف خادم التطوير (Ctrl+C)
3. أعد تشغيله: `npm run dev`

