---
date: 2025-10-10T16:56:19+00:00
researcher: Claude
git_commit: 44b30a4cf060cb9c0b43fd2b457c0b9158915253
branch: main
repository: second-brain
topic: "Implementing Markdown Annotation and GitHub Issue Creation from Website"
tags: [research, codebase, quartz, markdown, github-api, annotation, interactive-features]
status: complete
last_updated: 2025-10-10
last_updated_by: Claude
---

# Research: Implementing Markdown Annotation and GitHub Issue Creation from Website

**Date**: 2025-10-10 16:56:19 TST
**Researcher**: Claude
**Git Commit**: 44b30a4cf060cb9c0b43fd2b457c0b9158915253
**Branch**: main
**Repository**: second-brain

## Research Question

I want to be able to annotate the markdown in apps/site/. Looking forward, I want to be able to initiate GitHub issue creation after annotating from the website itself, with the annotation as part of the issue body.

## Summary

The site is built with **Quartz v4.5.2**, a static site generator using TypeScript/Preact that processes markdown files into a digital garden. The codebase has strong foundations for implementing markdown annotation:

1. **Rich markdown processing pipeline** (unified/remark/rehype) that can be extended
2. **Established client-side interactivity patterns** with event handling, state management, and UI feedback
3. **No existing GitHub API integration** - this would need to be built from scratch
4. **Static site architecture** - GitHub issue creation would require either client-side API calls or a serverless function

The implementation would involve:
- Creating a new annotation component with text selection and UI
- Storing annotations (localStorage or backend)
- Building GitHub API integration (OAuth + issue creation)
- Following existing patterns from interactive components like Search, Darkmode, and Popover

## Detailed Findings

### Site Architecture (Quartz v4.5.2)

**Framework**: Custom static site generator built with TypeScript
- **UI Library**: Preact (React alternative) for components
- **Build System**: Custom TypeScript build with esbuild
- **Content Pipeline**: Markdown → AST → HTML → JSX → Static pages

**Key Files**:
- `apps/site/quartz.config.ts:1` - Main configuration (plugins, theme, site metadata)
- `apps/site/quartz.layout.ts:1` - Layout configuration (component placement)
- `apps/site/quartz/build.ts:1` - Build orchestrator
- `apps/site/package.json:1` - Dependencies and scripts

**Component Architecture**:
- Components in `apps/site/quartz/components/` (30+ components)
- Each interactive component follows: TSX file + inline script + SCSS styles
- Scripts run on "nav" event for SPA navigation
- All use `window.addCleanup()` for proper event listener cleanup

**Content Structure**:
- Source: `apps/site/content/` (markdown files organized by topic)
- Output: `apps/site/public/` (generated static HTML/CSS/JS)

### Markdown Rendering Implementation

**Processing Pipeline**:
1. **Parse**: `apps/site/quartz/processors/parse.ts:1` reads .md files, uses `remark-parse` to create AST
2. **Transform**: Plugins in `apps/site/quartz/plugins/transformers/` modify AST
3. **Convert**: `remark-rehype` converts markdown AST → HTML AST
4. **Render**: `apps/site/quartz/util/jsx.tsx:1` converts HTML AST → JSX via `hast-util-to-jsx-runtime`
5. **Display**: Components render JSX to pages

**Key Transformer Plugins** (relevant for annotation):
- `apps/site/quartz/plugins/transformers/ofm.ts:1` - Obsidian Flavored Markdown (wikilinks, callouts, block embeds)
- `apps/site/quartz/plugins/transformers/gfm.ts:1` - GitHub Flavored Markdown
- `apps/site/quartz/plugins/transformers/frontmatter.ts:1` - YAML frontmatter parsing
- `apps/site/quartz/plugins/transformers/syntax.ts:1` - Code syntax highlighting

**Display Components**:
- `apps/site/quartz/components/Body.tsx:1` - Core component rendering markdown HTML
- `apps/site/quartz/components/pages/Content.tsx:1` - Main content page wrapper

**Markdown Libraries**:
- `unified` - Processing pipeline framework
- `remark-parse` - Markdown parser
- `remark-rehype` - AST converter
- `rehype-*` plugins - Various HTML transformations (math, citations, syntax highlighting)

**Extension Point for Annotations**:
The markdown rendering pipeline is extensible. A new transformer plugin could:
- Wrap specific text nodes in annotation-friendly HTML elements
- Add data attributes for annotation metadata
- Generate unique IDs for annotatable sections

### Client-Side Interactive Patterns

The codebase has 10+ examples of rich client-side interactions that provide patterns for annotation UI:

**Pattern 1: Text Selection & Popover** (`apps/site/quartz/components/scripts/popover.inline.ts:8-115`)
- Mouse hover triggers popover display
- Uses Floating UI for positioning
- Async content loading with caching
- Could be adapted for annotation tooltips

**Pattern 2: State Persistence** (`apps/site/quartz/components/scripts/checkbox.inline.ts:1`)
- Stores checkbox states in localStorage with page-specific keys
- Restores state on navigation
- Pattern applicable for storing annotation drafts

**Pattern 3: Form Input Handling** (`apps/site/quartz/components/scripts/search.inline.ts:400-467`)
- Real-time input event handling
- Debouncing and async operations
- Result display with dynamic DOM updates
- Applicable for annotation text input

**Pattern 4: Button Actions with Feedback** (`apps/site/quartz/components/scripts/clipboard.inline.ts:1`)
- Click handler with async operation (clipboard API)
- Visual feedback (icon swap, timeout)
- Error handling
- Pattern for GitHub issue submission button

**Pattern 5: Modal/Overlay Pattern** (`apps/site/quartz/components/scripts/search.inline.ts:1`)
- Show/hide overlay with keyboard shortcuts (Ctrl+K)
- Escape key handling via `registerEscapeHandler` utility
- Focus management
- Pattern for annotation modal/dialog

**Pattern 6: Collapsible UI** (`apps/site/quartz/components/scripts/callout.inline.ts:1`)
- Toggle expand/collapse with CSS class
- Grid template rows animation
- Pattern for expandable annotation list

**Common Architecture**:
```typescript
// Component structure
document.addEventListener("nav", () => {
  const element = document.querySelector(".component-class")

  function handler(e: Event) {
    // Handle interaction
  }

  element?.addEventListener("event", handler)
  window.addCleanup(() => element?.removeEventListener("event", handler))
})
```

**Key Utilities**:
- `apps/site/quartz/components/scripts/util.ts:1-20` - `registerEscapeHandler` for modals
- `window.addCleanup()` - Cleanup on navigation (prevents memory leaks)
- localStorage for persistence
- CSS classes for state management

### GitHub API Integration (Currently None)

**Finding**: No existing GitHub API integration in the codebase.

**What doesn't exist**:
- No `@octokit` packages
- No GitHub OAuth/authentication
- No API token management
- No issue creation code
- No `.github/workflows/` for CI/CD (only planned)

**Related**: Linear integration exists via MCP tools in `.claude/commands/linear.md:1`
- Uses `mcp__linear__*` tools for issue management
- Provides pattern reference for issue creation commands
- Similar workflow could be adapted for GitHub

**What would be needed**:
1. **Authentication**:
   - OAuth flow for GitHub login OR
   - Personal Access Token input (less secure for public site)
   - Token storage (secure, client-side only for static site)

2. **API Integration**:
   - Install `@octokit/rest` or use fetch to `api.github.com`
   - Issue creation endpoint: `POST /repos/{owner}/{repo}/issues`
   - Required fields: `title`, `body` (annotation text)
   - Optional: `labels`, `assignees`

3. **Architecture Options**:
   - **Client-side**: Direct API calls from browser (requires token in client)
   - **Serverless**: Function (Vercel/Netlify/Fly.io) to proxy GitHub API
   - **Backend service**: Small API server for GitHub operations

### Implementation Architecture Recommendation

Given the static site nature and security considerations:

**Recommended Approach**: Serverless Function + Client-Side UI

```
User selects text → Annotation UI (modal) → User adds notes → Click "Create Issue"
    ↓
Client sends to serverless function with:
  - Selected text
  - Annotation notes
  - Page URL
  - User auth token (if authenticated)
    ↓
Serverless function:
  - Validates request
  - Formats issue body
  - Calls GitHub API
  - Returns issue URL
    ↓
Client shows success with link to issue
```

**Security Model**:
1. **Option A - User's Personal Token**: User provides their own GitHub PAT
   - Stored in localStorage (or sessionStorage for better security)
   - User creates issues in their own account/repo
   - No server-side storage needed

2. **Option B - OAuth App**: Full OAuth flow
   - Requires backend service for OAuth exchange
   - More complex but better UX
   - Can create issues on behalf of users

3. **Option C - Bot Account**: Site uses single bot account
   - Serverless function has bot's token
   - All issues created by bot, mentions user
   - Simpler but less personal

## Code References

### Current Architecture
- `apps/site/quartz.config.ts:1` - Main Quartz configuration
- `apps/site/quartz.layout.ts:1` - Component layout
- `apps/site/quartz/build.ts:1` - Build system entry point
- `apps/site/package.json:1` - Dependencies and scripts

### Markdown Processing
- `apps/site/quartz/processors/parse.ts:1` - Markdown parser orchestration
- `apps/site/quartz/plugins/transformers/ofm.ts:1` - Obsidian markdown features
- `apps/site/quartz/util/jsx.tsx:1` - HTML AST to JSX conversion
- `apps/site/quartz/components/Body.tsx:1` - Markdown content display

### Interactive Component Patterns
- `apps/site/quartz/components/scripts/popover.inline.ts:8-115` - Hover popovers with positioning
- `apps/site/quartz/components/scripts/search.inline.ts:400-467` - Input handling and async operations
- `apps/site/quartz/components/scripts/clipboard.inline.ts:1` - Button actions with visual feedback
- `apps/site/quartz/components/scripts/util.ts:1-20` - Escape handler utility for modals
- `apps/site/quartz/components/scripts/checkbox.inline.ts:1` - LocalStorage state persistence

### Component Structure Examples
- `apps/site/quartz/components/Darkmode.tsx:1` - Simple toggle component
- `apps/site/quartz/components/Search.tsx:1` - Complex interactive component with modal

### Related References
- `.claude/commands/linear.md:1` - Linear integration pattern (reference for issue creation)

## Architecture Insights

### Component Registration Pattern
Quartz components use a registration system where interactive scripts are linked via `beforeDOMLoaded` or `afterDOMLoaded`:

```typescript
// Component.tsx
import script from "./scripts/component.inline"
import styles from "./styles/component.scss"

const Component: QuartzComponent = (props) => {
  return <div class="component-class">...</div>
}

Component.afterDOMLoaded = script
Component.css = styles
```

### SPA Navigation System
The site uses SPA navigation with a custom "nav" event:
- All page changes trigger "nav" event
- Scripts re-initialize on each navigation
- `window.addCleanup()` ensures proper teardown
- Prevents memory leaks in single-page context

### State Management Patterns
1. **localStorage**: For persistent user preferences (theme, checkboxes, folder state)
2. **CSS classes**: For visual state (active, collapsed, open)
3. **Data attributes**: For metadata (`data-folderpath`, `data-cfg`, etc.)
4. **Module-level variables**: For component-scoped state (current search term, active element)

### Styling Approach
- SCSS with component-level styles
- BEM-like class naming
- CSS custom properties for theming
- Styles linked via `Component.css = styles`

## Implementation Plan: Markdown Annotation Feature

### Phase 1: Text Selection & Annotation UI

**New Files to Create**:
1. `apps/site/quartz/components/Annotator.tsx` - Main annotation component
2. `apps/site/quartz/components/scripts/annotator.inline.ts` - Text selection and UI logic
3. `apps/site/quartz/components/styles/annotator.scss` - Annotation styles

**Features**:
- Text selection detection on content area
- Show annotation button/tooltip on selection
- Modal/popover for entering annotation notes
- Preview of selected text in modal
- Save annotation locally (localStorage initially)
- Visual highlighting of annotated text

**Code Pattern** (following Search component pattern):
```typescript
// annotator.inline.ts
document.addEventListener("nav", () => {
  const content = document.querySelector(".page-content")

  function handleSelection() {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    // Show annotation UI at selection
    showAnnotationPopover(selection)
  }

  content?.addEventListener("mouseup", handleSelection)
  window.addCleanup(() => content?.removeEventListener("mouseup", handleSelection))
})
```

### Phase 2: Annotation Storage & Display

**Features**:
- Store annotations with:
  - Selected text
  - Annotation note
  - Page URL
  - Text position/range
  - Timestamp
- Display existing annotations (highlight in content)
- List view of all annotations
- Edit/delete annotations

**Storage Schema**:
```typescript
interface Annotation {
  id: string
  pageUrl: string
  selectedText: string
  note: string
  textRange: { start: number; end: number }
  timestamp: string
  synced: boolean // Synced to GitHub issue
}
```

### Phase 3: GitHub Issue Creation

**New Files**:
1. `apps/site/api/create-issue.ts` (if using serverless) OR client-side implementation
2. GitHub API integration code

**Implementation Options**:

**Option A: Client-Side Direct** (Simplest, less secure):
```typescript
// In annotator.inline.ts
async function createGitHubIssue(annotation: Annotation, token: string) {
  const response = await fetch("https://api.github.com/repos/OWNER/REPO/issues", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `Annotation: ${annotation.selectedText.substring(0, 50)}...`,
      body: formatIssueBody(annotation),
      labels: ["annotation"],
    }),
  })

  const issue = await response.json()
  return issue.html_url
}

function formatIssueBody(annotation: Annotation): string {
  return `
## Source
- **Page**: ${annotation.pageUrl}
- **Date**: ${annotation.timestamp}

## Selected Text
> ${annotation.selectedText}

## Annotation
${annotation.note}

---
*Created via site annotation feature*
  `.trim()
}
```

**Option B: Serverless Function** (More secure):
```typescript
// Fly.io Machine or Vercel Edge Function
export async function POST(request: Request) {
  const { annotation, userToken } = await request.json()

  // Validate request
  // Create issue using server-side logic
  // Return issue URL
}
```

### Phase 4: UI Integration

**Add to quartz.layout.ts**:
```typescript
sharedPageComponents: {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Annotator(), // Add annotation UI
  ],
  footer: Component.Footer(),
}
```

**Settings/Configuration**:
- GitHub repository configuration (where to create issues)
- User token input/OAuth flow
- Enable/disable annotation feature per page

### Phase 5: Enhancement Ideas

1. **Collaborative annotations**: Share annotations between users
2. **Annotation comments**: Comment thread on annotations
3. **Export**: Export all annotations to markdown/JSON
4. **Search**: Search within annotations
5. **Categories/tags**: Organize annotations by topic
6. **Sync status**: Visual indicator of synced vs. local-only annotations
7. **Batch operations**: Create multiple issues from annotation list
8. **Rich text**: Support markdown in annotation notes

## Technical Considerations

### Security
- **Never commit GitHub tokens to repo**
- If using client-side approach, warn users about token exposure
- Consider using short-lived tokens or fine-grained permissions
- Sanitize user input before creating issues (prevent injection)

### Performance
- Annotation data could grow large - consider pagination
- Debounce text selection to avoid excessive UI updates
- Lazy-load annotation data per page
- Use IntersectionObserver for highlighting visible annotations only

### UX
- Keyboard shortcuts (e.g., Ctrl+Shift+A for annotate)
- Mobile-friendly selection (touch events)
- Undo functionality
- Confirmation before creating GitHub issue
- Clear visual feedback during async operations (loading states)
- Error handling with helpful messages

### Compatibility
- Works with existing Quartz plugins (shouldn't interfere with rendering)
- Text selection across code blocks, callouts, tables
- SPA navigation (re-highlight annotations on nav)
- Dark mode support (annotation UI styling)

### Data Migration
- If moving from localStorage to backend, provide migration path
- Export functionality before major changes
- Versioning of annotation data schema

## Open Questions

1. **Where should issues be created?**
   - User's personal repo?
   - Shared project repo?
   - Configurable per user?

2. **Authentication approach?**
   - Personal Access Token input?
   - OAuth flow (requires backend)?
   - Single bot account?

3. **Annotation scope**:
   - Any text on page?
   - Only content area (exclude nav, footer)?
   - Specific markdown elements only?

4. **Storage strategy**:
   - LocalStorage only (per-browser)?
   - Backend database (requires server)?
   - GitHub itself (issues as storage)?

5. **Offline support**:
   - Queue annotations when offline?
   - Sync when back online?

6. **Access control**:
   - Public annotations (anyone can see)?
   - Private (only creator sees)?
   - Repo contributors only?

## Next Steps

1. **Prototype text selection UI**: Start with basic selection → show tooltip → capture text
2. **Design annotation modal**: UI mockup for annotation input (follow Search modal pattern)
3. **Implement localStorage storage**: Store annotations locally first
4. **Test with existing components**: Ensure no conflicts with Quartz's SPA navigation
5. **Choose GitHub integration approach**: Decide on security/architecture model
6. **Implement GitHub API integration**: Test issue creation with dummy data
7. **Build settings UI**: Allow users to configure GitHub repo and auth
8. **Documentation**: Write user guide for annotation feature

## Related Research

- No prior research documents found in `thoughts/shared/research/` related to this topic
- `.claude/commands/linear.md` provides pattern for issue management (different API but similar concept)

---

**Status**: Initial research complete. Ready to begin implementation planning and prototyping.
