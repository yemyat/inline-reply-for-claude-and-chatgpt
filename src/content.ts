interface Annotation {
  id: string;
  selectedText: string;
  reply: string;
  timestamp: number;
  highlightEl?: HTMLElement;
}

class InlineReplyManager {
  private annotations: Annotation[] = [];
  private popover: HTMLElement | null = null;
  private toolbar: HTMLElement | null = null;
  private currentRange: Range | null = null;
  private editingAnnotationId: string | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.createPopover();
    this.createToolbar();
    this.setupSelectionListener();
    console.log('AI Inline Reply: Initialized');
  }

  private createPopover(): void {
    this.popover = document.createElement('div');
    this.popover.id = 'air-popover';
    this.popover.innerHTML = `
      <textarea id="air-reply-input" placeholder="Add your reply..."></textarea>
      <div class="air-popover-actions">
        <button id="air-delete-btn" style="display: none;">Delete</button>
        <button id="air-cancel-btn">Cancel</button>
        <button id="air-save-btn">Save Reply</button>
      </div>
    `;
    this.popover.style.display = 'none';
    document.body.appendChild(this.popover);

    // Event listeners
    this.popover.querySelector('#air-cancel-btn')?.addEventListener('click', () => {
      this.hidePopover();
    });

    this.popover.querySelector('#air-save-btn')?.addEventListener('click', () => {
      this.saveCurrentReply();
    });

    this.popover.querySelector('#air-delete-btn')?.addEventListener('click', () => {
      this.deleteCurrentAnnotation();
    });
  }

  private createToolbar(): void {
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'air-toolbar';
    this.toolbar.innerHTML = `
      <span id="air-count">0 replies</span>
      <button id="air-compile-btn">Compile Prompt</button>
      <button id="air-clear-btn">Clear All</button>
    `;
    document.body.appendChild(this.toolbar);

    this.toolbar.querySelector('#air-compile-btn')?.addEventListener('click', () => {
      this.compilePrompt();
    });

    this.toolbar.querySelector('#air-clear-btn')?.addEventListener('click', () => {
      this.clearAnnotations();
    });

    this.updateToolbar();
  }

  private setupSelectionListener(): void {
    document.addEventListener('mouseup', (e) => {
      // Small delay to let selection finalize
      setTimeout(() => this.handleSelection(e), 10);
    });

    // Hide popover when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (this.popover && !this.popover.contains(e.target as Node)) {
        this.hidePopover();
      }
    });
  }

  private handleSelection(e: MouseEvent): void {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) return;

    // Check if selection is within an AI response
    if (!this.isWithinAIResponse(selection)) return;

    // Store the range for later highlighting
    this.currentRange = selection.getRangeAt(0).cloneRange();
    this.showPopover(e.clientX, e.clientY, selectedText);
  }

  private isWithinAIResponse(selection: Selection): boolean {
    const anchorNode = selection.anchorNode;
    if (!anchorNode) return false;

    const element = anchorNode.parentElement;
    if (!element) return false;

    // ChatGPT selectors
    const chatGptResponse = element.closest('[data-message-author-role="assistant"]');
    // Claude selectors (found via DOM inspection)
    const claudeResponse = element.closest('.font-claude-response') ||
                          element.closest('[data-is-streaming]');

    return !!(chatGptResponse || claudeResponse);
  }

  private showPopover(x: number, y: number, selectedText: string, existingReply?: string): void {
    if (!this.popover) return;

    this.popover.dataset.selectedText = selectedText;
    this.popover.style.left = `${x}px`;
    this.popover.style.top = `${y + 10}px`;
    this.popover.style.display = 'block';

    const input = this.popover.querySelector('#air-reply-input') as HTMLTextAreaElement;
    const deleteBtn = this.popover.querySelector('#air-delete-btn') as HTMLElement;

    if (input) {
      input.value = existingReply || '';
      input.focus();
    }

    // Show delete button only when editing
    if (deleteBtn) {
      deleteBtn.style.display = this.editingAnnotationId ? 'block' : 'none';
    }
  }

  private hidePopover(): void {
    if (this.popover) {
      this.popover.style.display = 'none';
    }
    this.editingAnnotationId = null;
    this.currentRange = null;
  }

  private saveCurrentReply(): void {
    if (!this.popover) return;

    const selectedText = this.popover.dataset.selectedText || '';
    const input = this.popover.querySelector('#air-reply-input') as HTMLTextAreaElement;
    const reply = input?.value.trim();

    if (!reply) return;

    // Editing existing annotation
    if (this.editingAnnotationId) {
      const annotation = this.annotations.find(a => a.id === this.editingAnnotationId);
      if (annotation) {
        annotation.reply = reply;
        annotation.timestamp = Date.now();
        console.log('AI Inline Reply: Updated annotation', annotation);
      }
      this.hidePopover();
      this.updateToolbar();
      return;
    }

    // Creating new annotation with highlight
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      selectedText,
      reply,
      timestamp: Date.now()
    };

    // Create highlight element
    if (this.currentRange) {
      const highlightEl = this.createHighlight(this.currentRange, annotation.id);
      if (highlightEl) {
        annotation.highlightEl = highlightEl;
      }
    }

    this.annotations.push(annotation);
    this.updateToolbar();
    this.hidePopover();

    // Clear selection after saving
    window.getSelection()?.removeAllRanges();

    console.log('AI Inline Reply: Saved annotation', annotation);
  }

  private createHighlight(range: Range, annotationId: string): HTMLElement | null {
    try {
      const highlight = document.createElement('mark');
      highlight.className = 'air-highlight';
      highlight.dataset.annotationId = annotationId;

      // Handle simple case where selection is within a single text node
      if (range.startContainer === range.endContainer &&
          range.startContainer.nodeType === Node.TEXT_NODE) {
        range.surroundContents(highlight);
      } else {
        // For complex selections spanning multiple nodes, extract and wrap
        const contents = range.extractContents();
        highlight.appendChild(contents);
        range.insertNode(highlight);
      }

      // Add click handler for editing
      highlight.addEventListener('click', (e) => {
        e.stopPropagation();
        this.editAnnotation(annotationId, highlight);
      });

      return highlight;
    } catch (err) {
      console.warn('AI Inline Reply: Could not create highlight', err);
      return null;
    }
  }

  private editAnnotation(annotationId: string, highlightEl: HTMLElement): void {
    const annotation = this.annotations.find(a => a.id === annotationId);
    if (!annotation) return;

    this.editingAnnotationId = annotationId;

    const rect = highlightEl.getBoundingClientRect();
    this.showPopover(rect.left, rect.bottom, annotation.selectedText, annotation.reply);
  }

  private deleteCurrentAnnotation(): void {
    if (!this.editingAnnotationId) return;

    const annotation = this.annotations.find(a => a.id === this.editingAnnotationId);
    if (annotation?.highlightEl) {
      // Remove highlight but keep the text
      const parent = annotation.highlightEl.parentNode;
      if (parent) {
        while (annotation.highlightEl.firstChild) {
          parent.insertBefore(annotation.highlightEl.firstChild, annotation.highlightEl);
        }
        parent.removeChild(annotation.highlightEl);
      }
    }

    this.annotations = this.annotations.filter(a => a.id !== this.editingAnnotationId);
    this.updateToolbar();
    this.hidePopover();

    console.log('AI Inline Reply: Deleted annotation', this.editingAnnotationId);
  }

  private updateToolbar(): void {
    const count = this.annotations.length;
    const countEl = this.toolbar?.querySelector('#air-count');
    if (countEl) {
      countEl.textContent = `${count} ${count === 1 ? 'reply' : 'replies'}`;
    }

    if (this.toolbar) {
      this.toolbar.classList.toggle('has-replies', count > 0);
    }
  }

  private compilePrompt(): void {
    if (this.annotations.length === 0) {
      alert('No replies to compile. Select text and add replies first.');
      return;
    }

    let prompt = 'I have specific feedback on your response:\n\n';

    this.annotations.forEach((ann, index) => {
      prompt += `${index + 1}. Regarding: "${ann.selectedText}"\n`;
      prompt += `   My reply: ${ann.reply}\n\n`;
    });

    prompt += 'Please address each point above.';

    // Try to insert directly into the chat input
    const inserted = this.insertIntoTextarea(prompt);

    if (inserted) {
      console.log('AI Inline Reply: Inserted prompt into textarea');
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(prompt).then(() => {
        alert('Prompt copied to clipboard! Paste it into the chat.');
      });
      console.log('AI Inline Reply: Copied prompt to clipboard');
    }
  }

  private insertIntoTextarea(text: string): boolean {
    // Claude's contenteditable input
    const claudeInput = document.querySelector('[contenteditable="true"].ProseMirror') as HTMLElement;
    if (claudeInput) {
      // ProseMirror needs separate <p> tags for each line
      claudeInput.innerHTML = '';
      const lines = text.split('\n');
      lines.forEach(line => {
        const p = document.createElement('p');
        if (line.trim() === '') {
          // Empty line needs a <br> to render
          p.innerHTML = '<br>';
        } else {
          p.textContent = line;
        }
        claudeInput.appendChild(p);
      });
      // Trigger input event for React to pick up
      claudeInput.dispatchEvent(new Event('input', { bubbles: true }));
      claudeInput.focus();
      return true;
    }

    // ChatGPT's textarea
    const chatGptInput = document.querySelector('#prompt-textarea') as HTMLTextAreaElement;
    if (chatGptInput) {
      chatGptInput.value = text;
      chatGptInput.dispatchEvent(new Event('input', { bubbles: true }));
      chatGptInput.focus();
      return true;
    }

    return false;
  }

  private clearAnnotations(): void {
    // Remove all highlights from DOM
    this.annotations.forEach(annotation => {
      if (annotation.highlightEl) {
        const parent = annotation.highlightEl.parentNode;
        if (parent) {
          while (annotation.highlightEl.firstChild) {
            parent.insertBefore(annotation.highlightEl.firstChild, annotation.highlightEl);
          }
          parent.removeChild(annotation.highlightEl);
        }
      }
    });

    this.annotations = [];
    this.updateToolbar();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new InlineReplyManager());
} else {
  new InlineReplyManager();
}
