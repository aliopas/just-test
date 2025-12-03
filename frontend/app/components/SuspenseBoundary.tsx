'use client';

import type { ReactNode } from 'react';
import { palette } from '@/styles/theme';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingText?: string;
}

// NOTE:
// React 19 + current @types/react can cause type incompatibilities when using <Suspense />
// inside certain Next.js App Router components. To keep the build passing and still provide
// a consistent API, this boundary currently renders children directly.
// If you need a visual loading state, handle it inside the child component or re‑introduce
// Suspense once the type ecosystem stabilises.
export function SuspenseBoundary({
  children,
}: SuspenseBoundaryProps) {
  return <>{children}</>;
}

