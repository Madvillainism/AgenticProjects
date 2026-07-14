from PIL import Image, ImageDraw
import os

SPRITES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sprites")
W, H = 44, 44

def draw_bird(draw, frame_i, state):
    cx, cy = 22, 24
    if state == "idle":
        wing_up = frame_i % 2 == 0
        draw.ellipse([cx-8, cy-6, cx+8, cy+10], fill=(255, 220, 50))
        draw.ellipse([cx-6, cy-4, cx+6, cy+8], fill=(255, 240, 100))
        draw.ellipse([cx-2, cy-10, cx+6, cy-4], fill=(255, 220, 50))
        draw.ellipse([cx-1, cy-8, cx+5, cy-5], fill=(255, 240, 100))
        draw.polygon([(cx+6, cy-7), (cx+12, cy-6), (cx+6, cy-5)], fill=(255, 140, 0))
        draw.ellipse([cx-4, cy-9, cx-1, cy-7], fill=(30, 30, 30))
        if wing_up:
            draw.polygon([(cx-8, cy+2), (cx-16, cy-4), (cx-6, cy+6)], fill=(255, 200, 40))
        else:
            draw.polygon([(cx-8, cy+4), (cx-14, cy+8), (cx-4, cy+8)], fill=(255, 200, 40))
        draw.line([(cx, cy+10), (cx-2, cy+16)], fill=(200, 120, 0), width=2)
        draw.line([(cx+4, cy+10), (cx+6, cy+16)], fill=(200, 120, 0), width=2)
    elif state == "walking":
        step = frame_i % 4
        draw.ellipse([cx-8, cy-6, cx+8, cy+10], fill=(255, 220, 50))
        draw.ellipse([cx-6, cy-4, cx+6, cy+8], fill=(255, 240, 100))
        draw.ellipse([cx-2, cy-10, cx+6, cy-4], fill=(255, 220, 50))
        draw.polygon([(cx+6, cy-7), (cx+12, cy-6), (cx+6, cy-5)], fill=(255, 140, 0))
        draw.ellipse([cx-4, cy-9, cx-1, cy-7], fill=(30, 30, 30))
        wing_phase = step % 2
        if wing_phase == 0:
            draw.polygon([(cx-8, cy+2), (cx-16, cy-4), (cx-6, cy+6)], fill=(255, 200, 40))
        else:
            draw.polygon([(cx-8, cy+4), (cx-14, cy+8), (cx-4, cy+8)], fill=(255, 200, 40))
        leg_off = 2 if step < 2 else -2
        draw.line([(cx-1, cy+10), (cx-3+leg_off, cy+16)], fill=(200, 120, 0), width=2)
        draw.line([(cx+3, cy+10), (cx+5-leg_off, cy+16)], fill=(200, 120, 0), width=2)
    elif state == "sleeping":
        draw.ellipse([cx-8, cy-2, cx+8, cy+14], fill=(255, 220, 50))
        draw.ellipse([cx-6, cy, cx+6, cy+12], fill=(255, 240, 100))
        draw.ellipse([cx-2, cy-6, cx+6, cy], fill=(255, 220, 50))
        draw.polygon([(cx+6, cy-3), (cx+12, cy-2), (cx+6, cy-1)], fill=(255, 140, 0))
        draw.arc([cx-5, cy-5, cx+1, cy-1], 200, 340, fill=(30, 30, 30), width=1)
        draw.arc([cx-5, cy-5, cx+1, cy-1], 200, 340, fill=(30, 30, 30), width=1)
        z_off = (frame_i % 3) * 3
        draw.text((cx+10, cy-8-z_off), "z", fill=(180, 180, 180))
        draw.line([(cx, cy+14), (cx-2, cy+18)], fill=(200, 120, 0), width=2)
        draw.line([(cx+4, cy+14), (cx+6, cy+18)], fill=(200, 120, 0), width=2)
    elif state == "alerting":
        draw.ellipse([cx-8, cy-8, cx+8, cy+8], fill=(255, 220, 50))
        draw.ellipse([cx-6, cy-6, cx+6, cy+6], fill=(255, 240, 100))
        draw.ellipse([cx-2, cy-12, cx+6, cy-6], fill=(255, 220, 50))
        draw.polygon([(cx+6, cy-9), (cx+14, cy-8), (cx+6, cy-7)], fill=(255, 140, 0))
        draw.ellipse([cx-5, cy-11, cx-1, cy-7], fill=(30, 30, 30))
        spread = frame_i % 2 == 0
        if spread:
            draw.polygon([(cx-8, cy), (cx-20, cy-10), (cx-4, cy+4)], fill=(255, 200, 40))
            draw.polygon([(cx+8, cy), (cx+20, cy-10), (cx+4, cy+4)], fill=(255, 200, 40))
        else:
            draw.polygon([(cx-8, cy+2), (cx-16, cy-4), (cx-4, cy+6)], fill=(255, 200, 40))
            draw.polygon([(cx+8, cy+2), (cx+16, cy-4), (cx+4, cy+6)], fill=(255, 200, 40))

def draw_hamster(draw, frame_i, state):
    cx, cy = 22, 24
    if state == "idle":
        draw.ellipse([cx-10, cy-8, cx+10, cy+10], fill=(210, 160, 100))
        draw.ellipse([cx-8, cy-6, cx+8, cy+8], fill=(240, 200, 150))
        draw.ellipse([cx-9, cy-14, cx-3, cy-6], fill=(210, 160, 100))
        draw.ellipse([cx+3, cy-14, cx+9, cy-6], fill=(210, 160, 100))
        draw.ellipse([cx-7, cy-12, cx-5, cy-8], fill=(255, 180, 180))
        draw.ellipse([cx+5, cy-12, cx+7, cy-8], fill=(255, 180, 180))
        draw.ellipse([cx-4, cy-3, cx-1, cy-1], fill=(30, 30, 30))
        draw.ellipse([cx+1, cy-3, cx+4, cy-1], fill=(30, 30, 30))
        draw.ellipse([cx-2, cy+1, cx+2, cy+4], fill=(255, 160, 160))
        draw.ellipse([cx-3, cy+6, cx+3, cy+12], fill=(240, 200, 150))
        cheek_off = (frame_i % 2) * 1
        draw.ellipse([cx-10-cheek_off, cy-1, cx-5, cy+4], fill=(255, 180, 160))
        draw.ellipse([cx+5, cy-1, cx+10+cheek_off, cy+4], fill=(255, 180, 160))
    elif state == "walking":
        step = frame_i % 4
        draw.ellipse([cx-10, cy-8, cx+10, cy+10], fill=(210, 160, 100))
        draw.ellipse([cx-8, cy-6, cx+8, cy+8], fill=(240, 200, 150))
        draw.ellipse([cx-9, cy-14, cx-3, cy-6], fill=(210, 160, 100))
        draw.ellipse([cx+3, cy-14, cx+9, cy-6], fill=(210, 160, 100))
        draw.ellipse([cx-4, cy-3, cx-1, cy-1], fill=(30, 30, 30))
        draw.ellipse([cx+1, cy-3, cx+4, cy-1], fill=(30, 30, 30))
        draw.ellipse([cx-2, cy+1, cx+2, cy+4], fill=(255, 160, 160))
        leg_off = 2 if step < 2 else -2
        draw.ellipse([cx-6+leg_off, cy+8, cx-2+leg_off, cy+14], fill=(200, 140, 80))
        draw.ellipse([cx+2-leg_off, cy+8, cx+6-leg_off, cy+14], fill=(200, 140, 80))
    elif state == "sleeping":
        draw.ellipse([cx-10, cy-4, cx+10, cy+14], fill=(210, 160, 100))
        draw.ellipse([cx-8, cy-2, cx+8, cy+12], fill=(240, 200, 150))
        draw.ellipse([cx-9, cy-10, cx-3, cy-2], fill=(210, 160, 100))
        draw.ellipse([cx+3, cy-10, cx+9, cy-2], fill=(210, 160, 100))
        draw.ellipse([cx-7, cy-8, cx-5, cy-4], fill=(255, 180, 180))
        draw.ellipse([cx+5, cy-8, cx+7, cy-4], fill=(255, 180, 180))
        draw.arc([cx-4, cy-1, cx+4, cy+3], 200, 340, fill=(30, 30, 30), width=1)
        z_off = (frame_i % 3) * 3
        draw.text((cx+12, cy-6-z_off), "z", fill=(180, 180, 180))
    elif state == "alerting":
        draw.ellipse([cx-10, cy-10, cx+10, cy+8], fill=(210, 160, 100))
        draw.ellipse([cx-8, cy-8, cx+8, cy+6], fill=(240, 200, 150))
        ear_up = frame_i % 2 == 0
        ey1 = cy - 16 if ear_up else cy - 12
        ey2 = cy - 8 if ear_up else cy - 4
        draw.ellipse([cx-9, ey1, cx-3, ey2], fill=(210, 160, 100))
        draw.ellipse([cx+3, ey1, cx+9, ey2], fill=(210, 160, 100))
        draw.ellipse([cx-7, ey1+2, cx-5, ey2-2], fill=(255, 180, 180))
        draw.ellipse([cx+5, ey1+2, cx+7, ey2-2], fill=(255, 180, 180))
        draw.ellipse([cx-5, cy-5, cx-2, cy-2], fill=(30, 30, 30))
        draw.ellipse([cx+2, cy-5, cx+5, cy-2], fill=(30, 30, 30))
        draw.ellipse([cx-2, cy, cx+2, cy+3], fill=(255, 160, 160))

def generate_pet(pet_name, draw_func, frames_per_state):
    for state, n_frames in frames_per_state.items():
        sheet = Image.new("RGBA", (W * n_frames, H), (0, 0, 0, 0))
        draw = ImageDraw.Draw(sheet)
        for i in range(n_frames):
            draw_func(draw, i, state)
            if i < n_frames - 1:
                draw.rectangle([W * (i + 1), 0, W * (i + 1) + W, H], fill=(0, 0, 0, 0))
        path = os.path.join(SPRITES_DIR, f"{pet_name}-{state}.png")
        sheet.save(path)
        print(f"Created {path} ({n_frames} frames, {sheet.size})")

if __name__ == "__main__":
    os.makedirs(SPRITES_DIR, exist_ok=True)
    bird_states = {"idle": 6, "walking": 6, "sleeping": 3, "alerting": 4}
    hamster_states = {"idle": 6, "walking": 6, "sleeping": 3, "alerting": 4}
    generate_pet("bird", draw_bird, bird_states)
    generate_pet("hamster", draw_hamster, hamster_states)
    print("Done!")
