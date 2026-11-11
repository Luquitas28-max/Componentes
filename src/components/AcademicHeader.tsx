import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Eye, Sun, Moon, RotateCcw, Cpu, GraduationCap, Award } from 'lucide-react';

interface AcademicHeaderProps {
  role: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
}

export const AcademicHeader: React.FC<AcademicHeaderProps> = ({
  role,
  onRoleChange,
  isDark,
  onToggleTheme,
  onResetData,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Academic Banner */}
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold tracking-wide uppercase text-indigo-300">
                Colegio Nacional EMD Asunción Escalada
              </span>
              <div className="text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-white">Proyecto individual 08</span>
                <span aria-hidden="true">·</span>
                <span>Inventario de componentes</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-white">LUGO IRALA, LUCAS ALFREDO</span>
            </div>
            <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
            <span>2° Curso · 3ª Sección · Turno Mañana</span>
            <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>SW 8 pts · HW 8 pts · Lab 8 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher & Controls Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Control de Stock y Trazabilidad
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Laboratorio de Electrónica & Hardware
            </p>
          </div>
        </div>

        {/* Controls: Role Switch, Dark mode, Reset */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Role selector pill */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              type="button"
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                role === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrador</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('consulta')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                role === 'consulta'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Solo Consulta</span>
            </button>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Cambiar tema claro/oscuro"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={onResetData}
            title="Restablecer datos de muestra del colegio"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
