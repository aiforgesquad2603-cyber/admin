export interface Participant {
  id: string;
  name: string;
  score: number;
}

export interface LiveSession {
  roomCode: string;
  quizId: string;
  hostId: string;
  participants: Participant[];
  currentQuestionIndex: number;
  status: "waiting" | "active" | "ended";
  createdAt: Date;
  timer: number;
  timerInterval?: NodeJS.Timeout;
}

// In-memory store to simulate MongoDB LiveSession model
export const activeSessions: Record<string, LiveSession> = {};
