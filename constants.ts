import { Day, KanbanStatus, KanbanItem, SkillCategory, Achievement } from './types';

export const LEVEL_THRESHOLD = 300;

export const INITIAL_KANBAN: KanbanItem[] = [
  { id: 'k1', title: 'Update Resume', status: KanbanStatus.TODO },
  { id: 'k2', title: 'Research Target Companies', status: KanbanStatus.TODO },
  { id: 'k3', title: 'Draft Cover Letter', status: KanbanStatus.DOING },
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_step', title: 'Cadet', description: 'Completed your first task.', icon: 'FIRST' },
  { id: 'deep_diver', title: 'The Deep Diver', description: 'Used AI "Explain This" 5 times.', icon: 'DIVER' },
  { id: 'time_lord', title: 'Time Lord', description: 'Completed 5 Pomodoro focus sessions.', icon: 'TIME' },
  { id: 'sql_sorcerer', title: 'SQL Sorcerer', description: 'Mastered Day 1 & Day 2 (Data).', icon: 'SQL' },
  { id: 'streak_master', title: 'Mission Commander', description: 'Verified 3 Days via Daily Debrief.', icon: 'STREAK' },
];

export const INITIAL_CURRICULUM: Day[] = [
  {
    id: 1,
    title: 'Day 1: Foundations',
    theme: 'SQL Basics & Tools',
    tasks: [
      { id: 'd1-t1', title: 'Master SQL Select & Where Clauses', completed: false, xp: 50, time: '08:00 - 10:00', category: SkillCategory.SQL },
      { id: 'd1-t2', title: 'Setup Jira Project & Workflow', completed: false, xp: 50, time: '10:30 - 12:30', category: SkillCategory.AGILE },
      { id: 'd1-t3', title: 'Watch S-Curve Product Lifecycle Video', completed: false, xp: 30, time: '13:30 - 15:30', category: SkillCategory.STRATEGY },
      { id: 'd1-t4', title: 'Practice 10 Excel Shortcuts', completed: false, xp: 20, time: '16:00 - 17:00', category: SkillCategory.EXCEL },
    ]
  },
  {
    id: 2,
    title: 'Day 2: Structure',
    theme: 'Data Aggregation & Requirements',
    tasks: [
      { id: 'd2-t1', title: 'SQL Aggregates (COUNT, SUM, AVG)', completed: false, xp: 50, time: '08:00 - 10:00', category: SkillCategory.SQL },
      { id: 'd2-t2', title: 'Write 3 User Stories in Gherkin Syntax', completed: false, xp: 50, time: '10:30 - 12:30', category: SkillCategory.AGILE },
      { id: 'd2-t3', title: 'Analyze Porter’s 5 Forces for a Tech Giant', completed: false, xp: 40, time: '13:30 - 15:30', category: SkillCategory.STRATEGY },
      { id: 'd2-t4', title: 'Excel Logic Formulas (IF, AND, OR)', completed: false, xp: 30, time: '16:00 - 17:00', category: SkillCategory.EXCEL },
    ]
  },
  {
    id: 3,
    title: 'Day 3: Decisions',
    theme: 'Grouping & Strategy',
    tasks: [
      { id: 'd3-t1', title: 'SQL Group By & Having', completed: false, xp: 50, time: '08:00 - 10:00', category: SkillCategory.SQL },
      { id: 'd3-t2', title: 'Initiate Sprint 1 in Jira', completed: false, xp: 40, time: '10:30 - 12:30', category: SkillCategory.AGILE },
      { id: 'd3-t3', title: 'Study First Mover Advantage Cases', completed: false, xp: 30, time: '13:30 - 15:30', category: SkillCategory.STRATEGY },
      { id: 'd3-t4', title: 'Create Pivot Tables from Mock Data', completed: false, xp: 40, time: '16:00 - 17:00', category: SkillCategory.EXCEL },
    ]
  },
  {
    id: 4,
    title: 'Day 4: Metrics',
    theme: 'KPIs & Charts',
    tasks: [
      { id: 'd4-t1', title: 'SQL Practice Problem Set (1hr)', completed: false, xp: 60, time: '08:00 - 10:00', category: SkillCategory.SQL },
      { id: 'd4-t2', title: 'Define CAC and LTV for a SaaS Product', completed: false, xp: 50, time: '10:30 - 12:30', category: SkillCategory.STRATEGY },
      { id: 'd4-t3', title: 'Build Pivot Charts for Dashboard', completed: false, xp: 40, time: '13:30 - 15:30', category: SkillCategory.EXCEL },
      { id: 'd4-t4', title: 'Read "Good Strategy Bad Strategy" Summary', completed: false, xp: 30, time: '16:00 - 17:00', category: SkillCategory.STRATEGY },
    ]
  },
  {
    id: 5,
    title: 'Day 5: Complexity',
    theme: 'Joins & Daily Ops',
    tasks: [
      { id: 'd5-t1', title: 'Master SQL Joins (Inner, Left, Right)', completed: false, xp: 60, time: '08:00 - 10:00', category: SkillCategory.SQL },
      { id: 'd5-t2', title: 'Simulate a Daily Standup Report', completed: false, xp: 30, time: '10:30 - 12:30', category: SkillCategory.AGILE },
      { id: 'd5-t3', title: 'Research Dominant Design Examples', completed: false, xp: 30, time: '13:30 - 15:30', category: SkillCategory.STRATEGY },
      { id: 'd5-t4', title: 'Add Slicers to Excel Dashboard', completed: false, xp: 40, time: '16:00 - 17:00', category: SkillCategory.EXCEL },
    ]
  },
  {
    id: 6,
    title: 'Day 6: Manager',
    theme: 'Big Data & Analysis',
    tasks: [
      { id: 'd6-t1', title: 'Execute Queries in BigQuery Sandbox', completed: false, xp: 60, time: '08:00 - 10:00', category: SkillCategory.SQL },
      { id: 'd6-t2', title: 'Complete Sprint & Review Velocity', completed: false, xp: 40, time: '10:30 - 12:30', category: SkillCategory.AGILE },
      { id: 'd6-t3', title: 'Perform VRIO Analysis on a Competitor', completed: false, xp: 50, time: '13:30 - 15:30', category: SkillCategory.STRATEGY },
      { id: 'd6-t4', title: 'Finalize Excel Dashboard Layout', completed: false, xp: 50, time: '16:00 - 17:00', category: SkillCategory.EXCEL },
    ]
  },
  {
    id: 7,
    title: 'Day 7: Launch',
    theme: 'Showcase & Interview',
    tasks: [
      { id: 'd7-t1', title: 'Conduct Mock PM Interview (Recorded)', completed: false, xp: 100, time: '08:00 - 10:00', category: SkillCategory.STRATEGY },
      { id: 'd7-t2', title: 'Present Project Findings (Slides)', completed: false, xp: 80, time: '10:30 - 12:30', category: SkillCategory.AGILE },
      { id: 'd7-t3', title: 'Create 1-Page Strategy Cheat Sheet', completed: false, xp: 40, time: '13:30 - 15:30', category: SkillCategory.STRATEGY },
      { id: 'd7-t4', title: 'Upload SQL & Excel Work to GitHub', completed: false, xp: 50, time: '16:00 - 17:00', category: SkillCategory.SQL },
    ]
  },
];