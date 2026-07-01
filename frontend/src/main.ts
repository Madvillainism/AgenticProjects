import "./../styles.css";
import { PetRenderer } from "./PetRenderer";
import { ProfileSelector } from "./ProfileSelector";
import { SpeechBubble } from "./SpeechBubble";
import { initBridge } from "./bridge-client";
import messages from "./messages.json";

declare global {
  interface Window {
    qt?: {
      webChannelTransport: {
        send: (message: unknown) => void;
        onmessage: ((message: unknown) => void) | null;
      };
    };
    QWebChannel?: new (
      transport: NonNullable<Window["qt"]>["webChannelTransport"],
      callback: (channel: any) => void,
    ) => void;
  }
}

function getRandomMessage(): { body: string; actions: Array<{ label: string; action: string }> } {
  return messages[Math.floor(Math.random() * messages.length)];
}

function showContextMenu(x: number, y: number, bridge: any, info: string): void {
  const menu = document.createElement("div");
  menu.className = "context-menu";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const header = document.createElement("div");
  header.className = "context-menu-header";
  header.textContent = "DeskDog";
  menu.appendChild(header);

  const infoEl = document.createElement("div");
  infoEl.className = "context-menu-info";
  infoEl.textContent = info;
  menu.appendChild(infoEl);

  const closeBtn = document.createElement("button");
  closeBtn.className = "context-menu-btn";
  closeBtn.textContent = "Cerrar";
  closeBtn.addEventListener("click", () => {
    menu.remove();
    bridge.closeApp();
  });
  menu.appendChild(closeBtn);

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "context-menu-btn";
  dismissBtn.textContent = "Cancelar";
  dismissBtn.addEventListener("click", () => menu.remove());
  menu.appendChild(dismissBtn);

  document.getElementById("app")?.appendChild(menu);

  const closeMenu = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("mousedown", closeMenu);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", closeMenu), 0);
}

initBridge().then((bridge) => {
  const selector = new ProfileSelector(bridge);

  selector.onSelect(async (pet, name) => {
    selector.destroy();

    bridge.saveConfig("petType", pet);
    bridge.saveConfig("petName", name);

    const renderer = new PetRenderer(pet);
    renderer.setName(name);
    const bubble = new SpeechBubble();
    const spriteEl = renderer.getImageElement();

    bridge.connect("patrolMoving", (moving: boolean) => {
      renderer.setState(moving ? "walking" : "idle");
    });

    bridge.startApp();

    spriteEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const info = `${pet === "dog" ? "Perro" : "Gato"} · ${name}`;
      showContextMenu(e.clientX, e.clientY, bridge, info);
    });

    let sleepTimer: ReturnType<typeof setTimeout> | null = null;
    let asleep = false;

    function resetSleepTimer() {
      if (asleep) {
        asleep = false;
        if (renderer.getState() === "sleeping") {
          renderer.setState("idle");
        }
      }
      if (sleepTimer) clearTimeout(sleepTimer);
      sleepTimer = setTimeout(() => {
        asleep = true;
        renderer.setState("sleeping");
      }, 10000);
    }

    document.addEventListener("mousemove", resetSleepTimer);
    resetSleepTimer();

    let messageInterval = 600000;
    try {
      const configStr = await bridge.loadConfig();
      const config = JSON.parse(configStr);
      if (config.messageInterval) {
        messageInterval = Number(config.messageInterval);
      }
    } catch {
    }
    bridge.saveConfig("messageInterval", String(messageInterval));

    setInterval(() => {
      if (bubble.isVisible()) return;
      const msg = getRandomMessage();
      bubble.show(msg.body, msg.actions);
    }, messageInterval);
  });
}).catch(() => {
});
