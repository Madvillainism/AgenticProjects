import "./../styles.css";
import { PetRenderer } from "./PetRenderer";
import { ProfileSelector } from "./ProfileSelector";
import { SpeechBubble } from "./SpeechBubble";
import { initBridge } from "./bridge-client";

declare global {
  interface Window {
    showHealthBubble?: (text: string) => void;
    qt?: {
      webChannelTransport: {
        send: (message: unknown) => void;
        onmessage: ((message: unknown) => void) | null;
      };
    };
  }
}

const selector = new ProfileSelector();
selector.onSelect((pet) => {
  selector.destroy();
  new PetRenderer(pet);
  initBridge().then((bridge) => {
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
        // text is a plain string
      }
      bubble.show(body, actions);
    };
  }).catch(() => {
    // bridge not available
  });
});
