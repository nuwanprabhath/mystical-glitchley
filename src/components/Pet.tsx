import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { getFrameDynamic } from "../art/frames.ts";
import { getCurrentForm } from "../engine/evolution.ts";
import { getAllActions } from "../engine/actions.ts";
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
  const dynamicForm = getCurrentForm(state);

  const frame = getFrameDynamic(
    state.stage,
    displayKey,
    tick,
    dynamicForm,
    getAllActions(state), // includes built-ins + learned actions
  );

  const stageColors: Record<string, string> = {
    egg: "white",
    baby: "cyan",
    teen: "green",
    adult: "yellow",
    elder: "magenta",
    mythical: "redBright",
    transcended: dynamicForm?.color ?? "cyanBright",
  };

  const color = stageColors[state.stage] ?? "white";

  return (
    <Box flexDirection="column" alignItems="center" paddingX={1}>
      {frame.lines.map((line, i) => (
        <Text key={i} color={color}>
          {line}
        </Text>
      ))}
      {dynamicForm && (
        <Text dimColor italic>
          {"~ "}{dynamicForm.name}{" ~"}
        </Text>
      )}
    </Box>
  );
}
