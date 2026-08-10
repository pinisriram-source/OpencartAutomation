# Testing Request: Single File Upload Flow

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-08-10 16:40:50
**Status:** In progress -- generating test plan

## Application URL
https://the-internet.herokuapp.com/upload

## Requirements / Acceptance Criteria

This feature lets a user select a single file from their local machine and
upload it via a classic HTML file input and submit button. On success, the
page reloads showing a confirmation heading and the uploaded file's name.

The page has a "File Uploader" heading, a file input (id="file-upload"),
and an "Upload" submit button (id="file-submit"). There is also a separate
drag-and-drop upload widget on the same page -- that widget is out of scope
for this test; only the classic file input + submit flow should be tested.

Acceptance Criteria:
- AC1: On page load, the "File Uploader" heading is visible, the file input
  is empty, and no "File Uploaded!" confirmation or uploaded-file name is
  present anywhere on the page.
- AC2: Selecting a file in the file input and clicking "Upload" navigates to
  a confirmation view (same URL) showing a "File Uploaded!" heading.
- AC3: After a successful upload, the uploaded file's exact filename is
  displayed on the confirmation view.
- AC4: Uploading a file with a simple extension (e.g. .txt) and uploading a
  file with a different extension (e.g. .png or .json) both succeed and
  each shows its own correct filename on the confirmation view.
- AC5: Uploading a file whose name contains spaces or special characters
  (e.g. "my file (1).txt") succeeds and displays the filename exactly as
  provided, unmodified.
- AC6: Clicking "Upload" with no file selected in the input does NOT
  successfully complete an upload -- capture and record whatever the actual
  behavior is (this is a negative/edge case worth explicit verification,
  not an assumption that it will show a friendly validation message).
- AC7: After a successful upload, navigating back to
  https://the-internet.herokuapp.com/upload resets the page to its initial
  empty state (AC1) -- the previous upload does not persist across a fresh
  page load.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
