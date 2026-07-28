# Testing Request: Single File Upload Flow

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-28 15:37:49
**Status:** In progress -- automation generated, executing tests (Chromium)

## Application URL
https://the-internet.herokuapp.com/upload

## Requirements / Acceptance Criteria

1. The Upload page displays a file input control and a disabled/enabled
   "Upload" button appropriate to whether a file has been chosen.
2. Selecting a valid file via the file input populates the input with the
   chosen file's name before submission.
3. Clicking "Upload" after selecting a file navigates to the
   upload-success page and displays the uploaded file's name under
   "Uploaded!".
4. Clicking "Upload" with no file selected does not silently succeed —
   the app must show a clear validation message to the user rather than
   an unhandled server error.
5. Uploading a second file after a previous successful upload correctly
   replaces the displayed file name with the new file's name (no stale
   state from the prior upload).
6. The file name shown on the success page exactly matches the name of
   the file that was selected (including extension), with no truncation
   or alteration.
7. Navigating back from the success page returns to the upload form in a
   clean state, ready to accept a new file selection.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
