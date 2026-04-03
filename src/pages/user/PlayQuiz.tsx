import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, Trophy, Loader2, Triangle, Square, Circle, Diamond } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  score: number;
}

interface Question {
  text: string;
  options: string[];
}

const SHAPES = [Triangle, Diamond, Circle, Square];
const COLORS = [
  "bg-red-500 hover:bg-red-600", 
  "bg-blue-500 hover:bg-blue-600", 
  "bg-yellow-500 hover:bg-yellow-600", 
  "bg-green-500 hover:bg-green-600"
];

export function PlayQuiz() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [status, setStatus] = useState<"connecting" | "waiting" | "active" | "ended">("connecting");
  const [error, setError] = useState<string | null>(null);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timer, setTimer] = useState(0);
  
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);

  const playerName = sessionStorage.getItem("playerName") || "Player";

  useEffect(() => {
    if (!roomCode) {
      navigate("/join");
      return;
    }

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-room", { roomCode, name: playerName });
    });

    newSocket.on("joined", () => {
      setStatus("waiting");
    });

    newSocket.on("error", (err) => {
      setError(err.message);
      newSocket.disconnect();
    });

    newSocket.on("participants-update", (data) => {
      setParticipants(data);
    });

    newSocket.on("quiz-started", (data) => {
      setStatus("active");
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimer(data.timePerQuestion); // Initialize timer
      setHasAnswered(false);
      setSelectedAnswer(null);
      // Store max time for progress bar
      sessionStorage.setItem("maxTime", data.timePerQuestion.toString());
    });

    newSocket.on("new-question", (data) => {
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimer(data.timePerQuestion); // Initialize timer
      setHasAnswered(false);
      setSelectedAnswer(null);
      // Store max time for progress bar
      sessionStorage.setItem("maxTime", data.timePerQuestion.toString());
    });

    newSocket.on("timer-sync", (time) => {
      setTimer(time);
    });

    newSocket.on("quiz-finished", (data) => {
      setStatus("ended");
      setLeaderboard(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, playerName, navigate]);

  const handleAnswer = (index: number) => {
    if (!hasAnswered && socket) {
      setHasAnswered(true);
      setSelectedAnswer(index);
      socket.emit("submit-answer", { roomCode, answerIndex: index });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate("/join")}
            className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-black transition-colors"
          >
            Back to Join
          </button>
        </div>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-4 font-sans text-gray-900">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-300 text-sm font-mono font-medium mb-8">
          ROOM: {roomCode}
        </div>
        
        <h1 className="text-5xl font-black tracking-tight mb-2 text-center">
          Waiting for <span className="text-blue-500">Host...</span>
        </h1>
        <p className="text-gray-500 text-lg mb-12">You are joined as <span className="font-bold text-gray-900">{playerName}</span></p>

        <div className="w-full max-w-2xl bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-12">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Users className="w-5 h-5 text-blue-500" />
              Players Joined
            </div>
            <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
              {participants.length}
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <AnimatePresence>
                {participants.map((p) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>The game will start soon...</span>
        </div>
      </div>
    );
  }

  if (status === "active" && currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="bg-gray-100 px-4 py-1.5 rounded-full font-bold text-sm">
              {questionIndex + 1} / {totalQuestions}
            </div>
            <div className="flex items-center gap-2 font-bold text-gray-400">
              <Trophy className="w-5 h-5 text-yellow-500" />
              QuizMaster Live
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-3xl font-black font-mono">
              <Clock className="w-6 h-6 text-gray-400" />
              {timer}
            </div>
            <div className="w-full h-1 bg-gray-200 mt-1 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gray-900"
                initial={{ width: "100%" }}
                animate={{ width: `${(timer / parseInt(sessionStorage.getItem("maxTime") || "20")) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        </header>

        {/* Question Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {currentQuestion.options.map((opt, i) => {
              const Shape = SHAPES[i % SHAPES.length];
              const colorClass = COLORS[i % COLORS.length];
              const isSelected = selectedAnswer === i;
              
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={hasAnswered}
                  className={`relative overflow-hidden rounded-xl p-6 md:p-8 flex items-center gap-6 transition-all transform active:scale-95 ${
                    hasAnswered 
                      ? isSelected 
                        ? `${colorClass} ring-4 ring-gray-900 ring-offset-2 opacity-100` 
                        : `${colorClass} opacity-40`
                      : colorClass
                  } text-white text-left`}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <Shape className="w-6 h-6 fill-current" />
                  </div>
                  <span className="text-2xl font-bold">{opt}</span>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 text-xl font-bold text-gray-500 flex items-center gap-2"
            >
              <Loader2 className="w-6 h-6 animate-spin" />
              Waiting for others...
            </motion.div>
          )}
        </main>
      </div>
    );
  }

  if (status === "ended") {
    const myRank = leaderboard.findIndex(p => p.id === socket?.id) + 1;
    const myScore = leaderboard.find(p => p.id === socket?.id)?.score || 0;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-2xl w-full text-center border border-gray-100"
        >
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-4xl font-black mb-2">Quiz Finished!</h2>
          <p className="text-gray-500 text-lg mb-8">Here's how you did, {playerName}</p>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Your Rank</div>
              <div className="text-5xl font-black text-blue-500">
                {myRank > 0 ? `#${myRank}` : "-"}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Score</div>
              <div className="text-5xl font-black text-gray-900">
                {myScore}
              </div>
            </div>
          </div>

          <div className="text-left">
            <h3 className="font-bold text-lg mb-4">Top Players</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between p-4 rounded-lg ${p.id === socket?.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-yellow-500 text-white' :
                      i === 1 ? 'bg-gray-300 text-gray-900' :
                      i === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    <span className="font-bold">{p.name} {p.id === socket?.id && "(You)"}</span>
                  </div>
                  <span className="font-mono font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate("/join")}
            className="mt-12 w-full bg-gray-900 text-white font-bold py-4 px-4 rounded-lg hover:bg-black transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}
