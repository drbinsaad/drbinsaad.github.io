-- ENT Exam Hub — question forms.
-- Each station can hold a clinical case made of ordered questions. Each
-- question has a prompt, a max mark, a marking guide (model-answer bullets the
-- examiner checks against), and optional images (tap to view full screen).
-- The examiner scores each question; the per-resident total is the sum.
-- Stations with NO questions fall back to the simple single-score form.

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

-- ---------------------------------------------------------------------------
-- Seed: demo case (pediatric neck mass / neuroblastoma) under "Head & Neck".
-- This is a working reference in the standard format; reassign/replace when the
-- real exam cases are provided. Max marks sum to 100.
-- Image questions (Q2, Q4, Q6) have empty image arrays until the images are added.
-- ---------------------------------------------------------------------------
insert into public.exam_questions (station, question_id, ord, prompt, max_marks, model_answers, images) values
  ('Head & Neck', 'Q1', 1,
   'What would you like to ask in the history?', 10,
   jsonb_build_array(
     'Sudden onset',
     'Increasing in size slowly',
     'Was hot and reddish',
     'Received 2 courses of antibiotics (Amoxicillin, Augmentin) each for 7 days'
   ), '[]'::jsonb),

  ('Head & Neck', 'Q2', 2,
   'Describe what you see in the image and give your differential diagnosis.', 15,
   jsonb_build_array(
     'Developmental: branchial cleft cysts, dermoid cysts, vascular malformations',
     'Neoplastic — benign: lymphadenopathy, lipomas, fibromas, neurofibromas, salivary gland tumors, teratoma, schwannoma',
     'Neoplastic — malignant: lymphoma, rhabdomyosarcoma, thyroid cancer, neuroblastoma, paraganglioma',
     'Metastatic nasopharyngeal carcinoma'
   ), '[]'::jsonb),

  ('Head & Neck', 'Q3', 3,
   'How would you proceed?', 15,
   jsonb_build_array(
     'Radiological ultrasound (U/S)',
     'MRI',
     'CT scan with contrast',
     'Review CT findings'
   ), '[]'::jsonb),

  ('Head & Neck', 'Q4', 4,
   'Describe the finding (imaging). Give 3 possible diagnoses, starting with the most likely.', 15,
   jsonb_build_array(
     'Neuroblastoma (most likely)',
     'Teratoma',
     'Paraganglioma'
   ), '[]'::jsonb),

  ('Head & Neck', 'Q5', 5,
   'After imaging, what would you like to do?', 10,
   jsonb_build_array(
     'Biopsy'
   ), '[]'::jsonb),

  ('Head & Neck', 'Q6', 6,
   'Any specific blood test +/- radiological test to be done if neuroblastoma is suspected?', 15,
   jsonb_build_array(
     'Urinary excretion of catecholamine metabolites (VMA / HVA)',
     'CT-CAP (chest, abdomen, pelvis)',
     'MIBG scan',
     'Bone marrow biopsy or aspiration'
   ), '[]'::jsonb),

  ('Head & Neck', 'Q7', 7,
   'If the diagnosis is neuroblastoma, what are the stages?', 10,
   jsonb_build_array(
     'Stage 1: localized tumor, does not cross the midline, completely resected; ipsilateral lymph nodes may be involved',
     'Stage 2: tumor on one side, may be incompletely resected; ipsilateral regional lymph nodes may be involved',
     'Stage 3: unresectable tumor crossing the midline; lymph nodes on one or both sides may be involved; not spread to distant sites',
     'Stage 4: metastasis to distant lymph nodes, bone marrow, liver, skin, or other organs'
   ), '[]'::jsonb),

  ('Head & Neck', 'Q8', 8,
   'How would you manage the different stages?', 10,
   jsonb_build_array(
     'Surgery',
     'Chemotherapy',
     'Radiotherapy',
     'Immunotherapy'
   ), '[]'::jsonb)
on conflict (station, question_id) do nothing;
