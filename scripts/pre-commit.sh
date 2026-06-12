#!/usr/bin/env bash
# Pre-commit hook for AstroVedicVani.
# - Lints staged JS/JSX files with eslint
# - Runs the backend pytest suite if any backend file is staged
# Bypass for emergencies:  git commit --no-verify
set -eo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# ── Color helpers ────────────────────────────────────────────────────────────
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }

# Collect staged files (added, copied, modified, renamed)
mapfile -t STAGED < <(git diff --cached --name-only --diff-filter=ACMR)

if [ ${#STAGED[@]} -eq 0 ]; then
  exit 0
fi

# ── 1. Frontend lint (only on staged JS/JSX) ─────────────────────────────────
FRONTEND_FILES=()
for f in "${STAGED[@]}"; do
  if [[ "$f" =~ ^frontend/.*\.(js|jsx)$ ]]; then
    FRONTEND_FILES+=("$f")
  fi
done

if [ ${#FRONTEND_FILES[@]} -gt 0 ]; then
  yellow "▸ Linting ${#FRONTEND_FILES[@]} JS/JSX file(s)…"
  # Convert /app/foo paths to paths relative to frontend/ for eslint
  REL_FILES=()
  for f in "${FRONTEND_FILES[@]}"; do
    REL_FILES+=("${f#frontend/}")
  done
  if ! (cd frontend && yarn -s eslint --max-warnings=0 "${REL_FILES[@]}"); then
    red "✗ ESLint found problems. Fix them or commit with --no-verify."
    exit 1
  fi
  green "✓ Frontend lint passed"
fi

# ── 2. Backend tests (only if any backend file is staged) ────────────────────
BACKEND_TOUCHED=0
for f in "${STAGED[@]}"; do
  if [[ "$f" =~ ^backend/.*\.py$ ]]; then
    BACKEND_TOUCHED=1
    break
  fi
done

if [ "$BACKEND_TOUCHED" -eq 1 ]; then
  # Quick syntax check on every staged .py file — catches errors pytest might miss.
  yellow "▸ Checking Python syntax on staged backend files…"
  for f in "${STAGED[@]}"; do
    if [[ "$f" =~ ^backend/.*\.py$ ]]; then
      if ! python -m py_compile "$f" 2>&1; then
        red "✗ Python syntax error in $f"
        exit 1
      fi
    fi
  done
  green "✓ Python syntax OK"

  yellow "▸ Running backend pytest suite…"
  if [ ! -f backend/.env ]; then
    red "✗ backend/.env not found — required for tests (ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, MONGO_URL, DB_NAME)."
    exit 1
  fi
  # Load env, then run pytest (suppress dotenv noise)
  if ! ( set -a && source backend/.env && set +a && cd backend && python -m pytest -q tests/ ); then
    red "✗ Backend tests failed. Fix them or commit with --no-verify."
    exit 1
  fi
  green "✓ Backend tests passed"
fi

green "✓ Pre-commit checks passed"
