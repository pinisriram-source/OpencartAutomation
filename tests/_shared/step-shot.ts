import { Page, test } from '@playwright/test';

/**
 * Captures visual evidence for one numbered test-plan step.
 *
 * `screenshot: 'on'` in playwright.config.ts only captures a single frame at
 * the END of a test, which can't evidence an earlier step's assertion once a
 * later step has changed the page -- and for a passing test that final frame
 * is the only visual record there is. Calling this right after a step's
 * assertions records what the page actually looked like when that step was
 * verified, for passing and failing steps alike.
 *
 * The image is attached to the test result rather than written straight to
 * disk: reporters/screenshot-collector.ts already owns the mapping from a test
 * to its stable, TC-ID-keyed path, so attaching keeps that logic in one place
 * and works the same locally and in CI.
 *
 * JPEG at reduced quality on purpose -- these multiply by the number of steps
 * in every test, and they only need to be legible enough to confirm a page
 * state, not pixel-exact (nothing compares them against a baseline).
 *
 * Quality 40 from measuring both formats on real pages under test, because
 * JPEG is not automatically the smaller choice here: on a flat, text-heavy
 * page PNG compresses better (23.5 KB vs 28.8 KB at quality 60), while on an
 * image-heavy page JPEG wins comfortably (14.0 KB vs 23.3 KB at quality 40).
 * Quality 40 is the point where it matches PNG on flat pages and still takes
 * ~40% off image-heavy ones, so it never does much worse than PNG and often
 * much better.
 */
export async function stepShot(page: Page, step: number): Promise<void> {
  const body = await page.screenshot({ type: 'jpeg', quality: 40, scale: 'css' });
  await test.info().attach(`step-${step}`, { body, contentType: 'image/jpeg' });
}
