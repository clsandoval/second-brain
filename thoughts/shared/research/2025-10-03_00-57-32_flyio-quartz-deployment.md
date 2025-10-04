---
date: 2025-10-03T00:57:32Z
researcher: Claude Code
git_commit: none (new repository)
branch: main
repository: clsandoval/second-brain
topic: "Deploying Vault to Fly.io with Quartz Static Site Generator"
tags: [research, codebase, deployment, quartz, flyio, infrastructure, static-site]
status: complete
last_updated: 2025-10-03
last_updated_by: Claude Code
---

# Research: Deploying Vault to Fly.io with Quartz Static Site Generator

**Date**: 2025-10-03T00:57:32Z
**Researcher**: Claude Code
**Git Commit**: none (new repository)
**Branch**: main
**Repository**: clsandoval/second-brain

## Research Question

User wants to deploy their vault to Fly.io with the following architecture:

```
│  └─ site/                     # Static site (Quartz-based) built from /vault
│     ├─ package.json
│     ├─ quartz.config.ts
│     ├─ content/               # symlink or copy from ../vault (via build step)
│     ├─ public/                # build output directory
│     └─ README.md
├─ infra/
│  └─ fly/
│     └─ site/
│        ├─ Dockerfile          # Multi-stage: build Quartz → serve via nginx
│        └─ fly.toml
```

## Summary

The current codebase is a **fresh second-brain repository** containing:
- ✅ **Vault content**: 15 markdown files organized in `apps/vault/` (concepts, tech, examples)
- ❌ **No Quartz setup**: No static site generator installed
- ❌ **No deployment infrastructure**: No Dockerfile, fly.toml, or infra directory
- ❌ **No build system**: No package.json or Node.js configuration

**Next Steps Required**:
1. Install and configure Quartz v4 in `apps/site/` directory
2. Configure content linkage from `apps/vault/` to `apps/site/content/`
3. Create multi-stage Dockerfile for building and serving
4. Configure Fly.io deployment with fly.toml
5. Set up deployment workflow

This research provides comprehensive information about Quartz requirements, configuration, and Fly.io deployment best practices to implement this architecture.

## Detailed Findings

### Current Codebase Structure

**Vault Content Location**: `C:\Users\armor\OneDrive\Desktop\cs\second-brain\apps\vault\`

The vault contains well-organized markdown content:

**Concepts** (7 files):
- `apps\vault\concepts\prompt-scaffolding.md`
- `apps\vault\concepts\retrieval-augmented-generation.md`
- `apps\vault\concepts\context-compression-pruning.md`
- `apps\vault\concepts\observability-in-context.md`
- `apps\vault\concepts\tool-abstraction-portability.md`
- `apps\vault\concepts\context-engineering.md`
- `apps\vault\concepts\spec-driven-development.md`

**Technologies** (5 files):
- `apps\vault\tech\onyx.md`
- `apps\vault\tech\composio.md`
- `apps\vault\tech\temporal.md`
- `apps\vault\tech\flyio.md` ⭐ (contains Fly.io deployment documentation)
- `apps\vault\tech\claude-code.md`

**Examples** (3 files):
- `apps\vault\examples\agentic-rag-workflow.md`
- `apps\vault\examples\context-compression-pipeline.md`
- `apps\vault\examples\multi-tool-agent.md`

**Documentation**:
- `apps\vault\README.md` (comprehensive index and concept map)

### Missing Infrastructure

**What doesn't exist yet**:
- No `apps/site/` directory
- No Quartz installation or configuration
- No `package.json` anywhere in the project
- No `infra/` directory structure
- No Dockerfile or fly.toml
- No nginx configuration
- No build or deployment scripts

### Quartz Static Site Generator

**Version**: v4 (latest, complete rewrite focusing on extensibility)
**Purpose**: Fast static-site generator specifically for digital gardens and second brains
**Official Site**: https://quartz.jzhao.xyz/

#### System Requirements

**Critical Requirements**:
- **Node.js**: >= 22 (strictly enforced)
- **npm**: >= 10.9.2 (strictly enforced)

These versions are hard requirements defined in Quartz's package.json engines field.

#### Installation Process

```bash
# 1. Clone Quartz repository
git clone https://github.com/jackyzha0/quartz.git apps/site

# 2. Navigate to directory
cd apps/site

# 3. Install dependencies
npm install

# 4. Initialize content configuration
npx quartz create
```

During `npx quartz create`, you'll be prompted to:
- Choose initialization method (recommend: symlink to existing vault)
- Enter path to content folder: `../vault`
- Choose link resolution format: "shortest path" (matches Obsidian default)

#### Key Configuration Files

**quartz.config.ts** - Main configuration:
```typescript
{
  pageTitle: "Context Engineering Vault",
  enableSPA: true,
  enablePopovers: true,
  baseUrl: "your-app.fly.dev",  // NO protocol, NO trailing slash
  ignorePatterns: ["private", "templates", ".obsidian"],
  defaultDateType: "created",
  theme: {
    typography: { /* fonts */ },
    colors: { /* light/dark mode colors */ }
  },
  plugins: {
    transformers: [ /* content transformers */ ],
    filters: [ /* content filters */ ],
    emitters: [ /* output generators */ ]
  }
}
```

**quartz.layout.ts** - Page layout configuration:
```typescript
{
  head: Component,          // HTML metadata
  header: Component[],      // Top navigation
  beforeBody: Component[],  // Table of contents, etc.
  pageBody: Component,      // Main content
  afterBody: Component[],   // Backlinks, etc.
  left: Component[],        // Sidebar components
  right: Component[],       // Graph view, etc.
  footer: Component         // Footer
}
```

#### Build Commands

```bash
# Development server with hot-reload
npx quartz build --serve --port 8080

# Production build
npx quartz build --output public

# Build with custom content directory
npx quartz build --directory /path/to/vault --output public

# Build options
-d, --directory <path>    # Content folder (default: "content")
-o, --output <path>       # Output folder (default: "public")
-v, --verbose             # Extra logging
--serve                   # Start local preview server
--port <number>           # Preview port (default: 8080)
--concurrency <number>    # Parsing threads
```

**Build Output**: Static files in `public/` directory (HTML, CSS, JS, assets)

#### Content Structure

Quartz expects content in the `content/` directory:

```
apps/site/
├── content/              # All markdown files
│   ├── index.md         # Home page (required)
│   ├── concepts/        # Folders become URL paths
│   ├── tech/
│   └── examples/
├── quartz.config.ts
├── quartz.layout.ts
├── package.json
└── public/              # Build output (generated)
```

**Supported Markdown Features**:
- Standard Markdown syntax
- GitHub Flavored Markdown
- Obsidian wikilinks: `[[Page Name]]`
- Obsidian callouts: `> [!note]`
- Internal transclusions
- Block references
- LaTeX math support
- Syntax highlighting

**Frontmatter Fields**:
```yaml
---
title: "Page Title"
description: "Used for previews and SEO"
tags: ["tag1", "tag2"]
date: 2025-01-15
draft: false
---
```

#### Content Linkage Strategies

**Option 1: Symlink (Recommended for Development)**
```bash
cd apps/site
npx quartz create
# Select "symlink to existing folder"
# Enter: ../vault
```

**Pros**: Single source of truth, instant updates
**Cons**: May cause issues with Obsidian Mobile, Windows requires admin privileges

**Option 2: Copy in Dockerfile (Recommended for Production)**
```dockerfile
# In Dockerfile
COPY apps/vault ./content
```

**Pros**: Clean separation, no symlink complications
**Cons**: Requires rebuild for content updates

**Option 3: Build-time Copy Script**
```bash
# In build script or CI/CD
rm -rf apps/site/content
cp -r apps/vault apps/site/content
npx quartz build
```

### Docker Multi-Stage Build

**Recommended Dockerfile Structure**:

```dockerfile
# Stage 1: Build Quartz site
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY apps/site/package*.json ./
RUN npm ci --prefer-offline

# Copy Quartz source
COPY apps/site .

# Copy vault content
COPY apps/vault ./content

# Build the static site
RUN npx quartz build --output public

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built site
COPY --from=builder /app/public /usr/share/nginx/html

# Copy nginx configuration
COPY infra/fly/site/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf Configuration**:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Custom 404 page
    error_page 404 /404.html;

    # Handle clean URLs (without .html extension)
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Image Size Optimization**:
- Use `node:22-alpine` (smaller base image)
- Use multi-stage build (only ship nginx + static files)
- Use `npm ci --prefer-offline` (faster, reproducible builds)
- Expected final image size: ~25-50 MB (nginx + static assets)

### Fly.io Deployment Configuration

**fly.toml Configuration**:

```toml
# app name - must be unique across Fly.io
app = "your-vault-name"
primary_region = "iad"  # Choose closest region (iad=US East)

[build]
  dockerfile = "Dockerfile"

[env]
  # Optional environment variables

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = "stop"   # Auto-scale to zero when idle
  auto_start_machines = true    # Wake up on request
  min_machines_running = 0      # Save costs by scaling to zero
  processes = ["app"]

[[vm]]
  size = "shared-cpu-1x"        # Smallest/cheapest machine
  memory = "256mb"               # Minimal memory for nginx

# Optional: Persistent volume (not needed for static sites)
# [[mounts]]
#   source = "data"
#   destination = "/data"
```

**Deployment Commands**:

```bash
# Install flyctl (if not already installed)
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# macOS: brew install flyctl
# Linux: curl -L https://fly.io/install.sh | sh

# Login to Fly.io
fly auth login

# Launch app (first time setup)
cd infra/fly/site
fly launch

# During launch, it will:
# 1. Detect the Dockerfile
# 2. Ask for app name
# 3. Choose region
# 4. Generate fly.toml

# Deploy updates
fly deploy

# Open deployed site
fly open

# View logs
fly logs

# SSH into machine
fly ssh console

# Scale machines
fly scale count 1  # Set to 1 machine
fly scale vm shared-cpu-1x --memory 256  # Set resources
```

**Fly.io Features for Static Sites**:
- **Auto-scaling**: Scale to zero when idle (save costs)
- **Global CDN**: Automatic edge caching
- **HTTPS**: Free SSL certificates (Let's Encrypt)
- **Custom domains**: Easy domain setup with `fly certs`
- **Fast deployment**: ~30-60 seconds for static sites
- **Low cost**: Free tier available, paid plans start at ~$3/month

**Cost Optimization**:
```toml
# Fly.io free tier includes:
# - 3 shared-cpu-1x 256mb VMs (free)
# - 160GB outbound data transfer (free)

# For minimal cost static site:
auto_stop_machines = "stop"
auto_start_machines = true
min_machines_running = 0  # Scale to zero = $0 when idle
```

### Deployment Workflow Options

#### Option 1: Manual Deployment

```bash
# Build and deploy manually
cd infra/fly/site
fly deploy
```

#### Option 2: GitHub Actions CI/CD

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Fly.io
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        run: flyctl deploy --config infra/fly/site/fly.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Setup**:
1. Get Fly.io API token: `fly auth token`
2. Add to GitHub Secrets: Settings → Secrets → New secret → `FLY_API_TOKEN`
3. Push to main branch triggers automatic deployment

#### Option 3: Watch Mode (Development)

For local development with auto-rebuild:
```bash
# Watch vault for changes and auto-rebuild
cd apps/site
npx quartz build --serve --directory ../vault
```

## Code References

- `apps/vault/tech/flyio.md` - Existing Fly.io documentation with deployment notes
- `apps/vault/README.md` - Vault structure and organization documentation

## Architecture Insights

### Recommended Directory Structure

```
second-brain/
├── apps/
│   ├── vault/                    # Source markdown content
│   │   ├── concepts/
│   │   ├── tech/
│   │   ├── examples/
│   │   └── README.md
│   └── site/                     # Quartz static site generator
│       ├── content/              # → Symlink or copy from ../vault
│       ├── quartz/               # Quartz source (from git clone)
│       ├── public/               # Build output (gitignored)
│       ├── quartz.config.ts
│       ├── quartz.layout.ts
│       ├── package.json
│       └── .gitignore
├── infra/
│   └── fly/
│       └── site/
│           ├── Dockerfile        # Multi-stage: build + serve
│           ├── fly.toml          # Fly.io configuration
│           ├── nginx.conf        # nginx web server config
│           └── .dockerignore
└── .github/
    └── workflows/
        └── deploy.yml            # Optional: CI/CD automation
```

### Design Patterns

**Separation of Concerns**:
- `apps/vault/` - Pure content (markdown files)
- `apps/site/` - Build tooling (Quartz, Node.js dependencies)
- `infra/fly/site/` - Deployment configuration (Docker, Fly.io)

**Content Strategy**:
- **Development**: Use symlink for instant updates
- **Production**: Copy content in Dockerfile for clean builds
- **Frontmatter**: Leverage Obsidian-compatible metadata

**Build Strategy**:
- **Multi-stage Docker**: Minimize final image size (build → serve pattern)
- **Layer caching**: Install dependencies before copying source
- **Static serving**: nginx for performance and simplicity

**Deployment Strategy**:
- **Auto-scaling**: Scale to zero for cost savings
- **Global edge**: Fly.io automatically distributes to nearest region
- **CI/CD**: Optional GitHub Actions for push-to-deploy workflow

### Technology Stack Integration

The vault documentation already includes notes on several technologies that integrate well with this deployment:

**Infrastructure** (`apps/vault/tech/flyio.md`):
- Fly.io for global edge deployment
- Docker for containerization
- nginx for static file serving

**Content Management**:
- Obsidian-compatible markdown
- Wikilinks for internal references
- Frontmatter for metadata

**Build Pipeline**:
- Quartz v4 for static site generation
- Node.js 22+ for build tooling
- npm for dependency management

## Implementation Checklist

### Phase 1: Setup Quartz

- [ ] Install Node.js 22+ and npm 10.9.2+
- [ ] Clone Quartz to `apps/site/`: `git clone https://github.com/jackyzha0/quartz.git apps/site`
- [ ] Install dependencies: `cd apps/site && npm install`
- [ ] Initialize content: `npx quartz create` (symlink to `../vault`)
- [ ] Configure `quartz.config.ts` (baseUrl, title, theme)
- [ ] Configure `quartz.layout.ts` (page layout components)
- [ ] Test local build: `npx quartz build --serve`
- [ ] Verify site at http://localhost:8080
- [ ] Add `apps/site/public/` to `.gitignore`
- [ ] Add `apps/site/node_modules/` to `.gitignore`

### Phase 2: Create Deployment Infrastructure

- [ ] Create directory: `mkdir -p infra/fly/site`
- [ ] Create `infra/fly/site/Dockerfile` (multi-stage build)
- [ ] Create `infra/fly/site/nginx.conf` (static file serving)
- [ ] Create `infra/fly/site/.dockerignore` (exclude unnecessary files)
- [ ] Test Docker build locally: `docker build -f infra/fly/site/Dockerfile -t vault-site .`
- [ ] Test Docker run locally: `docker run -p 8080:80 vault-site`
- [ ] Verify site at http://localhost:8080

### Phase 3: Deploy to Fly.io

- [ ] Install flyctl: https://fly.io/docs/flyctl/install/
- [ ] Login: `fly auth login`
- [ ] Launch app: `cd infra/fly/site && fly launch`
- [ ] Configure app name and region during launch
- [ ] Review generated `fly.toml`
- [ ] Adjust machine size/memory if needed
- [ ] Deploy: `fly deploy`
- [ ] Open deployed site: `fly open`
- [ ] Test all pages and navigation
- [ ] Configure custom domain (optional): `fly certs add your-domain.com`

### Phase 4: Optional CI/CD

- [ ] Create `.github/workflows/deploy.yml`
- [ ] Get Fly.io API token: `fly auth token`
- [ ] Add `FLY_API_TOKEN` to GitHub repository secrets
- [ ] Test workflow by pushing to main branch
- [ ] Verify automatic deployment

### Phase 5: Documentation

- [ ] Add deployment instructions to `apps/site/README.md`
- [ ] Document build process
- [ ] Document deployment process
- [ ] Add troubleshooting section

## Open Questions

1. **Content Update Strategy**: How frequently will content be updated? This affects whether to use CI/CD vs manual deployment.

2. **Custom Domain**: Does the user want to configure a custom domain, or use the default `*.fly.dev` subdomain?

3. **Analytics**: Should Quartz analytics be enabled (Google Analytics, Plausible, Umami)?

4. **Search**: Should full-text search be enabled (increases build time and size)?

5. **Graph View**: Should the interactive graph view be included (may be resource-intensive for large vaults)?

6. **Theme Customization**: Does the user want to customize colors, fonts, or layouts beyond defaults?

7. **Private Content**: Are there any files/folders that should be excluded from publishing? (Use `ignorePatterns` in config)

8. **Monitoring**: Should we set up uptime monitoring or error tracking for the deployed site?

9. **Backup Strategy**: Should we implement automated backups of the built site?

10. **Content Staging**: Would the user benefit from a staging environment for previewing changes before production deployment?

## Related Resources

### Official Documentation
- [Quartz Documentation](https://quartz.jzhao.xyz/) - Complete Quartz v4 guide
- [Quartz GitHub](https://github.com/jackyzha0/quartz) - Source code and issues
- [Fly.io Documentation](https://fly.io/docs/) - Platform documentation
- [Fly.io Launch Guide](https://fly.io/docs/launch/) - Deployment guide

### Community Resources
- [Quartz Discord](https://discord.gg/cRFFHYye7t) - Community support
- [Quartz Showcase](https://quartz.jzhao.xyz/showcase) - Example sites
- [Dockerized Quartz](https://github.com/shommey/dockerized-quartz) - Alternative Docker solution
- [Fly.io Community](https://community.fly.io/) - Platform discussions

### Technical Deep-Dives
- [Quartz Architecture](https://quartz.jzhao.xyz/advanced/architecture) - How Quartz works internally
- [Creating Quartz Components](https://quartz.jzhao.xyz/advanced/creating-components) - Custom component development
- [Fly.io Machines](https://fly.io/docs/machines/overview/) - VM architecture details

## Next Steps

1. **Install Node.js 22+**: Ensure system meets Quartz requirements
2. **Clone Quartz**: Set up `apps/site/` directory with Quartz installation
3. **Configure Content**: Set up symlink or copy strategy from `apps/vault/`
4. **Test Locally**: Verify site builds and displays correctly
5. **Create Docker Infrastructure**: Dockerfile, nginx.conf, fly.toml
6. **Deploy to Fly.io**: Launch and deploy the static site
7. **Verify Deployment**: Test all functionality on production
8. **Set up CI/CD** (optional): Automate deployments on git push

---

**Research completed**: 2025-10-03T00:57:32Z
