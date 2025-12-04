import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that don't require authentication
 * هذه الصفحات متاحة للجميع بدون تسجيل دخول
 */
const publicRoutes = [
  '/',                    // الصفحة الرئيسية
  '/login',               // تسجيل الدخول
  '/register',            // التسجيل
  '/verify',              // التحقق من OTP
  '/reset-password',      // إعادة تعيين كلمة المرور
  '/home',                // الصفحة الرئيسية للمستثمر (عامة)
  '/news',                // الأخبار العامة
  '/middleware-redirect', // صفحة إعادة التوجيه
];

/**
 * Protected routes that require authentication
 * هذه الصفحات تحتاج تسجيل دخول (يتم التحقق منها على جانب العميل)
 */
const protectedRoutes = {
  investor: [
    '/dashboard',           // لوحة تحكم المستثمر
    '/profile',             // الملف الشخصي
    '/requests',            // قائمة الطلبات
    '/requests/new',        // طلب جديد
    '/projects',            // المشاريع
    '/internal-news',       // الأخبار الداخلية
    '/test-supabase',       // صفحة اختبار Supabase
  ],
  admin: [
    '/admin',               // لوحة تحكم الأدمن
    '/admin/dashboard',     // لوحة تحكم الأدمن
    '/admin/requests',      // صندوق الوارد
    '/admin/investors',     // قائمة المستثمرين
    '/admin/news',          // إدارة الأخبار
    '/admin/projects',      // إدارة المشاريع
    '/admin/reports',       // التقارير
    '/admin/audit',         // سجل التدقيق
    '/admin/company-content', // محتوى الشركة
    '/admin/signup-requests', // طلبات التسجيل
  ],
};

/**
 * Middleware for Next.js App Router
 * Handles basic route protection and public routes
 * Authentication is primarily handled client-side
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. الصفحة الرئيسية - يجب السماح بها دائماً
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. الصفحات العامة - السماح بها بدون مصادقة
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. مسارات API - السماح بها (التحقق من المصادقة يتم في الـ API نفسه)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 4. الملفات الثابتة وملفات Next.js الداخلية
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    // السماح بملفات ذات امتدادات (صور، خطوط، CSS، JS)
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot|json|xml)$/)
  ) {
    return NextResponse.next();
  }

  // 5. المسارات الديناميكية (مثل [id] أو [...slug])
  // يتم التعامل معها من قبل Next.js routing
  // أمثلة: /requests/[id], /news/[id], /projects/[id], /admin/requests/[id]
  // هذه المسارات تحتاج مصادقة (يتم التحقق منها على جانب العميل)
  
  // 6. جميع المسارات الأخرى (المحمية وغير المحمية)
  // يتم السماح بها - التحقق من المصادقة يتم على جانب العميل
  // في AuthContext والمكونات
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Simple matcher: match all paths
     * The middleware function itself filters out static files and API routes
     */
    '/(.*)',
  ],
};
