import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { readConfig, getSessionName } from "./lib/yaml-io.js";
import { computeSizes, toSplitPercents } from "./lib/sizes.js";
import { outputError } from "./lib/output.js";
import { buildThemeOptions, collectPaneStartupPlan } from "./lib/launch-plan.js";
import {
  attachSession,
  createDetachedSession,
  getPaneCurrentCommand,
  hasSession,
  runSessionCommand,
  selectPane,
  sendLiteral,
  setPaneTitle,
  setSessionEnvironment,
  splitPane,
} from "./lib/tmux.js";
import { validateConfig } from "./validate.js";

function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function waitForPaneCommand(
  targetPane,
  expectedCommands,
  { attempts = 20, delayMs = 100, getCurrentCommand = getPaneCurrentCommand, sleep = sleepMs } = {},
) {
  const allowed = new Set(expectedCommands.map((command) => command.toLowerCase()));

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const current = getCurrentCommand(targetPane)?.trim().toLowerCase();
      if (allowed.has(current)) return true;
    } catch {
      // Fall through to retry; tmux can briefly report transitional state.
    }

    if (attempt < attempts - 1) {
      sleep(delayMs);
    }
  }

  return false;
}

export function buildPaneMap(rows, dir, rootPaneId, splitPane) {
  const rowSizes = computeSizes(rows);
  const rowSplitPercents = toSplitPercents(rowSizes);

  // Create all rows vertically first so each row spans the full width.
  const rowPaneIds = [rootPaneId];
  for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
    const splitFrom = rowPaneIds[rowIdx - 1];
    const newPaneId = splitPane({
      targetPane: splitFrom,
      direction: "vertical",
      cwd: dir,
      percent: rowSplitPercents[rowIdx - 1],
    });
    rowPaneIds.push(newPaneId);
  }

  const paneMap = [];
  const firstPanesOfRows = new Set(rowPaneIds);

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const panes = row.panes ?? [];
    const rowPaneId = rowPaneIds[rowIdx];
    const rowPanes = [rowPaneId];

    const paneSizes = computeSizes(panes);
    const paneSplitPercents = toSplitPercents(paneSizes);

    for (let paneIdx = 1; paneIdx < panes.length; paneIdx++) {
      const pane = panes[paneIdx];
      const targetPane = rowPanes[paneIdx - 1];
      const paneDir = pane.dir ? resolve(dir, pane.dir) : dir;
      const newPaneId = splitPane({
        targetPane,
        direction: "horizontal",
        cwd: paneDir,
        percent: paneSplitPercents[paneIdx - 1],
      });
      rowPanes.push(newPaneId);
    }

    paneMap.push(rowPanes);
  }

  return { paneMap, firstPanesOfRows };
}

function loadLaunchConfig(dir, { json } = {}) {
  let config;

  try {
    ({ config } = readConfig(dir));
  } catch (error) {
    if (error?.code === "ENOENT") {
      outputError(
        `No ide.yml found in ${dir}. Run "tmux-ide init" or "tmux-ide detect --write" to create one.`,
        "CONFIG_NOT_FOUND",
        { json },
      );
    }

    outputError(`Cannot read ide.yml: ${error.message}`, "READ_ERROR", { json });
  }

  const errors = validateConfig(config);
  if (errors.length > 0) {
    outputError(
      `Invalid ide.yml in ${dir}. Run "tmux-ide validate" for details.`,
      "INVALID_CONFIG",
      { json },
    );
  }

  return config;
}

function runBeforeHook(command, dir, { json } = {}) {
  if (!command) return;

  console.log(`Running: ${command}`);

  try {
    execSync(command, { cwd: dir, stdio: "inherit" });
  } catch {
    const message = json
      ? `The "before" hook failed: ${command}`
      : `The before hook failed: ${command}`;
    outputError(message, "BEFORE_HOOK_FAILED", { json });
  }
}

export async function launch(targetDir, { json, attach = true } = {}) {
  const dir = resolve(targetDir ?? ".");
  const config = loadLaunchConfig(dir, { json });

  const session = config.name ?? getSessionName(dir);
  const rows = config.rows;
  const theme = config.theme ?? {};
  const team = config.team ?? null;

  runBeforeHook(config.before, dir, { json });

  // If session already exists, just attach to it
  if (hasSession(session)) {
    console.log(`Session "${session}" is already running. Attaching...`);
    if (attach) {
      attachSession(session);
    }
    return;
  }

  // Get terminal dimensions
  const cols = process.stdout.columns ?? 200;
  const lines = process.stdout.rows ?? 50;

  // Create session with first pane
  const rootPaneId = createDetachedSession(session, dir, { cols, lines });

  // Set agent teams env var if team config is present
  if (team) {
    setSessionEnvironment(session, "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS", "1");
  }

  const { paneMap, firstPanesOfRows } = buildPaneMap(
    rows,
    dir,
    rootPaneId,
    ({ targetPane, direction, cwd, percent }) => splitPane(targetPane, direction, cwd, percent),
  );

  const { focusPane, leadPane, paneActions, teammateCommands } = collectPaneStartupPlan(
    rows,
    paneMap,
    firstPanesOfRows,
    dir,
    team,
  );

  for (const action of paneActions) {
    if (action.title) {
      setPaneTitle(action.targetPane, action.title);
    }

    if (action.chdir) {
      sendLiteral(action.targetPane, `cd ${action.chdir}`);
    }

    for (const exportCommand of action.exports) {
      sendLiteral(action.targetPane, exportCommand);
    }

    if (action.command) {
      sendLiteral(action.targetPane, action.command);
    }
  }

  // Keep a second pass hook available for future staged startup behavior.
  if (teammateCommands.length > 0) {
    if (leadPane) {
      waitForPaneCommand(leadPane, ["claude"]);
    }
    for (const { pane: p, cmd } of teammateCommands) {
      sendLiteral(p, cmd);
    }
  }

  for (const command of buildThemeOptions(session, theme)) {
    runSessionCommand(command);
  }

  // Focus the correct pane
  selectPane(focusPane);

  // Launch summary
  const totalPanes = rows.reduce((sum, r) => sum + (r.panes?.length ?? 0), 0);
  console.log(
    `Starting "${session}" (${rows.length} row${rows.length === 1 ? "" : "s"}, ${totalPanes} pane${totalPanes === 1 ? "" : "s"})...`,
  );

  // Attach
  if (attach) {
    attachSession(session);
  }
}
