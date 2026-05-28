import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, collection, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { AppState, Agent, Infrastructure, Schedule, Shift, RoleType, InfrastructureItem } from './types';

export function useStore() {
  const [state, setLocalState] = useState<AppState>({
    agents: [],
    infrastructure: {
      garitas: [],
      moviles: [],
      motos: [],
      qths: [],
      ordenes: [],
      comisiones: []
    },
    schedules: []
  });

  useEffect(() => {
    const unsubAgents = onSnapshot(collection(db, 'agents'), (snapshot) => {
      const agents = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Agent))
        .filter(agent => !agent.isDeleted);
      setLocalState(s => ({ ...s, agents }));
    });

    const unsubInfra = onSnapshot(collection(db, 'infrastructure'), (snapshot) => {
      const newInfra: Infrastructure = {
        garitas: [],
        moviles: [],
        motos: [],
        qths: [],
        ordenes: [],
        comisiones: []
      };
      snapshot.docs.forEach(docSnap => {
        const item = { id: docSnap.id, ...docSnap.data() } as any;
        if (item.type && newInfra[item.type as keyof Infrastructure] && !item.isDeleted) {
          const type = item.type as keyof Infrastructure;
          const { type: _, ...itemWithoutType } = item;
          newInfra[type].push(itemWithoutType as InfrastructureItem);
        }
      });
      setLocalState(s => ({ ...s, infrastructure: newInfra }));
    });

    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
      setLocalState(s => ({ ...s, schedules }));
    });

    return () => {
      unsubAgents();
      unsubInfra();
      unsubSchedules();
    };
  }, []);

  const addAgent = (
    name: string, 
    telefono?: string, 
    legajo?: string, 
    turno?: 1 | 2 | 3 | 4,
    hasLicense?: boolean,
    licenseType?: 'auto' | 'moto' | 'ambas',
    licenseCategory?: 'comun' | 'profesional',
    licenseExpiration?: string,
    hasDAEO?: boolean,
    daeoExpiration?: string,
    domicilio?: string,
    marcaChaleco?: string,
    modeloChaleco?: string,
    nroSerieChaleco?: string,
    marcaArmamento?: string,
    modeloArmamento?: string,
    nroSerieArmamento?: string,
    jerarquia?: string,
    escalafon?: string
  ) => {
    const id = Date.now().toString();
    const newAgent = { 
      id, name, telefono, legajo, turno: turno || 1,
      hasLicense, licenseType, licenseCategory, licenseExpiration,
      hasDAEO, daeoExpiration,
      domicilio,
      marcaChaleco,
      modeloChaleco,
      nroSerieChaleco,
      marcaArmamento,
      modeloArmamento,
      nroSerieArmamento,
      jerarquia,
      escalafon
    };
    setDoc(doc(db, 'agents', id), newAgent).catch(console.error);
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    updateDoc(doc(db, 'agents', id), updates).catch(console.error);
  };

  const removeAgent = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'agents', id));
      
      const schedulesToRemove = state.schedules.filter(sch => sch.agentId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const addInfra = (type: keyof Infrastructure, item: Omit<InfrastructureItem, 'id'>) => {
    const id = Date.now().toString();
    setDoc(doc(db, 'infrastructure', id), { ...item, type, id }).catch(console.error);
  };
  
  const removeInfra = async (type: keyof Infrastructure, id: string) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'infrastructure', id));
      
      const schedulesToRemove = state.schedules.filter(sch => sch.targetId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const updateInfra = (type: keyof Infrastructure, id: string, updates: Partial<InfrastructureItem>) => {
    updateDoc(doc(db, 'infrastructure', id), updates).catch(console.error);
  };

  const assignAgent = (agentId: string, shift: Shift, role: RoleType, targetId?: string, startTime?: string, endTime?: string, scheduleIdToMove?: string) => {
    let defStart = '09:00';
    let defEnd = '21:00';
    if (shift === 'turno2' || shift === 'turno4') { defStart = '21:00'; defEnd = '09:00'; }

    const st = startTime || defStart;
    const et = endTime || defEnd;
    const isStandard = (st === '09:00' && et === '21:00') || (st === '21:00' && et === '09:00');

    const batch = writeBatch(db);

    if (scheduleIdToMove) {
      batch.delete(doc(db, 'schedules', scheduleIdToMove));
    } else if (isStandard) {
      const stdSchedules = state.schedules.filter(sch => {
        if (sch.agentId !== agentId || sch.shift !== shift) return false;
        return (sch.startTime === '09:00' && sch.endTime === '21:00') || (sch.startTime === '21:00' && sch.endTime === '09:00');
      });
      stdSchedules.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
    }

    if (role === 'jefe' || role === 'segundo_jefe') {
      const existing = state.schedules.filter(sch => sch.role === role);
      existing.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
    }

    if (role !== 'disponible') {
      const newSchId = Date.now().toString();
      const newSch: any = {
        id: newSchId,
        agentId,
        role,
        shift,
        startTime: st,
        endTime: et
      };
      if (targetId !== undefined && targetId !== null && targetId !== '') {
        newSch.targetId = targetId;
      }
      batch.set(doc(db, 'schedules', newSchId), newSch);
    }
    
    batch.commit().catch(console.error);
  };

  const removeSchedule = (id: string) => {
    deleteDoc(doc(db, 'schedules', id)).catch(console.error);
  };

  const clearRoleSchedules = (role: RoleType, shift: Shift) => {
    const batch = writeBatch(db);
    const schedulesToRemove = state.schedules.filter(sch => 
      (sch.role === role || (role === 'movil' && sch.role === 'ofl_control')) && 
      sch.shift === shift
    );
    schedulesToRemove.forEach(sch => {
      batch.delete(doc(db, 'schedules', sch.id));
    });
    batch.commit().catch(console.error);
  };

  const restoreSchedules = (schedules: Schedule[]) => {
    const batch = writeBatch(db);
    schedules.forEach(sch => {
      batch.set(doc(db, 'schedules', sch.id), sch);
    });
    batch.commit().catch(console.error);
  };

  const softRemoveAgent = async (id: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'agents', id), { isDeleted: true });
      
      const schedulesToRemove = state.schedules.filter(sch => sch.agentId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const softRemoveInfra = async (type: keyof Infrastructure, id: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'infrastructure', id), { isDeleted: true });
      
      const schedulesToRemove = state.schedules.filter(sch => sch.targetId === id);
      schedulesToRemove.forEach(sch => {
        batch.delete(doc(db, 'schedules', sch.id));
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const loadState = async (newState: any, targetTurns: number[]) => {
    try {
      const agentsSnapshot = await getDocs(collection(db, 'agents'));
      const infraSnapshot = await getDocs(collection(db, 'infrastructure'));
      const schedSnapshot = await getDocs(collection(db, 'schedules'));
      
      const batch1 = writeBatch(db);
      
      // 1. Eliminar solo los datos de los turnos seleccionados
      agentsSnapshot.docs.forEach(d => {
        const agent = d.data();
        if (agent.turno !== undefined && targetTurns.includes(agent.turno)) {
          batch1.delete(d.ref);
        }
      });
      infraSnapshot.docs.forEach(d => {
        const item = d.data();
        if (item.turno !== undefined && targetTurns.includes(item.turno)) {
          batch1.delete(d.ref);
        }
      });
      schedSnapshot.docs.forEach(d => {
        const sch = d.data();
        const shiftNum = sch.shift ? Number(sch.shift.replace('turno', '')) : null;
        if (shiftNum && targetTurns.includes(shiftNum)) {
          batch1.delete(d.ref);
        }
      });
      
      await batch1.commit();
      
      // 2. Insertar solo los nuevos datos de los turnos seleccionados
      let batch = writeBatch(db);
      let count = 0;
      
      const commitIfNeeded = async () => {
        count++;
        if (count >= 200) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      };
      
      for (const agent of newState.agents) {
        if (agent.turno !== undefined && targetTurns.includes(agent.turno)) {
          const id = agent.id || doc(collection(db, 'agents')).id;
          batch.set(doc(db, 'agents', id), { ...agent, id });
          await commitIfNeeded();
        }
      }
      
      if (Array.isArray(newState.infrastructure)) {
        // Formato: Array plano de ítems de infraestructura
        for (const item of newState.infrastructure) {
          let type = item.type;
          // Normalizar singular a plural si corresponde
          if (type === 'garita') type = 'garitas';
          if (type === 'movil') type = 'moviles';
          if (type === 'moto') type = 'motos';
          if (type === 'qth') type = 'qths';
          if (type === 'orden' || type === 'orden_servicio') type = 'ordenes';
          if (type === 'comision') type = 'comisiones';
          
          if (item.turno !== undefined && targetTurns.includes(item.turno)) {
            const id = item.id || doc(collection(db, 'infrastructure')).id;
            batch.set(doc(db, 'infrastructure', id), { ...item, id, type });
            await commitIfNeeded();
          }
        }
      } else {
        // Formato: Objeto de arrays (estándar)
        const infraKeys = ['garitas', 'moviles', 'motos', 'qths', 'ordenes', 'comisiones'] as const;
        for (const key of infraKeys) {
          const items = newState.infrastructure[key] || [];
          for (const item of items) {
            if (item.turno !== undefined && targetTurns.includes(item.turno)) {
              const id = item.id || doc(collection(db, 'infrastructure')).id;
              batch.set(doc(db, 'infrastructure', id), { ...item, id, type: key });
              await commitIfNeeded();
            }
          }
        }
      }
      
      if (Array.isArray(newState.schedules)) {
        for (const sch of newState.schedules) {
          const shiftNum = sch.shift ? Number(sch.shift.replace('turno', '')) : null;
          if (shiftNum && targetTurns.includes(shiftNum)) {
            const id = sch.id || doc(collection(db, 'schedules')).id;
            batch.set(doc(db, 'schedules', id), { ...sch, id });
            await commitIfNeeded();
          }
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
      
      return true;
    } catch (e) {
      console.error("Error loading imported state:", e);
      throw e;
    }
  };

  return { state, addAgent, updateAgent, removeAgent, softRemoveAgent, softRemoveInfra, addInfra, removeInfra, updateInfra, assignAgent, removeSchedule, clearRoleSchedules, restoreSchedules, loadState };
}
