import React, { useState, useMemo } from 'react';
import { AuditRecord } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  BookOpen,
  Info,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface AuditViewProps {
  auditLogs: AuditRecord[];
}

export const AuditView: React.FC<AuditViewProps> = ({ auditLogs }) => {
  const [filterResult, setFilterResult] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filterResult !== 'all' && log.resultado !== filterResult) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAction = log.accion.toLowerCase().includes(q);
        const matchesDetail = log.motivoDetalle.toLowerCase().includes(q);
        const matchesComp = log.codigoComponente?.toLowerCase().includes(q);
        if (!matchesAction && !matchesDetail && !matchesComp) return false;
      }
      return true;
    });
  }, [auditLogs, filterResult, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Auditoría del Sistema & Explicación de Reglas
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Registro formal que muestra al usuario y evaluador por qué cada operación se acepta o se rechaza
        </p>
      </div>

      {/* Rules Explanatory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rule 1 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Info className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">1. Cálculo de Existencias</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Las existencias se computan dinámicamente:
            <code className="block mt-1 font-mono text-[11px] p-1.5 bg-slate-100 dark:bg-slate-800 rounded">
              Stock = ∑ Entradas - ∑ Salidas ± Reversiones
            </code>
          </p>
        </div>

        {/* Rule 2 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <XCircle className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">2. Rechazo de Stock Negativo</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Se rechaza tajantemente cualquier salida cuya cantidad supere las existencias disponibles en el momento.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">3. Cantidades Positivas</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Se rechazan cantidades $\le 0$, nulas o no enteras. Toda transacción física debe ser estrictamente positiva.
          </p>
        </div>

        {/* Rule 4 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">4. Reversión Trazable</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Los movimientos erróneos no se destruyen: se genera un movimiento de reversión vinculado con auditoría completa.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en auditoría o componentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas las decisiones</option>
            <option value="ACEPTADA">✓ Solo Aceptadas</option>
            <option value="RECHAZADA">✕ Solo Rechazadas</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono tabular-nums self-end sm:self-auto">
          {filteredLogs.length} registros auditados
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No se encontraron registros de auditoría coincidentes.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isAccepted = log.resultado === 'ACEPTADA';
              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isAccepted ? (
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                          {log.accion}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}
                        >
                          {log.resultado}
                        </span>
                        {log.codigoComponente && (
                          <>
                            <span aria-hidden="true" className="text-slate-400">·</span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {log.codigoComponente}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          Rol: {log.rolUsuario}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {log.motivoDetalle}
                      </p>
                    </div>
                  </div>

                  <div className="font-mono text-slate-400 text-right shrink-0 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('es-PY', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
