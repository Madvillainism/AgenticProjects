import { describe, it, expect, beforeEach } from "vitest";
import { ProfileSelector } from "../ProfileSelector";

describe("ProfileSelector", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("creates overlay with two pet cards", () => {
    new ProfileSelector();
    const cards = document.querySelectorAll(".pet-card");
    expect(cards.length).toBe(2);
  });

  it("shows dog and cat options", () => {
    new ProfileSelector();
    const spans = document.querySelectorAll(".pet-card span");
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe("Perro");
    expect(spans[1].textContent).toBe("Gato");
  });

  it("has a name input field", () => {
    new ProfileSelector();
    const input = document.querySelector(".name-input") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.type).toBe("text");
  });

  it("has a disabled start button initially", () => {
    new ProfileSelector();
    const btn = document.querySelector(".start-btn") as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe("Adoptar");
  });

  it("appends to #app container", () => {
    new ProfileSelector();
    const app = document.getElementById("app");
    expect(app?.children.length).toBe(1);
    expect(app?.children[0].className).toBe("profile-selector");
  });

  it("enables start button after selecting pet and entering name", () => {
    new ProfileSelector();
    const btn = document.querySelector(".start-btn") as HTMLButtonElement;
    const input = document.querySelector(".name-input") as HTMLInputElement;

    input.value = "Firulais";
    input.dispatchEvent(new Event("input"));

    const cards = document.querySelectorAll(".pet-card");
    (cards[0] as HTMLElement).click();

    expect(btn.disabled).toBe(false);
  });

  it("calls onSelect callback with pet and name on start", () => {
    return new Promise<void>((done) => {
      const selector = new ProfileSelector();
      selector.onSelect((pet, name) => {
        expect(pet).toBe("dog");
        expect(name).toBe("Firulais");
        done();
      });

      const input = document.querySelector(".name-input") as HTMLInputElement;
      input.value = "Firulais";
      input.dispatchEvent(new Event("input"));

      const cards = document.querySelectorAll(".pet-card");
      (cards[0] as HTMLElement).click();

      const btn = document.querySelector(".start-btn") as HTMLButtonElement;
      btn.click();
    });
  });

  it("destroy removes overlay from DOM", () => {
    const selector = new ProfileSelector();
    selector.destroy();
    const app = document.getElementById("app");
    expect(app?.children.length).toBe(0);
  });
});
