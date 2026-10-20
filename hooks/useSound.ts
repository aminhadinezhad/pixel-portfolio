"use client";

import { useCallback, useRef, useState } from "react";

export type Sfx = "select";

/**
 * Sound on/off state plus a stable `play` hook point.
 * `play` is a no-op for now; plug 8-bit sfx (e.g. Web Audio square waves) in here later.
 */
export function useSound(initial = true) {
  const [enabled, setEnabled] = useState(initial);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const toggle = useCallback(() => setEnabled((on) => !on), []);

  const play = useCallback((sfx: Sfx) => {
    if (!enabledRef.current) return;
    void sfx; // TODO: trigger the matching 8-bit sound effect
  }, []);

  return { enabled, toggle, play };
}
