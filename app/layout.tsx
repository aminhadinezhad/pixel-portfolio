import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const rooyin = localFont({
  src: [
    { path: "./fonts/RooyinFree-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RooyinFree-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-rooyin",
  display: "swap",
});

const plexMono = localFont({
  src: [{ path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Amin — Pocket Portfolio",
  description: "Amin Hadinezhad, frontend developer. A Game Boy–style pixel portfolio.",
};

export const viewport: Viewport = {
  themeColor: "#d4e7b0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${rooyin.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
