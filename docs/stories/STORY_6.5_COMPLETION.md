# Story 6.5 Completion Report – In-App Notifications Center

**Status:** ✅ Completed  
**Epic:** [Epic 6 – الإشعارات والتواصل](../prd/epic-6.md)  
**Related PRD Section:** Story 6.5 – مركز الإشعارات داخل المنصة مع Supabase Realtime  
**Date:** 2025-11-09

---

## Summary
Investors can now review their notification history inside the portal, receive real-time updates via Supabase Realtime, and manage unread items with one-click bulk actions. The implementation reuses the existing `notifications` table and enriches the experience with localization, pagination, and toast feedback.

---

## Technical Deliverables

- **Backend**
  - `backend/src/services/notification.service.ts`
    - Added `listUserNotifications`, `markNotificationRead`, `markAllNotificationsRead`, and `getUnreadNotificationCount`.
  - `backend/src/controllers/notification.controller.ts`
    - Exposed REST endpoints for listing and updating investor notifications.
  - `backend/src/routes/notification.routes.ts`
    - Mounted new routes under `/api/v1/notifications` with RBAC enforcement (`investor.notifications.read`).
  - `backend/src/schemas/notification.schema.ts`
    - Introduced Zod schema for pagination (`notificationListQuerySchema`).
- **Frontend**
  - Localization: `frontend/src/locales/notifications.ts`.
  - Types & Hooks:
    - `frontend/src/types/notification.ts`
    - `frontend/src/hooks/useNotifications.ts` (React Query + Supabase Realtime).
    - Utilities: `frontend/src/utils/auth-token.ts`, `frontend/src/utils/supabase-client.ts`.
  - UI Components:
    - `NotificationBadge`, `NotificationListItem`, `NotificationEmptyState`, `NotificationSkeleton`.
  - Page & entrypoint:
    - `frontend/src/pages/NotificationsPage.tsx`
    - `frontend/src/app/notifications/main.tsx`
- **Tests**
  - `backend/tests/notification.service.test.ts`
  - `backend/tests/notification.controller.test.ts`

---

## API Contract

- `GET /api/v1/notifications?page=1&status=unread`
- `PATCH /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/mark-all-read`

All endpoints require authentication and the `investor.notifications.read` permission.

---

## Environment Variables

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` – required by the frontend to open Supabase Realtime channels.

---

## Verification

- `npm run lint` – ✅
- `npm run typecheck` – ✅
- `npm run test -- --runTestsByPath backend/tests/notification.service.test.ts backend/tests/notification.controller.test.ts backend/tests/email.templates.test.ts` – ✅

Manual smoke tests confirm unread badges update after realtime events and bulk mark-all.

---

## Follow-Up / TODO

- Story 6.6 will surface notification preferences allowing investors to mute individual channels/types.
- Consider a shared `NotificationTimeline` component for Story 6.7 (request-specific history).

