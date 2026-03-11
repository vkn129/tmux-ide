import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";

const claudeDir = resolve(homedir(), ".claude");
if (existsSync(claudeDir)) {
  const skillDir = resolve(claudeDir, "skills", "tmux-ide");
  mkdirSync(skillDir, { recursive: true });
  const src = resolve(dirname(import.meta.dirname), "skill", "SKILL.md");
  if (existsSync(src)) {
    copyFileSync(src, resolve(skillDir, "SKILL.md"));
  }
}
