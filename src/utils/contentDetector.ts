export interface ContentSuggestion {
  toolId: string;
  confidence: number;
  action?: string;
  preview: string;
}
