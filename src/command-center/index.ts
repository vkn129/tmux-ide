import { createServer, type Server, type IncomingMessage } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { WebSocketServer, type WebSocket } from "ws";
import { createApp, type CreateAppOptions } from "./server.ts";
import { discoverSessions } from "./discovery.ts";
import {
  startMirror,
  handleInput as mirrorHandleInput,
  stopAll as stopAllMirrors,
} from "./pane-mirror.ts";
import { listSessionPanes } from "../widgets/lib/pane-comms.ts";
import { validateWsToken } from "../lib/auth/middleware.ts";
import { AuthService } from "../lib/auth/auth-service.ts";
import type { AuthConfig } from "../lib/auth/types.ts";
import { WsV3Hub } from "../lib/ws-v3/hub.ts";

export interface CommandCenterOptions {
  port?: number;
  hostname?: string;
  authService?: AuthService;
  authConfig?: AuthConfig;
}

/**
 * Attach WebSocket upgrade handling to an HTTP server.
 * Clients connect to /ws/mirror/{session}/{paneId} to mirror a tmux pane.
 */
export function attachWebSockets(
  server: Server,
  _session: string,
  _dir: string,
  authService?: AuthService,
  authConfig?: AuthConfig,
): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });
  const effectiveAuthConfig: AuthConfig = authConfig ?? { method: "none", token_expiry: 86400 };
  const effectiveAuthService = authService ?? new AuthService();
  const wsV3Hub = new WsV3Hub(effectiveAuthService, effectiveAuthConfig);

  server.on("upgrade", (req: IncomingMessage, socket, head) => {
    // Use raw URL to preserve %N pane IDs (url.parse decodes %36 → '6')
    const rawUrl = req.url ?? "/";
    const rawPath = rawUrl.split("?")[0]!;

    const isV3 = /^\/ws\/v3\//.test(rawPath);

    if (!isV3) {
      // v1 mirror: validate JWT from ?token= query parameter before upgrade
      const qs = rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?") + 1) : "";
      const tokenParam = new URLSearchParams(qs).get("token");
      const userId = validateWsToken(effectiveAuthService, effectiveAuthConfig, tokenParam);
      if (!userId) {
        socket.destroy();
        return;
      }
    }

    // WebSocket v3: /ws/v3/{session}/{paneId} — JWT via initial HELLO binary frame (not query string)
    const v3Match = rawPath.match(/^\/ws\/v3\/([^/]+)\/(.+)$/);
    if (v3Match) {
      const v3Session = decodeURIComponent(v3Match[1]!);
      const v3PaneId = v3Match[2]!;
      wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
        wsV3Hub.handleConnection(ws, v3Session, v3PaneId);
        wss.emit("connection", ws, req);
      });
      return;
    }

    // v1 mirror WebSocket: /ws/mirror/{sessionName}/{paneId}
    const mirrorMatch = rawPath.match(/^\/ws\/mirror\/([^/]+)\/(.+)$/);
    if (!mirrorMatch) {
      socket.destroy();
      return;
    }

    const mirrorSession = decodeURIComponent(mirrorMatch[1]!);
    // Don't decode paneId — tmux uses %N format (literal percent + number)
    const paneId = mirrorMatch[2]!;

    // Validate session and pane exist
    try {
      const panes = listSessionPanes(mirrorSession);
      const paneExists = panes.some((p) => p.id === paneId);
      if (!paneExists) {
        socket.destroy();
        return;
      }
    } catch {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
      startMirror(mirrorSession, paneId, ws);

      ws.on("message", (data: Buffer | string) => {
        const str = typeof data === "string" ? data : data.toString("utf-8");

        // Ignore JSON control messages (resize not supported — would shrink tmux for all clients)
        if (str.startsWith("{")) return;

        mirrorHandleInput(paneId, str);
      });

      wss.emit("connection", ws, req);
    });
  });

  server.on("close", () => {
    wsV3Hub.stopAll();
  });

  return wss;
}

export async function startCommandCenter(options: CommandCenterOptions = {}): Promise<Server> {
  const port = options.port ?? 4000;
  const hostname = options.hostname ?? "0.0.0.0";
  const appOpts: CreateAppOptions = {};
  if (options.authService) appOpts.authService = options.authService;
  if (options.authConfig) appOpts.authConfig = options.authConfig;
  const app = createApp(appOpts);

  const listener = getRequestListener(app.fetch);
  const server = createServer(listener);

  // Discover the first active tmux-ide session for context
  const sessions = discoverSessions();
  const activeSession = sessions[0];
  const session = activeSession?.name ?? "";
  const dir = activeSession?.dir ?? process.cwd();

  // Attach WebSocket upgrade handler for pane mirrors
  attachWebSockets(server, session, dir, options.authService, options.authConfig);

  // Cleanup mirrors on server close (v3 hub stopped inside attachWebSockets)
  server.on("close", () => {
    stopAllMirrors();
  });

  return new Promise((resolve) => {
    server.listen(port, hostname, () => {
      console.log(`Command Center API on http://${hostname}:${port}`);
      if (session) {
        console.log(
          `WebSocket pane mirrors at ws://${hostname}:${port}/ws/mirror/{session}/{paneId}`,
        );
      }
      resolve(server);
    });
  });
}
