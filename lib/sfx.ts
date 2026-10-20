// 8-bit sound effects, synthesised with the Web Audio API (no audio files).
// One shared on/off switch: the sound button, every button and the Snake game all use it.

export type Sfx = "click" | "select" | "soundOn" | "start" | "eat" | "pause" | "gameOver";

type Note = {
  freq: number;
  /** seconds */
  dur: number;
  wave?: OscillatorType;
  /** slide the pitch to this frequency over the note */
  to?: number;
  /** 0-1, relative to the master volume */
  vol?: number;
};

// Square waves = Game Boy pulse channel. Frequencies are musical notes (C5 = 523 Hz, ...).
const SOUNDS: Record<Sfx, Note[]> = {
  // links and plain buttons: a tiny tick
  click: [{ freq: 1200, to: 900, dur: 0.035, vol: 0.6 }],
  // switching section: bright two-note blip (E5 -> B5)
  select: [
    { freq: 659, dur: 0.05 },
    { freq: 988, dur: 0.07 },
  ],
  // sound switched back on: rising arpeggio (C5 E5 G5 C6)
  soundOn: [
    { freq: 523, dur: 0.06 },
    { freq: 659, dur: 0.06 },
    { freq: 784, dur: 0.06 },
    { freq: 1047, dur: 0.1 },
  ],
  // Snake
  start: [
    { freq: 392, dur: 0.07 },
    { freq: 523, dur: 0.07 },
    { freq: 659, dur: 0.07 },
    { freq: 784, dur: 0.12 },
  ],
  eat: [
    { freq: 988, dur: 0.05 },
    { freq: 1319, dur: 0.1 },
  ],
  pause: [
    { freq: 784, dur: 0.07 },
    { freq: 523, dur: 0.1 },
  ],
  gameOver: [
    { freq: 494, dur: 0.13 },
    { freq: 440, dur: 0.13 },
    { freq: 392, dur: 0.13 },
    { freq: 330, to: 110, dur: 0.4, wave: "triangle", vol: 1 },
  ],
};

const MASTER_VOLUME = 0.1; // square waves are loud; keep it playful, not annoying
const STORAGE_KEY = "sound";

let enabled = true;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const listeners = new Set<() => void>();

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(ctx.destination);
  }
  // browsers start audio suspended until a user gesture; every play() comes from one
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function playSfx(name: Sfx) {
  if (!enabled) return;
  const ac = audio();
  if (!ac || !master) return;

  let t = ac.currentTime + 0.01;
  for (const note of SOUNDS[name]) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = note.wave ?? "square";
    osc.frequency.setValueAtTime(note.freq, t);
    if (note.to) osc.frequency.exponentialRampToValueAtTime(note.to, t + note.dur);
    // tiny attack / release so notes don't click
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(note.vol ?? 1, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + note.dur);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + note.dur + 0.02);
    t += note.dur;
  }
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable: the choice just isn't remembered */
  }
  if (!on) void ctx?.suspend(); // cut anything that is still playing
  listeners.forEach((notify) => notify());
}

/** Restore the saved on/off choice (call once on the client). */
export function loadSoundPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      enabled = saved === "on";
      listeners.forEach((notify) => notify());
    }
  } catch {
    /* ignore */
  }
}

export function subscribeSound(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
