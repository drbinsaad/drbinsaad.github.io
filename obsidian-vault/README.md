# ENT Knowledge Vault — Dr. Bin Saad

An [Obsidian](https://obsidian.md) vault to **capture and retain** what you learn from
courses, videos, lectures, journal papers, and conferences — built directly from your own
742-row study curriculum (`tools/study_v3.xlsx`): **8 sections, 123 topics, ~610 subtopics**.

The design was pressure-tested with an LLM Council (5 advisors) — see the design notes at the
bottom.

## What is in this project

| Path | What it is |
|---|---|
| `vault/` | The ready-to-use Obsidian vault — open this folder as a vault |
| `tools/generate_vault.py` | Script that builds the vault from the curriculum Excel (idempotent) |
| `tools/study_v3.xlsx` | The source curriculum (provenance / read-only backup) |
| `docs/01-architecture.md` | Folder + note shape, and why there are no index notes |
| `docs/02-mapping-strategy.md` | The `status` property and the Bases views |
| `docs/03-daily-workflows.md` | The 3-minute capture loop and weekly review |
| `docs/04-plugins-setup.md` | Core plugins (incl. **Bases**), sync, and phase-2 ideas |

## Quick start (5 minutes)

1. Install Obsidian from <https://obsidian.md>.
2. Copy the `vault/` folder somewhere on your computer (e.g. `Documents/ENT Vault`).
3. In Obsidian: **Open folder as vault** → select it.
4. **Settings → Core plugins** → enable **Bases**, **Templates** (folder: `_Templates`),
   **Quick switcher**.
5. Open **`Home.md`** — the only landing page — and you'll see all 123 topics as `untouched`,
   grouped by section.
6. Read `docs/03-daily-workflows.md` and capture your first source.

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
