import React from 'react';
import { ComponentItem, Category, Movement } from '../../types';
import {
  X,
  Cpu,
  Boxes,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Clock,
} from 'lucide-react';

interface ComponentDetailModalProps {
  isOpen: boolean;
  component: ComponentItem | null;
  category: Category | null;
  currentStock: number;
  componentMovements: Movement[];
  onClose: () => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  isOpen,
  component,
  category,
  currentStock,
  componentMovements,
  onClose,
}) => {
  if (!isOpen || !component) return null;

  const isLowStock = currentStock <= component.stockMinimo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                  {component.codigo}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">{category?.nombre}</span>
              </div>
              <h3 className="text-xs text-slate-600 dark:text-slate-400">
                Ficha Técnica & Consulta de Trazabilidad
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Descripción:</p>
          <p className="leading-relaxed">{component.descripcion}</p>
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px] block">Existencias Actuales</span>
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                isLowStock
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {currentStock} {component.unidad}
            </span>
            <span
              className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${
                isLowStock ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {isLowStock ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Bajo Mínimo</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Nivel Óptimo</span>
                </>
              )}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px] block">Stock Mínimo</span>
            <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {component.stockMinimo} {component.unidad}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Umbral de alerta</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px] block">Ubicación Física</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate mt-1">
              {component.ubicacion || 'Lab Central'}
            </span>
            <span className="text-[10px] text-slate-400 block">Bloque técnico</span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 text-[11px] block">Precio Estimado</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white block mt-1">
              ₲ {component.precioReferencial.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">Por {component.unidad}</span>
          </div>
        </div>

        {/* Timestamps & Relational Identifiers */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div>
            <span>ID interno: </span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{component.id}</span>
          </div>
          <div>
            <span>Alta: </span>
            <span>{new Date(component.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span>Última mod: </span>
            <span>{new Date(component.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Movement History for this Component */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Historial de Entradas, Salidas y Reversiones ({componentMovements.length})
            </h4>
            <span className="text-[11px] text-slate-400">Trazabilidad contable</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {componentMovements.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No hay movimientos registrados para este componente.
              </p>
            ) : (
              componentMovements.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs ${
                    m.esRevertido ? 'opacity-50 line-through' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {m.tipo === 'ENTRADA' ? (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : m.tipo === 'SALIDA' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {m.tipo}: {m.cantidad} {component.unidad}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {m.motivo}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                    <div>{m.fecha}</div>
                    <div className="text-[10px]">{m.id}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
