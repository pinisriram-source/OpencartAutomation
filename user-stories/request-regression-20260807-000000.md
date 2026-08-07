# Testing Request: Regression Suite

**Submitted via:** Claude Code (authored directly, not a dashboard submission)
**Submitted date (UTC):** 2026-08-07 00:00:00
**Status:** Pending review -- test plan and suite definition awaiting approval

## Application URL
Multiple -- this suite spans every application already covered by the existing
pipeline suites (https://the-internet.herokuapp.com and
https://practicetestautomation.com). See Section 7 of
`specs/regression-test-plan.md` for the per-suite breakdown.

## Requirements / Acceptance Criteria

Add a standing Regression Suite as a first-class suite in the pipeline and
dashboard, alongside the existing feature suites.

Unlike every other suite, this one is an **aggregator**: it authors no test
cases and duplicates no test logic. It selects and runs every existing test
that is marked as part of the regression set, across all pipeline suites, in
one execution producing one consolidated report.

The problem it solves: each feature suite is executed only when its own
request is reviewed and run, so a regression in shared machinery -- the shared
`BasePage`, the Playwright config, a dependency or browser upgrade, or drift
in a target application -- can sit undetected in any suite nobody has re-run
recently. No single suite can detect that; only a consolidated run can.

Acceptance Criteria:
- AC1: The suite selects every regression-marked test across all pipeline
  suites (269 tests across 12 source suites at time of writing) and no others.
  Non-pipeline suites (`tests/storefront`, `tests/admin`,
  `tests/saucedemo-checkout`) are excluded.
- AC2: The suite contains no copied or re-authored test logic. A test appears
  here only because a source suite already defines it, and remains owned and
  maintained by that source suite.
- AC3: Membership is automatic. Adding a regression-marked test to any source
  suite enrols it here on the next run, with no edit to this suite.
- AC4: Every test in the run is individually addressable despite test case IDs
  only being unique within a source suite (`TC-LOGIN-001` exists in two suites,
  as do several `TC-DROPDOWN-*`). Colliding IDs must not overwrite one another
  in results or screenshots.
- AC5: The suite runs through the existing three-stage pipeline (plan review →
  suite review → execute) and appears in the dashboard like any other suite,
  with its own test plan, review record, results data, and Test Execution
  Report.
- AC6: Executing it produces a per-test screenshot for every test, pass or
  fail, filed so that each is attributable to its source suite.
- AC7: Existing single-suite executions are unaffected -- their run command,
  results data, and screenshot paths stay exactly as they are.

---
*Plan: `specs/regression-test-plan.md`. Suite definition:
`tests/regression/suite.config.ts`.*
