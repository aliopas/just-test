# Story 1.2: إعداد الهوية البصرية ونظام الألوان

**As a** مصمم/مطور  
**I want** تعريف نظام الهوية البصرية بما يشمل الألوان والشعار ودعم RTL  
**So that** الواجهة الأمامية تحافظ على اتساق بصري وعلامي واضح

---

## متطلبات العمل
1. تعريف لوحة الألوان الرسمية كما هي في الـ PRD.  
2. توفير ملف Theme مركزي يتضمن الطباعات، المسافات، الظلال، ودوال تحويل لـ CSS Variables.  
3. تخزين الشعار الرسمي في أصول الواجهة الأمامية مع مكوّن يعيد استخدامه.  
4. توثيق قواعد الاستخدام البصري في دليل تصميم يمكن تحديثه.  
5. ضمان دعم الاتجاهين (LTR/RTL) من خلال خصائص منطقية.

---

## المتطلبات التقنية
| البند | الوصف |
|-------|-------|
| Theme File | `frontend/src/styles/theme.ts` |
| Logo Component | `frontend/src/components/Logo.tsx` |
| Logo Asset | `frontend/src/assets/logo.jpg` |
| Documentation | `docs/design-system.md` |
| Integration Hook | دالة `toCssVariables(theme)` لتوليد CSS Variables |

---

## Acceptance Criteria
1. ملف Theme يضم جميع الألوان المذكورة في PRD.  
2. تعريف الألوان الثانوية (نص، حدود، سطح، حالات) بشكل صريح.  
3. الشعار متوفر في أصول الواجهة الأمامية مع تعريف قواعد الاستخدام.  
4. مكوّن Logo يعرض الشعار مع خيارات الحجم والوضع العكسي.  
5. وثيقة تصميم تحتوي على قواعد الألوان، الخطوط، المسافات، الإدخال النصي، الزر، والبطاقات.  
6. دعم RTL موثق ومضمن في ملف Theme.  
7. التوثيق الرئيسي (README و Front-end Spec) يشير إلى النظام الجديد.  

---

## خطوات التنفيذ
1. إنشاء مجلد `frontend/src/styles` وكتابة `theme.ts`.  
2. إنشاء `Logo.tsx` ضمن `frontend/src/components`.  
3. نسخ الشعار الرسمي من `docs/images/logo.jpg` إلى `frontend/src/assets/logo.jpg`.  
4. كتابة ملف `docs/design-system.md` وتضمين اللوحة والأدلة.  
5. تحديث `docs/front-end-spec.md` و`README.md` للإشارة إلى النظام.  
6. تشغيل `npm run lint` للتأكد من خلو التعديلات من مشاكل نمطية.

---

## Notes
- يوصى بإضافة Storybook لاحقًا لعرض المكوّنات.  
- يمكن إضافة دعم الوضع الداكن بنفس الهيكل.  
- ملف theme لا يتطلب حاليًا bundler، لكنه جاهز للدمج مع React/Next.js.

---

**Status:** In Progress  
**Owner:** Team UI/UX  
**Last Updated:** 2025-11-08  


