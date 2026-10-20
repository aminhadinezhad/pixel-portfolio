"""Turn a photo into the Game Boy–style pixel portrait used by <PixelPortrait />.

    python scripts/pixel_portrait.py assets/me.jpg

Writes to public/about/:
  portrait.jpg          clean square crop (head + shoulders)
  portrait-pixel.png    64x64, 4 Game Boy colours, upscaled x10 with nearest-neighbour
  portrait-64.png       the same 64x64 at native size
  portrait-96.png       96x96, 8 shades of the Game Boy green ramp
  portrait-192.png      192x192, 16 real colours from the photo
and comparison images to assets/pixel-portrait/ (grayscale variant, 48/64/96 sizes, compare.png).

The site shows it in a 192 px box; every step divides 192 evenly (x3, x2, x1) so pixels stay sharp.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

# darkest -> lightest
GAMEBOY = ["#1c2e1a", "#3d5a2e", "#a9c77a", "#e3f1c4"]
GRAY = ["#000000", "#555555", "#aaaaaa", "#ffffff"]
DISPLAY = 192  # px box on the site
PIXEL_SIZE = 64  # 192 / 3
MID_SIZE = 96  # 192 / 2
PIXEL_SCALE = 10  # 64 x 10 = 640 px
COMPARE_SIZES = (48, 64, 96)

ROOT = Path(__file__).resolve().parent.parent

RGB = tuple[int, int, int]


def hex_rgb(value: str) -> RGB:
    value = value.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16))


def ramp(stops: list[str], count: int) -> list[RGB]:
    """`count` colours evenly spread along the given colour stops (piecewise linear)."""
    rgb = [hex_rgb(s) for s in stops]
    out: list[RGB] = []
    for i in range(count):
        t = i / (count - 1) * (len(rgb) - 1)
        a, b = rgb[int(t)], rgb[min(int(t) + 1, len(rgb) - 1)]
        f = t - int(t)
        out.append((round(a[0] + (b[0] - a[0]) * f), round(a[1] + (b[1] - a[1]) * f), round(a[2] + (b[2] - a[2]) * f)))
    return out


def square_crop(img: Image.Image, face: tuple[float, float], size: float) -> Image.Image:
    """Square of `size` x image width, centred on `face` (fractions of width/height), kept inside the photo."""
    w, h = img.size
    side = round(min(w, h, size * w))
    left = max(0, min(round(face[0] * w - side / 2), w - side))
    top = max(0, min(round(face[1] * h - side / 2), h - side))
    return img.crop((left, top, left + side, top + side))


def shades(gray: Image.Image, cuts: list[int], palette: list[RGB]) -> Image.Image:
    """Map 0-255 luminance to len(cuts)+1 shades (0 = darkest) as a paletted image."""

    def level(v: int) -> int:
        for i, cut in enumerate(cuts):
            if v < cut:
                return i
        return len(cuts)

    img = gray.point(level)
    img.putpalette([c for rgb in palette for c in rgb])
    return img


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("photo", type=Path)
    parser.add_argument("--face", default="0.60,0.20", help="face centre as x,y fractions of the photo")
    parser.add_argument("--size", type=float, default=0.55, help="crop side as a fraction of the photo width")
    parser.add_argument("--contrast", type=float, default=1.25)
    parser.add_argument("--thresholds", default="60,115,175", help="3 luminance cut points between the 4 shades")
    args = parser.parse_args()

    face = tuple(float(v) for v in args.face.split(","))
    cuts4 = [int(v) for v in args.thresholds.split(",")]
    site = ROOT / "public" / "about"
    compare = ROOT / "assets" / "pixel-portrait"
    site.mkdir(parents=True, exist_ok=True)
    compare.mkdir(parents=True, exist_ok=True)

    photo = ImageOps.exif_transpose(Image.open(args.photo)).convert("RGB")
    crop = square_crop(photo, face, args.size)  # type: ignore[arg-type]
    # Saved at its real resolution: upscaling would only add blur, it is shown at 192 px.
    crop.save(site / "portrait.jpg", quality=90, optimize=True)

    gray = ImageEnhance.Contrast(ImageOps.autocontrast(crop.convert("L"), cutoff=1)).enhance(args.contrast)
    gb4 = [hex_rgb(c) for c in GAMEBOY]

    def pixel(n: int, palette: list[RGB]) -> Image.Image:
        return shades(gray.resize((n, n), Image.Resampling.BOX), cuts4, palette)

    # --- site images ---------------------------------------------------------
    base = pixel(PIXEL_SIZE, gb4)
    base.save(site / f"portrait-{PIXEL_SIZE}.png", optimize=True)
    base.resize((PIXEL_SIZE * PIXEL_SCALE,) * 2, Image.Resampling.NEAREST).save(site / "portrait-pixel.png", optimize=True)

    # middle step: 8 shades along the Game Boy ramp (cuts spread between the 4-shade cuts)
    lo, hi = cuts4[0] - 20, cuts4[-1] + 30
    cuts8 = [round(lo + (hi - lo) * i / 6) for i in range(7)]
    shades(gray.resize((MID_SIZE, MID_SIZE), Image.Resampling.BOX), cuts8, ramp(GAMEBOY, 8)).save(
        site / f"portrait-{MID_SIZE}.png", optimize=True
    )

    # last step before the photo: real colours, posterised to 16
    full = ImageEnhance.Contrast(crop).enhance(1.1).resize((DISPLAY, DISPLAY), Image.Resampling.BOX)
    full.quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(
        site / f"portrait-{DISPLAY}.png", optimize=True
    )

    # --- comparison images -------------------------------------------------
    gray4 = [hex_rgb(c) for c in GRAY]
    pixel(PIXEL_SIZE, gray4).resize((PIXEL_SIZE * PIXEL_SCALE,) * 2, Image.Resampling.NEAREST).save(
        compare / "portrait-pixel-gray.png", optimize=True
    )
    tiles: list[Image.Image] = []
    for n in COMPARE_SIZES:
        for name, palette in (("gb", gb4), ("gray", gray4)):
            native = pixel(n, palette)
            native.save(compare / f"portrait-{n}-{name}.png", optimize=True)
            tiles.append(native.resize((320, 320), Image.Resampling.NEAREST).convert("RGB"))
    # top row Game Boy, bottom row gray; 48 / 64 / 96 from left to right
    sheet = Image.new("RGB", (320 * 3 + 16 * 4, 320 * 2 + 48), gb4[3])
    for i, tile in enumerate(tiles):
        col, row = divmod(i, 2)
        sheet.paste(tile, (16 + col * 336, 16 + row * 336))
    sheet.save(compare / "compare.png")

    print(f"wrote {site} and {compare}")


if __name__ == "__main__":
    main()
