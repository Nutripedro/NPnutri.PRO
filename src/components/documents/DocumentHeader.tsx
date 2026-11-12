import React from 'react';
import { ProfessionalContext, PatientContext } from '../../types/documents';
import { formatCpf } from '../../utils/documentUtils';

interface DocumentHeaderProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  documentTitle: string;
  documentSubtitle?: string;
  issueDate?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  professional,
  patient,
  documentTitle,
  documentSubtitle,
  issueDate
}) => {
  const displayDate = issueDate 
    ? new Date(issueDate).toLocaleDateString('pt-BR') 
    : new Date().toLocaleDateString('pt-BR');

  return (
    <div className="border-b border-[#4A6B5D]/20 pb-4 mb-6">
      {/* Top Banner: Clínica & Profissional */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#4A6B5D] text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm">
            NP
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800 tracking-tight leading-tight">
              {professional.clinicName || 'Clínica de Nutrição Avançada'}
            </h1>
            <p className="text-xs text-[#4A6B5D] font-medium">
              {professional.name} • {professional.crn}
            </p>
            <p className="text-[11px] text-slate-500">
              {professional.specialty}
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-500 leading-relaxed max-w-[240px]">
          <p>{professional.address || 'Av. Paulista, 1000 - Jardins, São Paulo - SP'}</p>
          <p>{professional.phone} • {professional.email}</p>
        </div>
      </div>

      {/* Titulo do Documento */}
      <div className="mt-4 mb-4 text-center">
        <h2 className="text-lg font-bold text-[#4A6B5D] uppercase tracking-wider font-serif">
          {documentTitle}
        </h2>
        {documentSubtitle && (
          <p className="text-xs text-slate-500 mt-0.5 italic">
            {documentSubtitle}
          </p>
        )}
      </div>

      {/* Faixa Institucional de Identificação do Paciente */}
      <div className="bg-[#4A6B5D]/5 border border-[#4A6B5D]/15 rounded-md px-3.5 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paciente:</span>
          <span className="font-semibold text-slate-800 truncate block">{patient.name}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">CPF:</span>
          <span className="text-slate-700 font-mono">{formatCpf(patient.cpf) || 'Não informado'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Idade / Prontuário:</span>
          <span className="text-slate-700">{patient.age} anos • {patient.recordNumber || 'REC-001'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Data de Emissão:</span>
          <span className="text-[#4A6B5D] font-semibold">{displayDate}</span>
        </div>
      </div>
    </div>
  );
};
