---
name: pet
description: Interact with your Mystical Glitchley terminal pet - feed, play, check status
allowed-tools: Bash Read
---

# Mystical Glitchley Pet Skill

You have a terminal pet called Glitchley! Use these commands to interact with it.

## Available Actions

When the user wants to interact with their pet, run the appropriate command:

### Check Status
```bash
bun run /Users/nuwan/projects/pet-projects/mystical-glitchley/src/cli.tsx status
```

### Feed Pet
```bash
bun run /Users/nuwan/projects/pet-projects/mystical-glitchley/src/cli.tsx feed
```

### Play with Pet
```bash
bun run /Users/nuwan/projects/pet-projects/mystical-glitchley/src/cli.tsx play
```

### Put Pet to Sleep
```bash
bun run /Users/nuwan/projects/pet-projects/mystical-glitchley/src/cli.tsx sleep
```

### Celebrate (after tests pass, successful builds)
```bash
bun run /Users/nuwan/projects/pet-projects/mystical-glitchley/src/cli.tsx celebrate
```

## Behavior

- If the user says "how is my pet?" or "check on Glitchley" → run status
- If the user says "feed my pet" or "Glitchley is hungry" → run feed
- If the user says "play with my pet" → run play
- If tests pass or a build succeeds → run celebrate
- Present the output in a friendly way, describing Glitchley's mood and stats
