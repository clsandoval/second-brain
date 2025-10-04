# Fly.io Quartz Deployment Implementation Plan

## Overview

Deploy the second-brain vault to Fly.io using Quartz v4 static site generator. This creates a publicly accessible digital garden with search and graph view capabilities, served globally via Fly.io's edge network.

## Current State Analysis

**What exists:**
- ✅ Vault content in `apps/vault/` with organized markdown files (concepts, tech, examples)
- ✅ Empty `apps/site/` directory ready for Quartz
- ✅ Git repository initialized

**What's missing:**
- ❌ Quartz static site generator installation
- ❌ Node.js build configuration
- ❌ Docker infrastructure for containerized deployment
- ❌ Fly.io deployment configuration
- ❌ nginx web server configuration

**Key Constraints:**
- Must use Node.js >= 22 and npm >= 10.9.2 (Quartz hard requirement)
- Windows environment - using directory copy instead of symlinks for simplicity
- Content lives in `apps/vault/`, Quartz expects `apps/site/content/`

## Desired End State

A production-ready static site deployed to `radar.fly.dev` with:
- ✅ All vault content rendered as interconnected web pages
- ✅ Full-text search functionality
- ✅ Interactive graph view of content relationships
- ✅ Fast global edge delivery via Fly.io CDN
- ✅ Auto-scaling to zero when idle (cost optimization)
- ✅ Manual deployment workflow via shell script

**Verification:**
- Site accessible at https://radar.fly.dev
- Search returns relevant results
- Graph view displays content relationships
- All internal links resolve correctly
- Site serves static assets with proper caching

## What We're NOT Doing

- ❌ CI/CD automation (manual deployment only for now)
- ❌ Custom domain configuration (using default *.fly.dev)
- ❌ Analytics integration
- ❌ Monitoring/alerting setup
- ❌ Staging environment
- ❌ Content encryption or authentication
- ❌ Docker local testing (direct to Fly.io deployment)

## Implementation Approach

**Content Strategy:**
- **Development:** Copy `apps/vault/` → `apps/site/content/` for local testing
- **Production:** Copy vault content into Docker image for clean builds
- **Note:** Changes to vault require re-copying content directory before build

**Build Strategy:**
- Multi-stage Docker build: Node.js builder → nginx server
- Layer caching for faster rebuilds
- Minimal final image (~25-50MB)

**Deployment Strategy:**
- Manual deployment via shell script
- Fly.io auto-scaling to zero for cost savings
- Global edge distribution

---

## Phase 1: Install and Configure Quartz

### Overview
Set up Quartz v4 static site generator in `apps/site/` with proper configuration for the vault content. Enables local development with hot-reload.

### Changes Required

#### 1. Prerequisites Check
**Action**: Verify Node.js and npm versions

```bash
node --version  # Must be >= v22.0.0
npm --version   # Must be >= 10.9.2
```

If versions are insufficient, install Node.js 22 from https://nodejs.org/

#### 2. Clone Quartz Repository
**Location**: `apps/site/`
**Action**: Clone official Quartz repository

```bash
cd apps/site
git clone https://github.com/jackyzha0/quartz.git .
```

**Note**: The `.` at the end clones directly into `apps/site/` without creating a nested directory.

#### 3. Install Dependencies
**Location**: `apps/site/`
**Action**: Install npm packages

```bash
npm install
```

Expected output: ~200 packages installed, no vulnerabilities

#### 4. Copy Vault Content
**Location**: `apps/site/`
**Action**: Copy vault directory to content folder

```bash
# Run from apps/site/ directory
# Windows (Git Bash or PowerShell)
cp -r ../vault content

# Or using robocopy on Windows
robocopy ..\vault content /E /MIR

# Linux/Mac
cp -r ../vault content
```

**Note**: After making changes to vault content, re-run this copy command before rebuilding the site.

#### 5. Configure Quartz Settings
**File**: `apps/site/quartz.config.ts`
**Changes**: Update configuration for radar deployment

Find and modify these sections:

```typescript
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Radar - Context Engineering Vault",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "radar.fly.dev",  // NO https://, NO trailing slash
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}
```

**Key changes:**
- `pageTitle`: Set to "Radar - Context Engineering Vault"
- `baseUrl`: Set to "radar.fly.dev" (no protocol, no trailing slash)
- Keep search and graph plugins enabled (default configuration includes them)

#### 6. Configure Page Layout
**File**: `apps/site/quartz.layout.ts`
**Changes**: Verify default layout includes search and graph components

The default layout should already include:
- `Component.Search()` in the header
- `Component.Graph()` in the right sidebar

**Verify these components are present:**

```typescript
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),  // ✅ Search enabled
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.Graph(),  // ✅ Graph enabled
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}
```

If modifications are needed, adjust the component placement as desired.

#### 7. Create Index Page
**File**: `apps/vault/index.md`
**Action**: Create home page for the site

```markdown
---
title: "Radar - Context Engineering Vault"
---

# Welcome to Radar

This is a digital garden documenting concepts, technologies, and examples in context engineering and AI systems.

## Explore

- [[concepts/context-engineering|Context Engineering Concepts]]
- [[tech/claude-code|Technologies]]
- [[examples/agentic-rag-workflow|Practical Examples]]

Use the search bar above or explore the graph view to discover connections between ideas.
```

**Note**: Adjust the wikilinks based on your actual vault structure.

#### 8. Test Local Build
**Location**: `apps/site/`
**Action**: Build and serve locally

```bash
npx quartz build --serve --port 8080
```

**Expected output:**
```
Started a Quartz server listening at http://localhost:8080
```

Open browser to http://localhost:8080 and verify:
- ✅ Site loads with your vault content
- ✅ Search bar appears and works
- ✅ Graph view displays in sidebar
- ✅ Internal links resolve correctly
- ✅ Navigation works between pages

Press Ctrl+C to stop the server when verification is complete.

### Success Criteria

#### Automated Verification:
- [x] Node.js version check passes: `node --version` shows >= 22.0.0
- [x] npm version check passes: `npm --version` shows >= 10.9.2
- [x] Dependencies install without errors: `npm install` exits with code 0
- [x] Content directory exists: `test -d apps/site/content && echo "content directory exists"`
- [x] Content has files: `ls apps/site/content | wc -l` shows > 0
- [x] Quartz builds successfully: `npx quartz build` exits with code 0
- [x] Local server starts: `npx quartz build --serve --port 8080` runs without errors

#### Manual Verification:
- [ ] Site displays at http://localhost:8080
- [ ] Search functionality returns results when querying content
- [ ] Graph view renders and shows content connections
- [ ] At least 5 pages from vault are accessible
- [ ] Internal wikilinks navigate correctly between pages
- [ ] Code blocks have syntax highlighting
- [ ] Dark mode toggle works

---

## Phase 2: Create Docker Infrastructure

### Overview
Create multi-stage Dockerfile for building Quartz site and serving with nginx. Includes optimized nginx configuration for static site serving with caching and compression.

### Changes Required

#### 1. Create Infrastructure Directory
**Action**: Create directory structure

```bash
mkdir -p infra/fly/site
```

#### 2. Create Dockerfile
**File**: `infra/fly/site/Dockerfile`
**Changes**: Multi-stage build configuration

```dockerfile
# Stage 1: Build Quartz static site
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/site/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy Quartz source files
COPY apps/site/ ./

# Copy vault content into content directory
COPY apps/vault ./content

# Build the static site
RUN npx quartz build --output public

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built static site from builder stage
COPY --from=builder /app/public /usr/share/nginx/html

# Copy nginx configuration
COPY infra/fly/site/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Fly.io internal routing
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
```

**Key optimizations:**
- `node:22-alpine`: Minimal base image (~150MB vs 1GB for full node image)
- `npm ci --prefer-offline`: Faster, reproducible installs
- Multi-stage build: Final image only contains nginx + static files (~25-50MB)
- Layer caching: Dependencies installed before source copy

#### 3. Create nginx Configuration
**File**: `infra/fly/site/nginx.conf`
**Changes**: Static file serving with performance optimizations

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Custom 404 page (Quartz generates this)
    error_page 404 /404.html;

    # Handle clean URLs (without .html extension)
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # Enable gzip compression for text files
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/x-javascript
        application/xml
        application/xml+rss
        application/json;

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Don't cache HTML files (content may update)
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }
}
```

**Configuration highlights:**
- Clean URLs: `/page` instead of `/page.html`
- Gzip compression for faster transfers
- Aggressive caching for static assets (1 year)
- No caching for HTML content (ensures updates are visible)
- Security headers for XSS protection

#### 4. Create .dockerignore
**File**: `.dockerignore` (at project root)
**Changes**: Exclude unnecessary files from Docker context

```
# Node modules (will be installed in container)
**/node_modules/

# Build outputs (generated during build)
**/public/
**/.quartz-cache/

# Git files
**/.git/
**/.gitignore

# Development files
**/.vscode/
**/.idea/

# OS files
**/.DS_Store
**/Thumbs.db

# Logs
**/*.log
**/npm-debug.log*

# Environment files
**/.env
**/.env.local

# Obsidian files (don't need in production)
**/.obsidian/

# Thoughts directory (not needed for deployment)
thoughts/
```

**Benefits:**
- Smaller Docker context = faster builds
- Prevents accidental inclusion of secrets
- Excludes generated files that will be rebuilt anyway

### Success Criteria

#### Automated Verification:
- [x] Infrastructure directory exists: `test -d infra/fly/site && echo "exists"`
- [x] Dockerfile exists: `test -f infra/fly/site/Dockerfile && echo "exists"`
- [x] nginx.conf exists: `test -f infra/fly/site/nginx.conf && echo "exists"`
- [x] .dockerignore exists: `test -f .dockerignore && echo "exists"`
- [ ] Dockerfile syntax is valid: `docker build -f infra/fly/site/Dockerfile -t test . --dry-run` (if available)

#### Manual Verification:
- [ ] All files created in correct locations (Dockerfile, nginx.conf in infra/fly/site/, .dockerignore at project root)
- [ ] Dockerfile uses correct paths relative to project root
- [ ] nginx.conf has valid syntax (no typos)
- [ ] .dockerignore patterns match project structure

---

## Phase 3: Create Fly.io Deployment Configuration

### Overview
Create Fly.io configuration file and deployment script for manual deployment workflow. Configures auto-scaling, minimal resources, and HTTPS enforcement.

### Changes Required

#### 1. Create fly.toml Configuration
**File**: `infra/fly/site/fly.toml`
**Changes**: Fly.io app configuration

```toml
# Application name (must be unique across Fly.io)
app = "radar"
primary_region = "iad"  # US East (Washington, D.C.)

[build]
  dockerfile = "infra/fly/site/Dockerfile"

[env]
  # No environment variables needed for static site

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

[[vm]]
  size = "shared-cpu-1x"
  memory = "256mb"
  cpus = 1
```

**Configuration explanation:**
- `app = "radar"`: Unique app name, deployed to `radar.fly.dev`
- `primary_region = "iad"`: US East region (change if needed)
- `dockerfile`: Path to Dockerfile relative to project root
- `force_https = true`: Automatic HTTPS redirect
- `auto_stop_machines = "stop"`: Scale to zero when idle (no traffic = $0 cost)
- `auto_start_machines = true`: Wake up automatically on first request
- `min_machines_running = 0`: Allow full scale-to-zero
- `size = "shared-cpu-1x"`: Smallest/cheapest machine type
- `memory = "256mb"`: Minimal memory for nginx (plenty for static sites)

**Regional options (if changing primary_region):**
- `iad`: US East (Washington, D.C.)
- `ord`: US Central (Chicago)
- `lax`: US West (Los Angeles)
- `lhr`: Europe (London)
- `fra`: Europe (Frankfurt)
- `nrt`: Asia (Tokyo)
- `syd`: Australia (Sydney)

#### 2. Create Deployment Script
**File**: `infra/fly/site/deploy.sh`
**Changes**: Shell script for one-command deployment

```bash
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
```

**Script features:**
- Error checking (stops on any failure)
- Validates flyctl installation and authentication
- Works from any directory (navigates to project root)
- Uses `--local-only` flag (builds Docker image locally, faster for small changes)
- Provides helpful next steps after deployment

#### 3. Make Script Executable
**Action**: Set executable permissions

```bash
chmod +x infra/fly/site/deploy.sh
```

**On Windows Git Bash:**
```bash
git update-index --chmod=+x infra/fly/site/deploy.sh
```

#### 4. Create README for Infrastructure
**File**: `infra/fly/site/README.md`
**Changes**: Deployment documentation

```markdown
# Radar Fly.io Deployment

This directory contains the infrastructure for deploying Radar to Fly.io.

## Prerequisites

1. **Install flyctl**: https://fly.io/docs/flyctl/install/
2. **Login to Fly.io**: `flyctl auth login`
3. **Initial app setup**: `flyctl launch --config infra/fly/site/fly.toml`

## Deployment

Deploy the latest changes:

```bash
./infra/fly/site/deploy.sh
```

Or manually:

```bash
flyctl deploy --config infra/fly/site/fly.toml
```

## Useful Commands

### View deployed site
```bash
flyctl open -a radar
```

### View logs
```bash
flyctl logs -a radar
```

### SSH into machine
```bash
flyctl ssh console -a radar
```

### Check machine status
```bash
flyctl status -a radar
```

### Scale machine resources
```bash
flyctl scale vm shared-cpu-1x --memory 256 -a radar
```

### Set machine count
```bash
flyctl scale count 1 -a radar  # Prevent scale-to-zero
flyctl scale count 0 -a radar  # Force scale-to-zero
```

## Configuration

- **App name**: `radar`
- **Region**: `iad` (US East)
- **URL**: https://radar.fly.dev
- **Auto-scaling**: Enabled (scales to zero when idle)
- **Machine**: shared-cpu-1x, 256MB RAM

## Files

- `fly.toml` - Fly.io app configuration
- `Dockerfile` - Multi-stage build (Quartz + nginx)
- `nginx.conf` - Web server configuration
- `deploy.sh` - Deployment script
- `.dockerignore` - Docker build exclusions

## Cost Optimization

The current configuration scales to zero when idle (no traffic = $0 cost):

- `auto_stop_machines = "stop"` - Stop when idle
- `auto_start_machines = true` - Start on request
- `min_machines_running = 0` - Allow zero machines

First request after idle period will take ~5-10 seconds to wake up.

To keep always running (faster response, ~$3/month):
```bash
flyctl scale count 1 -a radar
```

## Troubleshooting

### Build fails
```bash
# Check Docker builds locally
docker build -f infra/fly/site/Dockerfile -t radar-test .

# View detailed build logs
flyctl deploy --config infra/fly/site/fly.toml --verbose
```

### Site not loading
```bash
# Check machine status
flyctl status -a radar

# View recent logs
flyctl logs -a radar

# Restart machine
flyctl machine restart -a radar
```

### DNS not resolving
Wait 5-10 minutes for DNS propagation. Check status:
```bash
nslookup radar.fly.dev
```
```

### Success Criteria

#### Automated Verification:
- [x] fly.toml exists: `test -f infra/fly/site/fly.toml && echo "exists"`
- [x] deploy.sh exists: `test -f infra/fly/site/deploy.sh && echo "exists"`
- [x] deploy.sh is executable: `test -x infra/fly/site/deploy.sh && echo "executable"`
- [x] README.md exists: `test -f infra/fly/site/README.md && echo "exists"`
- [ ] fly.toml has valid TOML syntax: `flyctl config validate -c infra/fly/site/fly.toml` (after flyctl installed)

#### Manual Verification:
- [ ] fly.toml has app name "radar"
- [ ] fly.toml references correct Dockerfile path
- [ ] deploy.sh has proper error checking
- [ ] README.md documents all deployment steps
- [ ] All files committed to git

---

## Testing Strategy

### Phase 1 Testing:
**Local Quartz build**
- Run `npx quartz build --serve` and verify at http://localhost:8080
- Test search functionality
- Test graph view interactions
- Verify internal links resolve
- Check dark mode toggle

### Phase 2 Testing:
**Docker infrastructure validation**
- Verify all files created in correct locations
- Review Dockerfile for correct path references
- Review nginx.conf for syntax errors
- Confirm .dockerignore patterns

### Phase 3 Testing:
**Deployment configuration**
- Run `flyctl config validate` on fly.toml
- Test deploy.sh script's error handling
- Verify script permissions are correct

### Post-Deployment Testing (Manual):
1. **Access site**: Navigate to https://radar.fly.dev
2. **Test navigation**: Click through multiple pages
3. **Test search**: Search for keywords from vault content
4. **Test graph**: Verify graph view displays and interactions work
5. **Test performance**: Check page load times
6. **Test mobile**: Verify responsive design on mobile
7. **Test scale-to-zero**: Wait 5 minutes of no traffic, then access site (should wake up)

## Performance Considerations

**Build Performance:**
- Quartz build time depends on vault size (~5-30 seconds for small vaults)
- Docker layer caching speeds up rebuilds (only changed layers rebuild)
- npm ci is faster than npm install for CI/CD environments

**Runtime Performance:**
- nginx serves static files extremely efficiently
- Gzip compression reduces transfer sizes by 70-80%
- Browser caching reduces repeated requests
- Fly.io edge network provides low latency globally

**Scaling Behavior:**
- Cold starts (wake from zero): ~5-10 seconds
- Warm requests: <100ms response time
- Auto-scaling prevents unnecessary costs

## Migration Notes

**Not applicable** - This is a greenfield deployment with no existing infrastructure to migrate.

**Future migrations:**
- If moving to CI/CD: Add GitHub Actions workflow, no app changes needed
- If adding custom domain: Run `flyctl certs add your-domain.com`, update `baseUrl` in quartz.config.ts
- If changing regions: Update `primary_region` in fly.toml, redeploy

## References

- Original research: `thoughts/shared/research/2025-10-03_00-57-32_flyio-quartz-deployment.md`
- Quartz documentation: https://quartz.jzhao.xyz/
- Fly.io documentation: https://fly.io/docs/
- Vault content: `apps/vault/`
- Existing Fly.io notes: `apps/vault/tech/flyio.md`

## Next Steps After Implementation

1. **Run Phase 1**: Install and configure Quartz locally
2. **Copy vault content**: Run `cp -r apps/vault apps/site/content` from project root
3. **Verify Phase 1**: Test local build at http://localhost:8080
4. **Run Phase 2**: Create Docker infrastructure files
5. **Run Phase 3**: Create Fly.io configuration
6. **Initial deployment**: Run `flyctl launch --config infra/fly/site/fly.toml --no-deploy`
7. **Deploy**: Run `./infra/fly/site/deploy.sh`
8. **Verify deployment**: Test https://radar.fly.dev
9. **Monitor**: Check logs with `flyctl logs -a radar`

## Content Update Workflow

When vault content changes:

```bash
# From project root
cd apps/site
rm -rf content
cp -r ../vault content
npx quartz build --serve  # Test locally
cd ../..
./infra/fly/site/deploy.sh  # Deploy to production
```

---

**Plan Status**: Ready for implementation
**Created**: 2025-10-04
**Author**: Claude Code
