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
credentials, and pasted/uploaded requirements text). It does **not** run
any tests automatically — it's a capture form; a human or Claude Code
picks up the committed file afterward and runs the actual plan → generate
→ execute workflow.

This requires a GitHub token with **write access to this repo's
contents**, provided via Streamlit secrets — never hardcoded in the code.

**Create the token** (fine-grained, scoped to just this repo, is safest):
1. GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → **Generate new token**.
2. Repository access: **Only select repositories** → this repo.
3. Permissions: **Contents: Read and write**.
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
