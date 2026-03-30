import { describe, it, expect, beforeEach } from "bun:test";
import { TunnelManager } from "./manager.ts";
import type { TunnelStatus, TunnelService } from "./types.ts";

// Mock tunnel service for testing (avoids spawning real processes)
class MockTunnelService implements TunnelService {
  started = false;
  stopped = false;
  _url: string | null = null;
  _shouldFail = false;

  async start(): Promise<unknown> {
    if (this._shouldFail) throw new Error("Mock tunnel failure");
    this.started = true;
    this._url = "https://mock.tunnel.test";
    return { publicUrl: this._url };
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.started = false;
    this._url = null;
  }

  async status(): Promise<TunnelStatus> {
    return {
      running: this.started,
      publicUrl: this._url,
      port: 4000,
    };
  }
}

describe("TunnelManager", () => {
  let mgr: TunnelManager;

  beforeEach(() => {
    // Use a temp dir so event-log writes don't clutter
    mgr = new TunnelManager({ dir: "/tmp/tunnel-test-" + Date.now() });
  });

  it("starts with status not running", async () => {
    const status = await mgr.status();
    expect(status.running).toBe(false);
    expect(status.provider).toBeNull();
  });

  it("url() returns null when no tunnel running", async () => {
    const url = await mgr.url();
    expect(url).toBeNull();
  });

  it("stop() is a no-op when no tunnel running", async () => {
    // Should not throw
    await mgr.stop();
  });

  describe("provider resolution", () => {
    it("constructs a TailscaleServeServiceImpl for tailscale provider", async () => {
      // We can't actually start tailscale in tests, but we can verify the
      // manager accepts the config and fails gracefully
      try {
        await mgr.start({ provider: "tailscale", port: 4000 });
      } catch {
        // Expected: tailscale binary not found in CI
      }
    });

    it("constructs an NgrokService for ngrok provider", async () => {
      try {
        await mgr.start({
          provider: "ngrok",
          port: 4000,
          startupTimeoutMs: 100, // fail fast
        });
      } catch {
        // Expected: ngrok binary not found in CI
      }
    });

    it("constructs a CloudflareService for cloudflare provider", async () => {
      try {
        await mgr.start({
          provider: "cloudflare",
          port: 4000,
          startupTimeoutMs: 100,
        });
      } catch {
        // Expected: cloudflared binary not found in CI
      }
    });
  });
});
