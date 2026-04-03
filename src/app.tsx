import React, { useState, useEffect, useCallback } from "react";
import { Box, useApp } from "ink";
import { Header } from "./components/Header.tsx";
import { Pet } from "./components/Pet.tsx";
import { Stats } from "./components/Stats.tsx";
import { Menu } from "./components/Menu.tsx";
import { Notification } from "./components/Notification.tsx";
import { loadState, saveState } from "./state/pet-state.ts";
import { tick, feed, play, sleep, celebrate, deriveStage } from "./engine/game-loop.ts";
import type { PetState } from "./state/types.ts";
import { DEFAULT_STATE } from "./state/types.ts";

export function App() {
  const { exit } = useApp();
  const [petState, setPetState] = useState<PetState>(DEFAULT_STATE);
  const [notification, setNotification] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  // Game tick every 5 seconds
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setPetState((prev) => {
        const updated = tick(prev);
        // Check for evolution
        if (updated.stage !== prev.stage) {
          setNotification(`${updated.name} evolved into ${updated.stage.toUpperCase()}!`);
        }
        // Mood warnings
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

  const notify = useCallback((msg: string) => {
    setNotification(null);
    // Force re-render with new message
    setTimeout(() => setNotification(msg), 10);
  }, []);

  const handleAction = useCallback(
    (action: "feed" | "play" | "sleep" | "quit") => {
      if (action === "quit") {
        saveState(petState).then(() => exit());
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
        // Check for stage evolution after action
        const newStage = deriveStage(updated.stats.xp);
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

  if (!loaded) {
    return <Box><Header /></Box>;
  }

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Header />
      <Pet state={petState} />
      <Stats state={petState} />
      <Notification message={notification} />
      <Menu onAction={handleAction} />
    </Box>
  );
}
