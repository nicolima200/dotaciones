import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AgentCard } from './AgentCard';
import { Users, UserMinus } from 'lucide-react';
import { GuardRoleWidgets } from './GuardRoleWidgets';

export const DashboardSidebar: React.FC = () => {
  const {
    dragOverTarget,
    stats,
    availableAgents,
    ausenteAgents,
    noDisponibleAgents,
    vacacionesAgents,
    currentSchedules,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragStart,
    setSelectedAgentForInfo
  } = useDashboard();

  return (
    <div className="app-sidebar scrollbar-hide">
      {/* Disponible */}
      <div
        className={`sidebar-section available ${dragOverTarget === 'disponible' ? 'drag-over' : ''}`}
        onDragOver={(e) => handleDragOver(e, 'disponible')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'disponible')}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title"><Users size={20} /> Disponible</h2>
          <span className="sidebar-badge">{stats.disponible}</span>
        </div>
        <div className="sidebar-agent-list">
          {availableAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDragStart={handleDragStart}
              onClick={() => setSelectedAgentForInfo(agent)}
              className="border-l-slate-500"
            />
          ))}
          {availableAgents.length === 0 && (
            <div className="sidebar-empty-text">No hay personal disponible</div>
          )}
        </div>
      </div>

      {/* Ausente */}
      <div
        className={`sidebar-section unavailable ${dragOverTarget === 'ausente' ? 'drag-over' : ''}`}
        onDragOver={(e) => handleDragOver(e, 'ausente')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'ausente')}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title"><UserMinus size={20} /> Ausente</h2>
          <span className="sidebar-badge">{ausenteAgents.length}</span>
        </div>
        <div className="sidebar-agent-list">
          {ausenteAgents.map(agent => {
            const schedule = currentSchedules.find(s => s.agentId === agent.id && s.role === 'ausente');
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                schedule={schedule}
                onDragStart={handleDragStart}
                onClick={() => setSelectedAgentForInfo(agent)}
                bgClass="bg-orange-900/60"
                className="border-l-orange-500 hover:bg-orange-800/80"
              />
            );
          })}
          {ausenteAgents.length === 0 && (
            <div className="sidebar-empty-text">Nadie ausente</div>
          )}
        </div>
      </div>

      {/* No Disponible */}
      <div
        className={`sidebar-section unavailable ${dragOverTarget === 'no_disponible' ? 'drag-over' : ''} mt-4`}
        onDragOver={(e) => handleDragOver(e, 'no_disponible')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'no_disponible')}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title"><UserMinus size={20} /> No Disponible</h2>
          <span className="sidebar-badge">{noDisponibleAgents.length}</span>
        </div>
        <div className="sidebar-agent-list">
          {noDisponibleAgents.map(agent => {
            const schedule = currentSchedules.find(s => s.agentId === agent.id && s.role === 'no_disponible');
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                schedule={schedule}
                onDragStart={handleDragStart}
                onClick={() => setSelectedAgentForInfo(agent)}
                bgClass="bg-red-900/60"
                className="border-l-red-500 hover:bg-red-800/80"
              />
            );
          })}
          {noDisponibleAgents.length === 0 && (
            <div className="sidebar-empty-text">Nadie en licencia</div>
          )}
        </div>
      </div>

      {/* Vacaciones */}
      <div
        className={`sidebar-section unavailable ${dragOverTarget === 'vacaciones' ? 'drag-over' : ''} mt-4`}
        onDragOver={(e) => handleDragOver(e, 'vacaciones')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'vacaciones')}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title"><UserMinus size={20} /> Vacaciones</h2>
          <span className="sidebar-badge">{vacacionesAgents.length}</span>
        </div>
        <div className="sidebar-agent-list">
          {vacacionesAgents.map(agent => {
            const schedule = currentSchedules.find(s => s.agentId === agent.id && s.role === 'vacaciones');
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                schedule={schedule}
                onDragStart={handleDragStart}
                onClick={() => setSelectedAgentForInfo(agent)}
                bgClass="bg-purple-900/60"
                className="border-l-purple-500 hover:bg-purple-800/80"
              />
            );
          })}
          {vacacionesAgents.length === 0 && (
            <div className="sidebar-empty-text">Nadie de vacaciones</div>
          )}
        </div>
      </div>

      {/* Base */}
      <GuardRoleWidgets />
    </div>
  );
};
