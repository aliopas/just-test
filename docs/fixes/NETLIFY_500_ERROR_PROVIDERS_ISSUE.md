# مشكلة Providers.tsx على Netlify

## المشكلة

المشكلة المحتملة أن `Providers.tsx` يستخدم `usePathname` و `useSearchParams` في `RouterWrapper`، وهذه الـ hooks قد تسبب مشاكل في SSR على Netlify.

## الحل

يجب تعطيل SSR لـ `Providers` أيضاً أو استخدام dynamic import له في `layout.tsx`.

