export interface ToolbarCallbacks {
  onCompile: () => void;
  onClear: () => void;
}

let toolbarEl: HTMLElement | null = null;

export function createToolbar(callbacks: ToolbarCallbacks): HTMLElement {
  toolbarEl = document.createElement("div");
  toolbarEl.id = "air-toolbar";
  toolbarEl.innerHTML = `
    <span id="air-count">0 replies</span>
    <button id="air-compile-btn">Compile Prompt</button>
    <button id="air-clear-btn">Clear All</button>
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
    countEl.textContent = `${count} ${count === 1 ? "reply" : "replies"}`;
  }

  if (toolbarEl) {
    toolbarEl.classList.toggle("has-replies", count > 0);
  }
}
