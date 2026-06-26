-- ENT Exam Hub — Rhinology case rebuilt in SCFHS format with per-point marks.
-- Source: RHINOLOGY.pdf "Case Two: Acute Invasive Fungal Rhinosinusitis".
-- NOTE: the source PDF contains NO mark allocations. The per-QUESTION totals are
-- kept unchanged from the live seed (0003_cases.sql; they sum to 100). The
-- per-POINT split within each question is assigned here (source has none) and may
-- be adjusted. Verbatim questions, answers, and images are preserved.
-- Supersedes the Rhinology rows in 0003_cases.sql. Re-runnable.
delete from public.exam_questions where station = 'Rhinology';
insert into public.exam_questions (station, question_id, ord, prompt, max_marks, model_answers, images) values
  ('Rhinology', 'Q0', 0, 'Case (read to the candidate): Acute Invasive Fungal Rhinosinusitis. A 62-year-old presents to the emergency department with right nasal obstruction for 3 days, low-grade fever, right facial pain for 2 days, and right facial and peri-orbital swelling for 1 day.', 0, '[]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R1', 1, '[History] What further information / risk factors do you need from the history?', 10,
    '["Renal transplant (2 marks)", "On immunosuppressants and steroids (2 marks)", "Poorly controlled diabetes mellitus (2 marks)", "Haematological malignancy (leukaemia, lymphoma), especially with neutropenia (2 marks)", "Iatrogenic immunosuppression (transplant, steroids) (1 mark)", "Advanced HIV (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R2', 2, '[Examination] Describe the nasal endoscopy findings.', 8,
    '["Necrotic / black eschar of mucosa and turbinate (3 marks)", "Pale, insensate or discoloured mucosa (3 marks)", "Crusting and tissue destruction suggestive of invasive fungal disease (2 marks)"]'::jsonb, '["/images/exam/rhino-endoscopy.jpg"]'::jsonb),

  ('Rhinology', 'R3', 3, '[Examination] What would you look for on cranial nerve and eye examination?', 6,
    '["Right lateral rectus paralysis (CN VI palsy) (3 marks)", "Assess other cranial neuropathies and orbital involvement (3 marks)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R4', 4, '[Investigations] What investigations would you do next?', 6,
    '["Blood tests — may show neutropenia (3 marks)", "Urgent radiology — CT scan of the sinuses (3 marks)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R5', 5, '[Investigations] What is your suspicion, and what do you see on the CT?', 6,
    '["Acute invasive fungal rhinosinusitis (3 marks)", "Sinus opacification and mucosal thickening (non-specific) (3 marks)"]'::jsonb, '["/images/exam/rhino-ct-1.jpg", "/images/exam/rhino-ct-2.jpg"]'::jsonb),

  ('Rhinology', 'R6', 6, '[Investigations · Senior] What is the role of CT in diagnosing acute invasive fungal rhinosinusitis?', 10,
    '["Define the anatomy (2 marks)", "Non-specific sinus opacification and mucosal thickening (2 marks)", "Peri-antral fat stranding indicating extension beyond the antrum (3 marks)", "Bone erosion, thinning and/or destruction (3 marks)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R7', 7, '[Investigations · Senior] What is the next step (biopsy) and what are the histopathology findings?', 10,
    '["Biopsy — if available, frozen section for a quick result (2 marks)", "Tissue invasion and angio-invasion by fungus (2 marks)", "Broad, ribbon-like, non-septate hyphae branching at more than 90 degrees with vessel-wall invasion (3 marks)", "Mucormycosis (not aspergillus, which is septate and branches at less than 45 degrees) (3 marks)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R8', 8, '[Investigations] Do you want any other investigation, and why?', 6,
    '["MRI (3 marks)", "Superior soft-tissue assessment and extra-sinus extension (3 marks)"]'::jsonb, '["/images/exam/rhino-mri-1.jpg", "/images/exam/rhino-mri-2.jpg"]'::jsonb),

  ('Rhinology', 'R9', 9, '[Investigations · Senior] What is the role of MRI?', 10,
    '["Superior in soft tissue (2 marks)", "Superior for extra-sinus extension — orbital fat, extra-ocular muscles, pterygoid fossa, intracranial (2 marks)", "Non-specific T1 and T2 mucosal thickening with secretions (2 marks)", "Black turbinate sign on T1+contrast — local lack of mucosal enhancement indicating ischaemia/necrosis (2 marks)", "Sinus mucosal lack of enhancement on T1+contrast (2 marks)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R10', 10, '[Investigations · Senior] Which is better for this diagnosis, CT or MRI?', 4,
    '["Both are complementary — CT for bone/anatomy, MRI for soft tissue and extra-sinus/intracranial extension (4 marks)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R11', 11, '[Management] What is the treatment?', 4,
    '["Amphotericin B (2 marks)", "Urgent surgical debridement (1 mark)", "Reverse immunosuppression / control the underlying condition (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R12', 12, '[Management · Senior] What are the possible side effects of Amphotericin B and what monitoring is required?', 10,
    '["Renal function — monitor serum creatinine, BUN and urine output; nephrotoxicity is the most common serious complication (2 marks)", "Electrolytes — potassium, magnesium, calcium, phosphate wasting; hypokalaemia increases digoxin toxicity (2 marks)", "Complete blood count — watch for anaemia and bone-marrow suppression (2 marks)", "Hepatic function — bilirubin, ALT, AST (2 marks)", "Infusion-related reactions — fever, chills, rigors, nausea, vomiting, blood-pressure changes (1 mark)", "IV site — monitor for phlebitis (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R13', 13, '[Management · Senior] What is the role of surgery — the limit of debridement and the second look?', 6,
    '["Surgical debridement back to healthy, bleeding (viable) tissue (3 marks)", "Second look to confirm clearance and reassess for ongoing progression (3 marks)"]'::jsonb, '[]'::jsonb),

  ('Rhinology', 'R14', 14, '[Investigations] How are the CT and MRI findings in allergic fungal rhinosinusitis different?', 4,
    '["CT — double density, more extensive involvement/pansinusitis, sinus expansion, bone thinning and remodelling (2 marks)", "MRI — T2 signal void, T1 hypo- or iso-intense, peripheral ring enhancement on T1+contrast (2 marks)"]'::jsonb, '[]'::jsonb);
