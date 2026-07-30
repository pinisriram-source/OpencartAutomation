# Testing Request: Form Authentication Login

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-30 08:31:54
**Status:** In progress -- test plan generated, awaiting stakeholder review

## Application URL
https://the-internet.herokuapp.com/login

## Requirements / Acceptance Criteria

This page is a standard login form for "the internet" demo site's secure
area. Valid credentials are username "tomsmith" and password
"SuperSecretPassword!". A successful login redirects to /secure; an
unsuccessful one stays on /login and shows a red flash error message at
the top of the page. The secure area also enforces that it can't be
reached directly without logging in first.

Acceptance Criteria:
- AC1: On page load, the login form shows a Username field, a Password
  field, and a "Login" button; no flash message is visible.
- AC2: Submitting valid credentials (tomsmith / SuperSecretPassword!)
  navigates to /secure and shows a green flash message containing "You
  logged into a secure area!", plus a "Logout" button.
- AC3: Submitting an invalid username (e.g. "invalidUser") with any
  password stays on /login and shows a red flash message containing
  "Your username is invalid!".
- AC4: Submitting a valid username ("tomsmith") with an invalid password
  stays on /login and shows a red flash message containing "Your password
  is invalid!".
- AC5: Submitting the form with both fields empty shows a red flash
  message containing "Your username is invalid!" (username is validated
  first).
- AC6: The flash message has a close ("x") control that dismisses it
  without navigating away from the current page.
- AC7: From the secure area, clicking "Logout" navigates back to /login
  and shows a flash message containing "You logged out of the secure
  area!".
- AC8: Navigating directly to /secure without having logged in redirects
  back to /login and shows a red flash message containing "You must login
  to view the page!".

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
