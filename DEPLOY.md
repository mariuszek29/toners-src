# TAO NERDS — Deployment Guide

## Prerequisites
- Node 20+
- Supabase project (free tier works)
- Netlify account
- Anthropic API key (for AMA automation)
- Taostats API key (for market data)

## 1. Supabase Setup

1. Go to your Supabase project → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql` in full
3. Enable Email auth under Authentication → Providers
4. Copy your Project URL and anon key

## 2. Environment Variables

Create `.env.local` from `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
TAOSTATS_API_KEY=your-key
NEXT_PUBLIC_SITE_URL=https://taonerds.com
CRON_SECRET=generate-a-random-secret
```

In Netlify: Site settings → Environment variables → add all of the above.

## 3. Local Development

```bash
npm install
npm run dev
```

## 4. Deploy to Netlify

```bash
# Option A: Netlify CLI
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod

# Option B: GitHub
# Push repo to GitHub → Netlify → Import project → auto-detects Next.js
```

## 5. Market Data Cron

The cron at `/api/cron/market-data` is scheduled every 15 minutes via `netlify.toml`.
Set `CRON_SECRET` in Netlify env vars. The cron passes it as `Authorization: Bearer <CRON_SECRET>`.

## 6. Admin Panel

The AMA pipeline is at `/admin/ama-pipeline`. Currently no auth gate — add Supabase Auth or Netlify Password Protection in production.

## 7. Adding Your First Subnet

In Supabase SQL Editor:

```sql
INSERT INTO founders (name, handle, bio)
VALUES ('Founder Name', '@handle', 'Bio here');

INSERT INTO subnets (subnet_number, name, slug, category, founder_id, thesis, nerds_score)
VALUES (19, 'Inference', 'sn19-inference', 'AI Inference',
  (SELECT id FROM founders WHERE handle = '@handle'),
  'Your thesis here', 75);
```

## File Structure

```
taonerds/
├── app/
│   ├── page.tsx              # Homepage — subnet index
│   ├── signal/               # Daily TAO signals
│   ├── amas/                 # AMA archive
│   ├── vote/                 # Community voting
│   ├── founders/             # Founder profiles
│   ├── admin/ama-pipeline/   # AMA → content automation
│   └── api/
│       ├── amas/generate/    # Claude AI draft generation
│       ├── amas/approve/     # Publish approved content
│       ├── cron/market-data/ # Taostats data refresh
│       └── watchlist/        # User watchlist management
├── components/
│   ├── layout/               # Navbar, Footer
│   ├── subnet/               # Index table, stats bar
│   ├── ama/                  # AMA cards, archive
│   ├── signal/               # Signal feed
│   └── voting/               # Vote board
├── lib/supabase.ts           # Supabase client setup
├── types/database.ts         # Full TypeScript types
├── supabase/migrations/      # SQL schema
└── netlify.toml              # Deployment + cron config
```
