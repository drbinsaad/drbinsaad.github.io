# 01 — Architecture

Minimalist and Bases-first. The vault is seeded from your curriculum (`tools/study_v3.xlsx`):
8 sections, 123 topics, ~610 subtopics. **Structure lives in note properties and Bases views —
not in index notes.**

```
vault/
├── Home.md              ← the only landing page; embeds the progress board
├── ENT Progress.base    ← Bases file that powers the board
├── 00 Inbox/            ← quick capture, emptied weekly
├── 01 Pediatric/        ← one folder per section
│   ├── Subglottic Stenosis.md
│   └── … (one concept note per topic)
├── 02 Otology/ … 08 Trauma/
├── 09 Sources/          ← full source notes (papers/guidelines worth a citation)
└── _Templates/          ← Concept note · Source note
```

## The concept note (the only note type you'll make often)
One per curriculum topic. Deliberately minimal:

```
---
section: Otology
topic_no: 9
status: untouched      ← your progress tracker; Bases reads this
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
