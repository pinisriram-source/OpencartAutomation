Load the agent defined in:

.claude/agents/playwright-automation-agent-tutorialsninja.md

Read CLAUDE.md before starting.

Feature to automate:

\$ARGUMENTS

## Phase 1 -- Application Exploration

1.  Load `.claude/skills/tutorialsninja-app-knowledge.md`.
2.  Load `.claude/skills/tutorialsninja-playwright-automation-standards.md`.
3.  Navigate to the TutorialsNinja application at the `STOREFRONT_BASE_URL`
    defined in `.env` (`https://tutorialsninja.com/demo/`).
4.  Explore the feature: `$ARGUMENTS`.
5.  Identify all forms, controls, validations, success paths and error
    paths.
6.  Capture stable Playwright locators following the automation
    standards.
7.  Produce a structured automation test plan including:
    -   Functional scenarios
    -   Negative scenarios
    -   Boundary scenarios
    -   Validation scenarios
    -   Business rule scenarios
    -   UI scenarios
    -   Automation priority

## Phase 2 -- Playwright Generation

Using the exploration results:

8.  Generate a Page Object Model class.
9.  Generate a complete Playwright TypeScript spec covering all
    identified scenarios.
10. Apply assertion standards from `playwright-automation-standards.md`.
11. Add screenshot-on-failure and trace collection.
12. Externalize all test data to JSON files.
13. Reuse common fixtures and utilities.

## Output Files

-   Spec File: `/tests/<feature-name>.spec.ts`
-   Page Object: `/pages/<feature-name>.page.ts`
-   Test Data: `/test-data/<feature-name>.json`
-   Optional Fixture: `/fixtures/<feature-name>.fixture.ts`

Ensure the generated automation is independent, repeatable,
maintainable, and follows the Page Object Model.
