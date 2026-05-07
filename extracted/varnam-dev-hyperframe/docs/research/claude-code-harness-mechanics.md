# Claude Code Harness Mechanics

Source: decompiled Claude Code source at `/Users/dev/Downloads/claude-code-source/src/`

## File Loading Lifecycle

| File Type | When Loaded | Persists? | Mechanism |
|-----------|-------------|-----------|-----------|
| CLAUDE.md | Session start | Memoized for session | First user message as `<system-reminder>` |
| Unconditional rules (no `paths:`) | Session start | Memoized for session | Same as CLAUDE.md |
| Conditional rules (with `paths:`) | When agent touches matching file | Per-tool-call | Lazy-loaded via `getMemoryFilesForNestedDirectory()` |
| SKILL.md | On `/skill-name` invocation | Inline with invocation | Injected as tool use content |
| MEMORY.md | Session start | Memoized for session | Part of claudeMd injection |

## CLAUDE.md Mechanics (`src/utils/claudemd.ts`)

- Discovered by walking from CWD to filesystem root
- Files closer to CWD have higher priority (loaded later = recency bias)
- Injected as first `user` role message with `isMeta: true`
- Format: `<system-reminder>As you answer the user's questions...\n# claudeMd\n<content>\n# currentDate\n...</system-reminder>`
- **40,000 char limit** per file (`MAX_MEMORY_CHARACTER_COUNT`)
- `@include` directives: relative/home/absolute paths, max depth 5, text files only
- Frontmatter and HTML comments stripped before injection
- `getMemoryFiles()` is memoized — changes on disk mid-conversation NOT picked up unless cache reset

## Conditional Rules Mechanics

- Files in `.claude/rules/` with `paths:` frontmatter
- Pattern matching: gitignore-style via `ignore` library
- Patterns relative to parent of `.claude/` directory
- Loaded lazily when agent reads/writes a file matching the glob
- Triggered via `InstructionsLoaded` hook with `load_reason: 'path_glob_match'`

```yaml
---
paths:
  - "src/**/*.ts"
  - "**/*.test.ts"
---
```

## SKILL.md Mechanics (`src/skills/loadSkillsDir.ts`)

- Must be in `skill-name/SKILL.md` format (not flat .md files in /skills/)
- Frontmatter parsed for: name, description, when-to-use, allowed-tools, model, effort, paths, hooks, etc.
- Full content loaded ONLY on invocation, NOT at startup
- Shell commands (`:!` blocks) executed at invocation time
- `${CLAUDE_SKILL_DIR}` and `${CLAUDE_SESSION_ID}` substituted

## Hooks Mechanics (`src/utils/hooks.ts`)

- Defined in `.claude/settings.json` or `.claude/settings.local.json`
- Key events: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `SessionStart`, `Stop`

### PreToolUse (CAN BLOCK)

Receives: `tool_name`, `tool_input`, `tool_use_id`

To block, hook script outputs:
```json
{
  "decision": "block",
  "reason": "Why blocked",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Explanation"
  }
}
```

Can also modify tool input before execution via `updatedInput`.

Precedence: `deny > ask > allow > passthrough`

### PostToolUse (fire-and-forget)

Receives: `tool_name`, `tool_input`, `tool_response`, `tool_use_id`
Cannot block — tool already executed. Can modify display output.

### Hook Config Format

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 scripts/preflight.py"
          }
        ]
      }
    ]
  }
}
```

- Timeout: 10 minutes (`TOOL_HOOK_EXECUTION_TIMEOUT_MS`)
- All hooks run in parallel
- Requires workspace trust in interactive mode

## Agent Definitions (`src/tools/AgentTool/loadAgentsDir.ts`)

Key frontmatter fields:
- `name`, `description` (required)
- `model`, `tools`, `disallowedTools`, `maxTurns`
- `omitClaudeMd`: skip CLAUDE.md injection (saves tokens)
- `memory`: `user` | `project` | `local` — persistent agent memory
- `isolation`: `worktree` | `remote`
- `hooks`: session-scoped hooks for this agent

Agent memory directories:
- user: `~/.claude/agent-memory/<type>/`
- project: `.claude/agent-memory/<type>/`

## Key Limits

| Limit | Value |
|-------|-------|
| CLAUDE.md per file | 40,000 chars |
| MEMORY.md | 200 lines OR 25,000 bytes |
| @include depth | 5 levels |
| Hook timeout | 10 minutes |
| SessionEnd hook timeout | 1.5 seconds |
