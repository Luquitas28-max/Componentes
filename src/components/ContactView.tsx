import React, { useState } from 'react';
import { ContactTicket } from '../types';
import {
  Mail,
  Phone,
  User,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  ShieldCheck,
  Tag,
  Sparkles,
  Download,
  RotateCcw,
} from 'lucide-react';

interface ContactViewProps {
  tickets: ContactTicket[];
  onSaveTicket: (ticket: ContactTicket) => void;
}

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  prioridad: 'baja' | 'media' | 'alta';
  mensaje: string;
  aceptaNormas: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;


export const ContactView: React.FC<ContactViewProps> = ({ tickets, onSaveTicket }) => {
  const [form, setForm] = useState<FormState>({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'Soporte y Prácticas de Laboratorio',
    prioridad: 'media',
    mensaje: '',
    aceptaNormas: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<ContactTicket | null>(null);

  // Validation function
  const validateField = (name: keyof FormState, value: any): string | undefined => {
    switch (name) {
      case 'nombre':
        if (!value || typeof value !== 'string' || value.trim().length < 3) {
          return 'El nombre y apellido deben tener al menos 3 caracteres.';
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'El nombre solo debe contener caracteres alfabéticos y espacios.';
        }
        return undefined;

      case 'email':
        if (!value || typeof value !== 'string') {
          return 'El correo electrónico es obligatorio.';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(value.trim())) {
          return 'Ingrese una dirección de correo válida (ejemplo: usuario@dominio.com).';
        }
        return undefined;

      case 'telefono':
        if (!value || typeof value !== 'string') {
          return 'El número de teléfono o celular es obligatorio.';
        }
        const cleanPhone = value.replace(/[\s-]/g, '');
        if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
          return 'Ingrese un número telefónico válido (mínimo 8 dígitos, ej: 0981-123456).';
        }
        return undefined;

      case 'asunto':
        if (!value || typeof value !== 'string' || value.trim().length < 4) {
          return 'Debe seleccionar o especificar un asunto válido.';
        }
        return undefined;

      case 'mensaje':
        if (!value || typeof value !== 'string' || value.trim().length < 15) {
          return `El mensaje debe contener al menos 15 caracteres (actual: ${value ? value.trim().length : 0}).`;
        }
        if (value.trim().length > 600) {
          return 'El mensaje no debe exceder los 600 caracteres.';
        }
        return undefined;

      case 'aceptaNormas':
        if (!value) {
          return 'Debe aceptar las normas de uso responsable del laboratorio.';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (name: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    const allTouched: Record<string, boolean> = {
      nombre: true,
      email: true,
      telefono: true,
      asunto: true,
      mensaje: true,
      aceptaNormas: true,
    };
    setTouched(allTouched);

    // Validate all
    const newErrors: FormErrors = {};
    let hasError = false;

    (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) {
        newErrors[key] = err;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    // Submit Simulation
    setIsSubmitting(true);
    setTimeout(() => {
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const newTicket: ContactTicket = {
        id: `TKT-${Date.now()}`,
        ticketNumero: `LAB-ESC-2026-${randomSeq}`,
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        asunto: form.asunto,
        prioridad: form.prioridad,
        mensaje: form.mensaje.trim(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        estado: 'recibido',
      };

      onSaveTicket(newTicket);
      setSubmittedTicket(newTicket);
      setIsSubmitting(false);

      // Reset form
      setForm({
        nombre: '',
        email: '',
        telefono: '',
        asunto: 'Soporte y Prácticas de Laboratorio',
        prioridad: 'media',
        mensaje: '',
        aceptaNormas: false,
      });
      setTouched({});
      setErrors({});
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Contacto & Soporte Técnico de Laboratorio
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Formulario interactivo con validación de campos en tiempo real para consultas, solicitudes de componentes o reportes de laboratorio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Form Introduction */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>Complete todos los campos requeridos para enviar su solicitud al encargado</span>
            </div>

            {/* Field: Nombre completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre y Apellido <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej: Prof. Roberto Benítez"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border text-slate-900 dark:text-white focus:outline-none transition-colors ${
                    touched.nombre && errors.nombre
                      ? 'border-rose-500 ring-2 ring-rose-500/10'
                      : touched.nombre && !errors.nombre
                      ? 'border-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>
              {touched.nombre && errors.nombre && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.nombre}</span>
                </p>
              )}
            </div>

            {/* Two Column: Email & Telefono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Correo Electronico */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ejemplo@asuncionescalada.edu.py"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      touched.email && errors.email
                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                        : touched.email && !errors.email
                        ? 'border-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Field: Teléfono */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono / Celular <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0981-123456"
                    value={form.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    onBlur={() => handleBlur('telefono')}
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      touched.telefono && errors.telefono
                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                        : touched.telefono && !errors.telefono
                        ? 'border-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {touched.telefono && errors.telefono && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.telefono}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Asunto / Motivo Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asunto de la Consulta / Solicitud <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.asunto}
                onChange={(e) => handleChange('asunto', e.target.value)}
                onBlur={() => handleBlur('asunto')}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Soporte y Prácticas de Laboratorio">
                  Soporte y Prácticas de Laboratorio
                </option>
                <option value="Solicitud de Reserva de Componentes">
                  Solicitud de Reserva de Componentes
                </option>
                <option value="Reporte de Rotura o Merma de Material">
                  Reporte de Rotura o Merma de Material
                </option>
                <option value="Sugerencia de Adquisición de Nuevos Módulos">
                  Sugerencia de Adquisición de Nuevos Módulos
                </option>
                <option value="Consulta Académica con el Alumno Lucas Lugo">
                  Consulta Académica con el Alumno Lucas Lugo
                </option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nivel de Prioridad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['baja', 'media', 'alta'] as const).map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => handleChange('prioridad', prio)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                      form.prioridad === prio
                        ? prio === 'alta'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300'
                          : prio === 'media'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {prio === 'alta' ? '🚨 Alta (Urgente)' : prio === 'media' ? '⚡ Normal / Media' : 'ℹ️ Baja'}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensaje Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detalle del Mensaje <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {form.mensaje.length}/600 caracteres
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Describa con precisión los componentes necesarios, fecha de la práctica o consulta a realizar..."
                value={form.mensaje}
                onChange={(e) => handleChange('mensaje', e.target.value)}
                onBlur={() => handleBlur('mensaje')}
                className={`w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border text-slate-900 dark:text-white focus:outline-none transition-colors ${
                  touched.mensaje && errors.mensaje
                    ? 'border-rose-500 ring-2 ring-rose-500/10'
                    : touched.mensaje && !errors.mensaje
                    ? 'border-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
              {touched.mensaje && errors.mensaje && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.mensaje}</span>
                </p>
              )}
            </div>

            {/* Checkbox: Terms / Rules */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.aceptaNormas}
                  onChange={(e) => handleChange('aceptaNormas', e.target.checked)}
                  onBlur={() => handleBlur('aceptaNormas')}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                  Confirmo que la información suministrada es fidedigna y me comprometo a cumplir el reglamento de uso de componentes del Colegio Asunción Escalada.
                </span>
              </label>
              {touched.aceptaNormas && errors.aceptaNormas && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.aceptaNormas}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validando y generando ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitud / Consulta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Lab Info & Recent Tickets */}
        <div className="lg:col-span-5 space-y-6">
          {/* Institutional Info Card */}
          <div className="p-5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Laboratorio de Electrónica CNAE</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El laboratorio del Colegio Nacional EMD Asunción Escalada gestiona componentes para las cátedras de Software, Hardware y Laboratorio del Segundo Curso Turno Mañana.
            </p>
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
              <p>📍 <strong>Ubicación:</strong> Bloque Técnico - Aula Laboratorio 2</p>
              <p>⏰ <strong>Horario:</strong> Lunes a Viernes 07:00 a 12:30 (Turno Mañana)</p>
              <p>👨‍🎓 <strong>Desarrollador:</strong> Lucas Alfredo Lugo Irala</p>
            </div>
          </div>

          {/* Submitted Tickets Ledger */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Tickets Recientes ({tickets.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">Canal oficial</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {tickets.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No hay tickets registrados aún en la sesión.
                </p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {t.ticketNumero}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.fecha}</span>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {t.asunto}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-[11px]">
                      {t.mensaje}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/40">
                      <span>{t.nombre}</span>
                      <span className="capitalize font-medium text-emerald-600 dark:text-emerald-400">
                        ● {t.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal when ticket is submitted */}
      {submittedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¡Solicitud Registrada con Éxito!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Su formulario ha sido validado correctamente y enviado al sistema de soporte del laboratorio.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Número de Ticket:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {submittedTicket.ticketNumero}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Remitente:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {submittedTicket.nombre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Asunto:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {submittedTicket.asunto}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Prioridad:</span>
                <span className="capitalize font-semibold text-rose-600 dark:text-rose-400">
                  {submittedTicket.prioridad}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
