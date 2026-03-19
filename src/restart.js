import { resolve } from "node:path";
import { getSessionName } from "./lib/yaml-io.ts";
import { launch } from "./launch.js";
import { killSession } from "./lib/tmux.ts";

export async function restart(targetDir, { json, attach } = {}) {
  const dir = resolve(targetDir ?? ".");
  const { name: session } = getSessionName(dir);
  const result = killSession(session);

  if (result.stopped) {
    console.log(`Stopped session "${session}"`);
  }

  await launch(dir, { json, attach });
}
