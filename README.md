# Leonida Legend — GTA VI Trophy Guide & Tracker

![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/billkarxyz/gta6-trophy-guide/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/billkarxyz/gta6-trophy-guide/reward.svg)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on
PlayStation 5, built for make.fun's
[Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01)
bounty (gta6-trophy-guide-01). Every trophy shows its official name,
description and grade, a guide written for this entry in its own words
with the sources behind it, and a checklist that saves progress in the
browser.

## What it covers

- **All 55 trophies**: 1 platinum, 2 gold, 6 silver, 46 bronze — 28 of
  them hidden on PlayStation, 0 online. Names, descriptions and grades
  are the official list as PlayStation publishes it (via PSNProfiles and
  Exophase, who agree on every entry).
- **A guide for every trophy**, in this entry's own words, each naming
  its sources beside it (PowerPyx's trophy guide & roadmap first of all,
  plus the Leonida Interactive trophy wiki and the PSNProfiles, Exophase
  and TrueTrophies lists). Nothing is copied from another guide.
- **The one missable trophy flagged**: Positive Mental Attitude — the
  Chapter 1 meditation at Jason's house — with a warning banner and a
  Missable filter. Every other trophy can be earned after the story.
- **A roadmap to the platinum** in three steps (story 60–80 h, 100%
  checklist ~100 h, Strangers & cleanup ~10 h), built from the official
  descriptions and PowerPyx's roadmap: which chapters and missions, which
  collectibles and counts, in what order.
- **A tracker**: tick trophies off and progress saves in localStorage;
  export it to a file and import it back. Filters by kind (story,
  missable, collectibles, activities, side missions, online), by grade,
  by search, and by roadmap order; a spoiler setting hides story trophy
  names, descriptions and guides until they are earned.

## Layout

- `app/index.html` — the page: header with the list at a glance,
  progress panel, missable warning, sticky filter bar, the checklist,
  the roadmap and the about-the-data footer.
- `app/app.js` — loads `data/trophies.json`, renders the checklist,
  filters, search, sort, the spoiler setting and the localStorage /
  export / import progress store. Vanilla JS, no libraries.
- `app/style.css` — the look: a plum-pink-orange sunset header of our
  own (no Rockstar logo or artwork anywhere), system fonts only.
- `app/data/trophies.json` — the 55 trophies: official name, description
  and grade, hidden flag, kind, missable flag, count, roadmap stage, our
  guide and its source codes.
- `main.ts` (Node 22, standard library only) hands the guide in: it
  copies `app/` and `screenshots/` to `/output` and writes
  `/output/dossier.json` with `vendor/makefun-frontend.ts`, the kit's
  copy, unchanged.

## Run it

    node serve.ts

then open http://localhost:8080. The guide works with the network off;
the only network use is a source link you choose to follow.

Run it as the grader does, writing `out/` in place of `/output`:

    mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

The rules are on the bounty's page (/bounty/gta6-trophy-guide-01) and in
the kit's RULES.txt, which gives every command in order (Before you
submit, then Enter).
