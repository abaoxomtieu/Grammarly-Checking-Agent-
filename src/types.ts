export interface Error {
  before: string;
  after: string;
  explanation: string;
}

export interface Grammar {
  spelling: Error[];
  punctuation: Error[];
  grammar: Error[];
  file_path?: string;
  corrected_text?: string;
}

export interface Correction {
  type: 'error' | 'text';
  text?: string;
  original?: string;
  corrected?: string;
  explanation?: string;
}
