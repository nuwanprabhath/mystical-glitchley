import React from "react";
import { Box, Text } from "ink";
import type { PetState } from "../state/types.ts";
import { getAge } from "../engine/game-loop.ts";

interface StatsProps {
  state: PetState;
}

function bar(value: number, width: number = 15): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

function barColor(value: number, invert: boolean = false): string {
  const v = invert ? 100 - value : value;
  if (v >= 60) return "green";
  if (v >= 30) return "yellow";
  return "red";
}

export function Stats({ state }: StatsProps) {
  const { hunger, happiness, energy, xp } = state.stats;
  const stageLabel = state.stage === "transcended" && state.dynamicForms?.length
    ? `FORM #${state.dynamicForms.length}`
    : state.stage.toUpperCase();

  return (
    <Box flexDirection="column" paddingX={1} borderStyle="single" borderColor="gray">
      <Box justifyContent="space-between" gap={1}>
        <Text bold color="white">
          {state.name}
        </Text>
        <Text dimColor>
          {stageLabel} | {getAge(state.born)} old
        </Text>
      </Box>

      <Box gap={1}>
        <Text>Hunger  </Text>
        <Text color={barColor(hunger, true)}>{bar(100 - hunger)}</Text>
        <Text dimColor> {Math.round(100 - hunger)}%</Text>
      </Box>

      <Box gap={1}>
        <Text>Happy   </Text>
        <Text color={barColor(happiness)}>{bar(happiness)}</Text>
        <Text dimColor> {Math.round(happiness)}%</Text>
      </Box>

      <Box gap={1}>
        <Text>Energy  </Text>
        <Text color={barColor(energy)}>{bar(energy)}</Text>
        <Text dimColor> {Math.round(energy)}%</Text>
      </Box>

      <Box gap={1}>
        <Text>XP      </Text>
        <Text color="cyan">{Math.round(xp)}</Text>
        <Text dimColor> | Mood: </Text>
        <Text color="yellow">{state.mood}</Text>
      </Box>

      {/* Personality line for transcended pets */}
      {state.personality?.traits?.length > 0 && (
        <Box gap={1}>
          <Text dimColor>Traits  </Text>
          <Text color="magenta">{state.personality.traits.slice(0, 4).join(", ")}</Text>
        </Box>
      )}

      {/* Show current action if doing something autonomous */}
      {state.currentAction !== "idle" && state.currentAction !== "eating" &&
       state.currentAction !== "playing" && state.currentAction !== "sleeping" &&
       state.currentAction !== "celebrating" && state.currentAction !== "coding" && (
        <Box gap={1}>
          <Text dimColor>Action  </Text>
          <Text color="cyanBright" italic>{state.currentAction.replace(/_/g, " ")}</Text>
        </Box>
      )}
    </Box>
  );
}
