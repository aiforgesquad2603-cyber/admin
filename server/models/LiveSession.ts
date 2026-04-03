import mongoose from 'mongoose';

export interface Participant {
  id: string;
  name: string;
  score: number;
}

export interface LiveSessionState {
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

// In-memory store for real-time socket state
export const activeSessions: Record<string, LiveSessionState> = {};

// MongoDB Model for persistence
const participantSchema = new mongoose.Schema({
  socketId: { type: String },
  name: { type: String, required: true },
  score: { type: Number, default: 0 }
});

const liveSessionSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  hostId: { type: String, required: true },
  participants: [participantSchema],
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
}, { timestamps: true });

export const LiveSessionModel = mongoose.model('LiveSession', liveSessionSchema);
