import {
  addAnnotation,
  clearAnnotations,
  deleteAnnotation,
  getAnnotationById,
  getAnnotationCount,
  getAnnotations,
  updateAnnotation,
} from "./state";
import type { Annotation } from "./types";
import { createHighlight, removeHighlight } from "./ui/highlight";
import {
  createPopover,
  getPopoverReplyValue,
  getPopoverSelectedText,
  hidePopover,
  popoverContains,
  showPopover,
} from "./ui/popover";
import { createToolbar, updateToolbar } from "./ui/toolbar";
import { insertIntoTextarea, isWithinAIResponse } from "./utils/dom";
import { showToast } from "./utils/toast";

export class InlineReplyManager {
  private currentRange: Range | null = null;
  private editingAnnotationId: string | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    createPopover({
      onSave: () => this.saveReply(),
      onDelete: () => this.deleteCurrentAnnotation(),
      onCancel: () => this.cancelEdit(),
    });

    createToolbar({
      onCompile: () => this.compilePrompt(),
      onClear: () => this.clearAll(),
    });

    this.setupSelectionListener();
    console.log("AI Inline Reply: Initialized");
  }

  private setupSelectionListener(): void {
    document.addEventListener("mouseup", (e) => {
      setTimeout(() => this.handleSelection(e), 10);
    });

    document.addEventListener("mousedown", (e) => {
      if (!popoverContains(e.target as Node)) {
        this.cancelEdit();
      }
    });
  }

  private handleSelection(e: MouseEvent): void {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) {
      return;
    }

    if (!isWithinAIResponse(selection)) {
      return;
    }

    this.currentRange = selection.getRangeAt(0).cloneRange();
    showPopover(e.clientX, e.clientY, selectedText);
  }

  private saveReply(): void {
    const selectedText = getPopoverSelectedText();
    const reply = getPopoverReplyValue();

    if (!reply) {
      return;
    }

    // Editing existing annotation
    if (this.editingAnnotationId) {
      updateAnnotation(this.editingAnnotationId, {
        reply,
        timestamp: Date.now(),
      });
      console.log(
        "AI Inline Reply: Updated annotation",
        this.editingAnnotationId
      );
      this.cancelEdit();
      updateToolbar(getAnnotationCount());
      return;
    }

    // Creating new annotation
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      selectedText,
      reply,
      timestamp: Date.now(),
    };

    // Create highlight element
    if (this.currentRange) {
      const highlightEl = createHighlight(
        this.currentRange,
        annotation.id,
        (id, el) => this.editAnnotation(id, el)
      );
      if (highlightEl) {
        annotation.highlightEl = highlightEl;
      }
    }

    addAnnotation(annotation);
    updateToolbar(getAnnotationCount());
    this.cancelEdit();

    // Clear selection after saving
    window.getSelection()?.removeAllRanges();

    console.log("AI Inline Reply: Saved annotation", annotation);
  }

  private editAnnotation(annotationId: string, highlightEl: HTMLElement): void {
    const annotation = getAnnotationById(annotationId);
    if (!annotation) {
      return;
    }

    this.editingAnnotationId = annotationId;

    const rect = highlightEl.getBoundingClientRect();
    showPopover(
      rect.left,
      rect.bottom,
      annotation.selectedText,
      annotation.reply,
      true
    );
  }

  private deleteCurrentAnnotation(): void {
    if (!this.editingAnnotationId) {
      return;
    }

    const annotation = deleteAnnotation(this.editingAnnotationId);
    if (annotation?.highlightEl) {
      removeHighlight(annotation.highlightEl);
    }

    console.log(
      "AI Inline Reply: Deleted annotation",
      this.editingAnnotationId
    );
    this.cancelEdit();
    updateToolbar(getAnnotationCount());
  }

  private cancelEdit(): void {
    hidePopover();
    this.editingAnnotationId = null;
    this.currentRange = null;
  }

  private compilePrompt(): void {
    const annotations = getAnnotations();
    if (annotations.length === 0) {
      showToast(
        "No replies to compile. Select text and add replies first.",
        "error"
      );
      return;
    }

    let prompt = "I have specific feedback on your response:\n\n";

    for (const [index, ann] of annotations.entries()) {
      prompt += `${index + 1}. Regarding: "${ann.selectedText}"\n`;
      prompt += `   My reply: ${ann.reply}\n\n`;
    }

    prompt += "Please address each point above.";

    const inserted = insertIntoTextarea(prompt);

    if (inserted) {
      console.log("AI Inline Reply: Inserted prompt into textarea");
    } else {
      navigator.clipboard.writeText(prompt).then(() => {
        showToast("Prompt copied to clipboard!", "success");
      });
      console.log("AI Inline Reply: Copied prompt to clipboard");
    }
  }

  private clearAll(): void {
    const removed = clearAnnotations();
    for (const annotation of removed) {
      if (annotation.highlightEl) {
        removeHighlight(annotation.highlightEl);
      }
    }
    updateToolbar(0);
  }
}
