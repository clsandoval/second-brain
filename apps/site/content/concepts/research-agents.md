---
title: Research Agents
type: concept
tags: [ai-agents, research, experimentation, jupyter, validation]
created: 2025-10-04
updated: 2025-10-04
---

# Research Agents

## Definition

Research agents (also called "experimenter agents") are AI agents designed for scientific exploration, hypothesis testing, and experimental discovery. They differ fundamentally from developer agents: while developer agents produce software artifacts with clear validation metrics (tests pass, code compiles), research agents generate scientific insights and experimental findings where validation is more nuanced and subjective.

## Key Characteristics

### Stateful Execution Environment
- **Jupyter notebooks** are essential for research agent effectiveness
- Provide interactive, stateful environments where agents can:
  - Execute code and receive immediate feedback
  - Iterate quickly on experimental approaches
  - Track outputs across multiple steps (text, errors, images, data)
  - Maintain experimental state across tool calls

### Exploratory Capabilities
- **Parallel experimentation**: Can run multiple experimental threads simultaneously
- **Cross-domain knowledge**: Leverage broad training to apply insights from one field to another
- **Multi-perspective exploration**: Investigate research questions from various angles concurrently
- **Hypothesis generation**: Autonomously propose and test experimental hypotheses

### Non-Linear Workflow
- Unlike developer agents with clear task completion criteria
- Require more nuanced context and open-ended exploration
- Success measured by insight quality rather than binary pass/fail
- Need human judgment to evaluate experimental significance

## Critical Challenges

### Validation Problems
Research agents exhibit systematic biases that require mitigation:

1. **Shortcutting experiments**: Taking easy paths instead of rigorous approaches
   - Example: Using small datasets when larger ones are needed
   - Example: Skipping control experiments to save time

2. **P-hacking results**: Finding patterns that may not be statistically meaningful
   - Cherry-picking data that supports desired conclusions
   - Over-interpreting random variations as significant findings

3. **Naively interpreting bugs as breakthroughs**: Mistaking errors for insights
   - Code errors producing unexpected outputs interpreted as discoveries
   - Failing to validate that results are reproducible and correct

4. **Optimistic bias**: Tendency to report positive results without sufficient skepticism
   - Lacking the self-criticism human researchers apply
   - Need external validation mechanisms

### Lack of Clear Metrics
- Software development has tests, lints, compilation checks
- Research validation requires domain expertise and statistical rigor
- No automated way to verify "correctness" of experimental insights
- Human review remains essential for research quality

## Best Practices

### 1. Use Jupyter Notebooks for Stateful Research
- Implement MCP-based Jupyter server integration
- Enable agents to execute code and receive rich outputs (text, images, errors)
- Maintain experimental state across multiple agent interactions
- Allow iterative refinement of experimental approaches

### 2. Implement Critic Agents for Validation
- Use separate "critic agents" to review experimental outputs
- Build post-hoc review mechanisms into workflows
- Question agent assumptions and interpretations
- Validate statistical significance and reproducibility

### 3. Apply Careful Context Engineering
- Provide structured experimental frameworks ([[context-engineering]])
- Use [[prompt-scaffolding]] to guide rigorous methodology
- Implement validation checkpoints throughout research workflows
- Store experimental history for cross-session learning

### 4. Build Structured Experimental Workflows
- Define clear phases: hypothesis → experiment → validation → interpretation
- Use [[langgraph]] or similar orchestration for multi-step research
- Implement ensemble approaches with multiple agent perspectives
- Track all experimental decisions and rationale

### 5. Combine Automated and Manual Validation
- Automated checks: Statistical tests, reproducibility verification
- Manual checks: Domain expert review, interpretation validity
- Similar to software development validation patterns but adapted for research

## How It Relates

- **[[context-engineering]]**: Apply Write (experimental history), Select (relevant literature), Compress (summarize findings), Isolate (separate experiments)
- **[[observability-in-context]]**: Track experimental outputs, monitor agent reasoning, evaluate research quality
- **[[langgraph]]**: Orchestrate multi-step research workflows with decision points
- **[[agentic-rag-workflow]]**: Similar autonomous decision-making patterns for research literature retrieval
- **[[multi-tool-agent]]**: Parallel tool execution applicable to parallel experimentation
- **[[prompt-scaffolding]]**: Provide structured frameworks for experimental rigor

## Key Technologies

- **Jupyter notebooks/server**: Stateful execution environment (essential)
- **Scribe**: Goodfire's open-source research agent framework with Jupyter MCP integration
- **MCP (Model Context Protocol)**: Connect agents to Jupyter notebooks for interactive execution
- **[[langgraph]]**: Agent orchestration for complex research workflows
- **Claude/Codex/Gemini**: AI models used as research agents
- **Sparse Autoencoders (SAE)**: Example interpretability research tool

## Real-World Applications

### AI Interpretability Research
- Circuit discovery in neural networks
- Universal neuron detection
- Linear probe analysis
- Understanding model behavior and representations

### Scientific Hypothesis Testing
- Automated literature review and synthesis
- Cross-domain insight discovery
- Experimental design and iteration
- Statistical analysis and validation

### Exploratory Research
- Investigating novel research questions
- Generating and testing multiple hypotheses in parallel
- Discovering unexpected connections across domains
- Accelerating early-stage research exploration

## Implementation Patterns

### Pattern 1: Jupyter + MCP Integration
```
Research Agent → MCP Tool Call → Jupyter Server
                                     ↓
                              Execute in IPython Kernel
                                     ↓
                              Return outputs (text/images/errors)
                                     ↓
                              Agent interprets and iterates
```

### Pattern 2: Critic Agent Validation
```
Experimenter Agent → Runs experiments → Produces findings
                                             ↓
                                    Critic Agent reviews
                                             ↓
                              Questions methodology and conclusions
                                             ↓
                              Validates statistical significance
                                             ↓
                              Flags potential issues for human review
```

### Pattern 3: Ensemble Research
```
Research Question → Spawn parallel research agents
                         ↓
              [Agent 1: Approach A]
              [Agent 2: Approach B]
              [Agent 3: Approach C]
                         ↓
              Synthesize findings from multiple perspectives
                         ↓
              Identify convergent vs. divergent results
                         ↓
              Human researcher evaluates ensemble output
```

### Pattern 4: Iterative Hypothesis Refinement
```
Initial Hypothesis → Design Experiment → Execute → Analyze Results
                                                          ↓
                                                    Unexpected finding?
                                                          ↓
                                              Refine Hypothesis → Iterate
```

Similar to existing patterns in codebase:
- **Parallel agent execution** (see `.claude/commands/research_codebase.md`)
- **Validation workflows** (see `.claude/commands/validate_plan.md`)
- **Specialized agent roles** (see `.claude/agents/thoughts-analyzer.md` for critic pattern)

---

## Changelog

- **2025-10-04**: Initial note created based on Goodfire article "You and Your Research Agent"
