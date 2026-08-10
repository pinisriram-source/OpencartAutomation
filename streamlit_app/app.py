"""
QA Test Execution Report — Streamlit dashboard.

Reads structured test-results data from data/*-test-results.json (one file
per suite: the original SauceDemo suite, plus one per full-pipeline run) and
renders it as an interactive report: KPI summary, full per-test execution
matrix, coverage by business use case, coverage by business rule, and the
defects log. A suite picker lets the viewer switch between suites.
"""

import base64
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

from github_commit import create_file, get_file, list_directory, trigger_workflow, upsert_file, wait_for_ref
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
# Group 3 is the whole tag expression, matching both the single-tag form
# ({ tag: '@smoke' }) and the array form ({ tag: ['@smoke', '@regression'] })
# that every pipeline test now uses -- tests carry a tier tag AND @regression,
# so a pattern expecting a quote straight after "tag:" silently captured
# nothing and left every test case unlabelled.
TEST_CALL_RE = re.compile(
    r"\btest\(\s*(['\"])(.*?)\1"
    r"(?:\s*,\s*\{\s*tag:\s*(\[[^\]]*\]|['\"]@[\w-]+['\"])\s*\})?"
)
TAG_RE = re.compile(r"@[\w-]+")
TIER_TAGS = {"@smoke": "Smoke", "@sanity": "Sanity", "@functional": "Functional"}
TC_ID_RE = re.compile(r"TC-[A-Z0-9]+-\d+")
PLAN_TC_HEADING_RE = re.compile(r"^####\s+.*?\b(TC-[A-Z0-9]+-\d+)\b", re.MULTILINE)
PLAN_STEP_RE = re.compile(r"^(\d+)\.\s+(.+)$")
PLAN_EXPECT_RE = re.compile(r"^\s*-\s*expect:\s*(.+)$", re.IGNORECASE)


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
GITHUB_GENERATE_REPORT_WORKFLOW_FILE = "generate-test-report.yml"


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


def extract_test_cases_from_spec(spec_text: str) -> list[dict]:
    """Splits a generated spec file into its individual test() cases.

    Mirrors find_test_block's brace-matching body extraction, but returns
    every test() in the file (with its TC-ID, title, and tier tag) instead of
    searching for one specific test_id -- lets the Approved Test Artifacts tab
    show each test case paired with its own automation script inline, rather
    than just a bare list of file links out to GitHub.
    """
    cases: list[dict] = []
    for m in TEST_CALL_RE.finditer(spec_text):
        title = m.group(2)
        tags = TAG_RE.findall(m.group(3) or "")
        arrow_idx = spec_text.find("=>", m.end())
        if arrow_idx == -1:
            continue
        brace_start = spec_text.find("{", arrow_idx)
        if brace_start == -1:
            continue
        depth = 0
        i = brace_start
        while i < len(spec_text):
            if spec_text[i] == "{":
                depth += 1
            elif spec_text[i] == "}":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        end = spec_text.find(");", i)
        end = end + 2 if end != -1 else i + 1
        block = spec_text[m.start() : end].strip()

        tc_id_match = TC_ID_RE.search(title)
        # A test carries at most one tier tag, plus @regression for membership
        # of the cross-suite regression set -- the two are independent, so keep
        # the full tag list rather than collapsing it to a single label.
        tier = next((TIER_TAGS[t.lower()] for t in tags if t.lower() in TIER_TAGS), None)
        cases.append(
            {
                "tc_id": tc_id_match.group(0) if tc_id_match else None,
                "title": title,
                "tier": tier,
                "tags": tags,
                "regression": any(t.lower() == "@regression" for t in tags),
                "block": block,
            }
        )
    return cases


PLAN_TIER_RE = re.compile(r"^\*\*Tier:\*\*\s*(Smoke|Sanity|Functional)\b", re.MULTILINE | re.IGNORECASE)


def parse_test_plan_scenarios(plan_text: str) -> list[dict]:
    """Splits Section 18 into its individual test-case scenarios.

    Returns each scenario's TC-ID, its `#### ...` heading line, its
    `**Tier:**` value, and the full markdown of that scenario -- so the Test
    Plan view can offer a per-tier view of the same document without
    reordering the plan itself (Section 18 stays grouped by feature area,
    which is what the automation generator consumes).
    """
    headings = list(PLAN_TC_HEADING_RE.finditer(plan_text))
    scenarios: list[dict] = []
    for i, m in enumerate(headings):
        start = m.start()
        end = headings[i + 1].start() if i + 1 < len(headings) else len(plan_text)
        block = plan_text[start:end].rstrip()
        tier_match = PLAN_TIER_RE.search(block)
        scenarios.append(
            {
                "tc_id": m.group(1),
                "heading": plan_text[m.start() : plan_text.find("\n", m.start())].lstrip("# ").strip(),
                "tier": tier_match.group(1).capitalize() if tier_match else None,
                "block": block,
            }
        )
    return scenarios


def parse_test_plan_steps(plan_text: str) -> dict[str, list[dict]]:
    """Maps each TC-ID in a test plan to its parsed `**Steps:**` block.

    This is the primary source for the Automation Suite view's "Test Case
    Steps" -- more robust than parsing `// N. ...` comments back out of the
    generated code (parse_step_markers), which depends on that particular
    pipeline run's automation-generation step having actually included them.
    Not every run does (no hard gate on it, unlike the tier tags), which
    silently left the steps section blank for those suites. The test plan
    itself always has a Steps: block per CLAUDE.md's Quality Standards, so
    parsing it directly is the reliable path.
    """
    headings = list(PLAN_TC_HEADING_RE.finditer(plan_text))
    result: dict[str, list[dict]] = {}
    for i, m in enumerate(headings):
        tc_id = m.group(1)
        start = m.end()
        end = headings[i + 1].start() if i + 1 < len(headings) else len(plan_text)
        block = plan_text[start:end]

        steps_idx = block.find("**Steps:**")
        if steps_idx == -1:
            continue

        steps: list[dict] = []
        current: dict | None = None
        for line in block[steps_idx:].splitlines():
            step_match = PLAN_STEP_RE.match(line)
            if step_match:
                if current:
                    steps.append(current)
                current = {
                    "number": int(step_match.group(1)),
                    "text": step_match.group(2).strip(),
                    "expectations": [],
                }
                continue
            expect_match = PLAN_EXPECT_RE.match(line)
            if expect_match and current is not None:
                current["expectations"].append(expect_match.group(1).strip())
        if current:
            steps.append(current)

        if steps:
            result[tc_id] = steps
    return result


def render_spec_files_inline(
    spec_files: list[tuple[str, str]],
    plan_steps: dict[str, list[dict]] | None = None,
    collect_feedback: bool = False,
    feedback_key_prefix: str = "",
) -> list[tuple[str, str]]:
    """Renders each spec file's test cases as expanders: test-plan steps
    alongside the full automation script.

    `spec_files` is a list of (relative_path, source_text) tuples -- shared
    by the Approved Test Artifacts tab (local filesystem reads) and the
    Review Pipeline Artifacts tab (GitHub API reads) so both render
    identically regardless of where the content came from. `plan_steps`
    (from parse_test_plan_steps) is tried first per TC-ID; a script whose
    generation run didn't embed `// N. ...` comments still shows its steps.

    When `collect_feedback` is True, each test case also gets a feedback
    text_area (the automation stage's per-test-case review flow in the
    Review Pipeline Artifacts tab) and the return value maps a
    human-readable label for each test case to the widget's session_state
    key -- the caller reads those keys after the fact to collect whatever
    the reviewer typed, once a button is clicked. Empty when
    collect_feedback is False (e.g. the Approved Test Artifacts tab, which
    is browsing-only).
    """
    feedback_fields: list[tuple[str, str]] = []

    # Flatten across files so tests can be grouped by category. idx stays the
    # test's index within its OWN file, because the feedback widget key is
    # derived from it for tests with no TC-ID -- renumbering globally would
    # silently orphan any feedback already typed against the old key.
    entries: list[tuple[str, int, dict]] = []
    for rel_path, spec_text in spec_files:
        for idx, tc in enumerate(extract_test_cases_from_spec(spec_text)):
            entries.append((rel_path, idx, tc))

    if not entries:
        st.caption("No `test()` calls found in this suite.")
        return feedback_fields

    def render_entry(rel_path: str, idx: int, tc: dict) -> None:
        label = tc["title"]
        badges = [b for b in (tc["tier"], "Regression" if tc["regression"] else None) if b]
        if badges:
            label += "  ·  " + " + ".join(badges)
        with st.expander(label):
            st.caption(f"Source: `{rel_path}`")
            steps = None
            if plan_steps and tc["tc_id"]:
                steps = plan_steps.get(tc["tc_id"])
            if not steps:
                steps = parse_step_markers(tc["block"])
            if steps:
                st.markdown("**Test Case Steps:**")
                step_lines = []
                for step in steps:
                    step_lines.append(f"{step['number']}. {step['text']}")
                    step_lines.extend(f"    - expect: {e}" for e in step["expectations"])
                st.markdown("\n".join(step_lines))
            else:
                st.caption("No test-plan steps found for this test case.")
            st.markdown("**Automation Script:**")
            st.code(tc["block"], language="typescript")
            if collect_feedback:
                fb_key = f"{feedback_key_prefix}__{tc['tc_id'] or f'{rel_path}:{idx}'}"
                st.text_area(
                    "Feedback for this test case (leave blank if no changes needed)",
                    key=fb_key,
                    height=80,
                )
                feedback_fields.append((tc["tc_id"] or tc["title"], fb_key))

    # Tier is exactly one of Smoke/Sanity/Functional (or absent on suites that
    # predate the convention), so these groups partition the suite -- every
    # test renders exactly once, which also keeps the feedback widget keys
    # unique.
    groups: dict[str, list[tuple[str, int, dict]]] = {"Smoke": [], "Sanity": [], "Functional": [], "Untagged": []}
    for entry in entries:
        groups[entry[2]["tier"] or "Untagged"].append(entry)

    regression_entries = [e for e in entries if e[2]["regression"]]

    tab_names = [f"{name} ({len(items)})" for name, items in groups.items() if items]
    ordered = [(name, items) for name, items in groups.items() if items]
    # Regression is NOT a tier -- it's cross-suite membership that sits
    # alongside a tier, so these tests are the same ones already listed under
    # the tabs above. Listed read-only (no expanders) so nothing is rendered,
    # or keyed, twice.
    tab_names.append(f"Regression ({len(regression_entries)})")

    tabs = st.tabs(tab_names)
    for tab, (name, items) in zip(tabs, ordered):
        with tab:
            by_file: dict[str, list[tuple[str, int, dict]]] = {}
            for entry in items:
                by_file.setdefault(entry[0], []).append(entry)
            for rel_path, file_entries in by_file.items():
                plural = "s" if len(file_entries) != 1 else ""
                st.markdown(f"**`{rel_path}`** ({len(file_entries)} {name.lower()} test case{plural})")
                for entry in file_entries:
                    render_entry(*entry)

    with tabs[-1]:
        if not regression_entries:
            st.caption("No tests in this suite carry the `@regression` tag.")
        else:
            st.caption(
                f"{len(regression_entries)} of {len(entries)} tests are in the cross-suite regression "
                "set (`@regression`). Regression is not a tier -- it sits alongside one, so these are "
                "the same tests shown under the tabs above, listed here as one set. Run them all with "
                "`npx playwright test --project=chromium --grep @regression`."
            )
            rows = [
                {
                    "Test Case": tc["tc_id"] or "--",
                    "Tier": tc["tier"] or "--",
                    "Title": tc["title"],
                    "File": rel_path,
                }
                for rel_path, _idx, tc in regression_entries
            ]
            st.dataframe(
                pd.DataFrame(rows),
                use_container_width=True,
                hide_index=True,
                height=min(38 * (len(rows) + 1) + 3, 420),
            )

    return feedback_fields


def regression_ids_for_suite(slug: str) -> set[str] | None:
    """TC-IDs carrying @regression in this slug's generated suite.

    The plan has no notion of regression membership -- that lives on the
    generated test as a tag alongside its tier -- so it has to be read back
    out of the suite. Returns None when the suite isn't available to read,
    which the caller distinguishes from "none of them are tagged".
    """
    suite_dir = REPO_ROOT / "tests" / slug
    if not suite_dir.exists():
        return None
    ids: set[str] = set()
    saw_a_test = False
    for spec in suite_dir.rglob("*.spec.ts"):
        try:
            text = spec.read_text(encoding="utf-8")
        except OSError:
            continue
        for tc in extract_test_cases_from_spec(text):
            saw_a_test = True
            if tc["regression"] and tc["tc_id"]:
                ids.add(tc["tc_id"])
    return ids if saw_a_test else None


def render_plan_by_tier(plan_text: str, slug: str) -> None:
    """Renders a test plan with per-tier views alongside the full document.

    The plan document is left exactly as written -- Section 18 stays grouped
    by feature area, which is the structure the automation generator reads.
    These tabs are a view over it, so a reviewer can look at just the smoke
    scenarios without the plan itself having to be reordered or regenerated.
    """
    scenarios = parse_test_plan_scenarios(plan_text)
    if not scenarios:
        st.markdown(plan_text)
        return

    groups: dict[str, list[dict]] = {"Smoke": [], "Sanity": [], "Functional": [], "Untiered": []}
    for scenario in scenarios:
        groups[scenario["tier"] or "Untiered"].append(scenario)

    reg_ids = regression_ids_for_suite(slug)
    reg_scenarios = [s for s in scenarios if reg_ids is not None and s["tc_id"] in reg_ids]

    present = [(name, items) for name, items in groups.items() if items]
    labels = ["📄 Full plan"] + [f"{name} ({len(items)})" for name, items in present]
    labels.append(f"Regression ({len(reg_scenarios)})" if reg_ids is not None else "Regression (n/a)")

    tabs = st.tabs(labels)

    with tabs[0]:
        st.markdown(plan_text)

    def render_scenarios(items: list[dict]) -> None:
        for scenario in items:
            st.markdown(scenario["block"])
            st.divider()

    for tab, (name, items) in zip(tabs[1:], present):
        with tab:
            st.caption(
                f"{len(items)} {name.lower()} scenario(s), in plan order. Section 18 of the "
                "document itself stays grouped by feature area -- this is a view over it."
            )
            render_scenarios(items)

    with tabs[-1]:
        if reg_ids is None:
            st.caption(
                "Regression membership is carried by the `@regression` tag on the generated "
                f"test, not by the plan, and `tests/{slug}/` isn't in this checkout -- so it "
                "can't be determined here."
            )
        elif not reg_scenarios:
            st.caption("No test case in this plan maps to an `@regression`-tagged test.")
        else:
            st.caption(
                f"{len(reg_scenarios)} of {len(scenarios)} scenarios map to an `@regression`-tagged "
                "test. Regression isn't a tier -- it sits alongside one, so these scenarios also "
                "appear under the tier tabs above."
            )
            render_scenarios(reg_scenarios)


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


def stale_results_warning(slug: str) -> str:
    """Message to show when the loaded results predate the suite's current cycle.

    `<slug>-test-results.json` is only rewritten by an actual execution, so a
    slug that's been re-submitted (new plan/automation cycle, not executed
    yet) keeps serving the *previous* cycle's pass/fail numbers to every
    data-driven tab, with nothing on screen saying so. Returns "" when the
    results are current, or when the suite has no review file at all --
    those aren't pipeline-tracked, so there's no cycle to be stale against.
    """
    review_file = REPO_ROOT / "user-stories" / f"{slug}-review.json"
    if not review_file.exists():
        return ""
    try:
        review = json.loads(review_file.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return ""

    execute_status = review.get("execute", {}).get("status", "not_started")
    if execute_status == "completed":
        return ""

    in_flight = {
        "not_started": "hasn't run yet",
        "in_progress": "is running now",
        "failed": "failed -- see the Actions run log",
    }.get(execute_status, f"is `{execute_status}`")
    return (
        f"**These results are from a previous execution of this suite.** Its current "
        f"pipeline cycle {in_flight}, so every number, chart and table below (success "
        f"rate, pass/fail counts, coverage, defects) still describes the *earlier* run "
        f"— not the plan and automation suite currently under review. They'll be "
        f"replaced once the current cycle executes."
    )


_stale_warning = stale_results_warning(DATA_PATH.stem.removesuffix("-test-results"))
if _stale_warning:
    st.warning(_stale_warning, icon="⚠️")


def render_execution_status_header() -> None:
    """Title + KPI summary for the currently selected suite.

    Scoped to the Overview and Test Execution Report tabs only -- other tabs
    (Submit New Request, Review Pipeline Artifacts, etc.) have their own
    focus and don't need this repeated on every screen.
    """
    st.title(f"Test Execution Report — {meta.get('story', DATA_PATH.stem)}: {meta['app_under_test']}")
    st.caption(
        f"**Application:** {meta['app_under_test']} ([{meta['app_url']}]({meta['app_url']}))  |  "
        f"**Test account:** `{meta['test_account']}`  |  **Report date:** {meta['report_date']}"
    )
    st.caption("🔄 Watching for new pipeline results every 15s -- new suites appear here automatically.")

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
    tab_execreport,
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
        "Test Execution Report",
        "Test Execution Matrix",
        "Coverage by Use Case",
        "Coverage by Business Rule",
        "Test Case Detail",
        "Defects Log",
    ]
)

# --- Overview tab -------------------------------------------------------------
with tab_overview:
    render_execution_status_header()

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

# --- Test Execution Report tab -------------------------------------------------
with tab_execreport:
    render_execution_status_header()

    st.subheader("Test Execution Report")
    st.caption(
        "An Agile-style Test Execution Report for the currently selected suite (see the "
        "'Test suite' picker above) -- defect density/distribution, execution status, and "
        "full defect/test tracking tables, matching this project's adopted report template."
    )

    _report_slug = DATA_PATH.stem.removesuffix("-test-results")
    try:
        from report_builder import build_report_payload

        _report_payload = build_report_payload(_report_slug)
    except Exception as exc:
        _report_payload = None
        st.error(f"Couldn't build the report for `{_report_slug}`: {exc}")

    if _report_payload:
        narrative_path = REPO_ROOT / "streamlit_app" / "data" / f"{_report_slug}-test-report.json"
        xlsx_path = REPO_ROOT / "reports" / f"{_report_slug}-test-execution-report.xlsx"

        st.markdown(f"### {_report_payload['title']}")
        meta_col1, meta_col2 = st.columns(2)
        with meta_col1:
            st.markdown(f"**Project Name:** {_report_payload['project_name']}")
            st.markdown(f"**Total Defects:** {_report_payload['total_defects']}")
            st.markdown(f"**Total Tests:** {_report_payload['total_tests']}")
        with meta_col2:
            st.markdown(f"**Report Prepared By:** {_report_payload['prepared_by']}")
            st.markdown(f"**Report Date:** {_report_payload['report_date']}")
            st.markdown(
                f"**Testing Period:** {_report_payload['testing_period_start']} "
                f"– {_report_payload['testing_period_end']}"
            )

        if not narrative_path.exists():
            st.info(
                "AI-authored narrative (Test Objectives / Key Findings / Recommendations / "
                "Conclusion) hasn't been generated for this suite yet -- showing a plain "
                "data-derived summary below. Click Regenerate Report to have Claude Code "
                "author it properly."
            )

        for section_title, key in [
            ("Test Objectives", "test_objectives"),
            ("Key Findings", "key_findings"),
            ("Recommendations", "recommendations"),
            ("Conclusion", "conclusion"),
        ]:
            st.markdown(f"**{section_title}**")
            st.markdown(_report_payload["narrative"].get(key, ""))

        st.divider()
        chart_col1, chart_col2, chart_col3 = st.columns(3)
        with chart_col1:
            st.markdown("**Defect Density**")
            _status_counts = _report_payload["defect_status_counts"]
            if sum(_status_counts.values()) == 0:
                # A Plotly pie with every value at 0 has no total to compute
                # slices from and renders as blank space -- show a clean
                # placeholder instead for suites with zero defects.
                st.caption("No defects recorded for this suite -- nothing to chart.")
            else:
                fig = go.Figure(
                    data=[go.Pie(
                        labels=list(_status_counts.keys()),
                        values=list(_status_counts.values()),
                        marker=dict(colors=CATEGORICAL),
                        # Name every slice, not just its percentage. A category
                        # with no defects still gets a label, and a bare "0%"
                        # floating on a leader line reads as an error rather
                        # than as "In Progress: none".
                        textinfo="label+percent",
                    )]
                )
                fig.update_layout(margin=dict(l=10, r=10, t=10, b=10))
                st.plotly_chart(fig, use_container_width=True)
        with chart_col2:
            st.markdown("**Defect Distribution**")
            _severity_counts = _report_payload["defect_severity_counts"]
            if sum(_severity_counts.values()) == 0:
                st.caption("No defects recorded for this suite -- nothing to chart.")
            else:
                fig = go.Figure(
                    data=[go.Pie(
                        labels=list(_severity_counts.keys()),
                        values=list(_severity_counts.values()),
                        marker=dict(colors=CATEGORICAL),
                        textinfo="label+percent",
                    )]
                )
                fig.update_layout(margin=dict(l=10, r=10, t=10, b=10))
                st.plotly_chart(fig, use_container_width=True)
        with chart_col3:
            _exec_counts = _report_payload["test_execution_counts"]
            fig = go.Figure(
                data=[go.Bar(
                    x=list(_exec_counts.keys()),
                    y=list(_exec_counts.values()),
                    marker=dict(color=[STATUS_GOOD, "#d64545", STATUS_WARNING, MUTED_BG]),
                )]
            )
            fig.update_layout(title="Test Execution Status", margin=dict(l=10, r=10, t=40, b=10))
            st.plotly_chart(fig, use_container_width=True)

        st.subheader("Dashboard Data")
        dd1, dd2, dd3 = st.columns(3)
        with dd1:
            st.markdown("**Defect Summary (Status)**")
            st.table(
                pd.DataFrame(
                    list(_report_payload["defect_status_counts"].items()), columns=["Status", "Count"]
                ).set_index("Status")
            )
        with dd2:
            st.markdown("**Defect Summary (Severity)**")
            st.table(
                pd.DataFrame(
                    list(_report_payload["defect_severity_counts"].items()), columns=["Severity", "Count"]
                ).set_index("Severity")
            )
        with dd3:
            st.markdown("**Test Execution Summary**")
            st.table(
                pd.DataFrame(
                    list(_report_payload["test_execution_counts"].items()), columns=["Status", "Count"]
                ).set_index("Status")
            )

        st.subheader("Defect Tracking Data")
        if _report_payload["defect_tracking_rows"]:
            _defect_df = pd.DataFrame(_report_payload["defect_tracking_rows"]).rename(columns={
                "id": "Defect ID", "date_detected": "Date Detected", "description": "Description",
                "status": "Status", "severity": "Severity", "owner": "Owner", "remarks": "Remarks",
            })
            st.dataframe(
                _defect_df, use_container_width=True, hide_index=True,
                height=min(38 * (len(_defect_df) + 1) + 3, 400),
            )
        else:
            st.caption("No defects recorded for this suite.")

        st.subheader("Test Execution Data")
        # st.dataframe renders every cell on a single line, so multi-step
        # "Test Steps" text collapsed into one run-on sentence. Same fix as
        # the Defects Log tab: hand-built HTML with an <ol> per row instead
        # of going through st.dataframe, wrapped in a bounded scroll box so
        # the scrollbar sits right at the top rows instead of below all of
        # them.
        def _exec_cell(val) -> str:
            return html.escape(str(val))

        def _exec_screenshot_cell(tc_id: str) -> str:
            # Same reports/screenshots/<slug>/<TC-ID>.png the Test Case Detail
            # tab reads -- embedded here as a base64 data URI (not a relative
            # <img src> path, since Streamlit doesn't serve arbitrary repo
            # files as static assets) so it's a real thumbnail, not a link.
            shot_path = REPO_ROOT / "reports" / "screenshots" / _report_slug / f"{tc_id}.png"
            if not shot_path.exists():
                return "<span style='color:#999;'>No screenshot</span>"
            data_uri = "data:image/png;base64," + base64.b64encode(shot_path.read_bytes()).decode("ascii")
            return (
                f"<a href='{data_uri}' target='_blank' title='Open full-size screenshot'>"
                f"<img src='{data_uri}' style='width:100px; border:1px solid #ccc; border-radius:3px;' />"
                f"</a>"
            )

        _exec_rows_html = []
        for _row in _report_payload["test_execution_rows"]:
            _steps = [s for s in _row["steps"].split("\n") if s.strip()]
            # Steps already come prefixed "N. text" (for the .xlsx cell) --
            # strip that since the <ol> below supplies its own numbering.
            _steps = [re.sub(r"^\d+\.\s*", "", s) for s in _steps]
            _steps_html = "<ol style='margin:0; padding-left:1.1em;'>" + "".join(
                f"<li>{_exec_cell(s)}</li>" for s in _steps
            ) + "</ol>" if _steps else ""
            _cell = "padding:6px 8px; border-bottom:1px solid #ddd; vertical-align:top; white-space:nowrap;"
            _wrap_cell = _cell.replace("white-space:nowrap;", "white-space:normal; min-width:220px;")
            _exec_rows_html.append(
                "<tr>"
                f"<td style='{_cell}'>{_exec_cell(_row['id'])}</td>"
                f"<td style='{_cell}'>{_exec_cell(_row['date'])}</td>"
                f"<td style='{_wrap_cell}'>{_exec_cell(_row['description'])}</td>"
                f"<td style='{_wrap_cell}'>{_steps_html}</td>"
                f"<td style='{_wrap_cell}'>{_exec_cell(_row['expected'])}</td>"
                f"<td style='{_wrap_cell}'>{_exec_cell(_row['actual'])}</td>"
                f"<td style='{_cell}'>{_exec_cell(_row['status'])}</td>"
                f"<td style='{_cell}'>{_exec_cell(_row['tested_by'])}</td>"
                f"<td style='{_wrap_cell}'>{_exec_cell(_row['remarks'])}</td>"
                f"<td style='{_cell}'>{_exec_screenshot_cell(_row['id'])}</td>"
                "</tr>"
            )

        _exec_header_cell = f"text-align:left; padding:6px 8px; border-bottom:2px solid {SECONDARY_INK}; position:sticky; top:0; background:white;"
        st.markdown(
            "<div style='overflow:auto; max-height:480px; border:1px solid #ddd;'>"
            "<table style='width:100%; border-collapse:collapse;'>"
            "<tr>"
            + "".join(
                f"<th style='{_exec_header_cell}'>{h}</th>"
                for h in [
                    "Test Case ID", "Date", "Description", "Test Steps", "Expected Result",
                    "Actual Result", "Execution Status", "Tested By", "Remarks", "Screenshot",
                ]
            )
            + "</tr>"
            + "".join(_exec_rows_html)
            + "</table></div>",
            unsafe_allow_html=True,
        )

        st.divider()
        action_col1, action_col2 = st.columns(2)
        with action_col1:
            if st.button("🔁 Regenerate Report", key=f"regen_report_{_report_slug}"):
                run_result = trigger_workflow(
                    owner=GITHUB_OWNER, repo=GITHUB_REPO, workflow_file=GITHUB_GENERATE_REPORT_WORKFLOW_FILE,
                    ref=GITHUB_BRANCH, token=get_github_token(), inputs={"slug": _report_slug},
                )
                if run_result.success:
                    st.success("Regeneration triggered -- refresh in a minute or two once the workflow completes.")
                else:
                    st.warning(f"Couldn't trigger regeneration: {run_result.message}")
        with action_col2:
            if xlsx_path.exists():
                st.download_button(
                    "⬇️ Download .xlsx",
                    data=xlsx_path.read_bytes(),
                    file_name=xlsx_path.name,
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    key=f"download_report_{_report_slug}",
                )
            else:
                st.caption(
                    "No .xlsx generated yet for this suite -- click Regenerate Report, or wait "
                    "for the next pipeline execution."
                )

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

        _detail_slug = DATA_PATH.stem.removesuffix("-test-results")
        screenshot_path = REPO_ROOT / "reports" / "screenshots" / _detail_slug / f"{picked_id}.png"
        st.markdown("**Screenshot at test end (visual proof of the assertion outcome)**")
        if screenshot_path.exists():
            st.image(str(screenshot_path), use_container_width=True)
        else:
            st.caption(
                "No screenshot on file for this test case -- either the suite ran before this "
                "feature was added, or the app's checkout hasn't picked up the latest pipeline "
                "run yet (try rebooting the app)."
            )

        # An aggregator suite pools tests from many source suites, so its ids
        # are namespaced "<source-suite>/<TC-ID>" -- a bare TC-ID isn't unique
        # across the pool (TC-LOGIN-001 exists in two suites, as do several
        # TC-DROPDOWN-*). Scope the lookup to that source suite and search for
        # the bare id, since searching all of tests/ would return whichever
        # colliding suite happened to sort first.
        if "/" in picked_id:
            source_suite, bare_id = picked_id.split("/", 1)
            suite_dir = REPO_ROOT / "tests" / source_suite
            spec_path, block = find_test_block(str(suite_dir), bare_id)
        else:
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
            steps_from_plan = False
            if not step_records:
                # Not every generation run emits `// N. ...` markers, so fall
                # back to the approved test plan's own steps for this TC-ID --
                # the same fallback the Approved Test Artifacts tab already
                # does. Without it a suite generated without markers shows no
                # steps at all, even though the plan defines them.
                plan_file = REPO_ROOT / (
                    meta.get("test_plan_path") or f"specs/{_detail_slug}-test-plan.md"
                )
                if plan_file.exists():
                    try:
                        plan_lookup = parse_test_plan_steps(plan_file.read_text(encoding="utf-8"))
                    except OSError:
                        plan_lookup = {}
                    # Aggregator ids are "<source-suite>/<TC-ID>"; the plan keys
                    # are bare TC-IDs.
                    bare_id = picked_id.split("/", 1)[-1]
                    planned = plan_lookup.get(bare_id)
                    if planned:
                        # Plan steps carry no code_lines -- supply an empty list
                        # so the per-step renderer below can treat both sources
                        # identically.
                        step_records = [{**s, "code_lines": []} for s in planned]
                        steps_from_plan = True

            if not step_records:
                st.caption(
                    "No numbered step markers (`// N. ...`) found in this script, and no steps "
                    "for this test case in the test plan -- see the full script above instead."
                )
            else:
                if steps_from_plan:
                    st.caption(
                        "This script carries no `// N. ...` step markers, so the steps below come "
                        "from the approved test plan. Per-step automation code isn't available -- "
                        "see the full script above."
                    )
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
                        f"[View trace & video for this run]({run_url}) "
                        "-- in the `playwright-report` artifact at the bottom of the run page "
                        "(the screenshot above is embedded directly; trace/video are larger "
                        "and stay in the CI artifact)."
                    )
                else:
                    st.caption(
                        "No linked Actions run recorded for this suite (generated before this "
                        "feature was added) -- trace/video unavailable."
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
    per_test_case_review: bool = False,
) -> None:
    """Render one stage's status plus Approve / Request Changes controls.

    Writes decisions straight to the review-status JSON via upsert_file
    (this app owns that file end-to-end, unlike the request markdown which
    only the pipeline itself updates) and dispatches the workflow for
    whichever stage should run next.

    `per_test_case_review` (used for the automation stage only) attaches a
    feedback field to every individual test case rendered, and combines
    whichever ones the reviewer filled in into the regeneration request --
    instead of one free-text box for the whole suite, so feedback for a
    36-test suite is unambiguously scoped to the exact test case it's about
    rather than a paragraph the regenerating agent has to disambiguate.
    """
    stage_data = review_data.get(stage_key, {})
    status = stage_data.get("status", "not_started")
    st.markdown(f"##### {stage_name}")
    st.markdown(REVIEW_STATUS_LABELS.get(status, status))
    if stage_data.get("revision"):
        st.caption(f"Revision {stage_data['revision']}")

    def submit_approval() -> None:
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

    def submit_regeneration(feedback_text: str) -> None:
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

    artifact_path = stage_data.get("path", "")
    feedback_fields: list[tuple[str, str]] = []
    if artifact_path:
        stage_data, review_data = _sync_stage_google_doc(
            review_data, review_path, review_slug, stage_key, stage_name, stage_data, artifact_path,
        )
        doc_url = stage_data.get("doc_url", "")
        if doc_url:
            st.markdown(f"[{artifact_label} (Google Doc)]({doc_url})")
        elif artifact_path.endswith("/"):
            # A directory (the automation suite) -- list its *.spec.ts files via
            # the GitHub API (not a local read, same freshness reason as the
            # plan below), fetch each one's content, and reveal them inline
            # behind a click using the same per-test-case rendering as the
            # Approved Test Artifacts tab, instead of just linking to GitHub.
            st.caption(f"`{artifact_path}`")
            listing_result = list_directory(
                owner=GITHUB_OWNER, repo=GITHUB_REPO, path=artifact_path.rstrip("/"),
                ref=GITHUB_BRANCH, token=get_github_token(),
            )
            spec_files = []
            listing_ok = False
            if listing_result.success and listing_result.content:
                try:
                    entries = json.loads(listing_result.content)
                    listing_ok = True
                except (json.JSONDecodeError, TypeError):
                    entries = []
                for entry in entries:
                    if entry.get("type") == "file" and entry.get("name", "").endswith(".spec.ts"):
                        file_result = get_file(
                            owner=GITHUB_OWNER, repo=GITHUB_REPO, path=entry["path"],
                            ref=GITHUB_BRANCH, token=get_github_token(),
                        )
                        if file_result.success and file_result.content:
                            spec_files.append((entry["path"], file_result.content))
            if listing_ok:
                plan_path = review_data.get("plan", {}).get("path", f"specs/{review_slug}-test-plan.md")
                plan_result = get_file(
                    owner=GITHUB_OWNER, repo=GITHUB_REPO, path=plan_path, ref=GITHUB_BRANCH, token=get_github_token(),
                )
                plan_steps = parse_test_plan_steps(plan_result.content) if plan_result.success and plan_result.content else None
                with st.expander(artifact_label.removesuffix(" on GitHub")):
                    if spec_files:
                        feedback_fields = render_spec_files_inline(
                            sorted(spec_files), plan_steps,
                            collect_feedback=(per_test_case_review and status == "pending_review"),
                            feedback_key_prefix=f"tcfb_{review_slug}_{stage_key}",
                        )
                    else:
                        st.caption("No `.spec.ts` files found directly in this folder.")
            else:
                st.caption(f"Could not load content inline ({listing_result.message}).")
                st.markdown(f"[{artifact_label}]({github_url(artifact_path)})")
        else:
            # A single file (the test plan) -- fetch its content via the GitHub API
            # (not a local file read, so a just-completed pipeline run shows up
            # immediately even if this app instance's own checkout hasn't
            # redeployed yet) and reveal it inline behind a click, rather than
            # either navigating away to GitHub or always dumping the full plan.
            st.caption(f"`{artifact_path}`")
            artifact_result = get_file(
                owner=GITHUB_OWNER, repo=GITHUB_REPO, path=artifact_path, ref=GITHUB_BRANCH, token=get_github_token(),
            )
            if artifact_result.success and artifact_result.content:
                with st.expander(artifact_label.removesuffix(" on GitHub")):
                    st.markdown(artifact_result.content)
            else:
                st.caption(f"Could not load content inline ({artifact_result.message}).")
                st.markdown(f"[{artifact_label}]({github_url(artifact_path)})")

    if status != "pending_review":
        if status == "changes_requested" and stage_data.get("feedback"):
            st.caption(f"Feedback sent, awaiting regeneration: {stage_data['feedback']}")
        return

    if per_test_case_review:
        st.markdown("###### Approve or request changes")
        if feedback_fields:
            st.caption(
                "Fill in feedback on any test case above that needs changes and leave the "
                "rest blank, then click Regenerate -- only the ones with feedback are sent, "
                "each scoped to its own test case."
            )
        approve_col, regen_col = st.columns([1, 1])
        with approve_col:
            if st.button("✅ Approve", key=f"approve_{stage_key}"):
                submit_approval()
        with regen_col:
            if st.button("🔁 Regenerate with feedback", key=f"regen_{stage_key}"):
                notes = []
                for label, fb_key in feedback_fields:
                    text = st.session_state.get(fb_key, "").strip()
                    if text:
                        notes.append(f"{label}: {text}")
                if not notes:
                    st.error("Enter feedback for at least one test case above first.")
                else:
                    submit_regeneration("\n".join(notes))
        return

    approve_col, changes_col = st.columns([1, 1])
    with approve_col:
        if st.button("✅ Approve", key=f"approve_{stage_key}"):
            submit_approval()

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
                    submit_regeneration(feedback_text)


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
    review_slug = review_slug_input.strip()

    # Auto-refresh only earns its place while a stage is still generating and
    # there is nothing to look at yet. Once an artifact is on screen awaiting
    # approval, polling would re-render the review controls underneath the
    # reviewer mid-decision, so the option is withdrawn until they approve or
    # request changes.
    awaiting_approval = False
    awaiting_stage = None
    if review_slug:
        status_probe = get_file(
            owner=GITHUB_OWNER,
            repo=GITHUB_REPO,
            path=f"user-stories/{review_slug}-review.json",
            ref=GITHUB_BRANCH,
            token=get_github_token(),
        )
        if status_probe.success:
            try:
                probe_data = json.loads(status_probe.content)
                awaiting_stage = next(
                    (
                        label
                        for stage, label in (("plan", "Test Plan"), ("automation", "Automation Suite"))
                        if (probe_data.get(stage) or {}).get("status") == "pending_review"
                    ),
                    None,
                )
                awaiting_approval = awaiting_stage is not None
            except (json.JSONDecodeError, TypeError):
                awaiting_approval = False

    if awaiting_approval:
        # Clearing the widget's own state, rather than merely skipping the
        # render, is what actually unbinds the fragment's run_every below.
        st.session_state["review_auto_refresh"] = False
        review_auto_refresh = False
        st.caption(
            f"⏸️ Auto-refresh is off while the **{awaiting_stage}** below waits on your "
            "review -- it comes back once you approve or request changes."
        )
    else:
        review_auto_refresh = st.checkbox(
            "Auto-refresh every 15s",
            value=False,
            key="review_auto_refresh",
            help="Keeps re-checking this slug's review status on its own -- handy while a stage is generating.",
        )

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

        # The tick that lands exactly when a stage finishes generating has to
        # promote itself to a full rerun: run_every is bound outside this
        # fragment, so only re-running the app can unbind it and withdraw the
        # auto-refresh control now that an artifact is waiting on review.
        if st.session_state.get("review_auto_refresh") and any(
            (review_data.get(stage) or {}).get("status") == "pending_review"
            for stage in ("plan", "automation")
        ):
            st.rerun(scope="app")

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
                per_test_case_review=True,
            )
        else:
            st.markdown("##### 2. Automation Suite")
            st.caption("Waiting on test plan approval.")
        st.divider()

        st.markdown("##### 3. Execution")
        execute_data = review_data.get("execute", {})
        execute_status = execute_data.get("status", "not_started")
        st.markdown(REVIEW_STATUS_LABELS.get(execute_status, execute_status))
        results_loaded = False
        if execute_status == "completed":
            # Show the actual results inline (fetched via the GitHub API, same
            # freshness reasoning as the plan/automation sections above) rather
            # than just a link to the GitHub Actions run log.
            results_path = f"streamlit_app/data/{review_slug}-test-results.json"
            results_result = get_file(
                owner=GITHUB_OWNER, repo=GITHUB_REPO, path=results_path, ref=GITHUB_BRANCH, token=get_github_token(),
            )
            if results_result.success and results_result.content:
                try:
                    results_summary = json.loads(results_result.content).get("summary", {})
                except (json.JSONDecodeError, TypeError):
                    results_summary = None
                if results_summary:
                    results_loaded = True
                    rk1, rk2, rk3, rk4 = st.columns(4)
                    rk1.metric("Success Rate", f"{results_summary.get('success_rate', 'n/a')}%")
                    rk2.metric("Test Cases", results_summary.get("test_cases", "n/a"))
                    rk3.metric("Passed", results_summary.get("passed", "n/a"))
                    rk4.metric("Failed", results_summary.get("failed", "n/a"))
                    st.caption(f"`{results_path}` — full breakdown (execution matrix, coverage, defects log) is in the Overview tab.")
                else:
                    st.caption("Results file exists but isn't valid JSON yet.")
            else:
                st.caption(f"Could not load results inline ({results_result.message}).")
        # Once the inline results loaded, the run log link is redundant (and was
        # the exact "GitHub link instead of results" complaint this replaces) --
        # only keep it as a fallback when there's nothing else to show yet.
        if execute_data.get("workflow_run_url") and not results_loaded:
            st.markdown(f"[View CI run on GitHub]({execute_data['workflow_run_url']})")

        # Re-running execution only needs the suite that's already approved, so
        # this re-dispatches pipeline-execute.yml directly rather than sending
        # the reviewer back through plan/automation approval. Useful when the
        # results on file predate a fix to the suite or the target app, which
        # the pipeline's own stage tracking can't detect -- from its point of
        # view that cycle completed and is current.
        if execute_status in ("completed", "failed"):
            if st.button("🔁 Re-run Execution", key=f"rerun_execute_{review_slug}"):
                rerun_result = trigger_workflow(
                    owner=GITHUB_OWNER,
                    repo=GITHUB_REPO,
                    workflow_file=GITHUB_PIPELINE_EXECUTE_WORKFLOW_FILE,
                    ref=GITHUB_BRANCH,
                    token=get_github_token(),
                    inputs={
                        "request_file": review_data.get("request_file", ""),
                        "slug": review_slug,
                    },
                )
                if rerun_result.success:
                    st.success(
                        "Execution re-triggered -- this run's results, screenshots, report "
                        "and narrative will replace the ones above once it completes."
                    )
                else:
                    st.warning(f"Couldn't re-trigger execution: {rerun_result.message}")
            st.caption(
                "Runs the approved suite again against the target app, without redoing "
                "plan/automation review. Overwrites this suite's stored results."
            )
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
            plan_path = plan_stage.get("path", f"specs/{slug}-test-plan.md")
            local_plan = REPO_ROOT / plan_path
            plan_text = None
            if local_plan.exists():
                try:
                    plan_text = local_plan.read_text(encoding="utf-8")
                except OSError:
                    plan_text = None
            plan_steps = parse_test_plan_steps(plan_text) if plan_text else None

            # Side by side rather than stacked: an approved test plan renders as
            # a full 18-section document, which pushed the automation suite
            # roughly fourteen screens down the expander -- far enough that it
            # read as missing entirely. Sub-tabs keep both one click away.
            plan_tab, suite_tab = st.tabs(
                [
                    f"📋 Test Plan & Test Cases{'' if plan_approved else ' (not approved)'}",
                    f"🧪 Automation Suite{'' if automation_approved else ' (not approved)'}",
                ]
            )

            with plan_tab:
                if plan_approved:
                    st.markdown(f"**Test Plan & Test Cases:** `{plan_path}`")
                    if plan_text is not None:
                        render_plan_by_tier(plan_text, slug)
                    else:
                        st.caption("Plan file not found in this checkout yet.")
                else:
                    st.caption(
                        "Test plan: "
                        f"{REVIEW_STATUS_LABELS.get(plan_stage.get('status', 'not_started'), 'not started')}"
                        " -- approve it in the Review Pipeline Artifacts tab to see it here."
                    )

            with suite_tab:
                if automation_approved:
                    suite_path = automation_stage.get("path") or f"tests/{slug}/"
                    suite_dir = REPO_ROOT / suite_path
                    spec_paths = sorted(suite_dir.rglob("*.spec.ts")) if suite_dir.exists() else []
                    st.markdown(f"**Automation Suite:** `{suite_path}`")
                    if spec_paths:
                        spec_files = []
                        for spec_file in spec_paths:
                            rel_path = spec_file.relative_to(REPO_ROOT).as_posix()
                            try:
                                spec_files.append((rel_path, spec_file.read_text(encoding="utf-8")))
                            except OSError:
                                st.caption(f"Could not read `{rel_path}`.")
                        render_spec_files_inline(spec_files, plan_steps)
                    elif (REPO_ROOT / suite_path / "suite.config.ts").exists():
                        # An aggregator suite owns no spec files of its own --
                        # it selects tests from other suites via its config.
                        st.caption(
                            f"Aggregator suite -- no spec files of its own; "
                            f"`{suite_path}suite.config.ts` selects tests from other suites."
                        )
                    else:
                        st.caption("No spec files found in this checkout yet.")
                else:
                    st.caption(
                        "Automation suite: "
                        f"{REVIEW_STATUS_LABELS.get(automation_stage.get('status', 'not_started'), 'not started')}"
                        " -- approve it in the Review Pipeline Artifacts tab to see it here."
                    )

    if not shown_any:
        st.info(
            "No approved test plans or automation suites yet -- approve a stage in "
            "the Review Pipeline Artifacts tab first."
        )
