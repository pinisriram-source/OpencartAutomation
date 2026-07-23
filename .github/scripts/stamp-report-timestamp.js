// Sets meta.report_generated_at on a suite's dashboard-data JSON to the
// current UTC instant. meta.report_date only has day granularity, so two
// suites run on the same calendar day tie when the dashboard sorts "most
// recent first" -- this field gives that sort second-level precision
// without depending on the LLM-generated JSON to format a timestamp itself.
const fs = require("fs");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node stamp-report-timestamp.js <path-to-json>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
data.meta.report_generated_at = new Date().toISOString();
fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Stamped ${filePath} with report_generated_at=${data.meta.report_generated_at}`);
