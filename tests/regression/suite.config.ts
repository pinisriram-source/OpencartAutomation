import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import baseConfig from '../../playwright.config';

// The regression suite is an aggregator: it owns no spec files of its own and
// instead selects every @regression-tagged test across all pipeline suites.
// That keeps one copy of each test rather than duplicating logic here.
//
// pipeline-execute.yml runs `tests/<slug>` by path for a normal suite, which
// can't express "tests from many directories" -- so a slug whose directory
// contains suite.config.ts is run through this config instead. See CLAUDE.md's
// "Aggregator suites" section.

const REPO_ROOT = path.resolve(__dirname, '..', '..');

export default defineConfig({
  ...baseConfig,

  // Every path below is absolute. Playwright resolves relative paths against
  // the config file's own directory, so inheriting the base config's './tests'
  // and './reporters/...' would resolve them under tests/regression/ instead
  // of the repo root and silently find nothing.
  testDir: path.join(REPO_ROOT, 'tests'),
  outputDir: path.join(REPO_ROOT, 'playwright-results'),
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [path.join(REPO_ROOT, 'reporters', 'screenshot-collector.ts')],
  ],

  grep: /@regression/,

  // Chromium only, matching how the pipeline executes every other suite. The
  // base config's firefox/webkit projects are scoped to saucedemo-checkout,
  // which is not a pipeline suite and carries no @regression tags.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
