import React from "react";
import { Box, Text, useInput } from "ink";

interface MenuProps {
  onAction: (action: "feed" | "play" | "sleep" | "chat" | "quit") => void;
  chatAvailable: boolean;
}

export function Menu({ onAction, chatAvailable }: MenuProps) {
  useInput((input, key) => {
    switch (input) {
      case "f":
        onAction("feed");
        break;
      case "p":
        onAction("play");
        break;
      case "s":
        onAction("sleep");
        break;
      case "c":
        if (chatAvailable) onAction("chat");
        break;
      case "q":
        onAction("quit");
        break;
    }
    if (key.escape) onAction("quit");
  });

  return (
    <Box paddingX={1} gap={2}>
      <Text>
        <Text bold color="green">[F]</Text>
        <Text>eed</Text>
      </Text>
      <Text>
        <Text bold color="blue">[P]</Text>
        <Text>lay</Text>
      </Text>
      <Text>
        <Text bold color="magenta">[S]</Text>
        <Text>leep</Text>
      </Text>
      {chatAvailable ? (
        <Text>
          <Text bold color="cyan">[C]</Text>
          <Text>hat</Text>
        </Text>
      ) : (
        <Text dimColor>
          <Text>[C]hat</Text>
          <Text dimColor> (no claude)</Text>
        </Text>
      )}
      <Text>
        <Text bold color="red">[Q]</Text>
        <Text>uit</Text>
      </Text>
    </Box>
  );
}
