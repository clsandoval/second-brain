---
title: Claude Code (Context7)
type: technology
category: development
tags: [ide, mcp, spec-driven, development, claude]
created: 2025-10-03
updated: 2025-10-03
website: https://claude.ai/claude-code
github-context7: https://github.com/upstash/context7
github-cc-sdd: https://github.com/gotalab/cc-sdd
---

# Claude Code + Context7

## Overview

Enhanced AI-assisted development with up-to-date documentation (Context7 MCP) and structured [[spec-driven-development|spec-driven workflows]] (cc-sdd). Official CLI by Anthropic for AI-assisted coding.

## Context7 - MCP Server

### Purpose
Model Context Protocol (MCP) server that provides up-to-date, version-specific documentation and code examples directly within AI coding assistants.

### Features
- **Real-Time Documentation**: Fetches current docs from official sources
- **Version-Specific**: Gets accurate examples for specific library versions
- **Multi-Platform**: Works with Claude Code, Cursor, Windsurf, VS Code, and more
- **Simple Usage**: Add "use context7" to prompts for instant documentation access
- **Prevents Hallucination**: Eliminates outdated API references and hallucinated methods

### Installation
- Requires Node.js v18.0.0+
- Platform-specific setup for different IDEs
- Optional API key for higher rate limits and private repos

## Spec-Driven Development Patterns

### Core Workflow Architecture

**Interactive Planning with Verification:**
- `/create_plan`: Multi-phase interactive specification creation
  - Read all context files FULLY before planning
  - Spawn parallel research agents (codebase-locator, codebase-analyzer, thoughts-locator)
  - Iterate with skeptical questioning until no open questions remain
  - Generate versioned plan with automated + manual success criteria
  - No plan is finalized with unresolved questions

**Execution with Adaptive Intelligence:**
- `/implement_plan`: Pragmatic phase-by-phase execution
  - Follow plan's intent while adapting to reality
  - Update checkboxes in plan file as work completes
  - Stop and communicate when plan-reality mismatches occur
  - Batch verification at natural stopping points

**Continuous Discovery:**
- `/research_codebase`: Parallel exploration and synthesis
  - Decompose questions into focused research areas
  - Spawn specialized agents concurrently (locator → analyzer → pattern-finder)
  - Generate timestamped research documents with git metadata
  - Include permalinks for permanent code references

### Key Design Principles

**1. Separation of "What" vs "How"**
- Plans specify WHAT to build (requirements, phases, success criteria)
- Implementation determines HOW based on actual codebase reality
- Plans are guides, not scripts - judgment matters

**2. Verifiable Checkpoints**
Each phase has dual verification:
- **Automated**: `make test`, `make lint`, compilation checks
- **Manual**: UI/UX testing, performance validation, user acceptance

**3. Context Layering**
- **Main context**: Orchestration and synthesis
- **Agent contexts**: Focused exploration with constrained tools
- **Persistent context**: Research docs, plans, configs (survive conversations)

**4. Evidence-Based Development**
All claims require file:line references. No assumptions, only verified facts from actual code.

**5. Iterative Refinement**
Plans and research evolve through conversation. First draft → feedback → research → revision → approval.

### Implementation Techniques

**Progressive Context Loading:**
```
1. Read mentioned files FULLY (no limit/offset)
2. Spawn parallel locator agents → find candidates
3. Spawn analyzer agents → deep dive on promising files
4. Synthesize findings with evidence
```

**Pattern Reuse:**
- Use `codebase-pattern-finder` to discover existing approaches
- Model new features after proven implementations
- Include test patterns alongside implementation patterns

**Metadata Tracking:**
Research documents capture:
- Timestamp and timezone
- Git commit and branch
- Researcher identity
- Evolution history (follow-ups appended)

## Supported Platforms

- Claude Code (official CLI by Anthropic)
- Cursor IDE
- Gemini CLI
- Qwen Code
- GitHub Copilot (via Spec Kit)

## Use Cases in Context Engineering

- Building AI applications with clear specifications
- Maintaining consistency across large codebases
- Collaborative development with AI assistants
- Documentation-first development approach
- Reducing hallucinations in AI-generated code
- Implementing [[spec-driven-development]] methodology

## Related Technologies

- [[composio]]: MCP integration for tool access
- [[langfuse]]: Monitor development workflow effectiveness
- Works with all technologies in stack for implementation

## Resources

- [Context7 GitHub](https://github.com/upstash/context7)
- [cc-sdd Spec-Driven Tool](https://github.com/gotalab/cc-sdd)
- [ClaudeLog Context7 Guide](https://claudelog.com/claude-code-mcps/context7-mcp/)
- [GitHub Spec Kit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

---

## Changelog

- **2025-10-03**: Initial note created with Context7 and spec-driven development features
