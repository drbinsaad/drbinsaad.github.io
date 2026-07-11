# 02 — How it's organised

Two things carry everything: the **`status` property** and **Bases**. That's the whole system.

## `status` — your progress tracker
Every concept note has one property that matters most:

```
untouched → learning → solid → mastered
```

- `untouched` — curriculum stub, not studied yet
- `learning` — started; notes in progress
- `solid` — could answer an exam question
- `mastered` — could teach it / operate confidently

Bump it as you study. The **Bases board** in `Home.md` rolls it up by section automatically.
This single property replaces the old Excel checklist — one source of truth, no double upkeep.

## Bases — the structure
`ENT Progress.base` gives three views over the notes' properties:
- **By Section** — every topic grouped by `section` (this is your table of contents).
- **Needs work** — everything not yet `mastered` (your study queue).
- **Has sources** — topics you've already backed with a video/lecture/paper.

Want a new view later — e.g. only high-yield exam topics? Add one property (`high_yield: true`)
to the notes you care about and Bases gives you the filtered view for free. That's the payoff of
keeping notes as properties instead of hand-built lists.

## Links (optional, as you go)
When you write in one note and mention another topic, link it: `[[Cholesteatoma]]`. Keep the
backlinks panel open. No obligation — link only what you'll want to find again.

## Naming
- **Topic notes** keep the curriculum wording (`Endoscopic Sinus Surgery and Its Complications`).
- **Source notes**: `AuthorYEAR — Short title` (`Fokkens2020 — EPOS guidelines`).
- Titles are unique across the vault. Never put patient identifiers in any note.
