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
| `docs/01-architecture.md` | Folder structure, the two note types, why it's shaped this way |
| `docs/02-mapping-strategy.md` | The `status` progress property, links, MOCs, tags, naming |
| `docs/03-daily-workflows.md` | The 3-minute capture loop and weekly review |
| `docs/04-plugins-setup.md` | Core plugins (incl. **Bases**), sync, and phase-2 ideas |

## Quick start (5 minutes)

1. Install Obsidian from <https://obsidian.md>.
2. Copy the `vault/` folder somewhere on your computer (e.g. `Documents/ENT Vault`).
3. In Obsidian: **Open folder as vault** → select it.
4. **Settings → Core plugins** → enable **Bases**, **Templates** (folder: `_Templates`),
   **Backlinks**, **Quick switcher**.
5. Open **`Home.md`**, then **`Dashboard.md`** — you'll see all 123 topics as `untouched`,
   grouped by section.
6. Read `docs/03-daily-workflows.md` and capture your first source.

## The idea in one paragraph

Your curriculum is already the perfect map, so the vault mirrors it: one **concept note** per
topic, pre-created as a stub. When you learn something, you open the topic note, dump the
takeaways, paste the source link, and bump one property — `status: untouched → learning →
solid → mastered`. That property *is* your progress tracker; the **Bases** dashboard rolls it
up by section automatically. One system, one source of truth — no more parallel spreadsheet.

## Design principles (from the council)

- **One source of truth for progress.** The `status` property replaces the Excel checklist; the
  Excel is kept only as backup. No double upkeep.
- **Capture in under 3 minutes.** Dump into the topic note; full source notes only for papers
  worth a citation. Friction is what kills these systems.
- **Stubs are not guilt.** Empty = `untouched` = expected. The dashboard shows progress, not failure.
- **Structure once, reuse everywhere.** Atomic headings (definition, mechanism, pearls,
  staging…) mean a note can later become an Anki card, a slide, or a website article.
- **Retention needs recall.** Spaced-repetition/Anki export is planned for phase 2 — the note
  structure is already ready for it.
- **No patient-identifiable data, ever.**

## Regenerating from the curriculum

```
cd tools && python3 generate_vault.py --out ../vault
```

Idempotent: only creates missing notes or refreshes still-`untouched` stubs — it never
overwrites a note you've started editing. Drop in a new `study_v3.xlsx` and re-run to add new
topics safely.
