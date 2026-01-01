# Technical Documentation

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

## Current Features

- [x] Text selection detection in AI responses
- [x] Popover UI for adding replies
- [x] Toolbar showing reply count
- [x] Compile replies into formatted prompt
- [x] Copy to clipboard

## Not Yet Implemented

- [ ] Visual highlighting of annotated text
- [ ] Persistence across page refreshes
- [ ] ChatGPT testing/verification
- [ ] Keyboard shortcuts
