# Testing Request: Practice Login Page Smoke Test

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** 2026-07-23 06:28:17
**Status:** In progress -- test plan generated, generating automation suite

## Application URL
https://practicetestautomation.com/practice-test-login/

## Requirements / Acceptance Criteria

Test the login form on this page.

Acceptance Criteria:
- AC1: Entering a valid username and password and clicking Submit logs
  the user in and navigates to a page showing "Logged In Successfully"
  with a link back to the practice page.
- AC2: Entering an invalid username shows an error message indicating
  the username is not found, and the user remains on the login page.
- AC3: Entering a valid username with an incorrect password shows an
  error message indicating the password is invalid, and the user
  remains on the login page.

Test credentials (published on the page itself for practice purposes):
- Username: student
- Password: Password123

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
