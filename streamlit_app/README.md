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
