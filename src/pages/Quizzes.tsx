import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Plus, Play, Edit, Trash2, Clock, BarChart } from "lucide-react";
import { useQuizStore } from "@/src/store/quizStore";
import { useNavigate } from "react-router-dom";

export function Quizzes() {
  const { quizzes, fetchQuizzes, deleteQuiz } = useQuizStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quizzes</h2>
          <p className="text-muted-foreground mt-2">Manage your quiz library and create new ones.</p>
        </div>
        <Button className="gap-2">
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
                <Button variant="outline" size="icon" className="shrink-0">
                  <Edit className="w-4 h-4" />
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
        <Card className="bg-card/20 border-dashed border-2 border-border/50 hover:border-primary/50 hover:bg-card/40 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px]">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Create New Quiz</h3>
          <p className="text-sm text-muted-foreground mt-1">Start from scratch or use AI</p>
        </Card>
      </div>
    </div>
  );
}
