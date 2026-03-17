import { resolve } from "node:path";

export function buildPaneCommand(pane, _team) {
  if (!pane.command) return null;
  return pane.command;
}

export function collectPaneStartupPlan(rows, paneMap, firstPanesOfRows, dir, team) {
  let focusPane = paneMap[0][0];
  const teammateCommands = [];
  const paneActions = [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const panes = row.panes ?? [];

    for (let paneIdx = 0; paneIdx < panes.length; paneIdx++) {
      const pane = panes[paneIdx];
      const tmuxPane = paneMap[rowIdx][paneIdx];
      const action = {
        targetPane: tmuxPane,
        title: pane.title ?? null,
        chdir: null,
        exports: [],
        command: null,
      };

      if (pane.dir && firstPanesOfRows.has(tmuxPane)) {
        action.chdir = resolve(dir, pane.dir);
      }

      if (pane.env && typeof pane.env === "object") {
        action.exports = Object.entries(pane.env).map(([key, value]) => `export ${key}=${value}`);
      }

      const command = buildPaneCommand(pane, team);
      if (command) {
        action.command = command;
      }

      if (pane.focus) {
        focusPane = tmuxPane;
      }

      paneActions.push(action);
    }
  }

  return { focusPane, leadPane: null, paneActions, teammateCommands };
}

export function buildThemeOptions(session, theme = {}) {
  const accent = theme.accent ?? "colour75";
  const border = theme.border ?? "colour238";
  const bg = theme.bg ?? "colour235";
  const fg = theme.fg ?? "colour248";

  return [
    ["set-option", "-t", session, "pane-border-status", "top"],
    ["set-option", "-t", session, "pane-border-format", " #{?pane_active,#[bold]▸,·} #T "],
    ["set-option", "-t", session, "pane-border-style", `fg=${border}`],
    ["set-option", "-t", session, "pane-active-border-style", `fg=${accent}`],
    ["set-option", "-t", session, "status-style", `bg=${bg},fg=${fg}`],
    [
      "set-option",
      "-t",
      session,
      "status-left",
      `#[fg=colour0,bg=${accent},bold]  ${session.toUpperCase()} IDE #[default] `,
    ],
    ["set-option", "-t", session, "status-left-length", "30"],
    [
      "set-option",
      "-t",
      session,
      "status-right",
      `#[fg=colour243]%H:%M #[fg=${accent}]│ #[fg=${fg}]%b %d `,
    ],
    ["set-option", "-t", session, "status-justify", "centre"],
    ["set-option", "-t", session, "window-status-current-format", `#[fg=${accent},bold]●`],
    ["set-option", "-t", session, "window-status-format", `#[fg=${border}]○`],
  ];
}
