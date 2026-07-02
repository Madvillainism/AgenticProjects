import threading
from PIL import Image, ImageDraw
import pystray
from pystray import MenuItem as Item
from logger import get_logger

class TrayManager:
    def __init__(self, root, on_show=None, on_quit=None):
        self.root = root
        self.on_show = on_show
        self.on_quit = on_quit
        self.icon = None

    def _create_image(self):
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw.ellipse([8, 8, 56, 56], fill=(80, 160, 255, 255))
        draw.ellipse([20, 20, 30, 30], fill=(255, 255, 255, 255))
        draw.ellipse([34, 20, 44, 30], fill=(255, 255, 255, 255))
        draw.arc([20, 32, 44, 50], 0, 180, fill=(255, 255, 255, 255), width=3)
        return img

    def start(self):
        if self.icon:
            return
        menu = (
            Item("Mostrar/Ocultar", self._toggle),
            Item("Salir", self._quit),
        )
        self.icon = pystray.Icon("DeskDog", self._create_image(), "DeskDog", menu)
        get_logger().info("System tray icon started")
        threading.Thread(target=self.icon.run, daemon=True).start()

    def _toggle(self, icon, item):
        if self.on_show:
            self.root.after(0, self.on_show)

    def _quit(self, icon, item):
        if self.on_quit:
            self.root.after(0, self.on_quit)

    def stop(self):
        if self.icon:
            get_logger().info("Stopping system tray icon")
            self.icon.stop()
            self.icon = None
