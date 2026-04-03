import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, default: 'Medium' },
  timePerQuestion: { type: Number, default: 20 },
  questions: [questionSchema]
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema);
