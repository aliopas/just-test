# Scripts Directory

This directory contains utility scripts for the Next.js project.

## fix-validator-types.js

### Purpose
This script automatically fixes Next.js generated type files by adding the missing React import statement. 

### Problem
Next.js generates type files in `.next/types/` (like `validator.ts`, `layout.ts`, `page.ts`) without importing React, but these files use `React.ComponentType`, `React.ReactNode`, etc. in type definitions, causing TypeScript compilation errors.

### Solution
The script automatically adds `import React from 'react'` to all generated type files that use React types after each build.

### Usage

**Automatic (Recommended):**
The script runs automatically after `npm run build` via the `postbuild` hook in `package.json`.

**Manual:**
```bash
npm run fix:validator
# or
node scripts/fix-validator-types.js
```

### Files Modified
- `.next/types/validator.ts` - Adds React import if missing
- `.next/types/app/**/layout.ts` - Adds React import if missing
- `.next/types/app/**/page.ts` - Adds React import if missing

The script automatically detects which files need fixing by checking if they use React types.

### Notes
- This is a temporary workaround until Next.js fixes the issue
- The script is idempotent - safe to run multiple times
- The script checks if React import already exists before modifying
- The script only modifies files that actually use React types

