import tkinter as tk
import random
import time
import math
import ctypes
from ctypes import wintypes
from config_store import load_config, save_config
from pet_renderer import PetRenderer
from speech_bubble import SpeechBubble
from profile_selector import ProfileSelector
from tray_manager import TrayManager
from monitor import get_virtual_desktop_bounds, get_cursor_monitor, get_monitor_bounds
from logger import setup_logger, get_logger

GWL_EXSTYLE = -20
WS_EX_LAYERED = 0x80000
WS_EX_TRANSPARENT = 0x20
WS_EX_TOOLWINDOW = 0x80

user32 = ctypes.windll.user32
SetWindowLongW = user32.SetWindowLongW
SetWindowLongW.argtypes = [wintypes.HWND, ctypes.c_int, ctypes.c_long]
SetWindowLongW.restype = ctypes.c_long
GetWindowLongW = user32.GetWindowLongW
GetWindowLongW.argtypes = [wintypes.HWND, ctypes.c_int]
GetWindowLongW.restype = ctypes.c_long

SPRITE_W = 44
SPRITE_H = 44
ANIMATION_INTERVAL = 150
PATROL_INTERVAL = 12000
PATROL_STEP_INTERVAL = 30
CURSOR_POLL_INTERVAL = 100
SLEEP_DELAY = 10000
MESSAGE_INTERVAL_MIN = 45000
MESSAGE_INTERVAL_MAX = 120000
BOB_AMPLITUDE = 3
BOB_PERIOD = 2000
CLICK_THRESHOLD = 5

class DeskDogApp:
    def __init__(self, root):
        setup_logger()
        self.root = root
        self.logger = get_logger()
        self.logger.info("Starting DeskDogApp")
        self.pet_type = self._get_pet_type()
        self.frame_index = 0
        self.dragging = False
        self.drag_start_x = 0
        self.drag_start_y = 0
        self.press_x = 0
        self.press_y = 0
        self.last_cursor_time = time.time()
        self.patrol_active = False
        self.current_cycle_state = "idle"
        self.timers = {}
        self._bob_phase = random.uniform(0, 2 * math.pi)
        self._bob_base_y = None
        self._alerting_remaining = 0

        self.renderer = PetRenderer(self.pet_type)
        self.speech = SpeechBubble(self.root, self)
        self.tray = TrayManager(self.root, on_show=self._toggle_window, on_quit=self._quit)

        self._setup_window()
        self._place_sprite()
        self._bind_events()
        self._set_click_through(True)
        self.tray.start()
        self._set_timer("animation", ANIMATION_INTERVAL, self._animate_frame)
        self._set_timer("cursor_poll", CURSOR_POLL_INTERVAL, self._poll_cursor)
        self._schedule_patrol()
        self._schedule_message()

    def _get_pet_type(self):
        config = load_config()
        if config.get("pet_type"):
            return config["pet_type"]
        selector = ProfileSelector(self.root, lambda x: None)
        result = selector.result or "dog"
        save_config({"pet_type": result})
        return result

    def _setup_window(self):
        cursor_mon = get_cursor_monitor()
        start_x = cursor_mon[0] + 100
        start_y = cursor_mon[1] + 100
        self.win = tk.Toplevel(self.root)
        self.win.withdraw()
        self.win.overrideredirect(True)
        self.win.attributes("-topmost", True)
        self.win.attributes("-transparentcolor", "#abcdef")
        self.win.configure(bg="#abcdef")
        self.win.geometry(f"{SPRITE_W}x{SPRITE_H}+{start_x}+{start_y}")
        self.win.protocol("WM_DELETE_WINDOW", self._hide_window)

        self.hwnd = None
        self.win.update_idletasks()
        try:
            self.hwnd = user32.GetParent(self.win.winfo_id())
        except Exception as e:
            self.logger.warning("Cannot get HWND: %s", e)

        self.win.deiconify()
        self.win.lift()
        self._set_toolwindow()
        self._bob_base_y = self.win.winfo_y()

    def _set_toolwindow(self):
        if self.hwnd:
            style = GetWindowLongW(self.hwnd, GWL_EXSTYLE)
            SetWindowLongW(self.hwnd, GWL_EXSTYLE, style | WS_EX_TOOLWINDOW)
            user32.SetWindowPos(self.hwnd, 0, 0, 0, 0, 0, 0x0002 | 0x0001 | 0x0020)

    def _set_layered(self):
        if self.hwnd:
            style = GetWindowLongW(self.hwnd, GWL_EXSTYLE)
            SetWindowLongW(self.hwnd, GWL_EXSTYLE, style | WS_EX_LAYERED)

    def _set_click_through(self, enabled):
        if not self.hwnd:
            return
        style = GetWindowLongW(self.hwnd, GWL_EXSTYLE)
        if enabled:
            style |= WS_EX_TRANSPARENT
        else:
            style &= ~WS_EX_TRANSPARENT
        SetWindowLongW(self.hwnd, GWL_EXSTYLE, style)

    def _place_sprite(self):
        self.canvas = tk.Canvas(self.win, width=SPRITE_W, height=SPRITE_H,
                                bg="#abcdef", highlightthickness=0, bd=0)
        self.canvas.pack()
        self.canvas.configure(cursor="hand2")
        self.sprite_id = self.canvas.create_image(SPRITE_W // 2, SPRITE_H // 2,
                                                  anchor="center")
        initial = self.renderer.get_photo("idle", 0)
        if initial:
            self.canvas.itemconfig(self.sprite_id, image=initial)

    def _bind_events(self):
        self.canvas.bind("<Button-1>", self._on_press)
        self.canvas.bind("<B1-Motion>", self._on_drag_move)
        self.canvas.bind("<ButtonRelease-1>", self._on_release)
        self.canvas.bind("<Button-3>", self._on_context_menu)
        self.canvas.bind("<Enter>", self._on_mouse_enter)
        self.canvas.bind("<Leave>", self._on_mouse_leave)
        self.win.bind("<Map>", lambda e: self._set_layered())

    def _on_mouse_enter(self, event):
        self.last_cursor_time = time.time()
        self._set_click_through(False)
        if self.current_cycle_state == "sleeping":
            self._transition_to("idle")

    def _on_mouse_leave(self, event):
        self._set_click_through(True)

    def _on_press(self, event):
        self.press_x = event.x_root
        self.press_y = event.y_root
        self.drag_start_x = event.x_root - self.win.winfo_x()
        self.drag_start_y = event.y_root - self.win.winfo_y()

    def _on_drag_move(self, event):
        dx = event.x_root - self.press_x
        dy = event.y_root - self.press_y
        dist = math.hypot(dx, dy)
        if dist > CLICK_THRESHOLD:
            if not self.dragging:
                self.dragging = True
                self._cancel_patrol()
                self._set_click_through(True)
            x = event.x_root - self.drag_start_x
            y = event.y_root - self.drag_start_y
            self.win.geometry(f"+{x}+{y}")

    def _on_release(self, event):
        if self.dragging:
            self.dragging = False
            self._set_click_through(False)
            self._bob_base_y = self.win.winfo_y()
            self._schedule_patrol()
        else:
            self._on_click()

    def _on_click(self):
        if self.renderer.has_state("alerting"):
            self._transition_to("alerting")
            self._alerting_remaining = self.renderer.get_frame_count("alerting")
        else:
            self.logger.info("Click registered (no alerting sprite)")

    def _on_context_menu(self, event):
        menu = tk.Menu(self.win, tearoff=0, bg="#2d2d2d", fg="#e0e0e0",
                       activebackground="#444444", activeforeground="#ffffff")
        menu.add_command(label="Cambiar mascota", command=self._change_pet)
        menu.add_command(label="Dar un mensaje", command=lambda: self.speech.show())
        menu.add_separator()
        menu.add_command(label="Ocultar", command=self._hide_window)
        menu.add_command(label="Salir", command=self._quit)
        try:
            menu.tk_popup(event.x_root, event.y_root)
        finally:
            menu.grab_release()

    def _change_pet(self):
        selector = ProfileSelector(self.root, lambda x: None)
        new_pet = selector.result
        if new_pet and new_pet != self.pet_type:
            self.pet_type = new_pet
            self.renderer = PetRenderer(self.pet_type)
            self.frame_index = 0
            save_config({"pet_type": new_pet})
            self.logger.info("Pet changed to %s", new_pet)

    def _hide_window(self):
        self.win.withdraw()
        self.logger.info("Window hidden to tray")

    def _toggle_window(self):
        if self.win.winfo_viewable():
            self.win.withdraw()
        else:
            self.win.deiconify()
            self.win.lift()
            self.win.focus_force()
            self._set_layered()

    def _quit(self):
        self.logger.info("Quitting")
        for name, timer_id in list(self.timers.items()):
            try:
                self.win.after_cancel(timer_id)
            except Exception:
                pass
        self.timers.clear()
        self.tray.stop()
        self.win.destroy()
        self.root.destroy()

    def get_position(self):
        return self.win.winfo_x(), self.win.winfo_y()

    def get_width(self):
        return SPRITE_W

    def _set_timer(self, name, delay, callback):
        old = self.timers.get(name)
        if old is not None:
            try:
                self.win.after_cancel(old)
            except Exception:
                pass
        timer_id = self.win.after(delay, lambda: self._timer_fired(name, callback))
        self.timers[name] = timer_id

    def _timer_fired(self, name, callback):
        if name not in self.timers:
            return
        del self.timers[name]
        callback()

    def _cancel_timer(self, name):
        timer_id = self.timers.pop(name, None)
        if timer_id is not None:
            try:
                self.win.after_cancel(timer_id)
            except Exception:
                pass

    def _cancel_all_timers(self):
        for name in list(self.timers.keys()):
            self._cancel_timer(name)

    def _animate_frame(self):
        if self._alerting_remaining > 0:
            self._alerting_remaining -= 1
            if self._alerting_remaining == 0:
                self._transition_to("idle")
        self.frame_index += 1
        photo = self.renderer.get_photo(self.current_cycle_state, self.frame_index)
        if photo:
            self.canvas.itemconfig(self.sprite_id, image=photo)
        if self.current_cycle_state in ("idle", "alerting"):
            self._apply_bob()
        self._set_timer("animation", ANIMATION_INTERVAL, self._animate_frame)

    def _poll_cursor(self):
        now = time.time()
        elapsed = now - self.last_cursor_time
        if elapsed > SLEEP_DELAY / 1000:
            if self.current_cycle_state not in ("sleeping", "alerting"):
                self._transition_to("sleeping")
                self._cancel_patrol()
        else:
            if (not self.patrol_active
                and self.current_cycle_state not in ("idle", "walking", "alerting")
                and elapsed < SLEEP_DELAY / 1000):
                self._transition_to("idle")
        self._set_timer("cursor_poll", CURSOR_POLL_INTERVAL, self._poll_cursor)

    def _transition_to(self, state):
        if self.current_cycle_state == state:
            return
        self.current_cycle_state = state
        self.frame_index = 0
        self.logger.debug("State -> %s", state)

    def _schedule_patrol(self):
        self._cancel_timer("patrol_start")
        if self.current_cycle_state == "sleeping":
            self.patrol_active = False
            return
        delay = random.randint(PATROL_INTERVAL // 2, PATROL_INTERVAL * 2)
        self.patrol_active = True
        self._set_timer("patrol_start", delay, self._begin_patrol_move)

    def _begin_patrol_move(self):
        if self.current_cycle_state in ("sleeping", "alerting"):
            self.patrol_active = False
            self._schedule_patrol()
            return
        self._transition_to("walking")
        self.patrol_active = True
        vx, vy, vw, vh = get_virtual_desktop_bounds()
        self.patrol_start_x = self.win.winfo_x()
        direction = random.choice([-1, 1])
        travel = random.randint(40, min(200, vw - SPRITE_W))
        self.patrol_target_x = self.patrol_start_x + direction * travel
        self.patrol_target_x = max(vx, min(self.patrol_target_x, vx + vw - SPRITE_W))
        dist = abs(self.patrol_target_x - self.patrol_start_x)
        self.patrol_steps = max(1, dist // 2)
        self.patrol_step = 0
        self._do_patrol_step()

    def _do_patrol_step(self):
        if self.patrol_step >= self.patrol_steps or self.current_cycle_state == "sleeping":
            self._transition_to("idle")
            self.patrol_active = False
            self._set_timer("patrol_end_delay", 500, self._schedule_patrol)
            return
        if self.dragging:
            return
        self.patrol_step += 1
        t = self.patrol_step / self.patrol_steps
        t = t * t * (3 - 2 * t)
        cur_x = self.patrol_start_x + (self.patrol_target_x - self.patrol_start_x) * t
        y = self.win.winfo_y()
        self.win.geometry(f"+{int(cur_x)}+{y}")
        self._set_timer("patrol_step", PATROL_STEP_INTERVAL, self._do_patrol_step)

    def _cancel_patrol(self):
        self._cancel_timer("patrol_start")
        self._cancel_timer("patrol_step")
        self._cancel_timer("patrol_end_delay")
        self.patrol_active = False

    def _apply_bob(self):
        if self.current_cycle_state in ("idle", "alerting"):
            now = time.monotonic()
            offset = int(math.sin(now / BOB_PERIOD * 2 * math.pi + self._bob_phase) * BOB_AMPLITUDE)
            target_y = self._bob_base_y + offset
            cx = self.win.winfo_x()
            self.win.geometry(f"+{cx}+{target_y}")

    def _schedule_message(self):
        delay = random.randint(MESSAGE_INTERVAL_MIN, MESSAGE_INTERVAL_MAX)
        self._set_timer("health_message", delay, self._show_health_message)

    def _show_health_message(self):
        if self.current_cycle_state == "sleeping":
            self._schedule_message()
            return
        self.speech.show()
        self._set_timer("health_message_delay", 3000, self._schedule_message)
