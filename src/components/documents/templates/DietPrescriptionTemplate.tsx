import React from 'react';
import { ProfessionalContext, PatientContext, DietPrescriptionData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';

interface DietPrescriptionTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: DietPrescriptionData;
  authHash: string;
}

export const DietPrescriptionTemplate: React.FC<DietPrescriptionTemplateProps> = ({
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
          documentTitle="Prescrição Dietética & Plano Alimentar"
          documentSubtitle="Planejamento Nutricional Personalizado e Metas Calóricas"
          issueDate={data.prescriptionDate}
        />

        {/* Quadro de Metas Energéticas e Macronutrientes */}
        <div className="mb-5 bg-[#4A6B5D]/5 border border-[#4A6B5D]/20 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-[#4A6B5D] tracking-wider">
              Metas Diárias Calculadas
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Objetivo: <strong className="text-slate-800">{data.objective || 'Recomposição Corporal & Saúde Metabólica'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-white border border-slate-200 rounded p-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Valor Energético</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {data.dailyCaloriesKcal || 2150} kcal
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded p-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Proteínas</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {data.proteinGrams || 155}g
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded p-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Carboidratos</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {data.carbsGrams || 230}g
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded p-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Lipídios</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {data.fatGrams || 58}g
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded p-2">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Hidratação Mínima</span>
              <span className="text-sm font-bold text-[#4A6B5D] font-mono">
                {data.waterIntakeMl ? `${(data.waterIntakeMl / 1000).toFixed(1)} L` : '2.5 L'}
              </span>
            </div>
          </div>
        </div>

        {/* Refeições do Plano */}
        <div className="mb-5">
          <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 border-b border-[#4A6B5D]/20 pb-1">
            Distribuição e Composição das Refeições
          </h3>

          <div className="space-y-3">
            {data.meals && data.meals.length > 0 ? (
              data.meals.map((meal, idx) => (
                <div key={idx} className="border border-slate-200 rounded-md p-3 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4A6B5D]"></span>
                      {meal.name}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[#4A6B5D] bg-[#4A6B5D]/10 px-2 py-0.5 rounded">
                      {meal.time}
                    </span>
                  </div>

                  <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                    {meal.foods?.map((food, fIdx) => (
                      <li key={fIdx}>{food}</li>
                    ))}
                  </ul>

                  {meal.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1.5 border-t border-slate-50 pt-1">
                      Obs: {meal.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Nenhuma refeição configurada neste plano.
              </p>
            )}
          </div>
        </div>

        {/* Orientações Comportamentais */}
        {data.guidelines && data.guidelines.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs mb-4">
            <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1">
              Diretrizes Nutricionais & Orientações Práticas:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {data.guidelines.map((g, gIdx) => (
                <li key={gIdx}>{g}</li>
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
      />
    </div>
  );
};
