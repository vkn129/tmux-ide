# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## 2.0.0

### Added

- **Mission lifecycle** — autonomous pipeline: planning → active → validating → complete
- **Milestones** — sequential execution phases with automatic gating and progression
- **Validation contracts** — assertion-based verification with independent validator dispatch
- **Auto-remediation** — failed assertions auto-create remediation tasks
- **Skill-based dispatch** — match task specialty to agent capabilities via findBestAgent()
- **Rich dispatch prompts** — mission/milestone/AGENTS.md/skill/library context injection
- **Knowledge library** — auto-appended learnings, architecture docs, tag-matched references
- **Researcher agent** — continuous internal auditing with configurable triggers
- **Metrics engine** — session/task/agent/mission telemetry with timeline sampling
- **Metrics CLI** — `tmux-ide metrics`, `metrics agents`, `metrics eval`, `metrics history`
- **Web dashboard metrics panel** — KPIs, milestone timeline, agent utilization, validation
- **Coverage invariant** — assertion coverage enforcement with `validate coverage` command
- **Built-in skills** — 5 templates (general-worker, frontend, backend, reviewer, researcher)
- **Blocked assertion status** — assertions can be marked blocked with blockedBy reason
- **File-based send** — long messages written to dispatch files to avoid paste-mode
- **Dispatch file cleanup** — stale files removed on daemon startup
- **Services registry** — centralized commands/ports/healthchecks in ide.yml
- **Mission-level PR** — auto-creates PR on mission completion via createMissionPr()
- **Agent idle notifications** — master pane notified on busy→idle transitions
- **CLI commands** — mission create/plan-complete/status, milestone CRUD, validate assert/coverage, skill list/show/create/validate, research status/trigger, metrics subcommands
- **Command center API** — milestones, validation, skills, mission, metrics endpoints
- **Agent detection** — prefix matching for codex (codex-aarch64-a etc.)
- **Event types** — milestone_validating, milestone_complete, validation_dispatch, remediation, validation_failed, planning, mission_complete, discovered_issue, research_dispatch, research_finding, agent_heartbeat, session_start, session_end

### Changed

- `dispatch_mode` now accepts `"missions"` in addition to `"tasks"` and `"goals"`
- `buildTaskPrompt()` generates structured multi-section prompts with markdown headers
- `buildGoalPrompt()` includes milestone context and AGENTS.md
- `checkMilestoneCompletion()` routes through validation when contract exists
- `detectCompletions()` includes durationMs and structured handoff (salientSummary, discoveredIssues)
- `loadSkills()` merges project and personal (~/.tmux-ide/skills/) directories
- `init` scaffolds skills directory and AGENTS.md template for missions mode
- `inspect` output includes skills, pane→skill mapping, and unresolved references
- `doctor` checks pane skill references

### Removed

- **Git worktree isolation** — agents work in the project directory
- `task.branch` field removed from Task interface
- `worktree_root` and `cleanup_on_done` config options removed
- `src/lib/worktree.ts` and its tests deleted

### Fixed

- Unified slugify (consistent 40-char limit)
- Goal prompt newlines preserved
- Theme customization in widget createTheme()
- Config mutation validation (Zod re-validation after mutations)
- Dependency cycle detection in task creation
- PR creation failures surfaced in JSON output
- Event type enums aligned between domain schema and event-log
- PaneInfoSchemaZ role enum matches ide-config PaneSchema
- Library write failures wrapped in try-catch (don't crash task completion)
- Stale task.branch references removed from dashboard and TUI widgets

## 1.1.0

### Added

- `inspect` command for resolved config and runtime state
- detection reasoning in human and JSON output
- targeted CLI hardening tests for error handling and edge cases
- docs build validation in the release workflow
- contributor, release, and security project documentation

### Changed

- centralized tmux session state handling for several lifecycle commands
- improved config mutation validation and error reporting
- tightened npm packaging and CI coverage
- limited Claude integration postinstall changes to global installs with existing Claude config

### Fixed

- `inspect` now reports invalid config state instead of crashing on malformed pane arrays
- `restart --json` now preserves structured launch errors
- launch logic now uses returned tmux pane IDs instead of assuming sequential numbering
