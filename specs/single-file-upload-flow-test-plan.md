# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-11

## 1. Introduction

### 1.1 Test Plan Objectives

Validate the classic file-input upload flow (select file via input, click Upload, verify confirmation) on the File Uploader page (the-internet.herokuapp.com/upload) end-to-end via automated regression coverage, ensuring all acceptance criteria — initial state, successful uploads across file types, special-character filename preservation, negative cases, and state reset — are verified so regressions are caught early without manual re-testing.

## 2. Scope

### 2.1 In Scope
- Initial page-load state verification (heading, empty file input, no confirmation)
- Successful single-file upload via the classic file input + submit button flow
- Filename display verification for various file extensions (.txt, .png, .json, .pdf, .csv)
- Filename preservation for names containing spaces, parentheses, brackets, hyphens, and underscores
- Negative case: submitting with no file selected
- State reset: navigating back to the upload page after a successful upload returns to initial state
- Sequential uploads (upload, reset, upload a different file)
- Confirmation view URL verification

### 2.2 Out of Scope
- The drag-and-drop upload widget present on the same page (explicitly excluded by acceptance criteria)
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the upload endpoint
- Security testing (e.g., malicious file upload, path traversal)
- File size limits or large file upload behavior (not specified in acceptance criteria)
- Visual/pixel-level styling of the page elements

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the File Uploader feature via Playwright, covering the complete upload lifecycle (page load, file selection, submission, confirmation display, state reset) end-to-end in the browser.

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
- Initial page-load state (heading, file input, submit button presence; absence of confirmation elements)
- Single-file upload via classic file input + submit button (multiple file types)
- Confirmation view display (heading, filename)
- Filename preservation for names with spaces, special characters, hyphens, and underscores
- Negative behavior when submitting with no file selected
- State reset on re-navigation to the upload page after a successful upload
- Sequential upload behavior (second upload replaces first)

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
No persistent test data or database — tests create temporary files in memory (via Playwright's `setInputFiles` API with buffer payloads) for upload; no pre-existing files on disk or database state are required. The target application (the-internet.herokuapp.com/upload) does not persist uploads across page loads.

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

This feature lets a user select a single file from their local machine and upload it via a classic HTML file input and submit button. The page displays a "File Uploader" heading (h3), a file input element (id="file-upload", name="file", no `accept` attribute, not `required`), and an "Upload" submit button (id="file-submit"). On successful upload, the page reloads showing a "File Uploaded!" confirmation heading and the uploaded file's name. There is also a drag-and-drop upload widget on the page, but it is explicitly out of scope for this test plan — only the classic file input + submit button flow is tested here.

Key observed behaviors:
- Clicking Upload with no file selected results in an "Internal Server Error" response (not a friendly validation message).
- After a successful upload, navigating back to the upload page resets to the initial empty state.
- The confirmation view URL remains the same (`/upload`) — no redirect to a different path.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify initial page load state shows File Uploader heading, empty file input, and no confirmation

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the File Uploader page (https://the-internet.herokuapp.com/upload)
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
2. Inspect the page content
    - expect: "File Uploader" heading is visible
    - expect: File input (id="file-upload") is visible and empty (no file selected)
    - expect: "Upload" submit button (id="file-submit") is visible
    - expect: No "File Uploaded!" confirmation heading is present
    - expect: No uploaded filename is displayed anywhere on the page

#### 1.2. TC-UPLOAD-015: Verify file input is not marked as required

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Inspect the file input element's attributes
    - expect: File input (id="file-upload") is NOT marked with the HTML "required" attribute
    - expect: File input does not have browser-level validation enforcing file selection

### 2. Successful Upload

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-002: Upload a simple text file and verify confirmation with exact filename

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a simple text file (e.g., "test.txt") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view (same URL)
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "test.txt" is displayed exactly as provided

#### 2.2. TC-UPLOAD-012: Verify confirmation view URL remains the same after successful upload

**File:** `tests/single-file-upload-flow/successful-upload.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: URL is https://the-internet.herokuapp.com/upload
2. Select a file (e.g., "test.txt") and click Upload
    - expect: Page navigates to confirmation view
    - expect: URL is still https://the-internet.herokuapp.com/upload (same URL as initial page)
    - expect: "File Uploaded!" heading is visible

### 3. File Type Variants

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-003: Upload a PNG image file and verify confirmation with exact filename

**File:** `tests/single-file-upload-flow/file-type-variants.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a PNG image file (e.g., "image.png") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "image.png" is displayed exactly as provided

#### 3.2. TC-UPLOAD-004: Upload a JSON file and verify confirmation with exact filename

**File:** `tests/single-file-upload-flow/file-type-variants.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a JSON file (e.g., "data.json") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "data.json" is displayed exactly as provided

#### 3.3. TC-UPLOAD-005: Upload a PDF file and verify confirmation with exact filename

**File:** `tests/single-file-upload-flow/file-type-variants.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a PDF file (e.g., "document.pdf") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "document.pdf" is displayed exactly as provided

#### 3.4. TC-UPLOAD-014: Verify file input accepts any file type (no extension restriction)

**File:** `tests/single-file-upload-flow/file-type-variants.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Inspect the file input element
    - expect: File input (id="file-upload") has no "accept" attribute restriction
    - expect: File input can accept any file type
3. Select a file with an uncommon extension (e.g., "data.csv") and click Upload
    - expect: Upload succeeds
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "data.csv" is displayed with the .csv extension preserved

### 4. Special Characters in Filenames

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-006: Upload file with spaces in filename and verify exact filename preservation

**File:** `tests/single-file-upload-flow/special-characters-filenames.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with spaces in the name (e.g., "my test file.txt") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "my test file.txt" is displayed exactly as provided, with spaces preserved

#### 4.2. TC-UPLOAD-007: Upload file with parentheses in filename and verify exact filename preservation

**File:** `tests/single-file-upload-flow/special-characters-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with parentheses in the name (e.g., "file(1).txt") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "file(1).txt" is displayed exactly as provided, with parentheses preserved

#### 4.3. TC-UPLOAD-008: Upload file with multiple special characters in filename and verify exact filename preservation

**File:** `tests/single-file-upload-flow/special-characters-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with multiple special characters in the name (e.g., "my_file (copy) [2].txt") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "my_file (copy) [2].txt" is displayed exactly as provided, with all special characters preserved

#### 4.4. TC-UPLOAD-013: Upload file with hyphen and underscore in filename

**File:** `tests/single-file-upload-flow/special-characters-filenames.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file with hyphens and underscores (e.g., "test-file_01.txt") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "test-file_01.txt" is displayed exactly as provided

### 5. Negative / Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-009: Clicking Upload with no file selected results in Internal Server Error

**File:** `tests/single-file-upload-flow/negative-cases.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Do NOT select any file in the file input
    - expect: File input remains empty (no file selected)
3. Click the "Upload" submit button
    - expect: Page navigates/responds with an error
    - expect: "Internal Server Error" heading is visible (actual observed behavior)
    - expect: Upload does NOT successfully complete

#### 5.2. TC-UPLOAD-010: Verify upload with no file selected does not show confirmation elements

**File:** `tests/single-file-upload-flow/negative-cases.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Do NOT select any file in the file input
    - expect: File input remains empty
3. Click the "Upload" submit button
    - expect: Page responds with an error (Internal Server Error)
    - expect: No "File Uploaded!" confirmation appears
    - expect: No uploaded filename is displayed

### 6. State Reset

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-011: After successful upload, navigating back to upload page resets to initial empty state

**File:** `tests/single-file-upload-flow/state-reset.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the File Uploader page
    - expect: Page loads successfully
2. Select a file (e.g., "test.txt") in the file input
    - expect: File is selected successfully
3. Click the "Upload" submit button
    - expect: Page navigates to the confirmation view
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "test.txt" is displayed
4. Navigate back to the File Uploader page (https://the-internet.herokuapp.com/upload)
    - expect: Page loads successfully
    - expect: "File Uploader" heading is visible
    - expect: File input is empty (no file selected)
    - expect: No "File Uploaded!" confirmation heading is present
    - expect: No uploaded filename is displayed (state has been reset)
    - expect: Page is in its initial empty state, identical to first load

#### 6.2. TC-UPLOAD-016: Sequential uploads — upload one file, reset, upload a different file

**File:** `tests/single-file-upload-flow/state-reset.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the File Uploader page and upload "first.txt"
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "first.txt" is displayed
2. Navigate back to the upload page
    - expect: Page resets to initial empty state
3. Select a different file (e.g., "second.txt") and click Upload
    - expect: "File Uploaded!" heading is visible
    - expect: Uploaded filename "second.txt" is displayed (not "first.txt")
    - expect: Previous upload filename is not shown anywhere
