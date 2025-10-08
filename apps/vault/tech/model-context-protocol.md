---
title: Model Context Protocol (MCP)
type: technology
category: infrastructure
tags: [mcp, protocol, tools, integration, anthropic, standards, interoperability]
created: 2025-10-06
updated: 2025-10-06
website: https://www.anthropic.com/news/model-context-protocol
github: https://github.com/modelcontextprotocol/servers
docs: https://docs.claude.com/en/docs/claude-code/mcp
---

# Model Context Protocol (MCP)

## Overview

Model Context Protocol (MCP) is an open, standardized protocol for connecting AI models to tools and data sources. Released by Anthropic, MCP provides a universal interface that enables AI applications to discover and invoke tools consistently, regardless of the underlying AI provider.

MCP's provider-agnostic design means tools built once work across Claude, GPT, Gemini, and other AI models without modification. This standardization enables a growing ecosystem of reusable tool integrations, from documentation access (Context7) to enterprise systems (Slack, GitHub, databases).

**When to use MCP:**
- Building reusable tool integrations that work across AI providers
- Creating standardized internal tool interfaces
- Contributing to or consuming community tool libraries
- Enabling AI applications to discover available tools at runtime

**Key adoption:**
- [[claude-code]]: Context7 MCP server provides real-time documentation
- [[claude-agent-sdk]]: Native in-process MCP server support
- [[composio]]: 3000+ tools via MCP-compatible interface
- Community: 100+ pre-built MCP servers for common integrations

## Architecture

MCP uses a client-server architecture where AI applications (clients) connect to tool providers (servers):

```
AI Application (Client) ←──MCP Protocol──→ Tool Provider (Server)
        ↓                                           ↓
   Discovers tools                          Exposes tools
   Invokes with parameters                  Executes and returns results
   Receives results                         Validates inputs
```

**Core Components:**

**MCP Servers**
Programs that expose tools via the MCP protocol. Can run in-process (same application) or out-of-process (separate programs communicating via stdio or HTTP).

**MCP Clients**
AI applications that discover and invoke tools from MCP servers. Include Claude Code, Claude Agent SDK, and third-party IDEs.

**Tool Definitions**
Standardized format specifying tool name, description (for AI understanding), and parameter schema (JSON Schema format).

**Protocol Messages**
Request/response patterns for tool discovery, invocation, and result delivery. Supports synchronous and asynchronous execution.

## Key Features

**Standardized Tool Interface**
- Consistent format across all tools: name, description, parameter schema
- AI models understand tool capabilities through machine-readable descriptions
- Eliminates provider-specific tool integration code

**Provider-Agnostic Design**
- Works with Claude, GPT, Gemini, and any AI provider
- Write tools once, use everywhere
- Switch between AI providers without rewriting integrations

**In-Process and Out-of-Process Servers**
- **In-process**: Tools run in same application (Python SDK feature), no serialization overhead
- **Out-of-process**: Tools run separately, communicate via stdio/HTTP, better isolation
- Choice depends on performance needs and security requirements

**Tool Discovery**
- Clients can query available tools from servers at runtime
- Dynamic tool selection based on task requirements
- Enables agents to discover capabilities autonomously

**Authentication and Permissions**
- Supports various auth mechanisms (API keys, OAuth, custom)
- Fine-grained control over which tools are available
- Input validation and sandboxing for security

**Extensible Protocol**
- Community can create and share MCP servers
- Pre-built servers available for common integrations
- Custom servers for internal tools and data sources

## Tool Definition Format

MCP tools follow a standardized schema:

```json
{
    "name": "search_documentation",
    "description": "Search technical documentation for a query. Returns relevant excerpts with source URLs.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language search query"
            },
            "library": {
                "type": "string",
                "description": "Library name (e.g., 'react', 'tensorflow')",
                "enum": ["react", "tensorflow", "django"]
            },
            "max_results": {
                "type": "integer",
                "description": "Maximum number of results to return",
                "default": 5
            }
        },
        "required": ["query"]
    }
}
```

**Design Principles:**
- **Clear descriptions**: AI needs to understand tool purpose and usage
- **Typed parameters**: JSON Schema validation prevents errors
- **Required fields**: Explicit about mandatory vs optional parameters
- **Defaults**: Sensible defaults reduce friction

## Use Cases in Context Engineering

**Documentation Access**
Context7 MCP server provides real-time documentation for [[claude-code]], eliminating outdated API references and hallucinated methods. Developers add "use context7" to prompts for instant access to version-specific docs.

**Custom Tool Integration**
[[claude-agent-sdk]] uses in-process MCP servers for custom tools. Python developers define tools with `@tool` decorator, and SDK automatically exposes them via MCP:

```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("query_database", "Query PostgreSQL database", {"sql": str})
async def query_db(args):
    # Execute SQL and return results
    results = execute_query(args['sql'])
    return {"content": [{"type": "text", "text": str(results)}]}

server = create_sdk_mcp_server(
    name="database-tools",
    version="1.0.0",
    tools=[query_db]
)
```

**Enterprise Integration**
[[composio]] provides 3000+ tools (Slack, GitHub, Gmail, databases) via MCP-compatible interface. Enterprises build internal MCP servers for proprietary systems, enabling AI agents to interact with existing infrastructure.

**Multi-Tool Agents**
[[multi-tool-agent|Multi-tool agents]] leverage MCP for standardized tool access. Agent logic remains consistent regardless of which tools are available, and new tools can be added without code changes.

**Cross-Provider Portability**
Teams using multiple AI providers (Claude for reasoning, GPT for speed, open-source for cost) write MCP tools once and use across all providers. See [[tool-abstraction-portability]] for benefits.

## Integration Ecosystem

**Claude Code**
Uses Context7 MCP server for up-to-date documentation access. Platform-specific setup connects IDE to MCP servers. See [[claude-code]] for configuration.

**Claude Agent SDK**
Native in-process MCP server support with `@tool` decorator. No subprocess overhead, tools run directly in Python application. See [[claude-agent-sdk]] for examples.

**Composio**
Provides 3000+ pre-built integrations (SaaS tools, databases, APIs) via MCP-compatible interface. Authentication and permission management included. See [[composio]] for details.

**Community MCP Servers**
Pre-built servers available at [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers):
- **Filesystem**: File operations with sandboxing
- **GitHub**: Repository access, PR management, issue tracking
- **Google Drive**: Document access and search
- **Postgres**: Database queries with connection pooling
- **Slack**: Message posting, channel management
- **Puppeteer**: Browser automation for web scraping

**Third-Party IDEs**
- Cursor: MCP integration for custom tools
- Windsurf: MCP server support
- VS Code: Via extensions and plugins

## Implementation Patterns

**Creating an MCP Server** (Python):
```python
from mcp.server import Server
from mcp.types import Tool

server = Server("my-tools")

@server.tool()
async def calculate(operation: str, a: float, b: float) -> float:
    """Perform basic arithmetic operations."""
    if operation == "add":
        return a + b
    elif operation == "multiply":
        return a * b
    # ... more operations

# Run server
if __name__ == "__main__":
    server.run()
```

**Registering Tools** (Claude Agent SDK):
```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("weather", "Get weather forecast", {"city": str})
async def get_weather(args):
    forecast = fetch_weather(args['city'])
    return {"content": [{"type": "text", "text": forecast}]}

@tool("news", "Get latest news", {"topic": str})
async def get_news(args):
    articles = fetch_news(args['topic'])
    return {"content": [{"type": "text", "text": articles}]}

# Create server with multiple tools
server = create_sdk_mcp_server(
    name="info-tools",
    version="1.0.0",
    tools=[get_weather, get_news]
)
```

**Tool Discovery**:
```python
# Client discovers available tools
available_tools = await mcp_client.list_tools()

for tool in available_tools:
    print(f"{tool.name}: {tool.description}")
    print(f"Parameters: {tool.parameters}")
```

**Error Handling**:
```python
@tool("risky_operation", "Perform risky operation", {"data": str})
async def risky_op(args):
    try:
        result = perform_operation(args['data'])
        return {"content": [{"type": "text", "text": result}]}
    except ValueError as e:
        return {
            "content": [{"type": "text", "text": f"Error: {str(e)}"}],
            "isError": True
        }
```

## Best Practices

**Tool Naming**
- Use descriptive, action-oriented names: `search_documentation`, not `doc_tool`
- Avoid abbreviations unless universally understood
- Consistent naming convention across tool suite

**Description Clarity**
- Write for AI understanding: explain what tool does, when to use it, what it returns
- Include example use cases in description
- Specify units, formats, and constraints

**Parameter Design**
- Use JSON Schema for validation
- Provide defaults for optional parameters
- Use enums for constrained choices
- Clear parameter descriptions with examples

**Error Messages**
- Return descriptive errors AI can understand and act on
- Include suggestions for fixing issues
- Use `isError` flag for error responses

**Security**
- Validate all inputs server-side (don't trust client validation)
- Use least-privilege access (only expose necessary operations)
- Implement rate limiting for expensive operations
- Sanitize outputs to prevent information leakage
- Use authentication for sensitive tools

**Performance**
- Cache expensive operations when possible
- Set reasonable timeouts for long-running operations
- Use async/await for I/O-bound operations
- Consider in-process servers for performance-critical tools

**Testing**
- Unit test tool implementations independently
- Integration test with AI models
- Test error handling and edge cases
- Validate parameter schemas

## In-Process vs Out-of-Process

**In-Process Servers** (Python SDK):
- Run in same process as AI application
- No serialization overhead (direct function calls)
- Share memory and resources with application
- Easier debugging and development
- Use when: Performance critical, tightly coupled to application, trusted code

**Out-of-Process Servers**:
- Run as separate programs
- Communicate via stdio or HTTP
- Better isolation and security
- Can be written in any language
- Can be shared across multiple applications
- Use when: Untrusted code, language-specific tools, shared infrastructure, independent lifecycle

**Choosing Between Them:**
- **Performance needs**: In-process for low latency, out-of-process for CPU-intensive tasks
- **Security requirements**: Out-of-process for better isolation
- **Language**: In-process for Python, out-of-process for other languages
- **Deployment**: Out-of-process for microservices architecture

## Comparison

**vs Direct Tool Integration**
- **MCP**: Standardized, reusable, provider-agnostic
- **Direct**: Custom code, provider-specific, not reusable
- Use MCP for long-term maintainability and portability

**vs Framework-Specific Tools** (LangChain, LlamaIndex):
- **MCP**: Works across frameworks and providers
- **Framework Tools**: Locked to specific framework
- Use MCP when using multiple frameworks or planning to switch

**vs Function Calling** (OpenAI, Anthropic native):
- **MCP**: Higher-level abstraction, tool discovery, standardized format
- **Function Calling**: Lower-level, provider-specific schemas
- MCP can be built on top of function calling primitives

## Resources

**Official Documentation**
- [MCP Announcement](https://www.anthropic.com/news/model-context-protocol) - Protocol overview
- [Claude Code MCP Guide](https://docs.claude.com/en/docs/claude-code/mcp) - Integration guide
- [GitHub Repository](https://github.com/modelcontextprotocol/servers) - Pre-built servers and examples

**Community Resources**
- [Context7](https://github.com/upstash/context7) - Documentation MCP server
- [MCP Servers Collection](https://github.com/modelcontextprotocol/servers) - Official server implementations
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - Community MCP tools

**Tutorials**
- [ClaudeLog Context7 Guide](https://claudelog.com/claude-code-mcps/context7-mcp/) - Setting up Context7
- Claude Agent SDK docs - In-process MCP server examples

## Related Technologies

- [[claude-code]] - Uses Context7 MCP server for documentation
- [[claude-agent-sdk]] - Native in-process MCP server support
- [[composio]] - 3000+ tools via MCP-compatible interface
- [[langgraph]] - Can use MCP tools in agent workflows
- [[tool-abstraction-portability]] - Concept MCP embodies

## See Also

- [[multi-tool-agent]] - Pattern using MCP for tool integration
- [[context-engineering]] - Strategies for tool-based context management
- [[prompt-scaffolding]] - Designing prompts for tool usage
- [[observability-in-context]] - Monitoring tool usage and performance

---

## Changelog

- **2025-10-06**: Initial note created with protocol overview, architecture, and integration patterns
