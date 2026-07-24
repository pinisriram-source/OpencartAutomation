#!/usr/bin/env node
// Prints one field from a stage in the review-status JSON, for use in bash:
//   FEEDBACK=$(node get-review-field.js "$REVIEW_FILE" plan feedback)
// Prints nothing (exit 0) if the file, stage, or field doesn't exist yet --
// callers treat an empty result as "no value set" rather than an error, since
// this is queried before the file necessarily exists (first run for a slug).
//
// Usage: node get-review-field.js <file> <stage> <field>

const fs = require("fs");
const [, , file, stage, field] = process.argv;

if (!file || !stage || !field) {
  console.error("Usage: node get-review-field.js <file> <stage> <field>");
  process.exit(1);
}

if (!fs.existsSync(file)) {
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const value = data[stage] && data[stage][field];
if (value !== undefined && value !== null) {
  process.stdout.write(String(value));
}
