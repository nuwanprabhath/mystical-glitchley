import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Text, useApp } from "ink";
import { Header } from "./components/Header.tsx";
import { Pet } from "./components/Pet.tsx";
import { Stats } from "./components/Stats.tsx";
import { Menu } from "./components/Menu.tsx";
import { Notification } from "./components/Notification.tsx";
import { ChatHistory } from "./components/ChatHistory.tsx";
import { ChatInput } from "./components/ChatInput.tsx";
import { loadState, saveState } from "./state/pet-state.ts";
import { tick, feed, play, sleep, celebrate, deriveStage } from "./engine/game-loop.ts";
import { isClaudeAvailable, chat } from "./engine/chat.ts";
import { autonomyTick, evolvePersonality } from "./engine/autonomy.ts";
import type { ChatMessage } from "./engine/chat.ts";
import type { PetState } from "./state/types.ts";
import { DEFAULT_STATE } from "./state/types.ts";

type AppMode = "pet" | "chat";

export function App() {
  const { exit } = useApp();
  const [petState, setPetState] = useState<PetState>(DEFAULT_STATE);
  const [notification, setNotification] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<AppMode>("pet");
  const [claudeAvailable, setClaudeAvailable] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const autonomyRunning = useRef(false);
  const petStateRef = useRef<PetState>(DEFAULT_STATE);

  // Check claude CLI availability on mount
  useEffect(() => {
    isClaudeAvailable().then(setClaudeAvailable);
  }, []);

  // Load state on mount
  useEffect(() => {
    loadState().then((state) => {
      const updated = tick(state);
      updated.totalSessions += 1;
      setPetState(updated);
      setLoaded(true);
      saveState(updated);
    });
  }, []);

  // Keep ref in sync so async callbacks always see the latest state
  useEffect(() => {
    petStateRef.current = petState;
  }, [petState]);

  // Game tick every 5 seconds (stat decay + stage changes)
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setPetState((prev) => {
        const updated = tick(prev);
        if (updated.stage !== prev.stage) {
          setNotification(`${updated.name} evolved into ${updated.stage.toUpperCase()}!`);
        }
        if (updated.mood === "hungry" && prev.mood !== "hungry") {
          setNotification(`${updated.name} is hungry!`);
        }
        if (updated.mood === "tired" && prev.mood !== "tired") {
          setNotification(`${updated.name} is tired...`);
        }
        saveState(updated);
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [loaded]);

  // Autonomy tick every 8 seconds (spontaneous behaviors, learning, evolution)
  // Uses petStateRef to always read fresh state without causing effect restarts
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(async () => {
      if (autonomyRunning.current) return;
      autonomyRunning.current = true;

      try {
        const currentState = petStateRef.current;
        const result = await autonomyTick(currentState);

        if (result.notification) {
          notify(result.notification);
        }

        const finalState = await evolvePersonality(result.state);

        setPetState(finalState);
        saveState(finalState);
      } catch {
        // Autonomy failures are non-fatal
      } finally {
        autonomyRunning.current = false;
      }
    }, 8_000);
    return () => clearInterval(interval);
  }, [loaded]); // no petState dep — uses ref instead

  const notify = useCallback((msg: string) => {
    setNotification(null);
    setTimeout(() => setNotification(msg), 10);
  }, []);

  // Handle pet actions (feed, play, sleep, etc.)
  const handleAction = useCallback(
    (action: "feed" | "play" | "sleep" | "chat" | "quit") => {
      if (action === "quit") {
        saveState(petState).then(() => exit());
        return;
      }

      if (action === "chat") {
        setMode("chat");
        return;
      }

      setPetState((prev) => {
        let updated: PetState;
        switch (action) {
          case "feed":
            updated = feed(prev);
            notify(`${prev.name} munches happily! (-25 hunger, +10 happy)`);
            break;
          case "play":
            updated = play(prev);
            notify(`${prev.name} plays around! (+20 happy, -10 energy, +10 XP)`);
            break;
          case "sleep":
            updated = sleep(prev);
            notify(`${prev.name} curls up to sleep... (+40 energy)`);
            break;
          default:
            updated = prev;
        }
        const newStage = deriveStage(updated.stats.xp, updated);
        if (newStage !== prev.stage) {
          updated = { ...updated, stage: newStage };
          setTimeout(() => notify(`${updated.name} evolved into ${newStage.toUpperCase()}!`), 3100);
        }
        saveState(updated);
        return updated;
      });
    },
    [petState, exit, notify]
  );

  // Handle sending a chat message
  const handleChatSubmit = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { role: "user", text, timestamp: Date.now() };
      setChatMessages((prev) => [...prev, userMsg]);
      setChatLoading(true);

      try {
        const response = await chat(text, petState, [...chatMessages, userMsg]);
        const petMsg: ChatMessage = { role: "pet", text: response, timestamp: Date.now() };
        setChatMessages((prev) => [...prev, petMsg]);

        // Chatting makes the pet happier
        setPetState((prev) => {
          const updated = {
            ...prev,
            stats: {
              ...prev.stats,
              happiness: Math.min(100, prev.stats.happiness + 3),
              xp: prev.stats.xp + 2,
            },
          };
          saveState(updated);
          return updated;
        });
      } catch (error) {
        const errMsg: ChatMessage = {
          role: "pet",
          text: "*looks confused* Mrrp... I can't think right now (o.o)",
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, errMsg]);
      } finally {
        setChatLoading(false);
      }
    },
    [petState, chatMessages]
  );

  const handleChatExit = useCallback(() => {
    setMode("pet");
  }, []);

  if (!loaded) {
    return (
      <Box>
        <Header />
      </Box>
    );
  }

  if (mode === "chat") {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Box justifyContent="center">
          <Text bold color="magentaBright">
            {"~ Chat with Glitchley ~"}
          </Text>
        </Box>
        <Box justifyContent="center">
          <Text dimColor>ESC to return to pet view</Text>
        </Box>

        <Box justifyContent="center" paddingY={1}>
          <Pet state={petState} />
        </Box>

        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor="cyan"
          paddingX={1}
          marginX={2}
        >
          <ChatHistory messages={chatMessages} maxVisible={6} />
        </Box>

        <Box marginX={2} marginTop={1}>
          <ChatInput
            onSubmit={handleChatSubmit}
            onExit={handleChatExit}
            isLoading={chatLoading}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Header />
      <Pet state={petState} />
      <Stats state={petState} />
      <Notification message={notification} />
      <Menu onAction={handleAction} chatAvailable={claudeAvailable} />
    </Box>
  );
}
