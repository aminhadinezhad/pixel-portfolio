"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { isSoundEnabled, loadSoundPreference, playSfx, setSoundEnabled, subscribeSound } from "@/lib/sfx";

export type { Sfx } from "@/lib/sfx";

/** Sound on/off state (shared with every component that calls playSfx) plus `play`. */
export function useSound() {
  const enabled = useSyncExternalStore(subscribeSound, isSoundEnabled, () => true);

  useEffect(() => loadSoundPreference(), []);

  const toggle = useCallback(() => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    if (next) playSfx("soundOn"); // hear that sound is back
  }, []);

  return { enabled, toggle, play: playSfx };
}
