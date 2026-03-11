import { resolve, basename } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { writeConfig } from "./lib/yaml-io.js";

function fileExists(dir, name) {
  return existsSync(resolve(dir, name));
}

function readJson(dir, name) {
  try {
    return JSON.parse(readFileSync(resolve(dir, name), "utf-8"));
  } catch {
    return null;
  }
}

export function detectStack(dir) {
  const detected = {
    packageManager: null,
    frameworks: [],
    devCommand: null,
    language: null,
  };

  // Detect package manager from lockfile
  if (fileExists(dir, "pnpm-lock.yaml")) detected.packageManager = "pnpm";
  else if (fileExists(dir, "bun.lockb") || fileExists(dir, "bun.lock")) detected.packageManager = "bun";
  else if (fileExists(dir, "yarn.lock")) detected.packageManager = "yarn";
  else if (fileExists(dir, "package-lock.json")) detected.packageManager = "npm";

  const pkg = readJson(dir, "package.json");
  if (pkg) {
    detected.language = "javascript";
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps["next"]) detected.frameworks.push("next");
    if (deps["convex"]) detected.frameworks.push("convex");
    if (deps["vite"]) detected.frameworks.push("vite");
    if (deps["remix"] || deps["@remix-run/node"]) detected.frameworks.push("remix");
    if (deps["nuxt"]) detected.frameworks.push("nuxt");
    if (deps["astro"]) detected.frameworks.push("astro");
    if (deps["svelte"] || deps["@sveltejs/kit"]) detected.frameworks.push("svelte");

    // Detect dev command
    const pm = detected.packageManager ?? "npm";
    const run = pm === "npm" ? "npm run" : pm;
    if (pkg.scripts?.dev) detected.devCommand = `${run} dev`;
    else if (pkg.scripts?.start) detected.devCommand = `${run} start`;
  }

  // Python
  if (fileExists(dir, "pyproject.toml") || fileExists(dir, "requirements.txt")) {
    detected.language = detected.language ?? "python";
    try {
      const pyproject = readFileSync(resolve(dir, "pyproject.toml"), "utf-8");
      if (pyproject.includes("fastapi")) detected.frameworks.push("fastapi");
      else if (pyproject.includes("django")) detected.frameworks.push("django");
      else if (pyproject.includes("flask")) detected.frameworks.push("flask");
    } catch {}
  }

  // Rust
  if (fileExists(dir, "Cargo.toml")) {
    detected.language = detected.language ?? "rust";
    detected.frameworks.push("cargo");
  }

  // Go
  if (fileExists(dir, "go.mod")) {
    detected.language = detected.language ?? "go";
    detected.frameworks.push("go");
  }

  // Docker
  if (fileExists(dir, "docker-compose.yml") || fileExists(dir, "docker-compose.yaml")) {
    detected.frameworks.push("docker");
  }

  return detected;
}

export function suggestConfig(dir, detected) {
  const name = basename(dir);
  const pm = detected.packageManager ?? "npm";
  const run = pm === "npm" ? "npm run" : pm;

  // Default: 2 claude panes + shell
  const config = {
    name,
    rows: [
      {
        size: "70%",
        panes: [
          { title: "Claude 1", command: "claude" },
          { title: "Claude 2", command: "claude" },
        ],
      },
      {
        panes: [],
      },
    ],
  };

  const bottom = config.rows[1].panes;
  const frameworks = detected.frameworks;

  // Add 3rd claude pane for complex stacks
  if (frameworks.length >= 2) {
    config.rows[0].panes.push({ title: "Claude 3", command: "claude" });
  }

  // Add dev servers
  if (frameworks.includes("next")) {
    bottom.push({ title: "Next.js", command: `${run} dev` });
  } else if (frameworks.includes("vite")) {
    bottom.push({ title: "Vite", command: `${run} dev` });
  } else if (frameworks.includes("nuxt")) {
    bottom.push({ title: "Nuxt", command: `${run} dev` });
  } else if (frameworks.includes("remix")) {
    bottom.push({ title: "Remix", command: `${run} dev` });
  } else if (frameworks.includes("astro")) {
    bottom.push({ title: "Astro", command: `${run} dev` });
  } else if (frameworks.includes("svelte")) {
    bottom.push({ title: "SvelteKit", command: `${run} dev` });
  } else if (frameworks.includes("fastapi")) {
    bottom.push({ title: "FastAPI", command: "uvicorn main:app --reload" });
  } else if (frameworks.includes("django")) {
    bottom.push({ title: "Django", command: "python manage.py runserver" });
  } else if (frameworks.includes("flask")) {
    bottom.push({ title: "Flask", command: "flask run --reload" });
  } else if (frameworks.includes("cargo")) {
    bottom.push({ title: "Cargo", command: "cargo watch -x run" });
  } else if (frameworks.includes("go")) {
    bottom.push({ title: "Go", command: "go run ." });
  } else if (detected.devCommand) {
    bottom.push({ title: "Dev Server", command: detected.devCommand });
  }

  if (frameworks.includes("convex")) {
    bottom.push({ title: "Convex", command: "npx convex dev" });
  }

  // Always add shell
  bottom.push({ title: "Shell" });

  return config;
}

export async function detect(targetDir, { json, write } = {}) {
  const dir = resolve(targetDir ?? ".");
  const detected = detectStack(dir);
  const suggested = suggestConfig(dir, detected);

  if (write) {
    writeConfig(dir, suggested);
    if (json) {
      console.log(JSON.stringify({ detected, suggestedConfig: suggested, written: true }, null, 2));
    } else {
      const desc = detected.frameworks.length > 0
        ? detected.frameworks.join(" + ")
        : detected.language ?? "generic project";
      console.log(`Detected ${desc}. Created ide.yml.`);
    }
    return;
  }

  if (json) {
    console.log(JSON.stringify({ detected, suggestedConfig: suggested }, null, 2));
    return;
  }

  console.log("Detected stack:");
  if (detected.packageManager) console.log(`  Package manager: ${detected.packageManager}`);
  if (detected.language) console.log(`  Language: ${detected.language}`);
  if (detected.frameworks.length) console.log(`  Frameworks: ${detected.frameworks.join(", ")}`);
  if (detected.devCommand) console.log(`  Dev command: ${detected.devCommand}`);
  console.log("\nRun with --write to create ide.yml, or --json to see the suggested config.");
}
