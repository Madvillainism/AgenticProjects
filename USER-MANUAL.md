# DeskDog — User Manual

## Editing Messages

Your pet displays health messages on a timer. To customize them:

1. Open `messages.txt` in the DeskDog folder (or `%APPDATA%\DeskDog\` if running the .exe)
2. Each line is one message — write whatever you want
3. Save the file. Changes take effect on the next message cycle (no restart needed)

**Example:**
```
Drink some water!
Stretch your back.
Look at something far away for 20 seconds.
```

Empty lines are ignored.

---

## Changing Settings

DeskDog stores its settings in `%APPDATA%\DeskDog\config.json`.

To edit:
1. Open `%APPDATA%\DeskDog\config.json` in any text editor
2. Modify the values below
3. Save and restart DeskDog

**Available settings:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `pet_type` | string | `"dog"` | Which pet to show: `dog`, `cat`, `bunny`, `frog` |
| `message_interval` | number | `60` | Seconds between health messages |
| `sounds_enabled` | boolean | `true` | Enable or disable sounds |

**Example config.json:**
```json
{
  "pet_type": "bunny",
  "message_interval": 120,
  "sounds_enabled": false
}
```

---

## Sound Toggle

You can toggle sounds without editing config files:

1. **Right-click** on your pet
2. Click **"Sonido: ON"** or **"Sonido: OFF"**
3. The setting is saved automatically

---

## Changing Your Pet

1. **Right-click** on your pet
2. Click **"Cambiar mascota"**
3. Pick from: Dog, Cat, Bunny, or Frog

---

## Replacing Sprites

If you want to use your own pet art:

1. Create a PNG sprite sheet with frames arranged horizontally (left to right)
2. Each frame must be **44×44 pixels**
3. Name the file `{pet_name}-{state}.png` (e.g. `mydog-idle.png`)
4. Place it in the `sprites/` folder
5. Available states: `idle`, `walking`, `sleeping`, `alerting`

**Required files per pet:**
```
sprites/
  mydog-idle.png
  mydog-walking.png
  mydog-sleeping.png
  mydog-alerting.png
```

Then set `"pet_type": "mydog"` in config.json.

---

## File Locations

| What | Where |
|------|-------|
| Messages | `messages.txt` in app folder |
| Config | `%APPDATA%\DeskDog\config.json` |
| Sprites | `sprites/` in app folder |
| Logs | `%APPDATA%\DeskDog\logs\deskdog.log` |

---

## Troubleshooting

- **Pet doesn't appear:** Check that sprite files exist and are valid 44×44 PNGs
- **No messages:** Make sure `messages.txt` has at least one non-empty line
- **Sound not playing:** Check that `sounds_enabled` is `true` in config and `.wav` files exist in `sounds/`
- **Config not saving:** Make sure `%APPDATA%\DeskDog\` folder exists and is writable
