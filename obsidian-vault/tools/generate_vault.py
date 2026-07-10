#!/usr/bin/env python3
"""
generate_vault.py — build the ENT knowledge vault from the study curriculum Excel.

Reads a curriculum spreadsheet (study_v3.xlsx) whose rows are:
  * a SECTION header       — column C == "Go to sheet" (e.g. "Otology")
  * a numbered TOPIC       — column A has a number, column B is not indented
  * an indented SUBTOPIC   — column A empty, column B begins with spaces

and emits, under <vault>/ :
  * one folder per section          "01 Pediatric/" ... "08 Trauma/"
  * one concept note per topic       with YAML frontmatter + subtopic checklist
  * one Map-of-Content per section    "<Section> MOC.md" linking its topics

Design notes (from the LLM-council-reviewed plan):
  * Notes are the deliverable; this script is provenance. The user never has to run it.
  * IDEMPOTENT: an existing note is only rewritten while it is still an untouched stub
    (frontmatter `status: untouched` AND the generator marker is present). Once the
    doctor edits a note (or bumps its status), the script leaves it alone.
  * No third-party libraries — the .xlsx is unzipped and parsed with the stdlib so it
    runs anywhere Python 3 is available.

Usage:
    python3 generate_vault.py --excel study_v3.xlsx --out ../vault
"""

from __future__ import annotations

import argparse
import os
import re
import zipfile
from xml.etree import ElementTree as ET

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# Marker written into every generated stub so we can tell "untouched stub" (safe to
# regenerate) from "note the user has started" (never touch).
GEN_MARKER = "<!-- generated-stub: safe to regenerate while status is untouched -->"

STATUS_VALUES = ["untouched", "learning", "solid", "mastered"]


def col_letters(ref: str) -> str:
    """'B12' -> 'B'."""
    return re.match(r"[A-Z]+", ref).group(0)


def read_rows(xlsx_path: str):
    """Yield dicts {column_letter: value} for each row of the first worksheet."""
    with zipfile.ZipFile(xlsx_path) as z:
        shared = [
            "".join(t.text or "" for t in si.iter(NS + "t"))
            for si in ET.parse(z.open("xl/sharedStrings.xml")).getroot()
        ]
        sheet = ET.parse(z.open("xl/worksheets/sheet1.xml")).getroot()
        for row in sheet.iter(NS + "row"):
            vals = {}
            for c in row.iter(NS + "c"):
                v = c.find(NS + "v")
                if v is None:
                    continue
                text = shared[int(v.text)] if c.get("t") == "s" else v.text
                vals[col_letters(c.get("r"))] = text
            if vals:
                yield vals


def parse_curriculum(xlsx_path: str):
    """Return [ {no, name, topics:[{no, name, subtopics:[...]}]} ] in sheet order."""
    sections = []
    section = None
    topic = None
    for vals in read_rows(xlsx_path):
        a = (vals.get("A") or "").strip()
        b = vals.get("B") or ""
        goto = vals.get("C")

        if goto == "Go to sheet":  # section header
            section = {"no": len(sections) + 1, "name": b.strip(), "topics": []}
            sections.append(section)
            topic = None
        elif a and b.strip() and not b.startswith("  "):  # numbered topic
            if section is None:
                continue
            topic = {"no": a, "name": b.strip(), "subtopics": []}
            section["topics"].append(topic)
        elif not a and b.startswith("  ") and b.strip():  # indented subtopic
            if topic is not None:
                topic["subtopics"].append(b.strip())
        # header row / blanks ignored
    return sections


def slug(name: str) -> str:
    """Filesystem-safe note title (Obsidian links still use the display title)."""
    s = name.replace("/", "-").replace("\\", "-").replace(":", " -")
    s = re.sub(r'[<>"|?*]', "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def yaml_list(items):
    if not items:
        return "[]"
    return "\n" + "\n".join(f"  - {i}" for i in items)


def concept_note(section_name: str, topic_no: str, title: str, subtopics) -> str:
    """A downstream-ready concept note: atomic headings so it can later feed
    Anki cards, teaching slides, or a website article without restructuring."""
    subs_yaml = yaml_list([s.replace('"', "'") for s in subtopics])
    checklist = (
        "\n".join(f"- [ ] {s}" for s in subtopics)
        if subtopics
        else "_No subtopics listed in the curriculum._"
    )
    tag_section = section_name.lower().replace(" & ", "-").replace(" ", "-")
    return f"""---
section: {section_name}
topic_no: {topic_no}
status: untouched
sources: []
tags:
  - ent
  - {tag_section}
---
{GEN_MARKER}

# {title}

> Status: `untouched` → `learning` → `solid` → `mastered`. Bump the `status`
> property above as you study. Part of [[{section_name} MOC]].

## Subtopics to cover
{checklist}

## Definition


## Mechanism / Pathophysiology


## Clinical features


## Investigations


## Staging / Classification


## Management


## Pearls & pitfalls


## Sources
<!-- Paste the video/lecture/paper/conference link here as you learn, or add a
     full [[source note]] in "09 Sources" for papers worth a citation. -->
"""


def section_moc(section: dict) -> str:
    lines = [
        f"# {section['name']} MOC",
        "",
        f"Map of Content for **{section['name']}** — {len(section['topics'])} topics. "
        "Part of [[Home]].",
        "",
        "See the live progress board in [[Dashboard]] (filtered to this section).",
        "",
        "## Topics",
    ]
    for t in section["topics"]:
        lines.append(f"{t['no']}. [[{slug(t['name'])}]]")
    lines.append("")
    return "\n".join(lines)


def is_regenerable(path: str) -> bool:
    """True if the file is missing or still an untouched generated stub."""
    if not os.path.exists(path):
        return True
    with open(path, encoding="utf-8") as f:
        content = f.read()
    return GEN_MARKER in content and re.search(
        r"^status:\s*untouched\s*$", content, re.MULTILINE
    ) is not None


def write_if_regenerable(path: str, content: str, stats: dict):
    if is_regenerable(path):
        existed = os.path.exists(path)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        stats["updated" if existed else "created"] += 1
    else:
        stats["skipped"] += 1


def generate(xlsx_path: str, out_dir: str):
    sections = parse_curriculum(xlsx_path)
    stats = {"created": 0, "updated": 0, "skipped": 0}
    for section in sections:
        folder = os.path.join(out_dir, f"{section['no']:02d} {slug(section['name'])}")
        # section MOC is always regenerated (it is pure index, never hand-edited)
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, f"{slug(section['name'])} MOC.md"), "w",
                  encoding="utf-8") as f:
            f.write(section_moc(section))
        for topic in section["topics"]:
            note_path = os.path.join(folder, f"{slug(topic['name'])}.md")
            write_if_regenerable(
                note_path,
                concept_note(section["name"], topic["no"], topic["name"],
                             topic["subtopics"]),
                stats,
            )
    total_topics = sum(len(s["topics"]) for s in sections)
    print(f"Sections: {len(sections)}  Topics: {total_topics}")
    print(f"Notes created: {stats['created']}  regenerated stubs: {stats['updated']}  "
          f"left untouched (user content): {stats['skipped']}")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("--excel", default=os.path.join(here, "study_v3.xlsx"),
                    help="Path to the curriculum .xlsx (default: tools/study_v3.xlsx)")
    ap.add_argument("--out", default=os.path.join(here, "..", "vault"),
                    help="Vault output directory (default: ../vault)")
    args = ap.parse_args()
    generate(args.excel, os.path.abspath(args.out))


if __name__ == "__main__":
    main()
