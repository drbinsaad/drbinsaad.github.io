# Patient Instructions

Bilingual (English + Arabic) patient handouts for shahrani.me.

Plain static HTML — no build step, no framework, no dependencies. Every sheet is a
single self-contained file that works offline, prints to A4, and can be opened
straight from the filesystem.

```
patient-instructions/
├── index.html    hub — lists every sheet, groups by specialty
├── sheets.js     the manifest (the only file you edit to publish)
├── bppv.html     sheet
└── README.md
```

---

## Adding a new sheet

1. Drop `your-slug.html` into this folder.
2. Add one object to the array in `sheets.js` (there's a commented template at
   the bottom of that file).
3. Commit. That's it — the hub picks it up, groups it under its specialty, and
   sorts it by `updated` date.

Set `draft: true` while a sheet is still being written. It stays out of the list
but the URL still works, so you can send it to a colleague for review.

The specialty filter chips appear automatically once there is more than one
specialty in the manifest. With a single specialty they stay hidden, so the page
doesn't look half-built while the section is small.

### Starting a new sheet

Copy `bppv.html` and replace the content. It already carries the pieces worth
keeping:

- the bilingual two-column layout with the hairline rule
- the Download-PDF dialog: the reader picks English / Arabic / both, the page
  switches to that view, `window.print()` opens the browser's save-as-PDF, and
  `afterprint` puts the reading view back. The document title is swapped first,
  because that is what names the saved file.
- print CSS (A4, `.pagebreak` before major sections, hides the nav). Note the
  A4 content box is ~695px — *narrower* than the 860px responsive breakpoint —
  so the print block re-asserts the two-column layout with `!important`, or the
  languages stack on paper and the file grows by about a third.
- the language toggle, which shares its state with the hub via `localStorage`
- the red-flag panel pattern
- the clinic block at the foot for patient name / date / follow-up

---

## Dropping this into your site

The section is framework-agnostic — it's static files. Put the folder where your
build serves static assets untouched:

| Stack | Put the folder in | Reachable at |
|---|---|---|
| Next.js | `public/patient-instructions/` | `/patient-instructions/` |
| Astro | `public/patient-instructions/` | `/patient-instructions/` |
| Hugo | `static/patient-instructions/` | `/patient-instructions/` |
| Jekyll | `patient-instructions/` at repo root | `/patient-instructions/` |
| Plain HTML / GitHub Pages | repo root | `/patient-instructions/` |

**Jekyll only:** add front matter or Jekyll will try to process the files. The
simplest fix is to list the folder under `keep_files` in `_config.yml`, or add
`patient-instructions` to `include`.

**Next.js note:** files in `public/` bypass the router entirely, so these pages
won't inherit your site's layout, nav, or fonts — which is what you want here.
A printed handout shouldn't carry site chrome. If you'd rather the hub sat
inside your Next layout, move only `index.html` into a route and leave the
sheets in `public/`.

### Link it from your nav

```html
<a href="/patient-instructions/">Patient Instructions</a>
```

Arabic label: `نشرات إرشادية للمرضى`

The hub's back-link points at `/` — change it in `index.html` if your site lives
under a subpath.

---

## Conventions worth keeping

**Both languages carry equal weight.** Arabic isn't a translation appended to the
bottom; it sits in its own column with the same type size. The layout collapses
to stacked blocks on mobile, English first.

**Warning signs get their own panel.** Red border, red heading, phrased to send
people to the emergency department rather than to reassure them. Every sheet
about a condition that can be mimicked by something dangerous should have one.

**QR codes are inline SVG**, generated at build time and embedded — nothing is
fetched from a third party at page load, and they survive printing and
photocopying. Regenerate with any QR library; verify the output decodes back to
the exact URL before publishing.

**External video links get checked before each release.** YouTube links rot.
Confirm they're live and still correctly attributed.

---

## Licensing and attribution

The sheets carry a source line naming the guidelines they follow. Keep it — it's
what lets a patient or a colleague check the advice.

Do not paste text verbatim from AAO-HNS, NHS, or Mayo patient handouts. Use the
underlying guideline facts and write the wording fresh.
