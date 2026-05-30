import React, { useState, useEffect } from 'react';
import { Settings, X, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { validRanks, validEscalafones, validVestBrands } from '../constants';
import { Agent, Infrastructure, InfrastructureItem } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  state: {
    agents: Agent[];
    infrastructure: Infrastructure;
  };
  addAgent: (...args: any[]) => void;
  removeAgent: (id: string) => void;
  addInfra: (type: string, payload: any) => void;
  removeInfra: (type: string, id: string) => void;
  updateAgent: (id: string, updates: any) => void;
  updateInfra: (type: string, id: string, updates: any) => void;
  userRole: string | null;
}

export function SettingsModal({
  onClose,
  state,
  addAgent,
  removeAgent,
  addInfra,
  removeInfra,
  updateAgent,
  updateInfra,
  userRole,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');

  const isAdmin = userRole === 'admin';
  const userShiftNum = !isAdmin && userRole ? Number(userRole.replace('turno', '')) : null;

  const [newAgentShift, setNewAgentShift] = useState<1 | 2 | 3 | 4>(1);
  const [newInfraShift, setNewInfraShift] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    if (userShiftNum && !editingId) {
      setNewAgentShift(userShiftNum as 1 | 2 | 3 | 4);
      setNewInfraShift(userShiftNum as 1 | 2 | 3 | 4);
    }
  }, [userShiftNum, editingId]);

  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentNombre, setNewAgentNombre] = useState('');
  const [newAgentApellido, setNewAgentApellido] = useState('');
  const [newAgentLocalidad, setNewAgentLocalidad] = useState('');
  const [newAgentJerarquia, setNewAgentJerarquia] = useState('');
  const [newAgentJerarquiaError, setNewAgentJerarquiaError] = useState<string | null>(null);
  const [newAgentEscalafon, setNewAgentEscalafon] = useState('');
  const [newAgentEscalafonError, setNewAgentEscalafonError] = useState<string | null>(null);
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentLegajo, setNewAgentLegajo] = useState('');
  const [newAgentLegajoError, setNewAgentLegajoError] = useState<string | null>(null);
  const [newInfraName, setNewInfraName] = useState('');
  const [newInfraRO, setNewInfraRO] = useState('');
  const [newInfraDescription, setNewInfraDescription] = useState('');
  const [newOSNumero, setNewOSNumero] = useState('');
  const [newOSHorario, setNewOSHorario] = useState('');
  const [newOSUbicacion, setNewOSUbicacion] = useState('');

  const [newAgentHasLicense, setNewAgentHasLicense] = useState(false);
  const [newAgentLicenseType, setNewAgentLicenseType] = useState<'auto' | 'moto' | 'ambas'>('auto');
  const [newAgentLicenseCategory, setNewAgentLicenseCategory] = useState<'comun' | 'profesional'>('comun');
  const [newAgentLicenseExpiration, setNewAgentLicenseExpiration] = useState('');
  const [newAgentHasDAEO, setNewAgentHasDAEO] = useState(false);
  const [newAgentDAEOExpiration, setNewAgentDAEOExpiration] = useState('');

  const [newAgentDomicilio, setNewAgentDomicilio] = useState('');
  const [newAgentMarcaChaleco, setNewAgentMarcaChaleco] = useState('');
  const [newAgentModeloChaleco, setNewAgentModeloChaleco] = useState('');
  const [newAgentNroSerieChaleco, setNewAgentNroSerieChaleco] = useState('');
  const [newAgentMarcaArmamento, setNewAgentMarcaArmamento] = useState('');
  const [newAgentModeloArmamento, setNewAgentModeloArmamento] = useState('');
  const [newAgentNroSerieArmamento, setNewAgentNroSerieArmamento] = useState('');
  const [showMoreFields, setShowMoreFields] = useState(false);

  const [resourceFilterShift, setResourceFilterShift] = useState<1 | 2 | 3 | 4 | 'all'>('all');

  const cancelEdit = () => {
    setEditingId(null);
    setNewAgentName('');
    setNewAgentNombre('');
    setNewAgentApellido('');
    setNewAgentLocalidad('');
    setNewAgentJerarquia('');
    setNewAgentJerarquiaError(null);
    setNewAgentEscalafon('');
    setNewAgentEscalafonError(null);
    setNewAgentPhone('');
    setNewAgentLegajo('');
    setNewAgentLegajoError(null);
    setNewAgentHasLicense(false);
    setNewAgentLicenseType('auto');
    setNewAgentLicenseCategory('comun');
    setNewAgentLicenseExpiration('');
    setNewAgentHasDAEO(false);
    setNewAgentDAEOExpiration('');

    setNewAgentDomicilio('');
    setNewAgentMarcaChaleco('');
    setNewAgentModeloChaleco('');
    setNewAgentNroSerieChaleco('');
    setNewAgentMarcaArmamento('');
    setNewAgentModeloArmamento('');
    setNewAgentNroSerieArmamento('');
    setShowMoreFields(false);

    setNewInfraName('');
    setNewInfraRO('');
    setNewInfraDescription('');
    setNewOSNumero('');
    setNewOSHorario('');
    setNewOSUbicacion('');
  };

  const handleEditAgent = (a: Agent) => {
    cancelEdit();
    setEditingId(a.id);
    setNewAgentName(a.name || '');
    setNewAgentNombre(a.nombre || '');
    setNewAgentApellido(a.apellido || '');
    setNewAgentLocalidad(a.localidad || '');
    setNewAgentJerarquia(a.jerarquia || '');
    setNewAgentJerarquiaError(null);
    setNewAgentEscalafon(a.escalafon || '');
    setNewAgentEscalafonError(null);
    setNewAgentPhone(a.telefono || '');
    setNewAgentLegajo(a.legajo || '');
    setNewAgentShift(a.turno || 1);
    setNewAgentHasLicense(a.hasLicense || false);
    setNewAgentLicenseType(a.licenseType || 'auto');
    setNewAgentLicenseCategory(a.licenseCategory || 'comun');
    setNewAgentLicenseExpiration(a.licenseExpiration || '');
    setNewAgentHasDAEO(a.hasDAEO || false);
    setNewAgentDAEOExpiration(a.daeoExpiration || '');

    setNewAgentDomicilio(a.domicilio || '');
    setNewAgentMarcaChaleco(a.marcaChaleco || '');
    setNewAgentModeloChaleco(a.modeloChaleco || '');
    setNewAgentNroSerieChaleco(a.nroSerieChaleco || '');
    setNewAgentMarcaArmamento(a.marcaArmamento || '');
    setNewAgentModeloArmamento(a.modeloArmamento || '');
    setNewAgentNroSerieArmamento(a.nroSerieArmamento || '');

    if (
      a.marcaChaleco ||
      a.modeloChaleco ||
      a.nroSerieChaleco ||
      a.marcaArmamento ||
      a.modeloArmamento ||
      a.nroSerieArmamento
    ) {
      setShowMoreFields(true);
    }
  };

  const handleEditInfra = (i: any) => {
    cancelEdit();
    setEditingId(i.id);
    setNewInfraName(i.name.replace(/^OS /, ''));
    setNewInfraDescription(i.description || '');
    setNewInfraRO(i.ro || '');
    setNewInfraShift(i.turno || userShiftNum || 1);
    setNewOSNumero(i.numero || '');
    setNewOSHorario(i.horario || '');
    setNewOSUbicacion(i.ubicacion || '');
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAgentNombre.trim() && newAgentApellido.trim()) {
      const trimmedLegajo = newAgentLegajo.trim();
      if (!trimmedLegajo) {
        setNewAgentLegajoError('El legajo es obligatorio.');
        return;
      }

      const trimmedJ = newAgentJerarquia.trim().toUpperCase();
      if (trimmedJ !== '' && !validRanks.includes(trimmedJ)) {
        setNewAgentJerarquia('');
        setNewAgentJerarquiaError('La jerarquía ingresada no es válida. Debe elegir una de la lista.');
        return;
      }
      const trimmedE = newAgentEscalafon.trim();
      if (trimmedE !== '' && !validEscalafones.includes(trimmedE)) {
        setNewAgentEscalafon('');
        setNewAgentEscalafonError('El escalafón ingresado no es válido. Debe elegir uno de la lista.');
        return;
      }

      const unifiedName = `${newAgentApellido.trim()} ${newAgentNombre.trim()}`.trim();

      // Check if duplicate legajo exists
      if (!editingId || (state.agents.find(a => a.id === editingId)?.legajo !== trimmedLegajo)) {
        const existing = state.agents.find(a => a.legajo === trimmedLegajo && !a.isDeleted);
        if (existing) {
          if (isAdmin || (existing.turno === userShiftNum)) {
            const confirmText = `El legajo ${trimmedLegajo} ya está registrado para el efectivo: ${existing.jerarquia || ''} ${existing.apellido || ''} ${existing.nombre || ''}.\n\n¿Desea precargar sus datos para modificarlos?`;
            if (window.confirm(confirmText)) {
              handleEditAgent(existing);
            } else {
              setNewAgentLegajo('');
            }
          } else {
            const alertText = `El efectivo: ${existing.jerarquia || ''} ${existing.apellido || ''} ${existing.nombre || ''} con legajo ${trimmedLegajo} cumple funciones en el Turno ${existing.turno}.\n\nPara utilizarlo, debe solicitar a un operador de ese turno que lo transfiera a tu turno, o bien a un administrador.`;
            window.alert(alertText);
            setNewAgentLegajo('');
          }
          return;
        }
      }

      if (editingId) {
        if (!isAdmin && newAgentShift !== userShiftNum) {
          const confirmTransfer = window.confirm(`¡Atención! Al mover a este efectivo al Turno ${newAgentShift}, dejará de estar visible y editable en tu turno. ¿Desea confirmar la transferencia?`);
          if (!confirmTransfer) return;
        }

        if (window.confirm(`¿Está seguro que desea guardar los cambios para el efectivo ${unifiedName}?`)) {
          updateAgent(editingId, {
            nombre: newAgentNombre.trim(),
            apellido: newAgentApellido.trim(),
            localidad: newAgentLocalidad.trim(),
            name: unifiedName,
            jerarquia: trimmedJ || '',
            escalafon: trimmedE || '',
            telefono: newAgentPhone.trim(),
            legajo: trimmedLegajo,
            turno: newAgentShift,
            hasLicense: newAgentHasLicense,
            licenseType: newAgentLicenseType,
            licenseCategory: newAgentLicenseCategory,
            licenseExpiration: newAgentLicenseExpiration,
            hasDAEO: newAgentHasDAEO,
            daeoExpiration: newAgentDAEOExpiration,
            domicilio: newAgentDomicilio.trim(),
            marcaChaleco: newAgentMarcaChaleco.trim(),
            modeloChaleco: newAgentModeloChaleco.trim(),
            nroSerieChaleco: newAgentNroSerieChaleco.trim(),
            marcaArmamento: newAgentMarcaArmamento.trim(),
            modeloArmamento: newAgentModeloArmamento.trim(),
            nroSerieArmamento: newAgentNroSerieArmamento.trim(),
          });
          cancelEdit();
        }
      } else {
        if (!isAdmin && newAgentShift !== userShiftNum) {
          const confirmTransfer = window.confirm(`¡Atención! Al mover a este efectivo al Turno ${newAgentShift}, dejará de estar visible y editable en tu turno. ¿Desea confirmar la transferencia?`);
          if (!confirmTransfer) return;
        }

        addAgent(
          newAgentNombre.trim(),
          newAgentApellido.trim(),
          newAgentLocalidad.trim(),
          newAgentPhone.trim(),
          trimmedLegajo,
          newAgentShift,
          newAgentHasLicense,
          newAgentLicenseType,
          newAgentLicenseCategory,
          newAgentLicenseExpiration,
          newAgentHasDAEO,
          newAgentDAEOExpiration,
          newAgentDomicilio.trim(),
          newAgentMarcaChaleco.trim(),
          newAgentModeloChaleco.trim(),
          newAgentNroSerieChaleco.trim(),
          newAgentMarcaArmamento.trim(),
          newAgentModeloArmamento.trim(),
          newAgentNroSerieArmamento.trim(),
          trimmedJ || '',
          trimmedE || ''
        );
        cancelEdit();
      }
    }
  };

  const handleAddInfra = (e: React.FormEvent, type: string) => {
    e.preventDefault();
    if (type === 'ordenes') {
      if (newOSNumero.trim() && newOSUbicacion.trim()) {
        const payload = {
          name: `OS ${newOSNumero.trim()}`,
          numero: newOSNumero.trim(),
          horario: newOSHorario.trim(),
          ubicacion: newOSUbicacion.trim(),
          description: newInfraDescription.trim(),
          turno: newInfraShift,
        };
        if (editingId) {
          updateInfra(type, editingId, payload);
        } else {
          addInfra(type, payload);
        }
        cancelEdit();
      }
    } else {
      if (newInfraName.trim()) {
        const payload = {
          name: newInfraName.trim(),
          ro: newInfraRO.trim(),
          description: newInfraDescription.trim(),
          turno: newInfraShift,
        };
        if (editingId) {
          updateInfra(type, editingId, payload);
        } else {
          addInfra(type, payload);
        }
        cancelEdit();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative z-[9999]">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950 relative z-[1000] shrink-0">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Settings className="mr-2 text-yellow-500" /> Gestión de recursos
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto relative z-[1000] shrink-0 scrollbar-hide">
          <button
            onClick={() => {
              setActiveTab('personal');
              cancelEdit();
              setResourceSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'personal'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => {
              setActiveTab('garitas');
              cancelEdit();
              setResourceSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'garitas'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Módulos
          </button>
          <button
            onClick={() => {
              setActiveTab('qths');
              cancelEdit();
              setResourceSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'qths'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            QTH
          </button>
          <button
            onClick={() => {
              setActiveTab('moviles');
              cancelEdit();
              setResourceSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'moviles'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Móviles
          </button>
          <button
            onClick={() => {
              setActiveTab('motos');
              cancelEdit();
              setResourceSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'motos'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Motos
          </button>
          <button
            onClick={() => {
              setActiveTab('ordenes');
              cancelEdit();
              setResourceSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'ordenes'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Órdenes
          </button>
          <button
            onClick={() => {
              setActiveTab('comisiones');
              cancelEdit();
              setResourceSearchQuery('');
            }}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comisiones'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Comisiones
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'personal' && (
            <div>
              <form
                onSubmit={handleAddAgent}
                className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700"
              >
                <h4 className="text-sm font-bold text-slate-300">
                  {editingId ? 'Editar Efectivo' : 'Agregar Nuevo Efectivo'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      list="ranks-list-settings"
                      value={newAgentJerarquia}
                      onChange={(e) => {
                        setNewAgentJerarquia(e.target.value.toUpperCase());
                        setNewAgentJerarquiaError(null);
                      }}
                      onBlur={() => {
                        const t = newAgentJerarquia.trim().toUpperCase();
                        if (t !== '' && !validRanks.includes(t)) {
                          setNewAgentJerarquia('');
                          setNewAgentJerarquiaError(
                            'La jerarquía ingresada no es válida. Debe elegir una de la lista.'
                          );
                        } else {
                          setNewAgentJerarquiaError(null);
                        }
                      }}
                      autoComplete="off"
                      placeholder="Jerarquía (ej: Sgto., OFL., etc.)"
                      className={`bg-slate-800 border ${
                        newAgentJerarquiaError
                          ? 'border-red-500 ring-1 ring-red-500'
                          : 'border-slate-700'
                      } rounded p-2 text-white text-sm`}
                    />
                    <datalist id="ranks-list-settings">
                      {validRanks.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                    {newAgentJerarquiaError && (
                      <span className="text-red-500 text-[10px] mt-1 font-semibold">
                        {newAgentJerarquiaError}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      value={newAgentLegajo}
                      onChange={(e) => {
                        setNewAgentLegajo(e.target.value.replace(/\D/g, ''));
                        setNewAgentLegajoError(null);
                      }}
                      onBlur={() => {
                        const trimmedLegajo = newAgentLegajo.trim();
                        if (!trimmedLegajo) {
                          setNewAgentLegajoError('El legajo es obligatorio.');
                          return;
                        }
                        
                        if (!editingId || (state.agents.find(a => a.id === editingId)?.legajo !== trimmedLegajo)) {
                          const existing = state.agents.find(a => a.legajo === trimmedLegajo && !a.isDeleted);
                          if (existing) {
                            if (isAdmin || (existing.turno === userShiftNum)) {
                              const confirmText = `El legajo ${trimmedLegajo} ya está registrado para el efectivo: ${existing.jerarquia || ''} ${existing.apellido || ''} ${existing.nombre || ''}.\n\n¿Desea precargar sus datos para modificarlos?`;
                              if (window.confirm(confirmText)) {
                                handleEditAgent(existing);
                              } else {
                                setNewAgentLegajo('');
                              }
                            } else {
                              const alertText = `El efectivo: ${existing.jerarquia || ''} ${existing.apellido || ''} ${existing.nombre || ''} con legajo ${trimmedLegajo} cumple funciones en el Turno ${existing.turno}.\n\nPara utilizarlo, debe solicitar a un operador de ese turno que lo transfiera a tu turno, o bien a un administrador.`;
                              window.alert(alertText);
                              setNewAgentLegajo('');
                            }
                          }
                        }
                      }}
                      placeholder="Legajo"
                      className={`bg-slate-800 border ${
                        newAgentLegajoError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'
                      } rounded p-2 text-white text-sm`}
                      required
                    />
                    {newAgentLegajoError && (
                      <span className="text-red-500 text-[10px] mt-1 font-semibold">
                        {newAgentLegajoError}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      list="branches-list-settings"
                      value={newAgentEscalafon}
                      onChange={(e) => {
                        setNewAgentEscalafon(e.target.value);
                        setNewAgentEscalafonError(null);
                      }}
                      onBlur={() => {
                        const t = newAgentEscalafon.trim();
                        if (t !== '' && !validEscalafones.includes(t)) {
                          setNewAgentEscalafon('');
                          setNewAgentEscalafonError(
                            'El escalafón ingresado no es válido. Debe elegir uno de la lista.'
                          );
                        } else {
                          setNewAgentEscalafonError(null);
                        }
                      }}
                      autoComplete="off"
                      placeholder="Escalafón (ej: COMANDO, etc.)"
                      className={`bg-slate-800 border ${
                        newAgentEscalafonError
                          ? 'border-red-500 ring-1 ring-red-500'
                          : 'border-slate-700'
                      } rounded p-2 text-white text-sm`}
                    />
                    <datalist id="branches-list-settings">
                      {validEscalafones.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                    {newAgentEscalafonError && (
                      <span className="text-red-500 text-[10px] mt-1 font-semibold">
                        {newAgentEscalafonError}
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={newAgentApellido}
                    onChange={(e) => setNewAgentApellido(e.target.value)}
                    placeholder="Apellido/s"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={newAgentNombre}
                    onChange={(e) => setNewAgentNombre(e.target.value)}
                    placeholder="Nombre/s"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={newAgentPhone}
                    onChange={(e) => setNewAgentPhone(e.target.value.replace(/[^\d\s\-+]/g, ''))}
                    placeholder="Teléfono (Opcional)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <input
                    type="text"
                    value={newAgentDomicilio}
                    onChange={(e) => setNewAgentDomicilio(e.target.value)}
                    placeholder="Domicilio (Opcional)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <input
                    type="text"
                    value={newAgentLocalidad}
                    onChange={(e) => setNewAgentLocalidad(e.target.value)}
                    placeholder="Localidad (Opcional)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <select
                    value={newAgentShift}
                    onChange={(e) => setNewAgentShift(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  >
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>

                <div className="border-t border-slate-700 pt-3 mt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAgentHasLicense}
                      onChange={(e) => setNewAgentHasLicense(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-yellow-500"
                    />
                    Posee Licencia de Conducir
                  </label>
                  {newAgentHasLicense && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-4 border-l-2 border-slate-700 ml-1 mb-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tipo</label>
                        <select
                          value={newAgentLicenseType}
                          onChange={(e) => setNewAgentLicenseType(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                        >
                          <option value="auto">Auto</option>
                          <option value="moto">Moto</option>
                          <option value="ambas">Ambas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Categoría</label>
                        <select
                          value={newAgentLicenseCategory}
                          onChange={(e) => setNewAgentLicenseCategory(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                        >
                          <option value="comun">Común</option>
                          <option value="profesional">Profesional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Vencimiento</label>
                        <input
                          type="date"
                          value={newAgentLicenseExpiration}
                          onChange={(e) => setNewAgentLicenseExpiration(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAgentHasDAEO}
                      onChange={(e) => setNewAgentHasDAEO(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-yellow-500"
                    />
                    Posee Permiso DAEO
                  </label>
                  {newAgentHasDAEO && (
                    <div className="pl-4 border-l-2 border-slate-700 ml-1 mb-2">
                      <label className="block text-[10px] text-slate-500 mb-1">Vencimiento DAEO</label>
                      <input
                        type="date"
                        value={newAgentDAEOExpiration}
                        onChange={(e) => setNewAgentDAEOExpiration(e.target.value)}
                        className="w-full sm:w-1/3 bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                      />
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-4 border-l-2 border-slate-700 ml-1 mt-3 mb-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Marca Chaleco</label>
                          <select
                            value={newAgentMarcaChaleco}
                            onChange={(e) => setNewAgentMarcaChaleco(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          >
                            <option value="">Seleccionar marca...</option>
                            {validVestBrands.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                            {newAgentMarcaChaleco && !validVestBrands.includes(newAgentMarcaChaleco) && (
                              <option value={newAgentMarcaChaleco}>{newAgentMarcaChaleco}</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Modelo Chaleco</label>
                          <input
                            type="text"
                            value={newAgentModeloChaleco}
                            onChange={(e) => setNewAgentModeloChaleco(e.target.value)}
                            placeholder="Ej: Multiamenaza"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">N° Serie Chaleco</label>
                          <input
                            type="text"
                            value={newAgentNroSerieChaleco}
                            onChange={(e) => setNewAgentNroSerieChaleco(e.target.value)}
                            placeholder="Ej: 12345"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Marca Armamento</label>
                          <input
                            type="text"
                            value={newAgentMarcaArmamento}
                            onChange={(e) => setNewAgentMarcaArmamento(e.target.value)}
                            placeholder="Ej: Bersa"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Modelo Armamento</label>
                          <input
                            type="text"
                            value={newAgentModeloArmamento}
                            onChange={(e) => setNewAgentModeloArmamento(e.target.value)}
                            placeholder="Ej: TPR9"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">N° Serie Armamento</label>
                          <input
                            type="text"
                            value={newAgentNroSerieArmamento}
                            onChange={(e) => setNewAgentNroSerieArmamento(e.target.value)}
                            placeholder="Ej: 98765"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                  >
                    {editingId ? 'Guardar Cambios' : 'Agregar Efectivo'}
                  </button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">Lista de Efectivos</h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar efectivo..."
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs flex-1 sm:w-48"
                  />
                  {isAdmin && (
                    <select
                      value={resourceFilterShift}
                      onChange={(e) =>
                        setResourceFilterShift(
                          e.target.value === 'all' ? 'all' : (Number(e.target.value) as any)
                        )
                      }
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0"
                    >
                      <option value="all">Todos los turnos</option>
                      <option value={1}>Turno 1</option>
                      <option value={2}>Turno 2</option>
                      <option value={3}>Turno 3</option>
                      <option value={4}>Turno 4</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {state.agents
                  .filter(
                    (a: Agent) =>
                      (isAdmin || (a.turno || 1) === userShiftNum) &&
                      (resourceFilterShift === 'all' || (a.turno || 1) === resourceFilterShift) &&
                      (a.name?.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        a.nombre?.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        a.apellido?.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        (a.legajo || '').includes(resourceSearchQuery))
                  )
                  .map((a: Agent) => (
                    <div
                      key={a.id}
                      className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700"
                    >
                      <div>
                        <div className="text-slate-200 font-medium">
                          {(a.jerarquia ? a.jerarquia + ' ' : '') +
                            (a.apellido || a.nombre
                              ? `${a.apellido || ''} ${a.nombre || ''}`.trim()
                              : a.name)}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                          {a.legajo && <span>L: {a.legajo}</span>}
                          {a.telefono && <span>Tel: {a.telefono}</span>}
                          {a.localidad && <span>Loc: {a.localidad}</span>}
                          <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500">
                            {`Turno ${a.turno || 1}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex">
                        {(isAdmin || userShiftNum === (a.turno || 1)) && (
                          <>
                            <button
                              onClick={() => handleEditAgent(a)}
                              className="text-slate-500 hover:text-blue-500 p-2"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                const displayName =
                                  (a.jerarquia ? a.jerarquia + ' ' : '') +
                                  (a.apellido || a.nombre
                                    ? `${a.apellido || ''} ${a.nombre || ''}`.trim()
                                    : a.name);
                                if (
                                  window.confirm(
                                    `¿Está seguro que desea eliminar al efectivo ${displayName}?`
                                  )
                                ) {
                                  removeAgent(a.id);
                                }
                              }}
                              className="text-slate-500 hover:text-red-500 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {(activeTab === 'garitas' || activeTab === 'qths' || activeTab === 'comisiones') && (
            <div>
              <form
                onSubmit={(e) => handleAddInfra(e, activeTab)}
                className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700"
              >
                <h4 className="text-sm font-bold text-slate-300">
                  {editingId ? 'Editar' : 'Agregar'}{' '}
                  {activeTab === 'garitas'
                    ? 'Módulo'
                    : activeTab === 'qths'
                    ? 'QTH'
                    : 'Comisión'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newInfraName}
                    onChange={(e) => setNewInfraName(e.target.value)}
                    placeholder={`Nombre d${
                      activeTab === 'garitas'
                        ? 'el módulo'
                        : activeTab === 'qths'
                        ? 'e la intersección'
                        : 'e la comisión'
                    }`}
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={newInfraDescription}
                    onChange={(e) => setNewInfraDescription(e.target.value)}
                    placeholder="Descripción (Opcional)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <select
                    value={newInfraShift}
                    onChange={(e) => setNewInfraShift(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className={`bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!isAdmin}
                  >
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                  >
                    {editingId ? 'Guardar Cambios' : 'Agregar'}
                  </button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">
                  Lista de{' '}
                  {activeTab === 'garitas'
                    ? 'Módulos'
                    : activeTab === 'qths'
                    ? 'QTHs'
                    : 'Comisiones'}
                </h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs w-full sm:w-48"
                  />
                  {isAdmin && (
                    <select
                      value={resourceFilterShift}
                      onChange={(e) =>
                        setResourceFilterShift(
                          e.target.value === 'all' ? 'all' : (Number(e.target.value) as any)
                        )
                      }
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0"
                    >
                      <option value="all">Todos los turnos</option>
                      <option value={1}>Turno 1</option>
                      <option value={2}>Turno 2</option>
                      <option value={3}>Turno 3</option>
                      <option value={4}>Turno 4</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(state.infrastructure[activeTab as keyof Infrastructure] || [])
                  .filter(
                    (i: InfrastructureItem) =>
                      (isAdmin || i.turno === userShiftNum) &&
                      (resourceFilterShift === 'all' || i.turno === resourceFilterShift) &&
                      (i.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        (i.description || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()))
                  )
                  .map((i: InfrastructureItem) => (
                    <div
                      key={i.id}
                      className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700"
                    >
                      <div>
                        <div className="text-slate-200 font-medium flex items-center gap-2">
                          {i.name}
                          {resourceFilterShift === 'all' && (
                            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-normal">
                              {`Turno ${i.turno || 1}`}
                            </span>
                          )}
                        </div>
                        {i.description && (
                          <div className="text-xs text-slate-500 mt-1">{i.description}</div>
                        )}
                      </div>
                      <div className="flex">
                        {(isAdmin || i.turno === userShiftNum) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditInfra(i)}
                              className="text-slate-500 hover:text-blue-500 p-2"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeInfra(activeTab, i.id)}
                              className="text-slate-500 hover:text-red-500 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {(activeTab === 'moviles' || activeTab === 'motos') && (
            <div>
              <form
                onSubmit={(e) => handleAddInfra(e, activeTab)}
                className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700"
              >
                <h4 className="text-sm font-bold text-slate-300">
                  {editingId ? 'Editar' : 'Agregar'} {activeTab === 'moviles' ? 'Móvil' : 'Moto'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newInfraName}
                    onChange={(e) => setNewInfraName(e.target.value)}
                    placeholder="Nombre (Ej: Móvil 01)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={newInfraRO}
                    onChange={(e) => setNewInfraRO(e.target.value)}
                    placeholder="RO (Ej: RO-123)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <input
                    type="text"
                    value={newInfraDescription}
                    onChange={(e) => setNewInfraDescription(e.target.value)}
                    placeholder="Descripción (Opcional)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <select
                    value={newInfraShift}
                    onChange={(e) => setNewInfraShift(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className={`bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!isAdmin}
                  >
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                  >
                    {editingId ? 'Guardar Cambios' : 'Agregar'}
                  </button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">
                  Lista de {activeTab === 'moviles' ? 'Móviles' : 'Motos'}
                </h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs w-full sm:w-48"
                  />
                  {isAdmin && (
                    <select
                      value={resourceFilterShift}
                      onChange={(e) =>
                        setResourceFilterShift(
                          e.target.value === 'all' ? 'all' : (Number(e.target.value) as any)
                        )
                      }
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0"
                    >
                      <option value="all">Todos los turnos</option>
                      <option value={1}>Turno 1</option>
                      <option value={2}>Turno 2</option>
                      <option value={3}>Turno 3</option>
                      <option value={4}>Turno 4</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(state.infrastructure[activeTab as keyof Infrastructure] || [])
                  .filter(
                    (i: InfrastructureItem) =>
                      (isAdmin || i.turno === userShiftNum) &&
                      (resourceFilterShift === 'all' || i.turno === resourceFilterShift) &&
                      (i.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        (i.description || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        (i.ro || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()))
                  )
                  .map((i: InfrastructureItem) => (
                    <div
                      key={i.id}
                      className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-200 font-medium">{i.name}</span>
                          {i.ro && (
                            <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                              {i.ro}
                            </span>
                          )}
                          {resourceFilterShift === 'all' && (
                            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-normal">
                              {`Turno ${i.turno || 1}`}
                            </span>
                          )}
                        </div>
                        {i.description && (
                          <div className="text-xs text-slate-500">{i.description}</div>
                        )}
                      </div>
                      <div className="flex">
                        {(isAdmin || i.turno === userShiftNum) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditInfra(i)}
                              className="text-slate-500 hover:text-blue-500 p-2"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeInfra(activeTab, i.id)}
                              className="text-slate-500 hover:text-red-500 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'ordenes' && (
            <div>
              <form
                onSubmit={(e) => handleAddInfra(e, activeTab)}
                className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700"
              >
                <h4 className="text-sm font-bold text-slate-300">
                  {editingId ? 'Editar' : 'Agregar'} Orden de Servicio
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newOSNumero}
                    onChange={(e) => setNewOSNumero(e.target.value)}
                    placeholder="Número (Ej: 1234/24)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={newOSHorario}
                    onChange={(e) => setNewOSHorario(e.target.value)}
                    placeholder="Horario (Ej: 08:00 a 12:00)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <input
                    type="text"
                    value={newOSUbicacion}
                    onChange={(e) => setNewOSUbicacion(e.target.value)}
                    placeholder="Ubicación (Ej: Estadio Municipal)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={newInfraDescription}
                    onChange={(e) => setNewInfraDescription(e.target.value)}
                    placeholder="Descripción (Opcional)"
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                  />
                  <select
                    value={newInfraShift}
                    onChange={(e) => setNewInfraShift(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className={`bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!isAdmin}
                  >
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto"
                  >
                    {editingId ? 'Guardar Cambios' : 'Agregar'}
                  </button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">Lista de Órdenes de Servicio</h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs w-full sm:w-48"
                  />
                  {isAdmin && (
                    <select
                      value={resourceFilterShift}
                      onChange={(e) =>
                        setResourceFilterShift(
                          e.target.value === 'all' ? 'all' : (Number(e.target.value) as any)
                        )
                      }
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0"
                    >
                      <option value="all">Todos los turnos</option>
                      <option value={1}>Turno 1</option>
                      <option value={2}>Turno 2</option>
                      <option value={3}>Turno 3</option>
                      <option value={4}>Turno 4</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(state.infrastructure.ordenes || [])
                  .filter(
                    (i: InfrastructureItem) =>
                      (isAdmin || i.turno === userShiftNum) &&
                      (resourceFilterShift === 'all' || i.turno === resourceFilterShift) &&
                      ((i.name || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        (i.numero || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        (i.ubicacion || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                        (i.description || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()))
                  )
                  .map((i: InfrastructureItem) => (
                    <div
                      key={i.id}
                      className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-200 font-bold">OS {i.numero}</span>
                          {i.horario && (
                            <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                              {i.horario}
                            </span>
                          )}
                          {resourceFilterShift === 'all' && (
                            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-normal">
                              {`Turno ${i.turno || 1}`}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-400">{i.ubicacion}</span>
                        {i.description && (
                          <span className="text-xs text-slate-500 mt-1">{i.description}</span>
                        )}
                      </div>
                      <div className="flex">
                        {(isAdmin || i.turno === userShiftNum) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditInfra(i)}
                              className="text-slate-500 hover:text-blue-500 p-2"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeInfra(activeTab, i.id)}
                              className="text-slate-500 hover:text-red-500 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
