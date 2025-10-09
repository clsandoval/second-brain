---
date: 2025-10-09T23:41:06+08:00
planner: Claude
topic: "Sourcegraph AMP and Background Agents"
tags: [vault-planning, ai-coding-assistants, agentic-tools, sourcegraph, async-agents]
status: ready_to_write
---

# Vault Notes Plan: Sourcegraph AMP and Background Agents

## Research Summary

This plan is based on comprehensive research from a Latent Space podcast episode (YouTube: https://www.youtube.com/watch?v=b4rOVZWLW6E) featuring Quinn Slack (CEO, Sourcegraph) and Thorsten Ball (lead engineer, AMP), along with official Sourcegraph documentation and web research.

### Key Discoveries:

**From the podcast transcript:**
- Sourcegraph transitioned from "Cody" (AI assistant) to "AMP" (autonomous agent) in 2025
- Rationale: AI coding tools evolve rapidly (6-12 month cycles); fresh brand enables faster iteration
- AMP's core philosophy: unconstrained tokens, automatic best-model selection, agent-first architecture
- Multi-model "Oracle and Worker" pattern: Claude Sonnet 4.5 (worker) + GPT-5 (oracle for complex reasoning)
- Vision for "async agents": 24/7 background agents that work autonomously with CI/CD integration
- Product velocity is critical: tools must be positioned to react to weekly model improvements

**From web research:**
- Official sites: https://sourcegraph.com/amp, https://ampcode.com/manual
- GitHub: https://github.com/sourcegraph/amp-examples-and-guides
- Launched May 2025; Cody Free/Pro sunset June-July 2025 (Cody Enterprise continues)
- Pricing: Pay-as-you-go credits (Individual/Team at-cost, Enterprise $1,000+ minimum with 50% markup)
- Platform support: VS Code extension, CLI, JetBrains, Neovim, Cursor/Windsurf compatible
- Key features: subagents, extended thinking, 200K-1M token context, MCP support, AGENT.md files, team collaboration
- Security: Command allowlisting, zero LLM retention (Enterprise), SSO

**From existing vault:**
- No existing notes on Sourcegraph, Cody, or AMP
- Related notes exist: [[claude-code]], [[claude-agent-sdk]], [[openai-agents-sdk]], [[langgraph]], [[letta]], [[model-context-protocol]]
- Concepts documented: [[retrieval-augmented-generation]], [[research-agents]], [[agentic-rag-workflow]], [[tool-abstraction-portability]]
- Gap identified: No concept note on "background/async agents" (distinct from interactive agents)

**From thoughts/ directory:**
- Multiple agent framework plans documented (OpenAI AgentKit, LangGraph, Claude Agent SDK, OpenAI Agents SDK)
- Research on research agents (Goodfire.ai article analysis)
- No existing documentation on Sourcegraph ecosystem

### Research Gaps Resolved:
- ✅ AMP architecture and features fully documented from official sources
- ✅ Pricing structure clarified (prepaid credits, enterprise tiers)
- ✅ Background agents concept explained in podcast (vision vs. current reality)
- ✅ Comparison landscape mapped (Cursor, Windsurf, Copilot, Claude Code)
- ✅ All official documentation links gathered

---

## Scope Decision

### Recommended Approach: Multiple Notes

This topic naturally splits into two distinct notes because:

1. **Sourcegraph AMP** is a concrete technology/product with specific architecture, features, pricing
2. **Background Agents** is a broader conceptual pattern that applies beyond AMP and represents a paradigm shift in how agents work

The podcast dedicates significant discussion to both topics as separate but related subjects. Background agents are AMP's "next frontier" but represent a pattern that could be implemented by any agentic tool.

### Notes to Create:

1. **Sourcegraph AMP** (`apps/vault/tech/sourcegraph-amp.md`)
   - **Type**: technology
   - **Rationale**: Specific product with unique architecture, features, and business model. New technology not currently in vault. Distinct enough from existing [[claude-code]] note (different company, different architecture, different feature set).

2. **Background Agents** (`apps/vault/concepts/background-agents.md`)
   - **Type**: concept
   - **Rationale**: Represents a distinct pattern from interactive agents. Concept doesn't exist in vault yet. Applies beyond just AMP to any autonomous agent system. Complements existing [[research-agents]] note (which focuses on research/experimentation, not autonomous coding).

---

## Note 1: Sourcegraph AMP

### File Location
`apps/vault/tech/sourcegraph-amp.md`

### Structure

1. **Overview**
   - What AMP is: agentic coding tool (VS Code extension + CLI)
   - Purpose: autonomous complex task execution with unconstrained quality focus
   - Relationship to Cody: successor product, rebranded May 2025
   - Brief history: why Sourcegraph transitioned brands

2. **Key Features**
   - Multi-platform support (VS Code, CLI, JetBrains, Neovim, Cursor/Windsurf compatibility)
   - Subagents (code search, generic, oracle)
   - Extended thinking (dynamic thinking budget for Claude Sonnet 4.5)
   - Context management (200K-1M tokens, thread compaction)
   - Team collaboration (thread sharing, workspaces, leaderboards)
   - Security features (command allowlisting, zero LLM retention, SSO)
   - Configuration (AGENT.md file support, MCP integration)
   - Amp Tab (intelligent code completion)

3. **Architecture/How It Works**
   - Core components: model + system prompt + tools
   - Multi-model "Oracle and Worker" pattern
     - Worker: Claude Sonnet 4.5 (primary coding, proactive implementation)
     - Oracle: GPT-5 (complex reasoning, strategic review, debugging)
   - Tool-calling system philosophy ("getting out of the way")
   - Built-in tools (file system, code search, Git, terminal, CI integration, web search)
   - Custom tools via Model Context Protocol (MCP)
   - System prompt characteristics (small, focused, regularly updated)
   - Context management (specialized sub-agents with isolated context, AGENT.md files)
   - Background agents vision (link to [[background-agents]] concept note)

4. **Pricing & Plans**
   - Prepaid credits model (at-cost pricing)
   - Individual Plan ($10 free credits on signup)
   - Team Plan (team billing, thread sharing)
   - Enterprise Plan ($1,000+ minimum, 50% markup, volume discounts)
   - Cost factors (LLM consumption, model usage varies)
   - Target audience (individual devs, teams, enterprises)

5. **Use Cases in Context Engineering**
   - Complex multi-step development tasks
   - Code migrations and refactoring at scale
   - Test-driven development with CI integration
   - Documentation generation
   - Security-focused development
   - Monorepo management
   - API design and review
   - Background/async work (delegate-and-review workflow)

6. **Comparison to Other AI Coding Tools**
   - Brief comparison table: AMP vs. Cursor vs. Windsurf vs. Copilot vs. Claude Code
   - Key differentiators:
     - Unconstrained token usage (vs subscription limits)
     - Automatic best-model selection (vs user choice)
     - Team collaboration built-in
     - Agent-first architecture (not retrofitted)
   - When to choose AMP (complex tasks, team workflows, enterprise needs)

7. **Transition from Cody**
   - Why the rebrand (enable faster iteration, reset expectations, different product category)
   - Sunset timeline (June-July 2025 for Free/Pro, Enterprise continues)
   - Migration incentives ($10-$40 free credits)
   - Product velocity insight (6-12 month tool cycles in AI coding)

8. **Related Technologies**
   - Links to [[claude-code]], [[model-context-protocol]], [[composio]]
   - Comparison to [[openai-agents-sdk]], [[claude-agent-sdk]], [[langgraph]], [[letta]]
   - Integration with [[temporal]] for durable workflows

9. **Resources**
   - Official documentation (product page, manual, pricing)
   - GitHub examples and guides
   - Community forum and support
   - Podcast interview (Latent Space #648)

### Key Content Points

**Overview Section:**
- "Sourcegraph AMP is an agentic coding tool engineered to maximize what's possible with today's frontier models"
- Strategic shift from traditional AI assistants to autonomous agents
- Launched May 2025 as successor to Cody
- Quote from podcast: "AMP represents a different kind of product where Cody was very much one of first of its kind with RAG and assistant panels... but with a tool calling agent... that you give a lot of permissions for so it can actually see the file system, interact with the file system or your editor, it's a different thing"

**Key Features:**
- Unconstrained token usage: "No artificial token limits; uses whatever is needed to complete tasks"
- Four pillars: unconstrained tokens, always best models, raw model power, built to evolve
- Subagents: code-based search sub-agent, generic sub-agent, "Oracle" sub-agent (GPT-5)
- Extended thinking: dynamic thinking budget adjustment for Claude Sonnet 4.5
- Context window: up to 1 million tokens
- Team features: thread sharing, workspaces, leaderboards
- AGENT.md specification: project-specific instructions at repository root
- MCP support: integrate custom tools via Model Context Protocol

**Architecture:**
- Multi-model pattern: Claude Sonnet 4.5 (worker) + GPT-5 (oracle)
- Worker handles day-to-day coding, oracle provides strategic reasoning
- Main agent autonomously decides when to consult oracle
- Tool-calling philosophy: minimal scaffolding, "getting out of the way"
- Quote: "Getting out of the way of these models with as little scaffolding as possible"
- System prompts kept small and focused vs. giving models more tokens
- Specialized sub-agents with isolated context windows
- Support for AGENT.md files (official spec: https://agents.md/)

**Pricing:**
- Individual: at-cost pricing, $10 free on signup, optional opt-in training
- Team: at-cost pricing, no training on data, thread sharing
- Enterprise: $1,000+ minimum, 50% markup, zero LLM retention, SSO, audit logs
- Enterprise Premium: $5,000+ purchases, volume discounts at $25,000+
- Comparison: vs. Cursor (~$20/month subscription), Copilot ($10/month)

**Cody Transition:**
- Insight: "There's not been any tool that has stuck with devs for more than six or 12 months"
- Quote: "We realized we got to handle this differently. We got to reset expectations. We got to tell users that it's a different thing"
- Problem: couldn't evolve Cody fast enough with existing brand expectations
- Solution: fresh brand (AMP) enables treating it as completely new product
- Some users don't even know Sourcegraph/Cody team made AMP
- Priority: "position yourself in a way that you can react to these changes... everything can change at release of another model"

**Comparison Points:**
- User feedback: "With Cursor, I often felt like it completed about 80% of the job, but the same prompts that stalled out in Cursor are now finishing cleanly and completely with Amp"
- AMP vs. Cursor: unconstrained tokens vs. subscription limits, auto model selection vs. user choice
- AMP vs. Copilot: full agent vs. autocomplete, multi-codebase context vs. single repo
- AMP vs. Claude Code: multi-model vs. Claude only, team features vs. individual focus
- Feature matrix: autonomous agents, autocomplete, team collaboration, multi-model, CLI, IDE type, token limits, SSO, CI/CD integration, subagents

**Background Agents Vision:**
- "The next frontier" in AI coding (link to [[background-agents]])
- Vision: kick off 10-15+ minute tasks from anywhere, agents work 24/7
- Workflow: agent pushes code → CI runs tests → agent reads diagnostics → agent iterates
- Quote: "That's going to be blown up with async agents when they're running 24/7 concurrently in the background. Then you can have 10 or 100 times as many"
- Current status: actively developed, infrastructure supports vision

**Use Cases:**
- Complex multi-step tasks (migrations, refactoring)
- CI/CD integration (agent iterates based on test results)
- Code generation at scale
- Security analysis (StackHawk partnership mentioned)
- Documentation generation
- Monorepo management
- Background work (delegate-and-review vs. real-time collaboration)

### Relationships & Links

**Links to existing notes:**
- [[claude-code]] - Similar CLI-based agent tool using Claude
- [[model-context-protocol]] - MCP integration for custom tools
- [[tool-abstraction-portability]] - Tool-calling patterns
- [[context-engineering]] - Context management strategies
- [[openai-agents-sdk]] - Comparison: OpenAI's agent framework
- [[claude-agent-sdk]] - Comparison: Anthropic's agent framework
- [[langgraph]] - Comparison: LangChain's agent orchestration
- [[letta]] - Comparison: agent platform with persistent memory
- [[composio]] - Tool integration platform (can integrate with AMP via MCP)
- [[temporal]] - Durable workflow orchestration (relevant for long-running tasks)
- [[retrieval-augmented-generation]] - Cody's RAG heritage
- [[agentic-rag-workflow]] - Example of agentic patterns
- [[research-agents]] - Related agent pattern (research vs. coding focus)

**New wikilinks to create:**
- [[background-agents]] - Will be created in Note 2 (concept of async/24/7 agents)

**Technologies to reference in comparisons:**
- Cursor (IDE fork of VS Code with AI)
- Windsurf (IDE fork with AI)
- GitHub Copilot (autocomplete assistant)
- VS Code (base platform)

### Frontmatter

```yaml
title: Sourcegraph AMP
type: technology
category: development
tags: [ai-coding-assistant, agentic-tool, sourcegraph, autonomous-agents, cli, vscode-extension]
created: 2025-10-09
updated: 2025-10-09
website: https://sourcegraph.com/amp
github: https://github.com/sourcegraph/amp-examples-and-guides
documentation: https://ampcode.com/manual
```

### Success Criteria

- [x] Definition is clear and accurate (what AMP is, how it differs from Cody)
- [x] All key features are covered (subagents, extended thinking, team collaboration, security)
- [x] Architecture section explains multi-model pattern and tool-calling philosophy
- [x] Pricing structure is documented with all tiers
- [x] Concrete examples and use cases are included
- [x] Comparison to other tools (Cursor, Copilot, Claude Code, Windsurf) included
- [x] Cody transition rationale explained (product velocity insight)
- [x] All relationships documented via [[wikilinks]]
- [x] All [[wikilinks]] point to existing notes or marked as TODOs
- [x] Resources and references are accurate (official docs, GitHub, podcast)
- [x] Follows technology template structure

---

## Note 2: Background Agents

### File Location
`apps/vault/concepts/background-agents.md`

### Structure

1. **Definition**
   - What background/async agents are
   - How they differ from interactive/synchronous agents
   - The "next frontier" in AI coding (2025 context)

2. **Key Characteristics**
   - Long-running tasks (10-15+ minutes)
   - Autonomous operation (24/7 potential)
   - CI/CD integration for feedback loops
   - "Delegate-and-review" vs. "collaborate in real-time" workflow
   - Mobile initiation capability

3. **Architecture & Workflow**
   - Typical workflow:
     1. Developer describes feature/task
     2. Background agent starts working
     3. Agent pushes code to repository
     4. CI runs tests and linters
     5. Agent reads pass/fail diagnostics
     6. Agent iterates and improves
     7. Developer reviews when convenient
   - Feedback loop design
   - Algorithm: loop-until-solution with self-correction

4. **How It Relates**
   - Connection to [[research-agents]] (similar async pattern, different domain)
   - Comparison to interactive agents ([[claude-code]], traditional assistants)
   - Relationship to [[agentic-rag-workflow]] (autonomous reasoning patterns)
   - Connection to [[temporal]] (durable execution for long-running tasks)

5. **Implementation Patterns**
   - Best practices for effective feedback loops
   - When to use background vs. interactive agents
   - Handling CI latency (becomes acceptable in async context)
   - Effective vs. perfect replication philosophy
   - Multiple approach strategies

6. **Use Cases**
   - Repetitive coding tasks (migrations, refactoring)
   - Complex multi-file changes
   - Test-driven development (TDD) workflows
   - Documentation generation
   - Security vulnerability fixes
   - Code quality improvements
   - Overnight/weekend work scenarios

7. **Key Technologies**
   - [[sourcegraph-amp]] (primary implementation discussed)
   - [[temporal]] (durable workflow orchestration)
   - Potential implementations: [[langgraph]], [[letta]], [[openai-agents-sdk]]

8. **Real-World Applications**
   - Current state (2025): actively being developed
   - Vision vs. reality
   - Example workflows from Sourcegraph AMP

9. **Comparison: Background vs. Interactive Agents**
   - When to use each
   - Strengths and limitations
   - Hybrid approaches

### Key Content Points

**Definition:**
- "Background agents are autonomous AI agents that operate asynchronously on long-running tasks (typically 10-15+ minutes) without requiring real-time developer interaction"
- Key shift: from "collaborate in real-time" to "delegate and review"
- Quote from podcast: "That's going to be blown up with async agents when they're running 24/7 concurrently in the background. Then you can have 10 or 100 times as many"
- Described as "the next frontier" in AI coding (Latent Space podcast #648, October 2025)

**Key Characteristics:**
- Autonomous operation: agent works independently without human in the loop
- Long-running: tasks that take 10-15+ minutes (vs. seconds for interactive)
- CI/CD integrated: agents read test results and iterate automatically
- Delegate-and-review workflow: developer sets task, reviews completion later
- Mobile initiation: kick off tasks from anywhere, not just IDE
- Scalability: 10-100x more agents can work concurrently vs. interactive (one at a time)
- Asynchronous by design: CI latency becomes acceptable (not a bottleneck)

**Architecture & Workflow:**
- Standard workflow:
  1. Developer describes feature/task (from IDE, CLI, or mobile)
  2. Background agent starts autonomous work
  3. Agent explores codebase, understands context
  4. Agent generates solution and pushes code to repository
  5. CI/CD pipeline runs (tests, linters, type checks)
  6. Agent reads diagnostic output (pass/fail, error messages)
  7. Agent iterates and improves based on feedback
  8. Developer reviews completed work when convenient
- Feedback loop design: "effective feedback loops rather than perfect replication"
- Algorithm: basic "loop until solution" with self-correction
- Multiple approach strategy: agent tries different solutions if stuck

**Implementation Insights:**
- Quote: "Asynchronous nature makes CI latency acceptable"
- Philosophy: focus on effective feedback (CI diagnostics) rather than perfect environment replication
- Self-correction: agents autonomously fix failures based on CI output
- Particularly effective for repetitive coding tasks
- Vision: agents work overnight/weekends while developers rest

**Comparison to Interactive Agents:**

| Aspect | Background Agents | Interactive Agents |
|--------|------------------|--------------------|
| **Interaction** | Asynchronous, delegate-and-review | Synchronous, real-time collaboration |
| **Duration** | 10-15+ minutes (long-running) | Seconds to minutes (responsive) |
| **Concurrency** | 10-100+ agents simultaneously | Typically 1 agent at a time |
| **Human Involvement** | Minimal (start task, review result) | Continuous (guide, approve, iterate) |
| **Feedback Source** | CI/CD diagnostics, test results | Human feedback, immediate corrections |
| **Use Cases** | Repetitive tasks, large refactors | Exploratory coding, learning new codebases |
| **Error Handling** | Autonomous iteration via CI feedback | Human-guided debugging |
| **Initiation** | From anywhere (mobile, CLI, IDE) | Typically in IDE/terminal |
| **Review Timing** | When convenient (hours/days later) | Immediate (real-time) |

**When to Use Background Agents:**
- Complex multi-file refactoring across large codebases
- Repetitive coding patterns (e.g., updating API calls across 100+ files)
- Test-driven development where CI provides clear pass/fail
- Documentation generation or updates
- Security vulnerability fixes with clear test cases
- Code quality improvements (linting, type annotations)
- Tasks that can run overnight or over weekends
- When you want to delegate work and review later

**When to Use Interactive Agents:**
- Exploratory programming (understanding new codebase)
- Learning and experimentation
- Complex debugging requiring human insight
- Tasks requiring frequent human decisions
- Rapid prototyping with immediate feedback
- When you want to learn from the agent's process
- Pair programming scenarios

**Implementation Patterns:**
- Best practice: design effective feedback loops (clear CI diagnostics)
- Pattern: start with interactive exploration, delegate repetitive work to background
- Hybrid approach: interactive for planning, background for execution
- Error handling: ensure CI provides actionable error messages
- Monitoring: track agent progress without blocking on it

**Use Cases:**
- Code migration: update deprecated APIs across entire codebase
- Refactoring: rename functions/classes and fix all references
- Test generation: write tests for untested modules
- Documentation: generate/update docs based on code changes
- Type annotations: add type hints to untyped Python codebase
- Dependency updates: upgrade libraries and fix breaking changes
- Security fixes: patch vulnerabilities with test verification
- Code quality: apply linting rules and fix violations
- Feature implementation: complete features with clear specifications
- Bug fixes: resolve issues with reproducible test cases

**Current State (2025):**
- Actively being developed (Sourcegraph AMP mentioned as primary implementation)
- Infrastructure exists: CLI tools, server backends, CI integration
- Vision stage: full 24/7 autonomous operation not yet realized
- Quote: "We are getting better and better. But I think you've seen this treadmill of tools"
- Positioned as evolutionary next step beyond interactive agents

**Real-World Example (from podcast):**
- Developer kicks off feature implementation from mobile device
- Agent works autonomously: explores codebase, writes code, pushes to repo
- CI runs tests (may fail initially)
- Agent reads test failures, understands errors, fixes code
- Process repeats until tests pass
- Developer reviews completed feature hours/days later
- Result: feature completed without continuous developer attention

### Relationships & Links

**Links to existing notes:**
- [[research-agents]] - Similar async pattern, different domain (research vs. coding)
- [[agentic-rag-workflow]] - Autonomous reasoning and decision-making patterns
- [[temporal]] - Durable workflow orchestration for long-running agent tasks
- [[context-engineering]] - Strategies for providing agents with effective context
- [[tool-abstraction-portability]] - Tool-calling patterns used by agents
- [[langgraph]] - Agent orchestration framework (potential implementation)
- [[letta]] - Agent platform with persistence (potential implementation)
- [[openai-agents-sdk]] - Agent framework (potential implementation)
- [[claude-agent-sdk]] - Agent framework (potential implementation)

**Links to new notes:**
- [[sourcegraph-amp]] - Primary technology implementing background agents (created in Note 1)

**Technologies that implement or could implement this concept:**
- [[sourcegraph-amp]] - Active development, CLI + server infrastructure
- [[temporal]] - Durable execution primitives for long-running workflows
- [[langgraph]] - State management and workflow orchestration
- [[letta]] - Persistent agent memory for long-running tasks

**Contrast with:**
- [[claude-code]] - Primarily interactive agent (CLI-based but synchronous)
- Traditional AI assistants - All synchronous, real-time interaction

### Frontmatter

```yaml
title: Background Agents
type: concept
tags: [async-agents, autonomous-agents, ci-cd-integration, long-running-tasks, delegate-and-review]
created: 2025-10-09
updated: 2025-10-09
```

### Success Criteria

- [x] Definition is clear and distinguishes from interactive agents
- [x] Key characteristics are covered (long-running, autonomous, CI-integrated)
- [x] Architecture and workflow are explained with concrete steps
- [x] Comparison table between background and interactive agents included
- [x] Implementation patterns and best practices documented
- [x] Use cases are concrete and practical
- [x] Current state (2025) vs. vision clarified
- [x] Real-world example from podcast included
- [x] All relationships documented via [[wikilinks]]
- [x] All [[wikilinks]] point to existing notes or marked as TODOs
- [x] Follows concept template structure
- [x] Complements existing [[research-agents]] note without duplication

---

## Research References

### Primary Sources:
- **YouTube Video**: https://www.youtube.com/watch?v=b4rOVZWLW6E (Latent Space podcast #648 with Quinn Slack and Thorsten Ball)
- **Transcript**: `C:\Users\armor\OneDrive\Desktop\cs\radar\transcript.en.srt` (downloaded from video)

### Official Documentation:
- **Product Page**: https://sourcegraph.com/amp
- **Owner's Manual**: https://ampcode.com/manual
- **Pricing**: https://sourcegraph.com/pricing
- **GitHub**: https://github.com/sourcegraph/amp-examples-and-guides
- **CLI Guide**: https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/cli/README.md
- **Day-0 Guide**: https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/day-0/README.md
- **MCP Setup**: https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/amp-mcp-setup-guide.md
- **Security**: https://ampcode.com/security

### Specifications:
- **AGENT.md**: https://agents.md/
- **AGENT.md Announcement**: https://ampcode.com/news/AGENT.md
- **Multiple AGENT.md Files**: https://ampcode.com/news/multiple-AGENT.md-files

### Blog Posts:
- **Cody Transition**: https://sourcegraph.com/blog/changes-to-cody-free-pro-and-enterprise-starter-plans
- **MCP Support**: https://sourcegraph.com/blog/cody-supports-anthropic-model-context-protocol

### Community:
- **Community Forum**: https://community.sourcegraph.com/c/amp/15
- **Changelog Podcast**: https://changelog.com/podcast/648

### Existing Vault Notes:
- `apps/vault/tech/claude-code.md` - Related CLI-based agent tool
- `apps/vault/tech/model-context-protocol.md` - MCP specification
- `apps/vault/tech/claude-agent-sdk.md` - Agent framework comparison
- `apps/vault/tech/openai-agents-sdk.md` - Agent framework comparison
- `apps/vault/tech/langgraph.md` - Agent orchestration comparison
- `apps/vault/tech/letta.md` - Agent platform comparison
- `apps/vault/concepts/research-agents.md` - Related async agent pattern
- `apps/vault/concepts/agentic-rag-workflow.md` - Agentic pattern example
- `apps/vault/concepts/retrieval-augmented-generation.md` - Cody's RAG heritage
- `apps/vault/concepts/tool-abstraction-portability.md` - Tool-calling patterns
- `apps/vault/concepts/context-engineering.md` - Context management strategies

### Thoughts Research:
- `thoughts/shared/plans/vault_notes/claude-agent-sdk.md` - Agent SDK plan
- `thoughts/shared/plans/vault_notes/langgraph.md` - LangGraph plan
- `thoughts/shared/plans/vault_notes/openai-agentkit.md` - AgentKit plan
- `thoughts/shared/plans/vault_notes/openai-agents-sdk.md` - Agents SDK plan
- `thoughts/shared/research/2025-10-04_research-agents-goodfire.md` - Research agents article

---

## Index Update Required

**Yes** - The vault index (`apps/vault/README.md`) should be updated to include both new notes:

### Technology Section (AI Development Tools):
Add under existing AI tool listings:
```markdown
- [[sourcegraph-amp]] - Agentic coding tool (VS Code extension + CLI) with multi-model architecture, team collaboration, and background agent support
```

### Concepts Section (Agentic Patterns):
Add near [[research-agents]]:
```markdown
- [[background-agents]] - Autonomous agents that operate asynchronously on long-running tasks with CI/CD integration (delegate-and-review workflow)
```

---

## Additional Considerations

### Dependencies:
- **Note 1 (Sourcegraph AMP)** links to Note 2 ([[background-agents]]) in the Architecture section
- **Note 2 (Background Agents)** links to Note 1 ([[sourcegraph-amp]]) in the Technologies section
- Both notes should be created in order (Note 1 first, then Note 2) to ensure wikilinks resolve correctly

### Complementary Notes:
- These notes complement existing agent framework notes ([[claude-agent-sdk]], [[openai-agents-sdk]], [[langgraph]], [[letta]]) by documenting a specific product and async pattern
- [[background-agents]] complements [[research-agents]] (async coding vs. async research)
- [[sourcegraph-amp]] provides comparison context for [[claude-code]] (both are agent-first tools)

### Future Updates:
- As background agents evolve from vision to reality, Note 2 should be updated with production patterns
- Sourcegraph AMP will likely add features rapidly (monthly updates recommended)
- Comparison section in Note 1 may need updates as Cursor, Windsurf, and other tools evolve
- If Cursor, Windsurf, or other tools mentioned get their own vault notes, add reciprocal links

### Migration Notes:
- No existing vault notes need updates (these are new topics)
- Index update required (see above)
- Consider adding cross-references to [[context-engineering]] about AMP's context management strategies

### Edge Cases:
- Background agents are still emerging (2025); document current state clearly vs. future vision
- Pricing for AMP is usage-based; may change as LLM costs fluctuate
- Some features mentioned in podcast may not yet be GA (verify against official docs during note writing)
- Cody Enterprise continues; clarify in note that only Free/Pro/Enterprise Starter are sunset

### Content Freshness:
- Podcast date: October 2025
- Product launch: May 2025
- Cody sunset: June-July 2025
- All information is current as of plan creation (October 9, 2025)
- Recommend review in 3-6 months given rapid AI tool evolution mentioned in podcast
