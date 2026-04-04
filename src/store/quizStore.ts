import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timePerQuestion: number;
  questions: Question[];
}

interface QuizState {
  quizzes: Quiz[];
  isLoading: boolean;
  isGenerating: boolean;
  fetchQuizzes: () => Promise<void>;
  createQuiz: (quiz: Omit<Quiz, "id">) => Promise<void>;
  generateQuiz: (topic: string, difficulty: string, questionCount: number) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  isLoading: false,
  isGenerating: false,

  fetchQuizzes: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/api/quizzes`);
      if (Array.isArray(res.data)) {
        set({ quizzes: res.data });
      } else {
        console.error("Expected array of quizzes, got:", res.data);
        set({ quizzes: [] });
      }
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
      set({ quizzes: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createQuiz: async (quiz) => {
    try {
      const res = await axios.post(`${API_URL}/api/quizzes`, quiz);
      set((state) => ({ quizzes: [res.data, ...state.quizzes] }));
    } catch (error) {
      console.error("Failed to create quiz", error);
    }
  },

  generateQuiz: async (topic, difficulty, questionCount) => {
    set({ isGenerating: true });
    try {
      const res = await axios.post(`${API_URL}/api/generate-quiz`, { topic, difficulty, questionCount });
      set((state) => ({ quizzes: [res.data, ...state.quizzes] }));
    } catch (error) {
      console.error("Failed to generate quiz", error);
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },

  deleteQuiz: async (id) => {
    try {
      await axios.delete(`${API_URL}/api/quizzes/${id}`);
      set((state) => ({ quizzes: state.quizzes.filter((q) => q.id !== id) }));
    } catch (error) {
      console.error("Failed to delete quiz", error);
    }
  }
}));
