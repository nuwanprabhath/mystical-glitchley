import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

interface NotificationProps {
  message: string | null;
}

export function Notification({ message }: NotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [message]);

  if (!visible || !message) return null;

  return (
    <Box paddingX={1}>
      <Text color="yellowBright" bold>
        {" "}
        {message}{" "}
      </Text>
    </Box>
  );
}
