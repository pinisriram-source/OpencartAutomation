"""Google Drive helper: publish a markdown artifact as a Google Doc.

Used by the "Review Pipeline Artifacts" tab so a reviewer sees the test
plan / automation suite writeup as a real Google Doc instead of a raw
GitHub blob view. Mirrors github_commit.py's style -- plain functions,
explicit params, no Streamlit import here, callers pass in credentials
and secrets so this module stays independently testable.

Requires a service account (not full OAuth, since this is a
backend-driven, no-per-user-login app): the service account has zero
Drive storage quota of its own, so the target folder must be a real
Drive folder owned by a human account that has shared it with the
service account's email as Editor -- see streamlit_app/README.md.
"""

from __future__ import annotations

from dataclasses import dataclass

import markdown as markdown_lib
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaInMemoryUpload

DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"]
DOC_MIME_TYPE = "application/vnd.google-apps.document"


@dataclass
class DocResult:
    success: bool
    message: str
    doc_id: str | None = None
    doc_url: str | None = None


def _markdown_to_html(markdown_content: str) -> str:
    """Convert markdown to HTML for Drive's import-conversion to pick up
    headings/lists/tables/bold when it turns this into a Google Doc."""
    body = markdown_lib.markdown(
        markdown_content, extensions=["tables", "fenced_code", "sane_lists"]
    )
    return f"<html><body>{body}</body></html>"


def _build_drive_service(service_account_info: dict):
    credentials = service_account.Credentials.from_service_account_info(
        service_account_info, scopes=DRIVE_SCOPES
    )
    return build("drive", "v3", credentials=credentials, cache_discovery=False)


def upsert_google_doc(
    service_account_info: dict,
    folder_id: str,
    title: str,
    markdown_content: str,
    existing_doc_id: str | None = None,
) -> DocResult:
    """Create a Google Doc from markdown, or overwrite an existing one's content.

    On create, shares the doc as "anyone with the link can view" so a
    reviewer doesn't need their own access granted individually -- this
    mirrors the rest of the project's artifacts already being public
    (public GitHub repo, public Streamlit dashboard).
    """
    if not service_account_info:
        return DocResult(False, "No Google service account configured (see README for setup).")
    if not folder_id:
        return DocResult(False, "No Google Drive folder ID configured (see README for setup).")

    try:
        drive = _build_drive_service(service_account_info)
    except Exception as exc:  # malformed service account JSON, etc.
        return DocResult(False, f"Couldn't build Google Drive client: {exc}")

    html_content = _markdown_to_html(markdown_content)
    media = MediaInMemoryUpload(html_content.encode("utf-8"), mimetype="text/html", resumable=False)

    try:
        if existing_doc_id:
            file = drive.files().update(
                fileId=existing_doc_id,
                media_body=media,
                fields="id",
                supportsAllDrives=True,
            ).execute()
            doc_id = file["id"]
        else:
            file = drive.files().create(
                body={"name": title, "mimeType": DOC_MIME_TYPE, "parents": [folder_id]},
                media_body=media,
                fields="id",
                supportsAllDrives=True,
            ).execute()
            doc_id = file["id"]
            drive.permissions().create(
                fileId=doc_id,
                body={"type": "anyone", "role": "reader"},
                supportsAllDrives=True,
            ).execute()
    except HttpError as exc:
        return DocResult(False, f"Google Drive API error: {exc}")
    except Exception as exc:
        return DocResult(False, f"Unexpected error talking to Google Drive: {exc}")

    return DocResult(True, "Synced.", doc_id, f"https://docs.google.com/document/d/{doc_id}/edit")
