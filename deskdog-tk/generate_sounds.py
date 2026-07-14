import wave
import struct
import math
import os

SOUNDS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sounds")
RATE = 22050

def make_wav(filename, freqs_durations):
    frames = []
    for freq, duration, volume in freqs_durations:
        n_samples = int(RATE * duration)
        for i in range(n_samples):
            t = i / RATE
            envelope = min(1.0, min(i / 200, (n_samples - i) / 200))
            val = math.sin(2 * math.pi * freq * t) * volume * envelope
            frames.append(struct.pack('<h', int(val * 32767)))
    path = os.path.join(SOUNDS_DIR, filename)
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
    print(f"Created {path}")

if __name__ == "__main__":
    os.makedirs(SOUNDS_DIR, exist_ok=True)
    make_wav("click.wav", [
        (880, 0.06, 0.3),
        (1100, 0.05, 0.25),
    ])
    make_wav("message.wav", [
        (523, 0.1, 0.3),
        (659, 0.1, 0.3),
        (784, 0.15, 0.25),
    ])
    make_wav("wake.wav", [
        (440, 0.08, 0.2),
        (554, 0.08, 0.25),
        (659, 0.12, 0.3),
    ])
    make_wav("sleep.wav", [
        (659, 0.1, 0.25),
        (554, 0.1, 0.2),
        (440, 0.15, 0.15),
    ])
    print("Done!")
