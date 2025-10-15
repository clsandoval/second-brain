---
title: Background Agents
type: concept
tags: [async-agents, autonomous-agents, ci-cd-integration, long-running-tasks, delegate-and-review]
created: 2025-10-09
updated: 2025-10-09
---

# Background Agents

## Definition

Background agents (also called async agents) are autonomous AI agents that operate asynchronously on long-running tasks—typically 10-15+ minutes or longer—without requiring real-time developer interaction. They represent a paradigm shift from "collaborate in real-time" to "delegate and review."

As described in a Latent Space podcast interview (October 2025) with Sourcegraph's team:

> "That's going to be blown up with async agents when they're running 24/7 concurrently in the background. Then you can have 10 or 100 times as many."

Background agents are positioned as "the next frontier" in AI-assisted coding, enabling developers to delegate complex tasks and review completed work hours or even days later, while agents work autonomously with CI/CD feedback loops.

## Key Characteristics

### Autonomous Operation

Background agents work independently without a human in the loop. Once initiated, they explore codebases, understand context, generate solutions, and iterate based on feedback—all without continuous supervision.

### Long-Running Tasks

These agents handle tasks that take significantly longer than interactive agents:
- **Background agents**: 10-15+ minutes (or hours)
- **Interactive agents**: seconds to a few minutes

The longer duration enables more thorough exploration, multiple iterations, and comprehensive solutions.

### CI/CD Integration

A defining feature of background agents is integration with continuous integration systems. The workflow:
1. Agent generates code
2. Agent pushes to repository
3. CI runs tests, linters, type checks
4. Agent reads diagnostic output
5. Agent iterates and improves
6. Process repeats until success

The asynchronous nature makes CI latency acceptable—waiting minutes for test results isn't a bottleneck when you're not actively watching.

### Delegate-and-Review Workflow

Developers interact with background agents differently than interactive agents:
- **Set the task**: Describe the feature or problem
- **Walk away**: Agent works independently
- **Review later**: Check completed work when convenient (hours/days later)

This contrasts with real-time collaboration where developers guide agents step-by-step.

### Mobile Initiation

Because background agents don't require continuous interaction, tasks can be initiated from anywhere—IDE, CLI, or even mobile devices. Kick off a complex refactoring from your phone and review the results when you're back at your desk.

### Scalability

With interactive agents, developers typically work with one agent at a time due to the need for real-time attention. Background agents enable 10-100x more concurrent agents since they don't require continuous supervision.

## Architecture & Workflow

### Standard Background Agent Workflow

1. **Initiation**: Developer describes feature/task (from IDE, CLI, or mobile)
2. **Autonomous Work Begins**: Agent starts exploring codebase and understanding context
3. **Solution Generation**: Agent generates initial implementation
4. **Code Push**: Agent commits and pushes code to repository
5. **CI Execution**: CI/CD pipeline runs (tests, linters, type checks, security scans)
6. **Diagnostic Reading**: Agent reads CI output (pass/fail, error messages, warnings)
7. **Iteration**: Agent analyzes failures, generates fixes, pushes again
8. **Repeat**: Loop continues until tests pass or constraints are met
9. **Human Review**: Developer reviews completed work when convenient

### Feedback Loop Design

The key to effective background agents is designing feedback loops that provide actionable information:

- **Effective feedback** (CI diagnostics, test results) vs. **perfect replication** (exact development environment)
- Clear, parseable error messages that agents can understand
- Comprehensive test coverage that validates correctness
- Fast CI pipelines that enable rapid iteration (even with async tolerance)

As Sourcegraph's team noted:

> "Asynchronous nature makes CI latency acceptable."

### Self-Correction Algorithm

The basic algorithm is "loop until solution":
1. Attempt solution
2. Check result (via CI)
3. If failure, analyze diagnostic output
4. Generate new approach based on feedback
5. Repeat

Agents may try multiple approaches if stuck, exploring different solutions autonomously.

## Comparison: Background vs. Interactive Agents

| Aspect | Background Agents | Interactive Agents |
|--------|------------------|-------------------|
| **Interaction Model** | Asynchronous, delegate-and-review | Synchronous, real-time collaboration |
| **Task Duration** | 10-15+ minutes (or hours) | Seconds to minutes |
| **Concurrency** | 10-100+ agents simultaneously | Typically 1 agent at a time |
| **Human Involvement** | Minimal (start task, review result) | Continuous (guide, approve, iterate) |
| **Feedback Source** | CI/CD diagnostics, test results | Human feedback, immediate corrections |
| **Use Cases** | Repetitive tasks, large refactors | Exploratory coding, learning codebases |
| **Error Handling** | Autonomous iteration via CI feedback | Human-guided debugging |
| **Initiation Point** | Anywhere (mobile, CLI, IDE) | Typically in IDE/terminal |
| **Review Timing** | When convenient (hours/days later) | Immediate (real-time) |
| **Context Switching** | No context switching cost for developer | Requires developer attention |
| **Learning Opportunity** | Limited (review final result) | High (observe agent's process) |

## When to Use Background Agents

Background agents excel in specific scenarios:

### Complex Multi-File Refactoring
- Architectural changes spanning dozens or hundreds of files
- Updating patterns across large codebases
- Dependency upgrades with breaking changes

### Repetitive Coding Patterns
- Updating deprecated API calls across 100+ files
- Adding type annotations to untyped codebase
- Applying linting rules and fixing violations

### Test-Driven Development
- Clear pass/fail criteria from CI
- Agent iterates until all tests pass
- Particularly effective with comprehensive test suites

### Documentation Generation
- Generate docs based on code structure
- Update documentation when code changes
- Maintain consistency across large projects

### Security Vulnerability Fixes
- Patch known vulnerabilities
- Verify fixes with security-focused tests
- Apply security best practices systematically

### Code Quality Improvements
- Apply consistent formatting/style
- Add missing error handling
- Improve code maintainability

### Overnight/Weekend Work
- Delegate long-running tasks before logging off
- Agent works while you rest
- Review completed work when you return

### When You Want to Delegate
- Tasks with clear specifications
- Work that doesn't require frequent human decisions
- Tasks where you prefer to review the complete solution

## When to Use Interactive Agents

Interactive agents remain preferable for:

### Exploratory Programming
- Understanding new codebases
- Investigating unfamiliar patterns
- Discovery-oriented tasks

### Learning and Experimentation
- When you want to learn from the agent's process
- Trying different approaches interactively
- Building understanding of the codebase

### Complex Debugging
- Issues requiring human insight
- Problems with unclear root causes
- Situations needing creative problem-solving

### Frequent Human Decisions
- Tasks requiring judgment calls
- Work with ambiguous requirements
- Situations where direction may change

### Rapid Prototyping
- Quick iterations with immediate feedback
- Exploratory feature development
- When speed of feedback is critical

### Pair Programming
- Learning from agent explanations
- Understanding the "why" behind decisions
- Building shared context

## Implementation Patterns

### Best Practices

**Design Effective Feedback Loops**
- Ensure CI provides clear, parseable diagnostics
- Write comprehensive tests that validate correctness
- Include linting, type checking, and security scans in CI

**Hybrid Approach**
- Use interactive agents for exploration and planning
- Delegate repetitive execution to background agents
- Review and refine with interactive assistance

**Clear Specifications**
- Provide detailed task descriptions for background agents
- Include acceptance criteria and constraints
- Reference relevant AGENT.md files or documentation

**Monitor Without Blocking**
- Set up notifications for agent completion
- Track progress through commit history
- Don't wait actively—work on other tasks

**Iterative Refinement**
- Start with smaller scopes to test agent capabilities
- Gradually delegate larger tasks as confidence builds
- Refine task descriptions based on outcomes

### When to Transition Between Modes

**Start Interactive → Switch to Background:**
1. Use interactive agent to explore codebase
2. Understand the patterns and architecture
3. Identify repetitive work that follows clear patterns
4. Delegate repetitive execution to background agent
5. Review completed work interactively

**Start Background → Switch to Interactive:**
1. Delegate clearly-specified task to background agent
2. If agent gets stuck or produces unexpected results
3. Switch to interactive mode for debugging
4. Understand the issue, refine approach
5. Resume background execution with updated strategy

## Use Cases

### Code Migration
**Example**: Update deprecated API across entire codebase
- Agent identifies all usage locations
- Updates each call site systematically
- Runs tests after each change
- Iterates until all tests pass

### Large-Scale Refactoring
**Example**: Rename functions/classes and fix all references
- Agent performs rename operations
- Updates imports and references
- Fixes type errors and linting issues
- Validates with comprehensive test suite

### Test Generation
**Example**: Write tests for untested modules
- Agent analyzes code structure
- Generates test cases for each function
- Ensures tests cover edge cases
- Verifies tests pass and coverage increases

### Documentation Updates
**Example**: Generate/update docs based on code changes
- Agent detects code modifications
- Updates corresponding documentation
- Ensures consistency across files
- Generates examples and usage guides

### Type Annotation Addition
**Example**: Add type hints to untyped Python codebase
- Agent analyzes function signatures
- Infers and adds appropriate type hints
- Runs type checker (mypy, pyright)
- Iterates until type checking passes

### Dependency Updates
**Example**: Upgrade libraries and fix breaking changes
- Agent updates dependency versions
- Identifies breaking changes from changelogs
- Updates code to match new APIs
- Ensures all tests pass after upgrade

### Security Patching
**Example**: Fix known vulnerabilities with test verification
- Agent applies security patches
- Updates vulnerable code patterns
- Runs security scans and tests
- Validates fixes don't break functionality

### Feature Implementation
**Example**: Complete features with clear specifications
- Agent implements feature based on specs
- Writes accompanying tests
- Ensures CI passes (tests, linting, types)
- Documents new functionality

### Bug Fixes
**Example**: Resolve issues with reproducible test cases
- Agent analyzes bug report and reproduction steps
- Generates fix
- Verifies fix with test case
- Ensures no regression in existing tests

## Current State (2025)

Background agents are actively being developed, with [[sourcegraph-amp]] mentioned as a primary implementation working toward this vision.

### Infrastructure Status

**What Exists:**
- CLI tools for task initiation
- Server backends for agent execution
- CI/CD integration capabilities
- Feedback loop primitives

**What's Emerging:**
- Full 24/7 autonomous operation
- Mobile initiation interfaces
- Advanced multi-agent coordination
- Production-grade reliability

### Vision vs. Reality

The full vision of background agents—where developers have 10-100 agents working autonomously around the clock—is not yet fully realized. However, the core concepts are proven:
- Agents can iterate based on CI feedback
- Delegate-and-review workflows are functional
- Long-running tasks can be executed successfully

As the Sourcegraph team noted:

> "We are getting better and better. But I think you've seen this treadmill of tools."

The technology is evolving rapidly, with improvements expected to continue at the pace of underlying model advancements.

## Real-World Example

From the Latent Space podcast discussion:

**Scenario**: Implementing a new feature from mobile device

1. **Initiation**: Developer describes feature requirements from phone while away from desk
2. **Exploration**: Agent explores codebase, understands existing patterns and architecture
3. **Implementation**: Agent writes code implementing the feature across multiple files
4. **First Push**: Agent commits and pushes code to repository
5. **CI Fails**: Tests fail with specific error messages about edge cases
6. **Analysis**: Agent reads test failure diagnostics, understands what went wrong
7. **Fix**: Agent generates fixes for edge cases, pushes updated code
8. **CI Passes**: Tests now pass, linting is clean, types check
9. **Review**: Developer reviews completed feature hours later when convenient
10. **Result**: Feature is complete, tested, and ready for final review—all without continuous developer attention

This workflow demonstrates the key advantages:
- Developer didn't need to be at computer
- Agent worked autonomously through multiple iterations
- CI provided effective feedback for self-correction
- Developer's time was optimized—involved only at start and review

## Related Concepts

### Related Agent Patterns
- [[research-agents]] - Similar async pattern, different domain (research vs. coding)
- [[agentic-rag-workflow]] - Autonomous reasoning and decision-making patterns

### Related Technologies
- [[sourcegraph-amp]] - Primary technology implementing background agents
- [[temporal]] - Durable workflow orchestration for long-running agent tasks
- [[langgraph]] - Agent orchestration framework (potential implementation)
- [[letta]] - Agent platform with persistence (potential implementation)
- [[openai-agents-sdk]] - Agent framework (potential implementation)
- [[claude-agent-sdk]] - Agent framework (potential implementation)

### Supporting Concepts
- [[context-engineering]] - Strategies for providing agents with effective context
- [[tool-abstraction-portability]] - Tool-calling patterns used by agents
- [[model-context-protocol]] - Protocol for custom tool integration

### Contrast With
- [[claude-code]] - Primarily interactive agent (CLI-based but synchronous)
- Traditional AI assistants - All synchronous, real-time interaction

## Key Technologies

Technologies that implement or could implement background agents:

- **[[sourcegraph-amp]]** - Active development, CLI + server infrastructure, team collaboration
- **[[temporal]]** - Durable execution primitives for long-running workflows
- **[[langgraph]]** - State management and workflow orchestration
- **[[letta]]** - Persistent agent memory for long-running tasks

Any agentic coding tool could potentially implement background agents with the right infrastructure for:
- Asynchronous execution
- CI/CD integration
- Persistent state management
- Feedback loop processing
