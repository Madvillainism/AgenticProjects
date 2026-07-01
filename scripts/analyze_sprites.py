from PIL import Image
import numpy as np

for name in ["dog", "cat"]:
    img = Image.open(f"frontend/public/sprites/{name}-sprite-sheet.jpg")
    print(f"\n=== {name} sprite sheet: {img.size} ===")
    arr = np.array(img)
    h, w = arr.shape[:2]

    white_rows = []
    for y in range(h):
        row = arr[y, :, :]
        mean_white = np.mean(row > 240)
        if mean_white > 0.95:
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

    print(f"White separator bands: {white_bands}")

    content_regions = []
    prev_end = -1
    for ws, we in white_bands:
        if prev_end >= 0 and ws - prev_end > 5:
            content_regions.append((prev_end + 1, ws - 1))
        prev_end = we
    if h - 1 - prev_end > 5:
        content_regions.append((prev_end + 1, h - 1))

    print(f"Content row bands: {content_regions}")

    white_cols = []
    for x in range(w):
        col = arr[:, x, :]
        mean_white = np.mean(col > 240)
        if mean_white > 0.90:
            white_cols.append(x)

    white_col_bands = []
    if white_cols:
        start = white_cols[0]
        end = white_cols[0]
        for x in white_cols[1:]:
            if x == end + 1:
                end = x
            else:
                white_col_bands.append((start, end))
                start = end = x
        white_col_bands.append((start, end))
    print(f"White col bands: {white_col_bands}")

    for cy1, cy2 in content_regions:
        print(f"\n  Content band y={cy1}-{cy2}:")
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
                frames_x.append((fx_start, x - 1))
        if in_frame:
            frames_x.append((fx_start, w - 1))

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
                actual_fh = y2 - y1 + 1
                actual_fw = x2 - x1 + 1
            else:
                actual_fh, actual_fw = band.shape[0], (fx2 - fx1 + 1)
            print(f"    Frame x={fx1}-{fx2} ({actual_fw}x{actual_fh})")
