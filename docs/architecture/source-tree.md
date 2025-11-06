# Source Tree
## Project Directory Structure

**الإصدار:** 1.0  
**التاريخ:** 2024-11-06

---

## Complete Directory Structure

```
invastors-bacura/
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI/CD pipeline
│       ├── deploy-frontend.yml # Frontend deployment
│       └── deploy-backend.yml  # Backend deployment
│
├── .bmad-core/                 # BMad framework files
│   ├── agents/
│   ├── checklists/
│   ├── tasks/
│   ├── templates/
│   └── core-config.yaml
│
├── docs/                       # Documentation
│   ├── prd/                   # PRD and Epics
│   │   ├── epic-1.md
│   │   ├── epic-2.md
│   │   └── ...
│   ├── architecture/          # Architecture documents
│   │   ├── coding-standards.md
│   │   ├── tech-stack.md
│   │   └── source-tree.md
│   ├── stories/              # User Stories
│   ├── qa/                   # QA documents
│   ├── prd.md
│   ├── architecture.md
│   ├── SUPABASE_INTEGRATION.md
│   └── NEXT_STEPS.md
│
├── frontend/                  # Next.js Frontend
│   ├── app/                  # App Router
│   │   ├── (auth)/          # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify-otp/
│   │   ├── (investor)/       # Investor routes group
│   │   │   ├── dashboard/
│   │   │   ├── requests/
│   │   │   ├── profile/
│   │   │   └── notifications/
│   │   ├── (admin)/         # Admin routes group
│   │   │   ├── dashboard/
│   │   │   ├── requests/
│   │   │   ├── users/
│   │   │   ├── news/
│   │   │   └── reports/
│   │   ├── api/             # API Routes (if needed)
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   │
│   ├── components/           # React Components
│   │   ├── ui/              # Base UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── ...
│   │   ├── forms/           # Form components
│   │   │   ├── RequestForm/
│   │   │   ├── ProfileForm/
│   │   │   └── ...
│   │   ├── layout/          # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── ...
│   │   └── features/        # Feature-specific components
│   │       ├── requests/
│   │       ├── notifications/
│   │       └── ...
│   │
│   ├── lib/                 # Utilities and helpers
│   │   ├── supabase/        # Supabase client
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── api/             # API clients
│   │   │   └── client.ts
│   │   ├── utils/           # Utility functions
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── ...
│   │   └── constants/       # Constants
│   │       └── index.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useRequests.ts
│   │   ├── useNotifications.ts
│   │   └── ...
│   │
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   ├── requestStore.ts
│   │   └── ...
│   │
│   ├── types/               # TypeScript types
│   │   ├── user.ts
│   │   ├── request.ts
│   │   ├── api.ts
│   │   └── ...
│   │
│   ├── styles/              # Global styles
│   │   └── globals.css
│   │
│   ├── public/              # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── ...
│   │
│   ├── locales/             # i18n translations
│   │   ├── ar/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   └── ...
│   │   └── en/
│   │       ├── common.json
│   │       ├── auth.json
│   │       └── ...
│   │
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── package.json         # Frontend dependencies
│   └── .env.local           # Frontend environment variables
│
├── backend/                  # Express.js Backend
│   ├── src/
│   │   ├── routes/          # API Routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── investor.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── news.routes.ts
│   │   │   └── notifications.routes.ts
│   │   │
│   │   ├── controllers/     # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── investor.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── ...
│   │   │
│   │   ├── services/        # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── request.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── ...
│   │   │
│   │   ├── models/          # Data models
│   │   │   ├── User.ts
│   │   │   ├── Request.ts
│   │   │   └── ...
│   │   │
│   │   ├── utils/           # Utilities
│   │   │   ├── logger.ts
│   │   │   ├── errors.ts
│   │   │   ├── validators.ts
│   │   │   └── ...
│   │   │
│   │   ├── types/           # TypeScript types
│   │   │   ├── express.d.ts
│   │   │   ├── user.types.ts
│   │   │   └── ...
│   │   │
│   │   └── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   │
│   ├── tests/               # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   │
│   ├── migrations/          # Database migrations (if needed)
│   │
│   ├── tsconfig.json        # TypeScript configuration
│   ├── package.json         # Backend dependencies
│   └── .env                 # Backend environment variables
│
├── shared/                  # Shared code
│   ├── types/               # Shared TypeScript types
│   │   ├── user.types.ts
│   │   ├── request.types.ts
│   │   └── api.types.ts
│   │
│   └── constants/           # Shared constants
│       ├── statuses.ts
│       ├── roles.ts
│       └── ...
│
├── supabase/                # Supabase configuration
│   ├── migrations/          # Supabase migrations
│   │   ├── 20241106000000_create_users.sql
│   │   ├── 20241106000001_create_requests.sql
│   │   └── ...
│   │
│   ├── functions/          # Edge Functions
│   │   ├── send-email/
│   │   ├── send-sms/
│   │   └── ...
│   │
│   └── config.toml        # Supabase configuration
│
├── docker/                  # Docker files
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── .gitignore              # Git ignore rules
├── .env.example           # Environment variables template
├── package.json           # Root package.json (workspace)
├── pnpm-workspace.yaml    # pnpm workspace config (if using pnpm)
├── docker-compose.yml     # Local development setup
├── README.md              # Project README
└── LICENSE                # License file
```

---

## Key Directories Explanation

### Frontend (`/frontend`)

- **`app/`**: Next.js App Router directory
  - Route groups: `(auth)`, `(investor)`, `(admin)`
  - Each route has its own folder with `page.tsx`
  - Layout files for shared UI

- **`components/`**: Reusable React components
  - Organized by type: `ui/`, `forms/`, `layout/`, `features/`

- **`lib/`**: Utility functions and configurations
  - Supabase clients (client & server)
  - API clients
  - Helper functions

- **`hooks/`**: Custom React hooks
  - Data fetching hooks
  - State management hooks

- **`store/`**: State management (Zustand stores)

- **`types/`**: TypeScript type definitions

- **`locales/`**: Internationalization files

### Backend (`/backend`)

- **`routes/`**: API endpoint definitions
  - Organized by feature/domain

- **`controllers/`**: Request handlers
  - Extract data from requests
  - Call services
  - Return responses

- **`services/`**: Business logic
  - Core application logic
  - Database interactions
  - External service integrations

- **`middleware/`**: Express middleware
  - Authentication
  - Validation
  - Error handling
  - Rate limiting

- **`models/`**: Data models/types

- **`utils/`**: Utility functions
  - Logging
  - Error handling
  - Validators

### Shared (`/shared`)

- Types and constants used by both frontend and backend
- Ensures type consistency across the application

### Supabase (`/supabase`)

- Database migrations
- Edge Functions for serverless operations
- Configuration files

---

## File Naming Conventions

### Frontend

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: camelCase with `.types.ts` suffix (`user.types.ts`)

### Backend

- **Files**: kebab-case (`auth.controller.ts`)
- **Classes**: PascalCase (`AuthController`)
- **Functions**: camelCase (`authenticateUser`)

### Database

- **Tables**: snake_case (`user_profiles`)
- **Columns**: snake_case (`created_at`)
- **Migrations**: Timestamp + description (`20241106000000_create_users.sql`)

---

## Import Organization

### Frontend Example

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 3. Hooks
import { useAuth } from '@/hooks/useAuth';

// 4. Utils
import { formatDate } from '@/lib/utils/format';

// 5. Types
import type { User } from '@/types/user';

// 6. Constants
import { ROUTES } from '@/lib/constants';
```

### Backend Example

```typescript
// 1. External libraries
import { Router, Request, Response } from 'express';
import { z } from 'zod';

// 2. Internal modules
import { RequestService } from '../services/request.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

// 3. Types
import type { CreateRequestDto } from '../types/request.types';

// 4. Utils
import { logger } from '../utils/logger';
```

---

## Environment Files

### Frontend `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend `.env`

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
```

---

## Build Output Directories

### Frontend

- **`.next/`**: Next.js build output (gitignored)
- **`out/`**: Static export output (if using static export)

### Backend

- **`dist/`**: TypeScript compiled output (gitignored)
- **`node_modules/`**: Dependencies (gitignored)

---

## Test Directories

### Frontend Tests

- **`__tests__/`**: Jest test files
- **`*.test.tsx`**: Component tests
- **`*.spec.tsx`**: Alternative test naming

### Backend Tests

- **`tests/unit/`**: Unit tests
- **`tests/integration/`**: Integration tests
- **`tests/fixtures/`**: Test data fixtures

