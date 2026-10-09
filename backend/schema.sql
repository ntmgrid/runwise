-- Run once in the Supabase SQL editor.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null,                 -- E.164, e.g. +919876543210
  consent boolean not null default true,
  consent_version text not null,       -- which wording of the Terms/Privacy they agreed to
  consent_at timestamptz not null default now(),
  source text,
  ip_hash text,                        -- salted SHA-256, never the raw IP
  user_agent text,
  wa_status text not null default 'pending',   -- pending | sent | failed | skipped
  wa_message_id text,
  created_at timestamptz not null default now()
);
create unique index if not exists leads_phone_idx on public.leads (phone);

create table if not exists public.lead_attempts (
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists lead_attempts_idx on public.lead_attempts (ip_hash, created_at);

-- Lock both tables down: no public access. Only the Edge Function (service role) can read or write.
alter table public.leads enable row level security;
alter table public.lead_attempts enable row level security;
