export interface PopoverCallbacks {
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

let popoverEl: HTMLElement | null = null;

export function createPopover(callbacks: PopoverCallbacks): HTMLElement {
  popoverEl = document.createElement("div");
  popoverEl.id = "air-popover";
  popoverEl.innerHTML = `
    <textarea id="air-reply-input" placeholder="Add your reply..."></textarea>
    <div class="air-popover-actions">
      <button id="air-delete-btn" style="display: none;">Delete</button>
      <button id="air-cancel-btn">Cancel</button>
      <button id="air-save-btn">Save Reply</button>
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

  const input = popoverEl.querySelector(
    "#air-reply-input"
  ) as HTMLTextAreaElement;
  const deleteBtn = popoverEl.querySelector("#air-delete-btn") as HTMLElement;

  if (input) {
    input.value = existingReply || "";
    input.focus();
  }

  if (deleteBtn) {
    deleteBtn.style.display = showDelete ? "block" : "none";
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
