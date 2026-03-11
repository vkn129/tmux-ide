import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { getSessionName } from "./lib/yaml-io.js";

export async function status(targetDir, { json } = {}) {
  const dir = resolve(targetDir ?? ".");
  const session = getSessionName(dir);
  const configExists = existsSync(resolve(dir, "ide.yml"));

  let running = false;
  let panes = [];

  try {
    execSync(`tmux has-session -t "${session}"`, { stdio: "ignore" });
    running = true;

    const raw = execSync(
      `tmux list-panes -t "${session}" -F "#{pane_index}|#{pane_title}|#{pane_width}|#{pane_height}|#{pane_active}"`,
      { encoding: "utf-8" }
    ).trim();

    panes = raw.split("\n").map((line) => {
      const [index, title, width, height, active] = line.split("|");
      return {
        index: parseInt(index),
        title,
        width: parseInt(width),
        height: parseInt(height),
        active: active === "1",
      };
    });
  } catch {}

  const data = { session, running, configExists, panes };

  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log(`Session: ${session}`);
  console.log(`Running: ${running ? "yes" : "no"}`);
  console.log(`Config:  ${configExists ? "ide.yml found" : "no ide.yml"}`);

  if (panes.length > 0) {
    console.log(`\nPanes:`);
    for (const p of panes) {
      const active = p.active ? " (active)" : "";
      console.log(`  ${p.index}: ${p.title} [${p.width}x${p.height}]${active}`);
    }
  }
}
