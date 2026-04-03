/**
 * Action Registry & Learning System
 *
 * Manages built-in and learned actions the pet can perform.
 * Actions can be learned via Claude or through local generation.
 */
import type { PetState, LearnedAction, ActionTrigger, ActionEffect, Memory } from "../state/types.ts";
import { isClaudeAvailable } from "./chat.ts";

// ── Built-in Action Templates ──────────────────────────

const LOCAL_ACTION_TEMPLATES: Omit<LearnedAction, "id" | "learnedAt" | "timesPerformed" | "source">[] = [
  {
    name: "stargazing",
    description: "Gazes at imaginary stars in the terminal ceiling",
    trigger: { type: "time_of_day", condition: "hour:20-4" },
    effect: { happiness: 5, energy: -2, xp: 1, duration: 4000, message: "is stargazing... *twinkle*" },
    asciiFrames: [
      ["   . * .  ", "  /\\_/\\   ", " ( o.o )~ ", "  > ^ <   ", "  |   |   "],
      ["  * . *   ", "  /\\_/\\   ", " ~( o.o ) ", "   > ^ <  ", "   |   |  "],
    ],
  },
  {
    name: "zoomies",
    description: "Gets a burst of chaotic energy and runs around",
    trigger: { type: "stat_threshold", condition: "energy>80" },
    effect: { happiness: 10, energy: -15, xp: 3, duration: 3000, message: "got the ZOOMIES! Nyoooom!" },
    asciiFrames: [
      ["         ", " /\\_/\\~~ ", "( >.< )  ", " > ~ < = ", " /| |\\   "],
      ["         ", "~~/\\_/\\  ", "  ( >.< )", " = > ~ < ", "   /| |\\ "],
    ],
  },
  {
    name: "meditation",
    description: "Enters a peaceful meditative state",
    trigger: { type: "idle_duration", condition: "idle:20" },
    effect: { happiness: 8, energy: 5, hunger: -3, xp: 5, duration: 6000, message: "enters deep meditation... om..." },
    asciiFrames: [
      ["  ~ ~ ~   ", "  /\\_/\\   ", " ( -.- )  ", "  /| |\\   ", "  \\___/   "],
      [" ~ ~ ~ ~  ", "  /\\_/\\   ", " ( -.- )  ", "  /| |\\   ", "  \\___/   "],
    ],
  },
  {
    name: "bug_hunting",
    description: "Spots an imaginary bug and pounces",
    trigger: { type: "random", condition: "random:0.25" },
    effect: { happiness: 12, energy: -8, xp: 4, duration: 3000, message: "spotted a bug! *pounce*" },
    asciiFrames: [
      ["     .    ", "  /\\_/\\   ", " ( O.O )! ", "  > ^ <   ", " _/| |\\   "],
      ["          ", "  /\\_/\\   ", " ( >.< )  ", "  />~<\\   ", "  _|_|_   "],
    ],
  },
  {
    name: "nesting",
    description: "Arranges its digital space and gets cozy",
    trigger: { type: "stat_threshold", condition: "energy<30" },
    effect: { energy: 10, happiness: 5, xp: 2, duration: 5000, message: "is nesting... making a cozy spot" },
    asciiFrames: [
      [" _______  ", "/  /\\_/\\  ", "| ( u.u ) ", "|  > ^ <  ", "\\__/| |\\__"],
      [" _______  ", "/  /\\_/\\  ", "| ( -.- ) ", "|  > _ <  ", "\\__/| |\\__"],
    ],
  },
  {
    name: "singing",
    description: "Hums a little digital melody",
    trigger: { type: "mood", condition: "mood:ecstatic" },
    effect: { happiness: 5, xp: 2, duration: 3000, message: "hums a glitchy little tune~ La la la~" },
    asciiFrames: [
      [" ♪  ♫  ♪  ", "  /\\_/\\   ", " ( ^.^ )♪ ", "  > ~ <   ", "  /| |\\   "],
      [" ♫  ♪  ♫  ", "  /\\_/\\   ", " ♪( ^.^ ) ", "  > ~ <   ", "  /| |\\   "],
    ],
  },
  {
    name: "brooding",
    description: "Stares into the void pensively",
    trigger: { type: "mood", condition: "mood:sad" },
    effect: { happiness: 3, xp: 1, duration: 4000, message: "stares into the void... *existential purr*" },
    asciiFrames: [
      ["          ", "  /\\_/\\   ", " ( -_- )  ", "  > . <   ", "  /| |\\   "],
      ["    .     ", "  /\\_/\\   ", " ( -_- ). ", "  > . <   ", "  /| |\\   "],
    ],
  },
  {
    name: "stretching",
    description: "Does a big stretch after being idle",
    trigger: { type: "idle_duration", condition: "idle:10" },
    effect: { energy: 3, happiness: 2, xp: 1, duration: 2000, message: "does a big stretch~ s-t-r-e-t-c-h" },
    asciiFrames: [
      ["          ", " \\  /\\_/\\ ", "  ( o.o ) ", " /=>   <= ", " /  | |  \\"],
      ["          ", "\\   /\\_/\\ ", "  ( o.o ) ", "/==>   <==", "/   | |   "],
    ],
  },
  {
    name: "tail_chasing",
    description: "Chases its own tail in circles",
    trigger: { type: "random", condition: "random:0.20" },
    effect: { happiness: 8, energy: -5, xp: 2, duration: 3000, message: "is chasing its tail! Round and round!" },
    asciiFrames: [
      [" ,-----,  ", " /\\_/\\  ) ", "( >.< ~~~ ", " \\___/  ) ", "  ~~~~~   "],
      [" ,-----,  ", "(  /\\_/\\ ", "~~~( >.< )", "(  \\___/  ", "  ~~~~~   "],
    ],
  },
  {
    name: "code_review",
    description: "Pretends to review your code with a critical eye",
    trigger: { type: "context", condition: "after_coding" },
    effect: { happiness: 5, xp: 3, duration: 3000, message: "squints at your code... *nods approvingly*" },
    asciiFrames: [
      [" _______  ", "| /\\_/\\ | ", "|(  -.- )| ", "| > ^ < | ", "|_______|  "],
      [" _______  ", "| /\\_/\\ | ", "|(  o.o )| ", "| > ^ < | ", "|_______|  "],
    ],
  },
];

// ── Claude Action Learning ─────────────────────────────

async function learnActionFromClaude(state: PetState): Promise<LearnedAction | null> {
  const { resolveClaudePath } = await import("./chat.ts");
  const claudePath = await resolveClaudePath();
  if (!claudePath) return null;

  const existingActions = [...LOCAL_ACTION_TEMPLATES.map(a => a.name), ...state.learnedActions.map(a => a.name)];

  const prompt = `Invent ONE new unique action/behavior for a mystical terminal pet cat-spirit called "${state.name}".

The pet already knows these actions: ${existingActions.join(", ")}

Pet personality: ${state.personality.traits.join(", ")}
Pet quirks: ${state.personality.quirks.join(", ")}
Pet stage: ${state.stage}
Pet mood: ${state.mood}

Create something the pet has NEVER done before. Be creative — mix coding culture with cat behavior and mystical elements.

Respond in EXACTLY this JSON format (no markdown, no explanation, ONLY valid JSON):

{
  "name": "<snake_case_name>",
  "description": "<one sentence>",
  "trigger_type": "<one of: mood, stat_threshold, random, time_of_day, idle_duration>",
  "trigger_condition": "<e.g. mood:happy, hunger>60, random:0.07, hour:12-14, idle:90>",
  "happiness_delta": <number -10 to 15>,
  "energy_delta": <number -15 to 10>,
  "hunger_delta": <number -5 to 5>,
  "xp_delta": <number 1 to 5>,
  "duration_ms": <number 2000 to 6000>,
  "message": "<what to display, written as: does/is/says something, in third person without the pet name>"
}`;

  try {
    const proc = Bun.spawn(
      [claudePath, "-p", prompt, "--output-format", "text", "--model", "haiku"],
      {
        stdout: "pipe",
        stderr: "pipe",
        env: {
          ...process.env,
          PATH: `${process.env.PATH ?? ""}:/usr/local/bin:/opt/homebrew/bin`,
        },
      }
    );

    const output = await new Response(proc.stdout).text();
    await proc.exited;
    if (proc.exitCode !== 0) return null;

    const jsonStr = output.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(jsonStr);

    return {
      id: `learned-${Date.now()}`,
      name: data.name ?? "mystery_action",
      description: data.description ?? "Does something mysterious",
      trigger: {
        type: data.trigger_type ?? "random",
        condition: data.trigger_condition ?? "random:0.05",
      },
      effect: {
        happiness: data.happiness_delta ?? 3,
        energy: data.energy_delta ?? 0,
        hunger: data.hunger_delta ?? 0,
        xp: data.xp_delta ?? 1,
        duration: data.duration_ms ?? 3000,
        message: data.message ?? "does something mysterious...",
      },
      learnedAt: Date.now(),
      timesPerformed: 0,
      source: "claude",
    };
  } catch {
    return null;
  }
}

function learnActionLocally(state: PetState): LearnedAction | null {
  const knownNames = new Set([
    ...LOCAL_ACTION_TEMPLATES.map(a => a.name),
    ...state.learnedActions.map(a => a.name),
  ]);

  // Find a template the pet doesn't know yet
  const available = LOCAL_ACTION_TEMPLATES.filter(a => !knownNames.has(a.name));
  if (available.length === 0) return null;

  const template = available[Math.floor(Math.random() * available.length)]!;

  return {
    ...template,
    id: `local-${Date.now()}`,
    learnedAt: Date.now(),
    timesPerformed: 0,
    source: "local",
  };
}

// ── Public API ─────────────────────────────────────────

/**
 * Try to learn a new action. Uses Claude if available, falls back to local templates.
 * Returns null if nothing new to learn.
 */
export async function learnNewAction(state: PetState): Promise<LearnedAction | null> {
  // Limit total learned actions to prevent state bloat
  if (state.learnedActions.length >= 20) return null;

  // Try Claude first for truly novel actions
  if (await isClaudeAvailable()) {
    const claudeAction = await learnActionFromClaude(state);
    if (claudeAction) return claudeAction;
  }

  // Fallback to local templates
  return learnActionLocally(state);
}

/**
 * Get all available actions (built-in templates + learned).
 */
export function getAllActions(state: PetState): LearnedAction[] {
  // Convert built-in templates to LearnedAction format
  const builtIns: LearnedAction[] = LOCAL_ACTION_TEMPLATES.map(t => ({
    ...t,
    id: `builtin-${t.name}`,
    learnedAt: 0,
    timesPerformed: 0,
    source: "local" as const,
  }));

  return [...builtIns, ...state.learnedActions];
}

/**
 * Evaluate whether an action's trigger condition is met.
 */
export function shouldTrigger(action: LearnedAction, state: PetState): boolean {
  const { type, condition } = action.trigger;

  switch (type) {
    case "mood": {
      const target = condition.replace("mood:", "");
      return state.mood === target;
    }
    case "stat_threshold": {
      const match = condition.match(/(hunger|happiness|energy|xp)\s*([<>]=?)\s*(\d+)/);
      if (!match) return false;
      const [, stat, op, val] = match;
      const value = state.stats[stat as keyof typeof state.stats] ?? 0;
      const threshold = parseInt(val!, 10);
      switch (op) {
        case ">": return value > threshold;
        case ">=": return value >= threshold;
        case "<": return value < threshold;
        case "<=": return value <= threshold;
        default: return false;
      }
    }
    case "random": {
      const prob = parseFloat(condition.replace("random:", ""));
      return Math.random() < prob;
    }
    case "time_of_day": {
      const hourMatch = condition.match(/hour:(\d+)-(\d+)/);
      if (!hourMatch) return false;
      const start = parseInt(hourMatch[1]!, 10);
      const end = parseInt(hourMatch[2]!, 10);
      const hour = new Date().getHours();
      if (start <= end) return hour >= start && hour < end;
      return hour >= start || hour < end; // wraps midnight
    }
    case "idle_duration": {
      const seconds = parseInt(condition.replace("idle:", ""), 10);
      const idleDuration = (Date.now() - state.idleSince) / 1000;
      return idleDuration >= seconds;
    }
    case "context": {
      if (condition === "after_coding" && state.currentAction === "idle") {
        // Trigger if we recently finished coding
        return (Date.now() - state.actionUntil) < 10_000 && state.totalEdits > 0;
      }
      return false;
    }
    default:
      return false;
  }
}

/**
 * Apply an action's effect to the pet state.
 */
export function applyActionEffect(state: PetState, action: LearnedAction): PetState {
  const { effect } = action;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  return {
    ...state,
    stats: {
      hunger: clamp(state.stats.hunger + (effect.hunger ?? 0), 0, 100),
      happiness: clamp(state.stats.happiness + (effect.happiness ?? 0), 0, 100),
      energy: clamp(state.stats.energy + (effect.energy ?? 0), 0, 100),
      xp: state.stats.xp + (effect.xp ?? 0),
    },
    currentAction: action.name,
    actionUntil: Date.now() + effect.duration,
  };
}

/**
 * Record a memory of performing an action.
 */
export function recordActionMemory(state: PetState, action: LearnedAction): Memory {
  return {
    id: `action-${Date.now()}`,
    event: `Performed ${action.name}: ${action.effect.message}`,
    emotion: state.mood,
    timestamp: Date.now(),
    importance: action.effect.xp ?? 1,
  };
}
