import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import mongoose from "mongoose";
import liveRoutes from "./server/routes/liveRoutes";
import { setupLiveSockets } from "./server/sockets/liveSocket";
import { Quiz } from "./server/models/Quiz";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB
  try {
    await mongoose.connect("mongodb+srv://aiforgesquad2603_db_user:OzxtCyOY55Q1Okt1@cluster0.xb7eorv.mongodb.net/quizmaster?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Connected to MongoDB");
    
    // Seed initial quiz if empty
    const count = await Quiz.countDocuments();
    if (count === 0) {
      await Quiz.create({
        title: "General Knowledge Quiz",
        description: "Test your general knowledge!",
        difficulty: "Medium",
        timePerQuestion: 20,
        questions: [
          { text: "What is the capital of France?", options: ["Berlin", "London", "Paris", "Madrid"], correctIndex: 2 },
          { text: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], correctIndex: 1 },
          { text: "Who wrote 'Hamlet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], correctIndex: 1 }
        ]
      });
      console.log("Seeded initial quiz");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  // API Routes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await Quiz.find().sort({ createdAt: -1 });
      // Map _id to id for frontend compatibility
      const formattedQuizzes = quizzes.map(q => {
        const obj = q.toObject();
        obj.id = obj._id.toString();
        return obj;
      });
      res.json(formattedQuizzes);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      res.status(500).json({ error: "Failed to fetch quizzes", details: String(err) });
    }
  });

  app.post("/api/quizzes", async (req, res) => {
    try {
      const newQuiz = await Quiz.create(req.body);
      const obj = newQuiz.toObject();
      obj.id = obj._id.toString();
      res.status(201).json(obj);
    } catch (err) {
      res.status(500).json({ error: "Failed to create quiz" });
    }
  });

  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      await Quiz.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete quiz" });
    }
  });

  // Use live routes
  app.use("/api/live", liveRoutes);

  // Setup Socket.io
  setupLiveSockets(io);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
