-- Consultant Logbook — surgical / clinic / ward case log with research-cohort
-- and follow-up tracking. Single-owner store: every row is readable and
-- writable ONLY by the owner's authenticated Google account. The publishable
-- (anon) key alone can read nothing — Row Level Security is the real boundary.
--
-- Privacy: store DE-IDENTIFIED references only (MRN or initials). There is no
-- patient-name column by design. Keep it that way.
--
-- Re-runnable: safe to apply more than once.

create extension if not exists "pgcrypto";

create table if not exists public.logbook (
  id            uuid primary key default gen_random_uuid(),
  owner_email   text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Encounter
  case_date     date not null default current_date,
  setting       text not null default 'OR',        -- OR | Clinic | Ward | ER
  mrn           text,                               -- de-identified ref (MRN / initials)
  age           integer,
  age_unit      text default 'years',              -- years | months
  sex           text,                               -- M | F | ''
  side          text,                               -- Right | Left | Bilateral | N/A

  -- Clinical
  diagnosis     text,
  procedure     text,
  surgeon_role  text,                               -- Primary | Assistant | Supervised | Observed
  asa           text,                               -- ASA I–V / E
  findings      text,
  outcome       text,                               -- Routine | Complication | Day-case | Admitted
  complication  text,

  -- Research cohort
  research_study text,                              -- study name, blank if none
  enrolled       boolean not null default false,
  consent        boolean not null default false,

  -- Follow-up
  followup_date  date,
  followup_done  boolean not null default false,
  status         text not null default 'active',   -- active | completed | lost

  notes          text
);

-- Keep updated_at fresh on every write.
create or replace function public.logbook_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_logbook_touch on public.logbook;
create trigger trg_logbook_touch
  before update on public.logbook
  for each row execute function public.logbook_touch_updated_at();

-- Helpful indexes for the follow-up board and research views.
create index if not exists idx_logbook_owner       on public.logbook (owner_email);
create index if not exists idx_logbook_case_date   on public.logbook (case_date desc);
create index if not exists idx_logbook_followup    on public.logbook (followup_date) where followup_done = false;
create index if not exists idx_logbook_study       on public.logbook (research_study) where enrolled = true;

-- ===================== Row Level Security (the real gate) =====================
alter table public.logbook enable row level security;

-- One policy per command, each restricted to the owner's email from the JWT.
-- Change the email below if the owner account ever changes.
drop policy if exists logbook_owner_select on public.logbook;
create policy logbook_owner_select on public.logbook
  for select using (lower(auth.jwt() ->> 'email') = 'drbinsaad@gmail.com');

drop policy if exists logbook_owner_insert on public.logbook;
create policy logbook_owner_insert on public.logbook
  for insert with check (lower(auth.jwt() ->> 'email') = 'drbinsaad@gmail.com');

drop policy if exists logbook_owner_update on public.logbook;
create policy logbook_owner_update on public.logbook
  for update using (lower(auth.jwt() ->> 'email') = 'drbinsaad@gmail.com')
            with check (lower(auth.jwt() ->> 'email') = 'drbinsaad@gmail.com');

drop policy if exists logbook_owner_delete on public.logbook;
create policy logbook_owner_delete on public.logbook
  for delete using (lower(auth.jwt() ->> 'email') = 'drbinsaad@gmail.com');
