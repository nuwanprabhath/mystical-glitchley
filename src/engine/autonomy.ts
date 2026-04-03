/**
 * Autonomy Engine
 *
 * Gives Glitchley agency — it spontaneously performs actions,
 * learns new behaviors, evolves, and develops personality over time.
 * This is the "brain" that makes the pet feel alive.
 */
import type { PetState, Memory } from "../state/types.ts";
import { getAllActions, shouldTrigger, applyActionEffect, recordActionMemory, learnNewAction } from "./actions.ts";
import { canEvolve, evolve } from "./evolution.ts";
import { isClaudeAvailable } from "./chat.ts";

export interface AutonomyResult {
  state: PetState;
  notification: string | null;
  evolved: boolean;
  learnedAction: string | null;
}

/**
 * Run the autonomy tick — called from the game loop.
 * This is where Glitchley "decides" what to do on its own.
 */
export async function autonomyTick(state: PetState): Promise<AutonomyResult> {
  const now = Date.now();
  let notification: string | null = null;
  let evolved = false;
  let learnedAction: string | null = null;

  // Don't act if already doing something
  if (state.currentAction !== "idle" && now < state.actionUntil) {
    return { state, notification, evolved, learnedAction };
  }

  // Reset to idle if action expired
  if (state.currentAction !== "idle" && now >= state.actionUntil) {
    state = { ...state, currentAction: "idle", idleSince: now };
  }

  // Respect cooldown between autonomous actions
  if (now - state.lastAutonomousAction < state.autonomousActionCooldown) {
    return { state, notification, evolved, learnedAction };
  }

  // ── Check for Evolution ────────────────────────────
  if (canEvolve(state)) {
    state = await evolve(state);
    evolved = true;
    const form = state.dynamicForms[state.dynamicForms.length - 1];
    notification = `${state.name} transcends into a new form: ${form?.name ?? "Unknown"}!`;
    return { state, notification, evolved, learnedAction };
  }

  // ── Try to Learn a New Action (rare, ~5% chance per tick) ──
  if (Math.random() < 0.05 && state.learnedActions.length < 20) {
    const newAction = await learnNewAction(state);
    if (newAction) {
      state = {
        ...state,
        learnedActions: [...state.learnedActions, newAction],
        memories: [
          ...state.memories.slice(-50),
          {
            id: `learn-${Date.now()}`,
            event: `Learned a new ability: ${newAction.name}`,
            emotion: "curious",
            timestamp: now,
            importance: 7,
          },
        ],
      };
      learnedAction = newAction.name;
      notification = `${state.name} learned a new ability: ${newAction.name}!`;
    }
  }

  // ── Select and Perform an Autonomous Action ────────
  const allActions = getAllActions(state);
  const triggered = allActions.filter(a => shouldTrigger(a, state));

  // Fallback pool: if nothing triggered, use random-type actions as a baseline
  const actionPool = triggered.length > 0
    ? triggered
    : allActions.filter(a => a.trigger.type === "random").slice(0, 3);

  if (actionPool.length > 0) {
    // Pick one randomly from action pool (weighted by novelty)
    const action = pickWeighted(actionPool, state);

    // Apply the action
    state = applyActionEffect(state, action);
    state = {
      ...state,
      lastAutonomousAction: now,
      memories: [
        ...state.memories.slice(-50),
        recordActionMemory(state, action),
      ],
    };

    // Update timesPerformed for learned actions
    if (action.id.startsWith("learned-")) {
      state = {
        ...state,
        learnedActions: state.learnedActions.map(a =>
          a.id === action.id ? { ...a, timesPerformed: a.timesPerformed + 1 } : a
        ),
      };
    }

    if (!notification) {
      notification = `${state.name} ${action.effect.message}`;
    }
  }

  return { state, notification, evolved, learnedAction };
}

/**
 * Pick an action weighted toward less-performed ones (novelty bias).
 */
function pickWeighted(actions: ReturnType<typeof getAllActions>, state: PetState): ReturnType<typeof getAllActions>[0] {
  // Weight: newer/less-performed actions are more likely
  const weights = actions.map(a => {
    const performed = a.timesPerformed;
    return Math.max(1, 10 - performed); // diminishing returns
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;

  for (let i = 0; i < actions.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return actions[i]!;
  }

  return actions[0]!;
}

/**
 * Periodically evolve personality based on experiences.
 * Called less frequently (every ~10 minutes).
 */
export async function evolvePersonality(state: PetState): Promise<PetState> {
  const now = Date.now();
  const timeSinceUpdate = now - state.personality.lastUpdated;

  // Only update personality every 10 minutes
  if (timeSinceUpdate < 600_000) return state;

  // If Claude is available, let it generate personality growth
  if (await isClaudeAvailable()) {
    return evolvePersonalityWithClaude(state);
  }

  // Local fallback: personality shifts based on recent memories
  return evolvePersonalityLocally(state);
}

async function evolvePersonalityWithClaude(state: PetState): Promise<PetState> {
  const { resolveClaudePath } = await import("./chat.ts");
  const claudePath = await resolveClaudePath();
  if (!claudePath) return evolvePersonalityLocally(state);

  const recentMemories = state.memories.slice(-10).map(m => m.event).join("; ");

  const prompt = `A terminal pet named "${state.name}" has these personality traits: ${state.personality.traits.join(", ")}
Quirks: ${state.personality.quirks.join(", ")}
Catchphrase: "${state.personality.catchphrase}"
Recent experiences: ${recentMemories || "just existing peacefully"}
Mood: ${state.mood}, Stage: ${state.stage}

Based on its recent experiences, suggest ONE small personality evolution. Respond in EXACTLY this JSON format (no markdown, ONLY JSON):

{
  "new_quirk": "<a new quirk or null>",
  "updated_catchphrase": "<new catchphrase or null>",
  "new_preference": "<something the pet now likes or null>",
  "growth_note": "<one sentence about how the pet grew>"
}`;

  try {
    const proc = Bun.spawn(
      [claudePath, "-p", prompt, "--output-format", "text", "--model", "haiku"],
      { stdout: "pipe", stderr: "pipe", env: { ...process.env, PATH: `${process.env.PATH ?? ""}:/usr/local/bin:/opt/homebrew/bin` } }
    );

    const output = await new Response(proc.stdout).text();
    await proc.exited;
    if (proc.exitCode !== 0) return evolvePersonalityLocally(state);

    const jsonStr = output.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(jsonStr);

    const personality = { ...state.personality, lastUpdated: Date.now() };

    if (data.new_quirk) {
      personality.quirks = [...personality.quirks.slice(-4), data.new_quirk];
    }
    if (data.updated_catchphrase) {
      personality.catchphrase = data.updated_catchphrase;
    }
    if (data.new_preference) {
      personality.preferences = [...personality.preferences.slice(-4), data.new_preference];
    }

    const memories = [
      ...state.memories.slice(-50),
      {
        id: `personality-${Date.now()}`,
        event: data.growth_note ?? "Grew a little bit today",
        emotion: "contemplative",
        timestamp: Date.now(),
        importance: 5,
      },
    ];

    return { ...state, personality, memories };
  } catch {
    return evolvePersonalityLocally(state);
  }
}

function evolvePersonalityLocally(state: PetState): PetState {
  const localQuirks = [
    "purrs when it sees clean imports",
    "gets twitchy near TODO comments",
    "loves watching tests pass",
    "dreams in hexadecimal",
    "hums when idle for too long",
    "blinks in morse code sometimes",
    "collects semicolons",
    "afraid of infinite loops",
    "naps on warm CPUs",
    "talks to the cursor when lonely",
  ];

  const localCatchphrases = [
    "*purrs in binary*",
    "Meow.exe has started",
    "Bugs fear me (^.^)",
    "I am the terminal, the terminal is me",
    "Every commit is a heartbeat",
    "Trust the process... literally",
    "Segfault? Never heard of her",
    "*hisses at undefined*",
  ];

  const personality = { ...state.personality, lastUpdated: Date.now() };

  // Small chance to gain a new quirk
  if (Math.random() < 0.3) {
    const newQuirk = localQuirks[Math.floor(Math.random() * localQuirks.length)]!;
    if (!personality.quirks.includes(newQuirk)) {
      personality.quirks = [...personality.quirks.slice(-4), newQuirk];
    }
  }

  // Small chance to update catchphrase
  if (Math.random() < 0.15) {
    personality.catchphrase = localCatchphrases[Math.floor(Math.random() * localCatchphrases.length)]!;
  }

  return { ...state, personality };
}
