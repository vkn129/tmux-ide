import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { getSessionName } from "./lib/yaml-io.js";
import { launch } from "./launch.js";

export async function restart(targetDir) {
  const dir = resolve(targetDir ?? ".");
  const session = getSessionName(dir);

  let wasRunning = false;
  try {
    execSync(`tmux kill-session -t "${session}"`, { stdio: "ignore" });
    wasRunning = true;
  } catch {
    // Session wasn't running — that's fine
  }

  if (wasRunning) {
    console.log(`Stopped session "${session}"`);
  }

  await launch(dir);
}
