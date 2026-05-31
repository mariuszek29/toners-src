-- ============================================================
-- TAO NERDS — Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- FOUNDERS
-- ============================================================
create table if not exists founders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  handle text, -- X/Twitter handle
  avatar_url text,
  bio text,
  past_experience text,
  public_links jsonb default '[]'::jsonb, -- [{label, url}]
  credibility_signals text,
  open_concerns text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBNETS
-- ============================================================
create table if not exists subnets (
  id uuid primary key default uuid_generate_v4(),
  subnet_number integer unique not null,
  name text not null,
  slug text unique not null, -- url-safe, e.g. "sn19-inference"
  category text, -- e.g. "AI Inference", "Data", "Storage"
  founder_id uuid references founders(id),
  team_notes text,

  -- Thesis & intelligence
  thesis text,
  latest_update text,
  recent_catalysts text,
  risks text,
  nerds_score integer check (nerds_score between 0 and 100),
  last_reviewed_at timestamptz,

  -- Market data (refreshed by cron)
  market_cap_usd numeric,
  alpha_price_usd numeric,
  apy_percent numeric,
  emissions_daily numeric,
  market_data_updated_at timestamptz,

  -- Meta
  github_url text,
  website_url text,
  status text default 'active' check (status in ('active', 'inactive', 'watchlist')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- AMAS
-- ============================================================
create table if not exists amas (
  id uuid primary key default uuid_generate_v4(),
  subnet_id uuid references subnets(id),
  founder_id uuid references founders(id),
  title text not null,
  ama_date date,

  -- Raw input
  transcript text,
  raw_notes text,

  -- AI-generated drafts (pending approval)
  draft_x_post text,
  draft_recap text,
  draft_founder_update text,
  draft_thesis_update text,
  draft_risks text,
  draft_quote_highlights jsonb default '[]'::jsonb, -- [{quote, context}]
  draft_what_changed text,

  -- Published versions (approved by Mariusz)
  published_x_post text,
  published_recap text,
  published_quote_highlights jsonb default '[]'::jsonb,
  published_what_changed text,

  -- Status
  draft_status text default 'pending' check (draft_status in ('pending', 'drafted', 'approved', 'published')),
  published_at timestamptz,

  -- Meta
  cover_image_url text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SIGNALS (Daily TAO Signal page)
-- ============================================================
create table if not exists signals (
  id uuid primary key default uuid_generate_v4(),
  signal_date date not null default current_date,
  title text not null,
  body text not null,
  signal_type text not null check (signal_type in (
    'launch', 'price_move', 'apy_spike', 'founder_update',
    'github_update', 'ama_announcement', 'gaining_momentum',
    'losing_momentum', 'watchlist_change', 'general'
  )),
  subnet_id uuid references subnets(id),
  severity text default 'normal' check (severity in ('low', 'normal', 'high')),
  source_url text,

  -- AI draft or manually written
  is_ai_draft boolean default false,
  approved_by text,
  approved_at timestamptz,
  status text default 'draft' check (status in ('draft', 'published')),

  created_at timestamptz default now()
);

-- ============================================================
-- COMMUNITY VOTES
-- ============================================================
create table if not exists votes (
  id uuid primary key default uuid_generate_v4(),
  subnet_id uuid references subnets(id) not null,
  user_id uuid not null, -- Supabase auth user id
  sentiment text not null check (sentiment in ('bullish', 'neutral', 'bearish')),
  confidence integer not null check (confidence between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (subnet_id, user_id) -- one vote per user per subnet
);

-- Vote history snapshots (for trend charts)
create table if not exists vote_snapshots (
  id uuid primary key default uuid_generate_v4(),
  subnet_id uuid references subnets(id) not null,
  snapshot_date date not null default current_date,
  bullish_count integer default 0,
  neutral_count integer default 0,
  bearish_count integer default 0,
  avg_confidence numeric,
  community_score integer, -- derived 0-100
  unique (subnet_id, snapshot_date)
);

-- ============================================================
-- WATCHLISTS
-- ============================================================
create table if not exists watchlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  subnet_id uuid references subnets(id) not null,
  created_at timestamptz default now(),
  unique (user_id, subnet_id)
);

-- ============================================================
-- ALERTS
-- ============================================================
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  subnet_id uuid references subnets(id) not null,
  alert_type text not null check (alert_type in (
    'new_ama', 'score_change', 'founder_update', 'apy_change',
    'market_cap_change', 'new_catalyst', 'risk_flag', 'new_article'
  )),
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- FOUNDER AMA APPEARANCES (many-to-many)
-- ============================================================
create table if not exists founder_ama_appearances (
  founder_id uuid references founders(id),
  ama_id uuid references amas(id),
  primary key (founder_id, ama_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists subnets_subnet_number_idx on subnets(subnet_number);
create index if not exists subnets_category_idx on subnets(category);
create index if not exists amas_subnet_id_idx on amas(subnet_id);
create index if not exists amas_draft_status_idx on amas(draft_status);
create index if not exists signals_signal_date_idx on signals(signal_date desc);
create index if not exists votes_subnet_id_idx on votes(subnet_id);
create index if not exists watchlists_user_id_idx on watchlists(user_id);
create index if not exists alerts_user_id_idx on alerts(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Subnets & founders & amas & signals: public read
alter table subnets enable row level security;
create policy "subnets_public_read" on subnets for select using (true);
create policy "subnets_admin_write" on subnets for all using (auth.role() = 'service_role');

alter table founders enable row level security;
create policy "founders_public_read" on founders for select using (true);
create policy "founders_admin_write" on founders for all using (auth.role() = 'service_role');

alter table amas enable row level security;
create policy "amas_public_read" on amas for select using (draft_status = 'published');
create policy "amas_admin_all" on amas for all using (auth.role() = 'service_role');

alter table signals enable row level security;
create policy "signals_public_read" on signals for select using (status = 'published');
create policy "signals_admin_all" on signals for all using (auth.role() = 'service_role');

-- Votes: authenticated users can vote
alter table votes enable row level security;
create policy "votes_public_read" on votes for select using (true);
create policy "votes_user_insert" on votes for insert with check (auth.uid() = user_id);
create policy "votes_user_update" on votes for update using (auth.uid() = user_id);

alter table vote_snapshots enable row level security;
create policy "vote_snapshots_public_read" on vote_snapshots for select using (true);
create policy "vote_snapshots_admin_write" on vote_snapshots for all using (auth.role() = 'service_role');

-- Watchlists: users own their own
alter table watchlists enable row level security;
create policy "watchlists_user_own" on watchlists for all using (auth.uid() = user_id);

-- Alerts: users see their own
alter table alerts enable row level security;
create policy "alerts_user_own" on alerts for all using (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subnets_updated_at before update on subnets
  for each row execute function update_updated_at();
create trigger founders_updated_at before update on founders
  for each row execute function update_updated_at();
create trigger amas_updated_at before update on amas
  for each row execute function update_updated_at();
create trigger votes_updated_at before update on votes
  for each row execute function update_updated_at();
