import axios from 'axios';
import { Grammar } from '../types';

const API_BASE_URL = 'https://darkbreakerk-grammarly-checking.hf.space';
// const API_BASE_URL = 'https://abao77-grammarly-checking.hf.space';

export const grammarApi = {
  checkText: async (data: { text: string; proper_nouns: string }) => {
    const response = await axios.post(`${API_BASE_URL}/check-text`, data);
    return response.data as Grammar;
  },

  checkFile: async (formData: FormData) => {
    const response = await axios.post(`${API_BASE_URL}/check-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as Grammar;
  },

  checkQuiz: async (formData: FormData) => {
    const response = await axios.post(`${API_BASE_URL}/check-grammar-quiz`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: async (filename: string) => {
    const response = await axios.get(`${API_BASE_URL}/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  rewriteText: async (data: { text: string; requirement?: string; english_level?: string }) => {
    const response = await axios.post(`${API_BASE_URL}/rewrite`, data);
    return response.data;
  },
};

export default axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json'
  },
}); 