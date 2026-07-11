# 🔁 Flashcards & revision

Notes retain nothing on their own — **active recall** does. This vault is built so a topic note
*doubles* as a flashcard source: write once, revise forever. Requires the **Spaced Repetition**
plugin (`obsidian-spaced-repetition`) — see [[Plugins & setup]].

## Write cards inside your normal notes
Add these lines under **## Notes** in any concept note. They stay readable as prose *and* become
cards.

```
Cholesteatoma is keratinising squamous epithelium in the ==middle ear==.

Most common presenting symptom of cholesteatoma?::Painless foul-smelling otorrhoea

Classic otoscopy finding?::Attic retraction pocket / crust
```

- `==highlight==` → a **cloze** card (the highlighted words are hidden).
- `Question::Answer` → a **basic** card. `Question:::Answer` → also reversed.
- Tag high-yield cards so you can drill a subset: add `#flashcard/otology` to the note.

Then: command palette → **Spaced Repetition: Review flashcards**. Cards schedule themselves.

## Exam mode: high-yield first
Set `high_yield: true` in a note's properties for exam-critical topics. The **High-yield** view on
[[Home]] becomes your revision queue — drill those notes' cards before the exam.

## Prefer Anki? (optional)
For high-volume board decks and image-occlusion (anatomy), install `obsidian-to-anki-plugin`,
enable AnkiConnect, add `app://obsidian.md` to its `webCorsOriginList`, and let Anki own the
scheduling while Obsidian stays your source of truth. Use `{{c1::...}}` cloze syntax for Anki.

## The rhythm
1. Capture a source into the topic note (the 3-minute loop).
2. While it's fresh, add 1–3 `::` or `==cloze==` lines.
3. Review a few minutes most days. Bump `status` toward `mastered` as recall gets solid.
