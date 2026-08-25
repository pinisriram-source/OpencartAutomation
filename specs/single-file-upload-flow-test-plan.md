# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-25

## 1. Introduction

### 1.1 Test Plan Objectives

Validate single-file upload behavior (file selection, form submission, success-page display, filename fidelity, navigation state reset, and empty-submission handling) on the File Uploader feature (the-internet.herokuapp.com/upload) end-to-end via automated regression coverage, so future changes to this interaction don't regress silently and manual re-testing time is reduced.

## 2. Scope

### 2.1 In Scope
- File input control presence, attributes, and initial state
- File selection populating the input with the chosen filename before submission
- Successful upload navigating to the success page with correct filename display
- Filename fidelity: exact match including extension, spaces, special characters, unicode, multiple dots, and no-extension filenames
- Empty-submission behavior (no file selected) — validation message vs. server error
- Sequential uploads: second upload replaces the first, no stale state
- Back-navigation from success page returning to a clean upload form
- Form element attributes (action, method, enctype) and single-file enforcement

### 2.2 Out of Scope
- Drag-and-drop upload functionality (the page mentions it, but only the file-input-driven flow is covered by this suite's acceptance criteria)
- Visual/pixel-level styling of the upload control or success page (covered by functional checks only)
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the upload endpoint
- Security testing (e.g., malicious file upload, path traversal)
- Server-side file storage verification (only the client-visible success page is asserted)

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the Single File Upload Flow feature via Playwright, covering file selection, form submission, success-page verification, filename fidelity, validation behavior, and navigation state management end-to-end in the browser.

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
- File input control presence, attributes, and initial state (no file selected)
- File selection populating the input with the chosen filename before submission
- Successful file upload navigating to the success page with correct filename display
- Filename fidelity across edge cases (spaces, special characters, unicode, multiple dots, no extension, long names)
- Empty-submission handling (validation message rather than unhandled server error)
- Sequential upload state management (second upload replaces first, no stale state)
- Back-navigation from success page returning to a clean, ready-to-use upload form
- Form element attributes (action, method, enctype) and single-file enforcement

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
No persistent database — test files are created dynamically by the automation suite (in-memory or temporary files generated at runtime). The target application at https://the-internet.herokuapp.com/upload is a stateless demo page; each upload is independent with no session carryover between tests.

## 13. Risks

### 13.1 Schedule
None — execution is on-demand, not calendar-bound; the only schedule risk is a stalled human review.

### 13.2 Technical
Running Claude Code non-interactively with the `playwright-test` MCP server in a fresh CI container is still relatively early — permission flags, MCP startup timing, or transient tool failures can cause a stage to need a re-run. The target application's empty-submission behavior (HTTP 500) means acceptance criterion #4 may fail as a known defect rather than a test bug.

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

The Single File Upload Flow feature is a straightforward web-based file upload form that accepts a single file at a time via either a file input control or a drag-and-drop upload area. The page consists of a heading "File Uploader", instructional text explaining the upload methods, a file input control (with a "Choose File" button), an "Upload" button, and a drag-and-drop area below. When a user selects a file via the file input control, the control displays the chosen file's name. Upon clicking "Upload" with a file selected, the form submits to the server and navigates to a success page that displays "File Uploaded!" as a heading and shows the uploaded file's name below it. The page mentions drag-and-drop functionality, though this suite focuses primarily on the file-input-driven flow. The application should validate that a file is selected before allowing a successful upload — attempting to upload without selecting a file currently results in an unhandled server error (HTTP 500 "Internal Server Error") rather than a user-friendly validation message. After a successful upload, navigating back via the browser's back button returns the user to the upload form in a clean state, ready for another upload.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify page loads with upload form elements present

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page heading 'File Uploader' is visible
    - expect: Instructional text about choosing/dragging a file is present
    - expect: File input control is visible
    - expect: Upload button is visible

#### 1.2. TC-UPLOAD-002: Verify file input control displays no file selected initially

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Inspect the file input control
    - expect: File input control shows no file selected (empty value or 'No file chosen' text)
    - expect: File input ID is 'file-upload'
    - expect: File input name attribute is 'file'

### 2. Successful File Upload

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-003: Upload a valid text file and verify success page

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a valid text file via the file input control (e.g., 'test-upload.txt')
    - expect: File input control displays the chosen file's name 'test-upload.txt'
    - expect: Upload button remains visible and clickable
3. Click the Upload button
    - expect: Page navigates to the upload success page
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Success heading 'File Uploaded!' is visible
    - expect: Uploaded file name 'test-upload.txt' is displayed below the heading
    - expect: File name matches exactly what was selected (including extension)

#### 2.2. TC-UPLOAD-004: Upload a valid image file (PNG) and verify success page

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a valid PNG image file via the file input control (e.g., 'test-image.png')
    - expect: File input control displays 'test-image.png'
3. Click the Upload button
    - expect: Page navigates to the upload success page
    - expect: Success heading 'File Uploaded!' is visible
    - expect: Uploaded file name 'test-image.png' is displayed
    - expect: File extension '.png' is preserved

#### 2.3. TC-UPLOAD-005: Upload a file with spaces and special characters in filename

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with spaces/special characters in name (e.g., 'My Test File (1).txt')
    - expect: File input control displays the full filename with spaces and special characters
3. Click the Upload button
    - expect: Page navigates to the upload success page
    - expect: Success heading is visible
    - expect: Displayed file name matches the original filename exactly, preserving spaces and special characters

#### 2.4. TC-UPLOAD-006: Upload a file with a long filename

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with a long filename (e.g., 'this-is-a-very-long-filename-that-exceeds-typical-length-expectations-for-testing-purposes.txt', 100+ characters)
    - expect: File input control displays the filename (may be truncated in the control's display, but internally stored)
3. Click the Upload button
    - expect: Page navigates to the upload success page
    - expect: Success heading is visible
    - expect: Displayed file name on success page is not truncated — the entire long filename is shown

### 3. Sequential Upload State Management

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-007: Upload a second file after a previous successful upload replaces the displayed filename

**File:** `tests/single-file-upload-flow/sequential-upload.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a first file (e.g., 'first-file.txt')
    - expect: File input shows 'first-file.txt'
3. Click the Upload button
    - expect: Success page displays 'first-file.txt' as the uploaded file
4. Navigate back to the upload form using the browser's back button
    - expect: Upload form page reloads
    - expect: File input control is in a clean state (no file pre-selected)
    - expect: Upload form is ready for a new file selection
5. Select a second, different file (e.g., 'second-file.txt')
    - expect: File input shows 'second-file.txt'
6. Click the Upload button
    - expect: Success page displays 'second-file.txt'
    - expect: Success page does NOT show 'first-file.txt' (no stale state)
    - expect: Only the new file's name is displayed

#### 3.2. TC-UPLOAD-008: Navigating back from success page returns to a clean upload form

**File:** `tests/single-file-upload-flow/sequential-upload.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file (e.g., 'test-file.txt') and upload it
    - expect: Success page is displayed with 'test-file.txt'
3. Click the browser's back button
    - expect: Upload form page reloads
    - expect: File input control shows no file selected (clean state)
    - expect: Page heading 'File Uploader' is visible
    - expect: Instructional text is present
    - expect: Upload button is visible and functional

### 4. Validation and Negative Cases

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-009: Clicking Upload with no file selected displays a validation message (not server error)

**File:** `tests/single-file-upload-flow/validation-negative.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
    - expect: File input control shows no file selected
2. Click the Upload button without selecting a file
    - expect: A user-friendly validation message is displayed (e.g., 'Please select a file to upload' or browser's native validation)
    - expect: Page does NOT navigate to an 'Internal Server Error' page
    - expect: User remains on the upload form
    - expect: Form is still functional for file selection

#### 4.2. TC-UPLOAD-010: Selecting a file then clearing selection before upload

**File:** `tests/single-file-upload-flow/validation-negative.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file via the file input control (e.g., 'test.txt')
    - expect: File input displays 'test.txt'
3. Clear the file selection (click 'Choose File' again and cancel without selecting, or programmatically clear if the UI allows)
    - expect: File input shows no file selected again
4. Click the Upload button
    - expect: A validation message is displayed (same as TC-UPLOAD-009)
    - expect: No server error occurs
    - expect: User remains on the upload form

#### 4.3. TC-UPLOAD-011: File input control accepts and uploads a zero-byte (empty) file

**File:** `tests/single-file-upload-flow/validation-negative.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a zero-byte file (e.g., 'empty.txt' with 0 bytes)
    - expect: File input displays 'empty.txt'
3. Click the Upload button
    - expect: Either: success page displays 'empty.txt' (application allows zero-byte uploads), OR a clear validation message is shown explaining zero-byte files are not accepted
    - expect: In either case, no unhandled server error occurs

### 5. File Input Control Behavior

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-012: Selecting a file via file input populates the control with the filename before submission

**File:** `tests/single-file-upload-flow/file-input-behavior.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
    - expect: File input control shows no file selected
2. Click the 'Choose File' button and select a file (e.g., 'sample.txt') from the file picker dialog
    - expect: File picker dialog closes
    - expect: File input control immediately displays 'sample.txt'
    - expect: No page reload or navigation occurs from file selection alone
    - expect: Upload button remains on the page, ready to be clicked

#### 5.2. TC-UPLOAD-013: Replacing a selected file with a different file updates the file input display

**File:** `tests/single-file-upload-flow/file-input-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a first file (e.g., 'file-one.txt')
    - expect: File input displays 'file-one.txt'
3. Click 'Choose File' again and select a different file (e.g., 'file-two.txt'), replacing the first selection
    - expect: File input now displays 'file-two.txt' (not 'file-one.txt')
    - expect: Only one file is selected (no multi-file list)
    - expect: Upload button remains functional
4. Click the Upload button
    - expect: Success page displays 'file-two.txt' (the most recently selected file)
    - expect: Success page does NOT show 'file-one.txt'

#### 5.3. TC-UPLOAD-014: File input control does not accept multiple files simultaneously (single file upload)

**File:** `tests/single-file-upload-flow/file-input-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Inspect the file input control's HTML attributes
    - expect: File input does NOT have a 'multiple' attribute (or it is explicitly false)
    - expect: File input is configured to accept only a single file
3. Attempt to select multiple files via the file picker (Shift+click or Ctrl+click multiple files in the dialog, if the control allows it)
    - expect: If the control enforces single-file selection, only one file is selected (typically the last clicked)
    - expect: File input displays only one filename
    - expect: No multi-file list appears

### 6. Form Element Attributes and Accessibility

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-015: File input control has correct HTML attributes (id, name, type)

**File:** `tests/single-file-upload-flow/form-attributes.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Inspect the file input control's HTML attributes
    - expect: File input type attribute is 'file'
    - expect: File input id is 'file-upload'
    - expect: File input name attribute is 'file'
    - expect: File input is not marked as 'required' in HTML (client-side validation is not enforced by the required attribute)

#### 6.2. TC-UPLOAD-016: Upload button has correct attributes and is clickable before file selection

**File:** `tests/single-file-upload-flow/form-attributes.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Inspect the Upload button's attributes
    - expect: Upload button id is 'file-submit'
    - expect: Upload button type is 'submit'
    - expect: Upload button is NOT disabled initially (it is enabled even before a file is selected)
    - expect: Upload button is clickable

#### 6.3. TC-UPLOAD-017: Form element has correct action and method attributes

**File:** `tests/single-file-upload-flow/form-attributes.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Inspect the form element's attributes
    - expect: Form action attribute is 'https://the-internet.herokuapp.com/upload' (or just '/upload' as a relative path)
    - expect: Form method attribute is 'post'
    - expect: Form enctype is 'multipart/form-data' (required for file uploads)

### 7. Edge Cases and Boundary Conditions

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-UPLOAD-018: Upload a file with no extension

**File:** `tests/single-file-upload-flow/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with no file extension (e.g., filename is just 'testfile' with no dot or extension)
    - expect: File input displays 'testfile'
3. Click the Upload button
    - expect: Success page displays 'testfile' (the exact filename)
    - expect: No error occurs from the missing extension
    - expect: Filename is not altered or truncated

#### 7.2. TC-UPLOAD-019: Upload a file with multiple dots in the filename

**File:** `tests/single-file-upload-flow/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with multiple dots (e.g., 'my.test.file.backup.txt')
    - expect: File input displays 'my.test.file.backup.txt'
3. Click the Upload button
    - expect: Success page displays 'my.test.file.backup.txt' exactly
    - expect: All dots are preserved in the displayed filename

#### 7.3. TC-UPLOAD-020: Upload a file with unicode characters in the filename

**File:** `tests/single-file-upload-flow/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with unicode/non-ASCII characters (e.g., 'tëst-fîlé.txt')
    - expect: File input displays the unicode filename
3. Click the Upload button
    - expect: Success page displays the unicode filename correctly (not garbled or replaced with '?')
    - expect: Unicode characters are preserved in the displayed filename
