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
