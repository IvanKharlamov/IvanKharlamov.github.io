"""Rebuild the catalog sprite atlas.

Reads products.js, composes one square tile per product (packs excluded: their
wide collages use a taller card frame and load as individual files), writes
img/inventory/catalog_atlas.avif and catalog_atlas.js.

    python tools/build_atlas.py [--tile 240] [--quality 70]
"""
import argparse, json, math, os, re, sys, time
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIT = 0.925      # longest side of the source fills this share of the tile
TARGET = 0.96    # per-item zoom so the product's bounding box fills this share of the frame
MAX_ZOOM = 1.5
SKIP_CATEGORIES = {'cat.packs'}


def load_products():
    src = open(os.path.join(ROOT, 'products.js'), encoding='utf-8').read()
    s = src[src.index('['):]
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'^\s*//.*$', '', s, flags=re.M)
    s = s.rstrip().rstrip(';')
    s = re.sub(r',(\s*[\]\}])', r'\1', s)
    return json.loads(s)


def make_tile(path, tile):
    im = Image.open(path).convert('RGBA')
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    w, h = im.size
    scale = tile * FIT / max(w, h)
    im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    out = Image.new('RGBA', (tile, tile), (0, 0, 0, 0))
    out.paste(im, ((tile - im.width) // 2, (tile - im.height) // 2), im)
    frac = max(im.width, im.height) / tile
    zoom = min(MAX_ZOOM, round(TARGET / frac, 2))
    return out, zoom


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tile', type=int, default=240)
    ap.add_argument('--quality', type=int, default=70)
    args = ap.parse_args()
    tile = args.tile

    products = [p for p in load_products() if p.get('image') and p.get('category') not in SKIP_CATEGORIES]
    missing = [p for p in products if not os.path.exists(os.path.join(ROOT, p['image'].split('?')[0]))]
    for p in missing:
        print('no file:', p['id'], p['image'], file=sys.stderr)
    products = [p for p in products if p not in missing]

    n = len(products)
    cols = math.ceil(math.sqrt(n))
    rows = math.ceil(n / cols)
    atlas = Image.new('RGBA', (cols * tile, rows * tile), (0, 0, 0, 0))
    items = {}
    for i, p in enumerate(products):
        col, row = i % cols, i // cols
        t, zoom = make_tile(os.path.join(ROOT, p['image'].split('?')[0]), tile)
        atlas.paste(t, (col * tile, row * tile))
        items[str(p['id'])] = {
            'col': col, 'row': row, 'x': col * tile, 'y': row * tile, 'zoom': zoom,
            'xPct': round(col / (cols - 1) * 100, 4) if cols > 1 else 0.0,
            'yPct': round(row / (rows - 1) * 100, 4) if rows > 1 else 0.0,
        }

    version = time.strftime('%Y%m%d')
    img_rel = 'img/inventory/catalog_atlas.avif'
    atlas.save(os.path.join(ROOT, img_rel), 'AVIF', quality=args.quality, speed=4)
    data = {
        'tileSize': tile, 'cols': cols, 'rows': rows,
        'width': cols * tile, 'height': rows * tile,
        'image': f'{img_rel}?v={version}',
        'items': items,
    }
    with open(os.path.join(ROOT, 'catalog_atlas.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('window.CATALOG_ATLAS = ' + json.dumps(data, indent=2) + ';\n')
    size = os.path.getsize(os.path.join(ROOT, img_rel))
    print(f'{n} tiles, {cols}x{rows} grid, {cols*tile}x{rows*tile}px, {size/1024:.0f} KB, {len(missing)} skipped')


if __name__ == '__main__':
    main()
