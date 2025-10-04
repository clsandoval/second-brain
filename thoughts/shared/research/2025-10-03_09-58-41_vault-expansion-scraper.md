---
date: 2025-10-03T09:58:41-00:00
researcher: Claude Code
git_commit: N/A (no commits yet)
branch: main
repository: second-brain
topic: "Creating a Weekly Vault Expansion Scraper for High-Quality Cutting-Edge Content"
tags: [research, codebase, scraper, vault-expansion, automation, content-curation]
status: complete
last_updated: 2025-10-03
last_updated_by: Claude Code
---

# Research: Creating a Weekly Vault Expansion Scraper for High-Quality Cutting-Edge Content

**Date**: 2025-10-03T09:58:41-00:00
**Researcher**: Claude Code
**Git Commit**: N/A (no commits yet)
**Branch**: main
**Repository**: second-brain

## Research Question

How should we create a scraper in the scraper directory that expands the vault every week with only high-quality entries that are new and cutting-edge? The scraper should focus on signal from the past week and capture either concepts or tech that are remotely related to what's already in the vault.

## Summary

Based on comprehensive codebase analysis, here are the key findings:

1. **No Existing Scraper Infrastructure**: The repository currently has no scraper directory or web scraping code. This needs to be built from scratch.

2. **Well-Defined Vault Structure**: The vault is located at `apps/vault/` and contains a highly structured knowledge base focused on context engineering, LLM applications, and AI orchestration. Content is organized into:
   - **concepts/** (7 files): Core methodologies and frameworks
   - **tech/** (6 files): Specific tools and platforms
   - **examples/** (3 files): Implementation patterns

3. **Strong Content Conventions**: All notes follow consistent patterns with YAML frontmatter, hierarchical structure, cross-referencing via wiki-links, and changelog tracking. This provides a clear template for scraped content.

4. **Existing Automation Patterns**: While no web scraping exists, the vault documents several automation patterns including:
   - Temporal for workflow orchestration
   - LangGraph for agent orchestration
   - CI/CD via Fly.io + GitHub Actions
   - Multi-stage processing pipelines

5. **Clear Content Focus**: The vault centers on context engineering with four strategies (Write, Select, Compress, Isolate), making it clear what types of content would be "relevant" to scrape.

## Detailed Findings

### Current Vault Structure

**Location**: `C:\Users\armor\OneDrive\Desktop\cs\second-brain\apps\vault\`

**Directory Layout**:
```
vault/
├── concepts/          # 7 notes - Core concepts and methodologies
├── tech/             # 6 notes - Technology and platform notes
├── examples/         # 3 notes - Implementation examples and patterns
├── .obsidian/        # Obsidian configuration
└── README.md         # Index file with concept map
```

**Total Content**: 16 markdown files (15 notes + 1 README)

**Platform**: Obsidian knowledge base with extensive cross-referencing

**Content Focus Areas**:
- Context engineering and LLM application development
- Retrieval-augmented generation (RAG) patterns
- AI agent orchestration and workflows
- Tool integration and abstraction
- Observability and monitoring
- Infrastructure and deployment

**Key Reference**: `apps/vault/README.md:1-73` - Contains complete vault index and concept map

### Content Structure & Quality Conventions

All vault notes follow a **strict, consistent structure** that should inform scraper output:

**1. Frontmatter Template** (from `apps/vault/concepts/context-engineering.md:1-7`, `apps/vault/tech/onyx.md:1-11`):
```yaml
---
title: [Note Title]
type: [concept|technology|example]
category: [Optional - for tech: data-connectivity, orchestration, etc.]
tags: [array, of, relevant, tags]
created: YYYY-MM-DD
updated: YYYY-MM-DD
website: [Optional - for tech]
github: [Optional - for tech]
license: [Optional - for tech]
---
```

**2. Content Sections**:
- H1 title (matches frontmatter)
- Definition/Overview
- Core features/strategies/components
- Best practices
- How it relates (cross-references to existing vault notes)
- Related technologies
- Resources (external links)
- Changelog

**3. Quality Indicators**:
- Specific metrics and benchmarks (e.g., "20x compression," "21.4% improvement")
- Source attribution (documentation links, GitHub repos)
- Timestamp tracking (created, updated dates)
- Cross-references to related concepts (bidirectional linking)

**4. Linking Conventions** (from `apps/vault/concepts/prompt-scaffolding.md:54-58`):
```markdown
[[note-name]]                          # Link to note
[[note-name|display text]]             # Link with custom text
[[note-name#section]]                  # Link to specific section
```

### No Existing Scraper Infrastructure

**Search Coverage**: Comprehensive search performed for:
- Keywords: scraper, scraping, crawl, spider, harvest, ingest
- Libraries: puppeteer, playwright, cheerio, beautifulsoup, selenium
- File patterns: Any scraper-related filenames
- All file types: JS, TS, Python, etc.

**Result**: No scraper code or directory exists. This is a greenfield project.

**Implication**: Need to create:
1. New `scrapers/` directory (or `apps/scrapers/`)
2. Scraper implementation from scratch
3. Integration with vault structure
4. Automation/scheduling mechanism

### Existing Automation Patterns

While no scrapers exist, the vault documents several automation patterns that could be leveraged:

#### 1. Workflow Orchestration with Temporal

**Reference**: `apps/vault/tech/temporal.md:1-80`

**Key Features**:
- Durable execution for long-running workflows
- Automatic state preservation and recovery
- Built-in retry mechanisms
- Task queues, timers, and signals

**Use Case for Scraper**: Could orchestrate weekly scraping workflow with multiple stages:
```
Weekly Trigger → Discover Sources → Scrape Content →
Filter Quality → Check Relevance → Generate Notes →
Commit to Vault → Notify User
```

**Comparison to Alternatives**: Unlike Celery (stateless task queue), Temporal provides stateful workflow orchestration ideal for multi-step scraping pipelines.

#### 2. Multi-Stage Processing Pipeline

**Reference**: `apps/vault/examples/context-compression-pipeline.md:18-31`

**Pattern**: 5-stage automated quality control
```
Input → Chunking → Relevance Ranking → Selection →
Compression → Quality Check → Output
```

**Metrics Tracked**:
- Compression ratio
- Relevance scores
- Quality scores
- Latency
- Cost

**Use Case for Scraper**: Apply similar multi-stage filtering:
```
Raw Content → Extract Text → Quality Filter →
Relevance Check → Deduplication → Format → Vault Entry
```

#### 3. Agentic Decision Loop

**Reference**: `apps/vault/examples/agentic-rag-workflow.md:17-29`

**Pattern**: Autonomous evaluation and iteration
```
Query → Decision Point → Action → Evaluation →
If insufficient quality → Iterate
```

**Use Case for Scraper**: Agent could autonomously:
- Decide which sources to scrape based on past quality
- Evaluate scraped content quality
- Iterate or retry if quality insufficient
- Learn from user feedback on scraped content

#### 4. CI/CD Automation with GitHub Actions

**Reference**: `apps/vault/tech/flyio.md:1-80`

**Pattern**: Automated deployment on commit/schedule

**Use Case for Scraper**:
- GitHub Actions workflow triggered weekly (cron schedule)
- Runs scraper → Commits new notes → Creates PR for review
- Optional auto-merge if quality thresholds met

### Content Topics & Domains

**Primary Domain**: Context Engineering for LLM Applications

The vault is organized around a **unified framework** with four core strategies:

**1. Core Framework** (`apps/vault/concepts/context-engineering.md:1-91`):
- **Write**: Craft optimal prompts and instructions
- **Select**: Choose relevant information (RAG, retrieval)
- **Compress**: Reduce token count while preserving meaning
- **Isolate**: Separate contexts to prevent pollution

**2. Supporting Concepts** (7 notes in `concepts/`):
- Prompt scaffolding techniques
- Retrieval-augmented generation (8 RAG patterns)
- Context compression and pruning
- Observability in context
- Spec-driven development methodology
- Tool abstraction and portability

**3. Technology Stack** (6 notes in `tech/`):
- **Data & RAG**: Onyx (40+ connectors for knowledge ingestion)
- **Tool Integration**: Composio (250+ tool integrations)
- **Orchestration**: Temporal (durable workflows), LangGraph (agent workflows)
- **Infrastructure**: Fly.io (global edge deployment)
- **Development**: Claude Code (spec-driven development)
- **Observability**: Langfuse (LLM monitoring)

**4. Implementation Patterns** (3 notes in `examples/`):
- Agentic RAG workflows
- Context compression pipelines
- Multi-tool agent patterns

### Relevance Criteria for Scraped Content

Based on vault analysis, content should be considered "relevant" if it relates to:

**Core Topics**:
- Context engineering strategies and techniques
- LLM application architectures
- RAG (retrieval-augmented generation) patterns
- Agent orchestration and workflows
- Prompt engineering and optimization
- Token compression and efficiency
- Tool integration and abstraction
- Observability and evaluation of LLM systems
- Infrastructure for AI applications

**Technology Areas**:
- LLM orchestration frameworks (LangChain, LangGraph, CrewAI, AutoGPT)
- Vector databases and retrieval systems
- Context management tools
- Agent frameworks
- Deployment platforms for AI
- Observability and monitoring tools
- Development tools for AI applications

**Emerging Concepts**:
- New RAG architectures (GraphRAG, Streaming RAG, etc.)
- Novel prompt engineering techniques
- Context window optimization strategies
- Multi-agent coordination patterns
- Tool use and function calling innovations
- AI-native development methodologies

### Quality Filters Needed

Based on vault standards, scraped content should meet these criteria:

**1. Cutting-Edge & New**:
- Published within last 7 days
- Represents new development, not rehashing old concepts
- From reputable sources (research papers, major tech companies, known practitioners)

**2. Signal vs Noise**:
- Substantive content (not marketing fluff or clickbait)
- Technical depth appropriate for practitioners
- Concrete examples, metrics, or implementations
- Actionable insights or learnings

**3. Structured & Complete**:
- Clear definition/overview
- Specific features or approaches
- Use cases or applications
- Resources for further reading
- Quantitative metrics when applicable

**4. Alignment with Vault**:
- Fits into concepts, tech, or examples categories
- Connects to existing notes via shared topics/tags
- Adds new information (not duplicate of existing content)

### Potential Content Sources

Based on the vault's focus, high-quality sources would include:

**Research & Papers**:
- arXiv (cs.AI, cs.CL categories)
- ACL, EMNLP, NeurIPS conference proceedings
- Papers with Code

**Company Engineering Blogs**:
- Anthropic, OpenAI, Google AI research blogs
- LangChain, LlamaIndex blogs
- Major tech company AI blogs (Microsoft, Meta, etc.)

**Technical Communities**:
- Hacker News (top stories tagged AI/ML)
- r/MachineLearning, r/LocalLLaMA
- Dev.to, Hashnode (AI tags)

**Product Launches & Releases**:
- GitHub trending (AI/ML repositories)
- ProductHunt (AI tools)
- Tool-specific release notes and changelogs

**Practitioners & Thought Leaders**:
- Twitter/X accounts of AI researchers and engineers
- Personal blogs of known contributors
- YouTube channels with technical deep-dives

## Proposed Scraper Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                   Weekly Trigger (Cron)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Source Discovery & Scraping                │
│  - RSS feeds, APIs, web scraping                       │
│  - Collect content from past 7 days                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Content Processing                     │
│  - Extract text, metadata, links                       │
│  - Parse structure                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Quality Filtering                     │
│  - Content length check                                │
│  - Source credibility                                  │
│  - Technical depth assessment (LLM-based)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Relevance Checking                     │
│  - Semantic similarity to existing vault               │
│  - Topic modeling                                      │
│  - Keyword/tag matching                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Deduplication                         │
│  - Check against existing vault content                │
│  - Identify near-duplicates                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Note Generation (LLM)                    │
│  - Format content to vault structure                   │
│  - Generate frontmatter, tags, cross-links             │
│  - Create concept, tech, or example note               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Vault Integration                      │
│  - Write to apps/vault/{concepts,tech,examples}/       │
│  - Git commit with descriptive message                 │
│  - Optional: Create PR for review                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Notification & Logging                    │
│  - Summary of new entries added                        │
│  - Quality metrics                                     │
│  - Errors/warnings                                     │
└─────────────────────────────────────────────────────────┘
```

### Technology Recommendations

**1. Scraping Layer**:
- **Python**: Mature ecosystem for web scraping
- **Libraries**:
  - `requests` + `beautifulsoup4` for simple HTML parsing
  - `playwright` or `puppeteer` for JavaScript-heavy sites
  - `feedparser` for RSS feeds
  - APIs where available (GitHub, arXiv, etc.)

**2. Quality Filtering**:
- **LLM-based assessment**: Use Claude/GPT to evaluate technical depth and quality
  - Prompt: "Rate this content's quality and relevance on a scale of 1-10 for a knowledge base focused on [vault topics]. Consider: technical depth, novelty, actionability, and source credibility."
- **Semantic similarity**: Use embeddings to compare with existing vault content
  - Tools: Sentence Transformers, OpenAI embeddings
- **Rule-based filters**: Minimum word count, blacklist domains, require code examples, etc.

**3. Note Generation**:
- **LLM-based formatting**: Use Claude/GPT to transform scraped content into vault format
  - Provide template and examples from existing vault notes
  - Generate appropriate frontmatter, tags, and cross-links
  - Ensure consistency with vault conventions
- **Validation**: Check generated notes against schema

**4. Orchestration**:
- **Option A - GitHub Actions**: Simple, native integration
  - Cron schedule for weekly runs
  - Python script in `scrapers/` directory
  - Commits directly or creates PR
- **Option B - Temporal**: More robust for complex workflows
  - Handle failures, retries, long-running operations
  - Useful if scraper becomes multi-stage or distributed
- **Recommendation**: Start with GitHub Actions, migrate to Temporal if needed

**5. Storage & State**:
- **Scraped content cache**: Store raw content to avoid re-scraping
- **Quality history**: Track which sources/content types perform well
- **Embeddings**: Pre-compute embeddings for vault content for relevance checking
- **Options**: SQLite, JSON files, or simple directory structure

### Implementation Phases

**Phase 1: MVP (Minimum Viable Scraper)**
1. Single source (e.g., arXiv RSS feed for cs.CL)
2. Basic quality filters (word count, date)
3. Manual note generation (scraper outputs raw content for review)
4. Manual addition to vault
5. Validate approach and quality

**Phase 2: Automated Formatting**
1. LLM-based note generation
2. Automated frontmatter and tag generation
3. Automated commit to vault
4. Review via PR (manual merge)

**Phase 3: Multi-Source & Enhanced Filtering**
1. Add multiple sources (blogs, GitHub, Hacker News)
2. Semantic relevance checking
3. Deduplication logic
4. Quality scoring and thresholding

**Phase 4: Continuous Improvement**
1. Feedback loop: Track which notes are most valuable
2. Source quality scoring
3. Adaptive thresholds
4. Automatic cross-linking to existing notes

## Code References

### Existing Vault Structure
- `apps/vault/README.md` - Vault index and concept map
- `apps/vault/concepts/context-engineering.md:1-7` - Example frontmatter for concepts
- `apps/vault/tech/onyx.md:1-11` - Example frontmatter for tech
- `apps/vault/examples/agentic-rag-workflow.md:1-7` - Example frontmatter for examples

### Automation Pattern Examples
- `apps/vault/tech/temporal.md:1-80` - Workflow orchestration pattern
- `apps/vault/examples/context-compression-pipeline.md:18-31` - Multi-stage pipeline with metrics
- `apps/vault/examples/agentic-rag-workflow.md:17-29` - Autonomous evaluation loop
- `apps/vault/tech/flyio.md:1-80` - CI/CD automation patterns

### Content Standards
- `apps/vault/concepts/prompt-scaffolding.md:54-58` - Cross-referencing pattern
- `apps/vault/concepts/retrieval-augmented-generation.md:43-47` - Notable developments section
- `apps/vault/tech/temporal.md:28-37` - Comparison table format
- `apps/vault/README.md:52-73` - Concept map visualization

## Architecture Insights

### Key Design Principles

1. **Quality Over Quantity**: Better to add 2-3 truly valuable notes per week than 20 mediocre ones. Aggressive filtering is essential.

2. **Consistency is Critical**: The vault has very strong conventions. Any scraped content must match these exactly or it will degrade the knowledge base quality.

3. **Semi-Automated Approach**: Given the quality bar, recommend human-in-the-loop for at least initial phases:
   - Scraper generates candidate notes
   - Creates PR for review
   - Human approves/edits/rejects
   - Over time, learn which automated decisions are reliable

4. **Leverage Existing Patterns**: The vault already documents automation patterns (Temporal, pipelines, agents). The scraper should align with these documented approaches.

5. **Semantic Relevance is Key**: String matching or keyword filtering won't work well. Must use embeddings or LLM-based relevance checking to assess fit with existing vault topics.

6. **Source Diversity**: Different sources require different strategies:
   - RSS feeds: Easy to parse, reliable structure
   - Blog posts: Variable quality, need content extraction
   - GitHub: API access, focus on READMEs and release notes
   - Twitter/X: High noise, aggressive filtering needed
   - Research papers: High quality but need summarization

7. **Incremental Rollout**: Start with one high-quality source, validate the pipeline, then expand. Don't build everything at once.

### Conventions to Preserve

From vault analysis, these conventions are **non-negotiable**:

1. **Frontmatter format**: Exact YAML structure with required fields
2. **File naming**: kebab-case, descriptive
3. **Directory placement**: concepts/ vs tech/ vs examples/ must be correct
4. **Wiki-link style**: `[[note-name]]` format
5. **Changelog tracking**: Every note has changelog section
6. **Cross-referencing**: New notes should link to existing relevant notes
7. **Tag taxonomy**: Use existing tag patterns
8. **Section structure**: Consistent H2/H3 hierarchy

## Historical Context (from thoughts/)

No relevant historical context found - the thoughts/ directory is newly created. This research document is the first entry.

## Related Research

This is the first research document in the `thoughts/shared/research/` directory. Future research topics could include:

- Implementation plan for MVP scraper
- Source evaluation and selection criteria
- LLM prompt design for note generation
- Semantic similarity thresholds and tuning
- Feedback loop design for quality improvement

## Open Questions

1. **Scheduling Frequency**: Weekly is specified, but should there be a maximum number of notes per week to avoid overwhelming the vault?

2. **Human Review Process**: What should the PR review workflow look like? Should there be a staging area or draft status for scraped notes?

3. **Source Prioritization**: Which sources should be implemented first? Need to balance quality, ease of integration, and content volume.

4. **Quality Thresholds**: What are the specific thresholds for quality scores, relevance scores, etc.? These need to be empirically determined.

5. **Embedding Model Selection**: Which embedding model should be used for semantic similarity? Consider: OpenAI, Sentence Transformers, or open-source alternatives.

6. **LLM Provider**: Claude Code suggests using Claude/GPT for note generation and quality assessment. Which is preferred? Cost vs quality tradeoff?

7. **Failure Handling**: If the scraper fails (API limits, site changes, network issues), should it retry, notify, or skip that week?

8. **Content Licensing**: Scraped content may have copyright/licensing restrictions. How should this be tracked and attributed?

9. **Vault Growth Management**: At what point does the vault become too large? Should older notes be archived or pruned?

10. **Integration with Onyx**: The vault documents Onyx (40+ connectors). Could this be leveraged instead of custom scraping for some sources?

## Next Steps

1. **Decide on MVP scope**: Choose 1-2 high-quality sources to start with
2. **Set up scraper directory structure**: Create `apps/scrapers/` or `scrapers/` directory
3. **Implement basic scraper**: Fetch content from chosen source(s)
4. **Design quality filters**: Define specific criteria and thresholds
5. **Create note generation prompts**: Build LLM prompts to format content to vault structure
6. **Set up GitHub Actions workflow**: Weekly cron trigger
7. **Test with manual review**: Run scraper, generate notes, review quality
8. **Iterate on filters and prompts**: Refine based on initial results
9. **Expand to additional sources**: Add more sources incrementally
10. **Consider automation level**: Decide when/if to auto-merge PRs vs always require review

---

## Changelog

- **2025-10-03**: Initial research document created with comprehensive codebase analysis, scraper architecture proposal, and implementation recommendations