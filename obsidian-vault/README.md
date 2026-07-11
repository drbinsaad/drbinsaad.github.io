# ENT Knowledge Vault — Dr. Bin Saad

A **pre-configured** [Obsidian](https://obsidian.md) vault to run your whole ENT practice —
clinical knowledge, exams, teaching, and projects — built from your own 742-row study
curriculum (`tools/study_v3.xlsx`): **8 sections, 123 topics, ~610 subtopics**. Minimalist and
Bases-first; ships with the right plugins/settings already on.

The design was pressure-tested with an LLM Council and researched against the best public
Obsidian/KM practice (see `docs/05`).

## What is in this project

| Path | What it is |
|---|---|
| `vault/` | The ready-to-use, pre-configured Obsidian vault (incl. `.obsidian/` settings) |
| `tools/generate_vault.py` | Idempotent script that builds the concept notes from the Excel |
| `tools/study_v3.xlsx` | The source curriculum (provenance / read-only backup) |
| `docs/01-architecture.md` | Folders, the `type` property, note shape |
| `docs/02-mapping-strategy.md` | The `status` property and the Bases views |
| `docs/03-daily-workflows.md` | The 3-minute capture loop and weekly review |
| `docs/04-plugins-setup.md` | The shipped `.obsidian/` config and plugin install list |
| `docs/05-knowledge-management.md` | Why it's built this way (KM frameworks, sources) |

## Quick start (2 minutes)

1. Install Obsidian from <https://obsidian.md>.
2. Copy the `vault/` folder somewhere (e.g. `Documents/ENT Vault`).
3. In Obsidian: **Open folder as vault** → select it. Core plugins, settings, theme and
   bookmarks are already configured.
4. Open **`Home.md`** (bookmarked) — 123 topics grouped by section, plus the Library board.
5. Install the community plugins listed in the in-vault **`Plugins & setup.md`** (Spaced
   Repetition, Templater, QuickAdd, Excalidraw, Dataview).
6. Read `docs/03-daily-workflows.md` and capture your first source.

## Manage more than the curriculum
A `type` property (`concept · source · case · teaching · project`) lets one vault hold your
literature (`09 Sources`), de-identified cases (`10 Cases`), lectures (`11 Teaching`), and
projects (`12 Projects`) — all surfaced by the **Library** board on Home. See
`vault/Flashcards & revision.md` to turn notes into spaced-repetition cards.

## The idea in one paragraph

Your curriculum is already the perfect map, so the vault mirrors it: one **concept note** per
topic, pre-created as a minimal stub. When you learn something, open the note, write what you
learned under **Notes**, paste the source link, and bump one property — `status: untouched →
learning → solid → mastered`. That property *is* your progress tracker; the **Bases** board on
`Home.md` rolls it up by section automatically. One system, one source of truth.

## Design principles (minimalist, from the council)

- **Bases is the structure.** No hand-built index/MOC notes and no second dashboard — a Bases
  view lists and groups every topic live, and never goes stale.
- **Notes open like a blank page.** One free **Notes** body, no 8-heading form to fill, no tags —
  the `section` property does the categorising.
- **One source of truth for progress.** The `status` property replaces the Excel checklist.
- **Capture in under 3 minutes.** Dump into the topic note; full source notes only for papers
  worth a citation. Friction is what kills these systems.
- **Stubs are not guilt.** Empty = `untouched` = expected. The board shows progress, not failure.
- **Add power by adding a property.** Tag a few notes `high_yield: true` and get a new Bases view
  for free — no restructuring.
- **No patient-identifiable data, ever.**

## Regenerating from the curriculum

```
cd tools && python3 generate_vault.py --out ../vault
```

Idempotent: only creates missing notes or refreshes still-`untouched` stubs — it never
overwrites a note you've started editing. Drop in a new `study_v3.xlsx` and re-run to add new
topics safely.
