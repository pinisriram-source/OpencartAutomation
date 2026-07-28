"""
QA Test Execution Report — Streamlit dashboard.

Reads structured test-results data from data/*-test-results.json (one file
per suite: the original SauceDemo suite, plus one per full-pipeline run) and
renders it as an interactive report: KPI summary, full per-test execution
matrix, coverage by business use case, coverage by business rule, and the
defects log. A suite picker lets the viewer switch between suites.
"""

import hashlib
import hmac
import html
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from github_commit import create_file, get_file, trigger_workflow, upsert_file, wait_for_ref
from google_docs import build_oauth_flow, exchange_code_for_credentials, get_authorization_url, upsert_google_doc

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
STEP_MARKER_RE = re.compile(r"^\s*//\s*(\d+)\.\s*(.+)$")
EXPECT_MARKER_RE = re.compile(r"^\s*//\s*(?:expect|verify)\b\s*:?\s*(.+)$", re.IGNORECASE)


def parse_step_markers(block: str) -> list[dict]:
    """Split a generated test's body into numbered steps.

    Relies on the `// N. <step text>` and `// expect: <validation>` /
    `// Verify: <validation>` comment markers the pipeline's automation
    generator emits (the exact keyword has varied across pipeline runs),
    mirroring the test plan's own Steps/expect structure -- this is what lets
    the dashboard show which code+assertions implement each *planned* step,
    rather than just dumping the flat script.
    """
    steps: list[dict] = []
    current: dict | None = None
    for raw_line in block.splitlines():
        step_match = STEP_MARKER_RE.match(raw_line)
        if step_match:
            if current:
                steps.append(current)
            current = {
                "number": int(step_match.group(1)),
                "text": step_match.group(2).strip(),
                "expectations": [],
                "code_lines": [],
            }
            continue
        expect_match = EXPECT_MARKER_RE.match(raw_line)
        if expect_match and current is not None:
            current["expectations"].append(expect_match.group(1).strip())
            continue
        if current is not None and raw_line.strip() and not raw_line.strip().startswith("//"):
            current["code_lines"].append(raw_line.rstrip())
    if current:
        steps.append(current)
    return steps


def annotate_step_results(steps: list[dict], outcome: str, defect: dict | None) -> None:
    """Best-effort attribution of pass/fail to a specific step, in place.

    There's no per-assertion pass/fail signal in the stored test-results JSON
    (Playwright throws and stops at the first failed expect, and we only
    persist the overall test outcome plus a hand-written defect
    expected/actual) -- so a failing test's step is matched by substring
    overlap between the defect's `expected` text and each step's `expect:`
    bullets. Steps before the match are "passed" (their assertions ran and
    didn't throw), the matched step is "failed", steps after are
    "not_reached" (the throw stopped the test before they ran). If no defect
    matches confidently, every step is marked "unknown" rather than guessing.
    """
    if outcome == "pass":
        for step in steps:
            step["result"] = "passed"
        return
    if outcome != "fail":
        status = "skipped" if outcome == "skip" else "unknown"
        for step in steps:
            step["result"] = status
        return
    if not defect:
        for step in steps:
            step["result"] = "unknown"
        return

    expected_lower = (defect.get("expected") or "").lower()
    failing_idx = None
    for i, step in enumerate(steps):
        for expectation in step["expectations"]:
            exp_lower = expectation.lower()
            if exp_lower and (exp_lower in expected_lower or expected_lower in exp_lower):
                failing_idx = i
                break
        if failing_idx is not None:
            break

    for i, step in enumerate(steps):
        if failing_idx is None:
            step["result"] = "unknown"
        elif i < failing_idx:
            step["result"] = "passed"
        elif i == failing_idx:
            step["result"] = "failed"
        else:
            step["result"] = "not_reached"


def step_expected_lines(step: dict) -> list[str]:
    """Falls back to the step's own `expect(...)` code lines when the
    generator didn't emit an explicit `// expect:`/`// Verify:` comment --
    the assertions still ARE the expected validation, so showing "no
    comment captured" alone (with real assertions sitting right below in
    the code block) reads as if nothing was validated at all.
    """
    if step["expectations"]:
        return step["expectations"]
    return [line.strip() for line in step["code_lines"] if ASSERTION_LINE_RE.search(line)]


def step_actual_text(step: dict, defect: dict | None) -> tuple[str, str]:
    """Returns (st-method-name, message) describing what actually happened for this step.

    Only a "failed" step has a genuine recorded actual value (the matched
    defect's `actual` field) -- everything else is inferred from the overall
    test outcome, since there's no per-assertion runtime capture to draw on.
    """
    result = step.get("result")
    if result == "passed":
        return "success", "Matched expected -- the assertion(s) for this step passed as written."
    if result == "failed":
        actual = (defect or {}).get("actual") or "Assertion failed (no further detail recorded)."
        return "error", actual
    if result == "not_reached":
        return "info", "Not executed -- the test stopped at an earlier failed assertion before reaching this step."
    if result == "skipped":
        return "info", "Not executed -- this test case was skipped in the run."
    # "unknown": test failed overall but couldn't be confidently attributed to this step
    note = "Test failed overall, but this step's outcome couldn't be confidently matched to a specific assertion."
    if defect and defect.get("actual"):
        note += f" Recorded overall actual behavior: {defect['actual']}"
    return "warning", note

# --- Target repo for the "Submit New Request" form ---
GITHUB_OWNER = "pinisriram-source"
GITHUB_REPO = "OpencartAutomation"
GITHUB_BRANCH = "main"
GITHUB_WORKFLOW_FILE = "saucedemo-checkout.yml"
GITHUB_PIPELINE_PLAN_WORKFLOW_FILE = "pipeline-plan.yml"
GITHUB_PIPELINE_AUTOMATION_WORKFLOW_FILE = "pipeline-automation.yml"
GITHUB_PIPELINE_EXECUTE_WORKFLOW_FILE = "pipeline-execute.yml"


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


def get_signup_invite_code() -> str:
    try:
        return st.secrets.get("SIGNUP_INVITE_CODE", "")
    except Exception:
        return ""


# --- Self-service account storage (committed to the repo, see require_authentication) ---
USERS_FILE_PATH = "streamlit_app/data/users.json"
PBKDF2_ITERATIONS = 200_000


def hash_password(password: str, salt_hex: str | None = None) -> tuple[str, str]:
    """PBKDF2-HMAC-SHA256, stdlib only (no new dependency for bcrypt/argon2)."""
    salt = bytes.fromhex(salt_hex) if salt_hex else os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return salt.hex(), digest.hex()


def verify_password(password: str, salt_hex: str, expected_hash_hex: str) -> bool:
    _, computed_hash_hex = hash_password(password, salt_hex)
    return hmac.compare_digest(computed_hash_hex, expected_hash_hex)


def load_users() -> dict:
    """Reads the committed account list. Missing/unreadable file just means no accounts yet."""
    result = get_file(
        owner=GITHUB_OWNER, repo=GITHUB_REPO, path=USERS_FILE_PATH, ref=GITHUB_BRANCH, token=get_github_token(),
    )
    if not result.success or not result.content:
        return {}
    try:
        return json.loads(result.content)
    except (json.JSONDecodeError, TypeError):
        return {}


def save_users(users: dict):
    return upsert_file(
        owner=GITHUB_OWNER,
        repo=GITHUB_REPO,
        branch=GITHUB_BRANCH,
        path=USERS_FILE_PATH,
        content=json.dumps(users, indent=2, sort_keys=True) + "\n",
        commit_message="chore(auth): register new dashboard account",
        token=get_github_token(),
    )


def get_google_oauth_config() -> dict | None:
    """Reads the OAuth client used for the Review tab's "Connect Google Drive"
    button. All three must be set, or the feature is treated as disabled."""
    try:
        client_id = st.secrets.get("GOOGLE_OAUTH_CLIENT_ID", "")
        client_secret = st.secrets.get("GOOGLE_OAUTH_CLIENT_SECRET", "")
        redirect_uri = st.secrets.get("GOOGLE_OAUTH_REDIRECT_URI", "")
    except Exception:
        return None
    if not (client_id and client_secret and redirect_uri):
        return None
    return {"client_id": client_id, "client_secret": client_secret, "redirect_uri": redirect_uri}


def analyze_acceptance_criteria(text: str) -> list[str]:
    """Heuristic scan for common gaps in submitted requirements/acceptance criteria.

    Rule-based on purpose (no LLM call from this app) -- catches the gaps that
    actually bit prior pipeline runs: vague criteria the generator had to guess
    at, missing expected outcomes, and no negative/edge cases. Returns clarifying
    questions to surface to the submitter; empty list means nothing obvious was flagged.
    """
    stripped = text.strip()
    if not stripped:
        return []

    lower = stripped.lower()
    word_count = len(stripped.split())
    questions: list[str] = []

    if word_count < 25:
        questions.append(
            f"This looks quite short (~{word_count} words). Is there more detail available -- "
            "specific pages/flows, field names, or expected outcomes?"
        )

    if not re.search(r"(^|\n)\s*(-|\*|\d+[.)])\s+\S", stripped):
        questions.append(
            "No numbered/bulleted list of acceptance criteria detected -- could you break this "
            "into discrete, testable criteria (one behavior per line)?"
        )

    outcome_markers = ["should", "must", "expect", "shall", "verify", "displays", "returns", "will show"]
    if not any(m in lower for m in outcome_markers):
        questions.append(
            "No clear expected-outcome language found (e.g. 'should', 'must', 'displays') -- "
            "what observable result confirms each step passed?"
        )

    negative_markers = [
        "invalid", "error", "fail", "negative", "empty", "missing", "incorrect",
        "reject", "denied", "not allowed", "out of stock", "boundary",
    ]
    if not any(m in lower for m in negative_markers):
        questions.append(
            "No negative/edge cases mentioned -- are there invalid inputs, error states, or "
            "boundary conditions (e.g. empty fields, out-of-stock, expired coupon) that should "
            "also be covered?"
        )

    if not re.search(r"['\"].+?['\"]|`.+?`|@|\b\d+\b", stripped):
        questions.append(
            "No concrete example values (usernames, quantities, sample text, prices, etc.) "
            "detected -- should specific test data be used, or is any placeholder value fine?"
        )

    vague_terms = ["appropriate", "as needed", "etc.", "and so on", "various", "several", "properly", "correctly formatted", "some data"]
    hits = sorted({t for t in vague_terms if t in lower})
    if hits:
        questions.append(
            f"Vague phrasing detected ({', '.join(hits)}) -- can you replace this with a "
            "specific, checkable condition?"
        )

    login_markers = ["login", "log in", "sign in", "authenticate"]
    if any(m in lower for m in login_markers) and not re.search(r"user(name)?[:\s]|password[:\s]|credential|guest", lower):
        questions.append(
            "Login/authentication is mentioned but no account state is described -- registered "
            "user, guest checkout, or a specific test account?"
        )

    return questions


st.set_page_config(
    page_title="QA Test Execution Report",
    page_icon="✅",
    layout="wide",
)


def require_authentication() -> None:
    """Gates the entire app behind sign-in/sign-up forms before anything else renders.

    Fails closed: if GITHUB_TOKEN or SIGNUP_INVITE_CODE aren't configured in
    secrets, the app refuses to render at all rather than silently staying
    open. Accounts are self-service (Sign up tab) but gated behind an invite
    code -- without that gate, anyone visiting the public app could create
    their own account and the login screen would stop being real access
    control. Created accounts (username + salted password hash, never
    plaintext) are committed to USERS_FILE_PATH via the same GitHub token
    already used by the "Submit New Request" tab, so they survive Streamlit
    Community Cloud wiping the local filesystem on redeploy/sleep.

    APP_USERNAME/APP_PASSWORD (this app's original shared-login secrets) are
    still honored if configured, as an admin/recovery credential that keeps
    working even if the self-service path or GitHub commit ever fails --
    but they're optional now, not required.

    Session-only, same as the Google sign-in used elsewhere in this app:
    closing the tab or a hard refresh after the server restarts requires
    signing in again.
    """
    github_token = get_github_token()
    invite_code = get_signup_invite_code()
    try:
        legacy_username = st.secrets.get("APP_USERNAME", "")
        legacy_password = st.secrets.get("APP_PASSWORD", "")
    except Exception:
        legacy_username, legacy_password = "", ""

    if not github_token or not invite_code:
        st.error(
            "This app requires GITHUB_TOKEN and SIGNUP_INVITE_CODE to be configured in "
            "Streamlit secrets before it can be used (Manage app → Settings → Secrets). "
            "See streamlit_app/README.md."
        )
        st.stop()

    if st.session_state.get("authenticated"):
        return

    st.title("QA Test Execution Report")
    tab_signin, tab_signup = st.tabs(["Sign in", "Sign up"])

    with tab_signin:
        with st.form("login_form"):
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            submitted = st.form_submit_button("Sign in")
        if submitted:
            username_clean = username.strip()
            authenticated = False
            if legacy_username and legacy_password:
                if hmac.compare_digest(username_clean, legacy_username) and hmac.compare_digest(
                    password, legacy_password
                ):
                    authenticated = True
            if not authenticated:
                record = load_users().get(username_clean.lower())
                if record and verify_password(password, record["salt"], record["hash"]):
                    authenticated = True
            if authenticated:
                st.session_state["authenticated"] = True
                st.session_state["auth_username"] = username_clean
                st.rerun()
            else:
                st.error("Incorrect username or password.")

    with tab_signup:
        st.caption("Requires an invite code -- ask whoever manages this dashboard for one.")
        with st.form("signup_form"):
            code = st.text_input("Invite code", type="password")
            new_username = st.text_input("Choose a username")
            new_password = st.text_input("Choose a password", type="password")
            confirm_password = st.text_input("Confirm password", type="password")
            signup_submitted = st.form_submit_button("Create account")
        if signup_submitted:
            new_username_clean = new_username.strip()
            key = new_username_clean.lower()
            errors = []
            if not hmac.compare_digest(code, invite_code):
                errors.append("Invalid invite code.")
            if not re.fullmatch(r"[A-Za-z0-9_-]{3,32}", new_username_clean):
                errors.append(
                    "Username must be 3-32 characters: letters, numbers, underscore, or hyphen."
                )
            if len(new_password) < 8:
                errors.append("Password must be at least 8 characters.")
            if new_password != confirm_password:
                errors.append("Passwords do not match.")

            users = {}
            if not errors:
                users = load_users()
                if key in users or (legacy_username and key == legacy_username.lower()):
                    errors.append(f"Username '{new_username_clean}' is already taken.")

            if errors:
                for err in errors:
                    st.error(err)
            else:
                salt_hex, hash_hex = hash_password(new_password)
                users[key] = {
                    "username": new_username_clean,
                    "salt": salt_hex,
                    "hash": hash_hex,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                result = save_users(users)
                if result.success:
                    st.session_state["authenticated"] = True
                    st.session_state["auth_username"] = new_username_clean
                    st.success("Account created — signing you in...")
                    st.rerun()
                else:
                    st.error(f"Could not save the new account: {result.message}")

    st.stop()


require_authentication()

with st.sidebar:
    signed_in_as = st.session_state.get("auth_username")
    if signed_in_as:
        st.caption(f"Signed in as **{signed_in_as}**")
    if st.button("Log out"):
        st.session_state.pop("authenticated", None)
        st.session_state.pop("auth_username", None)
        st.rerun()


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


def load_data(path_str: str) -> dict:
    # Deliberately uncached: these files are rewritten by every pipeline run
    # and the suite picker keys purely on file path, so a cache here would
    # keep serving whatever snapshot this process first read indefinitely,
    # even after the underlying file changes. They're small; re-reading is free.
    with open(path_str, "r", encoding="utf-8") as f:
        return json.load(f)


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


def _results_fingerprint() -> tuple:
    """Cheap content hash of every suite file, to detect a new/updated result.

    Not file size or mtime -- a healed test can change content without
    changing byte count, and mtime is meaningless after a git checkout (see
    discover_suites()). Hashing full content is fine: these files are small.
    """
    return tuple(
        (f.name, hashlib.md5(f.read_bytes()).hexdigest())
        for f in discover_suites()
    )


@st.fragment(run_every=15)
def _watch_for_new_results() -> None:
    fingerprint = _results_fingerprint()
    seen = st.session_state.get("_results_fingerprint")
    if seen is None:
        st.session_state["_results_fingerprint"] = fingerprint
    elif fingerprint != seen:
        st.session_state["_results_fingerprint"] = fingerprint
        st.rerun()


_watch_for_new_results()

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
st.caption("🔄 Watching for new pipeline results every 15s -- new suites appear here automatically.")

# --- KPI row ------------------------------------------------------------------
k1, k2, k3, k4, k5, k6 = st.columns(6)
k1.metric("Success Rate", f"{summary['success_rate']}%")
k2.metric("Test Cases", summary["test_cases"])
k3.metric("Browsers", summary["browsers"])
k4.metric("Executions", summary["executions"])
k5.metric("Passed", summary["passed"])
k6.metric("Failed", summary["failed"], delta=None)

st.divider()

(
    tab_submit,
    tab_review,
    tab_artifacts,
    tab_overview,
    tab_matrix,
    tab_usecase,
    tab_rules,
    tab_details,
    tab_defects,
) = st.tabs(
    [
        "Submit New Request",
        "Review Pipeline Artifacts",
        "Approved Test Artifacts",
        "Overview",
        "Test Execution Matrix",
        "Coverage by Use Case",
        "Coverage by Business Rule",
        "Test Case Detail",
        "Defects Log",
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

    # Only pipeline suites migrated to the Smoke/Sanity/Functional tier
    # convention (CLAUDE.md's "Test tiers" section) have a "tier" column at
    # all -- older suites' data predates it, so every use of it below is
    # conditional on its presence rather than assumed.
    has_tier = "tier" in tests.columns

    if has_tier:
        col_a, col_b, col_c, col_d = st.columns([2, 2, 1.5, 2])
    else:
        col_a, col_b, col_c = st.columns([2, 2, 2])
        col_d = None
    with col_a:
        uc_filter = st.multiselect("Filter by Use Case", sorted(tests["use_case"].unique()))
    with col_b:
        br_filter = st.multiselect(
            "Filter by Business Rule", sorted([b for b in tests["business_rule"].unique() if b])
        )
    tier_filter: list[str] = []
    if has_tier:
        with col_c:
            tier_filter = st.multiselect(
                "Filter by Tier", ["Smoke", "Sanity", "Functional"], key="tier_filter"
            )
        with col_d:
            search = st.text_input("Search Test ID or title")
    else:
        with col_c:
            search = st.text_input("Search Test ID or title")

    filtered = tests.copy()
    if uc_filter:
        filtered = filtered[filtered["use_case"].isin(uc_filter)]
    if br_filter:
        filtered = filtered[filtered["business_rule"].isin(br_filter)]
    if tier_filter:
        filtered = filtered[filtered["tier"].isin(tier_filter)]
    if search:
        mask = filtered["id"].str.contains(search, case=False) | filtered["title"].str.contains(
            search, case=False
        )
        filtered = filtered[mask]

    if has_tier:
        tier_counts = tests["tier"].value_counts()
        st.caption(
            "Tier breakdown: "
            + " · ".join(
                f"{tier} {tier_counts.get(tier, 0)}" for tier in ["Smoke", "Sanity", "Functional"]
            )
        )

    # Only render browser columns this suite's data actually has -- a chromium-only
    # pipeline run won't have firefox/webkit keys at all, unlike the SauceDemo suite.
    browser_cols = [c for c in ("chromium", "firefox", "webkit") if c in filtered.columns]
    rename_map = {
        "id": "Test Case ID",
        "tier": "Tier",
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

    def style_tier(val: str) -> str:
        if val == "Smoke":
            return f"background-color: {STATUS_WARNING}; color: #3a2a00; font-weight:600;"
        if val == "Sanity":
            return f"background-color: {MUTED_BG}; color: {SECONDARY_INK}; font-weight:600;"
        return ""

    styled = display.style.map(style_status, subset=display_browser_cols)
    if has_tier:
        styled = styled.map(style_tier, subset=["Tier"])
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
                "Couldn't find this test's spec file. Either the automation generator didn't "
                "actually produce it (check the note column in the Test Execution Matrix -- "
                "e.g. a 'Skip' result with 'spec file not generated' means the test plan called "
                "for it but the suite doesn't have it), or the app's checkout is behind a very "
                "recent pipeline run and hasn't picked it up yet -- try rebooting the app."
            )
        else:
            st.caption(f"Source: [{spec_path}]({github_url(spec_path)})")

            matching_defect = next(
                (
                    d for d in data.get("defects", [])
                    if picked_id in [r.strip() for r in str(d.get("test_ref", "")).split(",")]
                ),
                None,
            )

            locator_lines = [
                line.strip() for line in block.splitlines() if LOCATOR_METHOD_RE.search(line)
            ]
            if locator_lines:
                st.markdown("**Locators used**")
                st.code("\n".join(dict.fromkeys(locator_lines)), language="typescript")

            st.markdown("**Automation script (as executed)**")
            st.code(block, language="typescript")

            st.markdown("**Test case steps coverage**")
            step_records = parse_step_markers(block)
            if not step_records:
                st.caption(
                    "No numbered step markers (`// N. ...`) found in this script -- coverage "
                    "view unavailable for this test, see the full script above instead."
                )
            else:
                annotate_step_results(step_records, outcome, matching_defect)
                for step in step_records:
                    with st.container(border=True):
                        st.markdown(f"**Step {step['number']}. {step['text']}**")

                        st.markdown("**Expected:**")
                        if step["expectations"]:
                            st.markdown("\n".join(f"- {e}" for e in step["expectations"]))
                        else:
                            inferred = step_expected_lines(step)
                            if inferred:
                                st.caption(
                                    "No explicit validation comment captured -- inferred from "
                                    "this step's assertion code:"
                                )
                                st.code("\n".join(inferred), language="typescript")
                            else:
                                st.caption("No explicit validation comment captured for this step.")

                        st.markdown("**Actual:**")
                        actual_kind, actual_text = step_actual_text(step, matching_defect)
                        getattr(st, actual_kind)(actual_text)

                        if step["code_lines"]:
                            st.markdown("Automation code for this step:")
                            st.code("\n".join(step["code_lines"]), language="typescript")
                if outcome == "fail" and not matching_defect:
                    st.caption(
                        "Test failed but no matching Defects Log entry was found to attribute "
                        "the failure to a specific step -- see the raw script above."
                    )
                elif outcome == "fail" and all(s["result"] == "unknown" for s in step_records):
                    st.caption(
                        "Couldn't confidently match the recorded defect to a specific step -- "
                        "see Expected vs. Actual below for the overall failure."
                    )

            assertion_lines = [
                line.strip() for line in block.splitlines() if ASSERTION_LINE_RE.search(line)
            ]
            st.markdown("**Validations performed (assertions)**")
            if assertion_lines:
                st.code("\n".join(assertion_lines), language="typescript")
            else:
                st.caption("No explicit `expect(...)` assertions found in this test block.")

            st.markdown("**Expected vs. Actual**")
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

            if outcome == "fail":
                run_url = meta.get("workflow_run_url")
                if run_url:
                    st.markdown(
                        f"[View failure screenshot, trace & video for this run]({run_url}) "
                        "-- in the `playwright-report` artifact at the bottom of the run page "
                        "(Playwright captures a screenshot automatically for every failed test)."
                    )
                else:
                    st.caption(
                        "No linked Actions run recorded for this suite (generated before this "
                        "feature was added) -- screenshot unavailable."
                    )

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

        # st.dataframe renders every cell on a single line (no wrapping), which
        # collapsed multi-step repro instructions into one run-on sentence.
        # Steps need one line per action, so this table is hand-built as HTML
        # with an <ol> per row instead of going through st.dataframe.
        def esc(val) -> str:
            return html.escape(str(val))

        rows_html = []
        for defect in data["defects"]:
            steps = defect["steps"]
            if isinstance(steps, str):
                steps = [steps]
            steps_html = "<ol style='margin:0; padding-left:1.1em;'>" + "".join(
                f"<li>{esc(step)}</li>" for step in steps
            ) + "</ol>"
            cell = "padding:6px 8px; border-bottom:1px solid #ddd; vertical-align:top;"
            rows_html.append(
                "<tr>"
                f"<td style='{cell}'>{esc(defect['id'])}</td>"
                f"<td style='{cell}'><span style='{severity_style(defect['severity'])} padding:2px 8px; border-radius:4px;'>{esc(defect['severity'])}</span></td>"
                f"<td style='{cell}'>{esc(defect['title'])}</td>"
                f"<td style='{cell}'>{steps_html}</td>"
                f"<td style='{cell}'>{esc(defect['expected'])}</td>"
                f"<td style='{cell}'>{esc(defect['actual'])}</td>"
                f"<td style='{cell}'>{esc(defect['test_ref'])}</td>"
                "</tr>"
            )

        header_cell = f"text-align:left; padding:6px 8px; border-bottom:2px solid {SECONDARY_INK};"
        st.markdown(
            "<div style='overflow-x:auto;'>"
            "<table style='width:100%; border-collapse:collapse;'>"
            "<tr>"
            + "".join(
                f"<th style='{header_cell}'>{h}</th>"
                for h in ["ID", "Severity", "Title", "Steps to Reproduce", "Expected", "Actual", "Test Reference"]
            )
            + "</tr>"
            + "".join(rows_html)
            + "</table></div>",
            unsafe_allow_html=True,
        )

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

    st.markdown("##### Requirements / Acceptance Criteria")
    req_text = st.text_area(
        "Paste text",
        height=200,
        key="req_text_input",
        placeholder="Paste the user story, acceptance criteria, or requirements doc text here...",
        label_visibility="collapsed",
    )
    req_file = st.file_uploader(
        "...or upload a requirements file instead", type=["md", "txt"], key="req_file_input"
    )
    requirements_content = (
        req_file.getvalue().decode("utf-8") if req_file is not None else req_text
    )

    if requirements_content.strip():
        clarifications = analyze_acceptance_criteria(requirements_content)
        if clarifications:
            with st.container(border=True):
                st.warning(
                    f"⚠️ {len(clarifications)} potential gap(s) in these acceptance criteria -- "
                    "these are suggestions, not blockers, you can still submit as-is:"
                )
                for question in clarifications:
                    st.markdown(f"- {question}")
        else:
            st.success("✅ No obvious gaps detected in the acceptance criteria.")

    with st.form("new_request_form", clear_on_submit=True):
        title = st.text_input("Short title", placeholder="e.g. Guest checkout regression for MyStore")
        app_url = st.text_input("Application URL", placeholder="https://example.com")

        col1, col2 = st.columns(2)
        with col1:
            test_username = st.text_input("Test username (optional, demo/placeholder only)")
        with col2:
            test_password = st.text_input("Test password (optional, demo/placeholder only)", type="password")

        st.caption(
            f"Requirements captured above ({len(requirements_content.split())} word(s)) will be "
            "included with this submission."
        )

        submitted = st.form_submit_button("Submit Request")

    if submitted:
        if not title.strip() or not app_url.strip():
            st.error("Short title and Application URL are both required.")
        elif not requirements_content.strip():
            st.error("Provide requirements either as pasted text or an uploaded file.")
        else:
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
                st.session_state["last_slug"] = slug

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
                        workflow_file=GITHUB_PIPELINE_PLAN_WORKFLOW_FILE,
                        ref=GITHUB_BRANCH,
                        token=get_github_token(),
                        inputs={"request_file": path, "slug": slug},
                    )
                    if run_result.success:
                        st.success(
                            "Pipeline stage 1 triggered: generating the test plan (slug "
                            f"`{slug}`). This is a human-reviewed pipeline now -- once the plan "
                            "is ready it stops and waits for you in the **Review Pipeline "
                            "Artifacts** tab, where you approve it (or request changes) before "
                            "automation generation and execution proceed. Typically takes a few "
                            "minutes for this first stage."
                        )
                        st.markdown(
                            f"[View the run on GitHub](https://github.com/{GITHUB_OWNER}/{GITHUB_REPO}/actions/workflows/{GITHUB_PIPELINE_PLAN_WORKFLOW_FILE})"
                        )
                    else:
                        st.warning(
                            f"Request was committed, but the test plan stage could not be triggered: {run_result.message}"
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
        placeholder="e.g. user-stories/request-my-title-20260722-060822.md",
        help="Shown here automatically right after you submit a request above "
        "(in this same browser session), or copy it from the Review Pipeline "
        "Artifacts tab / GitHub. This field is empty until you paste or type "
        "a path into it -- the greyed-out text is only a format example.",
    )
    auto_refresh_status = st.checkbox(
        "Auto-refresh every 10s",
        value=False,
        help="Keeps re-checking this path on its own -- handy while a full-pipeline run is in progress, instead of repeatedly clicking Check Status.",
    )
    manual_check = st.button("Check Status")

    @st.fragment(run_every=10 if auto_refresh_status else None)
    def render_status_fragment() -> None:
        if not (auto_refresh_status or manual_check):
            return
        if not status_path.strip():
            st.error("Enter a request file path first.")
            return
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
            if auto_refresh_status:
                st.caption(
                    f"Last checked {datetime.now(timezone.utc).strftime('%H:%M:%S')} UTC -- "
                    "auto-refreshing every 10s."
                )
            if file_result.html_url:
                st.markdown(f"[View the full request file on GitHub]({file_result.html_url})")
        else:
            st.error(file_result.message)

    render_status_fragment()

# --- Review Pipeline Artifacts tab ---------------------------------------------
REVIEW_STATUS_LABELS = {
    "not_started": "⚪ Not started",
    "in_progress": "🔄 In progress -- check back shortly",
    "pending_review": "🟡 Pending your review",
    "approved": "✅ Approved",
    "changes_requested": "🔁 Changes requested -- regenerating",
    "failed": "❌ Failed -- see the Actions run log",
    "completed": "✅ Completed",
}


def _sync_stage_google_doc(
    review_data: dict,
    review_path: str,
    review_slug: str,
    stage_key: str,
    stage_name: str,
    stage_data: dict,
    artifact_path: str,
) -> tuple[dict, dict]:
    """Ensure this stage's Google Doc reflects the current artifact revision.

    Cheap no-op on every render once caught up: the doc is only (re)created
    when doc_revision doesn't match the artifact's current revision, so the
    15s auto-refresh tick doesn't hammer the Drive API or spam commits.
    Falls back silently (caller shows the plain GitHub link) if the reviewer
    hasn't connected Google Drive this session, or if the sync itself fails.
    """
    google_credentials = st.session_state.get("google_credentials")
    if not google_credentials:
        return stage_data, review_data

    current_revision = stage_data.get("revision", 0)
    if stage_data.get("doc_url") and stage_data.get("doc_revision") == current_revision:
        return stage_data, review_data

    content_result = get_file(
        owner=GITHUB_OWNER, repo=GITHUB_REPO, path=artifact_path, ref=GITHUB_BRANCH, token=get_github_token(),
    )
    if not content_result.success:
        return stage_data, review_data

    doc_result = upsert_google_doc(
        credentials=google_credentials,
        title=f"{review_slug} -- {stage_name}",
        markdown_content=content_result.content,
        existing_doc_id=stage_data.get("doc_id") or None,
    )
    if not doc_result.success:
        st.warning(f"Couldn't sync Google Doc for {stage_name}: {doc_result.message}")
        return stage_data, review_data

    updated_stage = {
        **stage_data,
        "doc_id": doc_result.doc_id,
        "doc_url": doc_result.doc_url,
        "doc_revision": current_revision,
    }
    updated_review = {**review_data, stage_key: updated_stage}
    upsert_file(
        owner=GITHUB_OWNER,
        repo=GITHUB_REPO,
        branch=GITHUB_BRANCH,
        path=review_path,
        content=json.dumps(updated_review, indent=2) + "\n",
        commit_message=f"chore(review): sync {stage_key} google doc for {review_slug}",
        token=get_github_token(),
    )
    return updated_stage, updated_review


def render_review_stage(
    review_data: dict,
    review_path: str,
    review_slug: str,
    stage_name: str,
    stage_key: str,
    artifact_label: str,
    approve_workflow: str,
    revise_workflow: str,
) -> None:
    """Render one stage's status plus Approve / Request Changes controls.

    Writes decisions straight to the review-status JSON via upsert_file
    (this app owns that file end-to-end, unlike the request markdown which
    only the pipeline itself updates) and dispatches the workflow for
    whichever stage should run next.
    """
    stage_data = review_data.get(stage_key, {})
    status = stage_data.get("status", "not_started")
    st.markdown(f"##### {stage_name}")
    st.markdown(REVIEW_STATUS_LABELS.get(status, status))
    if stage_data.get("revision"):
        st.caption(f"Revision {stage_data['revision']}")
    artifact_path = stage_data.get("path", "")
    if artifact_path:
        stage_data, review_data = _sync_stage_google_doc(
            review_data, review_path, review_slug, stage_key, stage_name, stage_data, artifact_path,
        )
        doc_url = stage_data.get("doc_url", "")
        if doc_url:
            st.markdown(f"[{artifact_label} (Google Doc)]({doc_url})")
        else:
            st.markdown(f"[{artifact_label} on GitHub]({github_url(artifact_path)})")

    if status != "pending_review":
        if status == "changes_requested" and stage_data.get("feedback"):
            st.caption(f"Feedback sent, awaiting regeneration: {stage_data['feedback']}")
        return

    approve_col, changes_col = st.columns([1, 1])
    with approve_col:
        if st.button(f"✅ Approve", key=f"approve_{stage_key}"):
            updated = dict(review_data)
            updated[stage_key] = {**stage_data, "status": "approved"}
            upsert_result = upsert_file(
                owner=GITHUB_OWNER,
                repo=GITHUB_REPO,
                branch=GITHUB_BRANCH,
                path=review_path,
                content=json.dumps(updated, indent=2) + "\n",
                commit_message=f"chore(review): approve {stage_key} for {review_slug}",
                token=get_github_token(),
            )
            if upsert_result.success:
                run_result = trigger_workflow(
                    owner=GITHUB_OWNER,
                    repo=GITHUB_REPO,
                    workflow_file=approve_workflow,
                    ref=GITHUB_BRANCH,
                    token=get_github_token(),
                    inputs={"request_file": review_data.get("request_file", ""), "slug": review_slug},
                )
                if run_result.success:
                    st.success("Approved -- next stage triggered.")
                else:
                    st.warning(f"Approved, but couldn't trigger the next stage: {run_result.message}")
            else:
                st.error(f"Couldn't record approval: {upsert_result.message}")
            st.rerun()

    with changes_col:
        with st.expander("🔁 Request changes"):
            feedback_text = st.text_area(
                "What's missing or needs fixing?",
                key=f"feedback_{stage_key}_{review_slug}",
                height=100,
            )
            if st.button("Submit feedback & regenerate", key=f"submit_feedback_{stage_key}"):
                if not feedback_text.strip():
                    st.error("Enter feedback describing the gap first.")
                else:
                    updated = dict(review_data)
                    updated[stage_key] = {
                        **stage_data,
                        "status": "changes_requested",
                        "feedback": feedback_text.strip(),
                    }
                    upsert_result = upsert_file(
                        owner=GITHUB_OWNER,
                        repo=GITHUB_REPO,
                        branch=GITHUB_BRANCH,
                        path=review_path,
                        content=json.dumps(updated, indent=2) + "\n",
                        commit_message=f"chore(review): request changes on {stage_key} for {review_slug}",
                        token=get_github_token(),
                    )
                    if upsert_result.success:
                        run_result = trigger_workflow(
                            owner=GITHUB_OWNER,
                            repo=GITHUB_REPO,
                            workflow_file=revise_workflow,
                            ref=GITHUB_BRANCH,
                            token=get_github_token(),
                            inputs={"request_file": review_data.get("request_file", ""), "slug": review_slug},
                        )
                        if run_result.success:
                            st.success("Feedback recorded -- regeneration triggered.")
                        else:
                            st.warning(f"Feedback recorded, but couldn't trigger regeneration: {run_result.message}")
                    else:
                        st.error(f"Couldn't record feedback: {upsert_result.message}")
                    st.rerun()


with tab_review:
    st.subheader("Review Pipeline Artifacts")
    st.caption(
        "Each stage of the AI pipeline (test plan, then automation suite) stops and waits "
        "here for a stakeholder to approve it or request changes before the next stage "
        "runs -- nothing executes against an unreviewed artifact. Enter the slug from your "
        "submission below (carried over automatically right after you submit)."
    )

    review_slug_input = st.text_input(
        "Slug to review",
        value=st.session_state.get("last_slug", ""),
        placeholder="e.g. guest-checkout-regression",
    )
    review_auto_refresh = st.checkbox(
        "Auto-refresh every 15s",
        value=False,
        key="review_auto_refresh",
        help="Keeps re-checking this slug's review status on its own -- handy while a stage is generating.",
    )
    review_slug = review_slug_input.strip()

    oauth_config = get_google_oauth_config()
    if oauth_config:
        if not st.session_state.get("google_credentials") and "code" in st.query_params:
            returned_state = st.query_params.get("state")
            expected_state = st.session_state.get("google_oauth_state")
            code = st.query_params.get("code")
            st.query_params.clear()
            if expected_state and returned_state == expected_state:
                flow = build_oauth_flow(**oauth_config)
                try:
                    st.session_state["google_credentials"] = exchange_code_for_credentials(flow, code)
                    st.session_state.pop("google_oauth_state", None)
                except Exception as exc:
                    st.error(f"Google sign-in failed: {exc}")
            else:
                st.error("Google sign-in state mismatch -- please try connecting again.")
            st.rerun()

        if st.session_state.get("google_credentials"):
            connect_col, disconnect_col = st.columns([4, 1])
            with connect_col:
                st.caption("✅ Connected to Google Drive for this session -- artifacts below sync as Google Docs.")
            with disconnect_col:
                if st.button("Disconnect", key="google_disconnect"):
                    st.session_state.pop("google_credentials", None)
                    st.rerun()
        else:
            flow = build_oauth_flow(**oauth_config)
            auth_url, state = get_authorization_url(flow)
            st.session_state["google_oauth_state"] = state
            st.link_button("🔗 Connect Google Drive", auth_url)
            st.caption("Sign in once per browser session to publish artifacts below as Google Docs you own.")

    @st.fragment(run_every=15 if review_auto_refresh else None)
    def render_review_tab() -> None:
        if not review_slug:
            st.info("Enter a slug above to load its review status.")
            return

        review_path = f"user-stories/{review_slug}-review.json"
        review_result = get_file(
            owner=GITHUB_OWNER, repo=GITHUB_REPO, path=review_path, ref=GITHUB_BRANCH, token=get_github_token(),
        )
        if not review_result.success:
            st.info(
                f"No review status found yet for slug `{review_slug}` -- {review_result.message} "
                "This appears once the test-plan stage has started for this slug (Submit New "
                "Request tab, with the pipeline passphrase)."
            )
            return

        try:
            review_data = json.loads(review_result.content)
        except (json.JSONDecodeError, TypeError):
            st.error("Review status file exists but isn't valid JSON yet -- try again shortly.")
            return

        render_review_stage(
            review_data, review_path, review_slug,
            stage_name="1. Test Plan", stage_key="plan",
            artifact_label="View test plan on GitHub",
            approve_workflow=GITHUB_PIPELINE_AUTOMATION_WORKFLOW_FILE,
            revise_workflow=GITHUB_PIPELINE_PLAN_WORKFLOW_FILE,
        )
        st.divider()

        if review_data.get("plan", {}).get("status") == "approved":
            render_review_stage(
                review_data, review_path, review_slug,
                stage_name="2. Automation Suite", stage_key="automation",
                artifact_label="View automation suite on GitHub",
                approve_workflow=GITHUB_PIPELINE_EXECUTE_WORKFLOW_FILE,
                revise_workflow=GITHUB_PIPELINE_AUTOMATION_WORKFLOW_FILE,
            )
        else:
            st.markdown("##### 2. Automation Suite")
            st.caption("Waiting on test plan approval.")
        st.divider()

        st.markdown("##### 3. Execution")
        execute_data = review_data.get("execute", {})
        execute_status = execute_data.get("status", "not_started")
        st.markdown(REVIEW_STATUS_LABELS.get(execute_status, execute_status))
        if execute_data.get("workflow_run_url"):
            st.markdown(f"[View the run on GitHub]({execute_data['workflow_run_url']})")
        if execute_status == "completed":
            st.caption("See the Overview tab for the full report.")
        if review_auto_refresh:
            st.caption(
                f"Last checked {datetime.now(timezone.utc).strftime('%H:%M:%S')} UTC -- "
                "auto-refreshing every 15s."
            )

    render_review_tab()

# --- Approved Test Artifacts tab -----------------------------------------------
with tab_artifacts:
    st.subheader("Approved Test Artifacts")
    st.caption(
        "Test plans (with their test cases) and automation suites (test scripts) "
        "that have cleared review, across every 'Submit New Request' slug -- browse "
        "here without needing to know a specific slug up front first, unlike the "
        "Review Pipeline Artifacts tab. Only covers slugs run through that pipeline "
        "(a user-stories/<slug>-review.json exists); older suites predating it "
        "aren't tracked this way."
    )

    review_files = sorted((REPO_ROOT / "user-stories").glob("*-review.json"))
    shown_any = False
    for review_file in review_files:
        slug = review_file.name.removesuffix("-review.json")
        try:
            review_data = json.loads(review_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue

        plan_stage = review_data.get("plan", {})
        automation_stage = review_data.get("automation", {})
        plan_approved = plan_stage.get("status") == "approved"
        automation_approved = automation_stage.get("status") == "approved"
        if not (plan_approved or automation_approved):
            continue
        shown_any = True

        with st.expander(slug):
            if plan_approved:
                plan_path = plan_stage.get("path", f"specs/{slug}-test-plan.md")
                st.markdown(f"**Test Plan & Test Cases:** [{plan_path} on GitHub]({github_url(plan_path)})")
                local_plan = REPO_ROOT / plan_path
                if local_plan.exists() and st.checkbox(
                    "Show test plan content inline", key=f"show_plan_{slug}"
                ):
                    st.markdown(local_plan.read_text(encoding="utf-8"))
            else:
                st.caption(f"Test plan: {REVIEW_STATUS_LABELS.get(plan_stage.get('status', 'not_started'), 'not started')}")

            if automation_approved:
                suite_path = automation_stage.get("path", f"tests/{slug}/")
                suite_dir = REPO_ROOT / suite_path
                spec_files = sorted(suite_dir.rglob("*.spec.ts")) if suite_dir.exists() else []
                st.markdown(f"**Test Scripts:** [{suite_path} on GitHub]({github_url(suite_path)})")
                if spec_files:
                    for spec_file in spec_files:
                        rel_path = spec_file.relative_to(REPO_ROOT).as_posix()
                        st.markdown(f"- [{rel_path}]({github_url(rel_path)})")
                else:
                    st.caption("No spec files found in this checkout yet -- see the GitHub link above.")
            else:
                st.caption(
                    f"Automation suite: {REVIEW_STATUS_LABELS.get(automation_stage.get('status', 'not_started'), 'not started')}"
                )

    if not shown_any:
        st.info(
            "No approved test plans or automation suites yet -- approve a stage in "
            "the Review Pipeline Artifacts tab first."
        )
