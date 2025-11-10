# Story 6.7 Completion Report – Request Communication Timeline

**Status:** ✅ Completed  
**Epic:** [Epic 6 – الإشعارات والتواصل](../prd/epic-6.md)  
**Related PRD Section:** Story 6.7 – سجل المراسلات  
**Date:** 2025-11-10

---

## Summary
Investors and admins can now review a unified communication history for each investment request. The timeline combines notification deliveries, status transitions, and internal notes into a chronological feed that respects RBAC visibility rules and localisation.

---

## Technical Deliverables

- **Backend**
  - `backend/src/services/request-timeline.service.ts`
    - Aggregates notifications, request events, and admin comments.
    - Provides `getInvestorRequestTimeline` (ownership enforced) and `getAdminRequestTimeline`.
  - `backend/src/controllers/request.controller.ts`
    - New `timeline` handler (`GET /investor/requests/:id/timeline`).
  - `backend/src/controllers/admin-request.controller.ts`
    - New `getRequestTimeline` handler (`GET /admin/requests/:id/timeline`).
  - `backend/src/routes/investor.routes.ts`, `backend/src/routes/admin.routes.ts`
    - Wired new endpoints with existing auth/RBAC middleware.
  - Tests: `backend/tests/request-timeline.service.test.ts`, controller suites updated for new routes.

- **Frontend**
  - Types: `frontend/src/types/request.ts` extended with timeline models.
  - Data layer: `frontend/src/hooks/useRequestTimeline.ts`.
  - UI: 
    - `frontend/src/components/request/RequestTimeline.tsx` renders localized timeline cards.
    - `frontend/src/components/request/RequestDetailsDrawer.tsx` integrates investor timeline with skeleton/error states.
    - `frontend/src/pages/AdminRequestDetailPage.tsx` surfaces full admin timeline with retry handling.
  - Localization updates captured via existing dictionaries.

- **Docs**
  - `docs/front-end-spec.md` updated with new hooks and UX behaviour.
  - `README.md` lists the new endpoints and completion record linked here.

---

## API Contract

- `GET /api/v1/investor/requests/:id/timeline`
  - Permissions: `investor.requests.read` (or `admin.requests.review` when masquerading).
- `GET /api/v1/admin/requests/:id/timeline`
  - Permissions: `admin.requests.review`.

Both responses share the shape:

```json
{
  "requestId": "uuid",
  "requestNumber": "INV-00123",
  "items": [
    {
      "id": "notification:uuid",
      "entryType": "notification",
      "createdAt": "2025-11-10T10:15:00.000Z",
      "visibility": "investor",
      "actor": null,
      "notification": {
        "type": "request_submitted",
        "channel": "email",
        "payload": { "requestNumber": "INV-00123" },
        "readAt": null,
        "userId": "uuid"
      }
    }
  ]
}
```

---

## Verification

- `npm run lint` – ✅
- `npm run typecheck` – ✅
- `npm run test -- --runTestsByPath backend/tests/request-timeline.service.test.ts backend/tests/request.controller.test.ts backend/tests/admin-request.controller.test.ts` – ✅

Manual QA confirmed:
- Investor drawer displays a combined timeline with channels and request messages.
- Admin detail view includes internal comments and admin-only email notices.
- RBAC prevents non-owners from fetching investor timelines.

---

## Follow-Up / TODO

- Consider live-updating the timeline via Supabase Realtime to reflect new notifications instantly.
- Extend dataset with audit-log entries once available to display additional compliance actions.

