import "./../styles.css";
import { PetRenderer } from "./PetRenderer";
import { ProfileSelector } from "./ProfileSelector";
import { SpeechBubble } from "./SpeechBubble";
import { initBridge } from "./bridge-client";

declare global {
  interface Window {
    showHealthBubble?: (text: string) => void;
    setHealthMode?: (mode: string) => void;
    qt?: {
      webChannelTransport: {
        send: (message: unknown) => void;
        onmessage: ((message: unknown) => void) | null;
      };
    };
  }
}

const selector = new ProfileSelector();
selector.onSelect((pet, name) => {
  selector.destroy();

  const renderer = new PetRenderer(pet);

  initBridge().then((bridge) => {
    bridge.saveConfig("petName", name);

    const bubble = new SpeechBubble(bridge);

    window.showHealthBubble = (text: string) => {
      if (bubble.isVisible()) {
        return;
      }
      let body = text;
      let actions: Array<{ label: string; action: string }> = [];
      try {
        const msg = JSON.parse(text);
        body = msg.body || body;
        actions = msg.actions || [];
      } catch {
      }
      bubble.show(body, actions);
    };

    bridge.connect("patrolMoving", (moving: boolean) => {
      renderer.setState(moving ? "walking" : "idle");
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "\u00d7";
    closeBtn.title = "Close DeskDog";
    closeBtn.addEventListener("click", () => bridge.closeApp());
    document.getElementById("app")?.appendChild(closeBtn);

    document.getElementById("app")?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      bridge.closeApp();
    });

    let healthMode = "normal";
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "health-toggle";
    toggleBtn.textContent = "10min";
    toggleBtn.title = "Toggle health reminder interval";
    toggleBtn.addEventListener("click", () => {
      healthMode = healthMode === "normal" ? "test" : "normal";
      toggleBtn.textContent = healthMode === "test" ? "10s" : "10min";
      bridge.setHealthInterval(healthMode);
    });
    document.getElementById("app")?.appendChild(toggleBtn);

    window.setHealthMode = (mode: string) => {
      healthMode = mode;
      toggleBtn.textContent = mode === "test" ? "10s" : "10min";
    };
  }).catch(() => {
  });
});
