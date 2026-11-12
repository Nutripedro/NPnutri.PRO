import React from 'react';
import { ProfessionalContext, PatientContext, SupplementPrescriptionData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';

interface SupplementPrescriptionTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: SupplementPrescriptionData;
  authHash: string;
}

export const SupplementPrescriptionTemplate: React.FC<SupplementPrescriptionTemplateProps> = ({
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
          documentTitle="Receituário Magistral & Prescrição de Suplementos"
          documentSubtitle="Fórmulas Manipuladas Individualizadas e Fitoterápicos"
          issueDate={data.prescriptionDate}
        />

        {/* Tipo de Uso e Duração */}
        <div className="mb-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs">
          <span className="font-bold text-[#4A6B5D] uppercase tracking-wider">
            {data.usageType === 'uso_interno' ? 'USO INTERNO (ORAL)' : data.usageType === 'uso_externo' ? 'USO EXTERNO (TÓPICO)' : 'USO ORAL E TÓPICO'}
          </span>
          <span className="text-slate-600">
            Duração Prevista: <strong className="text-slate-800">{data.treatmentDuration || '60 dias'}</strong>
          </span>
        </div>

        {/* Lista de Fórmulas Manipuladas */}
        <div className="space-y-4 mb-6">
          {data.formulas && data.formulas.length > 0 ? (
            data.formulas.map((formula, idx) => (
              <div 
                key={formula.id || idx}
                className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#4A6B5D] uppercase tracking-wider">
                      Item {idx + 1} • {formula.pharmaceuticalForm?.toUpperCase() || 'CÁPSULAS'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{formula.title}</h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded font-mono">
                    Mandar: {formula.quantityToDispense || '60 doses'}
                  </span>
                </div>

                {/* Composição / Ativos */}
                <div className="bg-slate-50 rounded p-2.5 border border-slate-200/60 mb-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Composição da Fórmula (por dose):
                  </span>
                  <div className="space-y-1">
                    {formula.actives?.map((active, aIdx) => (
                      <div key={aIdx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-medium">
                          {active.name}{' '}
                          {active.chemicalForm && (
                            <span className="text-slate-500 font-normal italic">
                              ({active.chemicalForm})
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-semibold text-[#4A6B5D] text-xs">
                          {active.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Posologia e Horário de Ingestão */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded p-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                      Posologia Recomendada:
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">{formula.posology}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Momento / Horário de Ingestão:
                    </span>
                    <p className="text-slate-700 mt-0.5">{formula.timing || 'Conforme orientação'}</p>
                  </div>
                </div>

                {formula.warnings && (
                  <p className="text-[11px] text-amber-800 italic mt-2">
                    * Advertência: {formula.warnings}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-4">
              Nenhuma fórmula selecionada nesta prescrição.
            </p>
          )}
        </div>

        {/* Orientações Gerais de Manipulação */}
        {data.generalRecommendations && data.generalRecommendations.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs mb-4">
            <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider mb-1">
              Orientações à Farmácia Magistral e ao Paciente:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {data.generalRecommendations.map((rec, rIdx) => (
                <li key={rIdx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <DocumentFooter
        professional={professional}
        authHash={authHash}
        city={data.city || professional.unit}
        issueDate={data.prescriptionDate}
        customDisclaimer="Prescrição elaborada com base na Resolução CFN nº 656/2020 e Lei nº 8.234/1991. Validade de 30 dias a partir da data de emissão."
      />
    </div>
  );
};
