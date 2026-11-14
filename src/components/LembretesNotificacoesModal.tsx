import React, { useState } from 'react';
import { Patient, ScheduledReminder, ReminderType } from '../types';
import { playClinicalChime, sendNativeNotification } from '../utils/audioNotification';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Droplets, 
  UtensilsCrossed, 
  Pill, 
  Scale, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Share2, 
  X, 
  Play, 
  AlertCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface LembretesNotificacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  reminders: ScheduledReminder[];
  onUpdateReminders: (reminders: ScheduledReminder[]) => void;
  onTriggerInstantToast: (reminder: ScheduledReminder) => void;
}

export const LembretesNotificacoesModal: React.FC<LembretesNotificacoesModalProps> = ({
  isOpen,
  onClose,
  patient,
  reminders,
  onUpdateReminders,
  onTriggerInstantToast
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [browserPermission, setBrowserPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // New Reminder Form State
  const [formType, setFormType] = useState<ReminderType>('hidratacao');
  const [formTitle, setFormTitle] = useState<string>('Pausa para Água (250ml)');
  const [formTime, setFormTime] = useState<string>('10:00');
  const [formTargetAmount, setFormTargetAmount] = useState<string>('250 ml');
  const [formMessage, setFormMessage] = useState<string>('Beba 250ml de água para manter seu nível hídrico.');
  const [formSound, setFormSound] = useState<boolean>(true);

  if (!isOpen) return null;

  // Toggle reminder enabled
  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    onUpdateReminders(updated);
  };

  // Toggle sound
  const handleToggleSound = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, soundEnabled: !r.soundEnabled } : r);
    onUpdateReminders(updated);
  };

  // Delete reminder
  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    onUpdateReminders(updated);
  };

  // Add reminder
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: ScheduledReminder = {
      id: `rem-${Date.now()}`,
      patientId: patient.id,
      type: formType,
      title: formTitle,
      time: formTime,
      enabled: true,
      repeatDaily: true,
      customMessage: formMessage,
      soundEnabled: formSound,
      targetAmount: formTargetAmount
    };

    onUpdateReminders([...reminders, newRem]);
    setIsAdding(false);
  };

  // Test instant trigger (plays chime + in-app toast + browser notification)
  const handleTestTrigger = (rem: ScheduledReminder) => {
    if (rem.soundEnabled) {
      playClinicalChime();
    }
    sendNativeNotification(`NutriTrack: ${rem.title}`, rem.customMessage);
    onTriggerInstantToast(rem);
  };

  // Request native browser permission
  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        sendNativeNotification('Notificações Ativadas!', 'Você receberá os alertas programados de refeições e água.');
      }
    }
  };

  // Export reminder schedule to WhatsApp
  const handleExportScheduleWhatsApp = () => {
    const active = reminders.filter(r => r.enabled);
    const list = active.map(r => `• *${r.time}* - ${r.title}: ${r.customMessage}`).join('%0A');
    const text = `*Cronograma de Lembretes Diários - NUTRI PRO*%0A` +
      `Olá, *${(patient?.name || 'Paciente').split(' ')[0]}*!%0A` +
      `Aqui está sua rotina programada de refeições e hidratação para hoje:%0A%0A` +
      `${list}%0A%0A` +
      `*Dica da Nutricionista:* O cumprimento dos horários evita picos de insulina e preserva a síntese proteica!`;

    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Type Icon and Color Helper
  const getTypeInfo = (type: ReminderType) => {
    switch (type) {
      case 'refeicao':
        return { icon: UtensilsCrossed, color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Refeição' };
      case 'hidratacao':
        return { icon: Droplets, color: 'text-sky-700 bg-sky-50 border-sky-200', label: 'Hidratação' };
      case 'suplemento':
        return { icon: Pill, color: 'text-purple-700 bg-purple-50 border-purple-200', label: 'Suplemento' };
      case 'pesagem':
        return { icon: Scale, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Pesagem' };
    }
  };

  const activeCount = reminders.filter(r => r.enabled).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#004f28] text-white flex items-center justify-center font-bold">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">Lembretes & Notificações do Diário</h3>
                <span className="text-[10px] font-mono text-[#004f28] bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  {activeCount} Ativos
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Paciente: {patient.name} ({patient.recordNumber}) • Disparos sonoros e navegador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          
          {/* Browser Permission Banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 block">Notificações no Navegador / Sistema</span>
                <span className="text-[11px] text-emerald-700">
                  {browserPermission === 'granted'
                    ? 'Permissão ativa. O navegador exibirá popups na hora programada.'
                    : 'Ative para receber lembretes sonoros e popups mesmo em segundo plano.'}
                </span>
              </div>
            </div>

            {browserPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-[#004f28] text-white rounded-lg font-semibold hover:bg-[#003c1e] text-[11px] shrink-0"
              >
                Permitir
              </button>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="px-3 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Lembrete</span>
              </button>

              <button
                onClick={handleExportScheduleWhatsApp}
                className="px-3 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Enviar Cronograma no WhatsApp</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Horários sincronizados com as refeições cadastradas
            </span>
          </div>

          {/* New Reminder Form (Collapsible) */}
          {isAdding && (
            <form onSubmit={handleAddReminder} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold text-slate-800">
                <span>Configurar Novo Lembrete</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-sans">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as ReminderType;
                      setFormType(t);
                      if (t === 'hidratacao') {
                        setFormTitle('Pausa para Água');
                        setFormTargetAmount('250 ml');
                        setFormMessage('Beba 250ml de água mineral para bater sua meta hídrica.');
                      } else if (t === 'refeicao') {
                        setFormTitle('Lanche Proteico');
                        setFormTargetAmount('30g P');
                        setFormMessage('Hora de registrar sua refeição no diário alimentar.');
                      } else if (t === 'suplemento') {
                        setFormTitle('Creatina Monoidratada');
                        setFormTargetAmount('5g');
                        setFormMessage('Ingerir 5g de creatina Creapure com água ou refeição.');
                      }
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="hidratacao">Hidratação</option>
                    <option value="refeicao">Refeição</option>
                    <option value="suplemento">Suplemento</option>
                    <option value="pesagem">Pesagem Matinal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-sans">Horário</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-sans">Alvo / Volume</label>
                  <input
                    type="text"
                    value={formTargetAmount}
                    onChange={(e) => setFormTargetAmount(e.target.value)}
                    placeholder="250 ml, 30g..."
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-1.5 text-[11px] font-sans text-slate-600 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSound}
                      onChange={(e) => setFormSound(e.target.checked)}
                      className="accent-[#004f28] rounded"
                    />
                    <span>Sinal Sonoro</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Título do Lembrete</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Mensagem de Incentivo Clínico</label>
                <textarea
                  rows={2}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-[#004f28] text-white rounded-lg font-semibold"
                >
                  Salvar Lembrete
                </button>
              </div>
            </form>
          )}

          {/* List of Reminders */}
          <div className="space-y-2.5">
            {reminders.map(rem => {
              const info = getTypeInfo(rem.type);
              const Icon = info.icon;

              return (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                    rem.enabled
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${info.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{rem.time}</span>
                        <h4 className="font-bold text-slate-900 truncate">{rem.title}</h4>
                        {rem.targetAmount && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.2 bg-slate-100 rounded text-slate-700">
                            {rem.targetAmount}
                          </span>
                        )}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${info.color}`}>
                          {info.label}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {rem.customMessage}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Test button, Sound toggle, Active Switch, Delete */}
                  <div className="flex items-center space-x-1.5 ml-3 shrink-0">
                    <button
                      onClick={() => handleTestTrigger(rem)}
                      className="p-1.5 text-slate-500 hover:text-[#004f28] hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Testar disparo do lembrete agora"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleSound(rem.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        rem.soundEnabled ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-100'
                      }`}
                      title={rem.soundEnabled ? 'Sinal sonoro ativado' : 'Sinal sonoro mudo'}
                    >
                      {rem.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleToggleReminder(rem.id)}
                      className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none ${
                        rem.enabled ? 'bg-[#004f28]' : 'bg-slate-300'
                      }`}
                      title={rem.enabled ? 'Desativar lembrete' : 'Ativar lembrete'}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          rem.enabled ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir lembrete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
