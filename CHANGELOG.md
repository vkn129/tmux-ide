# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

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
