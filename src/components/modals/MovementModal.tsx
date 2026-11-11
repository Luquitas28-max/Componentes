import React, { useState, useEffect } from 'react';
import { ComponentItem, Movement, UserRole } from '../../types';
import { calculateComponentStock, validateNewMovement } from '../../services/storage';
import { X, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface MovementModalProps {
  isOpen: boolean;
  components: ComponentItem[];
  movements: Movement[];
  defaultComponentId?: string;
  defaultType?: 'ENTRADA' | 'SALIDA';
  role: UserRole;
  onClose: () => void;
  onSubmit: (data: {
    componenteId: string;
    tipo: 'ENTRADA' | 'SALIDA';
    cantidad: number;
    fecha: string;
    motivo: string;
    responsable: string;
  }) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  components,
  movements,
  defaultComponentId,
  defaultType = 'ENTRADA',
  role,
  onClose,
  onSubmit,
}) => {
  const [componenteId, setComponenteId] = useState('');
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [cantidad, setCantidad] = useState<string>('10');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState('');
  const [responsable, setResponsable] = useState('Lucas Lugo (Auxiliar de Lab)');

  useEffect(() => {
    if (defaultComponentId) {
      setComponenteId(defaultComponentId);
    } else if (components.length > 0 && !componenteId) {
      setComponenteId(components[0].id);
    }
    if (defaultType) {
      setTipo(defaultType);
    }
  }, [defaultComponentId, defaultType, components, isOpen]);

  if (!isOpen) return null;

  const selectedComponent = components.find((c) => c.id === componenteId);
  const currentStock = selectedComponent
    ? calculateComponentStock(selectedComponent.id, movements)
    : 0;

  const numCantidad = parseInt(cantidad, 10);

  // Live evaluation of business rules
  const validation = validateNewMovement(
    tipo,
    numCantidad,
    currentStock,
    selectedComponent?.codigo || 'Componente',
    role
  );

  const projectedStock = isNaN(numCantidad)
    ? currentStock
    : tipo === 'ENTRADA'
    ? currentStock + numCantidad
    : currentStock - numCantidad;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) {
      return;
    }

    onSubmit({
      componenteId,
      tipo,
      cantidad: numCantidad,
      fecha: fecha || new Date().toISOString().split('T')[0],
      motivo: motivo.trim() || (tipo === 'ENTRADA' ? 'Reposición de material' : 'Práctica de laboratorio'),
      responsable: responsable.trim() || 'Encargado de Laboratorio',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {tipo === 'ENTRADA' ? (
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-lg">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-lg">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            )}
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Registrar Movimiento de Inventario
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tipo de Movimiento Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Operación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo('ENTRADA')}
                className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                  tipo === 'ENTRADA'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>ENTRADA (Aumento)</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('SALIDA')}
                className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                  tipo === 'SALIDA'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>SALIDA (Consumo)</span>
              </button>
            </div>
          </div>

          {/* Componente Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Componente Electrónico <span className="text-rose-500">*</span>
            </label>
            <select
              value={componenteId}
              onChange={(e) => setComponenteId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {components.map((c) => {
                const stock = calculateComponentStock(c.id, movements);
                return (
                  <option key={c.id} value={c.id}>
                    {c.codigo} — {c.descripcion.substring(0, 45)} (Stock: {stock} {c.unidad})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Cantidad & Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cantidad de Unidades <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha de Operación <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Motivo & Responsable */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Motivo o Justificación <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={
                tipo === 'ENTRADA'
                  ? 'Ej: Compra de lote oficial MEC, donación egresados'
                  : 'Ej: Práctica 04 de Circuitos Integrados - 2do Curso Turno Mañana'
              }
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Responsable / Solicitante
            </label>
            <input
              type="text"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Real-time Business Rule Evaluation Card */}
          <div
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              validation.valid
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                {validation.valid ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>Estado de Validación: {validation.valid ? 'Aceptada' : 'Rechazada'}</span>
              </span>
              <span className="font-mono tabular-nums text-[11px]">
                Stock: {currentStock} → {projectedStock} u.
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {validation.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!validation.valid}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Confirmar {tipo}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
