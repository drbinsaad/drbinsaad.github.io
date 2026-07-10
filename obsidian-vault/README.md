# Obsidian Vault Architecture — Dr. Bin Saad

A complete blueprint for building, mapping, and using a personal knowledge vault in [Obsidian](https://obsidian.md), designed for an ENT physician who manages clinical knowledge, research, exam preparation, teaching material, and digital projects (like this website).

## What is in this project

| Path | What it is |
|---|---|
| `docs/01-architecture.md` | The vault structure: folders, what goes where, and why |
| `docs/02-mapping-strategy.md` | How notes connect: links, Maps of Content (MOCs), tags, naming rules |
| `docs/03-daily-workflows.md` | How to actually use the vault day to day (capture → process → connect → review) |
| `docs/04-plugins-setup.md` | Recommended plugins and settings to make it all work |
| `vault/` | A ready-to-use vault skeleton — copy this folder into Obsidian and start writing |

## Quick start (5 minutes)

1. Install Obsidian from <https://obsidian.md>.
2. Copy the `vault/` folder from this project to somewhere on your computer (for example `Documents/ENT Vault`). You can rename it.
3. In Obsidian choose **Open folder as vault** and select that folder.
4. Open `Home.md` — it is the front door of the vault and links to everything else.
5. In **Settings → Core plugins**, enable **Templates**, **Daily notes**, and **Backlinks**. Point Templates to the `08 Templates` folder and Daily notes to `01 Daily`.
6. Read `docs/03-daily-workflows.md` and start with tomorrow morning's daily note.

## The idea in one paragraph

Folders keep files tidy, but **links are what make the vault think**. Every note you write gets linked to at least one other note, and each area of your knowledge (rhinology, otology, thesis, exam prep…) has one **Map of Content** note that collects its most important links. The daily note is where everything starts; the MOCs are where everything ends up. Over time the vault becomes a second brain for clinical medicine: you look things up by following links, not by remembering where a file was saved.

## Design principles used here

- **Shallow folders, deep links.** Ten top-level folders, almost no sub-sub-folders. Structure lives in MOC notes, not in the file tree.
- **One note = one idea.** A note called "Nasal polyp scoring" is more reusable than a giant "Rhinology" file.
- **Numbered folders** (`00`–`09`) so the file tree always sorts in workflow order.
- **Templates for everything repeatable** — literature notes, case learnings, lectures — so notes are consistent and fast to create.
- **No patient-identifiable data, ever.** Case notes record the *learning point*, never the patient.
