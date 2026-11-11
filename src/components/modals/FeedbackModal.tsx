import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  status: 'ACEPTADA' | 'RECHAZADA';
  title: string;
  message: string;
  ruleDetail?: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  status,
  title,
  message,
  ruleDetail,
  onClose,
}) => {
  if (!isOpen) return null;

  const isAccepted = status === 'ACEPTADA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              isAccepted
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isAccepted ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h3>

          <div
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isAccepted
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            Operación {status}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
          <p className="font-medium text-slate-900 dark:text-white">{message}</p>
          {ruleDetail && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700/40">
              <strong>Motivo de la regla:</strong> {ruleDetail}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white transition-colors shadow-xs ${
            isAccepted
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
