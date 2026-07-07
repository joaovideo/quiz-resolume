# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive quiz for a Resolume Arena 7 training course ("Vídeo Engenharia", class Farmarcas). Students scan a QR code, take the quiz on their phone, and scores are automatically saved to a Google Sheet. There is no build system, package manager, linter, or test suite — just three self-contained HTML files and one Google Apps Script file. All UI text is Brazilian Portuguese (pt-BR); keep it that way.

## Architecture

Three static HTML pages talk to a single Google Apps Script Web App endpoint that fronts a Google Sheet (the "database"). All requests use **JSONP** (a `jsonp()` helper injecting a `<script>` tag with a `callback` param) to avoid CORS — there is no fetch/XHR anywhere.

- **quiz.html** — the student-facing quiz. Reads `?etapa=1|2` (training stage) and `?n=` (question count: 5/10/15/20 offered, clamped to 1–50) from the URL. Questions live in the inline `BANK` constant: `{"1": [...], "2": [...]}`, 50 questions per stage, each `{q, opts: [4 strings], c: correctIndex}`. Each student gets a random subset (`shuffle().slice(0, N)`). On finish, submits via `?action=save`.
- **painel_instrutor.html** — instructor panel. Generates QR codes for both stages (only external dependency: qrcodejs from cdnjs) pointing at `QUIZ_URL?etapa=X&n=Y`, and shows the anonymous global results modal (`?action=global`: average, participation count, high/medium/low distribution per stage).
- **admin.html** — password-protected view of individual scores (`?action=admin&pass=`), CSV export (client-side Blob), and a destructive "reset" that wipes all rows (`?action=reset&pass=`).
- **backend_apps_script.gs** — the Web App. `doGet` dispatches on `?action=` (`save`, `global`, `admin`, `reset`); the last two require `pass === ADMIN_PASS`. Data lives in a sheet tab named `Respostas` with columns `Data/Hora, Nome, Turma, Etapa, Acertos, Total, Percentual`, auto-created on first use. This file is **not executed from this repo** — it must be pasted into the Apps Script editor attached to the Google Sheet and redeployed as a Web App after changes.

### Hardcoded URLs (keep in sync)

The deployed backend URL and quiz URL are hardcoded in three places. If either deployment changes, update all of them:

- `quiz.html` — `CONFIG.BACKEND_URL` (top of the `<script>`)
- `painel_instrutor.html` — `QUIZ_URL` and `BACKEND` constants
- `admin.html` — the `value=` defaults of the `#backend` and `#frontend` inputs

The quiz is published on GitHub Pages from this repo (`https://joaovideo.github.io/quiz-resolume/quiz.html`), so pushing to `main` is effectively deploying the frontend.

## Development

There are no build/test/lint commands. To try changes, open the HTML files directly in a browser (e.g. `quiz.html?etapa=1&n=5` to skip the home screen and get a short run). Testing `save`/`global`/`admin` requires the real Apps Script URL, since JSONP calls go to the deployed backend.

## Conventions and gotchas

- Each HTML file is fully self-contained: inline CSS, inline JS, and logos embedded as base64 data URIs. Some lines are tens of KB long (the `BANK` question array and base64 images are single lines) — use targeted search/replace rather than reading whole files, and don't reformat or split those lines.
- Code style is deliberately compact: single-letter helpers (`$`), global `state` object, template-literal rendering into `#main`/innerHTML, inline `onclick` handlers. Match this style rather than introducing modules, frameworks, or build tooling.
- `README_Quiz.md` is the user-facing setup guide but lags the code in places (e.g. it mentions localStorage persistence and 10-question stages; the current code hardcodes URLs as input defaults and draws from a 50-question bank). Trust the code; update the README when behavior changes.
- The admin password (`ADMIN_PASS`, default `veng2026`) lives in the backend only and is checked server-side; the HTML pages never store it.
