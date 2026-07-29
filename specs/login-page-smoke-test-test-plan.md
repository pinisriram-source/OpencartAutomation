# Login Page Smoke Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-07-29

## 1. Introduction

### 1.1 Test Plan Objectives

Validate login page authentication behavior (successful login with valid credentials, error handling for invalid username, error handling for invalid password) on the Practice Test Automation login page (practicetestautomation.com/practice-test-login/) end-to-end via automated regression coverage, so future changes to this authentication flow don't regress silently and manual re-testing time is reduced.

## 2. Scope

### 2.1 In Scope
- Successful login with valid credentials navigating to a success page
- Invalid username error message display and page state retention
- Invalid password error message display and page state retention
- Empty field validation behavior
- Case sensitivity of username and password fields
- Form submission via button click and Enter key
- Success page content verification and Log out navigation
- Direct access to success page without authentication

### 2.2 Out of Scope
- Visual/pixel-level styling of the login form or success page
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the page
- Rate limiting or account lockout behavior (not implemented on this practice app)

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the login authentication flow via Playwright, covering form input, submission, error handling, and post-login navigation end-to-end in the browser.

### 3.2 Performance Test
Not applicable — performance/load testing is explicitly out of scope for this project (see CLAUDE.md's "Testing Objective").

### 3.3 Security Test
Not applicable — security penetration testing is explicitly out of scope for this project.

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

**Actual environment:** GitHub Actions `ubuntu-latest` runner, Node.js (`lts/*`), Playwright + Chromium (installed via `npx playwright install --with-deps chromium`), target application reachable at https://practicetestautomation.com/practice-test-login/.

## 5. Test Schedule

Triggered on demand through the Streamlit dashboard's three-stage pipeline (plan → review → automation → review → execute); re-triggered automatically whenever a stage is sent back with reviewer feedback. No fixed calendar schedule — cadence is driven by stakeholder submissions and reviews.

## 6. Control Procedures

### 6.1 Reviews
Each pipeline stage (plan, automation, execution) pauses for human review in the Streamlit dashboard's Review Pipeline Artifacts tab before the next stage runs.

### 6.2 Bug Review Meetings
Not applicable — this is a lightweight, async pipeline with no synchronous meetings; defects surface directly in the dashboard's Defects Log and Test Execution Matrix tabs.

### 6.3 Change Request
A reviewer requesting changes on any stage (via "Request Changes" with free-text feedback) re-triggers that stage's workflow, which revises the existing artifact in place rather than starting over.

### 6.4 Defect Reporting
Failing tests are recorded with expected/actual behavior in `streamlit_app/data/login-page-smoke-test-test-results.json`'s `defects` array and rendered in the dashboard's Defects Log tab.

## 7. Functions to be Tested
- Successful login with valid credentials (username: "student", password: "Password123") navigating to a success page with personalized message
- Invalid username error handling ("Your username is invalid!" message, page stays on login URL)
- Invalid password error handling ("Your password is invalid!" message, page stays on login URL)
- Empty field submission behavior
- Case sensitivity enforcement for both username and password
- Form submission via Enter key
- Log out navigation from success page back to login page
- Direct access to success page without prior authentication

## 8. Resources and Responsibilities

### 8.1 Resources
Claude Code (via AWS Bedrock, non-interactive `npx claude -p` invocations), the `playwright-test-planner` and `playwright-test-generator` subagents, GitHub Actions compute, and the Streamlit dashboard for review/reporting.

### 8.2 Responsibilities
- **QA Automation Engineer:** `playwright-test-planner` (this plan) and `playwright-test-generator` (the automation suite) Claude Code subagents
- **DevOps / CI Engineer:** the three-stage GitHub Actions pipeline (`pipeline-plan.yml` / `pipeline-automation.yml` / `pipeline-execute.yml`)
- **Product Owner / QA Lead:** whoever approves each stage in the dashboard's Review Pipeline Artifacts tab

## 9. Deliverables
- This test plan (`specs/login-page-smoke-test-test-plan.md`)
- The generated Playwright automation suite (`tests/login-page-smoke-test/`)
- The executed test-results report (`streamlit_app/data/login-page-smoke-test-test-results.json`), visible in the Streamlit dashboard

## 10. Suspension/Exit Criteria

**Suspension:** the pipeline halts (and marks the stage `failed` in `user-stories/login-page-smoke-test-review.json`) if the target application is unreachable, or if a stage's Claude Code run errors out before producing its expected artifact.

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
No database. The application uses hardcoded test credentials (username: "student", password: "Password123") with no persistent state between sessions — each test starts from a fresh navigation via `tests/seed.spec.ts`.

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
This file, the generated spec files under `tests/login-page-smoke-test/`, and `CLAUDE.md` (project rules and conventions).

## 16. Approvals
Recorded per-stage in `user-stories/login-page-smoke-test-review.json` (`plan.status`, `automation.status`, `execute.status`) and reflected in the Streamlit dashboard's Review Pipeline Artifacts tab — not a signature block, since approvals happen through that tab's Approve/Request Changes actions.

## 17. Application Overview

This test plan covers the login page functionality at https://practicetestautomation.com/practice-test-login/. The page is designed as a practice environment for test automation engineers to write positive and negative login test scenarios.

The login page provides a simple authentication form with two input fields (Username and Password) and a Submit button. The page demonstrates basic login validation behavior including successful authentication with valid credentials, and error handling for invalid username or password combinations. The valid test credentials are username: "student" and password: "Password123".

Key functionality includes:
- Successful login redirects to a success page showing "Logged In Successfully" heading with a congratulatory message and a Log out link
- Invalid username displays "Your username is invalid!" error message
- Invalid password displays "Your password is invalid!" error message
- Error messages are displayed on the same page without navigation
- The success page includes a Log out link that navigates back to the login page

## 18. Detailed Test Scenarios

### 1. Login Page Tests

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-LOGIN-001: Verify initial page load and form elements

**File:** `tests/login-page-smoke-test/page-load.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page URL is https://practicetestautomation.com/practice-test-login/
    - expect: The page title is 'Test Login | Practice Test Automation'
    - expect: The heading 'Test login' is visible
    - expect: Username textbox is visible and empty
    - expect: Password textbox is visible and empty
    - expect: Submit button is visible and enabled
    - expect: No error message is displayed on initial load

#### 1.2. TC-LOGIN-002: Successful login with valid credentials

**File:** `tests/login-page-smoke-test/valid-login.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'student' in the Username field
    - expect: The username is entered in the field
3. Enter 'Password123' in the Password field
    - expect: The password is entered in the field
4. Click the Submit button
    - expect: The page navigates to a new URL
    - expect: The new URL contains 'practicetestautomation.com/logged-in-successfully/'
    - expect: The page title is 'Logged In Successfully | Practice Test Automation'
    - expect: The heading 'Logged In Successfully' is displayed
    - expect: The success message 'Congratulations student. You successfully logged in!' is visible
    - expect: The 'Log out' link is visible and functional

#### 1.3. TC-LOGIN-003: Invalid username with valid password shows error

**File:** `tests/login-page-smoke-test/invalid-username.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'invalidUser' in the Username field
    - expect: The invalid username is entered
3. Enter 'Password123' in the Password field
    - expect: The valid password is entered
4. Click the Submit button
    - expect: The page remains on the login URL (no navigation occurs)
    - expect: An error message is displayed
    - expect: The error message text is 'Your username is invalid!'
    - expect: The Username field retains the entered value
    - expect: The Password field retains the entered value

#### 1.4. TC-LOGIN-004: Valid username with invalid password shows error

**File:** `tests/login-page-smoke-test/invalid-password.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'student' in the Username field
    - expect: The valid username is entered
3. Enter 'wrongPassword' in the Password field
    - expect: The invalid password is entered
4. Click the Submit button
    - expect: The page remains on the login URL (no navigation occurs)
    - expect: An error message is displayed
    - expect: The error message text is 'Your password is invalid!'
    - expect: The Username field retains the entered value
    - expect: The Password field retains the entered value

#### 1.5. TC-LOGIN-005: Empty credentials submission shows error

**File:** `tests/login-page-smoke-test/empty-fields.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Leave Username field empty
    - expect: Username field remains empty
3. Leave Password field empty
    - expect: Password field remains empty
4. Click the Submit button
    - expect: The page remains on the login URL
    - expect: An error message is displayed
    - expect: The error message text is 'Your username is invalid!'

#### 1.6. TC-LOGIN-006: Empty username with valid password shows error

**File:** `tests/login-page-smoke-test/empty-username.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Leave Username field empty
    - expect: Username field remains empty
3. Enter 'Password123' in the Password field
    - expect: The password is entered
4. Click the Submit button
    - expect: The page remains on the login URL
    - expect: An error message is displayed
    - expect: The error message text is 'Your username is invalid!'

#### 1.7. TC-LOGIN-007: Valid username with empty password shows error

**File:** `tests/login-page-smoke-test/empty-password.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'student' in the Username field
    - expect: The username is entered
3. Leave Password field empty
    - expect: Password field remains empty
4. Click the Submit button
    - expect: The page remains on the login URL
    - expect: An error message is displayed
    - expect: The error message text is 'Your password is invalid!'

#### 1.8. TC-LOGIN-008: Log out link navigates back to login page

**File:** `tests/login-page-smoke-test/logout.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the login page and login with valid credentials (student/Password123)
    - expect: The user is logged in and redirected to the success page
2. Click the 'Log out' link
    - expect: The page navigates back to the login page
    - expect: The URL is https://practicetestautomation.com/practice-test-login/
    - expect: The page title is 'Test Login | Practice Test Automation'
    - expect: The login form is displayed
    - expect: No error message is shown

#### 1.9. TC-LOGIN-009: Username field is case-sensitive

**File:** `tests/login-page-smoke-test/username-case-sensitivity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'Student' (capital S) in the Username field
    - expect: The username is entered
3. Enter 'Password123' in the Password field
    - expect: The password is entered
4. Click the Submit button
    - expect: The page remains on the login URL
    - expect: An error message is displayed
    - expect: The error message text is 'Your username is invalid!'

#### 1.10. TC-LOGIN-010: Password field is case-sensitive

**File:** `tests/login-page-smoke-test/password-case-sensitivity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'student' in the Username field
    - expect: The username is entered
3. Enter 'password123' (lowercase 'p') in the Password field
    - expect: The password is entered
4. Click the Submit button
    - expect: The page remains on the login URL
    - expect: An error message is displayed
    - expect: The error message text is 'Your password is invalid!'

#### 1.11. TC-LOGIN-011: Password field masks input characters

**File:** `tests/login-page-smoke-test/password-masking.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'Password123' in the Password field
    - expect: The password is entered in the field
    - expect: The password field input type is 'password' (characters are masked)

#### 1.12. TC-LOGIN-012: Submit button can be triggered with Enter key

**File:** `tests/login-page-smoke-test/submit-with-enter.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter 'student' in the Username field
    - expect: The username is entered
3. Enter 'Password123' in the Password field
    - expect: The password is entered
4. Press the Enter key
    - expect: The form is submitted
    - expect: The page navigates to the success page
    - expect: The URL contains 'practicetestautomation.com/logged-in-successfully/'

#### 1.13. TC-LOGIN-013: Multiple failed login attempts display error each time

**File:** `tests/login-page-smoke-test/multiple-failed-attempts.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Enter invalid credentials and click Submit
    - expect: The error message 'Your username is invalid!' is displayed
3. Clear fields and enter different invalid credentials, then click Submit
    - expect: The appropriate error message is displayed again
4. Clear fields and enter valid credentials, then click Submit
    - expect: The login succeeds and navigates to the success page

#### 1.14. TC-LOGIN-014: Success page displays personalized message with username

**File:** `tests/login-page-smoke-test/success-message-content.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the login page
    - expect: The login page loads successfully
2. Login with valid credentials (student/Password123)
    - expect: The user is redirected to the success page
3. Verify the success message content
    - expect: The message contains 'Congratulations student'
    - expect: The message contains 'successfully logged in'
    - expect: The username 'student' is included in the personalized message

#### 1.15. TC-LOGIN-015: Direct navigation to success page without login

**File:** `tests/login-page-smoke-test/direct-success-page-access.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate directly to https://practicetestautomation.com/logged-in-successfully/ without logging in
    - expect: The page loads successfully
    - expect: The success page content is displayed (Note: This tests if the success page has authentication protection)
