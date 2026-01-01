export interface PopoverCallbacks {
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

let popoverEl: HTMLElement | null = null;

// Inline SVG icons
const ICONS = {
  save: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 4.5H13.5M5.5 4.5V3C5.5 2.44772 5.94772 2 6.5 2H9.5C10.0523 2 10.5 2.44772 10.5 3V4.5M12.5 4.5V13C12.5 13.5523 12.0523 14 11.5 14H4.5C3.94772 14 3.5 13.5523 3.5 13V4.5H12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

export function createPopover(callbacks: PopoverCallbacks): HTMLElement {
  popoverEl = document.createElement("div");
  popoverEl.id = "air-popover";
  popoverEl.innerHTML = `
    <div class="air-popover-header">
      <span class="air-popover-title">Add feedback</span>
      <button id="air-cancel-btn" class="air-popover-close" title="Close">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="air-popover-preview" id="air-preview"></div>
    <textarea id="air-reply-input" placeholder="What should change?"></textarea>
    <div class="air-popover-actions">
      <button id="air-delete-btn" class="air-btn air-btn-danger" style="display: none;">
        ${ICONS.trash}
        <span>Delete</span>
      </button>
      <div class="air-popover-actions-right">
        <button id="air-save-btn" class="air-btn air-btn-primary">
          ${ICONS.save}
          <span>Save</span>
        </button>
      </div>
    </div>
  `;
  popoverEl.style.display = "none";
  document.body.appendChild(popoverEl);

  popoverEl
    .querySelector("#air-cancel-btn")
    ?.addEventListener("click", callbacks.onCancel);

  popoverEl
    .querySelector("#air-save-btn")
    ?.addEventListener("click", callbacks.onSave);

  popoverEl
    .querySelector("#air-delete-btn")
    ?.addEventListener("click", callbacks.onDelete);

  return popoverEl;
}

export function showPopover(
  x: number,
  y: number,
  selectedText: string,
  existingReply?: string,
  showDelete = false
): void {
  if (!popoverEl) {
    return;
  }

  popoverEl.dataset.selectedText = selectedText;
  popoverEl.style.left = `${x}px`;
  popoverEl.style.top = `${y + 10}px`;
  popoverEl.style.display = "block";

  // Update preview with truncated selected text
  const previewEl = popoverEl.querySelector("#air-preview") as HTMLElement;
  if (previewEl) {
    const truncated =
      selectedText.length > 60
        ? `${selectedText.slice(0, 60)}...`
        : selectedText;
    previewEl.textContent = `"${truncated}"`;
  }

  // Update title based on context
  const titleEl = popoverEl.querySelector(".air-popover-title") as HTMLElement;
  if (titleEl) {
    titleEl.textContent = existingReply ? "Edit feedback" : "Add feedback";
  }

  const input = popoverEl.querySelector(
    "#air-reply-input"
  ) as HTMLTextAreaElement;
  const deleteBtn = popoverEl.querySelector("#air-delete-btn") as HTMLElement;

  if (input) {
    input.value = existingReply || "";
    input.focus();
  }

  if (deleteBtn) {
    deleteBtn.style.display = showDelete ? "flex" : "none";
  }
}

export function hidePopover(): void {
  if (popoverEl) {
    popoverEl.style.display = "none";
  }
}

export function getPopoverSelectedText(): string {
  return popoverEl?.dataset.selectedText || "";
}

export function getPopoverReplyValue(): string {
  const input = popoverEl?.querySelector(
    "#air-reply-input"
  ) as HTMLTextAreaElement;
  return input?.value.trim() || "";
}

export function isPopoverVisible(): boolean {
  return popoverEl?.style.display === "block";
}

export function popoverContains(node: Node): boolean {
  return popoverEl?.contains(node) ?? false;
}
