import React from 'react';
import { Day, UserState } from '../types';

interface BurndownChartProps {
  curriculum: Day[];
  userState: UserState;
}

const BurndownChart: React.FC<BurndownChartProps> = ({ curriculum, userState }) => {
  // Calculate Data Points
  const totalTasks = curriculum.reduce((acc, day) => acc + day.tasks.length, 0);
  const totalDays = curriculum.length;
  
  // Calculate Ideal Path (Linear Drop)
  // Day 0 = Total, Day 7 = 0
  const idealPoints = [];
  for (let i = 0; i <= totalDays; i++) {
    const y = totalTasks - (totalTasks / totalDays) * i;
    idealPoints.push({ x: i, y });
  }

  // Calculate Actual Path (Remaining Tasks per "Completed Day Block")
  // We assume X-axis maps to "End of Day X".
  // Point 0 is Total.
  // Point 1 is Total - (Tasks Completed in Day 1 of Curriculum)
  // This shows if we are keeping up with the curriculum structure.
  const actualPoints = [{ x: 0, y: totalTasks }];
  let runningCompleted = 0;

  curriculum.forEach((day, index) => {
    // Count how many tasks in THIS day are actually done
    const dayTasksCompleted = day.tasks.filter(t => userState.completedTaskIds.includes(t.id)).length;
    runningCompleted += dayTasksCompleted;
    actualPoints.push({ x: index + 1, y: totalTasks - runningCompleted });
  });

  // SVG Dimensions
  const width = 800;
  const height = 200;
  const padding = 30;
  
  const xScale = (width - padding * 2) / totalDays;
  const yScale = (height - padding * 2) / totalTasks;

  const getCoord = (x: number, y: number) => {
    return `${padding + x * xScale},${height - padding - y * yScale}`;
  };

  const idealPath = idealPoints.map(p => getCoord(p.x, p.y)).join(' ');
  const actualPath = actualPoints.map(p => getCoord(p.x, p.y)).join(' ');

  return (
    <div className="w-full h-64 bg-slate-900/80 rounded-xl border border-white/10 p-4 relative overflow-hidden backdrop-blur-md shadow-2xl group">
      <div className="absolute top-4 left-4 z-10">
         <h3 className="text-neon-cyan font-mono text-sm tracking-widest uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
            Mission Trajectory
         </h3>
         <div className="text-[10px] text-slate-500 font-mono mt-1">IDEAL VS ACTUAL VELOCITY</div>
      </div>

      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Subtle Grid Lines */}
        {idealPoints.map((p, i) => (
           <line 
             key={i} 
             x1={padding + i * xScale} 
             y1={padding} 
             x2={padding + i * xScale} 
             y2={height - padding} 
             stroke="#334155" 
             strokeWidth="0.5"
             strokeDasharray="4,4"
             opacity="0.3"
           />
        ))}
        {/* Horizontal Baseline */}
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#334155" strokeWidth="1" />

        {/* Ideal Line - Neon Pink */}
        <polyline 
          points={idealPath} 
          fill="none" 
          stroke="#d946ef" 
          strokeWidth="2" 
          strokeDasharray="6,4" 
          opacity="0.8"
        />

        {/* Actual Line - Glowing Cyan */}
        <polyline 
          points={actualPath} 
          fill="none" 
          stroke="#06b6d4" 
          strokeWidth="3" 
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]"
        />

        {/* Actual Data Points */}
        {actualPoints.map((p, i) => (
          <circle 
            key={i} 
            cx={padding + p.x * xScale} 
            cy={height - padding - p.y * yScale} 
            r="4" 
            fill="#0f172a" 
            stroke="#06b6d4" 
            strokeWidth="2" 
            className="transition-all duration-300 hover:r-6"
          />
        ))}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-2 right-4 flex gap-4 text-[10px] font-mono">
         <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-neon-pink border-t border-dashed border-neon-pink opacity-80"></div>
            <span className="text-neon-pink">PROJECTED</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-neon-cyan shadow-[0_0_5px_cyan]"></div>
            <span className="text-neon-cyan">ACTUAL</span>
         </div>
      </div>
    </div>
  );
};

export default BurndownChart;