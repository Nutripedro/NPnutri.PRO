import React, { useState } from 'react';
import { ClinicalAppointment, Patient } from '../types';
import { MessageSquare, Send, CheckCircle2, Settings, Clock, Sparkles, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';

interface SmsRemindersViewProps {
  appointments: ClinicalAppointment[];
  patients: Patient[];
  privacyMode: boolean;
}

interface SMSTemplate {
  id: string;
  name: string;
  triggerTime: string; // e.g. "24 horas antes"
  content: string;
  active: boolean;
}

export const SmsRemindersView: React.FC<SmsRemindersViewProps> = ({
  appointments,
  patients,
  privacyMode
}) => {
  const [templates, setTemplates] = useState<SMSTemplate[]>([
    {
      id: 'tmpl-1',
      name: 'Lembrete Padrão 24h antes',
      triggerTime: '24h antes',
      content: 'Olá {patientName}! Aqui da {clinicName}: confirmamos sua consulta para {date} às {time}. Por favor, responda SIM para confirmar.',
      active: true
    },
    {
      id: 'tmpl-2',
      name: 'Aviso de Jejum & Preparo Antropométrico',
      triggerTime: '12h antes',
      content: 'Olá {patientName}, lembrete da sua avaliação nutricional na {clinicName} amanhã às {time}. Manter jejum de água e alimentos por 2h e hidratação adequada.',
      active: true
    },
    {
      id: 'tmpl-3',
      name: 'Confirmação de Retorno',
      triggerTime: '48h antes',
      content: 'Olá {patientName}, sua consulta de retorno na {clinicName} está agendada para {date} às {time}. Nos vemos em breve!',
      active: false
    }
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl-1');
  const [dispatchLog, setDispatchLog] = useState<Array<{ id: string; patientName: string; phone: string; time: string; status: 'Enviado' | 'Entregue' | 'Pendente' }>>([
    { id: 'log-1', patientName: 'Dra. Beatriz Menezes', phone: '+55 11 98877-6655', time: 'Hoje, 09:00', status: 'Entregue' },
    { id: 'log-2', patientName: 'Carlos Eduardo Silveira', phone: '+55 11 97766-5544', time: 'Hoje, 08:30', status: 'Enviado' }
  ]);

  const [isSuccessAlert, setIsSuccessAlert] = useState<string | null>(null);
  const [editingTemplateContent, setEditingTemplateContent] = useState<string>(templates[0].content);

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const found = templates.find(t => t.id === id);
    if (found) setEditingTemplateContent(found.content);
  };

  const handleSaveTemplate = () => {
    setTemplates(prev => prev.map(t => t.id === selectedTemplateId ? { ...t, content: editingTemplateContent } : t));
    setIsSuccessAlert('Template de SMS atualizado com sucesso!');
    setTimeout(() => setIsSuccessAlert(null), 3000);
  };

  const handleSendInstantSms = (apt: ClinicalAppointment) => {
    const formattedText = editingTemplateContent
      .replace('{patientName}', apt.patientName)
      .replace('{clinicName}', 'NUTRI PRO')
      .replace('{date}', apt.date.split('-').reverse().join('/'))
      .replace('{time}', apt.startTime);

    // Simulate SMS gateway API call
    setDispatchLog(prev => [
      {
        id: `log-${Date.now()}`,
        patientName: apt.patientName,
        phone: apt.patientPhone || '+55 11 99999-9999',
        time: 'Agora mesmo',
        status: 'Enviado'
      },
      ...prev
    ]);

    setIsSuccessAlert(`SMS disparado com sucesso para ${apt.patientName} (${apt.patientPhone})!`);
    setTimeout(() => setIsSuccessAlert(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700">
              Gateway SMS & Automação
            </span>
            <span className="text-xs text-slate-400 font-mono">Twilio / Zenvia / Z-API Integration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Lembretes Automáticos de Consulta por SMS
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Disparo automatizado baseado na agenda cadastrada, com tags dinâmicas e comprovação de entrega.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <span className="text-[10px] text-emerald-800 font-bold block font-mono">TAXA DE ENTREGA</span>
            <span className="text-lg font-black text-[#004f28]">98.4%</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-bold block font-mono">DISPAROS HOJE</span>
            <span className="text-lg font-black text-slate-900">14 SMS</span>
          </div>
        </div>
      </div>

      {isSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{isSuccessAlert}</span>
        </div>
      )}

      {/* Main Grid: Templates & Dispatch Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Templates Customization (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#004f28]" />
              <span>Templates Personalizáveis de Mensagem</span>
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              Variáveis: {'{patientName}'}, {'{date}'}, {'{time}'}, {'{clinicName}'}
            </span>
          </div>

          {/* Template tabs */}
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  selectedTemplateId === t.id
                    ? 'bg-[#004f28] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{t.name}</span>
                <span className={`w-2 h-2 rounded-full ${t.active ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Corpo da Mensagem SMS (Máx. 160 caracteres padrão)
            </label>
            <textarea
              rows={4}
              value={editingTemplateContent}
              onChange={(e) => setEditingTemplateContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004f28]"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span>Caracteres: {editingTemplateContent.length} / 160 (1 SMS)</span>
              <button
                onClick={handleSaveTemplate}
                className="px-3 py-1.5 bg-[#004f28] text-white rounded-lg font-semibold hover:bg-[#003c1e] transition-colors"
              >
                Salvar Alterações do Template
              </button>
            </div>
          </div>

          {/* Preview Bubble */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Pré-visualização no Aparelho do Paciente</span>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs max-w-md text-xs text-slate-800 font-sans space-y-1">
              <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                <Smartphone className="w-3 h-3 text-[#004f28]" />
                <span>SMS • Mensagens • Agora</span>
              </div>
              <p className="leading-relaxed">
                {editingTemplateContent
                  .replace('{patientName}', privacyMode ? 'Paciente Exemplo' : 'Dra. Beatriz Menezes')
                  .replace('{clinicName}', 'NUTRI PRO')
                  .replace('{date}', '12/11/2026')
                  .replace('{time}', '10:00')}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Appointments Queue for SMS (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Fila de Agendamentos (Próximos)</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">{appointments.length} na agenda</span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto custom-scrollbar">
              {appointments.slice(0, 5).map(apt => (
                <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">
                      <span className={privacyMode ? 'filter blur-xs' : ''}>{apt.patientName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {apt.date.split('-').reverse().join('/')} às {apt.startTime}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendInstantSms(apt)}
                    className="p-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors shadow-2xs"
                    title="Disparar SMS Imediato"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Dispatch Logs */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Log Recente de Disparos SMS
            </span>
            <div className="space-y-1.5 text-[11px] font-mono">
              {dispatchLog.slice(0, 3).map(log => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-800 font-bold truncate max-w-[120px]">{log.patientName}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">{log.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
