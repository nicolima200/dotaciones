import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, X, Plus, Trash2 } from 'lucide-react';
import { Shift, RoleType, Agent, Schedule, InfrastructureItem } from '../types';

const EMPTY_ARRAY: any[] = [];

const ROLE_LABELS: Record<RoleType, string> = {
  garita: 'Módulo',
  caminante: 'Caminante',
  movil: 'Móvil',
  motorizada: 'Motorizada',
  montada: 'Montada',
  correo: 'Correo',
  orden_servicio: 'Orden de Servicio',
  comision: 'Comisión de Servicio',
  ofl_control: 'Oficial de Control',
  ofl_servicio: 'Oficial de Servicio',
  operaciones: 'Operaciones',
  ayte_guardia: 'Ayudante de Guardia',
  logistica: 'Logística',
  personal: 'Personal',
  judiciales: 'Judiciales',
  jefe: 'Jefe de Turno',
  segundo_jefe: 'Segundo Jefe de Turno',
  disponible: 'Disponible',
  no_disponible: 'No Disponible',
  ausente: 'Ausente',
  vacaciones: 'Vacaciones'
};

// Helper to format agent display string
const getAgentDisplayString = (a: Agent) => {
  const jer = a.jerarquia ? `${a.jerarquia} ` : '';
  const nameStr = a.apellido && a.nombre ? `${a.apellido} ${a.nombre}` : (a.name || '');
  const leg = a.legajo ? ` (Leg: ${a.legajo})` : '';
  return `${jer}${nameStr}${leg}`.trim();
};

// Helper to format target display string
const getTargetDisplayString = (t: any) => {
  const roStr = t.ro ? ` (${t.ro})` : '';
  const nameStr = t.name || `OS ${t.numero}`;
  return `${nameStr}${roStr}`.trim();
};

interface ScheduleModalProps {
  onClose: () => void;
  state: any;
  assignAgent: (agentId: string, shift: Shift, role: RoleType, targetId?: string, startTime?: string, endTime?: string) => void;
  removeSchedule: (id: string) => void;
  getInfraName: (role: string, targetId?: string) => string;
  currentShift: Shift;
  userRole: string;
}

export function ScheduleModal({ onClose, state, assignAgent, removeSchedule, getInfraName, currentShift, userRole }: ScheduleModalProps) {
  const isShiftUser = userRole !== 'admin' && userRole.startsWith('turno');
  const allowedShift = isShiftUser ? (userRole as Shift) : null;

  const [agentId, setAgentId] = useState('');
  const [agentInputText, setAgentInputText] = useState('');
  const [role, setRole] = useState<RoleType>('garita');
  const [targetId, setTargetId] = useState('');
  const [targetInputText, setTargetInputText] = useState('');
  const [shift, setShift] = useState<Shift>(allowedShift || currentShift);
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

  // Reset/Clear inputs when shift or role changes so they appear empty
  useEffect(() => {
    setAgentId('');
    setAgentInputText('');
  }, [shift]);

  useEffect(() => {
    setTargetId('');
    setTargetInputText('');
  }, [role, shift]);

  const handleSave = () => {
    if (!agentId) return;
    assignAgent(agentId, shift, role, targetId || undefined, startTime, endTime);
    // Clear inputs after saving a schedule
    setAgentId('');
    setAgentInputText('');
    setTargetId('');
    setTargetInputText('');
  };

  const targets = role === 'garita' ? state.infrastructure.garitas :
    role === 'caminante' ? state.infrastructure.qths :
      role === 'movil' ? state.infrastructure.moviles :
        role === 'motorizada' ? state.infrastructure.motos :
          role === 'orden_servicio' ? (state.infrastructure.ordenes || EMPTY_ARRAY) :
            role === 'comision' ? (state.infrastructure.comisiones || EMPTY_ARRAY) : EMPTY_ARRAY;

  const selectedShiftNum = Number(shift.replace('turno', ''));
  
  // Filter targets by selected shift and sort alphabetically by display string
  const filteredTargets = useMemo(() => {
    const raw = targets.filter((i: any) => !i.turno || i.turno === selectedShiftNum);
    return [...raw].sort((a, b) => {
      const nameA = getTargetDisplayString(a).toLowerCase();
      const nameB = getTargetDisplayString(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [targets, selectedShiftNum]);

  // Filter agents by shift and sort alphabetically by display string
  const filteredAgents = useMemo(() => {
    const raw = state.agents.filter((a: Agent) => ('turno' + (a.turno || 1)) === shift);
    return [...raw].sort((a, b) => {
      const nameA = getAgentDisplayString(a).toLowerCase();
      const nameB = getAgentDisplayString(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [shift, state.agents]);

  // Handle agent selection via input text changes
  useEffect(() => {
    const matchedAgent = filteredAgents.find(a => getAgentDisplayString(a) === agentInputText);
    if (matchedAgent) {
      setAgentId(matchedAgent.id);
    } else {
      setAgentId('');
    }
  }, [agentInputText, filteredAgents]);

  // Handle target selection via input text changes
  useEffect(() => {
    const matchedTarget = filteredTargets.find(t => getTargetDisplayString(t) === targetInputText);
    if (matchedTarget) {
      setTargetId(matchedTarget.id);
    } else {
      setTargetId('');
    }
  }, [targetInputText, filteredTargets]);

  const needsTarget = ['garita', 'caminante', 'movil', 'motorizada', 'orden_servicio', 'comision'].includes(role);
  const isSaveDisabled = !agentId || (needsTarget && !targetId);


  // Filter and display only special schedules (exclude 09:00-21:00 and 21:00-09:00)
  const displayedSchedules = useMemo(() => {
    return state.schedules.filter((sch: Schedule) => {
      // 1. Shift user restriction
      if (isShiftUser && sch.shift !== allowedShift) return false;
      
      // 2. Filter out common schedules
      const isCommon = (sch.startTime === '09:00' && sch.endTime === '21:00') || 
                       (sch.startTime === '21:00' && sch.endTime === '09:00');
      if (isCommon) return false;
      
      return true;
    });
  }, [state.schedules, isShiftUser, allowedShift]);

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
                <select 
                  value={shift} 
                  onChange={e => setShift(e.target.value as Shift)} 
                  disabled={isShiftUser}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm mb-4 disabled:opacity-50"
                >
                  <option value="turno1">Turno 1 (09:00 - 21:00)</option>
                  <option value="turno2">Turno 2 (21:00 - 09:00)</option>
                  <option value="turno3">Turno 3 (09:00 - 21:00)</option>
                  <option value="turno4">Turno 4 (21:00 - 09:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Agente (Escriba para buscar)</label>
                <input
                  type="text"
                  list="schedule-agents-list"
                  value={agentInputText}
                  onChange={e => setAgentInputText(e.target.value)}
                  placeholder="Buscar por nombre o legajo..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  autoComplete="off"
                />
                <datalist id="schedule-agents-list">
                  {filteredAgents.map((a: Agent) => (
                    <option key={a.id} value={getAgentDisplayString(a)} />
                  ))}
                </datalist>
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
                <select value={role} onChange={e => setRole(e.target.value as RoleType)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm scrollbar-hide">
                  <optgroup label="Servicio Externo" className="bg-slate-900 text-slate-300">
                    <option value="garita">Módulo</option>
                    <option value="caminante">Caminante</option>
                    <option value="movil">Móvil</option>
                    <option value="motorizada">Motorizada</option>
                    <option value="montada">Montada</option>
                    <option value="correo">Correo</option>
                    <option value="orden_servicio">Orden de Servicio</option>
                    <option value="comision">Comisión de Servicio</option>
                  </optgroup>
                  <optgroup label="Base y Oficinas" className="bg-slate-900 text-slate-300">
                    <option value="jefe">Jefe de Turno</option>
                    <option value="segundo_jefe">Segundo Jefe de Turno</option>
                    <option value="ofl_control">Oficial de Control</option>
                    <option value="ofl_servicio">Oficial de Servicio</option>
                    <option value="operaciones">Operaciones</option>
                    <option value="ayte_guardia">Ayudante de Guardia</option>
                    <option value="logistica">Logística</option>
                    <option value="personal">Personal</option>
                    <option value="judiciales">Judiciales</option>
                  </optgroup>
                  <optgroup label="Novedades" className="bg-slate-900 text-slate-300">
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No Disponible (Licencia)</option>
                    <option value="ausente">Ausente</option>
                    <option value="vacaciones">Vacaciones</option>
                  </optgroup>
                </select>
              </div>

              {(role === 'garita' || role === 'caminante' || role === 'movil' || role === 'motorizada' || role === 'orden_servicio' || role === 'comision') && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Destino (Escriba para buscar)</label>
                  <input
                    type="text"
                    list="schedule-targets-list"
                    value={targetInputText}
                    onChange={e => setTargetInputText(e.target.value)}
                    placeholder="Buscar destino..."
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    autoComplete="off"
                  />
                  <datalist id="schedule-targets-list">
                    {filteredTargets.map((t: InfrastructureItem) => (
                      <option key={t.id} value={getTargetDisplayString(t)} />
                    ))}
                  </datalist>
                </div>
              )}

              <button 
                onClick={handleSave} 
                disabled={isSaveDisabled}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-2 rounded transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} className="mr-2" /> Agregar Programación
              </button>
            </div>
          </div>

          {/* List */}
          <div className="w-full md:w-2/3 p-4 overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Programaciones Activas</h4>
            <div className="space-y-2">
              {displayedSchedules.length === 0 ? (
                <div className="text-slate-500 italic text-center py-8">No hay programaciones especiales activas</div>
              ) : (
                displayedSchedules.sort((a: Schedule, b: Schedule) => a.startTime.localeCompare(b.startTime)).map((sch: Schedule) => {
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
                          <div className="text-sm text-slate-400">
                            {ROLE_LABELS[sch.role] || sch.role}
                            {sch.targetId && ` - ${getInfraName(sch.role, sch.targetId)}`}
                          </div>
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
