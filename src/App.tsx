import React, { useState, useRef, useEffect } from 'react';
import { useStore } from './store';
import { Shift, RoleType, Agent, Schedule, InfrastructureItem, Infrastructure } from './types';
import { Shield, MapPin, Car, Bike, Mail, Users, Download, Upload, Settings, Calendar, Clock, X, Plus, Trash2, AlertCircle, ClipboardList, UserMinus, ClipboardCopy, Printer, Check, FileText, Undo2, LogOut, ArrowUp, Search, ChevronUp, ChevronDown, Edit2, Menu, RefreshCw } from 'lucide-react';
declare const __APP_VERSION__: string;
import { AgentCard } from './components/AgentCard';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminView } from './pages/AdminView';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import logoMinisterio from './assets/logo_ministerio.png';
import logoProvincia from './assets/logo_provincia.png';
const validRanks = [
  'Crio. Gral.',
  'Crio. Mayor',
  'Crio. Insp.',
  'Crio.',
  'Subcrio.',
  'Ppal.',
  'OI.',
  'OSI.',
  'OA.',
  'OSA.',
  'Mayor',
  'Cap.',
  'Tte. 1ro.',
  'Tte.',
  'Subtte.',
  'Sgto.',
  'OFL.'
];

const validEscalafones = [
  'COMANDO',
  'GENERAL',
  'PROFESIONAL',
  'TÉCNICO',
  'ADMINISTRATIVO',
  'SCIOS. GENERALES',
  'EMERGENCIAS TELEFONICAS'
];

function Dashboard() {
  const { state, addAgent, updateAgent, removeAgent, softRemoveAgent, softRemoveInfra, addInfra, removeInfra, updateInfra, assignAgent, removeSchedule, clearRoleSchedules, restoreSchedules, loadState } = useStore();
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
  const menuRef = useRef<HTMLDivElement>(null);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importState, setImportState] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSelectedTurns, setImportSelectedTurns] = useState<number[]>([1, 2, 3, 4]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSelectedTurns, setExportSelectedTurns] = useState<number[]>([1, 2, 3, 4]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [logo, setLogo] = useState('https://upload.wikimedia.org/wikipedia/commons/8/81/Policia_bonaer_emblem.png');

  const [logoError, setLogoError] = useState(false);

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

  // Derived State
  const currentSchedules = [
    ...state.schedules.filter(s => s.shift === currentShift && s.role !== 'jefe' && s.role !== 'segundo_jefe'),
    ...state.schedules.filter(s => s.role === 'jefe' || s.role === 'segundo_jefe')
  ];
  const assignedAgentIds = currentSchedules.map(s => s.agentId);

  const shiftAgents = state.agents.filter(a => ('turno' + (a.turno || 1)) === currentShift);
  
  const currentShiftNum = Number(currentShift.replace('turno', ''));
  const filterByShift = (items: InfrastructureItem[] | undefined) => (items || []).filter(i => !i.turno || i.turno === currentShiftNum);
  const isControlMovil = (m: InfrastructureItem) => m.name.toUpperCase().includes('CONTROL');

  const updateSearchHighlight = (agentId: string) => {
    document.querySelectorAll('.agent-card.search-highlight').forEach(el => {
      el.classList.remove('search-highlight', 'ring-2', 'ring-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', 'scale-[1.02]', 'z-10');
    });
    const el = document.getElementById(`agent-card-${agentId}`);
    if (el) {
      el.classList.add('search-highlight', 'ring-2', 'ring-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', 'scale-[1.02]', 'z-10');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const upcomingReliefs = currentSchedules.filter(sch => {
    const isStandard = (sch.startTime === '09:00' && sch.endTime === '21:00') ||
      (sch.startTime === '21:00' && sch.endTime === '09:00');
    return !isStandard;
  });

  const groupedReliefs = upcomingReliefs.reduce((acc, sch) => {
    if (!acc[sch.agentId]) {
      acc[sch.agentId] = [];
    }
    acc[sch.agentId].push(sch);
    return acc;
  }, {} as Record<string, Schedule[]>);

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
    
    // Validate agents
    if (!Array.isArray(json.agents)) {
      console.warn("isValidBackup failed: json.agents no es un array.");
      return false;
    }
    for (const agent of json.agents) {
      if (!agent || typeof agent !== 'object' || !agent.name) {
        console.warn("isValidBackup failed: Efectivo inválido encontrado (debe tener name):", agent);
        return false;
      }
    }
    
    // Validate infrastructure
    if (!json.infrastructure) {
      console.warn("isValidBackup failed: json.infrastructure está ausente.");
      return false;
    }

    const validTypes = ['garitas', 'moviles', 'motos', 'qths', 'ordenes', 'comisiones', 'garita', 'movil', 'moto', 'qth', 'orden', 'comision', 'orden_servicio'];

    if (Array.isArray(json.infrastructure)) {
      // Formato: Array plano de ítems de infraestructura
      for (const item of json.infrastructure) {
        if (!item || typeof item !== 'object' || !item.name || !item.type) {
          console.warn("isValidBackup failed: Ítem de infraestructura plano inválido (debe tener name y type):", item);
          return false;
        }
        if (!validTypes.includes(item.type)) {
          console.warn("isValidBackup failed: Tipo de infraestructura desconocido:", item.type);
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
          if (!item || typeof item !== 'object' || !item.name) {
            console.warn(`isValidBackup failed: Infraestructura inválida en ${key} (debe tener name):`, item);
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
    for (const sch of json.schedules) {
      if (!sch || typeof sch !== 'object' || !sch.agentId || !sch.role || !sch.shift) {
        console.warn("isValidBackup failed: Asignación/horario inválido (debe tener agentId, role y shift):", sch);
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
                alert("Ocurrió un error al escribir los datos importados en la base de datos.");
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
    if (reportSections.disponibles) {
      if (availableAgents.length > 0) {
        text += `EFECTIVOS DISPONIBLES:\n`;
        availableAgents.forEach(agent => {
          text += `  - ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}\n`;
        });
        text += `\n`;
      }
    }

    if (reportSections.ausentes) {
      if (ausenteAgents.length > 0) {
        text += `EFECTIVOS AUSENTES:\n`;
        ausenteAgents.forEach(agent => {
          text += `  - ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}\n`;
        });
        text += `\n`;
      }
    }

    if (reportSections.no_disponibles) {
      if (noDisponibleAgents.length > 0) {
        text += `EFECTIVOS NO DISPONIBLES:\n`;
        noDisponibleAgents.forEach(agent => {
          text += `  - ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}\n`;
        });
        text += `\n`;
      }
    }

    if (reportSections.vacaciones) {
      if (vacacionesAgents.length > 0) {
        text += `EFECTIVOS EN VACACIONES:\n`;
        vacacionesAgents.forEach(agent => {
          text += `  - ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}\n`;
        });
        text += `\n`;
      }
    }

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
      return a ? (a.jerarquia ? `${a.jerarquia} ${a.name}` : a.name) : '';
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
              baseHtml += `<li class="flat-item"><strong>${roleInfo.label}:</strong> ${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}</li>`;
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
                       <div class="item-title">${itemName}</div>
                       <ul class="agent-list">`;
            occupants.forEach(occ => {
              const agent = state.agents.find(a => a.id === occ.agentId);
              if (agent) {
                const isHabitual = (occ.startTime === '09:00' && occ.endTime === '21:00') || (occ.startTime === '21:00' && occ.endTime === '09:00');
                const scheduleText = isHabitual ? '' : ` (${occ.startTime} - ${occ.endTime})`;
                html += `<li class="agent-item">${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}${scheduleText}</li>`;
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
          html += `<li class="flat-item">${(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}</li>`;
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

  return (
    <>
      <div className="app-layout">
        {/* Header */}
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

        {/* Main Content */}
        <div className="app-content">
          {/* Sidebar */}
          <div className="app-sidebar scrollbar-hide">
            {/* Disponible */}
            <div
              className={`sidebar-section available ${dragOverTarget === 'disponible' ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'disponible')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'disponible')}
            >
              <div className="sidebar-header">
                <h2 className="sidebar-title"><Users size={20} /> Disponible</h2>
                <span className="sidebar-badge">{stats.disponible}</span>
              </div>
              <div className="sidebar-agent-list">
                {availableAgents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onDragStart={handleDragStart}
                    onClick={() => setSelectedAgentForInfo(agent)}
                    className="border-l-slate-500"
                  />
                ))}
                {availableAgents.length === 0 && (
                  <div className="sidebar-empty-text">No hay personal disponible</div>
                )}
              </div>
            </div>

            {/* Ausente */}
            <div
              className={`sidebar-section unavailable ${dragOverTarget === 'ausente' ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'ausente')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'ausente')}
            >
              <div className="sidebar-header">
                <h2 className="sidebar-title"><UserMinus size={20} /> Ausente</h2>
                <span className="sidebar-badge">{ausenteAgents.length}</span>
              </div>
              <div className="sidebar-agent-list">
                {ausenteAgents.map(agent => {
                  const schedule = currentSchedules.find(s => s.agentId === agent.id && s.role === 'ausente');
                  return (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      schedule={schedule}
                      onDragStart={handleDragStart}
                      onClick={() => setSelectedAgentForInfo(agent)}
                      bgClass="bg-orange-900/60"
                      className="border-l-orange-500 hover:bg-orange-800/80"
                    />
                  );
                })}
                {ausenteAgents.length === 0 && (
                  <div className="sidebar-empty-text">Nadie ausente</div>
                )}
              </div>
            </div>

            {/* No Disponible */}
            <div
              className={`sidebar-section unavailable ${dragOverTarget === 'no_disponible' ? 'drag-over' : ''} mt-4`}
              onDragOver={(e) => handleDragOver(e, 'no_disponible')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'no_disponible')}
            >
              <div className="sidebar-header">
                <h2 className="sidebar-title"><UserMinus size={20} /> No Disponible</h2>
                <span className="sidebar-badge">{noDisponibleAgents.length}</span>
              </div>
              <div className="sidebar-agent-list">
                {noDisponibleAgents.map(agent => {
                  const schedule = currentSchedules.find(s => s.agentId === agent.id && s.role === 'no_disponible');
                  return (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      schedule={schedule}
                      onDragStart={handleDragStart}
                      onClick={() => setSelectedAgentForInfo(agent)}
                      bgClass="bg-red-900/60"
                      className="border-l-red-500 hover:bg-red-800/80"
                    />
                  );
                })}
                {noDisponibleAgents.length === 0 && (
                  <div className="sidebar-empty-text">Nadie en licencia</div>
                )}
              </div>
            </div>

            {/* Vacaciones */}
            <div
              className={`sidebar-section unavailable ${dragOverTarget === 'vacaciones' ? 'drag-over' : ''} mt-4`}
              onDragOver={(e) => handleDragOver(e, 'vacaciones')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'vacaciones')}
            >
              <div className="sidebar-header">
                <h2 className="sidebar-title"><UserMinus size={20} /> Vacaciones</h2>
                <span className="sidebar-badge">{vacacionesAgents.length}</span>
              </div>
              <div className="sidebar-agent-list">
                {vacacionesAgents.map(agent => {
                  const schedule = currentSchedules.find(s => s.agentId === agent.id && s.role === 'vacaciones');
                  return (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      schedule={schedule}
                      onDragStart={handleDragStart}
                      onClick={() => setSelectedAgentForInfo(agent)}
                      bgClass="bg-purple-900/60"
                      className="border-l-purple-500 hover:bg-purple-800/80"
                    />
                  );
                })}
                {vacacionesAgents.length === 0 && (
                  <div className="sidebar-empty-text">Nadie de vacaciones</div>
                )}
              </div>
            </div>

            {/* Base */}
            <div className="sidebar-section bg-slate-900/50 mt-4 border border-slate-700/50">
              <div className="sidebar-header">
                <h2 className="sidebar-title"><Shield size={20} /> Base</h2>
                <span className="sidebar-badge">
                  {currentSchedules.filter(s => ['jefe', 'segundo_jefe', 'ofl_control', 'ofl_servicio', 'operaciones', 'ayte_guardia', 'logistica', 'personal', 'judiciales'].includes(s.role)).length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 pb-4">
                {[
                  { id: 'jefe', label: 'Jefe' },
                  { id: 'segundo_jefe', label: '2da jefa' },
                  { id: 'ofl_control', label: 'Ofl. de control' },
                  { id: 'ofl_servicio', label: 'Ofl. de servicio' },
                  { id: 'operaciones', label: 'Operaciones' },
                  { id: 'ayte_guardia', label: 'Ayte. de guardia' },
                  { id: 'logistica', label: 'Logística' },
                  { id: 'personal', label: 'Personal' },
                  { id: 'judiciales', label: 'Judiciales' }
                ].map(roleInfo => {
                  const occupants = currentSchedules.filter(s => s.role === roleInfo.id);
                  return (
                    <div
                      key={roleInfo.id}
                      className={`bg-slate-800 rounded-lg p-2 border border-slate-700 min-h-[60px] ${dragOverTarget === roleInfo.id ? 'border-yellow-500 bg-yellow-500/10' : ''}`}
                      onDragOver={(e) => handleDragOver(e, roleInfo.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, roleInfo.id as RoleType)}
                    >
                      <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{roleInfo.label}</div>
                      {occupants.map(occ => {
                        const agent = state.agents.find(a => a.id === occ.agentId);
                        if (!agent) return null;
                        return (
                          <AgentCard
                            key={occ.id}
                            agent={agent}
                            schedule={occ}
                            onDragStart={handleDragStart}
                            onClick={() => setSelectedAgentForInfo(agent)}
                            className="border-l-indigo-400"
                          />
                        );
                      })}
                      {occupants.length === 0 && <div className="text-xs text-slate-600 italic">Sin asignar</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Board */}
          <div className="app-board scrollbar-hide" onScroll={handleScroll}>

            {/* Stats & Alerts */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="stats-bar">
                <div className="stats-title">Efectivos en funciones</div>
                <div className="stats-items">
                  <div className="stat-item" onClick={() => document.getElementById('section-garitas')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Módulos</span><span className="stat-value">{stats.garita}</span></div>
                  <div className="stat-item" onClick={() => document.getElementById('section-caminantes')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Caminantes</span><span className="stat-value">{stats.caminante}</span></div>
                  <div className="stat-item" onClick={() => document.getElementById('section-moviles')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Móviles</span><span className="stat-value">{stats.movil}</span></div>
                  <div className="stat-item" onClick={() => document.getElementById('section-motorizada')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Motos</span><span className="stat-value">{stats.motorizada}</span></div>
                  <div className="stat-item" onClick={() => document.getElementById('section-montada')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Montada</span><span className="stat-value">{stats.montada}</span></div>
                  <div className="stat-item" onClick={() => document.getElementById('section-correo')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Correo</span><span className="stat-value">{stats.correo}</span></div>
                  <div className="stat-item" onClick={() => document.getElementById('section-ordenes')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Órdenes</span><span className="stat-value">{stats.orden_servicio}</span></div>
                  <div className="stat-item" onClick={() => document.getElementById('section-comisiones')?.scrollIntoView({ behavior: 'smooth' })}><span className="stat-label">Comisiones</span><span className="stat-value">{stats.comision}</span></div>
                  <div className="stat-item border-l border-slate-700/50 pl-3 ml-2 font-bold pointer-events-none">
                    <span className="stat-label" style={{ color: '#34d399' }}>TOTAL:</span>
                    <span className="stat-value" style={{ color: '#34d399', textShadow: '0 0 10px rgba(52, 211, 153, 0.4)' }}>{stats.garita + stats.caminante + stats.movil + stats.motorizada + stats.montada + stats.correo + stats.orden_servicio + stats.comision}</span>
                  </div>
                </div>
              </div>

              {Object.keys(groupedReliefs).length > 0 && (
                <div className="alert-box">
                  <h3 className="alert-title"><Clock className="mr-2" size={14} /> Relevos Especiales (Horario No Habitual)</h3>
                  <div className="alert-grid">
                    {Object.entries(groupedReliefs).map(([agentId, schs]) => {
                      const schedules = schs as Schedule[];
                      const agent = state.agents.find(a => a.id === agentId);
                      return (
                        <div key={agentId} className="alert-item">
                          <span className="alert-item-header">{(agent?.jerarquia ? agent.jerarquia + ' ' : '') + agent?.name}</span>
                          <div className="flex flex-col gap-1.5">
                            {schedules.map(sch => (
                              <div key={sch.id} className="alert-item-row">
                                <span className="alert-item-target" title={getInfraName(sch.role, sch.targetId)}>{getInfraName(sch.role, sch.targetId)}</span>
                                <span className="alert-item-time">{sch.startTime} - {sch.endTime}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="board-grid">

              {/* Garitas */}
              <div id="section-garitas" className="board-section">
                <div className="board-section-header">
                  <h3 className="board-section-title"><Shield size={20} />Módulos</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'garita' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('garita')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('garita', 'Módulos')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {[...filterByShift(state.infrastructure.garitas)].sort((a, b) => {
                    const occA = currentSchedules.some(s => s.role === 'garita' && s.targetId === a.id);
                    const occB = currentSchedules.some(s => s.role === 'garita' && s.targetId === b.id);
                    if (occA !== occB) return occA ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  }).map(g => {
                    const occupants = currentSchedules.filter(s => s.role === 'garita' && s.targetId === g.id);
                    const isEmpty = occupants.length === 0;
                    return (
                      <div
                        key={g.id}
                        className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === g.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, g.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'garita', g.id)}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.agent-card')) return;
                          setSelectedMovilForInfo({ item: g, type: 'garitas' });
                        }}
                      >
                        <div className="board-item-title">{g.name}</div>
                        {g.description && <div className="board-item-desc">{g.description}</div>}
                        {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                        <div className="board-item-content">
                          {occupants.map(occ => {
                            const agent = state.agents.find(a => a.id === occ.agentId);
                            if (!agent) return null;
                            return (
                              <AgentCard
                                key={occ.id}
                                agent={agent}
                                schedule={occ}
                                onDragStart={handleDragStart}
                                onClick={() => setSelectedAgentForInfo(agent)}
                                className="border-l-yellow-500"
                              />
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Caminantes (QTHs) */}
              <div id="section-caminantes" className="board-section">
                <div className="board-section-header">
                  <h3 className="board-section-title"><MapPin size={20} /> Caminantes</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'caminante' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('caminante')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('caminante', 'Caminantes')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {[...filterByShift(state.infrastructure.qths)].sort((a, b) => {
                    const occA = currentSchedules.some(s => s.role === 'caminante' && s.targetId === a.id);
                    const occB = currentSchedules.some(s => s.role === 'caminante' && s.targetId === b.id);
                    if (occA !== occB) return occA ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  }).map(q => {
                    const occupants = currentSchedules.filter(s => s.role === 'caminante' && s.targetId === q.id);
                    const isEmpty = occupants.length === 0;
                    return (
                      <div
                        key={q.id}
                        className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === q.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, q.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'caminante', q.id)}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.agent-card')) return;
                          setSelectedMovilForInfo({ item: q, type: 'qths' });
                        }}
                      >
                        <div className="board-item-title">{q.name}</div>
                        {q.description && <div className="board-item-desc">{q.description}</div>}
                        {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                        <div className="board-item-content">
                          {occupants.map(occ => {
                            const agent = state.agents.find(a => a.id === occ.agentId);
                            if (!agent) return null;
                            return (
                              <AgentCard
                                key={occ.id}
                                agent={agent}
                                schedule={occ}
                                onDragStart={handleDragStart}
                                onClick={() => setSelectedAgentForInfo(agent)}
                                className="border-l-blue-500"
                              />
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Móviles */}
              <div id="section-moviles" className="board-section">
                <div className="board-section-header">
                  <h3 className="board-section-title"><Car size={20} /> Móviles</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'movil' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('movil')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('movil', 'Móviles')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {[...filterByShift(state.infrastructure.moviles)].sort((a, b) => {
                    const occA = currentSchedules.some(s => (s.role === 'movil' && s.targetId === a.id) || (s.role === 'ofl_control' && isControlMovil(a)));
                    const occB = currentSchedules.some(s => (s.role === 'movil' && s.targetId === b.id) || (s.role === 'ofl_control' && isControlMovil(b)));
                    if (occA !== occB) return occA ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  }).map(m => {
                    const occupants = currentSchedules.filter(s => 
                      (s.role === 'movil' && s.targetId === m.id) ||
                      (s.role === 'ofl_control' && isControlMovil(m))
                    );
                    const isEmpty = occupants.length === 0;
                    return (
                      <div
                        key={m.id}
                        className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === m.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, m.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'movil', m.id)}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.agent-card')) return;
                          setSelectedMovilForInfo({ item: m, type: 'moviles' });
                        }}
                      >
                        <div className="board-item-title">
                          <span>{m.name}</span>
                          {m.ro && <span className="board-item-badge">{m.ro}</span>}
                        </div>
                        {m.description && <div className="board-item-desc">{m.description}</div>}
                        {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                        <div className="board-item-content">
                          {occupants.map(occ => {
                            const agent = state.agents.find(a => a.id === occ.agentId);
                            if (!agent) return null;
                            return (
                              <AgentCard
                                key={occ.id}
                                agent={agent}
                                schedule={occ}
                                onDragStart={handleDragStart}
                                onClick={() => setSelectedAgentForInfo(agent)}
                                className="border-l-emerald-500"
                              />
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Motos */}
              <div id="section-motorizada" className="board-section">
                <div className="board-section-header">
                  <h3 className="board-section-title"><Bike size={20} /> Motos</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'motorizada' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('motorizada')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('motorizada', 'Motos')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {[...filterByShift(state.infrastructure.motos)].sort((a, b) => {
                    const occA = currentSchedules.some(s => s.role === 'motorizada' && s.targetId === a.id);
                    const occB = currentSchedules.some(s => s.role === 'motorizada' && s.targetId === b.id);
                    if (occA !== occB) return occA ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  }).map(m => {
                    const occupants = currentSchedules.filter(s => s.role === 'motorizada' && s.targetId === m.id);
                    const isEmpty = occupants.length === 0;
                    return (
                      <div
                        key={m.id}
                        className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === m.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, m.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'motorizada', m.id)}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.agent-card')) return;
                          setSelectedMovilForInfo({ item: m, type: 'motos' });
                        }}
                      >
                        <div className="board-item-title">
                          <span>{m.name}</span>
                          {m.ro && <span className="board-item-badge">{m.ro}</span>}
                        </div>
                        {m.description && <div className="board-item-desc">{m.description}</div>}
                        {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                        <div className="board-item-content">
                          {occupants.map(occ => {
                            const agent = state.agents.find(a => a.id === occ.agentId);
                            if (!agent) return null;
                            return (
                              <AgentCard
                                key={occ.id}
                                agent={agent}
                                schedule={occ}
                                onDragStart={handleDragStart}
                                onClick={() => setSelectedAgentForInfo(agent)}
                                className="border-l-pink-500"
                              />
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Correo */}
              <div
                id="section-correo"
                className={`board-section ${dragOverTarget === 'correo' ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'correo')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'correo')}
              >
                <div className="board-section-header">
                  <h3 className="board-section-title"><Mail size={20} /> Correo</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'correo' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('correo')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('correo', 'Correo')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {currentSchedules.filter(s => s.role === 'correo').map(occ => {
                    const agent = state.agents.find(a => a.id === occ.agentId);
                    if (!agent) return null;
                    return (
                      <AgentCard
                        key={occ.id}
                        agent={agent}
                        schedule={occ}
                        onDragStart={handleDragStart}
                        onClick={() => setSelectedAgentForInfo(agent)}
                        className="border-l-purple-500"
                      />
                    )
                  })}
                  {currentSchedules.filter(s => s.role === 'correo').length === 0 && (
                    <div className="board-item-empty-msg">Sin asignar</div>
                  )}
                </div>
              </div>

              {/* Montada */}
              <div
                id="section-montada"
                className={`board-section ${dragOverTarget === 'montada' ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'montada')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'montada')}
              >
                <div className="board-section-header">
                  <h3 className="board-section-title"><Users size={20} /> Montada</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'montada' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('montada')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('montada', 'Montada')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {currentSchedules.filter(s => s.role === 'montada').map(occ => {
                    const agent = state.agents.find(a => a.id === occ.agentId);
                    if (!agent) return null;
                    return (
                      <AgentCard
                        key={occ.id}
                        agent={agent}
                        schedule={occ}
                        onDragStart={handleDragStart}
                        onClick={() => setSelectedAgentForInfo(agent)}
                        className="border-l-orange-500"
                      />
                    )
                  })}
                  {currentSchedules.filter(s => s.role === 'montada').length === 0 && (
                    <div className="board-item-empty-msg">Sin asignar</div>
                  )}
                </div>
              </div>

              {/* Órdenes de Servicio */}
              <div id="section-ordenes" className="board-section">
                <div className="board-section-header">
                  <h3 className="board-section-title"><ClipboardList size={20} /> Órdenes de Servicio</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'orden_servicio' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('orden_servicio')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('orden_servicio', 'Órdenes de Servicio')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {[...filterByShift(state.infrastructure.ordenes)].sort((a, b) => {
                    const occA = currentSchedules.some(s => s.role === 'orden_servicio' && s.targetId === a.id);
                    const occB = currentSchedules.some(s => s.role === 'orden_servicio' && s.targetId === b.id);
                    if (occA !== occB) return occA ? -1 : 1;
                    const nameA = a.name || `OS ${a.numero}`;
                    const nameB = b.name || `OS ${b.numero}`;
                    return nameA.localeCompare(nameB);
                  }).map(o => {
                    const occupants = currentSchedules.filter(s => s.role === 'orden_servicio' && s.targetId === o.id);
                    const isEmpty = occupants.length === 0;
                    return (
                      <div
                        key={o.id}
                        className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === o.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, o.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'orden_servicio', o.id)}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.agent-card')) return;
                          setSelectedMovilForInfo({ item: o, type: 'ordenes' });
                        }}
                      >
                        <div className="board-item-title">
                          <span>{o.name || `OS ${o.numero}`}</span>
                          <span className="board-item-badge">{o.horario}</span>
                        </div>
                        <div className="board-item-desc">{o.ubicacion}</div>
                        {o.description && <div className="board-item-desc">{o.description}</div>}
                        {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                        <div className="board-item-content">
                          {occupants.map(occ => {
                            const agent = state.agents.find(a => a.id === occ.agentId);
                            if (!agent) return null;
                            return (
                              <AgentCard
                                key={occ.id}
                                agent={agent}
                                schedule={occ}
                                onDragStart={handleDragStart}
                                onClick={() => setSelectedAgentForInfo(agent)}
                                className="border-l-orange-500"
                              />
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Comisiones */}
              <div id="section-comisiones" className="board-section">
                <div className="board-section-header">
                  <h3 className="board-section-title"><MapPin size={20} /> Comisiones</h3>
                  <div className="board-section-actions">
                    {lastCleared && lastCleared.role === 'comision' && lastCleared.shift === currentShift && (
                      <button onClick={() => handleUndoClear('comision')} className="btn-xs warning">
                        <Undo2 size={14} /> Deshacer
                      </button>
                    )}
                    <button onClick={() => handleClearRole('comision', 'Comisiones')} className="btn-xs danger">
                      <Trash2 size={14} /> Limpiar
                    </button>
                  </div>
                </div>
                <div className="board-section-content">
                  {[...filterByShift(state.infrastructure.comisiones)].sort((a, b) => {
                    const occA = currentSchedules.some(s => s.role === 'comision' && s.targetId === a.id);
                    const occB = currentSchedules.some(s => s.role === 'comision' && s.targetId === b.id);
                    if (occA !== occB) return occA ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  }).map(c => {
                    const occupants = currentSchedules.filter(s => s.role === 'comision' && s.targetId === c.id);
                    const isEmpty = occupants.length === 0;
                    return (
                      <div
                        key={c.id}
                        className={`board-item ${isEmpty ? 'empty' : ''} ${dragOverTarget === c.id ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, c.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'comision', c.id)}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.agent-card')) return;
                          setSelectedMovilForInfo({ item: c, type: 'comisiones' });
                        }}
                      >
                        <div className="board-item-title">{c.name}</div>
                        {c.description && <div className="board-item-desc">{c.description}</div>}
                        {isEmpty && <div className="board-item-empty-msg">Sin asignar</div>}
                        <div className="board-item-content">
                          {occupants.map(occ => {
                            const agent = state.agents.find(a => a.id === occ.agentId);
                            if (!agent) return null;
                            return (
                              <AgentCard
                                key={occ.id}
                                agent={agent}
                                schedule={occ}
                                onDragStart={handleDragStart}
                                onClick={() => setSelectedAgentForInfo(agent)}
                                className="border-l-indigo-500"
                              />
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Confirm Modal */}
      {
        confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-sm overflow-hidden shadow-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center"><AlertCircle className="mr-2 text-red-500" /> {confirmDialog.title}</h3>
              <p className="text-slate-400 text-sm mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancelar</button>
                <button onClick={handleConfirm} className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded transition-colors">
                  {confirmDialog.action ? 'Confirmar' : 'Limpiar'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Agent Info Modal */}
      {
        selectedAgentForInfo && (
          <AgentInfoModal
            agent={selectedAgentForInfo}
            onClose={() => setSelectedAgentForInfo(null)}
            state={state}
            getInfraName={getInfraName}
            userRole={userRole}
            updateAgent={(id: string, updates: Partial<Agent>) => {
              updateAgent(id, updates);
              setSelectedAgentForInfo({ ...selectedAgentForInfo, ...updates });
            }}
            softRemoveAgent={(id: string) => {
              softRemoveAgent(id);
              setSelectedAgentForInfo(null);
            }}
          />
        )
      }

      {/* Movil Info Modal */}
      {
        selectedMovilForInfo && (
          <MovilInfoModal
            movil={selectedMovilForInfo.item}
            infraType={selectedMovilForInfo.type}
            onClose={() => setSelectedMovilForInfo(null)}
            updateInfra={(type: keyof Infrastructure, id: string, updates: Partial<InfrastructureItem>) => {
              updateInfra(type, id, updates);
              setSelectedMovilForInfo({ ...selectedMovilForInfo, item: { ...selectedMovilForInfo.item, ...updates } });
            }}
            softRemoveInfra={(type: keyof Infrastructure, id: string) => {
              softRemoveInfra(type, id);
              setSelectedMovilForInfo(null);
            }}
          />
        )
      }

      {/* Schedule Modal */}
      {
        isScheduleModalOpen && (
          <ScheduleModal
            onClose={() => setIsScheduleModalOpen(false)}
            state={state}
            assignAgent={assignAgent}
            removeSchedule={removeSchedule}
            getInfraName={getInfraName}
          />
        )
      }

      {/* Report Modal */}
      {
        isReportModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9998] p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto relative z-[9999]">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FileText className="mr-2 text-yellow-500" /> Configurar Informe
                </h2>
                <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Seleccione la fecha para el informe:</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                />
              </div>

              {/* Header selection */}
              <div className="mb-4 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Encabezado</h3>
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
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Secciones a Incluir</h3>
                
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Asignaciones / Distribución</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { key: 'base', label: 'Base (Oficinas)' },
                    { key: 'garita', label: 'Módulos (Garitas)' },
                    { key: 'movil', label: 'Móviles' },
                    { key: 'motorizada', label: 'Motos' },
                    { key: 'caminante', label: 'Caminantes' },
                    { key: 'orden_servicio', label: 'Órdenes de Servicio' },
                    { key: 'comision', label: 'Comisiones' }
                  ].map(sec => (
                    <label key={sec.key} className="flex items-center gap-2.5 p-2 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-all border border-slate-800/50 hover:border-slate-700/50 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={reportSections[sec.key as keyof typeof reportSections]}
                        onChange={(e) => setReportSections({ ...reportSections, [sec.key]: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-yellow-600 focus:ring-yellow-500 bg-slate-700 border-slate-600"
                      />
                      <span>{sec.label}</span>
                    </label>
                  ))}
                </div>

                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Estado del Personal</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'disponibles', label: 'Disponibles' },
                    { key: 'ausentes', label: 'Ausentes / Franco' },
                    { key: 'no_disponibles', label: 'No Disponibles' },
                    { key: 'vacaciones', label: 'En Vacaciones' }
                  ].map(sec => (
                    <label key={sec.key} className="flex items-center gap-2.5 p-2 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-all border border-slate-800/50 hover:border-slate-700/50 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={reportSections[sec.key as keyof typeof reportSections]}
                        onChange={(e) => setReportSections({ ...reportSections, [sec.key]: e.target.checked })}
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
                  {reportAction === 'copy' ? <ClipboardCopy size={16} className="mr-2" /> : <Printer size={16} className="mr-2" />}
                  {reportAction === 'copy' ? 'Copiar Informe' : 'Generar PDF'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Settings Modal */}
      {
        isSettingsOpen && (
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
        )
      }

      {/* Export Config Modal for Admins */}
      {
        isExportModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9998] p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto relative z-[9999]">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Download className="mr-2 text-yellow-500" /> Exportar por Turnos
                </h2>
                <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-4">Selecciona los turnos de los cuales deseas exportar la información:</p>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map(t => (
                    <label key={t} className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer border border-slate-850 hover:border-slate-700 transition-all">
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
        )
      }

      {/* Import Config Modal for Admins */}
      {
        isImportModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9998] p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto relative z-[9999]">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Upload className="mr-2 text-yellow-500" /> Importar por Turnos
                </h2>
                <button onClick={() => { setIsImportModalOpen(false); setImportState(null); }} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-4">Selecciona qué turnos del archivo deseas importar y sobrescribir en la base de datos:</p>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map(t => (
                    <label key={t} className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer border border-slate-850 hover:border-slate-700 transition-all">
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
                  onClick={() => { setIsImportModalOpen(false); setImportState(null); }}
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
                    if (window.confirm("¿Está seguro de que desea proceder con la importación selectiva? Los datos de los turnos seleccionados serán sobrescritos.")) {
                      try {
                        setIsImportModalOpen(false);
                        await loadState(importState, importSelectedTurns);
                        setImportState(null);
                        alert("Importación exitosa. Los turnos seleccionados han sido restaurados.");
                      } catch (err) {
                        console.error("Error writing imported state to Firestore:", err);
                        alert("Ocurrió un error al escribir los datos importados en la base de datos.");
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
        )
      }

      <button
        className={`fab-scroll ${showScrollTop ? 'visible' : ''}`}
        onClick={() => document.querySelector('.app-board')?.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Volver arriba"
      >
        <ArrowUp size={24} />
      </button>

    </>
  );
}

// --- Subcomponents for Modals ---

function MovilInfoModal({ movil, infraType, onClose, updateInfra, softRemoveInfra }: any) {
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

function AgentInfoModal({ agent, onClose, state, getInfraName, updateAgent, softRemoveAgent, userRole }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(agent.name || '');
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

  React.useEffect(() => {
    setName(agent.name || '');
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
    
    const hasAnyPopulated = !!(agent.domicilio || agent.marcaChaleco || agent.modeloChaleco || agent.nroSerieChaleco || agent.marcaArmamento || agent.modeloArmamento || agent.nroSerieArmamento);
    setShowMoreFields(hasAnyPopulated);
  }, [agent, isEditing]);

  const handleSave = () => {
    const trimmedJ = jerarquia.trim();
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
    updateAgent(agent.id, {
      name,
      jerarquia: trimmedJ || '',
      escalafon: trimmedE || '',
      telefono, legajo, turno,
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
          <h3 className="text-lg font-bold text-white flex items-center"><Users className="mr-2 text-yellow-500" /> {(agent.jerarquia ? agent.jerarquia + ' ' : '') + agent.name}</h3>
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
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Jerarquía</label>
                  <input
                    type="text"
                    list="ranks-list"
                    value={jerarquia}
                    onChange={e => { setJerarquia(e.target.value); setJerarquiaError(null); }}
                    onBlur={() => {
                      const t = jerarquia.trim();
                      if (t !== '' && !validRanks.includes(t)) {
                        setJerarquia('');
                        setJerarquiaError('La jerarquía ingresada no es válida. Debe elegir una de la lista.');
                      } else {
                        setJerarquiaError(null);
                      }
                    }}
                    autocomplete="off"
                    className={`w-full bg-slate-800 border ${jerarquiaError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm`}
                    placeholder="Escriba para buscar jerarquía..."
                  />
                  <datalist id="ranks-list">
                    {validRanks.map(r => <option key={r} value={r} />)}
                  </datalist>
                  {jerarquiaError && <p className="text-red-500 text-[10px] mt-1 font-semibold">{jerarquiaError}</p>}
                </div>
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
                    autocomplete="off"
                    className={`w-full bg-slate-800 border ${escalafonError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm`}
                    placeholder="Escriba para buscar escalafón..."
                  />
                  <datalist id="branches-list">
                    {validEscalafones.map(b => <option key={b} value={b} />)}
                  </datalist>
                  {escalafonError && <p className="text-red-500 text-[10px] mt-1 font-semibold">{escalafonError}</p>}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nombre</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: PEREZ JUAN" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Legajo</label>
                  <input type="text" value={legajo} onChange={e => setLegajo(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: 123456" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Teléfono</label>
                  <input type="text" value={telefono} onChange={e => setTelefono(e.target.value.replace(/[^\d\s\-+]/g, ''))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Ej: 11-1234-5678" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 flex items-center justify-between">
                    <span>Turno Asignado</span>
                    {userRole !== 'admin' && <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">Solo Admin</span>}
                  </label>
                  <select
                    disabled={userRole !== 'admin'}
                    value={turno}
                    onChange={e => setTurno(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
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
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Domicilio</label>
                          <input
                            type="text"
                            value={domicilio}
                            onChange={e => setDomicilio(e.target.value)}
                            placeholder="Calle, Número, Localidad"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
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
                  <span className="text-sm text-slate-500">Escalafón:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.escalafon || <span className="text-slate-600 italic">Sin asignar</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Legajo:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.legajo || <span className="text-slate-600 italic">No registrado</span>}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Teléfono:</span>
                  <span className="text-sm text-slate-300 font-medium">{agent.telefono || <span className="text-slate-600 italic">No registrado</span>}</span>
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
                        <span className="text-slate-500">Domicilio:</span>
                        <span className="text-slate-300 font-medium text-right max-w-[200px] break-words">
                          {agent.domicilio || <span className="text-slate-600 italic">No registrado</span>}
                        </span>
                      </div>
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

function ScheduleModal({ onClose, state, assignAgent, removeSchedule, getInfraName }: any) {
  const [agentId, setAgentId] = useState(state.agents[0]?.id || '');
  const [role, setRole] = useState<RoleType>('garita');
  const [targetId, setTargetId] = useState('');
  const [shift, setShift] = useState<Shift>('turno3');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');

  // Update default times when shift changes
  React.useEffect(() => {
    if (shift === 'turno1' || shift === 'turno3') {
      setStartTime('09:00');
      setEndTime('21:00');
    } else {
      setStartTime('21:00');
      setEndTime('09:00');
    }
  }, [shift]);

  const handleSave = () => {
    if (!agentId) return;
    assignAgent(agentId, shift, role, targetId || undefined, startTime, endTime);
    // Don't close immediately to allow adding multiple
  };

  const targets = role === 'garita' ? state.infrastructure.garitas :
    role === 'caminante' ? state.infrastructure.qths :
      role === 'movil' ? state.infrastructure.moviles :
        role === 'motorizada' ? state.infrastructure.motos :
          role === 'orden_servicio' ? (state.infrastructure.ordenes || []) : [];

  // Auto-select first target when role changes
  React.useEffect(() => {
    if (targets.length > 0) setTargetId(targets[0].id);
    else setTargetId('');
  }, [role]);

  // Ensure selected agent belongs to the selected shift
  React.useEffect(() => {
    const validAgents = state.agents.filter((a: Agent) => ('turno' + (a.turno || 1)) === shift);
    if (validAgents.length > 0 && !validAgents.find((a: Agent) => a.id === agentId)) {
      setAgentId(validAgents[0].id);
    } else if (validAgents.length === 0) {
      setAgentId('');
    }
  }, [shift, state.agents]);

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
                <select value={shift} onChange={e => setShift(e.target.value as Shift)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm mb-4">
                  <option value="turno1">Turno 1 (09:00 - 21:00)</option>
                  <option value="turno2">Turno 2 (21:00 - 09:00)</option>
                  <option value="turno3">Turno 3 (09:00 - 21:00)</option>
                  <option value="turno4">Turno 4 (21:00 - 09:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Agente</label>
                <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                  {state.agents.filter((a: Agent) => ('turno' + (a.turno || 1)) === shift).map((a: Agent) => <option key={a.id} value={a.id}>{(a.jerarquia ? a.jerarquia + ' ' : '') + a.name}</option>)}
                </select>
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
                <select value={role} onChange={e => setRole(e.target.value as RoleType)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                  <option value="garita">Módulo</option>
                  <option value="caminante">Caminante</option>
                  <option value="movil">Móvil</option>
                  <option value="motorizada">Motorizada</option>
                  <option value="correo">Correo</option>
                  <option value="orden_servicio">Orden de Servicio</option>
                  <option value="disponible">Disponible</option>
                  <option value="no_disponible">No Disponible (Licencia)</option>
                  <option value="ausente">Ausente</option>
                  <option value="vacaciones">Vacaciones</option>
                </select>
              </div>

              {role !== 'correo' && role !== 'disponible' && role !== 'no_disponible' && role !== 'ausente' && role !== 'vacaciones' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Destino</label>
                  <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                    {targets.map((t: InfrastructureItem) => <option key={t.id} value={t.id}>{t.name || `OS ${t.numero}`} {t.ro ? `(${t.ro})` : ''}</option>)}
                  </select>
                </div>
              )}

              <button onClick={handleSave} className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-2 rounded transition-colors flex justify-center items-center">
                <Plus size={18} className="mr-2" /> Agregar Programación
              </button>
            </div>
          </div>

          {/* List */}
          <div className="w-full md:w-2/3 p-4 overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Programaciones Activas</h4>
            <div className="space-y-2">
              {state.schedules.length === 0 ? (
                <div className="text-slate-500 italic text-center py-8">No hay programaciones activas</div>
              ) : (
                state.schedules.sort((a: Schedule, b: Schedule) => a.startTime.localeCompare(b.startTime)).map((sch: Schedule) => {
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
                          <div className="text-sm text-slate-400 capitalize">{sch.role} - {getInfraName(sch.role, sch.targetId)}</div>
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
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ onClose, state, addAgent, removeAgent, addInfra, removeInfra, updateAgent, updateInfra, userRole }: any) {
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
  const [newAgentJerarquia, setNewAgentJerarquia] = useState('');
  const [newAgentJerarquiaError, setNewAgentJerarquiaError] = useState<string | null>(null);
  const [newAgentEscalafon, setNewAgentEscalafon] = useState('');
  const [newAgentEscalafonError, setNewAgentEscalafonError] = useState<string | null>(null);
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentLegajo, setNewAgentLegajo] = useState('');
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
    setNewAgentJerarquia('');
    setNewAgentJerarquiaError(null);
    setNewAgentEscalafon('');
    setNewAgentEscalafonError(null);
    setNewAgentPhone('');
    setNewAgentLegajo('');
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
    setNewAgentName(a.name);
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
    
    if (a.domicilio || a.marcaChaleco || a.modeloChaleco || a.nroSerieChaleco || a.marcaArmamento || a.modeloArmamento || a.nroSerieArmamento) {
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
    if (newAgentName.trim()) {
      const trimmedJ = newAgentJerarquia.trim();
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

      if (editingId) {
        if (window.confirm(`¿Está seguro que desea guardar los cambios para el efectivo ${newAgentName.trim()}?`)) {
          updateAgent(editingId, {
            name: newAgentName.trim(), 
            jerarquia: trimmedJ || '',
            escalafon: trimmedE || '',
            telefono: newAgentPhone.trim(), 
            legajo: newAgentLegajo.trim(), 
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
            nroSerieArmamento: newAgentNroSerieArmamento.trim()
          });
          cancelEdit();
        }
      } else {
        addAgent(
          newAgentName.trim(), 
          newAgentPhone.trim(), 
          newAgentLegajo.trim(), 
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
        const payload = { name: `OS ${newOSNumero.trim()}`, numero: newOSNumero.trim(), horario: newOSHorario.trim(), ubicacion: newOSUbicacion.trim(), description: newInfraDescription.trim(), turno: newInfraShift };
        if (editingId) {
          updateInfra(type, editingId, payload);
        } else {
          addInfra(type, payload);
        }
        cancelEdit();
      }
    } else {
      if (newInfraName.trim()) {
        const payload = { name: newInfraName.trim(), ro: newInfraRO.trim(), description: newInfraDescription.trim(), turno: newInfraShift };
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
          <h3 className="text-lg font-bold text-white flex items-center"><Settings className="mr-2 text-yellow-500" /> Gestión de recursos</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto relative z-[1000] shrink-0 scrollbar-hide">
          <button onClick={() => { setActiveTab('personal'); cancelEdit(); setResourceSearchQuery(''); }} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'personal' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>Personal</button>
          <button onClick={() => { setActiveTab('garitas'); cancelEdit(); setResourceSearchQuery(''); }} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'garitas' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>Módulos</button>
          <button onClick={() => { setActiveTab('qths'); cancelEdit(); setResourceSearchQuery(''); }} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'qths' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>QTH</button>
          <button onClick={() => { setActiveTab('moviles'); cancelEdit(); setResourceSearchQuery(''); }} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'moviles' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>Móviles</button>
          <button onClick={() => { setActiveTab('motos'); cancelEdit(); setResourceSearchQuery(''); }} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'motos' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>Motos</button>
          <button onClick={() => { setActiveTab('ordenes'); cancelEdit(); setResourceSearchQuery(''); }} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'ordenes' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>Órdenes</button>
          <button onClick={() => { setActiveTab('comisiones'); cancelEdit(); setResourceSearchQuery(''); }} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'comisiones' ? 'text-yellow-500 border-b-2 border-yellow-500 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}>Comisiones</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'personal' && (
            <div>
              <form onSubmit={handleAddAgent} className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm font-bold text-slate-300">{editingId ? 'Editar Efectivo' : 'Agregar Nuevo Efectivo'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      list="ranks-list-settings"
                      value={newAgentJerarquia}
                      onChange={e => { setNewAgentJerarquia(e.target.value); setNewAgentJerarquiaError(null); }}
                      onBlur={() => {
                        const t = newAgentJerarquia.trim();
                        if (t !== '' && !validRanks.includes(t)) {
                          setNewAgentJerarquia('');
                          setNewAgentJerarquiaError('La jerarquía ingresada no es válida. Debe elegir una de la lista.');
                        } else {
                          setNewAgentJerarquiaError(null);
                        }
                      }}
                      autocomplete="off"
                      placeholder="Jerarquía (ej: Sgto., OFL., etc.)"
                      className={`bg-slate-800 border ${newAgentJerarquiaError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm`}
                    />
                    <datalist id="ranks-list-settings">
                      {validRanks.map(r => <option key={r} value={r} />)}
                    </datalist>
                    {newAgentJerarquiaError && <span className="text-red-500 text-[10px] mt-1 font-semibold">{newAgentJerarquiaError}</span>}
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      list="branches-list-settings"
                      value={newAgentEscalafon}
                      onChange={e => { setNewAgentEscalafon(e.target.value); setNewAgentEscalafonError(null); }}
                      onBlur={() => {
                        const t = newAgentEscalafon.trim();
                        if (t !== '' && !validEscalafones.includes(t)) {
                          setNewAgentEscalafon('');
                          setNewAgentEscalafonError('El escalafón ingresado no es válido. Debe elegir uno de la lista.');
                        } else {
                          setNewAgentEscalafonError(null);
                        }
                      }}
                      autocomplete="off"
                      placeholder="Escalafón (ej: COMANDO, etc.)"
                      className={`bg-slate-800 border ${newAgentEscalafonError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm`}
                    />
                    <datalist id="branches-list-settings">
                      {validEscalafones.map(b => <option key={b} value={b} />)}
                    </datalist>
                    {newAgentEscalafonError && <span className="text-red-500 text-[10px] mt-1 font-semibold">{newAgentEscalafonError}</span>}
                  </div>

                  <input type="text" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} placeholder="Nombre (Ej: Pérez Juan)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" required />
                  <input type="text" value={newAgentLegajo} onChange={e => setNewAgentLegajo(e.target.value.replace(/\D/g, ''))} placeholder="Legajo (Opcional)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  <input type="text" value={newAgentPhone} onChange={e => setNewAgentPhone(e.target.value.replace(/[^\d\s\-+]/g, ''))} placeholder="Teléfono (Opcional)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  <select value={newAgentShift} onChange={e => setNewAgentShift(Number(e.target.value) as 1 | 2 | 3 | 4)} className={`bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAdmin}>
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>
                
                <div className="border-t border-slate-700 pt-3 mt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-2 cursor-pointer">
                    <input type="checkbox" checked={newAgentHasLicense} onChange={e => setNewAgentHasLicense(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-yellow-500" />
                    Posee Licencia de Conducir
                  </label>
                  {newAgentHasLicense && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-4 border-l-2 border-slate-700 ml-1 mb-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tipo</label>
                        <select value={newAgentLicenseType} onChange={e => setNewAgentLicenseType(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs">
                          <option value="auto">Auto</option>
                          <option value="moto">Moto</option>
                          <option value="ambas">Ambas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Categoría</label>
                        <select value={newAgentLicenseCategory} onChange={e => setNewAgentLicenseCategory(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs">
                          <option value="comun">Común</option>
                          <option value="profesional">Profesional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Vencimiento</label>
                        <input type="date" value={newAgentLicenseExpiration} onChange={e => setNewAgentLicenseExpiration(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-xs text-slate-300 font-bold mb-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={newAgentHasDAEO} onChange={e => setNewAgentHasDAEO(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-yellow-500" />
                    Posee Permiso DAEO
                  </label>
                  {newAgentHasDAEO && (
                    <div className="pl-4 border-l-2 border-slate-700 ml-1 mb-2">
                      <label className="block text-[10px] text-slate-500 mb-1">Vencimiento DAEO</label>
                      <input type="date" value={newAgentDAEOExpiration} onChange={e => setNewAgentDAEOExpiration(e.target.value)} className="w-full sm:w-1/3 bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
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
                        <div className="col-span-1 sm:col-span-2 md:col-span-3">
                          <label className="block text-[10px] text-slate-500 mb-1">Domicilio</label>
                          <input
                            type="text"
                            value={newAgentDomicilio}
                            onChange={e => setNewAgentDomicilio(e.target.value)}
                            placeholder="Calle, Número, Localidad"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Marca Chaleco</label>
                          <input
                            type="text"
                            value={newAgentMarcaChaleco}
                            onChange={e => setNewAgentMarcaChaleco(e.target.value)}
                            placeholder="Ej: RB3"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Modelo Chaleco</label>
                          <input
                            type="text"
                            value={newAgentModeloChaleco}
                            onChange={e => setNewAgentModeloChaleco(e.target.value)}
                            placeholder="Ej: Multiamenaza"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">N° Serie Chaleco</label>
                          <input
                            type="text"
                            value={newAgentNroSerieChaleco}
                            onChange={e => setNewAgentNroSerieChaleco(e.target.value)}
                            placeholder="Ej: 12345"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Marca Armamento</label>
                          <input
                            type="text"
                            value={newAgentMarcaArmamento}
                            onChange={e => setNewAgentMarcaArmamento(e.target.value)}
                            placeholder="Ej: Bersa"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Modelo Armamento</label>
                          <input
                            type="text"
                            value={newAgentModeloArmamento}
                            onChange={e => setNewAgentModeloArmamento(e.target.value)}
                            placeholder="Ej: TPR9"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">N° Serie Armamento</label>
                          <input
                            type="text"
                            value={newAgentNroSerieArmamento}
                            onChange={e => setNewAgentNroSerieArmamento(e.target.value)}
                            placeholder="Ej: 98765"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && <button type="button" onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">Cancelar</button>}
                  <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">{editingId ? 'Guardar Cambios' : 'Agregar Efectivo'}</button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">Lista de Efectivos</h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Buscar efectivo..." 
                    value={resourceSearchQuery} 
                    onChange={e => setResourceSearchQuery(e.target.value)} 
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs flex-1 sm:w-48" 
                  />
                  {isAdmin && (
                    <select value={resourceFilterShift} onChange={e => setResourceFilterShift(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)} className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0">
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
                {state.agents.filter((a: Agent) => 
                  (isAdmin || (a.turno || 1) === userShiftNum) &&
                  (resourceFilterShift === 'all' || (a.turno || 1) === resourceFilterShift) && 
                  (a.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()) || 
                   (a.jerarquia && a.jerarquia.toLowerCase().includes(resourceSearchQuery.toLowerCase())) ||
                   (a.escalafon && a.escalafon.toLowerCase().includes(resourceSearchQuery.toLowerCase())) ||
                   (a.legajo || '').includes(resourceSearchQuery))
                ).map((a: Agent) => (
                  <div key={a.id} className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700">
                    <div>
                      <div className="text-slate-200 font-medium">{(a.jerarquia ? a.jerarquia + ' ' : '') + a.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        {a.legajo && <span>L: {a.legajo}</span>}
                        {a.telefono && <span>Tel: {a.telefono}</span>}
                        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500">
                          {`Turno ${a.turno || 1}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex">
                      {(isAdmin || userShiftNum === (a.turno || 1)) && (
                        <>
                          <button onClick={() => handleEditAgent(a)} className="text-slate-500 hover:text-blue-500 p-2"><Edit2 size={16} /></button>
                          <button onClick={() => {
                            const displayName = (a.jerarquia ? a.jerarquia + ' ' : '') + a.name;
                            if (window.confirm(`¿Está seguro que desea eliminar al efectivo ${displayName}?`)) {
                              removeAgent(a.id);
                            }
                          }} className="text-slate-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
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
              <form onSubmit={(e) => handleAddInfra(e, activeTab)} className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm font-bold text-slate-300">{editingId ? 'Editar' : 'Agregar'} {activeTab === 'garitas' ? 'Módulo' : activeTab === 'qths' ? 'QTH' : 'Comisión'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" value={newInfraName} onChange={e => setNewInfraName(e.target.value)} placeholder={`Nombre d${activeTab === 'garitas' ? 'el módulo' : activeTab === 'qths' ? 'e la intersección' : 'e la comisión'}`} className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" required />
                  <input type="text" value={newInfraDescription} onChange={e => setNewInfraDescription(e.target.value)} placeholder="Descripción (Opcional)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  <select value={newInfraShift} onChange={e => setNewInfraShift(Number(e.target.value) as 1 | 2 | 3 | 4)} className={`bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAdmin}>
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && <button type="button" onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">Cancelar</button>}
                  <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">{editingId ? 'Guardar Cambios' : 'Agregar'}</button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">Lista de {activeTab === 'garitas' ? 'Módulos' : activeTab === 'qths' ? 'QTHs' : 'Comisiones'}</h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={resourceSearchQuery} 
                    onChange={e => setResourceSearchQuery(e.target.value)} 
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs w-full sm:w-48" 
                  />
                  {isAdmin && (
                    <select value={resourceFilterShift} onChange={e => setResourceFilterShift(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)} className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0">
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
                {(state.infrastructure[activeTab as keyof Infrastructure] || []).filter((i: InfrastructureItem) => 
                  (isAdmin || i.turno === userShiftNum) &&
                  (resourceFilterShift === 'all' || i.turno === resourceFilterShift) &&
                  (i.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()) || 
                  (i.description || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()))
                ).map((i: InfrastructureItem) => (
                  <div key={i.id} className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700">
                    <div>
                      <div className="text-slate-200 font-medium flex items-center gap-2">
                        {i.name}
                        {resourceFilterShift === 'all' && (
                          <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-normal">
                            {`Turno ${i.turno || 1}`}
                          </span>
                        )}
                      </div>
                      {i.description && <div className="text-xs text-slate-500 mt-1">{i.description}</div>}
                    </div>
                    <div className="flex">
                      {(isAdmin || i.turno === userShiftNum) && (
                        <>
                          <button type="button" onClick={() => handleEditInfra(i)} className="text-slate-500 hover:text-blue-500 p-2"><Edit2 size={16} /></button>
                          <button type="button" onClick={() => removeInfra(activeTab, i.id)} className="text-slate-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
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
              <form onSubmit={(e) => handleAddInfra(e, activeTab)} className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm font-bold text-slate-300">{editingId ? 'Editar' : 'Agregar'} {activeTab === 'moviles' ? 'Móvil' : 'Moto'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input type="text" value={newInfraName} onChange={e => setNewInfraName(e.target.value)} placeholder="Nombre (Ej: Móvil 01)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" required />
                  <input type="text" value={newInfraRO} onChange={e => setNewInfraRO(e.target.value)} placeholder="RO (Ej: RO-123)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  <input type="text" value={newInfraDescription} onChange={e => setNewInfraDescription(e.target.value)} placeholder="Descripción (Opcional)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  <select value={newInfraShift} onChange={e => setNewInfraShift(Number(e.target.value) as 1 | 2 | 3 | 4)} className={`bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAdmin}>
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && <button type="button" onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">Cancelar</button>}
                  <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">{editingId ? 'Guardar Cambios' : 'Agregar'}</button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">Lista de {activeTab === 'moviles' ? 'Móviles' : 'Motos'}</h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={resourceSearchQuery} 
                    onChange={e => setResourceSearchQuery(e.target.value)} 
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs w-full sm:w-48" 
                  />
                  {isAdmin && (
                    <select value={resourceFilterShift} onChange={e => setResourceFilterShift(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)} className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0">
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
                {(state.infrastructure[activeTab as keyof Infrastructure] || []).filter((i: InfrastructureItem) => 
                  (isAdmin || i.turno === userShiftNum) &&
                  (resourceFilterShift === 'all' || i.turno === resourceFilterShift) &&
                  (i.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()) || 
                  (i.description || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                  (i.ro || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()))
                ).map((i: InfrastructureItem) => (
                  <div key={i.id} className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-200 font-medium">{i.name}</span>
                        {i.ro && <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{i.ro}</span>}
                        {resourceFilterShift === 'all' && (
                          <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-normal">
                            {`Turno ${i.turno || 1}`}
                          </span>
                        )}
                      </div>
                      {i.description && <div className="text-xs text-slate-500">{i.description}</div>}
                    </div>
                    <div className="flex">
                      {(isAdmin || i.turno === userShiftNum) && (
                        <>
                          <button type="button" onClick={() => handleEditInfra(i)} className="text-slate-500 hover:text-blue-500 p-2"><Edit2 size={16} /></button>
                          <button type="button" onClick={() => removeInfra(activeTab, i.id)} className="text-slate-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
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
              <form onSubmit={(e) => handleAddInfra(e, activeTab)} className="flex flex-col gap-3 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm font-bold text-slate-300">{editingId ? 'Editar' : 'Agregar'} Orden de Servicio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input type="text" value={newOSNumero} onChange={e => setNewOSNumero(e.target.value)} placeholder="Número (Ej: 1234/24)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" required />
                  <input type="text" value={newOSHorario} onChange={e => setNewOSHorario(e.target.value)} placeholder="Horario (Ej: 08:00 a 12:00)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  <input type="text" value={newOSUbicacion} onChange={e => setNewOSUbicacion(e.target.value)} placeholder="Ubicación (Ej: Estadio Municipal)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" required />
                  <input type="text" value={newInfraDescription} onChange={e => setNewInfraDescription(e.target.value)} placeholder="Descripción (Opcional)" className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  <select value={newInfraShift} onChange={e => setNewInfraShift(Number(e.target.value) as 1 | 2 | 3 | 4)} className={`bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isAdmin}>
                    <option value={1}>Turno 1</option>
                    <option value={2}>Turno 2</option>
                    <option value={3}>Turno 3</option>
                    <option value={4}>Turno 4</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-1 w-full">
                  {editingId && <button type="button" onClick={cancelEdit} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">Cancelar</button>}
                  <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold transition-colors w-full sm:w-auto">{editingId ? 'Guardar Cambios' : 'Agregar'}</button>
                </div>
              </form>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="text-sm font-bold text-slate-300">Lista de Órdenes de Servicio</h4>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={resourceSearchQuery} 
                    onChange={e => setResourceSearchQuery(e.target.value)} 
                    className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs w-full sm:w-48" 
                  />
                  {isAdmin && (
                    <select value={resourceFilterShift} onChange={e => setResourceFilterShift(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)} className="bg-slate-800 border border-slate-700 rounded p-1 text-white text-xs shrink-0">
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
                {(state.infrastructure.ordenes || []).filter((i: InfrastructureItem) => 
                  (isAdmin || i.turno === userShiftNum) &&
                  (resourceFilterShift === 'all' || i.turno === resourceFilterShift) &&
                  ((i.name || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) || 
                  (i.numero || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                  (i.ubicacion || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
                  (i.description || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()))
                ).map((i: InfrastructureItem) => (
                  <div key={i.id} className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-200 font-bold">OS {i.numero}</span>
                        {i.horario && <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{i.horario}</span>}
                        {resourceFilterShift === 'all' && (
                          <span className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-normal">
                            {`Turno ${i.turno || 1}`}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">{i.ubicacion}</span>
                      {i.description && <span className="text-xs text-slate-500 mt-1">{i.description}</span>}
                    </div>
                    <div className="flex">
                      {(isAdmin || i.turno === userShiftNum) && (
                        <>
                          <button type="button" onClick={() => handleEditInfra(i)} className="text-slate-500 hover:text-blue-500 p-2"><Edit2 size={16} /></button>
                          <button type="button" onClick={() => removeInfra(activeTab, i.id)} className="text-slate-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
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

function UpdateBanner() {
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

export default function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Definimos una versión por defecto si __APP_VERSION__ no está disponible
    const localVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
    
    if (localVersion === 'dev') {
      return;
    }

    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.version && data.version !== localVersion) {
            setUpdateAvailable(true);
          }
        }
      } catch (err) {
        console.warn('Error al verificar versión:', err);
      }
    };

    // Ejecuta la comprobación al montar
    checkVersion();

    // Comprueba cada 60 segundos
    const interval = setInterval(checkVersion, 60 * 1000);

    // Comprueba al volver a enfocar la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {updateAvailable && <UpdateBanner />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminView />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin', 'turno1', 'turno2', 'turno3', 'turno4']}>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}
