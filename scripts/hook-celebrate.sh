#!/bin/bash
# Claude Code hook for celebrations (tests passing, successful builds)
#
# Configure in ~/.claude/settings.json:
#   "hooks": {
#     "PostToolUse": [{
#       "matcher": "Bash",
#       "hooks": [{ "type": "command", "command": "/path/to/hook-celebrate.sh" }]
#     }]
#   }

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
bun run "$SCRIPT_DIR/src/cli.tsx" celebrate 2>/dev/null
