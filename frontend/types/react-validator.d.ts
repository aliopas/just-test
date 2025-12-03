// This file ensures React namespace is available for Next.js generated type files
// This fixes the issue where .next/types/validator.ts uses React.ComponentType 
// and React.ReactNode without importing React
//
// This file is included in tsconfig.json to provide React namespace globally
// for generated Next.js type validation files

import React from 'react';

// Declare React namespace to be available globally
declare namespace React {
  export type ComponentType<P = {}> = React.ComponentType<P>;
  export type ReactNode = React.ReactNode;
}

