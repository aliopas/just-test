# Story 6.3 Completion Report – Email Dispatch via Supabase Edge Functions

**Status:** ✅ Completed  
**Epic:** [Epic 6 – الإشعارات والتواصل](../prd/epic-6.md)  
**Related PRD Section:** Story 6.3 – إرسال إشعارات Email مع Supabase  
**Date:** 2025-11-09

---

## Summary
Implemented the asynchronous email delivery pipeline that powers notification events. Investor-facing emails now render localized templates, queue for delivery in Supabase, and are dispatched via a dedicated Edge Function that integrates with Resend. The system records job status, retries transient failures, and logs each notification in the core `notifications` table for later UI consumption.

---

## Technical Deliverables

- **Database migration:** `supabase/migrations/20241109110000_notification_jobs.sql`
  - Added `notification_job_status` enum and `notification_jobs` queue table with retry metadata.
  - Indexed by `(status, scheduled_at)` for future worker batching.
  - Reused `set_updated_at_timestamp` trigger and enforced RLS (service role only).
- **Email queue service:** `backend/src/services/email-dispatch.service.ts`
  - Renders templates, stores job payloads, and invokes the `notification-dispatch` Edge Function.
  - Persists last error details if invocation fails.
- **Investor notification logic:** `backend/src/services/notification.service.ts`
  - Resolves recipient name/language using Supabase Auth and `investor_profiles`.
  - Logs entries in `notifications` for timeline usage.
  - Enqueues emails for submission, decision, info-request, and settlement events.
- **Supabase Edge Function:** `supabase/functions/notification-dispatch/index.ts`
  - Updates job status to `processing`, sends email via Resend, and marks completion.
  - Applies exponential backoff and caps retries; records last error messages.
  - Requires `RESEND_API_KEY` and `NOTIFICATIONS_FROM_EMAIL`.
- **Unit tests**
  - `backend/tests/email-dispatch.service.test.ts` – verifies queue/dispatch behavior and error handling.
  - `backend/tests/notification.service.email.test.ts` – ensures investor notification hooks enqueue localized templates.

---

## Runtime & Configuration

- New environment variables:
  - `INVESTOR_PORTAL_URL` – Base URL used in CTA links (default `https://app.bakurah.com`).
  - `SUPPORT_EMAIL` – Default support address injected into templates (default `support@bakurah.com`).
  - `RESEND_API_KEY` – API key for sending transactional emails in the Edge Function.
  - `NOTIFICATIONS_FROM_EMAIL` – Verified sender address for Resend (e.g., `Bakurah <notifications@bakurah.com>`).
- Supabase CLI: deploy `notification-dispatch` function (`supabase functions deploy notification-dispatch`).

---

## Verification

- `npm run lint` – ✅
- `npm run typecheck` – ✅
- `npm run test -- --runTestsByPath backend/tests/email-dispatch.service.test.ts backend/tests/notification.service.email.test.ts backend/tests/email.templates.test.ts` – ✅
- Manual queue smoke test via local invocation of the Edge Function (supabase CLI) – ✅

---

## Follow-Up / TODO

- Story 6.4 will expand the pipeline to SMS by wiring a second channel against the same queue.
- Story 6.5+ will consume `notifications` entries for in-app realtime updates.
- Consider adding a periodic edge scheduler to re-dispatch failed jobs when `scheduled_at` is in the past.

