-- ENT Exam Hub — Pediatric case rebuilt in SCFHS format with per-point marks.
-- Source: PEDIATRIC.pptx "3 months old patient with neck mass" (lymphatic malformation).
-- NOTE: the source slides contain ONLY questions — no answers and no marks. Answers
-- are kept from the completed live seed (0003_cases.sql); per-QUESTION totals are kept
-- from it (sum 100); the per-POINT split is assigned here and may be adjusted.
-- The pptx also contains a video (media1.MP4) — the site only renders images, so it is
-- not attached here (see options discussed with the user). Re-runnable.
delete from public.exam_questions where station = 'Pediatric';
insert into public.exam_questions (station, question_id, ord, prompt, max_marks, model_answers, images) values
  ('Pediatric', 'Q0', 0, 'Case (read to the candidate): A 3-month-old infant presenting with a neck mass.', 0, '[]'::jsonb, '["/images/exam/peds-neck-mass.jpg", "/images/exam/peds-neck-mass-video.mp4"]'::jsonb),

  ('Pediatric', 'P1', 1, '[History] What would you ask in the history?', 15,
    '["Present at birth vs appeared later; rate of growth (3 marks)", "Change in size with crying or straining (2 marks)", "Skin colour change / overlying skin changes (2 marks)", "Airway, feeding or breathing symptoms (3 marks)", "Preceding infection or rapid enlargement (2 marks)", "Transillumination noticed; family history (3 marks)"]'::jsonb, '[]'::jsonb),

  ('Pediatric', 'P2', 2, '[Examination & Investigations] What would you look for on examination, and which investigations would you order?', 15,
    '["Site, size, consistency, compressibility; transillumination (positive in lymphatic malformation) (4 marks)", "Overlying skin changes; airway assessment (2 marks)", "Ultrasound — first-line (3 marks)", "MRI to define extent and tissue planes (3 marks)", "CT in selected cases (3 marks)"]'::jsonb, '[]'::jsonb),

  ('Pediatric', 'P3', 3, '[Investigations] Read the image — what is your diagnosis?', 15,
    '["Multicystic / macro- or micro-cystic lesion (5 marks)", "Diagnosis: lymphatic malformation (cystic hygroma) (10 marks)"]'::jsonb, '["/images/exam/peds-mri.jpg", "/images/exam/peds-image3.jpg"]'::jsonb),

  ('Pediatric', 'P4', 4, '[Investigations] On CT and MRI, what are the differences between a haemangioma and a lymphatic malformation?', 15,
    '["Haemangioma — solid, intensely enhancing, flow voids, T2 hyperintense lobulated solid mass (7 marks)", "Lymphatic malformation — cystic, non-enhancing (or rim/septal enhancement only), fluid-fluid levels, very T2 hyperintense, trans-spatial (8 marks)"]'::jsonb, '[]'::jsonb),

  ('Pediatric', 'P5', 5, '[Management] What is the theory of development, the staging system, and the modalities of treatment?', 20,
    '["Development — sequestration of lymphatic sacs that fail to connect with the venous system (6 marks)", "Staging — de Serres staging (I–V, by uni/bilateral and above/below the hyoid) (7 marks)", "Treatment — observation, sclerotherapy, surgery, and medical therapy (sirolimus) (7 marks)"]'::jsonb, '[]'::jsonb),

  ('Pediatric', 'P6', 6, '[Management] Surgery versus sclerotherapy — advantages, disadvantages, and the most-used agents?', 20,
    '["Surgery — potential complete excision but risk to nerves/vessels and recurrence (7 marks)", "Sclerotherapy — less invasive, often needs repeated sessions, good for macrocystic disease (7 marks)", "Common agents — OK-432 (picibanil), bleomycin, doxycycline, ethanol, sodium tetradecyl sulfate (6 marks)"]'::jsonb, '[]'::jsonb);
