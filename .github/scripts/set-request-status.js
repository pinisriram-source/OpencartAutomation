#!/usr/bin/env node
// Updates the "**Status:** ..." line in a submitted user-stories/request-*.md
// file in place. Used by .github/workflows/full-pipeline.yml to report
// progress back to the Streamlit app between pipeline stages.
//
// Usage: node set-request-status.js <path-to-request-file> "<new status text>"

const fs = require("fs");

const [, , filePath, newStatus] = process.argv;

if (!filePath || newStatus === undefined) {
  console.error("Usage: node set-request-status.js <file> <status text>");
  process.exit(1);
}

const content = fs.readFileSync(filePath, "utf-8");
const statusLineRe = /^\*\*Status:\*\*.*$/m;

if (!statusLineRe.test(content)) {
  console.error(`No "**Status:**" line found in ${filePath}`);
  process.exit(1);
}

const updated = content.replace(statusLineRe, `**Status:** ${newStatus}`);
fs.writeFileSync(filePath, updated, "utf-8");
console.log(`Updated status in ${filePath}: ${newStatus}`);
