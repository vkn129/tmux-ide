import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { getSessionName } from "./lib/yaml-io.js";

export async function stop(targetDir, { json } = {}) {
  const dir = resolve(targetDir ?? ".");
  const session = getSessionName(dir);

  try {
    execSync(`tmux kill-session -t "${session}"`, { stdio: "inherit" });
    if (json) {
      console.log(JSON.stringify({ stopped: session }));
    } else {
      console.log(`Stopped session "${session}"`);
    }
  } catch {
    if (json) {
      console.error(JSON.stringify({ error: `No active session "${session}" found`, code: "NOT_RUNNING" }));
    } else {
      console.error(`No active session "${session}" found`);
    }
  }
}
