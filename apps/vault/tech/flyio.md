---
title: Fly.io
type: technology
category: infrastructure
tags: [deployment, cloud, edge, infrastructure]
created: 2025-10-03
updated: 2025-10-03
website: https://fly.io
docs: https://fly.io/docs/
---

# Fly.io

## Overview

Cloud platform for deploying applications globally across multiple regions with simple developer experience and fast-launching VMs.

## Core Features

- **Fly Machines**: Fast-launching VMs with simple REST API (core compute primitive)
- **Fly Launch**: Built-from-scratch orchestrator that:
  - Auto-detects frameworks and provides defaults
  - Uses `fly.toml` for configuration
  - Deploys with `fly deploy` command
  - Scales with `fly scale` command
- **Global Deployment**: Deploy applications across multiple regions worldwide
- **Deployment Strategies**: Canary, rolling, blue-green, or immediate (rolling is default)
- **Language Support**: Elixir, Ruby on Rails, Django, Laravel, JavaScript, Rust, and more

## Platform Services

- Managed Postgres databases
- Kubernetes clusters
- GPU hosting
- Persistent volumes
- Docker container support

## Getting Started

```bash
# Install flyctl
# Run fly launch to initialize
# Deploy globally with fly deploy
```

## Configuration

- `fly.toml`: Central configuration file for app deployment
- CLI-based workflow via `flyctl`
- CI/CD integration with GitHub Actions

## Use Cases in Context Engineering

- Deploying LLM inference services globally for low latency
- Hosting [[retrieval-augmented-generation|RAG]] applications with vector databases
- Running agent orchestration platforms ([[langgraph]] Platform, [[temporal]])
- Edge deployment for AI APIs and microservices
- GPU-accelerated model serving
- Scaling LLM applications across regions

## Related Technologies

- [[langgraph]]: Deploy LangGraph Platform on Fly.io
- [[temporal]]: Host Temporal workflows
- [[onyx]]: Deploy Onyx instances
- [[langfuse]]: Host self-hosted Langfuse

## Resources

- [Main Documentation](https://fly.io/docs/)
- [Deployment Guide](https://fly.io/docs/launch/deploy/)
- [GitHub Actions Integration](https://fly.io/docs/launch/continuous-deployment-with-github-actions/)
- [Fly Machines Overview](https://fly.io/docs/machines/overview/)

---

## Changelog

- **2025-10-03**: Initial note created with core features, platform services, and use cases
