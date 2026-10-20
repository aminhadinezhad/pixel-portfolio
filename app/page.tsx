import { existsSync } from "node:fs";
import path from "node:path";
import Portfolio from "@/components/Portfolio";
import { resume } from "@/data/content";

export default function Home() {
  // Only offer the download once the PDF is actually in /public, so the button never 404s.
  const hasResume = existsSync(path.join(process.cwd(), "public", resume.file));
  return <Portfolio resumeHref={hasResume ? `/${resume.file}` : null} />;
}
