---
name: set-permissions
description: Configure Claude Code global permissions for minimal friction development
argument-hint: "[optional: --reset to restore defaults]"
---

# Set Claude Code Permissions

Configure Claude Code to run with minimal friction while preserving basic safety. This updates the user's global permissions at `~/.claude.json`.

## Behavior

- **Auto-approve**: Common read/write operations and safe development commands
- **Ask first**: Commits, pushes, and package publishing
- **Always deny**: Destructive commands and sensitive file access

## Steps

### Step 1: Check Current Configuration

Read `~/.claude.json` if it exists to understand current state.

### Step 2: Apply Permissions Configuration

Write the following configuration to `~/.claude.json`:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "WebFetch",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(pnpm:*)",
      "Bash(yarn:*)",
      "Bash(node:*)"
    ],
    "ask": [
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(npm publish:*)",
      "Bash(pnpm publish:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Read(./.env)",
      "Read(./**/.env)",
      "Read(./secrets/**)"
    ]
  }
}
```

### Step 3: Verify

Confirm the file was written correctly by reading it back.

## Arguments

If `#$ARGUMENTS` contains `--reset`:
- Delete the `permissions` key from `~/.claude.json` to restore Claude Code defaults
- Preserve any other configuration in the file

## Notes

- This modifies **global** Claude Code settings, affecting all projects
- Project-specific permissions can override these in `.claude/settings.json`
- The `deny` rules protect against accidental destructive commands and secret exposure
