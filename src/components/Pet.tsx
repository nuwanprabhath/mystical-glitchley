import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { getFrame } from "../art/frames.ts";
import type { PetState } from "../state/types.ts";

interface PetProps {
  state: PetState;
}

export function Pet({ state }: PetProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(interval);
  }, []);

  const displayKey = state.currentAction !== "idle" ? state.currentAction : state.mood;
  const frame = getFrame(state.stage, displayKey, tick);

  const stageColors: Record<string, string> = {
    egg: "white",
    baby: "cyan",
    teen: "green",
    adult: "yellow",
    elder: "magenta",
    mythical: "redBright",
  };

  const color = stageColors[state.stage] ?? "white";

  return (
    <Box flexDirection="column" alignItems="center" paddingX={1}>
      {frame.lines.map((line, i) => (
        <Text key={i} color={color}>
          {line}
        </Text>
      ))}
    </Box>
  );
}
