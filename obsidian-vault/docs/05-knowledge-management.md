# 05 — The knowledge-management model (why it's built this way)

This vault's design was researched against the best public Obsidian/KM practice (2025–2026) and
deliberately borrows one idea from each major framework rather than adopting any wholesale.

## What we stole from each framework
| Framework | The one idea we use |
|---|---|
| **Zettelkasten** | **Atomic notes** — one concept per note (`Cholesteatoma`, not "middle-ear disease") so notes recombine across clinic, exam, and teaching. |
| **LYT / Maps of Content** (Nick Milo) | Curation over folders — but here the curation is a **Bases view**, which never goes stale, instead of a hand-kept index. |
| **PARA** (Tiago Forte) | **Projects** are the only time-bound bucket (`12 Projects`); knowledge stays evergreen. |
| **ACCESS / properties-first** (Forte; kepano) | A **`type` property** is the primary axis, so one board spans concepts, sources, cases, teaching, projects. |
| **Building a Second Brain (CODE)** | **Distill** — mark high-yield material (`high_yield: true`, `==highlights==`) so revision is instant. |

## The core principle
> **Machine layer = properties. Human layer = the note body. Navigation = links + Bases. Structure = Bases views, not hand-built indexes.**

Folders are kept only as coarse, familiar buckets. Everything queryable lives in properties
(`type`, `section`, `status`, `high_yield`), so adding one property gives you a whole new view
for free — no restructuring.

## How the layers connect (the flywheel)
```
sources (papers/videos)  ─┐
                          ├─►  concept notes  ──►  flashcards (retention)
cases (de-identified)  ───┤          │
                          │          └──►  teaching notes (transclude concepts)
projects (audits/site) ───┘
```
A paper you read updates a concept; that concept becomes a flashcard, a teaching slide, and —
later, if you choose — a public article. Write once, reuse everywhere.

## Selected sources
- kepano's properties-first vault — <https://github.com/kepano/kepano-obsidian>
- Nick Milo, LYT / Maps of Content — <https://forum.obsidian.md>
- Obsidian Bases docs — <https://help.obsidian.md/bases>
- Zotero + Obsidian (literature) — <https://github.com/mgmeyers/obsidian-zotero-integration>
- Spaced repetition — <https://github.com/st3v3nmw/obsidian-spaced-repetition>

## Deliberately deferred (add only when the habit sticks)
Anki bridge for high-volume decks, Zotero literature automation, publishing concept notes to
drbinsaad.github.io. The note structure is already compatible with all three.
