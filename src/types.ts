export interface Annotation {
  id: string;
  selectedText: string;
  reply: string;
  timestamp: number;
}

export interface ConversationAnnotations {
  conversationId: string;
  annotations: Annotation[];
}
