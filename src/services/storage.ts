import { Category, ComponentItem, Movement, AuditRecord, ContactTicket, UserRole } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COMPONENTS,
  INITIAL_MOVEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CONTACT_TICKETS,
} from '../data/initialData';

const STORAGE_KEYS = {
  CATEGORIES: 'asuncion_escalada_categories_v1',
  COMPONENTS: 'asuncion_escalada_components_v1',
  MOVEMENTS: 'asuncion_escalada_movements_v1',
  AUDIT: 'asuncion_escalada_audit_v1',
  TICKETS: 'asuncion_escalada_tickets_v1',
  ROLE: 'asuncion_escalada_role_v1',
};

export const getStoredCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  saveStoredCategories(INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
};

export const saveStoredCategories = (cats: Category[]) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
};

export const getStoredComponents = (): ComponentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPONENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  saveStoredComponents(INITIAL_COMPONENTS);
  return INITIAL_COMPONENTS;
};

export const saveStoredComponents = (comps: ComponentItem[]) => {
  localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(comps));
};

export const getStoredMovements = (): Movement[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  saveStoredMovements(INITIAL_MOVEMENTS);
  return INITIAL_MOVEMENTS;
};

export const saveStoredMovements = (movs: Movement[]) => {
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movs));
};

export const getStoredAuditLogs = (): AuditRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  saveStoredAuditLogs(INITIAL_AUDIT_LOGS);
  return INITIAL_AUDIT_LOGS;
};

export const saveStoredAuditLogs = (logs: AuditRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs));
};

export const getStoredTickets = (): ContactTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  saveStoredTickets(INITIAL_CONTACT_TICKETS);
  return INITIAL_CONTACT_TICKETS;
};

export const saveStoredTickets = (tickets: ContactTicket[]) => {
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
};

export const getStoredRole = (): UserRole => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (raw === 'admin' || raw === 'consulta') return raw;
  } catch (e) {
    console.error(e);
  }
  return 'admin';
};

export const saveStoredRole = (role: UserRole) => {
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
};

export const resetToInitialData = () => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(INITIAL_COMPONENTS));
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_CONTACT_TICKETS));
};

/**
 * Cálculo del stock actual de un componente basándose en su historial de movimientos.
 * Regla:
 * - ENTRADA: suma cantidad
 * - SALIDA: resta cantidad
 * - REVERSION: si revierte una ENTRADA -> resta cantidad; si revierte una SALIDA -> suma cantidad
 */
export const calculateComponentStock = (
  componentId: string,
  movements: Movement[]
): number => {
  const movMap = new Map<string, Movement>();
  movements.forEach((m) => movMap.set(m.id, m));

  let stock = 0;
  for (const m of movements) {
    if (m.componenteId !== componentId) continue;

    if (m.tipo === 'ENTRADA') {
      stock += m.cantidad;
    } else if (m.tipo === 'SALIDA') {
      stock -= m.cantidad;
    } else if (m.tipo === 'REVERSION') {
      if (m.movimientoRevertidoId) {
        const original = movMap.get(m.movimientoRevertidoId);
        if (original) {
          if (original.tipo === 'ENTRADA') {
            stock -= m.cantidad;
          } else if (original.tipo === 'SALIDA') {
            stock += m.cantidad;
          }
        }
      }
    }
  }

  return Math.max(0, stock);
};

export interface ValidationResult {
  valid: boolean;
  message: string;
  ruleCode: 'NON_POSITIVE_QUANTITY' | 'NEGATIVE_STOCK' | 'INVALID_REVERSION' | 'ALREADY_REVERTED' | 'PERMISSION_DENIED' | 'SUCCESS';
}

/**
 * Valida un movimiento antes de registrarlo.
 * Reglas solicitadas en la consigna:
 * 1. Cantidades no positivas -> rechazar
 * 2. Salidas que generen stock negativo -> rechazar
 * 3. Notificar motivo detallado
 */
export const validateNewMovement = (
  tipo: 'ENTRADA' | 'SALIDA',
  cantidad: number,
  currentStock: number,
  componentCode: string,
  role: UserRole
): ValidationResult => {
  if (role !== 'admin') {
    return {
      valid: false,
      message: 'Permiso denegado: El usuario con rol de Consulta solo tiene autorización de lectura. Para operar movimientos cambie al modo Administrador.',
      ruleCode: 'PERMISSION_DENIED',
    };
  }

  if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) {
    return {
      valid: false,
      message: `Operación rechazada: La cantidad ingresada (${cantidad}) no es un entero positivo válido. Las reglas del proyecto exigen cantidades estrictamente mayores a 0.`,
      ruleCode: 'NON_POSITIVE_QUANTITY',
    };
  }

  if (tipo === 'SALIDA') {
    if (cantidad > currentStock) {
      return {
        valid: false,
        message: `Operación rechazada: Se intentó dar salida a ${cantidad} unidades de "${componentCode}", pero el stock actual disponible es únicamente de ${currentStock} unidades. Las reglas del proyecto impiden saldos negativos.`,
        ruleCode: 'NEGATIVE_STOCK',
      };
    }
  }

  const nuevoStock = tipo === 'ENTRADA' ? currentStock + cantidad : currentStock - cantidad;
  return {
    valid: true,
    message: `Operación aceptada: Se registrará ${tipo} de ${cantidad} unidades para "${componentCode}". Stock resultante estimado: ${nuevoStock} unidades.`,
    ruleCode: 'SUCCESS',
  };
};

/**
 * Valida la reversión de un movimiento con trazabilidad.
 */
export const validateReversion = (
  movementToRevert: Movement,
  currentStock: number,
  componentCode: string,
  role: UserRole
): ValidationResult => {
  if (role !== 'admin') {
    return {
      valid: false,
      message: 'Permiso denegado: Solo el Administrador puede ejecutar la reversión trazable de un movimiento.',
      ruleCode: 'PERMISSION_DENIED',
    };
  }

  if (movementToRevert.tipo === 'REVERSION') {
    return {
      valid: false,
      message: 'Operación rechazada: No se puede revertir un movimiento que ya es en sí una reversión de seguridad.',
      ruleCode: 'INVALID_REVERSION',
    };
  }

  if (movementToRevert.esRevertido) {
    return {
      valid: false,
      message: `Operación rechazada: El movimiento ${movementToRevert.id} ya se encuentra marcado como revertido en el historial trazable.`,
      ruleCode: 'ALREADY_REVERTED',
    };
  }

  // Si se revierte una ENTRADA, el stock disminuirá en esa cantidad
  if (movementToRevert.tipo === 'ENTRADA') {
    if (currentStock - movementToRevert.cantidad < 0) {
      return {
        valid: false,
        message: `Operación rechazada: Revertir la entrada ${movementToRevert.id} (${movementToRevert.cantidad} unidades) generaría un saldo negativo en el inventario actual (${currentStock} disponible), debido a salidas posteriores que consumieron dichas existencias.`,
        ruleCode: 'NEGATIVE_STOCK',
      };
    }
  }

  return {
    valid: true,
    message: `Operación aceptada: La reversión trazable del movimiento ${movementToRevert.id} es legal y restaurará el balance del inventario sin alterar la integridad del histórico.`,
    ruleCode: 'SUCCESS',
  };
};
