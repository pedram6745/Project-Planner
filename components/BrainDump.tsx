import React, { useState } from 'react';
import { IconTerminal } from './Icons';
import { BrainDumpItem, UserState } from '../types';

interface BrainDumpProps {
  items: BrainDumpItem[];
  setItems: (items: BrainDumpItem[]) => void;
}

const BrainDump: React.FC<BrainDumpProps> = ({ items, setItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const handleAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      const newItem: BrainDumpItem = {
        id: Date.now().toString(),
        text: input.trim(),
        timestamp: Date.now()
      };
      setItems([newItem, ...items]);
      setInput('');
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'h-64' : 'h-10'}`}>
      {/* Tab Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-full left-8 bg-slate-900 border-t border-l border-r border-neon-cyan/30 text-neon-cyan px-4 py-2 rounded-t-lg cursor-pointer flex items-center gap-2 font-mono text-xs hover:bg-slate-800"
      >
        <IconTerminal className="w-4 h-4" />
        <span>BRAIN_DUMP {items.length > 0 && `(${items.length})`}</span>
      </div>

      {/* Console Body */}
      <div className="h-full bg-slate-950 border-t border-neon-cyan/30 p-4 font-mono text-sm text-green-400 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-2 space-y-1">
          {items.length === 0 && <div className="text-slate-600 italic">No distractions logged. Systems focus is optimal.</div>}
          {items.map(item => (
            <div key={item.id} className="flex gap-2 group">
              <span className="text-slate-600 shrink-0">[{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
              <span className="text-slate-300 group-hover:text-white">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-neon-cyan border-t border-white/10 pt-2">
          <span>&gt;</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleAdd}
            placeholder="Type distraction here to offload it..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-600"
          />
        </div>
      </div>
    </div>
  );
};

export default BrainDump;