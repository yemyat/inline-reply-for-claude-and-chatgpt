interface Annotation {
  id: string;
  selectedText: string;
  reply: string;
  timestamp: number;
}

class InlineReplyManager {
  private annotations: Annotation[] = [];
  private popover: HTMLElement | null = null;
  private toolbar: HTMLElement | null = null;

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

  private showPopover(x: number, y: number, selectedText: string): void {
    if (!this.popover) return;

    this.popover.dataset.selectedText = selectedText;
    this.popover.style.left = `${x}px`;
    this.popover.style.top = `${y + 10}px`;
    this.popover.style.display = 'block';

    const input = this.popover.querySelector('#air-reply-input') as HTMLTextAreaElement;
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  private hidePopover(): void {
    if (this.popover) {
      this.popover.style.display = 'none';
    }
  }

  private saveCurrentReply(): void {
    if (!this.popover) return;

    const selectedText = this.popover.dataset.selectedText || '';
    const input = this.popover.querySelector('#air-reply-input') as HTMLTextAreaElement;
    const reply = input?.value.trim();

    if (!reply) return;

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      selectedText,
      reply,
      timestamp: Date.now()
    };

    this.annotations.push(annotation);
    this.updateToolbar();
    this.hidePopover();

    console.log('AI Inline Reply: Saved annotation', annotation);
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

    // Copy to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
      alert('Prompt copied to clipboard! Paste it into the chat.');
    });

    console.log('AI Inline Reply: Compiled prompt', prompt);
  }

  private clearAnnotations(): void {
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
