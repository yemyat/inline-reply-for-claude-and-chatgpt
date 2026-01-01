export interface Annotation {
  id: string;
  selectedText: string;
  reply: string;
  timestamp: number;
  highlightEl?: HTMLElement;
  prefixContext?: string;
  suffixContext?: string;
}

export interface ConversationAnnotations {
  conversationId: string;
  annotations: Annotation[];
}
