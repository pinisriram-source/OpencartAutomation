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
