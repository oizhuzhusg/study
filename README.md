# Chem Coach for NUSH

AI Chemistry tutor for NUSH `CM2131 Foundations in Chemistry II`.

The first MVP is a complete vertical slice for **Sec 1 Chemistry Foundations** and **Precipitation Reactions**:

- concept explanation
- diagnostic and practice questions
- typed answers
- handwritten photo upload
- OpenAI Vision transcription
- rubric-based grading
- mastery updates
- adaptive next question selection
- Cloudflare Worker deployment

## User Guide

See [docs/user-guide.md](docs/user-guide.md) for the parent/student usage guide.

## Local Setup

Install dependencies:

```bash
npm install
```

Create local secrets:

```bash
cp .dev.vars.example .dev.vars
```

Add your OpenAI key to `.dev.vars`:

```text
OPENAI_API_KEY=sk-...
OPENAI_TRANSCRIBE_MODEL=gpt-4.1-mini
OPENAI_GRADING_MODEL=gpt-4.1-nano
OPENAI_GENERATION_MODEL=gpt-4.1-nano
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:8787
```

If `OPENAI_API_KEY` is not configured, the app still runs in demo mode. Photo transcription returns the expected answer so the learning loop can be tested without spending API credits. Photo transcription, grading, and generated variants can use different models; transcription defaults to `gpt-4.1-mini`, while grading and generation default to `gpt-4.1-nano`.

## Scripts

```bash
npm run dev
npm run check
npm run deploy:staging
npm run deploy:production
```

## Private Materials Indexing

School materials should stay outside this repository, for example:

```text
/Users/zhuk/Documents/Codex/nush-materials
```

Create a local-only manifest without network access:

```bash
/Users/zhuk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/index_nush_materials.py --materials-dir /Users/zhuk/Documents/Codex/nush-materials
```

This writes `data/materials-local-index.json`, which is ignored by git and is not deployed. It only records metadata such as PDF names, page counts, and sampled page numbers.

Run local OCR only with the project OCR virtual environment:

```bash
.venv-ocr/bin/python scripts/index_nush_materials.py --materials-dir /Users/zhuk/Documents/Codex/nush-materials --local-ocr rapidocr
```

This still does not call OpenAI or the network. It writes extracted page images to `data/materials-page-images/`, OCR text to `data/materials-ocr-text/`, and the private index to `data/materials-local-index.json`. The entire `data/` folder is ignored by git.

The default samples 3 pages per PDF for quick indexing. For a full local OCR pass, increase the sample size, for example `--pages-per-pdf 999`.

The deployed app uses only the derived, publishable material index in `src/shared/materials-index.js`. That file contains high-level topic summaries, question patterns, common traps, and skill links; it does not contain raw OCR text or page images.

If the OCR virtual environment needs to be recreated:

```bash
/Users/zhuk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -m venv .venv-ocr
.venv-ocr/bin/python -m pip install rapidocr-onnxruntime pypdf
```

Only with explicit consent, allow OpenAI Vision OCR:

```bash
/Users/zhuk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/index_nush_materials.py --materials-dir /Users/zhuk/Documents/Codex/nush-materials --use-openai
```

Do not add `--write-public-js` unless the extracted summaries are safe to commit and deploy. The script blocks `--write-public-js` for local-only and local OCR modes so private school material is not accidentally committed.

## Cloudflare Secrets

Set secrets once per environment:

```bash
npx wrangler secret put OPENAI_API_KEY --env staging
npx wrangler secret put OPENAI_API_KEY --env production
```

The frontend never sees the OpenAI key. Browser requests go to the Worker API.

## Cloudflare Builds

Recommended branch flow:

```text
develop -> chem-coach-staging
main    -> chem-coach
```

Cloudflare Workers Build settings:

```text
Install command: npm install
Build command: npm run check
Deploy command: npx wrangler deploy --env production
Non-production branch deploy command: npx wrangler deploy --env staging
```

## Data Storage

The MVP uses browser `localStorage` for mastery so it works immediately.

`migrations/0001_init.sql` is included for the next step: adding Cloudflare D1 persistence for students, sessions, attempts, and mastery.

## API

```text
GET  /api/health
GET  /api/version
GET  /api/topics
POST /api/session/start
POST /api/tutor/explain
POST /api/question/next
POST /api/question/generate
POST /api/answer/transcribe-photo
POST /api/answer/grade
GET  /api/mastery
GET  /api/questions
```

## First MVP Acceptance

- Open the app locally.
- Start the Precipitation Reactions session.
- Submit a typed answer and receive rubric feedback.
- Upload a handwritten answer photo and confirm the transcription.
- See mastery bars update.
- Move to the next question selected from weak skills.
- Deploy the same Worker to Cloudflare staging.
