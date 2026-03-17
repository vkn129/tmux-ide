import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";

const claudeDir = resolve(homedir(), ".claude");
if (!shouldInstallClaudeIntegration() || !existsSync(claudeDir)) {
  process.exit(0);
}

const skillDir = resolve(claudeDir, "skills", "tmux-ide");
mkdirSync(skillDir, { recursive: true });
const src = resolve(dirname(import.meta.dirname), "skill", "SKILL.md");
if (existsSync(src)) {
  copyFileSync(src, resolve(skillDir, "SKILL.md"));
}

const settingsPath = resolve(claudeDir, "settings.json");
let settings = {};

if (existsSync(settingsPath)) {
  try {
    settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
  } catch (error) {
    console.warn(
      `[tmux-ide] Skipping Claude settings update: could not parse ${settingsPath}: ${error.message}`,
    );
    process.exit(0);
  }
}

if (settings == null || typeof settings !== "object" || Array.isArray(settings)) {
  console.warn(
    `[tmux-ide] Skipping Claude settings update: ${settingsPath} does not contain a JSON object.`,
  );
  process.exit(0);
}

const nextSettings = {
  ...settings,
  env: {
    ...(settings.env && typeof settings.env === "object" && !Array.isArray(settings.env)
      ? settings.env
      : {}),
    CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1",
  },
};

writeFileSync(settingsPath, `${JSON.stringify(nextSettings, null, 2)}\n`);

function shouldInstallClaudeIntegration() {
  return process.env.npm_config_global === "true";
}
