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

Add `OPENAI_API_KEY` to `.dev.vars` for real photo transcription and grading. Optional model overrides:

```text
OPENAI_TRANSCRIBE_MODEL=gpt-4.1-mini
OPENAI_GRADING_MODEL=gpt-4.1-nano
```

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

## 3. Cloudflare Workers Builds

This project uses Cloudflare Workers, not Cloudflare Pages. The closest equivalent to a Git-backed Pages project is Cloudflare Workers Builds.

Use two Workers Builds connections:

```text
chem-coach          listens to main
chem-coach-staging  listens to develop
```

Recommended build settings:

```text
Repository: oizhuzhusg/study
Root directory: /
Build command: npm run check
Production deploy command for chem-coach: npm run deploy:production
Production deploy command for chem-coach-staging: npm run deploy:staging
```

Why two Workers instead of one Pages-style project:

```text
chem-coach is the real production Worker.
chem-coach-staging is a separate staging Worker.
Each Worker should have its own Git connection and branch.
```

Dashboard setup:

```text
Cloudflare Dashboard
-> Workers & Pages
-> chem-coach
-> Settings
-> Builds
-> Connect
-> GitHub
-> oizhuzhusg/study
-> Branch: main
-> Root directory: /
-> Build command: npm run check
-> Deploy command: npm run deploy:production
```

Then repeat for staging:

```text
Cloudflare Dashboard
-> Workers & Pages
-> chem-coach-staging
-> Settings
-> Builds
-> Connect
-> GitHub
-> oizhuzhusg/study
-> Branch: develop
-> Root directory: /
-> Build command: npm run check
-> Deploy command: npm run deploy:staging
```

The GitHub account and repository IDs are:

```text
provider_account_id: 263253517
provider_account_name: oizhuzhusg
repo_id: 1247554072
repo_name: study
```

If using the Workers Builds API instead of the dashboard, first authorize the Cloudflare Workers and Pages GitHub App, then create a repository connection:

```json
{
  "provider_type": "github",
  "provider_account_id": "263253517",
  "provider_account_name": "oizhuzhusg",
  "repo_id": "1247554072",
  "repo_name": "study"
}
```

Production trigger body:

```json
{
  "external_script_id": "<chem-coach worker tag>",
  "repo_connection_uuid": "<repo connection uuid>",
  "build_token_uuid": "<build token uuid>",
  "trigger_name": "Deploy chem-coach production",
  "build_command": "npm run check",
  "deploy_command": "npm run deploy:production",
  "root_directory": "/",
  "branch_includes": ["main"],
  "branch_excludes": [],
  "path_includes": ["*"],
  "path_excludes": []
}
```

Staging trigger body:

```json
{
  "external_script_id": "<chem-coach-staging worker tag>",
  "repo_connection_uuid": "<repo connection uuid>",
  "build_token_uuid": "<build token uuid>",
  "trigger_name": "Deploy chem-coach staging",
  "build_command": "npm run check",
  "deploy_command": "npm run deploy:staging",
  "root_directory": "/",
  "branch_includes": ["develop"],
  "branch_excludes": [],
  "path_includes": ["*"],
  "path_excludes": []
}
```

After creating each trigger, manually trigger one first build for `main` and `develop`. Future pushes will deploy automatically.

## 4. Existing Workers

This repository currently deploys to two existing Workers:

```text
chem-coach
chem-coach-staging
```

If recreating the project from scratch, deploy each Worker once before connecting Git:

```bash
npm run deploy:production
npm run deploy:staging
```

## 5. Secrets

Set:

```bash
npx wrangler secret put OPENAI_API_KEY --env staging
npx wrangler secret put OPENAI_API_KEY --env production
```

You can also set these secrets in the Cloudflare dashboard for each Worker environment.

## 6. D1 Persistence, Later

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
