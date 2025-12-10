# تعليمات رفع التغييرات إلى GitHub

## الوضع الحالي:
- ✅ تم إنشاء commit فارغ لإعادة trigger للـ deployment
- ✅ التغييرات موجودة في commit: `3a5a93a`
- ⚠️ يحتاج إلى push إلى GitHub

## خطوات الرفع:

### الطريقة 1: استخدام GitHub Desktop أو VS Code
1. افتح GitHub Desktop أو VS Code
2. اضغط على "Push" أو "Sync"

### الطريقة 2: استخدام Terminal مع Personal Access Token
1. اذهب إلى GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. أنشئ token جديد مع صلاحيات `repo`
3. استخدم الأمر التالي:
```bash
git push https://YOUR_TOKEN@github.com/bacuratec/invastors-bacura.git main
```

### الطريقة 3: استخدام SSH (إذا كان SSH key مضبوط)
```bash
# تأكيد SSH key
ssh-keyscan github.com >> ~/.ssh/known_hosts

# ثم push
git push origin main
```

### الطريقة 4: استخدام GitHub CLI
```bash
gh auth login
git push origin main
```

## ملاحظات:
- الـ commit الحالي: `3a5a93a` - "fix: trigger Netlify deployment - fix Supabase error handling"
- التغييرات المهمة موجودة في commit السابق: `e177fe5` - "6896"
- بعد الـ push، سيتم trigger للـ deployment في Netlify تلقائياً

