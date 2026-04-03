import { Server, Socket } from "socket.io";
import { activeSessions, LiveSessionModel } from "../models/LiveSession";
import { Quiz } from "../models/Quiz";

/**
 * Setup Socket.io logic for real-time live quiz sessions.
 * This handles the flow from creating a room, users joining,
 * starting the quiz, pushing questions, and updating the leaderboard.
 */
export function setupLiveSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // 1. ADMIN FLOW: Admin creates a session and joins the room
    socket.on("create-session", (roomCode) => {
      socket.join(roomCode);
      console.log(`Admin joined room ${roomCode}`);
    });

    // 2. USER FLOW: Participant joins the room
    socket.on("join-room", ({ roomCode, name }) => {
      const session = activeSessions[roomCode];
      if (session && session.status === "waiting") {
        socket.join(roomCode);
        const participant = { id: socket.id, name, score: 0 };
        session.participants.push(participant);
        
        // Notify admin that a new participant joined
        io.to(roomCode).emit("participants-update", session.participants);
        socket.emit("joined", { success: true, roomCode, name });
      } else {
        socket.emit("error", { message: "Room not found or already started" });
      }
    });

    // 3. ADMIN FLOW: Admin starts the quiz
    socket.on("start-quiz", async (roomCode) => {
      const session = activeSessions[roomCode];
      if (session) {
        session.status = "active";
        session.currentQuestionIndex = 0;
        
        try {
          const quiz = await Quiz.findById(session.quizId);
          if (quiz) {
            session.timer = quiz.timePerQuestion;
            
            // Push the first question to all connected clients
            io.to(roomCode).emit("quiz-started", {
              question: quiz.questions[0],
              questionIndex: 0,
              totalQuestions: quiz.questions.length,
              timePerQuestion: quiz.timePerQuestion
            });
            
            startTimer(roomCode, io);
            
            // Update status in DB
            await LiveSessionModel.findOneAndUpdate({ roomCode }, { status: "active" });
          }
        } catch (err) {
          console.error("Failed to fetch quiz for start-quiz", err);
        }
      }
    });

    // 4. ADMIN FLOW: Admin moves to the next question
    socket.on("next-question", async (roomCode) => {
      const session = activeSessions[roomCode];
      if (session) {
        try {
          const quiz = await Quiz.findById(session.quizId);
          if (quiz && session.currentQuestionIndex < quiz.questions.length - 1) {
            session.currentQuestionIndex++;
            session.timer = quiz.timePerQuestion;
            
            // Push the next question to all connected clients
            io.to(roomCode).emit("new-question", {
              question: quiz.questions[session.currentQuestionIndex],
              questionIndex: session.currentQuestionIndex,
              totalQuestions: quiz.questions.length,
              timePerQuestion: quiz.timePerQuestion
            });
            
            startTimer(roomCode, io);
          } else {
            // End of quiz reached
            session.status = "ended";
            io.to(roomCode).emit("quiz-finished", session.participants);
            
            // Save final results to DB
            await saveSessionResults(roomCode, session);
          }
        } catch (err) {
          console.error("Failed to fetch quiz for next-question", err);
        }
      }
    });

    // 5. USER FLOW: Participant submits an answer
    socket.on("submit-answer", async ({ roomCode, answerIndex }) => {
      const session = activeSessions[roomCode];
      if (session && session.status === "active") {
        try {
          const quiz = await Quiz.findById(session.quizId);
          if (quiz) {
            const currentQuestion = quiz.questions[session.currentQuestionIndex];
            if (currentQuestion.correctIndex === answerIndex) {
              const participant = session.participants.find(p => p.id === socket.id);
              if (participant) {
                // Score based on time remaining (faster = more points)
                participant.score += Math.max(10, session.timer * 10);
                
                // Sort leaderboard and broadcast to room
                session.participants.sort((a, b) => b.score - a.score);
                io.to(roomCode).emit("leaderboard-update", session.participants);
              }
            }
          }
        } catch (err) {
          console.error("Failed to process answer", err);
        }
      }
    });

    // 6. ADMIN FLOW: Admin manually ends the session
    socket.on("end-session", async (roomCode) => {
      const session = activeSessions[roomCode];
      if (session) {
        if (session.timerInterval) clearInterval(session.timerInterval);
        session.status = "ended";
        io.to(roomCode).emit("quiz-finished", session.participants);
        
        // Save final results to DB
        await saveSessionResults(roomCode, session);
        
        delete activeSessions[roomCode];
      }
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      // Remove participant from any active sessions
      for (const roomCode in activeSessions) {
        const session = activeSessions[roomCode];
        const index = session.participants.findIndex(p => p.id === socket.id);
        if (index !== -1) {
          session.participants.splice(index, 1);
          io.to(roomCode).emit("participants-update", session.participants);
        }
      }
    });
  });

  /**
   * Helper function to manage the countdown timer for each question
   */
  function startTimer(roomCode: string, io: Server) {
    const session = activeSessions[roomCode];
    if (session.timerInterval) clearInterval(session.timerInterval);
    
    session.timerInterval = setInterval(() => {
      if (session.timer > 0) {
        session.timer--;
        io.to(roomCode).emit("timer-sync", session.timer);
      } else {
        clearInterval(session.timerInterval);
        io.to(roomCode).emit("time-up");
      }
    }, 1000);
  }
  
  /**
   * Save final session results to MongoDB
   */
  async function saveSessionResults(roomCode: string, session: any) {
    try {
      await LiveSessionModel.findOneAndUpdate(
        { roomCode }, 
        { 
          status: "ended",
          participants: session.participants.map((p: any) => ({
            socketId: p.id,
            name: p.name,
            score: p.score
          }))
        }
      );
    } catch (err) {
      console.error("Failed to save session results to DB", err);
    }
  }
}
