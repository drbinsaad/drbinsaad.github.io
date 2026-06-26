-- ENT Exam Hub — schema, seed, and row-level security.
-- The four tables hold one OSCE exam: config, examiner passcodes, residents,
-- and the 6x6 grid of grades. RLS is enabled with NO policies, so the public
-- anon key is fully denied; only the exam-hub Edge Function (service_role,
-- which bypasses RLS) reads/writes. Passcodes are validated in the function.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Singleton config row (id is always 1).
create table if not exists public.exam_setup (
  id         smallint primary key default 1,
  exam_title text    not null default 'ENT Exam',
  score_max  numeric not null default 100 check (score_max >= 1),
  admin_code text    not null default '9999',
  constraint exam_setup_singleton check (id = 1)
);

-- Fixed set of examiner stations, each with a number-only passcode.
create table if not exists public.exam_examiners (
  station  text primary key,
  passcode text not null default ''
);

-- Residents identified by a stable id (R1..R6) so renames keep their grades.
create table if not exists public.exam_residents (
  resident_id text primary key,
  name        text not null default ''
);

-- One row per (station, resident) cell -> atomic upsert, no duplicates.
create table if not exists public.exam_grades (
  station     text not null,
  resident_id text not null,
  score       numeric not null,
  notes       text not null default '',
  updated_at  timestamptz not null default now(),
  examiner    text,
  primary key (station, resident_id)
);

-- ---------------------------------------------------------------------------
-- Seed (mirrors the old Apps Script initSheet defaults)
-- ---------------------------------------------------------------------------
insert into public.exam_setup (id, exam_title, score_max, admin_code)
values (1, 'AFHSR ENT OSCE', 100, '9999')
on conflict (id) do nothing;

insert into public.exam_examiners (station, passcode) values
  ('Otology',     '1001'),
  ('Rhinology',   '1002'),
  ('General',     '1003'),
  ('General 2',   '1004'),
  ('Pediatric',   '1005'),
  ('Head & Neck', '1006')
on conflict (station) do nothing;

insert into public.exam_residents (resident_id, name) values
  ('R1', ''), ('R2', ''), ('R3', ''), ('R4', ''), ('R5', ''), ('R6', '')
on conflict (resident_id) do nothing;

-- ---------------------------------------------------------------------------
-- Lock everything down: RLS on, no policies => anon/authenticated denied.
-- The Edge Function uses the service_role key, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.exam_setup     enable row level security;
alter table public.exam_examiners enable row level security;
alter table public.exam_residents enable row level security;
alter table public.exam_grades    enable row level security;
