# Contributor Guide

## Repository Overview
- `Hammurabi/hammurabi-ui/` – React/TypeScript front‑end (Create React App + Craco).
- `hammurabi-cdk/` – AWS CDK stacks written in Python.
- `Hammurabi/obtain_table_data.py` – CSV → JSON conversion utility.

## Dev Environment Setup
- Use Node 20+ and Python 3.11+.
- Run `./setup_env.sh` from the repo root. It installs Node packages, creates `hammurabi-cdk/.venv` and generates `public/env-config.js`.
- Activate the CDK environment when working in `hammurabi-cdk`: `source .venv/bin/activate`.

## Dev Environment Tips
- `npm start` inside `hammurabi-ui` launches the dev server.
- `cdk synth` in `hammurabi-cdk` validates the stacks.
- `node scripts/generate-env.js` regenerates UI config.

## Testing Instructions
- **Front‑end**: `cd Hammurabi/hammurabi-ui && CI=true npm test -- -w=0`
- **Infrastructure**: `cd hammurabi-cdk && source .venv/bin/activate && pytest -q`
- All tests must pass before committing. Add or update tests for any code you change.

## PR Instructions
- Title format: `[Hammurabi] <title>`
- Summarize UI and CDK changes separately in the PR body if both areas are modified.
- Mention manual deployment steps when infrastructure files change.