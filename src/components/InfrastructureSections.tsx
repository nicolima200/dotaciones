import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AgentCard } from './AgentCard';
import {
  Shield, MapPin, Car, Bike, Mail, Users, Clock, Trash2, Undo2, ClipboardList
} from 'lucide-react';
import { RoleType, Schedule } from '../types';

export const InfrastructureSections: React.FC = () => {
  const {
    state,
    currentShift,
    lastCleared,
    stats,
    groupedReliefs,
    filterByShift,
    currentSchedules,
    dragOverTarget,
    isControlMovil,
    getInfraName,
    handleUndoClear,
    handleClearRole,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setSelectedMovilForInfo,
    handleDragStart,
    setSelectedAgentForInfo
  } = useDashboard();

  return (
    <>
      {/* Stats & Alerts */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="stats-bar">
          <div className="stats-title">Efectivos en funciones</div>
          <div className="stats-items">
            <div className="stat-item" onClick={() => document.getElementById('section-garitas')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Módulos</span>
              <span className="stat-value">{stats.garita}</span>
            </div>
            <div className="stat-item" onClick={() => document.getElementById('section-caminantes')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Caminantes</span>
              <span className="stat-value">{stats.caminante}</span>
            </div>
            <div className="stat-item" onClick={() => document.getElementById('section-moviles')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Móviles</span>
              <span className="stat-value">{stats.movil}</span>
            </div>
            <div className="stat-item" onClick={() => document.getElementById('section-motorizada')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Motos</span>
              <span className="stat-value">{stats.motorizada}</span>
            </div>
            <div className="stat-item" onClick={() => document.getElementById('section-montada')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Montada</span>
              <span className="stat-value">{stats.montada}</span>
            </div>
            <div className="stat-item" onClick={() => document.getElementById('section-correo')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Correo</span>
              <span className="stat-value">{stats.correo}</span>
            </div>
            <div className="stat-item" onClick={() => document.getElementById('section-ordenes')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Órdenes</span>
              <span className="stat-value">{stats.orden_servicio}</span>
            </div>
            <div className="stat-item" onClick={() => document.getElementById('section-comisiones')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="stat-label">Comisiones</span>
              <span className="stat-value">{stats.comision}</span>
            </div>
            <div className="stat-item border-l border-slate-700/50 pl-3 ml-2 font-bold pointer-events-none">
              <span className="stat-label" style={{ color: '#34d399' }}>TOTAL:</span>
              <span className="stat-value" style={{ color: '#34d399', textShadow: '0 0 10px rgba(52, 211, 153, 0.4)' }}>
                {stats.garita + stats.caminante + stats.movil + stats.motorizada + stats.montada + stats.correo + stats.orden_servicio + stats.comision}
              </span>
            </div>
          </div>
        </div>

        {Object.keys(groupedReliefs).length > 0 && (
          <div className="alert-box">
            <h3 className="alert-title">
              <Clock className="mr-2" size={14} /> Relevos Especiales (Horario No Habitual)
            </h3>
            <div className="alert-grid">
              {Object.entries(groupedReliefs).map(([agentId, schs]) => {
                const schedules = schs as any[];
                const agent = state.agents.find(a => a.id === agentId);
                
                // Card status hierarchy:
                // If all schedules are 'ended', cardStatus is 'ended' (red)
                // Else if at least one is 'active', cardStatus is 'active' (green)
                // Else, cardStatus is 'pending' (yellow)
                let cardStatus: 'pending' | 'active' | 'ended' = 'pending';
                const allEnded = schedules.length > 0 && schedules.every(s => s.status === 'ended');
                if (allEnded) {
                  cardStatus = 'ended';
                } else if (schedules.some(s => s.status === 'active')) {
                  cardStatus = 'active';
                }

                return (
                  <div key={agentId} className={`alert-item ${cardStatus}`}>
                    <span className="alert-item-header">
                      {(agent?.jerarquia ? agent.jerarquia + ' ' : '') + agent?.name}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {schedules.map(sch => (
                        <div key={sch.id} className="alert-item-row">
                          <span className="alert-item-target" title={getInfraName(sch.role, sch.targetId)}>
                            {getInfraName(sch.role, sch.targetId)}
                          </span>
                          <span className={`alert-item-time ${sch.status}`}>{sch.startTime} - {sch.endTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="board-grid">
        {/* Garitas */}
        <div id="section-garitas" className="board-section">
          <div className="board-section-header">
            <h3 className="board-section-title"><Shield size={20} />Módulos</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'garita' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('garita')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('garita', 'Módulos')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {[...filterByShift(state.infrastructure.garitas)].sort((a, b) => {
              const occA = currentSchedules.some(s => s.role === 'garita' && s.targetId === a.id);
              const occB = currentSchedules.some(s => s.role === 'garita' && s.targetId === b.id);
              if (occA !== occB) return occA ? -1 : 1;
              return a.name.localeCompare(b.name);
            }).map(g => {
              const occupants = currentSchedules.filter(s => s.role === 'garita' && s.targetId === g.id);
              const isEmpty = occupants.length === 0;
              return (
                <div
                  key={g.id}
                  className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === g.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, g.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'garita', g.id)}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.agent-card')) return;
                    setSelectedMovilForInfo({ item: g, type: 'garitas' });
                  }}
                >
                  <div className="board-item-title">{g.name}</div>
                  {g.description && <div className="board-item-desc">{g.description}</div>}
                  {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                  <div className="board-item-content">
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
                          className="border-l-yellow-500"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Caminantes (QTHs) */}
        <div id="section-caminantes" className="board-section">
          <div className="board-section-header">
            <h3 className="board-section-title"><MapPin size={20} /> Caminantes</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'caminante' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('caminante')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('caminante', 'Caminantes')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {[...filterByShift(state.infrastructure.qths)].sort((a, b) => {
              const occA = currentSchedules.some(s => s.role === 'caminante' && s.targetId === a.id);
              const occB = currentSchedules.some(s => s.role === 'caminante' && s.targetId === b.id);
              if (occA !== occB) return occA ? -1 : 1;
              return a.name.localeCompare(b.name);
            }).map(q => {
              const occupants = currentSchedules.filter(s => s.role === 'caminante' && s.targetId === q.id);
              const isEmpty = occupants.length === 0;
              return (
                <div
                  key={q.id}
                  className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === q.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, q.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'caminante', q.id)}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.agent-card')) return;
                    setSelectedMovilForInfo({ item: q, type: 'qths' });
                  }}
                >
                  <div className="board-item-title">{q.name}</div>
                  {q.description && <div className="board-item-desc">{q.description}</div>}
                  {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                  <div className="board-item-content">
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
                          className="border-l-blue-500"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Móviles */}
        <div id="section-moviles" className="board-section">
          <div className="board-section-header">
            <h3 className="board-section-title"><Car size={20} /> Móviles</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'movil' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('movil')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('movil', 'Móviles')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {[...filterByShift(state.infrastructure.moviles)].sort((a, b) => {
              const occA = currentSchedules.some(s => (s.role === 'movil' && s.targetId === a.id) || (s.role === 'ofl_control' && isControlMovil(a)));
              const occB = currentSchedules.some(s => (s.role === 'movil' && s.targetId === b.id) || (s.role === 'ofl_control' && isControlMovil(b)));
              if (occA !== occB) return occA ? -1 : 1;
              return a.name.localeCompare(b.name);
            }).map(m => {
              const occupants = currentSchedules.filter(s =>
                (s.role === 'movil' && s.targetId === m.id) ||
                (s.role === 'ofl_control' && isControlMovil(m))
              );
              const isEmpty = occupants.length === 0;
              return (
                <div
                  key={m.id}
                  className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === m.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, m.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'movil', m.id)}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.agent-card')) return;
                    setSelectedMovilForInfo({ item: m, type: 'moviles' });
                  }}
                >
                  <div className="board-item-title">
                    <span>{m.name}</span>
                    {m.ro && <span className="board-item-badge">{m.ro}</span>}
                  </div>
                  {m.description && <div className="board-item-desc">{m.description}</div>}
                  {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                  <div className="board-item-content">
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
                          className="border-l-emerald-500"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motos */}
        <div id="section-motorizada" className="board-section">
          <div className="board-section-header">
            <h3 className="board-section-title"><Bike size={20} /> Motos</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'motorizada' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('motorizada')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('motorizada', 'Motos')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {[...filterByShift(state.infrastructure.motos)].sort((a, b) => {
              const occA = currentSchedules.some(s => s.role === 'motorizada' && s.targetId === a.id);
              const occB = currentSchedules.some(s => s.role === 'motorizada' && s.targetId === b.id);
              if (occA !== occB) return occA ? -1 : 1;
              return a.name.localeCompare(b.name);
            }).map(m => {
              const occupants = currentSchedules.filter(s => s.role === 'motorizada' && s.targetId === m.id);
              const isEmpty = occupants.length === 0;
              return (
                <div
                  key={m.id}
                  className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === m.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, m.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'motorizada', m.id)}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.agent-card')) return;
                    setSelectedMovilForInfo({ item: m, type: 'motos' });
                  }}
                >
                  <div className="board-item-title">
                    <span>{m.name}</span>
                    {m.ro && <span className="board-item-badge">{m.ro}</span>}
                  </div>
                  {m.description && <div className="board-item-desc">{m.description}</div>}
                  {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                  <div className="board-item-content">
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
                          className="border-l-pink-500"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Correo */}
        <div
          id="section-correo"
          className={`board-section ${dragOverTarget === 'correo' ? 'drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'correo')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'correo')}
        >
          <div className="board-section-header">
            <h3 className="board-section-title"><Mail size={20} /> Correo</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'correo' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('correo')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('correo', 'Correo')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {currentSchedules.filter(s => s.role === 'correo').map(occ => {
              const agent = state.agents.find(a => a.id === occ.agentId);
              if (!agent) return null;
              return (
                <AgentCard
                  key={occ.id}
                  agent={agent}
                  schedule={occ}
                  onDragStart={handleDragStart}
                  onClick={() => setSelectedAgentForInfo(agent)}
                  className="border-l-purple-500"
                />
              );
            })}
            {currentSchedules.filter(s => s.role === 'correo').length === 0 && (
              <div className="board-item-empty-msg">Sin asignar</div>
            )}
          </div>
        </div>

        {/* Montada */}
        <div
          id="section-montada"
          className={`board-section ${dragOverTarget === 'montada' ? 'drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'montada')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'montada')}
        >
          <div className="board-section-header">
            <h3 className="board-section-title"><Users size={20} /> Montada</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'montada' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('montada')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('montada', 'Montada')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {currentSchedules.filter(s => s.role === 'montada').map(occ => {
              const agent = state.agents.find(a => a.id === occ.agentId);
              if (!agent) return null;
              return (
                <AgentCard
                  key={occ.id}
                  agent={agent}
                  schedule={occ}
                  onDragStart={handleDragStart}
                  onClick={() => setSelectedAgentForInfo(agent)}
                  className="border-l-orange-500"
                />
              );
            })}
            {currentSchedules.filter(s => s.role === 'montada').length === 0 && (
              <div className="board-item-empty-msg">Sin asignar</div>
            )}
          </div>
        </div>

        {/* Órdenes de Servicio */}
        <div id="section-ordenes" className="board-section">
          <div className="board-section-header">
            <h3 className="board-section-title"><ClipboardList size={20} /> Órdenes de Servicio</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'orden_servicio' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('orden_servicio')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('orden_servicio', 'Órdenes de Servicio')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {[...filterByShift(state.infrastructure.ordenes)].sort((a, b) => {
              const occA = currentSchedules.some(s => s.role === 'orden_servicio' && s.targetId === a.id);
              const occB = currentSchedules.some(s => s.role === 'orden_servicio' && s.targetId === b.id);
              if (occA !== occB) return occA ? -1 : 1;
              const nameA = a.name || `OS ${a.numero}`;
              const nameB = b.name || `OS ${b.numero}`;
              return nameA.localeCompare(nameB);
            }).map(o => {
              const occupants = currentSchedules.filter(s => s.role === 'orden_servicio' && s.targetId === o.id);
              const isEmpty = occupants.length === 0;
              return (
                <div
                  key={o.id}
                  className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === o.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, o.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'orden_servicio', o.id)}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.agent-card')) return;
                    setSelectedMovilForInfo({ item: o, type: 'ordenes' });
                  }}
                >
                  <div className="board-item-title">
                    <span>{o.name || `OS ${o.numero}`}</span>
                    <span className="board-item-badge">{o.horario}</span>
                  </div>
                  <div className="board-item-desc">{o.ubicacion}</div>
                  {o.description && <div className="board-item-desc">{o.description}</div>}
                  {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                  <div className="board-item-content">
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
                          className="border-l-orange-500"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comisiones */}
        <div id="section-comisiones" className="board-section">
          <div className="board-section-header">
            <h3 className="board-section-title"><MapPin size={20} /> Comisiones</h3>
            <div className="board-section-actions">
              {lastCleared && lastCleared.role === 'comision' && lastCleared.shift === currentShift && (
                <button onClick={() => handleUndoClear('comision')} className="btn-xs warning">
                  <Undo2 size={14} /> Deshacer
                </button>
              )}
              <button onClick={() => handleClearRole('comision', 'Comisiones')} className="btn-xs danger">
                <Trash2 size={14} /> Limpiar
              </button>
            </div>
          </div>
          <div className="board-section-content">
            {[...filterByShift(state.infrastructure.comisiones)].sort((a, b) => {
              const occA = currentSchedules.some(s => s.role === 'comision' && s.targetId === a.id);
              const occB = currentSchedules.some(s => s.role === 'comision' && s.targetId === b.id);
              if (occA !== occB) return occA ? -1 : 1;
              return a.name.localeCompare(b.name);
            }).map(c => {
              const occupants = currentSchedules.filter(s => s.role === 'comision' && s.targetId === c.id);
              const isEmpty = occupants.length === 0;
              return (
                <div
                  key={c.id}
                  className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === c.id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, c.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'comision', c.id)}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.agent-card')) return;
                    setSelectedMovilForInfo({ item: c, type: 'comisiones' });
                  }}
                >
                  <div className="board-item-title">{c.name}</div>
                  {c.description && <div className="board-item-desc">{c.description}</div>}
                  {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                  <div className="board-item-content">
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
                          className="border-l-indigo-500"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
};
