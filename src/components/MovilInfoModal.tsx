import { useState } from 'react';
import { Shield, Car, Bike, MapPin, ClipboardList, X, Trash2 } from 'lucide-react';

interface MovilInfoModalProps {
  movil: any;
  infraType: string;
  onClose: () => void;
  updateInfra: (type: string, id: string, updates: any) => void;
  softRemoveInfra: (type: string, id: string) => void;
}

export function MovilInfoModal({ movil, infraType, onClose, updateInfra, softRemoveInfra }: MovilInfoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(movil.name || '');
  const [ro, setRo] = useState(movil.ro || '');
  const [description, setDescription] = useState(movil.description || '');
  const [numero, setNumero] = useState(movil.numero || '');
  const [horario, setHorario] = useState(movil.horario || '');
  const [ubicacion, setUbicacion] = useState(movil.ubicacion || '');

  const isOrden = infraType === 'ordenes';
  const hasRO = infraType === 'moviles' || infraType === 'movil' || infraType === 'motos';

  const handleSave = () => {
    const updates: any = { name, description };
    if (hasRO) {
      updates.ro = ro;
    }
    if (isOrden) {
      updates.numero = numero;
      updates.name = `OS ${numero}`;
      updates.horario = horario;
      updates.ubicacion = ubicacion;
    }
    updateInfra(infraType, movil.id, updates);
    setIsEditing(false);
  };

  const getInfraTypeName = () => {
    switch (infraType) {
      case 'garitas': return 'Módulo';
      case 'moviles':
      case 'movil': return 'Móvil';
      case 'motos': return 'Moto';
      case 'qths': return 'Caminante';
      case 'ordenes': return 'Orden de Servicio';
      case 'comisiones': return 'Comisión';
      default: return 'Recurso';
    }
  };

  const getIcon = () => {
    switch (infraType) {
      case 'garitas': return <Shield className="mr-2 text-yellow-500" />;
      case 'moviles':
      case 'movil': return <Car className="mr-2 text-yellow-500" />;
      case 'motos': return <Bike className="mr-2 text-yellow-500" />;
      case 'qths': return <MapPin className="mr-2 text-yellow-500" />;
      case 'ordenes': return <ClipboardList className="mr-2 text-yellow-500" />;
      case 'comisiones': return <MapPin className="mr-2 text-yellow-500" />;
      default: return <Car className="mr-2 text-yellow-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md max-h-[85vh] overflow-y-auto relative z-[9999] shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950 sticky top-0 z-10">
          <h3 className="text-lg font-bold text-white flex items-center">
            {getIcon()}
            {isOrden ? `OS ${movil.numero || numero || ''}` : `${movil.name} ${movil.ro ? `(${movil.ro})` : ''}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Información de {getInfraTypeName()}
            </h4>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold transition-colors">Editar</button>
            ) : (
              <button onClick={handleSave} className="text-xs bg-yellow-600 text-slate-900 px-2 py-1 rounded font-bold hover:bg-yellow-500 transition-colors">Guardar</button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              {!isOrden ? (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nombre / Identificación</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    placeholder="Ej: Zona 4"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">N° de Orden</label>
                    <input
                      type="text"
                      value={numero}
                      onChange={e => setNumero(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                      placeholder="Ej: 123"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Horario</label>
                    <input
                      type="text"
                      value={horario}
                      onChange={e => setHorario(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                      placeholder="Ej: 08:00 a 20:00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={ubicacion}
                      onChange={e => setUbicacion(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                      placeholder="Ej: Av. Mitre y España"
                    />
                  </div>
                </>
              )}
              {hasRO && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">N° RO</label>
                  <input
                    type="text"
                    value={ro}
                    onChange={e => setRo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                    placeholder="Ej: 25.051"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm min-h-[100px]"
                  placeholder="Descripción..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 mb-1">Nombre:</span>
                <span className="text-sm text-slate-300 font-semibold">
                  {isOrden ? `OS ${movil.numero || numero}` : movil.name}
                </span>
              </div>
              {isOrden && (
                <>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 mb-1">Horario:</span>
                    <span className="text-sm text-slate-300 font-semibold">{movil.horario || horario || <span className="text-slate-600 italic">No asignado</span>}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 mb-1">Ubicación:</span>
                    <span className="text-sm text-slate-300 font-semibold">{movil.ubicacion || ubicacion || <span className="text-slate-600 italic">No asignado</span>}</span>
                  </div>
                </>
              )}
              {hasRO && (
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500 mb-1">N° RO:</span>
                  <span className="text-sm text-slate-300 font-semibold">{movil.ro || ro || <span className="text-slate-600 italic">No asignado</span>}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 mb-1">Descripción:</span>
                <span className="text-sm text-slate-300 whitespace-pre-wrap">{movil.description || <span className="text-slate-600 italic">Sin descripción</span>}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={() => {
              if (window.confirm(`¿Está seguro que desea eliminar este ${getInfraTypeName().toLowerCase()}?`)) {
                softRemoveInfra(infraType, movil.id);
              }
            }}
            className="text-xs bg-red-900/50 hover:bg-red-900 text-red-200 px-4 py-2 rounded font-bold transition-colors flex items-center"
          >
            <Trash2 size={14} className="mr-2" />
            Eliminar {getInfraTypeName()}
          </button>
        </div>
      </div>
    </div>
  );
}
