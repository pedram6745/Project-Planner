import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { summarizeJournal } from '../services/geminiService';
import { IconBook, IconSpark } from './Icons';

interface ChronoLogProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
}

const ChronoLog: React.FC<ChronoLogProps> = ({ entries, onAddEntry }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLog = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
    try {
      const summary = await summarizeJournal(input);
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        originalText: input,
        summary,
        timestamp: Date.now()
      };
      onAddEntry(newEntry);
      setInput('');
    } catch (e) {
      alert("Failed to process log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in max-w-4xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
          <IconBook className="w-6 h-6" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-white font-mono">CHRONO-LOG</h2>
           <p className="text-sm text-slate-400">Smart mission journaling with AI synthesis.</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 mb-8">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Captain's Log: What did you learn today? What challenges did you face? (AI will summarize this for you)"
          className="w-full h-24 bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button 
            onClick={handleLog}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <IconSpark className="w-4 h-4" />}
            LOG ENTRY
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {entries.length === 0 && <div className="text-center text-slate-600 italic py-10">No logs recorded yet.</div>}
        {entries.map(entry => (
          <div key={entry.id} className="relative pl-8 border-l border-white/10">
            <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
            <div className="mb-1 text-xs font-mono text-purple-400">{new Date(entry.timestamp).toLocaleString()}</div>
            
            <div className="bg-slate-900 border border-white/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-950/50 p-3 rounded border-l-2 border-neon-cyan">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">KEY INSIGHT</div>
                  <div className="text-sm text-slate-300">{entry.summary.insight}</div>
                </div>
                <div className="bg-slate-950/50 p-3 rounded border-l-2 border-neon-pink">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">ACTION ITEM</div>
                  <div className="text-sm text-slate-300">{entry.summary.action}</div>
                </div>
                <div className="bg-slate-950/50 p-3 rounded border-l-2 border-yellow-500">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">REVIEW</div>
                  <div className="text-sm text-slate-300">{entry.summary.concept}</div>
                </div>
              </div>
              
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer hover:text-slate-300 transition-colors">View Original Log</summary>
                <p className="mt-2 pl-2 border-l border-slate-700 italic">{entry.originalText}</p>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChronoLog;