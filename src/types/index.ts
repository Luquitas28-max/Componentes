export type UserRole = 'admin' | 'consulta';

export type MovementType = 'ENTRADA' | 'SALIDA' | 'REVERSION';

export interface Category {
  id: string;
  nombre: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentItem {
  id: string;
  codigo: string;
  descripcion: string;
  categoriaId: string;
  stockMinimo: number;
  ubicacion: string;
  unidad: string;
  precioReferencial: number; // en Guaraníes (₲)
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  componenteId: string;
  tipo: MovementType;
  cantidad: number;
  fecha: string; // YYYY-MM-DD
  motivo: string;
  responsable: string;
  esRevertido?: boolean;
  movimientoRevertidoId?: string; // Trazabilidad: id del movimiento original que se revirtió
  createdAt: string;
  updatedAt: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  accion: string;
  resultado: 'ACEPTADA' | 'RECHAZADA';
  motivoDetalle: string;
  rolUsuario: UserRole;
  codigoComponente?: string;
}

export interface ContactTicket {
  id: string;
  ticketNumero: string;
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  prioridad: 'baja' | 'media' | 'alta';
  mensaje: string;
  fecha: string;
  estado: 'recibido' | 'en_revision' | 'atendido';
}
