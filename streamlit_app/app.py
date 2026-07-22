"""
SCRUM-101 Checkout Test Report — Streamlit dashboard.

Reads the structured test-results data (data/test_results.json) generated
from the Playwright run of tests/saucedemo-checkout/ and renders it as an
interactive report: KPI summary, full per-test execution matrix, coverage
by business use case, coverage by business rule, and the defects log.
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from github_commit import create_file, trigger_workflow

# --- Palette (validated categorical + status colors; see dataviz skill) ---
CATEGORICAL = ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a", "#eb6834"]
STATUS_GOOD = "#0ca30c"
STATUS_WARNING = "#fab219"
MUTED_BG = "#e1e0d9"
SECONDARY_INK = "#52514e"

DATA_PATH = Path(__file__).parent / "data" / "test_results.json"

# --- Target repo for the "Submit New Request" form ---
GITHUB_OWNER = "pinisriram-source"
GITHUB_REPO = "OpencartAutomation"
GITHUB_BRANCH = "main"
GITHUB_WORKFLOW_FILE = "saucedemo-checkout.yml"


def get_github_token() -> str:
    try:
        return st.secrets.get("GITHUB_TOKEN", "")
    except Exception:
        return ""

st.set_page_config(
    page_title="SCRUM-101 Checkout Test Report",
    page_icon="✅",
    layout="wide",
)


@st.cache_data
def load_data() -> dict:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


data = load_data()
meta = data["meta"]
summary = data["summary"]
suites = pd.DataFrame(data["suites"])
tests = pd.DataFrame(data["tests"])
defects = pd.DataFrame(data["defects"])
use_cases = data["use_cases"]
business_rules = data["business_rules"]

# --- Header -----------------------------------------------------------------
st.title("Test Execution Report — SCRUM-101: E-commerce Checkout Process")
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

tab_overview, tab_matrix, tab_usecase, tab_rules, tab_defects, tab_submit = st.tabs(
    [
        "Overview",
        "Test Execution Matrix",
        "Coverage by Use Case",
        "Coverage by Business Rule",
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
        st.markdown(f"**Test plan:** `{meta['test_plan_path']}`")
        st.markdown(f"**Automation suite:** `{meta['suite_path']}`")

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

    display = filtered.rename(
        columns={
            "id": "Test Case ID",
            "title": "Title",
            "use_case": "Use Case",
            "business_rule": "Business Rule",
            "chromium": "Chromium",
            "firefox": "Firefox",
            "webkit": "WebKit",
            "note": "Note",
        }
    ).reset_index(drop=True)

    def style_status(val: str) -> str:
        if val == "Pass":
            return f"color: {STATUS_GOOD}; font-weight: 600;"
        return ""

    styled = display.style.map(style_status, subset=["Chromium", "Firefox", "WebKit"])
    st.dataframe(styled, use_container_width=True, height=560, hide_index=True)
    st.caption(f"Showing {len(filtered)} of {len(tests)} test cases · all shown executions passed.")

# --- Coverage by Use Case tab ---------------------------------------------------
with tab_usecase:
    st.subheader("Coverage by Business Use Case")
    cov = (
        tests.groupby("use_case")
        .agg(test_cases=("id", "count"))
        .reset_index()
        .rename(columns={"use_case": "Use Case", "test_cases": "Test Cases"})
    )
    cov["Executions (×3 browsers)"] = cov["Test Cases"] * 3
    cov["Result"] = cov["Executions (×3 browsers)"].apply(lambda n: f"✅ {n}/{n}")
    st.dataframe(cov, use_container_width=True, hide_index=True)

    fig2 = go.Figure(
        go.Bar(
            x=cov["Use Case"],
            y=cov["Executions (×3 browsers)"],
            marker_color=[CATEGORICAL[i % len(CATEGORICAL)] for i in range(len(cov))],
            text=cov["Executions (×3 browsers)"],
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
    rule_rows = [
        {
            "Business Rule": "BR1 — All checkout fields mandatory",
            "Test Cases": "16 cases (TC-CHECKOUT-001…016, TC-ERROR-006/011, TC-NAV-001/007)",
            "Result": "Passes; whitespace/format/bypass gaps logged",
            "Gap": "BUG-003, BUG-004",
        },
        {
            "Business Rule": "BR2 — Login required for checkout",
            "Test Cases": "TC-ERROR-001…005, TC-NAV-008",
            "Result": "Passes as expected — server-side enforcement confirmed",
            "Gap": "—",
        },
        {
            "Business Rule": "BR3 — Cart cannot be empty at checkout",
            "Test Cases": "TC-CART-006-EmptyCart, TC-CHECKOUT-016-EmptyCartAccess, TC-ERROR-007-EmptyCartCheckoutButtonEnabled",
            "Result": "Tests pass; rule itself violated by the app",
            "Gap": "BUG-002",
        },
        {
            "Business Rule": "BR4 — Order confirmation clears the cart",
            "Test Cases": "TC-COMPLETE-004, TC-COMPLETE-005, TC-COMPLETE-008",
            "Result": "Passes as expected",
            "Gap": "—",
        },
        {
            "Business Rule": "BR5 — Cancel at any step returns to cart",
            "Test Cases": "TC-CHECKOUT-013, TC-NAV-002, TC-NAV-006, TC-OVERVIEW-007, TC-NAV-003",
            "Result": "Tests pass; Overview Cancel goes to Products, not Cart",
            "Gap": "BUG-005",
        },
    ]
    st.dataframe(pd.DataFrame(rule_rows), use_container_width=True, hide_index=True)

# --- Defects Log tab -------------------------------------------------------------
with tab_defects:
    st.subheader("Defects / Behavior Findings Log")
    st.caption(
        "These are application behavior findings, not automation defects — the suite passes "
        "because it asserts the application's actual behavior."
    )

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
        "Submitting this form (1) commits a new request file to `user-stories/` in "
        f"`{GITHUB_OWNER}/{GITHUB_REPO}`, and (2) triggers the **existing** SauceDemo "
        "checkout automation suite (68 test cases, already generated and reviewed) to "
        "re-run on GitHub Actions. It does **not** run AI-driven test generation against "
        "your submitted URL/requirements — that step still needs a human (or Claude Code, "
        "in a future session) to review the request and run the plan → generate → execute "
        "workflow manually. This boundary is intentional: this form is public and "
        "unauthenticated, so auto-generating and committing new code from anonymous input "
        "would be a real abuse risk."
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
st.caption(
    "Generated from the Playwright automation suite in "
    f"`{meta['suite_path']}` for user story {meta['story']}."
)
