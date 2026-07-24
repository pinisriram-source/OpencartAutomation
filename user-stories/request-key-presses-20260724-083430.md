# Testing Request: Key Presses

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-24 08:34:30
**Status:** Pending — not yet processed

## Application URL
https://the-internet.herokuapp.com/key_presses

## Requirements / Acceptance Criteria

This page has a single text input. Pressing any key while the input is
focused updates a result message below it to "You entered: <KEY NAME>",
where KEY NAME is the browser's key identifier (e.g. "A", "ENTER", "SPACE",
"ESC", "TAB"). There is no submit button; the message updates immediately
on keydown.

Acceptance Criteria:
- AC1: On page load, the text input is visible and empty, and no result
  message is shown yet.
- AC2: Pressing a letter key (e.g. "a") while the input is focused updates
  the message to "You entered: A" (uppercase key name).
- AC3: Pressing the Enter key updates the message to "You entered: ENTER".
- AC4: Pressing the Space key updates the message to "You entered: SPACE".
- AC5: Pressing the Escape key updates the message to "You entered: ESC".
- AC6: Pressing a second, different key after the first updates the
  message to reflect only the most recent key pressed (not a running
  history).
- AC7: The page never navigates or reloads on any key press -- the URL
  stays on /key_presses throughout.

No login or test credentials are required; this page has no authentication.

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
