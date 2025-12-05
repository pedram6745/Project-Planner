import React from 'react';
import { SkillCategory, UserState } from '../types';

interface SkillRadarProps {
  skills: UserState['skills'];
}

const SkillRadar: React.FC<SkillRadarProps> = ({ skills }) => {
  // Max points per skill expected roughly for Level 5
  const MAX_VAL = 300; 
  
  const width = 200;
  const height = 200;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 70;

  // Axes: SQL (Top), Agile (Right), Strategy (Bottom), Excel (Left)
  const axes = [
    { label: 'SQL', key: SkillCategory.SQL, angle: -Math.PI / 2 },
    { label: 'AGILE', key: SkillCategory.AGILE, angle: 0 },
    { label: 'STRAT', key: SkillCategory.STRATEGY, angle: Math.PI / 2 },
    { label: 'EXCEL', key: SkillCategory.EXCEL, angle: Math.PI },
  ];

  // Calculate polygon points
  const points = axes.map(axis => {
    const value = Math.min(skills[axis.key], MAX_VAL);
    const scale = value / MAX_VAL;
    const r = radius * scale; // Min radius 10 so it's visible
    const x = centerX + r * Math.cos(axis.angle);
    const y = centerY + r * Math.sin(axis.angle);
    return `${x},${y}`;
  }).join(' ');

  const bgPoints = axes.map(axis => {
    const x = centerX + radius * Math.cos(axis.angle);
    const y = centerY + radius * Math.sin(axis.angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col items-center">
      <h3 className="font-mono text-xs text-slate-400 mb-2 tracking-widest">OFFICER SKILLS</h3>
      <svg width={width} height={height} className="overflow-visible">
        {/* Background Web */}
        <polygon points={bgPoints} fill="none" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#1e293b" strokeDasharray="4,4" />
        
        {/* Axis Lines */}
        {axes.map((axis, i) => {
           const x = centerX + radius * Math.cos(axis.angle);
           const y = centerY + radius * Math.sin(axis.angle);
           return <line key={i} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#334155" strokeWidth="1" />;
        })}

        {/* Data Polygon */}
        <polygon 
          points={points} 
          fill="rgba(217, 70, 239, 0.2)" 
          stroke="#d946ef" 
          strokeWidth="2" 
          className="drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] transition-all duration-1000 ease-out"
        />
        
        {/* Labels */}
        {axes.map((axis, i) => {
           const labelR = radius + 20;
           const x = centerX + labelR * Math.cos(axis.angle);
           const y = centerY + labelR * Math.sin(axis.angle);
           return (
             <text 
               key={i} 
               x={x} 
               y={y} 
               textAnchor="middle" 
               dominantBaseline="middle" 
               className="fill-slate-400 text-[10px] font-mono"
             >
               {axis.label}
             </text>
           );
        })}
      </svg>
      <div className="mt-2 text-[10px] text-slate-600 font-mono">
         TOTAL XP: {Object.values(skills).reduce((a,b) => a+b, 0)}
      </div>
    </div>
  );
};

export default SkillRadar;