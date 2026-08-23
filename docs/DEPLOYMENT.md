# Deployment

## Vercel

1. Import this repository into Vercel with the Next.js preset.
2. Configure `DATABASE_URL`, `AUTH_SECRET`, `CLOUDINARY_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, and `UPLOAD_MAX_MB=5`. `RESEND_TEST_RECIPIENT` is optional and only for controlled account-owner testing.
3. Run `npx prisma migrate deploy`, then `npm run db:seed` once.
4. The Vercel Hobby cron calls `/api/jobs/deliver-notifications` daily. It is protected by `CRON_SECRET`; notification delivery can also be triggered by the application after domain writes, while the cron serves as a retry sweep.

## Smoke test

Sign in as both roles, submit a complaint and photo, change its status, create an important notice, scan an asset QR URL, and verify the received notification emails. No custom domain is needed for the submission: Resend's onboarding sender supports controlled account-owner testing.
