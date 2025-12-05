import React, { useState, useEffect, useRef } from 'react';
import { getChatSession } from '../services/geminiService';
import { IconSend, IconX, IconMessage, IconSpark, IconSearch, IconCpu, IconBrain } from './Icons';
import { GenerateContentResponse } from '@google/genai';
import { ChatMode } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string | null;
  onClearInitialMessage: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, initialMessage, onClearInitialMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Comms link established. I am your AI Mission Support. How can I assist with your objectives today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('STANDARD');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && initialMessage) {
       handleSend(initialMessage);
       onClearInitialMessage();
    }
  }, [isOpen, initialMessage]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = getChatSession(mode);
      const result = await chat.sendMessageStream({ message: text });
      
      const botMsgId = (Date.now() + 1).toString();
      let fullText = '';
      let sources: { title: string; uri: string }[] = [];
      
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of result) {
         const c = chunk as GenerateContentResponse;
         const textChunk = c.text || '';
         fullText += textChunk;

         // Extract Grounding Metadata if available (for Search Mode)
         if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            c.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
               if (chunk.web) {
                 sources.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri || '#' });
               }
            });
         }

         setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText, sources: sources.length > 0 ? sources : undefined } : m));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Signal interruption detected. Please retry transmission." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: ChatMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    // Add a system message indicating mode switch
    setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: `Switched to ${newMode} mode. ${newMode === 'THINKING' ? 'Deep reasoning enabled.' : newMode === 'SEARCH' ? 'Uplink to global network established.' : 'Standard protocols active.'}`
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[550px] bg-slate-900 border shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-2xl flex flex-col z-50 overflow-hidden animate-fade-in ${
        mode === 'THINKING' ? 'border-neon-pink/50 shadow-neon-pink/10' : 
        mode === 'SEARCH' ? 'border-green-500/50 shadow-green-500/10' : 
        'border-neon-cyan/50 shadow-neon-cyan/10'
    }`}>
      {/* Header */}
      <div className="bg-slate-800/90 p-3 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconSpark className={`w-5 h-5 ${
                mode === 'THINKING' ? 'text-neon-pink' : 
                mode === 'SEARCH' ? 'text-green-400' : 
                'text-neon-cyan'
            }`} />
            <h3 className="font-mono text-sm font-bold text-white tracking-wide">AI MISSION SUPPORT</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg">
           <button 
             onClick={() => handleModeChange('STANDARD')}
             className={`flex-1 py-1.5 rounded text-[10px] font-mono flex items-center justify-center gap-1 transition-all ${
               mode === 'STANDARD' ? 'bg-slate-800 text-neon-cyan shadow-sm' : 'text-slate-500 hover:text-slate-300'
             }`}
             title="Standard Mentor"
           >
             <IconBrain className="w-3 h-3" /> MENTOR
           </button>
           <button 
             onClick={() => handleModeChange('THINKING')}
             className={`flex-1 py-1.5 rounded text-[10px] font-mono flex items-center justify-center gap-1 transition-all ${
               mode === 'THINKING' ? 'bg-slate-800 text-neon-pink shadow-sm' : 'text-slate-500 hover:text-slate-300'
             }`}
             title="Deep Thinking (Gemini 3.0 Pro)"
           >
             <IconCpu className="w-3 h-3" /> THINK
           </button>
           <button 
             onClick={() => handleModeChange('SEARCH')}
             className={`flex-1 py-1.5 rounded text-[10px] font-mono flex items-center justify-center gap-1 transition-all ${
               mode === 'SEARCH' ? 'bg-slate-800 text-green-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
             }`}
             title="Web Search (Gemini 2.5 Flash)"
           >
             <IconSearch className="w-3 h-3" /> WEB
           </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/90 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-neon-indigo/20 text-indigo-100 border border-indigo-500/30 rounded-br-none' 
                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
            {/* Grounding Sources */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 text-xs flex flex-wrap gap-2 max-w-[85%]">
                {msg.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-white/10 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/50 transition-colors"
                  >
                    <IconSearch className="w-3 h-3" />
                    {source.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-lg rounded-bl-none border border-white/5 flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${mode === 'THINKING' ? 'bg-neon-pink' : mode === 'SEARCH' ? 'bg-green-400' : 'bg-neon-cyan'}`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${mode === 'THINKING' ? 'bg-neon-pink' : mode === 'SEARCH' ? 'bg-green-400' : 'bg-neon-cyan'}`} style={{ animationDelay: '150ms' }}></div>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${mode === 'THINKING' ? 'bg-neon-pink' : mode === 'SEARCH' ? 'bg-green-400' : 'bg-neon-cyan'}`} style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800/50 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={mode === 'SEARCH' ? "Search the web..." : mode === 'THINKING' ? "Ask a complex question..." : "Transmit query..."}
            className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-slate-600"
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                mode === 'THINKING' ? 'bg-neon-pink/20 text-neon-pink hover:bg-neon-pink/30' : 
                mode === 'SEARCH' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 
                'bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30'
            }`}
          >
            <IconSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;