#!/bin/bash

# Deploy site script
# Copies vault content, deploys to Fly.io, commits and pushes changes

set -e  # Exit on error

echo "=========================================="
echo "🚀 Starting site deployment"
echo "=========================================="

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Step 1: Copy vault content to site
echo ""
echo "📁 Step 1: Copying vault content to site..."
echo "   Source: apps/vault/"
echo "   Destination: apps/site/content/"

# Remove old content (except .gitkeep if it exists)
if [ -d "apps/site/content" ]; then
    echo "   Cleaning destination..."
    find apps/site/content -mindepth 1 -not -name '.gitkeep' -delete
fi

# Create destination if it doesn't exist
mkdir -p apps/site/content

# Copy all vault content (excluding .obsidian metadata)
echo "   Copying files..."
cp -r apps/vault/* apps/site/content/
# Remove .obsidian if it was copied
rm -rf apps/site/content/.obsidian 2>/dev/null || true

echo "   ✅ Content copied successfully"

# Show what was copied
echo ""
echo "   Copied:"
ls -la apps/site/content/

# Step 2: Deploy to Fly.io
echo ""
echo "🛫 Step 2: Deploying to Fly.io..."
echo "   Config: infra/fly/site/fly.toml"

flyctl deploy --config infra/fly/site/fly.toml

echo "   ✅ Deployment completed"

# Step 3: Commit and push all changes
echo ""
echo "📝 Step 3: Committing and pushing changes..."

# Check if there are any changes
if [ -z "$(git status --porcelain)" ]; then
    echo "   No changes to commit"
else
    echo "   Staging all changes..."
    git add .

    echo "   Creating commit..."
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    git commit -m "Deploy site: sync vault content and deploy

- Synced vault content to site/content
- Deployed to Fly.io
- Automated deployment at $TIMESTAMP

🤖 Generated with bashscripts/deploy-site.sh"

    echo "   Pushing to remote..."
    git push

    echo "   ✅ Changes committed and pushed"
fi

echo ""
echo "=========================================="
echo "✨ Deployment complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  📁 Content synced: apps/vault/ → apps/site/content/"
echo "  🛫 Deployed to Fly.io"
echo "  📝 Changes committed and pushed to git"
echo ""
