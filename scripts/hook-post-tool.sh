#!/bin/bash
# Claude Code PostToolUse hook
# Updates Glitchley's state when Claude uses tools
#
# Configure in ~/.claude/settings.json:
#   "hooks": {
#     "PostToolUse": [{
#       "matcher": "Edit|Write",
#       "hooks": [{ "type": "command", "command": "/path/to/hook-post-tool.sh" }]
#     }]
#   }

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
bun run "$SCRIPT_DIR/src/cli.tsx" code 2>/dev/null
