'use client';

import React from 'react';
import { Providers } from '../../../app/components/Providers';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

