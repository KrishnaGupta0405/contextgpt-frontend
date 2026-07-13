"""Convert all images in this script's directory to OG images (1200x630, 1.91:1) saved as .avif into converted-to-og-avif/."""
import os
import subprocess
import sys

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".gif"}
MAX_SIZE_BYTES = 150 * 1024
START_QUALITY = 80
MIN_QUALITY = 20
QUALITY_STEP = 5
OG_WIDTH = 1200
OG_HEIGHT = 630


def ensure_dependencies():
    try:
        import PIL  # noqa: F401
        import pillow_avif  # noqa: F401
    except ImportError:
        print("Installing required packages (Pillow, pillow-avif-plugin)...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "pillow-avif-plugin"])


def fit_to_og(img, Image):
    """Center-crop img to the 1200x630 (1.91:1) aspect ratio, then resize."""
    target_ratio = OG_WIDTH / OG_HEIGHT
    width, height = img.size
    current_ratio = width / height

    if current_ratio > target_ratio:
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        img = img.crop((left, 0, left + new_width, height))
    elif current_ratio < target_ratio:
        new_height = int(width / target_ratio)
        top = (height - new_height) // 2
        img = img.crop((0, top, width, top + new_height))

    return img.resize((OG_WIDTH, OG_HEIGHT), Image.LANCZOS)


def main():
    ensure_dependencies()
    from PIL import Image
    import pillow_avif  # noqa: F401

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "converted-to-og-avif")
    os.makedirs(output_dir, exist_ok=True)

    images = [
        f for f in os.listdir(script_dir)
        if os.path.splitext(f)[1].lower() in IMAGE_EXTS
        and os.path.isfile(os.path.join(script_dir, f))
    ]

    if not images:
        print("No images found in this directory.")
        return

    for filename in images:
        src_path = os.path.join(script_dir, filename)
        name_no_ext = os.path.splitext(filename)[0]
        dest_path = os.path.join(output_dir, name_no_ext + "-og.avif")
        try:
            with Image.open(src_path) as img:
                if img.mode in ("P", "RGBA"):
                    img = img.convert("RGBA")
                else:
                    img = img.convert("RGB")

                img = fit_to_og(img, Image)

                quality = START_QUALITY
                while True:
                    img.save(dest_path, format="AVIF", quality=quality)
                    size = os.path.getsize(dest_path)
                    if size <= MAX_SIZE_BYTES or quality <= MIN_QUALITY:
                        break
                    quality -= QUALITY_STEP

            print(f"Converted: {filename} -> {os.path.basename(dest_path)} "
                  f"(1200x630, {size / 1024:.1f} KB, quality={quality})")
        except Exception as e:
            print(f"Failed to convert {filename}: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
