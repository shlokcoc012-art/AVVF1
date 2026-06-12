# Developer Setup

## Pre-commit hook

After cloning the repo, install the pre-commit hook once:

```bash
bash scripts/install-hooks.sh
```

This installs a Git pre-commit hook that runs **only** on what you stage:

| Staged files                | Checks that run                                  |
| --------------------------- | ------------------------------------------------ |
| `frontend/**/*.{js,jsx}`    | ESLint (zero warnings/errors allowed)            |
| `backend/**/*.py`           | `python -m py_compile` syntax check + full pytest suite |
| Anything else               | Nothing — fast path                              |

The pytest run needs `backend/.env` to be present (admin seed credentials,
JWT secret, MongoDB URL). MongoDB must also be reachable.

**Emergency bypass** (use sparingly):
```bash
git commit --no-verify -m "wip"
```

The hook script lives at `scripts/pre-commit.sh` — feel free to extend it.
