from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "public" / "images" / "brand"
SOURCE = BRAND_DIR / "ferreras-smp-icon-master.png"
PRIMARY = (139, 92, 246)
SIZES = (1024, 512, 192, 180, 80, 48, 32, 16)


def is_violet_background(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    return (
        blue > 145
        and red > 65
        and blue > red * 1.25
        and blue > green * 1.45
        and red > green * 1.3
    )


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")
    pixels = [
        PRIMARY if is_violet_background(pixel) else pixel
        for pixel in source.get_flattened_data()
    ]
    source.putdata(pixels)

    generated: dict[int, Image.Image] = {}
    for size in SIZES:
        resized = source.resize((size, size), Image.Resampling.LANCZOS)
        generated[size] = resized
        resized.save(
            BRAND_DIR / f"ferreras-smp-icon-{size}.png",
            format="PNG",
            optimize=True,
            compress_level=9,
        )

    generated[48].save(
        ROOT / "public" / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[generated[32], generated[16]],
    )


if __name__ == "__main__":
    main()
