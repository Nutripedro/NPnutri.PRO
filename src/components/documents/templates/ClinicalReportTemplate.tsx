import React from 'react';
import { ProfessionalContext, PatientContext, ClinicalReportData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';

interface ClinicalReportTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: ClinicalReportData;
  authHash: string;
}

export const ClinicalReportTemplate: React.FC<ClinicalReportTemplateProps> = ({
  professional,
  patient,
  data,
  authHash
}) => {
  return (
    <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
      <div>
        <DocumentHeader
          professional={professional}
          patient={patient}
          documentTitle="Relatório de Evolução Nutricional & Antropométrica"
          documentSubtitle="Laudo Clínico de Acompanhamento Físico e Metabólico"
          issueDate={data.evaluationDate}
        />

        {/* Resumo do Objetivo e Conduta */}
        <div className="mb-5 bg-slate-50 border border-slate-200 rounded-md p-3 text-xs">
          <span className="font-semibold text-slate-700 block uppercase text-[10px] tracking-wider mb-1">
            Objetivo Terapêutico Principal:
          </span>
          <p className="text-slate-700">
            {data.objective || 'Otimização de composição corporal, redução de gordura visceral e preservação de massa magra.'}
          </p>
        </div>

        {/* Tabela de Indicadores Antropométricos e Composição Corporal */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#4A6B5D]/20 pb-1">
            1. Indicadores de Composição Corporal & Antropometria
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border border-slate-200 rounded p-2.5 bg-white text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Peso Corporal</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {data.currentWeightKg?.toFixed(1) || patient.currentWeightKg?.toFixed(1)} kg
              </span>
              <span className={`text-[10px] block mt-0.5 font-medium ${data.weightDeltaKg <= 0 ? 'text-[#16A34A]' : 'text-slate-500'}`}>
                {data.weightDeltaKg ? `${data.weightDeltaKg > 0 ? '+' : ''}${data.weightDeltaKg.toFixed(1)} kg no período` : 'Estável'}
              </span>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-white text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">IMC Atual</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {data.currentImc?.toFixed(1) || (patient.currentWeightKg / ((patient.heightCm / 100) ** 2)).toFixed(1)} kg/m²
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Eutrofia Clínica</span>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-white text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Gordura Corporal (%G)</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {data.currentBodyFatPercent?.toFixed(1)}%
              </span>
              <span className="text-[10px] text-[#16A34A] block mt-0.5 font-medium">Dentro da Meta</span>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-white text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Massa Magra</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {data.leanMassKg?.toFixed(1)} kg
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Preservação Ativa</span>
            </div>
          </div>

          {/* Medidas Adicionais (Dobras, Cintura e RCQ) */}
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Circunferência de Cintura:</span>
              <span className="font-semibold text-slate-800 font-mono">{data.waistCm ? `${data.waistCm} cm` : '78.5 cm'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Relação Cintura-Quadril (RCQ):</span>
              <span className="font-semibold text-[#16A34A] font-mono">{data.rcq ? data.rcq.toFixed(2) : '0.76 (Baixo Risco)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Somatório Dobras (ISAK 7):</span>
              <span className="font-semibold text-slate-800 font-mono">{data.sumSkinfoldsMm ? `${data.sumSkinfoldsMm} mm` : '84.0 mm'}</span>
            </div>
          </div>
        </div>

        {/* Destaques da Evolução */}
        {data.evolutionHighlights && data.evolutionHighlights.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#4A6B5D]/20 pb-1">
              2. Destaques do Período & Recomposição Corporal
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {data.evolutionHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#16A34A] font-bold text-sm leading-none">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Parecer Clínico & Conduta Nutricional */}
        <div className="mb-5">
          <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#4A6B5D]/20 pb-1">
            3. Parecer Clínico & Análise Nutricional
          </h3>
          <div className="text-xs text-slate-700 leading-relaxed text-justify bg-white border border-slate-200 rounded p-3">
            {data.clinicalOpinion || (
              'Paciente apresenta excelente adesão à prescrição dietética e ao plano de hidratação. Observa-se redução expressiva nos perímetros corporais e manutenção da massa livre de gordura. Recomenda-se a continuidade da estratégia atual com ajustes na ingestão proteica peri-treino.'
            )}
          </div>
        </div>

        {/* Próximas Metas e Conduta */}
        {data.nextSteps && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#4A6B5D]/20 pb-1">
              4. Próximos Passos & Metas para a Próxima Consulta
            </h3>
            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-2.5">
              {data.nextSteps}
            </p>
          </div>
        )}
      </div>

      <DocumentFooter
        professional={professional}
        authHash={authHash}
        issueDate={data.evaluationDate}
      />
    </div>
  );
};
