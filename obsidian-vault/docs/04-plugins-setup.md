# 04 — Setup

The vault ships **pre-configured** via the committed `.obsidian/` folder — core plugins,
settings, theme, and bookmarks are already set. The full, user-facing plugin guide lives inside
the vault at **`Plugins & setup.md`**; this doc is the short version.

## First run (2 minutes)
1. Install Obsidian → **Open folder as vault** → select this `vault/` folder.
2. Everything core is already enabled (Bases, Templates→`_Templates`, Quick switcher, Backlinks,
   Properties, Bookmarks, Graph, Slides…). If a Bases board is blank, re-enable **Bases** in
   Settings → Core plugins.
3. Open **`Home.md`** (also bookmarked) — 123 topics grouped by section, plus the Library board.
4. Install the community plugins listed in `Plugins & setup.md` (Spaced Repetition, Templater,
   QuickAdd, Excalidraw, Dataview) — they're third-party code so you install them yourself.

## What's in `.obsidian/`
`app.json` (new notes → `00 Inbox`, attachments → `99 Attachments`, wikilinks, readable width),
`appearance.json` (system theme, teal accent), `core-plugins.json` (all the above enabled),
`templates.json` (folder = `_Templates`), `hotkeys.json`, `bookmarks.json`, `graph.json`. A
`.gitignore` excludes per-machine state (`workspace.json`, caches) so it never causes churn.

## The board (`ENT Progress.base`)
Three views: **By Section**, **Needs work**, **Has sources**. To tweak columns or add a view,
open the `.base` file in Obsidian's Bases editor — no code. Bases is a **core** plugin
(Obsidian 1.9+), so nothing to install.

## Sync & backup
- **Obsidian Sync** (paid) — easiest, encrypted, great on mobile. Best for medical notes.
- **iCloud / OneDrive** — free.
- **Git** (obsidian-git plugin) — auto-commit to a **private** repo only. Never a public one,
  even for de-identified notes.

## Phase 2 (only once the habit sticks)
- **Anki / Spaced Repetition** — turn `solid`/`mastered` notes into review cards.
- **Publishing** — the notes are plain Markdown; a subset could feed drbinsaad.github.io.

Not needed for the vault to be useful today. Adding them early is how these systems get
abandoned — resist until you feel the need.
