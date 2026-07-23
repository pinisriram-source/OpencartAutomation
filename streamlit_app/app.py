"""
QA Test Execution Report — Streamlit dashboard.

Reads structured test-results data from data/*-test-results.json (one file
per suite: the original SauceDemo suite, plus one per full-pipeline run) and
renders it as an interactive report: KPI summary, full per-test execution
matrix, coverage by business use case, coverage by business rule, and the
defects log. A suite picker lets the viewer switch between suites.
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from github_commit import create_file, get_file, trigger_workflow, wait_for_ref

# --- Palette (validated categorical + status colors; see dataviz skill) ---
CATEGORICAL = ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a", "#eb6834"]
STATUS_GOOD = "#0ca30c"
STATUS_WARNING = "#fab219"
MUTED_BG = "#e1e0d9"
SECONDARY_INK = "#52514e"

DATA_DIR = Path(__file__).parent / "data"
REPO_ROOT = Path(__file__).parent.parent

LOCATOR_METHOD_RE = re.compile(
    r"\.(getByRole|getByLabel|getByTestId|getByText|getByPlaceholder|getByAltText|getByTitle|locator)\("
)
ASSERTION_LINE_RE = re.compile(r"expect\(")

# --- Target repo for the "Submit New Request" form ---
GITHUB_OWNER = "pinisriram-source"
GITHUB_REPO = "OpencartAutomation"
GITHUB_BRANCH = "main"
GITHUB_WORKFLOW_FILE = "saucedemo-checkout.yml"
GITHUB_FULL_PIPELINE_WORKFLOW_FILE = "full-pipeline.yml"


def github_url(repo_path: str) -> str:
    """Link to a path inside the tracked GitHub repo (cloud), not a local filesystem path."""
    kind = "tree" if repo_path.endswith("/") else "blob"
    return f"https://github.com/{GITHUB_OWNER}/{GITHUB_REPO}/{kind}/{GITHUB_BRANCH}/{repo_path.rstrip('/')}"


def get_pipeline_passphrase() -> str:
    try:
        return st.secrets.get("PIPELINE_PASSPHRASE", "")
    except Exception:
        return ""


def get_github_token() -> str:
    try:
        return st.secrets.get("GITHUB_TOKEN", "")
    except Exception:
        return ""

st.set_page_config(
    page_title="QA Test Execution Report",
    page_icon="✅",
    layout="wide",
)


def discover_suites() -> list[Path]:
    """Every *-test-results.json in data/, most recently reported first.

    Sorted by each file's meta.report_generated_at (an exact UTC instant
    stamped deterministically by the pipeline -- see
    .github/scripts/stamp-report-timestamp.js), falling back to the
    day-only meta.report_date for older files that predate that field.
    Not filesystem mtime: a fresh git checkout/clone on redeploy (Streamlit
    Cloud) resets file mtimes together, so mtime order doesn't reflect
    which suite actually ran most recently. report_date alone isn't enough
    either -- two suites run on the same calendar day tie, and the tie
    silently falls back to alphabetical filename order.
    """
    def sort_key(p: Path) -> str:
        try:
            meta = json.loads(p.read_text(encoding="utf-8"))["meta"]
            return meta.get("report_generated_at") or meta.get("report_date", "")
        except Exception:
            return ""

    return sorted(DATA_DIR.glob("*-test-results.json"), key=sort_key, reverse=True)


@st.cache_data
def load_data(path_str: str) -> dict:
    with open(path_str, "r", encoding="utf-8") as f:
        return json.load(f)


@st.cache_data
def find_test_block(suite_dir_str: str, test_id: str) -> tuple[str, str] | tuple[None, None]:
    """Locate the *.spec.ts file containing `test_id` and extract just that test()'s body.

    Reads the real generated spec files checked out alongside the app (this
    deployment is a full clone of the repo, so tests/<slug>/ sits right next
    to streamlit_app/) -- not a copy or a summary, the actual script that ran.
    """
    suite_dir = Path(suite_dir_str)
    if not suite_dir.exists():
        return None, None

    for spec_file in sorted(suite_dir.rglob("*.spec.ts")):
        try:
            text = spec_file.read_text(encoding="utf-8")
        except Exception:
            continue

        for m in re.finditer(r"test\(\s*(['\"])(.*?)\1", text):
            if test_id not in m.group(2):
                continue
            # Body starts after `=>`, not the first `{` after the test title -- the
            # callback's own parameter list (e.g. `async ({ page }) => {`) can contain
            # a destructuring brace that closes before the real body ever begins.
            arrow_idx = text.find("=>", m.end())
            if arrow_idx == -1:
                continue
            brace_start = text.find("{", arrow_idx)
            if brace_start == -1:
                continue
            depth = 0
            i = brace_start
            while i < len(text):
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                    if depth == 0:
                        break
                i += 1
            end = text.find(");", i)
            end = end + 2 if end != -1 else i + 1
            block = text[m.start() : end].strip()
            return str(spec_file.relative_to(REPO_ROOT).as_posix()), block

    return None, None


suite_files = discover_suites()
if not suite_files:
    st.error(f"No test result files found in {DATA_DIR}/ (expected *-test-results.json).")
    st.stop()

suite_options: dict[str, Path] = {}
for f in suite_files:
    try:
        d = json.loads(f.read_text(encoding="utf-8"))
        label = f"{d['meta'].get('story', f.stem)} — {d['meta'].get('app_under_test', '')}"
    except Exception:
        label = f.stem
    # Guard against two suites producing an identical label
    while label in suite_options:
        label += " "
    suite_options[label] = f

selected_label = st.selectbox(
    "Test suite",
    list(suite_options.keys()),
    index=0,
    help="Most recently executed suite is shown first. Includes the original SauceDemo suite plus every suite generated by the full-pipeline.",
)
DATA_PATH = suite_options[selected_label]

data = load_data(str(DATA_PATH))
meta = data["meta"]
summary = data["summary"]
suites = pd.DataFrame(data["suites"])
tests = pd.DataFrame(data["tests"])
defects = pd.DataFrame(data["defects"])
use_cases = data["use_cases"]
business_rules = data["business_rules"]

# --- Header -----------------------------------------------------------------
st.title(f"Test Execution Report — {meta.get('story', DATA_PATH.stem)}: {meta['app_under_test']}")
st.caption(
    f"**Application:** {meta['app_under_test']} ([{meta['app_url']}]({meta['app_url']}))  |  "
    f"**Test account:** `{meta['test_account']}`  |  **Report date:** {meta['report_date']}"
)

# --- KPI row ------------------------------------------------------------------
k1, k2, k3, k4, k5, k6 = st.columns(6)
k1.metric("Success Rate", f"{summary['success_rate']}%")
k2.metric("Test Cases", summary["test_cases"])
k3.metric("Browsers", summary["browsers"])
k4.metric("Executions", summary["executions"])
k5.metric("Passed", summary["passed"])
k6.metric("Failed", summary["failed"], delta=None)

st.divider()

tab_overview, tab_matrix, tab_usecase, tab_rules, tab_details, tab_defects, tab_submit = st.tabs(
    [
        "Overview",
        "Test Execution Matrix",
        "Coverage by Use Case",
        "Coverage by Business Rule",
        "Test Case Detail",
        "Defects Log",
        "Submit New Request",
    ]
)

# --- Overview tab -------------------------------------------------------------
with tab_overview:
    st.subheader("Suite Summary")
    left, right = st.columns([3, 2])

    with left:
        fig = go.Figure()
        for i, row in suites.iterrows():
            fig.add_trace(
                go.Bar(
                    x=[row["tests"]],
                    y=[row["name"]],
                    orientation="h",
                    marker_color=CATEGORICAL[i % len(CATEGORICAL)],
                    text=[f"{row['tests']} tests"],
                    textposition="outside",
                    name=row["name"],
                    showlegend=False,
                )
            )
        fig.update_layout(
            title="Test cases per suite",
            xaxis_title="Test cases",
            yaxis_title="",
            height=340,
            margin=dict(l=10, r=10, t=40, b=10),
            plot_bgcolor="#fcfcfb",
            paper_bgcolor="#fcfcfb",
        )
        st.plotly_chart(fig, use_container_width=True)

    with right:
        st.markdown("**Environment**")
        st.table(
            pd.DataFrame(
                {
                    "Item": ["Browsers", "Duration", "Healing actions", "Overall status"],
                    "Value": [
                        ", ".join(meta["browsers"]),
                        f"{meta['duration_minutes']} minutes",
                        summary["healing_actions"],
                        summary["status"],
                    ],
                }
            ).set_index("Item")
        )
        st.markdown(f"**Test plan:** [{meta['test_plan_path']}]({github_url(meta['test_plan_path'])})")
        st.markdown(f"**Automation suite:** [{meta['suite_path']}]({github_url(meta['suite_path'])})")

    st.subheader("Business Use Cases")
    st.table(pd.DataFrame(use_cases.items(), columns=["Code", "Description"]).set_index("Code"))

    st.subheader("Business Rules")
    st.table(pd.DataFrame(business_rules.items(), columns=["Code", "Description"]).set_index("Code"))

# --- Test Execution Matrix tab -------------------------------------------------
with tab_matrix:
    st.subheader("Full Test Execution Matrix")
    st.caption(f"Run command: `{meta['run_command']}`")

    col_a, col_b, col_c = st.columns([2, 2, 2])
    with col_a:
        uc_filter = st.multiselect("Filter by Use Case", sorted(tests["use_case"].unique()))
    with col_b:
        br_filter = st.multiselect(
            "Filter by Business Rule", sorted([b for b in tests["business_rule"].unique() if b])
        )
    with col_c:
        search = st.text_input("Search Test ID or title")

    filtered = tests.copy()
    if uc_filter:
        filtered = filtered[filtered["use_case"].isin(uc_filter)]
    if br_filter:
        filtered = filtered[filtered["business_rule"].isin(br_filter)]
    if search:
        mask = filtered["id"].str.contains(search, case=False) | filtered["title"].str.contains(
            search, case=False
        )
        filtered = filtered[mask]

    # Only render browser columns this suite's data actually has -- a chromium-only
    # pipeline run won't have firefox/webkit keys at all, unlike the SauceDemo suite.
    browser_cols = [c for c in ("chromium", "firefox", "webkit") if c in filtered.columns]
    rename_map = {
        "id": "Test Case ID",
        "title": "Title",
        "use_case": "Use Case",
        "business_rule": "Business Rule",
        "note": "Note",
        **{c: c.capitalize() if c != "webkit" else "WebKit" for c in browser_cols},
    }
    display = filtered.rename(columns=rename_map).reset_index(drop=True)
    display_browser_cols = [rename_map[c] for c in browser_cols]

    def style_status(val: str) -> str:
        if val == "Pass":
            return f"color: {STATUS_GOOD}; font-weight: 600;"
        return ""

    styled = display.style.map(style_status, subset=display_browser_cols)
    st.dataframe(styled, use_container_width=True, height=560, hide_index=True)
    st.caption(f"Showing {len(filtered)} of {len(tests)} test cases · all shown executions passed.")

# --- Coverage by Use Case tab ---------------------------------------------------
with tab_usecase:
    st.subheader("Coverage by Business Use Case")
    cov_rows = []
    for code, grp in tests.groupby("use_case"):
        desc = use_cases.get(code, "")
        cov_rows.append(
            {
                "Use Case": f"{code} — {desc}" if desc else code,
                "Test Case IDs": ", ".join(grp["id"].tolist()),
                "Test Cases": len(grp),
            }
        )
    cov = pd.DataFrame(cov_rows)
    n_browsers = summary["browsers"]
    exec_col = f"Executions (×{n_browsers} browser{'s' if n_browsers != 1 else ''})"
    cov[exec_col] = cov["Test Cases"] * n_browsers
    cov["Result"] = cov[exec_col].apply(lambda n: f"✅ {n}/{n}")
    st.dataframe(cov, use_container_width=True, hide_index=True)

    fig2 = go.Figure(
        go.Bar(
            x=cov["Use Case"],
            y=cov[exec_col],
            marker_color=[CATEGORICAL[i % len(CATEGORICAL)] for i in range(len(cov))],
            text=cov[exec_col],
            textposition="outside",
        )
    )
    fig2.update_layout(
        title="Executions by business use case",
        xaxis_title="Use Case",
        yaxis_title="Executions",
        height=380,
        margin=dict(l=10, r=10, t=40, b=10),
        plot_bgcolor="#fcfcfb",
        paper_bgcolor="#fcfcfb",
    )
    st.plotly_chart(fig2, use_container_width=True)

# --- Coverage by Business Rule tab ----------------------------------------------
with tab_rules:
    st.subheader("Coverage by Business Rule")
    st.caption(
        "Every row is a passing automation result — assertions match the application's real, "
        "observed behavior. Rows with a Gap reference mean the *application* deviates from the "
        "business rule as stated in the user story, not that the test failed."
    )
    if business_rules and "business_rule" in tests.columns:
        rule_rows = []
        for code, desc in business_rules.items():
            matching = tests[tests["business_rule"] == code]
            gap_notes = sorted({n for n in matching.get("note", []) if n})
            gap = ", ".join(gap_notes) if gap_notes else "—"
            result = "Tests pass; gap logged (see Defects Log)" if gap_notes else "Passes as expected"
            rule_rows.append(
                {
                    "Business Rule": f"{code} — {desc}",
                    "Test Cases": ", ".join(matching["id"].tolist()) if len(matching) else "—",
                    "Result": result,
                    "Gap": gap,
                }
            )
        st.dataframe(pd.DataFrame(rule_rows), use_container_width=True, hide_index=True)
    else:
        st.info("This suite's data doesn't include business rule mappings.")

# --- Test Case Detail tab ---------------------------------------------------------
with tab_details:
    st.subheader("Test Case Detail — Script, Locators & Validation")
    st.caption(
        "The real Playwright script for the selected test case, as generated and executed by "
        "the pipeline -- not a summary. Locators and assertions below are extracted directly "
        "from that script's source."
    )

    if tests.empty:
        st.info("This suite has no test cases recorded.")
    else:
        detail_options = [f"{row['id']} — {row['title']}" for _, row in tests.iterrows()]
        picked = st.selectbox("Test case", detail_options)
        picked_id = picked.split(" — ", 1)[0]
        row = tests[tests["id"] == picked_id].iloc[0]

        result_col, id_col = st.columns([1, 3])
        with id_col:
            st.markdown(f"**{row['id']} — {row['title']}**")
            sub_bits = [f"Use Case: `{row['use_case']}`"]
            if row.get("business_rule"):
                sub_bits.append(f"Business Rule: `{row['business_rule']}`")
            st.caption(" | ".join(sub_bits))
        with result_col:
            outcome = str(row.get("chromium", "")).strip().lower()
            if outcome == "pass":
                st.success("PASS")
            elif outcome == "fail":
                st.error("FAIL")
            else:
                st.info(row.get("chromium", "n/a"))

        suite_dir = REPO_ROOT / meta["suite_path"]
        spec_path, block = find_test_block(str(suite_dir), picked_id)

        if block is None:
            st.warning(
                "Couldn't find this test's spec file in the app's current checkout. "
                "This can happen right after a new pipeline run if the app hasn't "
                "redeployed/rebooted yet -- try rebooting the app."
            )
        else:
            st.caption(f"Source: [{spec_path}]({github_url(spec_path)})")

            locator_lines = [
                line.strip() for line in block.splitlines() if LOCATOR_METHOD_RE.search(line)
            ]
            if locator_lines:
                st.markdown("**Locators used**")
                st.code("\n".join(dict.fromkeys(locator_lines)), language="typescript")

            st.markdown("**Automation script (as executed)**")
            st.code(block, language="typescript")

            assertion_lines = [
                line.strip() for line in block.splitlines() if ASSERTION_LINE_RE.search(line)
            ]
            st.markdown("**Validations performed (assertions)**")
            if assertion_lines:
                st.code("\n".join(assertion_lines), language="typescript")
            else:
                st.caption("No explicit `expect(...)` assertions found in this test block.")

            st.markdown("**Expected vs. Actual**")
            matching_defect = next(
                (d for d in data.get("defects", []) if d.get("test_ref") == picked_id), None
            )
            if matching_defect:
                st.error(
                    f"**Expected:** {matching_defect['expected']}\n\n"
                    f"**Actual:** {matching_defect['actual']}"
                )
            elif outcome == "pass":
                st.success(
                    "Every assertion above passed -- the application's actual behavior matched "
                    "the expected value asserted at each `expect(...)` call in the script."
                )
            else:
                st.caption("No further expected-vs-actual detail recorded for this result.")

# --- Defects Log tab -------------------------------------------------------------
with tab_defects:
    st.subheader("Defects / Behavior Findings Log")
    st.caption(
        "These are application behavior findings, not automation defects — the suite passes "
        "because it asserts the application's actual behavior."
    )

    if defects.empty:
        st.success("No behavior findings logged for this suite.")
    else:
        def severity_style(val: str) -> str:
            if val == "Medium":
                return f"background-color: {STATUS_WARNING}; color: #3a2a00; font-weight:600;"
            if val in ("Low", "Info"):
                return f"background-color: {MUTED_BG}; color: {SECONDARY_INK}; font-weight:600;"
            return ""

        defects_display = defects.rename(
            columns={
                "id": "ID",
                "severity": "Severity",
                "title": "Title",
                "steps": "Steps to Reproduce",
                "expected": "Expected",
                "actual": "Actual",
                "test_ref": "Test Reference",
            }
        )
        styled_defects = defects_display.style.map(severity_style, subset=["Severity"])
        st.dataframe(styled_defects, use_container_width=True, height=280, hide_index=True)

# --- Submit New Request tab ------------------------------------------------------
with tab_submit:
    st.subheader("Submit New Testing Request")
    st.caption(
        "Submit the request for the current automation suite run: "
        f"[{meta['suite_path']}]({github_url(meta['suite_path'])})  —  user story {meta['story']}."
    )
    st.warning(
        "⚠️ This app and its GitHub repo are **public**. Anything submitted here becomes "
        "visible in public commit history. Do not paste real credentials, secrets, or "
        "confidential requirements — use placeholder/demo values only.",
        icon="⚠️",
    )

    token_configured = bool(get_github_token())
    if not token_configured:
        st.info(
            "GitHub token not configured — submissions will show an error until `GITHUB_TOKEN` "
            "is set in this app's Secrets (Streamlit Cloud: Manage app → Settings → Secrets). "
            "The token needs both `Contents: Read and write` and `Actions: Read and write` "
            "permissions. See `streamlit_app/README.md` for setup steps.",
            icon="ℹ️",
        )

    st.text_input(
        "Pipeline passphrase (optional — leave blank unless you know it)",
        type="password",
        key="pipeline_passphrase_input",
        help=(
            "Enter the correct passphrase to trigger full AI-driven plan → generate → "
            "execute automation against this request. Leave blank (or enter it wrong) to "
            "just re-run the existing reviewed suite instead. Unlike the fields below, this "
            "one is NOT cleared after submitting -- you don't need to retype it if you "
            "resubmit after a failure."
        ),
    )

    with st.form("new_request_form", clear_on_submit=True):
        title = st.text_input("Short title", placeholder="e.g. Guest checkout regression for MyStore")
        app_url = st.text_input("Application URL", placeholder="https://example.com")

        col1, col2 = st.columns(2)
        with col1:
            test_username = st.text_input("Test username (optional, demo/placeholder only)")
        with col2:
            test_password = st.text_input("Test password (optional, demo/placeholder only)", type="password")

        req_text = st.text_area(
            "Requirements / Acceptance Criteria (paste text)",
            height=200,
            placeholder="Paste the user story, acceptance criteria, or requirements doc text here...",
        )
        req_file = st.file_uploader("...or upload a requirements file instead", type=["md", "txt"])

        submitted = st.form_submit_button("Submit Request")

    if submitted:
        if not title.strip() or not app_url.strip():
            st.error("Short title and Application URL are both required.")
        elif not req_text.strip() and req_file is None:
            st.error("Provide requirements either as pasted text or an uploaded file.")
        else:
            requirements_content = (
                req_file.read().decode("utf-8") if req_file is not None else req_text
            )
            timestamp = datetime.now(timezone.utc)
            slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:50] or "request"
            filename = f"request-{slug}-{timestamp.strftime('%Y%m%d-%H%M%S')}.md"
            path = f"user-stories/{filename}"

            creds_section = ""
            if test_username or test_password:
                creds_section = (
                    "\n## Test Credentials\n"
                    f"- Username: `{test_username or '(not provided)'}`\n"
                    f"- Password: `{test_password or '(not provided)'}`\n"
                )

            file_content = f"""# Testing Request: {title.strip()}

**Submitted via:** Streamlit dashboard
**Submitted date (UTC):** {timestamp.strftime('%Y-%m-%d %H:%M:%S')}
**Status:** Pending — not yet processed

## Application URL
{app_url.strip()}
{creds_section}
## Requirements / Acceptance Criteria

{requirements_content.strip()}

---
*Next step: run the plan → generate → execute workflow (e.g. via Claude Code /
the qa-endtoend-promptFile pattern) referencing this file to produce a test plan
and automation suite.*
"""

            result = create_file(
                owner=GITHUB_OWNER,
                repo=GITHUB_REPO,
                branch=GITHUB_BRANCH,
                path=path,
                content=file_content,
                commit_message=f"docs(request): new testing request — {title.strip()}",
                token=get_github_token(),
            )

            if result.success:
                st.success(f"Request submitted and committed to `{path}`.")
                if result.html_url:
                    st.markdown(f"[View the committed file on GitHub]({result.html_url})")
                st.session_state["last_request_path"] = path

                pipeline_passphrase = st.session_state.get("pipeline_passphrase_input", "")
                expected_passphrase = get_pipeline_passphrase()
                full_pipeline_requested = bool(
                    pipeline_passphrase and expected_passphrase and pipeline_passphrase == expected_passphrase
                )
                if not pipeline_passphrase:
                    st.info(
                        "No pipeline passphrase entered -- this triggered the default behavior "
                        "(re-running the existing reviewed suite), not the full AI pipeline against "
                        "your new request."
                    )
                elif not full_pipeline_requested:
                    st.warning(
                        "A pipeline passphrase was entered but did not match — falling back to "
                        "the default behavior (rerun existing suite only), NOT the full pipeline."
                    )

                if full_pipeline_requested:
                    # The dispatched workflow reads REQUEST_FILE straight out of the repo,
                    # so make sure `main` actually points at this commit first -- dispatching
                    # immediately after create_file() can otherwise race GitHub's own
                    # replication and check out a state missing the file just committed.
                    if result.commit_sha:
                        wait_for_ref(
                            owner=GITHUB_OWNER,
                            repo=GITHUB_REPO,
                            branch=GITHUB_BRANCH,
                            commit_sha=result.commit_sha,
                            token=get_github_token(),
                        )
                    run_result = trigger_workflow(
                        owner=GITHUB_OWNER,
                        repo=GITHUB_REPO,
                        workflow_file=GITHUB_FULL_PIPELINE_WORKFLOW_FILE,
                        ref=GITHUB_BRANCH,
                        token=get_github_token(),
                        inputs={"request_file": path, "slug": slug},
                    )
                    if run_result.success:
                        st.success(
                            "Full pipeline triggered: plan → generate → execute → commit "
                            f"against your request (slug `{slug}`). Typically takes 10-30 minutes "
                            "for a new suite. Use the status checker below (with the path above) "
                            "to check progress."
                        )
                        st.markdown(
                            f"[View the run on GitHub](https://github.com/{GITHUB_OWNER}/{GITHUB_REPO}/actions/workflows/{GITHUB_FULL_PIPELINE_WORKFLOW_FILE})"
                        )
                    else:
                        st.warning(
                            f"Request was committed, but the full pipeline could not be triggered: {run_result.message}"
                        )
                else:
                    run_result = trigger_workflow(
                        owner=GITHUB_OWNER,
                        repo=GITHUB_REPO,
                        workflow_file=GITHUB_WORKFLOW_FILE,
                        ref=GITHUB_BRANCH,
                        token=get_github_token(),
                    )
                    if run_result.success:
                        st.success(
                            "Test run triggered on GitHub Actions (existing 68-test SauceDemo "
                            "checkout suite, Chromium/Firefox/WebKit)."
                        )
                        st.markdown(
                            f"[View the run on GitHub](https://github.com/{GITHUB_OWNER}/{GITHUB_REPO}/actions/workflows/{GITHUB_WORKFLOW_FILE})"
                        )
                    else:
                        st.warning(
                            f"Request was committed, but the test run could not be triggered: {run_result.message}"
                        )
            else:
                st.error(f"Could not submit request: {result.message}")

    st.divider()
    st.markdown("#### Check request status")
    st.caption(
        "Re-fetches the request file's `Status` line from GitHub — works for any request, "
        "whether it triggered the full pipeline or just the existing suite."
    )
    status_path = st.text_input(
        "Request file path",
        value=st.session_state.get("last_request_path", ""),
        placeholder="user-stories/request-my-title-20260722-060822.md",
    )
    if st.button("Check Status"):
        if not status_path.strip():
            st.error("Enter a request file path first.")
        else:
            file_result = get_file(
                owner=GITHUB_OWNER,
                repo=GITHUB_REPO,
                path=status_path.strip(),
                ref=GITHUB_BRANCH,
                token=get_github_token(),
            )
            if file_result.success:
                status_match = re.search(r"^\*\*Status:\*\*\s*(.*)$", file_result.content, re.MULTILINE)
                status_text = status_match.group(1) if status_match else "(no Status line found)"
                st.info(status_text)
                if file_result.html_url:
                    st.markdown(f"[View the full request file on GitHub]({file_result.html_url})")
            else:
                st.error(file_result.message)
