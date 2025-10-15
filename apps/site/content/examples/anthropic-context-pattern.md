---
title: Anthropic's Context Engineering Pattern
type: example
tags: [context-engineering, agents, multi-agent, long-horizon]
created: 2025-10-04
updated: 2025-10-04
source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
---

# Anthropic's Context Engineering Pattern

## Overview

This example demonstrates Anthropic's comprehensive approach to context engineering for AI agents, particularly for long-horizon tasks requiring sustained attention and multi-step reasoning. The pattern combines all four core strategies ([[context-engineering|Write, Select, Compress, Isolate]]) with advanced techniques for managing the attention budget.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Coordinator Agent                   │
│  • Minimal system prompt (clear, direct language)           │
│  • Self-contained tools (robust to errors)                  │
│  • Attention budget management                              │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────┬──────────────────┬──────────────────
             │                  │                  │
             ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Sub-Agent 1 │    │ Sub-Agent 2 │    │ Sub-Agent 3 │
    │  Research   │    │  Analysis   │    │  Synthesis  │
    │  Context    │    │  Context    │    │  Context    │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                  │
           └──────────────────┴──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ External Memory  │
                    │ • Research notes │
                    │ • Decisions log  │
                    │ • Context cache  │
                    └──────────────────┘
```

## Key Components

### 1. System Prompt Design
**Challenge**: Balancing specificity with agent autonomy

**Solution**: Organized, minimal system prompts
```markdown
## Role
You are a research agent specializing in technical documentation analysis.

## Capabilities
- Search documentation using search_docs(query, filters)
- Retrieve specific pages using get_page(page_id)
- Write findings to persistent notes using write_note(content)

## Guidelines
- Load only information needed for current subtask
- Write intermediate findings to notes for later retrieval
- If context budget > 80%, compress conversation history
- Spawn sub-agents for parallel exploration tasks

## Output Format
Return structured JSON: {finding: str, confidence: float, sources: [str]}
```

**Key Insight**: Clear sections, explicit tool guidance, context management instructions built-in.

### 2. Just-in-Time Context Loading
**Challenge**: Avoid overwhelming context window with all potentially relevant data

**Implementation**:
```python
# BAD: Load everything upfront
context = load_all_user_data(user_id)  # 50k tokens
context += load_all_documents()         # 100k tokens
agent.run(task, context=context)        # Context overflow!

# GOOD: Progressive disclosure with identifiers
context = {
    "user_id": user_id,              # Lightweight identifier
    "available_docs": doc_index      # Document IDs only
}

# Agent discovers what it needs:
# 1. "I need user preferences" → Call get_user_preferences(user_id)
# 2. "I need doc #47" → Call get_document(47)
# 3. Loads only 3k tokens instead of 150k
```

**Benefits**:
- Reduces initial context by 98% in this example
- Agent autonomously determines relevance
- Scales to arbitrarily large data sources

### 3. Structured Note-Taking for Long-Horizon Tasks
**Challenge**: Multi-hour research tasks exceed single conversation context limits

**Implementation**:
```python
class ResearchAgent:
    def __init__(self):
        self.notes_path = "research_notes/"
        self.current_context_size = 0

    def conduct_research(self, topic):
        # Phase 1: Initial exploration
        findings = self.explore(topic)
        self.write_note("initial_findings.md", findings)

        # Phase 2: Deep analysis (hours later, new conversation)
        # Load only relevant note sections
        relevant_findings = self.read_note(
            "initial_findings.md",
            section="key_hypotheses"
        )

        # Context contains just the summary, not entire conversation
        analysis = self.analyze(relevant_findings)
        self.write_note("analysis.md", analysis)

        # Phase 3: Synthesis
        findings_summary = self.read_note("initial_findings.md", section="summary")
        analysis_summary = self.read_note("analysis.md", section="summary")

        # Final synthesis uses compressed context from persistent notes
        return self.synthesize([findings_summary, analysis_summary])
```

**Structure of Research Note**:
```markdown
# Research: [Topic]
Date: 2025-10-04

## Summary (100 tokens)
[High-level findings for quick context loading]

## Key Hypotheses (500 tokens)
[Hypotheses that need further investigation]

## Detailed Findings (5000 tokens)
[Full context available but loaded only when needed]

## Open Questions
[What remains uncertain]
```

**Key Insight**: Notes act as **external memory** with selective retrieval, enabling persistence across conversation boundaries.

### 4. Sub-Agent Architecture for Parallel Exploration
**Challenge**: Complex research requires exploring multiple angles simultaneously without context pollution

**Implementation**:
```python
async def research_workflow(question):
    # Main agent spawns specialized sub-agents with isolated contexts
    tasks = [
        spawn_agent(
            role="literature_searcher",
            task="Find academic papers on {question}",
            tools=["search_papers", "read_abstract"],
            context_limit=10000  # Isolated budget
        ),
        spawn_agent(
            role="code_analyzer",
            task="Find implementation examples of {question}",
            tools=["search_github", "read_file"],
            context_limit=10000
        ),
        spawn_agent(
            role="documentation_reader",
            task="Extract key concepts from official docs",
            tools=["search_docs", "read_page"],
            context_limit=10000
        )
    ]

    # Each sub-agent works in parallel with isolated context
    results = await asyncio.gather(*tasks)

    # Main agent receives only compressed summaries (3 x 500 tokens = 1500 tokens)
    # Instead of full contexts (3 x 10000 = 30000 tokens)
    compressed_findings = [summarize(r) for r in results]

    # Final synthesis with minimal context
    return synthesize(compressed_findings)
```

**Benefits**:
- **Parallelism**: 3x faster research
- **Isolation**: Each sub-agent's context pollution doesn't affect others
- **Specialization**: Focused tools and system prompts per role
- **Compression**: Main agent receives summaries, not full transcripts

### 5. Context Compaction Strategy
**Challenge**: Long conversations accumulate redundant information

**Implementation**:
```python
class ContextManager:
    def __init__(self, max_tokens=100000, compact_threshold=0.8):
        self.max_tokens = max_tokens
        self.compact_threshold = compact_threshold
        self.conversation_history = []

    def add_message(self, message):
        self.conversation_history.append(message)

        current_tokens = self.count_tokens(self.conversation_history)

        if current_tokens > self.max_tokens * self.compact_threshold:
            self.compact()

    def compact(self):
        # Keep recent messages (last 5 turns)
        recent = self.conversation_history[-10:]

        # Compress older messages
        older = self.conversation_history[:-10]
        summary = self.summarize(older, preserve=[
            "key_decisions",
            "open_questions",
            "critical_findings"
        ])

        # Replace old context with summary
        self.conversation_history = [
            {"role": "system", "content": f"Previous context: {summary}"}
        ] + recent
```

**Compaction Triggers**:
- Context > 80% capacity
- Moving to new task phase
- User explicitly requests "start fresh but remember key points"

**Preservation Strategy**:
- Always keep: Decisions, constraints, open questions, user preferences
- Can compress: Exploratory discussions, resolved issues, redundant explanations

### 6. Tool Design for Context Efficiency
**Challenge**: Bloated tools increase context overhead and reduce agent effectiveness

**Best Practices**:

```python
# BAD: Overlapping, unclear tools
def search_docs(query): ...
def find_in_docs(text): ...
def search_documentation(q): ...
def doc_search(search_term): ...
# Agent wastes tokens deciding between similar tools!

# GOOD: Single, clear, self-contained tool
def search_docs(
    query: str,
    filters: Optional[Dict] = None,
    max_results: int = 10
) -> List[SearchResult]:
    """
    Search documentation with semantic similarity.

    Args:
        query: Natural language search query
        filters: Optional filters like {"category": "api", "version": "v2"}
        max_results: Maximum results to return (default 10)

    Returns:
        List of SearchResult with fields: id, title, snippet, relevance_score

    Example:
        results = search_docs("authentication methods", filters={"category": "security"})

    Error Handling:
        - Returns empty list if no results found
        - Raises SearchError if query is malformed
    """
    # Implementation...
```

**Key Principles**:
- **Comprehensive documentation**: Reduces back-and-forth clarification
- **Structured output**: Consistent format reduces parsing overhead
- **Graceful errors**: Clear error messages prevent retry loops
- **Consolidation**: One tool per logical function

## Context Engineering Strategies Applied

### Write Strategy
- Structured note-taking for persistent memory
- Research notes with hierarchical sections
- Decision logs and intermediate findings

### Select Strategy
- Just-in-time loading with identifiers
- Progressive disclosure through exploration
- Tool-based discovery vs. upfront data dump

### Compress Strategy
- Conversation history compaction at 80% threshold
- Sub-agent summary returns instead of full transcripts
- Hierarchical note structure (summary → details)

### Isolate Strategy
- Sub-agent architectures with bounded contexts
- Specialized roles with focused tool sets
- Parallel execution preventing cross-contamination

## Benefits of This Pattern

**Token Efficiency**:
- 95%+ reduction in context usage through just-in-time loading
- Scales to unlimited data sources via identifiers
- Compaction maintains 20% buffer for new information

**Task Performance**:
- Parallel sub-agents reduce latency by 3-10x
- Specialized contexts improve task accuracy
- Persistent notes enable multi-session workflows

**Agent Autonomy**:
- Progressive disclosure enables self-directed exploration
- Clear tool design reduces decision paralysis
- Structured notes provide "memory" for complex reasoning

**Maintainability**:
- System prompts remain minimal and clear
- Tools are self-documenting and robust
- Context management is automated, not manual

## Real-World Use Cases

### Long-Form Technical Research
**Scenario**: Research agent investigating a complex technical topic over multiple hours

**Implementation**:
1. Initial exploration phase writes findings to `research_notes/initial.md`
2. Deep analysis phase loads relevant sections, writes to `research_notes/analysis.md`
3. Synthesis phase combines compressed summaries from both notes
4. Final report generated from structured note hierarchy

**Result**: 8-hour research task completed with context never exceeding 60k tokens

### Multi-Domain Customer Support
**Scenario**: Support agent handling customers across different product lines

**Implementation**:
1. Agent receives customer_id and product_id (lightweight identifiers)
2. Just-in-time loads customer history for specific product only
3. If customer switches topics, loads new product docs on-demand
4. Compacts conversation every 10 turns to maintain focus

**Result**: Handles 50+ turn conversations without context overflow

### Codebase Analysis & Refactoring
**Scenario**: Development agent analyzing large codebase for refactoring opportunities

**Implementation**:
1. Spawns 5 specialized sub-agents (one per module)
2. Each sub-agent analyzes its module in parallel (isolated context)
3. Sub-agents write findings to structured notes
4. Main agent synthesizes compressed summaries into refactoring plan

**Result**: Analysis of 100k+ line codebase completed in 15 minutes vs. 2 hours sequential

## Implementation Checklist

- [ ] Design minimal, organized system prompts
- [ ] Create self-contained tools with comprehensive documentation
- [ ] Implement just-in-time context loading with identifiers
- [ ] Build structured note-taking system for persistent memory
- [ ] Design sub-agent architecture for parallel exploration
- [ ] Implement automatic context compaction at threshold
- [ ] Add context usage monitoring and alerts
- [ ] Test with long-horizon tasks (>1 hour)
- [ ] Validate context efficiency gains with [[observability-in-context|observability]]

## Related Concepts

- **[[context-engineering]]**: Foundational strategies this pattern implements
- **[[multi-tool-agent]]**: Similar tool orchestration principles
- **[[agentic-rag-workflow]]**: Applies similar autonomous decision-making
- **[[research-agents]]**: Uses structured note-taking and sub-agent patterns
- **[[context-compression-pruning]]**: Technical implementation of compaction

## Related Technologies

- **[[langgraph]]**: Orchestration framework for multi-agent workflows
- **[[letta]]**: Implements persistent memory for agents
- **[[composio]]**: Tool abstraction for context-efficient agent interactions
- **[[langfuse]]**: Observability for measuring context efficiency

---

## Changelog

- **2025-10-04**: Initial example created based on Anthropic's context engineering article
