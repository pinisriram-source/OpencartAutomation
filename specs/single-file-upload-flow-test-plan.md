# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-10

## 1. Introduction

### 1.1 Test Plan Objectives

Validate the classic HTML file-input-based upload workflow (file selection, submission, confirmation display, and state reset) on the File Uploader feature (the-internet.herokuapp.com/upload) end-to-end via automated regression coverage, ensuring that file uploads of various types and filenames succeed correctly, negative paths are handled gracefully, and page state resets properly between uploads.

## 2. Scope

### 2.1 In Scope
- Initial page state verification (empty file input, no confirmation present)
- Single file upload via classic HTML file input + submit button (happy path)
- File extension variants (.txt, .png, .json, .pdf)
- Filenames with spaces, parentheses, hyphens, underscores, and mixed special characters
- Negative/edge cases: no file selected, file clearing, very long filenames, duplicate uploads
- State reset after upload (navigation back to upload page, page reload)

### 2.2 Out of Scope
- Drag-and-drop upload widget (id="drag-drop-upload") present on the same page
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the upload endpoint
- Security testing (e.g., malicious file uploads, path traversal)
- Visual/pixel-level styling verification

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the File Uploader feature via Playwright, covering the full upload lifecycle (file selection, form submission, confirmation verification, and state reset) end-to-end in the browser.

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

Triggered on demand through the Streamlit dashboard's three-stage pipeline (plan -> review -> automation -> review -> execute); re-triggered automatically whenever a stage is sent back with reviewer feedback. No fixed calendar schedule — cadence is driven by stakeholder submissions and reviews.

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
- Initial page state (empty file input, heading, no confirmation)
- Single file upload via file input + submit button
- Confirmation view display ("File Uploaded!" heading, exact filename)
- File extension handling (.txt, .png, .json, .pdf)
- Special character preservation in filenames (spaces, parentheses, hyphens, underscores, brackets)
- Negative behavior when no file is selected
- State reset on navigation back to the upload page

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
No persistent test data or database — test files are created programmatically during test execution (using Playwright's `setInputFiles` API with buffer payloads). The target application (the-internet.herokuapp.com/upload) is stateless — each upload is independent with no server-side persistence between page loads.

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

The Single File Upload Flow feature provides a classic HTML-based file selection and upload interface. The page displays a "File Uploader" heading, a standard HTML file input element (with id="file-upload"), and an "Upload" submit button (with id="file-submit"). Users select a file from their local filesystem using the file input's file picker dialog, then click the Upload button to submit the file to the server. On successful upload, the page reloads to the same URL and displays a confirmation view showing a "File Uploaded!" heading and the exact filename of the uploaded file. The page also contains a separate drag-and-drop upload widget (id="drag-drop-upload"), but that widget is explicitly out of scope for this test plan — only the classic file input + submit button workflow is tested here. Each page load starts with a clean slate (no persisted upload state), so navigating back to the upload page after a successful upload returns to the initial empty state.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify page load shows empty file input and no upload confirmation

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
2. Inspect the page content
    - expect: "File Uploader" heading is visible
    - expect: File input with id="file-upload" is present and visible
    - expect: File input shows no file selected (displays "No file chosen" or equivalent)
    - expect: "Upload" button with id="file-submit" is present and visible
    - expect: No "File Uploaded!" heading is present
    - expect: No uploaded filename is displayed anywhere on the page

#### 1.2. TC-UPLOAD-002: Verify instructional text and page structural elements

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Inspect the page for instructional content and structural elements
    - expect: Instructional text about choosing a file and uploading is visible
    - expect: Drag-and-drop upload widget (id="drag-drop-upload") is present on the page
    - expect: Drag-and-drop widget is visually distinct from the file input under test
    - expect: The file input and Upload button are separate from the drag-and-drop area

### 2. Single File Upload Happy Path

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-003: Upload a single .txt file and verify confirmation view

**File:** `tests/single-file-upload-flow/single-file-upload-happy-path.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test .txt file using the file input (id="file-upload")
    - expect: File input reflects the selected filename (e.g., "test-file.txt")
3. Click the "Upload" button (id="file-submit")
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "test-file.txt" is displayed on the page

### 3. File Extension Variants

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-004: Upload a .png file and verify filename displayed correctly

**File:** `tests/single-file-upload-flow/file-extension-variants.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test .png file using the file input
    - expect: File input reflects the selected filename (e.g., "test-image.png")
3. Click the "Upload" button
    - expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    - expect: Uploaded filename "test-image.png" is displayed exactly as provided

#### 3.2. TC-UPLOAD-005: Upload a .json file and verify filename displayed correctly

**File:** `tests/single-file-upload-flow/file-extension-variants.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test .json file using the file input
    - expect: File input reflects the selected filename (e.g., "test-data.json")
3. Click the "Upload" button
    - expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    - expect: Uploaded filename "test-data.json" is displayed exactly as provided

#### 3.3. TC-UPLOAD-006: Upload a .pdf file and verify filename displayed correctly

**File:** `tests/single-file-upload-flow/file-extension-variants.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test .pdf file using the file input
    - expect: File input reflects the selected filename (e.g., "test-document.pdf")
3. Click the "Upload" button
    - expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    - expect: Uploaded filename "test-document.pdf" is displayed exactly as provided

### 4. Special Characters in Filename

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-007: Upload file with spaces in name and verify exact filename displayed

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file with spaces in its name (e.g., "my test file.txt")
    - expect: File input reflects the selected filename with spaces
3. Click the "Upload" button
    - expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    - expect: Uploaded filename "my test file.txt" is displayed exactly as provided, with spaces preserved

#### 4.2. TC-UPLOAD-008: Upload file with spaces and parentheses and verify exact filename displayed

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file with spaces and parentheses in its name (e.g., "my file (1).txt")
    - expect: File input reflects the selected filename with parentheses
3. Click the "Upload" button
    - expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    - expect: Uploaded filename "my file (1).txt" is displayed exactly as provided, with parentheses and spaces preserved

#### 4.3. TC-UPLOAD-009: Upload file with hyphens and underscores in name

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file with hyphens and underscores (e.g., "test-file_01.txt")
    - expect: File input reflects the selected filename
3. Click the "Upload" button
    - expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    - expect: Uploaded filename "test-file_01.txt" is displayed exactly as provided

#### 4.4. TC-UPLOAD-010: Upload file with mixed special characters

**File:** `tests/single-file-upload-flow/special-characters-in-filename.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file with multiple special characters (e.g., "test file (v2.1) [final].txt")
    - expect: File input reflects the selected filename
3. Click the "Upload" button
    - expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    - expect: Uploaded filename is displayed exactly as provided, with all special characters preserved

### 5. Negative and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-011: Click Upload with no file selected and verify behavior

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input shows no file selected
2. Click the "Upload" button without selecting a file
    - expect: Upload does NOT complete successfully
    - expect: No "File Uploaded!" heading is shown on the resulting page
    - expect: Record the actual behavior (error message, "Internal Server Error", or page remains unchanged)

#### 5.2. TC-UPLOAD-012: Select file, clear selection, then click Upload

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file using the file input
    - expect: File input reflects the selected filename
3. Clear the file selection by setting the input to empty
    - expect: File input shows no file selected
4. Click the "Upload" button
    - expect: Behavior matches TC-UPLOAD-011 (no successful upload occurs)

#### 5.3. TC-UPLOAD-013: Upload file with very long filename

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file with a very long filename (200+ characters)
    - expect: File input accepts the file
3. Click the "Upload" button
    - expect: Upload succeeds or fails gracefully
    - expect: If successful, the full filename is displayed on the confirmation view
    - expect: If failed, an appropriate error or page response is shown (no unhandled crash)

#### 5.4. TC-UPLOAD-014: Upload same file twice in succession

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select and upload a test file (e.g., "test-file.txt")
    - expect: "File Uploaded!" heading is visible
    - expect: Filename "test-file.txt" is displayed
3. Navigate back to https://the-internet.herokuapp.com/upload
    - expect: Page returns to initial empty state
4. Select and upload the same file again
    - expect: "File Uploaded!" heading is visible
    - expect: Filename "test-file.txt" is displayed exactly as before
    - expect: No error or duplicate-file warning is shown

### 6. State Reset After Upload

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-015: Navigate back to upload page after successful upload resets state

**File:** `tests/single-file-upload-flow/state-reset-after-upload.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select and upload a test file
    - expect: "File Uploaded!" heading is visible
    - expect: Filename is displayed
3. Navigate to https://the-internet.herokuapp.com/upload (fresh page load)
    - expect: Page returns to initial state
    - expect: "File Uploader" heading is visible
    - expect: File input shows no file selected
    - expect: No "File Uploaded!" heading is present
    - expect: No uploaded filename is displayed

#### 6.2. TC-UPLOAD-016: Reload confirmation page returns to initial upload state

**File:** `tests/single-file-upload-flow/state-reset-after-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select and upload a test file
    - expect: "File Uploaded!" heading is visible
    - expect: Filename is displayed
3. Reload/refresh the current page
    - expect: Page returns to the initial upload state (not the confirmation view)
    - expect: "File Uploader" heading is visible
    - expect: File input shows no file selected
    - expect: No "File Uploaded!" heading is present
