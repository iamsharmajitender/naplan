# NAPLAN Adventure — Year 3

A fun, interactive practice website for **Year 3 NAPLAN** preparation, designed for kids in **Melbourne, Australia**. Built for NAPLAN 2027 and aligned to the four test domains: Reading, Writing, Conventions of Language, and Numeracy.

**Not affiliated with ACARA, VCAA, or NAPLAN.** This is an independent practice resource using original content.

## Features

- **Reading Reef** — 8 Melbourne-themed reading passages with comprehension questions
- **Writing Workshop** — 12 narrative & persuasive prompts, story planner, 40-min timer, printable prompts
- **Language Lagoon** — Spelling bee, grammar quiz, punctuation game, word scramble
- **Number Neighbourhood** — Maths quiz, milk bar shop game, shapes, graphs, number line
- **Progress tracking** — Stars, badges, and streaks saved in the browser (no login)
- **Parent mode** — Toggle parent tips on any page

## Try it locally

```bash
cd naplan
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080)

> A local server is needed because quizzes load JSON data via `fetch`.

## Host on GitHub Pages

1. Create a new GitHub repository (e.g. `naplan`)
2. Push this folder to the repo:

```bash
git init
git add .
git commit -m "Add NAPLAN Adventure Year 3 practice site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/naplan.git
git push -u origin main
```

3. Go to **Settings → Pages**
4. Under **Build and deployment**, set **Source** to **GitHub Actions**
5. The workflow in `.github/workflows/pages.yml` will deploy automatically on push

Your site will be live at:

`https://YOUR_USERNAME.github.io/naplan/`

## Project structure

```
naplan/
├── index.html              # Adventure map home page
├── reading.html            # Reading activities
├── writing.html            # Writing prompts & planner
├── language.html           # Spelling, grammar, punctuation
├── numeracy.html           # Maths games & quiz
├── progress.html           # Stars, badges, streaks
├── assets/css/style.css
├── assets/js/progress.js   # Progress & badges
├── assets/js/app.js        # Games & quizzes
└── data/                   # Question banks (JSON)
```

## Adding more questions

Edit the JSON files in `data/`:

- `reading-year3.json` — passages and multiple-choice questions
- `numeracy-year3.json` — maths questions
- `grammar-year3.json` — grammar questions
- `spelling-year3.json` — spelling words with hints

## Official NAPLAN resources

- [NAPLAN parent information](https://www.nap.edu.au/naplan/parent-carer-support)
- [VCAA NAPLAN (Victoria)](https://www.vcaa.vic.edu.au/assessment/foundation-10/naplan)

## Licence

Free for personal and educational use.
