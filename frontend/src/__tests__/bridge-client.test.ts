import { describe, it, expect, beforeEach } from "vitest";
import { initBridge, getBridge } from "../bridge-client";

const noop = (..._args: unknown[]) => {};

class MockQWebChannel {
  objects: Record<string, any>;
  constructor(
    _transport: { send: (...args: unknown[]) => void },
    callback: (channel: MockQWebChannel) => void,
  ) {
    this.objects = {
      bridge: {
        saveConfig: noop,
        loadConfig: () => Promise.resolve("{}"),
        closeApp: noop,
        startApp: noop,
        connect: noop,
        disconnect: noop,
      },
    };
    setTimeout(() => callback(this), 0);
  }
}

describe("bridge-client", () => {
  beforeEach(() => {
    delete (window as any).qt;
    delete (globalThis as any).QWebChannel;
  });

  it("initBridge rejects when qt transport is unavailable", async () => {
    await expect(initBridge()).rejects.toThrow("QWebChannel transport not available");
  });

  it("getBridge returns null before init", () => {
    expect(getBridge()).toBeNull();
  });

  it("initBridge resolves when qt transport is available", async () => {
    (globalThis as any).QWebChannel = MockQWebChannel;

    const mockTransport = { send: () => {} };
    (window as any).qt = { webChannelTransport: mockTransport };

    const bridge = await initBridge();
    expect(bridge).toBeDefined();
    expect(typeof bridge.saveConfig).toBe("function");
    expect(typeof bridge.loadConfig).toBe("function");
    expect(typeof bridge.startApp).toBe("function");
    expect(typeof bridge.closeApp).toBe("function");
    expect(getBridge()).toBe(bridge);
  });
});
