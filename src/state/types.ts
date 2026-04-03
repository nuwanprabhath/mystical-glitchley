export type PetMood = "ecstatic" | "happy" | "neutral" | "hungry" | "tired" | "sad" | "sleeping" | "dead";

export type PetStage = "egg" | "baby" | "teen" | "adult" | "elder" | "mythical";

export type PetAction = "idle" | "eating" | "playing" | "sleeping" | "celebrating" | "coding" | "hatching";

export interface PetStats {
  hunger: number;    // 0-100, higher = more hungry (bad)
  happiness: number; // 0-100, higher = happier (good)
  energy: number;    // 0-100, higher = more energetic (good)
  xp: number;        // total XP earned
}

export interface PetState {
  name: string;
  stage: PetStage;
  stats: PetStats;
  mood: PetMood;
  currentAction: PetAction;
  actionUntil: number; // timestamp when action animation ends
  born: number;        // timestamp
  lastUpdated: number; // timestamp
  lastFed: number;
  lastPlayed: number;
  totalEdits: number;
  totalCommits: number;
  totalSessions: number;
  evolutionHistory: PetStage[];
}

export const STAGE_XP_THRESHOLDS: Record<PetStage, number> = {
  egg: 0,
  baby: 50,
  teen: 200,
  adult: 500,
  elder: 1200,
  mythical: 3000,
};

export const DEFAULT_STATE: PetState = {
  name: "Glitchley",
  stage: "egg",
  stats: {
    hunger: 30,
    happiness: 70,
    energy: 80,
    xp: 0,
  },
  mood: "happy",
  currentAction: "idle",
  actionUntil: 0,
  born: Date.now(),
  lastUpdated: Date.now(),
  lastFed: Date.now(),
  lastPlayed: Date.now(),
  totalEdits: 0,
  totalCommits: 0,
  totalSessions: 0,
  evolutionHistory: ["egg"],
};
