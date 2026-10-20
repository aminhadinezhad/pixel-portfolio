"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { game as text } from "@/data/content";
import { playSfx } from "@/lib/sfx";
import { INK, MOSS, PAPER } from "./pixelArt";

const COLS = 25;
const ROWS = 18;
const BEST_KEY = "snake-best";

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
type Status = "idle" | "playing" | "paused" | "over";
type Game = { snake: Point[]; dir: Dir; food: Point; score: number; status: Status };

const VEC: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
// Physical key positions (e.code), so WASD works whatever the keyboard language (e.g. Persian layout).
const KEYS: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right",
};

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

// Fixed starting state so server and client render the same board.
const START: Game = {
  snake: [{ x: 5, y: 13 }, { x: 4, y: 13 }, { x: 3, y: 13 }], // below the start label
  dir: "right",
  food: { x: 12, y: 13 },
  score: 0,
  status: "idle",
};

function placeFood(snake: Point[]): Point | null {
  const free: Point[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) if (!snake.some((p) => p.x === x && p.y === y)) free.push({ x, y });
  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
}

function step(g: Game, dir: Dir): Game {
  const head = { x: g.snake[0].x + VEC[dir].x, y: g.snake[0].y + VEC[dir].y };
  const eats = same(head, g.food);
  const body = eats ? g.snake : g.snake.slice(0, -1);
  const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
  if (hitWall || body.some((p) => same(p, head))) return { ...g, dir, status: "over" };

  const snake = [head, ...body];
  if (!eats) return { ...g, snake, dir };
  const food = placeFood(snake);
  return food
    ? { ...g, snake, dir, food, score: g.score + 1 }
    : { ...g, snake, dir, score: g.score + 1, status: "over" }; // filled the board
}

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function SnakeGame() {
  const [game, setGame] = useState<Game>(START);
  const [best, setBest] = useState(0);
  const gameRef = useRef(game);
  const turns = useRef<Dir[]>([]);
  const swipe = useRef<Point | null>(null);

  const commit = useCallback((next: Game) => {
    gameRef.current = next;
    setGame(next);
  }, []);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      /* storage unavailable: best score just isn't remembered */
    }
  }, []);

  // Save a new best score when a run ends.
  useEffect(() => {
    if (game.status !== "over" || game.score <= best) return;
    setBest(game.score);
    try {
      localStorage.setItem(BEST_KEY, String(game.score));
    } catch {
      /* ignore */
    }
  }, [game.status, game.score, best]);

  // starts a new run, or resumes a paused one
  const start = useCallback(() => {
    turns.current = [];
    const base = gameRef.current.status === "paused" ? gameRef.current : START;
    playSfx("start");
    commit({ ...base, status: "playing" });
  }, [commit]);

  const turn = useCallback((dir: Dir) => {
    const queue = turns.current;
    const last = queue[queue.length - 1] ?? gameRef.current.dir;
    if (dir !== last && dir !== OPPOSITE[last] && queue.length < 3) queue.push(dir);
  }, []);

  // Game loop: speeds up a little with every point.
  const speed = Math.max(70, 150 - game.score * 4);
  useEffect(() => {
    if (game.status !== "playing") return;
    const id = window.setInterval(() => {
      const dir = turns.current.shift() ?? gameRef.current.dir;
      const prev = gameRef.current;
      const next = step(prev, dir);
      if (next.status === "over") playSfx("gameOver");
      else if (next.score > prev.score) playSfx("eat");
      commit(next);
    }, speed);
    return () => window.clearInterval(id);
  }, [game.status, speed, commit]);

  // Space starts / pauses / restarts. Arrows are only taken over while a run is playing.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return;
      const g = gameRef.current;
      if (e.code === "Space") {
        e.preventDefault(); // also stops Space from pressing whichever button has focus
        if (e.repeat) return;
        if (g.status === "playing") {
          playSfx("pause");
          commit({ ...g, status: "paused" });
        } else start();
      } else if (KEYS[e.code] && g.status === "playing") {
        e.preventDefault();
        turn(KEYS[e.code]);
      }
    };
    // a focused button would otherwise be clicked on Space keyup
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTypingTarget(e.target)) e.preventDefault();
    };
    const onHide = () => {
      if (document.hidden && gameRef.current.status === "playing") commit({ ...gameRef.current, status: "paused" });
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [commit, start, turn]);

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const from = swipe.current;
    swipe.current = null;
    if (!from || gameRef.current.status !== "playing") return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const { snake, food, status, score, dir } = game;
  const head = snake[0];
  // the eye sits on the leading edge of the head
  const eye = { x: head.x + (dir === "right" ? 0.625 : dir === "left" ? 0.125 : 0.375), y: head.y + (dir === "down" ? 0.625 : dir === "up" ? 0.125 : 0.375) };

  return (
    // the panel is aria-live; keep per-tick score changes out of it
    <div className="snake" aria-live="off">
      <div className="snake-hud">
        <span>
          {text.score} {score}
        </span>
        <span>
          {text.best} {Math.max(best, score)}
        </span>
      </div>

      <div
        className={status === "playing" ? "snake-board snake-board--playing" : "snake-board"}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <svg
          viewBox={`0 0 ${COLS} ${ROWS}`}
          shapeRendering="crispEdges"
          role="img"
          aria-label={`${text.name}: score ${score}`}
        >
          <g fill={MOSS}>
            <rect x={food.x + 0.25} y={food.y + 0.125} width={0.5} height={0.75} />
            <rect x={food.x + 0.125} y={food.y + 0.25} width={0.75} height={0.5} />
          </g>
          <g fill={INK}>
            {snake.map((p, i) => (
              <rect key={i} x={p.x + 0.0625} y={p.y + 0.0625} width={0.875} height={0.875} />
            ))}
          </g>
          <rect x={eye.x} y={eye.y} width={0.25} height={0.25} fill={PAPER} />
        </svg>

        {status !== "playing" && (
          <button type="button" className="snake-overlay" onClick={start}>
            {status === "over" && <span className="snake-label">{text.over}</span>}
            {status === "paused" && <span className="snake-label">{text.paused}</span>}
            <span className="snake-label snake-blink only-keys">{text.start}</span>
            <span className="snake-label snake-blink only-touch">{text.tapStart}</span>
          </button>
        )}
      </div>

      <p className="snake-hint">
        <span className="only-keys">{text.hint}</span>
        <span className="only-touch">{text.touchHint}</span>
      </p>
    </div>
  );
}
