# Testing Request: Testing Request: Dynamic Controls

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-23 10:57:34
**Status:** Pending — not yet processed

## Application URL
https://the-internet.herokuapp.com/dynamic_controls

## Requirements / Acceptance Criteria

## Requirements / Acceptance Criteria

This page has two independent widgets: a Checkbox with an Enable/Disable
button, and a Text Input with a Remove/Add button. Both buttons trigger a
brief loading spinner before the DOM updates.

Acceptance Criteria:
- AC1: On page load, the checkbox is visible and disabled, and its button
  reads "Enable".
- AC2: Clicking "Enable" shows a loading indicator, then the checkbox
  becomes enabled and the button label changes to "Disable".
- AC3: Clicking "Disable" (after enabling) shows a loading indicator, then
  the checkbox becomes disabled again and the button reverts to "Enable".
- AC4: Checking/unchecking the checkbox while it is enabled toggles its
  checked state with no page reload.
- AC5: On page load, a text input is visible and enabled, and its button
  reads "Remove".
- AC6: Clicking "Remove" shows a loading indicator, then the text input is
  removed from the page and the button label changes to "Add".
- AC7: Clicking "Add" (after removing) shows a loading indicator, then the
  text input reappears and the button reverts to "Remove".
- AC8: The checkbox widget and text input widget operate independently --
  toggling one does not affect the other's state.

No login or test credentials are required; this page has no authentication.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
