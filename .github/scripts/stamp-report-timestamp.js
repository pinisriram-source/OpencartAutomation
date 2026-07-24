// Sets meta.report_generated_at and meta.workflow_run_url on a suite's
// dashboard-data JSON. report_generated_at gives the "most recent first"
// sort second-level precision (meta.report_date is day-only, so two suites
// run on the same calendar day would otherwise tie). workflow_run_url links
// failed tests back to the Actions run that produced them, where the
// playwright-report artifact holds each failure's screenshot/trace/video --
// neither is trusted to the LLM-generated JSON; both are stamped
// deterministically here from the job's own environment.
const fs = require("fs");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node stamp-report-timestamp.js <path-to-json>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
data.meta.report_generated_at = new Date().toISOString();

const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
if (GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_RUN_ID) {
  data.meta.workflow_run_url = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Stamped ${filePath} with report_generated_at=${data.meta.report_generated_at}`);
if (data.meta.workflow_run_url) {
  console.log(`Stamped ${filePath} with workflow_run_url=${data.meta.workflow_run_url}`);
}
