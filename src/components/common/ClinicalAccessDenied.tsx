import React from 'react';
import { Professional, UserRole } from '../../types';
import { ROLE_METADATA } from '../../domain/permissions';
import { ShieldAlert, Lock, UserCheck, ArrowRight, ShieldCheck, Apple, Stethoscope, KeyRound } from 'lucide-react';

interface ClinicalAccessDeniedProps {
  moduleName: string;
  currentProfessional: Professional | null;
  professionals: Professional[];
  onSwitchProfessional: (prof: Professional) => void;
  onNavigateToSchedule?: () => void;
}

export const ClinicalAccessDenied: React.FC<ClinicalAccessDeniedProps> = ({
  moduleName,
  currentProfessional,
  professionals,
  onSwitchProfessional,
  onNavigateToSchedule
}) => {
  const currentRole = currentProfessional?.role || 'recepcionista';
  const meta = ROLE_METADATA[currentRole] || ROLE_METADATA.recepcionista;

  const clinicalProfessionals = professionals.filter(
    p => p.role === 'nutricionista' || p.role === 'medico' || p.role === 'adm' || p.role === 'admin'
  );

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 shadow-sm animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-amber-100">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-300 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
              Escudo de Sigilo Clínico (LGPD)
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">Art. 11 - Lei 13.709/2018</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Acesso Restrito: Módulo Clínico "{moduleName}"
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Você está navegando com o perfil de <strong>{meta.label}</strong> ({currentProfessional?.name || 'Recepção'}).
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Fundamentação Ética e Regulatória (CFN & CFM):</span>
          </div>
          <p>
            Em conformidade com a <strong>Resolução CFN nº 599/2018 (Código de Ética)</strong>, o <strong>Código de Ética Médica (CFM nº 2.217/2018)</strong> e a <strong>LGPD para Dados Sensíveis de Saúde</strong>, o acesso ao prontuário, medições antropométricas, dobras cutâneas, fotos de recomposição e prescrições é reservado aos profissionais de saúde habilitados (Nutricionista ou Médico).
          </p>
          <p className="text-slate-500">
            O perfil de Recepção possui acesso total e irrestrito à <strong>Agenda Clínica</strong>, agendamento de consultas, confirmações por WhatsApp e ao <strong>Cadastro de Pacientes</strong>.
          </p>
        </div>

        {/* Alternar Rápido de Perfil para Testar no SaaS */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 block mb-2">
            Simulador de Sessão: Alterne para um Profissional Habilitado:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {clinicalProfessionals.slice(0, 3).map(prof => {
              const profMeta = ROLE_METADATA[prof.role] || ROLE_METADATA.nutricionista;
              return (
                <button
                  key={prof.id}
                  onClick={() => onSwitchProfessional(prof)}
                  className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-300 text-left transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border">
                      {profMeta.shortLabel}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">{prof.name}</div>
                  <div className="text-[10px] font-mono text-emerald-800">{prof.registrationCode}</div>
                </button>
              );
            })}
          </div>
        </div>

        {onNavigateToSchedule && (
          <div className="flex justify-end pt-2">
            <button
              onClick={onNavigateToSchedule}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              Ir para Agenda Clínica de Atendimentos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
