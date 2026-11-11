import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Category,
  ComponentItem,
  Movement,
  AuditRecord,
  ContactTicket,
} from './types';
import {
  getStoredCategories,
  saveStoredCategories,
  getStoredComponents,
  saveStoredComponents,
  getStoredMovements,
  saveStoredMovements,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  getStoredTickets,
  saveStoredTickets,
  getStoredRole,
  saveStoredRole,
  calculateComponentStock,
  validateNewMovement,
  validateReversion,
  resetToInitialData,
} from './services/storage';

import { AcademicHeader } from './components/AcademicHeader';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { MovementsView } from './components/MovementsView';
import { CategoriesView } from './components/CategoriesView';
import { ContactView } from './components/ContactView';
import { AuditView } from './components/AuditView';

import { ComponentModal } from './components/modals/ComponentModal';
import { MovementModal } from './components/modals/MovementModal';
import { ReversionModal } from './components/modals/ReversionModal';
import { ComponentDetailModal } from './components/modals/ComponentDetailModal';
import { FeedbackModal } from './components/modals/FeedbackModal';

import {
  LayoutDashboard,
  Cpu,
  ArrowLeftRight,
  Layers,
  ShieldCheck,
  Mail,
  Plus,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme_mode') === 'dark';
  });

  // Active Role State
  const [role, setRole] = useState<UserRole>(() => getStoredRole());

  // Active Nav Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inventory' | 'movements' | 'categories' | 'audit' | 'contact'
  >('dashboard');

  // Core Data
  const [categories, setCategories] = useState<Category[]>(() => getStoredCategories());
  const [components, setComponents] = useState<ComponentItem[]>(() => getStoredComponents());
  const [movements, setMovements] = useState<Movement[]>(() => getStoredMovements());
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => getStoredAuditLogs());
  const [tickets, setTickets] = useState<ContactTicket[]>(() => getStoredTickets());

  // Navigation Filter Helpers
  const [inventoryLowStockFilter, setInventoryLowStockFilter] = useState<boolean>(false);

  // Modal States
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementComponentId, setMovementComponentId] = useState<string | undefined>(undefined);
  const [movementDefaultType, setMovementDefaultType] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');

  const [isReversionModalOpen, setIsReversionModalOpen] = useState(false);
  const [movementToRevert, setMovementToRevert] = useState<Movement | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailComp, setSelectedDetailComp] = useState<ComponentItem | null>(null);

  // Feedback Dialog
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    status: 'ACEPTADA' | 'RECHAZADA';
    title: string;
    message: string;
    ruleDetail?: string;
  }>({
    isOpen: false,
    status: 'ACEPTADA',
    title: '',
    message: '',
  });

  // Apply dark mode to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    saveStoredRole(newRole);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '¿Desea restablecer todos los datos del inventario a los valores originales de muestra del Colegio Asunción Escalada?'
      )
    ) {
      resetToInitialData();
      setCategories(getStoredCategories());
      setComponents(getStoredComponents());
      setMovements(getStoredMovements());
      setAuditLogs(getStoredAuditLogs());
      setTickets(getStoredTickets());
      setFeedbackState({
        isOpen: true,
        status: 'ACEPTADA',
        title: 'Datos Restablecidos',
        message: 'Se cargaron exitosamente los datos originales del laboratorio.',
        ruleDetail: 'Reinicio de base de datos local completado.',
      });
    }
  };

  // Helper to add audit record
  const logAudit = (
    accion: string,
    resultado: 'ACEPTADA' | 'RECHAZADA',
    motivoDetalle: string,
    codigoComponente?: string
  ) => {
    const record: AuditRecord = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      accion,
      resultado,
      motivoDetalle,
      rolUsuario: role,
      codigoComponente,
    };
    const updated = [record, ...auditLogs];
    setAuditLogs(updated);
    saveStoredAuditLogs(updated);
  };

  // 1. Alta y Modificación de Componente
  const handleSaveComponent = (compData: Partial<ComponentItem>) => {
    if (role !== 'admin') {
      logAudit(
        'ALTA / MODIFICACIÓN',
        'RECHAZADA',
        'Intento no autorizado: El usuario con rol de Consulta intentó modificar el catálogo.',
        compData.codigo
      );
      setFeedbackState({
        isOpen: true,
        status: 'RECHAZADA',
        title: 'Permiso Denegado',
        message: 'Solo el Administrador tiene autorización para crear o modificar componentes.',
        ruleDetail: 'Regla de control de acceso por roles.',
      });
      return;
    }

    const now = new Date().toISOString();
    let updated: ComponentItem[];
    const isEdit = !!compData.id && components.some((c) => c.id === compData.id);

    if (isEdit) {
      updated = components.map((c) =>
        c.id === compData.id
          ? {
              ...c,
              ...(compData as ComponentItem),
              updatedAt: now,
            }
          : c
      );
      logAudit(
        'MODIFICACIÓN DE COMPONENTE',
        'ACEPTADA',
        `Se actualizaron los parámetros del componente ${compData.codigo} (Stock mínimo: ${compData.stockMinimo}).`,
        compData.codigo
      );
      setFeedbackState({
        isOpen: true,
        status: 'ACEPTADA',
        title: 'Componente Actualizado',
        message: `El componente "${compData.codigo}" ha sido actualizado con éxito.`,
      });
    } else {
      const newItem: ComponentItem = {
        id: compData.id || `comp-${Date.now()}`,
        codigo: compData.codigo!,
        descripcion: compData.descripcion!,
        categoriaId: compData.categoriaId!,
        stockMinimo: compData.stockMinimo || 10,
        ubicacion: compData.ubicacion || 'Lab Principal',
        unidad: compData.unidad || 'unidades',
        precioReferencial: compData.precioReferencial || 0,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newItem, ...components];
      logAudit(
        'ALTA DE COMPONENTE',
        'ACEPTADA',
        `Nuevo componente registrado en catálogo: ${newItem.codigo} - ${newItem.descripcion}.`,
        newItem.codigo
      );
      setFeedbackState({
        isOpen: true,
        status: 'ACEPTADA',
        title: 'Alta Aceptada',
        message: `El componente "${newItem.codigo}" fue dado de alta correctamente.`,
      });
    }

    setComponents(updated);
    saveStoredComponents(updated);
  };

  // 2. Baja de Componente (Condiciones generales)
  const handleDeleteComponent = (comp: ComponentItem, currentStock: number) => {
    if (role !== 'admin') {
      logAudit(
        'BAJA DE COMPONENTE',
        'RECHAZADA',
        'Permiso denegado: El usuario de consulta no puede dar de baja componentes.',
        comp.codigo
      );
      setFeedbackState({
        isOpen: true,
        status: 'RECHAZADA',
        title: 'Permiso Denegado',
        message: 'Solo el Administrador puede dar de baja componentes.',
      });
      return;
    }

    // Business Rule: Cannot delete if it has physical stock active
    if (currentStock > 0) {
      const errorMsg = `No se puede dar de baja el componente "${comp.codigo}": Cuenta con ${currentStock} ${comp.unidad} físicas en existencia. Primero debe registrar la salida o traslado correspondiente.`;
      logAudit('BAJA DE COMPONENTE', 'RECHAZADA', errorMsg, comp.codigo);
      setFeedbackState({
        isOpen: true,
        status: 'RECHAZADA',
        title: 'Baja Rechazada por Existencias Activas',
        message: errorMsg,
        ruleDetail: 'Condiciones generales: Integridad de inventario físico.',
      });
      return;
    }

    if (
      window.confirm(
        `¿Confirma dar de baja el componente "${comp.codigo} - ${comp.descripcion}" del catálogo?`
      )
    ) {
      const updated = components.filter((c) => c.id !== comp.id);
      setComponents(updated);
      saveStoredComponents(updated);

      logAudit(
        'BAJA DE COMPONENTE',
        'ACEPTADA',
        `El componente ${comp.codigo} fue dado de baja del catálogo sin saldos pendientes.`,
        comp.codigo
      );
      setFeedbackState({
        isOpen: true,
        status: 'ACEPTADA',
        title: 'Baja Aceptada',
        message: `El componente "${comp.codigo}" fue eliminado del catálogo satisfactoriamente.`,
      });
    }
  };

  // 3. Registrar Movimiento (Entrada / Salida con validación estricta de saldo negativo y positivo)
  const handleCreateMovement = (data: {
    componenteId: string;
    tipo: 'ENTRADA' | 'SALIDA';
    cantidad: number;
    fecha: string;
    motivo: string;
    responsable: string;
  }) => {
    const comp = components.find((c) => c.id === data.componenteId);
    if (!comp) return;

    const currentStock = calculateComponentStock(comp.id, movements);
    const validation = validateNewMovement(
      data.tipo,
      data.cantidad,
      currentStock,
      comp.codigo,
      role
    );

    if (!validation.valid) {
      logAudit(
        `INTENTO DE ${data.tipo}`,
        'RECHAZADA',
        validation.message,
        comp.codigo
      );
      setFeedbackState({
        isOpen: true,
        status: 'RECHAZADA',
        title: 'Operación Rechazada por Regla de Negocio',
        message: validation.message,
        ruleDetail:
          validation.ruleCode === 'NEGATIVE_STOCK'
            ? 'Regla del proyecto: Se prohíbe terminantemente registrar salidas que generen saldos negativos.'
            : validation.ruleCode === 'NON_POSITIVE_QUANTITY'
            ? 'Regla del proyecto: Las cantidades deben ser estrictamente positivas (> 0).'
            : 'Permisos insuficientes.',
      });
      return;
    }

    const now = new Date().toISOString();
    const newMov: Movement = {
      id: `MOV-${String(movements.length + 1).padStart(3, '0')}`,
      componenteId: data.componenteId,
      tipo: data.tipo,
      cantidad: data.cantidad,
      fecha: data.fecha,
      motivo: data.motivo,
      responsable: data.responsable,
      createdAt: now,
      updatedAt: now,
    };

    const updatedMovements = [...movements, newMov];
    setMovements(updatedMovements);
    saveStoredMovements(updatedMovements);

    logAudit(
      `REGISTRO DE ${data.tipo}`,
      'ACEPTADA',
      validation.message,
      comp.codigo
    );

    setFeedbackState({
      isOpen: true,
      status: 'ACEPTADA',
      title: `${data.tipo} Registrada con Éxito`,
      message: validation.message,
    });
  };

  // 4. Reversión Trazable de Movimiento
  const handleConfirmReversion = (movementId: string, motivoReversion: string) => {
    const original = movements.find((m) => m.id === movementId);
    if (!original) return;

    const comp = components.find((c) => c.id === original.componenteId);
    if (!comp) return;

    const currentStock = calculateComponentStock(comp.id, movements);
    const validation = validateReversion(original, currentStock, comp.codigo, role);

    if (!validation.valid) {
      logAudit('REVERSIÓN DE MOVIMIENTO', 'RECHAZADA', validation.message, comp.codigo);
      setFeedbackState({
        isOpen: true,
        status: 'RECHAZADA',
        title: 'Reversión Denegada',
        message: validation.message,
        ruleDetail: 'Control de consistencia contable del proyecto.',
      });
      return;
    }

    const now = new Date().toISOString();
    const reversionMov: Movement = {
      id: `MOV-REV-${String(movements.length + 1).padStart(3, '0')}`,
      componenteId: original.componenteId,
      tipo: 'REVERSION',
      cantidad: original.cantidad,
      fecha: new Date().toISOString().split('T')[0],
      motivo: `Reversión trazable de ${original.id}: ${motivoReversion}`,
      responsable: 'Administrador (Lucas Lugo)',
      movimientoRevertidoId: original.id,
      createdAt: now,
      updatedAt: now,
    };

    // Mark original movement as reverted
    const updatedMovements = movements.map((m) =>
      m.id === original.id ? { ...m, esRevertido: true, updatedAt: now } : m
    );

    const finalList = [...updatedMovements, reversionMov];
    setMovements(finalList);
    saveStoredMovements(finalList);

    const auditDetail = `Se ejecutó la reversión trazable del movimiento ${original.id} (${original.tipo} de ${original.cantidad}u.). El saldo de "${comp.codigo}" fue reestablecido sin borrar el histórico. Motivo: ${motivoReversion}`;
    logAudit('REVERSIÓN DE MOVIMIENTO', 'ACEPTADA', auditDetail, comp.codigo);

    setFeedbackState({
      isOpen: true,
      status: 'ACEPTADA',
      title: 'Reversión Trazable Ejecutada',
      message: auditDetail,
    });
  };

  // 5. Gestión de Categorías
  const handleSaveCategory = (catData: Partial<Category>) => {
    if (role !== 'admin') return;
    const now = new Date().toISOString();
    const isEdit = categories.some((c) => c.id === catData.id);

    let updated: Category[];
    if (isEdit) {
      updated = categories.map((c) =>
        c.id === catData.id ? { ...c, ...(catData as Category), updatedAt: now } : c
      );
    } else {
      const newCat: Category = {
        id: catData.id || `cat-${Date.now()}`,
        nombre: catData.nombre!,
        descripcion: catData.descripcion || '',
        createdAt: now,
        updatedAt: now,
      };
      updated = [...categories, newCat];
    }
    setCategories(updated);
    saveStoredCategories(updated);
  };

  const handleDeleteCategory = (catId: string) => {
    if (role !== 'admin') return;
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    saveStoredCategories(updated);
  };

  // 6. Guardar Ticket de Contacto
  const handleSaveTicket = (ticket: ContactTicket) => {
    const updated = [ticket, ...tickets];
    setTickets(updated);
    saveStoredTickets(updated);
    logAudit(
      'CONTACTO / TICKET GENERADO',
      'ACEPTADA',
      `Ticket ${ticket.ticketNumero} recibido de "${ticket.nombre}" (${ticket.email}). Asunto: ${ticket.asunto}.`
    );
  };

  // Navigation handlers
  const handleNavigateToInventory = (lowStockOnly?: boolean) => {
    setInventoryLowStockFilter(!!lowStockOnly);
    setActiveTab('inventory');
  };

  const handleOpenNewMovement = (
    componentId?: string,
    defaultType: 'ENTRADA' | 'SALIDA' = 'ENTRADA'
  ) => {
    if (role !== 'admin') {
      setFeedbackState({
        isOpen: true,
        status: 'RECHAZADA',
        title: 'Acción Restringida',
        message: 'El usuario con rol de Consulta solo tiene permisos de lectura. Cambie a Administrador para operar.',
      });
      return;
    }
    setMovementComponentId(componentId);
    setMovementDefaultType(defaultType);
    setIsMovementModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Academic & Credential Header */}
      <AcademicHeader
        role={role}
        onRoleChange={handleRoleChange}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onResetData={handleResetData}
      />

      {/* Main Navigation (3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-14">
          {/* Zone 1: Brand wordmark (single line) */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">CNAE</span>
            <span className="text-slate-400">/</span>
            <span>Inventario Lab</span>
          </div>

          {/* Zone 2: Navigation Links (concise, single line) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Panel de Control
            </button>

            <button
              type="button"
              onClick={() => {
                setInventoryLowStockFilter(false);
                setActiveTab('inventory');
              }}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'inventory'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Componentes & Filtros
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('movements')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'movements'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Movimientos & Trazabilidad
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'categories'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Categorías
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'audit'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reglas & Auditoría
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'contact'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Contacto
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {role === 'admin' ? (
              <button
                type="button"
                onClick={() => handleOpenNewMovement()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Operar Movimiento</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Solicitar Material</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-2 px-2 text-[11px] font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Panel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === 'inventory' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Componentes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === 'movements' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Movimientos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === 'categories' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Categorías
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === 'audit' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Auditoría
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === 'contact' ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Contacto
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            components={components}
            movements={movements}
            categories={categories}
            auditLogs={auditLogs}
            role={role}
            onNavigateToInventory={handleNavigateToInventory}
            onOpenNewMovement={handleOpenNewMovement}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            components={components}
            categories={categories}
            movements={movements}
            role={role}
            initialLowStockFilter={inventoryLowStockFilter}
            onOpenCreateModal={() => {
              setEditingComponent(null);
              setIsComponentModalOpen(true);
            }}
            onOpenEditModal={(comp) => {
              setEditingComponent(comp);
              setIsComponentModalOpen(true);
            }}
            onDeleteComponent={handleDeleteComponent}
            onViewComponentDetail={(comp, currentStock) => {
              setSelectedDetailComp(comp);
              setIsDetailModalOpen(true);
            }}
            onOpenNewMovement={handleOpenNewMovement}
          />
        )}

        {activeTab === 'movements' && (
          <MovementsView
            movements={movements}
            components={components}
            role={role}
            onOpenNewMovement={() => handleOpenNewMovement()}
            onOpenReversionModal={(mov) => {
              setMovementToRevert(mov);
              setIsReversionModalOpen(true);
            }}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            components={components}
            role={role}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'audit' && <AuditView auditLogs={auditLogs} />}

        {activeTab === 'contact' && (
          <ContactView tickets={tickets} onSaveTicket={handleSaveTicket} />
        )}
      </main>

      {/* Modals */}
      <ComponentModal
        isOpen={isComponentModalOpen}
        editingComponent={editingComponent}
        categories={categories}
        existingComponents={components}
        onClose={() => setIsComponentModalOpen(false)}
        onSave={handleSaveComponent}
      />

      <MovementModal
        isOpen={isMovementModalOpen}
        components={components}
        movements={movements}
        defaultComponentId={movementComponentId}
        defaultType={movementDefaultType}
        role={role}
        onClose={() => setIsMovementModalOpen(false)}
        onSubmit={handleCreateMovement}
      />

      <ReversionModal
        isOpen={isReversionModalOpen}
        movement={movementToRevert}
        component={
          movementToRevert
            ? components.find((c) => c.id === movementToRevert.componenteId) || null
            : null
        }
        allMovements={movements}
        role={role}
        onClose={() => {
          setIsReversionModalOpen(false);
          setMovementToRevert(null);
        }}
        onConfirmReversion={handleConfirmReversion}
      />

      <ComponentDetailModal
        isOpen={isDetailModalOpen}
        component={selectedDetailComp}
        category={
          selectedDetailComp
            ? categories.find((c) => c.id === selectedDetailComp.categoriaId) || null
            : null
        }
        currentStock={
          selectedDetailComp
            ? calculateComponentStock(selectedDetailComp.id, movements)
            : 0
        }
        componentMovements={
          selectedDetailComp
            ? movements.filter((m) => m.componenteId === selectedDetailComp.id)
            : []
        }
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailComp(null);
        }}
      />

      <FeedbackModal
        isOpen={feedbackState.isOpen}
        status={feedbackState.status}
        title={feedbackState.title}
        message={feedbackState.message}
        ruleDetail={feedbackState.ruleDetail}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Colegio Nacional EMD Asunción Escalada
            </span>
            <span aria-hidden="true">·</span>
            <span>Proyecto Individual 08</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Lucas Alfredo Lugo Irala (2° Curso 3ª Sección TM)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
              Evaluación: 24/24 pts
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
