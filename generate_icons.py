"""Generate SecuPRO PWA icons (192x192 and 512x512)."""
from PIL import Image, ImageDraw
import math, os

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def make_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # ── Gradient background (blue → purple, diagonal) ──────────────────────
    blue   = (37,  99, 235)   # #2563EB
    purple = (124, 58, 237)   # #7C3AED

    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size - 2)
            r, g, b = lerp_color(blue, purple, t)
            img.putpixel((x, y), (r, g, b, 255))

    # ── Rounded corners mask ────────────────────────────────────────────────
    radius = int(size * 0.22)
    mask = Image.new('L', (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.putalpha(mask)

    # ── Shield shape (white) ────────────────────────────────────────────────
    draw = ImageDraw.Draw(img)
    s = size

    # Shield polygon coordinates (normalised × size)
    # A flat-top heraldic shield with a slight curve feel via extra points
    pad   = 0.185   # horizontal padding
    top   = 0.195   # top y
    mid_y = 0.545   # widest point y  (sides start converging below here)
    bot   = 0.835   # tip y

    # Control the arch at the top: two inner top corners slightly raised
    arch  = 0.040   # how much the top-center is raised above the top corners

    pts = [
        (pad,        top),              # top-left
        (0.5,        top - arch),       # top-center (arch peak)
        (1 - pad,    top),              # top-right
        (1 - pad,    mid_y),            # right side mid
        (0.5,        bot),              # bottom tip
        (pad,        mid_y),            # left side mid
    ]

    shield = [(round(px * s), round(py * s)) for px, py in pts]
    draw.polygon(shield, fill=(255, 255, 255, 230))

    # ── Inner shield accent (subtle semi-transparent white) ─────────────────
    inner_scale = 0.58
    cx, cy = s * 0.5, s * 0.5
    inner = []
    for px, py in pts:
        ix = cx + (px * s - cx) * inner_scale
        iy = cy + (py * s - cy) * inner_scale
        inner.append((round(ix), round(iy)))
    draw.polygon(inner, fill=(255, 255, 255, 55))

    return img


for sz in [192, 512]:
    icon = make_icon(sz)
    path = os.path.join('icons', f'icon-{sz}.png')
    icon.save(path, 'PNG')
    print(f'OK {path} ({sz}x{sz})')
