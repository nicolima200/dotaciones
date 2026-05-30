import React from 'react';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { InfrastructureSections } from '../components/InfrastructureSections';
import { ReportModal } from '../components/ReportModal';
import { DJModal } from '../components/DJModal';

import { AgentInfoModal } from '../components/AgentInfoModal';
import { MovilInfoModal } from '../components/MovilInfoModal';
import { ScheduleModal } from '../components/ScheduleModal';
import { SettingsModal } from '../components/SettingsModal';

import { AlertCircle, ArrowUp, Check, Download, Upload, X } from 'lucide-react';
import { Agent, Infrastructure, InfrastructureItem } from '../types';

export function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
}

function DashboardInner() {
  const {
    state,
    userRole,
    isSettingsOpen,
    setIsSettingsOpen,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    selectedAgentForInfo,
    setSelectedAgentForInfo,
    selectedMovilForInfo,
    setSelectedMovilForInfo,
    confirmDialog,
    setConfirmDialog,
    handleConfirm,
    getInfraName,
    updateAgent,
    softRemoveAgent,
    updateInfra,
    softRemoveInfra,
    assignAgent,
    removeSchedule,
    addAgent,
    removeAgent,
    addInfra,
    removeInfra,
    isExportModalOpen,
    setIsExportModalOpen,
    exportSelectedTurns,
    setExportSelectedTurns,
    handleExport,
    isImportModalOpen,
    setIsImportModalOpen,
    importSelectedTurns,
    setImportSelectedTurns,
    loadState,
    importState,
    toastMessage,
    showScrollTop,
    handleScroll
  } = useDashboard();

  return (
    <div className="app-layout text-slate-100">
      <DashboardHeader />
      <div className="app-content">
        <DashboardSidebar />
        <main className="app-board scrollbar-hide flex-1 overflow-y-auto p-6 space-y-6" onScroll={handleScroll}>
          <InfrastructureSections />
        </main>
      </div>

      {/* Modals */}

      {/* Confirm Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center">
              <AlertCircle className="mr-2 text-red-500" /> {confirmDialog.title}
            </h3>
            <p className="text-slate-400 text-sm mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              >
                {confirmDialog.action ? 'Confirmar' : 'Limpiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Info Modal */}
      {selectedAgentForInfo && (
        <AgentInfoModal
          agent={selectedAgentForInfo}
          onClose={() => setSelectedAgentForInfo(null)}
          state={state}
          getInfraName={getInfraName}
          userRole={userRole}
          updateAgent={(id: string, updates: Partial<Agent>) => {
            updateAgent(id, updates);
            if (updates.turno === undefined || updates.turno === selectedAgentForInfo.turno) {
              setSelectedAgentForInfo({ ...selectedAgentForInfo, ...updates });
            }
          }}
          softRemoveAgent={(id: string) => {
            softRemoveAgent(id);
            setSelectedAgentForInfo(null);
          }}
        />
      )}

      {/* Movil Info Modal */}
      {selectedMovilForInfo && (
        <MovilInfoModal
          movil={selectedMovilForInfo.item}
          infraType={selectedMovilForInfo.type}
          onClose={() => setSelectedMovilForInfo(null)}
          updateInfra={(type: keyof Infrastructure, id: string, updates: Partial<InfrastructureItem>) => {
            updateInfra(type, id, updates);
            setSelectedMovilForInfo({
              ...selectedMovilForInfo,
              item: { ...selectedMovilForInfo.item, ...updates }
            });
          }}
          softRemoveInfra={(type: keyof Infrastructure, id: string) => {
            softRemoveInfra(type, id);
            setSelectedMovilForInfo(null);
          }}
        />
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <ScheduleModal
          onClose={() => setIsScheduleModalOpen(false)}
          state={state}
          assignAgent={assignAgent}
          removeSchedule={removeSchedule}
          getInfraName={getInfraName}
        />
      )}

      {/* Report Modal */}
      <ReportModal />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          state={state}
          addAgent={addAgent}
          removeAgent={removeAgent}
          addInfra={addInfra}
          removeInfra={removeInfra}
          updateAgent={updateAgent}
          updateInfra={updateInfra}
          userRole={userRole}
        />
      )}

      {/* Export Config Modal for Admins */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9998] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto relative z-[9999]">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Download className="mr-2 text-yellow-500" /> Exportar por Turnos
              </h2>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-4">
                Selecciona los turnos de los cuales deseas exportar la información:
              </p>
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map(t => (
                  <label
                    key={t}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer border border-slate-850 hover:border-slate-700 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={exportSelectedTurns.includes(t)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExportSelectedTurns([...exportSelectedTurns, t]);
                        } else {
                          setExportSelectedTurns(exportSelectedTurns.filter(turn => turn !== t));
                        }
                      }}
                      className="w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500 bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-200 font-medium">Turno {t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (exportSelectedTurns.length === 0) {
                    alert("Error: Debes seleccionar al menos un turno para exportar.");
                    return;
                  }
                  handleExport(exportSelectedTurns);
                  setIsExportModalOpen(false);
                }}
                className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Download size={16} /> Exportar JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Config Modal for Admins */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9998] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto relative z-[9999]">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Upload className="mr-2 text-yellow-500" /> Importar por Turnos
              </h2>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-4">
                Selecciona qué turnos del archivo deseas importar y sobrescribir en la base de datos:
              </p>
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map(t => (
                  <label
                    key={t}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer border border-slate-850 hover:border-slate-700 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={importSelectedTurns.includes(t)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setImportSelectedTurns([...importSelectedTurns, t]);
                        } else {
                          setImportSelectedTurns(importSelectedTurns.filter(turn => turn !== t));
                        }
                      }}
                      className="w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500 bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-200 font-medium">Turno {t}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400 leading-relaxed">
                  <strong>¡ATENCIÓN!</strong> Se borrarán e importarán de forma masiva los datos correspondientes únicamente a los turnos seleccionados. Los turnos no seleccionados permanecerán sin cambios en la base de datos.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (importSelectedTurns.length === 0) {
                    alert("Error: Debes seleccionar al menos un turno para importar.");
                    return;
                  }
                  if (
                    window.confirm(
                      "¿Está seguro de que desea proceder con la importación selectiva? Los datos de los turnos seleccionados serán sobrescritos."
                    )
                  ) {
                    try {
                      setIsImportModalOpen(false);
                      await loadState(importState, importSelectedTurns);
                      alert("Importación exitosa. Los turnos seleccionados han sido restaurados.");
                    } catch (err) {
                      console.error("Error writing imported state to Firestore:", err);
                      alert("Ocurrió un error al importar los datos: " + (err as Error).message);
                    }
                  }
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Upload size={16} /> Importar Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DJ Ausente Modal */}
      <DJModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900/95 border border-yellow-500/30 border-l-4 border-l-yellow-500 text-white px-6 py-4 rounded-xl shadow-[0_10px_30px_rgba(251,191,36,0.15)] backdrop-blur-md flex items-center gap-4 z-[9999] animate-fade-in-up max-w-md ring-1 ring-yellow-500/20">
          <div className="bg-yellow-500/20 p-2 rounded-lg flex items-center justify-center">
            <Check size={24} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </div>
          <span className="text-base font-semibold tracking-wide text-slate-100">{toastMessage}</span>
        </div>
      )}

      <button
        className={`fab-scroll ${showScrollTop ? 'visible' : ''}`}
        onClick={() => {
          document.querySelector('.app-board')?.scrollTo({ top: 0, behavior: 'smooth' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        title="Volver arriba"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}
