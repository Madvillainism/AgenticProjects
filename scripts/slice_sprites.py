from PIL import Image
import numpy as np
import os

OUT = "frontend/public/sprites"
TARGET_HEIGHT = 96

def white_to_transparent(img):
    img = img.convert("RGBA")
    arr = np.array(img)
    white = np.all(arr[:, :, :3] > 240, axis=2)
    arr[white, 3] = 0
    return Image.fromarray(arr)

def extract_frames_and_rows(path):
    img = Image.open(path)
    arr = np.array(img)
    h, w = arr.shape[:2]

    white_rows = []
    for y in range(h):
        row = arr[y, :, :]
        if np.mean(row > 240) > 0.95:
            white_rows.append(y)

    white_bands = []
    if white_rows:
        start = white_rows[0]
        end = white_rows[0]
        for y in white_rows[1:]:
            if y == end + 1:
                end = y
            else:
                white_bands.append((start, end))
                start = end = y
        white_bands.append((start, end))

    content_regions = []
    prev_end = -1
    for ws, we in white_bands:
        if prev_end >= 0 and ws - prev_end > 5:
            content_regions.append((prev_end + 1, ws - 1))
        prev_end = we
    if h - 1 - prev_end > 5:
        content_regions.append((prev_end + 1, h - 1))

    rows = []
    for cy1, cy2 in content_regions:
        band = arr[cy1:cy2+1, :, :]
        gray = np.mean(band, axis=2)
        non_white = gray < 240
        col_proj = np.any(non_white, axis=0)

        in_frame = False
        frames_x = []
        fx_start = 0
        for x in range(w):
            if col_proj[x] and not in_frame:
                in_frame = True
                fx_start = x
            elif not col_proj[x] and in_frame:
                in_frame = False
                if x - fx_start > 10:
                    frames_x.append((fx_start, x - 1))
        if in_frame and w - fx_start > 10:
            frames_x.append((fx_start, w - 1))

        frames = []
        for fx1, fx2 in frames_x:
            frame = band[:, fx1:fx2+1, :]
            gray_f = np.mean(frame, axis=2)
            rows_nw = np.any(gray_f < 240, axis=1)
            cols_nw = np.any(gray_f < 240, axis=0)
            if np.any(rows_nw):
                y1 = np.where(rows_nw)[0][0]
                y2 = np.where(rows_nw)[0][-1]
                x1 = np.where(cols_nw)[0][0]
                x2 = np.where(cols_nw)[0][-1]
                f = frame[y1:y2+1, x1:x2+1, :]
                if f.shape[0] > 20 and f.shape[1] > 20:
                    frames.append(f)

        if len(frames) >= 3:
            rows.append(frames)

    return rows

def make_strip(frames, name):
    canvas_list = []
    for f in frames:
        pil = Image.fromarray(f)
        pil = pil.resize((TARGET_HEIGHT, TARGET_HEIGHT), Image.LANCZOS)
        pil = white_to_transparent(pil)
        canvas = Image.new("RGBA", (TARGET_HEIGHT, TARGET_HEIGHT), (0, 0, 0, 0))
        canvas.paste(pil, (0, 0), pil)
        canvas_list.append(canvas)

    total_w = TARGET_HEIGHT * len(canvas_list)
    strip = Image.new("RGBA", (total_w, TARGET_HEIGHT), (0, 0, 0, 0))
    x = 0
    for c in canvas_list:
        strip.paste(c, (x, 0), c)
        x += TARGET_HEIGHT

    path = os.path.join(OUT, f"{name}.png")
    strip.save(path)
    print(f"  Saved {path} ({strip.size[0]}x{strip.size[1]}, {len(canvas_list)} frames)")
    return (len(canvas_list), TARGET_HEIGHT)

print("=== Processing dog sprite sheet ===")
dog_rows = extract_frames_and_rows(os.path.join(OUT, "dog-sprite-sheet.jpg"))
print(f"  Found {len(dog_rows)} row bands")

print("\n  Grouping into strips:")

dog_idle = dog_rows[0] + dog_rows[4]
dog_walking = dog_rows[1] + dog_rows[5] + dog_rows[7]
dog_sleeping = dog_rows[3]
dog_alerting = dog_rows[2] + dog_rows[6]

dog_widths = {}
dog_widths["dog-idle"] = make_strip(dog_idle, "dog-idle")
dog_widths["dog-walking"] = make_strip(dog_walking, "dog-walking")
dog_widths["dog-sleeping"] = make_strip(dog_sleeping, "dog-sleeping")
dog_widths["dog-alerting"] = make_strip(dog_alerting, "dog-alerting")

print(f"\n  Dog widths: {dog_widths}")

print("\n=== Processing cat sprite sheet ===")
cat_rows = extract_frames_and_rows(os.path.join(OUT, "cat-sprite-sheet.jpg"))
print(f"  Found {len(cat_rows)} row bands")

cat_idle = cat_rows[0] + cat_rows[2]
cat_walking = cat_rows[4] + cat_rows[5] + cat_rows[7]
cat_sleeping = cat_rows[3]
cat_alerting = cat_rows[1] + cat_rows[6]

cat_widths = {}
cat_widths["cat-idle"] = make_strip(cat_idle, "cat-idle")
cat_widths["cat-walking"] = make_strip(cat_walking, "cat-walking")
cat_widths["cat-sleeping"] = make_strip(cat_sleeping, "cat-sleeping")
cat_widths["cat-alerting"] = make_strip(cat_alerting, "cat-alerting")

print(f"\n  Cat widths: {cat_widths}")
