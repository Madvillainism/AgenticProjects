import { describe, it, expect, beforeEach } from "vitest";
import { SpeechBubble } from "../SpeechBubble";

function triggerAnimationEnd(el: HTMLElement) {
  el.dispatchEvent(new Event("animationend"));
}

describe("SpeechBubble", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("starts not visible", () => {
    const bubble = new SpeechBubble();
    expect(bubble.isVisible()).toBe(false);
  });

  it("show creates bubble element", () => {
    const bubble = new SpeechBubble();
    bubble.show("Hello", []);
    expect(bubble.isVisible()).toBe(true);
    const el = document.querySelector(".speech-bubble");
    expect(el).not.toBeNull();
  });

  it("show displays the text", () => {
    const bubble = new SpeechBubble();
    bubble.show("Test message", []);
    const el = document.querySelector(".speech-bubble p");
    expect(el?.textContent).toBe("Test message");
  });

  it("show creates action buttons", () => {
    const bubble = new SpeechBubble();
    const actions = [
      { label: "OK", action: "dismiss" },
      { label: "Later", action: "dismiss" },
    ];
    bubble.show("Actions test", actions);
    const buttons = document.querySelectorAll(".speech-bubble button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe("OK");
    expect(buttons[1].textContent).toBe("Later");
  });

  it("hide removes the bubble after animation", () => {
    const bubble = new SpeechBubble();
    bubble.show("Hide test", []);
    expect(bubble.isVisible()).toBe(true);
    bubble.hide();
    expect(bubble.isVisible()).toBe(true);
    const el = document.querySelector(".speech-bubble");
    expect(el).not.toBeNull();
    triggerAnimationEnd(el! as HTMLElement);
    expect(bubble.isVisible()).toBe(false);
    expect(document.querySelector(".speech-bubble")).toBeNull();
  });

  it("does not create duplicate bubbles", () => {
    const bubble = new SpeechBubble();
    bubble.show("First", []);
    bubble.show("Second", []);
    const els = document.querySelectorAll(".speech-bubble");
    expect(els.length).toBe(1);
  });

  it("hide calls onDismiss callback after animation", () => {
    let called = false;
    const bubble = new SpeechBubble();
    bubble.show("Test", [], () => { called = true; });
    bubble.hide();
    expect(called).toBe(false);
    const el = document.querySelector(".speech-bubble")! as HTMLElement;
    triggerAnimationEnd(el);
    expect(called).toBe(true);
  });
});
