import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AgentCard } from './AgentCard';
import { Shield } from 'lucide-react';
import { RoleType } from '../types';

export const GuardRoleWidgets: React.FC = () => {
  const {
    state,
    dragOverTarget,
    currentSchedules,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragStart,
    setSelectedAgentForInfo
  } = useDashboard();

  const baseRoles = [
    { id: 'jefe', label: 'Jefe' },
    { id: 'segundo_jefe', label: '2da jefa' },
    { id: 'ofl_control', label: 'Ofl. de control' },
    { id: 'ofl_servicio', label: 'Ofl. de servicio' },
    { id: 'operaciones', label: 'Operaciones' },
    { id: 'ayte_guardia', label: 'Ayte. de guardia' },
    { id: 'logistica', label: 'Logística' },
    { id: 'personal', label: 'Personal' },
    { id: 'judiciales', label: 'Judiciales' }
  ];

  const totalBaseAssigned = currentSchedules.filter(s => 
    ['jefe', 'segundo_jefe', 'ofl_control', 'ofl_servicio', 'operaciones', 'ayte_guardia', 'logistica', 'personal', 'judiciales'].includes(s.role)
  ).length;

  return (
    <div className="sidebar-section bg-slate-900/50 mt-4 border border-slate-700/50">
      <div className="sidebar-header">
        <h2 className="sidebar-title"><Shield size={20} /> Base</h2>
        <span className="sidebar-badge">{totalBaseAssigned}</span>
      </div>
      <div className="flex flex-col gap-2 p-3 pb-4">
        {baseRoles.map(roleInfo => {
          const occupants = currentSchedules.filter(s => s.role === roleInfo.id);
          return (
            <div
              key={roleInfo.id}
              className={`bg-slate-800 rounded-lg p-2 border border-slate-700 min-h-[60px] ${
                dragOverTarget === roleInfo.id ? 'border-yellow-500 bg-yellow-500/10' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, roleInfo.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, roleInfo.id as RoleType)}
            >
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                {roleInfo.label}
              </div>
              {occupants.map(occ => {
                const agent = state.agents.find(a => a.id === occ.agentId);
                if (!agent) return null;
                return (
                  <AgentCard
                    key={occ.id}
                    agent={agent}
                    schedule={occ}
                    onDragStart={handleDragStart}
                    onClick={() => setSelectedAgentForInfo(agent)}
                    className="border-l-indigo-400"
                  />
                );
              })}
              {occupants.length === 0 && (
                <div className="text-xs text-slate-600 italic">Sin asignar</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
