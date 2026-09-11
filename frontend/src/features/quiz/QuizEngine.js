// Quiz Engine
import { shuffleArray } from '../../core/utils';

export function createQuizEngine(questions = []) {
  return {
    questions: shuffleArray([...questions]),
    currentIndex: 0,
    score: 0,
    answers: [],
    completed: false,
  };
}

export function getCurrentQuestion(engine) {
  if (engine.currentIndex >= engine.questions.length) return null;
  return engine.questions[engine.currentIndex];
}

export function submitAnswer(engine, answerIndex) {
  const question = getCurrentQuestion(engine);
  if (!question) return { correct: false, completed: true };

  const correct = answerIndex === question.correctIndex;
  if (correct) engine.score += 1;
  
  engine.answers.push({
    questionId: question.id || engine.currentIndex,
    answerIndex,
    correct,
    time: Date.now(),
  });

  engine.currentIndex += 1;
  
  if (engine.currentIndex >= engine.questions.length) {
    engine.completed = true;
  }

  return {
    correct,
    score: engine.score,
    total: engine.questions.length,
    completed: engine.completed,
    correctAnswer: question.correctIndex,
  };
}

export function resetQuiz(engine) {
  engine.currentIndex = 0;
  engine.score = 0;
  engine.answers = [];
  engine.completed = false;
  engine.questions = shuffleArray([...engine.questions]);
}

export function getProgress(engine) {
  const total = engine.questions.length;
  const current = total === 0 ? 0 : Math.min(engine.currentIndex + 1, total);
  return {
    current,
    total,
    percent: total > 0
      ? Math.round((Math.min(engine.currentIndex, total) / total) * 100)
      : 0,
  };
}

export function getResults(engine) {
  return {
    score: engine.score,
    total: engine.questions.length,
    percent: engine.questions.length > 0 
      ? Math.round((engine.score / engine.questions.length) * 100)
      : 0,
    answers: engine.answers,
  };
}

// Practice Mode Engine
export function createPracticeEngine(questions = []) {
  return {
    ...createQuizEngine(questions),
    hintsUsed: 0,
    showHint: false,
  };
}

export function useHint(engine) {
  if (engine.hintsUsed >= 3) return null;
  engine.hintsUsed += 1;
  engine.showHint = true;
  return engine.questions[engine.currentIndex]?.hints?.[engine.hintsUsed - 1] || null;
}

export function showSolution(engine) {
  engine.showHint = false;
  return engine.questions[engine.currentIndex]?.solution || null;
}

export default {
  createQuizEngine,
  getCurrentQuestion,
  submitAnswer,
  resetQuiz,
  getProgress,
  getResults,
  createPracticeEngine,
  useHint,
  showSolution,
};