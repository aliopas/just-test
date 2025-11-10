# Story 6.6 Completion Report – Notification Preferences

**Status:** ✅ Completed  
**Epic:** [Epic 6 – الإشعارات والتواصل](../prd/epic-6.md)  
**Related PRD Section:** Story 6.6 – تفضيلات الإشعارات  
**Date:** 2025-11-09

---

## Summary
Investors can now customize how they receive lifecycle alerts. The API exposes read/update endpoints for per-type channel preferences, and the frontend surfaces a localized UI with optimistic feedback and Supabase-backed persistence.

---

## Technical Deliverables

- **Backend**
  - `backend/src/schemas/notification.schema.ts` – Added schema for preference lists.
  - `backend/src/services/notification.service.ts`
    - Added helpers to read defaults, sanitize payloads, and persist preferences.
  - `backend/src/controllers/notification.controller.ts`
    - New `preferences` and `updatePreferences` handlers.
  - `backend/src/routes/notification.routes.ts`
    - Routes: `GET /notifications/preferences`, `PATCH /notifications/preferences`.
  - Tests: `backend/tests/notification.service.test.ts`, `backend/tests/notification.controller.test.ts`.
- **Frontend**
  - Types/Locales: `types/notification.ts`, `locales/notifications.ts`.
  - Hooks: `useNotificationPreferences.ts`.
  - UI integration: `NotificationsPage.tsx` with grouped toggles, dirty state, and toasts.

---

## API Contract

- `GET /api/v1/notifications/preferences`
- `PATCH /api/v1/notifications/preferences`
  - Body: `[{ "type": "request_submitted", "channel": "email", "enabled": true }, ...]`

Requires `investor.notifications.read` (GET) and `investor.notifications.update` (PATCH).

---

## Verification

- `npm run lint` – ✅
- `npm run typecheck` – ✅
- `npm run test -- --runTestsByPath backend/tests/notification.service.test.ts backend/tests/notification.controller.test.ts` – ✅

Manual QA confirmed that toggling preferences updates Supabase and the unread feed remains intact.

---

## Follow-Up / TODO

- Story 6.7 will extend the same dataset for request timelines.
- Consider exposing admin-specific preferences for operations users in a future iteration.

