---
date: 2025-10-10
author: Claude
status: draft
tags: [implementation-plan, quartz, annotation, ui, local-storage]
related_research: thoughts/shared/research/2025-10-10_16-56-19_markdown-annotation-github-issues.md
---

# Annotation UI Implementation Plan (Local Storage)

## Overview

This plan implements a text annotation system for the Quartz-based site at `apps/site/`. Users will be able to select text on any page, add annotation notes, and store them locally in the browser. The implementation follows existing Quartz component patterns (Search modal, Popover positioning, localStorage persistence) to ensure consistency with the codebase.

**Scope**: Client-side annotation UI with localStorage persistence only. GitHub issue creation is explicitly out of scope for this phase.

## Current State Analysis

### Existing Architecture
- **Framework**: Quartz v4.5.2 (TypeScript/Preact static site generator)
- **Component Pattern**: TSX file + inline script + SCSS styles
- **SPA Navigation**: Custom "nav" event with `window.addCleanup()` for memory management
- **State Persistence**: Multiple components use localStorage (checkboxes, theme, folder state)
- **Interactive Components**: Search, Darkmode, Popover provide UI patterns to follow

### Key Files in Current Codebase
- `apps/site/quartz/components/Search.tsx:1` - Modal overlay pattern
- `apps/site/quartz/components/scripts/popover.inline.ts:8-115` - Floating UI positioning
- `apps/site/quartz/components/scripts/checkbox.inline.ts:1` - localStorage persistence pattern
- `apps/site/quartz/components/scripts/util.ts:1-20` - `registerEscapeHandler` utility
- `apps/site/quartz.layout.ts:1` - Component registration location

### What Doesn't Exist Yet
- No text selection handling
- No annotation storage schema
- No annotation display/highlighting system
- No annotation management UI

## Desired End State

### User Experience
1. **Select text** on any page → annotation button appears near selection
2. **Click annotation button** → modal opens with selected text preview and note input
3. **Save annotation** → note stored locally, text visually highlighted
4. **View annotations** → sidebar shows all annotations for current page
5. **Manage annotations** → edit, delete, or export annotations
6. **Navigate pages** → annotations persist and reload on return

### Technical Implementation
- New `Annotator` component registered in Quartz layout
- Annotation data stored in localStorage with page-specific keys
- Text highlighting using CSS classes and data attributes
- Annotation modal following Search component pattern
- Full dark mode support
- Mobile-friendly (touch selection support)

### Verification Checklist
- [ ] Can select text and create annotation on desktop
- [ ] Can select text and create annotation on mobile (touch)
- [ ] Annotations persist across page navigations
- [ ] Annotations persist after browser refresh
- [ ] Can edit existing annotations
- [ ] Can delete annotations
- [ ] Can export annotations to JSON/Markdown
- [ ] Highlighted text is visually distinct
- [ ] Dark mode styles work correctly
- [ ] No memory leaks during SPA navigation
- [ ] Works with code blocks, callouts, and tables

## What We're NOT Doing

**Explicitly out of scope for this phase:**
1. **GitHub issue creation** - Will be added in future phase
2. **Backend/server storage** - localStorage only for now
3. **Multi-user collaboration** - Single-user, per-browser storage
4. **Cloud sync** - No synchronization across devices/browsers
5. **Rich text formatting** - Plain text annotations only
6. **Annotation replies/threads** - Single note per annotation
7. **Annotation categories/tags** - Simple flat list
8. **Annotation search** - Basic list display only
9. **Public/shared annotations** - Private to browser only
10. **Annotation analytics** - No usage tracking

## Implementation Approach

### Strategy
Follow the **incremental component pattern** used by existing Quartz interactive features:

1. **Start with core component structure** (TSX + inline script + SCSS)
2. **Implement text selection detection** (mouseup/touchend events)
3. **Build annotation modal UI** (following Search modal pattern)
4. **Add localStorage persistence** (following checkbox pattern)
5. **Implement highlighting system** (CSS classes + data attributes)
6. **Create annotation management sidebar**
7. **Polish with keyboard shortcuts and mobile support**

### Key Design Decisions

**Text Selection Positioning**: Use Floating UI library (already used by Popover) for positioning annotation button near selection.

**Storage Schema**: Store annotations as JSON array in localStorage with key format: `quartz-annotations-{pageSlug}`

**Highlighting Strategy**: Wrap annotated text in `<mark>` tags with data attributes, re-apply on each page load by matching text content and position.

**Modal vs. Popover**: Use full modal overlay (like Search) rather than popover for annotation input to provide better UX on mobile.

**Component Registration**: Add to `afterBody` in `quartz.layout.ts` so it's available on all pages but doesn't interfere with content rendering.

---

## Phase 1: Core Text Selection & UI

### Overview
Create the foundational annotation component structure and implement text selection detection with a floating action button.

### Changes Required

#### 1. Create Annotator Component Structure

**File**: `apps/site/quartz/components/Annotator.tsx` (new)

```typescript
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/annotator.scss"
// @ts-ignore
import script from "./scripts/annotator.inline"

export interface AnnotatorOptions {
  enableAnnotations: boolean
}

const defaultOptions: AnnotatorOptions = {
  enableAnnotations: true,
}

export default ((userOpts?: Partial<AnnotatorOptions>) => {
  const Annotator: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }

    if (!opts.enableAnnotations) return null

    return (
      <div class="annotator-container">
        {/* Floating annotation button (shown on text selection) */}
        <button class="annotation-button" style="display: none;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <title>Add Annotation</title>
            <path fill="currentColor" d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M20,16H6l-2,2V4h16V16z"/>
            <path fill="currentColor" d="M7,9h10v2H7V9z M7,13h7v2H7V13z"/>
          </svg>
        </button>

        {/* Annotation modal */}
        <div class="annotation-modal-container">
          <div class="annotation-modal">
            <div class="annotation-header">
              <h3>Add Annotation</h3>
              <button class="annotation-close" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41z"/>
                </svg>
              </button>
            </div>

            <div class="annotation-content">
              <div class="selected-text-preview">
                <label>Selected Text:</label>
                <blockquote class="preview-text"></blockquote>
              </div>

              <div class="annotation-input">
                <label for="annotation-note">Your Note:</label>
                <textarea
                  id="annotation-note"
                  class="annotation-textarea"
                  placeholder="Add your thoughts, questions, or comments..."
                  rows="6"
                ></textarea>
              </div>
            </div>

            <div class="annotation-footer">
              <button class="annotation-cancel">Cancel</button>
              <button class="annotation-save">Save Annotation</button>
            </div>
          </div>
        </div>

        {/* Annotation sidebar */}
        <div class="annotation-sidebar">
          <div class="annotation-sidebar-header">
            <h3>Annotations</h3>
            <button class="annotation-sidebar-close" aria-label="Close">×</button>
          </div>
          <div class="annotation-list">
            {/* Annotations will be dynamically inserted here */}
          </div>
          <div class="annotation-sidebar-footer">
            <button class="annotation-export">Export</button>
            <button class="annotation-clear-all">Clear All</button>
          </div>
        </div>

        {/* Floating toggle button for sidebar */}
        <button class="annotation-toggle" title="Show annotations">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M21,11.5C21,16.75,16.75,21,11.5,21C6.25,21,2,16.75,2,11.5S6.25,2,11.5,2 M14,17l6-6l-1.5-1.5L14,14L9.5,9.5L8,11L14,17z"/>
          </svg>
          <span class="annotation-count">0</span>
        </button>
      </div>
    )
  }

  Annotator.afterDOMLoaded = script
  Annotator.css = style

  return Annotator
}) satisfies QuartzComponentConstructor
```

#### 2. Create Annotation Script with Text Selection

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts` (new)

```typescript
import { computePosition, flip, shift, offset } from "@floating-ui/dom"
import { registerEscapeHandler } from "./util"
import { getFullSlug } from "../../util/path"

interface Annotation {
  id: string
  pageUrl: string
  selectedText: string
  note: string
  textRange: { start: number; end: number }
  timestamp: string
  highlighted: boolean
}

let currentSelection: Selection | null = null
let currentRange: Range | null = null

// Get storage key for current page
function getStorageKey(): string {
  return `quartz-annotations-${getFullSlug(window)}`
}

// Load annotations from localStorage
function loadAnnotations(): Annotation[] {
  try {
    const stored = localStorage.getItem(getStorageKey())
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error("Failed to load annotations:", e)
    return []
  }
}

// Save annotations to localStorage
function saveAnnotations(annotations: Annotation[]): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(annotations))
  } catch (e) {
    console.error("Failed to save annotations:", e)
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Show annotation button near selection
function showAnnotationButton(selection: Selection, button: HTMLElement) {
  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  // Position button above selection
  computePosition(
    {
      getBoundingClientRect: () => rect,
    },
    button,
    {
      placement: "top",
      middleware: [offset(10), flip(), shift({ padding: 5 })],
    }
  ).then(({ x, y }) => {
    Object.assign(button.style, {
      left: `${x}px`,
      top: `${y}px`,
      display: "flex",
    })
  })
}

// Hide annotation button
function hideAnnotationButton(button: HTMLElement) {
  button.style.display = "none"
}

// Open annotation modal
function openAnnotationModal(modal: HTMLElement, selectedText: string) {
  const previewElement = modal.querySelector(".preview-text") as HTMLElement
  const textarea = modal.querySelector(".annotation-textarea") as HTMLTextAreaElement

  if (previewElement) {
    previewElement.textContent = selectedText
  }

  if (textarea) {
    textarea.value = ""
    textarea.focus()
  }

  modal.classList.add("active")
}

// Close annotation modal
function closeAnnotationModal(modal: HTMLElement) {
  modal.classList.remove("active")
  const textarea = modal.querySelector(".annotation-textarea") as HTMLTextAreaElement
  if (textarea) {
    textarea.value = ""
  }
}

// Update annotation count badge
function updateAnnotationCount() {
  const annotations = loadAnnotations()
  const countBadge = document.querySelector(".annotation-count") as HTMLElement
  if (countBadge) {
    countBadge.textContent = annotations.length.toString()
  }
}

document.addEventListener("nav", () => {
  const container = document.querySelector(".annotator-container") as HTMLElement
  if (!container) return

  const button = container.querySelector(".annotation-button") as HTMLElement
  const modal = container.querySelector(".annotation-modal-container") as HTMLElement
  const saveBtn = container.querySelector(".annotation-save") as HTMLElement
  const cancelBtn = container.querySelector(".annotation-cancel") as HTMLElement
  const closeBtn = container.querySelector(".annotation-close") as HTMLElement
  const contentArea = document.querySelector("#quartz-body") as HTMLElement

  if (!button || !modal || !saveBtn || !cancelBtn || !closeBtn || !contentArea) return

  // Handle text selection
  function handleTextSelection() {
    const selection = window.getSelection()

    if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
      hideAnnotationButton(button)
      currentSelection = null
      currentRange = null
      return
    }

    // Check if selection is within content area
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const isInContent = contentArea.contains(
      container.nodeType === Node.TEXT_NODE ? container.parentNode : container
    )

    if (!isInContent) {
      hideAnnotationButton(button)
      return
    }

    currentSelection = selection
    currentRange = range.cloneRange()
    showAnnotationButton(selection, button)
  }

  // Handle annotation button click
  function handleAnnotationButtonClick(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    if (!currentSelection || !currentRange) return

    const selectedText = currentSelection.toString().trim()
    if (selectedText.length === 0) return

    openAnnotationModal(modal, selectedText)
    hideAnnotationButton(button)
  }

  // Handle save annotation
  function handleSaveAnnotation() {
    if (!currentSelection || !currentRange) {
      closeAnnotationModal(modal)
      return
    }

    const textarea = modal.querySelector(".annotation-textarea") as HTMLTextAreaElement
    const note = textarea?.value.trim() || ""
    const selectedText = currentSelection.toString().trim()

    if (selectedText.length === 0) {
      closeAnnotationModal(modal)
      return
    }

    // Create new annotation
    const annotation: Annotation = {
      id: generateId(),
      pageUrl: window.location.pathname,
      selectedText,
      note,
      textRange: { start: 0, end: 0 }, // TODO: Calculate proper range in Phase 3
      timestamp: new Date().toISOString(),
      highlighted: false,
    }

    // Save to localStorage
    const annotations = loadAnnotations()
    annotations.push(annotation)
    saveAnnotations(annotations)

    // Update UI
    updateAnnotationCount()
    closeAnnotationModal(modal)

    // Clear selection
    currentSelection = null
    currentRange = null
    window.getSelection()?.removeAllRanges()
  }

  // Handle cancel
  function handleCancelAnnotation() {
    closeAnnotationModal(modal)
    currentSelection = null
    currentRange = null
  }

  // Event listeners
  contentArea.addEventListener("mouseup", handleTextSelection)
  contentArea.addEventListener("touchend", handleTextSelection)
  button.addEventListener("click", handleAnnotationButtonClick)
  saveBtn.addEventListener("click", handleSaveAnnotation)
  cancelBtn.addEventListener("click", handleCancelAnnotation)
  closeBtn.addEventListener("click", handleCancelAnnotation)

  // Register escape handler for modal
  registerEscapeHandler(modal, () => {
    if (modal.classList.contains("active")) {
      handleCancelAnnotation()
    }
  })

  // Cleanup
  window.addCleanup(() => {
    contentArea.removeEventListener("mouseup", handleTextSelection)
    contentArea.removeEventListener("touchend", handleTextSelection)
    button.removeEventListener("click", handleAnnotationButtonClick)
    saveBtn.removeEventListener("click", handleSaveAnnotation)
    cancelBtn.removeEventListener("click", handleCancelAnnotation)
    closeBtn.removeEventListener("click", handleCancelAnnotation)
  })

  // Initialize count on load
  updateAnnotationCount()
})
```

#### 3. Create Annotation Styles

**File**: `apps/site/quartz/components/styles/annotator.scss` (new)

```scss
@use "../../styles/variables.scss" as *;

.annotator-container {
  // Floating annotation button (appears on text selection)
  .annotation-button {
    position: fixed;
    z-index: 998;
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--secondary);
    color: var(--light);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  // Annotation modal overlay
  .annotation-modal-container {
    position: fixed;
    z-index: 999;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: none;
    backdrop-filter: blur(4px);
    background: rgba(0, 0, 0, 0.3);
    align-items: center;
    justify-content: center;

    &.active {
      display: flex;
    }

    .annotation-modal {
      background: var(--light);
      border-radius: 8px;
      box-shadow: 0 14px 50px rgba(27, 33, 48, 0.12), 0 10px 30px rgba(27, 33, 48, 0.16);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .annotation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--lightgray);

        h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--dark);
        }

        .annotation-close {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          color: var(--gray);
          transition: color 0.2s ease;

          &:hover {
            color: var(--dark);
          }
        }
      }

      .annotation-content {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;

        .selected-text-preview {
          margin-bottom: 1.5rem;

          label {
            display: block;
            font-weight: $boldWeight;
            color: var(--dark);
            margin-bottom: 0.5rem;
          }

          .preview-text {
            background: var(--lightgray);
            border-left: 4px solid var(--secondary);
            padding: 0.75rem 1rem;
            margin: 0;
            font-style: italic;
            color: var(--gray);
            border-radius: 4px;
          }
        }

        .annotation-input {
          label {
            display: block;
            font-weight: $boldWeight;
            color: var(--dark);
            margin-bottom: 0.5rem;
          }

          .annotation-textarea {
            width: 100%;
            padding: 0.75rem;
            font-family: var(--bodyFont);
            font-size: 1rem;
            color: var(--dark);
            background: var(--light);
            border: 1px solid var(--lightgray);
            border-radius: 4px;
            resize: vertical;
            min-height: 120px;
            box-sizing: border-box;

            &:focus {
              outline: none;
              border-color: var(--secondary);
            }

            &::placeholder {
              color: var(--gray);
            }
          }
        }
      }

      .annotation-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--lightgray);

        button {
          padding: 0.5rem 1.25rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-weight: $boldWeight;
        }

        .annotation-cancel {
          background: transparent;
          color: var(--gray);
          border: 1px solid var(--lightgray);

          &:hover {
            background: var(--lightgray);
            color: var(--dark);
          }
        }

        .annotation-save {
          background: var(--secondary);
          color: var(--light);

          &:hover {
            opacity: 0.9;
          }
        }
      }
    }
  }

  // Floating toggle button
  .annotation-toggle {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    z-index: 997;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--tertiary);
    color: var(--light);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .annotation-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--secondary);
      color: var(--light);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: $boldWeight;
    }

    @media all and ($mobile) {
      right: 1rem;
      bottom: 1rem;
      width: 48px;
      height: 48px;
    }
  }

  // Annotation sidebar (hidden by default, shown in Phase 4)
  .annotation-sidebar {
    display: none;
  }
}
```

#### 4. Register Component in Layout

**File**: `apps/site/quartz.layout.ts`
**Changes**: Add Annotator to shared page components

```typescript
// Add import
import * as Component from "./quartz/components"

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Annotator(), // Add annotation UI
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}
```

#### 5. Export Annotator Component

**File**: `apps/site/quartz/components/index.ts`
**Changes**: Add Annotator export

```typescript
// Add to existing exports
export { default as Annotator } from "./Annotator"
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] Site builds without errors: `npx quartz build`
- [ ] No console errors on page load
- [ ] Component registers in layout correctly

#### Manual Verification:
- [ ] Annotation button appears when text is selected on desktop
- [ ] Annotation button appears when text is selected on mobile (touch)
- [ ] Annotation button positions correctly near selection
- [ ] Annotation button disappears when selection is cleared
- [ ] Clicking annotation button opens modal
- [ ] Modal shows selected text in preview area
- [ ] Can type annotation note in textarea
- [ ] Save button creates annotation and closes modal
- [ ] Cancel button closes modal without saving
- [ ] Escape key closes modal
- [ ] Clicking outside modal closes it
- [ ] Annotation count badge shows "0" initially
- [ ] Annotation count increases after saving annotation
- [ ] Annotations persist after page refresh
- [ ] Different pages have separate annotation storage

---

## Phase 2: Local Storage & Data Management

### Overview
Implement proper text range calculation, localStorage persistence with robust error handling, and CRUD operations for annotations.

### Changes Required

#### 1. Enhance Annotation Storage Schema

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Update `textRange` calculation and add helper functions

```typescript
// Add after imports
interface TextPosition {
  nodeIndex: number
  offset: number
}

// Calculate text position within content area
function getTextPosition(node: Node, offset: number, contentArea: HTMLElement): number {
  const walker = document.createTreeWalker(
    contentArea,
    NodeFilter.SHOW_TEXT,
    null
  )

  let currentPos = 0
  let currentNode: Node | null = null

  while ((currentNode = walker.nextNode())) {
    if (currentNode === node) {
      return currentPos + offset
    }
    currentPos += (currentNode.textContent || "").length
  }

  return currentPos
}

// Calculate text range for annotation
function calculateTextRange(range: Range, contentArea: HTMLElement): { start: number; end: number } {
  const startPos = getTextPosition(range.startContainer, range.startOffset, contentArea)
  const endPos = getTextPosition(range.endContainer, range.endOffset, contentArea)

  return { start: startPos, end: endPos }
}

// Update handleSaveAnnotation function to use proper text range
function handleSaveAnnotation() {
  if (!currentSelection || !currentRange) {
    closeAnnotationModal(modal)
    return
  }

  const textarea = modal.querySelector(".annotation-textarea") as HTMLTextAreaElement
  const note = textarea?.value.trim() || ""
  const selectedText = currentSelection.toString().trim()

  if (selectedText.length === 0) {
    closeAnnotationModal(modal)
    return
  }

  // Calculate proper text range
  const textRange = calculateTextRange(currentRange, contentArea)

  // Create new annotation
  const annotation: Annotation = {
    id: generateId(),
    pageUrl: window.location.pathname,
    selectedText,
    note,
    textRange,
    timestamp: new Date().toISOString(),
    highlighted: false,
  }

  // Save to localStorage
  const annotations = loadAnnotations()
  annotations.push(annotation)
  saveAnnotations(annotations)

  // Update UI
  updateAnnotationCount()
  closeAnnotationModal(modal)

  // Clear selection
  currentSelection = null
  currentRange = null
  window.getSelection()?.removeAllRanges()
}
```

#### 2. Add CRUD Operations

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add functions for managing annotations

```typescript
// Get annotation by ID
function getAnnotationById(id: string): Annotation | null {
  const annotations = loadAnnotations()
  return annotations.find((a) => a.id === id) || null
}

// Update annotation
function updateAnnotation(id: string, updates: Partial<Annotation>): boolean {
  try {
    const annotations = loadAnnotations()
    const index = annotations.findIndex((a) => a.id === id)

    if (index === -1) return false

    annotations[index] = { ...annotations[index], ...updates }
    saveAnnotations(annotations)
    return true
  } catch (e) {
    console.error("Failed to update annotation:", e)
    return false
  }
}

// Delete annotation
function deleteAnnotation(id: string): boolean {
  try {
    const annotations = loadAnnotations()
    const filtered = annotations.filter((a) => a.id !== id)

    if (filtered.length === annotations.length) return false

    saveAnnotations(filtered)
    updateAnnotationCount()
    return true
  } catch (e) {
    console.error("Failed to delete annotation:", e)
    return false
  }
}

// Delete all annotations for current page
function deleteAllAnnotations(): boolean {
  try {
    localStorage.removeItem(getStorageKey())
    updateAnnotationCount()
    return true
  } catch (e) {
    console.error("Failed to delete all annotations:", e)
    return false
  }
}

// Export annotations
function exportAnnotations(format: "json" | "markdown"): string {
  const annotations = loadAnnotations()

  if (format === "json") {
    return JSON.stringify(annotations, null, 2)
  }

  // Markdown format
  let markdown = `# Annotations for ${window.location.pathname}\n\n`
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`

  annotations.forEach((annotation, index) => {
    markdown += `## Annotation ${index + 1}\n\n`
    markdown += `**Selected Text:**\n> ${annotation.selectedText}\n\n`
    if (annotation.note) {
      markdown += `**Note:**\n${annotation.note}\n\n`
    }
    markdown += `**Date:** ${new Date(annotation.timestamp).toLocaleString()}\n\n`
    markdown += `---\n\n`
  })

  return markdown
}

// Download exported annotations
function downloadAnnotations(format: "json" | "markdown") {
  const content = exportAnnotations(format)
  const filename = `annotations-${getFullSlug(window)}-${Date.now()}.${format === "json" ? "json" : "md"}`
  const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}
```

#### 3. Add Storage Migration Support

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add version checking and migration

```typescript
const STORAGE_VERSION = 1

interface StorageData {
  version: number
  annotations: Annotation[]
}

// Updated load function with migration support
function loadAnnotations(): Annotation[] {
  try {
    const stored = localStorage.getItem(getStorageKey())
    if (!stored) return []

    const parsed = JSON.parse(stored)

    // Handle old format (array directly)
    if (Array.isArray(parsed)) {
      // Migrate to new format
      const migrated: StorageData = {
        version: STORAGE_VERSION,
        annotations: parsed,
      }
      localStorage.setItem(getStorageKey(), JSON.stringify(migrated))
      return parsed
    }

    // Handle new format
    if (parsed.version === STORAGE_VERSION) {
      return parsed.annotations
    }

    // Future migrations would go here
    return []
  } catch (e) {
    console.error("Failed to load annotations:", e)
    return []
  }
}

// Updated save function
function saveAnnotations(annotations: Annotation[]): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      annotations,
    }
    localStorage.setItem(getStorageKey(), JSON.stringify(data))
  } catch (e) {
    console.error("Failed to save annotations:", e)

    // Handle quota exceeded
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      alert("Storage quota exceeded. Please delete some annotations.")
    }
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] No console errors related to storage operations
- [ ] localStorage operations complete without exceptions

#### Manual Verification:
- [ ] Text range is calculated correctly for selections
- [ ] Annotations save with correct start/end positions
- [ ] Can reload page and annotations persist
- [ ] Storage migration works for existing data
- [ ] Quota exceeded error shows helpful message
- [ ] Export to JSON produces valid JSON file
- [ ] Export to Markdown produces readable markdown
- [ ] Storage is page-specific (different slugs = different storage)
- [ ] Multiple annotations can be saved on same page
- [ ] Annotation data includes all required fields

---

## Phase 3: Annotation Display & Highlighting

### Overview
Implement visual highlighting of annotated text by wrapping selections in `<mark>` elements with data attributes, and re-apply highlights on page navigation.

### Changes Required

#### 1. Add Highlighting Functions

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add text highlighting and restoration functions

```typescript
// Highlight annotation in the DOM
function highlightAnnotation(annotation: Annotation, contentArea: HTMLElement): boolean {
  try {
    // Get all text nodes
    const walker = document.createTreeWalker(
      contentArea,
      NodeFilter.SHOW_TEXT,
      null
    )

    let currentPos = 0
    const textNodes: { node: Text; start: number; end: number }[] = []

    // Map all text nodes with their positions
    let node: Node | null = null
    while ((node = walker.nextNode())) {
      const textNode = node as Text
      const text = textNode.textContent || ""
      textNodes.push({
        node: textNode,
        start: currentPos,
        end: currentPos + text.length,
      })
      currentPos += text.length
    }

    // Find nodes that intersect with annotation range
    const { start, end } = annotation.textRange
    const affectedNodes = textNodes.filter(
      (tn) => tn.end > start && tn.start < end
    )

    if (affectedNodes.length === 0) return false

    // Wrap text in mark elements
    for (const { node, start: nodeStart, end: nodeEnd } of affectedNodes) {
      const relativeStart = Math.max(0, start - nodeStart)
      const relativeEnd = Math.min(nodeEnd - nodeStart, end - nodeStart)

      const text = node.textContent || ""
      const before = text.substring(0, relativeStart)
      const highlighted = text.substring(relativeStart, relativeEnd)
      const after = text.substring(relativeEnd)

      // Create mark element
      const mark = document.createElement("mark")
      mark.className = "annotation-highlight"
      mark.dataset.annotationId = annotation.id
      mark.textContent = highlighted
      mark.title = annotation.note || "Click to view annotation"

      // Replace text node with fragments
      const fragment = document.createDocumentFragment()
      if (before) fragment.appendChild(document.createTextNode(before))
      fragment.appendChild(mark)
      if (after) fragment.appendChild(document.createTextNode(after))

      node.parentNode?.replaceChild(fragment, node)
    }

    // Mark as highlighted
    annotation.highlighted = true
    updateAnnotation(annotation.id, { highlighted: true })

    return true
  } catch (e) {
    console.error("Failed to highlight annotation:", e)
    return false
  }
}

// Remove all highlights from the page
function removeAllHighlights(contentArea: HTMLElement) {
  const marks = contentArea.querySelectorAll("mark.annotation-highlight")
  marks.forEach((mark) => {
    const text = document.createTextNode(mark.textContent || "")
    mark.parentNode?.replaceChild(text, mark)
  })

  // Normalize text nodes to merge adjacent ones
  contentArea.normalize()
}

// Apply all highlights for current page
function applyAllHighlights(contentArea: HTMLElement) {
  // Remove existing highlights first
  removeAllHighlights(contentArea)

  const annotations = loadAnnotations()
  annotations.forEach((annotation) => {
    highlightAnnotation(annotation, contentArea)
  })
}

// Handle click on highlighted text
function handleHighlightClick(e: Event) {
  const target = e.target as HTMLElement
  if (!target.classList.contains("annotation-highlight")) return

  const annotationId = target.dataset.annotationId
  if (!annotationId) return

  const annotation = getAnnotationById(annotationId)
  if (!annotation) return

  // TODO: Show annotation details (will be implemented in Phase 4)
  console.log("Clicked annotation:", annotation)
}
```

#### 2. Integrate Highlighting into Navigation

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Update nav event listener to apply highlights

```typescript
document.addEventListener("nav", () => {
  const container = document.querySelector(".annotator-container") as HTMLElement
  if (!container) return

  const button = container.querySelector(".annotation-button") as HTMLElement
  const modal = container.querySelector(".annotation-modal-container") as HTMLElement
  const saveBtn = container.querySelector(".annotation-save") as HTMLElement
  const cancelBtn = container.querySelector(".annotation-cancel") as HTMLElement
  const closeBtn = container.querySelector(".annotation-close") as HTMLElement
  const contentArea = document.querySelector("#quartz-body") as HTMLElement

  if (!button || !modal || !saveBtn || !cancelBtn || !closeBtn || !contentArea) return

  // ... existing event listeners ...

  // Apply highlights on page load
  setTimeout(() => {
    applyAllHighlights(contentArea)
  }, 100) // Small delay to ensure content is fully rendered

  // Handle highlight clicks
  contentArea.addEventListener("click", handleHighlightClick)

  // Cleanup
  window.addCleanup(() => {
    contentArea.removeEventListener("mouseup", handleTextSelection)
    contentArea.removeEventListener("touchend", handleTextSelection)
    contentArea.removeEventListener("click", handleHighlightClick)
    button.removeEventListener("click", handleAnnotationButtonClick)
    saveBtn.removeEventListener("click", handleSaveAnnotation)
    cancelBtn.removeEventListener("click", handleCancelAnnotation)
    closeBtn.removeEventListener("click", handleCancelAnnotation)
  })

  // Initialize count and highlights
  updateAnnotationCount()
})
```

#### 3. Add Highlight Styles

**File**: `apps/site/quartz/components/styles/annotator.scss`
**Changes**: Add styles for highlighted text

```scss
// Add to existing file
mark.annotation-highlight {
  background: rgba(255, 235, 59, 0.4); // Light yellow highlight
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 235, 59, 0.6);
  }

  // Dark mode support
  @media (prefers-color-scheme: dark) {
    background: rgba(255, 193, 7, 0.3);

    &:hover {
      background: rgba(255, 193, 7, 0.5);
    }
  }
}

// Alternative highlight colors (can be used for different annotation types in future)
.annotation-highlight {
  &.highlight-blue {
    background: rgba(33, 150, 243, 0.3);
    &:hover {
      background: rgba(33, 150, 243, 0.5);
    }
  }

  &.highlight-green {
    background: rgba(76, 175, 80, 0.3);
    &:hover {
      background: rgba(76, 175, 80, 0.5);
    }
  }

  &.highlight-pink {
    background: rgba(233, 30, 99, 0.3);
    &:hover {
      background: rgba(233, 30, 99, 0.5);
    }
  }
}
```

#### 4. Handle Edge Cases

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add validation and error handling

```typescript
// Validate annotation before highlighting
function validateAnnotation(annotation: Annotation, contentArea: HTMLElement): boolean {
  // Check if text range is valid
  if (annotation.textRange.start < 0 || annotation.textRange.end < annotation.textRange.start) {
    console.warn("Invalid text range for annotation:", annotation.id)
    return false
  }

  // Check if selected text still exists in content
  const contentText = contentArea.textContent || ""
  const rangeText = contentText.substring(annotation.textRange.start, annotation.textRange.end)

  // Allow some flexibility for whitespace differences
  const normalizedRangeText = rangeText.replace(/\s+/g, " ").trim()
  const normalizedSelectedText = annotation.selectedText.replace(/\s+/g, " ").trim()

  if (normalizedRangeText !== normalizedSelectedText) {
    console.warn("Content mismatch for annotation:", annotation.id)
    console.warn("Expected:", normalizedSelectedText)
    console.warn("Found:", normalizedRangeText)
    return false
  }

  return true
}

// Update applyAllHighlights to use validation
function applyAllHighlights(contentArea: HTMLElement) {
  removeAllHighlights(contentArea)

  const annotations = loadAnnotations()
  const validAnnotations: Annotation[] = []
  const invalidAnnotations: Annotation[] = []

  annotations.forEach((annotation) => {
    if (validateAnnotation(annotation, contentArea)) {
      if (highlightAnnotation(annotation, contentArea)) {
        validAnnotations.push(annotation)
      } else {
        invalidAnnotations.push(annotation)
      }
    } else {
      invalidAnnotations.push(annotation)
    }
  })

  // Optionally: Remove invalid annotations or mark them
  if (invalidAnnotations.length > 0) {
    console.warn(`${invalidAnnotations.length} annotations could not be highlighted`)
    // Could offer user option to remove invalid annotations
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] No console errors during highlight application
- [ ] Highlights apply within 200ms of page load

#### Manual Verification:
- [ ] Saved annotations are highlighted in yellow
- [ ] Highlighted text matches original selection
- [ ] Hovering over highlight shows darker yellow
- [ ] Clicking highlight logs annotation to console
- [ ] Highlights persist after page refresh
- [ ] Highlights reapply after SPA navigation
- [ ] Multiple annotations can be highlighted on same page
- [ ] Overlapping highlights are handled gracefully
- [ ] Highlights work across paragraphs
- [ ] Highlights work within code blocks
- [ ] Highlights work in tables
- [ ] Highlights work in callouts
- [ ] Dark mode highlight color is visible
- [ ] Invalid/outdated annotations don't crash the page
- [ ] Content changes don't break existing highlights

---

## Phase 4: Annotation List & Management UI

### Overview
Build a sidebar panel that displays all annotations for the current page, with edit/delete functionality and export options.

### Changes Required

#### 1. Update Sidebar Display Logic

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add sidebar functions

```typescript
// Render annotation list
function renderAnnotationList(container: HTMLElement) {
  const annotations = loadAnnotations()
  const listElement = container.querySelector(".annotation-list") as HTMLElement
  if (!listElement) return

  // Clear existing list
  listElement.innerHTML = ""

  if (annotations.length === 0) {
    listElement.innerHTML = `
      <div class="annotation-empty">
        <p>No annotations yet.</p>
        <p>Select text on this page to create your first annotation.</p>
      </div>
    `
    return
  }

  // Render each annotation
  annotations.forEach((annotation) => {
    const item = document.createElement("div")
    item.className = "annotation-item"
    item.dataset.annotationId = annotation.id

    const date = new Date(annotation.timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })

    item.innerHTML = `
      <div class="annotation-item-header">
        <span class="annotation-date">${date}</span>
        <div class="annotation-actions">
          <button class="annotation-edit" data-id="${annotation.id}" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="annotation-delete" data-id="${annotation.id}" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
      <blockquote class="annotation-text">${escapeHtml(annotation.selectedText)}</blockquote>
      ${annotation.note ? `<p class="annotation-note">${escapeHtml(annotation.note)}</p>` : ""}
    `

    // Click to scroll to highlight
    item.addEventListener("click", (e) => {
      // Don't trigger if clicking action buttons
      if ((e.target as HTMLElement).closest(".annotation-actions")) return

      scrollToAnnotation(annotation.id)
    })

    listElement.appendChild(item)
  })

  // Attach event listeners to action buttons
  attachAnnotationActionListeners(listElement)
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Scroll to and flash highlight
function scrollToAnnotation(id: string) {
  const mark = document.querySelector(`mark[data-annotation-id="${id}"]`) as HTMLElement
  if (!mark) return

  mark.scrollIntoView({ behavior: "smooth", block: "center" })

  // Flash effect
  mark.classList.add("annotation-flash")
  setTimeout(() => {
    mark.classList.remove("annotation-flash")
  }, 1500)
}

// Attach listeners to edit/delete buttons
function attachAnnotationActionListeners(listElement: HTMLElement) {
  // Edit buttons
  const editButtons = listElement.querySelectorAll(".annotation-edit")
  editButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      const id = (btn as HTMLElement).dataset.id
      if (id) handleEditAnnotation(id)
    })
  })

  // Delete buttons
  const deleteButtons = listElement.querySelectorAll(".annotation-delete")
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      const id = (btn as HTMLElement).dataset.id
      if (id) handleDeleteAnnotation(id)
    })
  })
}

// Handle edit annotation
function handleEditAnnotation(id: string) {
  const annotation = getAnnotationById(id)
  if (!annotation) return

  const modal = document.querySelector(".annotation-modal-container") as HTMLElement
  const previewElement = modal.querySelector(".preview-text") as HTMLElement
  const textarea = modal.querySelector(".annotation-textarea") as HTMLTextAreaElement
  const saveBtn = modal.querySelector(".annotation-save") as HTMLElement

  if (!modal || !previewElement || !textarea || !saveBtn) return

  // Populate modal with existing data
  previewElement.textContent = annotation.selectedText
  textarea.value = annotation.note

  // Change save button to update mode
  saveBtn.textContent = "Update Annotation"
  saveBtn.dataset.editMode = "true"
  saveBtn.dataset.annotationId = id

  openAnnotationModal(modal, annotation.selectedText)
}

// Handle delete annotation
function handleDeleteAnnotation(id: string) {
  if (!confirm("Are you sure you want to delete this annotation?")) return

  const contentArea = document.querySelector("#quartz-body") as HTMLElement

  if (deleteAnnotation(id)) {
    // Refresh list and highlights
    const sidebar = document.querySelector(".annotation-sidebar") as HTMLElement
    renderAnnotationList(sidebar)
    applyAllHighlights(contentArea)
  }
}

// Update save handler to support edit mode
function handleSaveAnnotation() {
  const saveBtn = modal.querySelector(".annotation-save") as HTMLElement
  const isEditMode = saveBtn.dataset.editMode === "true"
  const editId = saveBtn.dataset.annotationId

  if (isEditMode && editId) {
    // Update existing annotation
    const textarea = modal.querySelector(".annotation-textarea") as HTMLTextAreaElement
    const note = textarea?.value.trim() || ""

    if (updateAnnotation(editId, { note })) {
      const sidebar = document.querySelector(".annotation-sidebar") as HTMLElement
      renderAnnotationList(sidebar)
    }

    // Reset button state
    saveBtn.textContent = "Save Annotation"
    delete saveBtn.dataset.editMode
    delete saveBtn.dataset.annotationId

    closeAnnotationModal(modal)
    return
  }

  // Original save logic for new annotations
  // ... (existing code from Phase 1) ...
}

// Toggle sidebar visibility
function toggleSidebar(sidebar: HTMLElement, open?: boolean) {
  const isOpen = open !== undefined ? open : !sidebar.classList.contains("open")

  if (isOpen) {
    sidebar.classList.add("open")
    renderAnnotationList(sidebar)
  } else {
    sidebar.classList.remove("open")
  }
}
```

#### 2. Wire Up Sidebar Controls

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add sidebar event listeners in nav handler

```typescript
document.addEventListener("nav", () => {
  // ... existing code ...

  const sidebar = container.querySelector(".annotation-sidebar") as HTMLElement
  const toggleBtn = container.querySelector(".annotation-toggle") as HTMLElement
  const closeBtn = sidebar?.querySelector(".annotation-sidebar-close") as HTMLElement
  const exportBtn = sidebar?.querySelector(".annotation-export") as HTMLElement
  const clearAllBtn = sidebar?.querySelector(".annotation-clear-all") as HTMLElement

  if (!sidebar || !toggleBtn) return

  // Toggle sidebar
  function handleToggleSidebar() {
    toggleSidebar(sidebar)
  }

  function handleCloseSidebar() {
    toggleSidebar(sidebar, false)
  }

  function handleExport() {
    const format = confirm("Export as Markdown? (Cancel for JSON)") ? "markdown" : "json"
    downloadAnnotations(format)
  }

  function handleClearAll() {
    const count = loadAnnotations().length
    if (!confirm(`Are you sure you want to delete all ${count} annotations on this page?`)) return

    if (deleteAllAnnotations()) {
      const contentArea = document.querySelector("#quartz-body") as HTMLElement
      renderAnnotationList(sidebar)
      applyAllHighlights(contentArea)
    }
  }

  toggleBtn.addEventListener("click", handleToggleSidebar)
  closeBtn?.addEventListener("click", handleCloseSidebar)
  exportBtn?.addEventListener("click", handleExport)
  clearAllBtn?.addEventListener("click", handleClearAll)

  // Cleanup
  window.addCleanup(() => {
    // ... existing cleanup ...
    toggleBtn.removeEventListener("click", handleToggleSidebar)
    closeBtn?.removeEventListener("click", handleCloseSidebar)
    exportBtn?.removeEventListener("click", handleExport)
    clearAllBtn?.removeEventListener("click", handleClearAll)
  })

  // ... existing initialization ...
})
```

#### 3. Add Sidebar Styles

**File**: `apps/site/quartz/components/styles/annotator.scss`
**Changes**: Update sidebar styles

```scss
// Update .annotation-sidebar from Phase 1
.annotation-sidebar {
  position: fixed;
  right: -400px; // Hidden by default
  top: 0;
  width: 400px;
  height: 100vh;
  background: var(--light);
  border-left: 1px solid var(--lightgray);
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 998;
  transition: right 0.3s ease;

  &.open {
    right: 0;
  }

  @media all and ($mobile) {
    width: 100vw;
    right: -100vw;
  }

  .annotation-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--lightgray);

    h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--dark);
    }

    .annotation-sidebar-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--gray);
      transition: color 0.2s ease;

      &:hover {
        color: var(--dark);
      }
    }
  }

  .annotation-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;

    .annotation-empty {
      text-align: center;
      color: var(--gray);
      padding: 2rem 1rem;

      p {
        margin: 0.5rem 0;
      }
    }

    .annotation-item {
      background: var(--lightgray);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--darkgray);
        transform: translateX(-4px);
      }

      .annotation-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .annotation-date {
          font-size: 0.85rem;
          color: var(--gray);
        }

        .annotation-actions {
          display: flex;
          gap: 0.5rem;

          button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0.25rem;
            color: var(--gray);
            transition: color 0.2s ease;

            &:hover {
              color: var(--dark);
            }

            &.annotation-delete:hover {
              color: #f44336;
            }
          }
        }
      }

      .annotation-text {
        font-size: 0.9rem;
        font-style: italic;
        color: var(--gray);
        margin: 0.5rem 0;
        padding: 0.5rem;
        background: var(--light);
        border-left: 3px solid var(--secondary);
        border-radius: 4px;
      }

      .annotation-note {
        font-size: 0.95rem;
        color: var(--dark);
        margin: 0.5rem 0 0 0;
        line-height: 1.5;
      }
    }
  }

  .annotation-sidebar-footer {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--lightgray);

    button {
      flex: 1;
      padding: 0.625rem 1rem;
      border-radius: 4px;
      border: 1px solid var(--lightgray);
      background: transparent;
      color: var(--dark);
      cursor: pointer;
      font-weight: $boldWeight;
      transition: all 0.2s ease;

      &:hover {
        background: var(--lightgray);
      }

      &.annotation-clear-all:hover {
        background: #f44336;
        color: white;
        border-color: #f44336;
      }
    }
  }
}

// Flash animation for scrolling to annotation
@keyframes annotation-flash {
  0%, 100% {
    background: rgba(255, 235, 59, 0.4);
  }
  50% {
    background: rgba(255, 193, 7, 0.8);
  }
}

mark.annotation-highlight.annotation-flash {
  animation: annotation-flash 1.5s ease;
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] No console errors when opening/closing sidebar
- [ ] Annotation list renders without JavaScript errors

#### Manual Verification:
- [ ] Clicking toggle button opens sidebar from right
- [ ] Sidebar shows list of all annotations for current page
- [ ] Empty state message shows when no annotations exist
- [ ] Each annotation shows: date, selected text, and note
- [ ] Clicking annotation item scrolls to and flashes highlight
- [ ] Edit button opens modal with existing annotation data
- [ ] Can update annotation note and save changes
- [ ] Delete button shows confirmation dialog
- [ ] Deleting annotation removes it from list and removes highlight
- [ ] Export button prompts for format (JSON/Markdown)
- [ ] Export downloads file with correct data
- [ ] Clear All button shows confirmation with count
- [ ] Clear All removes all annotations
- [ ] Close button closes sidebar
- [ ] Sidebar slides smoothly with animation
- [ ] Sidebar is full-width on mobile
- [ ] Annotation count badge updates when creating/deleting
- [ ] Sidebar works correctly after SPA navigation

---

## Phase 5: Polish & Enhancement

### Overview
Add keyboard shortcuts, improve mobile support, ensure dark mode compatibility, and create a settings panel for configuration.

### Changes Required

#### 1. Add Keyboard Shortcuts

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add keyboard shortcut handlers

```typescript
// Keyboard shortcut handler
function handleKeyboardShortcuts(e: KeyboardEvent) {
  // Ctrl/Cmd + Shift + A: Toggle sidebar
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
    e.preventDefault()
    const sidebar = document.querySelector(".annotation-sidebar") as HTMLElement
    if (sidebar) toggleSidebar(sidebar)
    return
  }

  // Ctrl/Cmd + Shift + E: Export annotations
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
    e.preventDefault()
    const annotations = loadAnnotations()
    if (annotations.length > 0) {
      downloadAnnotations("markdown")
    }
    return
  }

  // Delete key when annotation item is focused
  if (e.key === "Delete" && document.activeElement?.classList.contains("annotation-item")) {
    const id = (document.activeElement as HTMLElement).dataset.annotationId
    if (id) handleDeleteAnnotation(id)
    return
  }
}

// Add to nav event listener
document.addEventListener("nav", () => {
  // ... existing code ...

  // Add keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts)

  window.addCleanup(() => {
    // ... existing cleanup ...
    document.removeEventListener("keydown", handleKeyboardShortcuts)
  })
})
```

#### 2. Improve Mobile Touch Support

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Enhance touch selection handling

```typescript
// Improved mobile text selection
let touchStartTime = 0
let touchStartPos = { x: 0, y: 0 }

function handleTouchStart(e: TouchEvent) {
  touchStartTime = Date.now()
  touchStartPos = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY,
  }
}

function handleTouchEnd(e: TouchEvent) {
  const touchDuration = Date.now() - touchStartTime

  // If touch was quick (< 200ms), it's likely a tap, not a selection
  if (touchDuration < 200) {
    return
  }

  // Small delay to allow browser selection to finalize
  setTimeout(() => {
    handleTextSelection()
  }, 50)
}

// Add to nav event listener
document.addEventListener("nav", () => {
  const contentArea = document.querySelector("#quartz-body") as HTMLElement
  if (!contentArea) return

  // Replace simple touchend with improved handlers
  contentArea.addEventListener("touchstart", handleTouchStart, { passive: true })
  contentArea.addEventListener("touchend", handleTouchEnd)

  window.addCleanup(() => {
    contentArea.removeEventListener("touchstart", handleTouchStart)
    contentArea.removeEventListener("touchend", handleTouchEnd)
  })
})
```

#### 3. Add Dark Mode Styles

**File**: `apps/site/quartz/components/styles/annotator.scss`
**Changes**: Add dark mode variable support

```scss
// Add at the top of the file
.annotator-container {
  // All existing styles...

  // Dark mode overrides
  @media (prefers-color-scheme: dark) {
    .annotation-modal-container .annotation-modal {
      .annotation-header,
      .annotation-content,
      .annotation-footer {
        border-color: var(--darkgray);
      }

      .selected-text-preview .preview-text {
        background: var(--darkgray);
      }

      .annotation-textarea {
        background: var(--darkgray);
        color: var(--light);
      }
    }

    .annotation-sidebar {
      .annotation-list .annotation-item {
        background: var(--darkgray);

        &:hover {
          background: var(--gray);
        }

        .annotation-text {
          background: var(--dark);
        }
      }
    }
  }
}
```

#### 4. Create Settings Panel

**File**: `apps/site/quartz/components/Annotator.tsx`
**Changes**: Add settings button and panel to component

```typescript
// Add to Annotator component JSX
return (
  <div class="annotator-container">
    {/* ... existing elements ... */}

    {/* Settings panel */}
    <div class="annotation-settings-panel">
      <div class="annotation-settings-header">
        <h3>Annotation Settings</h3>
        <button class="annotation-settings-close" aria-label="Close">×</button>
      </div>
      <div class="annotation-settings-content">
        <div class="setting-group">
          <label>
            <input type="checkbox" class="setting-auto-highlight" checked />
            <span>Auto-highlight on page load</span>
          </label>
        </div>
        <div class="setting-group">
          <label>
            <span>Highlight Color</span>
            <select class="setting-highlight-color">
              <option value="yellow">Yellow</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="pink">Pink</option>
            </select>
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" class="setting-show-count" checked />
            <span>Show annotation count badge</span>
          </label>
        </div>
      </div>
    </div>

    {/* Settings button */}
    <button class="annotation-settings-btn" title="Settings">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
      </svg>
    </button>
  </div>
)
```

#### 5. Implement Settings Logic

**File**: `apps/site/quartz/components/scripts/annotator.inline.ts`
**Changes**: Add settings persistence and application

```typescript
interface AnnotationSettings {
  autoHighlight: boolean
  highlightColor: string
  showCount: boolean
}

const DEFAULT_SETTINGS: AnnotationSettings = {
  autoHighlight: true,
  highlightColor: "yellow",
  showCount: true,
}

// Load settings
function loadSettings(): AnnotationSettings {
  try {
    const stored = localStorage.getItem("quartz-annotation-settings")
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
  } catch (e) {
    return DEFAULT_SETTINGS
  }
}

// Save settings
function saveSettings(settings: AnnotationSettings) {
  try {
    localStorage.setItem("quartz-annotation-settings", JSON.stringify(settings))
  } catch (e) {
    console.error("Failed to save settings:", e)
  }
}

// Apply settings to UI
function applySettings(settings: AnnotationSettings) {
  // Apply highlight color
  const marks = document.querySelectorAll("mark.annotation-highlight")
  marks.forEach((mark) => {
    mark.className = `annotation-highlight highlight-${settings.highlightColor}`
  })

  // Show/hide count badge
  const countBadge = document.querySelector(".annotation-count") as HTMLElement
  if (countBadge) {
    countBadge.style.display = settings.showCount ? "flex" : "none"
  }
}

// Toggle settings panel
function toggleSettingsPanel(panel: HTMLElement, open?: boolean) {
  const isOpen = open !== undefined ? open : !panel.classList.contains("open")
  panel.classList.toggle("open", isOpen)
}

// Wire up settings in nav listener
document.addEventListener("nav", () => {
  // ... existing code ...

  const settingsPanel = container.querySelector(".annotation-settings-panel") as HTMLElement
  const settingsBtn = container.querySelector(".annotation-settings-btn") as HTMLElement
  const settingsCloseBtn = settingsPanel?.querySelector(".annotation-settings-close") as HTMLElement

  if (settingsPanel && settingsBtn) {
    const settings = loadSettings()

    // Populate settings UI
    const autoHighlightCheckbox = settingsPanel.querySelector(".setting-auto-highlight") as HTMLInputElement
    const highlightColorSelect = settingsPanel.querySelector(".setting-highlight-color") as HTMLSelectElement
    const showCountCheckbox = settingsPanel.querySelector(".setting-show-count") as HTMLInputElement

    if (autoHighlightCheckbox) autoHighlightCheckbox.checked = settings.autoHighlight
    if (highlightColorSelect) highlightColorSelect.value = settings.highlightColor
    if (showCountCheckbox) showCountCheckbox.checked = settings.showCount

    // Apply settings
    applySettings(settings)

    // Settings change handlers
    autoHighlightCheckbox?.addEventListener("change", () => {
      settings.autoHighlight = autoHighlightCheckbox.checked
      saveSettings(settings)
    })

    highlightColorSelect?.addEventListener("change", () => {
      settings.highlightColor = highlightColorSelect.value
      saveSettings(settings)
      applySettings(settings)
    })

    showCountCheckbox?.addEventListener("change", () => {
      settings.showCount = showCountCheckbox.checked
      saveSettings(settings)
      applySettings(settings)
    })

    // Toggle settings panel
    settingsBtn.addEventListener("click", () => toggleSettingsPanel(settingsPanel))
    settingsCloseBtn?.addEventListener("click", () => toggleSettingsPanel(settingsPanel, false))

    window.addCleanup(() => {
      settingsBtn.removeEventListener("click", () => toggleSettingsPanel(settingsPanel))
      settingsCloseBtn?.removeEventListener("click", () => toggleSettingsPanel(settingsPanel, false))
    })
  }

  // Apply auto-highlight setting
  const settings = loadSettings()
  if (settings.autoHighlight) {
    setTimeout(() => {
      applyAllHighlights(contentArea)
    }, 100)
  }
})
```

#### 6. Add Settings Panel Styles

**File**: `apps/site/quartz/components/styles/annotator.scss`
**Changes**: Add settings panel styles

```scss
.annotation-settings-panel {
  position: fixed;
  right: -350px;
  bottom: 100px;
  width: 350px;
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 998;
  transition: right 0.3s ease;

  &.open {
    right: 2rem;
  }

  @media all and ($mobile) {
    right: -100vw;
    bottom: 80px;
    width: calc(100vw - 2rem);

    &.open {
      right: 1rem;
    }
  }

  .annotation-settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--lightgray);

    h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .annotation-settings-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--gray);

      &:hover {
        color: var(--dark);
      }
    }
  }

  .annotation-settings-content {
    padding: 1rem;

    .setting-group {
      margin-bottom: 1rem;

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;

        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        select {
          margin-left: auto;
          padding: 0.25rem 0.5rem;
          border: 1px solid var(--lightgray);
          border-radius: 4px;
          background: var(--light);
          color: var(--dark);
          cursor: pointer;
        }

        span {
          flex: 1;
        }
      }
    }
  }
}

.annotation-settings-btn {
  position: fixed;
  right: 2rem;
  bottom: 8rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--lightgray);
  color: var(--dark);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 997;

  &:hover {
    transform: scale(1.05);
    background: var(--gray);
  }

  @media all and ($mobile) {
    right: 1rem;
    bottom: 6rem;
    width: 40px;
    height: 40px;
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] Site builds successfully: `npx quartz build`
- [ ] No console warnings or errors

#### Manual Verification:
- [ ] Ctrl/Cmd + Shift + A toggles sidebar
- [ ] Ctrl/Cmd + Shift + E exports annotations
- [ ] Touch selection works on mobile devices
- [ ] Settings button opens settings panel
- [ ] Can change highlight color and see immediate effect
- [ ] Can toggle auto-highlight and setting persists
- [ ] Can toggle count badge visibility
- [ ] Settings persist after page refresh
- [ ] All UI elements are accessible via keyboard
- [ ] Dark mode styles work correctly for all components
- [ ] Annotation components don't interfere with page scrolling
- [ ] Performance is smooth with 50+ annotations on page
- [ ] Mobile layout is responsive and touch-friendly
- [ ] Accessibility: Screen readers can navigate annotation UI
- [ ] All buttons have proper ARIA labels

---

## Testing Strategy

### Unit Testing (Manual)
Since Quartz doesn't have a built-in test framework, testing will be manual:

1. **localStorage operations**:
   - Create, read, update, delete annotations
   - Test quota exceeded scenario
   - Test corrupted data recovery

2. **Text range calculation**:
   - Simple selections
   - Multi-paragraph selections
   - Selections within code blocks
   - Selections in tables

3. **Highlighting logic**:
   - Single annotation
   - Multiple annotations
   - Overlapping annotations
   - Invalid/outdated annotations

### Integration Testing (Manual)

1. **SPA navigation**:
   - Create annotation, navigate away, return
   - Verify highlights reapply
   - Verify no memory leaks

2. **Component interactions**:
   - Modal + sidebar open at same time
   - Settings changes affect visible highlights
   - Export while editing annotation

3. **Cross-browser testing**:
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari
   - Mobile browsers (iOS Safari, Chrome Mobile)

### Manual Test Scenarios

**Scenario 1: Basic Annotation Flow**
1. Load page with content
2. Select text (desktop: mouse drag, mobile: long press)
3. Click annotation button
4. Enter note in modal
5. Save annotation
6. Verify highlight appears
7. Refresh page
8. Verify highlight persists

**Scenario 2: Annotation Management**
1. Create 3 annotations
2. Open sidebar
3. Click annotation item to scroll to highlight
4. Edit one annotation
5. Delete one annotation
6. Export annotations to Markdown
7. Clear all annotations

**Scenario 3: Edge Cases**
1. Select text across multiple paragraphs
2. Select text in code block
3. Select text in callout
4. Create annotation with empty note
5. Edit content after creating annotation
6. Verify annotation handles content changes gracefully

**Scenario 4: Mobile Experience**
1. Test on iOS Safari
2. Long press to select text
3. Create annotation via touch
4. Open sidebar (full-screen on mobile)
5. Verify all interactions work with touch

**Scenario 5: Dark Mode**
1. Toggle dark mode
2. Verify all annotation UI elements are visible
3. Verify highlight color works in dark mode
4. Verify modal and sidebar styling

### Performance Testing

**Test with large annotation sets:**
1. Create 50 annotations on single page
2. Measure time to apply highlights (should be < 500ms)
3. Test sidebar scrolling performance
4. Test page navigation performance

**localStorage limits:**
1. Create annotations until approaching quota
2. Verify error handling
3. Test export as workaround

## Performance Considerations

### Optimization Strategies

1. **Debounce text selection**: Don't show button until user stops moving mouse/touch
2. **Lazy highlight rendering**: Use IntersectionObserver to only highlight visible content
3. **Efficient DOM operations**: Batch DOM updates when applying multiple highlights
4. **localStorage optimization**: Compress annotation data if approaching quota
5. **Memoization**: Cache text position calculations for performance

### Potential Bottlenecks

1. **Large documents**: Pages with 10,000+ words may be slow to highlight
   - **Solution**: Only highlight annotations in viewport

2. **Many annotations**: 100+ annotations on single page could impact load time
   - **Solution**: Paginate annotation list, lazy-load highlights

3. **Complex selections**: Selections spanning many nodes are slow to calculate
   - **Solution**: Limit maximum selection length (e.g., 1000 characters)

## Migration & Rollback

### Data Migration
If annotation schema changes in future:
1. Check `version` field in stored data
2. Run migration function to update schema
3. Save migrated data with new version number

### Rollback Strategy
If feature needs to be disabled:
1. Remove `Component.Annotator()` from `quartz.layout.ts`
2. User data remains in localStorage (not deleted)
3. Can be re-enabled by adding component back

### Data Portability
Users can export annotations at any time:
- JSON format: Machine-readable, can be re-imported in future
- Markdown format: Human-readable, works in any text editor

## Security Considerations

1. **XSS Prevention**:
   - All user input is escaped via `escapeHtml()` function
   - No `innerHTML` with user content, only `textContent`

2. **localStorage limits**:
   - Handle quota exceeded gracefully
   - No sensitive data stored (all annotations are user's own notes)

3. **Privacy**:
   - All data stored locally in browser
   - No network requests except for page navigation
   - User controls all data (export/delete)

## References

### Research Documents
- `thoughts/shared/research/2025-10-10_16-56-19_markdown-annotation-github-issues.md` - Original research

### Quartz Documentation
- Component architecture: `apps/site/quartz/components/types.ts`
- SPA navigation: Custom "nav" event system
- Cleanup: `window.addCleanup()` pattern

### Similar Implementations
- Search modal: `apps/site/quartz/components/Search.tsx:1`
- Popover positioning: `apps/site/quartz/components/scripts/popover.inline.ts:8-115`
- localStorage persistence: `apps/site/quartz/components/scripts/checkbox.inline.ts:1`
- Modal utilities: `apps/site/quartz/components/scripts/util.ts:1-20`

### External Libraries Used
- **Floating UI**: Already included, used for annotation button positioning
- **No additional dependencies required**

---

**Plan Status**: Draft - Ready for review and implementation

**Next Steps**:
1. Review plan with stakeholders
2. Begin Phase 1 implementation
3. Test each phase before proceeding to next
4. Iterate based on user feedback
