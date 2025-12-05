import React, { useState } from 'react';
import { generateTemplate } from '../services/geminiService';
import { IconHammer, IconSpark, IconCopy, IconCheck } from './Icons';

const ArtifactForge: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Product Requirements Document (PRD)');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const template = await generateTemplate(topic, type);
    setResult(template);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
          <IconHammer className="w-6 h-6" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-white font-mono">ARTIFACT FORGE</h2>
           <p className="text-sm text-slate-400">Generate structural templates for your PM documents.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Controls */}
        <div className="lg:w-1/3 space-y-4">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">ARTIFACT TYPE</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500"
              >
                <option>Product Requirements Document (PRD)</option>
                <option>User Story Mapping</option>
                <option>Go-To-Market Strategy</option>
                <option>Sprint Retrospective</option>
                <option>Competitive Analysis</option>
                <option>Press Release (PR/FAQ)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">TARGET SUBJECT</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. A mobile app for dog walkers..."
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 placeholder:text-slate-600 resize-none"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <IconSpark className="w-5 h-5" />
              )}
              FABRICATE
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="lg:w-2/3 bg-slate-950 rounded-xl border border-white/10 relative overflow-hidden flex flex-col">
          <div className="bg-slate-900 px-4 py-2 border-b border-white/5 flex justify-between items-center">
            <span className="text-xs font-mono text-slate-500">OUTPUT.MD</span>
            {result && (
              <button 
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white"
              >
                {copied ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            )}
          </div>
          <div className="flex-1 p-6 overflow-y-auto font-mono text-sm text-slate-300 whitespace-pre-wrap">
             {result || <span className="text-slate-600 italic">// Waiting for input... Artifact will materialize here.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactForge;