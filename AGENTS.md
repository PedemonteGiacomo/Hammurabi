# Contributor Guide

## Repository Overview
- `Hammurabi/hammurabi-ui/` – React/TypeScript front‑end.
- `hammurabi-cdk/` – AWS CDK stacks written in Python.
- `Hammurabi/obtain_table_data.py` – CSV → JSON conversion utility.

## Dev Environment Setup
- Run `./setup_env.sh` from the repo root. This installs Python packages in `hammurabi-cdk/.venv` and Node dependencies for the UI, and generates `public/env-config.js`.
- Use Node 18+ and Python 3.9+.

## Testing Instructions
- **Front‑end**: `cd Hammurabi/hammurabi-ui && npx vitest run`
- **Infrastructure**: `cd hammurabi-cdk && source .venv/bin/activate && pytest`
- All tests must pass before committing. Front‑end specs use [Vitest](https://vitest.dev/) rather than Jest.

## PR Instructions
- Title format: `[Hammurabi] <title>`
- Summarize UI and CDK changes separately in the PR body if both areas are modified.
- Mention manual deployment steps when infrastructure files change.
