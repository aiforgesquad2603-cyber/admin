import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "u1",
    name: "Admin User",
    email: "admin@quizmaster.io",
    role: "admin",
  },
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
