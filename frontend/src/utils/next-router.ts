/**
 * Helper utilities for migrating from React Router to Next.js routing
 * 
 * This file provides compatibility helpers and migration utilities
 * for components that still use React Router patterns.
 */

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Compatibility hook for useNavigate from React Router
 * Returns a function that can be used like navigate('/path')
 */
export function useNextNavigate() {
  const router = useRouter();
  
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      // Handle relative navigation
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
    } else {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  };
}

/**
 * Compatibility hook for useLocation from React Router
 * Returns an object similar to React Router's location
 */
export function useNextLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: '',
    state: null,
  };
}

/**
 * Get route params from Next.js
 * For dynamic routes, use Next.js useParams hook directly
 */
export { useParams } from 'next/navigation';

