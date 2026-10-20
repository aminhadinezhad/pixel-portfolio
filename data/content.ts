// All editable site content lives here.

export type SectionId = "bio" | "skills" | "projects" | "contact";

export const profile = {
  name: "Amin Hadinezhad",
  role: "Frontend Developer",
  greeting: ["Hello!", "Welcome to my web portfolio."],
  footer: "Amin Hadinezhad · amin.dev · © 2026", // under the card on desktop, at the page bottom on phones
};

export const sections: { id: SectionId; label: string; title: string }[] = [
  { id: "bio", label: "Bio", title: "Bio" },
  { id: "skills", label: "Skills", title: "Skills" },
  { id: "projects", label: "Projects", title: "Projects" },
  { id: "contact", label: "Contact", title: "Contacts" },
];

// Home (Start) screen
export const home = {
  title: "Start",
  text: "Frontend developer building clean, responsive interfaces with React and Next.js.",
  contactCta: "Contact me",
  playCta: "> PLAY SNAKE",
};

// Résumé: put your PDF at public/resume.pdf and the download buttons appear automatically.
export const resume = {
  file: "resume.pdf",
  downloadName: "Amin-Hadinezhad-Resume.pdf",
  label: "Download resume",
};

// Snake mini-game, opened from the gamepad button (top right)
export const game = {
  name: "Snake",
  open: "Play Snake",
  score: "SCORE",
  best: "BEST",
  start: "PRESS SPACE",
  tapStart: "TAP TO START",
  paused: "PAUSED",
  over: "GAME OVER",
  hint: "Space to start / pause · Arrow keys or WASD to move",
  touchHint: "Tap to start · Swipe to move",
};

export const bio = {
  paragraphs: [
    "Hi, I’m Amin — a frontend developer at Karan Tamin Falat, building interfaces for a B2B supplier of office and hygiene products.",
    "I’m also doing my M.Sc. in Software Engineering at Elm va Farhang University, and leveling up into full-stack one quest at a time.",
  ],
  tags: ["LVL 25", "CLASS: FRONTEND", "BASE: IRAN"],
};

/** level is out of 10 */
export const skills: { label: string; level: number }[] = [
  { label: "HTML / CSS", level: 9 },
  { label: "JavaScript", level: 8 },
  { label: "React / Next", level: 7 },
  { label: "Bootstrap", level: 8 },
  { label: "PHP / Laravel", level: 6 },
  { label: "Git / Linux", level: 5 },
];

// TODO: replace the placeholder links with each project's repo / demo URL.
export const projects: { title: string; description: string; href: string }[] = [
  { title: "omarket", description: "Laravel e-commerce store", href: "https://github.com/aminhadinezhad" },
  { title: "Bale Bot", description: "PHP messenger bot on a VPS", href: "https://github.com/aminhadinezhad" },
  { title: "Pre-Invoice", description: "Cart that builds a PDF pre-invoice", href: "https://github.com/aminhadinezhad" },
  { title: "NoteKeeper", description: "PHP notes app with auth", href: "https://github.com/aminhadinezhad" },
];

// TODO: replace the email, LinkedIn and Telegram placeholders.
export const contact: {
  intro: string;
  links: { label: string; href: string; primary?: boolean }[];
} = {
  intro: "Open to freelance quests, full-time roles and team-ups.",
  links: [
    { label: "Email", href: "mailto:you@example.com" },
    { label: "GitHub", href: "https://github.com/aminhadinezhad" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle" },
    { label: "Telegram", href: "https://t.me/your-handle" },
  ],
};
