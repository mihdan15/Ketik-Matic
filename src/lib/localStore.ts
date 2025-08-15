import { AppState } from '../types';

const STORAGE_KEY = 'ketikmatic.v1';

export interface StorableState {
  topic: string;
  lang: 'id' | 'en';
  tone: 'netral' | 'formal' | 'santai' | 'persuasif' | 'naratif';
  mode: 'serious' | 'infinite';
  length: 'ringkas' | 'sedang' | 'panjang';
  typedText: string;
  typedIndex: number;
  typingMode: 'char' | 'word' | 'chunk';
  paragraphCount: number;
}

export function saveSnapshot(state: Partial<AppState>): void {
  try {
    const snapshot: StorableState = {
      topic: state.topic || '',
      lang: state.lang || 'id',
      tone: state.tone || 'netral',
      mode: state.mode || 'serious',
      length: state.length || 'sedang',
      typedText: state.typedText || '',
      typedIndex: state.typedIndex || 0,
      typingMode: state.typingMode || 'char',
      paragraphCount: state.paragraphCount || 0
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
}

export function loadSnapshot(): Partial<StorableState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
    return null;
  }
}

export function clearSnapshot(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}