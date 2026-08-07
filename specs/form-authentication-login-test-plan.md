# Form Authentication Login Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-07-30

## 1. Introduction

### 1.1 Test Plan Objectives

Validate the Form Authentication Login flow on the-internet.herokuapp.com/login end-to-end (page load state, valid/invalid credential submission, flash message display and dismissal, logout, and session-based access control for the /secure area) via automated regression coverage, so future changes to this authentication flow don't regress silently and manual re-testing time is reduced.

## 2. Scope

### 2.1 In Scope
- Initial page state verification (form fields, button, absence of flash message)
- Valid login flow navigating to /secure with success flash message and Logout button
- Invalid username submission (wrong username, case variation, whitespace-padded)
- Invalid password submission (wrong password, case variation, whitespace-padded)
- Empty/whitespace-only field validation and server-side validation ordering
- Flash message display (green success, red error) and close/dismiss control
- Logout flow returning to /login with logout flash message
- Unauthorized direct access to /secure redirecting to /login with error flash
- Security/input validation: SQL injection, XSS, special characters, long input, Unicode
- Browser navigation behavior (back/forward buttons, page refresh)

### 2.2 Out of Scope
- Visual/pixel-level styling of the login form or flash messages (covered by functional visibility checks only, not appearance)
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the authentication endpoint
- Session cookie security attributes or token expiry mechanics (no cookie/header inspection — UI-level only)

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the Form Authentication Login feature via Playwright, covering credential validation, session-gated navigation, flash messaging, and logout end-to-end in the browser.

### 3.2 Performance Test
Not applicable — performance/load testing is out of scope for this suite (see Section 2.2).

### 3.3 Security Test
Not applicable — security penetration testing is explicitly out of scope for this project. The suite does include basic input-validation smoke checks (SQL injection, XSS payloads rendered as literal text) as functional assertions, not as a security audit.

### 3.4 Automated Test
100% of this suite is automated — Playwright (TypeScript), executed non-interactively by `pipeline-execute.yml`. There is no manual test execution step in this pipeline.

### 3.5 Stress and Volume Test
Not applicable — this pipeline does not exercise concurrent load or high data volumes; each test runs a single Chromium browser context sequentially.

### 3.6 Recovery Test
Not applicable — no crash/failover recovery scenarios are in scope for this UI-level suite.

### 3.7 Documentation Test
This test plan, the generated Playwright specs, and the Streamlit dashboard report constitute the suite's documentation, reviewed for accuracy at each pipeline stage's human review gate (see Section 6).

### 3.8 Beta Test
Not applicable — this suite targets a stable, already-live target application; there is no beta/pre-release build to validate.

### 3.9 User Acceptance Test
The stakeholder who submitted the request acts as the acceptance reviewer, approving or requesting changes to this plan and the generated suite via the Streamlit dashboard's Review Pipeline Artifacts tab before execution.

## 4. Environment Requirements

### 4.1 Data Entry Workstations
Not applicable (legacy field from the source template) — see the actual environment below.

### 4.2 Mainframe
Not applicable — this application has no mainframe/back-end component in scope; testing is entirely browser-driven.

**Actual environment:** GitHub Actions `ubuntu-latest` runner, Node.js (`lts/*`), Playwright + Chromium (installed via `npx playwright install --with-deps chromium`), target application reachable at https://the-internet.herokuapp.com/login.

## 5. Test Schedule

Triggered on demand through the Streamlit dashboard's three-stage pipeline (plan -> review -> automation -> review -> execute); re-triggered automatically whenever a stage is sent back with reviewer feedback. No fixed calendar schedule — cadence is driven by stakeholder submissions and reviews.

## 6. Control Procedures

### 6.1 Reviews
Each pipeline stage (plan, automation, execution) pauses for human review in the Streamlit dashboard's Review Pipeline Artifacts tab before the next stage runs.

### 6.2 Bug Review Meetings
Not applicable — this is a lightweight, async pipeline with no synchronous meetings; defects surface directly in the dashboard's Defects Log and Test Execution Matrix tabs.

### 6.3 Change Request
A reviewer requesting changes on any stage (via "Request Changes" with free-text feedback) re-triggers that stage's workflow, which revises the existing artifact in place rather than starting over.

### 6.4 Defect Reporting
Failing tests are recorded with expected/actual behavior in `streamlit_app/data/form-authentication-login-test-results.json`'s `defects` array and rendered in the dashboard's Defects Log tab.

## 7. Functions to be Tested
- Login form initial state (fields present, empty, no flash message)
- Valid credential submission and navigation to /secure
- Invalid username rejection with appropriate error flash
- Invalid password rejection with appropriate error flash
- Empty/whitespace field validation ordering (username validated first)
- Flash message close/dismiss control
- Logout flow and session termination
- Unauthorized /secure access redirect
- Input sanitization (SQL injection, XSS, special characters, long strings, Unicode)
- Browser navigation (back/forward/refresh) around the login/secure flow

## 8. Resources and Responsibilities

### 8.1 Resources
Claude Code (via AWS Bedrock, non-interactive `npx claude -p` invocations), the `playwright-test-planner` and `playwright-test-generator` subagents, GitHub Actions compute, and the Streamlit dashboard for review/reporting.

### 8.2 Responsibilities
- **QA Automation Engineer:** `playwright-test-planner` (this plan) and `playwright-test-generator` (the automation suite) Claude Code subagents
- **DevOps / CI Engineer:** the three-stage GitHub Actions pipeline (`pipeline-plan.yml` / `pipeline-automation.yml` / `pipeline-execute.yml`)
- **Product Owner / QA Lead:** whoever approves each stage in the dashboard's Review Pipeline Artifacts tab

## 9. Deliverables
- This test plan (`specs/form-authentication-login-test-plan.md`)
- The generated Playwright automation suite (`tests/form-authentication-login/`)
- The executed test-results report (`streamlit_app/data/form-authentication-login-test-results.json`), visible in the Streamlit dashboard

## 10. Suspension/Exit Criteria

**Suspension:** the pipeline halts (and marks the stage `failed` in `user-stories/form-authentication-login-review.json`) if the target application is unreachable, or if a stage's Claude Code run errors out before producing its expected artifact.

**Exit:** every Smoke/Sanity/Functional test case in Section 18 has been executed and results published to the dashboard; no unresolved Smoke-tier failures.

## 11. Resumption Criteria

Once the blocking condition is resolved (application reachable again, or the failed stage re-dispatched), the pipeline resumes from the failed stage — earlier approved stages are not re-run.

## 12. Dependencies

### 12.1 Personal Dependencies
Availability of a human reviewer to approve/reject each pipeline stage in the Streamlit dashboard — the pipeline pauses indefinitely otherwise.

### 12.2 Software Dependencies
Node.js, Playwright, `@playwright/test`, the Claude Code CLI, this repo's `.github/workflows/pipeline-*.yml` and `.claude/agents/*.md`.

### 12.3 Hardware Dependencies
None beyond the GitHub Actions `ubuntu-latest` runner — no dedicated hardware.

### 12.4 Test Data & Database
No database. The application uses a single hardcoded credential pair (tomsmith / SuperSecretPassword!) with server-side session management. No persistent test data to seed or clean up — each test starts from a fresh browser context via `tests/seed.spec.ts`, and sessions are ephemeral.

## 13. Risks

### 13.1 Schedule
None — execution is on-demand, not calendar-bound; the only schedule risk is a stalled human review.

### 13.2 Technical
Running Claude Code non-interactively with the `playwright-test` MCP server in a fresh CI container is still relatively early — permission flags, MCP startup timing, or transient tool failures can cause a stage to need a re-run.

### 13.3 Management
None specific to this suite.

### 13.4 Personnel
Single-reviewer bottleneck — if the designated reviewer is unavailable, the pipeline pauses at that stage.

### 13.5 Requirements
Acceptance criteria ambiguity is caught proactively by the Submit New Request form's own quality checks before a plan is even generated.

## 14. Tools
Playwright (TypeScript), `@playwright/test`, GitHub Actions, Streamlit (dashboard/reporting), Claude Code (via AWS Bedrock).

## 15. Documentation
This file, the generated spec files under `tests/form-authentication-login/`, and `CLAUDE.md` (project rules and conventions).

## 16. Approvals
Recorded per-stage in `user-stories/form-authentication-login-review.json` (`plan.status`, `automation.status`, `execute.status`) and reflected in the Streamlit dashboard's Review Pipeline Artifacts tab — not a signature block, since approvals happen through that tab's Approve/Request Changes actions.

## 17. Application Overview

The Form Authentication Login application is a simple web-based authentication system demonstrating login/logout flows, credential validation, session management, and flash messaging. The page displays a standard login form with Username and Password fields plus a Login button. The application validates credentials server-side, with only one valid credential pair (username: tomsmith / password: SuperSecretPassword!). Upon successful authentication, users navigate to a protected /secure area containing a Logout button. Invalid credentials, empty fields, or unauthorized access attempts trigger appropriate flash messages (green for success, red for errors). Flash messages include a close control (x) for dismissal. The application enforces session-based access control, redirecting unauthenticated users attempting direct /secure access back to /login with an error message.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-LOGIN-001: Verify login page loads with all required elements

**File:** `tests/form-authentication-login/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the login page at https://the-internet.herokuapp.com/login
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/login
    - expect: Page title is 'The Internet'
    - expect: Page heading 'Login Page' is displayed
    - expect: Username field is visible and enabled
    - expect: Password field is visible and enabled
    - expect: Login button is visible and enabled
    - expect: No flash message is visible on initial page load

#### 1.2. TC-LOGIN-002: Verify instruction text is displayed on page load

**File:** `tests/form-authentication-login/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Inspect the instruction text
    - expect: Instruction text contains 'tomsmith' as the username example
    - expect: Instruction text contains 'SuperSecretPassword!' as the password example
    - expect: Instruction text mentions error messages for wrong information

#### 1.3. TC-LOGIN-003: Verify input fields are empty on initial page load

**File:** `tests/form-authentication-login/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Check the state of input fields
    - expect: Username field value is empty
    - expect: Password field value is empty

### 2. Valid Login Flow

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-LOGIN-004: Successful login with valid credentials navigates to secure area

**File:** `tests/form-authentication-login/valid-login-flow.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter valid username 'tomsmith' in Username field
    - expect: Username field contains 'tomsmith'
3. Enter valid password 'SuperSecretPassword!' in Password field
    - expect: Password field contains the entered password
4. Click the Login button
    - expect: Browser navigates to https://the-internet.herokuapp.com/secure
    - expect: URL changes from /login to /secure
    - expect: Page heading changes to 'Secure Area'
    - expect: Green flash message is visible
    - expect: Flash message contains 'You logged into a secure area!'
    - expect: Logout button is visible

#### 2.2. TC-LOGIN-005: Secure area displays welcome message and logout button

**File:** `tests/form-authentication-login/valid-login-flow.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to login page and log in with valid credentials
    - expect: Successfully navigates to /secure
2. Inspect the secure area page content
    - expect: Heading 'Secure Area' is displayed
    - expect: Welcome message 'Welcome to the Secure Area. When you are done click logout below.' is visible
    - expect: Logout button/link is present and clickable

### 3. Invalid Username

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-LOGIN-006: Login with invalid username shows error message

**File:** `tests/form-authentication-login/invalid-username.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter invalid username 'invalidUser' in Username field
    - expect: Username field contains 'invalidUser'
3. Enter any password 'somePassword' in Password field
    - expect: Password field contains the entered password
4. Click the Login button
    - expect: Browser remains on https://the-internet.herokuapp.com/login
    - expect: URL does not change
    - expect: Red flash message is visible
    - expect: Flash message contains 'Your username is invalid!'
    - expect: Username and Password fields remain visible

#### 3.2. TC-LOGIN-007: Login with invalid username case variation shows error

**File:** `tests/form-authentication-login/invalid-username.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter username 'TomSmith' (incorrect case) in Username field
    - expect: Username field contains 'TomSmith'
3. Enter valid password 'SuperSecretPassword!' in Password field
    - expect: Password field contains the password
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message contains 'Your username is invalid!'

#### 3.3. TC-LOGIN-008: Login with whitespace-padded username shows error

**File:** `tests/form-authentication-login/invalid-username.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter username ' tomsmith ' (with leading and trailing spaces) in Username field
    - expect: Username field contains the value with spaces
3. Enter valid password 'SuperSecretPassword!' in Password field
    - expect: Password field contains the password
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message is visible
    - expect: Flash message indicates username is invalid

### 4. Invalid Password

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-LOGIN-009: Login with valid username but invalid password shows error

**File:** `tests/form-authentication-login/invalid-password.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter valid username 'tomsmith' in Username field
    - expect: Username field contains 'tomsmith'
3. Enter invalid password 'wrongPassword' in Password field
    - expect: Password field contains the entered password
4. Click the Login button
    - expect: Browser remains on https://the-internet.herokuapp.com/login
    - expect: URL does not change
    - expect: Red flash message is visible
    - expect: Flash message contains 'Your password is invalid!'
    - expect: Username and Password fields remain visible

#### 4.2. TC-LOGIN-010: Login with valid username and incorrect password case shows error

**File:** `tests/form-authentication-login/invalid-password.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter valid username 'tomsmith' in Username field
    - expect: Username field contains 'tomsmith'
3. Enter password 'supersecretpassword!' (incorrect case) in Password field
    - expect: Password field contains the entered password
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message contains 'Your password is invalid!'

#### 4.3. TC-LOGIN-011: Login with valid username and whitespace-padded password shows error

**File:** `tests/form-authentication-login/invalid-password.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter valid username 'tomsmith' in Username field
    - expect: Username field contains 'tomsmith'
3. Enter password ' SuperSecretPassword! ' (with leading and trailing spaces) in Password field
    - expect: Password field contains the value with spaces
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message is visible
    - expect: Flash message indicates password is invalid

### 5. Empty Fields Validation

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-LOGIN-012: Submitting form with both fields empty shows username error

**File:** `tests/form-authentication-login/empty-fields-validation.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Leave Username field empty
    - expect: Username field is empty
3. Leave Password field empty
    - expect: Password field is empty
4. Click the Login button
    - expect: Browser remains on https://the-internet.herokuapp.com/login
    - expect: Red flash message is visible
    - expect: Flash message contains 'Your username is invalid!'
    - expect: Username is validated first when both fields are empty

#### 5.2. TC-LOGIN-013: Submitting form with empty username and valid password shows error

**File:** `tests/form-authentication-login/empty-fields-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Leave Username field empty
    - expect: Username field is empty
3. Enter valid password 'SuperSecretPassword!' in Password field
    - expect: Password field contains the password
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message contains 'Your username is invalid!'

#### 5.3. TC-LOGIN-014: Submitting form with valid username and empty password shows error

**File:** `tests/form-authentication-login/empty-fields-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter valid username 'tomsmith' in Username field
    - expect: Username field contains 'tomsmith'
3. Leave Password field empty
    - expect: Password field is empty
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message is visible
    - expect: Flash message contains 'Your password is invalid!'

#### 5.4. TC-LOGIN-015: Submitting form with whitespace-only username shows error

**File:** `tests/form-authentication-login/empty-fields-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter whitespace-only value '   ' in Username field
    - expect: Username field contains whitespace
3. Enter valid password 'SuperSecretPassword!' in Password field
    - expect: Password field contains the password
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message is visible
    - expect: Flash message indicates username is invalid

### 6. Flash Message Behavior

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-LOGIN-016: Flash message close button dismisses success message

**File:** `tests/form-authentication-login/flash-message-behavior.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to login page and log in with valid credentials
    - expect: Successfully navigates to /secure
    - expect: Green flash message is visible
2. Click the close (x) button on the flash message
    - expect: Flash message is dismissed and no longer visible
    - expect: Browser remains on /secure page
    - expect: URL does not change
    - expect: Secure Area content remains visible
    - expect: Logout button remains visible

#### 6.2. TC-LOGIN-017: Flash message close button dismisses error message

**File:** `tests/form-authentication-login/flash-message-behavior.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to login page
    - expect: Page loads successfully
2. Attempt login with invalid credentials to trigger error message
    - expect: Red flash message is visible
3. Click the close (x) button on the flash message
    - expect: Flash message is dismissed and no longer visible
    - expect: Browser remains on /login page
    - expect: URL does not change
    - expect: Login form remains visible and functional

#### 6.3. TC-LOGIN-018: Flash message persists until dismissed or page navigates

**File:** `tests/form-authentication-login/flash-message-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to login page and log in successfully
    - expect: Green flash message is visible on /secure
2. Verify flash message is present without dismissing it
    - expect: Flash message remains visible
    - expect: Flash message content is 'You logged into a secure area!'

### 7. Logout Flow

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-LOGIN-019: Clicking Logout navigates back to login page with flash message

**File:** `tests/form-authentication-login/logout-flow.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to login page and log in with valid credentials
    - expect: Successfully navigates to /secure
2. Click the Logout button
    - expect: Browser navigates to https://the-internet.herokuapp.com/login
    - expect: URL changes from /secure to /login
    - expect: Flash message is visible
    - expect: Flash message contains 'You logged out of the secure area!'
    - expect: Login form is visible again
    - expect: Username and Password fields are empty

#### 7.2. TC-LOGIN-020: After logout, attempting to navigate back to secure area redirects to login

**File:** `tests/form-authentication-login/logout-flow.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to login page, log in, then log out
    - expect: Successfully logged out and back on /login
2. Navigate directly to https://the-internet.herokuapp.com/secure
    - expect: Browser redirects to https://the-internet.herokuapp.com/login
    - expect: Red flash message is visible
    - expect: Flash message contains 'You must login to view the secure area!'

### 8. Unauthorized Access

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-LOGIN-021: Direct navigation to secure area without login redirects to login page

**File:** `tests/form-authentication-login/unauthorized-access.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate directly to https://the-internet.herokuapp.com/secure without logging in
    - expect: Browser redirects to https://the-internet.herokuapp.com/login
    - expect: URL changes from /secure to /login
    - expect: Red flash message is visible
    - expect: Flash message contains 'You must login to view the secure area!'
    - expect: Login form is displayed

#### 8.2. TC-LOGIN-022: Multiple failed login attempts still allow successful login

**File:** `tests/form-authentication-login/unauthorized-access.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Attempt login with invalid credentials
    - expect: Red flash message shows username or password error
3. Attempt login with different invalid credentials again
    - expect: Red flash message shows username or password error
4. Attempt login with valid credentials 'tomsmith' / 'SuperSecretPassword!'
    - expect: Browser navigates to /secure
    - expect: Green flash message confirms successful login
    - expect: No account lockout or rate limiting is enforced

### 9. Security and Input Validation

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-LOGIN-023: SQL injection attempt in username field is handled safely

**File:** `tests/form-authentication-login/security-input-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter SQL injection string "admin' OR '1'='1" in Username field
    - expect: Username field accepts the input
3. Enter any password in Password field
    - expect: Password field accepts the input
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message indicates invalid username
    - expect: No SQL error or database exception is displayed
    - expect: Application treats input as literal text

#### 9.2. TC-LOGIN-024: XSS attempt in username field is sanitized

**File:** `tests/form-authentication-login/security-input-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter XSS payload "<script>alert('XSS')</script>" in Username field
    - expect: Username field accepts the input
3. Enter any password in Password field
    - expect: Password field accepts the input
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message is displayed
    - expect: No JavaScript alert is executed
    - expect: Script tags are not executed
    - expect: Application treats input as literal text

#### 9.3. TC-LOGIN-025: Special characters in username are handled correctly

**File:** `tests/form-authentication-login/security-input-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter username with special characters "tom@smith#123!" in Username field
    - expect: Username field accepts the input
3. Enter valid password in Password field
    - expect: Password field accepts the input
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message indicates invalid username
    - expect: No error page or exception is displayed

#### 9.4. TC-LOGIN-026: Very long username input is handled correctly

**File:** `tests/form-authentication-login/security-input-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter a very long string (500 characters) in Username field
    - expect: Username field accepts or truncates the input appropriately
3. Enter valid password in Password field
    - expect: Password field accepts the input
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message indicates invalid username
    - expect: Application does not crash or hang
    - expect: No server error is displayed

#### 9.5. TC-LOGIN-027: Unicode characters in credentials are handled correctly

**File:** `tests/form-authentication-login/security-input-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter username with Unicode characters "tomsm!th" in Username field
    - expect: Username field accepts the input
3. Enter valid password in Password field
    - expect: Password field accepts the input
4. Click the Login button
    - expect: Browser remains on /login
    - expect: Red flash message indicates invalid username
    - expect: Unicode characters are displayed correctly in any error messages

### 10. Browser Navigation Behavior

**Seed:** `tests/seed.spec.ts`

#### 10.1. TC-LOGIN-028: Browser back button after successful login returns to login page

**File:** `tests/form-authentication-login/browser-navigation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to login page and log in successfully
    - expect: Successfully navigates to /secure
2. Click browser back button
    - expect: Browser navigates back to /login
    - expect: Login form is displayed
    - expect: No secure area content is visible

#### 10.2. TC-LOGIN-029: Browser forward button after logout navigates forward

**File:** `tests/form-authentication-login/browser-navigation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to login page, log in, then log out
    - expect: Back on /login after logout
2. Click browser back button
    - expect: Browser may navigate back in history
3. Click browser forward button
    - expect: Browser navigates forward in history
    - expect: If attempting to access /secure, redirects to /login with error message

#### 10.3. TC-LOGIN-030: Page refresh on login page clears form state

**File:** `tests/form-authentication-login/browser-navigation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: Page loads successfully
2. Enter username 'testuser' in Username field
    - expect: Username field contains 'testuser'
3. Refresh the page
    - expect: Page reloads successfully
    - expect: Username and Password fields are cleared
    - expect: Form returns to initial empty state
