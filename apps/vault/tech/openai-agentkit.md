---
title: OpenAI AgentKit
type: technology
category: development
tags: [agents, openai, visual-builder, workflow, agent-platform, no-code, low-code, chatkit, guardrails, evals, mcp]
created: 2025-10-09
updated: 2025-10-09
website: https://openai.com/agent-platform/
github: https://github.com/openai/chatkit-js
docs: https://platform.openai.com/docs/guides/agent-builder
status: beta
launch_date: 2025-10-06
components: [agent-builder, chatkit, widget-builder, guardrails, connector-registry, evals]
---

# OpenAI AgentKit

## Overview

OpenAI AgentKit is a comprehensive platform for building, deploying, and evaluating AI agents through a visual-first interface. Launched at DevDay 2025 (October 6, 2025), AgentKit represents OpenAI's strategic move to provide a complete toolkit that covers the entire agent development lifecycle—from design to deployment to optimization.

Described by Sam Altman as "like Canva for building agents," AgentKit enables developers to compose multi-agent workflows using a drag-and-drop interface, deploy them via customizable chat interfaces, protect them with safety guardrails, and continuously improve them through comprehensive evaluation tools.

Built on top of OpenAI's Responses API, AgentKit competes with code-first frameworks like LangChain and LangGraph, autonomous systems like AutoGPT, and no-code automation tools like n8n and Zapier. The platform reduces the learning curve from 5-7 days (typical for code-first frameworks) to 2-3 days, while enabling code export to Python and TypeScript for developers who need programmatic control.

**Key differentiators:**
- Visual workflow designer with node-based composition
- Integrated deployment via ChatKit (embeddable chat interface)
- Built-in safety layer with customizable guardrails
- Comprehensive evaluation platform with trace grading
- Native MCP (Model Context Protocol) support for tool integration
- Full versioning and rollback capabilities
- Custom widget builder for rich UI components

**Current availability:**
- Agent Builder: Beta
- ChatKit: Generally Available (GA)
- Guardrails: Open-source
- Evals for Agents: Generally Available (GA)
- Connector Registry: Beta (limited rollout)

## Core Components

AgentKit consists of six integrated components that work together as a unified platform:

### 1. Agent Builder (Beta)
Visual drag-and-drop canvas for composing multi-step, multi-agent workflows. Enables developers to wire up agents, tools, routing logic, guardrails, and human-in-the-loop checkpoints without extensive coding. Each workflow can be previewed, tested with inline evaluations, versioned, and exported to Python or TypeScript code.

### 2. ChatKit (GA)
Framework-agnostic, embeddable chat interface for deploying agents in web applications. Available as React components or vanilla JavaScript, ChatKit handles streaming responses, thread management, attachments, and custom widget rendering. Deeply customizable to match product branding and user experience.

### 3. Widget Builder
Natural language-driven tool for creating custom UI components that agents can render. Widgets are React components that display structured data (cards, carousels, maps, galleries) inline with conversation. The builder automatically structures agent outputs to match widget schemas.

### 4. Guardrails (Open-source)
Modular safety layer that protects agents against unintended or malicious behavior. Includes built-in guardrails for PII detection, content moderation, jailbreak prevention, hallucination detection, and off-topic filtering. Fully customizable with per-node configuration in workflows.

### 5. Connector Registry (Beta)
Enterprise-focused administration panel for managing data and tool connections across organizations. Consolidates data sources (Dropbox, Google Drive, SharePoint, Microsoft Teams) and third-party MCP servers into a unified governance layer that works across ChatGPT and the API.

### 6. Evals for Agents (GA)
Comprehensive evaluation platform with four key capabilities: dataset management, trace grading, automated prompt optimization, and third-party model support. Reduces development time by 50% and increases agent accuracy by 30% according to user reports.

## Agent Builder - Visual Workflow Designer

Agent Builder is the centerpiece of AgentKit—a visual canvas where developers compose agent workflows by dragging and connecting nodes. Each node represents a discrete step in the agent's logic: receiving input, categorizing intent, routing to specialized agents, calling tools, applying safety checks, or requesting human approval.

### Workflow Development Process

1. **Start with a template or blank canvas**: Choose from pre-built templates (customer service, data enrichment, Q&A) or design from scratch
2. **Add and configure nodes**: Drag nodes onto the canvas, set their parameters, and write agent instructions
3. **Connect nodes to define flow**: Draw connections to establish the sequence and conditional logic
4. **Add tools and guardrails**: Attach file search, web search, MCP servers, and safety guardrails to relevant nodes
5. **Preview and test**: Run test queries through the workflow to validate behavior
6. **Configure inline evaluations**: Set up evaluation criteria for automated testing
7. **Publish or export**: Deploy to production with a workflow ID or export code to Agents SDK

### Node Types

**Start Nodes**
- Define input parameters and initial conditions
- Set up the entry point for user queries
- Configure context and metadata

**Agent Nodes**
- Primary agents that process requests and generate responses
- Classifier agents that categorize incoming messages for routing
- Each agent has customizable instructions, tools, and output formats
- Example from DevDay demo: "Session Agent" with file search tool and custom widget

**Logic Nodes**
- **If/Else Nodes**: Conditional branching based on agent outputs or variables
- **Loop Nodes**: Iterative processing with CEL (Common Expression Language) conditions
- **Transform Nodes**: Data reshaping and preprocessing using CEL expressions
- **State Nodes**: Global variables accessible throughout the workflow

**Tool Integration Nodes**
- **File Search**: Query OpenAI Vector Stores for document retrieval
- **Web Search**: Access current web information (gpt-4o and gpt-4o-mini)
- **MCP Connectors**: Integrate Model Context Protocol servers (hosted, local, or HTTP)
- **Code Interpreter**: Execute code in sandboxed environments
- **Image Generation**: Create images as part of agent responses
- **Computer Use**: Automate computer interactions

**Control Nodes**
- **Guardrail Nodes**: Apply safety checks (PII, moderation, hallucination detection)
- **Approval Nodes**: Human-in-the-loop checkpoints for critical decisions
- **Handoff Nodes**: Transfer conversation to specialized agents

### Versioning and Rollback

Every time a workflow is published, Agent Builder creates a snapshot that can be pinned or rolled back. This versioning system enables safe iteration:
- Test changes in preview mode without affecting production
- Compare performance across versions using Evals
- Roll back if new changes degrade behavior
- Pin specific versions for stability

### Code Export

Agent Builder workflows can be exported to Python or TypeScript code that integrates with the [[openai-agents-sdk]]. This bridges visual and programmatic development:

**Export process:** Navigate to **Code → Agent's SDK → Python/TypeScript → Copy**

**Exported code includes:**
- Agent definitions with instructions
- Tool configurations and MCP server setup
- Guardrails pipeline
- Handoff logic between agents
- File search and built-in tools

**Use cases:**
- Rapid prototyping in visual builder, production refinement in code
- Team collaboration between business users (visual) and developers (code)
- Learning tool: see how visual workflows translate to SDK code
- Deep customization beyond visual builder capabilities

## Classifier Agents and Routing

A key pattern in Agent Builder is using **classifier agents** to intelligently route requests to specialized agents. This pattern was demonstrated in the DevDay 2025 live build.

### How Classifier Routing Works

1. **User sends a query** → Enters the workflow through a Start Node
2. **Categorizing agent** → Specialized agent classifies the intent (constrained output: e.g., "session_query" or "general_info")
3. **If/Else routing node** → Evaluates the classifier output and routes accordingly
4. **Specialized agents** → Handle specific types of requests with appropriate tools and context
5. **Response returned** → User receives answer from the specialized agent

**Example from DevDay demo:**
```
User: "What session to attend to learn about building agents?"
  ↓
Categorizing Agent → Output: "session_query"
  ↓
If/Else Node → Routes to Session Agent
  ↓
Session Agent → Uses file search + custom widget
  ↓
Response: "Orchestrating Agents at Scale at 11:15 with James and Rohan" (with visual widget)
```

### Handoff Mechanism

Handoffs between agents are represented as tools that the LLM can invoke. When an agent needs to transfer a conversation, it calls a `transfer_to_[agent_name]` tool.

**Handoff configuration example** (from Agents SDK):
```python
from openai_agents import Agent, handoff

triage_agent = Agent(
    name="Triage agent",
    instructions="Route customer queries to appropriate specialists",
    handoffs=[billing_agent, handoff(refund_agent)]
)
```

**Advanced handoff features:**
- `tool_name_override`: Custom tool names for LLM invocation
- `tool_description_override`: Clarify handoff purpose for better routing
- `on_handoff`: Execute callback functions during transfer
- `input_type`: Pass structured data (Pydantic models) to target agent
- `input_filter`: Modify conversation history before handoff
- `is_enabled`: Dynamically enable/disable handoff options

**Best practices:**
- Include handoff instructions in agent prompts
- Design specialized agents for narrow, well-defined tasks
- Use a routing agent as the main user interface
- Test routing logic thoroughly with edge cases

## ChatKit - Embeddable Chat Interface

ChatKit is a framework-agnostic, drop-in chat solution for deploying AgentKit workflows in web applications. As a generally available component, it's production-ready and fully supported.

### Key Features

**Built-in Functionality:**
- Response streaming with real-time updates
- Thread and message management
- Model "thinking" visualization (shows reasoning process)
- Attachment handling (documents, images)
- Source annotations and entity tagging
- Rich interactive widgets (maps, cards, galleries)
- Session persistence across page reloads

**Customization:**
- Brand theming: colors, fonts, styling
- Custom layouts and positioning
- Configurable starter prompts
- Native integration that feels like part of your product
- Widget rendering for structured data display

### Implementation

**React Installation:**
```bash
npm install @openai/chatkit-react
```

**React Component:**
```javascript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MyChat({ clientToken }) {
  const { control } = useChatKit({
    api: { clientToken }
  });

  return (
    <ChatKit
      control={control}
      className="h-[600px] w-[320px]"
    />
  );
}
```

**Server-Side Token Generation:**
```python
from openai import OpenAI

client = OpenAI()
session = client.chatkit.sessions.create({
  "workflow_id": "wf_abc123",  # From Agent Builder
  # Additional configuration
})
```

**Vanilla JavaScript:**
```html
<script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>

<script>
function initChatkit({ clientToken }) {
  const chatkit = document.createElement('openai-chatkit');
  chatkit.setOptions({ api: { clientToken } });
  document.body.appendChild(chatkit);
}
</script>
```

### DevDay Demo Implementation

In the DevDay presentation, the agent was deployed in three steps:
1. **Created ChatKit session** with workflow ID from Agent Builder
2. **Added ChatKit React component** to the website with customized branding (Froge theme, custom colors, "ribbit" placeholder text)
3. **Added "Ask Froge" link** at the top of the DevDay website

The entire integration took less than 2 minutes, demonstrating ChatKit's simplicity.

### Pricing

- **Storage**: 1 GB monthly free tier, $0.10 per GB-day after
- **Token usage**: Standard API model pricing applies
- **License**: Apache License 2.0 (open-source)

### Resources

- Documentation: https://openai.github.io/chatkit-js/
- GitHub: https://github.com/openai/chatkit-js
- Starter app: https://github.com/openai/openai-chatkit-starter-app
- Advanced samples: https://github.com/openai/openai-chatkit-advanced-samples

## Widget Builder - Custom UI Components

Widget Builder enables creating custom UI components that agents can render inline with conversation. Rather than returning plain text, agents can display rich, interactive elements like pricing cards, location maps, image galleries, or event schedules.

### How Widget Builder Works

1. **Describe the widget** in natural language: "Create a pricing comparison card with product image, feature checklist, and CTA button"
2. **AgentKit generates React component** with the specified structure
3. **Widget added to library** and automatically available to agents
4. **Agent output structured automatically** to match the widget schema
5. **Widget rendered inline** in ChatKit during conversation

### Built-in Widget Types

**Pizzaz Components** (included in Apps SDK examples):
- **Pizzaz List**: Ranked card list with favorites and CTA buttons
- **Pizzaz Carousel**: Embla-powered horizontal scroller for media
- **Pizzaz Map**: Mapbox integration for location-based widgets
- **Pizzaz Album**: Stacked gallery view for images

### Technical Implementation

Widgets are React components that communicate with the agent runtime via the `window.openai` API.

**Key hooks:**
```javascript
// Reactive global state shared across widgets
const globalState = useOpenAiGlobal();

// Persist component-specific state
const [widgetState, setWidgetState] = useWidgetState();
```

**Development workflow:**
1. Scaffold React project
2. Create component using `window.openai` hooks
3. Bundle as single JavaScript module (standalone HTML, JS, CSS)
4. Embed in MCP server response or upload to Agent Builder

**DevDay demo example:** The "Session Widget" displayed Froge (DevDay mascot) with session details (title, time, location) in a visually branded card format.

### Widget Studio

AgentKit includes a Widget Studio for designing custom interfaces:
- Real-time preview of widget rendering
- Add buttons, forms, charts, and interactive elements
- Brand customization (colors, fonts, layout)
- Download and attach to agents

### Use Cases

- **E-commerce**: Product cards with images, prices, and buy buttons
- **Travel**: Flight/hotel comparison cards with booking links
- **Events**: Session schedules with speaker info and registration
- **Data visualization**: Charts and graphs for analytics agents
- **Form collection**: Interactive forms for gathering structured input

## Guardrails - Safety and Compliance Layer

Guardrails is an open-source, modular safety framework that protects agents from unintended or malicious behavior. It can be configured per-node in Agent Builder workflows or programmatically via the Guardrails SDK.

### Built-in Guardrails

**Content Safety:**
- **Moderation**: Uses OpenAI's moderation API to detect harmful content (hate, violence, self-harm, sexual content)
- **NSFW Text Detection**: Filters workplace-inappropriate content
- **Jailbreak Detection**: Identifies attempts to bypass safety measures or manipulate agent behavior
- **Off-Topic Prompt Filtering**: Keeps responses within defined business scope

**Data Protection:**
- **PII Detection**: Identifies and masks Personally Identifiable Information (powered by Microsoft's Presidio framework)
- **URL Filtering**: Domain allowlist/blocklist for safe web interactions
- Configurable actions: mask, flag, or reject when PII is detected

**Content Quality:**
- **Hallucination Detection**: Uses vector stores to verify factual accuracy and detect fabricated information
- **Custom Prompt Check**: LLM-based custom guardrails for domain-specific validation

### Configuration Methods

**1. Visual Configuration in Agent Builder:**
- Drag Guardrail Node into workflow
- Select guardrails from pre-built library
- Configure per-node for granular control
- Example from DevDay: PII guardrail at workflow start

**2. JSON Configuration:**
```json
{
  "output": {
    "guardrails": [
      {
        "name": "Moderation",
        "config": {
          "categories": ["hate", "violence"]
        }
      },
      {
        "name": "PIIMask",
        "config": {
          "entities": ["EMAIL", "PHONE_NUMBER", "SSN"]
        }
      }
    ]
  }
}
```

**3. Programmatic Setup (Python):**
```python
from guardrails import GuardrailsAsyncOpenAI

client = GuardrailsAsyncOpenAI(config="guardrails_config.json")

try:
    response = await client.responses.create(
        model="gpt-4o",
        input="User query here"
    )
except GuardrailTripwireTriggered as e:
    print(f"Guardrail triggered: {e}")
```

**4. No-Code Guardrails Wizard:**
- Interactive configuration at https://guardrails.openai.com
- Visual selection of guardrails
- Automatic JSON generation

### Pipeline Stages

Guardrails can be applied at three stages:
- **Input stage**: Screen user queries before agent processing
- **Pre-flight stage**: Validate before calling external tools or APIs
- **Output stage**: Review agent responses before delivery to users

### PII Detection Example

From the DevDay demo, a PII guardrail was placed at the start of the workflow to protect the Froge character from inadvertently exposing personal information:

```python
from guardrails import PIIMaskGuardrail

pii_guardrail = PIIMaskGuardrail(
    entities=["NAME", "EMAIL", "PHONE_NUMBER"],
    mask_char="*"
)
```

If a user input contains PII, the guardrail either masks it or routes to a separate agent that explains it cannot process sensitive information.

### Important Disclaimer

Developers are responsible for implementing appropriate safeguards and ensuring compliance with data protection laws. OpenAI disclaims liability for content logging or retention. Guardrails are tools to assist with safety but do not guarantee complete protection.

### Resources

- Guardrails documentation: https://guardrails.openai.com/docs/
- GitHub: https://github.com/openai/openai-guardrails-python
- Configuration wizard: https://guardrails.openai.com
- Hallucination guide: https://cookbook.openai.com/examples/developing_hallucination_guardrails

## Tools and Integrations

AgentKit provides extensive tool integration capabilities through built-in tools and native MCP (Model Context Protocol) support.

### File Search Tool

Enables agents to retrieve information from OpenAI Vector Stores—collections of documents that have been indexed for semantic search.

**Configuration:**
```python
from openai_agents import FileSearchTool

file_search = FileSearchTool(
    max_num_results=10,
    vector_store_ids=["vs_abc123"]
)
```

**Features:**
- Multiple file type support (PDF, DOCX, TXT, code files)
- Query optimization for semantic search
- Metadata filtering for refined results
- Custom reranking options

**Pricing:**
- Queries: $2.50 per 1,000 queries
- Storage: $0.10/GB/day (first GB free)

**DevDay demo usage:** Both the Session Agent and Dev Day Agent used file search tools to query documents containing session schedules and general DevDay information.

### Model Context Protocol (MCP)

MCP is an open standard for connecting AI assistants to systems where data lives. AgentKit provides native support for MCP, making it easy to integrate external tools and data sources.

**MCP is described as "USB-C for AI applications"**—a standardized interface that enables tool discovery and invocation across platforms.

**Three types of MCP integration:**

**1. Hosted MCP Tools** (Recommended):
```python
from openai_agents import HostedMCPTool

# Tool invocation handled by Responses API
tool = HostedMCPTool(server_label="my-mcp-server")
```
- Model lists tools from remote server
- Invokes without extra callbacks to Python process
- Fastest and most scalable approach

**2. Local MCP Servers**:
```python
from openai_agents import MCPServerStdio

# Run as local subprocess
server = MCPServerStdio(
    command="mcp-server",
    args=["--config", "config.json"]
)
```
- SDK spawns and manages server process
- Keeps communication pipes open
- Automatically closes on completion

**3. HTTP-Based MCP Servers**:
```python
async with MCPServerStreamableHttp(
    name="HTTP MCP Server",
    params={
        "url": "http://localhost:8000/mcp",
        "headers": {"Authorization": f"Bearer {token}"}
    }
) as server:
    agent = Agent(name="Assistant", mcp_servers=[server])
```
- Supports Server-Sent Events (SSE) for streaming
- Configurable timeouts and retries
- Remote deployment flexibility

**MCP Features:**
- Tool filtering (static and dynamic)
- Prompt generation for tool usage
- Caching of tool lists for performance
- Automatic tracing for debugging
- Multi-server aggregation

### Other Built-in Tools

**WebSearchTool**: Access current web information (available with gpt-4o and gpt-4o-mini)

**CodeInterpreterTool**: Execute Python code in sandboxed environments for calculations and data analysis

**ImageGenerationTool**: Generate images from text prompts as part of agent responses

**ComputerTool**: Automate computer interactions
- Pricing: $3/1M input tokens, $12/1M output tokens
- Enables agents to interact with desktop applications

### Custom Function Tools

Developers can create custom tools by decorating Python functions:

```python
from openai_agents import function_tool

@function_tool
async def fetch_weather(location: str) -> str:
    """Fetch the weather for a given location."""
    # Implementation
    return "Sunny, 72°F"
```

The decorator automatically extracts:
- Tool name from function name
- Description from docstring
- Input schema from type hints

### Connector Registry

The Connector Registry (currently in limited beta) provides enterprise-focused data governance:

**Pre-built connectors:**
- Dropbox
- Google Drive
- SharePoint
- Microsoft Teams
- Third-party MCP servers

**Features:**
- Consolidates data sources into single admin panel
- Works across ChatGPT and API
- Centralized access control and security policies
- Governs connections across multiple workspaces and organizations

**Availability:** Beta rollout to API, ChatGPT Enterprise, and Edu customers. Requires Global Admin Console (prerequisite).

## Evals for Agents

AgentKit includes a comprehensive evaluation platform specifically designed for agents. The Evals system reduces development time by 50% and increases agent accuracy by 30% according to user reports.

### Four Core Capabilities

**1. Datasets**
Build and expand evaluation test sets systematically:
- Rapidly create agent evals from scratch
- Expand datasets over time with human annotations
- Integrate automated grader outputs
- Continuously grow test coverage as agents evolve

**Use case:** Create a dataset of 100 customer queries representing different intents, edge cases, and failure modes. As issues are discovered in production, add them to the dataset to prevent regression.

**2. Trace Grading**
End-to-end assessment of agentic workflows:
- Automate grading of multi-step agent execution
- Pinpoint shortcomings in decision-making
- Grade individual steps and overall workflow
- Visual trace inspection for debugging

**How it works:**
- Each agent action is recorded as a trace step
- Automated graders evaluate correctness at each step
- Identify where agents fail or underperform
- Generate actionable insights for improvement

**Use case:** An agent workflow with 5 steps (classify → search → summarize → verify → respond) fails on certain queries. Trace grading reveals the classification step is incorrect for edge cases, enabling targeted fixes.

**3. Automated Prompt Optimization**
Data-driven improvement of agent instructions:
- Generate optimized prompts based on evaluation results
- Learn from human annotation feedback
- Leverage automated grader outputs
- Iterative prompt refinement

**Workflow:**
1. Run evaluations on current agent prompts
2. Analyze failures and successes
3. Automatically generate improved prompt variations
4. Test and compare performance
5. Iterate until optimal performance achieved

**Use case:** An agent's response quality is inconsistent. Automated prompt optimization tests 10 variations, identifies that adding "Be concise and cite sources" improves accuracy by 25%, and applies the change.

**4. Third-Party Model Support**
Evaluate any LLM within the unified platform:
- Test models from providers other than OpenAI
- Compare performance across different models
- Make data-driven decisions about model selection
- Risk mitigation for model changes

**Supported models:** The [[openai-agents-sdk]] supports 100+ LLM providers, all of which can be evaluated through the Evals platform.

**Use case:** Compare gpt-4o, claude-3.5-sonnet, and llama-3.1-70b on your specific agent workflow to determine which provides the best accuracy-to-cost ratio.

### Integration with Agent Builder

Evals are tightly integrated into the Agent Builder workflow:
- **Inline evaluation configuration**: Set up evaluation criteria directly in the workflow editor
- **Preview runs with evaluation**: Test workflows and see evaluation results immediately
- **Version comparison**: Compare performance across different workflow versions
- **Continuous improvement loops**: Automatically run evals after each change

### Automatic Tracing

The [[openai-agents-sdk]] automatically traces all agent runs, making it easy to track and debug agent behavior. Tracing is extensible by design and supports custom spans.

**External integrations:**
- **Logfire**: Logging and monitoring
- **AgentOps**: Agent-specific operations tracking
- **Braintrust**: AI evaluation platform
- **Scorecard**: Performance metrics
- **Keywords AI**: Keyword and intent analysis
- **Langfuse**: Trace management and analysis

### Real-World Impact

**Development time:** Cut development time on multi-agent due diligence frameworks by **over 50%**

**Accuracy:** Increased agent accuracy by **30%** for organizations using the Evals platform

**Iteration speed:** Ramp reported **70%** improvement in iteration speed after migrating to AgentKit

### Resources

- Agent Evals documentation: https://platform.openai.com/docs/guides/agent-evals
- OpenAI Evals (open-source framework): https://github.com/openai/evals
- Langfuse integration guide: https://langfuse.com/guides/cookbook/example_evaluating_openai_agents

## Relationship to Agents SDK and Responses API

AgentKit provides two complementary development approaches:

### Visual-First vs. Code-First

**AgentKit (Visual-First):**
- Agent Builder: Drag-and-drop workflow composition
- Learning curve: 2-3 days
- Best for: Rapid prototyping, business users, visual thinkers
- Deployment: Integrated via ChatKit
- Iteration: Visual changes without coding

**[[openai-agents-sdk]] (Code-First):**
- Programmatic agent composition in Python/TypeScript/Go
- Learning curve: 5-7 days
- Best for: Developers, complex custom logic, version control
- Deployment: Custom integrations
- Iteration: Code changes with full control

### Responses API Foundation

Both approaches are built on the **Responses API**, OpenAI's new API primitive specifically designed for agents. The Responses API combines:
- Simplicity of Chat Completions API
- Tool-use capabilities of Assistants API
- State management for multi-step conversations
- Built-in tool support (file search, web search, MCP, code interpreter)

**Key insight:** Whether you build visually in Agent Builder or programmatically with the Agents SDK, you're using the same underlying Responses API, ensuring consistency and portability.

### Code Export Bridge

Agent Builder's code export feature bridges the two approaches:
1. **Prototype visually** in Agent Builder for rapid iteration
2. **Export to SDK code** when you need customization beyond visual capabilities
3. **Refine programmatically** with full control over agent logic
4. **Deploy via ChatKit or custom integrations**

This workflow enables collaboration between business users (who design workflows visually) and developers (who refine and deploy code).

### Evolution from Swarm

The Agents SDK is the production-ready evolution of OpenAI's experimental Swarm framework. OpenAI recommends migrating all production use cases from Swarm to the Agents SDK. AgentKit represents the next step: making agent development accessible to non-coders while maintaining code-level control for developers.

## Use Cases in Context Engineering

AgentKit enables several [[context-engineering]] strategies through its visual workflow design and integrated tooling.

### Multi-Agent Orchestration

The classifier + routing pattern demonstrated in the DevDay demo is a foundational multi-agent strategy:
- **Triage agent** categorizes incoming requests
- **Specialized agents** handle specific types of queries with appropriate context and tools
- **Handoffs** maintain conversation state during transfers
- **Guardrails** ensure safety at each step

**Example:** Customer service agent system with specialists for billing, technical support, account management, and general inquiries. Each specialist has domain-specific knowledge and tools.

### Human-in-the-Loop Workflows

Approval nodes enable critical decision validation:
- **Financial transactions**: Require human approval before executing payments
- **Content publishing**: Review agent-generated content before posting
- **Data deletion**: Confirm sensitive operations with human oversight
- **Compliance**: Ensure regulatory requirements are met

**Example:** Procurement agent that researches vendors, generates comparison reports, and requires procurement manager approval before placing orders.

### Research Agents with Tool Integration

Combining file search, web search, and MCP tools enables powerful [[research-agents]]:
- **Document analysis**: File search over internal knowledge bases
- **Current information**: Web search for latest data and news
- **Data enrichment**: MCP connectors to CRM, databases, APIs
- **Iterative refinement**: Loop nodes for multi-step research

**Example:** Market research agent that searches internal reports, gathers competitive intelligence from the web, enriches data from industry databases, and compiles comprehensive analysis reports.

### Agentic RAG Workflows

AgentKit facilitates [[retrieval-augmented-generation]] patterns:
- **File search tool** provides semantic retrieval from vector stores
- **Transform nodes** reshape retrieved context for optimal prompts
- **Guardrails** prevent hallucinations by verifying against source documents
- **Widgets** display sources and citations inline with responses

**Example:** Technical documentation assistant that retrieves relevant docs, verifies accuracy against sources, and displays answers with inline citation widgets.

### Rapid Prototyping and Deployment

The visual workflow + ChatKit deployment reduces time from concept to production:
- **Day 1**: Design workflow in Agent Builder, test with preview runs
- **Day 2**: Refine based on feedback, configure guardrails and evals
- **Day 3**: Deploy via ChatKit, monitor with tracing and evaluations

**Real-world validation:** Ramp migrated 3 procurement agents from LangChain to AgentKit in 5 days, achieving 65% codebase reduction and 70% iteration speed improvement.

## Comparison to Other Frameworks

AgentKit competes with several categories of agent development tools. Understanding the trade-offs helps inform technology selection.

### vs. LangGraph

**[[langgraph]]** is LangChain's graph-based orchestration framework for building stateful, multi-agent systems.

**LangGraph characteristics:**
- Code-first, explicit graph structures (nodes and edges)
- Vendor-agnostic: supports 100+ LLM providers (OpenAI, Anthropic, local models)
- Low-level orchestration framework with deep customization
- Can be deployed anywhere
- Steeper learning curve (5-7 days typical)
- Best for complex stateful workflows requiring fine-grained control

**AgentKit characteristics:**
- Visual-first, drag-and-drop workflow design
- OpenAI-focused (though Agents SDK supports other providers)
- Higher-level platform with integrated deployment (ChatKit)
- Reduced learning curve (2-3 days typical)
- Built-in evaluation and safety tools
- Best for rapid iteration and enterprise integration

**When to choose:**
- **LangGraph**: Multi-model flexibility, vendor-agnostic solutions, complex custom logic, deep graph-based orchestration
- **AgentKit**: Visual development, OpenAI ecosystem integration, fast time-to-market, built-in deployment and evaluation

**Real-world comparison:** Ramp migrated from LangChain/LangGraph to AgentKit and achieved 65% codebase reduction with 70% faster iteration.

### vs. Claude Agent SDK

**[[claude-agent-sdk]]** is Anthropic's framework for building agents with Claude models.

**Claude Agent SDK characteristics:**
- Code-first Python/TypeScript framework
- Anthropic platform and Claude models
- Native MCP integration for tool portability
- Computer Use capabilities for desktop automation
- Stateful execution with conversation history

**AgentKit characteristics:**
- Visual-first with code export option
- OpenAI platform and GPT models
- Native MCP integration (same standard)
- ChatKit for web deployment
- Visual workflow design with Agent Builder

**When to choose:**
- **Claude Agent SDK**: Preference for Anthropic/Claude, Computer Use requirements, code-first development
- **AgentKit**: Preference for OpenAI/GPT, visual workflow design, integrated evaluation platform

**Note:** Both support MCP ([[model-context-protocol]]), enabling tool portability across platforms.

### vs. AutoGPT

**AutoGPT** represents a different paradigm: fully autonomous AI agents that self-direct task completion.

**AutoGPT characteristics:**
- Maximum AI autonomy with minimal human intervention
- Autonomous cycle: goal → subtasks → research → execute → iterate
- Self-directed task completion
- Experimental, less structured
- Best for exploratory, open-ended tasks

**AgentKit characteristics:**
- Structured, node-based workflows with explicit control
- Human-guided agent development
- Enterprise-ready with guardrails and admin controls
- Best for production applications with defined workflows

**When to choose:**
- **AutoGPT**: Exploratory research, maximum autonomy, experimental projects
- **AgentKit**: Production applications, explicit control, safety-critical systems

### vs. No-Code Automation Tools (n8n, Zapier, Make)

Sam Altman directly positioned AgentKit as competing with no-code automation platforms by describing Agent Builder as "like Canva for building agents."

**No-code tools (n8n, Zapier, Make):**
- Traditional automation workflows
- API integrations and webhooks
- Rule-based logic (if-then-else)
- No AI reasoning or natural language understanding

**AgentKit:**
- AI-native workflows with LLM reasoning
- Intelligent routing with classifier agents
- Natural language understanding and generation
- Advanced reasoning capabilities
- Built-in evaluation and optimization

**When to choose:**
- **n8n/Zapier**: Simple API integrations, deterministic workflows, traditional automation
- **AgentKit**: AI reasoning required, natural language interfaces, complex decision-making

### vs. Letta (MemGPT)

**[[letta]]** is a memory-augmented agent platform with hierarchical memory and agentic RAG.

**Letta characteristics:**
- Memory-first architecture with explicit memory management
- Hierarchical memory: working memory, recall memory, archival memory
- Agentic RAG with autonomous retrieval
- Code-first Python framework

**AgentKit characteristics:**
- Workflow-first architecture with state management
- File search for retrieval (vector stores)
- Visual workflow design with Agent Builder
- Integrated deployment and evaluation

**When to choose:**
- **Letta**: Long-term memory and stateful conversations across sessions, memory-augmented reasoning
- **AgentKit**: Visual workflow design, rapid deployment, integrated evaluation

## Real-World Examples and Impact

### Ramp - Procurement Agents

**Challenge:** Complex procurement workflows built with LangChain were slow to iterate and maintain.

**Solution:** Migrated 3 procurement agents to AgentKit in 5 days.

**Results:**
- **65% codebase reduction**: Less code to maintain and debug
- **70% iteration speed improvement**: Faster to test and deploy changes
- Quote: "Agent Builder transformed what once took months of complex orchestration, custom code, and manual optimizations into just a couple of hours"

### Klarna - Customer Support

**Challenge:** High volume of customer support tickets requiring 24/7 coverage.

**Solution:** Deployed support agents built with AgentKit.

**Results:**
- **2/3 of all tickets** handled by AI agents
- Reduced response times
- Consistent support quality

### Clay - Sales Agents

**Challenge:** Scaling sales operations to handle growth.

**Solution:** Optimized sales agents using AgentKit's evaluation platform.

**Results:**
- **10× growth** in sales operations
- Data-driven optimization with Evals
- Continuous improvement through automated testing

### DevDay Demo - Ask Froge Agent

**Challenge:** Build and deploy an agent for the DevDay website in 8 minutes live on stage.

**Solution:** Christina from the OpenAI team used Agent Builder to create "Ask Froge," an agent that helps attendees navigate the conference schedule.

**Workflow:**
1. **Categorizing agent** classifies queries as session-related or general info
2. **If/else routing** directs to appropriate specialist
3. **Session agent** uses file search + custom widget for visual session display
4. **Dev day agent** uses file search + Froge personality for general info
5. **PII guardrail** protects against sensitive information leaks
6. **ChatKit deployment** embedded in DevDay website with custom branding

**Results:**
- Completed in **7 minutes 11 seconds** (49 seconds to spare)
- Deployed live to production
- Available to all DevDay attendees via "Ask Froge" link
- Demonstrated real-world viability of visual agent development

**Key quote:** "In just a few minutes, we've designed an agent workflow visually. We added in some tools and widgets. We previewed it, we deployed it, we tested it, and now you all can use it."

### Development Metrics

Across all AgentKit users:
- **50% reduction** in development time for multi-agent frameworks
- **30% increase** in agent accuracy for Evals users
- **2-3 day learning curve** vs. 5-7 days for code-first frameworks

## How It Relates

AgentKit integrates with several concepts and technologies in the agent development ecosystem:

**Agent Development:**
- [[openai-agents-sdk]] - Code-first companion to AgentKit's visual approach
- [[openai-responses-api]] - Underlying API that powers both AgentKit and Agents SDK
- [[claude-agent-sdk]] - Anthropic's alternative for building agents with Claude
- [[langgraph]] - LangChain's graph-based orchestration framework
- [[letta]] - Memory-augmented agent platform

**Tool Integration:**
- [[model-context-protocol]] - Standard for tool integration used by AgentKit's MCP connectors
- [[tool-abstraction-portability]] - MCP provides tool portability across agent platforms

**Context Engineering:**
- [[context-engineering]] - AgentKit enables visual implementation of context engineering strategies
- [[research-agents]] - File search and web search tools enable research agent workflows
- [[retrieval-augmented-generation]] - File search tool facilitates RAG patterns

**Workflow Orchestration:**
- [[temporal]] - Durable workflow engine (integration demos available)

**Observability:**
- Third-party integrations: Langfuse, Braintrust, AgentOps, Logfire

## Key Technologies

AgentKit uses and integrates with several key technologies:

- **GPT-4o and GPT-4o-mini** - Primary models for agent reasoning
- **Responses API** - OpenAI's agent-focused API primitive
- **Model Context Protocol (MCP)** - Open standard for tool integration
- **Vector Stores** - Document indexing for file search
- **Microsoft Presidio** - PII detection framework used in Guardrails
- **React** - Framework for ChatKit and Widget Builder components
- **CEL (Common Expression Language)** - Transform and loop node expressions
- **Mapbox** - Mapping widgets
- **Embla** - Carousel widgets

## Resources

### Official Documentation
- AgentKit Overview: https://openai.com/index/introducing-agentkit/
- Agent Platform: https://openai.com/agent-platform/
- Agent Builder: https://platform.openai.com/agent-builder
- Agent Builder Docs: https://platform.openai.com/docs/guides/agent-builder
- Responses API Reference: https://platform.openai.com/docs/api-reference/responses
- MCP Documentation: https://platform.openai.com/docs/mcp
- File Search Guide: https://platform.openai.com/docs/guides/tools-file-search
- Agent Evals: https://platform.openai.com/docs/guides/agent-evals
- Building Agents Track: https://developers.openai.com/tracks/building-agents/
- Practical Guide (PDF): https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf

### GitHub Repositories
- ChatKit JS: https://github.com/openai/chatkit-js
- ChatKit Starter App: https://github.com/openai/openai-chatkit-starter-app
- ChatKit Advanced Samples: https://github.com/openai/openai-chatkit-advanced-samples
- Agents Python SDK: https://github.com/openai/openai-agents-python
- Agents TypeScript SDK: https://github.com/openai/openai-agents-js
- Guardrails Python: https://github.com/openai/openai-guardrails-python
- Apps SDK Examples: https://github.com/openai/openai-apps-sdk-examples
- OpenAI Evals: https://github.com/openai/evals
- Realtime Agents Demo: https://github.com/openai/openai-realtime-agents
- Temporal Integration Demos: https://github.com/temporal-community/openai-agents-demos

### SDK Documentation
- Python Agents SDK: https://openai.github.io/openai-agents-python/
- TypeScript Agents SDK: https://openai.github.io/openai-agents-js/
- ChatKit Docs: https://openai.github.io/chatkit-js/
- Guardrails: https://guardrails.openai.com/docs/
- Apps SDK: https://developers.openai.com/apps-sdk/

### Community Resources
- OpenAI Developer Community: https://community.openai.com/
- TechCrunch Coverage: https://techcrunch.com/2025/10/06/openai-launches-agentkit-to-help-developers-build-and-ship-ai-agents/
- Langfuse Integration: https://langfuse.com/guides/cookbook/example_evaluating_openai_agents
- Composio Integration: https://composio.dev/blog/openai-agent-builder-step-by-step-guide-to-building-ai-agents-with-mcp

---

## Changelog
- **2025-10-09**: Initial documentation based on DevDay 2025 announcement and demonstration
