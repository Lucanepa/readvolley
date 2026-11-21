"""Every ReadVolley logo raster, rendered from the SVGs in brand/.

    python3 scripts/make-brand-assets.py

Rerun after changing a file in brand/ (see brand/README.md), check the
renders, commit them with the SVG. It writes:

- public/: favicon.ico, apple-touch-icon.png, pwa-192x192.png,
  pwa-512x512.png, pwa-maskable-512x512.png (PWA manifest)
- android/app/src/main/res: launcher icons (square, round, adaptive
  foreground) for every density, the pre-Android-12 splash, and the white
  ic_launcher_background colour
- fastlane/metadata/android/en-US/images/icon.png: the store icon (F-Droid)

The SVGs are rasterised by resvg through the Tauri CLI (`tauri icon --png`,
the same way as OpenVolley's brand script); Pillow composes and writes the
.ico. Needs Pillow and one of: $TAURI_CLI, node_modules/.bin/tauri, or npx
(it runs `npx --yes @tauri-apps/cli@2`).
"""
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / 'brand'
PUBLIC = ROOT / 'public'
RES = ROOT / 'android/app/src/main/res'
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)


def _tauri():
    if os.environ.get('TAURI_CLI'):
        return [os.environ['TAURI_CLI']]
    local = ROOT / 'node_modules/.bin/tauri'
    if local.exists():
        return [str(local)]
    return [shutil.which('npx') or 'npx', '--yes', '@tauri-apps/cli@2']


TAURI = _tauri()
_tmp = Path(tempfile.mkdtemp(prefix='rv-brand-'))
_cache = {}


def render(name, size):
    """brand/<name> rasterised to size x size px, RGBA."""
    key = (name, size)
    if key not in _cache:
        n = len(_cache)
        src = _tmp / f'{n}.svg'
        shutil.copyfile(BRAND / name, src)
        subprocess.run([*TAURI, 'icon', str(src), '--png', str(size), '-o', str(_tmp / str(n))],
                       check=True, capture_output=True, cwd=_tmp)
        _cache[key] = Image.open(_tmp / str(n) / f'{size}x{size}.png').convert('RGBA')
    return _cache[key].copy()


def on_canvas(size, name, fraction, background=WHITE):
    """brand/<name> (a 512 canvas) at `fraction` of a size x size square."""
    canvas = Image.new('RGBA', (size, size), background)
    art = render(name, round(size * fraction))
    canvas.alpha_composite(art, ((size - art.width) // 2, (size - art.height) // 2))
    return canvas


def masked(img, shape, radius_fraction=0.0):
    ss = 4
    m = Image.new('L', (img.width * ss, img.height * ss), 0)
    box = (0, 0, m.width - 1, m.height - 1)
    if shape == 'circle':
        ImageDraw.Draw(m).ellipse(box, fill=255)
    else:
        ImageDraw.Draw(m).rounded_rectangle(box, radius=int(m.width * radius_fraction), fill=255)
    out = Image.new('RGBA', img.size, CLEAR)
    out.paste(img, (0, 0), m.resize(img.size, Image.LANCZOS))
    return out


def save_png(im, path, rgb=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    (im.convert('RGB') if rgb else im).save(path, optimize=True)
    print('wrote', path.relative_to(ROOT))


def save_ico(path, entries):
    """entries {size: brand svg}: every size drawn at its own size, no downscaling."""
    images = [render(name, s) for s, name in sorted(entries.items())]
    images[-1].save(path, format='ICO', sizes=[im.size for im in images], append_images=images[:-1])
    print('wrote', path.relative_to(ROOT))


# ---- web ---------------------------------------------------------------
# 16-48 px: the small-size cut (bigger ball with OpenVolley's 4-seam cut, a heavier book)
save_ico(PUBLIC / 'favicon.ico', {16: 'favicon.svg', 32: 'favicon.svg', 48: 'favicon.svg'})
# iOS rounds the corners itself: an opaque white square
save_png(on_canvas(180, 'mark.svg', 0.9), PUBLIC / 'apple-touch-icon.png', rgb=True)
for s in (192, 512):
    save_png(render('icon-tile.svg', s), PUBLIC / f'pwa-{s}x{s}.png')
# maskable: full bleed, the book's corners inside the 40 % safe circle
save_png(on_canvas(512, 'mark.svg', 0.88), PUBLIC / 'pwa-maskable-512x512.png', rgb=True)

# ---- Android -------------------------------------------------------------
for folder, d in (('mdpi', 1), ('hdpi', 1.5), ('xhdpi', 2), ('xxhdpi', 3), ('xxxhdpi', 4)):
    out = RES / f'mipmap-{folder}'
    launcher = round(48 * d)   # legacy icons (API < 26): a white rounded tile, a white disc
    save_png(masked(on_canvas(launcher, 'mark.svg', 0.92), 'rounded', 0.18), out / 'ic_launcher.png')
    save_png(masked(on_canvas(launcher, 'mark.svg', 0.86), 'circle'), out / 'ic_launcher_round.png')
    fg = round(108 * d)        # adaptive layers: 108 dp canvas, 66 dp safe circle
    save_png(render('adaptive-foreground.svg', fg), out / 'ic_launcher_foreground.png')

# Pre-Android-12 splash: the mark on white (12+ draws the adaptive icon on
# ic_launcher_background, styles.xml)
for path in sorted(RES.glob('drawable*/splash.png')):
    w, h = Image.open(path).size
    canvas = Image.new('RGBA', (w, h), WHITE)
    art = render('mark.svg', round(min(w, h) * 0.5))
    canvas.alpha_composite(art, ((w - art.width) // 2, (h - art.height) // 2))
    save_png(canvas, path, rgb=True)

bg = RES / 'values/ic_launcher_background.xml'
text = bg.read_text()
new = re.sub(r'(<color name="ic_launcher_background">)[^<]*(</color>)', r'\g<1>#FFFFFF\g<2>', text)
if new != text:
    bg.write_text(new)
    print('wrote', bg.relative_to(ROOT))

# ---- store ---------------------------------------------------------------
save_png(render('icon-tile.svg', 512), ROOT / 'fastlane/metadata/android/en-US/images/icon.png')

shutil.rmtree(_tmp, ignore_errors=True)
