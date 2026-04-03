import type { PetState, PetMood, PetStage } from "../state/types.ts";
import { STAGE_XP_THRESHOLDS } from "../state/types.ts";

const DECAY_INTERVAL_MS = 60_000; // stats change every minute

export function tick(state: PetState): PetState {
  const now = Date.now();
  const elapsed = now - state.lastUpdated;
  const decayTicks = Math.floor(elapsed / DECAY_INTERVAL_MS);

  if (decayTicks === 0) return { ...state, mood: deriveMood(state) };

  let { hunger, happiness, energy, xp } = state.stats;

  // Stat decay per minute
  hunger = clamp(hunger + decayTicks * 1.5, 0, 100);
  happiness = clamp(happiness - decayTicks * 0.8, 0, 100);
  energy = clamp(energy - decayTicks * 0.5, 0, 100);

  // Sleeping restores energy
  if (state.currentAction === "sleeping") {
    energy = clamp(energy + decayTicks * 3, 0, 100);
  }

  const newStats = { hunger, happiness, energy, xp };
  const newStage = deriveStage(xp);

  // Clear action if duration expired
  let { currentAction, actionUntil } = state;
  if (now > actionUntil && currentAction !== "idle" && currentAction !== "sleeping") {
    currentAction = "idle";
    actionUntil = 0;
  }

  const updated: PetState = {
    ...state,
    stats: newStats,
    stage: newStage,
    currentAction,
    actionUntil,
    lastUpdated: now,
  };

  // Track evolution
  if (newStage !== state.stage && !state.evolutionHistory.includes(newStage)) {
    updated.evolutionHistory = [...state.evolutionHistory, newStage];
  }

  updated.mood = deriveMood(updated);
  return updated;
}

export function feed(state: PetState): PetState {
  return {
    ...state,
    stats: {
      ...state.stats,
      hunger: clamp(state.stats.hunger - 25, 0, 100),
      happiness: clamp(state.stats.happiness + 10, 0, 100),
      xp: state.stats.xp + 5,
    },
    lastFed: Date.now(),
    currentAction: "eating",
    actionUntil: Date.now() + 3000,
  };
}

export function play(state: PetState): PetState {
  return {
    ...state,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + 20, 0, 100),
      energy: clamp(state.stats.energy - 10, 0, 100),
      xp: state.stats.xp + 10,
    },
    lastPlayed: Date.now(),
    currentAction: "playing",
    actionUntil: Date.now() + 3000,
  };
}

export function sleep(state: PetState): PetState {
  return {
    ...state,
    stats: {
      ...state.stats,
      energy: clamp(state.stats.energy + 40, 0, 100),
    },
    currentAction: "sleeping",
    actionUntil: Date.now() + 10000,
  };
}

export function codeActivity(state: PetState): PetState {
  return {
    ...state,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + 5, 0, 100),
      xp: state.stats.xp + 3,
    },
    totalEdits: state.totalEdits + 1,
    currentAction: "coding",
    actionUntil: Date.now() + 2000,
  };
}

export function celebrate(state: PetState): PetState {
  return {
    ...state,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + 15, 0, 100),
      xp: state.stats.xp + 20,
    },
    currentAction: "celebrating",
    actionUntil: Date.now() + 4000,
  };
}

export function deriveMood(state: PetState): PetMood {
  const { hunger, happiness, energy } = state.stats;

  if (hunger >= 90 && happiness <= 10 && energy <= 10) return "dead";
  if (state.currentAction === "sleeping") return "sleeping";
  if (happiness >= 80 && hunger <= 30) return "ecstatic";
  if (happiness >= 50 && hunger <= 50) return "happy";
  if (hunger >= 70) return "hungry";
  if (energy <= 20) return "tired";
  if (happiness <= 25) return "sad";
  return "neutral";
}

export function deriveStage(xp: number): PetStage {
  if (xp >= STAGE_XP_THRESHOLDS.mythical) return "mythical";
  if (xp >= STAGE_XP_THRESHOLDS.elder) return "elder";
  if (xp >= STAGE_XP_THRESHOLDS.adult) return "adult";
  if (xp >= STAGE_XP_THRESHOLDS.teen) return "teen";
  if (xp >= STAGE_XP_THRESHOLDS.baby) return "baby";
  return "egg";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getAge(born: number): string {
  const diff = Date.now() - born;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
