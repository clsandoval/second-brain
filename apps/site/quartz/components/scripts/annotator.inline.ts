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

const STORAGE_VERSION = 1

interface StorageData {
  version: number
  annotations: Annotation[]
}

let currentSelection: Selection | null = null
let currentRange: Range | null = null

// Get storage key for current page
function getStorageKey(): string {
  return `quartz-annotations-${getFullSlug(window)}`
}

// Load annotations from localStorage with migration support
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

// Save annotations to localStorage
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

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

// Handle click on highlighted text
function handleHighlightClick(e: Event) {
  const target = e.target as HTMLElement
  if (!target.classList.contains("annotation-highlight")) return

  const annotationId = target.dataset.annotationId
  if (!annotationId) return

  const annotation = getAnnotationById(annotationId)
  if (!annotation) return

  // Scroll to and flash the annotation
  scrollToAnnotation(annotationId)
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

  // Handle cancel
  function handleCancelAnnotation() {
    closeAnnotationModal(modal)
    currentSelection = null
    currentRange = null
  }

  // Sidebar elements
  const sidebar = container.querySelector(".annotation-sidebar") as HTMLElement
  const toggleBtn = container.querySelector(".annotation-toggle") as HTMLElement
  const sidebarCloseBtn = sidebar?.querySelector(".annotation-sidebar-close") as HTMLElement
  const exportBtn = sidebar?.querySelector(".annotation-export") as HTMLElement
  const clearAllBtn = sidebar?.querySelector(".annotation-clear-all") as HTMLElement

  // Event listeners
  contentArea.addEventListener("mouseup", handleTextSelection)
  contentArea.addEventListener("touchend", handleTextSelection)
  contentArea.addEventListener("click", handleHighlightClick)
  button.addEventListener("click", handleAnnotationButtonClick)
  saveBtn.addEventListener("click", handleSaveAnnotation)
  cancelBtn.addEventListener("click", handleCancelAnnotation)
  closeBtn.addEventListener("click", handleCancelAnnotation)

  // Sidebar event listeners
  function handleToggleSidebar() {
    if (sidebar) toggleSidebar(sidebar)
  }

  function handleCloseSidebar() {
    if (sidebar) toggleSidebar(sidebar, false)
  }

  function handleExport() {
    const format = confirm("Export as Markdown? (Cancel for JSON)") ? "markdown" : "json"
    downloadAnnotations(format)
  }

  function handleClearAll() {
    const count = loadAnnotations().length
    if (!confirm(`Are you sure you want to delete all ${count} annotations on this page?`)) return

    if (deleteAllAnnotations()) {
      renderAnnotationList(sidebar)
      applyAllHighlights(contentArea)
    }
  }

  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener("click", handleToggleSidebar)
    sidebarCloseBtn?.addEventListener("click", handleCloseSidebar)
    exportBtn?.addEventListener("click", handleExport)
    clearAllBtn?.addEventListener("click", handleClearAll)
  }

  // Register escape handler for modal
  registerEscapeHandler(modal, () => {
    if (modal.classList.contains("active")) {
      handleCancelAnnotation()
    }
  })

  // Apply highlights on page load
  setTimeout(() => {
    applyAllHighlights(contentArea)
  }, 100) // Small delay to ensure content is fully rendered

  // Cleanup
  window.addCleanup(() => {
    contentArea.removeEventListener("mouseup", handleTextSelection)
    contentArea.removeEventListener("touchend", handleTextSelection)
    contentArea.removeEventListener("click", handleHighlightClick)
    button.removeEventListener("click", handleAnnotationButtonClick)
    saveBtn.removeEventListener("click", handleSaveAnnotation)
    cancelBtn.removeEventListener("click", handleCancelAnnotation)
    closeBtn.removeEventListener("click", handleCancelAnnotation)

    if (sidebar && toggleBtn) {
      toggleBtn.removeEventListener("click", handleToggleSidebar)
      sidebarCloseBtn?.removeEventListener("click", handleCloseSidebar)
      exportBtn?.removeEventListener("click", handleExport)
      clearAllBtn?.removeEventListener("click", handleClearAll)
    }
  })

  // Initialize count and highlights
  updateAnnotationCount()
})
