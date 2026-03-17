import { resolve } from "node:path";
import { getSessionName } from "./lib/yaml-io.js";
import { outputError } from "./lib/output.js";
import { killSession } from "./lib/tmux.js";

export async function stop(targetDir, { json } = {}) {
  const dir = resolve(targetDir ?? ".");
  const session = getSessionName(dir);
  const result = killSession(session);

  if (result.stopped) {
    if (json) {
      console.log(JSON.stringify({ stopped: session }));
    } else {
      console.log(`Stopped session "${session}"`);
    }
    return;
  }

  outputError(`No active session "${session}" found`, "NOT_RUNNING", {
    json,
    exitCode: 1,
  });
}
