# 03 — Daily Workflows: how to actually use the vault

Architecture is worthless without habits. Four workflows cover everything: **capture**, **process**, **connect**, **review**. Total cost: ~15 minutes a day plus 30 minutes a week.

## 1. Capture (all day, 10 seconds each)

Everything goes to the **daily note** or **00 Inbox** — never "I'll remember it".

- Between patients, you learn something → one line in today's daily note under *Learned*.
- Someone mentions a paper → title into `00 Inbox`.
- Idea for the website or a study → one line under *Ideas* in the daily note.
- On your phone: use Obsidian mobile (with sync) pointing at the same vault, or email yourself and process later.

The bar for capture is deliberately low. Do not organize while capturing.

## 2. Process (end of day, 5 minutes)

Look at today's daily note and ask one question per line: **"Is this worth keeping beyond this week?"**

- **Yes, it's knowledge** → create a concept note (or add to an existing one) in `00 Inbox` or directly in `02 Clinical`. Two sentences is enough to start.
- **Yes, it's a task** → move it to the relevant project note in `07 Projects`.
- **No** → leave it in the daily note. It's a logbook; it's allowed to contain noise.

## 3. Connect (whenever you create a note, 30 seconds)

Before closing any new note:
1. Link it to at least one related note or MOC.
2. Add one status/type tag (`#seedling`, `#case`, `#paper`…).
3. Check the backlinks panel — does something unexpected already point here?

## 4. Weekly review (30 minutes, e.g. Friday afternoon)

1. **Empty `00 Inbox`** — every item becomes a note, a task, or gets deleted.
2. **Skim the week's daily notes** — anything valuable not yet extracted?
3. **Open each active project note** in `07 Projects` — update next actions; archive finished projects to `09 Archive`.
4. **Pick one `#seedling` note and grow it** — add detail, links, a literature reference. This is how the vault compounds.

## Scenario walkthroughs

### A clinic day teaches you something
> In clinic you see an unusual presentation of laryngopharyngeal reflux.

1. Daily note, under *Learned*: "LPR can present with isolated globus, normal RSI — check [[RFS score]] anyway."
2. Evening: worth keeping → open (or create) `[[Laryngopharyngeal reflux]]` in `02 Clinical/Laryngology`, add the point.
3. If it's a real case lesson → new note from the **case template**: `Case — LPR with isolated globus`, tagged `#case`, linked to the LPR note. No patient identifiers, ever.

### You read a paper
1. New note in `03 Literature` from the **literature template**: `Fokkens2020 — EPOS guidelines`.
2. Fill: citation, 3–5 key findings *in your own words*, your critique.
3. Under "Feeds into": link the clinical notes this paper supports — `[[Chronic rhinosinusitis]]`, `[[Nasal polyposis]]`.
4. Go to those clinical notes and update them with what you learned, citing the literature note.

### Preparing a lecture
1. New note in `06 Teaching` from the **lecture template**.
2. Outline the lecture as a list of links to existing clinical notes — you'll usually find 70% of the content already exists.
3. Gaps in the outline = concept notes you need to write. Write them in `02 Clinical` (they'll serve you forever), then finish the lecture.

### Studying for an exam
1. Question bank teaches you a fact → note in `05 Exam Prep` or a line in an existing exam note, tagged `#exam`, linking to the full concept note in `02 Clinical`.
2. Before the exam, review by walking the MOCs — each MOC is a natural syllabus chapter.

### Working on the website / a new calculator
1. One project note in `07 Projects`, e.g. `Project — Dysphagia calculator`, with goal, status, and next actions.
2. Clinical logic for the tool (scoring systems, cutoffs, references) lives in `02 Clinical` / `03 Literature` and gets *linked* — so the medical knowledge outlives the project.

## Anti-rules (what NOT to do)

- Don't spend evenings reorganizing folders. If filing takes thought, the structure is wrong.
- Don't copy-paste textbook chapters in. The vault stores *your understanding*, in your words, or a link to the source.
- Don't create templates, tags, or MOCs "for later". Create structure only when existing notes demand it.
- Don't let the inbox pass a week unemptied. An overflowing inbox kills the whole system.
