import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { getSessionName } from "./lib/yaml-io.js";
import { outputError } from "./lib/output.js";

export async function attach(targetDir, { json } = {}) {
  const dir = resolve(targetDir ?? ".");
  const session = getSessionName(dir);

  try {
    execSync(`tmux has-session -t "${session}"`, { stdio: "ignore" });
  } catch {
    outputError(
      `Session "${session}" is not running. Start it with: tmux-ide`,
      "NOT_RUNNING",
      { json }
    );
    return;
  }

  execSync(`tmux attach -t "${session}"`, { stdio: "inherit" });
}
