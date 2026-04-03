#!/usr/bin/env bun
/**
 * Uninstalls Mystical Glitchley from Claude Code:
 *   - Removes glitchley hooks from ~/.claude/settings.json
 *   - Removes statusLine (restores previous if saved)
 *   - Removes skill from ~/.claude/skills/glitchley/
 *
 * Safe: only removes entries marked with _glitchley flag.
 * Pet state (~/.glitchley/) is preserved unless --purge is passed.
 */
import { join } from "path";
import { homedir } from "os";
import { rm } from "fs/promises";

const CLAUDE_DIR = join(homedir(), ".claude");
const SETTINGS_FILE = join(CLAUDE_DIR, "settings.json");
const SKILL_DIR = join(CLAUDE_DIR, "skills", "glitchley");
const PURGE = process.argv.includes("--purge");

// ── Helpers ────────────────────────────────────────────

function log(msg: string) {
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
}

function skip(msg: string) {
  console.log(`  \x1b[90m-\x1b[0m ${msg}`);
}

async function readJsonFile(path: string): Promise<Record<string, unknown>> {
  try {
    const file = Bun.file(path);
    if (await file.exists()) {
      return await file.json();
    }
  } catch {
    // invalid JSON
  }
  return {};
}

// ── Remove hooks ───────────────────────────────────────

function removeGlitchleyHooks(settings: Record<string, unknown>): number {
  const hooks = settings.hooks as Record<string, unknown[]> | undefined;
  if (!hooks || typeof hooks !== "object") return 0;

  let removed = 0;

  for (const event of Object.keys(hooks)) {
    const eventHooks = hooks[event];
    if (!Array.isArray(eventHooks)) continue;

    const filtered = eventHooks.filter((entry: Record<string, unknown>) => {
      if (entry._glitchley === true) {
        removed++;
        return false;
      }
      // Also match by command path as a fallback
      const innerHooks = entry.hooks as { command?: string }[] | undefined;
      if (Array.isArray(innerHooks)) {
        const hasGlitchley = innerHooks.some(
          (h) => typeof h.command === "string" && h.command.includes("glitchley")
        );
        if (hasGlitchley) {
          removed++;
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      delete hooks[event];
    } else {
      hooks[event] = filtered;
    }
  }

  // Clean up empty hooks object
  if (Object.keys(hooks).length === 0) {
    delete settings.hooks;
  }

  return removed;
}

// ── Main ───────────────────────────────────────────────

console.log("\n\x1b[35m~ Uninstalling Mystical Glitchley from Claude Code ~\x1b[0m\n");

const settingsExists = await Bun.file(SETTINGS_FILE).exists();

if (settingsExists) {
  const settings = await readJsonFile(SETTINGS_FILE);

  // 1. Remove hooks
  const removedCount = removeGlitchleyHooks(settings);
  if (removedCount > 0) {
    log(`Removed ${removedCount} hook(s) from settings`);
  } else {
    skip("No Glitchley hooks found in settings");
  }

  // 2. Remove/restore statusLine
  const statusLine = settings.statusLine as { _glitchley?: boolean; command?: string } | undefined;
  if (statusLine?._glitchley || (typeof statusLine?.command === "string" && statusLine.command.includes("glitchley"))) {
    // Restore previous statusLine if we saved one
    const previous = settings._glitchleyPreviousStatusLine;
    if (previous) {
      settings.statusLine = previous;
      delete settings._glitchleyPreviousStatusLine;
      log("Restored previous statusLine configuration");
    } else {
      delete settings.statusLine;
      log("Removed statusLine");
    }
  } else {
    skip("StatusLine is not set to Glitchley — leaving unchanged");
  }

  // Clean up backup key if statusLine was already different
  if (settings._glitchleyPreviousStatusLine) {
    delete settings._glitchleyPreviousStatusLine;
  }

  // 3. Write settings back
  await Bun.write(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n");
  log(`Updated ${SETTINGS_FILE}`);
} else {
  skip("No settings.json found — nothing to clean up");
}

// 4. Remove skill
const skillExists = await Bun.file(join(SKILL_DIR, "SKILL.md")).exists();
if (skillExists) {
  await rm(SKILL_DIR, { recursive: true, force: true });
  log(`Removed skill from ${SKILL_DIR}`);
} else {
  skip("No Glitchley skill found");
}

// 5. Optionally purge pet state
if (PURGE) {
  const stateDir = join(homedir(), ".glitchley");
  const stateExists = await Bun.file(join(stateDir, "state.json")).exists();
  if (stateExists) {
    await rm(stateDir, { recursive: true, force: true });
    log("Purged pet state (~/.glitchley/)");
  } else {
    skip("No pet state found to purge");
  }
} else {
  skip("Pet state preserved at ~/.glitchley/ (use --purge to remove)");
}

console.log(`
\x1b[35m~ Uninstall complete ~\x1b[0m

Glitchley has been removed from Claude Code.
${PURGE ? "Pet state has been deleted." : "Your pet's state is still saved at ~/.glitchley/state.json"}
${PURGE ? "" : "To also delete your pet: \x1b[33mbun run uninstall.ts --purge\x1b[0m"}
To reinstall: \x1b[33mbun run install.ts\x1b[0m
`);
