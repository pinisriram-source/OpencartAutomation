# Regression Suite — Test Plan

**Prepared By:** QA Automation Engineer
**Date:** 2026-08-07

---

## 1. Introduction

### 1.1 Test Plan Objectives

The Regression Suite is an **aggregator suite**. It owns no test cases of its
own; instead it selects and executes every test across all pipeline-generated
suites that is marked as part of the regression set, in a single run, against
a single report.

Its objective is to answer one question that no individual suite can: *has any
previously-verified behaviour, anywhere across the automated estate, stopped
working?* Individual suites answer that only for their own feature area, and
each is executed on its own schedule when its own request is reviewed and run.
Between those runs, a regression introduced in shared infrastructure — the
shared `BasePage`, the Playwright configuration, a dependency upgrade, or a
change to a target application — can sit undetected in a suite nobody has
re-run recently.

This suite closes that gap by executing the entire regression set in one pass,
producing one consolidated pass/fail picture. Section 7 lists the source suites
and test counts currently in scope.

---

## 2. Scope

### 2.1 In Scope

- Execution of every regression-marked test across the source suites listed in
  Section 7.
- Consolidated pass/fail reporting for the full set, including per-test
  screenshots and a single Test Execution Report.
- Detection of cross-cutting regressions: shared page-object base class,
  Playwright configuration, browser version, dependency upgrades, and
  availability or behavioural drift in the target applications.

### 2.2 Out of Scope

- **Authoring new test cases.** This suite adds no test logic. A behaviour is
  covered here only because some source suite already covers it. New coverage
  is added by submitting a request for the relevant feature suite, not here.
- **Performance, load, and stress testing.** Execution duration is recorded
  for scheduling purposes only and is not a pass/fail criterion.
- **Security and penetration testing.**
- **Visual and pixel-diff regression.** Screenshots are captured as evidence
  of assertion outcomes, not compared against a baseline.
- **Cross-browser execution.** This suite runs Chromium only, matching how
  every source suite is executed.
- **Non-pipeline suites.** `tests/storefront`, `tests/admin`, and
  `tests/saucedemo-checkout` are excluded; they target different applications
  and are not produced by this pipeline.

---

## 3. Test Strategy

### 3.1 System Test

The full regression set is executed against the live, publicly hosted target
applications listed in Section 7 — the same environments the source suites
target. Each test drives a real Chromium browser through the documented user
workflow and asserts on observable UI state. No component is stubbed or
mocked; a failure therefore reflects either a genuine behavioural regression,
a change in the target application, or an unstable test.

### 3.2 Performance Test

Not applicable — performance and load testing are out of scope for this suite
(see Section 2.2).

### 3.3 Security Test

Not applicable — security testing is out of scope for this suite (see
Section 2.2).

### 3.4 Automated Test

The entire suite is automated; there is no manual execution path. It is
defined declaratively rather than as spec files: a Playwright configuration at
`tests/regression/suite.config.ts` selects every test carrying the regression
marker across the whole `tests/` tree. Adding a regression-marked test to any
source suite therefore enrols it here automatically, with no change to this
suite.

Because test case IDs are only unique *within* a source suite — `TC-LOGIN-001`
exists in both login suites, and several `TC-DROPDOWN-*` IDs exist in both
dropdown suites — every test in this suite is identified as
`<source-suite>/<Test Case ID>`, and its screenshot is filed under the same
namespaced path. This keeps every test individually addressable in the
dashboard.

### 3.5 Stress and Volume Test

Not applicable — stress and volume testing are out of scope for this suite
(see Section 2.2).

### 3.6 Recovery Test

Not applicable — the suite holds no persistent state, and each test starts
from a fresh browser context.

### 3.7 Documentation Test

This plan, the source suites' own test plans, and the generated Test Execution
Report are reviewed for accuracy against the executed suite. In particular the
source-suite inventory in Section 7 is verified against the tests the
configuration actually selects, so the plan cannot silently drift out of date
as suites are added.

### 3.8 Beta Test

Not applicable — this is an internal automation asset with no external release.

### 3.9 User Acceptance Test

Acceptance is recorded through the dashboard's Review tab. A reviewer approves
this plan, then the suite definition, before execution is permitted; the
resulting report is the acceptance artefact.

---

## 4. Environment Requirements

### 4.1 Data Entry Workstations

Not applicable.

### 4.2 Mainframe

Not applicable.

### Actual Environment

- **Runner:** GitHub Actions `ubuntu-latest`
- **Browser:** Headless Chromium (Desktop Chrome device profile), single worker
- **Runtime:** Node.js LTS, Playwright with TypeScript
- **Applications Under Test:** `https://the-internet.herokuapp.com` and
  `https://practicetestautomation.com` — see Section 7 for the per-suite
  breakdown
- **Configuration:** `tests/regression/suite.config.ts`

---

## 5. Test Schedule

On demand. The suite is executed when a reviewer approves it in the dashboard,
and is intended to be re-run after any change to shared infrastructure or
dependencies, and periodically to detect drift in the target applications. It
is not calendar-bound.

---

## 6. Control Procedures

### 6.1 Reviews

This plan and the suite definition are each reviewed and approved through the
dashboard's Review tab before execution is permitted.

### 6.2 Bug Review Meetings

Not applicable — the pipeline is asynchronous and review happens in the
dashboard rather than in scheduled meetings.

### 6.3 Change Request

Changes are requested through the Review tab's "Request Changes" action, which
returns the suite to the prior stage with the reviewer's feedback attached.

### 6.4 Defect Reporting

Failures are captured in the generated results data and surfaced in the Test
Execution Report's Defect Tracking Data table, each linked to the namespaced
test ID that produced it and to that test's end-of-run screenshot.

A defect found here is, by design, a defect in a **source suite** — either the
application it targets has regressed, or that suite's test has become
unstable. Remediation belongs in the source suite, not in this one.

---

## 7. Functions to be Tested

One entry per source suite.

This inventory is **generated, not hand-maintained**. Because membership in
this suite is dynamic — any test marked as part of the regression set joins it
automatically — a hand-written table would go stale the moment a new suite was
added, with nothing to catch it. It is therefore regenerated from the tests the
suite configuration actually selects on every execution, so it cannot disagree
with what ran. This section is also the only place in this plan that states
counts, so regenerating it keeps the whole document accurate.

<!-- BEGIN:REGRESSION-INVENTORY -->

<!-- Generated by .github/scripts/sync-regression-inventory.js on each
     execution of this suite. Do not edit by hand -- edits are overwritten. -->

| # | Source Suite | Application Under Test | Tests | Tiered |
|---|---|---|---|---|
| 1 | `key-presses` | the-internet.herokuapp.com/key_presses | 35 | No |
| 2 | `dynamic-loading-hidden-and-rendered-elements` | the-internet.herokuapp.com/dynamic_loading | 32 | Yes |
| 3 | `form-authentication-login` | the-internet.herokuapp.com/login | 30 | Yes |
| 4 | `single-file-upload-flow` | the-internet.herokuapp.com/upload | 30 | Yes |
| 5 | `add-remove-elements` | the-internet.herokuapp.com/add_remove_elements | 25 | No |
| 6 | `testing-request-dynamic-controls` | the-internet.herokuapp.com/dynamic_controls | 25 | No |
| 7 | `hovers` | the-internet.herokuapp.com/hovers | 24 | Yes |
| 8 | `practice-login-page-smoke-test` | practicetestautomation.com/practice-test-login | 23 | No |
| 9 | `login-page-smoke-test` | practicetestautomation.com/practice-test-login | 15 | Yes |
| 10 | `dropdown-selection-behavior` | the-internet.herokuapp.com/dropdown | 11 | No |
| 11 | `context-menu` | the-internet.herokuapp.com/context_menu | 10 | No |
| 12 | `dropdown-smoke-test` | the-internet.herokuapp.com/dropdown | 9 | No |
| | **Total** | **12 suites** | **269** | **131 tiered** |

"Tiered" indicates whether that suite's own test plan classifies its cases
as Smoke / Sanity / Functional. 5 suite(s) (131 tests) do; the
remaining 7 (138 tests) predate that classification and carry
no tier. All are part of the regression set regardless — tier depth and
regression membership are independent properties.

<!-- END:REGRESSION-INVENTORY -->

---

## 8. Resources and Responsibilities

### 8.1 Resources

- GitHub Actions `ubuntu-latest` runners
- The Streamlit review-and-reporting dashboard
- The source suites listed in Section 7 and their committed page objects

### 8.2 Responsibilities

- **QA Automation Engineer** — maintains this suite's configuration, triages
  failures, and routes each to the owning source suite.
- **DevOps / CI Engineer** — maintains the workflow, runner image, and
  dependency versions.
- **Product Owner / QA Lead** — reviews and approves this plan and the suite
  definition, and prioritises remediation of confirmed regressions.

---

## 9. Deliverables

- This test plan (`specs/regression-test-plan.md`)
- The suite definition (`tests/regression/suite.config.ts`)
- Consolidated results data (`streamlit_app/data/regression-test-results.json`)
- Test Execution Report (`reports/regression-test-execution-report.xlsx` and
  the dashboard's Test Execution Report tab)
- Per-test screenshots, filed under
  `reports/screenshots/regression/<source-suite>/<Test Case ID>.png`

---

## 10. Suspension / Exit Criteria

Execution is suspended if a target application is wholly unreachable, since
every result would then be a false failure attributable to the environment
rather than to the code under test.

Exit criteria: every test in the Section 7 inventory has executed, results data
and the Test Execution Report have been generated, and every failure has been
triaged to either a confirmed regression or an unstable test in the owning
source suite.

---

## 11. Resumption Criteria

Execution resumes once the target applications are reachable again. The suite
holds no state between runs, so a suspended run is re-executed in full rather
than resumed part-way.

---

## 12. Dependencies

### 12.1 Personal

Reviewer availability to approve the plan and suite definition, since
execution is gated on both.

### 12.2 Software

Node.js LTS, Playwright, TypeScript, and the committed source suites. Any
upgrade to these is itself a reason to re-run this suite.

### 12.3 Hardware

GitHub-hosted `ubuntu-latest` runners.

### 12.4 Test Data and Database

No database. Test data is the credentials and fixture files each source suite
already carries; this suite introduces none of its own. Fixture files
referenced by the upload suite must remain at their committed paths.

---

## 13. Risks

### 13.1 Schedule

The suite is materially longer than any individual suite, so it is unsuitable
as a per-change gate and is positioned as an on-demand and periodic check.

### 13.2 Technical

The suite depends on third-party applications that can change or become
unavailable without notice, producing failures unrelated to any change in this
repository. Triage must therefore distinguish target-application drift from
genuine regressions before a defect is raised.

### 13.3 Management

A large consolidated failure count can obscure which source suite is actually
at fault. Namespaced test IDs and per-suite screenshot paths exist specifically
so every failure is attributable to one source suite.

### 13.4 Personnel

Knowledge of this many suites is concentrated in a small team; per-suite test
plans are the mitigation.

### 13.5 Requirements

This suite inherits its requirements from the source suites and holds none of
its own, so a gap in a source suite's coverage is a gap here too. This suite
cannot detect a regression in behaviour that was never covered.

---

## 14. Tools

Playwright (test runner and browser automation), TypeScript, GitHub Actions,
the Streamlit dashboard, and `openpyxl` for the Test Execution Report workbook.

---

## 15. Documentation

This plan, the source suites' test plans, the generated results data, and the
Test Execution Report.

---

## 16. Approvals

Recorded per stage in `user-stories/regression-review.json` via the dashboard's
Review tab Approve / Request Changes actions.

---

## 17. Application Overview

This suite has no single application under test. It spans the applications and
feature areas listed in Section 7 — pages of `the-internet.herokuapp.com`
(add/remove elements, context menu, dropdown, dynamic controls, dynamic
loading, form authentication, hovers, key presses, file upload) and the
`practicetestautomation.com` practice login page.

What holds them together is not a shared application but shared *machinery*:
every one is driven by the same Playwright version, the same browser build,
the same shared `BasePage`, and the same CI runner image. That shared
machinery is precisely what this suite exists to regression-test. A change to
any of it can break tests in suites whose own feature area nobody has touched
in weeks, and only a consolidated run makes that visible.

---

## 18. Detailed Test Scenarios

This suite defines no scenarios of its own. Every executed test case is
defined, and remains owned by, its source suite's test plan — which for a
source suite listed in Section 7 is always `specs/<source-suite>-test-plan.md`.
That naming rule is stated here rather than enumerated as a table so this
section cannot fall out of step with Section 7 as suites are added.

Consequently this suite is **not** an input to the automation generator: there
is nothing here to generate. The membership rule in Section 3.4 is the whole
definition, and the suite's contents change only when a source suite gains or
loses a regression-marked test.

To add a scenario to this suite, add it to the appropriate source suite's plan
and mark the resulting test as part of the regression set; it will be picked up
on the next run without any manual change to this document — Section 7
regenerates itself as part of that run.
