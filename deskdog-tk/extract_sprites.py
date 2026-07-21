"""
extract_sprites.py - Auto-detect and extract sprite frames from JPG sheets.

Usage:
    python extract_sprites.py pass1          # Detect grid and save temp strips
    python extract_sprites.py pass2          # Assemble final sprites (reads mapping)
    python extract_sprites.py both           # Run both passes sequentially

After pass1, inspect the temp-{pet}-rowN.png files and create a mapping file:
    mapping.txt (one line per row: "rowN:state", e.g. "row0:walking", "row1:idle")
"""

import os
import sys
from PIL import Image, ImageDraw
from logger import get_logger

SPRITES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sprites")
OUTPUT_DIR = SPRITES_DIR
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_sprites")
TARGET_W = 44
TARGET_H = 44
TARGET_STATES = ["idle", "walking", "sleeping", "alerting"]


def detect_grid(img):
    w, h = img.size
    best_score = -1
    best_fw, best_fh = None, None

    for fw in range(16, w // 2 + 1):
        if w % fw != 0:
            continue
        cols = w // fw
        score = 0
        for test_x in range(0, w - fw, fw):
            c1 = [img.getpixel((test_x, y)) for y in range(min(20, h))]
            c2 = [img.getpixel((test_x + fw, y)) for y in range(min(20, h))]
            if c1 == c2:
                score += 1
        if score > best_score or (score == best_score and fw > (best_fw or 0)):
            best_score = score
            best_fw = fw

    best_score_h = -1
    for fh in range(16, h // 2 + 1):
        if h % fh != 0:
            continue
        rows = h // fh
        score = 0
        for test_y in range(0, h - fh, fh):
            r1 = [img.getpixel((x, test_y)) for x in range(min(20, w))]
            r2 = [img.getpixel((x, test_y + fh)) for x in range(min(20, w))]
            if r1 == r2:
                score += 1
        if score > best_score_h or (score == best_score_h and fh > (best_fh or 0)):
            best_score_h = score
            best_fh = fh

    cols = w // best_fw if best_fw else 4
    rows = h // best_fh if best_fh else 4
    return best_fw, best_fh, cols, rows


def extract_pass1(pet_name, jpg_path):
    img = Image.open(jpg_path).convert("RGB")
    fw, fh, cols, rows = detect_grid(img)
    print(f"{pet_name}: detected grid {fw}x{fh} pixels, {cols} cols x {rows} rows")
    print(f"  Total frames: {cols * rows}")

    os.makedirs(TEMP_DIR, exist_ok=True)
    for row in range(rows):
        strip = Image.new("RGBA", (TARGET_W * cols, TARGET_H), (0, 0, 0, 0))
        for col in range(cols):
            x0, y0 = col * fw, row * fh
            x1, y1 = x0 + fw, y0 + fh
            frame = img.crop((x0, y0, x1, y1))
            frame = frame.resize((TARGET_W, TARGET_H), Image.LANCZOS)
            strip.paste(frame, (col * TARGET_W, 0))
        path = os.path.join(TEMP_DIR, f"temp-{pet_name}-row{row}.png")
        strip.save(path)
        print(f"  Saved {path} ({cols} frames, {TARGET_W}x{TARGET_H} each)")

    print(f"\nInspect the temp-{pet_name}-rowN.png files and create mapping.txt:")
    print(f"  One line per row: rowN:state")
    print(f"  Valid states: {', '.join(TARGET_STATES)}")
    print(f"  Example:")
    print(f"    row0:walking")
    print(f"    row1:idle")
    print(f"    row2:sleeping")
    print(f"    row3:alerting")


def extract_pass2(pet_name, jpg_path, mapping_lines):
    mapping = {}
    for line in mapping_lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(":")
        if len(parts) != 2:
            continue
        row_str, state = parts[0].strip(), parts[1].strip()
        if not row_str.startswith("row"):
            continue
        try:
            row_num = int(row_str[3:])
        except ValueError:
            continue
        if state not in TARGET_STATES:
            print(f"  Skipping invalid state: {state}")
            continue
        mapping[row_num] = state

    if len(mapping) < 4:
        print(f"Warning: mapping has {len(mapping)} states, expected 4. States: {list(mapping.values())}")

    img = Image.open(jpg_path).convert("RGB")
    fw, fh, cols, rows = detect_grid(img)

    for row_num, state in sorted(mapping.items()):
        if row_num >= rows:
            print(f"  Skipping row {row_num}: out of range (sheet has {rows} rows)")
            continue
        strip = Image.new("RGBA", (TARGET_W * cols, TARGET_H), (0, 0, 0, 0))
        for col in range(cols):
            x0, y0 = col * fw, row_num * fh
            x1, y1 = x0 + fw, y0 + fh
            frame = img.crop((x0, y0, x1, y1))
            frame = frame.resize((TARGET_W, TARGET_H), Image.LANCZOS)
            strip.paste(frame, (col * TARGET_W, 0))
        out_path = os.path.join(OUTPUT_DIR, f"{pet_name}-{state}.png")
        strip.save(out_path)
        print(f"  Created {out_path} ({cols} frames)")

    print(f"\nDone! {pet_name} sprites saved to {OUTPUT_DIR}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_sprites.py <pass1|pass2|both> [pet_name]")
        sys.exit(1)

    command = sys.argv[1].lower()

    sheets = [
        ("bunny", "bunny sprites.jpg"),
        ("frog", "frog sprites.jpg"),
    ]

    for pet_name, jpg_filename in sheets:
        jpg_path = os.path.join(SPRITES_DIR, jpg_filename)
        if not os.path.exists(jpg_path):
            print(f"Sheet not found: {jpg_path}")
            continue

        print(f"\n{'='*50}")
        print(f"Processing {pet_name}: {jpg_filename}")
        print(f"{'='*50}")

        if command in ("pass1", "both"):
            print("\n--- PASS 1: Detecting grid and extracting temp strips ---")
            extract_pass1(pet_name, jpg_path)

        if command in ("pass2", "both"):
            mapping_path = os.path.join(TEMP_DIR, f"mapping-{pet_name}.txt")
            if not os.path.exists(mapping_path):
                print(f"\nMapping file not found: {mapping_path}")
                print("Run pass1 first, create the mapping file, then run pass2.")
                continue
            with open(mapping_path, "r") as f:
                lines = f.readlines()
            print(f"\n--- PASS 2: Assembling final sprites from mapping ---")
            extract_pass2(pet_name, jpg_path, lines)

        if command == "both" and pet_name == "bunny":
            print(f"\nInspect temp-{pet_name}-rowN.png files and create:")
            print(f"  {os.path.join(TEMP_DIR, 'mapping-bunny.txt')}")
            print("Then run: python extract_sprites.py pass2")


if __name__ == "__main__":
    main()
