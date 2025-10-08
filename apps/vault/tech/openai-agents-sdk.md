---
title: OpenAI Agents SDK
type: technology
category: development
tags: [agents, sdk, openai, python, multi-agent, orchestration, handoffs, guardrails]
created: 2025-10-08
updated: 2025-10-08
website: https://openai.github.io/openai-agents-python/
github: https://github.com/openai/openai-agents-python
docs: https://openai.github.io/openai-agents-python/
---

# OpenAI Agents SDK

## Overview

The OpenAI Agents SDK is a production-ready, lightweight Python framework for building multi-agent AI applications with minimal abstractions. Released in March 2025, it evolved from OpenAI's experimental Swarm project into OpenAI's official approach to agent orchestration, emphasizing developer control and rapid prototyping.

The SDK follows a clear philosophy: provide enough features to be useful, remain quick to learn, and work well out of the box. This balance makes it accessible for beginners while maintaining the flexibility needed for production deployments.

Built on the [[openai-responses-api|OpenAI Responses API]] (not the legacy Assistants API), the SDK provides the essential building blocks for agent workflows: built-in agent loops, multi-agent handoffs, validation guardrails, session management, and integrated tracing. With 15.7k GitHub stars and deployments at companies like Coinbase, Albertsons (2,000+ stores), and HubSpot, it demonstrates both strong community adoption and production readiness.

**When to use OpenAI Agents SDK:**
- Building multi-agent systems with specialized agent roles
- Need tool-using agents with function calling capabilities
- Require conversation history and state management
- Want built-in tracing and observability
- Already using OpenAI models or need provider flexibility (100+ LLMs via LiteLLM)
- Prefer lightweight frameworks over complex orchestration systems

**When to consider alternatives:**
- Complex cyclical workflows with sophisticated state transitions → use [[langgraph]]
- Simple API calls without agent orchestration → use OpenAI Python SDK directly
- Claude-specific agents with system access → use [[claude-agent-sdk]]
- Advanced memory management → use [[letta]]

Production adoption includes Coinbase (AgentKit built in "just a few hours"), Albertsons (enterprise-scale deployment), and HubSpot (Breeze AI assistant).

## Core Architecture

The SDK implements a Runner-based execution loop that orchestrates agent interactions:

```
┌─────────────────────────────────────────────────────────────┐
│                   OpenAI Agents SDK                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌────────┐        │
│  │ Agents  │  │Handoffs │  │Guardrails│  │Sessions│        │
│  └─────────┘  └─────────┘  └──────────┘  └────────┘        │
│       │            │              │            │             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌────────┐        │
│  │ Tools   │  │ Runner  │  │ Context  │  │Tracing │        │
│  └─────────┘  └─────────┘  └──────────┘  └────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Agent Execution Loop

The Runner orchestrates agent execution through a continuous loop:

1. **Initialize**: `Runner.run()` called with agent and input message
2. **LLM Call**: Agent processes current conversation history and generates response
3. **Process Output**:
   - If structured `output_type` returned → **END**
   - If no `output_type` and no tool calls/handoffs → **END**
   - If handoff called → Switch to new agent, **LOOP**
   - If tool calls present → Execute tools, add results to context, **LOOP**
4. **Exception Handling**:
   - `MaxTurnsExceeded` if loop limit reached (configurable via `max_turns`)
   - `GuardrailTripwireTriggered` if validation fails

**Example Flow:**
```
User Input → Triage Agent
           ↓
         LLM Call
           ↓
      Tool Calls? → Execute tools → Loop back with results
           ↓
      Handoff? → Transfer to Specialist Agent → Loop with new agent
           ↓
      Final Output? → Return RunResult
```

### Multi-Agent Patterns

**Handoff Pattern (Delegation):**
- One agent transfers full control to another agent
- Full conversation context preserved across transfer
- Lower latency and token usage (direct transfer)
- Best for: Sequential specialized tasks, escalation workflows

```python
triage_agent = Agent(
    name="Triage",
    instructions="Route user to appropriate specialist",
    handoffs=[billing_agent, refund_agent]
)
```

**Agents-as-Tools Pattern (Orchestration):**
- Manager agent calls sub-agents like function tools
- Sub-agents don't take over conversation flow
- Centralized control with single conversation thread
- Higher latency (intermediary routing) but enables parallel processing
- Best for: Coordinated research, multi-perspective analysis

```python
manager = Agent(
    name="Manager",
    instructions="Coordinate specialist agents",
    tools=[analyst_agent.as_tool(), researcher_agent.as_tool()]
)
```

## Key Features

**Built-in Agent Loop**
- Automatic execution loop handling tool calls and LLM interactions
- Configurable turn limits via `max_turns` parameter
- Automatic termination on final output, handoffs, or errors
- Three execution modes: async (`run`), sync (`run_sync`), streaming (`run_streamed`)

**Function Tools with Auto-Schema Generation**
- Decorate any Python function with `@function_tool` to create agent tools
- Automatic schema extraction from type hints and docstrings
- Pydantic-powered validation for type safety
- Supports both sync and async functions

**Powerful Handoff Capabilities**
- One-way transfer mechanism between agents for specialization
- Represented as tools to the LLM (e.g., `transfer_to_refund_agent`)
- Customizable with callbacks, input filtering, structured data passing
- Full conversation context transferred automatically

**Parallel Guardrails**
- Input guardrails validate user input before LLM call (early blocking)
- Output guardrails validate agent responses after generation
- Optimistic execution: agent runs proactively while guardrails check in parallel
- Multiple specialized guardrails can work together for defense-in-depth

**Automatic Session Management**
- Built-in conversation history tracking eliminates manual state handling
- Multiple backends: OpenAI Conversations API, SQLite, SQLAlchemy, Redis, custom
- Session IDs organize conversations by user, thread, or context
- Seamless context preservation across turns

**Integrated Tracing**
- Built-in tracing enabled by default with free OpenAI dashboard access
- Captures: agent runs, LLM generations, tool calls, handoffs, guardrails
- Nested span support with automatic context tracking
- Third-party integrations: LangSmith, Langfuse, Weights & Biases, MLflow, AgentOps

**Structured Outputs**
- Use Pydantic models to define expected output types
- Set `output_type` on agents for typed, validated responses
- Reduces unexpected output formats and improves reliability

**Real-time Streaming**
- `Runner.run_streamed()` for async streaming responses
- Two event types: raw response events (token-by-token), run item events (message-level)
- Real-time progress updates for responsive user experiences

**Model Agnosticism**
- Provider-agnostic via LiteLLM integration supporting 100+ LLMs
- Works with: OpenAI, Anthropic, Gemini, Azure, Bedrock, DeepSeek, Meta AI, xAI, Mistral
- Supports both Responses API and Chat Completions API patterns
- Default model: `gpt-4.1`

**Lifecycle Hooks**
- Event hooks for monitoring and customization:
  - `on_llm_start` / `on_llm_end`: LLM call lifecycle
  - `on_agent_start` / `on_agent_end`: Agent execution lifecycle
  - Custom callbacks for handoffs

## Core Concepts

### Agents

An agent is an LLM configured with specific capabilities and behavior:

```python
agent = Agent(
    name="Research Assistant",
    instructions="Conduct thorough research and provide cited sources",
    model="gpt-4o",
    tools=[web_search, document_reader],
    handoffs=[specialist_agent],
    guardrails=[safety_check, quality_validator],
    output_type=ResearchReport  # Pydantic model
)
```

**Agent Configuration:**
- **name**: Identifier for the agent (used in traces and handoffs)
- **instructions**: System prompt defining agent behavior and role
- **model**: Language model to use (default: `gpt-4.1`)
- **tools**: Functions and capabilities available to the agent
- **handoffs**: List of agents this agent can transfer control to
- **guardrails**: Input/output validation rules
- **output_type**: Pydantic model for structured outputs

**Agent Features:**
- Dynamic instruction generation based on context
- Lifecycle event hooks for monitoring
- Agent cloning for variations
- Forced tool usage patterns
- Configurable tool behavior

### Tools

Three classes of tools enable agent capabilities:

**Hosted Tools** (run on OpenAI servers):
- `WebSearchTool()`: Web search via search engines
- `FileSearchTool()`: Vector store retrieval
- `CodeInterpreterTool()`: Sandboxed Python code execution
- `ComputerTool()`: Computer automation capabilities
- `ImageGenerationTool()`: DALL-E image generation
- `LocalShellTool()`: Local shell command execution
- `HostedMCPTool()`: [[model-context-protocol|MCP]] server integration

**Function Tools** (custom Python functions):
```python
@function_tool
async def get_weather(city: str, units: str = "celsius") -> str:
    """Fetch weather for a given city.

    Args:
        city: Name of the city
        units: Temperature units (celsius or fahrenheit)
    """
    # API call implementation
    return f"Weather in {city}: 22°{units[0].upper()}"
```

Automatic features:
- Tool name from function name
- Description from docstring
- Schema from type annotations
- Pydantic validation for parameters

**Agents as Tools:**
- Use agents as tools for sub-tasks within larger workflows
- Sub-agent runs independently, returns result to parent
- No conversation takeover, maintains parent agent control
- Result incorporated into main agent's context

### Handoffs

Handoffs enable agent delegation and specialization:

```python
escalation_handoff = handoff(
    agent=senior_agent,
    tool_name_override="escalate_to_senior",
    tool_description_override="Transfer complex issues to senior specialist",
    on_handoff=log_escalation,  # Callback when handoff triggers
    input_type=EscalationData,   # Structured input validation
    input_filter=filter_sensitive_data  # Modify conversation before transfer
)

support_agent = Agent(
    name="Junior Support",
    instructions="Handle routine support, escalate complex issues",
    handoffs=[escalation_handoff]
)
```

**How They Work:**
- Represented as tools to the LLM (e.g., `transfer_to_billing_agent`)
- One-way transfer mechanism (agent gives up control)
- Full conversation context transferred to target agent
- Can pass structured data between agents

**Best Practice:** Include handoff guidance in agent instructions to clarify when and why to transfer control.

### Guardrails

Validation mechanisms that run in parallel with agent execution:

**Input Guardrails:**
- Run on user input before LLM call
- Only execute if agent is the first agent in the flow
- Can block malicious input early, saving cost and time

**Output Guardrails:**
- Run on final agent output after generation
- Only execute if agent is the last agent in the flow
- Validate responses meet quality and safety requirements

**Optimistic Execution:**
- Agent generates outputs proactively while guardrails validate
- Guardrails operate in parallel for minimal latency impact
- Exceptions raised if validation fails

```python
@function_guardrail
async def check_input_safety(input_text: str) -> None:
    if contains_injection_attack(input_text):
        raise ValueError("Unsafe input detected")

@function_guardrail
async def check_output_quality(output: str) -> None:
    if len(output) < 10 or not has_proper_citations(output):
        raise ValueError("Output quality insufficient")

agent = Agent(
    name="Safe Assistant",
    guardrails=[check_input_safety, check_output_quality]
)
```

### Sessions

Automatic conversation history management:

**Session Types:**
1. **No Memory** (default): Each run is independent, no history
2. **OpenAI Conversations API**: Cloud-based persistence via OpenAI
3. **SQLiteSession**: Local storage (in-memory or file-based)
4. **SQLAlchemy**: Multiple database backends (PostgreSQL, MySQL, etc.)
5. **Redis**: Distributed session storage for scalable deployments
6. **Custom**: Implement `SessionABC` protocol for custom backends

```python
session = SQLiteSession("user_12345", "conversations.db")

# First turn
result1 = await Runner.run(agent, "My favorite color is blue", session=session)

# Second turn - agent remembers context automatically
result2 = await Runner.run(agent, "What's my favorite color?", session=session)
# Output: "Your favorite color is blue"
```

**Session ID Best Practices:**
- User-based: `"user_12345"` for per-user conversations
- Thread-based: `"thread_abc123"` for distinct conversation threads
- Context-based: `"support_ticket_456"` for scoped interactions

### Context

Dependency injection for agent runs enables sharing state and dependencies:

**Local Context (RunContextWrapper):**
- Not sent to LLM, invisible to the model
- Shared across all agents and tools in a run
- Used for dependencies, API clients, configuration

```python
@dataclass
class UserInfo:
    name: str
    uid: int
    subscription_tier: str

@function_tool
async def fetch_user_limits(wrapper: RunContextWrapper[UserInfo]) -> str:
    user = wrapper.context
    limits = {"basic": "10/day", "pro": "100/day", "enterprise": "unlimited"}
    return f"{user.name} ({user.subscription_tier}): {limits[user.subscription_tier]}"

context = UserInfo(name="Alice", uid=123, subscription_tier="pro")
result = await Runner.run(agent, "What are my limits?", context=context)
```

**Agent/LLM Context:**
- Data visible to LLM in conversation history
- Methods: system instructions, user messages, tool results, retrieval augmentation

### Runner

Orchestrates agent execution with three methods:

**`Runner.run()`**: Async execution returning `RunResult`
```python
result = await Runner.run(
    agent,
    "Analyze sales data",
    run_config={"model": "gpt-4o", "max_turns": 20}
)
```

**`Runner.run_sync()`**: Synchronous wrapper for non-async code
```python
result = Runner.run_sync(agent, "Hello")
```

**`Runner.run_streamed()`**: Async streaming returning `RunResultStreaming`
```python
result = await Runner.run_streamed(agent, "Explain quantum computing")
async for event in result.stream_events():
    # Process streaming events
    pass
```

**Configuration Options:**
- `model`: Override default model
- `max_turns`: Maximum agent loop iterations
- `guardrails`: Runtime guardrail additions
- `trace_name`: Custom trace identifier for observability

### Tracing

Built-in observability system:

**Trace Structure:**
- **Trace**: End-to-end workflow operation (top-level)
- **Spans**: Time-bounded operations within trace
  - Agent spans: Agent execution
  - Generation spans: LLM API calls
  - Function spans: Tool executions
  - Handoff spans: Agent transfers
  - Guardrail spans: Validation checks

**Features:**
- Enabled by default with zero configuration
- Free traces viewable in OpenAI dashboard
- Automatic context tracking across nested operations
- Custom trace processors for third-party integrations

```python
with trace("Customer Support Workflow"):
    triage_result = await Runner.run(
        triage_agent,
        "I need help",
        trace_name="Triage"
    )
    resolution_result = await Runner.run(
        specialist_agent,
        "Follow up on ticket",
        trace_name="Resolution"
    )
```

**Third-Party Integrations:** LangSmith, Langfuse, Weights & Biases, MLflow, Braintrust, AgentOps, Scorecard

## Use Cases in Context Engineering

**Customer Support Automation**
- Multi-tier support with triage agent routing to specialized agents
- Billing specialist, refunds specialist, technical support agents
- Handoffs preserve full conversation context across transfers
- Escalation workflows to senior agents for complex issues
- Example: Multi-agent support system with 24/7 automated first response

**Financial Services & Investment Research**
- Portfolio manager agent coordinates specialist analysts
- Macro analyst, fundamental analyst, quantitative analyst sub-agents
- Agents-as-tools pattern for collaborative decision-making
- Structured outputs for investment recommendations
- Example: OpenAI Cookbook portfolio collaboration demo with hub-and-spoke architecture

**Cryptocurrency & Blockchain**
- **Case Study**: Coinbase AgentKit built in "just a few hours"
- AI agents interact with crypto wallets and blockchain
- On-chain activities: transactions, balance checks, DeFi interactions
- Tool integration with Coinbase Developer Platform SDK
- Demonstrates rapid prototyping capability of the SDK

**Enterprise Data & Search**
- **Case Study**: Box integration for unstructured data
- Search and query across enterprise storage systems
- Extract insights from documents, presentations, spreadsheets
- Combined with web search for comprehensive information gathering
- Guardrails ensure data access compliance

**Research & Information Gathering**
- Multi-agent research workflows with specialized phases
- Web search, data analysis, report writing agents
- Research bot with handoffs between research and synthesis
- Integration with [[research-agents]] patterns
- Structured outputs for consistent report formats

**Content Generation**
- Multi-step pipelines: research → drafting → editing → formatting
- Specialized agents for each content creation phase
- Quality checks with output guardrails
- SEO optimization, fact-checking, style consistency agents
- Streaming for real-time content preview

**Code Review & Development**
- Automated code analysis with security, style, performance reviewers
- Security check agents scan for vulnerabilities
- Test generation agents create comprehensive test suites
- Agents-as-tools pattern for multi-perspective review
- Integration with development workflows and CI/CD

**Sales & Prospecting**
- Lead qualification agents assess prospect fit
- Research agents gather company intelligence
- Outreach agents draft personalized communications
- CRM integration via custom tools
- Multi-step sales workflows with handoffs

**Voice & Real-time Applications**
- Real-time audio processing (with voice module)
- Conversational AI interfaces with streaming responses
- CLI applications with interactive agent loops
- Low-latency handoffs for dynamic conversation routing

**When to Use OpenAI Agents SDK:**

✅ Multi-agent collaboration with specialized roles
✅ Tool integration connecting AI to APIs and external systems
✅ Production reliability with tracing and debugging
✅ Rapid prototyping and quick experimentation
✅ Complex workflows requiring agent handoffs
✅ OpenAI ecosystem users seeking tight integration
✅ Conversational applications with session management
✅ Structured outputs for consistent data formats
✅ Streaming requirements for real-time UX
✅ Enterprise deployments needing observability

**When NOT to Use:**

❌ Highly cyclical workflows with complex state machines ([[langgraph]] better)
❌ Simple API calls without orchestration (use OpenAI Python SDK)
❌ Zero OpenAI dependency preference (consider fully model-agnostic frameworks)
❌ Visual workflow design needs (no visual editor available)

## Integration Patterns

### Basic Hello World

```python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant"
)

result = Runner.run_sync(agent, "Write a haiku about recursion.")
print(result.final_output)
```

### Function Tool Example

```python
from agents import Agent, Runner, function_tool
from typing import Literal

@function_tool
async def get_weather(
    city: str,
    units: Literal["celsius", "fahrenheit"] = "celsius"
) -> str:
    """Fetch the weather for a given city.

    Args:
        city: Name of the city
        units: Temperature units to use
    """
    # API call would go here
    return f"Weather in {city}: 22°C, partly cloudy"

agent = Agent(
    name="Weather Assistant",
    instructions="Help users check the weather",
    tools=[get_weather]
)

result = await Runner.run(agent, "What's the weather in Paris?")
```

### Multi-Agent with Handoffs

```python
from agents import Agent, Runner, handoff

# Define specialized agents
billing_agent = Agent(
    name="Billing Specialist",
    instructions="Handle billing inquiries and payment issues",
    handoff_description="Specialist for billing and payment questions"
)

refund_agent = Agent(
    name="Refund Specialist",
    instructions="Process refund requests and handle return policies",
    handoff_description="Specialist for refunds and returns"
)

# Triage agent routes to specialists
triage_agent = Agent(
    name="Support Triage",
    instructions="""Determine the nature of the customer's issue and
    route to the appropriate specialist. Use handoffs to transfer.""",
    handoffs=[billing_agent, refund_agent]
)

# Run the workflow
result = await Runner.run(
    triage_agent,
    "I was charged twice for my last order"
)
```

### Structured Output Example

```python
from pydantic import BaseModel
from agents import Agent, Runner

class CalendarEvent(BaseModel):
    name: str
    date: str
    time: str
    participants: list[str]
    location: str

agent = Agent(
    name="Calendar Extractor",
    instructions="Extract calendar event details from text",
    output_type=CalendarEvent
)

result = await Runner.run(
    agent,
    "Team meeting Friday at 2pm in Conference Room A with Alice and Bob"
)

# Access structured output
print(f"Event: {result.final_output.name}")
print(f"Date: {result.final_output.date}")
print(f"Attendees: {result.final_output.participants}")
```

### Session Management Example

```python
from agents import Agent, Runner, SQLiteSession

agent = Agent(
    name="Chat Assistant",
    instructions="Have a helpful conversation with the user"
)

# Create persistent session
session = SQLiteSession("user_12345", "conversations.db")

# First turn
result1 = await Runner.run(
    agent,
    "My favorite color is blue",
    session=session
)

# Second turn - agent remembers context
result2 = await Runner.run(
    agent,
    "What's my favorite color?",
    session=session
)
# Output: "Your favorite color is blue"
```

### Guardrails Example

```python
from agents import Agent, Runner, function_guardrail

@function_guardrail
async def check_input_safety(input_text: str) -> None:
    """Validate input doesn't contain malicious content"""
    if "malicious" in input_text.lower():
        raise ValueError("Unsafe input detected")

@function_guardrail
async def check_output_quality(output: str) -> None:
    """Ensure output meets quality standards"""
    if len(output) < 10:
        raise ValueError("Output too short")

agent = Agent(
    name="Safe Assistant",
    instructions="Provide helpful, safe responses",
    guardrails=[check_input_safety, check_output_quality]
)
```

### Context Management Example

```python
from dataclasses import dataclass
from agents import Agent, Runner, RunContextWrapper, function_tool

@dataclass
class UserInfo:
    user_id: str
    name: str
    subscription_tier: str

@function_tool
async def get_user_limits(wrapper: RunContextWrapper[UserInfo]) -> str:
    """Get usage limits for the current user"""
    user = wrapper.context
    limits = {
        "basic": "10 requests/day",
        "pro": "100 requests/day",
        "enterprise": "unlimited"
    }
    return f"{user.name} ({user.subscription_tier}): {limits[user.subscription_tier]}"

agent = Agent(
    name="Account Manager",
    instructions="Help users understand their account",
    tools=[get_user_limits]
)

context = UserInfo(user_id="123", name="Alice", subscription_tier="pro")
result = await Runner.run(agent, "What are my usage limits?", context=context)
```

### Streaming Example

```python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="Provide detailed responses"
)

result = await Runner.run_streamed(agent, "Explain quantum computing")

# Stream token by token
async for event in result.stream_events():
    if event.type == "raw_response_event":
        if isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)
```

### Agents-as-Tools Pattern

```python
from agents import Agent, Runner

# Specialized sub-agents
analyst_agent = Agent(
    name="Data Analyst",
    instructions="Analyze data and provide insights"
)

researcher_agent = Agent(
    name="Researcher",
    instructions="Research topics and gather information"
)

# Manager agent uses sub-agents as tools
manager_agent = Agent(
    name="Project Manager",
    instructions="Coordinate tasks and delegate to specialists",
    tools=[analyst_agent.as_tool(), researcher_agent.as_tool()]
)

result = await Runner.run(
    manager_agent,
    "Analyze our Q4 sales and research market trends"
)
```

### Tracing Example

```python
from agents import Agent, Runner, trace

agent = Agent(name="Assistant", instructions="Be helpful")

# Wrap workflow in named trace
with trace("Customer Support Workflow"):
    triage_result = await Runner.run(
        agent,
        "I need help with my order",
        trace_name="Triage"
    )

    resolution_result = await Runner.run(
        agent,
        "Here's my order number: 12345",
        trace_name="Resolution"
    )

# View complete workflow in OpenAI Traces dashboard
```

## Comparison with Alternatives

| Feature | OpenAI Agents SDK | [[langgraph\|LangGraph]] | CrewAI | AutoGen |
|---------|------------------|-----------|---------|---------|
| **Philosophy** | Minimal abstractions, code-first | Graph-based orchestration | Team-based collaboration | Conversational problem-solving |
| **Ease of Use** | Very easy, few lines of code | Steep learning curve | Easy for beginners | Moderate complexity |
| **Model Support** | OpenAI + 100+ via LiteLLM | Fully model-agnostic | Model-agnostic | Model-agnostic |
| **Orchestration** | Simple handoffs + agents-as-tools | Complex graph workflows | Role-based delegation | Conversation-based |
| **State Management** | Sessions + context | Sophisticated graph state | Built-in memory modules | Message-based state |
| **Parallel Execution** | Limited (via agents-as-tools) | Strong graph-based parallelism | Built-in parallelization | Async conversations |
| **Production Ready** | Yes (March 2025) | Mature, production-ready | Maturing | Solid, Microsoft-backed |
| **Visual Editor** | No (code-only) | Yes (LangGraph Studio) | No | No |
| **Tracing** | Excellent built-in | Good (via LangSmith) | Available | Available |
| **Deployment Time** | Minutes to first agent | Complex setup | Moderate | Moderate |
| **Best For** | OpenAI integration, simple flows | Complex cyclical workflows | Multi-agent teams | Precise control, research |

### Key Differentiators

**OpenAI Agents SDK:**
- **Strengths**: Simplicity, excellent tracing, tight OpenAI integration, rapid prototyping
- **Weaknesses**: Newer ecosystem, limited built-in parallelism, OpenAI-centric (though expandable)
- **Trade-off**: Simplicity over advanced orchestration features

**[[langgraph|LangGraph]]:**
- **Strengths**: Superior state management, complex workflows, cyclical patterns, visual debugging
- **Weaknesses**: Steep learning curve, verbose for simple tasks
- **Trade-off**: Power and flexibility over simplicity

**CrewAI:**
- **Strengths**: Intuitive team metaphor, easy role-based coordination, built-in collaboration
- **Weaknesses**: Less control over flow, still maturing
- **Trade-off**: Team abstraction over low-level control

**AutoGen:**
- **Strengths**: Flexible conversations, Microsoft backing, strong community
- **Weaknesses**: Can be unpredictable, requires conversation design skills
- **Trade-off**: Conversational flexibility over deterministic control

### When to Choose OpenAI Agents SDK

**Choose OpenAI Agents SDK if:**
- Already using OpenAI models and want tight integration
- Need rapid prototyping with minimal setup
- Prefer Python-native approaches with few abstractions
- Want excellent built-in tracing and debugging
- Building straightforward agent workflows
- Value production-readiness out of the box
- Need strong handoff mechanisms between specialized agents

**Choose [[langgraph|LangGraph]] if:**
- Need complex, cyclical workflows with state transitions
- Require sophisticated state management across steps
- Building applications with interdependent agents
- Want visual workflow representation
- Need precise control over execution flow

**Choose CrewAI if:**
- Building team-based agent systems
- Need role-based agent coordination
- Want intuitive multi-agent collaboration
- Prefer high-level abstractions

**Choose AutoGen if:**
- Need flexible conversational agents
- Require precise control over information processing
- Building complex problem-solving systems
- Want Microsoft ecosystem integration

### Hybrid Approaches

The SDK can complement other frameworks:
- **OpenAI SDK + LangGraph**: Use SDK for conversation management, LangGraph for complex planning
- **OpenAI SDK as entry point**: Handle user-facing interactions, delegate to specialized systems
- **Multi-framework**: Use appropriate tool for each workflow component

## Best Practices

**Security**
- Use least-privilege approach with specific `allowed_tools` per task
- Implement safety guardrails for dangerous operations
- Validate all inputs via input guardrails before LLM processing
- Never expose raw error messages to users (may contain sensitive data)
- Use sandboxed execution environments for code interpreter tools
- Implement rate limiting and abuse detection

**Performance**
- Enable automatic prompt caching to reduce costs and latency
- Use streaming mode for interactive user experiences
- Leverage agents-as-tools for parallel processing of independent tasks
- Set appropriate `max_turns` limits to prevent runaway loops
- Choose right model for task complexity (not everything needs GPT-4)
- Monitor token usage and optimize prompts

**Cost Management**
- Track token usage via lifecycle hooks
- Use smaller models (GPT-4 mini) for simple tasks
- Implement caching strategies for repeated queries
- Handoff pattern uses fewer tokens than orchestrator pattern
- Monitor and set budget alerts
- Consider costs when designing multi-turn workflows

**Reliability**
- Implement comprehensive error handling for tool failures
- Use verification techniques: output validation, quality checks
- Set up monitoring and logging from day one
- Test in isolated environments before production
- Implement graceful degradation for tool failures
- Use multiple guardrails for defense-in-depth

**Context Management**
- Follow [[context-engineering]] best practices
- Use sessions appropriately for conversation continuity
- Scope tasks tightly to manage context window efficiently
- Use structured outputs to reduce ambiguity
- Implement [[anthropic-context-pattern]] for complex workflows
- Monitor context usage and implement compaction strategies

**Deployment**
- Use environment variables for API keys and secrets
- Configure authentication (API key, AWS Bedrock, Google Vertex)
- Set up observability from day one (tracing, logging, metrics)
- Implement gradual rollout with canary deployments
- Test with real user scenarios before full launch
- Plan for [[temporal]] integration for long-running workflows
- Document agent behaviors and handoff conditions

## Getting Started

**Installation**
```bash
pip install openai-agents

# With optional modules
pip install 'openai-agents[voice]'    # Voice/realtime support
pip install 'openai-agents[redis]'    # Redis session backend
```

**Requirements**
- Python 3.9+
- OpenAI API key (for OpenAI models)
- Optional: API keys for other providers via LiteLLM

**Authentication**

Set environment variable:
```bash
export OPENAI_API_KEY="sk-..."
```

Or programmatically:
```python
import os
os.environ["OPENAI_API_KEY"] = "sk-..."
```

**Model Support**

Default model: `gpt-4.1`

Supported models:
- GPT-5 family: gpt-5, gpt-5-mini, gpt-5-nano
- GPT-4 family: gpt-4o, gpt-4-turbo, gpt-4o-mini
- 100+ models via LiteLLM: Claude, Gemini, Llama, Mistral, DeepSeek, and more

**Cost Information**

Costs vary by model and usage:
- GPT-4o: ~$2.50/$10 per 1M tokens (input/output)
- GPT-4o-mini: ~$0.15/$0.60 per 1M tokens
- Token usage depends on: conversation length, tool calls, number of turns
- Handoff pattern typically uses fewer tokens than orchestrator pattern
- Monitor usage via tracing dashboard

**Limitations**

- Tracing unavailable for Zero Data Retention organizations
- Handoffs currently optimized for OpenAI models
- No visual workflow editor (code-only approach)
- Simpler state management than graph-based frameworks
- Framework is 7 months old (actively evolving)

## Resources

**Official Documentation**
- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/) - Complete SDK docs
- [GitHub Repository](https://github.com/openai/openai-agents-python) - Source code and examples
- [OpenAI Platform Guide](https://platform.openai.com/docs/guides/agents) - Platform integration
- [OpenAI Cookbook - Agents](https://cookbook.openai.com/topic/agents) - Practical examples

**Integration Guides**
- [Temporal Integration](https://temporal.io/blog/announcing-openai-agents-sdk-integration) - Durable execution
- [Temporal Demos](https://github.com/temporal-community/openai-agents-demos) - Example implementations
- [LangSmith Integration](https://docs.smith.langchain.com/) - Observability platform
- [Langfuse Integration](https://langfuse.com/) - Tracing and analytics

**Case Studies**
- [Coinbase AgentKit](https://www.coinbase.com/developer-platform/discover/launches/openai-agents-sdk) - Crypto agent toolkit
- [OpenAI Cookbook - Portfolio Collaboration](https://cookbook.openai.com/examples/agents_sdk/multi-agent-portfolio-collaboration/) - Investment research

**Tutorials**
- [DataCamp Tutorial](https://www.datacamp.com/tutorial/openai-agents-sdk-tutorial) - Step-by-step guide
- [Building Agents Guide (PDF)](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) - Best practices

**Comparisons**
- [Framework Comparison](https://composio.dev/blog/openai-agents-sdk-vs-langgraph-vs-autogen-vs-crewai) - Detailed comparison
- [Agent Frameworks Analysis](https://langfuse.com/blog/2025-03-19-ai-agent-comparison) - Market overview

**Community**
- [OpenAI Developer Forum](https://community.openai.com/) - Community discussions
- [GitHub Discussions](https://github.com/openai/openai-agents-python/discussions) - Technical Q&A

## Related Technologies

- [[openai-responses-api]] - Underlying API powering the SDK
- [[claude-agent-sdk]] - Anthropic's alternative agent SDK
- [[langgraph]] - LangChain's graph-based agent orchestration
- [[letta]] - Memory-focused agent framework
- [[model-context-protocol]] - Standard protocol for tool integration
- [[composio]] - 3000+ tools via [[model-context-protocol|MCP]]-compatible interface
- [[temporal]] - Infrastructure workflow orchestration for durable agents
- [[context-engineering]] - Strategies for managing agent context
- [[research-agents]] - Research-specific agent patterns
- [[multi-tool-agent]] - Multi-tool integration patterns
- [[tool-abstraction-portability]] - [[model-context-protocol|MCP]] standardization benefits
- [[anthropic-context-pattern]] - Multi-agent context management patterns

---

## Changelog

- **2025-10-08**: Initial note created with SDK features, architecture, patterns, and comprehensive examples
