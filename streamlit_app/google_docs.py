"""Google Drive helper: publish a markdown artifact as a Google Doc.

Used by the "Review Pipeline Artifacts" tab so a reviewer sees the test
plan / automation suite writeup as a real Google Doc instead of a raw
GitHub blob view. Mirrors github_commit.py's style -- plain functions,
explicit params, no Streamlit import here.

Uses per-user OAuth (a "Connect Google Drive" button the reviewer clicks
once per browser session), not a service account: service accounts have
zero Drive storage quota of their own and Google does not let them own
files against a personal/consumer Gmail account's quota at all (only
Google Workspace Shared Drives or domain-wide delegation work around
that, and both require a paid Workspace admin console). Per-user OAuth
sidesteps this entirely -- docs are created under the signed-in
reviewer's own account and quota. Scope is the narrow drive.file scope
(only files this app itself creates), not full drive access.
"""

from __future__ import annotations

from dataclasses import dataclass

import markdown as markdown_lib
from google.auth.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaInMemoryUpload

DRIVE_FILE_SCOPES = ["https://www.googleapis.com/auth/drive.file"]
DOC_MIME_TYPE = "application/vnd.google-apps.document"


@dataclass
class DocResult:
    success: bool
    message: str
    doc_id: str | None = None
    doc_url: str | None = None


def build_oauth_flow(client_id: str, client_secret: str, redirect_uri: str) -> Flow:
    """Build the OAuth flow used to send a reviewer to Google's consent screen."""
    client_config = {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }
    return Flow.from_client_config(client_config, scopes=DRIVE_FILE_SCOPES, redirect_uri=redirect_uri)


def get_authorization_url(flow: Flow) -> tuple[str, str]:
    """Returns (url, state). Send the reviewer's browser to `url`; stash `state`
    in session_state to check against the callback's `state` query param."""
    return flow.authorization_url(
        access_type="offline", include_granted_scopes="true", prompt="consent"
    )


def exchange_code_for_credentials(flow: Flow, code: str) -> Credentials:
    """Completes the flow after Google redirects back with ?code=...."""
    flow.fetch_token(code=code)
    return flow.credentials


def _markdown_to_html(markdown_content: str) -> str:
    """Convert markdown to HTML for Drive's import-conversion to pick up
    headings/lists/tables/bold when it turns this into a Google Doc."""
    body = markdown_lib.markdown(
        markdown_content, extensions=["tables", "fenced_code", "sane_lists"]
    )
    return f"<html><body>{body}</body></html>"


def upsert_google_doc(
    credentials: Credentials,
    title: str,
    markdown_content: str,
    existing_doc_id: str | None = None,
) -> DocResult:
    """Create a Google Doc from markdown (in the signed-in reviewer's own Drive),
    or overwrite an existing one's content.

    On create, shares the doc as "anyone with the link can view" so other
    reviewers don't need to sign in themselves just to read it -- this
    mirrors the rest of the project's artifacts already being public
    (public GitHub repo, public Streamlit dashboard).
    """
    if not credentials:
        return DocResult(False, "Not connected to Google Drive yet -- click Connect Google Drive above.")

    try:
        drive = build("drive", "v3", credentials=credentials, cache_discovery=False)
    except Exception as exc:
        return DocResult(False, f"Couldn't build Google Drive client: {exc}")

    html_content = _markdown_to_html(markdown_content)
    media = MediaInMemoryUpload(html_content.encode("utf-8"), mimetype="text/html", resumable=False)

    try:
        if existing_doc_id:
            file = drive.files().update(
                fileId=existing_doc_id,
                media_body=media,
                fields="id",
            ).execute()
            doc_id = file["id"]
        else:
            file = drive.files().create(
                body={"name": title, "mimeType": DOC_MIME_TYPE},
                media_body=media,
                fields="id",
            ).execute()
            doc_id = file["id"]
            drive.permissions().create(
                fileId=doc_id,
                body={"type": "anyone", "role": "reader"},
            ).execute()
    except HttpError as exc:
        return DocResult(False, f"Google Drive API error: {exc}")
    except Exception as exc:
        return DocResult(False, f"Unexpected error talking to Google Drive: {exc}")

    return DocResult(True, "Synced.", doc_id, f"https://docs.google.com/document/d/{doc_id}/edit")
