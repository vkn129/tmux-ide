/**
 * Dashboard WebSocket v3 client — binary framing aligned with `src/lib/ws-v3/protocol.ts`
 * (command-center hub). Re-uses the shared codec from the main package via path alias.
 */

import {
  decodeWsV3Frame,
  encodeWsV3Frame,
  encodeWsV3SubscribePayload,
  WsV3MessageType,
  WsV3SubscribeFlags,
  type WsV3DecodedFrame,
} from "@tmux-ide/ws-v3-protocol";

export {
  WsV3MessageType,
  WsV3SubscribeFlags,
  encodeWsV3SubscribePayload,
  type WsV3DecodedFrame,
} from "@tmux-ide/ws-v3-protocol";

const utf8 = new TextEncoder();

/**
 * Encode a single v3 frame (same wire format as the server).
 */
export function encodeFrame(
  type: WsV3MessageType,
  sessionId: string,
  payload?: Uint8Array,
): Uint8Array {
  return encodeWsV3Frame({ type, sessionId, payload });
}

/**
 * Decode a v3 frame from binary WebSocket data.
 */
export function decodeFrame(buffer: ArrayBuffer | Uint8Array): WsV3DecodedFrame | null {
  const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return decodeWsV3Frame(u8);
}

/**
 * Initial auth handshake: HELLO with JSON body `{ token?: string }`.
 * Server expects this before SUBSCRIBE (see `WsV3Hub` — not a separate "AUTH" opcode).
 */
export function encodeHelloAuthFrame(token?: string | null): Uint8Array {
  const body = token ? JSON.stringify({ token }) : "{}";
  return encodeWsV3Frame({
    type: WsV3MessageType.HELLO,
    sessionId: "",
    payload: utf8.encode(body),
  });
}

/** SUBSCRIBE with stdout-only (bit 0). */
export function encodeSubscribeStdoutFrame(sessionKey: string): Uint8Array {
  return encodeWsV3Frame({
    type: WsV3MessageType.SUBSCRIBE,
    sessionId: sessionKey,
    payload: encodeWsV3SubscribePayload({ flags: WsV3SubscribeFlags.Stdout }),
  });
}

/** Send keystrokes / pasted text into the pane (server maps to tmux send-keys -l). */
export function encodeInputTextFrame(sessionKey: string, text: string): Uint8Array {
  return encodeWsV3Frame({
    type: WsV3MessageType.INPUT_TEXT,
    sessionId: sessionKey,
    payload: utf8.encode(text),
  });
}

export function paneSessionKey(sessionName: string, paneId: string): string {
  return `${sessionName}:${paneId}`;
}
