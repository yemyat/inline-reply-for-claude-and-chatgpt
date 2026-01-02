# Inline Reply for Claude and ChatGPT

A Chrome extension that lets you add inline comments to AI responses, then compile them into a single feedback prompt.

## Demo

https://github.com/user-attachments/assets/a576371e-8c06-4df8-b6f5-bad56fa22fe8

## Why I Made This

I found it really annoying when going back and forth with ChatGPT or Claude:

1. **Copy-paste hell** — Having to copy a piece of text, paste it, then write my response to it
2. **Question ping-pong** — This becomes especially tedious when the AI asks follow-up questions about different parts of its response
3. **Vibe-coded solution** — So I decided to build a Chrome extension to solve the problem

Now I can just select text, add my comment inline, and hit "Insert" to compile everything into a structured prompt.

## How It Works

1. **Select text** in any AI response
2. **Add your comment** via the popover
3. **Repeat** for as many annotations as you need
4. **Click Insert** to compile all feedback into the chat input

The extension automatically matches the theme of the site you're on (dark/light mode).

## Installation

1. Download the latest ZIP from [Releases](../../releases/latest)
2. Extract the ZIP to a folder
3. Open Chrome → `chrome://extensions`
4. Enable "Developer mode"
5. Click "Load unpacked" → select the extracted folder

### Building from source

```bash
bun install && bun run build
```
Then load the `dist` folder as an unpacked extension.

## Supported Sites

- [ChatGPT](https://chatgpt.com)
- [Claude](https://claude.ai)
