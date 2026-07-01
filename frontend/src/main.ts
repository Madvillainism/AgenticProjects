// Entry point: orchestrates profile selection, bridge init, and health bubble
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

// Show pet-type selection overlay
const selector = new ProfileSelector();
selector.onSelect((pet) => {
  selector.destroy();

  // Create sprite renderer for the chosen pet type
  new PetRenderer(pet);

  // Connect to Python backend via QWebChannel
  initBridge().then((bridge) => {
    const bubble = new SpeechBubble(bridge);

    // Register handler for Python-initiated health reminders
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
        // text is a plain string
      }
      bubble.show(body, actions);
    };

    // Close button (top-right corner)
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "×";
    closeBtn.title = "Close DeskDog";
    closeBtn.addEventListener("click", () => bridge.closeApp());
    document.getElementById("app")?.appendChild(closeBtn);

    // Right-click anywhere on the app to close
    document.getElementById("app")?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      bridge.closeApp();
    });

    // Debug toggle for health timer interval
    let healthMode = "normal";
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "health-toggle";
    toggleBtn.textContent = "10min";
    toggleBtn.title = "Toggle health reminder interval";
    toggleBtn.addEventListener("click", () => {
      healthMode = healthMode === "normal" ? "test" : "normal";
      toggleBtn.textContent = healthMode === "test" ? "40s" : "10min";
      bridge.setHealthInterval(healthMode);
    });
    document.getElementById("app")?.appendChild(toggleBtn);

    window.setHealthMode = (mode: string) => {
      healthMode = mode;
      toggleBtn.textContent = mode === "test" ? "40s" : "10min";
    };
  }).catch(() => {
    // bridge not available (e.g. running outside Qt)
  });
});
