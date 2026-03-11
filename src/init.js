import { existsSync, readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { writeFileSync } from "node:fs";
import { detectStack, suggestConfig } from "./detect.js";
import { printLayout } from "./lib/output.js";

export async function init({ template, json } = {}) {
  const dir = process.cwd();
  const configPath = resolve(dir, "ide.yml");

  if (existsSync(configPath)) {
    if (json) {
      console.error(JSON.stringify({ error: "ide.yml already exists", code: "EXISTS" }));
    } else {
      console.error("ide.yml already exists in this directory");
    }
    process.exit(1);
  }

  // If a specific template is requested, use it
  if (template) {
    const templatePath = resolve(import.meta.dirname, "..", "templates", `${template}.yml`);
    if (!existsSync(templatePath)) {
      if (json) {
        console.error(JSON.stringify({ error: `Template "${template}" not found`, code: "NOT_FOUND" }));
      } else {
        console.error(`Template "${template}" not found. Available: default, nextjs, convex, vite, python, go, agent-team, agent-team-nextjs, agent-team-monorepo`);
      }
      process.exit(1);
    }

    let content = readFileSync(templatePath, "utf-8");
    const name = basename(dir);
    content = content.replace(/^name: .+/m, `name: ${name}`);
    writeFileSync(configPath, content);

    if (json) {
      console.log(JSON.stringify({ created: true, template, name }));
    } else {
      console.log(`Created ide.yml from "${template}" template for "${name}"`);
      const yaml = (await import("js-yaml")).default;
      printLayout(yaml.load(content));
    }
    return;
  }

  // Smart detection
  const detected = detectStack(dir);
  const name = basename(dir);

  if (detected.frameworks.length > 0) {
    // Use detected stack to generate config
    const config = suggestConfig(dir, detected);
    const yaml = (await import("js-yaml")).default;
    writeFileSync(configPath, yaml.dump(config, { lineWidth: -1, noRefs: true, quotingType: '"' }));

    const desc = detected.frameworks.join(" + ");
    if (json) {
      console.log(JSON.stringify({ created: true, detected: detected.frameworks, name }));
    } else {
      console.log(`Detected ${desc}. Created ide.yml for "${name}".`);
      printLayout(config);
      console.log("Edit it to customize, then run: tmux-ide");
    }
  } else {
    // Fallback to default template
    const templatePath = resolve(import.meta.dirname, "..", "templates", "default.yml");
    let content = readFileSync(templatePath, "utf-8");
    content = content.replace(/^name: .+/m, `name: ${name}`);
    writeFileSync(configPath, content);

    if (json) {
      console.log(JSON.stringify({ created: true, template: "default", name }));
    } else {
      console.log(`Created ide.yml for "${name}"`);
      const yaml = (await import("js-yaml")).default;
      printLayout(yaml.load(content));
      console.log("Edit it to configure your workspace, then run: tmux-ide");
    }
  }
}
