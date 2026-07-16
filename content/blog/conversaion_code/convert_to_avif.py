"""Convert all images in this script's directory to AVIF, saved into converted-to-avif/."""
import os
import subprocess
import sys

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".gif"}
MAX_SIZE_BYTES = 90 * 1024
START_QUALITY = 80
MIN_QUALITY = 20
QUALITY_STEP = 5


def ensure_dependencies():
    try:
        import PIL  # noqa: F401
        import pillow_avif  # noqa: F401
    except ImportError:
        print("Installing required packages (Pillow, pillow-avif-plugin)...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "pillow-avif-plugin"])


def main():
    ensure_dependencies()
    from PIL import Image
    import pillow_avif  # noqa: F401

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "converted-to-avif")
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
        dest_path = os.path.join(output_dir, name_no_ext + ".avif")
        try:
            with Image.open(src_path) as img:
                if img.mode in ("P", "RGBA"):
                    img = img.convert("RGBA")
                else:
                    img = img.convert("RGB")

                quality = START_QUALITY
                while True:
                    img.save(dest_path, format="AVIF", quality=quality)
                    size = os.path.getsize(dest_path)
                    if size <= MAX_SIZE_BYTES or quality <= MIN_QUALITY:
                        break
                    quality -= QUALITY_STEP

            print(f"Converted: {filename} -> {os.path.basename(dest_path)} "
                  f"({size / 1024:.1f} KB, quality={quality})")
        except Exception as e:
            print(f"Failed to convert {filename}: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
