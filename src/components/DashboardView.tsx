import React, { useState } from 'react';
import { ComponentItem, Movement, Category, AuditRecord, UserRole } from '../types';
import { calculateComponentStock } from '../services/storage';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  components: ComponentItem[];
  movements: Movement[];
  categories: Category[];
  auditLogs: AuditRecord[];
  role: UserRole;
  onNavigateToInventory: (filterLowStock?: boolean) => void;
  onOpenNewMovement: (componentId?: string, defaultType?: 'ENTRADA' | 'SALIDA') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  components,
  movements,
  categories,
  auditLogs,
  role,
  onNavigateToInventory,
  onOpenNewMovement,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'all' | '30days' | '7days'>('30days');

  // Compute stock for all components
  const componentsWithStock = components.map((comp) => {
    const stock = calculateComponentStock(comp.id, movements);
    const category = categories.find((c) => c.id === comp.categoriaId);
    return {
      ...comp,
      stock,
      categoryName: category?.nombre || 'Sin categoría',
      isLowStock: stock <= comp.stockMinimo,
      deficit: Math.max(0, comp.stockMinimo - stock),
    };
  });

  const totalStockUnits = componentsWithStock.reduce((acc, c) => acc + c.stock, 0);
  const lowStockComponents = componentsWithStock.filter((c) => c.isLowStock);

  // Filter movements by selected period
  const now = new Date();
  const filteredMovements = movements.filter((m) => {
    if (periodFilter === 'all') return true;
    const movDate = new Date(m.fecha);
    const diffDays = (now.getTime() - movDate.getTime()) / (1000 * 3600 * 24);
    if (periodFilter === '7days') return diffDays <= 7;
    if (periodFilter === '30days') return diffDays <= 30;
    return true;
  });

  const totalSalidasPeriodo = filteredMovements
    .filter((m) => m.tipo === 'SALIDA')
    .reduce((acc, m) => acc + m.cantidad, 0);

  const totalEntradasPeriodo = filteredMovements
    .filter((m) => m.tipo === 'ENTRADA')
    .reduce((acc, m) => acc + m.cantidad, 0);

  // Group stock by category
  const categoryStats = categories.map((cat) => {
    const comps = componentsWithStock.filter((c) => c.categoriaId === cat.id);
    const units = comps.reduce((acc, c) => acc + c.stock, 0);
    const count = comps.length;
    return {
      id: cat.id,
      name: cat.nombre,
      units,
      count,
    };
  }).filter((c) => c.count > 0);

  const maxCategoryUnits = Math.max(...categoryStats.map((c) => c.units), 1);

  return (
    <div className="space-y-6">
      {/* Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Panel de Control del Inventario
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resumen en tiempo real de existencias, componentes críticos y flujo de materiales
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setPeriodFilter('7days')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              periodFilter === '7days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('30days')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              periodFilter === '30days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Últimos 30 días
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              periodFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todo el histórico
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Existencias */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Existencias Totales
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalStockUnits.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{components.length} ítems catalogados</span>
              <span aria-hidden="true">·</span>
              <span>8 categorías</span>
            </div>
          </div>
        </div>

        {/* Card 2: Componentes Bajo Mínimo */}
        <div
          onClick={() => onNavigateToInventory(true)}
          className={`p-5 rounded-xl border shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
            lowStockComponents.length > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-300'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Bajo Stock Mínimo</span>
            </span>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {lowStockComponents.length}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 mt-1 flex items-center justify-between">
              <span>Requieren reposición</span>
              <span className="underline font-medium">Ver en inventario →</span>
            </div>
          </div>
        </div>

        {/* Card 3: Salidas del Período */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Salidas del Período
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {totalSalidasPeriodo.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Para prácticas de laboratorio</span>
            </div>
          </div>
        </div>

        {/* Card 4: Entradas del Período */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Entradas del Período
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {totalEntradasPeriodo.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Reposiciones y adquisiciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Critical Stock Alerts + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Componentes bajo mínimo con acción rápida */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Componentes con Stock Crítico (≤ Mínimo)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToInventory(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Ver todos ({lowStockComponents.length})
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockComponents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p>Todos los componentes tienen existencias superiores a su stock mínimo.</p>
              </div>
            ) : (
              lowStockComponents.slice(0, 5).map((comp) => (
                <div key={comp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {comp.codigo}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 truncate">{comp.categoryName}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                      {comp.descripcion}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Stock actual: {comp.stock} {comp.unidad}
                      </span>
                      <span>·</span>
                      <span>Mínimo: {comp.stockMinimo} {comp.unidad}</span>
                    </div>
                  </div>

                  {role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => onOpenNewMovement(comp.id, 'ENTRADA')}
                      className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Reabastecer</span>
                    </button>
                  ) : (
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-medium shrink-0">
                      Déficit: -{comp.deficit}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Categorías & Distribución de Existencias */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Distribución de Existencias por Categoría
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {totalStockUnits} unidades en total
            </span>
          </div>

          <div className="mt-3 space-y-3.5">
            {categoryStats.map((cat) => {
              const percentage = Math.round((cat.units / (totalStockUnits || 1)) * 100);
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {cat.units.toLocaleString()} u. ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${(cat.units / maxCategoryUnits) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Business Rules Audit Panel: Explaining Why Operations are Accepted or Rejected */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Auditoría y Validación de Reglas de Negocio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Muestra al usuario por qué una operación se acepta o se rechaza en el sistema
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {auditLogs.length} eventos registrados
          </span>
        </div>

        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {auditLogs.slice(0, 4).map((log) => {
            const isAccepted = log.resultado === 'ACEPTADA';
            return (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  {isAccepted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.accion}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span
                        className={`font-semibold ${
                          isAccepted
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {log.resultado}
                      </span>
                      {log.codigoComponente && (
                        <>
                          <span aria-hidden="true" className="text-slate-400">·</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            {log.codigoComponente}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {log.motivoDetalle}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 text-right shrink-0 font-mono text-[11px]">
                  {new Date(log.timestamp).toLocaleDateString('es-PY', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
