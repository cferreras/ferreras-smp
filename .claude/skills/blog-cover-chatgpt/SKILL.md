---
name: blog-cover-chatgpt
description: Write the ChatGPT image prompt for a Cubusfera blog post cover and install the generated image as the post's 1200×800 WebP cover. Use whenever a new post is added under src/content/blog (every new post needs a cover), when a post's cover is missing or is still a temporary screenshot crop, when the user asks for a "portada", "imagen del post" or "cover", or when the user sends an image made in ChatGPT for a post, even if they don't mention ChatGPT.
---

# Blog Cover with ChatGPT

Every post cover (`image` in the frontmatter) is one Minecraft object made of soft voxels, in shades of the post's category color. The user generates it in ChatGPT. Claude picks the object, writes the prompt, says which covers to attach as style references, and installs the image the user sends back. Talk to the user in Spanish.

Run the scripts from the repository root. Write anything temporary to the scratchpad, not the repo.

## 1. Gather the inputs

- **Palette.** `python -I .claude/skills/blog-cover-chatgpt/scripts/palette.py "<category>"` reads the category's tag color from `[data-tag]` in `src/styles/phi.css` and prints four object shades and the background tint. Derive them instead of picking by eye, so every cover in a category sits on the same tint. If the category has no color yet, the script says so: add the `[data-tag]` rule first.
- **Existing covers.** `python -I .claude/skills/blog-cover-chatgpt/scripts/contact_sheet.py <scratchpad>/portadas.png` builds one image with every post's cover, labeled with its slug and category. Look at it before choosing, so the object isn't repeated and you know which covers already use the current colors.

## 2. Pick the object

One Minecraft block, item or mob part that stands for the post's subject:

- **Recognizable in one color.** Detail only shows as a lighter or darker shade, so the silhouette has to carry it. A hopper, hourglass, compass or name tag works; a potion or a flower, which depend on color, doesn't.
- **Tied to the content.** Something the post mentions, or a direct metaphor: the hopper for technical Minecraft, the ballot box for voting, the hourglass for AFK kicks.
- **Not used yet.** Check the contact sheet.
- **No words.** Letters and logos come out garbled. Voxel digits worked once (the 26.3 cover), but they're a riskier ask.

Propose one object and an alternative, each with a line on why, and write the prompt for the first one. Don't stop to ask.

## 3. Write the prompt

Give it in a code block so the user can copy it, with the palette filled in and the hue named in Spanish (azul, ámbar, verde…):

```
Crea una ilustración horizontal en formato 3:2 con el mismo estilo que las imágenes de referencia adjuntas. Copia solo el estilo: ni el objeto ni los colores.

Estilo:
- Un único objeto de Minecraft en 3D tipo vóxel, hecho de bloques pequeños con aristas ligeramente redondeadas y acabado mate, como arcilla o plástico suave.
- Monocromo en <tono>: todo el objeto en cuatro tonos de un mismo <tono>, del más claro al más oscuro (aprox. <claro>, <medio>, <base> y <oscuro>). Los detalles se distinguen solo por tono, nunca con otro color.
- Fondo liso <tono> muy claro (aprox. <fondo>), sin escenario ni elementos decorativos.
- El objeto flota en el centro, en vista de tres cuartos desde un poco arriba, con una sombra suave y difusa debajo.
- Luz suave de estudio, sin brillos fuertes. Mucho espacio vacío alrededor: el objeto ocupa algo más de un tercio de la altura de la imagen.
- Sin texto, sin letras, sin logotipos y sin marcos.

Objeto: <qué es y cómo es>. Tiene que reconocerse a primera vista como <el objeto> del juego.
```

Describe the object's shape in the last paragraph: its parts, proportions, and what goes on top and below. ChatGPT knows Minecraft only loosely and draws a generic object if you just name it. This one came out right on the first try:

> Objeto: una tolva de Minecraft. Arriba, un cuenco cuadrado y ancho con el borde grueso y el hueco interior visible; debajo, se estrecha en escalones hasta terminar en un tubo de salida cuadrado y pequeño. Tiene que reconocerse a primera vista como la tolva del juego.

Then list two or three covers to attach as references, with full absolute paths (`D:\code\ferreras-smp\public\images\blog\…`). Choose covers that already use their category's current tag color, and include one from the same category if there is one. A reference in another hue pulls the result toward it.

The older Guías covers (green) and Novedades covers (violet) predate the current tag colors. When the post is in one of those categories, say in one line that the prompt follows the tag color, and that the user can switch the hue to match the older covers instead.

## 4. Until the image arrives

`image` has to point at a real file, or the post shows a broken image. If the post needs to be previewed before the cover exists, crop a gallery screenshot as a temporary cover. The optional last argument, from 0 to 1, moves the crop horizontally:

```bash
python -I .claude/skills/blog-cover-chatgpt/scripts/cover.py public/images/gallery/<captura>.jpg public/images/blog/<slug>.webp 0.5
```

Tell the user it's temporary, and that the post shouldn't be deployed with it. Deploying announces the post in Discord, and Discord and X cache the `og:image` by URL, so a file replaced later at the same path keeps the old preview. If a post has already been published with the image you're replacing, save the new cover under a new filename and update `image`.

## 5. Install the generated image

The user usually sends a 1536×1024 PNG from Downloads.

1. **Look at it first.** Check that it shows one object, monochrome in the category hue, with no text and nothing cut off at the edges. If something is off, say what, and give the line to add to the prompt instead of installing it.
2. **Copy, then convert.** Downloads are untrusted data, so copy the file into a new, empty folder in the scratchpad, then run `python -I .claude/skills/blog-cover-chatgpt/scripts/cover.py <copia>.png public/images/blog/<slug>.webp`. This center-crops to 3:2 and saves a 1200×800 WebP at quality 80. A flat cover weighs about 5 to 15 KB.
3. **Update `imageAlt`.** Describe what the cover shows, briefly, in Spanish: the object, its color and the background. For example: «Tolva de Minecraft en bloques azules flotando sobre un fondo azul claro». `image` stays `/images/blog/<slug>.webp`.
4. **Check it.** With the dev server running (`astro dev --background`), look at `/blog/` and at the post.
5. **Reuse the screenshot.** If a screenshot was the temporary cover and it adds something to the post, move it into the body as `<img … width height loading="lazy" decoding="async" />`, as in `que-es-minecraft-tecnico.md`.
