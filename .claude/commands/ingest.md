# Ingest External Content

You are tasked with ingesting external content (videos, articles, PDFs, text) into your vault by analyzing the content, mapping it to existing notes, identifying outdated information, and creating a comprehensive ingestion plan that results in new notes and updates to existing ones.

## When to Use This Command

Invoke this command to process:
- YouTube videos (transcripts will be downloaded automatically)
- Articles and blog posts (URLs)
- PDF documents
- Raw text content (pasted directly)
- Research papers
- Documentation pages

## Initial Response

When this command is invoked:

1. **Check if content was provided as parameter**:
   - YouTube URL: `https://youtube.com/watch?v=...` or `https://youtu.be/...`
   - Article URL: Any HTTP(S) URL
   - File path: Path to local file (PDF, markdown, text)
   - Text content: Raw text provided by user

2. **If content provided as parameter**:
   - Immediately begin ingestion process
   - Extract/download content as needed

3. **If no parameter provided**, respond with:
```
I'll help you ingest external content into your vault.

Please provide ONE of the following:
- YouTube URL (transcript will be downloaded automatically)
- Article/documentation URL
- Path to a local file (PDF, markdown, text)
- Paste raw text content directly

What would you like to ingest?
```

Then wait for user input.

## Process Steps

### Step 1: Content Extraction

1. **Determine content type and extract**:

   **For YouTube URLs**:
   - Use `bashscripts/download-transcript.sh` to download transcript
   - Save to temporary location: `thoughts/shared/ingestion/temp_transcript_[timestamp].txt`
   - Read the transcript file completely
   - Extract video title and metadata if available

   **For Article URLs**:
   - Use WebFetch to retrieve and convert HTML to markdown
   - Extract title, author, publication date if available
   - Save raw content to `thoughts/shared/ingestion/temp_article_[timestamp].md`

   **For File Paths**:
   - Read the file completely (Read tool supports PDF, markdown, text, images)
   - Extract title from filename or document metadata

   **For Raw Text**:
   - Accept text directly from user input
   - Ask for optional title/source attribution

2. **Create ingestion todo list** using TodoWrite to track the process:
   - Extract and analyze content
   - Map to existing concepts/technologies
   - Identify novel ideas
   - Find related existing notes
   - Identify outdated information
   - Generate ingestion plan
   - Execute plan

### Step 2: Content Analysis

1. **Analyze the content to identify**:
   - **Main topics and themes**: What is this content primarily about?
   - **Key concepts discussed**: Abstract ideas, methodologies, patterns
   - **Technologies mentioned**: Specific tools, frameworks, platforms
   - **Examples and use cases**: Concrete implementations or scenarios
   - **Novel ideas**: Things not currently documented in your vault

2. **Extract structured information**:
   - Key quotes and insights
   - Important definitions
   - Technical details and specifications
   - Code examples or patterns
   - References to other resources

3. **Present initial analysis**:
```
## Content Analysis Complete

**Source**: [URL/File/Video Title]
**Type**: [Article/Video/Paper/Documentation]
**Length**: [Word count/Duration]

**Main Topics**:
- Topic 1
- Topic 2

**Key Concepts Identified**:
- Concept A (maps to [[existing-concept]] or NEW)
- Concept B (maps to [[existing-concept]] or NEW)

**Technologies Mentioned**:
- Technology X (have note: [[tech/tech-x]])
- Technology Y (NEW - not in vault)

**Novel Ideas**:
- Idea 1
- Idea 2

**Notable Quotes**:
- "Quote 1..."
- "Quote 2..."

Now searching vault for related notes and potential updates...
```

### Step 3: Vault Mapping and Discovery

1. **Search for existing related notes**:
   - Use Grep to search for mentions of identified concepts/technologies
   - Use Glob to find notes by category (concepts/, tech/, examples/)
   - Read related notes to understand current coverage

2. **Identify relationships**:
   - Which existing notes cover similar topics?
   - Which notes mention these concepts without depth?
   - Which notes might have outdated information?
   - Which wikilinks already exist vs need to be created?

3. **Determine gaps and overlaps**:
   - What's completely new vs already documented?
   - What updates/corrections are needed to existing notes?
   - What new notes should be created?

### Step 4: Generate Ingestion Plan

Create a comprehensive plan document:

```markdown
## Vault Mapping Results

**Existing Related Notes**:
- [[concepts/context-engineering]] - Covers strategies, could be enhanced with new examples
- [[tech/langgraph]] - Mentioned in content, already documented, UP TO DATE
- [[concepts/rag]] - Has outdated information about [specific detail]

**Novel Content Requiring New Notes**:
- **New Concept**: [Concept Name] - Currently not in vault, distinct from existing concepts
- **New Technology**: [Tech Name] - Not documented, mentioned 5+ times in content

**Updates Needed to Existing Notes**:
- [[concepts/context-engineering]]: Add example from content about [specific example]
- [[concepts/rag]]: Update definition to reflect [new information]
- [[tech/langgraph]]: Add use case from content about [specific use case]

---

## Recommended Ingestion Plan

### Option A: Comprehensive (Recommended)
1. Create NEW note: `apps/vault/concepts/[new-concept].md`
2. Create NEW note: `apps/vault/tech/[new-tech].md`
3. Update: [[concepts/context-engineering]] - Add new example
4. Update: [[concepts/rag]] - Correct outdated definition
5. Update: [[tech/langgraph]] - Add use case
6. Store source material: `thoughts/shared/ingestion/[timestamp]_[title].md`

### Option B: Updates Only
1. Update: [[concepts/context-engineering]]
2. Update: [[concepts/rag]]
3. Update: [[tech/langgraph]]
4. Store source material with annotations

### Option C: Custom
You tell me which parts to focus on

---

## Detailed Actions

### Action 1: Create apps/vault/concepts/[new-concept].md
**Type**: Concept note
**Rationale**: Content introduces a distinct concept not covered by existing notes

**Key Content from Source**:
- Definition: [extracted definition]
- Key points: [bullet points]
- Examples: [examples from content]

**Relationships**:
- Links to: [[existing-note-1]], [[existing-note-2]]
- Referenced by: [notes that should link here]

**Frontmatter**:
```yaml
title: [Title]
type: concept
tags: [tag1, tag2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: [URL/Citation]
```

---

### Action 2: Update apps/vault/concepts/rag.md
**Section**: "Definition"
**Current Content**: [old definition]
**Proposed Update**: [new definition based on ingested content]
**Rationale**: Source provides more current/accurate definition

**Section**: "Resources"
**Proposed Addition**: Add source link to resources

---

[Continue for each action...]
```

### Step 5: Get User Approval

Present the plan and ask for direction:

```
## Ingestion Plan Ready

I've analyzed the content and created an ingestion plan with:
- [N] new notes to create
- [M] existing notes to update
- [K] relationships to establish

**Source Material**: [Title/URL]
**Scope**: [Brief summary of what will be ingested]

Which option would you like?
1. **Comprehensive** - Create all new notes and apply all updates (recommended)
2. **Updates Only** - Skip new notes, just update existing ones
3. **Custom** - Tell me which specific actions to take
4. **Review First** - Show me the full detailed plan before deciding
5. **Save for Later** - Store the plan without executing now

What would you like to do?
```

### Step 6: Execute Ingestion Plan

Based on user's choice, execute the plan:

1. **For each new note to create**:
   - Use `/plan_vault_note` command if the note is substantial
   - Or write directly if it's straightforward
   - Follow appropriate template (concept/tech/example)
   - Include source attribution in frontmatter and resources

2. **For each update to existing notes**:
   - Read the note completely
   - Locate the section to update
   - Use Edit tool to apply changes
   - Show old_string and new_string clearly
   - Update the changelog section
   - Update the "updated" date in frontmatter

3. **Store source material**:
   - Save original content to `thoughts/shared/ingestion/[timestamp]_[title].md`
   - Include metadata: source URL, date ingested, what was created/updated
   - Add key quotes and annotations

4. **Create relationships** (optional but recommended):
   - After creating/updating notes, offer to run `/sync_vault_relationships`
   - This ensures bidirectional links are established

### Step 7: Post-Ingestion Summary

After execution:

```
## Ingestion Complete!

**Source**: [Title/URL]
**Date**: [Timestamp]

**New Notes Created**:
- apps/vault/concepts/[new-concept].md
- apps/vault/tech/[new-tech].md

**Notes Updated**:
- apps/vault/concepts/context-engineering.md (added example)
- apps/vault/concepts/rag.md (updated definition)
- apps/vault/tech/langgraph.md (added use case)

**Source Material Saved**:
thoughts/shared/ingestion/[timestamp]_[title].md

**Next Steps** (optional):
- Run `/sync_vault_relationships` to establish bidirectional links
- Review new notes for additional refinement
- Update vault index if needed

Would you like me to sync relationships now?
```

## Special Handling

### YouTube Transcripts

When processing YouTube URLs:
1. Extract video ID from URL
2. Run `bashscripts/download-transcript.sh [VIDEO_ID]`
3. Check for transcript file in expected location
4. If transcript fails, notify user and ask for alternative
5. Include video metadata: title, channel, date published
6. Add video URL to resources section of created notes

### PDFs and Research Papers

When processing PDFs:
1. Use Read tool (supports PDF)
2. Extract title, authors, publication date from first page
3. Pay special attention to abstract/introduction
4. Look for key terms, methodology, results
5. Cite properly: "Author et al. (Year)"

### Long Content

If content is very long (>10,000 words):
1. Summarize key sections first
2. Ask user which sections to focus on
3. Consider creating multiple notes instead of one
4. Process in phases if needed

## Edge Cases and Guidelines

1. **Content already fully covered**:
   - If ingested content doesn't add new information, notify user
   - Offer to add source as reference to existing notes
   - Store source material for future reference anyway

2. **Conflicting information**:
   - If content conflicts with existing notes, flag it clearly
   - Present both versions to user
   - Ask which to trust (newer source, authoritative source, etc.)
   - Update with note about the conflict if appropriate

3. **Unclear categorization**:
   - If unsure whether something is a concept vs technology vs example
   - Present options to user
   - Explain reasoning for each option

4. **Redundant with existing notes**:
   - If proposed new note is very similar to existing note
   - Suggest updating existing note instead
   - Only create new note if truly distinct

5. **Source attribution**:
   - Always include source in frontmatter: `source: [URL]`
   - Add to Resources section with proper citation
   - Respect copyright - paraphrase, don't copy verbatim

6. **Quality control**:
   - Don't ingest low-quality or unreliable sources without warning user
   - Prioritize official documentation, academic papers, reputable blogs
   - Flag opinion pieces vs factual documentation

## Tools Usage

- **Bash**: Download YouTube transcripts, file operations
- **WebFetch**: Retrieve articles and documentation from URLs
- **Read**: Read files (PDF, markdown, text)
- **Grep**: Search vault for existing coverage
- **Glob**: Find vault notes by pattern
- **Write**: Create new notes, store source material
- **Edit**: Update existing notes
- **TodoWrite**: Track ingestion progress
- **Task (web-search-researcher)**: Research unclear topics if needed

## Example Invocations

```bash
/ingest https://www.youtube.com/watch?v=abc123
```

```bash
/ingest https://example.com/article-about-agents
```

```bash
/ingest path/to/research-paper.pdf
```

```bash
/ingest
# Then paste text or provide URL when prompted
```

## Important Notes

- **Always store source material** in thoughts/shared/ingestion/
- **Always attribute sources** in frontmatter and resources
- **Always get approval** before creating/updating multiple notes
- **Respect existing vault structure** and conventions
- **Be conservative**: Don't create redundant notes
- **Be thorough**: Don't miss important concepts
- **Suggest sync**: Recommend running `/sync_vault_relationships` after ingestion
