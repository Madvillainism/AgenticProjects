import tkinter as tk
import os
import sys
import random

def _resource_path(path):
    try:
        base = sys._MEIPASS
    except AttributeError:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, path)

MESSAGES_FILE = _resource_path("messages.txt")

class SpeechBubble:
    def __init__(self, parent, pet_window):
        self.parent = parent
        self.pet_window = pet_window
        self.win = None
        self._load_messages()

    def _load_messages(self):
        try:
            with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                self.messages = [line.strip() for line in f if line.strip()]
        except FileNotFoundError:
            self.messages = ["Te quiero Mucho!"]
        if not self.messages:
            self.messages = ["Te quiero Mucho!"]

    def show(self):
        msg = random.choice(self.messages)
        if self.win and self.win.winfo_exists():
            self.dismiss()
        self.win = tk.Toplevel(self.parent)
        self.win.withdraw()
        self.win.overrideredirect(True)
        self.win.attributes("-topmost", True)
        self.win.attributes("-transparentcolor", "#abcdef")
        self.win.configure(bg="#abcdef")

        frame = tk.Frame(self.win, bg="#2d2d2d", bd=0, highlightthickness=0)
        frame.pack(padx=8, pady=8)
        label = tk.Label(frame, text=msg, wraplength=220, justify="left",
                         bg="#2d2d2d", fg="#e0e0e0", font=("Segoe UI", 10))
        label.pack(padx=6, pady=(6, 2))

        btn_frame = tk.Frame(frame, bg="#2d2d2d")
        btn_frame.pack(pady=(2, 4))
        btn = tk.Button(btn_frame, text="Gracias",
                        command=self.dismiss,
                        bg="#444444", fg="#e0e0e0", bd=0, padx=10, pady=1,
                        font=("Segoe UI", 9), cursor="hand2")
        btn.pack(side="left", padx=4)

        self.win.update_idletasks()
        self.win.deiconify()
        self.win.update_idletasks()
        pw = self.win.winfo_width()
        ph = self.win.winfo_height()
        pet_x, pet_y = self.pet_window.get_position()
        pet_w = self.pet_window.get_width()
        bx = pet_x + pet_w // 2 - pw // 2
        by = pet_y - ph - 10
        screen_w = self.win.winfo_screenwidth()
        screen_h = self.win.winfo_screenheight()
        bx = max(0, min(bx, screen_w - pw))
        by = max(0, min(by, screen_h - ph))
        self.win.geometry(f"+{bx}+{by}")

    def dismiss(self):
        if self.win and self.win.winfo_exists():
            self.win.destroy()
        self.win = None
