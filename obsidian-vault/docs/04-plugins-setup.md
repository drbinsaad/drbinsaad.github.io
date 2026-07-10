# 04 — Plugins & Settings

Keep the plugin list short. Every plugin is a maintenance cost; the system above works with core plugins alone.

## Core plugins (built in — just enable)

| Plugin | Setting |
|---|---|
| **Daily notes** | New file location: `01 Daily` · Template: `08 Templates/Daily note` · Date format: `YYYY-MM-DD` |
| **Templates** | Template folder: `08 Templates` |
| **Backlinks** | Keep the panel visible in the right sidebar — half the mapping system |
| **Outgoing links** | Shows unresolved links (notes you promised to write) |
| **Graph view** | Filter to `path:"02 Clinical"` for the knowledge-core view |
| **Search** | Learn `path:`, `tag:`, and `line:` operators |
| **Quick switcher** | `Ctrl/Cmd+O` — the main way you open notes; never browse the folder tree |

## Recommended community plugins (install in this order, only when needed)

1. **Templater** — more powerful templates (auto-insert date, move new notes to the right folder). Only if core Templates starts feeling limited.
2. **Dataview** — automatic lists, e.g. show all `#seedling` notes, or all `#case` notes in Laryngology:
   ```dataview
   LIST FROM #seedling AND "02 Clinical" SORT file.mtime DESC
   ```
   Perfect for the weekly review and for auto-populating MOC sections.
3. **Calendar** — click a date to open that daily note.
4. **Spaced Repetition** — turns `#exam` flash-facts into scheduled review cards. Only if you actively use spaced repetition for exams.
5. **Excalidraw** — anatomy sketches and surgical diagrams inside notes.

## Sync & backup (decide once, on day one)

Pick one sync method:
- **Obsidian Sync** (paid) — easiest, end-to-end encrypted, works on phone. Recommended for medical content.
- **iCloud/OneDrive** — free, works, occasionally conflicts on mobile.
- **Git** — you already use GitHub; the [obsidian-git plugin](https://github.com/denolehov/obsidian-git) can auto-commit the vault to a **private** repository. Never a public repo — even de-identified clinical notes belong in a private one.

Whatever you choose, the vault is plain Markdown files — you can always copy the folder as a backup, and you're never locked in.

## Settings worth changing

- **Files & Links → Default location for new notes**: "Same folder as current file" (keeps clinical notes near their siblings; inbox capture still goes to `00 Inbox` explicitly).
- **Files & Links → Automatically update internal links**: ON (rename fearlessly).
- **Editor → Show line numbers**: optional; **Readable line length**: ON.
- **Appearance**: pick one theme in the first week, then stop tweaking. The vault's value is in the notes.
