'use client';

import { Suspense } from 'react';
import { InvestorInternalNewsDetailPage } from '@/spa-pages/InvestorInternalNewsDetailPage';
import { ClientOnly } from '../../../components/ClientOnly';
import { LoadingState } from '@/components/LoadingState';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function InternalNewsDetailContent() {
  return (
    <ClientOnly>
      <InvestorInternalNewsDetailPage />
    </ClientOnly>
  );
}

function InternalNewsDetailLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <LoadingState />
    </div>
  );
}

export default function InternalNewsDetail() {
  return (
    <Suspense fallback={<InternalNewsDetailLoading />}>
      <InternalNewsDetailContent />
    </Suspense>
  );
}

