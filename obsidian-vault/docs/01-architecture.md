# 01 — Vault Architecture

The vault has ten numbered top-level folders. The numbers keep them sorted in the order you actually use them: capture first, knowledge in the middle, system files at the end.

```
ENT Vault/
├── Home.md                  ← front door: links to every MOC
├── 00 Inbox/                ← everything new lands here first
├── 01 Daily/                ← one note per day (auto-created)
├── 02 Clinical/             ← permanent ENT knowledge
│   ├── Rhinology/
│   ├── Otology/
│   ├── Laryngology/
│   ├── Head & Neck/
│   ├── Pediatric ENT/
│   └── Facial Plastics/
├── 03 Literature/           ← one note per paper, book, or guideline
├── 04 Research/             ← your own studies, thesis, manuscripts
├── 05 Exam Prep/            ← board/fellowship exam material
├── 06 Teaching/             ← lectures, presentations, student material
├── 07 Projects/             ← active work with an end date (website, tools, audits)
├── 08 Templates/            ← note templates (never edited as normal notes)
└── 09 Archive/              ← finished projects, outdated notes
```

## What goes in each folder

### `00 Inbox` — the capture zone
Anything you don't have time to file properly: a thought between patients, a paper someone mentioned, a screenshot from a conference. Rule: **the inbox must reach zero once a week** (see workflows doc). Nothing lives here permanently.

### `01 Daily` — the timeline
One note per day, created automatically from the daily template. It holds: what you saw, what you learned, what you need to do. Interesting content gets *extracted* into permanent notes later — the daily note is a logbook, not a knowledge store.

### `02 Clinical` — the permanent knowledge core
This is the heart of the vault. One note per **concept**: a disease, a procedure, a classification, a drug, an anatomical structure. Examples:

- `Epistaxis management.md`
- `Lund-Mackay score.md`
- `Endoscopic sinus surgery — steps.md`
- `Cholesteatoma.md`

Each subspecialty subfolder has one **MOC note** (e.g. `Rhinology MOC.md`) that lists and organizes the notes inside it. Notes may link across subfolders freely — folders are just storage, links are the real structure.

### `03 Literature` — one note per source
Every paper, guideline, or book chapter you actually read gets one literature note (from the template): citation, key findings in your own words, and links to the clinical concepts it supports. This is what makes your reading *cumulative* instead of forgotten.

### `04 Research` — your own science
One subfolder per study or manuscript. Protocol drafts, analysis ideas, reviewer responses. Links heavily into `03 Literature`.

### `05 Exam Prep` — exam-facing material
Question-bank learnings, high-yield summaries, spaced-repetition cards (if you use the Spaced Repetition plugin). These notes *link to* the clinical notes rather than duplicating them — the exam note says "tested point: X" and links to the full concept note.

### `06 Teaching` — output for others
Lecture outlines, slide sources, teaching cases. When you build a lecture, you mostly **assemble links** to existing clinical notes — this is where the vault pays you back.

### `07 Projects` — active, finite work
One subfolder or one note per project: the website, a new calculator, a department audit, a conference submission. A project note has a goal, a deadline, next actions, and links to the knowledge it uses. When done → move to `09 Archive`.

### `08 Templates` — the machinery
The note templates (daily, literature, case learning, lecture, project, MOC, concept). Configured in Settings → Templates.

### `09 Archive` — cold storage
Finished projects and superseded notes. Never delete — archived notes keep their backlinks working.

## Why this shape

- **Numbered + shallow**: you never wonder where something goes for more than two seconds. If unsure → `00 Inbox`.
- **Time-based vs. knowledge-based separation**: `01 Daily` records *when* things happened; `02 Clinical` records *what is true*. Keeping these apart is the single most important architectural decision.
- **Sources vs. concepts separation**: `03 Literature` (what the paper says) is separate from `02 Clinical` (what you know). One concept note can cite many literature notes; one paper can feed many concepts.
- **Projects are disposable, knowledge is permanent**: projects come and go through `07 → 09`, but everything they taught you stays in `02` and `03`.
