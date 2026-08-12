# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-12

## 1. Introduction

### 1.1 Test Plan Objectives

Validate the classic HTML file-input upload flow (select file → click Upload → verify confirmation) on the File Uploader page (the-internet.herokuapp.com/upload) end-to-end via automated regression coverage, ensuring filename preservation across file types and special characters, correct error behavior when no file is selected, and proper state reset between uploads — so future changes to this interaction don't regress silently and manual re-testing time is reduced.

## 2. Scope

### 2.1 In Scope
- Initial page state verification (heading, empty file input, no confirmation present)
- Basic upload happy path (file selection, submit, confirmation view with filename)
- Multiple file types (.txt, .png, .json, .pdf) each uploading successfully
- Special character filenames (spaces, parentheses, dashes/underscores, multiple dots) preserved exactly
- Negative case: clicking Upload with no file selected (observing actual error behavior)
- State reset: navigating back to /upload after a successful upload restores initial state
- File input behavior (selection change before submit, button state, URL stability)
- Boundary cases (very long filename, extensionless file)

### 2.2 Out of Scope
- The drag-and-drop upload widget on the same page (explicitly excluded by the testing request)
- Visual/pixel-level styling of the upload form (covered by functional checks only, not appearance)
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the upload endpoint
- Security penetration testing (file content validation, path traversal, etc.)

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the File Uploader's classic file-input flow via Playwright, covering file selection, form submission, confirmation display, filename preservation, error behavior, and state management end-to-end in the browser.

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
- Initial page state (File Uploader heading, empty file input, Upload button, absence of confirmation)
- File upload via classic file input + submit button (POST to /upload)
- Confirmation view display ("File Uploaded!" heading with exact filename)
- Filename preservation across multiple file types (.txt, .png, .json, .pdf)
- Filename preservation for names containing spaces, parentheses, dashes, underscores, and multiple dots
- Error behavior when submitting without a file selected
- State reset (page returns to initial empty state on re-navigation after upload)
- File input selection change before submission
- Upload button enabled state throughout interaction
- URL stability (remains /upload throughout the flow)

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
No persistent test data or database — the upload page at the-internet.herokuapp.com/upload is a stateless demo; each test creates its own file programmatically (via Playwright's `setInputFiles` with a buffer) and uploads are not persisted across page loads. No login or session state is required.

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

The Single File Upload Flow feature allows users to upload files via a traditional HTML file input element and submit button. The page displays a "File Uploader" heading and instructional text with two upload methods (file input and drag-and-drop widget); this test plan covers ONLY the file input + submit button flow, not the drag-and-drop widget. The file input (id="file-upload") allows users to select a file from their system, and the submit button (id="file-submit") triggers a POST to /upload. Upon successful upload, the page displays a "File Uploaded!" confirmation heading and shows the uploaded file's exact filename. The page accepts various file types and preserves the filename exactly as provided, including spaces and special characters. Clicking Upload with no file selected results in an "Internal Server Error" response (500 status). After a successful upload, navigating back to the /upload URL resets the page to its initial empty state with no persisted upload data.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify initial page state shows empty file input and no confirmation

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page title is 'The Internet'
2. Inspect the page content
    - expect: 'File Uploader' heading (h3) is visible
    - expect: Instruction text 'Choose a file on your system and then click upload. Or, drag and drop a file into the area below.' is visible
    - expect: File input (#file-upload) is visible and empty
    - expect: Upload button (#file-submit) with text 'Upload' is visible and enabled
    - expect: No 'File Uploaded!' heading is present on the page
    - expect: No uploaded filename is displayed anywhere on the page

### 2. Basic Upload Happy Path

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-002: Basic upload with .txt file succeeds and shows confirmation

**File:** `tests/single-file-upload-flow/basic-upload-happy-path.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a .txt file in the file input (e.g., 'test.txt')
    - expect: File is selected in the input
3. Click the Upload button
    - expect: Page navigates/reloads to the confirmation view
    - expect: URL remains https://the-internet.herokuapp.com/upload
    - expect: 'File Uploaded!' heading is visible
    - expect: The exact filename 'test.txt' is displayed on the confirmation view

#### 2.2. TC-UPLOAD-003: Upload confirmation displays exact uploaded filename

**File:** `tests/single-file-upload-flow/basic-upload-happy-path.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a .txt file with a unique name (e.g., 'my-test-file.txt')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
4. Verify the displayed filename
    - expect: The displayed filename exactly matches 'my-test-file.txt' (the name provided)
    - expect: Filename is displayed in the content area below the 'File Uploaded!' heading

### 3. Multiple File Types

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-004: Upload .png image file succeeds and shows correct filename

**File:** `tests/single-file-upload-flow/multiple-file-types.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a .png file in the file input (e.g., 'image.png')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The exact filename 'image.png' is displayed

#### 3.2. TC-UPLOAD-005: Upload .json file succeeds and shows correct filename

**File:** `tests/single-file-upload-flow/multiple-file-types.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a .json file in the file input (e.g., 'data.json')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The exact filename 'data.json' is displayed

#### 3.3. TC-UPLOAD-006: Upload .pdf file succeeds and shows correct filename

**File:** `tests/single-file-upload-flow/multiple-file-types.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a .pdf file in the file input (e.g., 'document.pdf')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The exact filename 'document.pdf' is displayed

### 4. Special Character Filenames

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-007: Filename with spaces preserved exactly on confirmation

**File:** `tests/single-file-upload-flow/special-character-filenames.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file whose name contains spaces (e.g., 'my test file.txt')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The displayed filename is exactly 'my test file.txt', with spaces unmodified

#### 4.2. TC-UPLOAD-008: Filename with parentheses and spaces preserved exactly

**File:** `tests/single-file-upload-flow/special-character-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file with parentheses in the name (e.g., 'my file (1).txt')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The displayed filename is exactly 'my file (1).txt', unmodified

#### 4.3. TC-UPLOAD-009: Filename with dashes and underscores preserved exactly

**File:** `tests/single-file-upload-flow/special-character-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file with dashes and underscores (e.g., 'test_file-v2.txt')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The displayed filename is exactly 'test_file-v2.txt', unmodified

#### 4.4. TC-UPLOAD-010: Filename with dots (multiple extensions pattern) preserved exactly

**File:** `tests/single-file-upload-flow/special-character-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file with multiple dots in the name (e.g., 'backup.2024.01.15.tar.gz')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The displayed filename is exactly 'backup.2024.01.15.tar.gz', unmodified

### 5. Negative Case: No File Selected

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-011: Clicking Upload with no file selected results in server error

**File:** `tests/single-file-upload-flow/negative-no-file-selected.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input is empty
2. Click the Upload button without selecting any file
    - expect: Page navigates/reloads
    - expect: An 'Internal Server Error' heading (h1) is displayed
    - expect: No 'File Uploaded!' confirmation appears
    - expect: No uploaded filename is displayed
    - expect: This is the actual observed behavior (500 error), not a validation message

### 6. Sequential Uploads

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-012: Multiple sequential uploads each show their own correct filename

**File:** `tests/single-file-upload-flow/sequential-uploads.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a .txt file (e.g., 'first.txt') and click Upload
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: Filename 'first.txt' is displayed
3. Navigate back to https://the-internet.herokuapp.com/upload
    - expect: Page resets to initial state
    - expect: File input is empty
    - expect: No confirmation or previous filename is visible
4. Select a different file (e.g., 'second.png') and click Upload
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: Filename 'second.png' is displayed (not 'first.txt')

### 7. State Reset After Upload

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-UPLOAD-013: After successful upload, navigating back resets page to initial state

**File:** `tests/single-file-upload-flow/state-reset-after-upload.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file (e.g., 'test.txt') and click Upload
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: Filename 'test.txt' is displayed
3. Navigate back to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: 'File Uploader' heading is visible (not 'File Uploaded!')
    - expect: File input is empty and visible
    - expect: Upload button is visible
    - expect: No 'File Uploaded!' heading is present
    - expect: No uploaded filename is displayed
    - expect: Page is in the same initial state as AC1

### 8. File Input Behavior

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-UPLOAD-014: File input accepts selection change before upload

**File:** `tests/single-file-upload-flow/file-input-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a .txt file (e.g., 'original.txt')
    - expect: File 'original.txt' is selected in the input
3. Before clicking Upload, select a different file (e.g., 'replacement.json')
    - expect: File 'replacement.json' is now selected, replacing 'original.txt'
4. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The displayed filename is 'replacement.json' (the last selected file, not 'original.txt')

#### 8.2. TC-UPLOAD-015: Upload button remains enabled throughout interaction

**File:** `tests/single-file-upload-flow/file-input-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: Upload button is visible and enabled
2. Select a file in the file input
    - expect: Upload button remains enabled (not disabled)
3. Clear the file selection (select then cancel file dialog)
    - expect: Upload button remains enabled even with no file selected

#### 8.3. TC-UPLOAD-016: Page URL remains /upload throughout the upload flow

**File:** `tests/single-file-upload-flow/file-input-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: URL is exactly https://the-internet.herokuapp.com/upload
2. Select a file and click Upload
    - expect: Confirmation view appears
    - expect: URL remains exactly https://the-internet.herokuapp.com/upload (no query params or path change)
3. Navigate back to /upload
    - expect: URL is still exactly https://the-internet.herokuapp.com/upload

### 9. Boundary Cases

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-UPLOAD-017: Large filename (long string) is displayed completely

**File:** `tests/single-file-upload-flow/boundary-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file with a very long filename (e.g., 'this_is_a_very_long_filename_that_contains_many_characters_and_should_still_be_displayed_correctly.txt' - 100+ chars)
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The complete long filename is displayed (not truncated or cut off)

#### 9.2. TC-UPLOAD-018: File with no extension (extensionless filename) uploads successfully

**File:** `tests/single-file-upload-flow/boundary-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file with no extension (e.g., filename 'README' or 'Makefile')
    - expect: File is selected
3. Click the Upload button
    - expect: Confirmation view appears
    - expect: 'File Uploaded!' heading is visible
    - expect: The exact filename (with no extension) is displayed
