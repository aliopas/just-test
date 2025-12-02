# إصلاح خطأ: المنفذ مستخدم (Port Already in Use)

## المشكلة

عند محاولة تشغيل الخادم، يظهر الخطأ التالي:

```
Error: listen EADDRINUSE: address already in use :::3001
```

## السبب

المنفذ 3001 مستخدم بالفعل من قبل عملية أخرى (عادة نسخة سابقة من الخادم لم يتم إيقافها بشكل صحيح).

## الحلول

### الحل 1: إيقاف العملية المستخدمة (موصى به)

**في PowerShell:**

1. ابحث عن العملية التي تستخدم المنفذ:
```powershell
netstat -ano | findstr :3001
```

2. ستجد الناتج مثل:
```
TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING       4272
TCP    [::]:3001              [::]:0                 LISTENING       4272
```

3. رقم `4272` هو Process ID (PID). أوقف العملية:
```powershell
Stop-Process -Id 4272 -Force
```

### الحل 2: إيقاف جميع عمليات Node.js

**في PowerShell:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**في Command Prompt:**
```cmd
taskkill /F /IM node.exe
```

### الحل 3: استخدام منفذ آخر

يمكنك تغيير المنفذ في `.env`:
```env
PORT=3002
```

أو في `backend/src/server.ts`:
```typescript
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## سكريبت PowerShell تلقائي

يمكنك إنشاء سكريبت لإيقاف المنفذ تلقائياً:

```powershell
# kill-port.ps1
$port = $args[0]
if (-not $port) {
    Write-Host "Usage: .\kill-port.ps1 <port>"
    exit 1
}

$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    $pid = $process.OwningProcess
    Stop-Process -Id $pid -Force
    Write-Host "✅ تم إيقاف العملية $pid التي كانت تستخدم المنفذ $port"
} else {
    Write-Host "ℹ️  لا توجد عملية تستخدم المنفذ $port"
}
```

**الاستخدام:**
```powershell
.\kill-port.ps1 3001
```

## التحقق من أن المنفذ متاح

بعد إيقاف العملية، تحقق:
```powershell
netstat -ano | findstr :3001
```

إذا لم يظهر أي ناتج، فالمنفذ متاح الآن.

## منع المشكلة في المستقبل

1. **استخدم Ctrl+C بشكل صحيح**: عند إيقاف الخادم، استخدم `Ctrl+C` وانتظر حتى يتوقف تماماً
2. **استخدم nodemon بشكل صحيح**: nodemon قد يعيد تشغيل الخادم، تأكد من إيقافه بشكل كامل
3. **أضف معالجة للخطأ**: يمكنك إضافة معالجة في `server.ts`:

```typescript
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// معالجة خطأ المنفذ المستخدم
process.on('uncaughtException', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ المنفذ ${PORT} مستخدم بالفعل. أوقف العملية السابقة أولاً.`);
    process.exit(1);
  }
});
```

## التاريخ

2025-12-02

