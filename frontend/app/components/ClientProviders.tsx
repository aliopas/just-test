'use client';

import React from 'react';
import { Providers } from './Providers';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return React.createElement(Providers, null, children);
}

