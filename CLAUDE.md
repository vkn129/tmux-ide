# tmux-ide

A CLI tool that turns any project into a tmux-powered terminal IDE using a simple `ide.yml` config file.

## Quick Start

```bash
tmux-ide              # Launch IDE from ide.yml
tmux-ide init         # Scaffold ide.yml (auto-detects stack)
tmux-ide inspect      # Show resolved config + live tmux state
tmux-ide stop         # Kill session
tmux-ide attach       # Reattach to running session
```

## ide.yml Format

```yaml
name: project-name # tmux session name

before: pnpm install # optional pre-launch hook

rows:
  - size: 70% # row height percentage
    panes:
      - title: Claude 1 # pane border label
        command: claude # command to run (optional)
        size: 50% # pane width percentage (optional)
        dir: apps/web # per-pane working directory (optional)
        focus: true # initial focus (optional)
        env: # environment variables (optional)
          PORT: 3000

  - panes:
      - title: Dev Server
        command: pnpm dev
      - title: Shell

team: # optional agent team config
  name: my-team

theme: # optional color overrides
  accent: colour75
  border: colour238
  bg: colour235
  fg: colour248
```

### Agent Team Pane Fields

```yaml
panes:
  - title: Lead
    command: claude
    role: lead # optional layout metadata: "lead" or "teammate"
    focus: true
  - title: Frontend
    command: claude
    role: teammate
    task: "Work on components" # suggested task text for your prompts
```

## Architecture

- `bin/cli.js` — CLI entry point and top-level error boundary
- `src/launch.js` — Launch orchestration for tmux sessions
- `src/restart.js` — Stop + relaunch flow
- `src/init.js` — Scaffolds ide.yml with smart detection
- `src/stop.js` — Kills the tmux session
- `src/attach.js` — Reattach to running session
- `src/ls.js` — List tmux sessions
- `src/doctor.js` — System health check
- `src/status.js` — Session status query
- `src/inspect.js` — Resolved config + live tmux inspection
- `src/validate.js` — Config validation
- `src/detect.js` — Project stack detection
- `src/config.js` — Programmatic config mutations
- `src/lib/tmux.js` — Shared tmux process helpers
- `src/lib/launch-plan.js` — Pane startup planning + theme option generation
- `src/lib/yaml-io.js` — Shared config read/write
- `src/lib/dot-path.js` — Dot-notation get/set
- `src/lib/output.js` — Structured CLI error/output helpers
- `src/lib/sizes.js` — Row/pane sizing math
- `src/*.test.js`, `src/lib/*.test.js` — CLI, unit, and integration coverage
- `docs/content/docs/` — User-facing docs site content
- `.github/workflows/ci.yml` — CI quality gates and release checks
- `templates/` — Preset configs (default, nextjs, convex, vite, python, go, agent-team, agent-team-nextjs, agent-team-monorepo)

## Programmatic CLI Reference

All commands support `--json` for structured output.

### Read Commands

```bash
# Session status
tmux-ide status --json
# → { "session": "...", "running": true, "configExists": true, "panes": [...] }

# Validate config
tmux-ide validate --json
# → { "valid": true, "errors": [] }

# Detect project stack
tmux-ide detect --json
# → { "detected": { "packageManager": "pnpm", "frameworks": ["next", "convex"], ... }, "suggestedConfig": {...} }

# Dump config as JSON
tmux-ide config --json
# → { "name": "...", "rows": [...] }

# List sessions
tmux-ide ls --json
# → { "sessions": [{ "name": "...", "created": "...", "attached": true }] }

# System check
tmux-ide doctor --json
# → { "ok": true, "checks": [...] }

# Inspect resolved config + live tmux data
tmux-ide inspect --json
# → { "valid": true, "session": "...", "resolved": {...}, "tmux": {...} }
```

### Write Commands

```bash
# Detect and write config
tmux-ide detect --write

# Set a config value by dot path
tmux-ide config set name "my-app"
tmux-ide config set rows.0.size "70%"
tmux-ide config set rows.1.panes.0.command "npm run dev"

# Add a pane to a row
tmux-ide config add-pane --row 1 --title "Tests" --command "pnpm test"

# Remove a pane
tmux-ide config remove-pane --row 1 --pane 2

# Add a new row
tmux-ide config add-row --size "30%"

# Enable agent teams
tmux-ide config enable-team --name "my-team"

# Disable agent teams
tmux-ide config disable-team
```

### Session Commands

```bash
tmux-ide              # Launch (or re-launch) IDE
tmux-ide stop         # Kill session
tmux-ide attach       # Reattach
tmux-ide init         # Scaffold config (auto-detects stack)
tmux-ide init --template nextjs  # Use specific template
```

## Claude Skill

### When to suggest tmux-ide

- User mentions multi-pane, tmux, terminal IDE, dev environment
- User wants to set up a development workspace
- User asks about running multiple terminals/tools side-by-side
- User wants coordinated multi-agent development (agent teams)
- User mentions team lead, teammates, or task delegation

### Setup workflow

1. Check if `ide.yml` exists: `tmux-ide status --json`
2. Auto-detect the project: `tmux-ide detect --json`
3. **Present 2-3 layout options to the user using ASCII diagrams** before writing any config. Show the pane arrangement visually so the user can pick or tweak. Example:

   **Option A — Dual Claude + Dev (recommended)**

   ```
   ┌─────────────────┬─────────────────┐
   │                 │                 │
   │    Claude 1     │    Claude 2     │  70%
   │                 │                 │
   ├────────┬────────┴────────┬────────┤
   │Dev Srv │  Tests  │ Shell │        │  30%
   └────────┴─────────┴───────┘────────┘
   ```

   **Option B — Triple Claude**

   ```
   ┌───────────┬───────────┬───────────┐
   │           │           │           │
   │ Claude 1  │ Claude 2  │ Claude 3  │  70%
   │           │           │           │
   ├───────────┴─────┬─────┴───────────┤
   │    Dev Server    │     Shell       │  30%
   └─────────────────┴─────────────────┘
   ```

   **Option C — Single Claude + wide dev**

   ```
   ┌─────────────────────────────────────┐
   │             Claude                  │  60%
   ├──────────┬──────────┬──────────────┤
   │ Dev Srv  │  Tests   │    Shell     │  40%
   └──────────┴──────────┴──────────────┘
   ```

   Adapt pane names/commands to the detected stack (e.g., `pnpm dev`, `cargo watch`, `go run`). Always tailor the options to the project.

4. Once the user picks an option, write the config:
   - Quick path: `tmux-ide detect --write` then modify as needed
   - Or build custom:
     ```bash
     tmux-ide config add-row --size "70%"
     tmux-ide config add-pane --row 0 --title "Claude 1" --command "claude"
     tmux-ide config add-pane --row 0 --title "Claude 2" --command "claude"
     tmux-ide config add-row
     tmux-ide config add-pane --row 1 --title "Dev" --command "pnpm dev"
     tmux-ide config add-pane --row 1 --title "Shell"
     tmux-ide validate --json
     ```

### Modification workflow

1. Read current config: `tmux-ide config --json`
2. Modify: `tmux-ide config set <path> <value>` or `add-pane`/`remove-pane`
3. Validate: `tmux-ide validate --json`

### Agent Teams workflow

For coordinated multi-agent development:

1. `tmux-ide config enable-team --name "my-team"` or `tmux-ide init --template agent-team`
2. Assign tasks: `tmux-ide config set rows.0.panes.1.task "Work on frontend"`
3. Validate: `tmux-ide validate --json`
4. Launch: `tmux-ide` or `tmux-ide restart`
5. In the lead pane, ask Claude to create and organize the team in natural language

tmux-ide prepares the tmux layout and enables `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` when `team` is configured. It does not synthesize hidden Claude CLI flags for team creation.

The team lead can self-configure the workspace layout with `tmux-ide config ...`, then `restart` to apply changes.

## Contributor Workflow

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm test
pnpm pack:check
```

- Main release gate: `pnpm check`
- Live tmux coverage: `pnpm test:integration`
- Docs build: `pnpm docs:build`

### Best practices

- Always use `--json` for programmatic access
- Always run `validate --json` after config mutations
- Prefer `inspect --json` when debugging config/runtime mismatches
- Top row should be ~70% height for Claude panes
- 2-3 Claude panes in the top row (or lead + 2 teammate-ready panes for agent teams)
- Dev servers + shell in the bottom row
- Use `detect --json` first to understand the project stack
- For agent teams: assign specific tasks to teammate panes for focused parallel work
