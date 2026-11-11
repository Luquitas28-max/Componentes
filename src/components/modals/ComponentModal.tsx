import React, { useState, useEffect } from 'react';
import { ComponentItem, Category } from '../../types';
import { X, Cpu, AlertCircle } from 'lucide-react';

interface ComponentModalProps {
  isOpen: boolean;
  editingComponent: ComponentItem | null;
  categories: Category[];
  existingComponents: ComponentItem[];
  onClose: () => void;
  onSave: (comp: Partial<ComponentItem>) => void;
}

export const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  editingComponent,
  categories,
  existingComponents,
  onClose,
  onSave,
}) => {
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [stockMinimo, setStockMinimo] = useState<number>(10);
  const [ubicacion, setUbicacion] = useState('');
  const [unidad, setUnidad] = useState('unidades');
  const [precioReferencial, setPrecioReferencial] = useState<number>(1000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingComponent) {
      setCodigo(editingComponent.codigo);
      setDescripcion(editingComponent.descripcion);
      setCategoriaId(editingComponent.categoriaId);
      setStockMinimo(editingComponent.stockMinimo);
      setUbicacion(editingComponent.ubicacion);
      setUnidad(editingComponent.unidad);
      setPrecioReferencial(editingComponent.precioReferencial);
    } else {
      setCodigo('');
      setDescripcion('');
      setCategoriaId(categories[0]?.id || '');
      setStockMinimo(15);
      setUbicacion('Gavetero Principal');
      setUnidad('unidades');
      setPrecioReferencial(1000);
    }
    setErrors({});
  }, [editingComponent, categories, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanCodigo = codigo.trim().toUpperCase();
    if (!cleanCodigo) {
      newErrors.codigo = 'El código del componente es obligatorio.';
    } else {
      // Check duplicate code
      const duplicate = existingComponents.find(
        (c) => c.codigo.toUpperCase() === cleanCodigo && c.id !== editingComponent?.id
      );
      if (duplicate) {
        newErrors.codigo = `El código "${cleanCodigo}" ya está asignado a otro componente.`;
      }
    }

    if (!descripcion.trim() || descripcion.trim().length < 5) {
      newErrors.descripcion = 'La descripción debe tener al menos 5 caracteres.';
    }

    if (!categoriaId) {
      newErrors.categoriaId = 'Debe seleccionar una categoría.';
    }

    if (isNaN(stockMinimo) || stockMinimo < 0) {
      newErrors.stockMinimo = 'El stock mínimo debe ser un número mayor o igual a 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: editingComponent ? editingComponent.id : `comp-${Date.now()}`,
      codigo: codigo.trim().toUpperCase(),
      descripcion: descripcion.trim(),
      categoriaId,
      stockMinimo: Number(stockMinimo),
      ubicacion: ubicacion.trim() || 'Laboratorio',
      unidad: unidad.trim() || 'unidades',
      precioReferencial: Number(precioReferencial) || 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingComponent ? 'Modificar Componente' : 'Alta de Nuevo Componente'}
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
          {/* Código & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código Único <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: RES-10K, CAP-100U"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-slate-900 dark:text-white focus:outline-none ${
                  errors.codigo ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
              {errors.codigo && <p className="text-[11px] text-rose-500 mt-1">{errors.codigo}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoría <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaId && <p className="text-[11px] text-rose-500 mt-1">{errors.categoriaId}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción Técnica <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Resistencia de carbón 10kΩ 1/4W 5%..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white focus:outline-none ${
                errors.descripcion ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
              }`}
            />
            {errors.descripcion && <p className="text-[11px] text-rose-500 mt-1">{errors.descripcion}</p>}
          </div>

          {/* Stock Mínimo & Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stock Mínimo (Alerta) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.stockMinimo && <p className="text-[11px] text-rose-500 mt-1">{errors.stockMinimo}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unidad de Medida
              </label>
              <input
                type="text"
                placeholder="unidades, módulos, placas"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Precio Ref. (₲)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={precioReferencial}
                onChange={(e) => setPrecioReferencial(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ubicación Física en Laboratorio
            </label>
            <input
              type="text"
              placeholder="Ej: Gavetero R-01, Estante 2, Armario M-03"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              {editingComponent ? 'Guardar Cambios' : 'Registrar Componente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
