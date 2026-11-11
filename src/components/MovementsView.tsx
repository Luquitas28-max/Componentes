import React, { useState, useMemo } from 'react';
import { Movement, ComponentItem, UserRole } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface MovementsViewProps {
  movements: Movement[];
  components: ComponentItem[];
  role: UserRole;
  onOpenNewMovement: () => void;
  onOpenReversionModal: (mov: Movement) => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  components,
  role,
  onOpenNewMovement,
  onOpenReversionModal,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterComponentId, setFilterComponentId] = useState<string>('all');
  const [searchMotivo, setSearchMotivo] = useState<string>('');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Component lookup map
  const componentMap = useMemo(() => {
    const map = new Map<string, ComponentItem>();
    components.forEach((c) => map.set(c.id, c));
    return map;
  }, [components]);

  // Movement map for linking reversions
  const movementMap = useMemo(() => {
    const map = new Map<string, Movement>();
    movements.forEach((m) => map.set(m.id, m));
    return map;
  }, [movements]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      // Filter by type
      if (filterType !== 'all' && mov.tipo !== filterType) {
        return false;
      }

      // Filter by component
      if (filterComponentId !== 'all' && mov.componenteId !== filterComponentId) {
        return false;
      }

      // Filter by search motif or id or responsable
      if (searchMotivo.trim()) {
        const q = searchMotivo.toLowerCase().trim();
        const comp = componentMap.get(mov.componenteId);
        const matchesMotivo = mov.motivo.toLowerCase().includes(q);
        const matchesId = mov.id.toLowerCase().includes(q);
        const matchesResp = mov.responsable.toLowerCase().includes(q);
        const matchesCode = comp?.codigo.toLowerCase().includes(q);
        if (!matchesMotivo && !matchesId && !matchesResp && !matchesCode) {
          return false;
        }
      }

      // Date range filter
      if (dateStart && mov.fecha < dateStart) return false;
      if (dateEnd && mov.fecha > dateEnd) return false;

      return true;
    });
  }, [movements, filterType, filterComponentId, searchMotivo, dateStart, dateEnd, componentMap]);

  // Sort descending by date & created
  const sortedMovements = useMemo(() => {
    return [...filteredMovements].sort((a, b) => {
      return new Date(b.createdAt || b.fecha).getTime() - new Date(a.createdAt || a.fecha).getTime();
    });
  }, [filteredMovements]);

  // Pagination
  const totalItems = sortedMovements.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const currentItems = sortedMovements.slice(startIndex, startIndex + pageSize);

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterComponentId('all');
    setSearchMotivo('');
    setDateStart('');
    setDateEnd('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Registro de Movimientos & Trazabilidad
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de entradas, salidas de laboratorio y reversiones trazables auditadas
          </p>
        </div>

        {role === 'admin' ? (
          <button
            type="button"
            onClick={onOpenNewMovement}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            Modo Consulta: Historial de solo lectura
          </div>
        )}
      </div>

      {/* Rules Notice Callout */}
      <div className="p-4 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 dark:text-white">
            Reglas de Trazabilidad del Proyecto:
          </span>
          <p>
            1. <strong>Existencias:</strong> Calculadas estrictamente desde la sumatoria de Entradas y deducción de Salidas.
            <br />
            2. <strong>Control anti-negativo:</strong> Se rechaza toda salida que supere las unidades disponibles o cantidades $\le 0$.
            <br />
            3. <strong>Reversión Trazable:</strong> Los movimientos no se borran; se genera un contra-movimiento de tipo REVERSIÓN vinculado al original para garantizar la integridad contable.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Motif / ID */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por motivo, ID o responsable..."
              value={searchMotivo}
              onChange={(e) => {
                setSearchMotivo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tipo: Todos los movimientos</option>
              <option value="ENTRADA">⬇ Solo Entradas (+)</option>
              <option value="SALIDA">⬆ Solo Salidas (-)</option>
              <option value="REVERSION">↺ Solo Reversiones</option>
            </select>
          </div>

          {/* Filter Component */}
          <div>
            <select
              value={filterComponentId}
              onChange={(e) => {
                setFilterComponentId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 truncate"
            >
              <option value="all">Todos los componentes</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.descripcion.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => {
                setDateStart(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white text-xs"
            />
            <span>a</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => {
                setDateEnd(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span className="font-mono tabular-nums">
            {filteredMovements.length} movimientos encontrados
          </span>
          {(filterType !== 'all' || filterComponentId !== 'all' || searchMotivo || dateStart || dateEnd) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Componente</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-right">Cantidad</th>
                <th className="py-3 px-4">Motivo / Práctica</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4 text-right">Trazabilidad / Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No hay movimientos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                currentItems.map((mov) => {
                  const comp = componentMap.get(mov.componenteId);
                  const isEntrada = mov.tipo === 'ENTRADA';
                  const isSalida = mov.tipo === 'SALIDA';
                  const isReversion = mov.tipo === 'REVERSION';
                  const isReverted = mov.esRevertido;

                  // Find original if it is a reversion
                  const originalMov = mov.movimientoRevertidoId
                    ? movementMap.get(mov.movimientoRevertidoId)
                    : null;

                  return (
                    <tr
                      key={mov.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                        isReverted ? 'opacity-60 bg-slate-50/30 dark:bg-slate-900/30 line-through-label' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {mov.id}
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono tabular-nums whitespace-nowrap">
                        {mov.fecha}
                      </td>

                      {/* Componente */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="font-mono font-semibold text-slate-900 dark:text-white">
                          {comp ? comp.codigo : 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {comp ? comp.descripcion : 'Componente no encontrado'}
                        </div>
                      </td>

                      {/* Tipo de movimiento */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isEntrada && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>ENTRADA</span>
                          </span>
                        )}
                        {isSalida && (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400 text-xs">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>SALIDA</span>
                          </span>
                        )}
                        {isReversion && (
                          <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-400 text-xs">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>REVERSIÓN</span>
                          </span>
                        )}
                      </td>

                      {/* Cantidad */}
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-sm">
                        <span
                          className={
                            isEntrada
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isSalida
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }
                        >
                          {isEntrada ? `+${mov.cantidad}` : isSalida ? `-${mov.cantidad}` : `↺ ${mov.cantidad}`}
                        </span>
                      </td>

                      {/* Motivo */}
                      <td className="py-3 px-4 min-w-[200px] text-slate-700 dark:text-slate-300">
                        <div>{mov.motivo}</div>
                        {originalMov && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                            ↳ Revierte a: {originalMov.id} ({originalMov.tipo} de {originalMov.cantidad}u.)
                          </div>
                        )}
                      </td>

                      {/* Responsable */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {mov.responsable}
                      </td>

                      {/* Trazabilidad & Acciones */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isReverted ? (
                          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            Revertido en histórico
                          </span>
                        ) : isReversion ? (
                          <span className="text-[11px] font-mono text-slate-400">
                            Registro de ajuste
                          </span>
                        ) : role === 'admin' ? (
                          <button
                            type="button"
                            onClick={() => onOpenReversionModal(mov)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Revertir</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Registrado</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="py-3 px-4 bg-slate-50/75 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Mostrando {totalItems > 0 ? startIndex + 1 : 0} a{' '}
              {Math.min(startIndex + pageSize, totalItems)} de {totalItems} movimientos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-400 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums">
              {validCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-400 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
