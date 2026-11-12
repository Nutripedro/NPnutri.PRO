import React from 'react';
import { Settings, Shield, Trash2, Bell, Globe, Building2, Smartphone, Users } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onNavigateToProfessionals?: () => void;
}

export function SettingsView({ settings, onUpdateSettings, onNavigateToProfessionals }: SettingsViewProps) {
  const toggleFeature = (feature: keyof AppSettings['features']) => {
    onUpdateSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    });
  };

  const toggleDeletion = () => {
    onUpdateSettings({
      ...settings,
      allowPatientDeletion: !settings.allowPatientDeletion
    });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#004f28]" />
            Configurações do Sistema
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie permissões clínicas, unidades e funcionalidades ativas.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unidade e Identidade */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-50 rounded-lg">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Unidade & Identidade</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Clínica</label>
              <input 
                type="text" 
                value={settings.clinicName}
                onChange={(e) => onUpdateSettings({ ...settings, clinicName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] focus:bg-white transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidade Padrão</label>
              <input 
                type="text" 
                value={settings.unit}
                onChange={(e) => onUpdateSettings({ ...settings, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fuso Horário</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600">
                  <Globe className="w-4 h-4" />
                  {settings.timezone}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Moeda</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600">
                  {settings.currency} (R$)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segurança e Permissões CRÍTICO */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <Shield className="w-12 h-12 text-slate-100" />
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Segurança & Governança</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Permitir Exclusão de Pacientes
                  {settings.allowPatientDeletion && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase font-black">Risco Alto</span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ativa o botão de "Excluir" na ficha do paciente. Esta ação é irreversível e remove todo o histórico clínico e evoluções associadas.
                </p>
              </div>
              <button 
                onClick={toggleDeletion}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#004f28] focus:ring-offset-2 ${settings.allowPatientDeletion ? 'bg-red-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.allowPatientDeletion ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                <span className="font-bold">Nota de Compliance (LGPD):</span> A exclusão de dados de saúde deve seguir os prazos de guarda de prontuários previstos pelo Conselho Federal de Nutricionistas (CFN).
              </p>
            </div>

            {/* Equipe & Permissões RBAC */}
            {onNavigateToProfessionals && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-[#004f28]" />
                    Equipe & Permissões (RBAC)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cadastre Nutricionistas, Médicos, Recepcionistas e ADMs com matriz de permissões.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToProfessionals}
                  className="px-3 py-1.5 bg-[#004f28] text-white rounded-lg text-xs font-bold hover:bg-[#003b1e] transition-colors shrink-0 shadow-2xs"
                >
                  Gerenciar Equipe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Funcionalidades Ativas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#004f28]/10 rounded-lg">
              <Smartphone className="w-5 h-5 text-[#004f28]" />
            </div>
            <h3 className="font-semibold text-slate-900">Funcionalidades do Ecossistema</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureToggle 
              icon={<Globe className="w-4 h-4" />}
              title="Teleconsulta"
              description="Habilita links do Google Meet e atendimento remoto."
              active={settings.features.teleconsulta}
              onToggle={() => toggleFeature('teleconsulta')}
            />
            <FeatureToggle 
              icon={<Bell className="w-4 h-4" />}
              title="Lembretes WhatsApp"
              description="Permite o envio de confirmações via API WhatsApp."
              active={settings.features.whatsappReminders}
              onToggle={() => toggleFeature('whatsappReminders')}
            />
            <FeatureToggle 
              icon={<Trash2 className="w-4 h-4" />}
              title="Módulo ANVISA"
              description="Gerador de tabelas nutricionais RDC 429/2020."
              active={settings.features.anvisaLabeling}
              onToggle={() => toggleFeature('anvisaLabeling')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureToggle({ icon, title, description, active, onToggle }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  active: boolean, 
  onToggle: () => void 
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between hover:border-[#004f28]/20 transition-all">
      <div>
        <div className={`p-2 rounded-lg w-fit mb-3 ${active ? 'bg-[#004f28] text-white' : 'bg-slate-200 text-slate-500'}`}>
          {icon}
        </div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-[11px] text-slate-500 mt-1 leading-normal">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`mt-4 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
          active 
            ? 'bg-[#004f28]/10 text-[#004f28] hover:bg-[#004f28]/20' 
            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
        }`}
      >
        {active ? 'Ativado' : 'Desativado'}
      </button>
    </div>
  );
}
