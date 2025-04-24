export interface Error {
  before: string;
  after: string;
  explanation: string;
}

export interface Correction {
  type: 'error' | 'text';
  text?: string;
  original?: string;
  corrected?: string;
  explanation?: string;
}

export interface Grammar {
  spelling: Error[];
  punctuation: Error[];
  grammar: Error[];
  corrected_text?: string;
  file_path?: string;
  corrections: Correction[];
  summary: string[];
} 