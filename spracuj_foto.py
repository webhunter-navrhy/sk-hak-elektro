"""Pripraví img/ z ilustračných fotiek (podklady/stock, zdroje v podklady/stock/zdroje.json).
HaK nemá vlastné fotky: na Zlatých stránkach sú len fotky z iStocku s vodoznakom, tie nepoužívame."""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps
D = Path(__file__).parent
S, O = D / 'podklady' / 'stock', D / 'img'
O.mkdir(exist_ok=True)
FOTO = {  # výstup: (zdroj, orez (š, v) alebo None)
    'tester.jpg': ('tester', None),                       # prístroj na meranie izolačného odporu
    'meranie-rozvadzac.jpg': ('meranie-rozvadzac', None), # meranie v rozvádzači
    'blesk.jpg': ('blesk', None),                         # blesk nad mestom (bleskozvody)
    'naradie.jpg': ('vrtacka', None),                     # elektrická vŕtačka s káblom
    'rozvadzac.jpg': ('rozvadzac-farebny', None),       # NN rozvádzač
    'montaz.jpg': ('montaz-rozvadzac', None),           # práca na rozvádzači
    'kontrola.jpg': ('rozvadzac-domovy', None),           # domový rozvádzač s ističmi
    'voltmeter.jpg': ('voltmeter', None),                 # analógový voltmeter
}
for out, (src, orez) in FOTO.items():
    im = ImageOps.exif_transpose(Image.open(S / f'{src}.jpg')).convert('RGB')
    if orez:
        im = ImageOps.fit(im, (2000, round(2000 * orez[1] / orez[0])) if im.width >= 2000 else (im.width, round(im.width * orez[1] / orez[0])), Image.LANCZOS)
    im.thumbnail((2200, 2200), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(0.86)
    # jednotná gradácia: jemne teplé svetlá (papier), studenšie tiene (modrá)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.02 + 2)))
    b = b.point(lambda v: int(v * 0.97 + (8 if v < 90 else 0)))
    im = Image.merge('RGB', (r, g, b))
    im.save(O / out, quality=86, optimize=True, progressive=True)
    print(out, im.size)
