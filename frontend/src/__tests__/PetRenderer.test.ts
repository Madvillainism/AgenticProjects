import { describe, it, expect, beforeEach } from "vitest";
import { PetRenderer } from "../PetRenderer";

describe("PetRenderer", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("creates a div element with correct className for dog", () => {
    const renderer = new PetRenderer("dog");
    const el = renderer.getImageElement();
    expect(el.tagName).toBe("DIV");
    expect(el.className).toBe("sprite dog-idle");
  });

  it("creates cat sprite when pet is cat", () => {
    const renderer = new PetRenderer("cat");
    const el = renderer.getImageElement();
    expect(el.className).toBe("sprite cat-idle");
  });

  it("setState changes className and state", () => {
    const renderer = new PetRenderer("dog");
    renderer.setState("walking");
    expect(renderer.getImageElement().className).toBe("sprite dog-walking");
    expect(renderer.getState()).toBe("walking");
  });

  it("setState toggles between all states", () => {
    const renderer = new PetRenderer("dog");
    const states = ["idle", "walking", "sleeping", "alerting"] as const;
    for (const state of states) {
      renderer.setState(state);
      expect(renderer.getImageElement().className).toBe(`sprite dog-${state}`);
      expect(renderer.getState()).toBe(state);
    }
  });

  it("setPetType changes class to new pet type", () => {
    const renderer = new PetRenderer("dog");
    renderer.setPetType("cat");
    expect(renderer.getImageElement().className).toBe("sprite cat-idle");
  });

  it("setPetType preserves current state", () => {
    const renderer = new PetRenderer("dog");
    renderer.setState("walking");
    renderer.setPetType("cat");
    expect(renderer.getImageElement().className).toBe("sprite cat-walking");
  });

  it("getImageElement returns the div", () => {
    const renderer = new PetRenderer("dog");
    const el = renderer.getImageElement();
    expect(el.tagName).toBe("DIV");
  });

  it("appends to #app container", () => {
    const renderer = new PetRenderer("dog");
    const app = document.getElementById("app");
    expect(app?.children.length).toBe(1);
    expect(app?.children[0]).toBe(renderer.getImageElement());
  });
});
