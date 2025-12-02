'use client';

import { Suspense } from 'react';
import { InvestorNewsListPage } from '@/pages/InvestorNewsListPage';
import { ClientOnly } from '../../components/ClientOnly';

export const dynamic = 'force-dynamic';

function NewsLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '2rem',
      }}
    >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
    </div>
  );
}

export default function News() {
  return (
    <ClientOnly>
      <Suspense fallback={<NewsLoading />}>
        <InvestorNewsListPage />
      </Suspense>
    </ClientOnly>
  );
}

