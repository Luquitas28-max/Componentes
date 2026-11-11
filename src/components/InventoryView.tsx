import React, { useState, useMemo } from 'react';
import { ComponentItem, Category, Movement, UserRole } from '../types';
import { calculateComponentStock } from '../services/storage';
import {
  Search,
  Filter,
  X,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface InventoryViewProps {
  components: ComponentItem[];
  categories: Category[];
  movements: Movement[];
  role: UserRole;
  initialLowStockFilter?: boolean;
  onOpenCreateModal: () => void;
  onOpenEditModal: (comp: ComponentItem) => void;
  onDeleteComponent: (comp: ComponentItem, currentStock: number) => void;
  onViewComponentDetail: (comp: ComponentItem, currentStock: number) => void;
  onOpenNewMovement: (componentId: string, defaultType: 'ENTRADA' | 'SALIDA') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  components,
  categories,
  movements,
  role,
  initialLowStockFilter = false,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteComponent,
  onViewComponentDetail,
  onOpenNewMovement,
}) => {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'normal'>(
    initialLowStockFilter ? 'low' : 'all'
  );
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('codigo_asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Map category names
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.nombre));
    return map;
  }, [categories]);

  // Compute calculated stocks
  const componentsCalculated = useMemo(() => {
    return components.map((comp) => {
      const stock = calculateComponentStock(comp.id, movements);
      const isLow = stock <= comp.stockMinimo;
      return {
        ...comp,
        currentStock: stock,
        isLowStock: isLow,
        categoryName: categoryMap.get(comp.categoriaId) || 'Sin categoría',
      };
    });
  }, [components, movements, categoryMap]);

  // Combined Filters Logic
  const filteredComponents = useMemo(() => {
    return componentsCalculated.filter((comp) => {
      // 1. Textual Search: code or description
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesCode = comp.codigo.toLowerCase().includes(query);
        const matchesDesc = comp.descripcion.toLowerCase().includes(query);
        const matchesLocation = comp.ubicacion.toLowerCase().includes(query);
        if (!matchesCode && !matchesDesc && !matchesLocation) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && comp.categoriaId !== selectedCategory) {
        return false;
      }

      // 3. Stock Status Filter
      if (stockStatusFilter === 'low' && !comp.isLowStock) return false;
      if (stockStatusFilter === 'normal' && comp.isLowStock) return false;

      // 4. Date Period Filter (Based on created or updated timestamp, or movements in that period)
      if (dateStart || dateEnd) {
        const compDate = comp.updatedAt ? comp.updatedAt.split('T')[0] : comp.createdAt.split('T')[0];
        if (dateStart && compDate < dateStart) return false;
        if (dateEnd && compDate > dateEnd) return false;
      }

      return true;
    });
  }, [componentsCalculated, searchQuery, selectedCategory, stockStatusFilter, dateStart, dateEnd]);

  // Sorting
  const sortedComponents = useMemo(() => {
    return [...filteredComponents].sort((a, b) => {
      switch (sortBy) {
        case 'codigo_asc':
          return a.codigo.localeCompare(b.codigo);
        case 'codigo_desc':
          return b.codigo.localeCompare(a.codigo);
        case 'nombre_asc':
          return a.descripcion.localeCompare(b.descripcion);
        case 'stock_asc':
          return a.currentStock - b.currentStock;
        case 'stock_desc':
          return b.currentStock - a.currentStock;
        case 'stock_minimo':
          return a.stockMinimo - b.stockMinimo;
        default:
          return 0;
      }
    });
  }, [filteredComponents, sortBy]);

  // Pagination Calculation
  const totalItems = sortedComponents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const currentItems = sortedComponents.slice(startIndex, startIndex + pageSize);

  // Check if any filter is active
  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    stockStatusFilter !== 'all' ||
    dateStart !== '' ||
    dateEnd !== '';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStockStatusFilter('all');
    setDateStart('');
    setDateEnd('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Catálogo y Existencias de Componentes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cálculo dinámico de existencias, control de stock mínimo y filtros combinados
          </p>
        </div>

        {role === 'admin' ? (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Componente</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            Modo Consulta: Solo lectura autorizada
          </div>
        )}
      </div>

      {/* Combined Filter Controls Box */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Row 1: Search Query + Quick Category Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Textual Search (Code or Description) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código (ej. RES-10K) o descripción..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="md:col-span-3">
            <select
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value as 'all' | 'low' | 'normal');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="all">Estado: Todos los niveles</option>
              <option value="low">⚠️ Solo Stock Bajo (≤ Mínimo)</option>
              <option value="normal">✓ Stock Óptimo (&gt; Mínimo)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Period + Order + Clear Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-medium">Período:</span>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => {
                  setDateStart(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
              <span>hasta</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => {
                  setDateEnd(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="codigo_asc">Código (A - Z)</option>
                <option value="codigo_desc">Código (Z - A)</option>
                <option value="nombre_asc">Descripción (A - Z)</option>
                <option value="stock_asc">Stock (Menor a Mayor)</option>
                <option value="stock_desc">Stock (Mayor a Menor)</option>
                <option value="stock_minimo">Stock Mínimo</option>
              </select>
            </div>
          </div>

          {/* Active filters count & Clear Button */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {filteredComponents.length} de {components.length} resultados
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md border border-rose-200 dark:border-rose-900/50 transition-colors font-medium"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Components Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descripción del Componente</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Stock Mínimo</th>
                <th className="py-3 px-4 text-center">Existencias</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-medium">No se encontraron componentes con los filtros seleccionados.</p>
                    <p className="text-xs mt-1">Intente limpiar los filtros o realizar una búsqueda más amplia.</p>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-3 px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Limpiar todos los filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentItems.map((comp) => {
                  const isLow = comp.isLowStock;
                  return (
                    <tr
                      key={comp.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {comp.codigo}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 min-w-[220px]">
                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                          {comp.descripcion}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
                          Ref: ₲ {comp.precioReferencial.toLocaleString()} · Unidad: {comp.unidad}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {comp.categoryName}
                      </td>

                      {/* Minimum Stock */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {comp.stockMinimo}
                      </td>

                      {/* Current Calculated Stock with Strict Status Signal */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold text-sm tabular-nums ${
                              isLow
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {comp.currentStock}
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                              isLow
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isLow ? (
                              <>
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Bajo Mínimo</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-2.5 h-2.5" />
                                <span>Óptimo</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {comp.ubicacion || 'Lab Principal'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ficha / Detalle */}
                          <button
                            type="button"
                            onClick={() => onViewComponentDetail(comp, comp.currentStock)}
                            title="Ver ficha técnica e historial"
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {role === 'admin' && (
                            <>
                              {/* Entrada rápida */}
                              <button
                                type="button"
                                onClick={() => onOpenNewMovement(comp.id, 'ENTRADA')}
                                title="Registrar Entrada de stock"
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md transition-colors"
                              >
                                <ArrowDownLeft className="w-4 h-4" />
                              </button>

                              {/* Salida rápida */}
                              <button
                                type="button"
                                onClick={() => onOpenNewMovement(comp.id, 'SALIDA')}
                                title="Registrar Salida para práctica"
                                className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-md transition-colors"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>

                              {/* Editar */}
                              <button
                                type="button"
                                onClick={() => onOpenEditModal(comp)}
                                title="Modificar datos del componente"
                                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Eliminar (Dar de Baja) */}
                              <button
                                type="button"
                                onClick={() => onDeleteComponent(comp, comp.currentStock)}
                                title="Dar de baja componente"
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows-Per-Page Controls */}
        <div className="py-3 px-4 bg-slate-50/75 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white text-xs font-mono"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>por página</span>
            <span aria-hidden="true" className="mx-1">·</span>
            <span>
              Mostrando {totalItems > 0 ? startIndex + 1 : 0} a{' '}
              {Math.min(startIndex + pageSize, totalItems)} de {totalItems} ítems
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono tabular-nums font-medium">
              Página {validCurrentPage} de {totalPages}
            </span>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
