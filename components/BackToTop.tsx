"use client";

import { useEffect, useState } from "react";
import { playSfx } from "@/lib/sfx";
import { Icon } from "./icons";

/**
 * Square "back to top" button for phones (CSS hides it on desktop).
 * It appears once the top button bar has scrolled off screen, i.e. exactly when it is useful.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const topBar = document.querySelector(".corners");
    const onScroll = () => setVisible(!!topBar && topBar.getBoundingClientRect().bottom < 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const toTop = () => {
    playSfx("click");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button type="button" className="corner-btn back-to-top" aria-label="Back to top" onClick={toTop}>
      <Icon name="arrowUp" />
    </button>
  );
}
