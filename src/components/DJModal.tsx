import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FileText, X, Search, Download } from 'lucide-react';
import { Agent } from '../types';
import { validRanks, validEscalafones } from '../constants';

export const DJModal: React.FC = () => {
  const {
    isDJModalOpen,
    setIsDJModalOpen,
    state,
    djSearchQuery,
    setDjSearchQuery,
    isDjSearchDropdownOpen,
    setIsDjSearchDropdownOpen,
    setDjSelectedAgentId,
    djJerarquia,
    setDjJerarquia,
    djEscalafon,
    setDjEscalafon,
    djLegajo,
    setDjLegajo,
    djApellido,
    setDjApellido,
    djNombre,
    setDjNombre,
    djDomicilio,
    setDjDomicilio,
    djLocalidad,
    setDjLocalidad,
    djJerarquiaError,
    setDjJerarquiaError,
    djEscalafonError,
    setDjEscalafonError,
    handleGenerateDJ
  } = useDashboard();

  if (!isDJModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative z-[9999]">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FileText className="mr-2 text-yellow-500" /> Generar DJ Ausente
          </h2>
          <button
            onClick={() => setIsDJModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Agent Search Auto-fill */}
        <div className="mb-5 relative">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Autocompletar con Efectivo
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar efectivo por apellido, nombre o legajo..."
              value={djSearchQuery}
              onChange={(e) => {
                setDjSearchQuery(e.target.value);
                setIsDjSearchDropdownOpen(true);
              }}
              onFocus={() => setIsDjSearchDropdownOpen(true)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 pl-9 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            />
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            {djSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setDjSearchQuery('');
                  setIsDjSearchDropdownOpen(false);
                }}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {isDjSearchDropdownOpen && djSearchQuery.trim().length > 0 && (
            <div className="absolute w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[10000]">
              {state.agents
                .filter((a: Agent) => {
                  const searchStr = `${a.apellido || ''} ${a.nombre || ''} ${a.name || ''} ${a.legajo || ''}`.toLowerCase();
                  return searchStr.includes(djSearchQuery.toLowerCase());
                })
                .slice(0, 5)
                .map((a: Agent) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setDjSelectedAgentId(a.id);
                      setDjJerarquia(a.jerarquia || '');
                      setDjEscalafon(a.escalafon || '');
                      setDjLegajo(a.legajo || '');
                      setDjApellido(a.apellido || '');
                      setDjNombre(a.nombre || '');
                      setDjDomicilio(a.domicilio || '');
                      setDjLocalidad(a.localidad || '');
                      setDjSearchQuery('');
                      setIsDjSearchDropdownOpen(false);
                      setDjJerarquiaError(null);
                      setDjEscalafonError(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-sm border-b border-slate-700/50 last:border-0"
                  >
                    <div className="font-semibold">
                      {a.jerarquia ? `${a.jerarquia} ` : ''}{a.apellido || ''} {a.nombre || a.name || ''}
                    </div>
                    <div className="text-xs text-slate-400">
                      Legajo: {a.legajo || 'N/A'} | Escalafón: {a.escalafon || 'N/A'}
                    </div>
                  </button>
                ))}
              {state.agents.filter((a: Agent) => {
                const searchStr = `${a.apellido || ''} ${a.nombre || ''} ${a.name || ''} ${a.legajo || ''}`.toLowerCase();
                return searchStr.includes(djSearchQuery.toLowerCase());
              }).length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 italic text-center">
                  No se encontraron efectivos
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-slate-800 my-4"></div>

        <form onSubmit={handleGenerateDJ} className="space-y-4">
          {/* Jerarquía and Legajo */}
          <div className="grid grid-cols-[130px_1fr] gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Jerarquía</label>
              <input
                type="text"
                value={djJerarquia}
                onChange={(e) => {
                  setDjJerarquia(e.target.value.toUpperCase());
                  setDjJerarquiaError(null);
                }}
                onBlur={() => {
                  const t = djJerarquia.trim().toUpperCase();
                  if (t !== '' && !validRanks.includes(t)) {
                    setDjJerarquia('');
                    setDjJerarquiaError('Invalido');
                  } else {
                    setDjJerarquiaError(null);
                  }
                }}
                list="dj-ranks-list"
                className={`w-full bg-slate-800 border ${
                  djJerarquiaError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'
                } rounded p-2 text-white text-sm`}
                placeholder="Elegir..."
                required
              />
              <datalist id="dj-ranks-list">
                {validRanks.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Legajo</label>
              <input
                type="text"
                value={djLegajo}
                onChange={(e) => setDjLegajo(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                placeholder="Legajo..."
                required
              />
            </div>
          </div>

          {/* Escalafón */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Escalafón</label>
            <input
              type="text"
              value={djEscalafon}
              onChange={(e) => {
                setDjEscalafon(e.target.value);
                setDjEscalafonError(null);
              }}
              onBlur={() => {
                const t = djEscalafon.trim();
                if (t !== '' && !validEscalafones.includes(t)) {
                  setDjEscalafon('');
                  setDjEscalafonError('Escalafón no válido');
                } else {
                  setDjEscalafonError(null);
                }
              }}
              list="dj-branches-list"
              className={`w-full bg-slate-800 border ${
                djEscalafonError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'
              } rounded p-2 text-white text-sm`}
              placeholder="Escalafón..."
              required
            />
            <datalist id="dj-branches-list">
              {validEscalafones.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          {/* Apellido and Nombre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Apellido/s</label>
              <input
                type="text"
                value={djApellido}
                onChange={(e) => setDjApellido(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                placeholder="Apellido..."
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nombre/s</label>
              <input
                type="text"
                value={djNombre}
                onChange={(e) => setDjNombre(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                placeholder="Nombre..."
                required
              />
            </div>
          </div>

          {/* Domicilio */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Domicilio</label>
            <input
              type="text"
              value={djDomicilio}
              onChange={(e) => setDjDomicilio(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="Calle, Número, Depto..."
              required
            />
          </div>

          {/* Localidad */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Localidad</label>
            <input
              type="text"
              value={djLocalidad}
              onChange={(e) => setDjLocalidad(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
              placeholder="Localidad..."
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsDJModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={16} /> Generar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
