#!/bin/bash
# Setup script for Hammurabi workspace
set -e

# Determine script dir
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ------ Setup Python environment for hammurabi-cdk ------
cd "$ROOT_DIR/hammurabi-cdk"

# Create virtual environment if it does not exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
if [ -f requirements-dev.txt ]; then
    pip install -r requirements-dev.txt
fi

deactivate

# ------ Setup Node environment for hammurabi-ui ------
cd "$ROOT_DIR/Hammurabi/hammurabi-ui"

# Install node modules
if [ -f package-lock.json ]; then
    npm ci --legacy-peer-deps
else
    npm install
fi

# Generate env-config.js from template
node scripts/generate-env.js

echo "✅ Environment setup complete."
