---
title: Agentic Context Engineering (ACE)
type: concept
tags: [context-engineering, self-improving, agents, optimization, emerging]
created: 2025-10-10
updated: 2025-10-10
paper: https://arxiv.org/abs/2510.04618
paper_html: https://arxiv.org/html/2510.04618v1
authors: [Qizheng Zhang, Changran Hu, et al.]
institution: [Stanford University, SambaNova Systems]
published: 2025-10-06
---

# Agentic Context Engineering (ACE)

## Definition

Agentic Context Engineering (ACE) is a framework for self-improving language models that treats context as "evolving playbooks"—structured knowledge bases that accumulate, refine, and organize strategies over time. Rather than modifying model weights through fine-tuning, ACE improves language model performance by updating what the model reads and remembers.

Published in October 2025 by researchers from Stanford University and SambaNova Systems, ACE addresses fundamental challenges in context adaptation: preventing information degradation (context collapse) and avoiding over-compression (brevity bias) while enabling models to learn from their own execution traces.

**Core premise:** Context is not static. By systematically generating experiences, reflecting on outcomes, and curating insights into structured updates, language models can continuously improve their performance on complex, long-horizon tasks without requiring labeled training data or parameter updates.

## The Problem: Why ACE Exists

ACE was developed to solve two critical problems that plague traditional context optimization approaches:

### Context Collapse

**Definition:** The erosion of detailed, multi-faceted information through iterative rewriting. When a single LLM repeatedly rewrites context in an uncontrolled loop, it tends to collapse complex strategies into shorter, less informative representations, leading to sharp performance drops.

**Concrete example:** Imagine an agent that has accumulated detailed knowledge about API error handling: "When the `create_user` API returns 409, check if email already exists; if so, prompt for different email; otherwise retry with exponential backoff." After several monolithic rewrites by an LLM trying to "summarize" this knowledge, it might collapse to: "Handle 409 errors appropriately." The nuanced strategy—the specific checks, the user interaction, the retry logic—has been lost.

**Impact on agents:** Multi-step agents, program synthesis systems, and knowledge-intensive reasoning tasks all suffer when detailed context gets compressed away. Success in these domains hinges on accumulating and preserving task-specific insights, not reducing them to generic summaries.

### Brevity Bias

**Definition:** The tendency of context optimization to collapse toward short, generic prompts. Prior context adaptation approaches—especially those using monolithic rewrites or optimization objectives focused on compression—tend to produce overly concise summaries that lose nuanced agent behaviors, tool usage details, and negative evidence (what not to do).

**Why it fails:** Many complex tasks require detailed, context-rich guidance. A customer service agent needs to know not just "handle billing questions" but specific account states, edge cases, escalation procedures, and examples of successful resolutions. Compressing this to a brief instruction undermines performance.

**What's lost:**
- Nuanced decision-making strategies
- Specific tool usage patterns and when to apply them
- Negative evidence (failed approaches and why they failed)
- Domain-specific terminology and edge case handling
- Multi-step coordination details

## Core Architecture

ACE uses a three-component architecture with explicit separation of concerns. Each component has a distinct responsibility, and this separation is key to preventing both context collapse and brevity bias.

### Generator

**Function:** Produces initial reasoning trajectories for new queries or tasks.

**Purpose:** The Generator executes the current context (prompt/playbook) on new examples, surfacing both effective strategies and recurring pitfalls. It generates traces that highlight which context "bullets" (individual knowledge fragments) are useful and which are misleading.

**Output:** Execution traces that serve as raw material for reflection—showing what worked, what failed, and where the context led to errors or success.

### Reflector

**Function:** Critiques the Generator's execution traces and extracts concrete lessons from both successes and failures.

**Key innovation:** The Reflector is separated from the Curator, which improves context quality and downstream performance. Rather than having a single LLM both evaluate performance and update context (which leads to collapse), the Reflector focuses solely on analysis and insight extraction.

**Capabilities:**
- Performs comparative analysis across multiple traces
- Refines insights across multiple iterations
- Distills raw signals into concrete, actionable lessons
- Identifies patterns in what works and what doesn't
- Extracts both positive strategies and negative evidence

**Output:** Delta updates—structured, localized changes proposed as "add this bullet" or "update this bullet"—expressed as concrete insights with rationale.

### Curator

**Function:** Synthesizes the Reflector's lessons into compact delta entries and integrates them into the evolving context.

**Integration method:** Uses deterministic, non-LLM logic to merge updates. This is crucial: by handling the mechanical merging with rule-based logic rather than another LLM call, the Curator enables parallel and batched context adaptation without introducing additional collapse risk.

**Advantages:**
- Consistent, predictable integration
- Enables parallel processing of multiple delta updates
- Supports batched adaptation for efficiency
- Preserves structure and prevents inadvertent information loss

## Key Innovations

ACE introduces three technical innovations that work together to enable context evolution without collapse:

### Delta Updates

Rather than monolithic rewrites of entire context, ACE represents context as structured, itemized "bullets"—each a small unit of strategy or domain knowledge with its own unique identifier and metadata.

**Structure of a bullet:**
- **Unique identifier:** Enables targeted updates
- **Content:** The actual knowledge fragment (e.g., "When API returns 429, wait N seconds before retry")
- **Metadata counters:** Helpful/harmful tallies based on execution outcomes
- **Type:** Positive guidance, negative evidence, tool usage pattern, etc.

**Delta operations:**
- **Append:** Add new bullet with unique ID
- **Update:** Modify existing bullet in-place by ID
- **Remove:** Mark bullet for deletion (typically during deduplication)

**Why this works:** Localized, bullet-level insertions or replacements avoid global rewrites that trigger collapse. Each update is surgical and preserves surrounding context.

### Grow-and-Refine Mechanism

ACE balances steady context expansion (accumulating knowledge) with redundancy control (preventing bloat).

**The cycle:**
1. **Append new bullets** with unique identifiers based on Reflector insights
2. **Update existing bullets** in-place when new evidence refines understanding
3. **Periodically deduplicate** using semantic embeddings to merge similar bullets
4. **Prune low-value entries** based on helpful/harmful metadata

**Deduplication strategies:**
- **Proactive:** After each delta update, immediately check for redundancy
- **Lazy:** Defer deduplication until context window approaches limit

**Key principle:** Prioritize growth of valuable knowledge over premature compression. ACE is designed to accumulate structured, domain-specific knowledge fragments rather than reducing everything to generic summaries. This is the opposite of brevity bias.

### Non-LLM Curation Logic

The Curator uses deterministic, rule-based logic for merging delta updates rather than relying on LLM generation. This enables:

**Parallelization:** Multiple Reflector instances can propose delta updates concurrently, which the Curator merges deterministically without sequential dependencies.

**Consistency:** Rule-based merging prevents the drift and collapse that can occur when LLMs iteratively rewrite content.

**Efficiency:** Reduces computational cost by avoiding additional LLM calls for mechanical integration tasks.

**Transparency:** Deterministic logic is easier to debug, audit, and explain compared to LLM-generated merges.

## How It Works

Here's the conceptual workflow for ACE in both offline and online settings:

### Offline Setting (System Prompt Optimization)

Used when you want to create an optimized system prompt based on a dataset of examples:

1. **Initialize context:** Start with basic instructions or empty context
2. **Generator executes:** Run current context on training examples, producing execution traces
3. **Reflector analyzes:** Compare successful vs. failed traces, extract lessons
4. **Curator integrates:** Apply delta updates to context structure
5. **Iterate:** Repeat steps 2-4 for multiple rounds until performance plateaus
6. **Deploy:** Use final evolved context as system prompt for production

**Offline results:** ACE surpasses ICL, MIPROv2, and GEPA by an average of +10.9% across benchmarks.

### Online Setting (Test-Time Memory Adaptation)

Used when you want an agent to continuously improve during deployment:

1. **Agent executes task:** Uses current context (memory) to perform action
2. **Outcome observed:** Success or failure is recorded in execution trace
3. **Reflector critiques:** Analyzes what led to outcome, proposes delta updates
4. **Curator updates memory:** Applies deltas to agent's persistent context
5. **Next task uses evolved context:** Improved knowledge applied to subsequent tasks

**Online results:** ACE exceeds prior adaptive methods like DC by an average of +6.2%.

### Technical Flow

```
[Input Query/Task]
        ↓
[Generator: Execute with current context]
        ↓
[Execution Trace: steps, tools used, outcomes]
        ↓
[Reflector: Analyze trace, extract insights]
        ↓
[Proposed Delta Updates: "Add bullet X", "Update bullet Y"]
        ↓
[Curator: Deterministic merge into context structure]
        ↓
[Evolved Context: Updated bullets with new knowledge]
        ↓
[Deduplicate: Semantic merging if needed]
        ↓
[Ready for next query/task with improved context]
```

### Context Representation

Internally, ACE maintains context as a structured collection:

```
Context = {
  bullets: [
    {
      id: "bullet_001",
      content: "When API returns 429, implement exponential backoff",
      helpful_count: 5,
      harmful_count: 0,
      type: "tool_usage"
    },
    {
      id: "bullet_002",
      content: "Avoid retrying on 403 errors—these are permission issues",
      helpful_count: 3,
      harmful_count: 0,
      type: "negative_evidence"
    },
    ...
  ]
}
```

This structure enables targeted updates, metadata tracking, and semantic deduplication while preserving the detailed knowledge that briefer formats would lose.

## Performance & Validation

ACE demonstrates significant improvements across multiple benchmarks and settings:

### Benchmark Results

**Agent Benchmarks (overall):**
- **+10.6%** improvement on agent tasks compared to baselines
- **+8.6%** improvement on finance domain-specific reasoning tasks
- **86.9% lower** adaptation latency compared to previous methods
- Fewer computational rollouts required
- Lower token costs during adaptation

**Offline Setting (System Prompt Optimization):**
- **+10.9%** average improvement over ICL, MIPROv2, and GEPA
- Outperforms MIPROv2 (Bayesian optimization of prompts)
- Outperforms GEPA (genetic-Pareto prompt optimization)
- Superior to in-context learning (ICL) baselines

**Online Setting (Test-Time Memory Adaptation):**
- **+6.2%** average improvement over DC (adaptive baseline)
- Exceeds prior adaptive methods in continuous learning scenarios
- Maintains performance gains over extended task sequences

### AppWorld: Production-Level Validation

The most impressive validation comes from AppWorld, a challenging benchmark that simulates real-world agent tasks:

**Benchmark characteristics:**
- **60,000 lines of code** execution environment
- **9 day-to-day applications** (calendar, email, contacts, etc.)
- **457 APIs** operable by the agent
- **~100 fictitious users** with realistic data
- **750 natural, diverse, and challenging tasks**

**ACE results:**
- **Matched the top-ranked production agent** (IBM-CUGA powered by GPT-4.1) on overall average
- **Surpassed it on the harder test-challenge split**
- Achieved this using a **smaller open-source model** (DeepSeek-V3.1 in non-thinking mode)

**Significance:** This demonstrates that ACE's context evolution can compensate for model size, enabling smaller models with well-evolved contexts to match or exceed larger models with static prompts.

### Works Without Labeled Supervision

A key advantage: ACE doesn't require ground-truth labels or human annotations. It learns from execution outcomes (success/failure) and self-generated reflections, making it applicable to domains where labeled data is scarce or expensive.

## How It Compares

ACE relates to several other approaches for improving LLM performance. Understanding these relationships clarifies when to use ACE versus alternatives.

### vs. Context Compression (LLMLingua, LazyLLM)

**Context Compression** ([[context-compression-pruning]]):
- **Goal:** Reduce token usage by removing less important information
- **Method:** Prune tokens, compress prompts, summarize history
- **Result:** Shorter context, lower costs, faster inference
- **Use case:** When context exceeds model limits or cost constraints require reduction

**ACE:**
- **Goal:** Improve performance by accumulating and refining knowledge
- **Method:** Grow structured context through delta updates
- **Result:** Longer but more effective context with detailed strategies
- **Use case:** When learning from experience improves outcomes and context limits allow growth

**Relationship:** These are complementary approaches. ACE grows valuable knowledge; compression manages size. Both can be used together: ACE accumulates insights, compression trims redundancy when needed.

### vs. Prompt Optimization (DSPy, MIPROv2, GEPA)

**Prompt Optimization Frameworks:**
- **Focus:** Optimize instructions and few-shot examples
- **DSPy:** Programming framework with declarative modules and optimizers
- **MIPROv2:** Bayesian optimization of prompts (suffers from brevity bias)
- **GEPA:** Reflective evolution with multi-objective search (instruction-only)
- **Scope:** Primarily offline optimization of prompts

**ACE:**
- **Focus:** Evolve complete context over time, not just instructions
- **Scope:** Both offline (system prompts) and online (agent memory)
- **Architecture:** Generator-Reflector-Curator with structured delta updates
- **Advantage:** Prevents brevity bias through grow-and-refine mechanism

**Key difference:** Prompt optimization frameworks focus on finding the best static prompt. ACE creates dynamic, evolving contexts that continue to improve through experience.

### vs. RAG (Retrieval-Augmented Generation)

**RAG** ([[retrieval-augmented-generation]]):
- **Architecture:** Retrieval system + Generation model
- **Memory:** Static external knowledge base (documents, embeddings)
- **Adaptation:** None—knowledge base doesn't update based on agent experience
- **Update mechanism:** Query-time retrieval only
- **Use case:** Enhancing responses with external knowledge

**ACE:**
- **Architecture:** Generator-Reflector-Curator system
- **Memory:** Evolving, structured knowledge base (context bullets)
- **Adaptation:** Continuous learning from execution feedback
- **Update mechanism:** Delta updates with reflection and curation
- **Use case:** Self-improving agents with long-term memory

**Relationship:** RAG can be a component within broader ACE systems. ACE represents a higher-level framework that could integrate RAG as one technique among many for managing and evolving context.

### vs. Fine-Tuning

**Fine-Tuning:**
- **Updates:** Model parameters (weights)
- **Data required:** Labeled training examples
- **Cost:** Computationally expensive (full or LoRA training runs)
- **Interpretability:** Difficult to understand what changed
- **Reversibility:** Hard to undo or modify specific learned behaviors

**ACE:**
- **Updates:** Context (what model reads)
- **Data required:** Execution traces (success/failure outcomes)
- **Cost:** Lower—LLM inference for reflection, deterministic merging
- **Interpretability:** High—can inspect delta updates and context bullets
- **Reversibility:** Easy—can roll back specific bullets or updates

**When to use:**
- **Fine-tuning:** When you need fundamental behavioral changes and have labeled data
- **ACE:** When you want interpretable, reversible learning from experience

## Best Practices

Based on the research and methodology, here are recommended practices for implementing ACE-like systems:

### Accumulate Rather Than Compress

Prioritize growth of domain-specific knowledge fragments over premature compression. Resist the temptation to summarize detailed strategies into brief instructions—this is precisely the brevity bias ACE was designed to prevent.

**Guideline:** If adding a knowledge fragment improves performance, add it even if it makes context longer. Use deduplication only when you have genuinely redundant information, not when you have complementary details.

### Use Structured Updates

Represent context as itemized bullets with unique identifiers and metadata rather than unstructured text blocks.

**Benefits:**
- Enables targeted updates without full rewrites
- Preserves detailed information during updates
- Supports semantic deduplication based on embeddings
- Allows tracking which knowledge fragments are helpful vs. harmful

### Implement Separation Between Reflection and Curation

Don't use a single LLM to both evaluate performance and update context. This leads to collapse.

**Architecture:**
- **Reflector:** Dedicated to analysis and insight extraction
- **Curator:** Separate process for mechanical integration
- **Result:** Higher quality context and better downstream performance

### Leverage Long-Context Models

ACE is designed to scale with long-context models. As models support larger context windows (100K+, 1M+ tokens), ACE's grow-and-refine approach becomes increasingly powerful.

**Rationale:** With sufficient context capacity, you can accumulate extensive domain knowledge without aggressive compression, letting the model have access to detailed strategies, examples, and edge case handling.

### Apply to Both Offline and Online Scenarios

**Offline (System Prompt Optimization):**
- Evolve context on a training set before deployment
- Use the final evolved context as your production system prompt
- Good for tasks with available example datasets

**Online (Agent Memory):**
- Let agents continuously improve during deployment
- Accumulate insights from real-world interactions
- Particularly valuable for long-running agents in dynamic environments

### Track Metadata and Outcomes

Maintain helpful/harmful counters or similar metadata for each knowledge fragment. This enables:
- Data-driven deduplication decisions
- Identification of low-value bullets for pruning
- Evidence-based validation of what works

### Use Semantic Deduplication

When deduplication is needed, use semantic embeddings to identify truly redundant information rather than simple string matching.

**Approach:** Compute embeddings for bullets, cluster similar ones, merge clusters into refined single bullets that preserve the essential information from each.

## How It Relates

ACE connects to several concepts in the context engineering and agent development ecosystem:

- **[[context-engineering]]**: ACE is an advanced implementation of context engineering strategies, particularly the "Write" strategy (persistent memory) combined with adaptive refinement. It provides a specific methodology for how to systematically evolve context over time rather than treating it as static. ACE addresses key challenges in long-horizon context management.

- **[[context-compression-pruning]]**: ACE takes a contrasting approach—growing and refining context rather than compressing it. While compression reduces token usage by removing information, ACE accumulates knowledge to improve performance. These strategies address different scenarios and can be used together: ACE for accumulating valuable insights, compression for managing total size when needed.

- **[[prompt-scaffolding]]**: ACE builds upon structural frameworks provided by prompt scaffolding. The structured bullet format with metadata is a form of scaffolding that enables systematic context evolution. Scaffolding provides the structure; ACE provides the mechanism for evolving what fills that structure.

- **[[research-agents]]**: ACE's Reflector component functions similarly to the critic agents used in research agent systems. Both use separate evaluation/reflection mechanisms to validate and improve outputs. The validation patterns align: having a dedicated reflector/critic that questions and analyzes rather than letting the generator self-evaluate prevents optimistic bias and shallow analysis.

- **[[observability-in-context]]**: Observability is crucial for ACE systems. Tracking delta updates, measuring performance improvements after each evolution cycle, and validating that context refinements lead to better outcomes all require comprehensive observability. Context evolution without measurement risks accumulating unhelpful knowledge.

## Real-World Applications

ACE is particularly valuable for tasks requiring detailed, context-rich guidance and long-horizon execution:

### Multi-Step Agent Tasks

**Use case:** Agents that coordinate multiple tools, make sequential decisions, and need to learn from failures.

**Example:** Customer service agent that learns which escalation paths work best for different issue types, accumulates knowledge about common edge cases, and refines its troubleshooting strategies based on resolution outcomes.

**Why ACE helps:** Accumulates tool usage patterns, successful coordination strategies, and negative evidence (what approaches failed and why) without compressing away the nuanced details needed for complex interactions.

### Domain-Specific Reasoning

**Use case:** Tasks requiring specialized knowledge in finance, healthcare, legal, or other expert domains.

**Example (from paper):** Finance agents that learn domain-specific analysis patterns, regulatory considerations, and market-specific strategies. ACE achieved +8.6% improvement on finance reasoning tasks.

**Why ACE helps:** Domain expertise often consists of detailed rules, exceptions, and edge cases that suffer when compressed into brief instructions. ACE preserves this granular knowledge while continuing to refine it.

### Program Synthesis and Coding Agents

**Use case:** Agents that generate code, debug errors, and learn from compilation failures.

**Example (AppWorld):** Interactive coding agent that learns API usage patterns, accumulates error handling strategies, and refines its approach to tool orchestration. ACE-enhanced DeepSeek-V3.1 matched GPT-4.1-powered IBM-CUGA on 750 diverse coding tasks.

**Why ACE helps:** Programming requires remembering specific API details, error patterns, successful debugging strategies, and negative evidence (approaches that compile but produce wrong behavior). This detailed knowledge is exactly what ACE is designed to accumulate.

### Knowledge-Intensive Reasoning

**Use case:** Tasks requiring extensive factual knowledge, multi-hop reasoning, and synthesis of information from multiple sources.

**Example:** Research assistant that accumulates domain knowledge, learns effective search and verification strategies, and refines its synthesis approaches based on which summaries users find most valuable.

**Why ACE helps:** Knowledge work benefits from detailed, structured information rather than compressed summaries. ACE enables accumulating expert tactics and empirical task-specific details.

### Long-Horizon Interactive Systems

**Use case:** Agents that operate over extended periods, interacting with users and systems across many sessions.

**Example:** Personal assistant that learns user preferences, successful task completion patterns, and context-specific strategies over weeks or months of interaction.

**Why ACE helps:** Long-running systems need memory that evolves and improves. ACE's online adaptation mode enables continuous learning from real-world interactions without requiring retraining.

## Current Status & Resources

**Research Status:** Published in October 2025 by Stanford University and SambaNova Systems researchers.

**Implementation Status:** As of the publication date, no official open-source implementation has been released. The methodology is well-documented in the research paper, enabling teams to implement ACE based on the architectural descriptions and algorithmic details provided.

**How to Access:**

**Research Paper:**
- Full paper (PDF): https://arxiv.org/abs/2510.04618
- HTML version: https://arxiv.org/html/2510.04618v1
- Hugging Face discussion: https://huggingface.co/papers/2510.04618
- Emergent Mind: https://www.emergentmind.com/topics/agentic-context-engineering-ace

**Authors:**
- Lead author: Qizheng Zhang (Stanford University) - qizhengz@stanford.edu
- Collaborators from Stanford and SambaNova Systems

**Future Outlook:**
- Monitor Stanford and SambaNova Systems GitHub organizations for potential releases
- Community implementations may emerge as teams adopt the methodology
- Follow the research group for follow-up papers or refinements

**Implementation Guidance:**

While awaiting official code, teams can implement ACE using:
1. **LLM API** for Generator and Reflector components
2. **Structured data format** (JSON/YAML) for context bullets with IDs and metadata
3. **Embedding model** for semantic deduplication (OpenAI, Cohere, local models)
4. **Rule-based logic** for Curator's deterministic merging
5. **Vector database** (optional) for efficient similarity search during deduplication

The paper provides sufficient algorithmic detail to guide implementation for teams with LLM engineering experience.

---

## Changelog

- **2025-10-10**: Initial note created based on arXiv:2510.04618 (Stanford/SambaNova research)
