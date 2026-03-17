# Release Checklist

## Preflight

1. Confirm `package.json` has the intended version.
2. Make sure `CHANGELOG.md` is updated under `Unreleased`.
3. Review `git status` and ensure only intentional changes are present.

## Verification

Run the full release checks from the repo root:

```bash
pnpm check
```

If tmux is available locally, also run:

```bash
pnpm test:integration
```

Recommended manual smoke test:

```bash
node bin/cli.js init
node bin/cli.js inspect --json
node bin/cli.js
```

In a second shell:

```bash
node bin/cli.js status --json
node bin/cli.js stop --json
```

If you want to verify the global install hook on a machine with Claude Code already configured:

```bash
npm install -g .
```

Then confirm:

- `~/.claude/skills/tmux-ide/SKILL.md` exists
- `~/.claude/settings.json` contains `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

## Publish

1. Move the `Unreleased` changelog notes into a dated release entry.
2. Commit the release changes.
3. Create an annotated tag such as `v1.1.0`.
4. Push the branch and tag.
5. Publish with `npm publish`.
6. Create a GitHub release using the matching changelog notes.

## Post-release

1. Verify the npm package page and install command.
2. Verify the GitHub release notes and tag.
3. Smoke test `npm install -g tmux-ide` on a clean machine if possible.
