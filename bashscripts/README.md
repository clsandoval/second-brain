# Deployment Scripts

Scripts for automating deployment workflows.

## deploy-site

Automates the full site deployment workflow:

1. **Sync Content**: Copies all files from `apps/vault/` to `apps/site/content/`
2. **Deploy**: Runs `flyctl deploy --config infra/fly/site/fly.toml`
3. **Commit & Push**: Stages all changes, commits with automated message, and pushes to remote

### Usage

**Linux/Mac/Git Bash (Windows):**
```bash
./bashscripts/deploy-site.sh
```

**Windows Command Prompt:**
```cmd
bashscripts\deploy-site.bat
```

**From project root:**
```bash
# Git Bash
bash bashscripts/deploy-site.sh

# Or make it executable and run directly
chmod +x bashscripts/deploy-site.sh
./bashscripts/deploy-site.sh
```

### What it does

1. **Content Sync**
   - Cleans `apps/site/content/` directory
   - Copies entire `apps/vault/` directory structure to `apps/site/content/`
   - Preserves all subdirectories (concepts, tech, examples, data)

2. **Fly.io Deployment**
   - Deploys site using configuration from `infra/fly/site/fly.toml`
   - Uses flyctl CLI (must be installed and authenticated)

3. **Git Operations**
   - Stages all changes (`git add .`)
   - Creates commit with detailed message including timestamp
   - Pushes to remote repository
   - Skips commit if no changes detected

### Requirements

- **flyctl**: Fly.io CLI tool
  ```bash
  # Install on Mac
  brew install flyctl

  # Install on Linux
  curl -L https://fly.io/install.sh | sh

  # Install on Windows
  iwr https://fly.io/install.ps1 -useb | iex
  ```

- **Authentication**: Must be logged into Fly.io
  ```bash
  flyctl auth login
  ```

- **Git**: Repository must have remote configured
  ```bash
  git remote -v  # Verify remote is set
  ```

### Error Handling

- Script exits on first error (`set -e` in bash version)
- Deployment failures prevent git commit/push
- No changes = skips commit step
- All errors are clearly reported

### Output Example

```
==========================================
🚀 Starting site deployment
==========================================

📁 Step 1: Copying vault content to site...
   Source: apps/vault/
   Destination: apps/site/content/
   Cleaning destination...
   Copying files...
   ✅ Content copied successfully

   Copied:
   concepts  data  examples  index.md  tech

🛫 Step 2: Deploying to Fly.io...
   Config: infra/fly/site/fly.toml
   ==> Verifying app config
   ==> Building image
   ==> Deploying to fly.io
   ✅ Deployment completed

📝 Step 3: Committing and pushing changes...
   Staging all changes...
   Creating commit...
   Pushing to remote...
   ✅ Changes committed and pushed

==========================================
✨ Deployment complete!
==========================================

Summary:
  📁 Content synced: apps/vault/ → apps/site/content/
  🛫 Deployed to Fly.io
  📝 Changes committed and pushed to git
```

### Troubleshooting

**"flyctl: command not found"**
- Install flyctl CLI (see Requirements above)
- Verify installation: `flyctl version`

**"Error: No access token available"**
- Login to Fly.io: `flyctl auth login`

**"fatal: No configured push destination"**
- Configure git remote: `git remote add origin <url>`

**"Permission denied" (bash version)**
- Make executable: `chmod +x bashscripts/deploy-site.sh`

### Notes

- Always review changes before running (script commits automatically)
- Script runs from project root regardless of current directory
- Safe to run multiple times (idempotent operations)
- Commit message includes timestamp for tracking deployments
