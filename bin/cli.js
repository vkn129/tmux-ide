#!/usr/bin/env node
import { parseArgs } from "node:util";
import { createRequire } from "node:module";
import { launch } from "../src/launch.js";
import { init } from "../src/init.js";
import { stop } from "../src/stop.js";
import { attach } from "../src/attach.js";
import { ls } from "../src/ls.js";
import { doctor } from "../src/doctor.js";
import { status } from "../src/status.js";
import { validate } from "../src/validate.js";
import { detect } from "../src/detect.js";
import { config } from "../src/config.js";
import { restart } from "../src/restart.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    json: { type: "boolean" },
    row: { type: "string" },
    pane: { type: "string" },
    title: { type: "string" },
    command: { type: "string" },
    size: { type: "string" },
    write: { type: "boolean" },
    template: { type: "string" },
    name: { type: "string" },
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  },
});

// --version / -v
if (values.version) {
  const require = createRequire(import.meta.url);
  const pkg = require("../package.json");
  console.log(`tmux-ide v${pkg.version}`);
  process.exit(0);
}

const command = positionals[0] ?? "start";
const json = values.json ?? false;

const noColor = "NO_COLOR" in process.env;
const bold = (s) => (noColor ? s : `\x1b[1m${s}\x1b[22m`);
const cyan = (s) => (noColor ? s : `\x1b[36m${s}\x1b[39m`);
const dim = (s) => (noColor ? s : `\x1b[2m${s}\x1b[22m`);

function printHelp() {
  console.log(`${bold("tmux-ide")} — Terminal IDE powered by tmux

${bold("Usage:")}
  ${cyan("tmux-ide")}                    ${dim("Launch IDE from ide.yml")}
  ${cyan("tmux-ide <path>")}             ${dim("Launch from a specific directory")}
  ${cyan("tmux-ide init")} [--template]  ${dim("Scaffold a new ide.yml (auto-detects stack)")}
  ${cyan("tmux-ide stop")}               ${dim("Kill the current IDE session")}
  ${cyan("tmux-ide restart")}            ${dim("Stop and relaunch the IDE session")}
  ${cyan("tmux-ide attach")}             ${dim("Reattach to a running session")}
  ${cyan("tmux-ide ls")}                 ${dim("List all tmux sessions")}
  ${cyan("tmux-ide status")} [--json]    ${dim("Show session status")}
  ${cyan("tmux-ide doctor")}             ${dim("Check system requirements")}
  ${cyan("tmux-ide validate")} [--json]  ${dim("Validate ide.yml")}
  ${cyan("tmux-ide detect")} [--json]    ${dim("Detect project stack")}
  ${cyan("tmux-ide detect --write")}     ${dim("Detect and write ide.yml")}
  ${cyan("tmux-ide config")} [--json]    ${dim("Dump config as JSON")}
  ${cyan("tmux-ide config set")} <path> <value>
  ${cyan("tmux-ide config add-pane")} --row <N> --title <T> [--command <C>]
  ${cyan("tmux-ide config remove-pane")} --row <N> --pane <M>
  ${cyan("tmux-ide config add-row")} [--size <percent>]
  ${cyan("tmux-ide config enable-team")} [--name <N>]   ${dim("Enable agent teams")}
  ${cyan("tmux-ide config disable-team")}               ${dim("Disable agent teams")}

${bold("Flags:")}
  ${cyan("--json")}                      ${dim("Output as JSON (all commands)")}
  ${cyan("--template <name>")}           ${dim("Use specific template for init")}
  ${cyan("--write")}                     ${dim("Write detected config to ide.yml")}
  ${cyan("-v, --version")}               ${dim("Show version number")}`);
}

switch (command) {
  case "start":
    await launch(positionals[1]);
    break;

  case "init":
    await init({ template: values.template, json });
    break;

  case "stop":
    await stop(positionals[1], { json });
    break;

  case "attach":
    await attach(positionals[1], { json });
    break;

  case "restart":
    await restart(positionals[1]);
    break;

  case "ls":
    await ls({ json });
    break;

  case "doctor":
    await doctor({ json });
    break;

  case "status":
    await status(positionals[1], { json });
    break;

  case "validate":
    await validate(positionals[1], { json });
    break;

  case "detect":
    await detect(positionals[1], { json, write: values.write });
    break;

  case "config": {
    const sub = positionals[1]; // set, add-pane, remove-pane, add-row, or undefined (dump)
    let action = "dump";
    let configArgs = [];

    if (sub === "set") {
      action = "set";
      configArgs = positionals.slice(2);
    } else if (sub === "add-pane") {
      action = "add-pane";
      // Pass named flags as args array
      configArgs = [];
      if (values.row !== undefined) configArgs.push("--row", values.row);
      if (values.title !== undefined) configArgs.push("--title", values.title);
      if (values.command !== undefined) configArgs.push("--command", values.command);
      if (values.size !== undefined) configArgs.push("--size", values.size);
    } else if (sub === "remove-pane") {
      action = "remove-pane";
      configArgs = [];
      if (values.row !== undefined) configArgs.push("--row", values.row);
      if (values.pane !== undefined) configArgs.push("--pane", values.pane);
    } else if (sub === "add-row") {
      action = "add-row";
      configArgs = [];
      if (values.size !== undefined) configArgs.push("--size", values.size);
    } else if (sub === "enable-team") {
      action = "enable-team";
      configArgs = [];
      if (values.name !== undefined) configArgs.push("--name", values.name);
    } else if (sub === "disable-team") {
      action = "disable-team";
      configArgs = [];
    }

    await config(null, { json, action, args: configArgs });
    break;
  }

  case "help":
    printHelp();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "tmux-ide help" for usage.');
    process.exit(1);
}
