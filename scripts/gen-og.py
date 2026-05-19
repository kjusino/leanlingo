"""Generate the LeanLingo Open Graph card.

Renders a 1200×630 PNG matching the site's dark palette and wordmark:
the L∃∀nLingo wordmark in the green→cyan→purple gradient, a
": Lean 4 trainer" type-annotation tagline in cyan mono, and the
curriculum stat line under it.

Output: public/og.png
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

W, H = 1200, 630

# Palette — mirrors the site's dark theme.
BG = (13, 22, 38)            # --bg
BG_GLOW = (24, 36, 60)
TEXT_2 = (152, 166, 192)     # --text-2
TEXT_3 = (91, 106, 135)      # --text-3
LINK = (103, 232, 249)       # --link / mono accent

# Gradient stops for the wordmark — match the CSS linear-gradient.
GRAD = [
    (0.00, (88, 204, 2)),    # #58cc02 green
    (0.55, (34, 211, 238)),  # #22d3ee cyan
    (1.00, (192, 132, 252)), # #c084fc purple
]

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def sample_gradient(t: float) -> tuple:
    """Sample the brand gradient at t ∈ [0, 1]."""
    for (t0, c0), (t1, c1) in zip(GRAD[:-1], GRAD[1:]):
        if t <= t1:
            return lerp(c0, c1, (t - t0) / max(1e-9, t1 - t0))
    return GRAD[-1][1]


def build_gradient_image(w: int, h: int) -> Image.Image:
    g = Image.new("RGB", (w, h))
    px = g.load()
    for x in range(w):
        c = sample_gradient(x / max(1, w - 1))
        for y in range(h):
            px[x, y] = c
    return g


def gradient_text(text: str, font: ImageFont.FreeTypeFont) -> Image.Image:
    """Render `text` with the brand gradient on a transparent background."""
    # Render in white onto a mask layer the same size as the text bbox.
    dummy = Image.new("L", (1, 1))
    bbox = ImageDraw.Draw(dummy).textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = 8  # bleed in case the glyphs overflow the bbox slightly
    mask = Image.new("L", (tw + pad * 2, th + pad * 2), 0)
    ImageDraw.Draw(mask).text(
        (-bbox[0] + pad, -bbox[1] + pad), text, fill=255, font=font
    )

    grad = build_gradient_image(mask.width, mask.height)
    out = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Background glow — a soft radial behind the wordmark, hinting at the
    # gradient without taking over the card.
    glow = Image.new("RGB", (W, H), BG)
    glow_draw = ImageDraw.Draw(glow)
    cx, cy, r = W // 2, int(H * 0.42), 360
    for i in range(r, 0, -2):
        alpha = (1 - i / r) * 0.32
        c = lerp(BG, BG_GLOW, alpha)
        glow_draw.ellipse((cx - i, cy - i, cx + i, cy + i), fill=c)
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    img.paste(glow, (0, 0))
    draw = ImageDraw.Draw(img)

    # 1. λ chip — echoes the favicon. Centered above the wordmark.
    chip_size = 92
    chip_x = (W - chip_size) // 2
    chip_y = int(H * 0.18)
    chip = Image.new("RGBA", (chip_size, chip_size), (0, 0, 0, 0))
    ImageDraw.Draw(chip).rounded_rectangle(
        (0, 0, chip_size, chip_size), radius=22, fill=(15, 23, 42)
    )
    # outline in cyan
    ImageDraw.Draw(chip).rounded_rectangle(
        (1, 1, chip_size - 1, chip_size - 1),
        radius=22,
        outline=LINK,
        width=3,
    )
    lambda_font = ImageFont.truetype(FONT_BOLD, 56)
    lb = chip.getchannel("A")  # noqa: F841 (kept for clarity)
    # Centre the λ glyph in the chip.
    lb_draw = ImageDraw.Draw(chip)
    bbox = lb_draw.textbbox((0, 0), "λ", font=lambda_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    lb_draw.text(
        ((chip_size - tw) / 2 - bbox[0], (chip_size - th) / 2 - bbox[1] - 4),
        "λ",
        fill=LINK,
        font=lambda_font,
    )
    img.paste(chip, (chip_x, chip_y), chip)

    # 2. Wordmark L∃∀nLingo in the gradient.
    wordmark_font = ImageFont.truetype(FONT_BOLD, 150)
    word = gradient_text("L∃∀nLingo", wordmark_font)
    wx = (W - word.width) // 2
    wy = chip_y + chip_size + 32
    img.paste(word, (wx, wy), word)

    # 3. Lean-style type-annotation tagline ": Lean 4 trainer"
    tagline_font = ImageFont.truetype(FONT_MONO, 36)
    tagline = ": Lean 4 trainer"
    bb = draw.textbbox((0, 0), tagline, font=tagline_font)
    tx = (W - (bb[2] - bb[0])) // 2 - bb[0]
    ty = wy + word.height + 18
    draw.text((tx, ty), tagline, fill=LINK, font=tagline_font)

    # 4. Curriculum line
    stats_font = ImageFont.truetype(FONT_REG, 28)
    stats = "20 chapters  ·  149 lessons  ·  405 questions"
    bb = draw.textbbox((0, 0), stats, font=stats_font)
    sx = (W - (bb[2] - bb[0])) // 2 - bb[0]
    sy = ty + 60
    draw.text((sx, sy), stats, fill=TEXT_2, font=stats_font)

    # 5. Footer domain
    foot_font = ImageFont.truetype(FONT_MONO, 22)
    foot = "leanlingo.org"
    bb = draw.textbbox((0, 0), foot, font=foot_font)
    fx = (W - (bb[2] - bb[0])) // 2 - bb[0]
    fy = H - 70
    draw.text((fx, fy), foot, fill=TEXT_3, font=foot_font)

    out_dir = Path("public")
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / "og.png"
    img.save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
