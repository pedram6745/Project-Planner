import React from 'react';
import { KanbanItem, KanbanStatus } from '../types';

interface KanbanProps {
  items: KanbanItem[];
  setItems: React.Dispatch<React.SetStateAction<KanbanItem[]>>;
}

const Kanban: React.FC<KanbanProps> = ({ items, setItems }) => {
  
  const moveItem = (id: string, newStatus: KanbanStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const getNextStatus = (status: KanbanStatus): KanbanStatus => {
    if (status === KanbanStatus.TODO) return KanbanStatus.DOING;
    if (status === KanbanStatus.DOING) return KanbanStatus.DONE;
    return KanbanStatus.TODO; // Cycle back
  };

  const columns = [
    { title: 'To Do', status: KanbanStatus.TODO, color: 'border-slate-600' },
    { title: 'In Progress', status: KanbanStatus.DOING, color: 'border-neon-cyan' },
    { title: 'Done', status: KanbanStatus.DONE, color: 'border-neon-pink' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {columns.map(col => (
        <div key={col.status} className={`bg-slate-800/30 border-t-2 ${col.color} p-4 rounded-lg`}>
          <h3 className="font-mono text-sm text-slate-400 mb-4 uppercase tracking-wider">{col.title}</h3>
          <div className="space-y-3">
            {items.filter(i => i.status === col.status).map(item => (
              <div 
                key={item.id}
                onClick={() => moveItem(item.id, getNextStatus(item.status))}
                className="bg-slate-700/50 p-3 rounded border border-white/5 cursor-pointer hover:bg-slate-700 transition-colors group relative"
              >
                <p className="text-sm text-slate-200">{item.title}</p>
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-xs text-slate-500">
                  {col.status !== KanbanStatus.DONE ? '→' : '↻'}
                </div>
              </div>
            ))}
            {items.filter(i => i.status === col.status).length === 0 && (
              <div className="text-xs text-slate-600 italic text-center py-4">Empty Sector</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Kanban;