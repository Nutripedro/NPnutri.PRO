import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { HemoParameterEntry } from '../types/hemo';
import { DEFAULT_HEMOGRAM_PARAMETERS, evaluateMebProtocol } from '../domain/hemoEngine';
import { MebSymptomsModal } from './MebSymptomsModal';
import { MebEvolutionChart } from './MebEvolutionChart';

interface MebCalculatorCardProps {
  /** Lista completa de parâmetros do hemograma (fonte única de verdade preferencial) */
  parameters?: HemoParameterEntry[];
  /** Callback para atualizar valores % ou absolutos na ficha principal */
  onUpdateWhiteDifferential?: (
    id: 'mono' | 'eos' | 'baso',
    field: 'percentValue' | 'value',
    nextVal: number | null
  ) => void;
  /** Props legados para compatibilidade caso seja renderizado isoladamente */
  monocytesPercent?: number;
  eosinophilsPercent?: number;
  basophilsPercent?: number;
  patientName?: string;
  selectedSymptoms?: string[];
  onUpdateSymptoms?: (symptoms: string[]) => void;
}

function parseNullableNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export const MebCalculatorCard: React.FC<MebCalculatorCardProps> = ({
  parameters,
  onUpdateWhiteDifferential,
  monocytesPercent = 6.5,
  eosinophilsPercent = 3.0,
  basophilsPercent = 0.5,
  selectedSymptoms: externalSymptoms,
  onUpdateSymptoms
}) => {
  const [localSymptoms, setLocalSymptoms] = useState<string[]>([]);
  const activeSymptoms = externalSymptoms ?? localSymptoms;

  const [fallbackParams, setFallbackParams] = useState<HemoParameterEntry[]>(() => {
    const base = DEFAULT_HEMOGRAM_PARAMETERS('female');
    return base.map((p) => {
      if (p.id === 'mono') return { ...p, percentValue: monocytesPercent };
      if (p.id === 'eos') return { ...p, percentValue: eosinophilsPercent };
      if (p.id === 'baso') return { ...p, percentValue: basophilsPercent };
      return p;
    });
  });

  const activeParams = parameters ?? fallbackParams;
  const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'protocol' | 'evolution'>('protocol');

  const meb = useMemo(
    () => evaluateMebProtocol(activeParams, activeSymptoms),
    [activeParams, activeSymptoms]
  );

  const handleFieldChange = (
    id: 'mono' | 'eos' | 'baso',
    field: 'percentValue' | 'value',
    raw: string
  ) => {
    const val = parseNullableNumber(raw);
    if (onUpdateWhiteDifferential) {
      onUpdateWhiteDifferential(id, field, val);
    } else {
      setFallbackParams((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
      );
    }
  };

  const handleSaveSymptoms = (next: string[]) => {
    setLocalSymptoms(next);
    if (onUpdateSymptoms) onUpdateSymptoms(next);
  };

  const classificationStyle = (() => {
    switch (meb.classificationKey) {
      case 'equilibrio_provavel':
        return {
          container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          bar: 'bg-emerald-600',
          Icon: CheckCircle2
        };
      case 'limitrofe':
        return {
          container: 'bg-amber-50 border-amber-200 text-amber-950',
          bar: 'bg-amber-500',
          Icon: AlertTriangle
        };
      case 'alerta_investigacao':
        return {
          container: 'bg-orange-50 border-orange-300 text-orange-950',
          bar: 'bg-orange-600',
          Icon: ShieldAlert
        };
      case 'elevado':
        return {
          container: 'bg-red-50 border-red-300 text-red-950',
          bar: 'bg-red-600',
          Icon: ShieldAlert
        };
      default:
        return {
          container: 'bg-slate-50 border-slate-200 text-slate-800',
          bar: 'bg-slate-400',
          Icon: Info
        };
    }
  })();

  const StatusIcon = classificationStyle.Icon;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4A6B5D] shrink-0" />
            Teste MEB — Protocolo em 8 Partes
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Cálculo estritamente percentual (% Monócitos + % Eosinófilos + % Basófilos) sem estimativas de valores ausentes.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('protocol')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'protocol'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laudo MEB (8 Partes)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evolution')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'evolution'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Série Temporal
          </button>
        </div>
      </div>

      {activeTab === 'protocol' ? (
        <div className="space-y-5">
          {/* Entrada direta sincronizada (% e /µL separados) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Sliders className="w-4 h-4 text-[#4A6B5D]" />
                <span>Valores do Diferencial Leucocitário (Percentual % e Absoluto /µL)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSymptomsOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>Sintomas ({activeSymptoms.length}/16)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { id: 'mono' as const, label: 'Monócitos', pct: meb.monocytesPercent, abs: meb.monocytesAbsolute },
                  { id: 'eos' as const, label: 'Eosinófilos', pct: meb.eosinophilsPercent, abs: meb.eosinophilsAbsolute },
                  { id: 'baso' as const, label: 'Basófilos', pct: meb.basophilsPercent, abs: meb.basophilsAbsolute }
                ]
              ).map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-semibold text-slate-800">{item.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Percentual (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="N/I"
                        value={item.pct ?? ''}
                        onChange={(e) => handleFieldChange(item.id, 'percentValue', e.target.value)}
                        className="w-full border border-slate-300 rounded-md py-1.5 px-2.5 text-xs font-mono tabular-nums text-right text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Absoluto (/µL)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="N/I"
                        value={item.abs ?? ''}
                        onChange={(e) => handleFieldChange(item.id, 'value', e.target.value)}
                        className="w-full border border-slate-300 rounded-md py-1.5 px-2.5 text-xs font-mono tabular-nums text-right text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1, 2, 3, 4 — Cálculo completo, Resultado final, Classificação operacional, Componente predominante */}
          <div className={`p-4 rounded-xl border ${classificationStyle.container} space-y-3`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <StatusIcon className="w-4 h-4 shrink-0" />
                  <span>{meb.classificationLabel}</span>
                </div>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>1. Cálculo completo:</strong>{' '}
                    <span className="font-mono tabular-nums">{meb.formulaDisplay}</span>
                  </p>
                  <p>
                    <strong>4. Componente predominante:</strong> {meb.predominantComponentLabel}
                  </p>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{meb.operationalSummary}</p>
                {!meb.calculable && meb.reasonIfNotCalculable && (
                  <p className="text-xs font-medium text-red-800 bg-white/80 border border-red-200 rounded-md p-2.5">
                    {meb.reasonIfNotCalculable}
                  </p>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-lg px-5 py-3.5 text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-500 block">
                  2. Resultado Final MEB
                </span>
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                  {meb.calculable && meb.score !== null ? meb.score.toFixed(1).replace('.', ',') : '—'}
                </span>
              </div>
            </div>

            {/* Escala operacional exata: < 9 | 9–9,9 | 10–15 | > 15 */}
            <div className="pt-2 space-y-1.5">
              <div className="grid grid-cols-4 text-[11px] font-medium text-slate-700 gap-1">
                <span>&lt; 9 Equilíbrio provável</span>
                <span className="text-center">9,0 – 9,9 Limítrofe</span>
                <span className="text-center">10,0 – 15,0 Alerta</span>
                <span className="text-right">&gt; 15,0 Elevado</span>
              </div>
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${classificationStyle.bar}`}
                  style={{
                    width: `${meb.calculable && meb.score !== null ? Math.min(100, (meb.score / 25) * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* 5 & 6 — Comparação com referências laboratoriais & Correlações clínicas por componente */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-900">
              5. Comparação Laboratorial e 6. Possíveis Correlações Clínicas por Componente
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Componente</th>
                    <th className="py-2.5 px-3 font-semibold text-right">% Encontrado</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Ref. %</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Absoluto (/µL)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Ref. Absoluta</th>
                    <th className="py-2.5 px-3 font-semibold">Correlações & Cautela Clínica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {meb.componentAnalyses.map((comp) => (
                    <tr key={comp.component} className="hover:bg-slate-50/70 align-top">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {comp.label}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-900">
                        {comp.percentValue !== null ? `${comp.percentValue.toFixed(1).replace('.', ',')}%` : 'Não informado'}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-600">
                        {comp.labRefPercent}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-900">
                        {comp.absoluteValue !== null ? comp.absoluteValue.toLocaleString('pt-BR') : 'Não informado'}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-600">
                        {comp.labRefAbsolute}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 space-y-1">
                        <p>{comp.clinicalAssociations.join(' · ')}</p>
                        <p className="text-[11px] text-slate-500">{comp.cautionNote}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7 — Sugestões de investigação + Sintomas correlacionados */}
          {(meb.investigationSuggestions.length > 0 || activeSymptoms.length > 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-900">
                7. Sugestões Seguras de Investigação Complementar
              </h4>
              {activeSymptoms.length > 0 && (
                <p className="text-xs text-slate-700">
                  <strong>Sintomas correlacionados ({activeSymptoms.length}):</strong>{' '}
                  {activeSymptoms.join(' · ')}
                </p>
              )}
              {meb.investigationSuggestions.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  {meb.investigationSuggestions.map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 8 — Limitações científicas obrigatórias */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <Info className="w-4 h-4 text-[#4A6B5D] shrink-0" />
              <span>8. Limitações Científicas e Governança Clínica</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600 leading-relaxed">
              {meb.scientificLimitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <MebEvolutionChart />
      )}

      <MebSymptomsModal
        isOpen={isSymptomsOpen}
        onClose={() => setIsSymptomsOpen(false)}
        selectedSymptoms={activeSymptoms}
        onSave={handleSaveSymptoms}
      />
    </section>
  );
};
