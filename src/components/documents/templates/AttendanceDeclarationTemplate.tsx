import React from 'react';
import { ProfessionalContext, PatientContext, AttendanceDeclarationData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';
import { formatCpf, formatDateExtendedPtBr } from '../../../utils/documentUtils';

interface AttendanceDeclarationTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: AttendanceDeclarationData;
  authHash: string;
}

export const AttendanceDeclarationTemplate: React.FC<AttendanceDeclarationTemplateProps> = ({
  professional,
  patient,
  data,
  authHash
}) => {
  const consultationDateExtended = formatDateExtendedPtBr(data.consultationDate || new Date().toISOString().split('T')[0]);

  const purposeLabels: Record<string, string> = {
    atendimento_nutricional: 'consulta e acompanhamento nutricional clínico',
    avaliacao_antropometrica: 'avaliação da composição corporal e antropometria',
    retorno_clinico: 'sessão de retorno e reavaliação de conduta dietoterápica'
  };

  const selectedPurpose = purposeLabels[data.purpose] || 'atendimento nutricional individualizado';

  return (
    <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
      <div>
        <DocumentHeader
          professional={professional}
          patient={patient}
          documentTitle="Declaração de Comparecimento"
          documentSubtitle="Comprovação de Presença para Fins Justificativos"
          issueDate={data.consultationDate}
        />

        {/* Corpo Formal da Declaração */}
        <div className="my-10 px-4 py-8 bg-slate-50/50 border border-slate-200/80 rounded-lg text-sm text-slate-800 leading-loose text-justify space-y-6">
          <p>
            Declaro, para os devidos fins a que fizer prova junto ao trabalho, instituição de ensino ou quem de direito convier, que o(a) paciente{' '}
            <strong className="text-slate-900 font-semibold">{data.patientName || patient.name}</strong>, inscrito(a) no CPF sob o nº{' '}
            <strong className="font-mono text-slate-900">{formatCpf(data.patientCpf || patient.cpf)}</strong>, compareceu a esta clínica nesta data ({consultationDateExtended}), para realização de{' '}
            <span className="font-medium text-[#4A6B5D]">{selectedPurpose}</span>, no período compreendido entre as{' '}
            <strong className="font-mono text-slate-900">{data.startTime || '14:00'}</strong> e{' '}
            <strong className="font-mono text-slate-900">{data.endTime || '15:15'}</strong>.
          </p>

          {data.hasCompanion && (
            <p className="border-t border-slate-200 pt-4">
              Declaro ainda que o(a) paciente esteve acompanhado(a) de seu(sua){' '}
              {data.companionKinship ? `${data.companionKinship.toLowerCase()}, ` : ''}
              <strong className="text-slate-900 font-semibold">{data.companionName || 'Acompanhante'}</strong>, portador(a) do CPF nº{' '}
              <strong className="font-mono text-slate-900">{formatCpf(data.companionCpf || '') || 'Não informado'}</strong>, durante todo o período do atendimento acima descrito.
            </p>
          )}

          {data.customText && (
            <p className="border-t border-slate-200 pt-4 text-xs italic text-slate-600">
              Observações adicionais: {data.customText}
            </p>
          )}

          <div className="bg-[#4A6B5D]/5 border-l-4 border-[#4A6B5D] p-3 rounded-r text-xs text-slate-600 mt-6">
            <strong>Nota Ética e Legal:</strong> Em estrito cumprimento ao Código de Ética do Nutricionista (Resolução CFN nº 599/2018) e ao art. 5º da Lei Geral de Proteção de Dados (LGPD), este documento atesta exclusivamente a presença do paciente no estabelecimento para atendimento na área de nutrição, resguardando o sigilo do prontuário, diagnóstico clínico e plano alimentar individual.
          </div>
        </div>
      </div>

      <DocumentFooter
        professional={professional}
        authHash={authHash}
        city={data.city || professional.unit}
        issueDate={data.consultationDate}
        customDisclaimer="Declaração emitida para fins legais e justificativos de horário. Atestado de comparecimento nutricional sem menção a códigos de doença (CID)."
      />
    </div>
  );
};
