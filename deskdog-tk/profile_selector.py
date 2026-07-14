import tkinter as tk

class ProfileSelector:
    def __init__(self, parent, on_select):
        self.result = None
        self.win = tk.Toplevel(parent)
        self.win.title("Elegí tu mascota")
        self.win.configure(bg="#1e1e1e")
        self.win.resizable(False, False)
        self.win.attributes("-topmost", True)
        if parent:
            x = parent.winfo_screenwidth() // 2 - 130
            y = parent.winfo_screenheight() // 2 - 60
            self.win.geometry(f"260x160+{x}+{y}")

        tk.Label(self.win, text="¿Quién te acompaña hoy?", bg="#1e1e1e",
                 fg="#e0e0e0", font=("Segoe UI", 12, "bold")).pack(pady=(14, 8))

        btn_frame = tk.Frame(self.win, bg="#1e1e1e")
        btn_frame.pack()
        tk.Button(btn_frame, text="🐶 Perro", command=lambda: self._pick("dog"),
                  bg="#3a3a3a", fg="#e0e0e0", bd=0, padx=20, pady=6,
                  font=("Segoe UI", 11), cursor="hand2").pack(side="left", padx=8)
        tk.Button(btn_frame, text="🐱 Gato", command=lambda: self._pick("cat"),
                  bg="#3a3a3a", fg="#e0e0e0", bd=0, padx=20, pady=6,
                  font=("Segoe UI", 11), cursor="hand2").pack(side="left", padx=8)
        btn_frame2 = tk.Frame(self.win, bg="#1e1e1e")
        btn_frame2.pack(pady=(0, 8))
        tk.Button(btn_frame2, text="🐦 Pájaro", command=lambda: self._pick("bird"),
                  bg="#3a3a3a", fg="#e0e0e0", bd=0, padx=20, pady=6,
                  font=("Segoe UI", 11), cursor="hand2").pack(side="left", padx=8)
        tk.Button(btn_frame2, text="🐹 Hámster", command=lambda: self._pick("hamster"),
                  bg="#3a3a3a", fg="#e0e0e0", bd=0, padx=20, pady=6,
                  font=("Segoe UI", 11), cursor="hand2").pack(side="left", padx=8)
        self.win.grab_set()
        self.win.wait_window()

    def _pick(self, pet_type):
        self.result = pet_type
        self.win.destroy()
