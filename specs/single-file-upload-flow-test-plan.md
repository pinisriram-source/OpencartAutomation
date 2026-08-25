# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-25

## 1. Introduction

### 1.1 Test Plan Objectives

Validate single-file upload functionality (file selection, form submission, success-page display, name integrity, sequential upload replacement, back-navigation state reset, and empty-upload error handling) on the File Uploader feature (the-internet.herokuapp.com/upload) end-to-end via automated regression coverage, so future changes to this interaction don't regress silently and manual re-testing time is reduced.

## 2. Scope

### 2.1 In Scope
- Initial page state verification (heading, file input, upload button)
- File selection behavior via the file input control
- Successful file upload flow and success page display
- File name integrity on the success page (exact match, no truncation)
- Empty upload validation behavior (no file selected)
- Sequential uploads (second file replaces first, no stale state)
- Back navigation from success page to clean upload form
- Negative/boundary cases: special characters, Unicode, long file names
- Drag-and-drop upload via Dropzone.js integration
- Form method and encoding verification

### 2.2 Out of Scope
- Visual/pixel-level styling of the upload form or success page (covered by functional assertions only, not appearance)
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the upload endpoint
- Security penetration testing (e.g., malicious file content, path traversal)
- Server-side file storage verification (only client-visible responses are tested)
- Multi-file upload (the input is single-file only)

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the File Uploader feature via Playwright, covering file selection, upload submission, success-page verification, sequential uploads, back-navigation, and error handling end-to-end in the browser.

### 3.2 Performance Test
Not applicable — performance/load testing is out of scope for this suite (see Section 2.2).

### 3.3 Security Test
Not applicable — security penetration testing is explicitly out of scope for this project (see Section 2.2).

### 3.4 Automated Test
100% of this suite is automated — Playwright (TypeScript), executed non-interactively by `pipeline-execute.yml`. There is no manual test execution step in this pipeline.

### 3.5 Stress and Volume Test
Not applicable — this pipeline does not exercise concurrent load or high data volumes; each test runs a single Chromium browser context sequentially.

### 3.6 Recovery Test
Not applicable — no crash/failover recovery scenarios are in scope for this static UI-level suite.

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
- File input control presence and behavior (choose file, display selected name)
- Upload button state and clickability
- Successful upload form submission and navigation to success page
- Success page content (heading, uploaded file name display)
- File name integrity between selection and success page display
- Empty upload error handling (no file selected)
- Sequential upload replacement (no stale state)
- Back navigation to clean form state
- Drag-and-drop file upload via Dropzone.js
- Form attributes (method, enctype, action)

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
No persistent test data or database — the-internet.herokuapp.com/upload is a stateless demo page with no login/session state; every test starts from a fresh navigation via `tests/seed.spec.ts`. Test files are created programmatically at runtime (e.g., text files with known names and content) via Playwright's `page.setInputFiles()` buffer API — no pre-existing fixture files on disk are required.

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

The Single File Upload Flow feature demonstrates file upload functionality on a web page. The page displays a "File Uploader" heading, instructional text mentioning both file selection and drag-and-drop, a file input control (rendered as a "Choose File" button), and an "Upload" button. Users can select a file from their local system either by clicking the file input or by dragging and dropping a file into the designated area. The page uses Dropzone.js to provide enhanced drag-and-drop functionality. Once a file is selected, its name appears in the file input field (with a "C:\fakepath\" prefix for security, which is standard browser behavior). Clicking the "Upload" button submits the form via POST with multipart/form-data encoding to the /upload endpoint. Upon successful upload, the page navigates to a success page displaying "File Uploaded!" as the heading and the uploaded file's name in a separate div below. The upload button is always enabled, even when no file is selected — there is no client-side validation preventing form submission. When Upload is clicked without a file selected, the server returns an "Internal Server Error" page rather than a user-friendly validation message. The page supports sequential uploads: after a successful upload, navigating back returns to the upload form in a clean state ready to accept a new file. The file name displayed on the success page exactly matches the originally selected file name (including extension).

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify page load shows file input, upload button, and heading

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
2. Inspect the page content
    - expect: Page heading 'File Uploader' is displayed
    - expect: Instruction text 'Choose a file on your system and then click upload. Or, drag and drop a file into the area below.' is displayed
    - expect: File input control (Choose File button) is present and visible
    - expect: Upload button is present and visible
    - expect: Upload button is enabled (not disabled)

### 2. File Selection

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-002: Selecting a file populates the input with the file name

**File:** `tests/single-file-upload-flow/file-selection.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a file using the file input control
    - expect: File input field is populated with the selected file's name
    - expect: File name includes the fakepath prefix (C:\fakepath\filename.txt)
    - expect: Upload button remains visible and enabled

#### 2.2. TC-UPLOAD-003: Replacing a selected file before upload shows the new file name

**File:** `tests/single-file-upload-flow/file-selection.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a first file (file1.txt)
    - expect: File input shows file1.txt
3. Select a different file (file2.txt) without uploading the first
    - expect: File input now shows file2.txt
    - expect: First file name (file1.txt) is replaced
    - expect: Only the most recently selected file is retained
4. Upload the file
    - expect: Success page displays file2.txt
    - expect: file1.txt is not uploaded or shown

#### 2.3. TC-UPLOAD-004: Cancelling the file picker leaves input empty

**File:** `tests/single-file-upload-flow/file-selection.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Click the Choose File button to open file picker
    - expect: File picker dialog opens
3. Cancel the file picker without selecting a file
    - expect: File picker closes
    - expect: File input remains empty
    - expect: No error is shown
    - expect: Page remains in initial state

### 3. Successful Upload

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-005: Uploading a file navigates to success page showing file name

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a valid text file (upload-sample.txt)
    - expect: File is selected and name appears in the input
3. Click the Upload button
    - expect: Form submits successfully
    - expect: Page navigates to the success page
    - expect: Success page displays 'File Uploaded!' heading
    - expect: Success page displays the exact file name 'upload-sample.txt'
    - expect: File name matches the selected file (including .txt extension)

#### 3.2. TC-UPLOAD-006: File name on success page exactly matches selected file with extension

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a file with a specific name and extension (test-document.pdf)
    - expect: File name appears in input field
3. Upload the file
    - expect: Upload succeeds and navigates to success page
4. Compare the displayed file name on success page with the original file name
    - expect: File name on success page exactly matches 'test-document.pdf'
    - expect: File extension is preserved (.pdf)
    - expect: No truncation or alteration of the file name
    - expect: No extra characters or modifications

### 4. Empty Upload Validation

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-007: Clicking Upload with no file shows error, not silent success

**File:** `tests/single-file-upload-flow/empty-upload-validation.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
    - expect: File input is empty
2. Click the Upload button without selecting a file
    - expect: Server returns an error response
    - expect: Page displays 'Internal Server Error' heading
    - expect: No success message is shown
    - expect: Upload does not silently succeed (user receives feedback that upload failed)

### 5. Sequential Uploads

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-008: Second upload replaces first file name with no stale state

**File:** `tests/single-file-upload-flow/sequential-uploads.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Upload the first file (file1.txt)
    - expect: First upload succeeds
    - expect: Success page shows 'file1.txt'
3. Navigate back to the upload form
    - expect: Upload page loads again
    - expect: Form is in clean state (no file selected)
4. Upload a second, different file (file2.txt)
    - expect: Second upload succeeds
    - expect: Success page shows 'file2.txt'
    - expect: No stale state from first upload
    - expect: First file name is NOT displayed

### 6. Back Navigation

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-009: Navigating back from success page returns to clean upload form

**File:** `tests/single-file-upload-flow/back-navigation.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Upload a file successfully
    - expect: Success page is displayed with file name
3. Click browser back button or navigate back
    - expect: Returns to upload page
    - expect: File input is empty (clean state)
    - expect: No previously selected file name is shown
    - expect: Form is ready to accept a new file selection
    - expect: No error messages are displayed

### 7. Upload Button State

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-UPLOAD-010: Upload button is always enabled regardless of file selection

**File:** `tests/single-file-upload-flow/upload-button-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
    - expect: Upload button is present
2. Check the Upload button disabled state initially (no file selected)
    - expect: Upload button is enabled (not disabled)
    - expect: Button can be clicked even with no file
3. Select a file
    - expect: Upload button remains enabled
4. Clear file selection (if possible via UI)
    - expect: Upload button still remains enabled (no client-side validation)

### 8. File Name Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-UPLOAD-011: File with special characters in name uploads and displays correctly

**File:** `tests/single-file-upload-flow/file-name-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a file with special characters in the name (test-file_v1.2.txt)
    - expect: File name appears in input field with special characters intact
3. Upload the file
    - expect: Upload succeeds
    - expect: Success page displays the exact file name including special characters
    - expect: Hyphens, underscores, and dots are preserved without encoding or alteration

#### 8.2. TC-UPLOAD-012: File with spaces in name uploads and displays correctly

**File:** `tests/single-file-upload-flow/file-name-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a file with spaces in the name (my upload file.txt)
    - expect: File name appears in input field with spaces intact
3. Upload the file
    - expect: Upload succeeds
    - expect: Success page displays 'my upload file.txt' exactly
    - expect: Spaces are not URL-encoded or replaced with other characters

#### 8.3. TC-UPLOAD-013: File with very long name uploads without system error

**File:** `tests/single-file-upload-flow/file-name-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a file with a very long name (200+ characters)
    - expect: File name appears in input field (may be truncated in display but stored)
3. Upload the file
    - expect: Upload succeeds or handles gracefully with appropriate error
    - expect: If successful, success page displays the full file name or indicates truncation appropriately
    - expect: No system crash or unhandled error

#### 8.4. TC-UPLOAD-014: File with Unicode characters in name uploads correctly

**File:** `tests/single-file-upload-flow/file-name-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a file with Unicode characters in the name (tëst-üpload.txt)
    - expect: File name appears in input field with Unicode characters
3. Upload the file
    - expect: Upload succeeds or handles gracefully
    - expect: If successful, success page displays the file name with Unicode characters correctly rendered
    - expect: If rejected, appropriate error message is shown (not a generic server error)

### 9. Drag and Drop Upload

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-UPLOAD-015: Drag-and-drop file into drop zone and upload successfully

**File:** `tests/single-file-upload-flow/drag-and-drop.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
    - expect: Instruction text mentions drag and drop functionality
2. Drag a file from the system and drop it into the designated drop zone
    - expect: File is accepted by the drop zone
    - expect: File name appears in the file input or in a Dropzone.js preview area
    - expect: Visual feedback indicates file was received (Dropzone.js styling)
3. Click the Upload button after drag-and-drop
    - expect: Form submits successfully
    - expect: Success page displays with the dragged file's name

### 10. Form and Page Structure

**Seed:** `tests/seed.spec.ts`

#### 10.1. TC-UPLOAD-016: Form uses POST method with multipart/form-data encoding

**File:** `tests/single-file-upload-flow/form-structure.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Inspect the form element attributes
    - expect: Form has method='POST' attribute
    - expect: Form has enctype='multipart/form-data' attribute
    - expect: Form action points to /upload endpoint

#### 10.2. TC-UPLOAD-017: File input is single-file only (no multiple attribute)

**File:** `tests/single-file-upload-flow/form-structure.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Inspect the file input element
    - expect: File input does not have 'multiple' attribute
    - expect: Only single file selection is allowed

#### 10.3. TC-UPLOAD-018: Page refresh after file selection clears input to clean state

**File:** `tests/single-file-upload-flow/form-structure.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Upload page
    - expect: Page loads successfully
2. Select a file
    - expect: File name appears in input
3. Refresh the page (F5 or browser refresh)
    - expect: Page reloads to initial clean state
    - expect: File selection is lost (standard browser behavior)
    - expect: File input is empty
    - expect: No error or warning is shown
