export type HighlightClickHandler = (
  annotationId: string,
  element: HTMLElement
) => void;

/**
 * Create a highlight element wrapping the given range
 */
export function createHighlight(
  range: Range,
  annotationId: string,
  onClick: HighlightClickHandler
): HTMLElement | null {
  try {
    const highlight = document.createElement("mark");
    highlight.className = "air-highlight";
    highlight.dataset.annotationId = annotationId;

    // Handle simple case where selection is within a single text node
    if (
      range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE
    ) {
      range.surroundContents(highlight);
    } else {
      // For complex selections spanning multiple nodes, extract and wrap
      const contents = range.extractContents();
      highlight.appendChild(contents);
      range.insertNode(highlight);
    }

    // Add click handler for editing
    highlight.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick(annotationId, highlight);
    });

    return highlight;
  } catch (err) {
    console.warn("AI Inline Reply: Could not create highlight", err);
    return null;
  }
}

/**
 * Remove a highlight element while preserving its text content
 */
export function removeHighlight(highlightEl: HTMLElement): void {
  const parent = highlightEl.parentNode;
  if (!parent) {
    return;
  }

  // Move all children out before removing the highlight
  while (highlightEl.firstChild) {
    parent.insertBefore(highlightEl.firstChild, highlightEl);
  }
  parent.removeChild(highlightEl);
}
