# -*- coding: utf-8 -*-
"""Grafika kryesore e Play Store-it: 1024x500, pa tejdukshmeri."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = r"C:\Users\emanuela\Desktop\artegogoapp\public\icon-512.png"
OUT = r"C:\Users\emanuela\Desktop\ikonat-dyqani"
W, H = 1024, 500
A, B = (124, 92, 224), (90, 140, 224)

bg = Image.new("RGB", (W, H))
px = bg.load()
mx = (W - 1) + (H - 1)
for y in range(H):
    for x in range(W):
        t = (x + y) / mx
        px[x, y] = (round(A[0] + (B[0] - A[0]) * t),
                    round(A[1] + (B[1] - A[1]) * t),
                    round(A[2] + (B[2] - A[2]) * t))

# figura e logos, e nxjerre si maske e bute (si te ikona)
src = Image.open(SRC).convert("RGBA")
r, _, _, a = src.split()
LO, HI = 150, 250
soft = r.point(lambda v: 0 if v <= LO else (255 if v >= HI else round((v - LO) * 255 / (HI - LO))))
mask = Image.composite(soft, Image.new("L", src.size, 0), a.point(lambda v: 255 if v > 200 else 0))
glyph = mask.crop(mask.point(lambda v: 255 if v > 8 else 0).getbbox())

target = 215
gw, gh = glyph.size
s = target / max(gw, gh)
gm = glyph.resize((round(gw * s), round(gh * s)), Image.LANCZOS)
gm = gm.filter(ImageFilter.GaussianBlur(1.6))
lo, hi = 86, 170
gm = gm.point(lambda v: 0 if v <= lo else (255 if v >= hi else round((v - lo) * 255 / (hi - lo))))
mark_x = 150
bg.paste(Image.new("RGB", gm.size, (255, 255, 255)),
         (mark_x, (H - gm.size[1]) // 2), gm)

d = ImageDraw.Draw(bg)
F = r"C:\Windows\Fonts"
titulli = ImageFont.truetype(os.path.join(F, "segoeuib.ttf"), 92)
nenti = ImageFont.truetype(os.path.join(F, "segoeui.ttf"), 38)

tx = mark_x + gm.size[0] + 72
d.text((tx, 196), "Arte Gogo", font=titulli, fill=(255, 255, 255), anchor="ls")
d.text((tx, 262), "Meditim në gjuhën tënde", font=nenti, fill=(255, 255, 255), anchor="ls")
d.line([(tx, 296), (tx + 92, 296)], fill=(255, 255, 255), width=4)
d.text((tx, 356), "Qetësi · gjumë · fokus · frymëmarrje",
       font=ImageFont.truetype(os.path.join(F, "segoeui.ttf"), 30),
       fill=(238, 236, 255), anchor="ls")

p = os.path.join(OUT, "grafika-kryesore-1024x500.png")
bg.save(p, "PNG", optimize=True)
chk = Image.open(p)
print(os.path.basename(p), chk.size, chk.mode, os.path.getsize(p), "bajt")
print("gjeresia e titullit:", d.textlength("Arte Gogo", font=titulli), "fundi:", tx + d.textlength("Arte Gogo", font=titulli))
