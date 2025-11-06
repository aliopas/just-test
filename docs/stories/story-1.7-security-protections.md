# Story 1.7: إضافة Rate Limiting وCSRF وSecurity Headers وCSP

## Context
- Epic: Epic 1 - البنية الأساسية والمصادقة
- Goal: تقوية طبقة الأمان للتطبيق ضد الهجمات الشائعة.

## Scope
- Rate limiting
- CSRF protection
- Security headers (Helmet)
- Basic CSP

## Out of Scope
- WAF/CDN (Cloudflare) إعدادات متقدمة (لاحقاً)

## Dependencies
- Endpoints الأساسية من القصص السابقة

## Acceptance Criteria
1. تفعيل `express-rate-limit` بحد افتراضي: 100 req/min/IP (قابل للتهيئة)
2. تفعيل `csurf` على عمليات state-changing مع استثناءات API المدروسة
3. تفعيل Helmet (X-Frame-Options, X-Content-Type-Options, XSS-Protection, HSTS وفق البيئة)
4. إضافة Content Security Policy أساسي (script-src, style-src, img-src) مع دعم Next.js
5. اختبارات تأكد من:
   - تجاوز الحد → 429
   - طلب بلا CSRF token على المسارات المحمية → 403
   - وجود الرؤوس الأمنية في الاستجابة

## Implementation Notes
- ضبط مفاتيح البيئة للحدود والقوائم البيضاء للـ CSP
- تمكين HSTS في الإنتاج فقط
- دمج CSRF مع Cookies آمنة (SameSite/Lax عند اللزوم)

## Tasks
- إعداد middleware للـ rate limit
- إعداد csurf واستخراج/تمرير token (وثّق ذلك في README)
- تفعيل Helmet وتضبيط CSP
- اختبارات للتأكد من السلوك المطلوب

## Definition of Done
- السياسات الأمنية مفعلة ومختبرة
- الوثائق محدثة لكيفية الحصول على CSRF token واستخدامه
