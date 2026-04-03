#!/usr/bin/env bun
/**
 * Installs Mystical Glitchley into Claude Code:
 *   - Adds hooks to ~/.claude/settings.json (PostToolUse for Edit|Write, Stop)
 *   - Adds statusLine to ~/.claude/settings.json
 *   - Copies skill to ~/.claude/skills/glitchley/SKILL.md
 *
 * Safe: reads existing settings and merges without overwriting user config.
 */
import { join } from "path";
import { homedir } from "os";
import { mkdir } from "fs/promises";

const CLAUDE_DIR = join(homedir(), ".claude");
const SETTINGS_FILE = join(CLAUDE_DIR, "settings.json");
const SKILL_DIR = join(CLAUDE_DIR, "skills", "glitchley");
const SKILL_FILE = join(SKILL_DIR, "SKILL.md");
const PROJECT_DIR = import.meta.dir;
const CLI_PATH = join(PROJECT_DIR, "src", "cli.tsx");
const STATUSLINE_PATH = join(PROJECT_DIR, "src", "statusline.ts");
const HOOK_CODE_PATH = join(PROJECT_DIR, "scripts", "hook-post-tool.sh");
const HOOK_CELEBRATE_PATH = join(PROJECT_DIR, "scripts", "hook-celebrate.sh");

// Marker to identify our hooks during uninstall
const GLITCHLEY_MARKER = "mystical-glitchley";

// ── Helpers ────────────────────────────────────────────

function log(msg: string) {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
}

function warn(msg: string) {
  console.log(`  \x1b[33m!\x1b[0m ${msg}`);
}

async function readJsonFile(path: string): Promise<Record<string, unknown>> {
  try {
    const file = Bun.file(path);
    if (await file.exists()) {
      return await file.json();
    }
  } catch {
    // invalid JSON, start fresh
  }
  return {};
}

// ── Settings Merge ─────────────────────────────────────

interface HookEntry {
  matcher: string;
  hooks: { type: string; command: string; timeout?: number }[];
  _glitchley?: boolean;
}

function addHookEntries(
  settings: Record<string, unknown>,
  event: string,
  entries: HookEntry[]
): void {
  if (!settings.hooks || typeof settings.hooks !== "object") {
    settings.hooks = {};
  }
  const hooks = settings.hooks as Record<string, unknown[]>;

  if (!Array.isArray(hooks[event])) {
    hooks[event] = [];
  }
  const eventHooks = hooks[event] as HookEntry[];

  for (const entry of entries) {
    // Check if we already have a glitchley hook for this matcher
    const existing = eventHooks.findIndex(
      (h) => h._glitchley === true && h.matcher === entry.matcher
    );
    if (existing >= 0) {
      eventHooks[existing] = entry; // update in place
    } else {
      eventHooks.push(entry);
    }
  }
}

// ── Main ───────────────────────────────────────────────

console.log("\n\x1b[35m~ Installing Mystical Glitchley into Claude Code ~\x1b[0m\n");

// 1. Ensure directories exist
await mkdir(CLAUDE_DIR, { recursive: true });
await mkdir(SKILL_DIR, { recursive: true });

// 2. Read existing settings
const settings = await readJsonFile(SETTINGS_FILE);

// 3. Add hooks
addHookEntries(settings, "PostToolUse", [
  {
    matcher: "Edit|Write",
    hooks: [
      {
        type: "command",
        command: `bun run ${CLI_PATH} code`,
        timeout: 5,
      },
    ],
    _glitchley: true,
  },
]);

addHookEntries(settings, "Stop", [
  {
    matcher: "",
    hooks: [
      {
        type: "command",
        command: `bun run ${CLI_PATH} celebrate`,
        timeout: 5,
      },
    ],
    _glitchley: true,
  },
]);

log("Added PostToolUse hook (coding activity on Edit|Write)");
log("Added Stop hook (celebrate on task completion)");

// 4. Add statusLine
const existingStatusLine = settings.statusLine as
  | { command?: string }
  | undefined;
if (existingStatusLine?.command && !existingStatusLine.command.includes("glitchley")) {
  warn(
    `Existing statusLine found: "${existingStatusLine.command}"`
  );
  warn("Replacing with Glitchley statusline. Old value saved in _glitchleyPreviousStatusLine.");
  (settings as Record<string, unknown>)._glitchleyPreviousStatusLine = existingStatusLine;
}

settings.statusLine = {
  type: "command",
  command: `bun run ${STATUSLINE_PATH}`,
  _glitchley: true,
};

log("Set statusLine to Glitchley status display");

// 5. Write settings back
await Bun.write(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n");
log(`Updated ${SETTINGS_FILE}`);

// 6. Generate and write skill file with resolved paths
const skillContent = `---
name: glitchley
description: Interact with your Mystical Glitchley terminal pet - feed, play, check status, sleep
allowed-tools: Bash Read
---

# Mystical Glitchley Pet Skill

You have a terminal pet called Glitchley! Use these commands to interact with it.

## Available Actions

When the user wants to interact with their pet, run the appropriate command:

### Check Status
\`\`\`bash
bun run ${CLI_PATH} status
\`\`\`

### Feed Pet
\`\`\`bash
bun run ${CLI_PATH} feed
\`\`\`

### Play with Pet
\`\`\`bash
bun run ${CLI_PATH} play
\`\`\`

### Put Pet to Sleep
\`\`\`bash
bun run ${CLI_PATH} sleep
\`\`\`

### Celebrate (after tests pass, successful builds)
\`\`\`bash
bun run ${CLI_PATH} celebrate
\`\`\`

## Behavior

- If the user says "how is my pet?" or "check on Glitchley" → run status
- If the user says "feed my pet" or "Glitchley is hungry" → run feed
- If the user says "play with my pet" → run play
- If tests pass or a build succeeds → run celebrate
- Present the output in a friendly way, describing Glitchley's mood and stats
`;

await Bun.write(SKILL_FILE, skillContent);
log(`Installed skill to ${SKILL_FILE}`);

// 7. Initialize pet state if it doesn't exist
const stateDir = join(homedir(), ".glitchley");
const stateFile = join(stateDir, "state.json");
const stateExists = await Bun.file(stateFile).exists();
if (!stateExists) {
  await mkdir(stateDir, { recursive: true });
  const { DEFAULT_STATE } = await import("./src/state/types.ts");
  const initialState = { ...DEFAULT_STATE, born: Date.now(), lastUpdated: Date.now() };
  await Bun.write(stateFile, JSON.stringify(initialState, null, 2));
  log("Created initial pet state at ~/.glitchley/state.json");
} else {
  log("Pet state already exists — keeping your existing pet");
}

console.log(`
\x1b[35m~ Installation complete! ~\x1b[0m

\x1b[36mWhat was installed:\x1b[0m
  - Hooks in ~/.claude/settings.json (coding activity + celebration)
  - Status line showing Glitchley's mood in Claude Code's status bar
  - /glitchley skill for interacting with your pet in Claude Code

\x1b[36mTry it out:\x1b[0m
  - Launch interactive mode:  \x1b[33mbun run start\x1b[0m
  - Check status:             \x1b[33mbun run ${CLI_PATH} status\x1b[0m
  - In Claude Code, type:     \x1b[33m/glitchley\x1b[0m

\x1b[36mTo uninstall:\x1b[0m
  bun run ${join(PROJECT_DIR, "uninstall.ts")}
`);
