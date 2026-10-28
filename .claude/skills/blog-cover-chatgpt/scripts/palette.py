# Saca los tonos de una portada (cuatro para el objeto y uno para el fondo)
# a partir del color de etiqueta de la categoría en phi.css.
import re
import sys
import unicodedata
from pathlib import Path

for stream in (sys.stdout, sys.stderr):
    stream.reconfigure(encoding='utf-8')

category = sys.argv[1]
css_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('src/styles/phi.css')

# Mismo slug que `slugify` en src/lib/blog.ts.
plain = ''.join(c for c in unicodedata.normalize('NFD', category) if not unicodedata.combining(c))
slug = re.sub(r'\s+', '-', plain.lower())

css = css_path.read_text(encoding='utf-8')
match = re.search(r"\[data-tag='" + re.escape(slug) + r"'\]\s*\{[^}]*?--tag:\s*(#[0-9a-fA-F]{6})", css)
if not match:
    sys.exit(f"No hay color para la etiqueta '{slug}' en {css_path}: añade un [data-tag='{slug}'] antes de hacer la portada.")

base = match.group(1).upper()
rgb = [int(base[i:i + 2], 16) for i in (1, 3, 5)]


def mix(target, amount):
    return '#' + ''.join(f'{round(c + (target - c) * amount):02X}' for c in rgb)


print(f'etiqueta: {slug} ({base})')
print('objeto, de claro a oscuro:', mix(255, 0.53), mix(255, 0.21), base, mix(0, 0.25))
print('fondo:', mix(255, 0.88))
