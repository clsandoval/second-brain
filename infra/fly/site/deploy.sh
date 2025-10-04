#!/bin/bash

# Deploy Radar to Fly.io
# Usage: ./infra/fly/site/deploy.sh

set -e  # Exit on any error

echo "🚀 Deploying Radar to Fly.io..."

# Navigate to project root (script can be run from anywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📍 Project root: $PROJECT_ROOT"

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl not found"
    echo "📥 Install from: https://fly.io/docs/flyctl/install/"
    exit 1
fi

# Check if logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Fly.io"
    echo "🔑 Run: flyctl auth login"
    exit 1
fi

# Deploy with fly.toml configuration
echo "🏗️  Building and deploying..."
flyctl deploy --config infra/fly/site/fly.toml --local-only

echo "✅ Deployment complete!"
echo "🌐 View your site: https://radar.fly.dev"
echo "📊 View logs: flyctl logs -a radar"
echo "💻 SSH access: flyctl ssh console -a radar"
