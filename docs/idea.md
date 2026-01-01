# AI Inline Reply - Product Spec

A Chrome extension that brings Google Docs-style inline commenting to AI chat interfaces.

## Problem

When using ChatGPT or Claude web apps, users receive long AI responses but have no way to reply to specific points within the text. The only option is to write a new message that references parts of the response, which is clunky and loses context. There's no targeted way to have a conversation about different sections of a response.

## Solution

A Chrome extension that enables inline replies similar to Google Docs commenting:

- Select any text within an AI response
- A popover appears allowing you to add a reply or comment to that selection
- Add multiple inline comments throughout the response
- Click "Done" to compile all comments into a structured prompt that quotes original text with your replies
- Works on both chat.openai.com and claude.ai

## User Flow

1. User receives a long AI response
2. User selects a portion of text they want to respond to
3. A small popover appears near the selection
4. User types their reply/question about that specific text
5. The comment is saved and visually highlighted in the response
6. User repeats for other parts they want to address
7. User clicks "Done" button
8. Extension generates a formatted prompt with all quotes and replies
9. Prompt is inserted into the chat input, ready to send

## Example Output

When clicking "Done", the extension generates a prompt like:

```
I have specific feedback on your response:

> "React hooks provide a way to..."
My reply: Can you explain useEffect cleanup?

> "The database schema should include..."
My reply: What about indexing for performance?

Please address each point above.
```

## Technical Approach

- **Chrome Extension**: Manifest V3 with content scripts injected into supported sites
- **Text Selection**: Browser Selection API to detect and capture user selections
- **Inline Comment UI**: Floating popover positioned near the selection, built with vanilla DOM or lightweight framework
- **Storage**: chrome.storage.local for persisting comments across page refreshes
- **TypeScript**: Full TypeScript codebase for type safety
- **Supported Sites**: chat.openai.com, claude.ai

## Future Ideas

- Support for additional AI chat platforms (Gemini, Perplexity, etc.)
- Keyboard shortcuts for faster commenting workflow
- Export comments as markdown or JSON
- Collaborative commenting with sharing
- Comment threading for deeper discussions on a single selection
- Custom prompt templates for the generated output
- Dark mode and theme customization
