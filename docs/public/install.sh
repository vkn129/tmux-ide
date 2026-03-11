#!/bin/sh
# tmux-ide installer
# Usage: curl -fsSL https://tmux.thijsverreck.com/install.sh | sh
set -e

BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[32m'
RED='\033[31m'
RESET='\033[0m'

info() { printf "${BOLD}%s${RESET}\n" "$1"; }
success() { printf "${GREEN}${BOLD}%s${RESET}\n" "$1"; }
error() { printf "${RED}${BOLD}error:${RESET} %s\n" "$1" >&2; exit 1; }

# Check for tmux
if ! command -v tmux >/dev/null 2>&1; then
  error "tmux is not installed. Install it first: https://github.com/tmux/tmux/wiki/Installing"
fi

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  error "Node.js is not installed. Install it first: https://nodejs.org"
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  error "Node.js 18+ is required (found v${NODE_VERSION})"
fi

# Detect package manager
if command -v pnpm >/dev/null 2>&1; then
  PM="pnpm"
elif command -v bun >/dev/null 2>&1; then
  PM="bun"
elif command -v yarn >/dev/null 2>&1; then
  PM="yarn"
else
  PM="npm"
fi

info "Installing tmux-ide..."

case "$PM" in
  npm)  npm install -g tmux-ide ;;
  pnpm) pnpm add -g tmux-ide ;;
  yarn) yarn global add tmux-ide ;;
  bun)  bun add -g tmux-ide ;;
esac

if command -v tmux-ide >/dev/null 2>&1; then
  # Install Claude Code skill (if Claude Code is present)
  if [ -d "$HOME/.claude" ]; then
    mkdir -p "$HOME/.claude/skills/tmux-ide"
    SKILL_SRC="$(npm root -g)/tmux-ide/skill/SKILL.md"
    if [ -f "$SKILL_SRC" ]; then
      cp "$SKILL_SRC" "$HOME/.claude/skills/tmux-ide/SKILL.md"
    fi
  fi

  echo ""
  success "tmux-ide installed successfully!"
  echo ""
  printf "${DIM}Get started:${RESET}\n"
  echo "  cd your-project"
  echo "  tmux-ide init     # scaffold ide.yml"
  echo "  tmux-ide          # launch"
  echo ""
else
  error "Installation failed. Try: npm install -g tmux-ide"
fi
