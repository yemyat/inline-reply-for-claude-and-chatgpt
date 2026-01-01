/**
 * Check if a selection is within an AI response (Claude or ChatGPT)
 */
export function isWithinAIResponse(selection: Selection): boolean {
  const anchorNode = selection.anchorNode;
  if (!anchorNode) {
    return false;
  }

  const element = anchorNode.parentElement;
  if (!element) {
    return false;
  }

  // ChatGPT selector
  const chatGptResponse = element.closest(
    '[data-message-author-role="assistant"]'
  );

  // Claude selectors
  const claudeResponse =
    element.closest(".font-claude-response") ||
    element.closest("[data-is-streaming]");

  return !!(chatGptResponse || claudeResponse);
}

/**
 * Insert text into Claude's ProseMirror or ChatGPT's textarea
 * Returns true if successful, false if no input found
 */
export function insertIntoTextarea(text: string): boolean {
  // Claude's contenteditable input
  const claudeInput = document.querySelector(
    '[contenteditable="true"].ProseMirror'
  ) as HTMLElement;

  if (claudeInput) {
    // ProseMirror needs separate <p> tags for each line
    claudeInput.innerHTML = "";
    const lines = text.split("\n");
    for (const line of lines) {
      const p = document.createElement("p");
      if (line.trim() === "") {
        // Empty line needs a <br> to render
        p.innerHTML = "<br>";
      } else {
        p.textContent = line;
      }
      claudeInput.appendChild(p);
    }
    // Trigger input event for React to pick up
    claudeInput.dispatchEvent(new Event("input", { bubbles: true }));
    claudeInput.focus();
    return true;
  }

  // ChatGPT's textarea
  const chatGptInput = document.querySelector(
    "#prompt-textarea"
  ) as HTMLTextAreaElement;

  if (chatGptInput) {
    chatGptInput.value = text;
    chatGptInput.dispatchEvent(new Event("input", { bubbles: true }));
    chatGptInput.focus();
    return true;
  }

  return false;
}
