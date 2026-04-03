import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Participant {
  id: string;
  name: string;
  score: number;
}

interface SocketState {
  socket: Socket | null;
  participants: Participant[];
  leaderboard: Participant[];
  roomCode: string | null;
  timer: number;
  currentQuestion: any | null;
  questionIndex: number;
  totalQuestions: number;
  status: "idle" | "waiting" | "active" | "finished";
  connect: () => void;
  createSession: (quizId: string) => Promise<string>;
  startQuiz: () => void;
  nextQuestion: () => void;
  endSession: () => void;
  setParticipants: (data: Participant[]) => void;
  setLeaderboard: (data: Participant[]) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  participants: [],
  leaderboard: [],
  roomCode: null,
  timer: 0,
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  status: "idle",

  connect: () => {
    if (get().socket) return;
    const socket = API_URL ? io(API_URL) : io();
    
    socket.on("participants-update", (data) => set({ participants: data }));
    socket.on("leaderboard-update", (data) => set({ leaderboard: data }));
    socket.on("timer-sync", (time) => set({ timer: time }));
    socket.on("quiz-started", (data) => set({ 
      status: "active", 
      currentQuestion: data.question, 
      questionIndex: data.questionIndex, 
      totalQuestions: data.totalQuestions 
    }));
    socket.on("new-question", (data) => set({ 
      currentQuestion: data.question, 
      questionIndex: data.questionIndex, 
      totalQuestions: data.totalQuestions 
    }));
    socket.on("quiz-finished", (data) => set({ status: "finished", leaderboard: data }));

    set({ socket });
  },

  createSession: async (quizId: string) => {
    const res = await fetch(`${API_URL}/api/live/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId })
    });
    const data = await res.json();
    const roomCode = data.roomCode;
    
    set({ roomCode, status: "waiting", participants: [], leaderboard: [] });
    get().socket?.emit("create-session", roomCode);
    
    return roomCode;
  },

  startQuiz: () => {
    const { socket, roomCode } = get();
    if (socket && roomCode) {
      socket.emit("start-quiz", roomCode);
    }
  },

  nextQuestion: () => {
    const { socket, roomCode } = get();
    if (socket && roomCode) {
      socket.emit("next-question", roomCode);
    }
  },

  endSession: () => {
    const { socket, roomCode } = get();
    if (socket && roomCode) {
      socket.emit("end-session", roomCode);
      set({ status: "idle", roomCode: null, currentQuestion: null });
    }
  },

  setParticipants: (data) => set({ participants: data }),
  setLeaderboard: (data) => set({ leaderboard: data }),
}));
