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

  it("appends to #app container", () => {
    new ProfileSelector();
    const app = document.getElementById("app");
    expect(app?.children.length).toBe(1);
    expect(app?.children[0].className).toBe("profile-selector");
  });

  it("calls onSelect callback with dog on first card click", () => {
    return new Promise<void>((done) => {
      const selector = new ProfileSelector();
      selector.onSelect((pet) => {
        expect(pet).toBe("dog");
        done();
      });
      const cards = document.querySelectorAll(".pet-card");
      (cards[0] as HTMLElement).click();
    });
  });

  it("calls onSelect callback with cat on second card click", () => {
    return new Promise<void>((done) => {
      const selector = new ProfileSelector();
      selector.onSelect((pet) => {
        expect(pet).toBe("cat");
        done();
      });
      const cards = document.querySelectorAll(".pet-card");
      (cards[1] as HTMLElement).click();
    });
  });

  it("destroy removes overlay from DOM", () => {
    const selector = new ProfileSelector();
    selector.destroy();
    const app = document.getElementById("app");
    expect(app?.children.length).toBe(0);
  });
});
