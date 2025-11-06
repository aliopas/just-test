# Deployment Architecture

### Development Environment

- **Local:** Docker Compose
- **Database:** Supabase Local Development
- **Frontend:** Next.js Dev Server
- **Backend:** Express Dev Server

### Staging Environment

- **Frontend:** Vercel Preview Deployments
- **Backend:** Railway Staging
- **Database:** Supabase Staging Project
- **Storage:** Supabase Storage

### Production Environment

- **Frontend:** Vercel Production
- **Backend:** Railway Production
- **Database:** Supabase Production
- **CDN/WAF:** Cloudflare
- **Monitoring:** Supabase Dashboard + Sentry

