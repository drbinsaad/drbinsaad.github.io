-- ENT Exam Hub — Otology case rebuilt in true SCFHS format.
-- Source: OTOLOGY.pdf "Otolaryngology Oral Examination: Chronic Otitis Media with
-- Cholesteatoma" (Mock Exam 2026 AFHSR, Total 100 marks, 5 sections, Junior/Senior).
-- Every marking-guide bullet carries its own per-point mark allocation from the PDF
-- answer key, so the sum of the bullet marks == the question's max_marks.
-- Supersedes the Otology rows seeded in 0003_cases.sql. Re-runnable.
delete from public.exam_questions where station = 'Otology';
insert into public.exam_questions (station, question_id, ord, prompt, max_marks, model_answers, images) values
  ('Otology', 'Q0', 0, 'Case (read to the candidate): Chronic Otitis Media with Cholesteatoma. A 35-year-old male presents to the ENT outpatient clinic with a history of recurrent left ear discharge and progressive hearing loss over the past 3 years. The discharge is foul-smelling, occasionally blood-tinged, and does not respond well to standard courses of oral antibiotics. He has a history of recurrent ear infections as a child. (At the Investigations section, provide the candidate with your prepared Pure Tone Audiogram (PTA) and HRCT of the temporal bones.)', 0, '[]'::jsonb, '[]'::jsonb),

  ('Otology', 'O1', 1, '[History] Based on the case stem, what are the key symptoms you would ask about to confirm your suspicion of a cholesteatoma?', 5,
    '["Foul-smelling, painless, persistent otorrhea — highly characteristic of cholesteatoma (2 marks)", "Progression of hearing loss and presence of tinnitus (1 mark)", "Previous ear surgery, trauma, or grommet insertion (1 mark)", "Laterality and exact duration of symptoms (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O2', 2, '[History] What specific red-flag symptoms must you ask about to rule out complications of chronic otitis media with cholesteatoma?', 10,
    '["Vertigo or severe dizziness — suggests a labyrinthine fistula (2 marks)", "Facial weakness or asymmetry — facial nerve palsy (2 marks)", "Severe headache, fever, photophobia, or neck stiffness — meningitis or intracranial abscess (2 marks)", "Post-auricular swelling, pain, or erythema — mastoiditis or subperiosteal abscess (2 marks)", "Altered mental status, lethargy, or seizures — intracranial involvement (2 marks)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O3', 3, '[History · Senior] How does the pathophysiology of acquired cholesteatoma explain the patient''s symptoms, particularly the nature of the discharge?', 5,
    '["Retraction pocket theory — squamous epithelial migration into the middle ear cleft (2 marks)", "Accumulation of keratin debris provides a nidus for infection (1 mark)", "Secondary infection (Pseudomonas, Proteus, anaerobes) causes the characteristic foul smell (1 mark)", "Osteolysis and bone destruction by inflammatory mediators and enzymes (collagenases, osteoclasts) → granulation tissue and blood-tinged discharge (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O4', 4, '[Examination] Describe your systematic steps in the clinical examination of this patient''s head and neck.', 5,
    '["General inspection, including the post-auricular region for scars or swelling (1 mark)", "Otoscopy/microscopy of the normal right ear first (1 mark)", "Then examine the affected left ear (aural microsuction clearance may be needed) (1 mark)", "Tuning fork tests — Rinne and Weber (1 mark)", "Complete cranial nerve examination with a thorough focus on the facial nerve (CN VII) (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O5', 5, '[Examination] What are the classic otoscopic or microscopic findings of an attic (pars flaccida) cholesteatoma?', 5,
    '["Retraction pocket located in the pars flaccida (2 marks)", "Pearly white keratin debris and crusting over the attic (1 mark)", "Erosion of the scutum — the lateral epitympanic wall (1 mark)", "Granulation tissue or an aural polyp originating from the attic (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O6', 6, '[Examination · Senior] You perform a fistula test in the clinic. How is it performed, what constitutes a positive result, and what does a positive result indicate?', 5,
    '["Apply positive and negative pressure to the external auditory canal using a pneumatic otoscope or via tragal pressure (2 marks)", "A positive result is the induction of nystagmus and vertigo (2 marks)", "Indicates a labyrinthine fistula, most commonly involving the lateral semicircular canal (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O7', 7, '[Examination · Senior] On microscopy, you note a large inflammatory polyp completely obscuring the tympanic membrane. What is your approach to examining and managing this polyp in the outpatient setting?', 5,
    '["Gentle aural microsuction to clear the surrounding discharge (1 mark)", "Apply topical vasoconstrictor and steroid drops to reduce the size of the polyp (1 mark)", "NEVER blindly avulse, snare, or pull the polyp in the clinic setting (2 marks)", "Reason: the polyp may be firmly attached to the facial nerve, stapes, or dura — pulling it could cause facial palsy, profound deafness, or a CSF leak (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O8', 8, '[Investigations] Interpret the provided Pure Tone Audiogram (PTA) and Tympanogram.', 5,
    '["Identify the type of hearing loss — conductive, sensorineural, or mixed (2 marks)", "Calculate the degree of hearing loss / pure tone average (1 mark)", "Identify the size of the air-bone gap (1 mark)", "Comment on the tympanogram type (e.g. Type B), or that it is not testable due to perforation or active discharge (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O9', 9, '[Investigations] What is the primary imaging modality of choice for suspected cholesteatoma, and what specific information are you looking for?', 5,
    '["High-Resolution CT (HRCT) of the temporal bones without contrast — the primary modality (2 marks)", "Extent of soft tissue density / disease (1 mark)", "Status of the ossicular chain and the scutum (1 mark)", "Bony boundaries — tegmen tympani, lateral semicircular canal, and facial nerve canal (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O10', 10, '[Investigations · Senior] Look at the provided HRCT Temporal Bone scans (Coronal and Axial views). Describe the key radiological findings.', 10,
    '["Non-dependent soft tissue density in the epitympanum, Prussak''s space, or the mastoid (2 marks)", "Erosion or blunting of the scutum (2 marks)", "Erosion of the ossicles, commonly the long process of the incus or the stapes superstructure (2 marks)", "Integrity of the tegmen tympani — intact, eroded, or dehiscent (2 marks)", "Integrity of the lateral semicircular canal — intact canal vs a fistulous tract (2 marks)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O11', 11, '[Investigations · Senior] In what specific clinical scenarios would you order a non-EPI Diffusion-Weighted MRI (DWI-MRI) for a patient with cholesteatoma?', 5,
    '["Differentiate cholesteatoma from cholesterol granuloma, scar tissue, or middle ear effusion — cholesteatoma restricts diffusion and is hyperintense (2 marks)", "Evaluate residual or recurrent cholesteatoma post-operatively, especially before a planned second-look surgery (2 marks)", "Assess suspected intracranial complications, such as dural involvement or a brain abscess (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O12', 12, '[Management] What is the initial conservative/medical management for this patient in the clinic while awaiting surgery?', 5,
    '["Aural microsuction and clearance of debris and discharge (2 marks)", "Topical antibiotic + steroid drops, e.g. ciprofloxacin with dexamethasone (2 marks)", "Advise strict water precautions to keep the ear dry (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O13', 13, '[Management] What are the primary goals of cholesteatoma surgery, in order of priority?', 5,
    '["1st priority — make the ear safe: eradicate disease and prevent intra-/extracranial complications (2 marks)", "2nd priority — provide a dry, self-cleansing ear (2 marks)", "3rd priority — preserve or restore hearing (e.g. ossiculoplasty) (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O14', 14, '[Management · Senior] Discuss the surgical options for this patient regarding mastoidectomy (Canal Wall Up vs. Canal Wall Down). What are the general indications and pros/cons of each?', 10,
    '["CWU pros — maintains normal anatomy, no mastoid cavity care required, allows water sports (1.5 marks)", "CWU cons — higher risk of residual/recurrent disease, limited exposure, often requires a planned second-look or MRI surveillance (1.5 marks)", "CWD pros — lower recurrence rate, excellent exposure, residual disease easily monitored in clinic (1.5 marks)", "CWD cons — lifelong cavity care, strict water precautions, hearing outcome may be worse, risk of caloric vertigo with cold air/water (1.5 marks)", "Indications for choosing CWD over CWU — extensive disease, unresectable disease in the sinus tympani or facial recess, poor Eustachian tube function, a sclerotic or contracted mastoid, a non-compliant patient for follow-up, or complications such as a large fistula or intracranial involvement (4 marks)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O15', 15, '[Management · Senior] During surgery, you encounter a 2 mm fistula on the lateral semicircular canal. How do you manage this intraoperatively?', 5,
    '["Recognize the fistula and immediately stop dissection in that area, leaving the cholesteatoma matrix over the fistula intact until the very end of the case (2 marks)", "Strictly avoid suctioning directly over the fistula to prevent inner ear damage and profound sensorineural hearing loss (1 mark)", "If the matrix peels off easily — remove it and immediately cover the defect with fascia, perichondrium, or bone pate; if densely adherent or the fistula is large — leave the matrix in situ and exteriorize via a Canal Wall Down procedure (2 marks)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O16', 16, '[Post-op] What are the immediate and early post-operative complications you must warn the patient about during the informed consent process?', 5,
    '["Facial nerve palsy (1 mark)", "Sensorineural hearing loss or a dead ear (1 mark)", "Vertigo, dizziness, or tinnitus (1 mark)", "Bleeding, hematoma, or wound infection (1 mark)", "Altered taste due to chorda tympani manipulation or injury (1 mark)"]'::jsonb, '[]'::jsonb),

  ('Otology', 'O17', 17, '[Post-op · Senior] The patient undergoes a successful Canal Wall Up (CWU) mastoidectomy. What is your long-term follow-up strategy to monitor for recurrence?', 5,
    '["Regular clinical examinations and otomicroscopy in the outpatient clinic (1 mark)", "Schedule post-operative audiometry at 3 to 6 months (1 mark)", "Perform a non-EPI DWI MRI at 12 to 18 months post-operatively to screen for residual or recurrent cholesteatoma (2 marks)", "A planned second-look surgery is indicated if the MRI is positive, equivocal, or unavailable (1 mark)"]'::jsonb, '[]'::jsonb);
