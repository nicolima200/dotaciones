import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Shield, MapPin, Calendar, Menu, Settings, FileText, ChevronUp, ChevronDown, Check,
  ClipboardCopy, Printer, Download, Upload, LogOut, Search, X
} from 'lucide-react';
import { Shift } from '../types';
import logoMinisterio from '../assets/logo_ministerio.png';
import logoProvincia from '../assets/logo_provincia.png';

export const DashboardHeader: React.FC = () => {
  const {
    currentShift,
    setCurrentShift,
    currentTime,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchIndex,
    prevSearchMatch,
    nextSearchMatch,
    menuRef,
    isMenuOpen,
    setIsMenuOpen,
    fileInputRef,
    handleImport,
    setIsScheduleModalOpen,
    setIsSettingsOpen,
    isReportSubmenuOpen,
    setIsReportSubmenuOpen,
    openReportModal,
    copied,
    isNoteSubmenuOpen,
    setIsNoteSubmenuOpen,
    setDjSelectedAgentId,
    setDjJerarquia,
    setDjEscalafon,
    setDjLegajo,
    setDjApellido,
    setDjNombre,
    setDjDomicilio,
    setDjLocalidad,
    setDjSearchQuery,
    setIsDjSearchDropdownOpen,
    setDjJerarquiaError,
    setDjEscalafonError,
    setIsDJModalOpen,
    showToast,
    handleExportClick,
    userRole,
    logo,
    logoError,
    setLogoError
  } = useDashboard();

  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-brand">
        {logoError ? (
          <Shield className="text-yellow-500" size={40} />
        ) : (
          <img
            src={logo}
            alt="Logo"
            className="header-logo"
            onError={() => setLogoError(true)}
          />
        )}
        <h1 className="header-title">UPPL Alte. Brown</h1>
      </div>

      <div className="header-center-info">
        <div className="turn-selector-wrapper">
          <span className="turn-label hidden sm:inline">Turno Activo:</span>
          <select
            value={currentShift}
            onChange={(e) => setCurrentShift(e.target.value as Shift)}
            disabled={userRole !== 'admin'}
            className="turn-select"
          >
            <option value="turno1">Turno 1 (09:00 - 21:00)</option>
            <option value="turno2">Turno 2 (21:00 - 09:00)</option>
            <option value="turno3">Turno 3 (09:00 - 21:00)</option>
            <option value="turno4">Turno 4 (21:00 - 09:00)</option>
          </select>
        </div>
        <div className="time-display font-bold">
          {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
      </div>

      <div className="header-controls">
        <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden mr-2">
          <div className="px-2 text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) prevSearchMatch();
                else nextSearchMatch();
              }
            }}
            className="bg-transparent border-none text-white text-sm py-1.5 w-24 md:w-32 lg:w-48 outline-none focus:ring-0"
          />
          {searchResults.length > 0 && (
            <div className="flex items-center">
              <div className="px-2 text-xs text-yellow-500 font-bold whitespace-nowrap">
                {searchIndex + 1}/{searchResults.length}
              </div>
              {searchResults.length > 1 && (
                <div className="flex items-center border-l border-slate-700 pl-1 py-1 mr-1">
                  <button onClick={prevSearchMatch} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Anterior (Shift+Enter)">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={nextSearchMatch} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Siguiente (Enter)">
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="px-2 text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="control-group mr-2">
          <a href="https://www.google.com/maps/d/u/0/viewer?hl=es&mid=1sO6YMhsTRuazoJgZk55iwPT6VqPEpuI&ll=-34.83699220303081%2C-58.35705193571492&z=13" target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ borderRight: '1px solid var(--glass-border)' }} title="Ver Mapa de Jurisdicción">
            <MapPin size={18} />
            <span className="text-xs font-medium hidden lg:inline">Mapa</span>
          </a>
          <a href="https://calendar.google.com/calendar/u/0?cid=MmNhOWRiNzQ0MmFkMzlhNjlhOGQ3MzExODc5YjM3ZTUyNDMyOThhYzkzYmNiNzMzYWVlYTljNjg1NjBjZDFmNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t" target="_blank" rel="noopener noreferrer" className="btn-icon" title="Ver Calendario">
            <Calendar size={18} />
            <span className="text-xs font-medium hidden lg:inline">Calendario</span>
          </a>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="btn-icon standalone flex items-center gap-2" title="Menú de opciones">
            <Menu size={18} />
            <span className="text-xs font-medium hidden lg:inline">Opciones</span>
          </button>

          <input type="file" ref={fileInputRef} onChange={(e) => { handleImport(e); setIsMenuOpen(false); }} accept=".json" className="hidden" />

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1">
              <button onClick={() => { setIsMenuOpen(false); setIsScheduleModalOpen(true); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-slate-200 transition-colors text-sm text-left">
                <Calendar size={18} className="text-slate-400" /> Programar Relevo
              </button>
              <button onClick={() => { setIsMenuOpen(false); setIsSettingsOpen(true); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-slate-200 transition-colors text-sm text-left">
                <Settings size={18} className="text-slate-400" /> Gestionar Recursos
              </button>
              
              <div className="h-px bg-slate-700 my-1"></div>
              
              {/* Generar informe collapsible menu option */}
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsReportSubmenuOpen(!isReportSubmenuOpen); 
                }} 
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-700 text-slate-200 transition-colors text-sm text-left"
              >
                <span className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-400" /> Generar informe
                </span>
                {isReportSubmenuOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              
              {isReportSubmenuOpen && (
                <div className="bg-slate-900/40 border-y border-slate-700/50 flex flex-col py-1">
                  <button 
                    onClick={() => { 
                      setIsMenuOpen(false); 
                      openReportModal('copy'); 
                    }} 
                    className="flex items-center gap-3 pl-8 pr-4 py-2.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm text-left"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <ClipboardCopy size={16} className="text-slate-400" />}
                    <span>Copiar</span>
                  </button>
                  <button 
                    onClick={() => { 
                      setIsMenuOpen(false); 
                      openReportModal('print'); 
                    }} 
                    className="flex items-center gap-3 pl-8 pr-4 py-2.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm text-left"
                  >
                    <Printer size={16} className="text-slate-400" />
                    <span>PDF</span>
                  </button>
                </div>
              )}

              <div className="h-px bg-slate-700 my-1"></div>

              {/* Generar nota collapsible menu option */}
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsNoteSubmenuOpen(!isNoteSubmenuOpen); 
                }} 
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-700 text-slate-200 transition-colors text-sm text-left"
              >
                <span className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-400" /> Generar nota
                </span>
                {isNoteSubmenuOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              
              {isNoteSubmenuOpen && (
                <div className="bg-slate-900/40 border-y border-slate-700/50 flex flex-col py-1">
                  <button 
                    onClick={() => { 
                      setIsMenuOpen(false); 
                      setDjSelectedAgentId('');
                      setDjJerarquia('');
                      setDjEscalafon('');
                      setDjLegajo('');
                      setDjApellido('');
                      setDjNombre('');
                      setDjDomicilio('');
                      setDjLocalidad('');
                      setDjSearchQuery('');
                      setIsDjSearchDropdownOpen(false);
                      setDjJerarquiaError(null);
                      setDjEscalafonError(null);
                      setIsDJModalOpen(true); 
                    }} 
                    className="flex items-center gap-3 pl-8 pr-4 py-2.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm text-left"
                  >
                    <span>DJ ausente</span>
                  </button>
                  <button 
                    onClick={() => { 
                      setIsMenuOpen(false); 
                      showToast("Función no disponible por el momento...");
                    }} 
                    className="flex items-center gap-3 pl-8 pr-4 py-2.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm text-left"
                  >
                    <span>Retiro arma</span>
                  </button>
                </div>
              )}

              <div className="h-px bg-slate-700 my-1"></div>
              
              <button onClick={handleExportClick} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-slate-200 transition-colors text-sm text-left">
                <Download size={18} className="text-slate-400" /> Exportar Datos
              </button>
              <button onClick={() => { setIsMenuOpen(false); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-slate-200 transition-colors text-sm text-left">
                <Upload size={18} className="text-slate-400" /> Importar Datos
              </button>
              
              <div className="h-px bg-slate-700 my-1"></div>
              
              {userRole === 'admin' && (
                <button onClick={() => navigate('/admin')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-yellow-500 transition-colors text-sm text-left">
                  <Shield size={18} /> Administración
                </button>
              )}
              <button onClick={() => { signOut(auth); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 hover:bg-red-900/40 text-red-400 transition-colors text-sm text-left">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
