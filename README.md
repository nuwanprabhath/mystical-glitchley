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

Glitchley is not just a static pet — it acts on its own, learns new behaviors over time, evolves beyond its known forms, and slowly develops a unique personality shaped by what it experiences.

## What It Does

**Interactive TUI** with animated ASCII art, stat bars, and keyboard controls:

```
                          ~ Mystical Glitchley ~
                          Your terminal companion
                                   /\_/\
                                  ( ^.^ )
                                   > ~ <
                                  \|   |/
                                   ~   ~
                    ┌──────────────────────────────────┐
                    │ Glitchley        BABY | 1h 28m old│
                    │ Hunger   ███████████░░░░   76%    │
                    │ Happy    ████████████░░░   82%    │
                    │ Energy   ██████████████░   93%    │
                    │ XP       128  | Mood:  ecstatic   │
                    │ Traits   curious, playful         │
                    └──────────────────────────────────┘
              [F]eed  [P]lay  [S]leep  [C]hat  [Q]uit
```

**Live action animations** — the pet's ASCII art changes to match what it's doing:

```
  Stargazing       Zoomies        Meditation      Bug Hunting
   . * .                           ~ ~ ~             .
  /\_/\          /\_/\~~          /\_/\           /\_/\
 ( o.o )~       ( >.< )          ( -.- )         ( O.O )!
  > ^ <          > ~ < =          /| |\            > ^ <
  |   |          /| |\           \___/            _/| |\

  Nesting         Singing        Stretching      Tail Chasing
 _______          ♪  ♫  ♪                        ,-----,
/  /\_/\         /\_/\          \  /\_/\         /\_/\  )
| ( u.u )       ( ^.^ )♪         ( o.o )        ( >.< ~~~
|  > ^ <         > ~ <          /=>   <=         \___/  )
\__/| |\__       /| |\          /  | |  \          ~~~~~
```

**Claude Code status bar** — Glitchley's mood at a glance after every response:

```
/\_/\ (^w^) Glitchley [adult] Sat:85% Hap:92% Eng:67%
```

**Chat mode** — talk directly to your pet (requires Claude Code):

Press `[C]` to open a chat panel where Glitchley responds in character, aware of its current mood, stage, and personality.

---

## Features

- **7 evolution stages** — egg → baby → teen → adult → elder → mythical → transcended
- **Unique animated ASCII art** per stage, mood, and action — 2-frame animations at 500ms
- **10 built-in autonomous actions** that trigger based on mood, stats, time of day, and idle time
- **Action learning** — Glitchley learns brand-new behaviors over time (via Claude or local generation)
- **Personality drift** — traits, quirks, and catchphrases evolve based on experiences
- **Dynamic evolution** — beyond mythical, Glitchley transcends into entirely new forms with generated ASCII art
- **Memory system** — the pet remembers significant events across sessions
- **3 core stats** — hunger, happiness, energy — all decay over time
- **Mood system** — 8 moods derived from stats, each with its own expression
- **Persistent state** — saved to `~/.glitchley/state.json`, survives across sessions
- **Claude Code hooks** — earns XP when Claude edits files, celebrates when tasks finish
- **Status line** — live pet face and stats in the Claude Code status bar
- **`/glitchley` skill** — interact with your pet mid-session in Claude Code

---

## Quick Start

```bash
# Install dependencies
bun install

# Launch interactive pet
bun run start

# CLI subcommands (usable from hooks, scripts, etc.)
bun run src/cli.tsx status      # One-line status check
bun run src/cli.tsx feed        # Feed your pet
bun run src/cli.tsx play        # Play with your pet (+XP)
bun run src/cli.tsx sleep       # Put your pet to sleep
bun run src/cli.tsx celebrate   # Celebrate! (+XP, triggers on task completion)
bun run src/cli.tsx help        # Show all commands
```

### Interactive Controls

| Key | Action |
|-----|--------|
| `F` | Feed — reduces hunger, boosts happiness |
| `P` | Play — boosts happiness and XP, costs energy |
| `S` | Sleep — restores energy |
| `C` | Chat — open chat panel (requires Claude Code) |
| `Q` | Quit — saves state and exits |

---

## Claude Code Integration

### One-Command Install

```bash
bun run install-claude
```

Safely merges into your existing `~/.claude/settings.json` without overwriting anything:

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

---

## How the Pet Works

### Stat Decay

Stats change over time (per minute):

| Stat | Change |
|------|--------|
| Hunger | +1.5 per minute |
| Happiness | −0.8 per minute |
| Energy | −0.5 per minute |
| Energy (sleeping) | +3.0 per minute |

### Mood System

Mood is derived automatically from stats:

| Mood | Condition |
|------|-----------|
| Dead | hunger ≥ 90, happiness ≤ 10, energy ≤ 10 |
| Sleeping | currently sleeping |
| Ecstatic | happiness ≥ 80, hunger ≤ 30 |
| Happy | happiness ≥ 50, hunger ≤ 50 |
| Hungry | hunger ≥ 70 |
| Tired | energy ≤ 20 |
| Sad | happiness ≤ 25 |
| Neutral | everything else |

### XP Sources

| Action | XP Gained |
|--------|-----------|
| Feeding | +5 |
| Playing | +10 |
| Celebrating | +20 |
| Coding activity (per edit) | +3 |
| Chatting | +2 |
| Autonomous actions | +1–5 |

---

## Evolution

### Stages 1–6: Fixed Progression

Glitchley passes through six fixed stages based on total XP:

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

| Stage | XP Required |
|-------|-------------|
| Egg | 0 |
| Baby | 50 |
| Teen | 200 |
| Adult | 500 |
| Elder | 1,200 |
| Mythical | 3,000 |

### Stage 7+: Transcended — Dynamic Forms

At **5,000 XP**, Glitchley transcends into a completely unique form. Every transcendence after that requires more XP and produces a new form:

- **With Claude Code**: Claude generates the form's name, description, ASCII art, color, and personality traits fresh each time
- **Without Claude Code**: Forms are procedurally assembled from a pool of body parts, auras, and trait words

Each new form **raises the XP threshold** for the next one (+2,000 + 500 per existing form), so evolution keeps going indefinitely. Example generated forms:

```
  ~ Ethereal Pulse ~          ~ Quantum Weaver ~
    . * . * .                  .* .* .* .*
   { /^\ /^\ }                */\_/\*  .
   |~| * | * |~|               ( >@< )  *
   | \_o_o_o_/ |               /> ~ <\  .
   |~|  <w>  |~               / \|||/ \
    \  |||||  /             /__\|||/__\
     \ ===== /                .\\|_|/*.
      ~*~*~*~                  * /|\ *
```

New form traits are merged into the pet's personality, so each evolution changes how Glitchley thinks and speaks.

---

## Autonomy & Behavior

Glitchley acts on its own every ~12 seconds, choosing from actions whose trigger conditions are met.

### Built-in Actions

| Action | Trigger | What happens |
|--------|---------|-------------|
| `stargazing` | After 20:00 or before 04:00 | Gazes upward with twinkling stars |
| `zoomies` | Energy > 80 | Sprints around chaotically |
| `meditation` | Idle for 20+ seconds | Sits in a calm trance |
| `bug_hunting` | Random (25%) | Spots something and pounces |
| `nesting` | Energy < 30 | Curls into a cozy box |
| `singing` | Mood: ecstatic | Musical notes float around |
| `brooding` | Mood: sad | Stares quietly into the void |
| `stretching` | Idle for 10+ seconds | Flings arms wide open |
| `tail_chasing` | Random (20%) | Spins in circles |
| `code_review` | Shortly after coding | Squints at an imaginary monitor |

Each action has its own unique 2-frame ASCII animation and stat effect.

### Action Learning

Over time, Glitchley **learns new actions** it has never performed before:

- **~5% chance per autonomy tick** of learning something new (up to 20 learned actions)
- **With Claude Code**: Claude invents a completely novel action matching the pet's current personality and stage — new name, trigger, stat effect, and notification text
- **Without Claude Code**: Unlocks actions from a built-in template pool in a new order

Less-performed actions are weighted higher so the pet keeps trying new things rather than repeating favorites.

---

## Personality Drift

Every ~10 minutes, Glitchley's personality quietly shifts based on what it has experienced:

- **With Claude Code**: Claude reads recent memories and suggests a new quirk, an updated catchphrase, or a new preference that fits what the pet has been doing
- **Without Claude Code**: Randomly gains quirks and catchphrases from a local pool

Personality is visible in the **Traits** row of the stats panel and shapes how Glitchley responds in chat mode.

Example traits that develop over time: `curious`, `mischievous`, `dreams in hexadecimal`, `afraid of infinite loops`, `collects semicolons`, `naps on warm CPUs`.

---

## Memory System

Glitchley maintains a log of up to 50 significant memories:

- Actions performed and how it felt at the time
- Evolution events
- New abilities learned
- Personality growth moments

Memories feed into personality evolution and chat context, so conversations feel grounded in what the pet has actually experienced.

---

## Project Structure

```
mystical-glitchley/
├── src/
│   ├── cli.tsx                  # CLI entry point + subcommands
│   ├── app.tsx                  # Main Ink app (interactive TUI)
│   ├── statusline.ts            # Claude Code status line script
│   ├── components/
│   │   ├── Pet.tsx              # Animated pet display (dynamic form aware)
│   │   ├── Stats.tsx            # Stat bars, traits, active action
│   │   ├── Menu.tsx             # Keyboard controls
│   │   ├── Header.tsx           # Title banner
│   │   ├── Notification.tsx     # Timed event messages
│   │   ├── ChatHistory.tsx      # Chat message log
│   │   └── ChatInput.tsx        # Chat text input
│   ├── art/
│   │   └── frames.ts            # ASCII art frames + dynamic form renderer
│   ├── state/
│   │   ├── types.ts             # TypeScript types, defaults, interfaces
│   │   └── pet-state.ts         # Load/save JSON persistence
│   └── engine/
│       ├── game-loop.ts         # Tick logic, stat decay, stage transitions
│       ├── actions.ts           # Action registry + learning system
│       ├── autonomy.ts          # Autonomous behavior + personality evolution
│       ├── evolution.ts         # Dynamic form generation (Claude + local)
│       └── chat.ts              # Claude CLI integration for chat + detection
├── scripts/
│   ├── hook-post-tool.sh        # Claude Code PostToolUse hook
│   └── hook-celebrate.sh        # Claude Code Stop hook
├── claude-code/
│   ├── setup-instructions.md
│   └── skills/pet/SKILL.md
├── install.ts                   # One-command Claude Code install
├── uninstall.ts                 # Clean uninstall (--purge to delete save data)
└── package.json
```

---

## Tech Stack

- **[Bun](https://bun.sh)** — runtime, package manager, script runner
- **[Ink](https://github.com/vadimdemedes/ink)** — React for interactive CLI apps
- **[React](https://react.dev)** — component model for the TUI
- **TypeScript** — strict types throughout

---

## License

MIT
