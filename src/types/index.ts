export interface AppState {
  topic: string;
  lang: 'id' | 'en';
  tone: 'netral' | 'formal' | 'santai' | 'persuasif' | 'naratif';
  mode: 'serious' | 'infinite';
  length: 'ringkas' | 'sedang' | 'panjang';
  bufferText: string;
  typedText: string;
  typedIndex: number;
  isTyping: boolean;
  typingMode: 'char' | 'word' | 'chunk';
  paragraphCount: number;
  cursorPosition: number;
  isLoading: boolean;
  error: string | null;
}

export interface TypingEngineProps {
  getState: () => AppState;
  setState: (updates: Partial<AppState>) => void;
  getCursorPos: () => number;
  setCursorPos: (pos: number) => void;
  onRender: () => void;
}

export interface ApiParams {
  topic: string;
  lang: string;
  tone: string;
  targetWords?: number;
  continuation?: boolean;
}