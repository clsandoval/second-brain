---
title: Composio
type: technology
category: tool-integration
tags: [tools, integration, agents, mcp]
created: 2025-10-03
updated: 2025-10-03
website: https://composio.dev
github: https://github.com/ComposioHQ/composio
license: MIT
---

# Composio

## Overview

SDK that equips AI agents and LLMs with 250+ high-quality integrations via function calling, handling authentication, API mapping, and reliable execution.

## Core Features

- **Extensive Integrations**: 250+ tools and 150+ agent toolkits including Gmail, Slack, GitHub, Notion, Google Workspace, CRM systems, and more
- **Function Calling**: Standardized function calling interface for LLMs
- **Authentication Management**: Unified auth handling across all integrations - authenticate once, use everywhere
- **Execution Layer**: Listens to LLM function calls, handles auth, maps to real APIs, executes reliably
- **Model Context Protocol**: Supports MCP server called Rube for enhanced context

## Supported Frameworks

- **25+ agentic frameworks** including: OpenAI, LangChain, AutoGen, CrewAI, LlamaIndex
- **SDKs**: Python 3.10+, TypeScript/JavaScript
- **IDE Integration**: Cursor, Claude Desktop, VS Code

## Use Cases in Context Engineering

- Enabling AI agents to perform real-world actions (send emails, create tasks, update databases)
- Building production AI agents that interact with external services
- Simplifying cross-platform AI interactions
- Abstracting authentication complexity from agent logic
- Creating multi-tool workflows with reliable execution
- Implementing [[tool-abstraction-portability]] patterns

## Related Technologies

- [[langgraph]]: Use Composio tools in LangGraph agent workflows
- [[claude-code]]: MCP integration for development tools
- [[langfuse]]: Monitor Composio tool usage patterns

## Resources

- [Official Website](https://composio.dev/)
- [GitHub Repository](https://github.com/ComposioHQ/composio)
- [MCP Integration](https://mcp.composio.dev/composio)
- [Composio vs LangChain Tools](https://composio.dev/blog/composio-vs-langchain-tools)

---

## Changelog

- **2025-10-03**: Initial note created with integrations, features, and framework support
