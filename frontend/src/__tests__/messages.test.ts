import { describe, it, expect } from "vitest";
import messages from "../../public/messages.json";

describe("messages.json", () => {
  it("has at least 10 messages", () => {
    expect(messages.length).toBeGreaterThanOrEqual(10);
  });

  it("every message has required fields", () => {
    for (const msg of messages) {
      expect(msg).toHaveProperty("type");
      expect(msg).toHaveProperty("title");
      expect(msg).toHaveProperty("body");
      expect(msg).toHaveProperty("actions");
      expect(["health", "grief", "help"]).toContain(msg.type);
    }
  });

  it("every action has label and action fields", () => {
    for (const msg of messages) {
      for (const action of msg.actions) {
        expect(action).toHaveProperty("label");
        expect(action).toHaveProperty("action");
        expect(["water", "dismiss"]).toContain(action.action);
      }
    }
  });

  it("has at least one health and one grief message", () => {
    const types = messages.map((m) => m.type);
    expect(types).toContain("health");
    expect(types).toContain("grief");
  });
});
