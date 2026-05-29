import React, { useState, useEffect } from 'react';
import { Calendar, X, Plus, Trash2 } from 'lucide-react';
import { Shift, RoleType, Agent, Schedule, InfrastructureItem } from '../types';

interface ScheduleModalProps {
  onClose: () => void;
  state: any;
  assignAgent: (agentId: string, shift: Shift, role: RoleType, targetId?: string, startTime?: string, endTime?: string) => void;
  removeSchedule: (id: string) => void;
  getInfraName: (role: string, targetId?: string) => string;
}

export function ScheduleModal({ onClose, state, assignAgent, removeSchedule, getInfraName }: ScheduleModalProps) {
  const [agentId, setAgentId] = useState(state.agents[0]?.id || '');
  const [role, setRole] = useState<RoleType>('garita');
  const [targetId, setTargetId] = useState('');
  const [shift, setShift] = useState<Shift>('turno3');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');

  // Update default times when shift changes
  useEffect(() => {
    if (shift === 'turno1' || shift === 'turno3') {
      setStartTime('09:00');
      setEndTime('21:00');
    } else {
      setStartTime('21:00');
      setEndTime('09:00');
    }
  }, [shift]);

  const handleSave = () => {
    if (!agentId) return;
    assignAgent(agentId, shift, role, targetId || undefined, startTime, endTime);
    // Don't close immediately to allow adding multiple
  };

  const targets = role === 'garita' ? state.infrastructure.garitas :
    role === 'caminante' ? state.infrastructure.qths :
      role === 'movil' ? state.infrastructure.moviles :
        role === 'motorizada' ? state.infrastructure.motos :
          role === 'orden_servicio' ? (state.infrastructure.ordenes || []) : [];

  // Auto-select first target when role changes
  useEffect(() => {
    if (targets.length > 0) setTargetId(targets[0].id);
    else setTargetId('');
  }, [role]);

  // Ensure selected agent belongs to the selected shift
  useEffect(() => {
    const validAgents = state.agents.filter((a: Agent) => ('turno' + (a.turno || 1)) === shift);
    if (validAgents.length > 0 && !validAgents.find((a: Agent) => a.id === agentId)) {
      setAgentId(validAgents[0].id);
    } else if (validAgents.length === 0) {
      setAgentId('');
    }
  }, [shift, state.agents]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative z-[9999]">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950 relative z-[1000]">
          <h3 className="text-lg font-bold text-white flex items-center"><Calendar className="mr-2 text-yellow-500" /> Programación de Relevos</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Form */}
          <div className="w-full md:w-1/3 p-4 border-r border-slate-800 overflow-y-auto bg-slate-900/50">
            <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Nueva Asignación</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Turno Principal</label>
                <select value={shift} onChange={e => setShift(e.target.value as Shift)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm mb-4">
                  <option value="turno1">Turno 1 (09:00 - 21:00)</option>
                  <option value="turno2">Turno 2 (21:00 - 09:00)</option>
                  <option value="turno3">Turno 3 (09:00 - 21:00)</option>
                  <option value="turno4">Turno 4 (21:00 - 09:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Agente</label>
                <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                  {state.agents.filter((a: Agent) => ('turno' + (a.turno || 1)) === shift).map((a: Agent) => <option key={a.id} value={a.id}>{(a.jerarquia ? a.jerarquia + ' ' : '') + a.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Hora Inicio</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Hora Fin</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Función</label>
                <select value={role} onChange={e => setRole(e.target.value as RoleType)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                  <option value="garita">Módulo</option>
                  <option value="caminante">Caminante</option>
                  <option value="movil">Móvil</option>
                  <option value="motorizada">Motorizada</option>
                  <option value="correo">Correo</option>
                  <option value="orden_servicio">Orden de Servicio</option>
                  <option value="disponible">Disponible</option>
                  <option value="no_disponible">No Disponible (Licencia)</option>
                  <option value="ausente">Ausente</option>
                  <option value="vacaciones">Vacaciones</option>
                </select>
              </div>

              {role !== 'correo' && role !== 'disponible' && role !== 'no_disponible' && role !== 'ausente' && role !== 'vacaciones' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Destino</label>
                  <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                    {targets.map((t: InfrastructureItem) => <option key={t.id} value={t.id}>{t.name || `OS ${t.numero}`} {t.ro ? `(${t.ro})` : ''}</option>)}
                  </select>
                </div>
              )}

              <button onClick={handleSave} className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-2 rounded transition-colors flex justify-center items-center">
                <Plus size={18} className="mr-2" /> Agregar Programación
              </button>
            </div>
          </div>

          {/* List */}
          <div className="w-full md:w-2/3 p-4 overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Programaciones Activas</h4>
            <div className="space-y-2">
              {state.schedules.length === 0 ? (
                <div className="text-slate-500 italic text-center py-8">No hay programaciones activas</div>
              ) : (
                state.schedules.sort((a: Schedule, b: Schedule) => a.startTime.localeCompare(b.startTime)).map((sch: Schedule) => {
                  const agent = state.agents.find((a: Agent) => a.id === sch.agentId);
                  return (
                    <div key={sch.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-center">
                          <div className="text-sm font-bold text-yellow-500">{sch.startTime}</div>
                          <div className="text-xs text-slate-500">{sch.endTime}</div>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                          <div className="font-bold text-white">{agent ? (agent.jerarquia ? `${agent.jerarquia} ${agent.name}` : agent.name) : ''}</div>
                          <div className="text-sm text-slate-400 capitalize">{sch.role} - {getInfraName(sch.role, sch.targetId)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-500 capitalize">
                          {sch.shift === 'turno1' ? 'Turno 1' :
                            sch.shift === 'turno2' ? 'Turno 2' :
                              sch.shift === 'turno3' ? 'Turno 3' : 'Turno 4'}
                        </span>
                        <button onClick={() => removeSchedule(sch.id)} className="text-slate-500 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
