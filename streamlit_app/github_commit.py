"""Minimal GitHub Contents API helper for committing a new file from the app.

Used only by the "Submit New Testing Request" tab. Requires a GitHub token
with contents:write access to the target repo, provided via Streamlit
secrets (GITHUB_TOKEN) -- never hardcoded, never logged.
"""

from __future__ import annotations

import base64
from dataclasses import dataclass

import requests

GITHUB_API = "https://api.github.com"


@dataclass
class CommitResult:
    success: bool
    message: str
    html_url: str | None = None


def create_file(
    owner: str,
    repo: str,
    branch: str,
    path: str,
    content: str,
    commit_message: str,
    token: str,
) -> CommitResult:
    """Create a new file in the repo via the GitHub Contents API.

    Fails clearly (rather than raising) if the file already exists, the
    token lacks permission, or the request otherwise fails -- the caller
    is a Streamlit form and should show `result.message` to the user.
    """
    if not token:
        return CommitResult(False, "No GitHub token configured (see README for setup).")

    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    payload = {
        "message": commit_message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
        "branch": branch,
    }

    try:
        resp = requests.put(url, headers=headers, json=payload, timeout=20)
    except requests.RequestException as exc:
        return CommitResult(False, f"Network error contacting GitHub: {exc}")

    if resp.status_code in (200, 201):
        html_url = resp.json().get("content", {}).get("html_url")
        return CommitResult(True, "Committed successfully.", html_url)

    if resp.status_code == 401:
        return CommitResult(False, "GitHub rejected the token (401 Unauthorized). Check GITHUB_TOKEN in secrets.")
    if resp.status_code == 403:
        return CommitResult(False, "GitHub token lacks permission for this repo (403 Forbidden).")
    if resp.status_code == 422:
        return CommitResult(False, "A file already exists at that path, or the request was invalid (422).")

    return CommitResult(False, f"GitHub API error {resp.status_code}: {resp.text[:300]}")


def trigger_workflow(
    owner: str,
    repo: str,
    workflow_file: str,
    ref: str,
    token: str,
    inputs: dict | None = None,
) -> CommitResult:
    """Trigger a `workflow_dispatch` run of an existing GitHub Actions workflow.

    Requires a token with `Actions: Read and write` permission (in addition to
    `Contents: Read and write`). Fails clearly rather than raising -- the caller
    is a Streamlit form and should show `result.message` to the user.
    """
    if not token:
        return CommitResult(False, "No GitHub token configured (see README for setup).")

    url = f"{GITHUB_API}/repos/{owner}/{repo}/actions/workflows/{workflow_file}/dispatches"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    payload = {"ref": ref}
    if inputs:
        payload["inputs"] = inputs

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=20)
    except requests.RequestException as exc:
        return CommitResult(False, f"Network error contacting GitHub: {exc}")

    if resp.status_code == 204:
        return CommitResult(True, "Workflow run triggered.")

    if resp.status_code == 401:
        return CommitResult(False, "GitHub rejected the token (401 Unauthorized). Check GITHUB_TOKEN in secrets.")
    if resp.status_code == 403:
        return CommitResult(
            False,
            "GitHub token lacks permission to trigger workflows (403 Forbidden). "
            "The token needs 'Actions: Read and write' permission on this repo.",
        )
    if resp.status_code == 404:
        return CommitResult(
            False,
            "Workflow not found (404). Check the workflow file name and that it has a "
            "`workflow_dispatch` trigger.",
        )

    return CommitResult(False, f"GitHub API error {resp.status_code}: {resp.text[:300]}")


@dataclass
class FileResult:
    success: bool
    message: str
    content: str | None = None
    html_url: str | None = None


def get_file(
    owner: str,
    repo: str,
    path: str,
    ref: str,
    token: str,
) -> FileResult:
    """Fetch a file's current raw content from the repo (used to poll pipeline status).

    A public repo's contents can be read without a token, but we pass one
    through if configured to avoid unauthenticated rate limits.
    """
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    headers = {
        "Accept": "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        resp = requests.get(url, headers=headers, params={"ref": ref}, timeout=20)
    except requests.RequestException as exc:
        return FileResult(False, f"Network error contacting GitHub: {exc}")

    if resp.status_code == 200:
        resp.encoding = "utf-8"
        html_url = f"https://github.com/{owner}/{repo}/blob/{ref}/{path}"
        return FileResult(True, "OK", resp.text, html_url)

    if resp.status_code == 404:
        return FileResult(False, "File not found. Check the path is correct.")

    return FileResult(False, f"GitHub API error {resp.status_code}: {resp.text[:300]}")
