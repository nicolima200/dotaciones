import React, { useState, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { useStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { Shift, RoleType, Agent, Schedule, InfrastructureItem, Infrastructure } from '../types';
import { validEscalafones } from '../constants';
import logoMinisterio from '../assets/logo_ministerio.png';
import logoProvincia from '../assets/logo_provincia.png';

const getShiftRelativeMinutes = (time: string, shiftStart: string): number => {
  const [h, m] = time.split(':').map(Number);
  const [sh, sm] = shiftStart.split(':').map(Number);
  const tMin = h * 60 + m;
  const sMin = sh * 60 + sm;
  return (tMin - sMin + 1440) % 1440;
};

const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export function useDashboardState() {
  const {
    state,
    addAgent,
    updateAgent: storeUpdateAgent,
    removeAgent,
    softRemoveAgent,
    softRemoveInfra,
    addInfra,
    removeInfra,
    updateInfra,
    assignAgent,
    removeSchedule,
    clearRoleSchedules,
    restoreSchedules,
    loadState
  } = useStore();
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Calculate today's turnos
  const getTodayTurnos = (): Shift[] => {
    const today = new Date();
    const refDate = new Date(2026, 3, 8); // April 8, 2026
    today.setHours(0, 0, 0, 0);
    refDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.abs(diffDays) % 2 === 0 ? ['turno1', 'turno2'] : ['turno3', 'turno4'];
  };

  const todayTurnos = getTodayTurnos();
  const [currentShift, setCurrentShift] = useState<Shift>(
    userRole === 'admin' ? todayTurnos[0] : (userRole as Shift) || todayTurnos[0]
  );

  useEffect(() => {
    if (userRole && userRole !== 'admin' && userRole !== 'pending') {
      setCurrentShift(userRole as Shift);
    }
  }, [userRole]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportSubmenuOpen, setIsReportSubmenuOpen] = useState(false);
  const [isNoteSubmenuOpen, setIsNoteSubmenuOpen] = useState(false);
  const [isDJModalOpen, setIsDJModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // DJ ausente form states
  const [djSelectedAgentId, setDjSelectedAgentId] = useState('');
  const [djJerarquia, setDjJerarquia] = useState('');
  const [djEscalafon, setDjEscalafon] = useState('');
  const [djLegajo, setDjLegajo] = useState('');
  const [djApellido, setDjApellido] = useState('');
  const [djNombre, setDjNombre] = useState('');
  const [djDomicilio, setDjDomicilio] = useState('');
  const [djLocalidad, setDjLocalidad] = useState('');
  const [djSearchQuery, setDjSearchQuery] = useState('');
  const [isDjSearchDropdownOpen, setIsDjSearchDropdownOpen] = useState(false);
  const [djJerarquiaError, setDjJerarquiaError] = useState<string | null>(null);
  const [djEscalafonError, setDjEscalafonError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsReportSubmenuOpen(false);
      setIsNoteSubmenuOpen(false);
    }
  }, [isMenuOpen]);



  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDate, setReportDate] = useState('');
  const [reportAction, setReportAction] = useState<'copy' | 'print' | null>(null);
  const [selectedAgentForInfo, setSelectedAgentForInfo] = useState<Agent | null>(null);
  const [selectedMovilForInfo, setSelectedMovilForInfo] = useState<{ item: InfrastructureItem, type: keyof Infrastructure } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, role: RoleType | null, title: string, message: string, action?: () => void }>({ isOpen: false, role: null, title: '', message: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportIncludeHeader, setReportIncludeHeader] = useState(true);
  const [reportSections, setReportSections] = useState({
    base: true,
    garita: true,
    movil: true,
    motorizada: true,
    caminante: true,
    orden_servicio: true,
    comision: true,
    disponibles: false,
    ausentes: false,
    no_disponibles: false,
    vacaciones: false
  });
  const [lastCleared, setLastCleared] = useState<{ role: RoleType, shift: Shift, schedules: Schedule[] } | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);

  const [importState, setImportState] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSelectedTurns, setImportSelectedTurns] = useState<number[]>([1, 2, 3, 4]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSelectedTurns, setExportSelectedTurns] = useState<number[]>([1, 2, 3, 4]);

  const [logo, setLogo] = useState('https://upload.wikimedia.org/wikipedia/commons/8/81/Policia_bonaer_emblem.png');
  const [logoError, setLogoError] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  useEffect(() => {
    const handleScrollEvent = () => {
      const board = document.querySelector('.app-board');
      const boardScroll = board ? board.scrollTop : 0;
      const windowScroll = window.scrollY || document.documentElement.scrollTop;
      
      if (boardScroll > 300 || windowScroll > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    // Listen to scroll on window
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    
    // Listen to scroll on board if exists
    const board = document.querySelector('.app-board');
    if (board) {
      board.addEventListener('scroll', handleScrollEvent, { passive: true });
    }

    // Observe changes to the DOM to ensure we attach scroll listener to board when rendered
    const observer = new MutationObserver(() => {
      const currentBoard = document.querySelector('.app-board');
      if (currentBoard) {
        currentBoard.removeEventListener('scroll', handleScrollEvent);
        currentBoard.addEventListener('scroll', handleScrollEvent, { passive: true });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
      if (board) {
        board.removeEventListener('scroll', handleScrollEvent);
      }
      observer.disconnect();
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => prev === message ? null : prev);
    }, 6000);
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    const agent = state.agents.find(a => a.id === id);
    if (agent && updates.turno !== undefined && updates.turno !== agent.turno) {
      const nombreCompleto = agent.nombre && agent.apellido 
        ? `${agent.apellido} ${agent.nombre}` 
        : agent.name;
      showToast(`Efectivo ${nombreCompleto} fue transferido al Turno ${updates.turno}`);
      setSelectedAgentForInfo(null);
    }
    storeUpdateAgent(id, updates);
  };

  const getEscalafonAbbrev = (esc: string) => {
    switch (esc.toUpperCase()) {
      case 'COMANDO': return 'CDO.';
      case 'GENERAL': return 'E.G.';
      case 'PROFESIONAL': return 'PROF.';
      case 'TÉCNICO': return 'TEC.';
      case 'ADMINISTRATIVO': return 'ADM.';
      case 'SCIOS. GENERALES': return 'SCIOS. GLES.';
      case 'EMERGENCIAS TELEFONICAS': return 'EM. TEL.';
      default: return esc;
    }
  };

  const handleGenerateDJ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!djJerarquia || !djEscalafon || !djLegajo || !djApellido || !djNombre || !djDomicilio || !djLocalidad) {
      alert("Por favor, complete todos los campos. Son obligatorios.");
      return;
    }

    try {
      const response = await fetch('/dj_ausente.docx');
      if (!response.ok) {
        throw new Error("No se pudo cargar la plantilla dj_ausente.docx.");
      }
      const arrayBuffer = await response.arrayBuffer();

      const zip = await JSZip.loadAsync(arrayBuffer);

      const docEntry = zip.file("word/document.xml");
      if (!docEntry) {
        throw new Error("El archivo de plantilla no tiene un formato válido (falta word/document.xml).");
      }
      let xmlText = await docEntry.async("string");

      const finalJerarquia = djJerarquia.trim().toUpperCase();
      const finalEscalafon = getEscalafonAbbrev(djEscalafon);
      const finalLegajo = djLegajo.trim();
      const finalApellido = djApellido.trim().toUpperCase();
      const finalNombre = djNombre.trim().toUpperCase();
      const finalDomicilio = djDomicilio.trim();
      const finalLocalidad = djLocalidad.trim().toUpperCase();
      
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      const today = new Date();
      const finalFechaSubrayado = `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;
      const finalAnio = today.getFullYear().toString();

      xmlText = xmlText.replace(/\[JERARQUIA\]/g, escapeXml(finalJerarquia));
      xmlText = xmlText.replace(/\[ESCALAFON\]/g, escapeXml(finalEscalafon));
      xmlText = xmlText.replace(/\[LEGAJO\]/g, escapeXml(finalLegajo));
      xmlText = xmlText.replace(/\[APELLIDO\]/g, escapeXml(finalApellido));
      xmlText = xmlText.replace(/\[NOMBRES\]/g, escapeXml(finalNombre));
      xmlText = xmlText.replace(/\[DOMICILIO\]/g, escapeXml(finalDomicilio));
      xmlText = xmlText.replace(/\[LOCALIDAD\]/g, escapeXml(finalLocalidad));
      xmlText = xmlText.replace(/\[FECHA_SUBRAYADO\]/g, escapeXml(finalFechaSubrayado));
      xmlText = xmlText.replace(/\[ANIO\]/g, escapeXml(finalAnio));

      zip.file("word/document.xml", xmlText);
      const blob = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `DJ_Ausente_${finalApellido}_${finalLegajo}.docx`;
      link.click();

      setIsDJModalOpen(false);
      showToast("Nota DJ ausente generada con éxito.");
    } catch (err: any) {
      console.error(err);
      alert("Error al generar la nota: " + err.message);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, agentId: string, scheduleId?: string) => {
    e.dataTransfer.setData('agentId', agentId);
    if (scheduleId) {
      e.dataTransfer.setData('scheduleId', scheduleId);
    }
  };

  const handleDrop = (e: React.DragEvent, role: RoleType, targetId?: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    const agentId = e.dataTransfer.getData('agentId');
    const scheduleId = e.dataTransfer.getData('scheduleId');

    if (agentId) {
      let startTime: string | undefined;
      let endTime: string | undefined;

      if (scheduleId) {
        const existingSchedule = state.schedules.find(s => s.id === scheduleId);
        if (existingSchedule) {
          startTime = existingSchedule.startTime;
          endTime = existingSchedule.endTime;
        }
      }

      if (role === 'movil' || role === 'motorizada') {
        const currentCount = currentSchedules.filter(s => s.role === role && s.targetId === targetId).length;
        if (role === 'motorizada' && currentCount >= 2) {
          alert('Las motos no pueden tener más de dos efectivos.');
          return;
        }
        if (role === 'movil' && currentCount >= 2) {
          setConfirmDialog({
            isOpen: true,
            role: null,
            title: 'Dotación Completa',
            message: 'El móvil ya cuenta con dotación completa. ¿Está seguro de agregar otro efectivo?',
            action: () => assignAgent(agentId, currentShift, role, targetId, startTime, endTime, scheduleId)
          });
          return;
        }
      }
      assignAgent(agentId, currentShift, role, targetId, startTime, endTime, scheduleId);
    }
  };

  const handleClearRole = (role: RoleType, title: string) => {
    setConfirmDialog({
      isOpen: true,
      role,
      title: `Limpiar ${title}`,
      message: `¿Estás seguro de que deseas vaciar todas las dotaciones de ${title} para el turno actual? Los agentes volverán a estar disponibles.`
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    } else if (confirmDialog.role) {
      const schedulesToRemove = state.schedules.filter(sch => 
        (sch.role === confirmDialog.role || (confirmDialog.role === 'movil' && sch.role === 'ofl_control')) && 
        sch.shift === currentShift
      );
      setLastCleared({ role: confirmDialog.role, shift: currentShift, schedules: schedulesToRemove });

      clearRoleSchedules(confirmDialog.role, currentShift);
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleUndoClear = (role: RoleType) => {
    if (lastCleared && lastCleared.role === role && lastCleared.shift === currentShift) {
      restoreSchedules(lastCleared.schedules);
      setLastCleared(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    if (targetId && dragOverTarget !== targetId) {
      setDragOverTarget(targetId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
  };

  // Helper to determine if a time is between start and end hours (cross-midnight support)
  const isTimeBetween = (time: string, start: string, end: string) => {
    if (start === end) return true;
    if (start < end) {
      return time >= start && time < end;
    } else {
      return time >= start || time < end;
    }
  };

  // Format current time to HH:MM reactively
  const currentHM = useMemo(() => {
    const hh = String(currentTime.getHours()).padStart(2, '0');
    const mm = String(currentTime.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }, [currentTime]);

  // Automatically clean up/delete expired special schedules from Firestore after 3 minutes
  useEffect(() => {
    if (!currentHM || !currentShift) return;
    const shiftStart = (currentShift === 'turno1' || currentShift === 'turno3') ? '09:00' : '21:00';
    const currentRel = getShiftRelativeMinutes(currentHM, shiftStart);

    state.schedules.forEach(sch => {
      if (sch.shift !== currentShift) return;
      
      const isStandard = (sch.startTime === '09:00' && sch.endTime === '21:00') ||
        (sch.startTime === '21:00' && sch.endTime === '09:00');
      if (isStandard) return;

      const endRel = getShiftRelativeMinutes(sch.endTime, shiftStart);
      const diff = currentRel - endRel;

      if (diff > 3) {
        removeSchedule(sch.id);
      }
    });
  }, [state.schedules, currentHM, currentShift]);

  // Derived State - All schedules planned for the current shift
  const shiftSchedules = useMemo(() => {
    return [
      ...state.schedules.filter(s => s.shift === currentShift && s.role !== 'jefe' && s.role !== 'segundo_jefe'),
      ...state.schedules.filter(s => s.role === 'jefe' || s.role === 'segundo_jefe')
    ];
  }, [state.schedules, currentShift]);

  // Derived State - Currently active schedules for each agent at current time
  const currentSchedules = useMemo(() => {
    // Group shift schedules by agentId
    const schedulesByAgent = shiftSchedules.reduce((acc, sch) => {
      if (!acc[sch.agentId]) acc[sch.agentId] = [];
      acc[sch.agentId].push(sch);
      return acc;
    }, {} as Record<string, Schedule[]>);

    // For each agent, choose the single active schedule at the current hour
    return (Object.values(schedulesByAgent) as Schedule[][]).map(agentSchs => {
      const activeSchs = agentSchs.filter(s => isTimeBetween(currentHM, s.startTime, s.endTime));
      if (activeSchs.length === 0) return null;

      // Prioritize special (non-standard) active schedules
      const specialActive = activeSchs.find(s => {
        const isStandard = (s.startTime === '09:00' && s.endTime === '21:00') ||
                           (s.startTime === '21:00' && s.endTime === '09:00');
        return !isStandard;
      });

      if (specialActive) return specialActive;

      // Otherwise fall back to the standard active schedule
      return activeSchs[0];
    }).filter((s): s is Schedule => s !== null);
  }, [shiftSchedules, currentHM]);

  const assignedAgentIds = useMemo(() => {
    return currentSchedules.map(s => s.agentId);
  }, [currentSchedules]);

  const shiftAgents = state.agents.filter(a => ('turno' + (a.turno || 1)) === currentShift);
  
  const currentShiftNum = Number(currentShift.replace('turno', ''));
  const filterByShift = (items: InfrastructureItem[] | undefined) => (items || []).filter(i => !i.turno || i.turno === currentShiftNum);
  const isControlMovil = (m: InfrastructureItem) => m.name.toUpperCase().includes('CONTROL');

  const updateSearchHighlight = (agentId: string) => {
    document.querySelectorAll('.agent-card.search-highlight').forEach(el => {
      el.classList.remove('search-highlight', 'ring-2', 'ring-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', 'scale-[1.02]', 'z-10');
    });
    const elements = document.querySelectorAll(`[id="agent-card-${agentId}"]`);
    elements.forEach(el => {
      el.classList.add('search-highlight', 'ring-2', 'ring-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', 'scale-[1.02]', 'z-10');
    });
    if (elements.length > 0) {
      elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    document.querySelectorAll('.agent-card').forEach(el => {
      el.classList.remove('search-highlight', 'ring-2', 'ring-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', 'scale-[1.02]', 'z-10', 'opacity-30');
    });

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches = shiftAgents.filter(a => 
      a.name.toLowerCase().includes(query) ||
      (a.nombre && a.nombre.toLowerCase().includes(query)) ||
      (a.apellido && a.apellido.toLowerCase().includes(query)) ||
      (a.localidad && a.localidad.toLowerCase().includes(query)) ||
      (a.jerarquia && a.jerarquia.toLowerCase().includes(query)) ||
      (a.escalafon && a.escalafon.toLowerCase().includes(query))
    ).map(a => a.id);

    setSearchResults(matches);
    setSearchIndex(0);

    document.querySelectorAll('.agent-card').forEach(el => {
      const idStr = el.id.replace('agent-card-', '');
      if (!matches.includes(idStr)) {
        el.classList.add('opacity-30');
      }
    });

    if (matches.length > 0) {
      setTimeout(() => updateSearchHighlight(matches[0]), 50);
    }
  }, [searchQuery, currentShift, state.agents]);

  const nextSearchMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (searchIndex + 1) % searchResults.length;
    setSearchIndex(nextIdx);
    updateSearchHighlight(searchResults[nextIdx]);
  };

  const prevSearchMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (searchIndex - 1 + searchResults.length) % searchResults.length;
    setSearchIndex(prevIdx);
    updateSearchHighlight(searchResults[prevIdx]);
  };

  const availableAgents = shiftAgents.filter(a => !assignedAgentIds.includes(a.id));

  const noDisponibleSchedules = currentSchedules.filter(s => s.role === 'no_disponible');
  const noDisponibleAgents = noDisponibleSchedules
    .map(s => shiftAgents.find(a => a.id === s.agentId))
    .filter((a): a is Agent => a !== undefined);

  const ausenteSchedules = currentSchedules.filter(s => s.role === 'ausente');
  const ausenteAgents = ausenteSchedules
    .map(s => shiftAgents.find(a => a.id === s.agentId))
    .filter((a): a is Agent => a !== undefined);

  const vacacionesSchedules = currentSchedules.filter(s => s.role === 'vacaciones');
  const vacacionesAgents = vacacionesSchedules
    .map(s => shiftAgents.find(a => a.id === s.agentId))
    .filter((a): a is Agent => a !== undefined);

  const stats = {
    garita: currentSchedules.filter(s => s.role === 'garita').length,
    caminante: currentSchedules.filter(s => s.role === 'caminante').length,
    movil: currentSchedules.filter(s => s.role === 'movil' || s.role === 'ofl_control').length,
    motorizada: currentSchedules.filter(s => s.role === 'motorizada').length,
    correo: currentSchedules.filter(s => s.role === 'correo').length,
    orden_servicio: currentSchedules.filter(s => s.role === 'orden_servicio').length,
    comision: currentSchedules.filter(s => s.role === 'comision').length,
    montada: currentSchedules.filter(s => s.role === 'montada').length,
    disponible: availableAgents.length,
    no_disponible: noDisponibleAgents.length,
    ausente: ausenteAgents.length,
    vacaciones: vacacionesAgents.length
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const upcomingReliefs = useMemo(() => {
    const shiftStart = (currentShift === 'turno1' || currentShift === 'turno3') ? '09:00' : '21:00';
    const currentRel = getShiftRelativeMinutes(currentHM, shiftStart);

    return shiftSchedules
      .filter(sch => {
        const isStandard = (sch.startTime === '09:00' && sch.endTime === '21:00') ||
          (sch.startTime === '21:00' && sch.endTime === '09:00');
        if (isStandard) return false;

        const endRel = getShiftRelativeMinutes(sch.endTime, shiftStart);
        const diff = currentRel - endRel;

        if (diff >= 0) {
          // Relief has ended. Persist/Keep only if it's within the 3 minutes grace period
          return diff <= 3;
        }
        // Not ended yet (either pending or active), always keep
        return true;
      })
      .map(sch => {
        const startRel = getShiftRelativeMinutes(sch.startTime, shiftStart);
        const endRel = getShiftRelativeMinutes(sch.endTime, shiftStart);

        let status: 'pending' | 'active' | 'ended' = 'pending';
        if (currentRel >= startRel && currentRel < endRel) {
          status = 'active';
        } else if (currentRel >= endRel) {
          status = 'ended';
        }

        return {
          ...sch,
          status
        };
      });
  }, [shiftSchedules, currentHM, currentShift]);

  const groupedReliefs = useMemo(() => {
    return upcomingReliefs.reduce((acc, sch) => {
      if (!acc[sch.agentId]) {
        acc[sch.agentId] = [];
      }
      acc[sch.agentId].push(sch);
      return acc;
    }, {} as Record<string, typeof upcomingReliefs>);
  }, [upcomingReliefs]);

  // Export/Import
  const handleExport = (targetTurns: number[]) => {
    const filteredAgents = state.agents.filter(agent => targetTurns.includes(agent.turno));
    
    const filteredInfrastructure: Infrastructure = {
      garitas: state.infrastructure.garitas.filter(item => !item.turno || targetTurns.includes(item.turno)),
      moviles: state.infrastructure.moviles.filter(item => !item.turno || targetTurns.includes(item.turno)),
      motos: state.infrastructure.motos.filter(item => !item.turno || targetTurns.includes(item.turno)),
      qths: state.infrastructure.qths.filter(item => !item.turno || targetTurns.includes(item.turno)),
      ordenes: state.infrastructure.ordenes.filter(item => !item.turno || targetTurns.includes(item.turno)),
      comisiones: state.infrastructure.comisiones.filter(item => !item.turno || targetTurns.includes(item.turno))
    };
    
    const filteredSchedules = state.schedules.filter(sch => {
      const shiftNum = sch.shift ? Number(sch.shift.replace('turno', '')) : null;
      return shiftNum && targetTurns.includes(shiftNum);
    });

    const exportState = {
      agents: filteredAgents,
      infrastructure: filteredInfrastructure,
      schedules: filteredSchedules
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportState));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}`;
    
    let turnsStr = '';
    if (targetTurns.length === 4) {
      turnsStr = 'todos';
    } else if (targetTurns.length === 1) {
      turnsStr = `turno${targetTurns[0]}`;
    } else {
      turnsStr = `turnos_${targetTurns.join('-')}`;
    }
    const fileName = `backup_${dateStr}_${timeStr}_${turnsStr}.json`;

    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportClick = () => {
    setIsMenuOpen(false);
    if (userRole === 'admin') {
      setExportSelectedTurns([1, 2, 3, 4]);
      setIsExportModalOpen(true);
    } else {
      const shiftNum = userRole ? Number(userRole.replace('turno', '')) : 1;
      handleExport([shiftNum]);
    }
  };

  const isValidBackup = (json: any): boolean => {
    if (!json || typeof json !== 'object') {
      console.warn("isValidBackup failed: El JSON es nulo o no es un objeto.");
      return false;
    }
    
    // Prohibir caracteres HTML para evitar XSS persistente en todo el documento
    const htmlCharRegex = /[<>]/;

    // Validate agents
    if (!Array.isArray(json.agents)) {
      console.warn("isValidBackup failed: json.agents no es un array.");
      return false;
    }
    for (const agent of json.agents) {
      if (!agent || typeof agent !== 'object') return false;
      if (typeof agent.id !== 'string' || !agent.id) {
        console.warn("isValidBackup failed: agente sin ID o ID no es string:", agent);
        return false;
      }
      if (typeof agent.name !== 'string' || !agent.name) {
        console.warn("isValidBackup failed: agente sin name o name no es string:", agent);
        return false;
      }
      if (agent.nombre !== undefined && typeof agent.nombre !== 'string') return false;
      if (agent.apellido !== undefined && typeof agent.apellido !== 'string') return false;
      if (agent.turno === undefined || ![1, 2, 3, 4].includes(Number(agent.turno))) {
        console.warn("isValidBackup failed: turno inválido en agente:", agent);
        return false;
      }
      if (htmlCharRegex.test(agent.name) || 
          (agent.nombre && htmlCharRegex.test(agent.nombre)) || 
          (agent.apellido && htmlCharRegex.test(agent.apellido))) {
        console.warn("isValidBackup failed: caracteres prohibidos (<, >) en el nombre del agente:", agent);
        return false;
      }
      if (agent.legajo !== undefined && typeof agent.legajo !== 'string') return false;
      if (agent.localidad !== undefined && typeof agent.localidad !== 'string') return false;
      if (agent.jerarquia !== undefined && typeof agent.jerarquia !== 'string') return false;
      if (agent.escalafon !== undefined && typeof agent.escalafon !== 'string') return false;
    }
    
    // Validate infrastructure
    if (!json.infrastructure) {
      console.warn("isValidBackup failed: json.infrastructure está ausente.");
      return false;
    }

    const validTypes = ['garitas', 'moviles', 'motos', 'qths', 'ordenes', 'comisiones', 'garita', 'movil', 'moto', 'qth', 'orden', 'comision', 'orden_servicio'];

    const validateInfraItem = (item: any): boolean => {
      if (!item || typeof item !== 'object') return false;
      if (typeof item.id !== 'string' || !item.id) return false;
      if (typeof item.name !== 'string' || !item.name) return false;
      if (item.turno !== undefined && ![1, 2, 3, 4].includes(Number(item.turno))) return false;
      if (htmlCharRegex.test(item.name)) return false; // Evitar XSS en nombres de infraestructura
      return true;
    };

    if (Array.isArray(json.infrastructure)) {
      // Formato: Array plano de ítems de infraestructura
      for (const item of json.infrastructure) {
        if (!validateInfraItem(item) || !item.type || !validTypes.includes(item.type)) {
          console.warn("isValidBackup failed: Ítem de infraestructura plano inválido o tipo desconocido:", item);
          return false;
        }
      }
    } else if (typeof json.infrastructure === 'object') {
      // Formato: Objeto de arrays (estándar)
      const expectedInfraKeys = ['garitas', 'moviles', 'motos', 'qths', 'ordenes', 'comisiones'];
      for (const key of expectedInfraKeys) {
        if (!Array.isArray(json.infrastructure[key])) {
          console.warn(`isValidBackup failed: json.infrastructure.${key} no es un array.`);
          return false;
        }
        for (const item of json.infrastructure[key]) {
          if (!validateInfraItem(item)) {
            console.warn(`isValidBackup failed: Infraestructura inválida en ${key}:`, item);
            return false;
          }
        }
      }
    } else {
      console.warn("isValidBackup failed: json.infrastructure no es ni un array ni un objeto.");
      return false;
    }
    
    // Validate schedules
    if (!Array.isArray(json.schedules)) {
      console.warn("isValidBackup failed: json.schedules no es un array.");
      return false;
    }
    const validRoles = ['garita', 'caminante', 'movil', 'motorizada', 'correo', 'orden_servicio', 'comision', 'disponible', 'no_disponible', 'ausente', 'vacaciones', 'ofl_control', 'ofl_servicio', 'operaciones', 'ayte_guardia', 'logistica', 'personal', 'judiciales', 'montada', 'jefe', 'segundo_jefe'];
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const sch of json.schedules) {
      if (!sch || typeof sch !== 'object') {
        console.warn("isValidBackup failed: schedule no es un objeto:", sch);
        return false;
      }
      if (typeof sch.id !== 'string' || !sch.id) return false;
      if (typeof sch.agentId !== 'string' || !sch.agentId) return false;
      if (!validRoles.includes(sch.role)) {
        console.warn("isValidBackup failed: rol inválido en schedule:", sch);
        return false;
      }
      if (!['turno1', 'turno2', 'turno3', 'turno4'].includes(sch.shift)) {
        console.warn("isValidBackup failed: turno inválido en schedule:", sch);
        return false;
      }
      if (sch.startTime && !timeRegex.test(sch.startTime)) {
        console.warn("isValidBackup failed: hora de inicio inválida en schedule:", sch);
        return false;
      }
      if (sch.endTime && !timeRegex.test(sch.endTime)) {
        console.warn("isValidBackup failed: hora de fin inválida en schedule:", sch);
        return false;
      }
    }
    
    return true;
  };


  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("handleImport: Archivo seleccionado:", file.name, file.size, "bytes");
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          console.log("handleImport: Archivo leído. Longitud del texto:", text.length);
          const json = JSON.parse(text);
          console.log("handleImport: JSON parseado con éxito:", json);
          
          const valid = isValidBackup(json);
          console.log("handleImport: ¿Es backup válido?", valid);
          if (!valid) {
            alert("Error: El archivo JSON importado no tiene un formato de copia de seguridad válido para la aplicación.");
            event.target.value = '';
            return;
          }
          
          const isAdmin = userRole === 'admin';
          if (!isAdmin) {
            // Rol de Turno X: Deducir turno y procesar directamente
            const shiftNum = userRole ? Number(userRole.replace('turno', '')) : 1;
            if (window.confirm(`¿Está seguro de que desea importar este archivo para el Turno ${shiftNum}?\n\n¡ATENCIÓN! Esta acción borrará de manera irreversible todos los efectivos, infraestructuras y asignaciones del Turno ${shiftNum} actuales en la base de datos y los reemplazará con los de este archivo.`)) {
              console.log(`handleImport: Procesando importación directa para el Turno ${shiftNum}...`);
              try {
                await loadState(json, [shiftNum]);
                console.log("handleImport: loadState finalizado con éxito.");
                alert(`Importación exitosa. Los datos del Turno ${shiftNum} se han restaurado correctamente.`);
              } catch (err) {
                console.error("Error writing imported state to Firestore:", err);
                alert("Ocurrió un error al importar los datos: " + (err as Error).message);
              }
            }
          } else {
            // Rol Admin: Guardar estado y abrir modal de selección
            setImportState(json);
            setImportSelectedTurns([1, 2, 3, 4]); // Reset default selection
            setIsImportModalOpen(true);
          }
        } catch (err) {
          console.error("handleImport: Error al procesar el archivo:", err);
          alert("Error al procesar el archivo JSON. Asegúrese de que sea un archivo de texto JSON válido.");
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    } else {
      console.log("handleImport: No se seleccionó ningún archivo.");
    }
  };

  const getInfraName = (role: RoleType, targetId?: string) => {
    if (!targetId) return role;
    if (role === 'garita') return state.infrastructure.garitas.find(g => g.id === targetId)?.name;
    if (role === 'caminante') return state.infrastructure.qths.find(q => q.id === targetId)?.name;
    if (role === 'movil') return state.infrastructure.moviles.find(m => m.id === targetId)?.name;
    if (role === 'motorizada') return state.infrastructure.motos.find(m => m.id === targetId)?.name;
    if (role === 'comision') return state.infrastructure.comisiones?.find(c => c.id === targetId)?.name;
    if (role === 'orden_servicio') {
      const os = state.infrastructure.ordenes?.find(o => o.id === targetId);
      return os ? `OS ${os.numero} - ${os.ubicacion}` : role;
    }
    return role;
  };

  const calculateDefaultReportDate = (shift: Shift) => {
    const today = new Date();
    const baseDate = new Date(2026, 3, 8); // April 8, 2026

    // Reset time to midnight for accurate day calculation
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const baseMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

    const diffTime = todayMidnight.getTime() - baseMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const isEvenDay = Math.abs(diffDays) % 2 === 0;
    const todaysTurnos = isEvenDay ? ['turno1', 'turno2'] : ['turno3', 'turno4'];

    const targetDate = new Date(todayMidnight);
    if (!todaysTurnos.includes(shift)) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Format to YYYY-MM-DD
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const generateReportText = (dateStr: string) => {
    const targetDate = new Date(dateStr + 'T12:00:00');
    const dayName = targetDate.toLocaleDateString('es-AR', { weekday: 'long' }).toUpperCase();
    const formattedDate = targetDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const shiftNumber = currentShift.replace('turno', '0');
    const shiftTimes = (currentShift === 'turno1' || currentShift === 'turno3') ? '09:00 a 21:00' : '21:00 a 09:00';

    const getAgentName = (role: string) => {
      const sch = currentSchedules.find(s => s.role === role);
      if (!sch) return '';
      const a = state.agents.find(a => a.id === sch.agentId);
      return a ? (a.jerarquia ? `${a.jerarquia} ${a.name}` : a.name) : '';
    };

    let text = '';

    if (reportIncludeHeader) {
      text += `*S.S.R.A.S II - E.P.D.S. ALTE. BROWN-U.P.P.L. ALTE. BROWN.* -\n`;
      text += `*CCA: PCIR INFORME*\n`;
      text += `LLEVO A CONOCIMIENTO SR JEFE QUE ESTA UPPL CUENTA EN EL DIA DE LA FECHA CON LA SIGUIENTE DISTRIBUCION DEL PERSONAL: \n`;
    }
    text += `*Dependencia: U.P.P.L Almirante Brown. Turno: ${shiftNumber}-*\n`;
    text += `Fecha: ${dayName} ${formattedDate} ${shiftTimes} horas. - \n`;
    if (reportSections.base) {
      text += `Ofl. de control: ${getAgentName('ofl_control')}\n`;
      text += `Ofl. de servicio: ${getAgentName('ofl_servicio')}\n`;
      text += `Operaciones: ${getAgentName('operaciones')}\n`;
      text += `Ayte. de guardia: ${getAgentName('ayte_guardia')}\n`;
    }
    text += `\n`;

    // 1. BASE SECTION
    if (reportSections.base) {
      const baseRoles = [
        { id: 'jefe', label: 'Jefe' },
        { id: 'segundo_jefe', label: '2da jefa' },
        { id: 'ofl_control', label: 'Ofl. de control' },
        { id: 'ofl_servicio', label: 'Ofl. de servicio' },
        { id: 'operaciones', label: 'Operaciones' },
        { id: 'ayte_guardia', label: 'Ayte. de guardia' },
        { id: 'logistica', label: 'Logística' },
        { id: 'personal', label: 'Personal' },
        { id: 'judiciales', label: 'Judiciales' }
      ];
      
      let baseText = '';
      baseRoles.forEach(roleInfo => {
        const occupants = currentSchedules.filter(s => s.role === roleInfo.id);
        if (occupants.length > 0) {
          occupants.forEach(occ => {
            const agent = state.agents.find(a => a.id === occ.agentId);
            if (agent) {
              baseText += `  - ${roleInfo.label}: ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}\n`;
            }
          });
        }
      });
      if (baseText) {
        text += `BASE:\n${baseText}\n`;
      }
    }

    // 2. INFRASTRUCTURE SECTIONS
    const infraRoles = [
      { key: 'garita', id: 'garita', title: 'MÓDULOS', items: filterByShift(state.infrastructure.garitas) },
      { key: 'movil', id: 'movil', title: 'MÓVILES', items: filterByShift(state.infrastructure.moviles) },
      { key: 'motorizada', id: 'motorizada', title: 'MOTOS', items: filterByShift(state.infrastructure.motos) },
      { key: 'caminante', id: 'caminante', title: 'CAMINANTES', items: filterByShift(state.infrastructure.qths) },
      { key: 'orden_servicio', id: 'orden_servicio', title: 'ÓRDENES DE SERVICIO', items: filterByShift(state.infrastructure.ordenes) },
      { key: 'comision', id: 'comision', title: 'COMISIONES', items: filterByShift(state.infrastructure.comisiones) }
    ];

    infraRoles.forEach(roleGroup => {
      if (reportSections[roleGroup.key as keyof typeof reportSections]) {
        const schedulesForRole = currentSchedules.filter(s => 
          s.role === roleGroup.id || 
          (roleGroup.id === 'movil' && s.role === 'ofl_control')
        );
        let sectionText = '';

        roleGroup.items.forEach(item => {
          const occupants = schedulesForRole.filter(s => 
            s.targetId === item.id || 
            (s.role === 'ofl_control' && isControlMovil(item))
          );
          if (occupants.length > 0) {
            let itemName = item.name;
            if (roleGroup.id === 'orden_servicio') itemName = `OS ${(item as any).numero} - ${(item as any).ubicacion}`;
            else if ((item as any).ro) itemName += ` (${(item as any).ro})`;

            sectionText += `  - ${itemName}:\n`;
            occupants.forEach(occ => {
              const agent = state.agents.find(a => a.id === occ.agentId);
              if (agent) {
                const isHabitual = (occ.startTime === '09:00' && occ.endTime === '21:00') || (occ.startTime === '21:00' && occ.endTime === '09:00');
                const scheduleText = isHabitual ? '' : ` (${occ.startTime} - ${occ.endTime})`;
                sectionText += `      * ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}${scheduleText}\n`;
              }
            });
          }
        });

        if (sectionText) {
          text += `${roleGroup.title}:\n${sectionText}\n`;
        }
      }
    });

    // 3. AGENT STATUS SECTIONS
    const statusGroups = [
      { key: 'disponibles', title: 'EFECTIVOS DISPONIBLES', agents: availableAgents },
      { key: 'ausentes', title: 'EFECTIVOS AUSENTES', agents: ausenteAgents },
      { key: 'no_disponibles', title: 'EFECTIVOS NO DISPONIBLES', agents: noDisponibleAgents },
      { key: 'vacaciones', title: 'EFECTIVOS EN VACACIONES', agents: vacacionesAgents }
    ];

    statusGroups.forEach(grp => {
      if (reportSections[grp.key as keyof typeof reportSections] && grp.agents.length > 0) {
        text += `${grp.title}:\n`;
        grp.agents.forEach(agent => {
          text += `  - ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}\n`;
        });
        text += `\n`;
      }
    });

    return text;
  };

  const handleCopyReport = (dateStr: string) => {
    const text = generateReportText(dateStr);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrintReport = (dateStr: string) => {
    const targetDate = new Date(dateStr + 'T12:00:00');
    const dayName = targetDate.toLocaleDateString('es-AR', { weekday: 'long' }).toUpperCase();
    const formattedDate = targetDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const shiftNumber = currentShift.replace('turno', '0');
    const shiftTimes = (currentShift === 'turno1' || currentShift === 'turno3') ? '09:00 a 21:00' : '21:00 a 09:00';

    const getAgentName = (role: string) => {
      const sch = currentSchedules.find(s => s.role === role);
      if (!sch) return '';
      const a = state.agents.find(a => a.id === sch.agentId);
      const name = a ? (a.jerarquia ? `${a.jerarquia} ${a.name}` : a.name) : '';
      return escapeHtml(name);
    };

    let html = `
      <html>
        <head>
          <title>Informe de Dotaciones</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: Arial, sans-serif; line-height: 1.2; color: #000; font-size: 11px; padding: 0 15px; }
            .header-container { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px; }
            .header-logos { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
            .header-logos img { height: 1.3cm; width: auto; object-fit: contain; }
            .header-text { font-weight: bold; white-space: pre-wrap; font-size: 11px; text-align: left; }
            h2 { font-size: 12px; margin-top: 14px; margin-bottom: 6px; color: #000; border-bottom: 1px solid #aaa; padding-bottom: 3px; text-transform: uppercase; }
            .columns-container { column-count: 2; column-gap: 20px; }
            .item-container { margin-bottom: 6px; break-inside: avoid; page-break-inside: avoid; }
            .item-title { font-weight: bold; font-size: 11px; }
            .agent-list { margin: 2px 0 0 15px; padding-left: 15px; }
            .agent-item { font-size: 11px; }
            .flat-list { margin: 4px 0 12px 10px; padding-left: 15px; }
            .flat-item { font-size: 11px; margin-bottom: 3px; }
          </style>
        </head>
        <body>
    `;

    html += `
        <div class="header-container">
          <div class="header-logos">
            <img src="${logoMinisterio}" alt="Ministerio de Seguridad" />
            <img src="${logoProvincia}" alt="Gobierno de la Provincia de Buenos Aires" />
          </div>
          <div class="header-text">${reportIncludeHeader ? `S.S.R.A.S II - E.P.D.S. ALTE. BROWN-U.P.P.L. ALTE. BROWN. -
CCA: PCIR INFORME
LLEVO A CONOCIMIENTO SR JEFE QUE ESTA UPPL CUENTA EN EL DIA DE LA FECHA CON LA SIGUIENTE DISTRIBUCION DEL PERSONAL: \n` : ''}Dependencia: U.P.P.L Almirante Brown. Turno: ${shiftNumber}-
Fecha: ${dayName} ${formattedDate} ${shiftTimes} horas. - ${reportSections.base ? `
Ofl. de control: ${getAgentName('ofl_control')}
Ofl. de servicio: ${getAgentName('ofl_servicio')}
Operaciones: ${getAgentName('operaciones')}
Ayte. de guardia: ${getAgentName('ayte_guardia')}` : ''}</div>
        </div>
    `;

    // 1. BASE SECTION
    if (reportSections.base) {
      const baseRoles = [
        { id: 'jefe', label: 'Jefe' },
        { id: 'segundo_jefe', label: '2da jefa' },
        { id: 'ofl_control', label: 'Ofl. de control' },
        { id: 'ofl_servicio', label: 'Ofl. de servicio' },
        { id: 'operaciones', label: 'Operaciones' },
        { id: 'ayte_guardia', label: 'Ayte. de guardia' },
        { id: 'logistica', label: 'Logística' },
        { id: 'personal', label: 'Personal' },
        { id: 'judiciales', label: 'Judiciales' }
      ];

      let baseHtml = '';
      baseRoles.forEach(roleInfo => {
        const occupants = currentSchedules.filter(s => s.role === roleInfo.id);
        if (occupants.length > 0) {
          occupants.forEach(occ => {
            const agent = state.agents.find(a => a.id === occ.agentId);
            if (agent) {
              const fullName = (agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name;
              baseHtml += `<li class="flat-item"><strong>${roleInfo.label}:</strong> ${escapeHtml(fullName)}</li>`;
            }
          });
        }
      });

      if (baseHtml) {
        html += `<h2>BASE</h2>
                 <ul class="flat-list">
                   ${baseHtml}
                 </ul>`;
      }
    }

    // 2. INFRASTRUCTURE SECTIONS
    const rolesToInclude = [
      { key: 'garita', id: 'garita', title: 'MÓDULOS', items: filterByShift(state.infrastructure.garitas) },
      { key: 'movil', id: 'movil', title: 'MÓVILES', items: filterByShift(state.infrastructure.moviles) },
      { key: 'motorizada', id: 'motorizada', title: 'MOTOS', items: filterByShift(state.infrastructure.motos) },
      { key: 'caminante', id: 'caminante', title: 'CAMINANTES', items: filterByShift(state.infrastructure.qths) },
      { key: 'orden_servicio', id: 'orden_servicio', title: 'ÓRDENES DE SERVICIO', items: filterByShift(state.infrastructure.ordenes) },
      { key: 'comision', id: 'comision', title: 'COMISIONES', items: filterByShift(state.infrastructure.comisiones) }
    ];

    rolesToInclude.forEach(roleGroup => {
      if (reportSections[roleGroup.key as keyof typeof reportSections]) {
        const schedulesForRole = currentSchedules.filter(s => 
          s.role === roleGroup.id || 
          (roleGroup.id === 'movil' && s.role === 'ofl_control')
        );
        if (schedulesForRole.length === 0) return;

        html += `<h2>${roleGroup.title}</h2>`;
        
        const isTwoColumns = roleGroup.id === 'garita' || roleGroup.id === 'caminante';
        if (isTwoColumns) {
          html += `<div class="columns-container">`;
        }

        roleGroup.items.forEach(item => {
          const occupants = schedulesForRole.filter(s => 
            s.targetId === item.id || 
            (s.role === 'ofl_control' && isControlMovil(item))
          );
          if (occupants.length > 0) {
            let itemName = item.name;
            if (roleGroup.id === 'orden_servicio') itemName = `OS ${(item as any).numero} - ${(item as any).ubicacion}`;
            else if ((item as any).ro) itemName += ` (${(item as any).ro})`;

            html += `<div class="item-container">
                       <div class="item-title">${escapeHtml(itemName)}</div>
                       <ul class="agent-list">`;
            occupants.forEach(occ => {
              const agent = state.agents.find(a => a.id === occ.agentId);
              if (agent) {
                const fullName = (agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name;
                const isHabitual = (occ.startTime === '09:00' && occ.endTime === '21:00') || (occ.startTime === '21:00' && occ.endTime === '09:00');
                const scheduleText = isHabitual ? '' : ` (${occ.startTime} - ${occ.endTime})`;
                html += `<li class="agent-item">${escapeHtml(fullName)}${escapeHtml(scheduleText)}</li>`;
              }
            });
            html += `  </ul>
                     </div>`;
          }
        });
        
        if (isTwoColumns) {
          html += `</div>`;
        }
      }
    });

    // 3. AGENT STATUS SECTIONS
    const statusGroups = [
      { key: 'disponibles', title: 'EFECTIVOS DISPONIBLES', agents: availableAgents },
      { key: 'ausentes', title: 'EFECTIVOS AUSENTES', agents: ausenteAgents },
      { key: 'no_disponibles', title: 'EFECTIVOS NO DISPONIBLES', agents: noDisponibleAgents },
      { key: 'vacaciones', title: 'EFECTIVOS EN VACACIONES', agents: vacacionesAgents }
    ];

    statusGroups.forEach(grp => {
      if (reportSections[grp.key as keyof typeof reportSections] && grp.agents.length > 0) {
        html += `<h2>${grp.title}</h2>
                 <ul class="flat-list">`;
        grp.agents.forEach(agent => {
          const fullName = (agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name;
          html += `<li class="flat-item">${escapeHtml(fullName)}</li>`;
        });
        html += `</ul>`;
      }
    });

    html += `
        <script>
          window.onload = () => { window.print(); window.close(); }
        </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      alert('Por favor, permita las ventanas emergentes (pop-ups) para imprimir el informe.');
    }
  };

  const openReportModal = (action: 'copy' | 'print') => {
    setReportDate(calculateDefaultReportDate(currentShift));
    setReportAction(action);
    setIsReportModalOpen(true);
  };

  const executeReportAction = () => {
    if (reportAction === 'copy') {
      handleCopyReport(reportDate);
    } else if (reportAction === 'print') {
      handlePrintReport(reportDate);
    }
    setIsReportModalOpen(false);
  };

  return {
    state,
    userRole,
    navigate,
    currentShift,
    setCurrentShift,
    todayTurnos,
    isSettingsOpen,
    setIsSettingsOpen,
    isMenuOpen,
    setIsMenuOpen,
    isReportSubmenuOpen,
    setIsReportSubmenuOpen,
    isNoteSubmenuOpen,
    setIsNoteSubmenuOpen,
    isDJModalOpen,
    setIsDJModalOpen,
    toastMessage,
    showToast,
    djSelectedAgentId,
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
    djSearchQuery,
    setDjSearchQuery,
    isDjSearchDropdownOpen,
    setIsDjSearchDropdownOpen,
    djJerarquiaError,
    setDjJerarquiaError,
    djEscalafonError,
    setDjEscalafonError,
    menuRef,
    fileInputRef,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    reportDate,
    setReportDate,
    reportAction,
    setReportAction,
    selectedAgentForInfo,
    setSelectedAgentForInfo,
    selectedMovilForInfo,
    setSelectedMovilForInfo,
    confirmDialog,
    setConfirmDialog,
    currentTime,
    dragOverTarget,
    setDragOverTarget,
    copied,
    reportIncludeHeader,
    setReportIncludeHeader,
    reportSections,
    setReportSections,
    lastCleared,
    showScrollTop,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchIndex,
    importState,
    isImportModalOpen,
    setIsImportModalOpen,
    importSelectedTurns,
    setImportSelectedTurns,
    isExportModalOpen,
    setIsExportModalOpen,
    exportSelectedTurns,
    setExportSelectedTurns,
    logo,
    setLogo,
    logoError,
    setLogoError,
    handleScroll,
    getEscalafonAbbrev,
    handleGenerateDJ,
    handleDragStart,
    handleDrop,
    handleClearRole,
    handleConfirm,
    handleUndoClear,
    handleDragOver,
    handleDragLeave,
    nextSearchMatch,
    prevSearchMatch,
    handleExportClick,
    handleImport,
    getEscalafonAbbrevFromEsc: getEscalafonAbbrev,
    currentSchedules,
    assignedAgentIds,
    shiftAgents,
    currentShiftNum,
    filterByShift,
    isControlMovil,
    availableAgents,
    noDisponibleAgents,
    ausenteAgents,
    vacacionesAgents,
    stats,
    upcomingReliefs,
    groupedReliefs,
    openReportModal,
    executeReportAction,
    getInfraName,
    handleExport,
    // Database modifiers
    addAgent,
    updateAgent,
    removeAgent,
    softRemoveAgent,
    softRemoveInfra,
    addInfra,
    removeInfra,
    updateInfra,
    assignAgent,
    removeSchedule,
    clearRoleSchedules,
    restoreSchedules,
    loadState
  };
}
