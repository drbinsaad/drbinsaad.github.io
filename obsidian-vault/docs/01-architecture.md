# 01 — Architecture

Minimalist and Bases-first. The vault is seeded from your curriculum (`tools/study_v3.xlsx`):
8 sections, 123 topics, ~610 subtopics. **Structure lives in note properties and Bases views —
not in index notes.**

```
vault/
├── .obsidian/           ← ships pre-configured (core plugins, settings, theme, bookmarks)
├── Home.md              ← the landing page; embeds both boards
├── Flashcards & revision.md · Plugins & setup.md   ← in-vault guides
├── ENT Progress.base    ← curriculum progress board
├── Library.base         ← sources / cases / teaching / projects board
├── 00 Inbox/            ← quick capture, emptied weekly
├── 01 Pediatric/ … 08 Trauma/   ← concept notes (type: concept), one per topic
├── 09 Sources/          ← literature notes (type: source)
├── 10 Cases/            ← de-identified teaching cases (type: case)
├── 11 Teaching/         ← lectures & resident teaching (type: teaching)
├── 12 Projects/         ← audits, research, website, talks (type: project)
├── 99 Attachments/      ← pasted images/PDFs land here
└── _Templates/          ← Concept · Source · Case · Teaching · Project
```

## The `type` property — one axis for everything
Every note carries a `type` (`concept | source | case | teaching | project`). This is what lets
one Bases board show your whole practice, not just the curriculum. Folders are coarse buckets;
the `type` and `section` **properties** are what Bases actually queries — so you get
cross-cutting views (e.g. all high-yield otology, or every case linked to a concept) for free.
This is the properties-first model used by the best modern vaults (kepano, Forte's ACCESS).

## The concept note (the one you'll make most)
One per curriculum topic. Deliberately minimal:

```
---
type: concept
section: Otology
topic_no: 9
status: untouched      ← your progress tracker; Bases reads this
high_yield: false      ← set true for exam-critical topics (own Bases view)
sources: []
---
# Otitis Media
## Subtopics   (checklist copied from the curriculum)
## Notes       (one free body — write whatever you learn, your way)
## Sources     (paste links)
```

No 8-heading scaffold, no tags. The `section` property does the categorising; the free **Notes**
body means opening a note feels like a blank page, not a form to fill.

## Why there are no MOC/index notes
Obsidian **Bases** already lists and groups every topic by its `section` property, live and
never stale. A hand-maintained index note would just be a second copy that rots. The
`ENT Progress.base` board *is* your table of contents.

## Why folders stay
Folders and properties coexist — Bases queries the `section` **property**, not the folder — so
you keep familiar browsing *and* get every cross-cutting view for free. Keeping them costs
nothing.

## Regenerating
`tools/generate_vault.py` built these notes and is **idempotent**: re-running only creates
missing notes or refreshes still-`untouched` stubs — it never overwrites a note you've edited.
Drop in a new `study_v3.xlsx` and re-run to add topics safely.
