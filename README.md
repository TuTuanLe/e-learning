# Chinese Dictation Notion

Standalone Chinese dictation app using:

- Next.js and Tailwind CSS
- Next.js Route Handlers and Prisma
- Existing Supabase Auth and PostgreSQL
- `DESIGN.md` generated from the `notion` preset

## Development

```bash
pnpm install
pnpm prisma:generate
pnpm dev
```

Web and API run together at `http://localhost:3000`.

## Supabase Auth

Set the browser Auth variables in `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

To enable Google sign-in:

1. Create a Google OAuth Web client and add the Supabase callback URL shown in
   **Supabase Dashboard → Authentication → Providers → Google** as an authorized
   redirect URI.
2. Enable Google in that Supabase provider page and enter the Google client ID
   and client secret.
3. Add `http://localhost:3000/auth/callback` and the production equivalent to
   **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**.

## Subscription Billing

Hanzi Flow uses SePay Payment Gateway for one-time package checkout. New users
receive a 14-day trial. Current packages are:

- 1 month: 49.000d
- 6 months: 249.000d
- Lifetime: 599.000d

For local development without SePay credentials, enable mock billing:

```bash
BILLING_MODE=mock
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Choosing a plan will immediately create or update an active local subscription.
Mock billing is disabled automatically when `NODE_ENV=production`.

For SePay sandbox/production billing, remove `BILLING_MODE=mock` and configure:

```bash
SEPAY_ENV=sandbox
SEPAY_MERCHANT_ID=SP-...
SEPAY_SECRET_KEY=spsk_...
ADMIN_EMAILS=admin@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Admins can review and activate SePay orders at `/admin/orders`.

## AI Study Planner

The personalized planner is available to active 6-month and lifetime subscribers.
It uses Groq's OpenAI-compatible Chat Completions API and stores each generated
plan in PostgreSQL.

```bash
GROQ_API_KEY=gsk_...
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

Never expose `GROQ_API_KEY` through a `NEXT_PUBLIC_` variable.

## Optional Redis Cache

Static catalog responses can be cached with Redis. On Vercel, install Upstash
Redis from the Marketplace and link it to the project; Vercel will inject the
Upstash REST environment variables. Local development falls back to in-memory
cache when Redis variables are omitted.

```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

If you use another Redis provider, `REDIS_URL=redis://...` is also supported.

## Database

Apply production migrations after configuring `DATABASE_URL` and `DIRECT_URL`:

```bash
pnpm prisma:deploy
```
