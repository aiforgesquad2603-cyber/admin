import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import liveRoutes from "./server/routes/liveRoutes";
import { setupLiveSockets } from "./server/sockets/liveSocket";

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

  // In-memory data stores
  let quizzes = [
    {
      id: "q1",
      title: "General Knowledge Quiz",
      description: "Test your general knowledge!",
      difficulty: "Medium",
      timePerQuestion: 20,
      questions: [
        { id: "q1_1", text: "What is the capital of France?", options: ["Berlin", "London", "Paris", "Madrid"], correctIndex: 2 },
        { id: "q1_2", text: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], correctIndex: 1 },
        { id: "q1_3", text: "Who wrote 'Hamlet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], correctIndex: 1 }
      ]
    }
  ];

  // API Routes
  app.get("/api/quizzes", (req, res) => {
    res.json(quizzes);
  });

  app.post("/api/quizzes", (req, res) => {
    const newQuiz = { id: `q${Date.now()}`, ...req.body };
    quizzes.push(newQuiz);
    res.status(201).json(newQuiz);
  });

  app.delete("/api/quizzes/:id", (req, res) => {
    quizzes = quizzes.filter(q => q.id !== req.params.id);
    res.status(204).send();
  });

  // Use live routes
  app.use("/api/live", liveRoutes);

  // Setup Socket.io
  setupLiveSockets(io, quizzes);

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
