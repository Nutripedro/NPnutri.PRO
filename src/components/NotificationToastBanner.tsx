import React from 'react';
import { ScheduledReminder } from '../types';
import { 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Droplets, 
  UtensilsCrossed, 
  X, 
  Sparkles 
} from 'lucide-react';

interface NotificationToastBannerProps {
  reminder: ScheduledReminder | null;
  onClose: () => void;
  onMarkConsumed?: (reminder: ScheduledReminder) => void;
  onSnooze?: (reminder: ScheduledReminder) => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({
  reminder,
  onClose,
  onMarkConsumed,
  onSnooze
}) => {
  if (!reminder) return null;

  const isWater = reminder.type === 'hidratacao';

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300 font-sans">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isWater ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {isWater ? <Droplets className="w-5 h-5" /> : <UtensilsCrossed className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/10 text-emerald-300 font-bold">
                {reminder.time}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">NutriTrack Alerta</span>
            </div>

            <h4 className="font-bold text-sm text-white mt-0.5">{reminder.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {reminder.customMessage}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg"
          title="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2 mt-3 pt-2.5 border-t border-slate-800 text-xs">
        {onMarkConsumed && (
          <button
            onClick={() => {
              onMarkConsumed(reminder);
              onClose();
            }}
            className="flex-1 py-1.5 px-2 bg-[#004f28] hover:bg-emerald-600 text-white font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isWater ? '+250ml Água' : 'Marcar Consumo'}</span>
          </button>
        )}

        {onSnooze && (
          <button
            onClick={() => {
              onSnooze(reminder);
              onClose();
            }}
            className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-[11px] transition-colors"
          >
            Adiar 15 min
          </button>
        )}
      </div>
    </div>
  );
};
