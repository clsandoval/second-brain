---
title: Letta
type: technology
category: orchestration
tags: [agents, memory, stateful, memgpt, rag, orchestration]
created: 2025-10-04
updated: 2025-10-04
website: https://www.letta.com/
github: https://github.com/letta-ai/letta
---

# Letta

## Overview

Letta is a platform for building **stateful AI agents** with persistent memory that can learn and self-improve over time. Founded by UC Berkeley PhD researchers Charles Packer and Sarah Wooders, Letta addresses a fundamental limitation of LLMs: their inability to form new memories or learn from experience beyond their training weights. Unlike traditional agent frameworks that are stateless libraries wrapping model APIs, Letta provides **agents as a service** with built-in persistence, autonomous operation, and sophisticated memory management.

Letta emerged from the influential **MemGPT research project**, which introduced the concept of treating LLMs as "operating systems" with hierarchical memory management, fundamentally changing how AI agents interact with context and learn from experience.

## Key Features

### Memory Hierarchy
- **Self-editing memory** split between in-context and out-of-context tiers
- **Memory Blocks**: Persistent editable units that agents control using tools
- **Core Memory** (In-Context):
  - Fast, always-accessible memory
  - Agent persona details and user information
  - Custom memory block support
- **External Memory** (Out-of-Context):
  - Conversation history storage
  - Vector databases for semantic search (Chroma, pgvector)
  - Document/file storage with retrieval
- **Agentic Memory Management**: Agents autonomously control their own memory through tool calling, enabling them to overcome limited context sizes

### Agentic RAG
Letta implements a sophisticated approach to retrieval that goes beyond traditional [[retrieval-augmented-generation]]:
- **Multi-step reasoning**: Iteratively processes information in segments, summarizes progressively
- **Proactive memory management**: Distills and organizes past data, enables contextual relations
- **Dynamic information traversal**: Maintains state across interactions, continuously refines understanding
- **Self-editing memory**: Uses techniques beyond RAG like recursive summarization

### Sleep-Time Agents
A unique innovation distinguishing Letta from other frameworks:
- **Background agents** that share memory with primary agents but run during idle time
- Can modify memory asynchronously while primary agent is "sleeping"
- **Persistent sleep-time agents**: Generate learned context from conversation history
- **Ephemeral sleep-time agents**: Process data sources in background, auto-delete after completion
- Enables agents to "think" during downtime and form new connections

### Technical Capabilities
- **Model-agnostic design**: Works with OpenAI GPT, Anthropic Claude, or local models
- **Persistent state**: All state automatically backed by databases (messages, agent state, memory blocks)
- **Multi-language SDKs**: Python and TypeScript/Node.js support
- **Framework integrations**: Next.js, React, Flask
- **Streaming support**: Real-time agent responses
- **Multi-agent and multi-user**: Built-in support for agent collaboration
- **Model Context Protocol (MCP)**: Connects to external tools through standardized protocol
- **Custom tools**: Build tools in Letta's tool sandbox or connect via MCP
- **Agent File (.af) format**: Open file format for serializing, sharing, and version controlling agents

### Platform Components
- **Agent Development Environment (ADE)**: Visual development interface with complete visibility into agent memory, context window, and decision-making
- **REST APIs**: Agents as a service with programmatic access
- **Deployment options**: Letta Cloud (hosted), Letta Desktop (local), or self-hosted

## Architecture/How It Works

### MemGPT Foundation: Virtual Context Management

Based on the academic paper **"MemGPT: Towards LLMs as Operating Systems"** (UC Berkeley, October 2023), Letta implements virtual context management inspired by traditional operating systems' hierarchical memory systems.

**Core Innovation**:
- Implements two-tier memory hierarchy inspired by OS virtual memory
- Dynamically moves data in and out of LLM context window
- Uses "heartbeats" to enable multi-step reasoning
- Agents use tools to search previous messages, write memories, edit their own context window, and perform recursive summarization

### State Management Architecture

**Context Window Compilation**:
- Each LLM call "compiles" the agent's state into the context window
- Letta automatically determines what data to include in each request
- No notion of "serialization" - state is always persisted in databases
- Agents continue to exist and maintain state even when applications aren't running

**Memory Block System**:
- Core memory split into agent persona and user information
- Default archival memory backed by vector databases
- Agents actively manage what to remember vs. forget
- Self-editing capabilities enable continuous learning

**Multi-Agent Architecture**:
- Supports both centralized (supervisor) and distributed agent communication
- Agents can directly call each other
- Shared memory blocks enable state sharing across agents
- Sleep-time agents are technically multi-agent groups with shared memory

## MemGPT Research Foundation

Letta is the commercial productization of the MemGPT research, with "MemGPT" now referring to the agent design pattern.

**Key Research Contributions**:
- Addresses LLM context window limitations through intelligent management of memory tiers
- Uses "interrupts to manage control flow" between system and user
- Demonstrates significant improvements in:
  - **Document Analysis**: Analyzing large documents exceeding standard context windows
  - **Multi-Session Chat**: Creating conversational agents that remember, reflect, and evolve dynamically

**Academic Backing**: Built by UC Berkeley's Sky Computing Lab with advisors Joseph Gonzalez and Ion Stoica

## Agentic RAG vs Traditional RAG

### Problems with Traditional RAG
1. **Single-Step Limitation**: Provides only "one shot" at retrieving and generating
2. **Reactive Nature**: Purely reactive semantic search, cannot capture nuanced personal context
3. **Context Pollution**: Often places irrelevant data into context window, degrading performance
4. **Lack of Personalization**: Cannot proactively use past information or understand user preferences

### Letta's Agentic RAG Solution
1. **Multi-Step Reasoning**: Iteratively processes information by reading segments, summarizing, and updating understanding progressively
2. **Proactive Memory**: Distills important past data, enables contextual relation (e.g., remembering user likes Star Wars and suggesting Star Wars-themed party)
3. **Dynamic Traversal**: Maintains state across interactions, continuously refines understanding
4. **Self-Editing**: Uses recursive summarization and active memory management

As described in Letta's research: "Agentic RAG's iterative methodology updates results each time it retrieves and reviews more information, generating a more holistic and accurate response than if it retrieved information and generating responses only once."

## Use Cases in Context Engineering

### Personalized Chatbots & Companions
- Long-term memory across sessions
- Self-editing personas that evolve over time
- Continuous learning from interactions
- Example: Agent remembers user preferences and proactively applies them

### Enterprise Data-Connected Agents
- Private ChatGPT-like applications connected to company data
- Medical assistants connected to patient records
- Domain-specific knowledge agents with persistent learning
- Case study: Hunt Club automated knowledge-intensive executive recruitment with agent "Hunter"

### Tool-Enabled Chatbots
- Agents with web search capabilities
- Integration with external APIs and services via MCP
- Custom tool execution with memory of past tool usage
- Case study: 11x built Deep Research agent in 72 hours

### Automated AI Workflows
- Email monitoring with intelligent alerts
- Automated summarization and reporting with context retention
- Background task automation using sleep-time agents
- Case study: Bilt built intelligent recommendation system serving personalized recommendations at scale

## Context Engineering Strategies

Letta implements all four [[context-engineering]] strategies:

1. **Write**: Memory blocks persist information across agent tasks, conversation history stored outside context window
2. **Select**: Agentic RAG for choosing relevant information through multi-step reasoning and semantic search
3. **Compress**: Recursive summarization of conversation history, intelligent context window management
4. **Isolate**: Multi-agent architecture with separate memory spaces, sleep-time agents for background processing

## Positioning in AI/LLM Ecosystem

### vs. LangGraph ([[langgraph]])
- **LangGraph**: Library for building stateful workflows, requires manual state management
- **Letta**: Dedicated service where agents live autonomously with automatic persistence
- **LangGraph**: Good for fine-grained workflow control within applications
- **Letta**: Focus on stateful agents with built-in memory management as persistent services

### vs. AutoGPT
- **AutoGPT**: Autonomous agents with minimal guidance, continuous cloud deployment
- **Letta**: Emphasizes memory and learning over time, not just autonomy
- **AutoGPT**: Low-code interface for rapid experimentation
- **Letta**: Developer-focused with visual ADE and SDKs

### Unique Positioning
- **"Agents as a Service"**: Treats agents as persistent services accessible via REST APIs
- **White-box control**: Complete visibility and control over memory and state
- **Research-backed**: Built on peer-reviewed academic research (MemGPT paper)
- **Open-source first**: Open-source model eliminates licensing fees, allows self-hosting

## Related Technologies

- **[[langgraph]]**: Alternative graph-based agent orchestration (library approach vs. service approach)
- **[[composio]]**: Complementary tool integration with 250+ pre-built tools, can be used alongside Letta's MCP support
- **[[context-engineering]]**: Letta implements all four core strategies (Write, Select, Compress, Isolate)
- **[[retrieval-augmented-generation]]**: Letta extends traditional RAG with agentic memory and multi-step reasoning
- **[[research-agents]]**: Shares philosophy of stateful execution environments and persistent learning
- **[[multi-tool-agent]]**: Similar MCP integration pattern for standardized tool access
- **[[claude-code]]**: Example of MCP-enabled development tool that could integrate with Letta agents

## Getting Started

### Installation
```bash
# Python
pip install letta-client

# TypeScript/Node.js
npm install @letta-ai/letta-client
```

### Quickstart Options
1. **Developer Quickstart**: Using APIs and SDKs (Python/TypeScript)
2. **ADE Quickstart**: Low-code UI for visual agent creation
3. **Letta Desktop**: Local installation for MacOS, Windows, Linux

### Deployment
- **Letta Cloud**: Fully managed cloud hosting
- **Self-hosted**: Docker deployment with full control
- **Letta Desktop**: Local development environment

### MCP Integration
- Open protocol for connecting to external data sources and tools
- Three transport types: Streamable HTTP (production), SSE (legacy), stdio (local dev)
- Point-and-click server management via ADE
- Programmatic integration via API/SDK
- **Security note**: Only connect to trusted MCP servers

## Company Background

**Founded by**: Charles Packer and Sarah Wooders (UC Berkeley PhD students, Sky Computing Lab)

**Funding**: $10M seed round led by Felicis (September 2024, $70M post-money valuation)

**Notable Angel Investors**: Jeff Dean (Google DeepMind), Clem Delangue (HuggingFace), Cristobal Valenzuela (Runway), Jordan Tigani (MotherDuck), Tristan Handy (dbt Labs), Robert Nishihara (Anyscale), Barry McCardel (Hex)

**Timeline**: MemGPT research paper (October 2023) → Emerged from stealth (September 2024) → Active development

## Resources

### Official Documentation
- Main documentation: https://docs.letta.com/
- Developer quickstart: https://docs.letta.com/quickstart
- MemGPT concepts: https://docs.letta.com/concepts/memgpt
- Agent memory guide: https://docs.letta.com/guides/agents/memory
- MCP integration: https://docs.letta.com/guides/mcp/overview
- Sleep-time agents: https://docs.letta.com/guides/agents/sleep-time-agents

### Research & Technical
- MemGPT paper (arXiv): https://arxiv.org/abs/2310.08560
- GitHub repository: https://github.com/letta-ai/letta
- Agent File format: https://github.com/letta-ai/agent-file

### Blog Posts
- Stateful agents: https://www.letta.com/blog/stateful-agents
- Agent memory: https://www.letta.com/blog/agent-memory
- RAG vs agent memory: https://www.letta.com/blog/rag-vs-agent-memory
- Sleep-time compute: https://www.letta.com/blog/sleep-time-compute
- AI agents stack: https://www.letta.com/blog/ai-agents-stack

### Community & Learning
- DeepLearning.AI course: "LLMs as Operating Systems: Agent Memory" - https://www.deeplearning.ai/short-courses/llms-as-operating-systems-agent-memory/
- Case studies: https://www.letta.com/case-studies

---

## Changelog

- **2025-10-04**: Initial note created with comprehensive coverage of Letta platform, MemGPT foundation, agentic RAG, sleep-time agents, and ecosystem positioning
