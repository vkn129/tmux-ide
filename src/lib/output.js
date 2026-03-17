export function output(data, { json } = {}) {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else if (typeof data === "string") {
    console.log(data);
  } else {
    console.log(data);
  }
}

export class CommandError extends Error {
  constructor(message, { code, exitCode = 1, details, json = false } = {}) {
    super(message);
    this.name = "CommandError";
    this.code = code;
    this.exitCode = exitCode;
    this.details = details;
    this.json = json;
  }
}

export function printLayout(config) {
  const INNER = 40;
  const rows = config.rows ?? [];
  if (rows.length === 0) return;

  for (let r = 0; r < rows.length; r++) {
    const panes = rows[r].panes ?? [];
    const count = panes.length || 1;
    const widths = [];
    let remaining = INNER;
    for (let i = 0; i < count; i++) {
      const w = i < count - 1 ? Math.floor(INNER / count) : remaining;
      widths.push(w);
      remaining -= w;
    }

    // Top border or mid divider
    if (r === 0) {
      let top = "  ┌";
      for (let i = 0; i < count; i++) {
        top += "─".repeat(widths[i]);
        top += i < count - 1 ? "┬" : "┐";
      }
      console.log(top);
    } else {
      console.log("  ├" + "─".repeat(INNER + count - 1) + "┤");
    }

    // Content line
    const sizeLabel = rows[r].size ?? "";
    let line = "  │";
    for (let i = 0; i < count; i++) {
      const title = panes[i]?.title ?? "";
      const w = widths[i];
      const pad = Math.max(0, w - title.length);
      const left = Math.floor(pad / 2);
      const right = pad - left;
      line += " ".repeat(left) + title + " ".repeat(right) + "│";
    }
    if (sizeLabel) line += "  " + sizeLabel;
    console.log(line);

    // Bottom border (last row only)
    if (r === rows.length - 1) {
      let bot = "  └";
      for (let i = 0; i < count; i++) {
        bot += "─".repeat(widths[i]);
        bot += i < count - 1 ? "┴" : "┘";
      }
      console.log(bot);
    }
  }
}

export function outputError(message, code, { json, exitCode = 1, details } = {}) {
  throw new CommandError(message, { code, exitCode, details, json });
}

export function printCommandError(error, { json = error?.json ?? false } = {}) {
  if (json) {
    const payload = { error: error.message, code: error.code };
    if (error.details !== undefined) payload.details = error.details;
    console.error(JSON.stringify(payload, null, 2));
  } else {
    console.error(error.message);
  }
  process.exit(error.exitCode ?? 1);
}
