import { Request, Response } from "express";
import { activeSessions, LiveSessionModel } from "../models/LiveSession";

/**
 * Controller for Live Session API endpoints
 */
export const liveController = {
  /**
   * Create a new live session
   * POST /api/live/create
   */
  createSession: async (req: Request, res: Response) => {
    try {
      const { quizId } = req.body;
      
      // Generate random room code (e.g., Z9AZIX)
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Store session in DB for persistence
      await LiveSessionModel.create({
        roomCode,
        quizId,
        hostId: "admin", // In a real app, this would be the authenticated user's ID
        status: "waiting"
      });
      
      // Store session in memory for real-time socket operations
      activeSessions[roomCode] = {
        roomCode,
        quizId,
        hostId: "admin",
        participants: [],
        currentQuestionIndex: -1,
        status: "waiting",
        createdAt: new Date(),
        timer: 0
      };

      // Return roomCode
      res.json({ roomCode });
    } catch (err) {
      console.error("Failed to create live session", err);
      res.status(500).json({ error: "Failed to create live session" });
    }
  }
};
