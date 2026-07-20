#!/usr/bin/env node
// PreToolUse guard for playwright-test MCP tools that write arbitrary files.
//
// Why this exists: both generator_write_test and planner_save_plan accept a
// fileName with no built-in path restriction ("Relative to the workspace
// root"). Subagents using these tools have repeatedly (not once, but across
// multiple independent runs) written unrelated boilerplate content into
// existing project files instead of a test/spec file — observed hitting
// .claude/agents/playwright-test-generator.md, .claude/agents/playwright-test-planner.md,
// and .claude/commands/generate-playwright-tests-tutorialsninja.md. This hook
// enforces, per tool, that fileName must resolve under the directory that
// tool is actually meant to write to, regardless of what the agent passes.

const REQUIRED_PREFIX = {
  'mcp__playwright-test__generator_write_test': 'tests/',
  'mcp__playwright-test__planner_save_plan': 'specs/',
};

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

  const toolName = payload.tool_name || '';
  const requiredPrefix = REQUIRED_PREFIX[toolName];
  if (!requiredPrefix) {
    // Not a tool this guard governs.
    allow();
    return;
  }

  const fileName = (payload.tool_input && payload.tool_input.fileName) || '';
  const normalized = fileName.replace(/\\/g, '/').replace(/^\.\//, '');

  if (normalized.startsWith(requiredPrefix)) {
    allow();
    return;
  }

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `${toolName} may only write files under ${requiredPrefix} (got fileName: "${fileName}"). ` +
        'Blocked to prevent writing outside its intended output directory (e.g. into .claude/agents/*.md, ' +
        '.claude/commands/*.md, config files, or other project files).',
    },
  }));
  process.exit(0);
});
