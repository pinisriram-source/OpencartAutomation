# Testing Request: Checkboxes

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-24 16:58:19
**Status:** Pending — not yet processed

## Application URL
https://the-internet.herokuapp.com/checkboxes

## Requirements / Acceptance Criteria

This page has exactly two checkboxes. Checkbox 1 is unchecked by default;
Checkbox 2 is checked by default. Clicking a checkbox toggles its checked
state; there is no submit button and no page reload.

Acceptance Criteria:
- AC1: On page load, Checkbox 1 is present and unchecked.
- AC2: On page load, Checkbox 2 is present and checked.
- AC3: Clicking Checkbox 1 checks it; clicking it again unchecks it.
- AC4: Clicking Checkbox 2 unchecks it; clicking it again checks it.
- AC5: Toggling one checkbox does not affect the other checkbox's state.
- AC6: The page never navigates or reloads during any checkbox click --
  the URL stays on /checkboxes throughout.

No login or test credentials are required; this page has no authentication.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
