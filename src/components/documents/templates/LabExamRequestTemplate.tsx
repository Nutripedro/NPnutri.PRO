import React from 'react';
import { ProfessionalContext, PatientContext, LabExamRequestData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';

interface LabExamRequestTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: LabExamRequestData;
  authHash: string;
}

export const LabExamRequestTemplate: React.FC<LabExamRequestTemplateProps> = ({
  professional,
  patient,
  data,
  authHash
}) => {
  const selectedExams = data.selectedExams?.filter(e => e.selected) || [];

  return (
    <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
      <div>
        <DocumentHeader
          professional={professional}
          patient={patient}
          documentTitle="Requisição de Exames Laboratoriais Integrativos"
          documentSubtitle="Painel Metabólico, Hormonal, Inflamatório e Micronutrientes"
          issueDate={data.requestDate}
        />

        {/* Alerta de Preparo & Suspensão de Biotina (Mandatório) */}
        <div className="mb-4 bg-amber-50 border border-amber-300 rounded-md p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            !
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider block text-[11px]">
              Instruções de Coleta e Preparo do Paciente:
            </span>
            <p className="mt-0.5 leading-relaxed">
              • <strong>Jejum obrigatório:</strong> {data.fastingHours || 12} horas de jejum calórico (água pura permitida à vontade).
            </p>
            {data.biotinSuspensionAlert && (
              <p className="mt-0.5 text-amber-950 font-semibold">
                • <strong>Alerta de Biotina (Vitamina B7):</strong> Suspender suplementos contendo biotina ou complexos multivitamínicos 72 horas antes da coleta para evitar interferências laboratoriais em ensaios por estreptavidina (falsos resultados em TSH, T4 livre e marcadores hormonais).
              </p>
            )}
            {data.specialInstructions && (
              <p className="mt-0.5 italic text-slate-700">
                • Outras orientações: {data.specialInstructions}
              </p>
            )}
          </div>
        </div>

        {/* Justificativa / Indicação Clínica */}
        <div className="mb-4 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-2.5">
          <span className="font-semibold text-slate-800 uppercase text-[10px] block">Indicação Clínica:</span>
          <span>{data.clinicalIndication || 'Avaliação do estado nutricional, modulação inflamatória, perfil lipídico e rastreamento de carências de micronutrientes.'}</span>
        </div>

        {/* Tabela de Exames Solicitados */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#4A6B5D]/20">
            <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider">
              Exames Laboratoriais Solicitados ({selectedExams.length})
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-[#16A34A] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
                Meta Integrativa
              </span>
              <span className="flex items-center gap-1 text-[#ca8a04] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]"></span>
                Ref. Convencional
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
                  <th className="py-1.5 px-3 w-8 text-center">[✓]</th>
                  <th className="py-1.5 px-3">Exame / Analito</th>
                  <th className="py-1.5 px-3 w-32">Painel</th>
                  <th className="py-1.5 px-3 text-right">Valores de Referência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedExams.map((exam, idx) => (
                  <tr key={exam.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-center font-mono font-bold text-[#4A6B5D]">
                      [X]
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-semibold text-slate-900 block">{exam.name}</span>
                      <span className="text-[10px] text-slate-500">{exam.clinicalJustification}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 capitalize text-[11px]">
                      {exam.panel.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-[11px] font-semibold text-[#16A34A] block">
                        Meta: {exam.idealValueGreen}
                      </span>
                      <span className="text-[10px] text-[#ca8a04] block">
                        Lab: {exam.referenceYellow}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic text-center mt-2">
          Solicito a gentileza do laboratório de transcrever os resultados com os respectivos valores de referência da metodologia empregada.
        </p>
      </div>

      <DocumentFooter
        professional={professional}
        authHash={authHash}
        issueDate={data.requestDate}
        customDisclaimer="Requisição de exames com respaldo nas competências da Lei Federal nº 8.234/1991 e Resoluções do CFN para avaliação do estado nutricional."
      />
    </div>
  );
};
