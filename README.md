# tmux-ide

Turn any project into a tmux-powered terminal IDE with a simple `ide.yml` config file.

## Install

```bash
npm install -g tmux-ide
```

## Quick Start

```bash
tmux-ide init         # Scaffold ide.yml (auto-detects your stack)
tmux-ide              # Launch the IDE
tmux-ide stop         # Kill the session
tmux-ide restart      # Stop and relaunch
tmux-ide attach       # Reattach to a running session
```

## ide.yml Format

```yaml
name: project-name          # tmux session name

before: pnpm install        # optional pre-launch hook

rows:
  - size: 70%               # row height percentage
    panes:
      - title: Editor        # pane border label
        command: vim          # command to run (optional)
        size: 60%            # pane width percentage (optional)
        dir: apps/web        # per-pane working directory (optional)
        focus: true          # initial focus (optional)
        env:                 # environment variables (optional)
          PORT: 3000
      - title: Shell

  - panes:
      - title: Dev Server
        command: pnpm dev
      - title: Tests
        command: pnpm test

theme:                       # optional color overrides
  accent: colour75
  border: colour238
  bg: colour235
  fg: colour248
```

## Commands

| Command | Description |
|---------|-------------|
| `tmux-ide` | Launch IDE from `ide.yml` |
| `tmux-ide <path>` | Launch from a specific directory |
| `tmux-ide init [--template <name>]` | Scaffold a new `ide.yml` |
| `tmux-ide stop` | Kill the current IDE session |
| `tmux-ide restart` | Stop and relaunch the IDE session |
| `tmux-ide attach` | Reattach to a running session |
| `tmux-ide ls` | List all tmux sessions |
| `tmux-ide status` | Show session status |
| `tmux-ide doctor` | Check system requirements |
| `tmux-ide validate` | Validate `ide.yml` |
| `tmux-ide detect` | Detect project stack |
| `tmux-ide detect --write` | Detect and write `ide.yml` |
| `tmux-ide config` | Dump config as JSON |
| `tmux-ide config set <path> <value>` | Set a config value |
| `tmux-ide config add-pane --row <N>` | Add a pane to a row |
| `tmux-ide config remove-pane --row <N> --pane <M>` | Remove a pane |
| `tmux-ide config add-row [--size <percent>]` | Add a new row |

All commands support `--json` for structured output.

## Templates

Use `tmux-ide init --template <name>` with one of:

- `default` — General-purpose layout
- `nextjs` — Next.js development
- `convex` — Convex + Next.js
- `vite` — Vite project
- `python` — Python development
- `go` — Go development

## Requirements

- **tmux** >= 3.0
- **Node.js** >= 18

## License

[MIT](LICENSE)
