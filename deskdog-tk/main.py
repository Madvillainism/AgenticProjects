import tkinter as tk
from pet_app import DeskDogApp

if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()
    app = DeskDogApp(root)
    root.mainloop()
