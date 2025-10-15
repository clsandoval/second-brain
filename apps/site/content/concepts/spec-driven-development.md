---
title: Spec-Driven Development
type: concept
tags: [development, ai-assisted, workflow, methodology]
created: 2025-10-03
updated: 2025-10-03
---

# Spec-Driven Development

## Definition

Spec-driven development (SDD) is an AI-assisted software development methodology where specifications become "living, executable artifacts" that serve as the source of truth for code generation, testing, and validation. The specification acts as a contract for how code should behave, driving implementation through AI coding agents.

## Four-Phase Workflow

1. **Requirements Phase**: Create high-level description of project goals and user experiences
2. **Design Phase**: Define technical architecture, constraints, and implementation strategy
3. **Tasks Phase**: Break down specification into granular, testable work units
4. **Implementation Phase**: AI generates code matching specified requirements

Each phase must be completed and approved before proceeding to the next.

## Core Benefits

- Reduces ambiguity in AI-generated code
- Provides structured approach to development
- Enables iterative refinement of project requirements
- Separates stable "what" from flexible "how"
- Creates shared understanding between developers and AI agents

## Best Practices

### Setup and Customization
- Create `CLAUDE.md` or `SPEC.md` files documenting:
  - Bash commands
  - Code style guidelines
  - Testing instructions
  - Repository etiquette

### Extensibility Through `.claude/` Directory

The `.claude/` directory implements spec-driven development through:

**1. Agent Specialization (agents/):**
Each agent is a "living specification" defining:
- **Purpose**: Single responsibility (locate vs analyze vs pattern-find)
- **Tools**: Constrained set (Read, Grep, Glob, LS)
- **Output format**: Structured with file:line references
- **Guidelines**: What to do and what NOT to do

Example: `codebase-analyzer.md` specifies:
- Analyze HOW code works (not WHAT or WHY)
- Always include file:line references
- Trace data flow step-by-step
- Focus on business logic, not boilerplate

**2. Workflow Specifications (commands/):**
Commands define multi-step processes with phase gates:
- **Input validation**: What parameters are required
- **Execution steps**: Ordered with critical dependencies
- **Success criteria**: Automated and manual verification
- **Error handling**: When to stop and communicate

Example: `create_plan.md` specifies:
- Step 1: Read all context files FULLY first
- Step 2: Spawn parallel research agents
- Step 3: Iterate until no open questions
- Step 4: Generate plan with dual verification criteria
- Critical: Never finalize plans with unresolved questions

**3. Permission Specifications (settings.local.json):**
Pre-approved operations reduce friction:
- Git workflows (add, commit, push)
- Test execution patterns
- Package management commands
- Whitelisted web domains

**Key Pattern**: Specifications as version-controlled code that evolves with the project. Each `.md` file is a "prompt specification" that defines agent behavior systematically.

### Workflow Strategies
1. **"Explore, plan, code, commit" approach**:
   - Read relevant files first
   - Have AI make a plan
   - Implement solution
   - Commit changes

2. **Test-Driven Development (TDD)**:
   - Write tests first
   - Confirm tests fail
   - Write code to pass tests
   - Iterate and verify

### Optimization Techniques
- Be specific in instructions
- Use visual references like screenshots
- Mention specific files to work on
- Use course correction tools to refine outputs
- Leverage subagents for complex tasks

## How It Relates

- **[[prompt-scaffolding]]**: Specs provide structured scaffolding for AI development workflows
- **[[context-engineering]]**: Specification files become persistent context for AI agents
- **[[observability-in-context]]**: Specs enable systematic testing and validation

## Key Technologies

- [[claude-code]]: Primary platform for spec-driven development with Context7 MCP
- Tools: cc-sdd, Spec Kit (GitHub)

## Real-World Applications

- Greenfield (zero-to-one) projects
- Feature additions to existing systems
- Legacy modernization and refactoring
- Building AI applications with clear requirements

---

## Changelog

- **2025-10-03**: Initial note created with four-phase workflow, best practices, and relationships
