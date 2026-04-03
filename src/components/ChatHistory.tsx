import React from "react";
import { Box, Text } from "ink";
import type { ChatMessage } from "../engine/chat.ts";

interface ChatHistoryProps {
  messages: ChatMessage[];
  maxVisible?: number;
}

export function ChatHistory({ messages, maxVisible = 8 }: ChatHistoryProps) {
  const visible = messages.slice(-maxVisible);

  if (visible.length === 0) {
    return (
      <Box paddingX={1}>
        <Text dimColor italic>
          Say something to {" "}Glitchley! Type a message and press Enter...
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {visible.map((msg, i) => (
        <Box key={`${msg.timestamp}-${i}`} gap={1}>
          {msg.role === "user" ? (
            <>
              <Text color="blue" bold>
                you:
              </Text>
              <Text>{msg.text}</Text>
            </>
          ) : (
            <>
              <Text color="magenta" bold>
                {"\u2727"} :
              </Text>
              <Text color="magentaBright">{msg.text}</Text>
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}
