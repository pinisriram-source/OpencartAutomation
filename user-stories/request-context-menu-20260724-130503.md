# Testing Request: Context Menu

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-24 13:05:03
**Status:** Pending — not yet processed

## Application URL
https://the-internet.herokuapp.com/context_menu

## Requirements / Acceptance Criteria

This page has a single labeled box ("hot spot"). Right-clicking inside the
box triggers a native browser JavaScript alert dialog with the message
"You selected a context menu". Right-clicking outside the box does not
trigger the alert (the browser's normal context menu appears instead).

Acceptance Criteria:
- AC1: On page load, the "hot spot" box is visible with its label text.
- AC2: Right-clicking inside the hot spot box triggers a JavaScript alert
  dialog with the exact message "You selected a context menu".
- AC3: Accepting (dismissing) the alert closes it and leaves the page in
  its normal state, with no navigation or reload having occurred.
- AC4: Right-clicking inside the hot spot box a second time triggers the
  alert again with the same message (repeatable, not a one-time event).
- AC5: The page never navigates or reloads as a result of the right-click
  or the alert -- the URL stays on /context_menu throughout.

No login or test credentials are required; this page has no authentication.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
