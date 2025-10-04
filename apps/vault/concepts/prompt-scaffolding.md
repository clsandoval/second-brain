---
title: Prompt Scaffolding
type: concept
tags: [llm, prompting, patterns, techniques]
created: 2025-10-03
updated: 2025-10-03
---

# Prompt Scaffolding

## Definition

Prompt scaffolding refers to techniques and patterns that provide cognitive structure to guide LLMs through complex reasoning and task execution. Like physical scaffolding, these techniques create temporary support structures that help models reach desired outputs.

## Key Techniques

### Chain-of-Thought (CoT)
- Allows LLMs to solve problems as a series of intermediate steps
- Improves reasoning by inducing step-by-step thought processes
- Pattern: "First... then... therefore..."
- Particularly effective for logic-heavy and mathematical tasks

### Task Decomposition
- Break complex tasks into smaller, manageable steps
- Example: Extract facts → generate search queries → verify facts
- LLMs perform better when tasks are broken down sequentially

### Few-Shot and Multi-Shot Prompting
- Show the model examples of desired outputs
- Use consistent, clean examples demonstrating format and tone
- Works better than zero-shot for complex tasks

### Multi-Step Pattern
- Facilitates dynamic, conversational exchanges
- Each prompt builds upon previous responses for iterative refinement

### Constraint Pattern
- Control AI behavior by setting explicit boundaries
- Provides controlled output, bias mitigation, and customization

### Act As Pattern
- Instruct LLMs to adopt alternate personalities or roles
- Offers versatility, engagement, and customization

## Best Practices

- Co-construction: Ask the LLM to refine the ideal prompt based on context
- Be clear and specific with precise language
- Structure hierarchically using markdown, lists, and delimiters
- Test and iterate continuously
- Add safety checks before generation for jailbreak resistance
- Define precise output formats

## How It Relates

- **[[context-engineering]]**: Scaffolding provides the structural framework; context engineering fills it with optimized information
- **[[spec-driven-development]]**: Specifications act as scaffolding for AI-assisted development
- **[[observability-in-context]]**: Track effectiveness of scaffolding patterns through evaluation

## Key Technologies

- [[claude-code]]: Spec-driven development as a form of scaffolding
- [[langfuse]]: Test and evaluate scaffolding patterns

## Real-World Applications

- Complex reasoning tasks (mathematical problems, logical puzzles)
- Multi-step workflows (data analysis pipelines, content generation)
- Role-playing scenarios (customer service bots, tutoring systems)
- Structured data extraction

---

## Changelog

- **2025-10-03**: Initial note created with key techniques, best practices, and relationships
