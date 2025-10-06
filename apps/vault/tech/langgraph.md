---
title: LangGraph
type: technology
category: orchestration
tags: [agents, orchestration, workflows, langgraph, langchain, state-management, multi-agent]
created: 2025-10-06
updated: 2025-10-06
website: https://www.langchain.com/langgraph
github: https://github.com/langchain-ai/langgraph
docs: https://langchain-ai.github.io/langgraph/
---

# LangGraph

LangGraph is a low-level orchestration framework for building stateful, multi-agent AI systems with graph-based workflows. Built by the LangChain team, it provides explicit state management and control flow for production-grade agent applications.

## Overview

LangGraph is designed for applications requiring complex agent orchestration with durable execution. Unlike LangChain's higher-level abstractions, LangGraph gives developers fine-grained control over state transitions, conditional routing, and multi-agent coordination through directed graph workflows.

**When to use LangGraph:**
- Complex multi-agent systems with explicit coordination needs
- Long-running workflows requiring durability and crash recovery
- Applications needing human-in-the-loop approval gates
- Agent systems with sophisticated state management requirements

**When to consider alternatives:**
- Simple linear chains → use [[tech/langchain|LangChain]]
- Infrastructure workflows → use [[tech/temporal|Temporal]]
- Quick prototyping → use CrewAI or AutoGen

Production adoption includes LinkedIn (code review workflows), Uber (customer support automation), and Klarna (financial agent systems).

## Core Architecture

LangGraph models agent workflows as directed graphs with four key components:

**Graphs**
The top-level container representing the entire workflow. `StateGraph` is the primary graph type for stateful applications. Graphs define how information flows between operations.

**Nodes**
Individual functions or operations within the graph. Each node receives the current state, performs its operation (LLM call, tool execution, retrieval, human input), and returns state updates.

**Edges**
Connections between nodes that determine execution flow. Can be:
- **Fixed edges**: Always transition to the next node
- **Conditional edges**: Route based on state values (enabling loops, branches, dynamic paths)

**State**
A shared state object (TypedDict or Pydantic model) that flows through the graph. Each node reads from and writes to this state. State is the mechanism for passing information between agents and maintaining conversation context.

**Checkpointing**
Automatic persistence of state at each node execution. Enables crash recovery, resumability, and time-travel debugging. Checkpoints can be stored in memory, SQLite, PostgreSQL, or custom backends.

## Key Features

**Durable Execution**
Automatic checkpointing persists state at every step. If a workflow crashes, it resumes from the last checkpoint without losing progress. Critical for production systems handling long-running agent tasks.

**Human-in-the-Loop**
Built-in support for approval gates and feedback loops:
- `.interrupt()` pauses execution for human approval
- `.update_state()` allows humans to modify agent decisions
- Essential for preventing autonomous errors in production

**Memory Management**
- **Short-term**: Conversation state maintained in graph state
- **Long-term**: Integration with vector stores for persistent knowledge
- State can include conversation history, tool results, and custom data structures

**Multi-Agent Support**
Native support for coordinating multiple agents with different architectures (network, supervisor, hierarchical). Each agent can have separate context, tools, and prompts while sharing state through the graph.

**Streaming**
Real-time token streaming, progress updates, and intermediate results. Users see agent thinking and tool execution as it happens, improving perceived latency.

**Time-Travel Debugging**
Replay execution from any checkpoint to debug issues. Visualize graph structure and trace execution paths. Invaluable for understanding complex agent behavior.

**Observability Hooks**
Built-in integration points for tracing, logging, and monitoring. Works seamlessly with [[tech/langfuse|Langfuse]] for production observability.

## Multi-Agent Architectures

**Network Pattern**
Agents communicate peer-to-peer without central coordination. Each agent can invoke others directly based on its own reasoning.

*When to use:* Collaborative tasks with equal peers (co-writing, brainstorming, research where multiple perspectives are valuable)

*Production example:* Research teams where domain experts collaborate on hypothesis generation

**Supervisor Pattern**
Central supervisor agent routes tasks to specialist agents. The supervisor analyzes requests, delegates to appropriate specialists, and synthesizes results.

*When to use:* Task delegation with clear specialization (customer support, code review, data analysis pipelines)

*Production example:* LinkedIn uses supervisor pattern for code review workflows—supervisor routes to security, performance, and style reviewers

**Hierarchical Pattern**
Teams of teams with managers at multiple levels. Managers delegate to workers or sub-managers, creating delegation chains for complex organizational structures.

*When to use:* Complex multi-step workflows with sub-tasks requiring coordination (enterprise automation, large-scale research projects)

*Production example:* Financial analysis systems with research teams, validation teams, and reporting teams

## Use Cases in Context Engineering

LangGraph implements the "Isolate" strategy from [[concepts/context-engineering|context engineering]]—each agent maintains separate context to prevent pollution while sharing state through the graph.

**Agentic RAG Orchestration**
Coordinates [[concepts/agentic-rag-workflow|agentic RAG]] patterns with routing, retrieval, generation, and validation steps. Graph structure makes complex RAG logic explicit and debuggable.

**Research Agents**
Enables [[concepts/research-agents|research agents]] with multi-step workflows: hypothesis generation, experiment design, data collection, validation, and synthesis. Checkpointing allows research to span hours or days.

**Multi-Tool Coordination**
Orchestrates [[concepts/multi-tool-agent|multi-tool agents]] executing tools in parallel or sequence based on dependencies. Graph edges encode tool execution order and conditional logic.

**Context Management**
- State passing between agents (explicit vs implicit context sharing)
- Memory isolation (prevent cross-contamination between agent contexts)
- Long-horizon tasks (maintain context across multiple sessions)

**Production Examples**
- Multi-agent research systems (parallel literature review, synthesis, fact-checking)
- Code generation pipelines (spec → design → implementation → testing → review)
- Customer service automation (routing, resolution, escalation, feedback)

## Integration Ecosystem

**[[tech/langfuse|Langfuse]]**
Observability and tracing for LangGraph workflows. Add decorators for automatic tracking of agent decisions, token usage, and latency metrics.

**[[tech/composio|Composio]]**
Access 3000+ tools (Slack, GitHub, Gmail, databases) via function calling. Each agent can have different tool access based on its role.

**[[tech/letta|Letta]]**
Agent memory and state management for persistent memory across conversation sessions. Integrates with LangGraph state for long-term knowledge retention.

**LangChain**
Higher-level components (chains, retrievers, prompts) can be used as nodes within LangGraph workflows. Combine quick prototyping with explicit orchestration.

**LangSmith**
Evaluation and monitoring platform for A/B testing agent configurations, maintaining evaluation datasets, and tracking performance over time.

**Multi-Model Support**
Works with OpenAI, Anthropic, Google, and open-source models. Different agents can use different models based on task requirements.

## Comparison with Alternatives

**vs [[tech/temporal|Temporal]]**
- **Temporal**: Infrastructure workflows (microservices, distributed systems, ETL pipelines)
- **LangGraph**: Agent workflows (LLM orchestration, AI reasoning, human collaboration)
- Use Temporal when you need guaranteed execution across services; use LangGraph when you need AI decision-making

**vs AutoGen**
- **AutoGen**: Research-grade flexibility, rapid prototyping, academic use cases
- **LangGraph**: Production-ready reliability, explicit state management, better debugging
- AutoGen for experimentation, LangGraph for production deployment

**vs CrewAI**
- **CrewAI**: Role-based abstractions, simpler API, quick setup
- **LangGraph**: Graph-based control, flexible routing, complex orchestration
- CrewAI for straightforward role delegation, LangGraph for sophisticated control flow

**vs LangChain**
- **LangChain**: High-level chains, quick prototyping, less control
- **LangGraph**: Low-level graphs, explicit state and routing, more control
- LangChain for simple sequential logic, LangGraph for complex branching and state

## Getting Started

**Installation**
```bash
pip install -U langgraph
```

**Basic Example**
```python
from langgraph.graph import StateGraph
from typing import TypedDict

class State(TypedDict):
    message: str
    count: int

def process_node(state: State) -> State:
    return {"count": state["count"] + 1}

# Build graph
graph = StateGraph(State)
graph.add_node("process", process_node)
graph.add_edge("process", "end")
graph.set_entry_point("process")

# Compile and run
app = graph.compile()
result = app.invoke({"message": "hello", "count": 0})
```

## Resources

**Official Documentation**
- [GitHub Repository](https://github.com/langchain-ai/langgraph) - 19.4k+ stars, examples and source code
- [Documentation](https://langchain-ai.github.io/langgraph/) - Comprehensive guides and API reference
- [Product Page](https://www.langchain.com/langgraph) - Overview and use cases

**Tutorials**
- [Real Python Tutorial](https://realpython.com/langgraph-python/) - Hands-on Python guide
- [Analytics Vidhya Beginner Tutorial](https://www.analyticsvidhya.com/blog/2025/05/langgraph-tutorial-for-beginners/) - Step-by-step introduction
- Official tutorials in documentation - Multi-agent patterns and advanced features

**Blog Posts**
- "Top 5 LangGraph Agents in Production 2024" - Real-world case studies
- "Building LangGraph: Designing an Agent Runtime" - Design principles and architecture decisions
- "LangGraph Multi-Agent Workflows" - Multi-agent pattern deep dive

**Community**
- [Awesome-LangGraph](https://github.com/von-development/awesome-LangGraph) - Curated collection of resources, examples, and integrations

## See Also

- [[concepts/context-engineering|Context Engineering]] - Strategies for managing agent context
- [[concepts/retrieval-augmented-generation|Retrieval Augmented Generation]] - RAG patterns orchestrated by LangGraph
- [[concepts/research-agents|Research Agents]] - Multi-step research workflows
- [[concepts/agentic-rag-workflow|Agentic RAG Workflow]] - Graph-based RAG orchestration
- [[concepts/prompt-scaffolding|Prompt Scaffolding]] - Structured prompts for agent instructions
- [[concepts/tool-abstraction-portability|Tool Abstraction & Portability]] - Tool design for agent usage
- [[concepts/observability-in-context|Observability in Context]] - Monitoring agent performance
