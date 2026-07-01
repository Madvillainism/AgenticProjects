import { describe, it, expect, beforeEach } from "vitest";
import { initBridge, getBridge } from "../bridge-client";

describe("bridge-client", () => {
  beforeEach(() => {
    delete (window as any).qt;
  });

  it("initBridge rejects when qt transport is unavailable", async () => {
    await expect(initBridge()).rejects.toThrow("QWebChannel transport not available");
  });

  it("getBridge returns null before init", () => {
    expect(getBridge()).toBeNull();
  });

  it("initBridge resolves when qt transport is available", async () => {
    let onmessageCb: ((event: { data: string }) => void) | null = null;
    const mockTransport = {
      send: () => {},
      onmessage: null as unknown as ((event: { data: string }) => void) | null,
    };
    (window as any).qt = { webChannelTransport: mockTransport };

    const promise = initBridge();
    onmessageCb = mockTransport.onmessage;

    const initMsg = JSON.stringify({
      id: 0,
      type: "init",
      data: {
        bridge: {
          signals: ["patrolMoving", "closeRequested"],
          methods: ["saveConfig", "loadConfig", "closeApp", "startApp"],
          properties: {},
        },
      },
    });

    setTimeout(() => {
      if (onmessageCb) {
        onmessageCb({ data: initMsg });
      }
    }, 10);

    const bridge = await promise;
    expect(bridge).toBeDefined();
    expect(typeof bridge.saveConfig).toBe("function");
    expect(typeof bridge.loadConfig).toBe("function");
    expect(typeof bridge.startApp).toBe("function");
    expect(typeof bridge.closeApp).toBe("function");
    expect(getBridge()).toBe(bridge);
  });
});
