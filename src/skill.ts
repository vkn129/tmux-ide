import { resolve, join, dirname } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { outputError } from "./lib/output.ts";
import { loadSkills, loadSkill } from "./lib/skill-registry.ts";
import { readConfig } from "./lib/yaml-io.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function skillCommand(
  targetDir: string | undefined,
  {
    json = false,
    sub,
    args = [],
  }: {
    json?: boolean;
    sub?: string;
    args: string[];
  },
): Promise<void> {
  const dir = resolve(targetDir ?? ".");

  switch (sub) {
    case "list": {
      const skills = loadSkills(dir);
      if (json) {
        console.log(
          JSON.stringify(
            skills.map((s) => ({
              name: s.name,
              specialties: s.specialties,
              role: s.role,
              description: s.description,
            })),
            null,
            2,
          ),
        );
      } else if (skills.length === 0) {
        console.log("No skills found. Run: tmux-ide skill create <name>");
      } else {
        for (const s of skills) {
          const specs = s.specialties.length > 0 ? ` [${s.specialties.join(", ")}]` : "";
          console.log(`  ${s.name}${specs}  (${s.role}) — ${s.description}`);
        }
      }
      break;
    }
    case "show": {
      const name = args[0];
      if (!name) outputError("Usage: tmux-ide skill show <name>", "USAGE");
      const skill = loadSkill(dir, name);
      if (!skill) outputError(`Skill "${name}" not found`, "NOT_FOUND");
      if (json) {
        console.log(JSON.stringify(skill, null, 2));
      } else {
        console.log(`Skill: ${skill.name}`);
        console.log(`  Role: ${skill.role}`);
        console.log(`  Specialties: ${skill.specialties.join(", ") || "none"}`);
        console.log(`  Description: ${skill.description}`);
        if (skill.body) {
          console.log(`\n${skill.body}`);
        }
      }
      break;
    }
    case "create": {
      const name = args[0];
      if (!name) outputError("Usage: tmux-ide skill create <name>", "USAGE");
      const skillsDir = join(dir, ".tmux-ide", "skills");
      const filePath = join(skillsDir, `${name}.md`);
      if (existsSync(filePath)) {
        outputError(`Skill "${name}" already exists at ${filePath}`, "EXISTS");
      }
      // Copy from general-worker template, replace name
      const templatePath = resolve(__dirname, "..", "templates", "skills", "general-worker.md");
      let content: string;
      if (existsSync(templatePath)) {
        content = readFileSync(templatePath, "utf-8").replace(/^name: .+/m, `name: ${name}`);
      } else {
        content = `---\nname: ${name}\nspecialties: []\nrole: teammate\ndescription: ${name} agent\n---\nYou are a ${name} agent.\n`;
      }
      if (!existsSync(skillsDir)) mkdirSync(skillsDir, { recursive: true });
      writeFileSync(filePath, content);
      if (json) {
        console.log(JSON.stringify({ created: true, path: filePath }));
      } else {
        console.log(`Created skill "${name}" at ${filePath}`);
      }
      break;
    }
    case "validate": {
      let config;
      try {
        ({ config } = readConfig(dir));
      } catch {
        outputError("Cannot read ide.yml", "READ_ERROR");
        return;
      }
      const skills = loadSkills(dir);
      const skillNames = new Set(skills.map((s) => s.name));
      const issues: { pane: string; skill: string }[] = [];
      for (const row of config.rows) {
        for (const pane of row.panes) {
          if (pane.skill && !skillNames.has(pane.skill)) {
            issues.push({ pane: pane.title ?? "untitled", skill: pane.skill });
          }
        }
      }
      if (json) {
        console.log(JSON.stringify({ valid: issues.length === 0, unresolved: issues }, null, 2));
      } else if (issues.length === 0) {
        console.log("All pane skill references resolve.");
      } else {
        console.log(`${issues.length} unresolved skill reference(s):`);
        for (const i of issues) {
          console.log(`  pane "${i.pane}" → skill "${i.skill}" (not found)`);
        }
      }
      break;
    }
    case "help":
    case undefined:
      console.log(`Usage: tmux-ide skill <list|show|create|validate>

  list                List all skills (project + personal)
  show <name>         Show full skill detail
  create <name>       Scaffold a new skill file
  validate            Check pane skill references resolve`);
      break;
    default:
      outputError(
        "Usage: tmux-ide skill <list|show|create|validate>\nRun: tmux-ide skill help",
        "USAGE",
      );
  }
}
