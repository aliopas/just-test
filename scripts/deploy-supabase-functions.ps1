# سكريبت PowerShell لنشر جميع Supabase Edge Functions
# Usage: .\scripts\deploy-supabase-functions.ps1 [function-name]

param(
    [string]$FunctionName = ""
)

# قائمة جميع الدوال
$Functions = @(
    "admin-create-user",
    "admin-update-user",
    "admin-delete-user",
    "approve-signup-request",
    "notification-dispatch"
)

# التحقق من تثبيت Supabase CLI
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Supabase CLI غير مثبت" -ForegroundColor Red
    Write-Host "قم بتثبيته عبر: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# التحقق من تسجيل الدخول
try {
    $null = supabase projects list 2>&1
} catch {
    Write-Host "⚠️  يبدو أنك غير مسجل الدخول إلى Supabase" -ForegroundColor Yellow
    Write-Host "قم بتسجيل الدخول عبر: supabase login" -ForegroundColor Yellow
    exit 1
}

# إذا تم تمرير اسم دالة كمعامل، نشرها فقط
if ($FunctionName -ne "") {
    if ($Functions -notcontains $FunctionName) {
        Write-Host "❌ الدالة '$FunctionName' غير موجودة" -ForegroundColor Red
        Write-Host "الدوال المتاحة:" -ForegroundColor Yellow
        foreach ($func in $Functions) {
            Write-Host "  - $func"
        }
        exit 1
    }
    
    Write-Host "📦 نشر الدالة: $FunctionName" -ForegroundColor Yellow
    supabase functions deploy $FunctionName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ تم نشر $FunctionName بنجاح" -ForegroundColor Green
    } else {
        Write-Host "❌ فشل نشر $FunctionName" -ForegroundColor Red
        exit 1
    }
} else {
    # نشر جميع الدوال
    Write-Host "🚀 بدء نشر جميع Edge Functions..." -ForegroundColor Yellow
    Write-Host ""
    
    $SuccessCount = 0
    $FailCount = 0
    
    foreach ($func in $Functions) {
        Write-Host "📦 نشر $func..." -ForegroundColor Yellow
        
        supabase functions deploy $func
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ تم نشر $func بنجاح" -ForegroundColor Green
            $SuccessCount++
        } else {
            Write-Host "❌ فشل نشر $func" -ForegroundColor Red
            $FailCount++
        }
        Write-Host ""
    }
    
    # ملخص النتائج
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "✅ نجح: $SuccessCount" -ForegroundColor Green
    if ($FailCount -gt 0) {
        Write-Host "❌ فشل: $FailCount" -ForegroundColor Red
    }
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if ($FailCount -eq 0) {
        Write-Host "🎉 تم نشر جميع الدوال بنجاح!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠️  بعض الدوال فشل نشرها" -ForegroundColor Red
        exit 1
    }
}

