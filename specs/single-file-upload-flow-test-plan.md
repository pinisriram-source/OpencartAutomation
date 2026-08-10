# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-10

## 1. Introduction

### 1.1 Test Plan Objectives

Validate the classic HTML file-input upload flow on the File Uploader page (the-internet.herokuapp.com/upload) end-to-end via automated regression coverage — confirming that single-file selection, submission, confirmation display, filename fidelity (including special characters), negative/edge-case behavior (no file selected), and post-upload state reset all work correctly, so future changes to this interaction don't regress silently.

## 2. Scope

### 2.1 In Scope
- Initial page-load state verification (heading, empty file input, absence of confirmation)
- Successful single-file upload via the classic file input (id="file-upload") and submit button (id="file-submit")
- Confirmation view verification ("File Uploaded!" heading, displayed filename)
- File type variations (.txt, .png, .json)
- Filenames containing spaces and special characters
- Negative case: clicking Upload with no file selected
- Post-upload page reset on fresh navigation

### 2.2 Out of Scope
- The drag-and-drop upload widget present on the same page (explicitly excluded per acceptance criteria)
- Visual/pixel-level styling of UI elements (covered by functional visibility checks only)
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the upload endpoint
- Security penetration testing (e.g. malicious file upload, path traversal)
- File size limits or server-side validation (not specified in acceptance criteria)
- Multi-file upload scenarios

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the File Upload feature via Playwright, covering file selection, form submission, confirmation display, filename fidelity, error behavior, and state-reset end-to-end in the browser.

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
- Initial page state: "File Uploader" heading, empty file input, absence of confirmation elements
- Single-file upload via classic file input and submit button
- Confirmation view: "File Uploaded!" heading and displayed filename
- Filename fidelity across file types (.txt, .png, .json)
- Filename fidelity with spaces and special characters
- Negative behavior: upload submission without file selection
- Post-upload state reset on fresh page navigation

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
No persistent test data or database required. Tests create ephemeral files at runtime (e.g. a `.txt`, `.png`, `.json` file generated in a temp directory) and upload them to the-internet.herokuapp.com/upload. The application does not persist uploads across page loads — each navigation starts fresh.

## 13. Risks

### 13.1 Schedule
None — execution is on-demand, not calendar-bound; the only schedule risk is a stalled human review.

### 13.2 Technical
Running Claude Code non-interactively with the `playwright-test` MCP server in a fresh CI container is still relatively early — permission flags, MCP startup timing, or transient tool failures can cause a stage to need a re-run. The file upload interaction requires Playwright's `setInputFiles` API, which must be handled correctly in the generated automation.

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

The File Upload feature at https://the-internet.herokuapp.com/upload provides a classic HTML file-input upload mechanism. The page displays a "File Uploader" heading (h3), instructional text ("Choose a file on your system and then click upload. Or, drag and drop a file into the area below."), a file input element (id="file-upload"), and an "Upload" submit button (id="file-submit"). There is also a drag-and-drop upload widget on the same page, which is out of scope for this test suite.

When a user selects a file via the file input and clicks "Upload", the form submits and the page reloads to a confirmation view showing a "File Uploaded!" heading (h3) and the uploaded file's name displayed in a div element (id="uploaded-files"). The confirmation view replaces the upload form entirely — the file input and submit button are no longer present.

Clicking "Upload" with no file selected results in an "Internal Server Error" page (h1 heading) rather than a client-side validation message — the server does not gracefully handle empty submissions.

Navigating back to the upload URL after a successful upload resets the page to its initial empty state — uploads do not persist across page loads.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify page load shows File Uploader heading with empty file input and no confirmation

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
2. Verify the page heading and elements
    - expect: "File Uploader" heading (h3) is visible
    - expect: File input element (id="file-upload") is present
    - expect: "Upload" button (id="file-submit") is visible
3. Verify no confirmation elements are present
    - expect: No "File Uploaded!" text is visible anywhere on the page
    - expect: No uploaded filename is displayed on the page

#### 1.2. TC-UPLOAD-002: Verify instructional text and page structure on initial load

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Verify the instructional paragraph text
    - expect: Text "Choose a file on your system and then click upload." is visible
3. Verify the Upload button is enabled and clickable
    - expect: "Upload" button is not disabled
    - expect: "Upload" button is visible and interactable

### 2. Successful File Upload (Happy Path)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-003: Selecting a .txt file and clicking Upload shows confirmation with filename

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "test-file.txt" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: Page navigates to confirmation view
    - expect: "File Uploaded!" heading (h3) is visible
    - expect: Text "test-file.txt" is displayed on the page
    - expect: The file input and Upload button are no longer present

#### 2.2. TC-UPLOAD-004: Confirmation view displays the exact uploaded filename in the correct element

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "example-document.txt" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
4. Verify the uploaded filename element
    - expect: Element with id="uploaded-files" contains text "example-document.txt"
    - expect: Filename is displayed exactly as provided, with no modification

### 3. File Type Variations

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-005: Uploading a .png file succeeds and shows correct filename

**File:** `tests/single-file-upload-flow/file-type-variations.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "image-sample.png" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "image-sample.png" is displayed in the uploaded-files element

#### 3.2. TC-UPLOAD-006: Uploading a .json file succeeds and shows correct filename

**File:** `tests/single-file-upload-flow/file-type-variations.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "data-config.json" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "data-config.json" is displayed in the uploaded-files element

#### 3.3. TC-UPLOAD-007: Uploading a file with no extension succeeds and shows correct filename

**File:** `tests/single-file-upload-flow/file-type-variations.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "README" (no extension) in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "README" is displayed in the uploaded-files element

### 4. Special Character Filenames

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-008: Uploading a file with spaces in name succeeds and displays filename exactly

**File:** `tests/single-file-upload-flow/special-character-filenames.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "my file (1).txt" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "my file (1).txt" is displayed exactly as provided in the uploaded-files element
    - expect: Spaces and parentheses are preserved unmodified

#### 4.2. TC-UPLOAD-009: Uploading a file with hyphens and underscores displays filename correctly

**File:** `tests/single-file-upload-flow/special-character-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "my_report-2026_final.txt" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "my_report-2026_final.txt" is displayed exactly in the uploaded-files element

#### 4.3. TC-UPLOAD-010: Uploading a file with multiple dots in name displays filename correctly

**File:** `tests/single-file-upload-flow/special-character-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "archive.2026.08.10.tar.gz" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "archive.2026.08.10.tar.gz" is displayed exactly in the uploaded-files element

### 5. Negative and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-011: Clicking Upload with no file selected shows Internal Server Error

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input is empty (no file selected)
2. Click the "Upload" button without selecting a file
    - expect: Page does NOT show "File Uploaded!" confirmation
    - expect: Page displays "Internal Server Error" heading (h1)
    - expect: The upload was not successful

#### 5.2. TC-UPLOAD-012: Uploading a file with a very long filename succeeds

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file with a long name "this-is-a-very-long-filename-that-tests-boundary-conditions-for-the-upload-feature.txt" in the file input
    - expect: File input accepts the file
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: The full long filename is displayed in the uploaded-files element

#### 5.3. TC-UPLOAD-013: Uploading a file with unicode characters in filename displays correctly

**File:** `tests/single-file-upload-flow/negative-edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "résumé-café.txt" in the file input
    - expect: File input accepts the file
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "résumé-café.txt" is displayed in the uploaded-files element with unicode characters preserved

### 6. Post-Upload State Reset

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-014: Navigating back to upload page after successful upload resets to initial state

**File:** `tests/single-file-upload-flow/post-upload-state-reset.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "reset-test.txt" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
    - expect: Text "reset-test.txt" is displayed
4. Navigate to https://the-internet.herokuapp.com/upload again
    - expect: "File Uploader" heading is visible (not "File Uploaded!")
    - expect: File input is present and empty
    - expect: "Upload" button is visible
    - expect: No uploaded filename is displayed
    - expect: The previous upload does not persist

#### 6.2. TC-UPLOAD-015: Confirmation view does not contain file input or upload button

**File:** `tests/single-file-upload-flow/post-upload-state-reset.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "form-check.txt" in the file input
    - expect: File input shows the selected filename
3. Click the "Upload" button
    - expect: "File Uploaded!" heading is visible
4. Verify the upload form is no longer present
    - expect: File input element (id="file-upload") is not present on the page
    - expect: "Upload" button (id="file-submit") is not present on the page
    - expect: Instructional paragraph text is not visible

#### 6.3. TC-UPLOAD-016: Multiple sequential uploads each show their own correct filename

**File:** `tests/single-file-upload-flow/post-upload-state-reset.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a file named "first-upload.txt" and click "Upload"
    - expect: "File Uploaded!" heading is visible
    - expect: Text "first-upload.txt" is displayed
3. Navigate to https://the-internet.herokuapp.com/upload again
    - expect: Page resets to initial state
4. Select a file named "second-upload.png" and click "Upload"
    - expect: "File Uploaded!" heading is visible
    - expect: Text "second-upload.png" is displayed
    - expect: No trace of "first-upload.txt" on the page
