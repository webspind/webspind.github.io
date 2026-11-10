# -*- coding: utf-8 -*-
"""Freezes the data behind the three free exam tools into assets/exam/*.json.

Run this only when an app's question bank or the hunting-season order changes;
build-pages.py inlines the frozen files, so the site never reads the app repos.

  part107-free.json   the 40 questions that are free in DroneCamp (tier == "free")
  jagtquiz.json       a 40-question sample of Jagtprøven, leaving out everything the
                      7 Nov 2026 audit left open or weakly sourced (see EXCLUDE)
  jagttider.json      BEK 470/2024 bilag 1-4 as the app has it, plus the extra rules
                      that bilag 1 states outside its plain date column

Paid questions never enter these files. No fact is added here that is not in the
app's data or in the law text."""
import io, json, os, random, re

APPS = os.path.join("..", "..", "Apps")
JP = os.path.join(APPS, "Jagtproven")
OUT = os.path.join("assets", "exam")

# Date the season data was compared with the live order and the hearing page.
CHECKED = "2026-11-10"


def load(*path):
    return json.load(io.open(os.path.join(*path), encoding="utf-8"))


def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    with io.open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("  wrote %-20s %6d bytes" % (name, os.path.getsize(os.path.join(OUT, name))))


# ---------------------------------------------------------------- Part 107

def part107():
    bank = load(APPS, "Loftpass", "Loftpass", "Resources", "Content", "questions.json")
    areas = {a["id"]: a["title"] for a in bank["areas"]}
    free = [q for q in bank["questions"] if q["tier"] == "free"]
    assert len(free) == 40 and all(q["figure"] is None for q in free)
    save("part107-free.json", {
        "rulesAsOf": bank["rulesAsOf"],
        "questions": [{"id": q["id"], "topic": areas[q["area"]], "prompt": q["prompt"],
                       "options": q["options"], "correct": q["correct"],
                       "explanation": q["explanation"], "source": q["source"]} for q in free],
    })


# ---------------------------------------------------------------- Jagtprøven quiz

SECTIONS = {"A": "Jagtlovgivning", "C": "Vildtbiologi, jagt og vildtforvaltning",
            "D": "Jagtvåben og ammunition", "E": "Etik, jagtteknik og -ledelse", "F": "Sikkerhedskrav"}
# Section B is species identification from photos, which needs the app's pictures.
QUOTA = {"A": 13, "C": 10, "D": 6, "E": 8, "F": 3}

# From Docs/question-audit-7nov.md: section 1 (wrong or corrected on the live app),
# section 3 (no clean rewrite), section 5 and 6 (open, duplicate, outside the syllabus),
# section 8 (weakly sourced). Corrected ones are left out too, to keep the sample clear
# of anything still waiting for Jakob's sign-off.
EXCLUDE = set("""T-236 T-214 T-003 A-050 A-023 F-007 F-004 E-014 T-028 A-028 T-225 E-123
T-634 T-639 T-701 T-032 T-540 T-116 A-054 C-007 C-024 C-028 D-016 D-019 E-018 E-109 E-132 F-002 F-009 F-014 H-011
T-511 T-532 C-008 T-425 A-027 C-034 T-429 T-518 T-134 T-135 T-136 T-140 D-026 D-027 H-038
T-216 T-428 D-025 T-110 H-016 T-213 T-205 T-211 T-220 T-405 T-409 T-424 C-018 T-411""".split())

# Species whose dates the hearing draft would change, and options that lean on their
# position in a list (the quiz shuffles the options).
STALE_RISK = re.compile(r"edderfugl|ederfugl|ringdue|\bhare|canadagås|kanadagås|kronvildt|kronhjort|kronhind|kronkalv|dåvildt|dåhjort|\bdåkalv", re.I)
POSITIONAL = re.compile(r"ovenstående|begge|alle (de )?nævnte|ingen af", re.I)
GENERIC_SOURCE = re.compile(r"^jagttegnspensum", re.I)


def jagtquiz():
    bank = load(JP, "Jagtproven", "Resources", "questions.json")["questions"]
    reviews = load(JP, "Tools", "question-audit", "reviews.json")["reviews"]

    def usable(q):
        text = " ".join([q["prompt"], q["explanation"]] + [o["text"] for o in q["options"]])
        return (q["id"] not in EXCLUDE and q["section"] in QUOTA and not q["image"]
                and not reviews.get(q["id"], {}).get("factRisk")
                and not STALE_RISK.search(text)
                and not POSITIONAL.search(" ".join(o["text"] for o in q["options"]))
                and not GENERIC_SOURCE.search(q["source"] or "jagttegnspensum"))

    pool = [q for q in bank if usable(q)]
    rng = random.Random(107)  # fixed, so a rebuild picks the same sample
    picked = []
    for section, n in QUOTA.items():
        chosen = [q for q in pool if q["section"] == section]
        rng.shuffle(chosen)
        picked += chosen[:n]
    assert len(picked) == sum(QUOTA.values()), len(picked)
    save("jagtquiz.json", {
        "questions": [{"id": q["id"], "topic": SECTIONS[q["section"]], "prompt": q["prompt"],
                       "options": q["options"], "correct": q["correct"], "keepOrder": q["kind"] == "yesNo",
                       "explanation": q["explanation"], "source": q["source"]} for q in picked],
    })
    return picked


# ---------------------------------------------------------------- jagttider

GROUP_TITLES = {"hovdyr": "Hovdyr", "rovdyr": "Rovdyr", "stoettetandede": "Støttetandede", "andefugle": "Andefugle",
                "hoensefugle": "Hønsefugle", "vandhoens": "Vandhøns", "vadefugle": "Vadefugle", "maager": "Måger",
                "duer": "Duer", "kragefugle": "Kragefugle", "invasive": "Invasive arter"}

# The app's species notes that are rules, as opposed to study tips.
KEEP_NOTE = re.compile(r"^(Råvildt må ikke|Kun hannen|Ingen jagttid i de fuglebeskyttelses|Må jages fra 1 time)")

LAND = ("Kun på omdriftsarealer og i læhegn, grøfter og lignende, der grænser op til dem. Ikke inden for 300 meter "
        "fra daglig højeste vandstandslinje ved hav og fjord og fra søer større end 3 hektar (bilag 1).")
COAST = "Kun på fiskeriterritoriet i januar (bilag 1)."
SWIM = ["graaand", "krikand", "pibeand", "spidsand", "atlingand", "skeand", "knarand"]
EXTRA = {i: [{"start": "01-01", "end": "01-31", "cond": COAST}] for i in SWIM}
EXTRA["graagaas"] = EXTRA["kanadagaas"] = [{"start": "08-01", "end": "08-31", "cond": LAND}]
# Only when no area is chosen: with an area, the local rows decide.
EXTRA["saedgaas"] = [{"start": "09-01", "end": "11-30", "noArea": True,
                      "cond": "Ingen generel jagttid. Kun i Vordingborg, Guldborgsund og Lolland kommuner (bilag 2)."}]

# Høringsbrev from SGAV, 5 Nov 2026, j.nr. 2026-913. Not law unless it is adopted.
DRAFT = {"date": "2027-02-01", "species": {
    "hare": "Høringsudkastet vil lade jagttiden slutte 15. januar i hele landet og ophæve fredningen på Endelave.",
    "kanadagaas": "Høringsudkastet vil udvide jagttiden, så den også omfatter februar.",
    "ringdue": "Høringsudkastet vil lade jagttiden starte 1. oktober. I oktober og november skal jagten ske på flokke.",
    "edderfugl": "Høringsudkastet vil indstille jagttiden.",
    "kronvildt": "Høringsudkastet ændrer de lokale jagttider for kronvildt.",
    "daavildt": "Høringsudkastet ændrer de lokale jagttider for dåvildt.",
}}


def jagttider():
    general = load(JP, "Jagtproven", "Resources", "seasons_bek470_2024.json")
    regional = load(JP, "Jagtproven", "Resources", "seasons_regional_bek470_2024.json")
    save("jagttider.json", {
        "checked": CHECKED,
        "validFrom": general["validFrom"],
        "groups": GROUP_TITLES,
        "species": [{"id": e["speciesID"], "name": e["name"], "group": e["group"], "periods": e["periods"],
                     "extra": EXTRA.get(e["speciesID"], []),
                     "notes": [n for n in e["notes"] if KEEP_NOTE.match(n)],
                     "regionalNotes": e["regionalNotes"]} for e in general["entries"]],
        "blocks": regional["blocks"],
        "areas": regional["areas"],
        "draft": DRAFT,
    })


if __name__ == "__main__":
    part107()
    picked = jagtquiz()
    jagttider()
    print("  quiz sample:", " ".join(q["id"] for q in picked))
