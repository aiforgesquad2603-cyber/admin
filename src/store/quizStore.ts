import { create } from "zustand";
import axios from "axios";

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
  fetchQuizzes: () => Promise<void>;
  createQuiz: (quiz: Omit<Quiz, "id">) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  isLoading: false,

  fetchQuizzes: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get("/api/quizzes");
      set({ quizzes: res.data });
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createQuiz: async (quiz) => {
    try {
      const res = await axios.post("/api/quizzes", quiz);
      set((state) => ({ quizzes: [...state.quizzes, res.data] }));
    } catch (error) {
      console.error("Failed to create quiz", error);
    }
  },

  deleteQuiz: async (id) => {
    try {
      await axios.delete(`/api/quizzes/${id}`);
      set((state) => ({ quizzes: state.quizzes.filter((q) => q.id !== id) }));
    } catch (error) {
      console.error("Failed to delete quiz", error);
    }
  }
}));
