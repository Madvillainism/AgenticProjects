"""
generate_placeholders.py - Extract sprite frames from JPG sheets.

Replaces the old procedural drawing approach with real sprite extraction
from the JPG reference sheets in the sprites/ folder.

Usage:
    python generate_placeholders.py

This runs the extraction pipeline: auto-detects grid, extracts frames,
and saves final {pet}-{state}.png sprites.
"""

from extract_sprites import detect_grid, TEMP_DIR, OUTPUT_DIR, TARGET_STATES, TARGET_W, TARGET_H
from PIL import Image
import os

SPRITES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sprites")

# State mappings (determined by visual inspection of extracted temp strips)
BUNNY_MAPPING = {
    6: "walking",
    3: "sleeping",
    1: "idle",
    2: "alerting"
}

BUNNY_BLOCKS = [
    (16, 72), (88, 128), (143, 200), (232, 272),
    (304, 344), (383, 417), (447, 488), (527, 561)
]

BUNNY_SPRITE_COLS = [
    [(22,48), (95,127), (160,192), (240,265)],
    [(16,48), (96,128), (176,215), (239,272)],
    [(15,47), (95,128), (159,192), (239,272)],
    [(16,55), (80,119), (143,191), (224,264)],
    [(22,48), (96,121), (166,191), (240,265)],
    [(15,48), (87,127), (159,192), (230,271)],
    [(15,47), (95,127), (159,192), (239,272)],
    [(16,55), (95,127), (166,207), (239,272)]
]

FROG_MAPPING = {
    1: "walking",
    0: "alerting",
    2: "idle",
    3: "sleeping"
}


def extract_bunny():
    jpg_path = os.path.join(SPRITES_DIR, "bunny sprites.jpg")
    if not os.path.exists(jpg_path):
        print(f"Sheet not found: {jpg_path}")
        return
    img = Image.open(jpg_path).convert("RGB")
    print(f"Extracting bunny sprites from {jpg_path}")
    for block_i, state in BUNNY_MAPPING.items():
        y_start, y_end = BUNNY_BLOCKS[block_i]
        cols = BUNNY_SPRITE_COLS[block_i]
        strip = Image.new("RGBA", (TARGET_W * len(cols), TARGET_H), (0, 0, 0, 0))
        for col_i, (x_start, x_end) in enumerate(cols):
            frame = img.crop((x_start, y_start, x_end, y_end))
            frame = frame.resize((TARGET_W, TARGET_H), Image.LANCZOS)
            strip.paste(frame, (col_i * TARGET_W, 0))
        out_path = os.path.join(OUTPUT_DIR, f"bunny-{state}.png")
        strip.save(out_path)
        print(f"  Created {out_path} ({len(cols)} frames)")


def extract_frog():
    jpg_path = os.path.join(SPRITES_DIR, "frog sprites.jpg")
    if not os.path.exists(jpg_path):
        print(f"Sheet not found: {jpg_path}")
        return
    img = Image.open(jpg_path).convert("RGB")
    fw, fh = detect_grid(img)[:2]
    cols_count = img.width // fw
    print(f"Extracting frog sprites from {jpg_path} (grid {fw}x{fh}, {cols_count} cols)")
    for row_i, state in FROG_MAPPING.items():
        strip = Image.new("RGBA", (TARGET_W * cols_count, TARGET_H), (0, 0, 0, 0))
        for c in range(cols_count):
            frame = img.crop((c * fw, row_i * fh, (c + 1) * fw, (row_i + 1) * fh))
            frame = frame.resize((TARGET_W, TARGET_H), Image.LANCZOS)
            strip.paste(frame, (c * TARGET_W, 0))
        out_path = os.path.join(OUTPUT_DIR, f"frog-{state}.png")
        strip.save(out_path)
        print(f"  Created {out_path} ({cols_count} frames)")


if __name__ == "__main__":
    os.makedirs(SPRITES_DIR, exist_ok=True)
    extract_bunny()
    extract_frog()
    print("\nDone! All sprites extracted from JPG sheets.")
