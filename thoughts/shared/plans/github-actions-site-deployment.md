# GitHub Actions Site Deployment Workflow Implementation Plan

## Overview

Automate the deployment of the Radar site by creating a GitHub Actions workflow that:
1. Copies content from `apps/vault/` to `apps/site/content/`
2. Deploys to Fly.io using the existing configuration

## Current State Analysis

### Existing Infrastructure
- **Content source**: `apps/vault/` contains the source content (concepts, data, examples, tech, index.md)
- **Content destination**: `apps/site/content/` is where Quartz builds from
- **Fly.io config**: `infra/fly/site/fly.toml` (port 80, shared-cpu-1x, 256mb)
- **Existing workflow**: `apps/site/.github/workflows/fly-deploy.yml:1` (will be replaced/removed)
- **Dockerfile**: `apps/site/Dockerfile:1` builds Quartz site with content in place

### Current Manual Process
Currently, content is manually copied from `apps/vault/` to `apps/site/content/` before deployment.

## Desired End State

A GitHub Actions workflow at `.github/workflows/deploy-site.yml` that:
- Triggers on push to `main` branch
- Automatically syncs content from vault to site
- Deploys to Fly.io with zero manual intervention

### Verification
After implementation, pushing to main should:
1. Trigger the workflow (visible in GitHub Actions tab)
2. Complete successfully within ~5 minutes
3. Deploy updated content to the Fly.io site
4. Site should be accessible and show latest content

## What We're NOT Doing

- Not setting up preview deployments for branches
- Not adding any build caching optimizations (can be added later)
- Not modifying the existing Dockerfile or fly.toml configuration
- Not setting up content validation or linting (can be added later)
- Not removing the existing `apps/site/.github/workflows/fly-deploy.yml` (user can decide)

## Implementation Approach

Create a single-file GitHub Actions workflow at the repository root that:
1. Checks out the repository
2. Copies vault content to site content directory (overwriting existing files)
3. Sets up Fly.io CLI
4. Deploys using the specified config and context

## Phase 1: Create Root GitHub Actions Directory Structure

### Overview
Set up the GitHub Actions workflow directory at repository root.

### Changes Required

#### 1. Create `.github/workflows/` directory
**Location**: Repository root
**Action**: Create directory structure

```bash
mkdir -p .github/workflows
```

### Success Criteria

#### Automated Verification:
- [ ] Directory exists: `test -d .github/workflows`

#### Manual Verification:
- [ ] Directory is visible in repository root

---

## Phase 2: Create Deployment Workflow

### Overview
Create the GitHub Actions workflow file that handles content sync and deployment.

### Changes Required

#### 1. Create workflow file
**File**: `.github/workflows/deploy-site.yml`
**Changes**: Create new workflow file

```yaml
name: Deploy Radar Site

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy site to Fly.io
    runs-on: ubuntu-latest
    concurrency: deploy-group  # Ensure only one deployment runs at a time

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Sync vault content to site
        run: |
          echo "Copying content from apps/vault/ to apps/site/content/"
          cp -r apps/vault/* apps/site/content/
          echo "Content sync complete"

      - name: Setup Fly.io CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        working-directory: apps/site
        run: flyctl deploy --config ../../infra/fly/site/fly.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Key design decisions:**
- **Content sync**: Uses `cp -r` to recursively copy and overwrite files
- **Working directory**: Changes to `apps/site` for deployment context
- **Fly config path**: Relative path from apps/site to infra/fly/site/fly.toml
- **Concurrency**: Prevents simultaneous deployments
- **Secrets**: Reuses existing `FLY_API_TOKEN` secret

### Success Criteria

#### Automated Verification:
- [ ] Workflow file exists: `test -f .github/workflows/deploy-site.yml`
- [ ] YAML is valid: `yamllint .github/workflows/deploy-site.yml` (if yamllint installed)

#### Manual Verification:
- [ ] Workflow appears in GitHub Actions tab
- [ ] Workflow syntax is recognized by GitHub

---

## Phase 3: Test and Verify Deployment

### Overview
Verify the workflow executes successfully and deploys the site.

### Testing Strategy

#### Initial Test:
1. Commit and push the workflow file to main branch
2. Monitor the GitHub Actions tab for workflow execution
3. Verify all steps complete successfully
4. Check Fly.io dashboard for deployment status
5. Visit the deployed site to confirm content is live

#### Edge Cases to Test:
- Content with special characters or spaces in filenames
- Large content files (should deploy successfully)
- Rapid successive pushes (concurrency control should queue)

### Success Criteria

#### Automated Verification:
- [ ] Workflow completes without errors (exit code 0)
- [ ] All workflow steps show green checkmarks
- [ ] Fly.io deployment succeeds (visible in flyctl output)

#### Manual Verification:
- [ ] Deployed site is accessible at Fly.io URL
- [ ] Content from apps/vault/ is visible on the site
- [ ] No missing or broken content
- [ ] Site loads within reasonable time (< 5 seconds)
- [ ] Subsequent pushes trigger new deployments correctly

---

## Migration Notes

### Existing Workflow
The repository has an existing workflow at `apps/site/.github/workflows/fly-deploy.yml:1` that also deploys on push to main.

**Decision needed**: Should we:
- Remove the old workflow to avoid duplicate deployments?
- Keep it as a backup?
- Disable it by renaming?

**Recommendation**: Remove `apps/site/.github/workflows/fly-deploy.yml` after confirming the new workflow works, to avoid confusion and duplicate deployments.

### Secrets Required
The workflow requires the `FLY_API_TOKEN` secret to be set in GitHub repository settings. This should already exist if the old workflow was working.

To verify: **Settings → Secrets and variables → Actions → Repository secrets**

### First Deployment
The first workflow run will sync the current state of `apps/vault/` to the site. Ensure vault content is in the desired state before merging this workflow.

## Performance Considerations

### Deployment Time
Expected total workflow time: **3-5 minutes**
- Checkout: ~10 seconds
- Content sync: ~5 seconds
- Flyctl setup: ~10 seconds
- Fly.io build and deploy: ~3-4 minutes

### Content Sync Performance
The `cp -r` command is fast for typical content sizes. For very large content directories (>1GB), consider:
- Using `rsync` instead for incremental sync
- Excluding unnecessary files (e.g., `.obsidian/`)

### Fly.io Build
The Dockerfile uses multi-stage builds which is already optimized. No changes needed.

## Rollback Plan

If the workflow fails or causes issues:

1. **Immediate**: Manually deploy using the old workflow or local deployment
2. **Short-term**: Revert the commit that added the workflow
3. **Debugging**: Check workflow logs in GitHub Actions tab
4. **Fly.io issues**: Check `flyctl logs` for deployment errors

## References

- Existing workflow: `apps/site/.github/workflows/fly-deploy.yml:1`
- Fly.io config: `infra/fly/site/fly.toml:1`
- Dockerfile: `apps/site/Dockerfile:1`
- Fly.io GitHub Actions docs: https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/
