import React, { useState, useEffect } from 'react';
import { QuizQuestion, Task } from '../types';
import { generateDailyQuiz } from '../services/geminiService';
import { IconClipboard, IconCheck, IconX } from './Icons';

interface DailyDebriefProps {
  dayId: number;
  tasks: Task[];
  onComplete: () => void;
  onClose: () => void;
}

const DailyDebrief: React.FC<DailyDebriefProps> = ({ dayId, tasks, onComplete, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      const quiz = await generateDailyQuiz(tasks);
      setQuestions(quiz);
      setAnswers(new Array(quiz.length).fill(-1));
      setLoading(false);
    };
    loadQuiz();
  }, [dayId, tasks]);

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswerIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    
    if (correct === questions.length) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-neon-cyan/50 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <IconX className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-neon-cyan/10 rounded-full text-neon-cyan mb-4">
            <IconClipboard className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-mono font-bold text-white tracking-widest">MISSION DEBRIEF: DAY 0{dayId}</h2>
          <p className="text-slate-400">Verify knowledge retention to log this mission as MASTERED.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
             <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
             <div className="text-neon-cyan font-mono animate-pulse">GENERATING ASSESSMENT...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-800/50 p-6 rounded-lg border border-white/5">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">{idx + 1}. {q.question}</h3>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    let btnClass = "w-full text-left p-3 rounded border transition-all ";
                    
                    if (submitted) {
                      if (optIdx === q.correctAnswerIndex) btnClass += "bg-green-500/20 border-green-500 text-green-300";
                      else if (answers[idx] === optIdx) btnClass += "bg-red-500/20 border-red-500 text-red-300";
                      else btnClass += "bg-slate-900/50 border-white/5 text-slate-500";
                    } else {
                      if (answers[idx] === optIdx) btnClass += "bg-neon-cyan/20 border-neon-cyan text-neon-cyan";
                      else btnClass += "bg-slate-900/50 border-white/10 hover:bg-slate-800 hover:border-slate-600";
                    }

                    return (
                      <button 
                        key={optIdx} 
                        onClick={() => handleSelect(idx, optIdx)}
                        className={btnClass}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted ? (
              <button 
                onClick={handleSubmit}
                disabled={answers.includes(-1)}
                className="w-full py-4 bg-neon-cyan text-slate-900 font-bold font-mono text-lg rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SUBMIT FOR REVIEW
              </button>
            ) : (
              <div className="text-center animate-fade-in">
                <div className={`text-xl font-bold font-mono mb-2 ${score === questions.length ? 'text-green-400' : 'text-red-400'}`}>
                  SCORE: {score}/{questions.length}
                </div>
                {score === questions.length ? (
                  <div className="text-green-400">EXCELLENT WORK. MISSION MASTERED.</div>
                ) : (
                  <button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white">
                    RETURN TO STUDY
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyDebrief;