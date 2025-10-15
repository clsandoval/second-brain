---
title: Sourcegraph AMP
type: technology
category: development
tags: [ai-coding-assistant, agentic-tool, sourcegraph, autonomous-agents, cli, vscode-extension]
created: 2025-10-09
updated: 2025-10-09
website: https://sourcegraph.com/amp
github: https://github.com/sourcegraph/amp-examples-and-guides
documentation: https://ampcode.com/manual
---

# Sourcegraph AMP

## Overview

Sourcegraph AMP is an agentic coding tool engineered to maximize what's possible with today's frontier models. It represents a strategic shift from traditional AI assistants to autonomous agents, designed to handle complex multi-step development tasks with unconstrained quality focus.

Launched in May 2025 as the successor to Sourcegraph's Cody product, AMP embodies a different product philosophy. As Quinn Slack (CEO, Sourcegraph) explained in a Latent Space podcast interview:

> "AMP represents a different kind of product where Cody was very much one of first of its kind with RAG and assistant panels... but with a tool calling agent... that you give a lot of permissions for so it can actually see the file system, interact with the file system or your editor, it's a different thing."

The rebranding reflects the rapid evolution of AI coding tools and the need for products positioned to adapt quickly to weekly model improvements. AMP is available as a VS Code extension, CLI tool, and has compatibility with JetBrains IDEs, Neovim, Cursor, and Windsurf.

### Why "AMP" Instead of "Cody"?

The transition from Cody to AMP wasn't just a rebrand—it was a strategic reset. Sourcegraph observed that "there's not been any tool that has stuck with devs for more than six or 12 months" due to the rapid pace of AI advancement. The company realized:

> "We got to handle this differently. We got to reset expectations. We got to tell users that it's a different thing."

By creating a fresh brand, Sourcegraph enabled itself to iterate faster without being constrained by existing user expectations around what "Cody" should be. The priority became "position yourself in a way that you can react to these changes... everything can change at release of another model."

## Key Features

AMP is built on four core pillars: **unconstrained tokens**, **always best models**, **raw model power**, and **built to evolve**.

### Unconstrained Token Usage

Unlike subscription-based tools with artificial token limits, AMP uses whatever tokens are needed to complete tasks. This pay-as-you-go approach means quality isn't compromised by arbitrary caps.

### Multi-Model Architecture

AMP employs an "Oracle and Worker" pattern:
- **Worker** (Claude Sonnet 4.5): Handles day-to-day coding, proactive implementation
- **Oracle** (GPT-5): Provides complex reasoning, strategic review, debugging assistance

The main agent autonomously decides when to consult the oracle for strategic guidance, combining the strengths of multiple frontier models.

### Subagents

AMP includes specialized sub-agents with isolated context windows:
- **Code Search Sub-agent**: Searches codebases efficiently
- **Generic Sub-agent**: Handles general tasks
- **Oracle Sub-agent**: GPT-5-powered strategic reasoning

### Extended Thinking

Dynamic thinking budget adjustment for Claude Sonnet 4.5 allows the model to "think longer" on complex problems, improving solution quality.

### Context Management

- Context windows up to **1 million tokens**
- Thread compaction to manage long conversations
- Support for multi-codebase context (monorepos, multiple projects)
- **AGENT.md files**: Project-specific instructions at repository root (follows https://agents.md/ specification)

### Team Collaboration

- Thread sharing between team members
- Workspaces for organizing projects
- Leaderboards for team engagement
- Team billing and credit management

### Security Features

- Command allowlisting (control what commands agents can run)
- Zero LLM retention (Enterprise tier - your code never trains models)
- SSO integration (Enterprise)
- Audit logs (Enterprise)

### Tool Integration

- Built-in tools: file system, code search, Git, terminal, CI integration, web search
- Custom tools via **Model Context Protocol (MCP)** - see [[model-context-protocol]]
- Extensible architecture for team-specific workflows

### Amp Tab

Intelligent code completion feature (autocomplete functionality) integrated into the IDE experience.

## Architecture / How It Works

AMP's architecture follows a philosophy of "getting out of the way" - minimal scaffolding between the model and the task. As Thorsten Ball (lead engineer) described:

> "Getting out of the way of these models with as little scaffolding as possible."

### Core Components

1. **Model**: Multi-model selection (Claude Sonnet 4.5 as primary worker, GPT-5 as oracle)
2. **System Prompt**: Small and focused, regularly updated to adapt to model improvements
3. **Tools**: Comprehensive built-in tools plus MCP for custom integrations

### Tool-Calling Philosophy

Rather than building complex orchestration layers, AMP gives models powerful tools and trusts them to use them effectively. The system prompt is kept small, preferring to give models more token budget rather than extensive instructions.

### Context Management Strategy

- Specialized sub-agents operate with isolated context windows
- AGENT.md files provide project-specific guidance without bloating system prompts
- Thread compaction manages long conversations
- Multi-repository context for monorepo workflows

### Background Agents Vision

AMP is positioned as a platform for [[background-agents]] - autonomous agents that work asynchronously on long-running tasks (10-15+ minutes) with CI/CD integration. This represents "the next frontier" in AI coding:

> "That's going to be blown up with async agents when they're running 24/7 concurrently in the background. Then you can have 10 or 100 times as many."

The vision: developers kick off tasks from anywhere (including mobile), agents push code, CI runs tests, agents read diagnostics and iterate, and developers review completed work when convenient. While still in active development, AMP's infrastructure supports this delegate-and-review workflow.

## Pricing & Plans

AMP uses a prepaid credits model with at-cost pricing for most tiers.

### Individual Plan

- **Pricing**: At-cost (pay only for LLM consumption)
- **Credits**: $10 free credits on signup
- **Training**: Optional opt-in for model training
- **Features**: Full access to AMP features, personal use only

### Team Plan

- **Pricing**: At-cost (pay only for LLM consumption)
- **Credits**: Team billing and credit pools
- **Training**: No training on your data
- **Features**: Thread sharing, workspaces, leaderboards, team management

### Enterprise Plan

- **Minimum**: $1,000+ purchase
- **Pricing**: At-cost + 50% markup
- **Features**:
  - Zero LLM retention (code never used for training)
  - SSO integration
  - Audit logs
  - Priority support
  - Volume discounts at $5,000+ (Enterprise Premium)
  - Additional discounts at $25,000+

### Cost Considerations

- Costs vary based on model usage (Claude Sonnet 4.5 vs. GPT-5)
- No artificial token limits - use what you need
- Team credits shared across members
- Enterprise markup reflects security and compliance features

### Comparison to Subscription Models

- **vs. Cursor**: ~$20/month subscription with token limits → AMP: pay-as-you-go, no limits
- **vs. GitHub Copilot**: $10/month for autocomplete → AMP: full agent capabilities, usage-based pricing

## Use Cases in Context Engineering

AMP excels at tasks that benefit from autonomous agent capabilities, extensive context, and iterative refinement.

### Complex Multi-Step Development Tasks

AMP can handle features that span multiple files, require understanding of complex architectures, and need iterative testing and refinement.

### Code Migrations and Refactoring at Scale

Update deprecated APIs across entire codebases, rename functions/classes and fix all references, apply architectural changes systematically.

### Test-Driven Development with CI Integration

The [[background-agents]] workflow is particularly effective for TDD:
1. Agent writes implementation
2. Agent pushes code
3. CI runs tests
4. Agent reads test results
5. Agent iterates until tests pass

### Documentation Generation

Generate comprehensive documentation based on code structure, update docs when code changes, maintain consistency across large projects.

### Security-Focused Development

Integrate with security tools (e.g., StackHawk partnership mentioned in podcast), patch vulnerabilities with test verification, apply security best practices systematically.

### Monorepo Management

Multi-codebase context enables working across multiple projects simultaneously, understanding cross-project dependencies, coordinating changes across services.

### API Design and Review

The Oracle sub-agent (GPT-5) can provide strategic review of API designs, architectural decisions, and complex debugging scenarios.

### Background/Async Work

Delegate long-running tasks (10-15+ minutes), let agents work overnight or over weekends, review completed work when convenient - the delegate-and-review workflow enabled by [[background-agents]].

## Comparison to Other AI Coding Tools

| Feature | AMP | Cursor | Windsurf | GitHub Copilot | Claude Code |
|---------|-----|--------|----------|----------------|-------------|
| **Primary Mode** | Autonomous agent | Interactive agent | Interactive agent | Autocomplete + chat | CLI agent |
| **Token Limits** | Unconstrained | Subscription limits | Subscription limits | Limited context | Unconstrained |
| **Model Selection** | Multi-model (auto) | User selects | User selects | GitHub models | Claude only |
| **Team Features** | Built-in (threads, workspaces) | Limited | Limited | Limited | Individual focus |
| **Platform** | VS Code, CLI, JetBrains, Neovim | Cursor IDE (fork) | Windsurf IDE (fork) | IDE extensions | CLI |
| **Pricing** | Pay-as-you-go credits | ~$20/month subscription | Subscription | $10/month | Varies |
| **Background Agents** | Active development | No | No | No | No |
| **CI/CD Integration** | Yes | Limited | Limited | No | Limited |
| **Subagents** | Yes (code search, generic, oracle) | No | No | No | Yes (different types) |
| **SSO/Enterprise** | Yes (Enterprise tier) | Yes | Yes | Yes | N/A |
| **Context Window** | Up to 1M tokens | Model-dependent | Model-dependent | Limited | Model-dependent |

### Key Differentiators

1. **Unconstrained tokens** - Quality over artificial limits
2. **Automatic best-model selection** - Multi-model oracle/worker pattern
3. **Team collaboration built-in** - Thread sharing, workspaces, leaderboards
4. **Agent-first architecture** - Not retrofitted from an autocomplete tool

### When to Choose AMP

- **Complex tasks** requiring extensive context and multi-step reasoning
- **Team workflows** needing thread sharing and collaboration
- **Enterprise needs** requiring zero LLM retention and SSO
- **Background work** where delegate-and-review is preferable to real-time collaboration
- **Cost flexibility** - pay only for what you use, no subscription waste

### User Feedback

From community discussions:
> "With Cursor, I often felt like it completed about 80% of the job, but the same prompts that stalled out in Cursor are now finishing cleanly and completely with Amp."

## Transition from Cody

### Timeline

- **May 2025**: AMP launched
- **June-July 2025**: Cody Free and Pro plans sunset
- **Ongoing**: Cody Enterprise continues (separate product line)

### Migration Incentives

- Free credits for Cody users migrating to AMP ($10-$40 depending on tier)
- Feature parity and improvements over Cody Free/Pro
- Fresh start with new brand and expectations

### Product Velocity Insight

The rapid transition reflects a broader industry reality:

> "There's not been any tool that has stuck with devs for more than six or 12 months."

AI coding tools operate on 6-12 month cycles due to rapid model improvements. By creating AMP as a "new" product, Sourcegraph positioned itself to react quickly to model releases and industry changes without being constrained by legacy expectations.

Some users don't even realize that the Sourcegraph/Cody team built AMP - the brand separation is intentional and complete.

## Related Technologies

### Similar Tools
- [[claude-code]] - CLI-based agent tool using Claude (individual-focused, synchronous)
- [[github-copilot]] - Autocomplete assistant with chat features
- **Cursor** - IDE fork with AI capabilities (interactive agent)
- **Windsurf** - IDE fork with AI capabilities (interactive agent)

### Agent Frameworks
- [[openai-agents-sdk]] - OpenAI's agent framework (more DIY)
- [[claude-agent-sdk]] - Anthropic's agent framework (library approach)
- [[langgraph]] - LangChain's agent orchestration (graph-based workflows)
- [[letta]] - Agent platform with persistent memory

### Integration & Tooling
- [[model-context-protocol]] - MCP specification for custom tools
- [[composio]] - Tool integration platform (can integrate with AMP via MCP)
- [[temporal]] - Durable workflow orchestration for long-running tasks

### Concepts
- [[background-agents]] - Async agent pattern (AMP's vision)
- [[retrieval-augmented-generation]] - Cody's RAG heritage
- [[agentic-rag-workflow]] - Autonomous reasoning patterns
- [[research-agents]] - Related async agent pattern (research domain)
- [[tool-abstraction-portability]] - Tool-calling patterns
- [[context-engineering]] - Context management strategies

## Resources

### Official Documentation
- **Product Page**: https://sourcegraph.com/amp
- **Owner's Manual**: https://ampcode.com/manual
- **Pricing**: https://sourcegraph.com/pricing
- **Security**: https://ampcode.com/security

### GitHub
- **Examples and Guides**: https://github.com/sourcegraph/amp-examples-and-guides
- **CLI Guide**: https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/cli/README.md
- **Day-0 Guide**: https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/day-0/README.md
- **MCP Setup**: https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/amp-mcp-setup-guide.md

### Specifications
- **AGENT.md Spec**: https://agents.md/
- **AGENT.md Announcement**: https://ampcode.com/news/AGENT.md
- **Multiple AGENT.md Files**: https://ampcode.com/news/multiple-AGENT.md-files

### Blog Posts
- **Cody Transition**: https://sourcegraph.com/blog/changes-to-cody-free-pro-and-enterprise-starter-plans
- **MCP Support**: https://sourcegraph.com/blog/cody-supports-anthropic-model-context-protocol

### Community & Podcasts
- **Community Forum**: https://community.sourcegraph.com/c/amp/15
- **Latent Space Podcast #648**: https://www.youtube.com/watch?v=b4rOVZWLW6E (Quinn Slack & Thorsten Ball interview)
- **Changelog Podcast #648**: https://changelog.com/podcast/648
