# Testing Request: Add/Remove Elements

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-24 05:53:31
**Status:** Pending — not yet processed

## Application URL
https://the-internet.herokuapp.com/add_remove_elements/

## Requirements / Acceptance Criteria

This page has a single "Add Element" button. Each click adds one new
"Delete" button to the page. Each "Delete" button removes only itself when
clicked.

Acceptance Criteria:
- AC1: On page load, the "Add Element" button is visible and no "Delete"
  buttons are present.
- AC2: Clicking "Add Element" once adds exactly one "Delete" button to the
  page.
- AC3: Clicking "Add Element" multiple times (e.g. 5 times) adds that same
  number of "Delete" buttons.
- AC4: Clicking a "Delete" button removes exactly that one button; the
  remaining "Delete" buttons stay visible and clickable.
- AC5: Clicking every "Delete" button in sequence removes all of them,
  leaving zero "Delete" buttons and only the "Add Element" button visible.
- AC6: The page never navigates or reloads during any Add/Delete action --
  the URL stays on /add_remove_elements/ throughout.

No login or test credentials are required; this page has no authentication.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
