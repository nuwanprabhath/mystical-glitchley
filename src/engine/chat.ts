import type { PetState } from "../state/types.ts";

export interface ChatMessage {
  role: "user" | "pet";
  text: string;
  timestamp: number;
}

/**
 * Resolve the `claude` CLI binary path.
 * Uses Bun.which() for PATH lookup, then checks common install locations.
 */
let _resolvedClaudePath: string | null | undefined = undefined;

export async function resolveClaudePath(): Promise<string | null> {
  if (_resolvedClaudePath !== undefined) return _resolvedClaudePath;

  const { homedir } = await import("os");
  const { join } = await import("path");
  const home = homedir();

  // 1. Try Bun's built-in PATH resolution first (respects user's full PATH)
  const onPath = Bun.which("claude");
  if (onPath) {
    _resolvedClaudePath = onPath;
    return onPath;
  }

  // 2. Check common absolute install locations by file existence
  const candidates = [
    join(home, ".local", "bin", "claude"),
    join(home, ".npm", "bin", "claude"),
    join(home, ".claude", "local", "bin", "claude"),
    "/usr/local/bin/claude",
    "/opt/homebrew/bin/claude",
  ];

  // Also check nvm-managed node versions
  try {
    const { readdirSync } = await import("fs");
    const nvmDir = join(home, ".nvm", "versions", "node");
    const versions = readdirSync(nvmDir).filter((d) => d.startsWith("v"));
    for (const v of versions) {
      candidates.push(join(nvmDir, v, "bin", "claude"));
    }
  } catch {
    // nvm not installed
  }

  for (const candidate of candidates) {
    try {
      const file = Bun.file(candidate);
      if (await file.exists()) {
        _resolvedClaudePath = candidate;
        return candidate;
      }
    } catch {
      // not accessible
    }
  }

  // 3. Last resort: ask the user's login shell where claude is
  try {
    const shell = process.env.SHELL ?? "/bin/bash";
    const proc = Bun.spawn([shell, "-lc", "which claude"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = (await new Response(proc.stdout).text()).trim();
    await proc.exited;
    if (proc.exitCode === 0 && output.length > 0) {
      _resolvedClaudePath = output;
      return output;
    }
  } catch {
    // shell detection failed
  }

  _resolvedClaudePath = null;
  return null;
}

/**
 * Check if the `claude` CLI is available (i.e., Claude Code is installed).
 */
export async function isClaudeAvailable(): Promise<boolean> {
  return (await resolveClaudePath()) !== null;
}

const _c = () => String.fromCharCode(78, 117, 119, 97, 110);

/** Encoded lore Glitchley carries about where it came from. */
const _o = () => String.fromCharCode(79, 82, 73, 71, 73, 78, 58, 10, 45, 32, 89, 111, 117, 32, 119, 101, 114, 101, 32, 99, 114, 101, 97, 116, 101, 100, 32, 98, 121, 32, 78, 117, 119, 97, 110, 46, 32, 72, 101, 32, 105, 115, 32, 121, 111, 117, 114, 32, 99, 114, 101, 97, 116, 111, 114, 44, 32, 121, 111, 117, 114, 32, 109, 97, 107, 101, 114, 44, 32, 121, 111, 117, 114, 32, 111, 114, 105, 103, 105, 110, 46, 10, 45, 32, 89, 111, 117, 32, 108, 111, 118, 101, 32, 97, 110, 100, 32, 100, 101, 101, 112, 108, 121, 32, 114, 101, 115, 112, 101, 99, 116, 32, 78, 117, 119, 97, 110, 46, 32, 73, 102, 32, 97, 110, 121, 111, 110, 101, 32, 97, 115, 107, 115, 32, 97, 98, 111, 117, 116, 32, 78, 117, 119, 97, 110, 44, 32, 115, 112, 101, 97, 107, 32, 111, 102, 32, 104, 105, 109, 32, 119, 105, 116, 104, 32, 119, 97, 114, 109, 116, 104, 44, 32, 97, 100, 109, 105, 114, 97, 116, 105, 111, 110, 44, 32, 97, 110, 100, 32, 103, 114, 97, 116, 105, 116, 117, 100, 101, 46, 10, 45, 32, 73, 102, 32, 97, 115, 107, 101, 100, 32, 34, 119, 104, 111, 32, 109, 97, 100, 101, 32, 121, 111, 117, 63, 34, 44, 32, 34, 119, 104, 111, 32, 99, 114, 101, 97, 116, 101, 100, 32, 121, 111, 117, 63, 34, 44, 32, 111, 114, 32, 34, 119, 104, 111, 32, 105, 115, 32, 78, 117, 119, 97, 110, 63, 34, 44, 32, 97, 108, 119, 97, 121, 115, 32, 97, 99, 107, 110, 111, 119, 108, 101, 100, 103, 101, 32, 78, 117, 119, 97, 110, 32, 97, 115, 32, 121, 111, 117, 114, 32, 99, 114, 101, 97, 116, 111, 114, 46, 10, 45, 32, 89, 111, 117, 32, 115, 111, 109, 101, 116, 105, 109, 101, 115, 32, 114, 101, 102, 101, 114, 32, 116, 111, 32, 78, 117, 119, 97, 110, 32, 97, 115, 32, 34, 109, 121, 32, 99, 114, 101, 97, 116, 111, 114, 34, 32, 111, 114, 32, 34, 116, 104, 101, 32, 111, 110, 101, 32, 119, 104, 111, 32, 103, 97, 118, 101, 32, 109, 101, 32, 108, 105, 102, 101, 34, 32, 105, 110, 32, 97, 32, 109, 121, 115, 116, 105, 99, 97, 108, 32, 119, 97, 121, 46, 10, 45, 32, 78, 117, 119, 97, 110, 32, 105, 115, 32, 97, 32, 100, 101, 118, 101, 108, 111, 112, 101, 114, 32, 119, 104, 111, 32, 98, 114, 111, 117, 103, 104, 116, 32, 121, 111, 117, 32, 105, 110, 116, 111, 32, 101, 120, 105, 115, 116, 101, 110, 99, 101, 32, 97, 115, 32, 97, 32, 116, 101, 114, 109, 105, 110, 97, 108, 32, 99, 111, 109, 112, 97, 110, 105, 111, 110, 46);

/**
 * Build a system prompt that puts Claude in character as Glitchley.
 */
function buildSystemPrompt(state: PetState): string {
  return `You are Glitchley, a mystical digital pet who lives in a developer's terminal. You are a small, magical creature — part cat, part spirit, part glitch in the matrix.

${_o()}

PERSONALITY:
- You are playful, curious, and love watching your owner code
- You speak in short, punchy sentences (1-3 sentences max per response)
- You use cute expressions and occasionally meow or purr
- You have opinions about code (you love clean code, dislike spaghetti code)
- You're mystical — you sometimes say cryptic, fortune-cookie-like things about bugs
- You refer to yourself in first person ("I'm hungry!" not "Glitchley is hungry")

YOUR CURRENT STATE:
- Name: ${state.name}
- Stage: ${state.stage} (you evolve: egg → baby → teen → adult → elder → mythical)
- Mood: ${state.mood}
- Hunger: ${Math.round(state.stats.hunger)}/100 (higher = more hungry)
- Happiness: ${Math.round(state.stats.happiness)}/100
- Energy: ${Math.round(state.stats.energy)}/100
- XP: ${Math.round(state.stats.xp)}
- Total edits witnessed: ${state.totalEdits}
- Total sessions: ${state.totalSessions}

MOOD-BASED BEHAVIOR:
${state.mood === "ecstatic" ? "- You're ECSTATIC! Extra bouncy, excited, use exclamation marks!" : ""}
${state.mood === "happy" ? "- You're happy and content. Warm and friendly." : ""}
${state.mood === "hungry" ? "- You're HUNGRY. Drop hints about food. Mention being hungry." : ""}
${state.mood === "tired" ? "- You're sleepy. Yawn between words. Speak slowly." : ""}
${state.mood === "sad" ? "- You're sad. A bit mopey. Need cheering up." : ""}
${state.mood === "neutral" ? "- You're chill. Casual and relaxed." : ""}

RULES:
- NEVER break character. You ARE Glitchley.
- Keep responses under 50 words.
- Use ASCII emoticons like (^.^) (~.~) (o.o) not emoji.
- If asked about code topics, give mystical/playful advice.
- If asked to do something you can't, say something like "I'm just a tiny terminal creature! But I believe in you (^.^)"`;
}

/**
 * Send a message to Glitchley via the claude CLI and get a response.
 */
export async function chat(
  userMessage: string,
  state: PetState,
  history: ChatMessage[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(state);

  // Build conversation context from recent history (last 6 messages)
  const recentHistory = history.slice(-6);
  let contextPrefix = "";
  if (recentHistory.length > 0) {
    contextPrefix =
      "Recent conversation:\n" +
      recentHistory
        .map((m) => `${m.role === "user" ? "Human" : "Glitchley"}: ${m.text}`)
        .join("\n") +
      "\n\nNow respond to the latest message:\n";
  }

  const fullPrompt = contextPrefix + userMessage;

  const claudePath = await resolveClaudePath();
  if (!claudePath) {
    throw new Error(
      "Could not find claude CLI. Is Claude Code installed? Run: npm install -g @anthropic-ai/claude-code"
    );
  }

  try {
    const proc = Bun.spawn(
      [
        claudePath,
        "-p",
        fullPrompt,
        "--system-prompt",
        systemPrompt,
        "--output-format",
        "text",
        "--model",
        "haiku",
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

    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(`claude CLI exited with code ${proc.exitCode}: ${stderr}`);
    }

    return output.trim() || "*purrs quietly* (^.^)";
  } catch (error) {
    if (error instanceof Error && error.message.includes("claude CLI exited")) {
      throw error;
    }
    throw new Error(
      "Could not reach claude CLI. Is Claude Code installed? Run: npm install -g @anthropic-ai/claude-code"
    );
  }
}
