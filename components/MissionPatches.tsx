import React from 'react';
import { Achievement, UserState } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';
import { IconBadge, IconTrophy, IconBrain, IconPlay, IconTerminal, IconCheck } from './Icons';

interface MissionPatchesProps {
  unlockedIds: string[];
}

const MissionPatches: React.FC<MissionPatchesProps> = ({ unlockedIds }) => {
  
  const getIcon = (type: Achievement['icon']) => {
    switch(type) {
      case 'DIVER': return <IconBrain className="w-8 h-8" />;
      case 'TIME': return <IconPlay className="w-8 h-8" />;
      case 'SQL': return <IconTerminal className="w-8 h-8" />;
      case 'STREAK': return <IconTrophy className="w-8 h-8" />;
      case 'FIRST': return <IconCheck className="w-8 h-8" />;
      default: return <IconBadge className="w-8 h-8" />;
    }
  };

  return (
    <div className="p-4 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white font-mono mb-2">MISSION PATCHES</h2>
        <p className="text-slate-400">Service records and commendations.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {ACHIEVEMENTS_LIST.map(achievement => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          
          return (
            <div 
              key={achievement.id}
              className={`relative group aspect-square rounded-full border-2 flex flex-col items-center justify-center p-4 text-center transition-all duration-500 ${
                isUnlocked 
                  ? 'bg-slate-800/50 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] scale-100' 
                  : 'bg-slate-900 border-slate-800 opacity-50 grayscale scale-95'
              }`}
            >
              <div className={`mb-3 ${isUnlocked ? 'text-yellow-400 drop-shadow-md' : 'text-slate-600'}`}>
                {getIcon(achievement.icon)}
              </div>
              <h3 className={`font-mono text-xs font-bold uppercase mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                {achievement.title}
              </h3>
              
              {/* Tooltip on Hover */}
              <div className="absolute inset-0 bg-slate-900/95 rounded-full flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <p className="text-[10px] text-slate-300">{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center text-xs font-mono text-slate-600">
        UNLOCKED: {unlockedIds.length} / {ACHIEVEMENTS_LIST.length}
      </div>
    </div>
  );
};

export default MissionPatches;