import React, { useState, useEffect, useCallback } from 'react';
import { IconPlay, IconPause, IconRefresh } from './Icons';
import { getAiCoachingMessage } from '../services/geminiService';

const Pomodoro: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [message, setMessage] = useState<string | null>(null);

  const handleTimerComplete = useCallback(async () => {
    setIsActive(false);
    if (mode === 'FOCUS') {
      const msg = await getAiCoachingMessage();
      setMessage(msg);
      setMode('BREAK');
      setTimeLeft(5 * 60);
    } else {
      setMode('FOCUS');
      setTimeLeft(25 * 60);
      setMessage(null);
    }
  }, [mode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, handleTimerComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
    setMessage(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
      <h3 className="text-neon-cyan font-mono text-sm tracking-widest uppercase mb-2">
        {mode === 'FOCUS' ? 'Mission Timer' : 'System Cooldown'}
      </h3>
      
      <div className={`text-5xl font-mono font-bold mb-6 ${mode === 'FOCUS' ? 'text-white' : 'text-neon-pink'}`}>
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className="p-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        >
          {isActive ? <IconPause className="w-6 h-6" /> : <IconPlay className="w-6 h-6" />}
        </button>
        <button 
          onClick={resetTimer}
          className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
        >
          <IconRefresh className="w-6 h-6" />
        </button>
      </div>

      {message && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center animate-pulse-slow z-20">
          <div className="text-neon-cyan font-mono text-xs mb-2">INCOMING TRANSMISSION</div>
          <p className="text-white text-lg font-bold leading-relaxed">"{message}"</p>
          <button 
            onClick={() => setMessage(null)} 
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm text-cyan-400"
          >
            DISMISS
          </button>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;