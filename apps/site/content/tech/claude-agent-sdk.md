---
title: Claude Agent SDK
type: technology
category: development
tags: [agents, sdk, anthropic, claude, python, mcp, tools, automation]
created: 2025-10-06
updated: 2025-10-06
website: https://docs.claude.com/en/api/agent-sdk/overview
github: https://github.com/anthropics/claude-agent-sdk-python
docs: https://docs.claude.com/en/api/agent-sdk/python
---

# Claude Agent SDK

## Overview

The Claude Agent SDK is Anthropic's production-ready Python toolkit for building autonomous AI agents. Released September 29, 2025, alongside Claude Sonnet 4.5, it provides the building blocks for creating agents that can interact with file systems, execute code, search the web, and integrate with external systems.

Built on the same agent harness that powers [[claude-code]], the SDK evolved from the "Claude Code SDK" to reflect Anthropic's broader vision: "giving Claude a computer" - enabling AI agents to perform flexible, human-like digital work through programmatic access to system resources.

**When to use Claude Agent SDK:**
- Building autonomous agents that need file system and command execution access
- Multi-step tasks requiring iterative problem-solving
- Production deployments needing error handling, permissions, and monitoring
- Integration with external tools via [[model-context-protocol|MCP]]

**When to consider alternatives:**
- Simple text generation → use standard Anthropic Python SDK
- Complex multi-agent orchestration → use [[langgraph]]
- Infrastructure workflows → use [[temporal]]

Production adoption includes LinkedIn (code review workflows), Uber (customer support automation), and Klarna (financial agent systems).

## Core Architecture

The SDK implements a four-step agent loop that enables autonomous task completion:

```
1. Gather Context → 2. Take Action → 3. Verify Work → 4. Repeat
        ↑                                                  ↓
        └──────────────────────────────────────────────────┘
```

**Agent Loop Breakdown:**
1. **Gather Context**: Collect information via agentic search, file reading, or web research
2. **Take Action**: Execute tools (bash commands, file operations, custom tools)
3. **Verify Work**: Validate through linting, screenshot checks, or LLM judging
4. **Repeat**: Iterate until task completion or max turns reached

**Technical Flow:**
```
User Query → ClaudeSDKClient → Agent Loop → Tool Execution → Response Stream
                ↓                                    ↓
         ClaudeAgentOptions              Hooks & Permissions
                ↓                                    ↓
         MCP Servers                      Context Compaction
```

The SDK provides two primary interfaces:

**Query Function** (Stateless):
Simple async function returning `AsyncIterator` for single-turn interactions.

**ClaudeSDKClient** (Stateful):
Full-featured client for bidirectional conversations with session management and resume capability.

## Key Features

**Automatic Context Management**
- Automatic compaction summarizes previous messages when approaching token limits
- Long-run context control maintains conversation continuity during extended sessions
- SDK handles token management while developers focus on agent logic

**Rich Tool Ecosystem**
- **File Operations**: Read, Write, Edit files with sandboxed access
- **Code Execution**: Bash command execution with permission controls
- **Search Capabilities**: Grep (content search), Glob (file pattern matching)
- **Web Access**: WebFetch (retrieve pages), WebSearch (query search engines)
- **MCP Integration**: Extensible via [[model-context-protocol]] servers for custom tools

**Advanced Permissions**
- Granular control with `allowed_tools` parameter (specify exact tools agent can use)
- Multiple permission modes:
  - `manual` / `default`: Requires approval for each action
  - `acceptEdits`: Auto-accepts file modifications
  - `plan`: Read-only analysis mode (no modifications)
  - `bypassPermissions` / `acceptAll`: Fully autonomous (use with extreme caution)
- Command-level allow/deny rules for fine-grained security

**Production Essentials**
- Built-in error handling (`CLINotFoundError`, `ProcessError`)
- Session management with resume capabilities (survive crashes)
- Automatic prompt caching for cost reduction
- Monitoring and observability support via hooks

**Custom Tools & Hooks**
- Define custom tools as Python functions with `@tool` decorator
- In-process MCP servers (no subprocess overhead)
- Hooks at specific lifecycle points:
  - `PreToolUse`: Validate before tool execution (safety checks, logging)
  - `PostToolUse`: Process after tool execution (validation, transformation)
- Supports both streaming and non-streaming modes

**Subagents**
- Parallel processing with isolated context windows
- Orchestration patterns for complex tasks
- Return only relevant information to parent agent (not full context)
- Enables divide-and-conquer approaches to large problems

## Core Concepts

**Agents**
Autonomous AI entities that operate in the gather-action-verify-repeat loop. Can be general-purpose or specialized via system prompts and tool restrictions. Support hierarchical patterns with orchestrator agents managing subagents.

**Tools**
- **Built-in Tools**: Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch
- **Custom Tools**: Python functions decorated with `@tool`, include name, description, parameter schema
- **In-Process MCP**: Custom tools run directly in Python app (no IPC overhead)

Example custom tool:
```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("greet", "Greet a user", {"name": str})
async def greet_user(args):
    return {
        "content": [{"type": "text", "text": f"Hello, {args['name']}!"}]
    }
```

**State Management**
- **Session State**: Managed by ClaudeSDKClient, can be resumed after crashes
- **File-Based State**: Sandboxed working directory for agent operations
- **Persistent Memory**: CLAUDE.md files for project/user-level instructions
- **Context State**: Automatic compaction maintains conversation continuity
- **Subagent Isolation**: Each subagent has isolated context window

**Hooks**
Python functions invoked by the SDK (not by Claude) at specific lifecycle points. Provide deterministic processing and automated feedback.

Example safety hook:
```python
def block_dangerous_bash(hook_context):
    if "rm -rf" in hook_context.tool_input:
        return {"deny": True, "reason": "Dangerous command blocked"}
    return {"allow": True}

hooks = {
    "PreToolUse": [HookMatcher(tool_names=["Bash"], handler=block_dangerous_bash)]
}
```

**Permissions**
Control what agents can do:
- **Permission Modes**: manual, acceptEdits, plan, bypassPermissions
- **Granular Control**: `allowed_tools` list specifies which tools agent can use
- **Command Rules**: Allow/deny specific bash commands or file paths

## Use Cases in Context Engineering

**Coding Agents**
- **SRE Diagnostics**: Automated system health checks and log analysis
- **Security Review**: Code vulnerability scanning and compliance checking
- **Code Review**: Automated PR reviews with security/quality checks
- **Oncall Assistants**: Incident response automation with runbook execution

**Business Agents**
- **Legal Contract Review**: Document analysis and compliance checking
- **Finance Analysis**: Financial data processing and reporting with tool access
- **Customer Support**: Automated ticket resolution with system access
- **Content Creation**: Research and writing automation with web access

**Data Science & Research**
- **[[research-agents|Research Agents]]**: Web scraping, data collection, multi-step analysis
- **Data Pipeline Automation**: ETL process management and monitoring
- **Notebook Automation**: Jupyter notebook execution and result validation

**Development Workflows**
- **[[multi-tool-agent|Multi-Agent Pipelines]]**: Complex workflows with specialized agents
- **Personal Assistants**: Task automation for individual developers
- **Domain-Specific Assistants**: Specialized expertise in particular frameworks/languages

**When to Use Claude Agent SDK:**
- ✅ Need autonomous agents with computer access
- ✅ Require multi-step, iterative task completion
- ✅ Building specialized internal tools
- ✅ Need file system and command execution capabilities
- ✅ Integrating with external systems via MCP
- ✅ Production deployment with error handling and monitoring

**When NOT to Use:**
- ❌ Simple text generation (use standard Anthropic SDK)
- ❌ No need for tool execution or file access
- ❌ Single-turn Q&A applications
- ❌ Budget-constrained projects (variable API costs)
- ❌ Non-technical teams without engineering support

## Integration Patterns

**Simple Query Pattern** (Stateless):
```python
import anyio
from claude_agent_sdk import query

async def main():
    async for message in query(prompt="What is 2 + 2?"):
        print(message)

anyio.run(main)
```

**Interactive Client Pattern** (Stateful):
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

**Custom Tools Pattern**:
```python
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeAgentOptions

@tool("calculator", "Perform calculations", {"expression": str})
async def calculator(args):
    result = eval(args['expression'])  # Use safe eval in production
    return {"content": [{"type": "text", "text": str(result)}]}

server = create_sdk_mcp_server(
    name="math-tools",
    version="1.0.0",
    tools=[calculator]
)

options = ClaudeAgentOptions(
    mcp_servers={"math": server},
    allowed_tools=["mcp__math__calculator"]
)
```

**Hooks Pattern**:
```python
def usage_tracker(hook_context):
    # Track tool usage
    print(f"Tool used: {hook_context.tool_name}")
    return {"allow": True}

def output_validator(hook_context):
    # Validate tool output
    if "error" in hook_context.tool_output.lower():
        return {"retry": True}
    return {"allow": True}

options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [HookMatcher(handler=usage_tracker)],
        "PostToolUse": [HookMatcher(handler=output_validator)]
    }
)
```

## Best Practices

**Security**
- Use least-privilege `allowed_tools` per task
- Never use `bypassPermissions` in production
- Implement safety hooks for dangerous operations (rm, dd, etc.)
- Use sandboxed working directories
- Validate all tool inputs via PreToolUse hooks

**Performance**
- Enable automatic prompt caching
- Use streaming mode for interactive UX
- Leverage subagents for parallel processing
- Set appropriate `max_turns` limits to prevent runaway loops

**Cost Management**
- Track token usage via hooks
- Use smaller models (Haiku) for simple tasks
- Implement caching strategies
- Monitor per-action costs (~$0.045/action)

**Reliability**
- Implement comprehensive error handling
- Use verification techniques (linting, screenshots, LLM judging)
- Set up monitoring and logging
- Test in isolated environments first

**Context Management**
- Let automatic compaction handle long sessions
- Use CLAUDE.md for persistent instructions
- Scope tasks tightly to manage context
- Use subagents for context isolation (see [[context-engineering]])

**Deployment**
- Use environment variables for API keys
- Configure authentication (API key, Bedrock, Vertex)
- Set up observability from day one (see [[observability-in-context]])
- Implement gradual rollout

## Comparison with Alternatives

**vs Standard Anthropic Python SDK**

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

**vs [[langgraph|LangGraph]]**
- **Claude Agent SDK**: Quick setup, built-in tools, Claude-optimized
- **LangGraph**: Framework-agnostic, explicit state graphs, complex orchestration
- Use Agent SDK for Claude-specific agents with system access; use LangGraph for provider-agnostic multi-agent workflows

**vs [[temporal|Temporal]]**
- **Temporal**: Infrastructure workflows (microservices, distributed systems, ETL)
- **Claude Agent SDK**: Agent workflows (LLM reasoning, AI decision-making)
- Use Temporal when you need guaranteed execution across services; use Agent SDK when you need AI reasoning

**vs [[openai-agents-sdk|OpenAI Agents SDK]]**

| Feature | Claude Agent SDK | OpenAI Agents SDK |
|---------|-----------------|-------------------|
| **Released** | September 2025 | March 2025 |
| **Philosophy** | "Give Claude a computer" - system access | Minimal abstractions - code-first |
| **Primary Models** | Claude (Sonnet, Opus, Haiku) | GPT-4/5 family, 100+ via LiteLLM |
| **Core Patterns** | Agent loop + hooks + subagents | Handoffs + agents-as-tools |
| **Multi-Agent** | Subagents (parallel, isolated context) | Handoffs (delegation) + agents-as-tools (orchestration) |
| **State Management** | Session persistence + CLAUDE.md | Sessions (SQLite, Redis, OpenAI Conversations API) |
| **Validation** | Hooks (PreToolUse, PostToolUse) | Guardrails (input/output, optimistic execution) |
| **Tool System** | Built-in + custom @tool + MCP servers | Hosted tools + @function_tool + agents-as-tools |
| **Permissions** | Granular (allowed_tools, command rules, modes) | Guardrail-based validation |
| **Context Management** | Automatic compaction + summarization | Session-based history management |
| **Tracing** | Via hooks + external integrations | Built-in (free OpenAI dashboard) + 3rd party |
| **API Used** | Anthropic Messages API | [[openai-responses-api\|OpenAI Responses API]] / Chat Completions API |
| **Best For** | Claude-powered agents with system access | OpenAI-ecosystem agents, multi-provider support |
| **Complexity** | Moderate (rich features, hooks) | Low (minimal abstractions) |
| **Community** | Growing (new release Sept 2025) | Growing (15.7k stars, 7 months old) |
| **Production Use** | LinkedIn, Uber, Klarna | Coinbase, Albertsons, HubSpot |

**When to choose Claude Agent SDK:**
- Already using Claude/Anthropic models
- Need extensive file system and bash execution
- Require fine-grained permission controls
- Building agents with system-level access
- Want hook-based deterministic processing
- Need automatic context compaction
- Prefer explicit control via lifecycle hooks

**When to choose OpenAI Agents SDK:**
- Already using OpenAI models/ecosystem
- Need provider flexibility (100+ models)
- Want simpler, minimal abstractions
- Prefer built-in tracing dashboard
- Building multi-agent workflows with handoffs
- Need rapid prototyping with less setup
- Favor lightweight, code-first approach

Both SDKs are production-ready and actively maintained by their respective companies. The choice often comes down to model preference and specific architectural needs rather than capability gaps.

## Getting Started

**Installation**
```bash
pip install claude-agent-sdk
```

**Requirements**
- Python 3.10+
- Node.js 18+ (for certain features)

**Authentication**
Set environment variable:
```bash
export ANTHROPIC_API_KEY="your-api-key"
```

Or use Amazon Bedrock:
```bash
export CLAUDE_CODE_USE_BEDROCK=1
```

Or Google Vertex AI:
```bash
export CLAUDE_CODE_USE_VERTEX=1
```

**Cost Information**
- Claude Sonnet 4.5: $3/$15 per 1M tokens (input/output)
- Typical agent actions: ~$0.045 per action
- Use Haiku for simpler tasks to reduce costs

## Resources

**Official Documentation**
- [Agent SDK Overview](https://docs.claude.com/en/api/agent-sdk/overview) - Complete SDK documentation
- [Python SDK Reference](https://docs.claude.com/en/api/agent-sdk/python) - API reference
- [GitHub Repository](https://github.com/anthropics/claude-agent-sdk-python) - Source code and examples
- [Building Agents Blog](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) - Architecture deep dive

**Tutorials**
- [DataCamp Tutorial](https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk) - Step-by-step guide
- [eesel AI Practical Guide](https://www.eesel.ai/blog/python-claude-code-sdk) - 2025 practical guide
- [PromptLayer Guide](https://blog.promptlayer.com/building-agents-with-claude-codes-sdk/) - Implementation guide

**Example Projects**
- [claude-agent-projects](https://github.com/kingabzpro/claude-agent-projects) - Official tutorial examples
- [wshobson/agents](https://github.com/wshobson/agents) - 83 production-ready subagents
- [awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - 100+ specialized agents
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - Community resources

## Related Technologies

- [[claude-code]] - CLI tool built on same agent harness
- [[model-context-protocol]] - Protocol for custom tool integration
- [[langgraph]] - Alternative agent orchestration framework
- [[composio]] - 3000+ tools via MCP-compatible interface
- [[langfuse]] - Observability and tracing for agent workflows
- [[temporal]] - Infrastructure workflow orchestration
- [[letta]] - Agent memory management

## See Also

- [[context-engineering]] - Strategies for managing agent context
- [[research-agents]] - Research-specific agent patterns and validation
- [[multi-tool-agent]] - Multi-tool integration patterns
- [[prompt-scaffolding]] - System prompt design for agents
- [[tool-abstraction-portability]] - MCP standardization benefits
- [[observability-in-context]] - Monitoring agent performance

---

## Changelog

- **2025-10-06**: Initial note created with SDK features, architecture, and integration patterns
