#!/usr/bin/env node
// Verifies every test() in a pipeline-generated suite has a Smoke/Sanity/
// Functional tier tag, per CLAUDE.md's "Test tiers -- 'Submit New Request'
// pipeline suites" section. The generation prompt instructs the agent to add
// these, but nothing else checks it actually happened -- this is the hard
// gate, mirroring how "Verify automation suite was created" already checks
// spec files exist at all rather than trusting the prompt was followed.
//
// Usage: node check-test-tiers.js <tests/slug-dir>
// Exits 1 (and lists the offending tests) if any test() lacks a tier tag.
//
// Accepts both the single-tag form and the array form, since tests carry a
// second @regression tag alongside their tier:
//   { tag: '@smoke' }
//   { tag: ['@smoke', '@regression'] }

const fs = require("fs");
const path = require("path");

const [, , dir] = process.argv;
if (!dir) {
  console.error("Usage: node check-test-tiers.js <tests/slug-dir>");
  process.exit(1);
}

if (!fs.existsSync(dir)) {
  console.error(`${dir} does not exist`);
  process.exit(1);
}

function findSpecFiles(root) {
  const results = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSpecFiles(full));
    } else if (entry.name.endsWith(".spec.ts")) {
      results.push(full);
    }
  }
  return results;
}

// Matches test('title', ...) / test("title", ...) / test(`title`, ...) --
// deliberately excludes test.describe(/.beforeEach(/.afterEach(/.step( etc.,
// since "test." immediately followed by a non-"(" character can't match
// \btest\( at all.
const TEST_CALL_RE = /\btest\(\s*['"`]/g;
// The optional [...] prefix allows the array form, and is order-independent
// -- ['@regression', '@smoke'] matches just as well as ['@smoke', '@regression'].
const TIER_TAG_RE = /tag:\s*(?:\[[^\]]*)?['"]@(smoke|sanity|functional)['"]/;

const missing = [];

for (const file of findSpecFiles(dir)) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = TEST_CALL_RE.exec(content))) {
    const start = match.index;
    // The test's title/options end where its body function begins -- look
    // for that boundary rather than assuming a fixed number of arguments,
    // since a tagged test has one more argument than an untagged one.
    const relativeBodyStart = content.slice(start).search(/async\s*\(/);
    if (relativeBodyStart === -1) continue;
    const header = content.slice(start, start + relativeBodyStart);
    if (!TIER_TAG_RE.test(header)) {
      const line = content.slice(0, start).split("\n").length;
      const titleMatch = header.match(/['"`]([^'"`]+)['"`]/);
      missing.push(`${file}:${line} -- ${titleMatch ? titleMatch[1] : "(untitled)"}`);
    }
  }
}

if (missing.length) {
  console.error(`${missing.length} test(s) missing a Smoke/Sanity/Functional tier tag:`);
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}

console.log("All tests have a tier tag.");
