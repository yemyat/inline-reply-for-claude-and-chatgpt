export interface ToolbarCallbacks {
  onCompile: () => void;
  onClear: () => void;
}

let toolbarEl: HTMLElement | null = null;

// Inline SVG icons (16x16)
const ICONS = {
  send: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  clear: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  comment: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H12.5C13.0523 2.5 13.5 2.94772 13.5 3.5V10.5C13.5 11.0523 13.0523 11.5 12.5 11.5H5L2.5 14V3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

export function createToolbar(callbacks: ToolbarCallbacks): HTMLElement {
  toolbarEl = document.createElement("div");
  toolbarEl.id = "air-toolbar";
  toolbarEl.innerHTML = `
    <div class="air-toolbar-left">
      ${ICONS.comment}
      <span id="air-count">No comments</span>
    </div>
    <div class="air-toolbar-actions">
      <button id="air-clear-btn" class="air-btn air-btn-ghost" title="Clear all comments">
        ${ICONS.clear}
        <span>Clear</span>
      </button>
      <button id="air-compile-btn" class="air-btn air-btn-primary" title="Insert feedback into chat">
        ${ICONS.send}
        <span>Insert</span>
      </button>
    </div>
  `;
  document.body.appendChild(toolbarEl);

  toolbarEl
    .querySelector("#air-compile-btn")
    ?.addEventListener("click", callbacks.onCompile);

  toolbarEl
    .querySelector("#air-clear-btn")
    ?.addEventListener("click", callbacks.onClear);

  updateToolbar(0);

  return toolbarEl;
}

export function updateToolbar(count: number): void {
  const countEl = toolbarEl?.querySelector("#air-count");
  if (countEl) {
    if (count === 0) {
      countEl.textContent = "No comments";
    } else if (count === 1) {
      countEl.textContent = "1 comment";
    } else {
      countEl.textContent = `${count} comments`;
    }
  }

  if (toolbarEl) {
    toolbarEl.classList.toggle("has-replies", count > 0);
  }
}
