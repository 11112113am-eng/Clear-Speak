export interface SimplificationResult {
  shortVersion: string;
  whatThisMeans: string[];
  nextSteps: string;
  disclaimer: string;
  fullFormattedText: string;
  category?: string;
  originalGradeLevel?: string;
  readingEaseScore?: number;
  wordCountOriginal?: number;
  wordCountSimplified?: number;
  keyTermsExplained?: { term: string; simpleMeaning: string }[];
  suggestedQuestions?: string[];
  highlights?: string[];
}

export interface SimplificationRequest {
  text: string;
  category?: 'legal' | 'medical' | 'government' | 'financial' | 'general';
  readingSpeed?: 'normal' | 'slower';
}

export interface SavedTranslation {
  id: string;
  timestamp: number;
  originalText: string;
  category: string;
  result: SimplificationResult;
}
