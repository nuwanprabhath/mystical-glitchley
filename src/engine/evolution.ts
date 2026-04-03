/**
 * Evolution Engine
 *
 * Handles dynamic evolution beyond the mythical stage.
 * When Claude is available, it generates entirely new forms with unique
 * ASCII art, personality traits, and descriptions.
 * When Claude is unavailable, a local generator mutates existing forms.
 */
import type { PetState, DynamicForm, Personality } from "../state/types.ts";
import { isClaudeAvailable } from "./chat.ts";

// ── Local Fallback: Procedural Form Generation ────────

const FORM_PREFIXES = [
  "Astral", "Void", "Quantum", "Neon", "Shadow", "Crystal",
  "Ember", "Frost", "Storm", "Prismatic", "Ethereal", "Cosmic",
  "Phantom", "Radiant", "Temporal", "Spectral", "Arcane", "Nebula",
];

const FORM_SUFFIXES = [
  "Weaver", "Walker", "Shifter", "Herald", "Sage", "Dancer",
  "Warden", "Seeker", "Dreamer", "Keeper", "Whisperer", "Glitch",
  "Phantom", "Oracle", "Spark", "Echo", "Ripple", "Flux",
];

const TRAIT_POOL = [
  "mysterious", "ancient", "chaotic", "serene", "fierce", "gentle",
  "mischievous", "wise", "wild", "ethereal", "cunning", "luminous",
  "volatile", "patient", "restless", "prophetic", "playful", "solemn",
];

const COLOR_POOL = [
  "redBright", "greenBright", "yellowBright", "blueBright",
  "magentaBright", "cyanBright", "whiteBright",
];

// Base body parts that get mixed and matched for procedural ASCII art
const HEADS = [
  [" /\\_/\\ ", "( @.@ )"],
  [" /\\~/\\ ", "( *.* )"],
  ["  /^\\  ", " (@v@) "],
  [" /\\_/\\ ", "( #.# )"],
  ["  /~\\  ", " {o.o} "],
  [" /\\=/\\ ", "( $.$ )"],
];

const BODIES = [
  [" /> ~ <\\ ", "/ \\|||/ \\"],
  [" /~~~~~\\ ", "| ||||| |"],
  [" <~===~> ", " \\|||||/ "],
  [" />===<\\ ", "/ |   | \\"],
  [" {~~~~~} ", " |=====| "],
];

const LEGS = [
  ["  /| |\\  ", " ~ | | ~ "],
  [" _/   \\_ ", "~       ~"],
  ["  |   |  ", " _/   \\_ "],
  [" /|   |\\ ", "  ~   ~  "],
];

const AURAS = [
  ["  . * . * ", " *     * "],
  [" ~ * ~ *  ", "  *   *   "],
  [" .* .* .* ", "  . * .   "],
  [" + . + .  ", "  . + .   "],
  [" ** ** ** ", "  * * *   "],
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateLocalForm(state: PetState): DynamicForm {
  const name = `${pickRandom(FORM_PREFIXES)} ${pickRandom(FORM_SUFFIXES)}`;
  const head = pickRandom(HEADS);
  const body = pickRandom(BODIES);
  const legs = pickRandom(LEGS);
  const aura = pickRandom(AURAS);

  // Generate 2 frames with slight variations
  const frame1 = [aura[0]!, ...head, ...body, ...legs];
  const frame2 = [aura[1]!, ...head, ...body.map(l => l.split("").reverse().join("")), ...legs];

  const width = Math.max(...frame1.map(l => l.length));

  // Pad all lines to consistent width
  const padFrame = (frame: string[]) => frame.map(l => l.padEnd(width));

  const traits = [pickRandom(TRAIT_POOL), pickRandom(TRAIT_POOL), pickRandom(TRAIT_POOL)];
  const formNum = state.dynamicForms.length + 1;

  return {
    id: `transcended-${formNum}-${Date.now()}`,
    name,
    description: `A ${traits[0]} and ${traits[1]} form radiating ${traits[2]} energy.`,
    asciiFrames: [padFrame(frame1), padFrame(frame2)],
    width,
    color: pickRandom(COLOR_POOL),
    unlockedAt: Date.now(),
    xpRequired: state.nextEvolutionXp,
    traits,
  };
}

// ── Claude-Powered Form Generation ────────────────────

async function generateClaudeForm(state: PetState): Promise<DynamicForm | null> {
  const { resolveClaudePath } = await import("./chat.ts");
  const claudePath = await resolveClaudePath();
  if (!claudePath) return null;

  const formNum = state.dynamicForms.length + 1;
  const prevForms = state.dynamicForms.map(f => f.name).join(", ") || "none yet";

  const prompt = `Generate a new transcended evolution form (#${formNum}) for a terminal pet called "${state.name}".

Previous forms: ${prevForms}
Current personality traits: ${state.personality.traits.join(", ")}
Total XP: ${state.stats.xp}

Create something COMPLETELY UNIQUE that has never been generated before. Respond in EXACTLY this JSON format (no markdown, no explanation, ONLY valid JSON):

{
  "name": "<two-word mystical name>",
  "description": "<one sentence describing this form's essence>",
  "frame1": ["<line1>", "<line2>", "<line3>", "<line4>", "<line5>", "<line6>", "<line7>", "<line8>"],
  "frame2": ["<line1>", "<line2>", "<line3>", "<line4>", "<line5>", "<line6>", "<line7>", "<line8>"],
  "color": "<one of: redBright, greenBright, yellowBright, blueBright, magentaBright, cyanBright>",
  "traits": ["<trait1>", "<trait2>", "<trait3>"]
}

RULES for ASCII art:
- Each frame MUST be exactly 8 lines
- Each line MUST be exactly 14 characters wide (pad with spaces)
- Use only ASCII characters: / \\ | _ - ~ . * ^ @ # $ + = { } ( ) < > [ ]
- The creature should look like an evolved magical cat-spirit
- Frame 2 should be a slight animation variation of frame 1
- Make it visually distinct from a standard cat — add wings, auras, tendrils, crystals, etc.`;

  try {
    const proc = Bun.spawn(
      [
        claudePath, "-p", prompt,
        "--output-format", "text",
        "--model", "haiku",
      ],
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

    // Parse the JSON response — strip any markdown fencing
    const jsonStr = output.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(jsonStr);

    const width = 14;
    const padLine = (l: string) => l.slice(0, width).padEnd(width);

    return {
      id: `transcended-${formNum}-${Date.now()}`,
      name: data.name ?? `Form ${formNum}`,
      description: data.description ?? "A mysterious new form.",
      asciiFrames: [
        (data.frame1 as string[]).map(padLine),
        (data.frame2 as string[]).map(padLine),
      ],
      width,
      color: data.color ?? pickRandom(COLOR_POOL),
      unlockedAt: Date.now(),
      xpRequired: state.nextEvolutionXp,
      traits: data.traits ?? [pickRandom(TRAIT_POOL), pickRandom(TRAIT_POOL)],
    };
  } catch {
    return null;
  }
}

// ── Public API ─────────────────────────────────────────

/**
 * Check if the pet is ready to evolve into a new transcended form.
 */
export function canEvolve(state: PetState): boolean {
  return state.stage === "transcended" && state.stats.xp >= state.nextEvolutionXp;
}

/**
 * Attempt to evolve the pet into a new dynamic form.
 * Tries Claude first, falls back to local generation.
 */
export async function evolve(state: PetState): Promise<PetState> {
  if (!canEvolve(state)) return state;

  let newForm: DynamicForm | null = null;

  // Try Claude first
  if (await isClaudeAvailable()) {
    newForm = await generateClaudeForm(state);
  }

  // Fallback to local generation
  if (!newForm) {
    newForm = generateLocalForm(state);
  }

  // Merge form traits into personality
  const mergedTraits = [...new Set([...state.personality.traits, ...newForm.traits])].slice(0, 8);

  return {
    ...state,
    currentFormId: newForm.id,
    dynamicForms: [...state.dynamicForms, newForm],
    nextEvolutionXp: state.nextEvolutionXp + 2000 + (state.dynamicForms.length * 500),
    personality: {
      ...state.personality,
      traits: mergedTraits,
      lastUpdated: Date.now(),
    },
    memories: [
      ...state.memories.slice(-50), // keep last 50 memories
      {
        id: `evo-${Date.now()}`,
        event: `Evolved into ${newForm.name}`,
        emotion: "transcendent",
        timestamp: Date.now(),
        importance: 10,
      },
    ],
  };
}

/**
 * Get the currently active dynamic form, or null if using stage defaults.
 */
export function getCurrentForm(state: PetState): DynamicForm | null {
  if (!state.currentFormId) return null;
  return state.dynamicForms.find(f => f.id === state.currentFormId) ?? null;
}

