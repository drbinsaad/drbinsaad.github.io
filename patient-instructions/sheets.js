/* ---------------------------------------------------------------------------
   Patient instruction sheets — manifest
   ---------------------------------------------------------------------------
   This is the ONLY file you edit when you publish a new sheet.
   Add an object to the array below, drop the .html file in this folder, done.

   Fields
     slug      required  file name without .html  ->  "bppv" loads bppv.html
     title     required  { en, ar }
     summary   required  { en, ar }   one line, plain language
     specialty required  { en, ar }   used to group the cards
     updated   required  "YYYY-MM-DD" shown on the card and used for sorting
     langs     optional  ["en","ar"]  defaults to ["en","ar"]
     tags      optional  [{ en, ar }] small chips, e.g. exercises / video
     draft     optional  true  -> hidden from the list, file still reachable
--------------------------------------------------------------------------- */

window.SHEETS = [

  {
    slug: "bppv",
    title: {
      en: "Benign Paroxysmal Positional Vertigo (BPPV)",
      ar: "دوار الوَضْعة الانتيابي الحميد"
    },
    summary: {
      en: "What BPPV is, the warning signs that need urgent care, and how to do the Epley, Brandt-Daroff, Semont and half-somersault exercises at home.",
      ar: "ما هو دوار الوضعة، وعلامات الإنذار التي تستدعي رعاية عاجلة، وكيفية أداء تمارين إيبلي وبراندت-داروف وسيمونت ونصف الشقلبة في المنزل."
    },
    specialty: { en: "Otology & Balance", ar: "الأذن والاتزان" },
    updated: "2026-08-19",
    langs: ["en", "ar"],
    tags: [
      { en: "Home exercises", ar: "تمارين منزلية" },
      { en: "Video demos",    ar: "فيديوهات توضيحية" },
      { en: "Printable",      ar: "قابلة للطباعة" }
    ]
  }

  /* ------------------------------------------------------------------------
     Template — copy, uncomment, fill in:

  ,{
    slug: "tonsillectomy-aftercare",
    title:     { en: "After a tonsillectomy",  ar: "بعد استئصال اللوزتين" },
    summary:   { en: "…", ar: "…" },
    specialty: { en: "Paediatric ENT", ar: "أنف وأذن وحنجرة الأطفال" },
    updated:   "2026-09-01",
    tags: [{ en: "Printable", ar: "قابلة للطباعة" }],
    draft: true
  }
  ------------------------------------------------------------------------ */

];
