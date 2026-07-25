# Testing Request: Dropdown Selection Behavior

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-25 07:09:36
**Status:** Pending — not yet processed

## Application URL
https://the-internet.herokuapp.com/dropdown

## Requirements / Acceptance Criteria

This page has a single select dropdown with exactly three options: a
disabled placeholder ("Please select an option"), "Option 1", and
"Option 2". There is no submit button and no page reload -- selecting an
option should just update the dropdown's selected value in place.

Acceptance Criteria:
1. On initial page load, the dropdown should be visible and no real option
   should be selected -- the placeholder "Please select an option" should
   be shown by default.
2. The placeholder option should be disabled and should not be selectable
   by the user.
3. Selecting "Option 1" should update the dropdown's selected value to
   "Option 1".
4. Selecting "Option 2" should update the dropdown's selected value to
   "Option 2".
5. Switching directly from "Option 1" to "Option 2" (without reselecting
   the placeholder in between) should update the value correctly to
   "Option 2" -- confirm no stale/intermediate state is shown.
6. The dropdown should expose exactly 3 options in this fixed order:
   placeholder, "Option 1", "Option 2" -- an extra or missing option should
   be treated as a failure.
7. Reloading the page after selecting "Option 2" should be a boundary/
   negative check: confirm the selection does NOT persist, and the
   dropdown resets to the placeholder default.
8. No dropdown interaction should trigger a page navigation or reload --
   the URL should remain https://the-internet.herokuapp.com/dropdown
   throughout every step above.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
