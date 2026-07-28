# SCRUM-101 Checkout Test Report — Streamlit Dashboard

Interactive dashboard for the SauceDemo checkout automation results
(`tests/saucedemo-checkout/`). Reads from `data/test_results.json`.

## Run locally

```bash
pip install -r streamlit_app/requirements.txt
streamlit run streamlit_app/app.py
```

Opens at http://localhost:8501.

## Updating the data

`data/test_results.json` is a static snapshot of the most recent
Playwright run. After regenerating and re-running the suite, update this
file's `summary`, `tests`, and `defects` sections to match the new
results, then redeploy (Streamlit Community Cloud auto-redeploys on push
to `main`).

## Deploying to Streamlit Community Cloud

1. Go to https://share.streamlit.io and sign in with GitHub.
2. Click **"New app"**.
3. Repository: `pinisriram-source/OpencartAutomation`, branch: `main`.
4. Main file path: `streamlit_app/app.py`.
5. Click **Deploy**.

The app is public by default under Community Cloud's free tier.

## Login authentication

The whole app sits behind a login form — the entire dashboard, not just the
forms that can trigger GitHub Actions runs or commit to the repo. Fails
**closed**: if the credentials below aren't configured, the app refuses to
render anything at all (an error screen, not the dashboard) rather than
silently staying open.

**Add as Streamlit secrets:**

```toml
APP_USERNAME = "choose-a-username"
APP_PASSWORD = "choose-a-strong-password"
```

- **Streamlit Community Cloud:** app page → **Manage app** → **Settings** →
  **Secrets**, same place as `GITHUB_TOKEN` below.
- **Local run:** create `.streamlit/secrets.toml` at the repo root (already
  gitignored — never commit this file) with the same content, then run
  `streamlit run streamlit_app/app.py` from the repo root (not from inside
  `streamlit_app/` — secrets resolve relative to the current working
  directory, not the script's location).

Login is session-only (`st.session_state`, same as the Google sign-in
below) — a hard refresh after the server restarts, or a new browser
session, requires logging in again. A **Log out** button is in the
sidebar once signed in.

## "Submit New Request" tab — GitHub token setup

The **Submit New Request** tab lets a visitor commit a new file to
`user-stories/` in this repo (title, application URL, optional demo
credentials, and pasted/uploaded requirements text), then triggers a
`workflow_dispatch` run of the **existing** `.github/workflows/saucedemo-checkout.yml`
suite (the already-generated, already-reviewed 68-test SauceDemo checkout
suite) on GitHub Actions.

It deliberately does **not** run AI-driven test *generation* against the
submitted URL/requirements text. This form is public and unauthenticated,
so letting anonymous input drive an autonomous agent that writes and commits
new code would be a real prompt-injection/abuse risk. Turning a new
submitted requirement into a new test plan + suite still needs a human (or
Claude Code, in a reviewed session) to read the request file and run the
plan → generate → execute workflow manually — the same way SCRUM-101 was
built.

This requires a GitHub token with **write access to this repo's contents
AND the ability to trigger workflow runs**, provided via Streamlit secrets
— never hardcoded in the code.

**Create the token** (fine-grained, scoped to just this repo, is safest):
1. GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → **Generate new token**.
2. Repository access: **Only select repositories** → this repo.
3. Permissions:
   - **Contents: Read and write** (to commit the request file)
   - **Actions: Read and write** (to trigger the `workflow_dispatch` run)
4. Generate and copy the token.

**Add it as a secret:**

- **Streamlit Community Cloud:** app page → **Manage app** → **Settings** →
  **Secrets**, add:
  ```toml
  GITHUB_TOKEN = "github_pat_..."
  ```
- **Local run:** create `.streamlit/secrets.toml` (already gitignored — never
  commit this file) with the same content.

Without a configured token, the tab still renders but shows a clear error
on submit rather than failing silently.

⚠️ **This app and repo are public.** Anything submitted through this form
becomes visible in public commit history. The form itself warns
submitters not to paste real secrets or confidential requirements.

## Full AI pipeline (passphrase-gated, human-reviewed) — `pipeline-plan.yml` / `pipeline-automation.yml` / `pipeline-execute.yml`

The form also has an optional **pipeline passphrase** field. If it matches
the `PIPELINE_PASSPHRASE` Streamlit secret, submitting the form triggers
`pipeline-plan.yml` instead of the default `saucedemo-checkout.yml` re-run --
the first of three separate GitHub Actions workflows that run Claude Code
**non-interactively**, one per pipeline stage, with a human review gate
between each:

1. **`pipeline-plan.yml`** reads the submitted request and produces a test
   plan (`specs/<slug>-test-plan.md`), then stops.
2. A stakeholder reviews the plan in the app's **Review Pipeline Artifacts**
   tab and either **Approves** it (triggers stage 2) or **Requests Changes**
   with free-text feedback (re-triggers stage 1, which revises the existing
   plan to address that feedback rather than starting over).
3. **`pipeline-automation.yml`** (only runs if the plan is `approved`) reads
   the plan and generates the Playwright automation suite
   (`tests/<slug>/`), then stops.
4. Same review loop: **Approve** triggers stage 3, **Request Changes**
   re-triggers stage 2 with feedback.
5. **`pipeline-execute.yml`** (only runs if the suite is `approved`) runs the
   suite, generates the dashboard-data JSON, and commits the final report.

A deterministic `slug` (derived from the request title) ties all three
stages together, both for output paths and for the review-status file at
`user-stories/<slug>-review.json` -- the single source of truth each stage
reads/writes and the Review tab renders. Each stage workflow refuses to run
if the prior stage isn't `approved` yet, so a stray/out-of-order dispatch
can't skip review.

This is deliberately **not** exposed to anonymous visitors — only to whoever
knows the passphrase (you). It exists so that a genuinely new/different
testing request can be run end-to-end from the deployed app instead of
requiring a manual Claude Code session, while keeping the public form itself
safe by default (see the abuse-risk discussion above — that risk doesn't go
away just because *you* trust yourself with it; the gate keeps it from being
triggerable by anyone else).

**Setup required (two separate secrets, in two different places):**

1. **Streamlit secret** `PIPELINE_PASSPHRASE` — any passphrase you choose,
   added the same way as `GITHUB_TOKEN` above (Streamlit Cloud → Manage app
   → Settings → Secrets, or local `.streamlit/secrets.toml`). Leaving it
   unset disables the pipeline trigger entirely (every submission falls
   back to the default safe behavior).
2. **GitHub Actions repo secret** `AWS_BEARER_TOKEN_BEDROCK` — added at
   **GitHub → repo → Settings → Secrets and variables → Actions → New
   repository secret**. This is *not* the same as the Streamlit secrets
   above; it authenticates the Claude Code CLI (via AWS Bedrock) running
   inside the CI container, which starts with no credentials of its own (a
   fresh CI runner has no access to any locally-logged-in Claude Code
   session).

**Status:** each stage commits an update to the `**Status:**` line in the
request file itself, so the app's "Check request status" box can show
progress by re-fetching that one file — no need to inspect the Actions run
directly, though the workflow run link is also shown after triggering. The
same stages are also reflected, per-artifact, in `user-stories/<slug>-review.json`
for the Review tab.

## Review tab artifacts as Google Docs (optional)

By default, the Review tab links each artifact straight to its GitHub blob
view. If you'd rather reviewers see a proper Google Doc (headings, lists,
tables rendered, commentable), configure a Google OAuth client and the
Review tab gets a **"Connect Google Drive"** button -- once a reviewer
signs in (once per browser session), the tab publishes/updates a Google Doc
per stage automatically, owned by that reviewer's own Google account.

This intentionally uses **per-user OAuth, not a service account.** A
service account has zero Drive storage quota of its own, and Google does
not let it own files against a personal/consumer Gmail account's quota at
all -- the only workarounds (a Shared Drive, or domain-wide delegation)
require a paid Google Workspace admin console. Per-user OAuth sidesteps
this: docs are created under whoever actually clicked "Connect," using
their own quota, with the narrow `drive.file` scope (this app can only see
files it itself created, nothing else in the reviewer's Drive).

**One-time Google Cloud setup:**
1. Create (or reuse) a Google Cloud project, enable the **Google Drive API**.
2. Configure the **OAuth consent screen** (APIs & Services → OAuth consent
   screen): External user type is fine for a personal account; "Testing"
   publishing status is fine too (add yourself/your reviewers as test users)
   -- no Google verification review needed for the `drive.file` scope at
   this scale. Note: apps left in "Testing" get a refresh token that expires
   after 7 days, so reviewers will need to reconnect periodically; publish
   the app (still free) if you want that to stop.
3. Create an **OAuth client ID** (APIs & Services → Credentials → Create
   Credentials → OAuth client ID → **Web application**). Add this exact
   dashboard URL as an **Authorized redirect URI** (and `http://localhost:8501`
   too if you also run it locally):
   ```
   https://opencartautomation-maev4hqufwiuu3fhv5oghu.streamlit.app/
   ```
4. Copy the generated **Client ID** and **Client secret**.

**Add as Streamlit secrets:**
```toml
GOOGLE_OAUTH_CLIENT_ID = "xxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET = "GOCSPX-..."
GOOGLE_OAUTH_REDIRECT_URI = "https://opencartautomation-maev4hqufwiuu3fhv5oghu.streamlit.app/"
```

Each stage's doc is created once and then overwritten in place on later
revisions (tracked via a `doc_revision` field alongside the artifact's own
`revision` in `user-stories/<slug>-review.json`, so it isn't recreated or
rewritten on every 15s auto-refresh tick -- only when the artifact actually
changes). New docs are shared as "anyone with the link can view", matching
the rest of this project's artifacts (public repo, public dashboard), so
other reviewers can read them without connecting their own account.
"Connect Google Drive" only matters for whoever is publishing/updating a
doc. The Google sign-in is session-only (stored in `st.session_state`, not
persisted) -- reconnect after a hard refresh or a new browser session.
Leaving the three secrets unset keeps the GitHub link as-is -- this
feature is fully optional.

**Known limitation:** running Claude Code non-interactively with the
`playwright-test` MCP server in a fresh Ubuntu CI container (as opposed to
an interactive session) is still relatively early -- expect to iterate
(permission flags, MCP server startup timing, etc.) if a run doesn't behave
as expected. Each stage typically takes a few minutes to tens of minutes
depending on suite size; the review pauses in between are unbounded (they
wait on you), so total wall-clock time for a request depends on how quickly
it's reviewed.
