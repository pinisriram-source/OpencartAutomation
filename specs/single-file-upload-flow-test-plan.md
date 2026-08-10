# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-10

## 1. Introduction

### 1.1 Test Plan Objectives

Validate the classic HTML file-input upload flow (select file → click Upload → confirm) on the File Upload feature (the-internet.herokuapp.com/upload) end-to-end via automated regression coverage, ensuring various file types and filenames (including special characters) upload correctly, the negative case of submitting without a file is handled, and page state resets properly between uploads.

## 2. Scope

### 2.1 In Scope
- Initial page-load state verification (heading, empty file input, no confirmation present)
- Happy-path upload via the classic file input (id="file-upload") + submit button (id="file-submit")
- Upload confirmation view showing "File Uploaded!" heading and the exact uploaded filename
- Multiple file types (.txt, .png, .json, .pdf) uploading successfully
- Filenames containing spaces, parentheses, hyphens, and underscores displaying unmodified after upload
- Negative case: submitting the form with no file selected
- State reset: navigating back to the upload page after a successful upload returns to initial empty state

### 2.2 Out of Scope
- The drag-and-drop upload widget present on the same page (explicitly excluded by the acceptance criteria)
- Visual/pixel-level styling of the upload form or confirmation view
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing, security penetration testing
- Server-side validation of uploaded file content (only the UI confirmation is verified)
- File size limits or large-file upload behavior (not specified in acceptance criteria)

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the File Upload feature via Playwright, covering the full upload lifecycle (initial state → file selection → submission → confirmation → state reset) end-to-end in the browser, across multiple file types and filename patterns.

### 3.2 Performance Test
Not applicable — performance/load testing is out of scope for this suite (see Section 2.2).

### 3.3 Security Test
Not applicable — security penetration testing is explicitly out of scope for this project (see Section 2.2).

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

**Actual environment:** GitHub Actions `ubuntu-latest` runner, Node.js (`lts/*`), Playwright + Chromium (installed via `npx playwright install --with-deps chromium`), target application reachable at https://the-internet.herokuapp.com/upload.

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
Failing tests are recorded with expected/actual behavior in `streamlit_app/data/single-file-upload-flow-test-results.json`'s `defects` array and rendered in the dashboard's Defects Log tab.

## 7. Functions to be Tested
- Initial page-load state (File Uploader heading, empty file input, Upload button, no confirmation present)
- Classic file input selection and form submission via the Upload button
- Upload confirmation view (File Uploaded! heading, exact filename display)
- Multiple file type uploads (.txt, .png, .json, .pdf)
- Filename preservation for names with spaces, parentheses, hyphens, and underscores
- Negative case: form submission without a file selected
- Page state reset after successful upload (fresh navigation returns to initial state)

## 8. Resources and Responsibilities

### 8.1 Resources
Claude Code (via AWS Bedrock, non-interactive `npx claude -p` invocations), the `playwright-test-planner` and `playwright-test-generator` subagents, GitHub Actions compute, and the Streamlit dashboard for review/reporting.

### 8.2 Responsibilities
- **QA Automation Engineer:** `playwright-test-planner` (this plan) and `playwright-test-generator` (the automation suite) Claude Code subagents
- **DevOps / CI Engineer:** the three-stage GitHub Actions pipeline (`pipeline-plan.yml` / `pipeline-automation.yml` / `pipeline-execute.yml`)
- **Product Owner / QA Lead:** whoever approves each stage in the dashboard's Review Pipeline Artifacts tab

## 9. Deliverables
- This test plan (`specs/single-file-upload-flow-test-plan.md`)
- The generated Playwright automation suite (`tests/single-file-upload-flow/`)
- The executed test-results report (`streamlit_app/data/single-file-upload-flow-test-results.json`), visible in the Streamlit dashboard

## 10. Suspension/Exit Criteria

**Suspension:** the pipeline halts (and marks the stage `failed` in `user-stories/single-file-upload-flow-review.json`) if the target application is unreachable, or if a stage's Claude Code run errors out before producing its expected artifact.

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
No persistent test data or database — the-internet.herokuapp.com/upload is a stateless demo page; uploaded files do not persist across page loads. Test files (.txt, .png, .json, .pdf) are created programmatically by the test fixtures or stored as small fixtures under `tests/data/`.

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
This file, the generated spec files under `tests/single-file-upload-flow/`, and `CLAUDE.md` (project rules and conventions).

## 16. Approvals
Recorded per-stage in `user-stories/single-file-upload-flow-review.json` (`plan.status`, `automation.status`, `execute.status`) and reflected in the Streamlit dashboard's Review Pipeline Artifacts tab — not a signature block, since approvals happen through that tab's Approve/Request Changes actions.

## 17. Application Overview

The Single File Upload Flow feature provides a classic HTML file input mechanism for users to select and upload a single file from their local machine. The page displays a "File Uploader" heading, a standard file input element (id="file-upload"), and an "Upload" submit button (id="file-submit"). When a user successfully selects a file and clicks Upload, the page reloads to a confirmation view at the same URL, displaying a "File Uploaded!" heading and the exact filename of the uploaded file. The page also contains a drag-and-drop upload widget, which is explicitly out of scope for this test suite — only the classic file input + submit button flow is tested here. The feature should handle various file types and filenames including those with special characters, while properly handling the edge case of submitting without a file selected (which results in an Internal Server Error page rather than a validation message).

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify initial page load state shows file input and no confirmation

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page title is 'The Internet'
2. Verify the initial page content
    - expect: Heading 'File Uploader' (h3) is visible
    - expect: File input element (id='file-upload') is present and empty
    - expect: Upload button (id='file-submit') is visible and enabled
    - expect: Instructional text 'Choose a file on your system and then click upload.' is present
    - expect: No 'File Uploaded!' heading is present
    - expect: No uploaded filename is displayed anywhere on the page

### 2. Happy Path Upload

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-002: Upload a text file successfully shows File Uploaded confirmation

**File:** `tests/single-file-upload-flow/happy-path-upload.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: Initial state is correct (File Uploader heading visible)
2. Select a text file (e.g., 'test-file.txt') using the file input
    - expect: File is selected in the input
    - expect: File input shows the selected file
3. Click the Upload button
    - expect: Page reloads/navigates
    - expect: URL remains https://the-internet.herokuapp.com/upload
    - expect: Heading changes to 'File Uploaded!' (h3)
    - expect: The exact filename 'test-file.txt' is displayed on the confirmation view
    - expect: The original file input and instructional text are no longer present

#### 2.2. TC-UPLOAD-003: Upload a markdown file successfully shows File Uploaded confirmation

**File:** `tests/single-file-upload-flow/happy-path-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a markdown file (e.g., 'CLAUDE.md') using the file input
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The exact filename 'CLAUDE.md' is displayed

### 3. Multiple File Types

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-004: Upload a PNG image file successfully

**File:** `tests/single-file-upload-flow/multiple-file-types.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a PNG file (e.g., 'test-image.png') using the file input
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The exact filename 'test-image.png' is displayed

#### 3.2. TC-UPLOAD-005: Upload a JSON file successfully

**File:** `tests/single-file-upload-flow/multiple-file-types.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a JSON file (e.g., 'package.json') using the file input
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The exact filename 'package.json' is displayed

#### 3.3. TC-UPLOAD-006: Upload a PDF file successfully

**File:** `tests/single-file-upload-flow/multiple-file-types.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a PDF file (e.g., 'document.pdf') using the file input
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The exact filename 'document.pdf' is displayed

### 4. Special Characters in Filename

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-007: Upload file with spaces in name preserves exact filename

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named 'my file.txt' (contains spaces)
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The displayed filename is exactly 'my file.txt' with spaces preserved
    - expect: Spaces are not replaced with underscores or URL-encoded

#### 4.2. TC-UPLOAD-008: Upload file with parentheses in name preserves exact filename

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named 'file (1).txt' (contains parentheses)
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The displayed filename is exactly 'file (1).txt' with parentheses preserved
    - expect: Parentheses are not escaped or removed

#### 4.3. TC-UPLOAD-009: Upload file with spaces and parentheses preserves exact filename

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named 'my file (1).txt' (contains both spaces and parentheses)
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The displayed filename is exactly 'my file (1).txt' completely unmodified
    - expect: All special characters (spaces and parentheses) are preserved exactly as provided

#### 4.4. TC-UPLOAD-010: Upload file with hyphens and underscores in name

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named 'test_file-name.txt' (contains underscore and hyphen)
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page reloads to confirmation view
    - expect: Heading is 'File Uploaded!'
    - expect: The displayed filename is exactly 'test_file-name.txt' with underscore and hyphen preserved

### 5. Negative and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-011: Clicking Upload without selecting a file shows Internal Server Error

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input is empty (no file selected)
2. Click the Upload button without selecting any file
    - expect: Page navigates/reloads
    - expect: An 'Internal Server Error' heading (h1) is displayed
    - expect: The upload does NOT complete successfully (no 'File Uploaded!' message)
    - expect: URL remains https://the-internet.herokuapp.com/upload

#### 5.2. TC-UPLOAD-012: File input accepts file selection via browser dialog

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file using the file input via Playwright's setInputFiles API
    - expect: File input element now shows the selected filename
    - expect: The file is queued for upload (verifiable via input.files.length > 0)
3. Verify the file input reflects the selection before submission
    - expect: Upload button remains enabled and ready to submit

#### 5.3. TC-UPLOAD-013: Selecting then clearing a file leaves input empty and submit fails

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input is empty
2. Select a file (e.g., 'test.txt')
    - expect: File input shows 'test.txt' is selected
3. Clear the file selection (setInputFiles with empty array)
    - expect: File input is now empty
    - expect: No file is selected (input.files.length === 0)
4. Click the Upload button
    - expect: Behaves as AC6 (no file selected case): 'Internal Server Error' is displayed

### 6. State Reset After Upload

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-014: After successful upload, navigating back to /upload resets to initial state

**File:** `tests/single-file-upload-flow/state-reset-after-upload.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully in initial state
2. Select a file (e.g., 'reset-test.txt') and click Upload
    - expect: Upload succeeds
    - expect: Confirmation view shows 'File Uploaded!' heading and 'reset-test.txt'
3. Navigate back to https://the-internet.herokuapp.com/upload (fresh page load)
    - expect: Page resets to initial empty state (AC1)
    - expect: Heading is 'File Uploader' (not 'File Uploaded!')
    - expect: File input is empty (no file pre-selected)
    - expect: No filename is displayed from the previous upload
    - expect: The previous upload does not persist

#### 6.2. TC-UPLOAD-015: Multiple uploads in sequence each show correct filename

**File:** `tests/single-file-upload-flow/state-reset-after-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Upload 'first-file.txt'
    - expect: Confirmation view shows 'File Uploaded!' and 'first-file.txt'
3. Navigate back to https://the-internet.herokuapp.com/upload
    - expect: Page resets to initial state
4. Upload 'second-file.json'
    - expect: Confirmation view shows 'File Uploaded!' and 'second-file.json'
    - expect: The displayed filename is 'second-file.json' (not 'first-file.txt')
    - expect: Each upload is independent

#### 6.3. TC-UPLOAD-016: Refreshing the page after upload resets state

**File:** `tests/single-file-upload-flow/state-reset-after-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload and upload 'refresh-test.txt'
    - expect: Confirmation view is displayed with 'File Uploaded!' and 'refresh-test.txt'
2. Refresh the page (page.reload())
    - expect: Page reloads to the initial empty upload form state
    - expect: Heading is 'File Uploader'
    - expect: File input is empty
    - expect: No confirmation or filename from the previous upload is shown
