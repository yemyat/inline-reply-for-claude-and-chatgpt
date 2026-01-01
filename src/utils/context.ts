const SENTENCE_BOUNDARIES = /[.?!]/;
const LAST_SENTENCE_BOUNDARY = /[.?!]\s*[^.?!]*$/;
const MAX_CONTEXT_WORDS = 6;
const MAX_CHARS_TO_SCAN = 200;

export function extractSurroundingContext(range: Range): {
  prefix: string;
  suffix: string;
} {
  const prefixText = getTextBefore(range, MAX_CHARS_TO_SCAN);
  const prefix = extractWordsWithBoundary(
    prefixText,
    "before",
    MAX_CONTEXT_WORDS
  );

  const suffixText = getTextAfter(range, MAX_CHARS_TO_SCAN);
  const suffix = extractWordsWithBoundary(
    suffixText,
    "after",
    MAX_CONTEXT_WORDS
  );

  return { prefix, suffix };
}

function findBlockParent(node: Node): Element {
  let current = node.parentElement;
  while (current) {
    const display = getComputedStyle(current).display;
    if (display === "block" || display === "list-item") {
      return current;
    }
    current = current.parentElement;
  }
  return document.body;
}

function getTextBefore(range: Range, maxChars: number): string {
  const blockParent = findBlockParent(range.commonAncestorContainer);

  const preRange = document.createRange();
  preRange.setStart(blockParent, 0);
  preRange.setEnd(range.startContainer, range.startOffset);

  const text = preRange.toString();
  return text.slice(-maxChars);
}

function getTextAfter(range: Range, maxChars: number): string {
  const blockParent = findBlockParent(range.commonAncestorContainer);

  const postRange = document.createRange();
  postRange.setStart(range.endContainer, range.endOffset);
  postRange.setEndAfter(blockParent);

  const text = postRange.toString();
  return text.slice(0, maxChars);
}

function extractWordsWithBoundary(
  text: string,
  direction: "before" | "after",
  maxWords: number
): string {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (direction === "before") {
    // Find last sentence boundary and take text after it
    const boundaryMatch = normalized.match(LAST_SENTENCE_BOUNDARY);
    const textToProcess = boundaryMatch
      ? normalized.slice(normalized.lastIndexOf(boundaryMatch[0]) + 1).trim()
      : normalized;

    const words = textToProcess.split(" ").filter((w) => w.length > 0);
    return words.slice(-maxWords).join(" ");
  }

  // direction === "after"
  const boundaryIndex = normalized.search(SENTENCE_BOUNDARIES);
  const textToProcess =
    boundaryIndex >= 0 ? normalized.slice(0, boundaryIndex + 1) : normalized;

  const words = textToProcess.split(" ").filter((w) => w.length > 0);
  return words.slice(0, maxWords).join(" ");
}
