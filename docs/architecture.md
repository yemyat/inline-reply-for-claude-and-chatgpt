# Architecture

## Module Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        content.ts                            │
│                    (Entry Point)                             │
│              Creates InlineReplyManager                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        manager.ts                            │
│                   (Orchestration)                            │
│                                                              │
│  - Sets up event listeners (mouseup, mousedown)              │
│  - Coordinates all modules                                   │
│  - Handles user actions (save, edit, delete, compile)        │
└───────┬─────────────┬──────────────┬────────────────────────┘
        │             │              │
        ▼             ▼              ▼
┌───────────┐  ┌────────────┐  ┌────────────┐
│  state.ts │  │   ui/*     │  │  utils/*   │
│           │  │            │  │            │
│ - CRUD    │  │ - popover  │  │ - dom.ts   │
│ - Query   │  │ - toolbar  │  │ - toast.ts │
│           │  │ - highlight│  │            │
└───────────┘  └────────────┘  └────────────┘
```

## Manager Flow

### 1. Initialization

```
InlineReplyManager constructor
    │
    ├─► createPopover(callbacks)    → ui/popover.ts
    │       └─ Registers onSave, onDelete, onCancel
    │
    ├─► createToolbar(callbacks)    → ui/toolbar.ts
    │       └─ Registers onCompile, onClear
    │
    └─► setupSelectionListener()
            ├─ mouseup → handleSelection()
            └─ mousedown → cancelEdit() if outside popover
```

### 2. Text Selection Flow

```
User selects text in AI response
    │
    ▼
mouseup event triggers handleSelection()
    │
    ├─ Get selection via window.getSelection()
    │
    ├─ Check: selection.isCollapsed? → exit
    │
    ├─ Check: text.length < 3? → exit
    │
    ├─ Check: isWithinAIResponse()? → utils/dom.ts
    │     └─ Looks for Claude or ChatGPT selectors
    │
    ├─ Store range: currentRange = selection.getRangeAt(0).cloneRange()
    │
    └─► showPopover(x, y, selectedText) → ui/popover.ts
```

### 3. Save Reply Flow

```
User clicks "Save Reply" button
    │
    ▼
saveReply() called via callback
    │
    ├─ Get selectedText from popover dataset
    │
    ├─ Get reply from textarea input
    │
    ├─ If editingAnnotationId exists:
    │     └─► updateAnnotation(id, {reply, timestamp}) → state.ts
    │
    └─ Else (new annotation):
          │
          ├─ Create annotation object with crypto.randomUUID()
          │
          ├─► createHighlight(range, id, onClick) → ui/highlight.ts
          │       └─ Wraps selected text in <mark> element
          │       └─ Attaches click handler for editing
          │
          ├─► addAnnotation(annotation) → state.ts
          │
          └─► updateToolbar(count) → ui/toolbar.ts
```

### 4. Edit Annotation Flow

```
User clicks on highlighted text
    │
    ▼
Highlight click handler triggers editAnnotation(id, element)
    │
    ├─► getAnnotationById(id) → state.ts
    │
    ├─ Set editingAnnotationId = id
    │
    └─► showPopover(x, y, text, reply, showDelete=true) → ui/popover.ts
```

### 5. Compile Prompt Flow

```
User clicks "Compile Prompt" button
    │
    ▼
compilePrompt() called via callback
    │
    ├─► getAnnotations() → state.ts
    │
    ├─ Build prompt string from all annotations
    │
    ├─► insertIntoTextarea(prompt) → utils/dom.ts
    │       └─ Tries Claude's ProseMirror first
    │       └─ Falls back to ChatGPT's textarea
    │
    └─ If insertion fails:
          └─► Copy to clipboard + showToast() → utils/toast.ts
```

## State Management

The `state.ts` module uses module-level state:

```typescript
let annotations: Annotation[] = [];

export function getAnnotations() { return annotations; }
export function addAnnotation(a) { annotations.push(a); }
export function deleteAnnotation(id) { /* splice */ }
// etc.
```

This is simple and effective because:
- State is scoped to the module
- All imports share the same instance
- No class needed for pure data operations

## UI Components

Each UI component follows the same pattern:

```typescript
let element: HTMLElement | null = null;

export function create(callbacks) {
  element = document.createElement('div');
  // Setup HTML, attach listeners
  document.body.appendChild(element);
  return element;
}

export function show(...) { element.style.display = 'block'; }
export function hide() { element.style.display = 'none'; }
```

Module-level `element` variable acts as singleton state for the component.
