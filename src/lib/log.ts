/** Minimal structured logger for tmux-ide daemon processes. */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

let minLevel: Level = (process.env.LOG_LEVEL as Level) ?? "info";

export function setLogLevel(level: Level): void {
  minLevel = level;
}

function writeStructuredLog(
  level: Level,
  component: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[minLevel]) return;
  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    component,
    msg: message,
  };
  if (data) Object.assign(entry, data);
  const out = level === "error" ? process.stderr : process.stdout;
  out.write(JSON.stringify(entry) + "\n");
}

export const logger = {
  debug: (component: string, msg: string, data?: Record<string, unknown>) =>
    writeStructuredLog("debug", component, msg, data),
  info: (component: string, msg: string, data?: Record<string, unknown>) =>
    writeStructuredLog("info", component, msg, data),
  warn: (component: string, msg: string, data?: Record<string, unknown>) =>
    writeStructuredLog("warn", component, msg, data),
  error: (component: string, msg: string, data?: Record<string, unknown>) =>
    writeStructuredLog("error", component, msg, data),
};

/**
 * Thin logger shim compatible with VibeTunnel's module logger API (`createLogger`-style methods).
 * Wraps `console.*` (distinct from structured JSON `logger` above).
 */
export type LogMethod = (...args: unknown[]) => void;

export const log = {
  /** Alias for `info` / console.log (VibeTunnel `createLogger` compatibility). */
  log: (...args: unknown[]) => {
    console.log(...args);
  },
  info: (...args: unknown[]) => {
    console.log(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    console.debug(...args);
  },
} satisfies {
  log: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  debug: LogMethod;
};
