# Story 7.1 Completion Report – Investor Dashboard Overview

**Status:** ✅ Completed  
**Epic:** [Epic 7 – التقارير ولوحات المتابعة](../prd/epic-7.md)  
**Related PRD Section:** Story 7.1 – لوحة متابعة المستثمر  
**Date:** 2025-11-10

---

## Summary
We delivered the investor-facing dashboard that surfaces request KPIs, pending actions, unread notification counts, and the latest activity in a single view. The dashboard pulls aggregated data directly from Supabase, honours RBAC, and updates automatically whenever the investor revisits the page.

---

## Technical Deliverables

- **Backend**
  - `backend/src/services/investor-dashboard.service.ts`
    - Aggregates request status counts, recent submissions, pending info items, and unread notifications for a given investor.
    - Normalises Supabase responses and enforces consistent typing for `RequestStatus`.
  - `backend/src/controllers/investor-dashboard.controller.ts`
    - New `GET /investor/dashboard` handler with authentication and error handling.
  - `backend/src/routes/investor.routes.ts`
    - Registered the dashboard endpoint (shares RBAC with request listing).
  - Tests:
    - `backend/tests/investor-dashboard.service.test.ts`
    - `backend/tests/investor-dashboard.controller.test.ts`

- **Frontend**
  - Types: `frontend/src/types/dashboard.ts`
  - Hook: `frontend/src/hooks/useInvestorDashboard.ts` (React Query, 30s stale window).
  - Localisation: `frontend/src/locales/dashboard.ts` (Arabic & English copy).
  - UI:
    - `frontend/src/pages/InvestorDashboardPage.tsx`
      - Summary grid, pending actions, recent activity, and metric header.
      - Skeleton UI, RTL support, and toast-driven error state.
  - Navigation: `frontend/src/App.tsx` now routes `/dashboard` as the default landing page, and exposes `/requests` for quick access.

- **Documentation**
  - `docs/front-end-spec.md` – added the dashboard UX/data notes.
  - `README.md` – documented the new endpoint and story reference.

---

## API Contract

- `GET /api/v1/investor/dashboard`
  - Permissions: `investor.requests.read` (admins with `admin.requests.review` can also hit it when acting on behalf).
  - Response fields:
    - `requestSummary.total`
    - `requestSummary.byStatus` keyed by request lifecycle status.
    - `recentRequests[]` (id, requestNumber, status, amount, currency, createdAt).
    - `pendingActions.pendingInfoCount` + `items[]` (id, requestNumber, updatedAt).
    - `unreadNotifications`
    - `generatedAt`

---

## Verification

- `npm run lint` – ✅
- `npm run test -- --runTestsByPath backend/tests/investor-dashboard.service.test.ts backend/tests/investor-dashboard.controller.test.ts backend/tests/request-timeline.service.test.ts` – ✅

Manual QA checklist:
- Dashboard loads with summary counts for seeded data.
- Pending info card links to `/requests` and displays human-readable timestamps.
- Unread notification counter matches Notification Center badge.
- Error toast and retry banner appear when service is forced to throw.

---

## Follow-Up / TODO

- Wire Supabase Realtime subscriptions to auto-refresh summary cards when new notifications or request status changes occur.
- Extend pending actions to include other workflow blockers (e.g., unsigned agreements).

