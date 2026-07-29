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

function resolveSlug(test: TestCase): string {
  if (process.env.SLUG) return process.env.SLUG;
  const testsRoot = path.join(process.cwd(), 'tests') + path.sep;
  const file = test.location.file;
  return file.startsWith(testsRoot) ? file.slice(testsRoot.length).split(path.sep)[0] : 'unknown-suite';
}

export default class ScreenshotCollectorReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    const idMatch = test.title.match(TC_ID_RE);
    if (!idMatch) return;

    const screenshot = result.attachments.find(
      (a) => a.name === 'screenshot' && a.path && fs.existsSync(a.path)
    );
    if (!screenshot?.path) return;

    const destDir = path.join(OUTPUT_ROOT, resolveSlug(test));
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(screenshot.path, path.join(destDir, `${idMatch[0]}.png`));
  }
}
