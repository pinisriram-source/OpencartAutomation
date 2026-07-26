# Testing Request: Dynamic Loading - Hidden and Rendered Elements

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-26 12:52:08
**Status:** In progress -- automation suite generated, awaiting stakeholder review

## Application URL
https://the-internet.herokuapp.com/dynamic_loading

## Requirements / Acceptance Criteria

his feature demonstrates two ways an element can dynamically appear after
a delay: one where the element exists in the DOM from page load but is
hidden until revealed, and one where the element doesn't exist in the DOM
at all until it's rendered after the delay. Both examples share the same
interaction: click a "Start" button, see a loading indicator while the
page waits (~5 seconds), then see the loading indicator replaced by a
"Hello World!" message.

The page has two examples, linked from https://the-internet.herokuapp.com/dynamic_loading:
- Example 1: /dynamic_loading/1 ("Element on page that is hidden")
- Example 2: /dynamic_loading/2 ("Element rendered after the fact")

Acceptance Criteria:
- AC1: On loading Example 1, a "Start" button is visible and no "Hello
  World!" message or loading indicator is visible.
- AC2: On loading Example 2, a "Start" button is visible, and there is no
  "Hello World!" message anywhere in the page (not just hidden -- it isn't
  in the page at all yet).
- AC3: On Example 1, clicking "Start" hides the Start button and shows a
  "Loading..." indicator (with a spinner) immediately.
- AC4: On Example 1, after the loading indicator finishes (up to ~10
  seconds), the loading indicator disappears and a "Hello World!" message
  becomes visible.
- AC5: On Example 2, clicking "Start" hides the Start button and shows the
  same "Loading..." indicator.
- AC6: On Example 2, after loading finishes, the loading indicator
  disappears and a "Hello World!" message appears (added to the page,
  not merely unhidden).
- AC7: On both examples, the "Hello World!" message is never visible at
  the same time as the "Loading..." indicator or the "Start" button --
  exactly one of the three is shown at any moment.
- AC8: Reloading either example page after the message has appeared resets
  it back to the initial "Start" button state (no message, no loading
  indicator).
- AC9: The "Start" button is not clickable/interactable while the loading
  indicator is showing (no double-start / overlapping loads).
Paste that into the dashboard whenever you're ready — since you're submitting it yourself, just remember to enter the pipeline passphrase if you want the full plan→generate→execute pipeline to run (leaving it blank just reruns the existing suite instead, per the form's own warning).

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
