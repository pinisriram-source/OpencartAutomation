#!/usr/bin/env node
// PreToolUse guard for mcp__playwright-test__generator_write_test.
//
// Why this exists: a playwright-test-generator subagent once passed a
// fileName pointing at .claude/agents/playwright-test-generator.md (its own
// agent definition) instead of a spec file, appending ~124 lines of
// unrelated content into it. generator_write_test has no built-in path
// restriction, so this hook enforces one: fileName must resolve under the
// project's tests/ directory tree, regardless of what the agent passes.

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  const allow = () => {
    console.log(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' },
    }));
    process.exit(0);
  };

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    // Malformed input isn't this hook's problem to adjudicate.
    allow();
    return;
  }

  const fileName = (payload.tool_input && payload.tool_input.fileName) || '';
  const normalized = fileName.replace(/\\/g, '/').replace(/^\.\//, '');

  if (normalized.startsWith('tests/')) {
    allow();
    return;
  }

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `generator_write_test may only write files under tests/ (got fileName: "${fileName}"). ` +
        'Blocked to prevent writing outside the automation test suite (e.g. into .claude/agents/*.md, ' +
        'config files, or other project files).',
    },
  }));
  process.exit(0);
});
