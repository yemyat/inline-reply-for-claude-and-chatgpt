export interface Annotation {
  id: string;
  selectedText: string;
  reply: string;
  timestamp: number;
  highlightEl?: HTMLElement;
}

export interface ConversationAnnotations {
  conversationId: string;
  annotations: Annotation[];
}
