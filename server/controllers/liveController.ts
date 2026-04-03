import { Request, Response } from "express";
import { activeSessions } from "../models/LiveSession";

/**
 * Controller for Live Session API endpoints
 */
export const liveController = {
  /**
   * Create a new live session
   * POST /api/live/create
   */
  createSession: (req: Request, res: Response) => {
    const { quizId } = req.body;
    
    // Generate random room code (e.g., Z9AZIX)
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Store session in DB (in-memory simulation)
    activeSessions[roomCode] = {
      roomCode,
      quizId,
      hostId: "admin", // In a real app, this would be the authenticated user's ID
      participants: [],
      currentQuestionIndex: -1,
      status: "waiting",
      createdAt: new Date(),
      timer: 0
    };

    // Return roomCode
    res.json({ roomCode });
  }
};
