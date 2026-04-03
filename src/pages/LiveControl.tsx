import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useSocketStore } from "@/src/store/socketStore";
import { useQuizStore } from "@/src/store/quizStore";
import { Users, Clock, Play, SkipForward, Square, Trophy, Copy, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LiveControl() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quizId");
  const navigate = useNavigate();
  
  const { quizzes, fetchQuizzes } = useQuizStore();
  const { 
    connect, createSession, startQuiz, nextQuestion, endSession,
    status, roomCode, participants, leaderboard, timer, currentQuestion, questionIndex, totalQuestions
  } = useSocketStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    connect();
  }, [fetchQuizzes, connect]);

  const quiz = quizzes.find(q => q.id === quizId);

  const handleCreateSession = async () => {
    if (quizId) {
      await createSession(quizId);
    }
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!quizId) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">No Quiz Selected</h2>
        <p className="text-muted-foreground">Please select a quiz from the Quizzes page to host a live session.</p>
        <Button onClick={() => navigate("/quizzes")}>Go to Quizzes</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-3xl font-bold tracking-tight">Live Control Center</h2>
            {status !== "idle" && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                status === "waiting" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                status === "active" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                "bg-gray-500/10 text-gray-500 border border-gray-500/20"
              }`}>
                {status === "active" ? "Live" : status}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-2">Hosting: <span className="font-medium text-foreground">{quiz?.title}</span></p>
        </div>
        
        {status !== "idle" && (
          <Button variant="destructive" onClick={endSession} className="gap-2">
            <Square className="w-4 h-4" />
            End Session
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex gap-6">
        
        {/* Left Column - Controls & Info */}
        <div className="w-2/3 flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* Status Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shrink-0">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              {status === "idle" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Play className="w-10 h-10 text-primary ml-2" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Ready to Host?</h3>
                    <p className="text-muted-foreground mt-2">Generate a room code and invite participants.</p>
                  </div>
                  <Button size="lg" className="w-full text-lg h-14 bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateSession}>
                    Generate Room Code
                  </Button>
                </motion.div>
              )}

              {status === "waiting" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 w-full">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Join at quizmaster.io with code</p>
                    <div 
                      className="text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 cursor-pointer flex items-center justify-center gap-4 group"
                      onClick={copyRoomCode}
                    >
                      {roomCode}
                      {copied ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <Copy className="w-8 h-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 py-6 border-y border-border/50">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{participants.length}</div>
                      <div className="text-sm text-muted-foreground">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{quiz?.questions.length}</div>
                      <div className="text-sm text-muted-foreground">Questions</div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full text-lg h-14 bg-green-600 hover:bg-green-700" 
                    onClick={startQuiz}
                    disabled={participants.length === 0}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Quiz Now
                  </Button>
                </motion.div>
              )}

              {status === "active" && currentQuestion && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-left space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Question {questionIndex + 1} of {totalQuestions}
                    </span>
                    <div className="flex items-center gap-2 text-2xl font-bold font-mono">
                      <Clock className="w-6 h-6 text-yellow-500" />
                      <span className={timer <= 5 ? "text-red-500 animate-pulse" : ""}>00:{timer.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold leading-tight">{currentQuestion.text}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {currentQuestion.options.map((opt: string, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-border bg-accent/50 text-lg font-medium">
                        {opt}
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button size="lg" onClick={nextQuestion} className="gap-2">
                      {questionIndex < totalQuestions - 1 ? (
                        <>Next Question <SkipForward className="w-5 h-5" /></>
                      ) : (
                        <>Show Final Results <Trophy className="w-5 h-5" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {status === "finished" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                    <Trophy className="w-12 h-12 text-yellow-500" />
                  </div>
                  <h3 className="text-3xl font-bold">Quiz Finished!</h3>
                  <p className="text-muted-foreground">The session has ended. Check the final leaderboard.</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
          
        </div>

        {/* Right Column - Participants & Leaderboard */}
        <div className="w-1/3 flex flex-col gap-6">
          <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border/50 shrink-0">
              <CardTitle className="flex items-center gap-2">
                {status === "finished" || status === "active" ? (
                  <><Trophy className="w-5 h-5 text-yellow-500" /> Live Leaderboard</>
                ) : (
                  <><Users className="w-5 h-5 text-blue-500" /> Participants ({participants.length})</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {(status === "finished" || status === "active" ? leaderboard : participants).map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          (status === "finished" || status === "active") && index === 0 ? "bg-yellow-500 text-yellow-950" :
                          (status === "finished" || status === "active") && index === 1 ? "bg-gray-300 text-gray-900" :
                          (status === "finished" || status === "active") && index === 2 ? "bg-amber-600 text-amber-950" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {(status === "finished" || status === "active") ? index + 1 : p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                      {(status === "finished" || status === "active") && (
                        <span className="font-bold font-mono">{p.score}</span>
                      )}
                    </motion.div>
                  ))}
                  
                  {participants.length === 0 && status === "waiting" && (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                      Waiting for players to join...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
