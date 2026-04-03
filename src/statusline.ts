#!/usr/bin/env bun
/**
 * Claude Code statusline script.
 * Reads session JSON from stdin, outputs pet status for the status bar.
 *
 * Configure in ~/.claude/settings.json:
 *   "statusline": "bun /path/to/mystical-glitchley/src/statusline.ts"
 */
import { loadState } from "./state/pet-state.ts";
import { tick } from "./engine/game-loop.ts";

const state = tick(await loadState());

const moodFaces: Record<string, string> = {
  ecstatic: "/\\_/\\ (^w^)",
  happy: "/\\_/\\ (^.^)",
  neutral: "/\\_/\\ (o.o)",
  hungry: "/\\_/\\ (;.;)",
  tired: "/\\_/\\ (-.-)z",
  sad: "/\\_/\\ (T.T)",
  sleeping: "/\\_/\\ (-.-)Z",
  dead: "/\\_/\\ (x.x)",
};

const face = moodFaces[state.mood] ?? "/\\_/\\ (o.o)";
const satiation = Math.round(100 - state.stats.hunger);

// Compact single-line output for statusline
console.log(`${face} ${state.name} [${state.stage}] Sat:${satiation}% Hap:${Math.round(state.stats.happiness)}% Eng:${Math.round(state.stats.energy)}%`);
