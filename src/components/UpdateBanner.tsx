import { RefreshCw } from 'lucide-react';

export function UpdateBanner() {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md">
      <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 hover:border-indigo-500/60 transition-all duration-300">
        <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-slate-100">Nueva versión disponible</h4>
          <p className="text-xs text-slate-400 mt-0.5">Se han realizado mejoras en la plataforma. Recarga para aplicarlas.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
