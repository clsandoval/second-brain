---
title: Multi-Tool Agent Example
type: example
tags: [agent, tools, composio, mcp]
created: 2025-10-03
updated: 2025-10-03
---

# Multi-Tool Agent Example

## Overview

Example implementation of an AI agent that uses multiple tools through standardized interfaces ([[tool-abstraction-portability|MCP]] and [[composio]]) to accomplish complex tasks.

## Architecture

```
User Request: "Research competitor X and send summary to team"
    ↓
Agent (LangGraph) - Decision Loop
    ↓
Tool Selection & Execution:
    1. Web Search (via Composio)
    2. GitHub API (via Composio) - check repos
    3. Notion API (via MCP) - retrieve internal docs
    4. Slack API (via Composio) - send message
    ↓
Context Management (isolate tool outputs)
    ↓
Final Response + Traceability (Langfuse)
```

## Agent Workflow

### 1. Task Analysis
- Parse user request
- Identify required actions
- Plan tool usage sequence

### 2. Tool Discovery
- Query available tools through [[composio]]
- Check authentication status
- Verify permissions

### 3. Execution Loop
```
while task not complete:
    - Select next tool
    - Prepare tool input from context
    - Execute tool call
    - Store result in isolated workspace
    - Evaluate: task complete?
```

### 4. Context Management
- **[[context-engineering#Isolate]]**: Separate workspace for each tool
- **[[context-engineering#Select]]**: Choose relevant tool outputs
- **[[context-engineering#Compress]]**: Summarize lengthy tool responses

### 5. Response Generation
- Synthesize information from all tool calls
- Generate final response
- Include source attribution

## Tool Integration Patterns

### Pattern 1: Sequential Tool Usage
```
Tool A → Result A → Tool B (uses Result A) → Result B → Response
```

### Pattern 2: Parallel Tool Usage
```
[Tool A, Tool B, Tool C] → [Result A, B, C] → Synthesize → Response
```

### Pattern 3: Conditional Tool Usage
```
Tool A → Evaluate → If condition: Tool B, Else: Tool C → Response
```

## Technologies Used

- **[[composio]]**: 250+ tool integrations with authentication
- **[[langgraph]]**: Stateful agent orchestration
- **[[langfuse]]**: Monitor tool usage patterns
- **[[claude-code]]**: MCP integration for development tools

## Benefits of Standardized Tools

1. **Maintainability**: Single interface for all tools
2. **Portability**: Switch between AI providers easily
3. **Discoverability**: Agent can discover available tools
4. **Reliability**: Standardized error handling
5. **Observability**: Consistent logging and monitoring

## Context Engineering Strategies

- **Write**: Store tool outputs in agent memory
- **Select**: Choose which tools to invoke based on task
- **Isolate**: Separate context for each tool call prevents pollution
- **Compress**: Summarize verbose tool responses

## Example Tool Sequence

**User Request**: "Find recent issues in repo X and create Slack thread"

1. **GitHub Tool** (via Composio)
   - Search issues with label "bug"
   - Filter by last 7 days
   - Return: 5 issues with details

2. **Compression**
   - Summarize each issue to 2-3 sentences
   - Extract key information (title, status, assignee)

3. **Slack Tool** (via Composio)
   - Create message with formatted issue list
   - Post to #engineering channel
   - Add thread with individual issue details

4. **Confirmation**
   - Return Slack message URL
   - Confirm completion to user

## Observability Metrics

Track in [[langfuse]]:
- Tool call success/failure rates
- Latency per tool
- Token usage per tool output
- Cost per tool invocation
- Context window utilization after each tool call

---

## Changelog

- **2025-10-03**: Initial example created with agent workflow and tool patterns
