#!/usr/bin/env python3
"""Ledger of Coverage — promo plates for ghl-mcp-server. Renders at 2x, downscales."""
from PIL import Image, ImageDraw, ImageFont
import random, os

FD = "<path to canvas-fonts dir>"
OUT = os.path.dirname(os.path.abspath(__file__))

BG      = (18, 16, 14)
PANEL   = (28, 25, 22)
LINE    = (58, 51, 42)
GOLD    = (217, 164, 65)
GOLDS   = (234, 199, 126)
INK     = (243, 237, 226)
DIM     = (184, 172, 152)
FAINT   = (125, 114, 100)
EMBER   = (198, 95, 78)
BLUE    = (111, 159, 200)
VIOLET  = (165, 140, 196)

def F(name, size): return ImageFont.truetype(os.path.join(FD, name), size)

def tracked(d, xy, text, font, fill, tracking=0, anchor_mid=False):
    """Draw letterspaced text. Returns end x. If anchor_mid, xy is center."""
    widths = [d.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x, y = xy
    if anchor_mid: x -= total / 2
    for ch, w in zip(text, widths):
        d.text((x, y), ch, font=font, fill=fill)
        x += w + tracking
    return x

def rule(d, x0, y, x1, fill=LINE, w=2): d.line([(x0, y), (x1, y)], fill=fill, width=w)

# deterministic exception positions among 667 marks (23 x 29 = 667, exact)
rng = random.Random(667)
EXC = set(rng.sample(range(667), 16))

def census(d, ox, oy, cols, rows, pitch, r, exc_r_scale=1.0):
    """the field of 667 marks; 16 dimmed embers"""
    i = 0
    for row in range(rows):
        for col in range(cols):
            cx, cy = ox + col * pitch, oy + row * pitch
            if i in EXC:
                rr = r * exc_r_scale
                d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=EMBER, width=3)
            else:
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOLD)
            i += 1

# ---------------------------------------------------------------- plate 1 (1600x900 @2x)
W, H = 3200, 1800
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

MX = 170  # margin
# header small caps
tracked(d, (MX, 150), "GHL-MCP-SERVER", F("GeistMono-Bold.ttf", 54), GOLDS, tracking=26)
tracked(d, (MX, 232), "AN MCP SERVER FOR THE ENTIRE GOHIGHLEVEL API", F("GeistMono-Regular.ttf", 38), FAINT, tracking=10)

# monument
big = F("BigShoulders-Bold.ttf", 700)
d.text((MX - 22, 330), "651", font=big, fill=GOLD)
bw = d.textlength("651", font=big)
tracked(d, (MX + bw + 30, 1010 - 210), "MCP", F("BigShoulders-Regular.ttf", 150), INK, tracking=6)
tracked(d, (MX + bw + 30, 1010 - 60), "TOOLS", F("BigShoulders-Regular.ttf", 150), INK, tracking=6)

rule(d, MX, 1135, 1560, fill=LINE, w=3)

# ledger lines
mono44 = F("GeistMono-Regular.ttf", 44)
rows = [
    ("667", "operations enumerated from 84 official OpenAPI specs"),
    ("100%", "of documented request fields exposed — schemas verbatim"),
    ("3+1", "API version tiers resolved per operation, never globally"),
    ("16", "exceptions — every gap itemized, none silent"),
]
y = 1210
for num, label in rows:
    d.text((MX, y), num, font=F("GeistMono-Bold.ttf", 44), fill=GOLDS)
    d.text((MX + 220, y), label, font=mono44, fill=DIM)
    y += 92

rule(d, MX, y + 26, 1560, fill=LINE, w=3)
tracked(d, (MX, y + 74), "GITHUB.COM/ZACKSCRIVEN/GHL-MCP-SERVER", F("GeistMono-Bold.ttf", 46), INK, tracking=8)

# census field, right side: 23 cols x 29 rows (pitch tightened so nothing collides)
pitch, r = 48, 10
cols, rows_n = 23, 29
fx = W - MX - (cols - 1) * pitch
fy = 150
census(d, fx, fy, cols, rows_n, pitch, r)
# annotation + legend under field (fits within canvas now)
ay = fy + (rows_n - 1) * pitch + 64
tracked(d, (fx, ay), "667 OPERATIONS = 23 x 29 MARKS", F("GeistMono-Regular.ttf", 32), FAINT, tracking=5)
ly = ay + 66
d.ellipse([fx, ly + 6, fx + 20, ly + 26], fill=GOLD)
d.text((fx + 36, ly), "registered", font=F("GeistMono-Regular.ttf", 32), fill=FAINT)
d.ellipse([fx + 420, ly + 6, fx + 440, ly + 26], outline=EMBER, width=3)
d.text((fx + 456, ly), "itemized exception", font=F("GeistMono-Regular.ttf", 32), fill=FAINT)

img = img.resize((1600, 900), Image.LANCZOS)
img.save(os.path.join(OUT, "promo-1-hero-1600x900.png"))

# ---------------------------------------------------------------- plate 2 (1080x1080 @2x)
W2, H2 = 2160, 2160
img2 = Image.new("RGB", (W2, H2), BG)
d = ImageDraw.Draw(img2)
MX2 = 150

tracked(d, (W2/2, 130), "THE LEDGER OF COVERAGE", F("GeistMono-Regular.ttf", 40), FAINT, tracking=16, anchor_mid=True)
tracked(d, (W2/2, 205), "GHL-MCP-SERVER", F("GeistMono-Bold.ttf", 58), GOLDS, tracking=22, anchor_mid=True)

# pipeline monuments: 84 -> 667 -> 651
py = 330
stops = [("84", "official\nOpenAPI specs"), ("667", "operations\nenumerated"), ("651", "MCP tools\nregistered")]
colw = (W2 - 2 * MX2) / 3
numf = F("BigShoulders-Bold.ttf", 290)
labf = F("GeistMono-Regular.ttf", 36)
for i, (num, lab) in enumerate(stops):
    cx = MX2 + colw * i + colw / 2
    nw = d.textlength(num, font=numf)
    d.text((cx - nw / 2, py), num, font=numf, fill=GOLD if i == 2 else INK)
    for j, ln in enumerate(lab.split("\n")):
        lw = d.textlength(ln, font=labf)
        d.text((cx - lw / 2, py + 330 + j * 48), ln, font=labf, fill=DIM)
    if i < 2:
        ax = MX2 + colw * (i + 1)
        d.line([(ax - 26, py + 190), (ax + 26, py + 190)], fill=GOLD, width=5)
        d.polygon([(ax + 26, py + 190), (ax + 2, py + 176), (ax + 2, py + 204)], fill=GOLD)

rule(d, MX2, py + 500, W2 - MX2, w=3)

# version tier bar (labels as a clean legend row — no collisions)
vy = py + 580
tracked(d, (MX2, vy), "VERSION HEADER, RESOLVED PER OPERATION", F("GeistMono-Regular.ttf", 36), FAINT, tracking=8)
tiers = [("v3", 494, GOLD), ("2021-07-28", 117, BLUE), ("2021-04-15", 10, VIOLET), ("none", 30, FAINT)]
bx, bw_total, bh = MX2, W2 - 2 * MX2, 84
x = bx
for name, n, col in tiers:
    w = bw_total * n / 651
    d.rectangle([x, vy + 70, x + max(w - 6, 8), vy + 70 + bh], fill=col)
    x += w
mono34 = F("GeistMono-Regular.ttf", 34)
lx = MX2
lyv = vy + 70 + bh + 26
for name, n, col in tiers:
    d.rectangle([lx, lyv + 6, lx + 22, lyv + 28], fill=col)
    lab = f"{name} · {n}"
    d.text((lx + 36, lyv), lab, font=mono34, fill=DIM)
    lx += 36 + d.textlength(lab, font=mono34) + 70

# census strip: two ranks of marks for visual weight
sy = vy + 320
tracked(d, (MX2, sy), "EVERY DOCUMENTED FIELD EXPOSED — NOTHING SILENTLY DROPPED", F("GeistMono-Regular.ttf", 36), FAINT, tracking=8)
pitch2, r2 = 62, 12
n_marks = int((W2 - 2 * MX2) // pitch2) + 1
rng2 = random.Random(16)
exc2 = set(rng2.sample(range(n_marks * 2), 3))
for rk in range(2):
    for i in range(n_marks):
        cx = MX2 + i * pitch2
        cy = sy + 110 + rk * 64
        idx = rk * n_marks + i
        if idx in exc2:
            d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], outline=EMBER, width=3)
        else:
            d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=GOLD)

rule(d, MX2, sy + 300, W2 - MX2, w=3)

# gate block
gy = sy + 380
d.rectangle([MX2, gy, MX2 + 34, gy + 34], outline=GOLDS, width=4)
d.line([(MX2 + 8, gy + 18), (MX2 + 15, gy + 26), (MX2 + 27, gy + 9)], fill=GOLDS, width=4)
d.text((MX2 + 58, gy - 4), "writes blocked by default — dry-run safety gate", font=F("GeistMono-Regular.ttf", 40), fill=DIM)
d.text((MX2 + 58, gy + 74), "TypeScript · stdio · multi-tenant · Ajv-validated", font=F("GeistMono-Regular.ttf", 40), fill=FAINT)
d.text((MX2 + 58, gy + 152), "16 exceptions itemized — zero silent gaps", font=F("GeistMono-Regular.ttf", 40), fill=FAINT)

rule(d, MX2, H2 - 250, W2 - MX2, w=3)
tracked(d, (W2/2, H2 - 180), "GITHUB.COM/ZACKSCRIVEN/GHL-MCP-SERVER", F("GeistMono-Bold.ttf", 48), INK, tracking=8, anchor_mid=True)

img2 = img2.resize((1080, 1080), Image.LANCZOS)
img2.save(os.path.join(OUT, "promo-2-ledger-1080x1080.png"))
print("rendered both plates")
