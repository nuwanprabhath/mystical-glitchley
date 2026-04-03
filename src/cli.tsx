#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { App } from "./app.tsx";

// Handle subcommands for Claude Code integration
const command = process.argv[2];

if (command === "status") {
  // Quick status output for statusline integration
  const { loadState } = await import("./state/pet-state.ts");
  const { tick, getAge } = await import("./engine/game-loop.ts");
  const state = tick(await loadState());

  const moodEmoji: Record<string, string> = {
    ecstatic: "(^w^)",
    happy: "(^.^)",
    neutral: "(o.o)",
    hungry: "(;.;)",
    tired: "(-.-)",
    sad: "(T.T)",
    sleeping: "(-.-) z",
    dead: "(x.x)",
  };

  const emoji = moodEmoji[state.mood] ?? "(o.o)";
  const satiation = Math.round(100 - state.stats.hunger);
  console.log(`${state.name} ${emoji} | ${state.stage} | Satiation:${satiation}% Happy:${Math.round(state.stats.happiness)}% Energy:${Math.round(state.stats.energy)}%`);
  process.exit(0);
}

if (command === "feed") {
  const { loadState, saveState } = await import("./state/pet-state.ts");
  const { tick, feed } = await import("./engine/game-loop.ts");
  let state = tick(await loadState());
  state = feed(state);
  await saveState(state);
  console.log(`Fed ${state.name}! Hunger: ${Math.round(state.stats.hunger)}, Happiness: ${Math.round(state.stats.happiness)}`);
  process.exit(0);
}

if (command === "play") {
  const { loadState, saveState } = await import("./state/pet-state.ts");
  const { tick, play } = await import("./engine/game-loop.ts");
  let state = tick(await loadState());
  state = play(state);
  await saveState(state);
  console.log(`Played with ${state.name}! Happiness: ${Math.round(state.stats.happiness)}, XP: ${state.stats.xp}`);
  process.exit(0);
}

if (command === "sleep") {
  const { loadState, saveState } = await import("./state/pet-state.ts");
  const { tick, sleep } = await import("./engine/game-loop.ts");
  let state = tick(await loadState());
  state = sleep(state);
  await saveState(state);
  console.log(`${state.name} is sleeping... Energy: ${Math.round(state.stats.energy)}`);
  process.exit(0);
}

if (command === "celebrate") {
  const { loadState, saveState } = await import("./state/pet-state.ts");
  const { tick, celebrate } = await import("./engine/game-loop.ts");
  let state = tick(await loadState());
  state = celebrate(state);
  await saveState(state);
  console.log(`${state.name} celebrates! Happiness: ${Math.round(state.stats.happiness)}, XP: ${state.stats.xp}`);
  process.exit(0);
}

if (command === "code") {
  const { loadState, saveState } = await import("./state/pet-state.ts");
  const { tick, codeActivity } = await import("./engine/game-loop.ts");
  let state = tick(await loadState());
  state = codeActivity(state);
  await saveState(state);
  // Silent for hook usage — just update state
  process.exit(0);
}

if (command === "help") {
  console.log(`
~ Mystical Glitchley ~
Your terminal companion

Usage:
  bun run src/cli.tsx          Launch interactive pet UI
  bun run src/cli.tsx status   Quick status (for statusline)
  bun run src/cli.tsx feed     Feed your pet
  bun run src/cli.tsx play     Play with your pet
  bun run src/cli.tsx sleep    Put your pet to sleep
  bun run src/cli.tsx celebrate  Celebrate (tests pass, etc.)
  bun run src/cli.tsx code     Log coding activity (for hooks)
  bun run src/cli.tsx help     Show this message

Interactive controls:
  [F] Feed    [P] Play    [S] Sleep    [Q] Quit
`);
  process.exit(0);
}

// Default: launch interactive UI
if (!process.stdin.isTTY) {
  console.error("Interactive mode requires a TTY. Use subcommands (status, feed, play, sleep) for non-interactive use.");
  console.error("Run: bun run src/cli.tsx help");
  process.exit(1);
}

render(<App />);
