import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { useStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Shift, RoleType, Agent, Schedule, InfrastructureItem, Infrastructure } from '../types';
import {
  Shield, MapPin, Car, Bike, Mail, Users, Download, Upload, Settings, Calendar, Clock, X, Plus, Trash2, AlertCircle, ClipboardList, UserMinus, ClipboardCopy, Printer, Check, FileText, Undo2, LogOut, ArrowUp, Search, ChevronUp, ChevronDown, Edit2, Menu
} from 'lucide-react';
import { validRanks, validEscalafones } from '../constants';
import logoMinisterio from '../assets/logo_ministerio.png';
import logoProvincia from '../assets/logo_provincia.png';
import { AgentCard } from '../components/AgentCard';
import { MovilInfoModal } from '../components/MovilInfoModal';
import { AgentInfoModal } from '../components/AgentInfoModal';
import { ScheduleModal } from '../components/ScheduleModal';
import { SettingsModal } from '../components/SettingsModal';

﻿export function Dashboard() {
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => prev === message ? null : prev);
    }, 4000);
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

      xmlText = xmlText.replace(/\[JERARQUIA\]/g, finalJerarquia);
      xmlText = xmlText.replace(/\[ESCALAFON\]/g, finalEscalafon);
      xmlText = xmlText.replace(/\[LEGAJO\]/g, finalLegajo);
      xmlText = xmlText.replace(/\[APELLIDO\]/g, finalApellido);
      xmlText = xmlText.replace(/\[NOMBRES\]/g, finalNombre);
      xmlText = xmlText.replace(/\[DOMICILIO\]/g, finalDomicilio);
      xmlText = xmlText.replace(/\[LOCALIDAD\]/g, finalLocalidad);
      xmlText = xmlText.replace(/\[FECHA_SUBRAYADO\]/g, finalFechaSubrayado);
      xmlText = xmlText.replace(/\[ANIO\]/g, finalAnio);

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
        )
      }

      {/* DJ Ausente Modal */}
      {isDJModalOpen && (
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
                    list="dj-ranks-list"
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
                  list="dj-branches-list"
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
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700/80 border-l-4 border-l-yellow-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[9999] animate-fade-in-up">
          <Check size={18} className="text-yellow-500" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

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
