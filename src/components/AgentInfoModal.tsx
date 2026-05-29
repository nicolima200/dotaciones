import React, { useState, useEffect } from 'react';
import { Users, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { validRanks, validEscalafones } from '../constants';
import { Agent } from '../types';

interface AgentInfoModalProps {
  agent: Agent;
  onClose: () => void;
  state: any;
  getInfraName: (role: string, targetId?: string) => string;
  updateAgent: (id: string, updates: any) => void;
  softRemoveAgent: (id: string) => void;
  userRole: string | null;
}

export function AgentInfoModal({ agent, onClose, state, getInfraName, updateAgent, softRemoveAgent, userRole }: AgentInfoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(agent.nombre || '');
  const [apellido, setApellido] = useState(agent.apellido || '');
  const [localidad, setLocalidad] = useState(agent.localidad || '');
  const [jerarquia, setJerarquia] = useState(agent.jerarquia || '');
  const [jerarquiaError, setJerarquiaError] = useState<string | null>(null);
  const [escalafon, setEscalafon] = useState(agent.escalafon || '');
  const [escalafonError, setEscalafonError] = useState<string | null>(null);
  const [telefono, setTelefono] = useState(agent.telefono || '');
  const [legajo, setLegajo] = useState(agent.legajo || '');
  const [turno, setTurno] = useState<1 | 2 | 3 | 4>(agent.turno || 1);
  const [hasLicense, setHasLicense] = useState(agent.hasLicense || false);
  const [licenseType, setLicenseType] = useState(agent.licenseType || 'auto');
  const [licenseCategory, setLicenseCategory] = useState(agent.licenseCategory || 'comun');
  const [licenseExpiration, setLicenseExpiration] = useState(agent.licenseExpiration || '');
  const [hasDAEO, setHasDAEO] = useState(agent.hasDAEO || false);
  const [daeoExpiration, setDaeoExpiration] = useState(agent.daeoExpiration || '');

  const [domicilio, setDomicilio] = useState(agent.domicilio || '');
  const [marcaChaleco, setMarcaChaleco] = useState(agent.marcaChaleco || '');
  const [modeloChaleco, setModeloChaleco] = useState(agent.modeloChaleco || '');
  const [nroSerieChaleco, setNroSerieChaleco] = useState(agent.nroSerieChaleco || '');
  const [marcaArmamento, setMarcaArmamento] = useState(agent.marcaArmamento || '');
  const [modeloArmamento, setModeloArmamento] = useState(agent.modeloArmamento || '');
  const [nroSerieArmamento, setNroSerieArmamento] = useState(agent.nroSerieArmamento || '');
  const [showMoreFields, setShowMoreFields] = useState(false);

  useEffect(() => {
    setNombre(agent.nombre || '');
    setApellido(agent.apellido || '');
    setLocalidad(agent.localidad || '');
    setJerarquia(agent.jerarquia || '');
    setJerarquiaError(null);
    setEscalafon(agent.escalafon || '');
    setEscalafonError(null);
    setTelefono(agent.telefono || '');
    setLegajo(agent.legajo || '');
    setTurno(agent.turno || 1);
    setHasLicense(agent.hasLicense || false);
    setLicenseType(agent.licenseType || 'auto');
    setLicenseCategory(agent.licenseCategory || 'comun');
    setLicenseExpiration(agent.licenseExpiration || '');
    setHasDAEO(agent.hasDAEO || false);
    setDaeoExpiration(agent.daeoExpiration || '');
    setDomicilio(agent.domicilio || '');
    setMarcaChaleco(agent.marcaChaleco || '');
    setModeloChaleco(agent.modeloChaleco || '');
    setNroSerieChaleco(agent.nroSerieChaleco || '');
    setMarcaArmamento(agent.marcaArmamento || '');
    setModeloArmamento(agent.modeloArmamento || '');
    setNroSerieArmamento(agent.nroSerieArmamento || '');
    
    const hasAnyPopulated = !!(agent.marcaChaleco || agent.modeloChaleco || agent.nroSerieChaleco || agent.marcaArmamento || agent.modeloArmamento || agent.nroSerieArmamento);
    setShowMoreFields(hasAnyPopulated);
  }, [agent, isEditing]);

  const handleSave = () => {
    const trimmedLegajo = legajo.trim();
    if (!trimmedLegajo) {
      alert('El legajo es obligatorio.');
      return;
    }

    // Check duplicate legajo in other agents
    const existing = state.agents.find(a => a.legajo === trimmedLegajo && a.id !== agent.id && !a.isDeleted);
    if (existing) {
      alert(`El legajo ${trimmedLegajo} ya pertenece a: ${existing.jerarquia || ''} ${existing.apellido || ''} ${existing.nombre || ''} en el Turno ${existing.turno}.`);
      return;
    }

    const trimmedJ = jerarquia.trim().toUpperCase();
    if (trimmedJ !== '' && !validRanks.includes(trimmedJ)) {
      setJerarquia('');
      setJerarquiaError('La jerarquía ingresada no es válida. Debe elegir una de la lista.');
      return;
    }
    const trimmedE = escalafon.trim();
    if (trimmedE !== '' && !validEscalafones.includes(trimmedE)) {
      setEscalafon('');
      setEscalafonError('El escalafón ingresado no es válido. Debe elegir uno de la lista.');
      return;
    }

    const isAdmin = userRole === 'admin';
    const userShiftNum = !isAdmin && userRole ? Number(userRole.replace('turno', '')) : null;
    if (!isAdmin && turno !== agent.turno) {
      const confirmTransfer = window.confirm(`¡Atención! Al mover a este efectivo al Turno ${turno}, dejará de estar visible y editable en tu turno. ¿Desea confirmar la transferencia?`);
      if (!confirmTransfer) return;
    }

    updateAgent(agent.id, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      localidad: localidad.trim(),
      name: `${apellido.trim()} ${nombre.trim()}`.trim(),
      jerarquia: trimmedJ || '',
      escalafon: trimmedE || '',
      telefono,
      legajo: trimmedLegajo,
      turno,
      hasLicense, licenseType, licenseCategory, licenseExpiration,
      hasDAEO, daeoExpiration,
      domicilio: domicilio.trim(),
      marcaChaleco: marcaChaleco.trim(),
      modeloChaleco: modeloChaleco.trim(),
      nroSerieChaleco: nroSerieChaleco.trim(),
      marcaArmamento: marcaArmamento.trim(),
      modeloArmamento: modeloArmamento.trim(),
      nroSerieArmamento: nroSerieArmamento.trim()
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl relative z-[9999] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950 relative z-10">
          <h3 className="text-lg font-bold text-white flex items-center"><Users className="mr-2 text-yellow-500" /> {(agent.jerarquia ? agent.jerarquia + ' ' : '') + (agent.apellido || agent.nombre ? `${agent.apellido || ''} ${agent.nombre || ''}`.trim() : agent.name)}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Información Personal</h4>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold transition-colors">Editar</button>
              ) : (
                <button onClick={handleSave} className="text-xs bg-yellow-600 text-slate-900 px-2 py-1 rounded font-bold hover:bg-yellow-500 transition-colors">Guardar</button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Jerarquía</label>
                    <input
                      type="text"
                      list="ranks-list"
                      value={jerarquia}
                      onChange={e => { setJerarquia(e.target.value.toUpperCase()); setJerarquiaError(null); }}
                      onBlur={() => {
                        const t = jerarquia.trim().toUpperCase();
                        if (t !== '' && !validRanks.includes(t)) {
                          setJerarquia('');
                          setJerarquiaError('La jerarquía ingresada no es válida. Debe elegir una de la lista.');
                        } else {
                          setJerarquiaError(null);
                        }
                      }}
                      autoComplete="off"
                      className={`w-full bg-slate-800 border ${jerarquiaError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm`}
                      placeholder="Jerarquía..."
                    />
                    <datalist id="ranks-list">
                      {validRanks.map(r => <option key={r} value={r} />)}
                    </datalist>
                    {jerarquiaError && <p className="text-red-500 text-[10px] mt-1 font-semibold">{jerarquiaError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Legajo</label>
                    <input type="text" value={legajo} onChange={e => setLegajo(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: 123456" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Escalafón</label>
                    <input
                      type="text"
                      list="branches-list"
                      value={escalafon}
                      onChange={e => { setEscalafon(e.target.value); setEscalafonError(null); }}
                      onBlur={() => {
                        const t = escalafon.trim();
                        if (t !== '' && !validEscalafones.includes(t)) {
                          setEscalafon('');
                          setEscalafonError('El escalafón ingresado no es válido. Debe elegir uno de la lista.');
                        } else {
                          setEscalafonError(null);
                        }
                      }}
                      autoComplete="off"
                      className={`w-full bg-slate-800 border ${escalafonError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm`}
                      placeholder="Escriba para buscar escalafón..."
                    />
                    <datalist id="branches-list">
                      {validEscalafones.map(b => <option key={b} value={b} />)}
                    </datalist>
                    {escalafonError && <p className="text-red-500 text-[10px] mt-1 font-semibold">{escalafonError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Turno Asignado
                    </label>
                    <select
                      value={turno}
                      onChange={e => setTurno(Number(e.target.value) as 1 | 2 | 3 | 4)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    >
                      <option value={1}>Turno 1</option>
                      <option value={2}>Turno 2</option>
                      <option value={3}>Turno 3</option>
                      <option value={4}>Turno 4</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Apellido/s</label>
                    <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: PEREZ" required />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nombre/s</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: JUAN" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Domicilio</label>
                  <input type="text" value={domicilio} onChange={e => setDomicilio(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: Calle, Número" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Localidad</label>
                    <input type="text" value={localidad} onChange={e => setLocalidad(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: Temperley" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Teléfono</label>
                    <input type="text" value={telefono} onChange={e => setTelefono(e.target.value.replace(/[^\d\s\-+]/g, ''))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: 11-1234-5678" />
                  </div>
                </div>


                <div className="border-t border-slate-700 pt-3 mt-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-2 cursor-pointer">
                    <input type="checkbox" checked={hasLicense} onChange={e => setHasLicense(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-yellow-500" />
                    Posee Licencia de Conducir
                  </label>
                  {hasLicense && (
                    <div className="grid grid-cols-2 gap-2 pl-4 border-l-2 border-slate-700 ml-1 mb-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tipo</label>
                        <select value={licenseType} onChange={e => setLicenseType(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs">
                          <option value="auto">Auto</option>
                          <option value="moto">Moto</option>
                          <option value="ambas">Ambas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Categoría</label>
                        <select value={licenseCategory} onChange={e => setLicenseCategory(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs">
                          <option value="comun">Común</option>
                          <option value="profesional">Profesional</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-1">Vencimiento Licencia</label>
                        <input type="date" value={licenseExpiration} onChange={e => setLicenseExpiration(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={hasDAEO} onChange={e => setHasDAEO(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-yellow-500" />
                    Posee Permiso DAEO
                  </label>
                  {hasDAEO && (
                    <div className="pl-4 border-l-2 border-slate-700 ml-1 mb-2">
                      <label className="block text-[10px] text-slate-500 mb-1">Vencimiento DAEO</label>
                      <input type="date" value={daeoExpiration} onChange={e => setDaeoExpiration(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
                    </div>
                  )}

                  <div className="border-t border-slate-700/50 pt-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowMoreFields(!showMoreFields)}
                      className="flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 font-bold transition-colors mb-2"
                    >
                      {showMoreFields ? (
                        <>
                          <ChevronUp size={16} /> Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} /> Mostrar más
                        </>
                      )}
                    </button>

                    {showMoreFields && (
                      <div className="space-y-3 pl-4 border-l-2 border-slate-700 ml-1 mt-3 mb-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">Marca Chaleco</label>
                            <input
                              type="text"
                              value={marcaChaleco}
                              onChange={e => setMarcaChaleco(e.target.value)}
                              placeholder="Ej: RB3"
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">Modelo Chaleco</label>
                            <input
                              type="text"
                              value={modeloChaleco}
                              onChange={e => setModeloChaleco(e.target.value)}
                              placeholder="Ej: Multiamenaza"
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">N° Serie Chaleco</label>
                          <input
                            type="text"
                            value={nroSerieChaleco}
                            onChange={e => setNroSerieChaleco(e.target.value)}
                            placeholder="Ej: 12345"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">Marca Armamento</label>
                            <input
                              type="text"
                              value={marcaArmamento}
                              onChange={e => setMarcaArmamento(e.target.value)}
                              placeholder="Ej: Bersa"
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">Modelo Armamento</label>
                            <input
                              type="text"
                              value={modeloArmamento}
                              onChange={e => setModeloArmamento(e.target.value)}
                              placeholder="Ej: TPR9"
                              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">N° Serie Armamento</label>
                          <input
                            type="text"
                            value={nroSerieArmamento}
                            onChange={e => setNroSerieArmamento(e.target.value)}
                            placeholder="Ej: 98765"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Jerarquía:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.jerarquia || <span className="text-slate-600 italic">Sin asignar</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Legajo:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.legajo || <span className="text-slate-600 italic">No registrado</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Escalafón:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.escalafon || <span className="text-slate-600 italic">Sin asignar</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Teléfono:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.telefono || <span className="text-slate-600 italic">No registrado</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Domicilio:</span>
                  <span className="text-sm text-slate-300 font-medium text-right max-w-[200px] break-words">
                    {agent.domicilio || <span className="text-slate-600 italic">No registrado</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Localidad:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.localidad || <span className="text-slate-600 italic">No registrada</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Turno:</span>
                  <span className="text-sm text-slate-300 font-medium">
                    {`Turno ${agent.turno || 1}`}
                  </span>
                </div>
                {agent.hasLicense && (
                  <div className="flex justify-between mt-2 pt-2 border-t border-slate-800">
                    <span className="text-sm text-slate-500">Licencia:</span>
                    <span className="text-sm text-slate-300 font-medium capitalize text-right">
                      {agent.licenseType} - {agent.licenseCategory}
                      {agent.licenseExpiration && <div className="text-xs text-slate-500 font-normal">Vence: {agent.licenseExpiration.split('-').reverse().join('/')}</div>}
                    </span>
                  </div>
                )}
                {agent.hasDAEO && (
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-slate-500">DAEO:</span>
                    <span className="text-sm text-slate-300 font-medium text-right">
                      Posee Permiso
                      {agent.daeoExpiration && <div className="text-xs text-slate-500 font-normal">Vence: {agent.daeoExpiration.split('-').reverse().join('/')}</div>}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 mt-2">
                  <button
                    onClick={() => setShowMoreFields(!showMoreFields)}
                    className="flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
                  >
                    {showMoreFields ? (
                      <>
                        <ChevronUp size={14} /> Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Mostrar más
                      </>
                    )}
                  </button>

                  {showMoreFields && (
                    <div className="mt-2 space-y-2 pl-2 border-l border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Chaleco:</span>
                        <span className="text-slate-300 font-medium text-right">
                          {agent.marcaChaleco || agent.modeloChaleco || agent.nroSerieChaleco ? (
                            <>
                              {agent.marcaChaleco || '-'} / {agent.modeloChaleco || '-'}
                              <div className="text-[10px] text-slate-500">S/N: {agent.nroSerieChaleco || '-'}</div>
                            </>
                          ) : (
                            <span className="text-slate-600 italic">No registrado</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Armamento:</span>
                        <span className="text-slate-300 font-medium text-right">
                          {agent.marcaArmamento || agent.modeloArmamento || agent.nroSerieArmamento ? (
                            <>
                              {agent.marcaArmamento || '-'} / {agent.modeloArmamento || '-'}
                              <div className="text-[10px] text-slate-500">S/N: {agent.nroSerieArmamento || '-'}</div>
                            </>
                          ) : (
                            <span className="text-slate-600 italic">No registrado</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Agenda del Día</h4>
            <div className="space-y-3">
              {state.schedules.filter((s: any) => s.agentId === agent.id).length === 0 ? (
                <div className="text-slate-500 italic text-center py-4">Sin asignaciones programadas</div>
              ) : (
                state.schedules.filter((s: any) => s.agentId === agent.id).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)).map((sch: any) => (
                  <div key={sch.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-200 capitalize">{sch.role}</div>
                      <div className="text-xs text-slate-400">{getInfraName(sch.role, sch.targetId)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-500">{sch.startTime} - {sch.endTime}</div>
                      <div className="text-xs text-slate-500 capitalize">
                        {sch.shift === 'turno1' ? 'Turno 1' :
                          sch.shift === 'turno2' ? 'Turno 2' :
                            sch.shift === 'turno3' ? 'Turno 3' : 'Turno 4'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 mt-auto flex justify-end">
            <button 
              onClick={() => {
                if (window.confirm('¿Está seguro que desea eliminar este efectivo?')) {
                  softRemoveAgent(agent.id);
                }
              }} 
              className="text-xs bg-red-900/50 hover:bg-red-900 text-red-200 px-4 py-2 rounded font-bold transition-colors flex items-center"
            >
              <Trash2 size={14} className="mr-2" />
              Eliminar Efectivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
