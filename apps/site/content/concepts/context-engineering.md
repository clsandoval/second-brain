---
title: Context Engineering
type: concept
tags: [llm, ai, context, core-concept]
created: 2025-10-03
updated: 2025-10-10
---

# Context Engineering

## Definition

Context engineering is the strategic art and science of filling an LLM's context window with the right information at the right time. It represents an evolution beyond simple prompt engineering, encompassing the systematic design and optimization of all contextual information that influences AI model behavior.

## Core Strategies

### The Four Main Approaches

1. **Write**: Save context outside the context window to help an agent perform a task
   - Store conversation history and long-term memory
   - Use specialized memory blocks (vector memory, fact extraction memory)
   - Create "scratchpads" to persist information across agent tasks

2. **Select**: Choose and retrieve only the most relevant information
   - Use [[retrieval-augmented-generation|RAG]] with reranking
   - Employ embeddings and knowledge graphs for relevance selection
   - Select appropriate tools and knowledge sources before retrieval

3. **Compress**: Reduce token usage while retaining critical information
   - Summarize or condense message history as it grows
   - Use [[context-compression-pruning|prompt compression]] techniques like LLMLingua
   - Rank retrieved information by relevance

4. **Isolate**: Manage context boundaries and separation
   - Use tools for separate workspaces
   - Split context across different components and multi-agent systems
   - Can provide up to 54% improvement in specialized agent benchmarks

## Best Practices

- Break complex tasks into focused steps using workflow frameworks
- Implement context pruning to remove outdated or conflicting information
- Follow an iterative process with formal evaluation pipelines
- Provide complete, structured context - most AI failures stem from inadequate context
- Start with simple prompts and optimize with comprehensive evaluation

## Practical Patterns for Context Engineering

### 1. Separation of Concerns (Isolate)
**Pattern**: Specialized agents with focused responsibilities
- **codebase-analyzer**: Deep "HOW" analysis with precise file:line references
- **codebase-pattern-finder**: "SHOW ME" pattern discovery with concrete examples
- **research-orchestrator**: "WHAT EXISTS" exploration with parallel sub-agents

**Key Insight**: Each agent has constrained tools (Read, Grep, Glob) and a single responsibility. This prevents context pollution and enables parallel execution.

### 2. Progressive Context Loading (Select + Compress)
**Pattern**: Multi-phase information gathering
1. **Locate phase**: Find files without reading content (codebase-locator)
2. **Filter phase**: Grep patterns before full file reads
3. **Deep read phase**: Load only confirmed relevant files completely
4. **Synthesis phase**: Compress findings into actionable insights

**Key Insight**: Don't load everything into context. Use cheap operations (grep, glob) to guide expensive ones (full file reads).

### 3. Structured Workflow Decomposition (Write)
**Pattern**: Explicit phase gates with human approval
- `/create_plan`: Requirements → Design → Tasks → Approval
- `/implement_plan`: Phase 1 → Verify → Phase 2 → Verify
- Each phase has **automated** and **manual** success criteria

**Key Insight**: Break AI work into verifiable checkpoints. Automated checks (tests, lints) validate correctness; manual checks validate intent.

### 4. Context Persistence Outside LLM (Write)
**Pattern**: Durable artifacts that survive conversation boundaries
- **Research documents**: Findings with timestamps, git commits, permalinks
- **Implementation plans**: Versioned specs with phase checkboxes
- **Permission configs**: Pre-approved operations reducing friction

**Key Insight**: Context stored in files becomes retrievable, diffable, and evolvable. Git history tracks context evolution over time.

### 5. Parallel Context Gathering (Select)
**Pattern**: Spawn multiple specialized agents concurrently
```
Task(codebase-locator, "find X components")
Task(codebase-analyzer, "analyze Y integration")
Task(thoughts-locator, "discover past decisions")
→ Wait for all → Synthesize
```

**Key Insight**: Reduces total latency and token usage. Each agent loads only relevant context for its task.

### 6. Verification Before Synthesis (Compress)
**Pattern**: Validate information before committing to context
- Read mentioned files FULLY before spawning sub-agents
- Cross-check agent findings against actual code
- Reject assumptions, verify with concrete evidence (file:line refs)

**Key Insight**: Prevents cascading errors from wrong assumptions. One bad context item can poison entire workflow.

### 7. Iterative Refinement with Skepticism (Select)
**Pattern**: Question-driven context narrowing
- Start with broad research question
- Spawn agents to gather initial findings
- Ask clarifying questions based on discoveries
- Spawn focused follow-up agents
- Iterate until no open questions remain

**Key Insight**: Don't plan with incomplete information. Missing context creates brittle plans that break during implementation.

## Advanced Techniques for Long-Horizon Tasks

### Self-Improving Context with ACE

[[agentic-context-engineering|Agentic Context Engineering (ACE)]] represents an advanced approach that creates context which evolves and improves over time. Rather than treating context as static, ACE uses a Generator-Reflector-Curator architecture to accumulate domain knowledge through structured delta updates. This addresses both context collapse (information degradation through iterative rewriting) and brevity bias (over-compression into generic summaries) in long-horizon agent tasks, enabling models to learn from execution experience without parameter updates.

### The Attention Budget Concept
Large language models have a finite **attention budget** - a fundamental constraint where models experience **context rot** (degraded recall and performance) as token count increases. All context engineering ultimately aims to maximize the value extracted from this limited resource.

### System Prompt Design Principles
Effective system prompts balance clarity with flexibility:
- **Use clear, direct language** - Avoid unnecessary verbosity
- **Strike the right balance** - Not overly rigid (prevents autonomous adaptation) nor overly vague (leads to hallucination)
- **Organize into distinct sections** - Separate concerns (role, guidelines, examples, constraints)
- **Aim for minimal precision** - Include only high-signal information
- **Test iteratively** - Continuously refine based on observed behavior

### Tool Design Best Practices
Design tools that minimize context overhead and maximize utility:
- **Self-contained** - Each tool should encapsulate its own logic without dependencies on conversation history
- **Robust to errors** - Handle edge cases gracefully with clear error messages
- **Clear intended use** - Tool descriptions should unambiguously communicate purpose and parameters
- **Avoid bloat** - Don't create overlapping tools; consolidate related functionality
- **Return structured output** - Consistent formats reduce parsing overhead in subsequent reasoning

### Context Retrieval Strategies
Move beyond static context loading to dynamic, intelligent retrieval:

**Just-in-Time Loading**:
- Use lightweight identifiers (IDs, keys) instead of full data
- Load complete information only when needed for specific operations
- Example: Store `user_id` in context, retrieve full user profile only for profile-editing operations

**Hybrid Strategies**:
- Combine pre-computed data with runtime retrieval
- Cache frequently accessed information in system prompt
- Dynamically fetch specialized or user-specific data

**Progressive Disclosure**:
- Enable agents to incrementally discover context through exploration
- Provide search and filtering tools instead of dumping all available data
- Let agents determine what information is relevant through iterative queries

### Long-Horizon Task Techniques

**1. Compaction (Compress)**:
- Summarize conversation history when approaching context window limits
- Preserve critical details while discarding redundant information
- Use LLM-powered summarization to maintain semantic richness
- Example: After 20 turns, compress first 15 turns into a summary paragraph

**2. Structured Note-Taking (Write)**:
- Agents maintain persistent notes outside the primary context window
- Store intermediate findings, decisions, and key information in external memory
- Retrieve notes selectively as needed for current task
- Example: Research agent writes findings to structured markdown files, loads relevant sections for synthesis

**3. Sub-Agent Architectures (Isolate)**:
- Spawn specialized agents for focused exploration tasks
- Main agent coordinates while sub-agents handle specific investigations with isolated context
- Enables parallel processing and prevents context pollution
- Example: [[anthropic-context-pattern|Anthropic's multi-agent research pattern]]

## Guiding Principles

Context engineering is not a solved problem but an evolving discipline. Key principles:

1. **Treat context as precious** - Every token must earn its place
2. **Optimize for the smallest effective context** - Don't add information "just in case"
3. **Prioritize agent autonomy** - As models improve, shift from explicit instructions to dynamic discovery
4. **Iterate continuously** - Context strategies must evolve with model capabilities
5. **Measure everything** - Use [[observability-in-context|observability]] to validate context effectiveness

## How It Relates

- **[[prompt-scaffolding]]**: Provides the structural framework that context engineering fills with optimized information
- **[[retrieval-augmented-generation]]**: Implements the "Select" strategy for choosing external information
- **[[context-compression-pruning]]**: Implements the "Compress" strategy for token optimization
- **[[tool-abstraction-portability]]**: Implements "Select" and "Isolate" strategies for managing external interactions
- **[[observability-in-context]]**: Provides feedback loop for measuring and optimizing context strategies
- **[[research-agents]]**: Apply long-horizon techniques for multi-step research workflows

## Key Technologies

- [[langfuse]]: Track context usage and effectiveness
- [[langgraph]]: Orchestrate context across agent workflows
- [[composio]]: Manage context from external tool interactions

## Real-World Applications

- Agentic systems managing context across multiple steps
- RAG systems selecting and compressing retrieved information
- Long conversations with history pruning and summarization
- Multi-step workflows controlling context across stages
- Research agents using structured note-taking for persistent memory
- Multi-tool agents with just-in-time context loading
- Customer service bots with compacted conversation history

---

## Changelog

- **2025-10-10**: Added reference to [[agentic-context-engineering|ACE]] as advanced self-improving context technique
- **2025-10-04**: Enhanced with Anthropic's advanced techniques - attention budget, system prompt design, tool design, retrieval strategies, long-horizon task techniques, and guiding principles
- **2025-10-03**: Initial note created with core strategies, best practices, and relationships
