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
