import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FileText, X, ClipboardCopy, Printer } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    reportDate,
    setReportDate,
    reportIncludeHeader,
    setReportIncludeHeader,
    reportSections,
    setReportSections,
    executeReportAction,
    reportAction
  } = useDashboard();

  if (!isReportModalOpen) return null;

  const assignmentSections = [
    { key: 'base', label: 'Base (Oficinas)' },
    { key: 'garita', label: 'Módulos (Garitas)' },
    { key: 'movil', label: 'Móviles' },
    { key: 'motorizada', label: 'Motos' },
    { key: 'caminante', label: 'Caminantes' },
    { key: 'orden_servicio', label: 'Órdenes de Servicio' },
    { key: 'comision', label: 'Comisiones' }
  ];

  const statusSections = [
    { key: 'disponibles', label: 'Disponibles' },
    { key: 'ausentes', label: 'Ausentes / Franco' },
    { key: 'no_disponibles', label: 'No Disponibles' },
    { key: 'vacaciones', label: 'En Vacaciones' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9998] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto relative z-[9999]">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FileText className="mr-2 text-yellow-500" size={20} /> Configurar Informe
          </h2>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Seleccione la fecha para el informe:
          </label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
          />
        </div>

        {/* Header selection */}
        <div className="mb-4 border-t border-slate-800 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Encabezado
          </h3>
          <label className="flex items-center gap-2.5 p-2 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-all border border-slate-800/50 hover:border-slate-700/50 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={reportIncludeHeader}
              onChange={(e) => setReportIncludeHeader(e.target.checked)}
              className="w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500 bg-slate-700 border-slate-600"
            />
            <span>Incluir encabezado institucional</span>
          </label>
        </div>

        {/* Sections selection */}
        <div className="mb-6 border-t border-slate-800 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Secciones a Incluir
          </h3>

          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Asignaciones / Distribución
          </h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {assignmentSections.map((sec) => (
              <label
                key={sec.key}
                className="flex items-center gap-2.5 p-2 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-all border border-slate-800/50 hover:border-slate-700/50 text-xs text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={(reportSections as any)[sec.key]}
                  onChange={(e) =>
                    setReportSections({ ...reportSections, [sec.key]: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded text-yellow-600 focus:ring-yellow-500 bg-slate-700 border-slate-600"
                />
                <span>{sec.label}</span>
              </label>
            ))}
          </div>

          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Estado del Personal
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {statusSections.map((sec) => (
              <label
                key={sec.key}
                className="flex items-center gap-2.5 p-2 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-all border border-slate-800/50 hover:border-slate-700/50 text-xs text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={(reportSections as any)[sec.key]}
                  onChange={(e) =>
                    setReportSections({ ...reportSections, [sec.key]: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded text-yellow-600 focus:ring-yellow-500 bg-slate-700 border-slate-600"
                />
                <span>{sec.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 sticky bottom-0 bg-slate-900 z-10">
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={executeReportAction}
            className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors flex items-center text-sm"
          >
            {reportAction === 'copy' ? (
              <ClipboardCopy size={16} className="mr-2" />
            ) : (
              <Printer size={16} className="mr-2" />
            )}
            {reportAction === 'copy' ? 'Copiar Informe' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
