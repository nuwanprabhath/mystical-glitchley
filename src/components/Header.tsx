import React from "react";
import { Box, Text } from "ink";

export function Header() {
  return (
    <Box flexDirection="column" alignItems="center" paddingX={1}>
      <Text bold color="magentaBright">
        {"~ Mystical Glitchley ~"}
      </Text>
      <Text dimColor>Your terminal companion</Text>
    </Box>
  );
}
