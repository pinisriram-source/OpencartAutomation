import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

// screenshot: 'on' in playwright.config.ts makes Playwright attach a
// screenshot to every test result (pass or fail), but it lands at a
// temporary, non-deterministic path. This reporter copies each one into a
// stable TC-ID-keyed location so the Streamlit dashboard can look it up by
// test case ID and display it inline, instead of only linking out to the
// CI artifact zip.
const OUTPUT_ROOT = path.join(process.cwd(), 'reports', 'screenshots');
const TC_ID_RE = /TC-[A-Z0-9]+-\d+/;

function sourceSuite(test: TestCase): string {
  const testsRoot = path.join(process.cwd(), 'tests') + path.sep;
  const file = test.location.file;
  return file.startsWith(testsRoot) ? file.slice(testsRoot.length).split(path.sep)[0] : 'unknown-suite';
}

// For a normal suite the run's slug IS the source suite's folder, so this is
// just reports/screenshots/<slug>/<TC-ID>.png as before.
//
// An aggregator suite (SLUG=regression) pools tests from every suite at once,
// and TC-IDs are only unique *within* a suite -- TC-LOGIN-001 exists in both
// login-page-smoke-test and practice-login-page-smoke-test, TC-DROPDOWN-003 in
// both dropdown suites. Flattening those into one directory would have each
// pair silently overwrite the other. So when the slug isn't the source suite,
// nest one level: reports/screenshots/<slug>/<source-suite>/<TC-ID>.png.
function destDirFor(test: TestCase): string {
  const suite = sourceSuite(test);
  const slug = process.env.SLUG;
  if (!slug) return path.join(OUTPUT_ROOT, suite);
  return slug === suite ? path.join(OUTPUT_ROOT, slug) : path.join(OUTPUT_ROOT, slug, suite);
}

export default class ScreenshotCollectorReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    const idMatch = test.title.match(TC_ID_RE);
    if (!idMatch) return;

    const screenshot = result.attachments.find(
      (a) => a.name === 'screenshot' && a.path && fs.existsSync(a.path)
    );
    if (!screenshot?.path) return;

    const destDir = destDirFor(test);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(screenshot.path, path.join(destDir, `${idMatch[0]}.png`));
  }
}
