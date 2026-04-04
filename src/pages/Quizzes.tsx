import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Plus, Play, Edit, Trash2, Clock, BarChart, Sparkles, X, Loader2 } from "lucide-react";
import { useQuizStore } from "@/src/store/quizStore";
import { useNavigate } from "react-router-dom";

export function Quizzes() {
  const { quizzes, fetchQuizzes, deleteQuiz, generateQuiz, isGenerating } = useQuizStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    try {
      await generateQuiz(topic, difficulty, questionCount);
      setIsModalOpen(false);
      setTopic("");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to generate quiz. Please try again.";
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quizzes</h2>
          <p className="text-muted-foreground mt-2">Manage your quiz library and create new ones.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Quiz
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">{quiz.description}</CardDescription>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  quiz.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                  quiz.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {quiz.difficulty}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <BarChart className="w-4 h-4" />
                  {quiz.questions.length} Qs
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {quiz.timePerQuestion}s / Q
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate(`/live?quizId=${quiz.id}`)}
                >
                  <Play className="w-4 h-4" />
                  Host Live
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Empty State / Create New Card */}
        <Card 
          onClick={() => setIsModalOpen(true)}
          className="bg-card/20 border-dashed border-2 border-border/50 hover:border-primary/50 hover:bg-card/40 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px]"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Create New Quiz</h3>
          <p className="text-sm text-muted-foreground mt-1">Start from scratch or use AI</p>
        </Card>
      </div>

      {/* Create Quiz Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-background border-border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Generate Quiz with AI
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} disabled={isGenerating}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g. History of Rome, React JS, Movies..." 
                  className="w-full p-2 rounded-md bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select 
                    className="w-full p-2 rounded-md bg-secondary border border-border focus:border-primary outline-none"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={isGenerating}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions</label>
                  <select 
                    className="w-full p-2 rounded-md bg-secondary border border-border focus:border-primary outline-none"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
              </div>

              <Button 
                className="w-full mt-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" 
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
