# Recorta una imagen a 3:2 y la guarda como portada de 1200x800 en WebP.
# El tercer argumento (de 0 a 1, por defecto 0.5) mueve el recorte en horizontal.
import sys

from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
x_pos = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5

img = Image.open(src).convert('RGB')
w, h = img.size
target = 3 / 2
if w / h > target:
    cw, ch = round(h * target), h
else:
    cw, ch = w, round(w / target)
left = round((w - cw) * x_pos)
top = (h - ch) // 2
img.crop((left, top, left + cw, top + ch)).resize((1200, 800), Image.LANCZOS).save(dst, 'WEBP', quality=80, method=6)
print(dst, Image.open(dst).size)
