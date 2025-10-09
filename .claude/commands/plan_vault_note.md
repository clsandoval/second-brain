# Plan Vault Note

You are tasked with creating a comprehensive vault note plan through an interactive, research-driven process that leverages parallel sub-agents to gather information. The output is a **plan document** (not the actual notes) that can be used to guide note writing.

## Initial Response

When this command is invoked:

1. **Check if parameters were provided**:
   - If a YouTube URL was provided as a parameter:
     - Use `bashscripts/download-transcript.sh` to download the transcript
     - Save transcript to a temporary location
     - Read the downloaded transcript file
     - Use the transcript content as primary research material
     - Extract the video topic from the transcript or video title
   - If a topic or file path was provided as a parameter, skip the default message
   - Immediately begin the research process

2. **If no parameters provided**, respond with:
```
I'll help you create a vault note plan. Let me start by understanding what you want to document.

Please provide:
- The topic or concept you want documented
- Any specific aspects, relationships, or sources to explore
- Links to related research, documentation, or existing notes
- YouTube URLs (transcripts will be automatically downloaded and analyzed)

I'll research the topic thoroughly and create a comprehensive plan document outlining what notes should be created and what they should contain.

Tips:
- You can invoke this command with a topic directly: `/plan_vault_note Context Windows in LLMs`
- You can provide a YouTube URL: `/plan_vault_note https://www.youtube.com/watch?v=VIDEO_ID`
```

Then wait for the user's input.

## Process Steps

### Step 1: Context Gathering & Initial Research

1. **Read all mentioned files immediately and FULLY**:
   - Any existing vault notes, research documents, or source materials mentioned
   - **IMPORTANT**: Use the Read tool WITHOUT limit/offset parameters to read entire files
   - **CRITICAL**: DO NOT spawn sub-tasks before reading these files yourself in the main context
   - **NEVER** read files partially - if a file is mentioned, read it completely

2. **Create initial research todo list** using TodoWrite to track exploration tasks

3. **Spawn parallel sub-agent tasks for initial research**:
   Before asking the user any questions, use specialized agents to research in parallel:

   Use specialized agents intelligently:
   - **thoughts-locator**: Find any existing research or notes on this topic
   - **codebase-pattern-finder**: Find implementation examples if applicable
   - **web-search-researcher**: Search for official documentation, tutorials, current information
   - Glob/Grep the vault to find similar or related notes that already exist

   Example parallel research tasks:
   - Agent 1: Search thoughts/ for related research and decisions
   - Agent 2: Search vault for similar concepts that already exist
   - Agent 3: Web search for official documentation and overview
   - Agent 4: Find implementation examples in codebase (if applicable)

4. **Wait for ALL sub-tasks to complete** before proceeding

5. **Analyze findings and identify knowledge gaps**:
   - Determine what information is available vs. what needs deeper research
   - Identify key aspects: definition, features, relationships, examples, use cases
   - Note which existing vault notes should be linked
   - Assess if topic should be split into multiple notes
   - Identify what external information still needs to be researched

6. **Present informed understanding and focused questions**:
   ```
   Based on my initial research, I understand [topic] is [brief summary].

   I've found:
   - [Existing vault notes that relate to this]
   - [Internal research or implementation examples]
   - [Initial understanding of the concept]

   Initial assessment:
   - This topic could be covered in [1 note / multiple notes] because [reasoning]
   - Related concepts: [list any that might need separate notes]

   Questions before I proceed:
   - [Specific aspect that needs clarification]
   - [Scope question - what to include/exclude]
   - [Should related concepts be separate notes?]
   ```

   Only ask questions that you genuinely cannot answer through research.

### Step 2: Deep Research & Discovery

After getting initial clarifications:

1. **Update research todo list** using TodoWrite to track deep exploration tasks

2. **Spawn parallel sub-agent tasks for comprehensive research**:
   - Create multiple Task agents to research different aspects concurrently

   Use specialized agents intelligently:
   - **web-search-researcher**: For current information, documentation, tutorials, examples
   - **codebase-locator**: To find related implementation examples in your codebase
   - **codebase-analyzer**: For deep analysis of implementation patterns
   - **thoughts-locator**: To find related research and notes
   - **codebase-pattern-finder**: To discover usage patterns and examples

   Example parallel research tasks:
   - Agent 1: Web search for official documentation and key features
   - Agent 2: Web search for real-world examples and use cases
   - Agent 3: Deep search vault for related concepts and potential links
   - Agent 4: Search codebase for implementation examples (if applicable)
   - Agent 5: Search thoughts for existing research on the topic
   - Agent 6+: Additional focused searches on specific subtopics

3. **Wait for ALL sub-tasks to complete** before proceeding

4. **Synthesize findings and make scope decisions**:
   - Compile all findings from web research, vault, codebase, and thoughts
   - Identify key concepts, features, and relationships
   - **Determine note boundaries**: Should this be one note or multiple?
     - Consider: Are there multiple distinct concepts that are dissimilar enough?
     - Consider: Are there technologies not currently in the vault that need their own notes?
     - Consider: Is the scope manageable for a single note?
   - Determine appropriate links to other vault notes using [[wikilink]] format
   - Extract concrete examples and use cases
   - Verify all information is accurate and up-to-date
   - Note any remaining open questions or uncertainties

5. **If uncertainties remain**:
   - STOP and ask for clarification
   - Do NOT proceed to plan writing with unresolved questions
   - Spawn additional research tasks if needed

### Step 3: Plan Outline Development

Once research is complete and all questions are answered:

1. **Determine scope and note boundaries**:
   - Decide if this should be a single note or multiple notes
   - For each note, determine type: concept, technology, or example
   - Verify the structure matches the content gathered

2. **Create initial plan outline**:
   ```
   Here's my proposed vault note plan for [Topic Name]:

   ## Scope Decision:

   ### Option A: Single Note
   **[Note Title]** (`apps/vault/[type]/[filename].md`)
   - **Rationale**: [Why this can be covered in one note]
   - **Type**: concept | technology | example

   ### Option B: Multiple Notes
   1. **[Note 1 Title]** (`apps/vault/concepts/note-1.md`)
      - **Rationale**: [Why this needs its own note - distinct concept, different enough]
      - **Type**: concept | technology | example

   2. **[Note 2 Title]** (`apps/vault/tech/note-2.md`)
      - **Rationale**: [Why separate - new technology not in vault, dissimilar enough]
      - **Type**: concept | technology | example

   ## Recommended Approach: [A or B]
   [Brief explanation of recommendation]

   ## For Each Note:

   ### Note: [Title]
   **Structure**:
   - Section 1: [What it covers]
   - Section 2: [What it covers]

   **Key Points**:
   - [Point with source reference]
   - [Point with source reference]

   **Relationships**:
   - Links to: [[related-note-1]], [[related-note-2]]
   - Technologies: [[tech-1]]

   Does this scope and structure make sense? Should I adjust the note boundaries or sections?
   ```

3. **Get feedback on plan structure** before writing the plan document

4. **If user suggests changes**:
   - Update the outline based on feedback
   - If changes require more research, spawn additional research tasks
   - Get approval on the revised outline

### Step 4: Plan Document Writing

After outline approval:

1. **Gather metadata for the plan document**:
   - Get current date/time in ISO format with timezone
   - Get planner name (user or assistant)
   - Generate appropriate filename: `thoughts/shared/plans/vault_notes/{topic-kebab-case}.md`

2. **Write the complete plan document** using this structure:

```markdown
---
date: [ISO timestamp with timezone]
planner: [Name]
topic: "[User's topic]"
tags: [vault-planning, relevant-topic-tags]
status: ready_to_write | needs_review
---

# Vault Notes Plan: [Topic]

## Research Summary
[Comprehensive summary of what was discovered through research]
- Key findings from web research
- Existing vault notes found
- Implementation examples identified (if applicable)
- Historical context from thoughts/

## Scope Decision

### Recommended Approach: [Single Note | Multiple Notes]

[Explain the reasoning for the scope decision - why one note vs multiple]

### Notes to Create:

[If multiple notes:]
1. **[Note 1 Title]** (`apps/vault/concepts/note-1.md`)
   - **Type**: concept | technology | example
   - **Rationale**: [Why this needs its own note - distinct concept, dissimilar technology, etc.]

2. **[Note 2 Title]** (`apps/vault/tech/note-2.md`)
   - **Type**: concept | technology | example
   - **Rationale**: [Why this is separate - new technology not in vault, different enough from other concepts]

[If single note:]
**[Note Title]** (`apps/vault/concepts/single-note.md`)
- **Type**: concept | technology | example
- **Rationale**: [Why this can be covered in a single note]

---

## Note 1: [Title]

### File Location
`apps/vault/[type]/[filename].md`

### Structure
1. **[Section Name]**
   - [What this section covers]
   - [Key points to include]

2. **[Section Name]**
   - [What this section covers]
   - [Key points to include]

3. **[Section Name]**
   - [What this section covers]
   - [Key points to include]

### Key Content Points
- [Important point with source reference/URL]
- [Important point with source reference/URL]
- [Example to include with specifics]
- [Technical detail to cover]

### Relationships & Links
- **Links to existing notes**: [[existing-note-1]], [[existing-note-2]]
- **Technologies to reference**: [[tech-1]], [[tech-2]]
- **Concepts to reference**: [[concept-1]], [[concept-2]]
- **New wikilinks to create**: [[placeholder-note]] (mark as TODO if note doesn't exist yet)

### Frontmatter
```yaml
title: [Note Title]
type: [concept|technology|example]
tags: [tag1, tag2, tag3]
created: YYYY-MM-DD
updated: YYYY-MM-DD
[additional fields for technology notes: website, github, etc.]
```

### Success Criteria
- [ ] Definition is clear and accurate
- [ ] All key features/components are covered
- [ ] Concrete examples are included
- [ ] All relationships are documented via [[wikilinks]]
- [ ] All [[wikilinks]] point to existing notes or are marked as TODOs
- [ ] Resources and references are accurate
- [ ] Follows appropriate template structure

---

## Note 2: [Title]
[Same structure as Note 1 if multiple notes are needed]

---

## Research References
- [Official documentation URL]
- [Tutorial/guide URL]
- [Example implementation URL]
- `thoughts/shared/research/related-research.md` (if applicable)
- `thoughts/allison/notes/related-notes.md` (if applicable)

## Index Update Required
[Yes/No - If yes, specify what should be added to apps/vault/README.md]

## Additional Considerations
- [Any edge cases or special considerations]
- [Dependencies on other notes being created]
- [Migration/update notes for existing vault notes if applicable]
```

3. **Write the plan document** to `thoughts/shared/plans/vault_notes/{topic}.md`

### Step 5: Presentation & Next Steps

After writing the plan document:

1. **Present the completed plan**:
   ```
   I've created a comprehensive vault note plan at:
   `thoughts/shared/plans/vault_notes/{topic}.md`

   **Summary:**
   - [Single note | X notes] recommended
   - [Brief description of what will be documented]
   - [Number] existing relationships identified
   - [Any new notes that need to be created as dependencies]

   **Scope:**
   - [List of notes that will be created]

   **Ready to write:** [Yes/No - explain if no]

   Would you like me to:
   - Adjust the scope or note boundaries?
   - Add more detail to any section?
   - Proceed with writing the actual vault notes based on this plan?
   ```

### Step 6: Iteration & Refinement

1. **Handle follow-up requests**:
   - If user wants to adjust scope, update the plan document
   - If user wants more research on specific areas, spawn additional research tasks
   - Update the `status` field in frontmatter (e.g., `needs_review` → `ready_to_write`)
   - Maintain consistency with the approved structure

2. **If proceeding to write actual notes**:
   - Use the plan document as the source of truth
   - Follow the structure, content points, and relationships defined in the plan
   - Create notes one at a time, getting user approval between each
   - Update vault index as specified in the plan
   - Ensure bidirectional links between related notes

## Important Guidelines

1. **Be Interactive**:
   - Don't write the plan in one shot
   - Get buy-in on the scope and outline first
   - Allow course corrections
   - Work collaboratively

2. **Be Thorough**:
   - Read all context files COMPLETELY before planning
   - Research using parallel sub-tasks for efficiency
   - Verify information from official documentation and primary sources
   - Include specific examples and practical applications
   - Ensure all [[wikilinks]] point to existing notes (or clearly mark as TODOs)

3. **Be Skeptical**:
   - Question vague requirements
   - Verify understanding through research
   - Don't assume - investigate first
   - Identify missing information early
   - Critically evaluate if topics should be split into multiple notes

4. **Track Progress**:
   - Use TodoWrite to track research and planning tasks
   - Update todos as you complete research phases
   - Mark tasks complete when done

5. **No Open Questions in Final Plan**:
   - If you encounter open questions during research, STOP
   - Research or ask for clarification immediately
   - Do NOT write the plan with unresolved questions
   - The plan must be complete and actionable before finalizing

6. **Note Scope Decisions**:
   - Within reason, identify when multiple notes are needed
   - Consider: Are concepts dissimilar enough to warrant separate notes?
   - Consider: Are there technologies not currently in the vault?
   - Consider: Will a single note become too long or unfocused?
   - Balance granularity with practicality

## Note Structure Templates

These templates are for reference when creating the plan. The plan should specify which template to use for each note.

**For Concept Notes** (e.g., prompt-scaffolding, context-engineering):
```markdown
---
title: [Concept Name]
type: concept
tags: [relevant, tags, here]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# [Concept Name]

## Definition
[Clear, concise definition]

## Key Techniques/Components
[Main elements of the concept]

## Best Practices
[Guidelines for applying the concept]

## How It Relates
[Links to related concepts using [[wikilinks]]]

## Key Technologies
[Technologies that implement or support this concept]

## Real-World Applications
[Practical use cases and examples]

---

## Changelog
- **YYYY-MM-DD**: [Change description]
```

**For Technology Notes** (e.g., claude-code, langfuse):
```markdown
---
title: [Technology Name]
type: technology
category: [development/orchestration/observability/data/infrastructure]
tags: [relevant, tags, here]
created: YYYY-MM-DD
updated: YYYY-MM-DD
website: [URL]
github: [URL if applicable]
---

# [Technology Name]

## Overview
[Brief description and purpose]

## Key Features
[Main capabilities and features]

## Architecture/How It Works
[Technical details, workflow, or architecture]

## Use Cases in Context Engineering
[How it fits into the context engineering ecosystem]

## Related Technologies
[Links to other tech notes using [[wikilinks]]]

## Resources
[Official docs, tutorials, examples]

---

## Changelog
- **YYYY-MM-DD**: [Change description]
```

**For Example Notes** (e.g., agentic-rag-workflow):
```markdown
---
title: [Example Name]
type: example
tags: [relevant, tags, here]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# [Example Name]

## Overview
[What this example demonstrates]

## Architecture
[Diagram or description of components]

## Key Components
[Main pieces with links to related notes]

## Implementation Steps/Workflow
[How it works step by step]

## Context Engineering Strategies
[Which strategies from [[context-engineering]] are used]

## Benefits
[Advantages of this approach]

## Related Concepts
[Links to relevant concept and tech notes]

---

## Changelog
- **YYYY-MM-DD**: [Change description]
```

## Planning Guidelines

- **File reading**: Always read mentioned files FULLY (no limit/offset) before spawning sub-tasks
- **Critical ordering**: Follow the numbered steps exactly
  - ALWAYS read mentioned files first before spawning sub-tasks (Step 1)
  - ALWAYS wait for all sub-agents to complete before synthesizing (Step 2)
  - ALWAYS create outline and get approval before writing plan (Step 3 before Step 4)
  - NEVER write the plan with incomplete research or unapproved outline
- **Output location**: Plans go to `thoughts/shared/plans/vault_notes/{topic}.md`
- **Link validation**: Only create [[wikilinks]] to notes that exist or mark as TODOs
- **Frontmatter consistency**:
  - Always include frontmatter at the beginning of plan documents
  - Use consistent field names: date, planner, topic, tags, status
  - Tags should be array format: [tag1, tag2, tag3]
  - Status must be one of: ready_to_write, needs_review
- **Vault structure preservation**:
  - concepts/ for conceptual frameworks and methodologies
  - tech/ for specific technologies and platforms
  - examples/ for implementation examples and patterns
  - Maintain existing categorization patterns
- Tags should be lowercase and relevant to the content
- Dates in YYYY-MM-DD format (ISO format with timezone for plan frontmatter)
- Use proper markdown hierarchy (##, ###, etc.)
- Keep definitions clear and accessible
