-- ENT Exam Hub — question forms.
-- Each station can hold a clinical case made of ordered questions. Each
-- question has a prompt, a max mark, a marking guide (model-answer bullets the
-- examiner checks against), and optional images (tap to view full screen).
-- The examiner scores each question; the per-resident total is the sum.
-- Stations with NO questions fall back to the simple single-score form.
-- (The real cases are seeded in 0003_cases.sql.)

create table if not exists public.exam_questions (
  station       text not null,
  question_id   text not null,
  ord           int  not null default 0,
  prompt        text not null,
  max_marks     numeric not null default 0 check (max_marks >= 0),
  model_answers jsonb not null default '[]'::jsonb,  -- array of guidance strings
  images        jsonb not null default '[]'::jsonb,  -- array of image URLs/paths
  primary key (station, question_id)
);

-- Per-question score breakdown for a resident at a station: { "Q1": 8, ... }.
-- The existing exam_grades.score stays as the TOTAL (sum), so the admin grid is unchanged.
alter table public.exam_grades
  add column if not exists details jsonb not null default '{}'::jsonb;

-- Lock down (RLS on, no policies); only the Edge Function (service_role) reads/writes.
alter table public.exam_questions enable row level security;
