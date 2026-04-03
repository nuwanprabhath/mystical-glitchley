import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onExit: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, onExit, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [cursorOffset, setCursorOffset] = useState(0);

  useInput((input, key) => {
    if (key.escape) {
      onExit();
      return;
    }

    if (key.return && value.trim().length > 0 && !isLoading) {
      onSubmit(value.trim());
      setValue("");
      setCursorOffset(0);
      return;
    }

    if (key.backspace || key.delete) {
      if (value.length > 0) {
        const pos = value.length - cursorOffset;
        if (pos > 0) {
          setValue(value.slice(0, pos - 1) + value.slice(pos));
        }
      }
      return;
    }

    if (key.leftArrow) {
      setCursorOffset(Math.min(cursorOffset + 1, value.length));
      return;
    }

    if (key.rightArrow) {
      setCursorOffset(Math.max(cursorOffset - 1, 0));
      return;
    }

    // Regular character input
    if (input && !key.ctrl && !key.meta) {
      const pos = value.length - cursorOffset;
      setValue(value.slice(0, pos) + input + value.slice(pos));
    }
  });

  const cursorPos = value.length - cursorOffset;
  const beforeCursor = value.slice(0, cursorPos);
  const cursorChar = value[cursorPos] ?? " ";
  const afterCursor = value.slice(cursorPos + 1);

  return (
    <Box paddingX={1} gap={1}>
      <Text color="cyan" bold>
        {">"}{" "}
      </Text>
      {isLoading ? (
        <Text color="yellow" dimColor>
          Glitchley is thinking...
        </Text>
      ) : (
        <Text>
          <Text>{beforeCursor}</Text>
          <Text inverse>{cursorChar}</Text>
          <Text>{afterCursor}</Text>
        </Text>
      )}
    </Box>
  );
}
