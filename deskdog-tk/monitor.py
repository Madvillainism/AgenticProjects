import ctypes
from ctypes import wintypes

user32 = ctypes.windll.user32

class RECT(ctypes.Structure):
    _fields_ = [
        ("left", ctypes.c_long),
        ("top", ctypes.c_long),
        ("right", ctypes.c_long),
        ("bottom", ctypes.c_long),
    ]

class MONITORINFOEX(ctypes.Structure):
    _fields_ = [
        ("cbSize", ctypes.c_ulong),
        ("rcMonitor", RECT),
        ("rcWork", RECT),
        ("dwFlags", ctypes.c_ulong),
        ("szDevice", ctypes.c_wchar * 32),
    ]

def get_monitor_bounds():
    monitors = []

    def callback(hmonitor, hdc, lprect, lparam):
        info = MONITORINFOEX()
        info.cbSize = ctypes.sizeof(MONITORINFOEX)
        if gdi32.GetMonitorInfoW(hmonitor, ctypes.byref(info)):
            r = info.rcMonitor
            monitors.append((r.left, r.top, r.right, r.bottom))
        return 1

    MonitorEnumProc = ctypes.WINFUNCTYPE(ctypes.c_int, ctypes.c_ulong, ctypes.c_ulong, ctypes.POINTER(RECT), ctypes.c_double)
    user32.EnumDisplayMonitors(0, 0, MonitorEnumProc(callback), 0)

    return monitors

def get_virtual_desktop_bounds():
    monitors = get_monitor_bounds()
    if not monitors:
        return 0, 0, 1920, 1080
    left = min(m[0] for m in monitors)
    top = min(m[1] for m in monitors)
    right = max(m[2] for m in monitors)
    bottom = max(m[3] for m in monitors)
    return left, top, right - left, bottom - top

def get_cursor_monitor():
    pt = wintypes.POINT()
    user32.GetCursorPos(ctypes.byref(pt))
    monitors = get_monitor_bounds()
    for left, top, right, bottom in monitors:
        if left <= pt.x < right and top <= pt.y < bottom:
            return left, top, right - left, bottom - top
    return get_virtual_desktop_bounds()
