import { describe, it, expect, beforeEach } from "vitest";
import { SpeechBubble } from "../SpeechBubble";

describe("SpeechBubble", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("starts not visible", () => {
    const bubble = new SpeechBubble({});
    expect(bubble.isVisible()).toBe(false);
  });

  it("show creates bubble element", () => {
    const bubble = new SpeechBubble({});
    bubble.show("Hello", []);
    expect(bubble.isVisible()).toBe(true);
    const el = document.querySelector(".speech-bubble");
    expect(el).not.toBeNull();
  });

  it("show displays the text", () => {
    const bubble = new SpeechBubble({});
    bubble.show("Test message", []);
    const el = document.querySelector(".speech-bubble p");
    expect(el?.textContent).toBe("Test message");
  });

  it("show creates action buttons", () => {
    const bubble = new SpeechBubble({});
    const actions = [
      { label: "OK", action: "dismiss" },
      { label: "Log", action: "water" },
    ];
    bubble.show("Actions test", actions);
    const buttons = document.querySelectorAll(".speech-bubble button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe("OK");
    expect(buttons[1].textContent).toBe("Log");
  });

  it("hide removes the bubble", () => {
    const bubble = new SpeechBubble({});
    bubble.show("Hide test", []);
    expect(bubble.isVisible()).toBe(true);
    bubble.hide();
    expect(bubble.isVisible()).toBe(false);
    const el = document.querySelector(".speech-bubble");
    expect(el).toBeNull();
  });

  it("calls bridge.logWater on water action click", () => {
    return new Promise<void>((done) => {
      const bridge = {
        logWater: () => done(),
        dismissBubble: () => {},
      };
      const bubble = new SpeechBubble(bridge);
      bubble.show("Water test", [{ label: "Drink", action: "water" }]);
      const btn = document.querySelector(".speech-bubble button");
      (btn as HTMLElement).click();
    });
  });

  it("calls bridge.dismissBubble on dismiss action click", () => {
    return new Promise<void>((done) => {
      const bridge = {
        logWater: () => {},
        dismissBubble: () => done(),
      };
      const bubble = new SpeechBubble(bridge);
      bubble.show("Dismiss test", [{ label: "OK", action: "dismiss" }]);
      const btn = document.querySelector(".speech-bubble button");
      (btn as HTMLElement).click();
    });
  });

  it("does not create duplicate bubbles", () => {
    const bubble = new SpeechBubble({});
    bubble.show("First", []);
    bubble.show("Second", []);
    const els = document.querySelectorAll(".speech-bubble");
    expect(els.length).toBe(1);
  });
});
