import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildPaneCommand, buildThemeOptions, collectPaneStartupPlan } from "./launch-plan.js";

describe("buildPaneCommand", () => {
  it("passes through normal pane commands", () => {
    assert.strictEqual(buildPaneCommand({ command: "pnpm dev" }, null), "pnpm dev");
  });

  it("does not add unsupported Claude team flags", () => {
    const team = { name: "my-team" };

    assert.strictEqual(buildPaneCommand({ command: "claude", role: "lead" }, team), "claude");
    assert.strictEqual(
      buildPaneCommand({ command: "claude", role: "teammate", task: 'Fix "lint"' }, team),
      "claude",
    );
  });
});

describe("collectPaneStartupPlan", () => {
  it("launches team panes as normal pane commands", () => {
    const rows = [
      {
        panes: [
          { title: "Lead", command: "claude", role: "lead", focus: true, env: { PORT: 3000 } },
          { title: "Worker", command: "claude", role: "teammate", task: "Review" },
        ],
      },
      {
        panes: [{ title: "Shell", dir: "apps/web" }],
      },
    ];

    const result = collectPaneStartupPlan(
      rows,
      [["%1", "%2"], ["%3"]],
      new Set(["%1", "%3"]),
      "/workspace",
      { name: "my-team" },
    );

    assert.strictEqual(result.focusPane, "%1");
    assert.strictEqual(result.leadPane, null);
    assert.deepStrictEqual(result.teammateCommands, []);
    assert.deepStrictEqual(result.paneActions, [
      {
        targetPane: "%1",
        title: "Lead",
        chdir: null,
        exports: ["export PORT=3000"],
        command: "claude",
      },
      {
        targetPane: "%2",
        title: "Worker",
        chdir: null,
        exports: [],
        command: "claude",
      },
      {
        targetPane: "%3",
        title: "Shell",
        chdir: "/workspace/apps/web",
        exports: [],
        command: null,
      },
    ]);
  });
});

describe("buildThemeOptions", () => {
  it("builds tmux option commands from the theme", () => {
    const options = buildThemeOptions("my-session", { accent: "red", border: "blue" });

    assert.deepStrictEqual(options[0], [
      "set-option",
      "-t",
      "my-session",
      "pane-border-status",
      "top",
    ]);
    assert.deepStrictEqual(options[2], [
      "set-option",
      "-t",
      "my-session",
      "pane-border-style",
      "fg=blue",
    ]);
    assert.deepStrictEqual(options[3], [
      "set-option",
      "-t",
      "my-session",
      "pane-active-border-style",
      "fg=red",
    ]);
  });
});
