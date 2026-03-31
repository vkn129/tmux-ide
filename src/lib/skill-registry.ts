import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import yaml from "js-yaml";

export interface Skill {
  name: string;
  specialties: string[];
  role: string;
  description: string;
  body: string;
}

const SKILLS_DIR = ".tmux-ide/skills";

/**
 * Parse a skill markdown file with YAML frontmatter.
 * Format: --- \n YAML \n --- \n body
 */
function parseSkillFile(content: string): Skill | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;

  try {
    const meta = yaml.load(match[1]!) as Record<string, unknown>;
    const name = (meta.name as string) ?? "";
    if (!name) return null;

    const rawSpecialties = meta.specialties;
    const specialties = Array.isArray(rawSpecialties)
      ? (rawSpecialties as string[]).map((s) => String(s).toLowerCase())
      : typeof rawSpecialties === "string"
        ? rawSpecialties.split(",").map((s) => s.trim().toLowerCase())
        : [];

    return {
      name,
      specialties,
      role: (meta.role as string) ?? "teammate",
      description: (meta.description as string) ?? "",
      body: (match[2] ?? "").trim(),
    };
  } catch {
    return null;
  }
}

function loadSkillsFromDir(skillsDir: string): Skill[] {
  if (!existsSync(skillsDir)) return [];
  const files = readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
  const skills: Skill[] = [];
  for (const file of files) {
    const content = readFileSync(join(skillsDir, file), "utf-8");
    const skill = parseSkillFile(content);
    if (skill) skills.push(skill);
  }
  return skills;
}

/**
 * Load all skill definitions from .tmux-ide/skills/*.md (project)
 * and ~/.tmux-ide/skills/*.md (personal). Project skills take precedence.
 */
export function loadSkills(dir: string): Skill[] {
  const projectSkills = loadSkillsFromDir(join(dir, SKILLS_DIR));
  const personalDir = join(homedir(), SKILLS_DIR);
  const personalSkills = loadSkillsFromDir(personalDir);

  // Project skills take precedence over personal skills by name
  const nameSet = new Set(projectSkills.map((s) => s.name));
  for (const ps of personalSkills) {
    if (!nameSet.has(ps.name)) {
      projectSkills.push(ps);
    }
  }

  return projectSkills;
}

/**
 * Load a single skill by name.
 */
export function loadSkill(dir: string, name: string): Skill | null {
  const skills = loadSkills(dir);
  return skills.find((s) => s.name === name) ?? null;
}
