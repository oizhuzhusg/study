# Deployment Flow

This project is designed for:

```text
local development -> git push -> Cloudflare Workers Builds -> staging/production Worker
```

## 1. Local

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Add `OPENAI_API_KEY` to `.dev.vars` for real photo transcription and grading.

## 2. Git

Initialize the repository:

```bash
git init
git add .
git commit -m "Initial Chem Coach MVP"
```

Create branches:

```bash
git branch -M main
git checkout -b develop
```

Add GitHub remote:

```bash
git remote add origin git@github.com:<your-org-or-user>/chem-coach.git
git push -u origin main
git push -u origin develop
```

## 3. Cloudflare Worker

In Cloudflare Dashboard:

```text
Workers & Pages
-> Create application
-> Worker
-> Import a repository
-> Select the chem-coach GitHub repository
```

Use:

```text
Production branch: main
Build command: npm run check
Deploy command: npx wrangler deploy --env production
```

Enable non-production branch builds:

```text
Non-production branches: develop
Non-production deploy command: npx wrangler deploy --env staging
```

## 4. Secrets

Set:

```bash
npx wrangler secret put OPENAI_API_KEY --env staging
npx wrangler secret put OPENAI_API_KEY --env production
```

You can also set these secrets in the Cloudflare dashboard for each Worker environment.

## 5. D1 Persistence, Later

The MVP works without D1. When ready:

```bash
npx wrangler d1 create chem-coach-db
```

Add the D1 binding to `wrangler.jsonc`, then run:

```bash
npx wrangler d1 migrations apply chem-coach-db --local
npx wrangler d1 migrations apply chem-coach-db --remote --env staging
npx wrangler d1 migrations apply chem-coach-db --remote --env production
```

Keep photo storage separate. If you want answer photo review later, add R2 and store only the images the parent/student chooses to keep.
