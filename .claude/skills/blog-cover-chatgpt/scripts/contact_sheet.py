# Junta la portada de cada post en una sola imagen, rotulada con su slug y su
# categoría, para ver qué objetos y colores ya están usados.
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

out = sys.argv[1]
root = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('.')

posts = []
for md in sorted((root / 'src/content/blog').glob('*.md')):
    front = md.read_text(encoding='utf-8').split('---')[1]
    image = re.search(r'^image:\s*"?([^"\n]+?)"?\s*$', front, re.M).group(1)
    category = re.search(r'^category:\s*"?([^"\n]+?)"?\s*$', front, re.M).group(1)
    posts.append((md.stem, category, root / 'public' / image.lstrip('/')))

tile_w, tile_h, label_h, cols = 360, 240, 26, 4
rows = -(-len(posts) // cols)
sheet = Image.new('RGB', (cols * tile_w, rows * (tile_h + label_h)), 'white')
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.load_default(size=13)
except TypeError:
    font = ImageFont.load_default()

for i, (slug, category, path) in enumerate(posts):
    x, y = i % cols * tile_w, i // cols * (tile_h + label_h)
    if path.exists():
        sheet.paste(Image.open(path).convert('RGB').resize((tile_w, tile_h)), (x, y))
    else:
        draw.text((x + 12, y + tile_h // 2), 'sin portada', fill='red', font=font)
    # La fuente por defecto no tiene tildes: se rotula la categoría sin ellas.
    label = unicodedata.normalize('NFD', f'{slug} · {category}')
    label = ''.join(c for c in label if not unicodedata.combining(c))
    draw.text((x + 4, y + tile_h + 5), label, fill='black', font=font)

sheet.save(out)
print(out, f'({len(posts)} portadas)')
