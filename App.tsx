import React, { useState, useEffect } from 'react';
import { Tab, Day, UserState, KanbanItem, Task, SubTask, SkillCategory, BrainDumpItem, JournalEntry } from './types';
import { INITIAL_CURRICULUM, INITIAL_KANBAN, LEVEL_THRESHOLD, ACHIEVEMENTS_LIST } from './constants';
import { IconCheck, IconWand, IconTrophy, IconLock, IconSettings, IconList, IconKanban, IconMessage, IconBrain, IconSpark, IconRefresh, IconHammer, IconBook, IconBadge, IconBriefcase } from './components/Icons';
import Pomodoro from './components/Pomodoro';
import Kanban from './components/Kanban';
import ChatBot from './components/ChatBot';
import BurndownChart from './components/BurndownChart';
import SkillRadar from './components/SkillRadar';
import BrainDump from './components/BrainDump';
import SoundController from './components/SoundController';
import DailyDebrief from './components/DailyDebrief';
import ArtifactForge from './components/ArtifactForge';
import MissionPatches from './components/MissionPatches';
import ChronoLog from './components/ChronoLog';
import CareerConsole from './components/CareerConsole';
import { breakDownTaskWithAI, generateCurriculum } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CURRICULUM);
  const [selectedDayId, setSelectedDayId] = useState<number>(1);
  const [showDebriefDayId, setShowDebriefDayId] = useState<number | null>(null);
  
  // Load Curriculum from LocalStorage or use Default
  const [curriculum, setCurriculum] = useState<Day[]>(() => {
    const saved = localStorage.getItem('pm_mission_control_curriculum_v2');
    return saved ? JSON.parse(saved) : INITIAL_CURRICULUM;
  });
  
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('pm_mission_control_state_v3');
    // Migration for older versions or init
    const defaultState: UserState = {
      xp: 0,
      level: 1,
      completedTaskIds: [],
      kanbanItems: INITIAL_KANBAN,
      skills: { [SkillCategory.SQL]: 0, [SkillCategory.AGILE]: 0, [SkillCategory.STRATEGY]: 0, [SkillCategory.EXCEL]: 0 },
      brainDump: [],
      verifiedDayIds: [],
      journal: [],
      unlockedAchievements: [],
      career: { resumeDraft: '', interviewStats: { questionsAnswered: 0, lastScore: 0 } },
      stats: { aiUsageCount: 0, pomodoroCount: 0, daysCompletedCount: 0 }
    };
    
    if (saved) {
       const parsed = JSON.parse(saved);
       // Merge in case of new fields
       return { ...defaultState, ...parsed, stats: { ...defaultState.stats, ...(parsed.stats || {}) }, career: { ...defaultState.career, ...(parsed.career || {}) } };
    }
    return defaultState;
  });

  const [loadingBreakdown, setLoadingBreakdown] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);
  
  // Mission Uplink State
  const [uplinkPrompt, setUplinkPrompt] = useState('');
  const [isUplinkLoading, setIsUplinkLoading] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('pm_mission_control_state_v3', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    localStorage.setItem('pm_mission_control_curriculum_v2', JSON.stringify(curriculum));
  }, [curriculum]);

  // Achievement Check Effect
  useEffect(() => {
    const newUnlocks: string[] = [];
    const stats = userState.stats;
    const currentUnlocks = userState.unlockedAchievements;

    // Check specific conditions
    if (!currentUnlocks.includes('first_step') && userState.completedTaskIds.length > 0) newUnlocks.push('first_step');
    if (!currentUnlocks.includes('deep_diver') && stats.aiUsageCount >= 5) newUnlocks.push('deep_diver');
    if (!currentUnlocks.includes('time_lord') && stats.pomodoroCount >= 5) newUnlocks.push('time_lord');
    if (!currentUnlocks.includes('streak_master') && userState.verifiedDayIds.length >= 3) newUnlocks.push('streak_master');
    
    // Check Day 1 & 2 completion for SQL Sorcerer
    const day1Done = curriculum.find(d => d.id === 1)?.tasks.every(t => userState.completedTaskIds.includes(t.id));
    const day2Done = curriculum.find(d => d.id === 2)?.tasks.every(t => userState.completedTaskIds.includes(t.id));
    if (day1Done && day2Done && !currentUnlocks.includes('sql_sorcerer')) newUnlocks.push('sql_sorcerer');

    if (newUnlocks.length > 0) {
      setUserState(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocks]
      }));
    }
  }, [userState.stats, userState.completedTaskIds, userState.verifiedDayIds, curriculum]);

  // --- Actions ---
  const handleCompleteTask = (task: Task, isSubTask = false) => {
    if (userState.completedTaskIds.includes(task.id)) return;

    setUserState(prev => {
      const newXp = prev.xp + (isSubTask ? 15 : task.xp);
      const newLevel = Math.floor(newXp / LEVEL_THRESHOLD) + 1;
      
      const newSkills = { ...prev.skills };
      if (!isSubTask) {
         newSkills[task.category] = (newSkills[task.category] || 0) + 25; 
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        skills: newSkills,
        completedTaskIds: [...prev.completedTaskIds, task.id]
      };
    });

    // Check if day is complete after this task
    if (!isSubTask) {
       // We need to wait for state update, so let's check manually
       const day = curriculum.find(d => d.tasks.some(t => t.id === task.id));
       if (day) {
         const allOtherTasksDone = day.tasks.every(t => t.id === task.id || userState.completedTaskIds.includes(t.id));
         if (allOtherTasksDone && !userState.verifiedDayIds.includes(day.id)) {
            // Trigger Debrief Modal
            setTimeout(() => setShowDebriefDayId(day.id), 500); 
         }
       }
    }
  };

  const handleMagicBreakdown = async (dayId: number, taskId: string, taskTitle: string) => {
    setLoadingBreakdown(taskId);
    try {
      const subTaskTitles = await breakDownTaskWithAI(taskTitle);
      const newSubTasks: SubTask[] = subTaskTitles.map((t, idx) => ({
        id: `${taskId}-sub-${Date.now()}-${idx}`,
        title: t,
        completed: false
      }));

      setCurriculum(prev => prev.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          tasks: day.tasks.map(task => {
            if (task.id !== taskId) return task;
            return { ...task, subTasks: newSubTasks };
          })
        };
      }));
      setUserState(prev => ({ ...prev, stats: { ...prev.stats, aiUsageCount: prev.stats.aiUsageCount + 1 } }));
    } finally {
      setLoadingBreakdown(null);
    }
  };

  const handleExplainTask = (taskTitle: string) => {
    setChatInitialMessage(`Explain the concept of "${taskTitle}" for a Product Manager. Why is it important?`);
    setIsChatOpen(true);
    setUserState(prev => ({ ...prev, stats: { ...prev.stats, aiUsageCount: prev.stats.aiUsageCount + 1 } }));
  };

  const updateBrainDump = (items: BrainDumpItem[]) => {
    setUserState(prev => ({ ...prev, brainDump: items }));
  };

  const handleMissionUplink = async () => {
    if (!uplinkPrompt.trim()) return;
    setIsUplinkLoading(true);
    try {
      const newPlan = await generateCurriculum(uplinkPrompt);
      setCurriculum(newPlan);
      setUserState(prev => ({
        ...prev,
        completedTaskIds: [],
        verifiedDayIds: []
      }));
      setUplinkPrompt('');
      setActiveTab(Tab.CURRICULUM);
      setSelectedDayId(1);
    } catch (error) {
      alert("Mission Uplink Failed: Unable to parse mission parameters.");
    } finally {
      setIsUplinkLoading(false);
    }
  };

  const handleDebriefComplete = () => {
    if (showDebriefDayId !== null) {
      setUserState(prev => ({
        ...prev,
        verifiedDayIds: [...prev.verifiedDayIds, showDebriefDayId],
        xp: prev.xp + 100 // Bonus XP for mastering day
      }));
      setShowDebriefDayId(null);
    }
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    setUserState(prev => ({
      ...prev,
      journal: [entry, ...prev.journal]
    }));
  };
  
  const updateCareerState = (newCareerState: Partial<UserState['career']>) => {
    setUserState(prev => ({
      ...prev,
      career: { ...prev.career, ...newCareerState }
    }));
  };

  const currentLevelProgress = (userState.xp % LEVEL_THRESHOLD) / LEVEL_THRESHOLD * 100;
  const selectedDay = curriculum.find(d => d.id === selectedDayId);
  const isDayVerified = selectedDay ? userState.verifiedDayIds.includes(selectedDay.id) : false;

  return (
    <div className="min-h-screen bg-space-900 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-neon-cyan selection:text-black">
      
      {/* Sound Controller */}
      <SoundController />

      {/* Daily Debrief Modal */}
      {showDebriefDayId !== null && (
        <DailyDebrief 
          dayId={showDebriefDayId} 
          tasks={curriculum.find(d => d.id === showDebriefDayId)?.tasks || []}
          onComplete={handleDebriefComplete}
          onClose={() => setShowDebriefDayId(null)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-white/5 flex flex-col z-20">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-mono text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">
            MISSION CONTROL
          </h1>
          <p className="text-xs text-slate-500 mt-1">PM TRAINING MODULE V3.1</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-mono text-slate-600 mb-2 px-2 uppercase tracking-wider">Operational</div>
          
          <button onClick={() => setActiveTab(Tab.CURRICULUM)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all ${activeTab === Tab.CURRICULUM ? 'bg-cyan-900/30 text-neon-cyan border border-cyan-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
            <IconList className="w-4 h-4" /> Curriculum
          </button>

          <button onClick={() => setActiveTab(Tab.KANBAN)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all ${activeTab === Tab.KANBAN ? 'bg-pink-900/30 text-neon-pink border border-pink-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
            <IconKanban className="w-4 h-4" /> Project Board
          </button>

          <div className="my-4 border-t border-white/5"></div>
          <div className="text-[10px] font-mono text-slate-600 mb-2 px-2 uppercase tracking-wider">Tools</div>

          <button onClick={() => setActiveTab(Tab.LOG)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all ${activeTab === Tab.LOG ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
            <IconBook className="w-4 h-4" /> Chrono-Log
          </button>

          <button onClick={() => setActiveTab(Tab.FORGE)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all ${activeTab === Tab.FORGE ? 'bg-orange-900/30 text-orange-400 border border-orange-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
            <IconHammer className="w-4 h-4" /> Artifact Forge
          </button>

          <button onClick={() => setActiveTab(Tab.CAREER)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all ${activeTab === Tab.CAREER ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
            <IconBriefcase className="w-4 h-4" /> Career Console
          </button>

          <div className="my-4 border-t border-white/5"></div>
          <div className="text-[10px] font-mono text-slate-600 mb-2 px-2 uppercase tracking-wider">Records</div>

          <button onClick={() => setActiveTab(Tab.PATCHES)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all ${activeTab === Tab.PATCHES ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
            <IconBadge className="w-4 h-4" /> Mission Patches
          </button>

          <button onClick={() => setActiveTab(Tab.SETTINGS)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-all ${activeTab === Tab.SETTINGS ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400'}`}>
            <IconSettings className="w-4 h-4" /> Settings
          </button>

          <div className="mt-4 pt-4 border-t border-white/5">
             <SkillRadar skills={userState.skills} />
          </div>
        </nav>

        {/* User Stats Widget */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">COMMANDER LVL {userState.level}</span>
            <IconTrophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-cyan to-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
          <div className="text-right text-[10px] text-slate-500 mt-1">{userState.xp} XP / {userState.level * LEVEL_THRESHOLD} XP</div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="font-mono text-sm text-slate-400">
             DATE: {new Date().toLocaleDateString()} | SYSTEM: ONLINE
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
               <span className="text-xs text-slate-500">AI LINKED</span>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-32">
          
          {/* Background Grid Decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-5" 
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>

          {/* New Feature Views */}
          {activeTab === Tab.FORGE && <ArtifactForge />}
          {activeTab === Tab.LOG && <ChronoLog entries={userState.journal} onAddEntry={handleAddJournalEntry} />}
          {activeTab === Tab.PATCHES && <MissionPatches unlockedIds={userState.unlockedAchievements} />}
          {activeTab === Tab.CAREER && <CareerConsole careerState={userState.career} updateCareerState={updateCareerState} />}
          
          {activeTab === Tab.CURRICULUM && (
            <>
               <div className="mb-8 animate-fade-in">
                  <BurndownChart curriculum={curriculum} userState={userState} />
               </div>
               
               <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                <div className="lg:w-1/4 space-y-2">
                  {curriculum.map(day => {
                    const tasksCompleted = day.tasks.every(t => userState.completedTaskIds.includes(t.id));
                    const verified = userState.verifiedDayIds.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayId(day.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                          selectedDayId === day.id 
                            ? 'bg-slate-800 border-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                            : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="relative z-10 flex justify-between items-center">
                          <div>
                            <div className={`text-xs font-mono mb-1 ${selectedDayId === day.id ? 'text-neon-cyan' : 'text-slate-500'}`}>DAY 0{day.id}</div>
                            <div className="font-bold text-slate-200">{day.title}</div>
                          </div>
                          {verified ? (
                            <IconBadge className="text-yellow-500 w-5 h-5" />
                          ) : tasksCompleted ? (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:w-1/2">
                  {selectedDay && (
                    <div className="animate-fade-in">
                      <div className="mb-6 flex justify-between items-start">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-1">{selectedDay.title}</h2>
                          <p className="text-neon-cyan font-mono text-sm">{selectedDay.theme}</p>
                        </div>
                        {isDayVerified && (
                           <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500 text-yellow-500 rounded text-xs font-mono tracking-widest flex items-center gap-2">
                              <IconBadge className="w-4 h-4" /> MASTERED
                           </div>
                        )}
                        {!isDayVerified && selectedDay.tasks.every(t => userState.completedTaskIds.includes(t.id)) && (
                           <button 
                             onClick={() => setShowDebriefDayId(selectedDay.id)}
                             className="px-4 py-2 bg-neon-cyan text-slate-900 font-bold text-xs rounded hover:bg-white transition-all animate-bounce"
                           >
                             INITIATE DEBRIEF
                           </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {selectedDay.tasks.map(task => {
                           const isCompleted = userState.completedTaskIds.includes(task.id);
                           const [startTime, endTime] = task.time.split(' - ');
                           
                           return (
                             <div key={task.id} className={`rounded-xl border transition-all duration-300 ease-out overflow-hidden transform hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-[0.99] ${isCompleted ? 'bg-slate-900/50 border-green-900/50 opacity-75' : 'bg-slate-800 border-white/10 hover:border-neon-cyan/40'}`}>
                                <div className="flex">
                                  <div className="w-20 md:w-24 shrink-0 bg-black/20 border-r border-white/5 flex flex-col items-center justify-center p-2 md:p-0">
                                     <div className="text-neon-cyan font-mono font-bold text-sm md:text-base">{startTime}</div>
                                     {endTime && <div className="text-slate-600 text-[10px] font-mono mt-1">{endTime}</div>}
                                     <div className="mt-2 text-[9px] font-mono bg-slate-700/50 px-1 rounded text-slate-400">{task.category}</div>
                                  </div>

                                  <div className="flex-1 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <h3 className={`font-semibold text-lg ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                          {task.title}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2">
                                          <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-yellow-500">+{task.xp} XP</span>
                                          {!isCompleted && !task.subTasks && (
                                            <>
                                              <button onClick={() => handleMagicBreakdown(selectedDay.id, task.id, task.title)} disabled={loadingBreakdown === task.id} className="text-xs flex items-center gap-1 text-neon-pink hover:text-white transition-colors disabled:opacity-50 ml-2">
                                                <IconWand className={`w-3 h-3 ${loadingBreakdown === task.id ? 'animate-spin' : ''}`} />
                                                {loadingBreakdown === task.id ? 'ANALYZING...' : 'BREAKDOWN'}
                                              </button>
                                              <button onClick={() => handleExplainTask(task.title)} className="text-xs flex items-center gap-1 text-neon-cyan hover:text-white transition-colors ml-2">
                                                <IconBrain className="w-3 h-3" /> EXPLAIN
                                              </button>
                                            </>
                                          )}
                                        </div>
                                        {task.subTasks && task.subTasks.length > 0 && (
                                          <div className="mt-4 pl-4 border-l-2 border-slate-700 space-y-2">
                                            {task.subTasks.map(sub => (
                                              <div key={sub.id} className="flex items-center gap-2 text-sm text-slate-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div>
                                                {sub.title}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <button onClick={() => handleCompleteTask(task)} disabled={isCompleted} className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-green-500 border-green-500 text-slate-900' : 'border-slate-600 text-transparent hover:border-neon-cyan'}`}>
                                        <IconCheck className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:w-1/4">
                   <div className="sticky top-8">
                      <Pomodoro />
                      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5">
                        <h4 className="font-mono text-xs text-indigo-300 mb-2">MISSION TIPS</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Consistency is key. Use the Neural Link to breakdown complex tasks or get explanations for concepts.</p>
                      </div>
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === Tab.SETTINGS && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-white font-mono border-b border-white/10 pb-4">SYSTEM CONFIGURATION</h2>
              <div className="bg-slate-800/80 p-6 rounded-xl border border-neon-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-neon-cyan/20 rounded-lg text-neon-cyan"><IconSpark className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">MISSION UPLINK</h3>
                    <p className="text-sm text-slate-400">Generate a new 7-Day Training Module using Gemini AI.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-wider">New Mission Focus</label>
                    <input type="text" value={uplinkPrompt} onChange={(e) => setUplinkPrompt(e.target.value)} placeholder="e.g. 'Advanced SQL & Leadership' or 'Week 2: Product Discovery'" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none transition-all placeholder:text-slate-600" />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleMissionUplink} disabled={isUplinkLoading || !uplinkPrompt.trim()} className="flex-1 bg-neon-cyan text-slate-900 font-bold py-3 rounded-lg hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
                      {isUplinkLoading ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> : <IconSpark className="w-5 h-5" />} UPLINK TO HQ
                    </button>
                    <button onClick={() => {if (confirm("Reset Mission Data?")) {setCurriculum(INITIAL_CURRICULUM); setUserState({ ...userState, completedTaskIds: [], verifiedDayIds: [], unlockedAchievements: [], xp: 0, level: 1, career: { resumeDraft: '', interviewStats: { questionsAnswered: 0, lastScore: 0 } } });}}} className="px-6 py-3 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-white transition-all flex items-center gap-2">
                      <IconRefresh className="w-5 h-5" /> RESET
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === Tab.KANBAN && (
             <div className="h-full flex flex-col animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-white font-mono">PROJECT STATUS</h2>
                <div className="flex-1">
                  <Kanban items={userState.kanbanItems} setItems={(items) => setUserState(prev => ({...prev, kanbanItems: typeof items === 'function' ? items(prev.kanbanItems) : items }))} />
                </div>
             </div>
          )}
        </div>
        
        <BrainDump items={userState.brainDump} setItems={updateBrainDump} />

        <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-20 right-6 p-4 bg-neon-cyan text-slate-900 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white hover:scale-105 transition-all z-40">
           {isChatOpen ? <IconCheck className="w-6 h-6" /> : <IconMessage className="w-6 h-6" />}
        </button>

        <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} initialMessage={chatInitialMessage} onClearInitialMessage={() => setChatInitialMessage(null)} />
      </main>
    </div>
  );
};

export default App;