export type PetMood = "ecstatic" | "happy" | "neutral" | "hungry" | "tired" | "sad" | "sleeping" | "dead";

export type PetStage = "egg" | "baby" | "teen" | "adult" | "elder" | "mythical" | "transcended";

export type PetAction = "idle" | "eating" | "playing" | "sleeping" | "celebrating" | "coding" | "hatching" | string;

export interface PetStats {
  hunger: number;    // 0-100, higher = more hungry (bad)
  happiness: number; // 0-100, higher = happier (good)
  energy: number;    // 0-100, higher = more energetic (good)
  xp: number;        // total XP earned
}

// ── Dynamic Form (beyond-mythical evolutions) ──────────

export interface DynamicForm {
  id: string;
  name: string;
  description: string;
  asciiFrames: string[][]; // array of frames, each frame is array of lines
  width: number;
  color: string;
  unlockedAt: number; // timestamp
  xpRequired: number;
  traits: string[];   // personality traits this form carries
}

// ── Learned Actions ────────────────────────────────────

export interface LearnedAction {
  id: string;
  name: string;
  description: string;
  trigger: ActionTrigger;
  effect: ActionEffect;
  asciiFrames?: string[][]; // optional custom animation
  learnedAt: number;
  timesPerformed: number;
  source: "claude" | "local"; // how it was learned
}

export interface ActionTrigger {
  type: "mood" | "stat_threshold" | "random" | "time_of_day" | "idle_duration" | "context";
  condition: string; // e.g. "mood:happy", "hunger>70", "random:0.1", "hour:22-6", "idle:300"
}

export interface ActionEffect {
  hunger?: number;    // delta
  happiness?: number; // delta
  energy?: number;    // delta
  xp?: number;        // delta
  duration: number;   // ms
  message: string;    // notification text
}

// ── Personality & Memory ───────────────────────────────

export interface Personality {
  traits: string[];            // e.g. ["curious", "mischievous", "wise"]
  preferences: string[];       // things the pet likes
  quirks: string[];            // unique behaviors
  catchphrase: string;         // something it says often
  lastUpdated: number;
}

export interface Memory {
  id: string;
  event: string;       // what happened
  emotion: string;     // how the pet felt
  timestamp: number;
  importance: number;  // 1-10
}

// ── Main State ─────────────────────────────────────────

export interface PetState {
  name: string;
  stage: PetStage;
  stats: PetStats;
  mood: PetMood;
  currentAction: PetAction;
  actionUntil: number;
  born: number;
  lastUpdated: number;
  lastFed: number;
  lastPlayed: number;
  totalEdits: number;
  totalCommits: number;
  totalSessions: number;
  evolutionHistory: PetStage[];

  // Dynamic evolution (beyond mythical)
  currentFormId: string | null;       // active custom form id, null = use stage default
  dynamicForms: DynamicForm[];        // unlocked custom forms
  nextEvolutionXp: number;            // XP threshold for next transcended form

  // Learned actions & autonomy
  learnedActions: LearnedAction[];
  lastAutonomousAction: number;       // timestamp
  autonomousActionCooldown: number;   // ms between autonomous actions

  // Personality & memory
  personality: Personality;
  memories: Memory[];

  // Spontaneous behavior
  idleSince: number;                  // timestamp when pet last became idle
}

export const STAGE_XP_THRESHOLDS: Record<string, number> = {
  egg: 0,
  baby: 50,
  teen: 200,
  adult: 500,
  elder: 1200,
  mythical: 3000,
  transcended: 5000,
};

export const DEFAULT_PERSONALITY: Personality = {
  traits: ["curious", "playful"],
  preferences: ["clean code", "short functions"],
  quirks: ["tilts head when confused"],
  catchphrase: "*purrs in binary*",
  lastUpdated: Date.now(),
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

  currentFormId: null,
  dynamicForms: [],
  nextEvolutionXp: 5000,

  learnedActions: [],
  lastAutonomousAction: 0,
  autonomousActionCooldown: 12_000, // 12 seconds between autonomous actions

  personality: { ...DEFAULT_PERSONALITY },
  memories: [],

  idleSince: Date.now(),
};
