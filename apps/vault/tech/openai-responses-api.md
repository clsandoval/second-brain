---
title: OpenAI Responses API
type: technology
category: development
tags: [openai, api, agents, stateless, tools]
created: 2025-10-08
updated: 2025-10-08
website: https://platform.openai.com/docs/guides/agents
docs: https://platform.openai.com/docs/api-reference/responses
---

# OpenAI Responses API

## Overview

The OpenAI Responses API is a unified, stateless API for building agentic experiences, released in March 2025 as OpenAI's "future direction" for agent development. It combines the simplicity of the Chat Completions API with the tool-using capabilities of the Assistants API into a single `/v1/responses` endpoint.

Designed with a stateless-by-default architecture, the Responses API gives developers maximum control over conversation flow and state management while providing optional server-side state persistence when needed. This approach enables faster performance, more flexibility, and simpler architecture compared to the legacy Assistants API (deprecating mid-2026).

Since launch, the Responses API has processed "trillions of tokens" across "hundreds of thousands of developers," powering production applications from coding assistants (Zencoder) to market intelligence (Revi) to education platforms (MagicSchool AI). The [[openai-agents-sdk|OpenAI Agents SDK]] builds on this API to provide higher-level orchestration capabilities for Python developers.

**When to use Responses API:**
- Building agentic experiences with tool-using capabilities
- Need stateless architecture with optional state management
- Want better performance than Assistants API
- Require fine-grained control over conversation flow
- Building non-Python applications (API is language-agnostic)
- Prefer raw API control over SDK abstractions

**When to use [[openai-agents-sdk|OpenAI Agents SDK]] instead:**
- Building Python applications with rapid development needs
- Want built-in handoffs, guardrails, sessions, and tracing
- Prefer higher-level abstractions over raw API calls
- Need multi-agent orchestration patterns out of the box

**When to migrate from Assistants API:**
- All new projects (OpenAI recommendation)
- Existing projects experiencing performance issues
- Need simpler architecture with better developer control
- Before Assistants API deprecation (mid-2026)

## Architecture

The Responses API follows a stateless-by-default design that prioritizes simplicity and developer control:

### Single Endpoint

**`/v1/responses`** - Unified endpoint for all agent interactions

Replaces the multi-object structure of Assistants API:
- No separate objects for assistants, threads, messages, runs
- Single request-response pattern like Chat Completions
- All configuration passed in each request

### Stateless by Default

```python
# Each request is independent
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "What's the weather in Paris?"}
    ],
    tools=[web_search_tool]
)
```

**Benefits:**
- Full control over conversation history
- No hidden state on OpenAI servers (by default)
- Easier debugging and testing
- Simpler architecture for stateless applications
- Compatible with [[context-engineering]] best practices

### Optional State Management

For applications needing server-side state:

```python
# First request
response1 = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "My name is Alice"}],
)

# Subsequent request with state reference
response2 = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's my name?"}],
    previous_response_id=response1.id  # Links to previous state
)
```

**State Options:**
- **previous_response_id**: Reference prior response for continuity
- Client-side state: Maintain conversation history in application
- Hybrid: Server-side state + client-side augmentation

### Architecture Comparison

**Responses API Architecture:**
```
Client → /v1/responses → LLM with Tools → Response
         (single call)
```

**Assistants API Architecture (Legacy):**
```
Client → Create Assistant → Create Thread → Create Message → Create Run → Poll Run → Get Messages
         (multiple API calls with state management)
```

**Performance Implications:**
- Responses API: Faster (single request-response)
- Assistants API: Slower (multiple round-trips, polling)
- Developer reports: "more responsive" with Responses API

## Key Features

**Built-in Tools**

The Responses API provides powerful hosted tools that run on OpenAI's infrastructure:

- **Web Search** (`WebSearchTool`): Query search engines for current information
- **File Search** (`FileSearchTool`): Vector store retrieval from uploaded files
- **Code Interpreter** (`CodeInterpreterTool`): Sandboxed Python code execution
- **Computer Use** (`ComputerTool`): Computer automation capabilities
- **Image Generation** (`ImageGenerationTool`): DALL-E integration for image creation
- **Local Shell** (`LocalShellTool`): Execute local shell commands
- **Hosted MCP** (`HostedMCPTool`): [[model-context-protocol|MCP]] server integration

```python
response = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Search for recent AI news"}],
    tools=[{"type": "web_search"}]
)
```

**Structured Outputs**

Request responses in specific formats using JSON schemas or Pydantic models:

```python
from pydantic import BaseModel

class Summary(BaseModel):
    title: str
    key_points: list[str]
    word_count: int

response = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Summarize this article..."}],
    response_format=Summary
)
```

Benefits:
- Type-safe outputs
- Reduced parsing errors
- Consistent data structures
- Easier integration with downstream systems

**Streaming Support**

Real-time response streaming for interactive experiences:

```python
stream = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

**Model Flexibility**

Support for OpenAI's full model range:
- GPT-5 family: gpt-5, gpt-5-mini, gpt-5-nano
- GPT-4 family: gpt-4o, gpt-4-turbo, gpt-4o-mini
- Default: Typically latest GPT-4 variant

**Function Calling**

Define custom tools as functions:

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"}
            }
        }
    }
}]

response = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Weather in Tokyo?"}],
    tools=tools
)
```

## Relationship to Other OpenAI APIs

### vs Chat Completions API

**Chat Completions** (`/v1/chat/completions`):
- Simple text generation with function calling
- Stateless request-response
- No built-in tool execution (client must execute functions)
- Best for: Basic conversational AI without complex tool orchestration

**Responses API** (`/v1/responses`):
- Agentic experiences with tool execution
- Stateless with optional state management
- Hosted tools execute on OpenAI servers (web search, code interpreter, etc.)
- Best for: Agents needing tools, research tasks, complex workflows

**Key Difference**: Responses API includes hosted tool execution (web search, code interpreter) that Chat Completions requires client-side implementation.

### vs Assistants API (Legacy)

**Assistants API** (Deprecating mid-2026):
- **Architecture**: Stateful, server-side, multi-object (assistants, threads, messages, runs)
- **State**: Automatic server-side thread management
- **Performance**: Slower (multiple API calls, polling required)
- **Control**: Less developer control, more abstraction
- **Status**: Beta, being deprecated

**Responses API** (Current, Recommended):
- **Architecture**: Stateless-by-default, single endpoint
- **State**: Client-side by default, optional server-side via `previous_response_id`
- **Performance**: Faster (single request-response, no polling)
- **Control**: More developer control, less abstraction
- **Status**: Production-ready, "future direction" for OpenAI

**Migration Path**:
- OpenAI will provide official migration guide
- Assistants API continues operating until mid-2026
- New projects should use Responses API
- Recommendation: Begin migration planning now

### Comparison Table

| Feature | Chat Completions | Responses API | Assistants API |
|---------|-----------------|---------------|----------------|
| **Endpoint** | `/v1/chat/completions` | `/v1/responses` | Multiple (`/v1/assistants/*`) |
| **State** | Stateless | Stateless + optional | Stateful |
| **Hosted Tools** | No | Yes (web search, code interpreter, etc.) | Yes |
| **Function Calling** | Yes (client executes) | Yes (can be hosted) | Yes |
| **Architecture** | Single request | Single request | Multi-request |
| **Performance** | Fast | Fast | Slower |
| **Complexity** | Low | Low-Medium | High |
| **Status** | Stable | Production (March 2025) | Deprecating (mid-2026) |
| **Best For** | Simple chat | Agentic workflows | Legacy (migrate away) |

## Use Cases

**When to Use Responses API Directly**

✅ Building non-Python applications (JavaScript, Go, etc.)
✅ Need fine-grained control over API requests
✅ Custom orchestration logic not covered by SDK
✅ Stateless applications with client-side state management
✅ Microservices requiring language-agnostic API
✅ Integration with existing systems that prefer REST APIs
✅ Learning agent fundamentals without framework abstractions

**When to Use via [[openai-agents-sdk|OpenAI Agents SDK]]**

✅ Building Python applications
✅ Need rapid development with built-in patterns
✅ Want handoffs, guardrails, sessions, tracing out-of-the-box
✅ Multi-agent orchestration with specialized roles
✅ Prefer higher-level abstractions over raw API calls
✅ Benefit from automatic session management
✅ Need integrated tracing dashboard

**Production Examples**

**Zencoder** - Coding Agent
- AI-powered code generation and editing
- Uses Responses API for tool-using capabilities
- Integrates with development workflows

**Revi** - Market Intelligence
- Private equity and investment banking research
- Complex information gathering and analysis
- Multi-tool coordination for comprehensive insights

**MagicSchool AI** - Education Assistant
- Teaching and learning assistance platform
- Student-facing and teacher-facing agents
- Curriculum planning, lesson generation, assessment creation

**Via SDK (Coinbase, Albertsons, HubSpot)**
- These companies use [[openai-agents-sdk|OpenAI Agents SDK]], which builds on Responses API
- Demonstrates how SDK provides higher-level abstractions on API foundation

**When NOT to Use (Use Alternatives)**

❌ Simple text generation without tools → Use Chat Completions API
❌ Need Claude/Anthropic models → Use [[claude-agent-sdk|Claude Agent SDK]]
❌ Complex graph-based workflows → Use [[langgraph|LangGraph]]
❌ Must stay on Assistants API → Migrate before mid-2026 deprecation

## Integration with Agents SDK

The [[openai-agents-sdk|OpenAI Agents SDK]] is built on top of the Responses API, adding:

### SDK Abstractions on Responses API

**What the SDK Adds:**
- **Agent Loop**: Automatic orchestration of tool calls and responses
- **Handoffs**: Multi-agent delegation and specialization
- **Guardrails**: Input/output validation with optimistic execution
- **Sessions**: Automatic conversation history management with multiple backends
- **Tracing**: Built-in observability with free OpenAI dashboard access
- **Context**: Dependency injection for sharing state across tools/agents

**What Remains at API Level:**
- Core LLM inference and tool execution
- Model selection and configuration
- Token usage and billing
- Rate limiting and quotas

### Architecture Stack

```
┌──────────────────────────────────────┐
│    Application Code                   │
├──────────────────────────────────────┤
│    OpenAI Agents SDK                  │  ← Agent loop, handoffs,
│    (Python abstraction layer)         │    guardrails, sessions
├──────────────────────────────────────┤
│    OpenAI Responses API               │  ← Stateless API with
│    (/v1/responses)                    │    hosted tools
├──────────────────────────────────────┤
│    OpenAI Models & Infrastructure     │  ← LLM inference
└──────────────────────────────────────┘
```

### When to Use SDK vs Raw API

**Use SDK when:**
- Building Python applications
- Want rapid development with patterns
- Need multi-agent orchestration
- Benefit from built-in observability
- Prefer framework abstractions

**Use Raw API when:**
- Building non-Python applications
- Need maximum control and customization
- Have custom orchestration requirements
- Integrating with existing architecture
- Prefer minimal dependencies

## Best Practices

**State Management Strategies**

Choose appropriate state approach:

1. **Fully Stateless**: Each request independent
   - Best for: Stateless microservices, simple queries
   - Client manages all history

2. **Server-Side State**: Use `previous_response_id`
   - Best for: Conversational apps, thread continuity
   - OpenAI manages state

3. **Hybrid**: Combine both approaches
   - Best for: Complex applications with partial state needs
   - Selective state preservation

4. **Client-Side State**: Store messages in application
   - Best for: Full control, custom storage, compliance requirements
   - Send full context with each request

**Tool Usage Patterns**

- Start with hosted tools (web search, code interpreter) before custom functions
- Use structured outputs to ensure consistent tool responses
- Implement timeouts for long-running tool executions
- Cache tool results when appropriate
- Monitor tool usage costs (some tools more expensive than LLM calls)

**Performance Optimization**

- Use streaming for real-time user experiences
- Implement caching for repeated queries
- Choose appropriate model for task complexity (don't over-provision)
- Monitor and optimize token usage
- Batch independent requests when possible
- Use prompt caching for repeated system messages

**Migration from Assistants API**

Planning migration:
1. **Audit Current Usage**: Identify assistants, threads, tool usage
2. **Map Architecture**: Plan stateless vs stateful approach
3. **Update Code**: Convert to `/v1/responses` endpoint
4. **Test Thoroughly**: Validate behavior matches expectations
5. **Monitor Performance**: Compare latency and reliability
6. **Complete Before Mid-2026**: Assistants API deprecation deadline

OpenAI will provide detailed migration guide as deprecation approaches.

**Error Handling**

```python
try:
    response = client.responses.create(
        model="gpt-4o",
        messages=messages,
        tools=tools
    )
except openai.APIError as e:
    # Handle API errors
    logger.error(f"API error: {e}")
except openai.RateLimitError as e:
    # Handle rate limiting
    logger.warning(f"Rate limit: {e}")
```

Implement retry logic with exponential backoff for transient errors.

**Security Considerations**

- Validate all user inputs before sending to API
- Implement rate limiting to prevent abuse
- Don't expose raw API responses containing internal data
- Use guardrails for content safety (via SDK) or custom validation
- Monitor for unusual usage patterns
- Secure API keys using environment variables or secret management

## Getting Started

**Endpoint**

```
POST https://api.openai.com/v1/responses
```

**Basic Usage Example**

```python
from openai import OpenAI

client = OpenAI(api_key="sk-...")

response = client.responses.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What's the capital of France?"}
    ]
)

print(response.choices[0].message.content)
```

**With Hosted Tools**

```python
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Search for recent climate change news"}
    ],
    tools=[
        {"type": "web_search"}
    ]
)
```

**With State Continuity**

```python
# First message
response1 = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "I like pizza"}]
)

# Follow-up with state
response2 = client.responses.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What do I like?"}],
    previous_response_id=response1.id
)
```

**Authentication**

```bash
export OPENAI_API_KEY="sk-..."
```

Or pass directly to client:
```python
client = OpenAI(api_key="your-api-key")
```

**Model Selection**

Available models:
- `gpt-5`, `gpt-5-mini`, `gpt-5-nano` (GPT-5 family)
- `gpt-4o`, `gpt-4-turbo`, `gpt-4o-mini` (GPT-4 family)

Choose based on:
- Task complexity (use smaller models when sufficient)
- Latency requirements (smaller = faster)
- Cost constraints (smaller = cheaper)
- Quality needs (larger = better for complex tasks)

## Resources

**Official Documentation**
- [OpenAI Platform - Agents Guide](https://platform.openai.com/docs/guides/agents) - Comprehensive guide
- [Responses API Reference](https://platform.openai.com/docs/api-reference/responses) - API specification
- [OpenAI Blog - Responses API Launch](https://openai.com/index/new-tools-and-features-in-the-responses-api/) - Announcement

**Migration Resources**
- [Assistants vs Responses Comparison](https://ragwalla.com/blog/openai-assistants-api-vs-openai-responses-api-complete-comparison-guide) - Detailed comparison
- OpenAI will provide official migration guide before Assistants API deprecation

**Related Documentation**
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) - Python framework built on Responses API
- [Chat Completions API](https://platform.openai.com/docs/api-reference/chat) - Simpler alternative for basic use cases

**Community**
- [OpenAI Developer Forum](https://community.openai.com/) - Community support
- [OpenAI API Discussions](https://community.openai.com/c/api/) - API-specific discussions

## Related Technologies

- [[openai-agents-sdk]] - Python framework built on this API
- [[claude-agent-sdk]] - Anthropic's alternative (uses Messages API, not Responses API)
- [[context-engineering]] - Strategies for managing conversation context
- [[model-context-protocol]] - Standard for tool integration (supported via HostedMCPTool)
- [[langgraph]] - Graph-based orchestration (can use Responses API as LLM backend)

## See Also

- [[context-engineering]] - Managing stateless API context effectively
- [[tool-abstraction-portability]] - [[model-context-protocol|MCP]] integration patterns
- [[research-agents]] - Agentic research patterns applicable to Responses API

---

## Changelog

- **2025-10-08**: Initial note created covering API architecture, features, use cases, and migration guidance
