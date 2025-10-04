---
title: Onyx
type: technology
category: data-connectivity
tags: [rag, connectors, enterprise, knowledge-base]
created: 2025-10-03
updated: 2025-10-03
website: https://docs.onyx.app
github: https://github.com/onyx-dot-app/onyx
license: MIT (Community Edition)
---

# Onyx

## Overview

Self-hostable AI platform with powerful chat interface, RAG capabilities, and 40+ connectors to enterprise knowledge sources and applications.

## Core Features

- **Universal LLM Support**: Works with multiple LLM providers
- **Connector Ecosystem**: 40+ knowledge sources including Slack, Confluence, Google Drive, GitHub, Notion, Jira, Salesforce, SharePoint, and more
- **RAG Capabilities**: Hybrid search with [[retrieval-augmented-generation|retrieval-augmented generation]]
- **Custom AI Agents**: Define agents with unique instructions and actions
- **Web Search Integration**: Multiple providers (Google PSE, Exa, Serper)
- **Code Interpreter**: Data analysis and file creation capabilities
- **Image Generation**: Built-in image generation support
- **Enterprise Features**: SSO, RBAC, credential encryption, document permissioning

## Connector Architecture

- **Load Connector**: Bulk index documents from API or dump files (point-in-time snapshot)
- **Poll Connector**: Incremental updates based on time ranges
- **Slim Connector**: Lightweight document existence checking (IDs only)
- **Event Connector**: Real-time event-based updates

## Deployment Options

- Docker, Kubernetes, Terraform
- Supports completely airgapped environments
- Scalable to millions of documents

## Use Cases in Context Engineering

- Enterprise knowledge management and search
- [[retrieval-augmented-generation|RAG]] applications across multiple data sources
- Unified AI interface for organizational data
- Secure, permissioned AI access to sensitive documents
- Implementing the "Select" strategy in [[context-engineering]]

## Related Technologies

- [[langfuse]]: Monitor Onyx RAG retrieval quality
- [[langgraph]]: Orchestrate agents that query Onyx
- [[composio]]: Alternative integration layer

## Editions

- **Community Edition** (MIT licensed)
- **Enterprise Edition** (additional features)

## Resources

- [GitHub Repository](https://github.com/onyx-dot-app/onyx)
- [Documentation](https://docs.onyx.app)
- [Connector Developer Guide](https://github.com/onyx-dot-app/onyx/blob/main/backend/onyx/connectors/README.md)

---

## Changelog

- **2025-10-03**: Initial note created with connector architecture, features, and use cases
