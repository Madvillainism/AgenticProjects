import { describe, it, expect } from "vitest";
import messages from "../messages.json";

describe("messages.json", () => {
  it("has at least 5 messages", () => {
    expect(messages.length).toBeGreaterThanOrEqual(5);
  });

  it("every message has body and actions", () => {
    for (const msg of messages) {
      expect(msg).toHaveProperty("body");
      expect(msg).toHaveProperty("actions");
    }
  });

  it("every action has label and action fields", () => {
    for (const msg of messages) {
      for (const action of msg.actions) {
        expect(action).toHaveProperty("label");
        expect(action).toHaveProperty("action");
      }
    }
  });
});
