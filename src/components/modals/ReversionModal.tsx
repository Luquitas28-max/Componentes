import React, { useState } from 'react';
import { Movement, ComponentItem, UserRole } from '../../types';
import { calculateComponentStock, validateReversion } from '../../services/storage';
import { X, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert, FileClock } from 'lucide-react';

interface ReversionModalProps {
  isOpen: boolean;
  movement: Movement | null;
  component: ComponentItem | null;
  allMovements: Movement[];
  role: UserRole;
  onClose: () => void;
  onConfirmReversion: (movementId: string, motivoReversion: string) => void;
}

export const ReversionModal: React.FC<ReversionModalProps> = ({
  isOpen,
  movement,
  component,
  allMovements,
  role,
  onClose,
  onConfirmReversion,
}) => {
  const [motivoReversion, setMotivoReversion] = useState('');

  if (!isOpen || !movement || !component) return null;

  const currentStock = calculateComponentStock(component.id, allMovements);
  const validation = validateReversion(movement, currentStock, component.codigo, role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) return;
    if (!motivoReversion.trim()) return;

    onConfirmReversion(movement.id, motivoReversion.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <RotateCcw className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reversión Trazable de Movimiento
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
          {/* Movement Details Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                Movimiento: {movement.id}
              </span>
              <span
                className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                  movement.tipo === 'ENTRADA'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {movement.tipo}: {movement.cantidad} {component.unidad}
              </span>
            </div>

            <div className="text-slate-600 dark:text-slate-300">
              <p>
                <strong>Componente:</strong> {component.codigo} — {component.descripcion}
              </p>
              <p className="mt-0.5">
                <strong>Motivo original:</strong> {movement.motivo}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                Fecha: {movement.fecha} · Responsable: {movement.responsable}
              </p>
            </div>
          </div>

          {/* Validation Analysis */}
          <div
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              validation.valid
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {validation.valid ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>Regla del Proyecto: {validation.valid ? 'Aceptada' : 'Rechazada'}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {validation.message}
            </p>
          </div>

          {/* Justification of Reversion */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Motivo Formal de la Reversión <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Indique con claridad la justificación de la corrección (ej: Error en el conteo de la práctica 02, componentes no entregados)..."
              value={motivoReversion}
              onChange={(e) => setMotivoReversion(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Trazability Notice */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-300 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <FileClock className="w-3.5 h-3.5" />
              Principio de Trazabilidad Contable:
            </p>
            <p>
              El registro original permanecerá en el histórico con la marca de &quot;Revertido&quot;. Se creará un nuevo movimiento de tipo REVERSIÓN enlazado por su identificador único.
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
              disabled={!validation.valid || !motivoReversion.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Confirmar Reversión Trazable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
