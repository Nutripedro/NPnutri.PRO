import React from 'react';
import { ProfessionalContext, PatientContext, NutritionDeclarationData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';
import { formatCpf, formatDateExtendedPtBr } from '../../../utils/documentUtils';

interface NutritionDeclarationTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: NutritionDeclarationData;
  authHash: string;
}

export const NutritionDeclarationTemplate: React.FC<NutritionDeclarationTemplateProps> = ({
  professional,
  patient,
  data,
  authHash
}) => {
  const startDateExtended = formatDateExtendedPtBr(data.startDate || '2024-01-15');

  const scopeLabels: Record<string, string> = {
    academia_atividade_fisica: 'prática regular de atividade física e exercícios em academias e centros esportivos',
    cirurgia_bariatrica: 'comprovação de acompanhamento pré/pós-operatório de cirurgia bariátrica ou metabólica',
    concurso_clube: 'inscrição e participação em atividades de clubes recreativos ou certames públicos',
    plano_saude: 'apresentação e reembolso junto a operadoras de planos de assistência à saúde',
    geral: 'fins de comprovação de adesão e acompanhamento do estado nutricional'
  };

  const selectedScope = scopeLabels[data.purposeScope] || scopeLabels.geral;

  return (
    <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
      <div>
        <DocumentHeader
          professional={professional}
          patient={patient}
          documentTitle="Declaração de Acompanhamento Nutricional Regular"
          documentSubtitle="Atestado de Seguimento Clínico e Conduta Nutricional"
          issueDate={data.issueDate}
        />

        <div className="my-8 px-5 py-7 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 leading-loose text-justify space-y-5">
          <p>
            Declaro, para os devidos fins de direito e comprovação institucional, que o(a) paciente{' '}
            <strong className="text-slate-900 font-semibold">{data.patientName || patient.name}</strong>, inscrito(a) no CPF/MF sob o nº{' '}
            <strong className="font-mono text-slate-900">{formatCpf(data.patientCpf || patient.cpf)}</strong>, encontra-se sob meus cuidados profissionais em{' '}
            <span className="font-semibold text-[#4A6B5D]">acompanhamento nutricional clínico regular e continuado</span>{' '}
            desde <strong className="text-slate-900">{startDateExtended}</strong>, comparecendo com frequência{' '}
            <strong className="text-slate-900">{data.frequency || 'mensal'}</strong> para consultas de reavaliação física e dietoterápica.
          </p>

          <p>
            O acompanhamento tem como finalidade primordial a {selectedScope}, com plano alimentar personalizado calculado para suas necessidades metabólicas e metas antropométricas.
          </p>

          {data.statementBody && (
            <p className="border-t border-slate-200/60 pt-3 text-slate-700">
              {data.statementBody}
            </p>
          )}

          <div className="bg-white border border-slate-200 rounded p-3 text-xs space-y-1">
            <p className="text-slate-700">
              • <strong>Adesão ao Plano:</strong> {data.dietaryPlanAdherence || 'Paciente demonstra ótimo engajamento e adesão às metas calóricas, distribuição de macronutrientes e fracionamento alimentar.'}
            </p>
            {data.physicalActivityClearance && (
              <p className="text-emerald-800 font-medium">
                • <strong>Aptidão Nutricional:</strong> Do ponto de vista nutricional e metabólico, o(a) paciente encontra-se plenamente apto(a) à prática orientada de exercícios físicos.
              </p>
            )}
          </div>
        </div>
      </div>

      <DocumentFooter
        professional={professional}
        authHash={authHash}
        city={data.city || professional.unit}
        issueDate={data.issueDate}
      />
    </div>
  );
};
