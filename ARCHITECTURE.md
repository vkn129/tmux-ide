# Architecture

## Overview

`tmux-ide` is a small Node.js CLI that turns an `ide.yml` file into a tmux session layout.

The codebase is intentionally simple:

- [bin/cli.js](/Users/thijs/Developer/tmux-ide/bin/cli.js) is the CLI edge
- [src/](/Users/thijs/Developer/tmux-ide/src) contains command modules and runtime helpers
- [templates/](/Users/thijs/Developer/tmux-ide/templates) contains starter configs
- [docs/](/Users/thijs/Developer/tmux-ide/docs) is the public docs app

## Runtime Model

The main runtime flow is:

1. Parse CLI arguments in [bin/cli.js](/Users/thijs/Developer/tmux-ide/bin/cli.js)
2. Load and validate `ide.yml`
3. Resolve pane layout and tmux session structure
4. Create or inspect the tmux session
5. Send commands, apply titles, theme, focus, and optional team behavior

Key modules:

- [src/validate.js](/Users/thijs/Developer/tmux-ide/src/validate.js): config validation
- [src/launch.js](/Users/thijs/Developer/tmux-ide/src/launch.js): launch orchestration
- [src/lib/tmux.js](/Users/thijs/Developer/tmux-ide/src/lib/tmux.js): shared tmux command boundary
- [src/lib/launch-plan.js](/Users/thijs/Developer/tmux-ide/src/lib/launch-plan.js): pure launch planning logic
- [src/inspect.js](/Users/thijs/Developer/tmux-ide/src/inspect.js): effective config + runtime inspection

## Error Boundary

Structured command failures should reach the CLI edge as `CommandError` instances from [src/lib/output.js](/Users/thijs/Developer/tmux-ide/src/lib/output.js).

That keeps:

- human output and `--json` output consistent
- exit behavior centralized in the CLI entrypoint
- command modules easier to test

## tmux Boundary

[src/lib/tmux.js](/Users/thijs/Developer/tmux-ide/src/lib/tmux.js) is the shared wrapper for tmux operations.

It currently owns:

- session existence/state checks
- session creation and kill behavior
- pane listing
- pane splitting, titles, selection, and command injection
- tmux error classification

The direction of the codebase is to keep more tmux child-process handling here rather than in individual command modules.

## Testing Strategy

The project uses the Node.js built-in test runner.

Test layers:

- pure unit tests for helpers under [src/lib/](/Users/thijs/Developer/tmux-ide/src/lib)
- CLI contract tests in [src/cli.test.js](/Users/thijs/Developer/tmux-ide/src/cli.test.js)
- targeted command tests such as [src/inspect.test.js](/Users/thijs/Developer/tmux-ide/src/inspect.test.js)
- live tmux integration coverage in [src/integration.test.js](/Users/thijs/Developer/tmux-ide/src/integration.test.js)

The highest-risk path is still the launch lifecycle, so changes there should prefer:

- extracting pure helpers first
- adding unit coverage for decision-making
- adding live tmux coverage with `attach: false` when possible

## Release Checks

The intended release path is:

```bash
npm run check
```

That should cover:

- lint
- formatting
- tests
- docs build
- package packing sanity
