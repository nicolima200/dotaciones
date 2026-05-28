import React from 'react';
import { Agent, Schedule } from '../types';

interface Props {
  key?: React.Key;
  agent: Agent;
  schedule?: Schedule;
  onClick?: () => void;
  onDragStart: (e: React.DragEvent, agentId: string, scheduleId?: string) => void;
  className?: string;
  bgClass?: string;
}

export function AgentCard({ agent, schedule, onClick, onDragStart, className = '', bgClass = '' }: Props) {
  const isStandard = !schedule || 
    (schedule.startTime === '09:00' && schedule.endTime === '21:00') || 
    (schedule.startTime === '21:00' && schedule.endTime === '09:00');

  // Si se pasa bgClass (ej. desde el sidebar para inactivos), lo agregamos, sino usamos agent-card por defecto
  const cardClasses = `agent-card ${bgClass} ${className}`.trim();

  return (
    <div
      id={`agent-card-${agent.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, agent.id, schedule?.id)}
      onClick={onClick}
      className={cardClasses}
    >
      <div className="agent-card-header">
        <span className="agent-name font-bold text-sm tracking-wide">{(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}</span>
        
        <div className="flex flex-wrap gap-1 mt-1">
          {agent.hasLicense && agent.licenseCategory && (
            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              (!agent.licenseExpiration || new Date(agent.licenseExpiration) >= new Date()) 
                ? 'text-green-400 bg-green-900/30 border-green-700/50' 
                : 'text-red-400 bg-red-900/30 border-red-700/50'
            }`}>
              {agent.licenseCategory.toUpperCase()}
            </div>
          )}
          {agent.hasDAEO && (
            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              (!agent.daeoExpiration || new Date(agent.daeoExpiration) >= new Date()) 
                ? 'text-green-400 bg-green-900/30 border-green-700/50' 
                : 'text-red-400 bg-red-900/30 border-red-700/50'
            }`}>
              DAEO
            </div>
          )}
        </div>
      </div>
      {!isStandard && schedule && (
        <span className="agent-time text-[10px] text-yellow-400 font-bold mt-1 inline-block bg-yellow-900/30 px-1.5 py-0.5 rounded border border-yellow-700/50">
          <span className="inline-block mr-1">🕒</span>{schedule.startTime} - {schedule.endTime}
        </span>
      )}
    </div>
  );
}
