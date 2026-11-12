import React from 'react';
import {
  PediatricMeasurement,
  SISVANDiagnosis,
  GrowthIndexType
} from '../../types/growth';
import {
  Activity,
  Ruler,
  Scale,
  Brain,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Sparkles,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface DiagnosticCardProps {
  measurement: PediatricMeasurement | null;
  previousMeasurement?: PediatricMeasurement | null;
  privacyMode?: boolean;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  measurement,
  previousMeasurement,
  privacyMode = false
}) => {
  if (!measurement) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-sm">
        Nenhuma consulta pediátrica selecionada para diagnóstico.
      </div>
    );
  }

  const { diagnostics, zScores, percentiles } = measurement;

  const renderBadge = (diag?: SISVANDiagnosis) => {
    if (!diag) {
      return (
        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-medium">
          Não medido
        </span>
      );
    }

    const Icon = diag.severity === 'eutrofico'
      ? CheckCircle2
      : diag.severity === 'grave'
        ? AlertOctagon
        : AlertTriangle;

    return (
      <div className="flex items-center gap-1.5">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${diag.badgeBgColor} ${diag.badgeTextColor} ${diag.borderColor}`}>
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span>{diag.classification}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      {/* Consultation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-[#16A34A] rounded-xl border border-emerald-200">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Diagnóstico Nutricional SISVAN / OMS</span>
                <span className="text-[10px] font-mono font-bold bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Consulta em <span className="font-mono font-semibold text-slate-700">{measurement.consultationDate}</span> • Idade: <span className="font-semibold text-slate-700">{measurement.ageDisplay}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {measurement.weightKg && (
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-700">
              {measurement.weightKg} kg
            </span>
          )}
          {measurement.heightCm && (
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-700">
              {measurement.heightCm} cm
            </span>
          )}
          {measurement.bmi && (
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-700">
              IMC {measurement.bmi.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Grid of the 4 Nutritional Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Estatura / Idade */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-[#16A34A]/40 transition-all">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-[#16A34A]">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Estatura para Idade (E/I)</h4>
                  <span className="text-xs text-slate-500">Crescimento Linear</span>
                </div>
              </div>
              {renderBadge(diagnostics?.heightForAge)}
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {measurement.heightCm ? `${measurement.heightCm.toFixed(1)} cm` : '---'}
              </div>
              {zScores?.heightForAge !== undefined && (
                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-slate-800">
                    Escore-Z: {zScores.heightForAge > 0 ? `+${zScores.heightForAge.toFixed(2)}` : zScores.heightForAge.toFixed(2)} SD
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Percentil: {percentiles?.heightForAge?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700">Conduta: </span>
            {diagnostics?.heightForAge?.clinicalGuidance || 'Aferir comprimento com infantômetro ou estadiômetro calibrado.'}
          </div>
        </div>

        {/* 2. Peso / Idade */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-[#16A34A]/40 transition-all">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Peso para Idade (P/I)</h4>
                  <span className="text-xs text-slate-500">Evolução Ponderal</span>
                </div>
              </div>
              {renderBadge(diagnostics?.weightForAge)}
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {measurement.weightKg ? `${measurement.weightKg.toFixed(2)} kg` : '---'}
              </div>
              {zScores?.weightForAge !== undefined && (
                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-slate-800">
                    Escore-Z: {zScores.weightForAge > 0 ? `+${zScores.weightForAge.toFixed(2)}` : zScores.weightForAge.toFixed(2)} SD
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Percentil: {percentiles?.weightForAge?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700">Conduta: </span>
            {diagnostics?.weightForAge?.clinicalGuidance || 'Monitorar balanço energético e ritmo de ganho de peso.'}
          </div>
        </div>

        {/* 3. IMC / Idade (Padrão Ouro SISVAN) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-[#16A34A]/40 transition-all">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-[#16A34A]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">IMC para Idade (IMC/I)</h4>
                  <span className="text-xs text-slate-500">Padrão Ouro de Proporcionalidade</span>
                </div>
              </div>
              {renderBadge(diagnostics?.bmiForAge)}
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {measurement.bmi ? `${measurement.bmi.toFixed(2)} kg/m²` : '---'}
              </div>
              {zScores?.bmiForAge !== undefined && (
                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-slate-800">
                    Escore-Z: {zScores.bmiForAge > 0 ? `+${zScores.bmiForAge.toFixed(2)}` : zScores.bmiForAge.toFixed(2)} SD
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Percentil: {percentiles?.bmiForAge?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700">Classificação SISVAN: </span>
            {diagnostics?.bmiForAge?.clinicalGuidance || 'Classificação oficial para diagnóstico nutricional.'}
          </div>
        </div>

        {/* 4. Perímetro Cefálico / Idade */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-[#16A34A]/40 transition-all">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Perímetro Cefálico (PC/I)</h4>
                  <span className="text-xs text-slate-500">Neurodesenvolvimento (0 a 5 anos)</span>
                </div>
              </div>
              {renderBadge(diagnostics?.headCircForAge)}
            </div>

            <div className="flex items-baseline justify-between mt-3 mb-2">
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {measurement.headCircumferenceCm ? `${measurement.headCircumferenceCm.toFixed(1)} cm` : '---'}
              </div>
              {zScores?.headCircForAge !== undefined && (
                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-slate-800">
                    Escore-Z: {zScores.headCircForAge > 0 ? `+${zScores.headCircForAge.toFixed(2)}` : zScores.headCircForAge.toFixed(2)} SD
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Percentil: {percentiles?.headCircForAge?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700">Conduta: </span>
            {diagnostics?.headCircForAge?.clinicalGuidance || 'Medir com fita inelástica na maior circunferência occipitofrontal.'}
          </div>
        </div>
      </div>

      {/* Notes / Clinical Observation */}
      {measurement.notes && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
          <span className="font-bold">Observações Clínicas da Consulta: </span>
          {measurement.notes}
        </div>
      )}
    </div>
  );
};
