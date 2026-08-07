#!/usr/bin/env node
// Creates/updates a pipeline review-status JSON for a slug
// (user-stories/<slug>-review.json), tracking per-stage state (plan /
// automation / execute) across the human-reviewed pipeline. Read by the
// Streamlit dashboard's Review tab and by pipeline-plan.yml /
// pipeline-automation.yml / pipeline-execute.yml.
//
// Usage:
//   node set-review-status.js <file> --stage <plan|automation|execute> \
//     [--slug <slug>] [--request-file <path>] [--status <status>] \
//     [--path <artifactPath>] [--bump-revision] [--clear-feedback] [--run-url <url>] \
//     [--reset-downstream]
//
// --reset-downstream clears every stage *after* --stage back to its
// not_started default. Use it when a stage starts a fresh cycle, because
// everything downstream is invalidated by it: re-planning a slug that was
// already run through the pipeline otherwise leaves the previous cycle's
// automation/execute state in place, and the dashboard then shows a
// "Completed" execution (with the old run's pass/fail numbers) above a
// test plan that hasn't even been approved yet.

const fs = require("fs");

const STAGE_ORDER = ["plan", "automation", "execute"];

function defaultStage(name) {
  return name === "execute"
    ? { status: "not_started", workflow_run_url: "" }
    : { status: "not_started", path: "", revision: 0, feedback: "" };
}

function parseArgs(argv) {
  const [file, ...rest] = argv;
  const opts = { file };
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    if (name === "bump-revision" || name === "clear-feedback" || name === "reset-downstream") {
      opts[name] = true;
    } else {
      opts[name] = rest[++i];
    }
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.file || !opts.stage) {
  console.error("Usage: node set-review-status.js <file> --stage <plan|automation|execute> [options]");
  process.exit(1);
}

let data;
if (fs.existsSync(opts.file)) {
  data = JSON.parse(fs.readFileSync(opts.file, "utf8"));
} else {
  data = {
    slug: opts.slug || "",
    request_file: opts["request-file"] || "",
    plan: defaultStage("plan"),
    automation: defaultStage("automation"),
    execute: defaultStage("execute"),
  };
}

if (opts.slug) data.slug = opts.slug;
if (opts["request-file"]) data.request_file = opts["request-file"];

if (!data[opts.stage]) {
  data[opts.stage] = defaultStage(opts.stage);
}
const stage = data[opts.stage];

if (opts["reset-downstream"]) {
  const from = STAGE_ORDER.indexOf(opts.stage);
  for (const name of STAGE_ORDER.slice(from + 1)) {
    data[name] = defaultStage(name);
  }
}

if (opts.status) stage.status = opts.status;
if (opts.path) stage.path = opts.path;
if (opts["bump-revision"]) stage.revision = (stage.revision || 0) + 1;
if (opts["clear-feedback"]) stage.feedback = "";
if (opts["run-url"]) stage.workflow_run_url = opts["run-url"];

data.updated_at = new Date().toISOString();

fs.writeFileSync(opts.file, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Updated ${opts.file}: ${opts.stage}.status=${stage.status}`);
