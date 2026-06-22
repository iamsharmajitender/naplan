# NAPLAN Adventure — Year 3

A fun, interactive practice website for **Year 3 NAPLAN** preparation, built for kids in **Melbourne, Australia** (NAPLAN 2027).

**Live site:** [https://iamsharmajitender.github.io/naplan/](https://iamsharmajitender.github.io/naplan/)


> **Not affiliated with ACARA, VCAA, or NAPLAN.** This is an independent practice resource with original content styled to match the real test areas.

---

## What is this site?

**NAPLAN Adventure** helps Year 3 students practise literacy and numeracy in a kid-friendly way — without feeling like a stressful cram app. Kids explore four learning “worlds” plus a game zone, earn stars and badges, and get cheered on with confetti and encouragement after every correct answer.

On first visit, children enter their name to start a session. Progress (stars, badges, streaks) is saved in the browser — no login required.

### Learning areas (aligned to NAPLAN Year 3)

| Area | What it covers |
|------|----------------|
| **Reading Reef** | Melbourne-themed stories with comprehension questions |
| **Writing Workshop** | Narrative & persuasive prompts, story planner, 40-min timer (matches paper writing test) |
| **Language Lagoon** | Spelling, grammar, punctuation — Conventions of Language |
| **Number Neighbourhood** | Number, money, shapes, graphs — Numeracy |
| **Game Zone** | Tic Tac Toe and Snakes & Ladders for fun breaks |
| **Progress** | Stars, badges, day streaks, and per-subject progress |

### Extra features

- **Parent tips** toggle on every page
- **Personalised encouragement** — graffiti, stars, superhero emojis, and confetti on correct answers
- **Randomised questions** — order shuffles each session
- **Mobile & tablet friendly** — works on iPad and laptop

---

## Run locally

A local server is required because quizzes load question data from JSON files.

```bash
cd naplan
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

**Alternative (Node.js):**

```bash
npx serve .
```

---

## Deploy on GitHub Pages

This project is already set up for GitHub Pages via GitHub Actions (`.github/workflows/pages.yml`).

1. Push changes to the `main` branch
2. In the repo go to **Settings → Pages → Source: GitHub Actions**
3. The site deploys automatically after each push

**Live URL:** [https://iamsharmajitender.github.io/naplan/](https://iamsharmajitender.github.io/naplan/)

---

## Project structure

```
naplan/
├── index.html              # Home — adventure map
├── reading.html            # Reading activities
├── writing.html            # Writing prompts & planner
├── language.html           # Spelling, grammar, punctuation
├── numeracy.html           # Maths games & quiz
├── games.html              # Tic Tac Toe & Snakes & Ladders
├── progress.html           # Stars, badges, streaks
├── assets/
│   ├── css/style.css
│   ├── css/games.css
│   └── js/
│       ├── progress.js     # Session, progress, cheers
│       ├── app.js          # Quizzes & activities
│       └── games.js        # Board games
└── data/                   # Question banks (JSON)
```

---

## Adding more questions

Edit the JSON files in `data/`:

- `reading-year3.json` — passages and multiple-choice questions
- `numeracy-year3.json` — maths questions
- `grammar-year3.json` — grammar questions
- `spelling-year3.json` — spelling words with hints

---

## Official NAPLAN resources

- [NAPLAN parent information](https://www.nap.edu.au/naplan/parent-carer-support)
- [VCAA NAPLAN (Victoria)](https://www.vcaa.vic.edu.au/assessment/foundation-10/naplan)

---

## Licence

Free for personal and educational use.
