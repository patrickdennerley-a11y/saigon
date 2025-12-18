export interface ExplanationLayer {
  content: string;
  depth: number;
  generatedAt: number;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  subtopic?: string;
  layers: ExplanationLayer[];
  createdAt: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subject: string;
  courseCode?: string;
  university?: string;
  cards: Flashcard[];
  createdAt: number;
}

export interface CardViewState {
  cardId: string;
  currentDepth: number;
  isFlipping: boolean;
  isLoading: boolean;
}

export interface Course {
  code: string;
  name: string;
  university: string;
  description: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  name: string;
  description: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerationRequest {
  type: 'flashcards' | 'explanation' | 'course-inference' | 'subtopics';
  context: string;
  subject?: string;
  depth?: number;
  previousContent?: string;
}

export interface ThemeColors {
  primary: string;       // Main accent color (buttons, highlights)
  primaryHover: string;  // Hover state for primary
  secondary: string;     // Secondary elements
  background: string;    // Page background
  backgroundAlt: string; // Card/panel backgrounds
  surface: string;       // Elevated surfaces
  text: string;          // Primary text
  textMuted: string;     // Secondary/muted text
  border: string;        // Borders
  accent: string;        // Accent highlights
}

export type ThemePreset = 'ocean' | 'purple' | 'monochrome' | 'terminal' | 'sunset' | 'forest' | 'custom';

export interface AppSettings {
  apiKey: string;
  model: 'claude-sonnet-4-20250514' | 'claude-haiku-4-20250514' | 'claude-3-5-sonnet-20241022';
  prefetchDepth: number;
  themePreset: ThemePreset;
  customColors: ThemeColors;
}

export type AppView = 'home' | 'deck' | 'study' | 'settings' | 'course-search';
