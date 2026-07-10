# 02 — Mapping Strategy: how notes connect

Folders answer "where is the file?". Links answer "how does knowledge fit together?". This document defines the linking system — the *map* of the vault.

## The three layers of the map

```
Layer 1: Home.md            (1 note   — the front door)
Layer 2: MOCs               (~10 notes — one per knowledge area)
Layer 3: Everything else    (all concept, literature, case notes)
```

### Layer 1 — `Home.md`
One note, pinned. It links to every MOC and your current active projects. You should be able to reach any note in the vault in ~3 clicks starting from Home.

### Layer 2 — Maps of Content (MOCs)
A MOC is a normal note whose job is to **collect and organize links** about one area. Example `Rhinology MOC.md`:

```markdown
# Rhinology MOC

## Core diseases
- [[Chronic rhinosinusitis]] · [[Nasal polyposis]] · [[Allergic rhinitis]]

## Scores & classifications
- [[Lund-Mackay score]] · [[SNOT-22]] · [[Lund-Kennedy score]]

## Procedures
- [[Endoscopic sinus surgery — steps]] · [[Septoplasty]]

## Open questions
- What is my threshold for revision FESS? → [[Revision FESS decision]]
```

Rules for MOCs:
- Create a MOC only when an area has **~10+ notes** and feels hard to navigate. Don't pre-build empty MOCs.
- A MOC is curated by hand — ordering and grouping links *is* the thinking.
- MOCs can link to other MOCs (`Rhinology MOC` → `Allergy MOC`).

### Layer 3 — everything else
Every ordinary note follows one rule: **no orphan notes**. Each note links to at least one related note or its MOC. When you write a new note, spend 30 seconds asking "what does this connect to?" — that moment of linking is where learning happens.

## Linking rules (keep it simple)

1. **Link on first mention.** Writing about epistaxis and you mention sphenopalatine artery? Write `[[Sphenopalatine artery]]` even if that note doesn't exist yet. Unresolved links are a to-do list for future notes.
2. **Link specifically.** Prefer `[[Cholesteatoma#Surgical management]]` over just the page when pointing at one section.
3. **Backlinks are half the map.** Always keep the backlinks panel open — it shows every note that points *at* the current note, for free.
4. **Don't link everything.** Link what you'd want to find again. Ten meaningful links beat fifty noise links.

## Tags — small and controlled

Tags answer questions links can't: *status* and *type*. Keep a closed list:

| Tag | Meaning |
|---|---|
| `#seedling` | rough note, needs work |
| `#evergreen` | polished, trustworthy note |
| `#case` | case learning note |
| `#paper` | literature note |
| `#exam` | exam-relevant point |
| `#idea` | research/project idea |

Do **not** use tags for topics (`#rhinology` is wrong — that's what links and MOCs are for). If you find yourself inventing a new tag more than once a month, the list has failed.

## Naming rules

- **Note titles are sentences or noun phrases in plain language**: `Epistaxis management`, not `epistaxis_mgmt_v2`.
- **Titles are unique across the vault** (Obsidian links by title).
- **Literature notes**: `AuthorYEAR — Short title`, e.g. `Fokkens2020 — EPOS guidelines`.
- **Daily notes**: `YYYY-MM-DD` (automatic).
- **Case learnings**: `Case — one-line lesson`, e.g. `Case — post-tonsillectomy bleed on day 7`. Never a patient name, number, or date of birth.

## Using the graph view

The graph is a diagnostic tool, not a toy:
- **Orphan dots** (no connections) → notes to link or delete.
- **Dense clusters with no MOC** → an area that has grown enough to deserve a MOC.
- Filter the graph by folder `02 Clinical` to see only the knowledge core.

## How the map grows (the lifecycle)

```
daily note → extract idea → concept note in 00 Inbox
          → weekly review: move to 02 Clinical, add links, tag #seedling
          → gets cited by lectures/exam notes over time
          → you polish it → #evergreen
          → area gets crowded → create/extend a MOC
          → MOC gets linked from Home.md
```

Bottom-up, always: notes first, structure later. The map is discovered, not designed in advance.
