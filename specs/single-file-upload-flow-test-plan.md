# Single File Upload Flow Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-08-07

## 1. Introduction

### 1.1 Test Plan Objectives

Validate the single-file upload flow on the-internet.herokuapp.com/upload end-to-end (initial page state, file selection, successful upload confirmation, filename integrity including special characters, the no-file-selected error case, sequential uploads, and navigation behavior) via automated regression coverage, so future changes to this flow don't regress silently and manual re-testing time is reduced.

## 2. Scope

### 2.1 In Scope
- Initial page state verification (heading, empty file input, upload button, form attributes)
- File selection behavior (single file, different extensions, re-selection)
- Successful upload flow and the resulting confirmation page's displayed filename
- The no-file-selected case, including the real HTTP 500 currently returned by the live app — captured as-is so the suite continues to flag it as a regression signal
- File-name integrity (exact match including spaces, parentheses, hyphens, underscores, mixed case, multiple dots)
- Navigation behavior (browser back retains file; fresh load resets state)
- Sequential uploads showing correct filename each time

### 2.2 Out of Scope
- The drag-and-drop upload widget present on the same page (explicitly excluded by the acceptance criteria)
- Visual/pixel-level styling of the upload form or success page
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Actual file content/virus-scanning validation — only the file *name* round-trip is in scope, per the acceptance criteria
- Performance/load testing of the upload endpoint
- Security penetration testing

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the file upload flow via Playwright, covering file selection through to the success page end-to-end in the browser, plus the no-file-selected error behavior and navigation reset.

### 3.2 Performance Test
Not applicable — performance/load testing is out of scope for this suite (see Section 2.2).

### 3.3 Security Test
Not applicable — security penetration testing is explicitly out of scope for this project (see Section 2.2).

### 3.4 Automated Test
100% of this suite is automated — Playwright (TypeScript), executed non-interactively by `pipeline-execute.yml`. There is no manual test execution step in this pipeline.

### 3.5 Stress and Volume Test
Not applicable — this pipeline does not exercise concurrent load or high data volumes; each test runs a single Chromium browser context sequentially with small static files.

### 3.6 Recovery Test
Not applicable — no crash/failover recovery scenarios are in scope for this UI-level suite (the no-file-selected HTTP 500 is a functional negative case, not a recovery test).

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
Failing tests are recorded with expected/actual behavior in `streamlit_app/data/single-file-upload-flow-test-results.json`'s `defects` array and rendered in the dashboard's Defects Log tab. TC-UPLOAD-013's HTTP 500 is expected to surface here as a tracked, known defect on execution.

## 7. Functions to be Tested
- Initial page state (heading, empty file input, upload button, form attributes)
- File selection behavior (single valid file, different extensions, re-selection)
- Successful upload flow and the resulting success page's displayed filename
- The no-file-selected validation case (HTTP 500 error and recovery)
- Sequential uploads showing correct filename each time
- File-name integrity (spaces, parentheses, hyphens, underscores, mixed case, multiple dots)
- Navigation back from success page and fresh-load reset behavior

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

**Exit:** every Smoke/Sanity/Functional test case in Section 18 has been executed and results published to the dashboard; no unresolved Smoke-tier failures (TC-UPLOAD-013's HTTP 500 is Sanity-tier by design — a known, intentionally-tracked live-app defect, not a Smoke blocker).

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
No database. Small static files created at test runtime via Playwright's file-chooser API (e.g., `sample.txt`, `data.json`, `image.png`, `my file (1).txt`) — no externally-hosted test files, no persistent state to clean up between runs.

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

The File Upload feature demonstrates the classic HTML form-based file upload pattern. The page displays a "File Uploader" heading, a file input field (with id="file-upload" and name="file"), and an "Upload" submit button (with id="file-submit"). The file input has no "accept" attribute (accepts all file types), no "required" attribute, and no "multiple" attribute (single file only). The form uses action="/upload", method="post", and enctype="multipart/form-data". When a file is selected and the Upload button is clicked, the form submits and the page reloads to a confirmation view showing a "File Uploaded!" heading (h3 element) and the uploaded file's name displayed in a div#uploaded-files element. If the Upload button is clicked with no file selected, the server returns an HTTP 500 "Internal Server Error" page. The page also displays an out-of-scope drag-and-drop upload widget below the form, which is not tested as part of this suite.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify page load shows File Uploader heading, empty file input, and Upload button

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page heading 'File Uploader' is visible
    - expect: File input with id='file-upload' is present and empty
    - expect: Upload button with id='file-submit' is present and visible
    - expect: No 'File Uploaded!' heading is present on the page
    - expect: No div#uploaded-files element is present on the page

#### 1.2. TC-UPLOAD-002: Verify file input has correct attributes and no restrictions

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Inspect the file input element attributes
    - expect: File input id is 'file-upload'
    - expect: File input name attribute is 'file'
    - expect: File input type is 'file'
    - expect: File input does NOT have a 'required' attribute
    - expect: File input does NOT have a 'multiple' attribute
    - expect: File input does NOT have an 'accept' attribute (accepts all file types)

#### 1.3. TC-UPLOAD-003: Verify form element has correct attributes for multipart file upload

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Inspect the form element attributes
    - expect: Form element is present
    - expect: Form action is 'https://the-internet.herokuapp.com/upload'
    - expect: Form method is 'post'
    - expect: Form enctype is 'multipart/form-data'

### 2. File Selection Behavior

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-004: Selecting a file updates the file input with the chosen filename

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input is empty
2. Select a test file 'sample.txt' in the file input
    - expect: File input now contains the selected file
    - expect: File input displays 'sample.txt' or the full path to the file

#### 2.2. TC-UPLOAD-005: Selecting a different file type (.json) updates the file input correctly

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'data.json' in the file input
    - expect: File input contains the selected .json file
    - expect: File input displays 'data.json' or the full path

#### 2.3. TC-UPLOAD-006: Selecting another file type (.png) updates the file input correctly

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'image.png' in the file input
    - expect: File input contains the selected .png file
    - expect: File input displays 'image.png' or the full path

#### 2.4. TC-UPLOAD-007: Re-selecting a file overwrites the previous selection

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'first.txt'
    - expect: File input contains 'first.txt'
3. Select a different test file 'second.txt'
    - expect: File input now contains 'second.txt'
    - expect: Previous file 'first.txt' is no longer in the input

### 3. Successful Upload Flow

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-008: Uploading a .txt file shows success page with File Uploaded! heading

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'sample.txt' in the file input
    - expect: File is selected
3. Click the Upload button
    - expect: Page navigates to the confirmation view
    - expect: URL remains https://the-internet.herokuapp.com/upload
    - expect: Heading 'File Uploaded!' is visible on the page
    - expect: The heading is an h3 element

#### 3.2. TC-UPLOAD-009: After successful upload, the uploaded filename is displayed exactly

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'sample.txt'
    - expect: File is selected
3. Click the Upload button
    - expect: Success page is shown with 'File Uploaded!' heading
4. Verify the div#uploaded-files element content
    - expect: div#uploaded-files is visible
    - expect: The exact filename 'sample.txt' is displayed in the div

#### 3.3. TC-UPLOAD-010: Uploading a .json file succeeds and displays correct filename

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'data.json'
    - expect: File is selected
3. Click the Upload button
    - expect: Success page shows 'File Uploaded!' heading
    - expect: div#uploaded-files displays exactly 'data.json'

#### 3.4. TC-UPLOAD-011: Uploading a .png file succeeds and displays correct filename

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'image.png'
    - expect: File is selected
3. Click the Upload button
    - expect: Success page shows 'File Uploaded!' heading
    - expect: div#uploaded-files displays exactly 'image.png'

#### 3.5. TC-UPLOAD-012: Uploading a .md file succeeds and displays correct filename

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file 'readme.md'
    - expect: File is selected
3. Click the Upload button
    - expect: Success page shows 'File Uploaded!' heading
    - expect: div#uploaded-files displays exactly 'readme.md'

### 4. No File Selected Validation

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-013: Clicking Upload with no file selected returns HTTP 500 error

**File:** `tests/single-file-upload-flow/no-file-selected-validation.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input is empty
2. Click the Upload button without selecting a file
    - expect: Page navigates to an error page
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page displays 'Internal Server Error' heading
    - expect: HTTP response status is 500

#### 4.2. TC-UPLOAD-014: After receiving 500 error, navigating back returns to upload form

**File:** `tests/single-file-upload-flow/no-file-selected-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Click Upload with no file
    - expect: Internal Server Error page is displayed
3. Click the browser back button
    - expect: Page navigates back to https://the-internet.herokuapp.com/upload
    - expect: 'File Uploader' heading is visible
    - expect: File input is present
    - expect: Upload button is present
    - expect: No 'File Uploaded!' heading is present

### 5. Sequential Uploads

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-015: Uploading first.txt then navigating back and uploading second.txt shows correct names

**File:** `tests/single-file-upload-flow/sequential-uploads.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select 'first.txt' and click Upload
    - expect: Success page displays 'File Uploaded!'
    - expect: div#uploaded-files displays 'first.txt'
3. Navigate back to https://the-internet.herokuapp.com/upload
    - expect: Upload form page is displayed
    - expect: File input is reset (no file from previous upload shown)
4. Select 'second.txt' and click Upload
    - expect: Success page displays 'File Uploaded!'
    - expect: div#uploaded-files displays 'second.txt' (not 'first.txt')

#### 5.2. TC-UPLOAD-016: Uploading three different files sequentially shows correct name each time

**File:** `tests/single-file-upload-flow/sequential-uploads.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload and upload 'file1.txt'
    - expect: div#uploaded-files displays 'file1.txt'
2. Navigate to /upload and upload 'file2.json'
    - expect: div#uploaded-files displays 'file2.json'
3. Navigate to /upload and upload 'file3.png'
    - expect: div#uploaded-files displays 'file3.png'

### 6. File Name Integrity

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-017: Uploading a file with spaces in the name preserves the exact filename

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file named 'my file.txt' (with space)
    - expect: File is selected
3. Click Upload
    - expect: Success page is shown
    - expect: div#uploaded-files displays exactly 'my file.txt' with the space preserved

#### 6.2. TC-UPLOAD-018: Uploading a file with parentheses preserves the exact filename

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file named 'file(1).txt'
    - expect: File is selected
3. Click Upload
    - expect: Success page is shown
    - expect: div#uploaded-files displays exactly 'file(1).txt' with parentheses preserved

#### 6.3. TC-UPLOAD-019: Uploading a file with hyphens preserves the exact filename

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file named 'test-file-name.txt'
    - expect: File is selected
3. Click Upload
    - expect: Success page is shown
    - expect: div#uploaded-files displays exactly 'test-file-name.txt' with hyphens

#### 6.4. TC-UPLOAD-020: Uploading a file with underscores preserves the exact filename

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file named 'test_file_name.txt'
    - expect: File is selected
3. Click Upload
    - expect: Success page is shown
    - expect: div#uploaded-files displays exactly 'test_file_name.txt' with underscores

#### 6.5. TC-UPLOAD-021: Uploading a file with mixed case preserves the exact case

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file named 'MyFile.TXT'
    - expect: File is selected
3. Click Upload
    - expect: Success page is shown
    - expect: div#uploaded-files displays exactly 'MyFile.TXT' with original case preserved

#### 6.6. TC-UPLOAD-022: Uploading a file with multiple dots preserves all dots

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file named 'archive.tar.gz'
    - expect: File is selected
3. Click Upload
    - expect: Success page is shown
    - expect: div#uploaded-files displays exactly 'archive.tar.gz' with all dots

#### 6.7. TC-UPLOAD-023: Uploading a file with special characters and spaces preserves everything

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select a test file named 'my file (1).txt'
    - expect: File is selected
3. Click Upload
    - expect: Success page is shown
    - expect: div#uploaded-files displays exactly 'my file (1).txt' unmodified

### 7. Navigation Back from Success Page

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-UPLOAD-024: After successful upload, browser back button retains file in input

**File:** `tests/single-file-upload-flow/navigation-back-from-success.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select 'test.txt' and click Upload
    - expect: Success page is displayed with 'File Uploaded!' heading
3. Click the browser back button
    - expect: Page navigates back to https://the-internet.herokuapp.com/upload
    - expect: 'File Uploader' heading is visible
    - expect: File input still contains 'test.txt' (retained from before upload)
    - expect: Upload button is present

#### 7.2. TC-UPLOAD-025: Fresh navigation to /upload after successful upload resets the page completely

**File:** `tests/single-file-upload-flow/navigation-back-from-success.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select 'uploaded.txt' and click Upload
    - expect: Success page displays 'File Uploaded!' and 'uploaded.txt'
3. Navigate directly to https://the-internet.herokuapp.com/upload (fresh load)
    - expect: Page loads the upload form
    - expect: 'File Uploader' heading is visible
    - expect: File input is empty (no file retained from previous upload)
    - expect: No 'File Uploaded!' heading is present
    - expect: No div#uploaded-files is present
    - expect: Page is in its initial empty state

### 8. Negative and Boundary Tests

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-UPLOAD-026: Double-clicking Upload button with file selected does not cause errors

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Select 'test.txt'
    - expect: File is selected
3. Rapidly click the Upload button twice
    - expect: Page navigates to success page once
    - expect: Success page displays 'File Uploaded!' and 'test.txt'
    - expect: No duplicate upload or error occurs

#### 8.2. TC-UPLOAD-027: File input does not accept multiple files (single file only enforced)

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
2. Attempt to select multiple files in the file input
    - expect: Only the last selected file is retained in the input
    - expect: Multiple attribute is not present on the file input
    - expect: Playwright's setInputFiles with multiple files only retains one

#### 8.3. TC-UPLOAD-028: Success page does not have a form element

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to /upload, select 'test.txt', and upload
    - expect: Success page is displayed
2. Inspect the success page DOM
    - expect: No form element is present on the success page
    - expect: No file input is present
    - expect: No Upload button is present
    - expect: Only 'File Uploaded!' heading and div#uploaded-files are present

#### 8.4. TC-UPLOAD-029: Clicking Upload multiple times with no file returns error each time

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: File input is empty
2. Click Upload button
    - expect: Internal Server Error page is displayed
3. Navigate back to /upload
    - expect: Upload form is displayed again
4. Click Upload button again with no file
    - expect: Internal Server Error page is displayed again

#### 8.5. TC-UPLOAD-030: Refreshing the success page does NOT re-upload the file

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to /upload, select 'test.txt', and upload
    - expect: Success page displays 'File Uploaded!' and 'test.txt'
2. Refresh the success page (F5 or page.reload())
    - expect: Page reloads to the upload form (not the success page)
    - expect: 'File Uploader' heading is visible
    - expect: File input is empty
    - expect: No 'File Uploaded!' heading is present
