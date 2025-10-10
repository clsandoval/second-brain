# Sync Vault Relationships

You are tasked with synchronizing relationships between vault notes to maintain bidirectional links, add missing connections, and update outdated references. This command ensures the vault remains interconnected and up-to-date as new notes are added or existing notes are modified.

## When to Use This Command

Invoke this command:
- After writing a new vault note
- After significantly updating an existing vault note
- When you notice missing relationships between notes
- Periodically to maintain vault health

## Initial Response

When this command is invoked:

1. **Check if a note path was provided as parameter**:
   - If provided: Use that note as the target
   - If not provided: Ask the user which note to sync

2. **If no parameter**, respond with:
```
I'll help you sync vault relationships to maintain bidirectional links and update related notes.

Please provide:
- Path to the note you want to sync (e.g., `apps/vault/tech/langgraph.md`)
- Or specify "all" to analyze the entire vault for missing relationships

What would you like to sync?
```

Then wait for user input.

## Process Steps

### Step 1: Read and Analyze Target Note

1. **Read the target note completely**:
   - Extract all wikilinks: `[[note-name]]`, `[[folder/note-name]]`
   - Extract frontmatter metadata: title, type, tags, related fields
   - Extract key concepts from headings and content
   - Note the file path and name (for generating wikilinks to this note)

2. **Create todo list** using TodoWrite to track sync tasks:
   - Find notes that should link back
   - Find notes mentioning this topic without links
   - Find notes with related tags
   - Generate update recommendations
   - Apply approved updates

### Step 2: Discover Related Notes

1. **Find notes that should link back** (bidirectional linking):
   - For each wikilink in the target note, read the linked note
   - Check if the linked note has a reciprocal link back to the target
   - If not, identify appropriate section to add the backlink

2. **Find notes mentioning the topic without wikilinks**:
   - Extract the note's title and key terms (e.g., "LangGraph", "agent orchestration")
   - Use Grep to search vault for mentions of these terms
   - Filter to find files that mention the topic but don't have `[[wikilink]]` to it
   - Read those files to understand context

3. **Find notes with related tags**:
   - Use Grep to find notes with overlapping tags from frontmatter
   - Identify notes in the same category (concepts/, tech/, examples/)
   - Look for notes covering similar domains

4. **Find notes with outdated information**:
   - If the target note updates or supersedes information, search for:
     - Notes with older dates covering the same topic
     - Notes with conflicting information
     - Notes that should reference newer information

### Step 3: Generate Update Recommendations

For each related note found, create a structured recommendation:

```markdown
## Update Recommendations

### Note: apps/vault/concepts/context-engineering.md
**Current State**: Mentions "agent orchestration" but doesn't link to [[langgraph]]
**Recommended Update**:
- **Section**: "Key Technologies"
- **Action**: Add `[[langgraph]]: Low-level orchestration framework for stateful multi-agent systems`
- **Rationale**: LangGraph is a key technology implementing context engineering strategies

### Note: apps/vault/concepts/retrieval-augmented-generation.md
**Current State**: Links to [[langgraph]] in "Key Technologies" section
**Recommended Update**:
- **Section**: N/A (bidirectional link missing)
- **Action**: In target note (langgraph.md), ensure it links back to [[retrieval-augmented-generation]]
- **Rationale**: Maintain bidirectional relationship

### Note: apps/vault/examples/multi-tool-agent.md
**Current State**: Describes agent workflow but doesn't reference orchestration frameworks
**Recommended Update**:
- **Section**: "Related Concepts"
- **Action**: Add `- [[langgraph]]: Graph-based orchestration for multi-tool coordination`
- **Rationale**: Example could benefit from referencing the orchestration framework
```

### Step 4: Present Recommendations and Get Approval

Present all recommendations in a clear, organized format:

```
I've analyzed relationships for [note-name] and found [N] potential updates:

## Summary
- [X] missing bidirectional links
- [Y] notes mentioning the topic without wikilinks
- [Z] notes with related tags that should cross-reference

## Recommended Updates

[List all recommendations from Step 3]

---

Would you like me to:
1. Apply ALL recommendations (I'll show you the changes)
2. Apply SPECIFIC recommendations (tell me which ones)
3. Revise recommendations (tell me what to change)
4. Cancel sync

What would you like to do?
```

### Step 5: Apply Approved Updates

Once the user approves:

1. **For each approved update**:
   - Read the target file to verify current content
   - Determine exact location for the update (find section heading, find list, etc.)
   - Use Edit tool to add the wikilink/content
   - Verify the edit was successful
   - Mark todo item as complete

2. **Handle different update types**:

   **Adding to a list**:
   - Find the section (e.g., "## Key Technologies")
   - Find the list (lines starting with `- `)
   - Add new item maintaining alphabetical order if applicable

   **Adding to prose**:
   - Find appropriate sentence or paragraph
   - Add inline wikilink naturally within the text

   **Creating new section**:
   - If no appropriate section exists, ask user before creating one
   - Add section with proper heading level

3. **Track changes**:
   - After all updates complete, create a sync log
   - Save to `thoughts/shared/vault_sync/YYYY-MM-DD_HH-MM-SS_sync-log.md`
   - Include:
     - Target note synced
     - Number of updates applied
     - List of files modified
     - List of relationships added

### Step 6: Verification and Summary

After applying updates:

1. **Verify bidirectional links**:
   - For each wikilink added, verify it's properly formatted
   - Check that the linked file exists

2. **Present summary**:
```
Sync complete for [note-name]!

## Changes Applied
- Updated [N] files
- Added [M] bidirectional links
- Created [K] new relationships

## Files Modified
- apps/vault/concepts/context-engineering.md
- apps/vault/examples/multi-tool-agent.md
- [etc.]

## Sync Log
Detailed log saved to: thoughts/shared/vault_sync/[timestamp]_sync-log.md

All relationships are now synchronized. Your vault is more interconnected!
```

## Edge Cases and Guidelines

1. **No relationships found**:
   - If no missing relationships are found, report this positively
   - Suggest the note is already well-integrated

2. **Too many potential updates** (>20):
   - Prioritize by relationship strength:
     - Direct mentions without links (highest priority)
     - Missing bidirectional links (high priority)
     - Related tags (medium priority)
   - Present top 10-15, offer to see more

3. **Ambiguous section placement**:
   - If unclear where to add a link, present options to user
   - Default to "Related Concepts" or "See Also" sections

4. **Conflicting information**:
   - If notes have conflicting info, flag for user review
   - Don't automatically update conflicting content
   - Suggest manual review

5. **Link format variations**:
   - Support both `[[note-name]]` and `[[folder/note-name|Display Text]]`
   - Maintain existing link format style in each file
   - Use bare `[[note-name]]` for new links (simplest form)

6. **Respecting note structure**:
   - Don't modify code blocks or examples
   - Don't modify frontmatter (except maybe adding tags)
   - Focus on prose sections and relationship lists

## Tools Usage

- **Read**: Read target note and all related notes completely
- **Grep**: Search vault for mentions, tags, and related content
- **Glob**: Find all vault notes by pattern if needed
- **Edit**: Apply approved updates to notes
- **Write**: Create sync log in thoughts/shared/vault_sync/
- **TodoWrite**: Track progress through sync process

## Example Invocation

```bash
/sync_vault_relationships apps/vault/tech/langgraph.md
```

or

```bash
/sync_vault_relationships
# Then provide path when prompted
```

## Important Notes

- **Always get approval** before modifying notes
- **Show exact changes** using old_string/new_string format
- **Be conservative**: Only suggest high-confidence updates
- **Maintain style**: Match the existing note's format and tone
- **Track everything**: Create detailed sync logs for audit trail
- **Bidirectional focus**: Prioritize creating two-way relationships
