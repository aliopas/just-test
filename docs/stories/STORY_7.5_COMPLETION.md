# Story 7.5 Completion Report – Content Analytics

**Status:** ✅ Completed  
**Epic:** [Epic 7 – التقارير ولوحات المتابعة](../prd/epic-7.md)  
**Related PRD Section:** Story 7.5 – تحليلات المحتوى  
**Date:** 2025-11-10

---

## Summary
Operations admins can now review engagement analytics for published news: impressions (feed exposures), detail views, and click-through rate trends over the last 30 days. The admin dashboard surfaces key totals, top-performing stories, and a daily trend sparkline.

---

## Technical Deliverables

- **Database / Supabase**
  - `supabase/migrations/20241110094500_content_analytics.sql`
    - Adds `news_content_event_type` enum and `news_content_events` table with supporting indexes.

- **Backend**
  - `backend/src/services/content-analytics.service.ts`
    - Records impressions/views and aggregates analytics over configurable ranges.
  - `backend/src/schemas/content-analytics.schema.ts`
    - Validates query parameters for analytics requests.
  - `backend/src/controllers/admin-content-analytics.controller.ts`
    - Exposes the analytics endpoint with validation and error handling.
  - `backend/src/routes/admin.routes.ts`
    - Registers `GET /admin/analytics/content` behind `admin.content.manage`.
  - `backend/src/controllers/public-news.controller.ts`
    - Instruments news list/detail endpoints to log impressions and views.
  - Tests: `backend/tests/content-analytics.service.test.ts`, `backend/tests/admin-content-analytics.controller.test.ts`.

- **Frontend**
  - `frontend/src/hooks/useAdminContentAnalytics.ts`
  - `frontend/src/types/admin-content-analytics.ts`
  - `frontend/src/locales/adminContentAnalytics.ts`
  - `frontend/src/pages/AdminDashboardPage.tsx`
    - Adds content engagement section with metrics cards, top news list, and trend sparkline.

- **Documentation**
  - `README.md` (new analytics endpoint reference).
  - `docs/front-end-spec.md` (Admin dashboard analytics update).
  - This completion report.

---

## API Contract

- `GET /api/v1/admin/analytics/content`
  - Query parameters:
    - `days` (optional, default 30, max 180)
    - `limitTop` (optional, default 5, max 20)
  - Response:
    ```json
    {
      "summary": {
        "totalImpressions": 1280,
        "totalViews": 412,
        "overallCtr": 0.321,
        "topNews": [
          {
            "newsId": "uuid",
            "title": "Market update",
            "slug": "market-update",
            "publishedAt": "2025-11-01T08:00:00.000Z",
            "impressions": 420,
            "views": 180,
            "ctr": 0.428
          }
        ]
      },
      "trend": [
        {
          "day": "2025-11-09T00:00:00.000Z",
          "impressions": 62,
          "views": 28,
          "ctr": 0.451
        }
      ],
      "news": [
        {
          "newsId": "uuid",
          "title": "Market update",
          "slug": "market-update",
          "publishedAt": "2025-11-01T08:00:00.000Z",
          "impressions": 420,
          "views": 180,
          "ctr": 0.428
        }
      ],
      "generatedAt": "2025-11-10T09:32:00.000Z",
      "range": {
        "from": "2025-10-12T00:00:00.000Z",
        "to": "2025-11-10T09:32:00.000Z",
        "days": 30
      }
    }
    ```
  - Permissions: `admin.content.manage`.

---

## Verification

- `npm run lint` – ✅  
- `npm run test -- --runTestsByPath backend/tests/content-analytics.service.test.ts backend/tests/admin-content-analytics.controller.test.ts` – ✅  
- `npm run build` – ✅

Manual checks:
- Impressions logged when the investor news feed loads; views recorded on article detail fetch.
- Admin dashboard displays metrics, top stories, and trend after analytics data loads.
- Error states trigger toast notifications and retry affordance without breaking layout.

---

## Follow-Up / TODO

- Consider batching analytics inserts or moving to a nightly aggregate table if event volume grows.
- Allow admins to select custom date ranges or export engagement metrics as CSV.
- Explore separate tracking for notification-driven clicks versus in-app reads.


