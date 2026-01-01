# Technical Documentation

---

## Iteration History

### Iteration #1 (2026-01-01)
**Goal:** Initial scaffold and MVP

- Created Chrome extension scaffold with TypeScript
- Implemented text selection detection in AI responses
- Built popover UI for adding inline replies
- Added toolbar with reply count and compile button
- Copy compiled prompt to clipboard
- Discovered and documented Claude DOM selectors
- Fixed ES module issue with content scripts

### Iteration #2 (2026-01-01)
**Goal:** Better UX with highlighting and auto-insert

- Added visual highlighting of annotated text (using `<mark>` elements)
- Implemented click-to-edit on highlighted text
- Added delete functionality for annotations
- Auto-insert compiled prompt into Claude's textarea (ProseMirror)
- Added ChatGPT input support (`#prompt-textarea`)
- Highlights persist until cleared or page refresh
- Fixed ProseMirror newline handling (each line needs separate `<p>` tag)

---

## Project Structure

```
ai-inline-reply/
├── src/
│   ├── manifest.json    # Chrome extension manifest v3
│   ├── content.ts       # Main content script (selection + UI)
│   ├── background.ts    # Service worker for storage
│   ├── types.ts         # Shared TypeScript interfaces
│   └── styles.css       # UI styling (dark theme)
├── dist/                # Compiled extension (load this in Chrome)
├── docs/
│   ├── idea.md          # Product spec
│   └── technical.md     # This file
├── package.json
└── tsconfig.json
```

## Build & Install

```bash
npm install
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `dist/` folder

## DOM Selectors

### Claude (claude.ai)

Found via DOM inspection on 2026-01-01:

| Selector | Description |
|----------|-------------|
| `.font-claude-response` | Main container wrapping AI response text |
| `[data-is-streaming]` | Attribute on response div (value: "true" or "false") |
| `.font-claude-response-body` | Inner text content |

Example DOM path for AI response text:
```
.font-claude-response-body (text here)
  └── .standard-markdown
      └── div
          └── .font-claude-response [data-is-streaming="false"]
```

### ChatGPT (chat.openai.com)

| Selector | Description |
|----------|-------------|
| `[data-message-author-role="assistant"]` | Container for assistant messages |
| `#prompt-textarea` | Input textarea for user messages |

### Input Textareas

| Site | Selector | Type |
|------|----------|------|
| Claude | `[contenteditable="true"].ProseMirror` | ProseMirror contenteditable |
| ChatGPT | `#prompt-textarea` | Standard textarea |

## Lessons Learned

### ES Modules in Content Scripts

Chrome content scripts run as plain scripts, NOT ES modules. If TypeScript outputs `export {}` at the end of a file, the content script will fail to load silently.

**Fix:** Don't use `import` statements in content scripts. Define types inline or use a bundler that outputs IIFE format.

```typescript
// BAD - causes "export {}" in output
import type { Annotation } from './types';

// GOOD - inline the interface
interface Annotation {
  id: string;
  selectedText: string;
  reply: string;
  timestamp: number;
}
```

### Selection API

Using `window.getSelection()` to detect user text selection:

```typescript
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;

  const selectedText = selection.toString().trim();
  const anchorNode = selection.anchorNode;
  const element = anchorNode?.parentElement;

  // Check if within AI response
  if (element?.closest('.font-claude-response')) {
    // Show popover at cursor position
    showPopover(e.clientX, e.clientY, selectedText);
  }
});
```

### Range API for Highlighting

Wrapping selected text in a highlight element requires the Range API:

```typescript
// Store range when selection happens
const range = selection.getRangeAt(0).cloneRange();

// Later, wrap in highlight element
const highlight = document.createElement('mark');
highlight.className = 'air-highlight';

// Simple case: selection within single text node
if (range.startContainer === range.endContainer) {
  range.surroundContents(highlight);
} else {
  // Complex: selection spans multiple nodes
  const contents = range.extractContents();
  highlight.appendChild(contents);
  range.insertNode(highlight);
}
```

**Gotcha:** `surroundContents()` throws if the range crosses element boundaries. Use `extractContents()` + `insertNode()` for robustness.

### ProseMirror Input

Claude uses ProseMirror for its input field. Each line needs its own `<p>` tag for proper formatting:

```typescript
const input = document.querySelector('[contenteditable="true"].ProseMirror');
input.innerHTML = '';

const lines = text.split('\n');
lines.forEach(line => {
  const p = document.createElement('p');
  if (line.trim() === '') {
    // Empty lines need <br> to render as whitespace
    p.innerHTML = '<br>';
  } else {
    p.textContent = line;
  }
  input.appendChild(p);
});

input.dispatchEvent(new Event('input', { bubbles: true }));
```

**Gotcha:** Putting all text in a single `<p>` tag loses newlines. Empty `<p></p>` tags collapse - use `<p><br></p>` for blank lines.

## Current Features

- [x] Text selection detection in AI responses
- [x] Popover UI for adding replies
- [x] Toolbar showing reply count
- [x] Compile replies into formatted prompt
- [x] Copy to clipboard (fallback)
- [x] Visual highlighting of annotated text
- [x] Click-to-edit on highlights
- [x] Delete annotations
- [x] Auto-insert prompt into textarea
- [x] Proper newline formatting in Claude's ProseMirror input

