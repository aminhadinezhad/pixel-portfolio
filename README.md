# Amin Hadinezhad — Pocket Portfolio

A Game Boy–style pixel-art portfolio built with Next.js (App Router), React and TypeScript.
Plain CSS, no UI libraries.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Edit the content

All text lives in [`data/content.ts`](data/content.ts): name, bio, skills, projects, contact links,
the Home screen and the Snake game labels.

- **Résumé:** put your PDF at `public/resume.pdf`. The "Download resume" buttons appear automatically.
- **Portrait:** `python scripts/pixel_portrait.py <photo.jpg>` (needs Pillow) regenerates the pixel
  portrait images in `public/about/`.

## Structure

| Path | What |
|---|---|
| `app/globals.css` | All styles; the colour palette is at the top (`:root`) |
| `components/Portfolio.tsx` | Page layout, tabs, profile card |
| `components/Panel.tsx` | The right-hand panel screens |
| `components/PixelPortrait.tsx` | Pixel portrait that reveals the photo on hover / touch |
| `components/SnakeGame.tsx` | The Snake mini-game |
| `components/BackToTop.tsx` | Back-to-top button (phones) |
| `components/icons.tsx` | UI icons ([Pixelarticons](https://pixelarticons.com), MIT) |
| `lib/sfx.ts` | 8-bit sound effects (Web Audio, no audio files) and the mute switch |

## Credits

- Icons: [Pixelarticons](https://pixelarticons.com) by Gerrit Halfmann (MIT)
- Fonts: Rooyin, IBM Plex Mono
