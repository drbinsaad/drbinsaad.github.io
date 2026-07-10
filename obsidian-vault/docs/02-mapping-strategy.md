# 02 — Mapping Strategy: how notes connect

Folders tell you *where a file is*. Links and properties tell you *how knowledge fits
together* and *how far along you are*. Three things carry the map: the **status property**,
**links**, and the **MOCs**.

## The status property (your progress map)

Every concept note has a `status` in its frontmatter:

```
untouched → learning → solid → mastered
```

- `untouched` — curriculum stub, not studied yet
- `learning` — started; notes in progress
- `solid` — understood; could answer an exam question
- `mastered` — could teach it or operate confidently

This single property is your **whole progress tracker**. You bump it as you study; the
**Dashboard** (`ENT Progress.base`) rolls it up by section automatically. This is why the
Excel checklist is retired — the status property replaces it, in one place.

## Links (the knowledge map)

1. **Every concept note links to its section MOC** (done automatically) and to related notes.
2. **Link on first mention.** Writing in *Otitis Media* and you mention cholesteatoma? Write
   `[[Cholesteatoma]]` — it's already a note. Cross-section links are encouraged
   (`[[Facial Nerve Paralysis and Rehabilitation]]` from a temporal-bone trauma note).
3. **Sources link into topics.** A `09 Sources` paper note lists every topic it feeds under
   *Feeds into*; each of those topics cites it back under *Sources*.
4. **Backlinks are free.** Keep the backlinks panel open — it shows every note pointing here.

## MOCs (the section index)

Each section has an auto-generated `<Section> MOC.md` listing its numbered topics in order.
Treat it as the table of contents / syllabus chapter. You can hand-add groupings
("High-yield", "Exam favourites", "Operative") above the auto list.

## Tags — small and controlled

Topics are already tagged `#ent` and `#<section>`. Keep any extra tags to a tiny, closed list
for *status/type*, never for topics (topics are handled by folders + links):

| Tag | Meaning |
|---|---|
| `#source` | a source note in `09 Sources` |
| `#teaching` | a lecture/teaching note |
| `#high-yield` | flag for exam revision |

## Naming rules

- **Topic notes** keep the curriculum wording (e.g. `Endoscopic Sinus Surgery and Its Complications`).
- **Source notes**: `AuthorYEAR — Short title` (`Fokkens2020 — EPOS guidelines`).
- **Titles are unique** across the vault (Obsidian links by title).
- Never put patient identifiers in any note.

## How the map grows
Bottom-up. Stubs exist for structure, but real content and links appear only as you consume
sources. The graph fills in where you actually study — which is exactly what the Dashboard
shows you.
