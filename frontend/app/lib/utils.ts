/**
 * Utility functions for Next.js app
 */

/**
 * Generate metadata for pages
 */
export function generateMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path?: string;
}) {
  const baseTitle = 'شركاء باكورة';
  const fullTitle = title ? `${title} - ${baseTitle}` : baseTitle;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://invastors.com';

  return {
    title: fullTitle,
    description: description || 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة',
    openGraph: {
      title: fullTitle,
      description: description || 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة',
      url: path ? `${baseUrl}${path}` : baseUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || 'منصة آمنة لإدارة طلبات الاستثمار ومتابعة أداء المحفظة',
    },
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, locale: 'ar' | 'en' = 'ar'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'SAR',
  locale: 'ar' | 'en' = 'ar'
): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Class name utility (similar to clsx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

