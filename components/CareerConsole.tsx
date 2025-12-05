import React, { useState } from 'react';
import { optimizeResumeBullet, getInterviewQuestion, evaluateInterviewAnswer } from '../services/geminiService';
import { IconBriefcase, IconSpark, IconUser, IconMessage, IconCheck } from './Icons';
import { CareerState } from '../types';

interface CareerConsoleProps {
  careerState: CareerState;
  updateCareerState: (updates: Partial<CareerState>) => void;
}

const CareerConsole: React.FC<CareerConsoleProps> = ({ careerState, updateCareerState }) => {
  const [subTab, setSubTab] = useState<'RESUME' | 'INTERVIEW'>('RESUME');
  
  // Resume State (Use prop for persistence)
  const resumeInput = careerState.resumeDraft;
  const setResumeInput = (val: string) => updateCareerState({ resumeDraft: val });
  
  const [resumeResult, setResumeResult] = useState<{critique: string, rewrite: string} | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);

  // Interview State
  const [attribute, setAttribute] = useState('Googleyness & Leadership');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const handleOptimize = async () => {
    if (!resumeInput.trim()) return;
    setLoadingResume(true);
    const result = await optimizeResumeBullet(resumeInput);
    setResumeResult(result);
    setLoadingResume(false);
  };

  const handleGetQuestion = async () => {
    setLoadingInterview(true);
    setFeedback('');
    setAnswer('');
    const q = await getInterviewQuestion(attribute);
    setQuestion(q);
    setLoadingInterview(false);
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    const result = await evaluateInterviewAnswer(question, answer);
    setFeedback(result);
    setEvaluating(false);
    
    // Update simple stats
    updateCareerState({
      interviewStats: {
        questionsAnswered: careerState.interviewStats.questionsAnswered + 1,
        lastScore: 0 // In a real app we'd parse the score
      }
    });
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in max-w-5xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
          <IconBriefcase className="w-6 h-6" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-white font-mono">CAREER CONSOLE</h2>
           <p className="text-sm text-slate-400">Google Career Guide: Resume Optimization & Interview Simulator</p>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setSubTab('RESUME')}
          className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all font-mono text-sm ${
            subTab === 'RESUME' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/50 border-white/5 text-slate-500 hover:bg-slate-800'
          }`}
        >
          <IconBriefcase className="w-4 h-4" /> RESUME OPTIMIZER (XYZ FORMULA)
        </button>
        <button 
          onClick={() => setSubTab('INTERVIEW')}
          className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all font-mono text-sm ${
            subTab === 'INTERVIEW' ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-slate-800/50 border-white/5 text-slate-500 hover:bg-slate-800'
          }`}
        >
          <IconUser className="w-4 h-4" /> INTERVIEW SIMULATOR
        </button>
      </div>

      <div className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl p-6 overflow-y-auto">
        
        {/* RESUME MODE */}
        {subTab === 'RESUME' && (
          <div className="space-y-6">
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg">
              <h4 className="font-bold text-blue-400 mb-2 text-sm uppercase tracking-wider">The Google XYZ Formula</h4>
              <p className="text-sm text-slate-300 italic">"Accomplished [X] as measured by [Y], by doing [Z]."</p>
              <p className="text-xs text-slate-500 mt-2">Paste a bullet point below to rewrite it in this format.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-slate-400">ORIGINAL BULLET POINT</label>
              <textarea 
                value={resumeInput}
                onChange={(e) => setResumeInput(e.target.value)}
                placeholder="e.g. Increased sales by selling more widgets to customers..."
                className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleOptimize}
                  disabled={loadingResume || !resumeInput.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 font-bold transition-all disabled:opacity-50"
                >
                  {loadingResume ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <IconSpark className="w-4 h-4" />}
                  OPTIMIZE
                </button>
              </div>
            </div>

            {resumeResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-slate-950 p-4 rounded-lg border border-red-500/30">
                  <h5 className="text-xs font-bold text-red-400 mb-2 uppercase">CRITIQUE</h5>
                  <p className="text-sm text-slate-300 leading-relaxed">{resumeResult.critique}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-green-500/30 relative">
                  <h5 className="text-xs font-bold text-green-400 mb-2 uppercase">REWRITE (XYZ)</h5>
                  <p className="text-sm text-white font-medium leading-relaxed">{resumeResult.rewrite}</p>
                  <button 
                     onClick={() => navigator.clipboard.writeText(resumeResult.rewrite)}
                     className="absolute top-4 right-4 text-xs text-slate-500 hover:text-white"
                  >
                    COPY
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTERVIEW MODE */}
        {subTab === 'INTERVIEW' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-mono text-slate-400 mb-2">TARGET ATTRIBUTE</label>
                <select 
                  value={attribute}
                  onChange={(e) => setAttribute(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500"
                >
                  <option>Googleyness & Leadership</option>
                  <option>General Cognitive Ability</option>
                  <option>Role-Related Knowledge</option>
                  <option>Product Design & Strategy</option>
                  <option>Analytical & Estimation</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleGetQuestion}
                  disabled={loadingInterview}
                  className="w-full md:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingInterview ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <IconMessage className="w-4 h-4" />}
                  GENERATE QUESTION
                </button>
              </div>
            </div>

            {question && (
              <div className="bg-slate-800 p-6 rounded-lg border-l-4 border-green-500 animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4">"{question}"</h3>
                
                <textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here (Use STAR method: Situation, Task, Action, Result)..."
                  className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500 placeholder:text-slate-600 resize-none mb-4"
                />
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleEvaluate}
                    disabled={evaluating || !answer.trim()}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 font-bold transition-all disabled:opacity-50"
                  >
                    {evaluating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <IconCheck className="w-4 h-4" />}
                    EVALUATE ANSWER
                  </button>
                </div>
              </div>
            )}

            {feedback && (
              <div className="bg-slate-950 p-6 rounded-lg border border-white/10 animate-fade-in">
                <h4 className="font-mono text-sm text-green-400 mb-4 uppercase tracking-wider">Bar Raiser Feedback</h4>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
                  {feedback}
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between text-xs font-mono text-slate-500">
               <span>SIMULATIONS COMPLETED: {careerState.interviewStats.questionsAnswered}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CareerConsole;