import { bio, contact, game, home, projects, resume, sections, skills, type SectionId } from "@/data/content";
import { Icon } from "./icons";
import { SnakeGame } from "./SnakeGame";

export type Screen = "start" | "game" | SectionId;

type Props = {
  screen: Screen;
  /** null until public/resume.pdf exists */
  resumeHref: string | null;
  onNavigate: (screen: Screen) => void;
};

const isExternal = (href: string) => /^https?:\/\//.test(href);
const externalProps = (href: string) =>
  isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

function ResumeButton({ href }: { href: string }) {
  return (
    <a href={href} download={resume.downloadName} type="application/pdf" className="contact-btn contact-btn--primary">
      <Icon name="download" />
      {resume.label}
    </a>
  );
}

export function Panel({ screen, resumeHref, onNavigate }: Props) {
  // The game screen is just the board, no heading.
  if (screen === "game") {
    return (
      <section className="panel" aria-label={game.name}>
        <SnakeGame />
      </section>
    );
  }

  const title = screen === "start" ? home.title : sections.find((s) => s.id === screen)!.title;

  return (
    <section className="panel" aria-live="polite" aria-labelledby="panel-title">
      <h2 id="panel-title" className="panel-title">
        {title}
      </h2>

      {screen === "start" && (
        <>
          <p className="narrow">{home.text}</p>
          <div className="home-actions">
            {resumeHref && <ResumeButton href={resumeHref} />}
            <button type="button" className="contact-btn" onClick={() => onNavigate("contact")}>
              {home.contactCta}
            </button>
          </div>
          <button type="button" className="text-link" onClick={() => onNavigate("game")}>
            {home.playCta}
          </button>
        </>
      )}

      {screen === "bio" && (
        <>
          {bio.paragraphs.map((p) => (
            <p key={p} className="left">
              {p}
            </p>
          ))}
          <ul className="tags">
            {bio.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
          {resumeHref && <ResumeButton href={resumeHref} />}
        </>
      )}

      {screen === "skills" && (
        <ul className="skills">
          {skills.map(({ label, level }) => (
            <li key={label} className="skill">
              <span>{label}</span>
              <span className="bar" role="img" aria-label={`${level} out of 10`}>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={i < level ? "seg seg--on" : "seg"} />
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}

      {screen === "projects" && (
        <ul className="projects">
          {projects.map((p) => (
            <li key={p.title} className="project">
              <span>
                <strong className="project-title">{p.title}</strong>
                <br />
                <span className="project-desc">{p.description}</span>
              </span>
              <a href={p.href} className="project-link" aria-label={`Open ${p.title}`} {...externalProps(p.href)}>
                &gt; OPEN
              </a>
            </li>
          ))}
        </ul>
      )}

      {screen === "contact" && (
        <>
          <p className="narrow">{contact.intro}</p>
          <div className="contact-links">
            {contact.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={link.primary ? "contact-btn contact-btn--primary" : "contact-btn"}
                {...externalProps(link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
