# 04 — Plugins & Setup

Keep it minimal. This vault needs only **core** plugins to work. Two community plugins are
nice-to-have. Everything else is phase 2.

## First-run setup (5 minutes)
1. Install Obsidian → **Open folder as vault** → select this `vault/` folder.
2. **Settings → Core plugins**, enable:
   - **Bases** — powers the [[Dashboard]] progress board. *(If the Dashboard is blank, this
     is why.)*
   - **Templates** — set *Template folder location* to `_Templates`.
   - **Backlinks** and **Outgoing links** — keep both panels visible.
   - **Quick switcher** — `Ctrl/Cmd+O` is how you open topic notes; don't browse folders.
3. Open **[[Home]]**, then **[[Dashboard]]** — you should see all topics as `untouched`,
   grouped by section.

## The Bases dashboard
`ENT Progress.base` defines three views over your topic notes' properties:
- **By Section** — every topic grouped by `section`, showing `status` and last-edited.
- **Needs work** — everything not yet `mastered` (your study queue).
- **Has sources** — topics you've already backed with a video/lecture/paper.

`Dashboard.md` embeds it with `![[ENT Progress.base]]`. To change columns or add a view, open
the `.base` file in Obsidian's Bases editor — no code needed. Bases is a **core** plugin
(Obsidian 1.9+), so there's nothing to install.

## Optional community plugins (add only if you feel the need)
1. **Templater** — supercharges the templates (auto-insert date, auto-file new notes). The
   built-in Templates plugin is enough to start; add Templater later if you want automation.
2. **Calendar** — if you adopt daily notes, click a date to open one.

## Sync & backup (decide once)
- **Obsidian Sync** (paid) — easiest, encrypted, great on mobile. Recommended for medical notes.
- **iCloud / OneDrive** — free, occasional mobile conflicts.
- **Git** — you already use GitHub; the *obsidian-git* plugin can auto-commit to a **private**
  repo. Never a public one — even de-identified clinical notes belong in a private repository.

## Phase 2 (deliberately out of scope for now)
Add these only once the capture habit is sticky — bolting them on early is the main way these
systems get abandoned:
- **Spaced Repetition / Anki export** — turn `solid`/`mastered` notes into review cards. The
  atomic headings already make this easy later.
- **Publishing to drbinsaad.github.io** — the notes are plain Markdown, so a subset could feed
  a public ENT reference or your calculators' explainers.
- **Presentation/clinical-decision notes** — a second note type keyed to clinical presentations.

None of these are needed for the vault to be useful today.
