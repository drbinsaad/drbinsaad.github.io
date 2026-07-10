# 01 — Vault Architecture

This vault is **seeded from your study curriculum** (`tools/study_v3.xlsx`): 8 sections,
123 numbered topics, and ~610 subtopics. Each numbered topic becomes one permanent
**concept note**; each section becomes one folder with a **Map of Content**.

```
vault/
├── Home.md                  ← front door: links to every section MOC + Dashboard
├── Dashboard.md             ← embeds the Bases progress board
├── ENT Progress.base        ← the Bases file that powers the dashboard
├── 00 Inbox/                ← quick capture, emptied weekly
├── 01 Pediatric/
│   ├── Pediatric MOC.md
│   ├── Clinical Evaluation of Airway Obstruction.md
│   ├── Subglottic Stenosis.md
│   └── … (one note per numbered topic)
├── 02 Otology/
├── 03 Laryngology/
├── 04 Head and Neck/
├── 05 General/
├── 06 Basic Sciences/
├── 07 Rhinology/
├── 08 Trauma/
├── 09 Sources/              ← full source notes (papers/guidelines worth a citation)
└── _Templates/              ← Concept note · Source note · Lecture · Daily note
```

## The two note types

### Concept note (the spine — one per curriculum topic)
This is where knowledge lives. Auto-generated as a stub, then filled in by you over time.
It has:

- **Frontmatter properties** the Dashboard reads: `section`, `topic_no`, `status`, `sources`, `tags`.
- A **subtopic checklist** copied from the curriculum (tick them off as you cover them).
- Atomic headings — *Definition, Mechanism, Clinical features, Investigations,
  Staging/Classification, Management, Pearls & pitfalls, Sources*. These headings are
  deliberate: a well-filled note can later become an Anki deck, a teaching slide, or a
  website article without restructuring.

### Source note (optional — one per important paper/guideline)
Lives in `09 Sources`. You only make one when a source deserves its own citation and will
be referenced repeatedly. For everyday videos/lectures you **don't** make a source note —
you just paste the link into the topic note's *Sources* section. This keeps capture fast.

## Why this shape

- **Mirrors your curriculum exactly**, so you never wonder where a note goes — the folder
  and topic already exist.
- **One source of truth for progress.** The `status` property on each note is *the* tracker;
  the Dashboard reads it. The Excel is kept only as a read-only backup/provenance. No double
  upkeep.
- **Stubs are not guilt.** An empty note means `status: untouched` — expected, not failure.
  The Dashboard shows how far you've come.
- **Topic-notes are the spine, not a cage.** If you later want notes organised by clinical
  *presentation* ("unilateral adult serous effusion") instead of curriculum topic, add them
  freely and link them in. Structure grows from use.

## Regenerating from the Excel
`tools/generate_vault.py` created these notes. It is **idempotent**: re-running it only
creates missing notes or refreshes still-untouched stubs — it never overwrites a note you've
started editing (detected via the `status` property and a generator marker). So if the
curriculum changes, drop in the new `study_v3.xlsx` and re-run; your written notes are safe.
