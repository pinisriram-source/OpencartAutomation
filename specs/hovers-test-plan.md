# Hovers Test Plan

**Prepared By:** playwright-test-planner subagent (Claude Code, automated)
**Date:** 2026-07-26

## 1. Introduction

### 1.1 Test Plan Objectives

Validate hover-triggered UI behavior (caption reveal/hide per avatar, profile-link navigation) on the Hovers feature (the-internet.herokuapp.com/hovers) end-to-end via automated regression coverage, so future changes to this interaction don't regress silently and manual re-testing time is reduced.

## 2. Scope

### 2.1 In Scope
- Hover-triggered caption show/hide behavior for all three avatars, individually and in sequence
- "View profile" link visibility and navigation for each avatar
- Initial page-load state verification

### 2.2 Out of Scope
- Visual/pixel-level styling of the caption overlay (covered by functional visibility checks only, not appearance)
- Cross-browser matrix beyond Chromium (this repo's `playwright.config.ts` runs Chromium only)
- Performance/load testing of the page

## 3. Test Strategy

### 3.1 System Test
Functional/system-level UI testing of the Hovers feature via Playwright, covering hover-triggered caption behavior and profile navigation end-to-end in the browser.

### 3.2 Performance Test
Not applicable — performance/load testing is out of scope for this suite (see Section 2.2).

### 3.3 Security Test
Not applicable — security penetration testing is explicitly out of scope for this project.

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

**Actual environment:** GitHub Actions `ubuntu-latest` runner, Node.js (`lts/*`), Playwright + Chromium (installed via `npx playwright install --with-deps chromium`), target application reachable at https://the-internet.herokuapp.com/hovers.

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
Failing tests are recorded with expected/actual behavior in `streamlit_app/data/hovers-test-results.json`'s `defects` array and rendered in the dashboard's Defects Log tab.

## 7. Functions to be Tested
- Hover-triggered caption show/hide behavior for all three avatars, individually and in sequence
- "View profile" link visibility and navigation for each avatar
- Initial page-load state verification

## 8. Resources and Responsibilities

### 8.1 Resources
Claude Code (via AWS Bedrock, non-interactive `npx claude -p` invocations), the `playwright-test-planner` and `playwright-test-generator` subagents, GitHub Actions compute, and the Streamlit dashboard for review/reporting.

### 8.2 Responsibilities
- **QA Automation Engineer:** `playwright-test-planner` (this plan) and `playwright-test-generator` (the automation suite) Claude Code subagents
- **DevOps / CI Engineer:** the three-stage GitHub Actions pipeline (`pipeline-plan.yml` / `pipeline-automation.yml` / `pipeline-execute.yml`)
- **Product Owner / QA Lead:** whoever approves each stage in the dashboard's Review Pipeline Artifacts tab

## 9. Deliverables
- This test plan (`specs/hovers-test-plan.md`)
- The generated Playwright automation suite (`tests/hovers/`)
- The executed test-results report (`streamlit_app/data/hovers-test-results.json`), visible in the Streamlit dashboard

## 10. Suspension/Exit Criteria

**Suspension:** the pipeline halts (and marks the stage `failed` in `user-stories/hovers-review.json`) if the target application is unreachable, or if a stage's Claude Code run errors out before producing its expected artifact.

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
No persistent test data or database — the-internet.herokuapp.com/hovers is a static demo page with no login/session state; every test starts from a fresh navigation via `tests/seed.spec.ts`.

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
This file, the generated spec files under `tests/hovers/`, and `CLAUDE.md` (project rules and conventions).

## 16. Approvals
Recorded per-stage in `user-stories/hovers-review.json` (`plan.status`, `automation.status`, `execute.status`) and reflected in the Streamlit dashboard's Review Pipeline Artifacts tab — not a signature block, since approvals happen through that tab's Approve/Request Changes actions.

## 17. Application Overview

The Hovers feature demonstrates hover-based interactivity on a web page. The page displays three user avatar images arranged horizontally. Each avatar has an associated caption overlay that contains the user's name (formatted as "name: user1", "name: user2", or "name: user3") and a "View profile" link. These caption overlays are hidden by default and only become visible when the user hovers their mouse cursor over the corresponding avatar image. When the mouse moves away from an image (either by hovering over a different image or moving off all images entirely), the caption overlay for that image automatically hides again. Clicking the "View profile" link while hovering navigates to the user's profile page at the URL pattern /users/[1-3]. The page should never navigate or reload from hovering alone—only from an explicit click on a profile link.

## 18. Detailed Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-HOVERS-001: Verify page load shows three avatar images with no visible captions

**File:** `tests/hovers/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/hovers
2. Inspect the page content
    - expect: Exactly 3 avatar images are present on the page
    - expect: No caption overlay is visible for any avatar
    - expect: No 'View profile' link is visible for any avatar
    - expect: Page heading 'Hovers' is displayed
    - expect: Instruction text 'Hover over the image for additional information' is displayed

#### 1.2. TC-HOVERS-002: Verify all three avatar images are rendered correctly

**File:** `tests/hovers/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Locate all avatar images on the page
    - expect: First avatar image is visible
    - expect: Second avatar image is visible
    - expect: Third avatar image is visible
    - expect: All three images have alt text 'User Avatar'

### 2. Single Image Hover - First Avatar

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-HOVERS-003: Hovering over first avatar reveals user1 caption and link

**File:** `tests/hovers/first-avatar-hover.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the first avatar image
    - expect: Caption overlay becomes visible for the first avatar
    - expect: Caption displays 'name: user1'
    - expect: 'View profile' link becomes visible
    - expect: 'View profile' link href points to /users/1
    - expect: Second avatar caption remains hidden
    - expect: Third avatar caption remains hidden

#### 2.2. TC-HOVERS-004: Moving mouse away from first avatar hides its caption

**File:** `tests/hovers/first-avatar-hover.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the first avatar image
    - expect: Caption for user1 becomes visible
3. Move mouse cursor away from the first avatar (hover over page heading)
    - expect: Caption overlay for user1 is no longer visible
    - expect: 'View profile' link for user1 is no longer visible
    - expect: All avatar captions are hidden

### 3. Single Image Hover - Second Avatar

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-HOVERS-005: Hovering over second avatar reveals user2 caption and link

**File:** `tests/hovers/second-avatar-hover.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the second avatar image
    - expect: Caption overlay becomes visible for the second avatar
    - expect: Caption displays 'name: user2'
    - expect: 'View profile' link becomes visible
    - expect: 'View profile' link href points to /users/2
    - expect: First avatar caption remains hidden
    - expect: Third avatar caption remains hidden

#### 3.2. TC-HOVERS-006: Moving mouse away from second avatar hides its caption

**File:** `tests/hovers/second-avatar-hover.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the second avatar image
    - expect: Caption for user2 becomes visible
3. Move mouse cursor away from the second avatar (hover over page heading)
    - expect: Caption overlay for user2 is no longer visible
    - expect: 'View profile' link for user2 is no longer visible
    - expect: All avatar captions are hidden

### 4. Single Image Hover - Third Avatar

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-HOVERS-007: Hovering over third avatar reveals user3 caption and link

**File:** `tests/hovers/third-avatar-hover.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the third avatar image
    - expect: Caption overlay becomes visible for the third avatar
    - expect: Caption displays 'name: user3'
    - expect: 'View profile' link becomes visible
    - expect: 'View profile' link href points to /users/3
    - expect: First avatar caption remains hidden
    - expect: Second avatar caption remains hidden

#### 4.2. TC-HOVERS-008: Moving mouse away from third avatar hides its caption

**File:** `tests/hovers/third-avatar-hover.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the third avatar image
    - expect: Caption for user3 becomes visible
3. Move mouse cursor away from the third avatar (hover over page heading)
    - expect: Caption overlay for user3 is no longer visible
    - expect: 'View profile' link for user3 is no longer visible
    - expect: All avatar captions are hidden

### 5. Sequential Hover Behavior

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-HOVERS-009: Hovering from first to second avatar hides first caption and shows second

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the first avatar image
    - expect: Caption for user1 becomes visible
    - expect: Captions for user2 and user3 remain hidden
3. Move mouse cursor to hover over the second avatar image
    - expect: Caption for user1 is now hidden
    - expect: Caption for user2 becomes visible
    - expect: Caption for user3 remains hidden
    - expect: Only one caption is visible at a time

#### 5.2. TC-HOVERS-010: Hovering from second to third avatar hides second caption and shows third

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the second avatar image
    - expect: Caption for user2 becomes visible
    - expect: Captions for user1 and user3 remain hidden
3. Move mouse cursor to hover over the third avatar image
    - expect: Caption for user2 is now hidden
    - expect: Caption for user3 becomes visible
    - expect: Caption for user1 remains hidden
    - expect: Only one caption is visible at a time

#### 5.3. TC-HOVERS-011: Hovering from third to first avatar hides third caption and shows first

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the third avatar image
    - expect: Caption for user3 becomes visible
    - expect: Captions for user1 and user2 remain hidden
3. Move mouse cursor to hover over the first avatar image
    - expect: Caption for user3 is now hidden
    - expect: Caption for user1 becomes visible
    - expect: Caption for user2 remains hidden
    - expect: Only one caption is visible at a time

#### 5.4. TC-HOVERS-012: Hovering all three avatars in sequence shows only one caption at a time

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: No captions are visible
2. Hover over first avatar
    - expect: Only user1 caption is visible
3. Hover over second avatar
    - expect: Only user2 caption is visible
4. Hover over third avatar
    - expect: Only user3 caption is visible
5. Move mouse away from all avatars
    - expect: No captions are visible

### 6. Navigation via View Profile Links

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-HOVERS-013: Clicking View profile link for user1 navigates to /users/1

**File:** `tests/hovers/view-profile-navigation.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the first avatar image
    - expect: Caption for user1 becomes visible
    - expect: 'View profile' link is visible
3. Click the 'View profile' link for user1
    - expect: Browser navigates to https://the-internet.herokuapp.com/users/1
    - expect: URL changes from /hovers to /users/1
    - expect: Navigation completes successfully

#### 6.2. TC-HOVERS-014: Clicking View profile link for user2 navigates to /users/2

**File:** `tests/hovers/view-profile-navigation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the second avatar image
    - expect: Caption for user2 becomes visible
    - expect: 'View profile' link is visible
3. Click the 'View profile' link for user2
    - expect: Browser navigates to https://the-internet.herokuapp.com/users/2
    - expect: URL changes from /hovers to /users/2
    - expect: Navigation completes successfully

#### 6.3. TC-HOVERS-015: Clicking View profile link for user3 navigates to /users/3

**File:** `tests/hovers/view-profile-navigation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover mouse cursor over the third avatar image
    - expect: Caption for user3 becomes visible
    - expect: 'View profile' link is visible
3. Click the 'View profile' link for user3
    - expect: Browser navigates to https://the-internet.herokuapp.com/users/3
    - expect: URL changes from /hovers to /users/3
    - expect: Navigation completes successfully

### 7. Negative and Boundary Tests

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-HOVERS-016: Hovering over page does not trigger navigation

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/hovers
2. Hover over the first avatar image
    - expect: Caption becomes visible
3. Wait 2 seconds while hovering
    - expect: Page does not navigate
    - expect: URL remains https://the-internet.herokuapp.com/hovers
    - expect: No page reload occurs
4. Hover over the second avatar image
    - expect: Page does not navigate
    - expect: URL remains https://the-internet.herokuapp.com/hovers
5. Hover over the third avatar image
    - expect: Page does not navigate
    - expect: URL remains https://the-internet.herokuapp.com/hovers

#### 7.2. TC-HOVERS-017: Caption remains hidden when hovering outside avatar area

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover over the page heading 'Hovers'
    - expect: No caption overlays are visible
3. Hover over the instruction text
    - expect: No caption overlays are visible
4. Hover over the area between the first and second avatar
    - expect: No caption overlays are visible
5. Hover over the footer area
    - expect: No caption overlays are visible

#### 7.3. TC-HOVERS-018: Rapid hover changes show correct caption without delay

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Rapidly hover over first avatar then second avatar then third avatar in quick succession
    - expect: Each caption appears correctly when its avatar is hovered
    - expect: Previous caption hides when moving to next avatar
    - expect: No captions overlap or display incorrectly
    - expect: Final hover on third avatar shows user3 caption

#### 7.4. TC-HOVERS-019: Caption hides correctly when mouse leaves page viewport while hovering

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover over the first avatar image
    - expect: Caption for user1 becomes visible
3. Move mouse cursor outside the browser viewport
    - expect: Caption for user1 hides
    - expect: No captions remain visible

#### 7.5. TC-HOVERS-020: View profile link is not clickable when caption is hidden

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: No captions are visible
2. Attempt to locate the 'View profile' link for user1 in the DOM
    - expect: Link element exists in DOM but is not visible
    - expect: Link is not interactable in its hidden state
3. Verify attempting to click the hidden link area has no effect
    - expect: Page does not navigate
    - expect: No error occurs

### 8. Caption Content Verification

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-HOVERS-021: First avatar caption displays correct user name format

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover over the first avatar image
    - expect: Caption is visible
3. Verify the caption text content
    - expect: Caption text exactly matches 'name: user1'
    - expect: Text format uses lowercase for 'name:' and 'user1'
    - expect: Heading level is h5
    - expect: 'View profile' link text is exactly 'View profile'

#### 8.2. TC-HOVERS-022: Second avatar caption displays correct user name format

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover over the second avatar image
    - expect: Caption is visible
3. Verify the caption text content
    - expect: Caption text exactly matches 'name: user2'
    - expect: Text format uses lowercase for 'name:' and 'user2'
    - expect: Heading level is h5
    - expect: 'View profile' link text is exactly 'View profile'

#### 8.3. TC-HOVERS-023: Third avatar caption displays correct user name format

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover over the third avatar image
    - expect: Caption is visible
3. Verify the caption text content
    - expect: Caption text exactly matches 'name: user3'
    - expect: Text format uses lowercase for 'name:' and 'user3'
    - expect: Heading level is h5
    - expect: 'View profile' link text is exactly 'View profile'

#### 8.4. TC-HOVERS-024: All View profile links have correct href attributes

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the Hovers page
    - expect: Page loads successfully
2. Hover over first avatar and verify link href
    - expect: 'View profile' link href is '/users/1'
3. Hover over second avatar and verify link href
    - expect: 'View profile' link href is '/users/2'
4. Hover over third avatar and verify link href
    - expect: 'View profile' link href is '/users/3'
