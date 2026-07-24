# Testing Request: Dropdown Smoke Test

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-24 06:17:07
**Status:** Pending — not yet processed

## Application URL
https://the-internet.herokuapp.com/dropdown

## Requirements / Acceptance Criteria

This page has a single select dropdown with three options: a disabled
placeholder ("Please select an option"), "Option 1", and "Option 2". There
is no submit button; selecting an option just updates the dropdown's value.

Acceptance Criteria:
- AC1: On page load, the dropdown is visible and no option is selected
  (the placeholder "Please select an option" is shown).
- AC2: The placeholder option is disabled and cannot be selected.
- AC3: Selecting "Option 1" updates the dropdown's selected value to
  "Option 1".
- AC4: Selecting "Option 2" updates the dropdown's selected value to
  "Option 2".
- AC5: Switching from "Option 1" directly to "Option 2" (without
  reselecting the placeholder) updates the value correctly to "Option 2".
- AC6: The dropdown has exactly 3 options, in this order: placeholder,
  Option 1, Option 2.
- AC7: The page never navigates or reloads when an option is selected --
  the URL stays on /dropdown throughout.

No login or test credentials are required; this page has no authentication.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
