import { join } from "path";
import { homedir } from "os";
import type { PetState, PetAction } from "./types.ts";
import { DEFAULT_STATE } from "./types.ts";

const STATE_DIR = join(homedir(), ".glitchley");
const STATE_FILE = join(STATE_DIR, "state.json");

export async function loadState(): Promise<PetState> {
  try {
    const file = Bun.file(STATE_FILE);
    if (await file.exists()) {
      const data = await file.json();
      return { ...DEFAULT_STATE, ...data };
    }
  } catch {
    // corrupted file, start fresh
  }
  return { ...DEFAULT_STATE, born: Date.now(), lastUpdated: Date.now() };
}

export async function saveState(state: PetState): Promise<void> {
  const file = Bun.file(STATE_DIR);
  // ensure directory
  const { mkdir } = await import("fs/promises");
  await mkdir(STATE_DIR, { recursive: true });
  await Bun.write(STATE_FILE, JSON.stringify(state, null, 2));
}

export function setAction(state: PetState, action: PetAction, durationMs: number = 3000): PetState {
  return {
    ...state,
    currentAction: action,
    actionUntil: Date.now() + durationMs,
  };
}

export function getStatePath(): string {
  return STATE_FILE;
}
