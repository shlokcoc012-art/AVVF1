#!/usr/bin/env bash
# Installs the AstroVedicVani pre-commit hook.
# Run once after cloning: bash scripts/install-hooks.sh
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

HOOK_SRC="scripts/pre-commit.sh"
HOOK_DST=".git/hooks/pre-commit"

if [ ! -f "$HOOK_SRC" ]; then
  echo "✗ $HOOK_SRC not found. Are you in the repo root?" >&2
  exit 1
fi

chmod +x "$HOOK_SRC"

# Remove any existing hook (file or symlink) and create a fresh symlink
rm -f "$HOOK_DST"
ln -s "../../$HOOK_SRC" "$HOOK_DST"

echo "✓ Pre-commit hook installed → $HOOK_DST"
echo "  On every git commit it will:"
echo "    • Lint staged frontend JS/JSX with ESLint"
echo "    • Run backend pytest if any backend/*.py is staged"
echo "  Bypass with:  git commit --no-verify"
