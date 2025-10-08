---
date: 2025-10-08T11:09:05+00:00
planner: Claude
topic: "OpenAI Agents Python SDK"
tags: [vault-planning, agents, openai, python, multi-agent, orchestration]
status: ready_to_write
---

# Vault Notes Plan: OpenAI Agents Python SDK

## Research Summary

The OpenAI Agents Python SDK is a production-ready, lightweight framework released in March 2025 that evolved from OpenAI's experimental "Swarm" project (October 2024). It represents OpenAI's official approach to building multi-agent AI applications with minimal abstractions and maximum developer control.

### Key Findings from Research:

**Web Research:**
- Official documentation at https://openai.github.io/openai-agents-python/
- Production-ready framework with 15.7k GitHub stars (7 months old)
- Real-world deployments: Coinbase AgentKit (built in "just a few hours"), Albertsons (2,000+ stores), HubSpot (Breeze AI)
- Uses OpenAI Responses API underneath (not legacy Assistants API)
- Provider-agnostic via LiteLLM integration (100+ models beyond OpenAI)
- Temporal partnership for durable execution announced July 2025
- Philosophy: "provide enough features to be useful, remain quick to learn, work well out of the box"

**Existing Vault Notes:**
- No OpenAI agent framework coverage currently
- Related notes: [[langgraph]], [[claude-agent-sdk]], [[letta]] provide context for agent frameworks
- [[model-context-protocol]] relevant for tool integration patterns
- [[context-engineering]], [[research-agents]], [[multi-tool-agent]] provide conceptual grounding

**Thoughts Directory:**
- Planning docs exist for Claude Agent SDK and LangGraph
- No OpenAI-specific agent documentation found
- Gap in coverage that this plan addresses

**Ecosystem Context:**
- Swarm was experimental predecessor (now replaced by Agents SDK)
- Responses API is the unified, stateless API the SDK uses
- Assistants API is legacy stateful approach (deprecating mid-2026)
- Positions between simple Chat Completions and complex orchestration frameworks like LangGraph

---

## Scope Decision

### Recommended Approach: Two Notes + One Update

This topic requires multiple notes because the OpenAI agent ecosystem consists of distinct technologies serving different purposes.

### Notes to Create:

1. **OpenAI Agents SDK** (`apps/vault/tech/openai-agents-sdk.md`)
   - **Type**: technology
   - **Rationale**: Primary SDK/framework - distinct technology comparable to Claude Agent SDK and LangGraph, represents OpenAI's official agent framework

2. **OpenAI Responses API** (`apps/vault/tech/openai-responses-api.md`)
   - **Type**: technology
   - **Rationale**: Separate API technology used by thousands of developers directly (not just through SDK), represents OpenAI's unified agent API architecture, serves broader use cases beyond the SDK

3. **Claude Agent SDK Update** (existing `apps/vault/tech/claude-agent-sdk.md`)
   - **Type**: update to existing technology note
   - **Rationale**: Add comparison section to provide developers with decision-making framework when choosing between the two major first-party agent SDKs

---

## Note 1: OpenAI Agents SDK

### File Location
`apps/vault/tech/openai-agents-sdk.md`

### Structure

1. **Overview**
   - What is the OpenAI Agents SDK
   - Production-ready framework, lightweight philosophy
   - Evolution from Swarm (brief mention only)
   - Release date and maturity context
   - When to use vs alternatives

2. **Core Architecture**
   - Agent execution loop breakdown
   - Runner system (run, run_sync, run_streamed)
   - Execution flow diagram
   - Multi-agent patterns: handoffs vs agents-as-tools
   - Technical flow components

3. **Key Features**
   - Built-in agent loop with max_turns
   - Function tools with auto-schema generation (@function_tool decorator)
   - Handoff capabilities (one-way transfer, customization)
   - Parallel guardrails (input/output validation, optimistic execution)
   - Automatic session management (multiple backends)
   - Integrated tracing (free OpenAI dashboard)
   - Structured outputs (Pydantic models)
   - Real-time streaming
   - Model agnosticism (100+ LLMs via LiteLLM)
   - Lifecycle hooks

4. **Core Concepts**
   - **Agents**: Configuration (name, instructions, model, tools, handoffs, guardrails, output_type)
   - **Tools**: Three types (hosted tools, function tools, agents-as-tools)
   - **Handoffs**: Delegation mechanism, customization options
   - **Guardrails**: Input/output validation, optimistic execution
   - **Sessions**: Conversation history management, backend types
   - **Context**: Local context (RunContextWrapper) vs LLM context
   - **Runner**: Orchestration methods and configuration
   - **Tracing**: Built-in observability, spans, third-party integrations

5. **Use Cases in Context Engineering**
   - Customer support automation (multi-tier with handoffs)
   - Financial services & investment research
   - Cryptocurrency & blockchain (Coinbase AgentKit case study)
   - Enterprise data & search (Box integration)
   - Research & information gathering
   - Content generation pipelines
   - Code review & development
   - Sales & prospecting
   - When to use SDK (ideal scenarios)
   - When NOT to use (limitations)

6. **Integration Patterns**
   - Basic hello world example
   - Function tool example
   - Multi-agent with handoffs
   - Structured output example
   - Session management example
   - Guardrails example
   - Context management example
   - Streaming example
   - Agents-as-tools pattern
   - Tracing example
   - Error handling example

7. **Comparison with Alternatives**
   - Comparison matrix: OpenAI SDK vs LangGraph vs CrewAI vs AutoGen
   - Key differentiators for each framework
   - When to choose OpenAI Agents SDK
   - When to choose alternatives
   - Hybrid approaches

8. **Best Practices**
   - Security (least privilege, safety checks)
   - Performance (caching, streaming, subagents, turn limits)
   - Cost management (token tracking, model selection, monitoring)
   - Reliability (error handling, verification, monitoring)
   - Context management (compaction, scoping, subagents)
   - Deployment (environment setup, authentication, observability, rollout)

9. **Getting Started**
   - Installation: `pip install openai-agents`
   - System requirements (Python 3.9+)
   - Model support (default: gpt-4.1)
   - Authentication setup
   - Cost information

10. **Resources**
    - Official documentation links
    - GitHub repository
    - OpenAI Cookbook examples
    - Integration guides (Temporal, LangSmith, Langfuse)
    - Tutorial resources

11. **Related Technologies**
    - Links to vault notes with brief context

### Key Content Points

**Overview & Context:**
- Released March 2025 as production successor to experimental Swarm (October 2024)
- 15.7k GitHub stars, MIT license, actively maintained (updated October 7, 2025)
- Philosophy: "provide enough features to be useful, remain quick to learn, work well out of the box"
- Production deployments: Coinbase (AgentKit built in hours), Albertsons (2,000+ stores), HubSpot (Breeze AI)
- Built on OpenAI Responses API (not legacy Assistants API)
- Provider-agnostic: OpenAI models + 100+ LLMs via LiteLLM
- https://openai.github.io/openai-agents-python/
- https://github.com/openai/openai-agents-python

**Architecture Highlights:**
- Runner loop: Initialize → LLM Call → Process Output (tool calls/handoffs/final output) → Repeat
- MaxTurnsExceeded and GuardrailTripwireTriggered exceptions
- Multi-agent patterns: Handoffs (delegation, full context transfer) vs Agents-as-Tools (orchestration, centralized control)

**Feature Details:**
- Automatic schema extraction from function signatures with Pydantic validation
- Handoff customization: callbacks, input filtering, structured data passing
- Guardrails: optimistic execution model (agent runs while guardrails check in parallel)
- Session backends: OpenAI Conversations API, SQLite, SQLAlchemy, Redis, custom
- Tracing: enabled by default, free in OpenAI dashboard, captures agents/LLM/tools/handoffs/guardrails
- Hosted tools: WebSearchTool, FileSearchTool, CodeInterpreterTool, ComputerTool, ImageGenerationTool, etc.
- Lifecycle hooks: on_llm_start, on_llm_end, on_agent_start, on_agent_end

**Real-World Examples:**
- Coinbase AgentKit: "just a few hours" from prototype to production using Swarm → SDK upgrade
- Portfolio collaboration: hub-and-spoke with specialist analysts (macro, fundamental, quantitative)
- Temporal integration: durable execution, automatic handling of rate limits/failures, cost savings from recovery
- Scale: "trillions of tokens" processed through Responses API by "hundreds of thousands of developers"
- Users: Zencoder (coding), Revi (market intelligence), MagicSchool AI (education)

**Comparison Context:**
- vs LangGraph: Simpler (linear flows) vs more powerful (graph-based state machines)
- vs CrewAI: Simple delegation vs role-based teams with parallel execution
- vs AutoGen: Production-focused vs research-oriented conversational flexibility
- vs Claude Agent SDK: Different model ecosystems, different orchestration patterns (see detailed comparison in Claude SDK note)

**Best Practices Highlights:**
- Handoff pattern: lower latency and token usage vs orchestrator pattern
- Never use force push to main/master
- Use multiple specialized guardrails for resilience
- Start small, validate with real users, iterate
- Not every task needs the smartest model
- Enable tracing for debugging and monitoring

**Cost & Performance:**
- Default model: gpt-4.1
- Typical agent action costs vary by model and complexity
- LiteLLM enables cost optimization across 100+ providers
- Automatic prompt caching support

**Production Considerations:**
- Temporal integration for long-running workflows (announced July 2025)
- Third-party tracing: LangSmith, Langfuse, Weights & Biases, MLflow, Braintrust, AgentOps, Scorecard
- Authentication options: API key, Bedrock, Vertex
- Not available for Zero Data Retention organizations (tracing limitation)

### Relationships & Links

- **Links to existing notes**:
  - [[langgraph]] - comparison context, alternative orchestration framework
  - [[claude-agent-sdk]] - comparison context, alternative first-party SDK
  - [[letta]] - comparison context, memory-focused agent framework
  - [[model-context-protocol]] - tool integration protocol
  - [[composio]] - tool integration platform with MCP support
  - [[context-engineering]] - strategies for managing agent context
  - [[research-agents]] - research-specific patterns
  - [[multi-tool-agent]] - multi-tool integration patterns
  - [[temporal]] - infrastructure workflow orchestration
  - [[tool-abstraction-portability]] - MCP standardization benefits
  - [[anthropic-context-pattern]] - multi-agent context patterns

- **New wikilinks to create**:
  - [[openai-responses-api]] - underlying API the SDK uses (TODO: create this note)

### Frontmatter

```yaml
title: OpenAI Agents SDK
type: technology
category: development
tags: [agents, sdk, openai, python, multi-agent, orchestration, handoffs, guardrails]
created: 2025-10-08
updated: 2025-10-08
website: https://openai.github.io/openai-agents-python/
github: https://github.com/openai/openai-agents-python
docs: https://openai.github.io/openai-agents-python/
```

### Success Criteria

- [ ] Overview clearly explains the SDK's purpose and value proposition
- [ ] Evolution from Swarm is mentioned briefly without excessive focus
- [ ] Architecture section explains agent loop, Runner system, and multi-agent patterns
- [ ] All key features are documented with sufficient detail
- [ ] Core concepts (8 primitives) are clearly explained
- [ ] Real-world use cases include specific company examples
- [ ] Code examples are practical and demonstrate key patterns
- [ ] Comparison table helps developers choose between frameworks
- [ ] Best practices cover security, performance, cost, reliability, deployment
- [ ] All [[wikilinks]] point to existing notes or are marked as TODOs
- [ ] Resources section provides authoritative links
- [ ] Related technologies section connects to broader vault ecosystem
- [ ] Follows technology note template structure

---

## Note 2: OpenAI Responses API

### File Location
`apps/vault/tech/openai-responses-api.md`

### Structure

1. **Overview**
   - What is the Responses API
   - Unified, stateless API architecture
   - Launch date (March 2025)
   - Purpose: "future direction" for OpenAI agents
   - Replaces Assistants API (deprecating mid-2026)

2. **Architecture**
   - Single endpoint: `/v1/responses`
   - Stateless by default design
   - Optional state management via `previous_response_id`
   - How it differs from Chat Completions and Assistants APIs
   - Performance characteristics

3. **Key Features**
   - Built-in tools (web search, file search, code interpreter, computer use, image generation, local shell)
   - Structured outputs support
   - State management options
   - Streaming capabilities
   - Model support

4. **Relationship to Other OpenAI APIs**
   - vs Chat Completions API: Enhanced with tool capabilities
   - vs Assistants API: Simpler, faster, more flexible
   - Migration path from Assistants API
   - Timeline: Assistants API deprecation mid-2026

5. **Use Cases**
   - When to use Responses API directly
   - When to use via Agents SDK
   - When to use legacy Assistants API (migration only)
   - Production examples: Zencoder, Revi, MagicSchool AI

6. **Integration with Agents SDK**
   - How the Agents SDK uses Responses API
   - SDK abstractions built on top
   - When to use SDK vs raw API

7. **Best Practices**
   - State management strategies
   - Tool usage patterns
   - Performance optimization
   - Migration from Assistants API

8. **Getting Started**
   - Endpoint details: `/v1/responses`
   - Basic usage example
   - Authentication
   - Model selection

9. **Resources**
   - Official documentation
   - Migration guides
   - API reference

### Key Content Points

**Overview & Context:**
- Released March 2025 as OpenAI's "future direction" for building agents
- Single `/v1/responses` endpoint combining Chat Completions simplicity + Assistants tool capabilities
- "Faster, more flexible, and easier" than Assistants API (developer reports)
- Stateless by default with optional server-side state via `previous_response_id`
- Usage scale: "trillions of tokens" processed by "hundreds of thousands of developers"
- https://platform.openai.com/docs/guides/agents

**Architecture Details:**
- Stateless-by-default, client-side approach giving developers control
- Analogous to `chat.completions.create()` - "takes messages and returns messages and saves no state between calls"
- Allows optional server-side state management through parameters
- Better performance than Assistants API (faster response times reported by developers)

**Built-in Tools:**
- Web search: Query search engines
- File search: Vector store retrieval
- Code interpreter: Sandboxed code execution
- Computer use: Computer automation
- Image generation: DALL-E integration
- Local shell: Shell commands
- Hosted MCP: MCP server integration

**Assistants API Comparison:**
- Assistants: Stateful, server-side, multi-object structure (assistants, threads, messages, runs), slower
- Responses: Stateless, client-side by default, single endpoint, faster, more control
- Migration: OpenAI will provide clear migration guide, Assistants API continues until mid-2026 deprecation
- Recommendation: New projects should use Responses API

**Production Users:**
- Zencoder: Coding agent for software development
- Revi: Market intelligence agent for private equity/investment banking
- MagicSchool AI: Education assistant for teachers and students
- Plus: Coinbase (via SDK), Albertsons (via SDK), HubSpot (via SDK)

**Integration Context:**
- OpenAI Agents SDK built on top of Responses API
- SDK adds: agent loop, handoffs, guardrails, sessions, tracing
- Direct API use for: custom orchestration, specific needs, non-Python languages
- SDK use for: rapid development, built-in features, Python applications

### Relationships & Links

- **Links to existing notes**:
  - [[context-engineering]] - strategies for working with stateless APIs
  - [[claude-agent-sdk]] - comparison of different API architectures (stateful Anthropic vs stateless OpenAI)

- **Links to new note**:
  - [[openai-agents-sdk]] - primary framework consumer of this API

### Frontmatter

```yaml
title: OpenAI Responses API
type: technology
category: development
tags: [openai, api, agents, stateless, tools]
created: 2025-10-08
updated: 2025-10-08
website: https://platform.openai.com/docs/guides/agents
docs: https://platform.openai.com/docs/api-reference/responses
```

### Success Criteria

- [ ] Overview explains the API's purpose and positioning
- [ ] Architecture section clarifies stateless design and state options
- [ ] Relationship to Assistants API is clear (replacement timeline)
- [ ] Built-in tools are documented
- [ ] Integration with Agents SDK is explained
- [ ] Use cases help developers choose between API and SDK
- [ ] Migration path from Assistants API is mentioned
- [ ] All [[wikilinks]] point to existing or planned notes
- [ ] Resources provide official documentation links
- [ ] Follows technology note template structure

---

## Note 3: Claude Agent SDK Update

### File Location
`apps/vault/tech/claude-agent-sdk.md` (existing note)

### Changes Required

**New Section to Add**: "Comparison with OpenAI Agents SDK"

Insert this section after "Comparison with Alternatives" section (after line 310, before line 340).

### New Section Content

```markdown
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
```

### Success Criteria for Update

- [ ] Comparison table is comprehensive and accurate
- [ ] Decision criteria clearly guide developers
- [ ] Links to [[openai-agents-sdk]] and [[openai-responses-api]] work correctly
- [ ] Maintains balanced, neutral tone (no favoritism)
- [ ] Integrates naturally with existing content
- [ ] Production use examples are accurate and current

---

## Research References

**Official Documentation:**
- OpenAI Agents SDK Documentation: https://openai.github.io/openai-agents-python/
- GitHub Repository: https://github.com/openai/openai-agents-python
- OpenAI Platform - Agents Guide: https://platform.openai.com/docs/guides/agents
- OpenAI Platform - Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI Cookbook - Agents: https://cookbook.openai.com/topic/agents
- Swarm (Experimental): https://github.com/openai/swarm

**Blog Posts & Announcements:**
- OpenAI Blog - Responses API Launch: https://openai.com/index/new-tools-and-features-in-the-responses-api/
- OpenAI DevDay 2025 - AgentKit: https://openai.com/index/introducing-agentkit/
- Temporal Integration Announcement: https://temporal.io/blog/announcing-openai-agents-sdk-integration

**Case Studies & Examples:**
- Coinbase AgentKit: https://www.coinbase.com/developer-platform/discover/launches/openai-agents-sdk
- OpenAI Cookbook - Portfolio Collaboration: https://cookbook.openai.com/examples/agents_sdk/multi-agent-portfolio-collaboration/
- Temporal Demos: https://github.com/temporal-community/openai-agents-demos

**Comparisons & Analysis:**
- Framework Comparison (Composio): https://composio.dev/blog/openai-agents-sdk-vs-langgraph-vs-autogen-vs-crewai
- Agent Frameworks Comparison (Langfuse): https://langfuse.com/blog/2025-03-19-ai-agent-comparison
- Assistants vs Responses API: https://ragwalla.com/blog/openai-assistants-api-vs-openai-responses-api-complete-comparison-guide
- Analytics Vidhya Comparison: https://www.analyticsvidhya.com/blog/2025/03/agent-sdk-vs-crewai-vs-langchain/

**Tutorials & Guides:**
- DataCamp Tutorial: https://www.datacamp.com/tutorial/openai-agents-sdk-tutorial
- Building Agents Guide (PDF): https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- Medium Technical Deep Dive: https://mtugrull.medium.com/unpacking-openais-agents-sdk-a-technical-deep-dive-into-the-future-of-ai-agents-af32dd56e9d1

**Community:**
- OpenAI Developer Forum: https://community.openai.com/
- GitHub Discussions: https://github.com/openai/openai-agents-python/discussions

**Existing Vault Notes:**
- `apps/vault/tech/langgraph.md` - Alternative orchestration framework
- `apps/vault/tech/claude-agent-sdk.md` - Alternative first-party SDK
- `apps/vault/tech/letta.md` - Memory-focused agent framework
- `apps/vault/tech/model-context-protocol.md` - Tool integration protocol
- `apps/vault/concepts/context-engineering.md` - Agent context strategies
- `apps/vault/concepts/research-agents.md` - Research agent patterns
- `apps/vault/examples/multi-tool-agent.md` - Multi-tool patterns

**Thoughts Directory:**
- `thoughts/shared/plans/vault_notes/claude-agent-sdk.md` - Claude SDK planning doc (for comparison structure)
- `thoughts/shared/plans/vault_notes/langgraph.md` - LangGraph planning doc (for orchestration context)

---

## Index Update Required

**Yes** - Update `apps/vault/README.md`

Add to the **Agent Frameworks** section under technologies:
- [[openai-agents-sdk]] - OpenAI's production-ready agent framework
- [[openai-responses-api]] - OpenAI's unified stateless agent API

These should be listed near [[claude-agent-sdk]], [[langgraph]], and [[letta]].

---

## Additional Considerations

**Swarm Framework Handling:**
- Mentioned briefly in OpenAI Agents SDK note as evolutionary context only
- Not given own subsection or extensive coverage
- Framed as: "The SDK evolved from OpenAI's experimental Swarm project (October 2024) into a production-ready framework"
- Link to Swarm repo provided in resources but not emphasized
- Focus remains on production SDK, not experimental predecessor

**Migration Considerations:**
- Assistants API deprecation timeline (mid-2026) should be clearly stated
- Migration path mentioned but defer to OpenAI's official migration guide
- Acknowledge OpenAI will provide documentation when available

**Version & Stability:**
- SDK is 7 months old (March 2025 launch), actively maintained
- Production deployments validate stability despite young age
- Note active development and evolving features (Workflows API, ChatGPT deployment mentioned as "coming soon")

**Provider Flexibility:**
- Emphasize LiteLLM support for 100+ models
- Clarify SDK works best with OpenAI but not limited to it
- Note some features (like handoffs) optimized for OpenAI models

**Community Maturity:**
- 15.7k GitHub stars in 7 months indicates strong adoption
- Compare to mature frameworks (LangChain 90k+, but 3 years older)
- Frame as "early-to-maturing" stage with official OpenAI backing

**Cost Transparency:**
- Note variable costs depend on model, turns, and complexity
- Emphasize monitoring and cost management best practices
- Compare handoff vs orchestrator patterns for cost implications

**Relationship Clarity:**
- OpenAI Agents SDK → uses → OpenAI Responses API → replaces → Assistants API
- OpenAI Python SDK (base library) vs OpenAI Agents SDK (higher-level framework)
- Clear hierarchy and dependencies between technologies
