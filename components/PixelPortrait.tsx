"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

// Pixel portrait first, real photo last (made by scripts/pixel_portrait.py).
// Shown at 192 px: each step divides it evenly (x3, x2, x1), so pixels stay sharp.
const FRAMES = [
  { src: "/about/portrait-pixel.png", pixelated: true }, // 64 px, 4 Game Boy colours
  { src: "/about/portrait-96.png", pixelated: true }, // 96 px, 8 greens
  { src: "/about/portrait-192.png", pixelated: true }, // 192 px, 16 real colours
  { src: "/about/portrait.jpg", pixelated: false }, // the photo
];
const LAST = FRAMES.length - 1;
const STEP_MS = 80;

/**
 * Shows the pixel portrait; hovering with the mouse (or holding a finger on it) "de-pixelates" it
 * into the real photo one step at a time, and steps back on leave / release. Not clickable.
 */
export function PixelPortrait({ size = 192 }: { size?: number }) {
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState(0);
  const lastPointer = useRef("mouse");
  const target = active ? LAST : 0;

  useEffect(() => {
    if (stage === target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(target); // no steps, switch instantly
      return;
    }
    const id = window.setTimeout(() => setStage((s) => s + Math.sign(target - s)), STEP_MS);
    return () => window.clearTimeout(id);
  }, [stage, target]);

  // Mouse: hover. Touch / pen: while the finger is held on the photo (a scroll or lift ends it).
  const isMouse = (e: PointerEvent) => e.pointerType === "mouse";
  const onEnter = (e: PointerEvent) => isMouse(e) && setActive(true);
  const onLeave = (e: PointerEvent) => isMouse(e) && setActive(false);
  const onDown = (e: PointerEvent) => {
    lastPointer.current = e.pointerType;
    if (!isMouse(e)) setActive(true);
  };
  const onRelease = (e: PointerEvent) => !isMouse(e) && setActive(false);
  // a long press would otherwise open the phone's "save image" menu
  const onContextMenu = (e: MouseEvent) => lastPointer.current !== "mouse" && e.preventDefault();

  return (
    <div
      className="portrait"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onContextMenu={onContextMenu}
    >
      {/* all frames stay mounted and stacked, so they are preloaded and nothing shifts */}
      {FRAMES.map((frame, i) => (
        <img
          key={frame.src}
          src={frame.src}
          width={size}
          height={size}
          alt={i === LAST ? "Photo of Amin" : ""}
          draggable={false}
          className={`portrait-frame${frame.pixelated ? " portrait-frame--pixel" : ""}${i === stage ? " is-shown" : ""}`}
        />
      ))}
    </div>
  );
}
