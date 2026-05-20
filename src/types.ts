export type Shift = 'turno1' | 'turno2' | 'turno3' | 'turno4';

export type RoleType = 'garita' | 'caminante' | 'movil' | 'motorizada' | 'correo' | 'orden_servicio' | 'comision' | 'disponible' | 'no_disponible' | 'ausente' | 'vacaciones' | 'ofl_control' | 'ofl_servicio' | 'operaciones' | 'ayte_guardia' | 'logistica' | 'personal' | 'judiciales' | 'montada';

export interface Agent {
  id: string;
  name: string;
  legajo?: string;
  telefono?: string;
  turno: 1 | 2 | 3 | 4;
  hasLicense?: boolean;
  licenseType?: 'auto' | 'moto' | 'ambas';
  licenseCategory?: 'comun' | 'profesional';
  licenseExpiration?: string;
  hasDAEO?: boolean;
  daeoExpiration?: string;
  isDeleted?: boolean;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  turno?: 1 | 2 | 3 | 4;
  ro?: string;
  numero?: string;
  horario?: string;
  ubicacion?: string;
  description?: string;
}

export interface Infrastructure {
  garitas: InfrastructureItem[];
  moviles: InfrastructureItem[];
  motos: InfrastructureItem[];
  qths: InfrastructureItem[];
  ordenes: InfrastructureItem[];
  comisiones: InfrastructureItem[];
}

export interface Schedule {
  id: string;
  agentId: string;
  role: RoleType;
  targetId?: string;
  shift: Shift;
  startTime: string;
  endTime: string;
}

export interface AppState {
  agents: Agent[];
  infrastructure: Infrastructure;
  schedules: Schedule[];
}
