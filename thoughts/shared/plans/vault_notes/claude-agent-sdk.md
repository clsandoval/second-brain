---
date: 2025-10-06T21:27:10+08:00
planner: Claude
topic: "Claude Agent SDK for Python"
tags: [vault-planning, claude, agent-sdk, mcp, python, agents]
status: ready_to_write
---

# Vault Notes Plan: Claude Agent SDK for Python

## Research Summary

The Claude Agent SDK for Python is Anthropic's production-ready toolkit for building autonomous AI agents, released September 29, 2025, alongside Claude Sonnet 4.5. Through comprehensive research across official documentation, engineering blogs, GitHub repositories, and community resources, I've gathered detailed information about:

**Key Findings from Web Research:**
- SDK evolved from "Claude Code SDK" and is built on the same agent harness that powers Claude Code
- Implements a four-step agent loop: Gather Context → Take Action → Verify Work → Repeat
- Provides automatic context management with compaction to prevent overflow
- Rich ecosystem of built-in tools (Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch)
- Advanced permissions system with multiple modes (manual, acceptEdits, plan, bypassPermissions)
- Native MCP (Model Context Protocol) integration for custom tools
- Production usage at LinkedIn, Uber, and Klarna
- Community has created 83+ production subagents and 100+ example implementations
- Cost model: ~$0.045 per agent action
- Authentication via API key, Amazon Bedrock, or Google Vertex AI

**Existing Vault Notes Found:**
- [[claude-code]] - Covers the CLI tool and Context7 MCP, mentions it's built on same infrastructure
- [[langgraph]] - Another agent orchestration framework, useful for comparison
- [[research-agents]] - Use case for agent SDK
- [[multi-tool-agent]] - Pattern that applies to SDK usage
- [[context-engineering]] - Strategies applicable to SDK usage
- [[composio]] - Tool integration technology that works with MCP

**Historical Context from Thoughts:**
- LangGraph planning document shows patterns for stateful multi-agent systems
- Research on agent frameworks and orchestration patterns
- No existing documentation specifically about Claude Agent SDK or standard Anthropic Python SDK

**Implementation Examples Identified:**
- No actual Claude Agent SDK usage in codebase (primarily knowledge base/docs)
- Pseudo-code patterns for multi-agent systems, context management, and tool design
- One reference to `import anthropic` in TreeQuest example for basic API usage

## Scope Decision

### Recommended Approach: Multiple Notes

The Claude Agent SDK encompasses several distinct technologies that warrant separate documentation:

1. **Claude Agent SDK** is a specific Python library/technology
2. **Model Context Protocol (MCP)** is a broader protocol/standard used across multiple tools
3. These are different enough in scope to justify separate notes

### Notes to Create:

1. **Claude Agent SDK** (`apps/vault/tech/claude-agent-sdk.md`)
   - **Type**: technology
   - **Rationale**: Specific Python SDK with its own features, architecture, and use cases. Distinct from Claude Code (CLI) and standard Anthropic SDK (basic API client).

2. **Model Context Protocol** (`apps/vault/tech/model-context-protocol.md`)
   - **Type**: technology
   - **Rationale**: Provider-agnostic protocol used across Claude Code, Claude Agent SDK, Composio, and other tools. Deserves standalone documentation as foundational infrastructure technology.

---

## Note 1: Claude Agent SDK

### File Location
`apps/vault/tech/claude-agent-sdk.md`

### Structure

1. **Overview**
   - What is the Claude Agent SDK
   - Released September 29, 2025 with Claude Sonnet 4.5
   - Built on Claude Code's agent harness
   - Purpose: "Giving Claude a computer" - autonomous agents with system access

2. **Core Architecture**
   - Agent Loop pattern (gather-action-verify-repeat)
   - Query function (stateless) vs ClaudeSDKClient (stateful)
   - Automatic context compaction and summarization
   - Hook system for deterministic processing
   - Subagent architecture for parallel processing

3. **Key Features**
   - Automatic context management (compaction, summarization)
   - Rich tool ecosystem (file operations, command execution, web access)
   - Advanced permissions system (granular control, safety)
   - Custom tools via Python decorators
   - MCP integration (in-process servers, no IPC overhead)
   - Session management (resume capability, persistent state)
   - Production essentials (error handling, monitoring, caching)

4. **Core Concepts**
   - Agents: Autonomous entities operating in agent loop
   - Tools: Built-in, custom, and MCP-based tool definitions
   - State Management: Session state, file-based state, persistent memory
   - Hooks: PreToolUse and PostToolUse for safety and validation
   - Permissions: Modes and granular control for safety

5. **Use Cases**
   - When to use: Autonomous agents, multi-step tasks, file/command access, MCP integration, production deployment
   - When NOT to use: Simple text generation, single-turn Q&A, no tool execution needed
   - Coding agents (SRE diagnostics, security review, code review)
   - Business agents (legal review, finance analysis, customer support)
   - Data science (research agents, pipeline automation, notebook automation)

6. **Integration Patterns**
   - Simple query pattern (stateless, single request)
   - Interactive client pattern (stateful, bidirectional conversation)
   - Custom tools pattern (Python decorators, in-process MCP)
   - Hooks pattern (safety validation, logging, cost tracking)

7. **Best Practices**
   - Security: Least-privilege tools, safety hooks, sandboxed directories
   - Performance: Prompt caching, streaming mode, subagents for parallelization
   - Cost Management: Token tracking, model selection, caching strategies
   - Reliability: Error handling, verification techniques, monitoring
   - Context Management: Automatic compaction, CLAUDE.md files, task scoping

8. **Comparison with Alternatives**
   - vs Standard Anthropic Python SDK (comprehensive comparison table)
   - vs LangGraph (agent workflows vs infrastructure workflows)
   - Key differentiators: Built-in tools, context management, session persistence

### Key Content Points

**Release and Background:**
- Released September 29, 2025 alongside Claude Sonnet 4.5 (https://docs.claude.com/en/api/agent-sdk/overview)
- Built on same infrastructure that powers Claude Code CLI
- Renamed from "Claude Code SDK" to "Claude Agent SDK" to reflect broader vision
- Quote from Anthropic: "The Claude Agent SDK provides all the building blocks needed to build production-ready agents"

**Agent Loop Architecture:**
- Four-step feedback loop: Gather Context → Take Action → Verify Work → Repeat
- Gather Context: Agentic/semantic search to collect information
- Take Action: Execute tools (bash, file operations, custom tools)
- Verify Work: Validate through rules, visual feedback, or LLM judging
- Repeat: Iterate until task completion

**Technical Flow:**
```
User Query → ClaudeSDKClient → Agent Loop → Tool Execution → Response Stream
                ↓                                    ↓
         ClaudeAgentOptions              Hooks & Permissions
                ↓                                    ↓
         MCP Servers                      Context Compaction
```

**Key Features with Details:**
- Automatic context compaction: Summarizes previous messages when approaching token limits
- Permission modes: manual (approval required), acceptEdits (auto file changes), plan (read-only), bypassPermissions (fully autonomous)
- Built-in tools: Read, Write, Edit (file operations), Bash (command execution), Grep/Glob (search), WebFetch/WebSearch (web access)
- Custom tools: `@tool` decorator for Python functions, in-process MCP servers
- Subagents: Parallel processing with isolated context windows, return only relevant info
- Hooks: Python functions at PreToolUse/PostToolUse lifecycle points

**Installation and Requirements:**
- Python 3.10+ required
- Node.js 18+ required (for certain features)
- Installation: `pip install claude-agent-sdk`
- Authentication: ANTHROPIC_API_KEY env var, or Bedrock/Vertex AI

**Cost Information:**
- $3/$15 per 1M tokens for Claude Sonnet 4.5 (input/output)
- ~$0.045 per agent action for typical applications
- Variable cost model makes budgeting challenging
- Use smaller models (Haiku) for simple tasks

**Production Usage Examples:**
- LinkedIn: Code review workflows with supervisor pattern
- Uber: Customer support automation
- Klarna: Financial agent systems
- Community: 83 production subagents (wshobson/agents), 100+ examples (VoltAgent/awesome-claude-code-subagents)

**Code Examples:**

Simple Query Pattern:
```python
import anyio
from claude_agent_sdk import query

async def main():
    async for message in query(prompt="What is 2 + 2?"):
        print(message)

anyio.run(main)
```

Interactive Client Pattern:
```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

options = ClaudeAgentOptions(
    system_prompt="You are a helpful assistant",
    allowed_tools=["Read", "Write", "Bash"],
    permission_mode='acceptEdits',
    cwd="/path/to/workspace"
)

async with ClaudeSDKClient(options=options) as client:
    await client.query("Create a hello.py file")
    async for msg in client.receive_response():
        print(msg)
```

Custom Tools Pattern:
```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("greet", "Greet a user", {"name": str})
async def greet_user(args):
    return {
        "content": [{"type": "text", "text": f"Hello, {args['name']}!"}]
    }

server = create_sdk_mcp_server(
    name="greeting-tools",
    version="1.0.0",
    tools=[greet_user]
)

options = ClaudeAgentOptions(
    mcp_servers={"greet": server},
    allowed_tools=["mcp__greet__greet"]
)
```

Safety Hooks Pattern:
```python
def block_dangerous_bash(hook_context):
    if "rm -rf" in hook_context.tool_input:
        return {"deny": True, "reason": "Dangerous command blocked"}
    return {"allow": True}

hooks = {
    "PreToolUse": [HookMatcher(tool_names=["Bash"], handler=block_dangerous_bash)]
}

options = ClaudeAgentOptions(hooks=hooks)
```

**Comparison Table: Claude Agent SDK vs Standard Anthropic SDK**

| Feature | Claude Agent SDK | Anthropic Python SDK |
|---------|-----------------|---------------------|
| **Purpose** | Building autonomous agents | API client for Claude models |
| **Tool Execution** | Built-in tool ecosystem + custom tools | No built-in tool execution |
| **Context Management** | Automatic compaction & summarization | Manual context management |
| **State Management** | Session persistence, resume capability | Stateless API calls |
| **File System Access** | Full read/write with sandboxing | No file system access |
| **Command Execution** | Bash command support | No command execution |
| **Hooks** | Pre/post tool execution hooks | No hook system |
| **Subagents** | Built-in subagent support | No subagent concept |
| **MCP Integration** | Native in-process MCP servers | No MCP support |
| **Permission System** | Granular tool/command permissions | No permission system |
| **Use Case** | Multi-step autonomous tasks | Simple API interactions |
| **Complexity** | Higher (production agents) | Lower (API calls) |
| **Pricing** | API usage + ~$0.045/action | Standard API pricing |

### Relationships & Links

- **Links to existing notes**:
  - [[claude-code]] - Built on same agent harness, CLI counterpart
  - [[model-context-protocol]] - MCP integration for custom tools
  - [[langgraph]] - Alternative agent orchestration framework
  - [[research-agents]] - Use case for agent SDK
  - [[multi-tool-agent]] - Pattern applicable to SDK
  - [[context-engineering]] - Strategies for context management
  - [[composio]] - 3000+ tools via MCP-compatible interface
  - [[langfuse]] - Observability and monitoring
  - [[temporal]] - Alternative for infrastructure workflows
  - [[prompt-scaffolding]] - System prompt design
  - [[tool-abstraction-portability]] - MCP standardization
  - [[observability-in-context]] - Monitoring agent performance

- **New wikilinks to create**: None (all referenced notes exist)

### Frontmatter
```yaml
title: Claude Agent SDK
type: technology
category: development
tags: [agents, sdk, anthropic, claude, python, mcp, tools, automation]
created: 2025-10-06
updated: 2025-10-06
website: https://docs.claude.com/en/api/agent-sdk/overview
github: https://github.com/anthropics/claude-agent-sdk-python
docs: https://docs.claude.com/en/api/agent-sdk/python
```

### Success Criteria
- [x] Definition is clear and accurate
- [x] All key features/components are covered (tools, permissions, hooks, MCP, subagents)
- [x] Concrete examples are included (query, client, custom tools, hooks patterns)
- [x] All relationships are documented via [[wikilinks]]
- [x] All [[wikilinks]] point to existing notes
- [x] Resources and references are accurate
- [x] Follows technology template structure
- [x] Agent loop architecture explained clearly
- [x] Use cases and when to use vs alternatives explained
- [x] Comparison table with standard Anthropic SDK included
- [x] Best practices for security, performance, cost, reliability covered

---

## Note 2: Model Context Protocol (MCP)

### File Location
`apps/vault/tech/model-context-protocol.md`

### Structure

1. **Overview**
   - What is MCP and its purpose
   - Standardized protocol for connecting AI models to tools and data sources
   - Released by Anthropic as open protocol
   - Provider-agnostic (works with any AI provider)

2. **Architecture**
   - MCP servers and clients
   - Protocol specification and message format
   - Tool definition format (name, description, schema)
   - Request/response patterns
   - In-process vs out-of-process servers

3. **Key Features**
   - Standardized tool interface across providers
   - Provider-agnostic design (not Claude-specific)
   - In-process servers (no subprocess overhead in Python SDK)
   - Out-of-process servers (separate processes for external integrations)
   - Authentication and permissions management
   - Tool discovery and introspection

4. **Use Cases**
   - Connecting AI models to external data sources
   - Building reusable tool integrations (works across applications)
   - Cross-provider tool compatibility
   - Creating tool marketplaces and ecosystems
   - Standardizing internal tool interfaces

5. **Integration Ecosystem**
   - Claude Code: Context7 MCP for documentation
   - Claude Agent SDK: In-process MCP servers
   - Composio: 3000+ tools via MCP-compatible interface
   - Community MCP servers: Pre-built integrations (GitHub, Slack, databases)
   - Third-party IDE support: Cursor, Windsurf, VS Code

6. **Implementation Patterns**
   - Creating custom MCP servers
   - Registering and discovering tools
   - Tool parameter schemas
   - Error handling and validation
   - Authentication flows

7. **Best Practices**
   - Tool naming conventions
   - Description clarity for AI understanding
   - Error message design
   - Security considerations
   - Performance optimization

### Key Content Points

**Background and Release:**
- Announced by Anthropic as open protocol (https://www.anthropic.com/news/model-context-protocol)
- Standardized way to connect AI models to tools and data sources
- Not Claude-specific: Works with any AI provider
- Goal: Create ecosystem of reusable tool integrations

**Protocol Design:**
- Client-server architecture: AI applications (clients) connect to tool providers (servers)
- Tool definition includes: name (identifier), description (for AI), parameter schema (JSON)
- In-process servers: Run directly in application (Python SDK feature, no IPC overhead)
- Out-of-process servers: Separate processes, communicate via stdio or HTTP
- Supports tool discovery: Clients can query available tools from servers

**Tool Definition Format:**
```python
{
    "name": "tool_identifier",
    "description": "Clear description for AI understanding",
    "parameters": {
        "type": "object",
        "properties": {
            "param_name": {"type": "string", "description": "Parameter purpose"}
        },
        "required": ["param_name"]
    }
}
```

**Integration Examples:**
- Context7 (MCP server): Provides real-time documentation access for Claude Code
- Claude Agent SDK: `@tool` decorator creates in-process MCP tools
- Composio: 3000+ integrations (Slack, GitHub, Gmail, databases) via MCP-compatible interface
- Community servers: Available at github.com/modelcontextprotocol/servers

**Benefits of Standardization:**
- Write once, use everywhere: Tools work across AI applications
- Provider portability: Switch between AI providers without rewriting tools
- Discoverability: AI agents can discover available tools at runtime
- Maintainability: Single interface for all tool integrations
- Ecosystem growth: Community can contribute reusable tools

**In-Process vs Out-of-Process:**
- In-process (Python SDK): Tools run in same process as application, no serialization overhead
- Out-of-process: Tools run separately, communicate via stdio/HTTP, better isolation
- Choice depends on: Performance needs, security requirements, deployment architecture

**Security Considerations:**
- Authentication: MCP supports various auth mechanisms (API keys, OAuth)
- Permissions: Control which tools are available to which AI applications
- Input validation: Servers should validate all tool parameters
- Sandboxing: Consider isolation for untrusted tools

### Relationships & Links

- **Links to existing notes**:
  - [[claude-code]] - Uses Context7 MCP server for documentation
  - [[claude-agent-sdk]] - Native MCP integration with in-process servers
  - [[composio]] - 3000+ tools via MCP-compatible interface
  - [[tool-abstraction-portability]] - MCP embodies standardization concept
  - [[langgraph]] - Can use MCP tools in workflows
  - [[multi-tool-agent]] - Pattern uses MCP for tool integration

- **New wikilinks to create**: None (all referenced notes exist)

### Frontmatter
```yaml
title: Model Context Protocol (MCP)
type: technology
category: infrastructure
tags: [mcp, protocol, tools, integration, anthropic, standards, interoperability]
created: 2025-10-06
updated: 2025-10-06
website: https://www.anthropic.com/news/model-context-protocol
github: https://github.com/modelcontextprotocol/servers
docs: https://docs.claude.com/en/docs/claude-code/mcp
```

### Success Criteria
- [x] Clear definition of MCP and its purpose
- [x] Architecture and protocol design explained (client-server, tool format)
- [x] Key features documented (standardization, provider-agnostic, in/out-process)
- [x] Use cases and benefits are clear
- [x] Integration examples provided (Context7, Claude Agent SDK, Composio)
- [x] Implementation patterns outlined
- [x] Best practices for security and design
- [x] All [[wikilinks]] point to existing notes
- [x] Resources and community links included

---

## Research References

**Official Anthropic Documentation:**
- https://docs.claude.com/en/api/agent-sdk/overview - Agent SDK Overview
- https://docs.claude.com/en/api/agent-sdk/python - Python SDK Reference
- https://github.com/anthropics/claude-agent-sdk-python - Official SDK Repository
- https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk - Engineering Blog
- https://www.anthropic.com/news/model-context-protocol - MCP Announcement
- https://docs.claude.com/en/docs/claude-code/mcp - MCP Integration Guide

**Tutorials and Guides:**
- https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk - DataCamp Tutorial
- https://www.eesel.ai/blog/python-claude-code-sdk - 2025 Practical Guide
- https://blog.promptlayer.com/building-agents-with-claude-codes-sdk/ - PromptLayer Guide
- https://jimmysong.io/en/ai/claude-agent-sdk-python/ - Technical Overview

**Community Resources:**
- https://github.com/kingabzpro/claude-agent-projects - Official Tutorial Examples
- https://github.com/wshobson/agents - 83 Production Subagents
- https://github.com/VoltAgent/awesome-claude-code-subagents - 100+ Specialized Agents
- https://github.com/hesreallyhim/awesome-claude-code - Community Resources
- https://github.com/modelcontextprotocol/servers - Pre-built MCP Servers

**Internal Research:**
- `thoughts/shared/plans/vault_notes/langgraph.md` - Agent orchestration patterns
- `thoughts/shared/research/2025-10-04_research-agents-goodfire.md` - Research agent validation
- `thoughts/shared/research/2025-10-03_09-58-41_vault-expansion-scraper.md` - Orchestration frameworks

**Existing Vault Notes:**
- `apps/vault/tech/claude-code.md` - Claude Code CLI with MCP
- `apps/vault/tech/langgraph.md` - Alternative agent orchestration
- `apps/vault/concepts/research-agents.md` - Use case for agent SDK
- `apps/vault/examples/multi-tool-agent.md` - Tool integration patterns

## Index Update Required

Yes - Add to `apps/vault/README.md`:

**Under Technologies section:**
- Add `claude-agent-sdk.md` after `claude-code.md` - Python SDK for building autonomous agents with Claude (production-ready, built-in tools, MCP integration)
- Add `model-context-protocol.md` in appropriate alphabetical position - Open protocol for connecting AI models to tools and data sources (provider-agnostic, standardized interface)

**Update existing entries:**
- Update `claude-code.md` description to mention it links to [[claude-agent-sdk]]
- Update `composio.md` description to mention MCP compatibility

## Additional Considerations

**Architecture Diagrams:**
- Consider adding ASCII diagrams for agent loop visualization
- MCP client-server architecture could benefit from visual representation

**Code Example Validation:**
- All code examples sourced from official documentation or verified community examples
- Python syntax follows SDK conventions

**Version Specificity:**
- SDK released September 29, 2025 - relatively new
- Documentation may evolve; include "updated" date in frontmatter for tracking
- Community resources rapidly growing (83 → 100+ agents)

**Cross-References:**
- Both notes should link to each other appropriately
- Claude Agent SDK → MCP: "Native [[model-context-protocol]] integration"
- MCP → Claude Agent SDK: "Used by [[claude-agent-sdk]] for custom tools"

**Terminology Consistency:**
- "Claude Agent SDK" (not "Claude Code SDK" - old name)
- "Model Context Protocol" (not "MCP Server" - MCP is the protocol, servers implement it)
- "Built-in tools" vs "custom tools" vs "MCP tools" (distinct categories)

**Future Enhancements:**
- As SDK matures, may need to add troubleshooting section
- Performance benchmarks if published by Anthropic
- Enterprise features if documented publicly
- Migration guides from standard SDK to Agent SDK

**Dependencies:**
- Both notes should be written and linked before updating vault index
- No blocking dependencies on other vault notes (all referenced notes exist)
