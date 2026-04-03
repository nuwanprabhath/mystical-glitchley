# Setting Up Glitchley with Claude Code

## 1. Status Line (persistent pet display)

Add to `~/.claude/settings.json`:

```json
{
  "statusline": "bun run /Users/nuwan/projects/pet-projects/mystical-glitchley/src/statusline.ts"
}
```

This shows Glitchley's face and stats in the Claude Code status bar after every response.

## 2. Hooks (react to coding activity)

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/nuwan/projects/pet-projects/mystical-glitchley/scripts/hook-post-tool.sh"
          }
        ]
      }
    ]
  }
}
```

This gives Glitchley XP and happiness whenever Claude edits or writes files.

## 3. Skill (interactive commands)

Copy the skill to your Claude Code commands directory:

```bash
mkdir -p ~/.claude/commands
cp /Users/nuwan/projects/pet-projects/mystical-glitchley/claude-code/skills/pet/SKILL.md ~/.claude/commands/pet.md
```

Then use `/pet` in Claude Code to interact with Glitchley.

## 4. Interactive Mode

Launch the full interactive TUI:

```bash
cd /Users/nuwan/projects/pet-projects/mystical-glitchley
bun run start
```

Controls: [F]eed, [P]lay, [S]leep, [Q]uit
