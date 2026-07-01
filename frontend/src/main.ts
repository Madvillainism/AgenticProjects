import "./../styles.css";
import { PetRenderer } from "./PetRenderer";
import { ProfileSelector } from "./ProfileSelector";
import { SpeechBubble } from "./SpeechBubble";
import { initBridge } from "./bridge-client";
import messages from "./messages.json";

// Qt inyecta window.qt.webChannelTransport cuando usamos
// QWebEngineView + QWebChannel. Sin esto, no hay IPC.
declare global {
  interface Window {
    qt?: {
      webChannelTransport: {
        send: (message: unknown) => void;
        onmessage: ((message: unknown) => void) | null;
      };
    };
  }
}

function getRandomMessage(): { body: string; actions: Array<{ label: string; action: string }> } {
  return messages[Math.floor(Math.random() * messages.length)];
}

function showContextMenu(x: number, y: number, bridge: any, info: string): void {
  // Crea un menú flotante con opciones Cerrar / Cancelar.
  // Se cierra al hacer clic fuera (event listener en document).
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

  // Cerrar menú al hacer clic fuera.
  const closeMenu = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("mousedown", closeMenu);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", closeMenu), 0);
}

// Punto de entrada: conecta con Qt y muestra el selector de mascota.
initBridge().then((bridge) => {
  const selector = new ProfileSelector(bridge);

  // onSelect se ejecuta cuando el usuario hace clic en "Adoptar".
  selector.onSelect(async (pet, name) => {
    // 1. Destruir el selector (ocupa toda la ventana).
    selector.destroy();

    // 2. Guardar preferencias en config.txt.
    bridge.saveConfig("petType", pet);
    bridge.saveConfig("petName", name);

    // 3. Crear el renderer del sprite y la burbuja de mensajes.
    const renderer = new PetRenderer(pet);
    renderer.setName(name);
    const bubble = new SpeechBubble();
    const spriteEl = renderer.getImageElement();

    // 4. Escuchar señal patrolMoving para cambiar el sprite
    //    entre idle (quieto) y walking (caminando).
    bridge.connect("patrolMoving", (moving: boolean) => {
      renderer.setState(moving ? "walking" : "idle");
    });

    // 5. Arrancar el patrol (la ventana empieza a moverse).
    bridge.startApp();

    // 6. Menú contextual con clic derecho.
    spriteEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const info = `${pet === "dog" ? "Perro" : "Gato"} · ${name}`;
      showContextMenu(e.clientX, e.clientY, bridge, info);
    });

    // 7. Sistema de sueño: 10 segundos sin mouse → sprite sleeping.
    let sleepTimer: ReturnType<typeof setTimeout> | null = null;
    let asleep = false;

    function resetSleepTimer() {
      // Si estaba durmiendo, despertar al primer movimiento.
      if (asleep) {
        asleep = false;
        if (renderer.getState() === "sleeping") {
          renderer.setState("idle");
        }
      }
      // Resetear timer de 10 segundos.
      if (sleepTimer) clearTimeout(sleepTimer);
      sleepTimer = setTimeout(() => {
        asleep = true;
        renderer.setState("sleeping");
      }, 10000);
    }

    document.addEventListener("mousemove", resetSleepTimer);
    resetSleepTimer();

    // 8. Mensajes periódicos: leer intervalo de config.txt.
    let messageInterval = 600000; // 10 minutos por defecto.
    try {
      const configStr = await bridge.loadConfig();
      const config = JSON.parse(configStr);
      if (config.messageInterval) {
        messageInterval = Number(config.messageInterval);
      }
    } catch {
      // Si no existe config, usamos el default.
    }
    bridge.saveConfig("messageInterval", String(messageInterval));

    // 9. Timer de mensajes: cada N ms, muestra un mensaje aleatorio.
    setInterval(() => {
      if (bubble.isVisible()) return; // No acumular burbujas.
      const msg = getRandomMessage();
      bubble.show(msg.body, msg.actions);
    }, messageInterval);
  });
}).catch(() => {
  // Si no hay Qt (ej: en navegador), no hacemos nada.
});
