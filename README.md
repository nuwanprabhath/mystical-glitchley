```
                         ~ Mystical Glitchley ~
                         Your terminal companion

                              /\_/\
                             ( ^.^ )
                              > ~ <
                             /|   |\
                             ~     ~
```

# Mystical Glitchley

A Tamagotchi-style virtual pet that lives inside your terminal and integrates with [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Built with [Bun](https://bun.sh), [Ink](https://github.com/vadimdemedes/ink) (React for CLIs), and TypeScript.

Glitchley reacts to your coding activity, evolves over time, and needs your care to stay happy and healthy.

## What It Does

**Interactive TUI** with animated ASCII art, stat bars, and keyboard controls:

```
                          ~ Mystical Glitchley ~
                          Your terminal companion
                                    ___
                                   /   \
                                  | ~~~ |
                                  | ~~~ |
                                   \___/
                    ┌────────────────────────────────┐
                    │ Glitchley         EGG | 0m old │
                    │ Hunger   ██████████████░  95%  │
                    │ Happy    ███████████████  100% │
                    │ Energy   ███████████░░░░  70%  │
                    │ XP       15  | Mood:  ecstatic │
                    └────────────────────────────────┘
                      [F]eed  [P]lay  [S]leep  [Q]uit
```

**Claude Code integration** so your pet reacts to real coding work:

```
/\_/\ (^w^) Glitchley [adult] Sat:85% Hap:92% Eng:67%
```

### Features

- **6 evolution stages** — egg, baby, teen, adult, elder, mythical (XP-based progression)
- **Animated ASCII art** — 2-frame animations at 500ms per stage and mood, with unique sprites
- **3 core stats** — hunger (decays up), happiness (decays down), energy (decays down)
- **Mood system** — ecstatic / happy / neutral / hungry / tired / sad / sleeping / dead
- **Persistent state** — saved to `~/.glitchley/state.json`, survives across sessions
- **Claude Code hooks** — earns XP when Claude edits files, celebrates when tasks finish
- **Status line** — shows Glitchley's face and stats in Claude Code's status bar
- **Skill command** — `/glitchley` to interact with your pet mid-session

### Pet Stages

```
  Egg         Baby        Teen         Adult        Elder       Mythical
  ___        /\_/\       /\_/\        /\_/\      ~~/\_/\~~   .  *  .  *
 /   \      ( o.o )     ( o.o )      ( o.o )      ( o.o )   * /\_/\  .
| ~~~ |      > ^ <      />   <\      /> ~ <\    ~~> ~ <~~    ( @.@ ) *
| ~~~ |     /|   |\    / |   | \    / |   | \    /  |_|  \  */ > ~ <\  .
 \___/      ~     ~    \_|   |_/   /__|   |__\  / / | | \ \  / \|||/ \
                         |_ _|        |   |     \_\_|_|_/_/ /__\|||/__\
                                      |___|        /   \     * \|_|/  *
                                                  ~     ~    . /|\ .
```

## Quick Start

```bash
# Install dependencies
bun install

# Launch interactive pet
bun run start

# Or use CLI subcommands
bun run src/cli.tsx status      # One-line status check
bun run src/cli.tsx feed        # Feed your pet
bun run src/cli.tsx play        # Play with your pet (+XP)
bun run src/cli.tsx sleep       # Put your pet to sleep
bun run src/cli.tsx celebrate   # Celebrate! (+XP)
bun run src/cli.tsx help        # Show all commands
```

### Interactive Controls

| Key | Action |
|-----|--------|
| `F` | Feed — reduces hunger, boosts happiness |
| `P` | Play — boosts happiness and XP, costs energy |
| `S` | Sleep — restores energy |
| `Q` | Quit — saves state and exits |

## Claude Code Integration

### One-Command Install

```bash
bun run install-claude
```

This safely merges into your existing `~/.claude/settings.json` without overwriting anything. It adds:

| Component | What it does |
|-----------|-------------|
| **PostToolUse hook** | Gives Glitchley XP when Claude edits or writes files |
| **Stop hook** | Glitchley celebrates when Claude finishes a task |
| **Status line** | Shows Glitchley's face and stats in the Claude Code status bar |
| **`/glitchley` skill** | Interact with your pet mid-session (feed, play, status) |

If you already have a status line configured, the installer backs it up and restores it on uninstall.

### Uninstall

```bash
# Remove Claude Code integration (keeps your pet's save data)
bun run uninstall-claude

# Remove everything including pet state
bun run uninstall-claude:purge
```

### Manual Setup

See [claude-code/setup-instructions.md](claude-code/setup-instructions.md) for step-by-step manual configuration.

## How the Pet Works

### Stat Decay

Stats change over time (per minute):
- **Hunger** increases by 1.5 per minute
- **Happiness** decreases by 0.8 per minute
- **Energy** decreases by 0.5 per minute
- Sleeping restores 3 energy per minute

### Evolution

Glitchley evolves based on total XP earned:

| Stage | XP Required |
|-------|-------------|
| Egg | 0 |
| Baby | 50 |
| Teen | 200 |
| Adult | 500 |
| Elder | 1,200 |
| Mythical | 3,000 |

XP is earned by feeding (+5), playing (+10), celebrating (+20), and coding activity (+3 per edit).

### Mood Derivation

Mood is automatically derived from stats:

| Mood | Condition |
|------|-----------|
| Dead | hunger >= 90, happiness <= 10, energy <= 10 |
| Sleeping | currently sleeping |
| Ecstatic | happiness >= 80, hunger <= 30 |
| Happy | happiness >= 50, hunger <= 50 |
| Hungry | hunger >= 70 |
| Tired | energy <= 20 |
| Sad | happiness <= 25 |
| Neutral | everything else |

## Project Structure

```
mystical-glitchley/
├── src/
│   ├── cli.tsx              # CLI entry point + subcommands
│   ├── app.tsx              # Main Ink app (interactive TUI)
│   ├── statusline.ts        # Claude Code status line script
│   ├── components/
│   │   ├── Pet.tsx          # Animated pet display
│   │   ├── Stats.tsx        # Stat bars and info
│   │   ├── Menu.tsx         # Keyboard controls
│   │   ├── Header.tsx       # Title banner
│   │   └── Notification.tsx # Timed event messages
│   ├── art/
│   │   └── frames.ts       # ASCII art frames (all stages + moods)
│   ├── state/
│   │   ├── types.ts         # TypeScript types + defaults
│   │   └── pet-state.ts     # Load/save JSON persistence
│   └── engine/
│       └── game-loop.ts     # Tick logic, stat decay, evolution
├── scripts/
│   ├── hook-post-tool.sh    # Claude Code PostToolUse hook
│   └── hook-celebrate.sh    # Claude Code celebration hook
├── claude-code/
│   ├── setup-instructions.md
│   └── skills/pet/SKILL.md
├── install.ts               # One-command Claude Code install
├── uninstall.ts             # Clean uninstall
└── package.json
```

## Tech Stack

- **[Bun](https://bun.sh)** — runtime, package manager, script runner
- **[Ink](https://github.com/vadimdemedes/ink)** — React for interactive CLI apps
- **[React](https://react.dev)** — component model for the TUI
- **TypeScript** — type safety throughout

## License

MIT
