"use client";

import { useCallback, useEffect, useState } from "react";
import { game, profile, sections, type SectionId } from "@/data/content";
import { useSound } from "@/hooks/useSound";
import { BackToTop } from "./BackToTop";
import { PANEL_ID, Panel, type Screen } from "./Panel";
import { Icon, type IconName } from "./icons";
import { PixelPortrait } from "./PixelPortrait";
import { MORTAR, WALL } from "./pixelArt";

// Same breakpoint as the CSS that stacks the panel under the card.
const STACKED = "(max-width: 800px)";

const TAB_ICONS: Record<SectionId, IconName> = {
  bio: "user",
  skills: "star",
  projects: "folder",
  contact: "mail",
};

export default function Portfolio({ resumeHref }: { resumeHref: string | null }) {
  const [screen, setScreen] = useState<Screen>("start");
  const { enabled: soundOn, toggle: toggleSound, play } = useSound();

  const go = useCallback(
    (next: Screen) => {
      setScreen(next);
      play("select");
    },
    [play],
  );

  // On phones the panel sits below the card, so the tabs and top buttons scroll down to it.
  const [scrollRequest, setScrollRequest] = useState(0);
  const openSection = (id: Screen) => {
    go(id);
    if (window.matchMedia(STACKED).matches) setScrollRequest((n) => n + 1);
  };

  useEffect(() => {
    if (!scrollRequest) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(PANEL_ID)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [scrollRequest]);

  return (
    <div className="scene">
      {/* brick wall */}
      <svg className="bricks" aria-hidden="true" focusable="false" width="100%" height="100%">
        <defs>
          <pattern id="brick" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" fill={WALL} />
            <path d="M0 1H48M0 25H48M1 0V24M25 24V48" stroke={MORTAR} strokeWidth="2" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#brick)" />
      </svg>

      <header className="corners">
        <div className="corners-left">
          <button type="button" className="corner-btn" aria-label="Home" onClick={() => openSection("start")}>
            <Icon name="home" />
          </button>
          <button type="button" className="corner-btn" aria-label="About me" onClick={() => openSection("bio")}>
            <Icon name="info" />
          </button>
        </div>
        <div className="corners-right">
          <button
            type="button"
            className="corner-btn"
            aria-label="Sound"
            aria-pressed={soundOn}
            onClick={toggleSound}
          >
            <Icon name={soundOn ? "volume2" : "volumeX"} />
          </button>
          <button
            type="button"
            className="corner-btn"
            aria-label={game.open}
            aria-pressed={screen === "game"}
            onClick={() => openSection("game")}
          >
            <Icon name="gamepad" />
          </button>
        </div>
      </header>

      <main className="stage">
        <div className="stage-inner">
          <div className="left-col">
            <div className="bubble">
              {profile.greeting.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <div className="card-row">
              <nav className="tabs" aria-label="Sections">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="tab"
                    aria-pressed={screen === s.id}
                    onClick={() => openSection(s.id)}
                  >
                    <Icon name={TAB_ICONS[s.id]} />
                    <span>{s.label}</span>
                  </button>
                ))}
              </nav>

              <div className="card">
                <div className="avatar">
                  <PixelPortrait />
                </div>
                <h1 className="card-name">{profile.name}</h1>
                <p className="card-role">{profile.role}</p>
              </div>
            </div>

            <p className="footer">{profile.footer}</p>
          </div>

          <Panel screen={screen} resumeHref={resumeHref} onNavigate={go} />
        </div>
      </main>

      <footer className="site-footer">{profile.footer}</footer>
      <BackToTop />
    </div>
  );
}
