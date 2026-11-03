# -*- coding: utf-8 -*-
"""Ikona e dyqaneve: sfond i plotë me gradient + figura e logos, pa tejdukshmëri."""
import os
from PIL import Image, ImageFilter

SRC = r"C:\Users\emanuela\Desktop\artegogoapp\public\icon-512.png"
OUT = r"C:\Users\emanuela\Desktop\ikonat-dyqani"
os.makedirs(OUT, exist_ok=True)

A = (124, 92, 224)   # lart-majtas
B = (90, 140, 224)   # poshtë-djathtas


def gradient(n):
    im = Image.new("RGB", (n, n))
    px = im.load()
    mx = 2 * (n - 1)
    for y in range(n):
        for x in range(n):
            t = (x + y) / mx
            px[x, y] = (round(A[0] + (B[0] - A[0]) * t),
                        round(A[1] + (B[1] - A[1]) * t),
                        round(A[2] + (B[2] - A[2]) * t))
    return im


src = Image.open(SRC).convert("RGBA")
r, _, _, a = src.split()

# Maskë e butë, jo prag: figura është e bardhë (R=255) mbi gradient (R=90..124),
# ndaj R-ja i ruan skajet e zbutura të burimit. Pragu i fortë i bënte me dhëmbëza.
LO, HI = 150, 250
soft = r.point(lambda v: 0 if v <= LO else (255 if v >= HI else round((v - LO) * 255 / (HI - LO))))
inside = a.point(lambda v: 255 if v > 200 else 0)
mask = Image.composite(soft, Image.new("L", src.size, 0), inside)

bbox = mask.point(lambda v: 255 if v > 8 else 0).getbbox()
print("kutia e figurës te burimi:", bbox, bbox[2] - bbox[0], "x", bbox[3] - bbox[1])
glyph = mask.crop(bbox)

for n, emri in ((1024, "ikona-1024-apple.png"), (512, "ikona-512-play.png")):
    bg = gradient(n)
    target = round(n * 0.52)          # figura zë 52% të anës
    gw, gh = glyph.size
    s = target / max(gw, gh)
    gm = glyph.resize((max(1, round(gw * s)), max(1, round(gh * s))), Image.LANCZOS)
    # Burimi ka vetem ~156 px: zmadhimi i nxjerr skajet me shkallëza. Zbutja e
    # bashkuar me nje rampe te pjerret i kthen ne skaje te lemuara, si te vektori.
    gm = gm.filter(ImageFilter.GaussianBlur(n / 256))
    lo, hi = 128 - 42, 128 + 42
    gm = gm.point(lambda v: 0 if v <= lo else (255 if v >= hi else round((v - lo) * 255 / (hi - lo))))
    pos = ((n - gm.size[0]) // 2, (n - gm.size[1]) // 2)
    bg.paste(Image.new("RGB", gm.size, (255, 255, 255)), pos, gm)
    p = os.path.join(OUT, emri)
    bg.save(p, "PNG", optimize=True)
    chk = Image.open(p)
    print(emri, chk.size, chk.mode, os.path.getsize(p), "bajt")
