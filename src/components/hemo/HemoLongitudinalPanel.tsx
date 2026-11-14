import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { History, Save, Trash2, TrendingUp } from 'lucide-react';
import {
  LongitudinalHemogramDelta,
  SavedHemogramRecord
} from '../../types/hemo';

interface HemoLongitudinalPanelProps {
  records: SavedHemogramRecord[];
  longitudinalDeltas: LongitudinalHemogramDelta[];
  isLoading: boolean;
  isSaving: boolean;
  onSaveCurrentRecord: () => void;
  onLoadRecordIntoEditor: (record: SavedHemogramRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

export const HemoLongitudinalPanel: React.FC<HemoLongitudinalPanelProps> = ({
  records,
  longitudinalDeltas,
  isLoading,
  isSaving,
  onSaveCurrentRecord,
  onLoadRecordIntoEditor,
  onDeleteRecord
}) => {
  const [chartMetric, setChartMetric] = useState<'hgb_vcm' | 'leuc_plt' | 'meb'>('hgb_vcm');

  const chartData = useMemo(() => {
    const ordered = records
      .slice()
      .sort((a, b) => {
        const da = a.metadata.collectionDate || a.createdAt;
        const db = b.metadata.collectionDate || b.createdAt;
        return da.localeCompare(db);
      });

    return ordered.map((rec) => {
      const byId = new Map(rec.parameters.map((p) => [p.id, p]));
      return {
        date: rec.metadata.collectionDate || rec.createdAt.slice(0, 10),
        lab: rec.metadata.laboratoryName,
        hgb: byId.get('hgb')?.value ?? null,
        vcm: byId.get('vcm')?.value ?? null,
        leuc: byId.get('leuc')?.value ?? null,
        pltThousands:
          byId.get('plt')?.value != null
            ? Math.round((byId.get('plt')!.value! / 1000) * 10) / 10
            : null,
        meb: rec.mebScore ?? null
      };
    });
  }, [records]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#4A6B5D] shrink-0" />
            Histórico Longitudinal do Paciente
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Comparação evolutiva entre hemogramas salvos no prontuário e variação temporal de séries e MEB.
          </p>
        </div>

        <button
          type="button"
          onClick={onSaveCurrentRecord}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors flex items-center gap-2 disabled:opacity-60 whitespace-nowrap shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Exame Atual no Histórico'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="h-44 rounded-lg bg-slate-100 animate-pulse" />
      ) : records.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center space-y-3">
          <TrendingUp className="w-6 h-6 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-800">
              Nenhum hemograma salvo neste prontuário ainda
            </p>
            <p className="text-xs text-slate-600">
              Salve o exame atual para iniciar a curva longitudinal e comparar automaticamente variações futuras.
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveCurrentRecord}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#4A6B5D] text-white hover:bg-[#3d594c] transition-colors"
          >
            Salvar Primeiro Registro
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Seletor de gráfico evolutivo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-800">
              Tendência Temporal ({records.length} registro(s))
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setChartMetric('hgb_vcm')}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                  chartMetric === 'hgb_vcm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Hemoglobina &amp; VCM
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('leuc_plt')}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                  chartMetric === 'leuc_plt' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Leucócitos &amp; Plaquetas
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('meb')}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                  chartMetric === 'meb' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Índice MEB
              </button>
            </div>
          </div>

          <div className="h-64 w-full border border-slate-200 rounded-lg p-3 bg-slate-50/40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {chartMetric === 'hgb_vcm' && (
                  <>
                    <Line type="monotone" dataKey="hgb" name="Hemoglobina (g/dL)" stroke="#B91C1C" strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="vcm" name="VCM (fL)" stroke="#4A6B5D" strokeWidth={2} connectNulls />
                  </>
                )}
                {chartMetric === 'leuc_plt' && (
                  <>
                    <Line type="monotone" dataKey="leuc" name="Leucócitos (/µL)" stroke="#1D4ED8" strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="pltThousands" name="Plaquetas (mil/µL)" stroke="#D97706" strokeWidth={2} connectNulls />
                  </>
                )}
                {chartMetric === 'meb' && (
                  <Line type="monotone" dataKey="meb" name="Escore MEB (%)" stroke="#4A6B5D" strokeWidth={2.5} connectNulls />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Deltas do exame atual vs último salvo */}
          {longitudinalDeltas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-900">
                Variação do Exame Atual vs. Último Exame Registrado ({longitudinalDeltas[0]?.previousDate})
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Parâmetro</th>
                      <th className="py-2 px-3 font-semibold text-right">Anterior</th>
                      <th className="py-2 px-3 font-semibold text-right">Atual</th>
                      <th className="py-2 px-3 font-semibold text-right">Delta Absoluto</th>
                      <th className="py-2 px-3 font-semibold text-right">Variação %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {longitudinalDeltas.map((d) => (
                      <tr key={d.parameterId} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {d.name} <span className="text-slate-500 font-normal">({d.unit})</span>
                        </td>
                        <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-600">
                          {d.previousValue !== null ? d.previousValue.toLocaleString('pt-BR') : 'N/I'}
                        </td>
                        <td className="py-2 px-3 font-mono tabular-nums text-right font-semibold text-slate-900">
                          {d.currentValue !== null ? d.currentValue.toLocaleString('pt-BR') : 'N/I'}
                        </td>
                        <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-800">
                          {d.deltaAbsolute !== null
                            ? `${d.deltaAbsolute > 0 ? '+' : ''}${d.deltaAbsolute.toLocaleString('pt-BR')}`
                            : '—'}
                        </td>
                        <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-700">
                          {d.deltaPercent !== null
                            ? `${d.deltaPercent > 0 ? '+' : ''}${d.deltaPercent.toFixed(1).replace('.', ',')}%`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lista de exames salvos */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-900">Exames Armazenados no Prontuário</h4>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50"
                >
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">
                      {rec.metadata.collectionDate} · {rec.metadata.laboratoryName}
                    </div>
                    <div className="text-slate-600 font-mono tabular-nums">
                      {rec.metadata.examType} · MEB:{' '}
                      {rec.mebScore !== null ? rec.mebScore.toFixed(1).replace('.', ',') : 'N/I'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onLoadRecordIntoEditor(rec)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-100 text-slate-800"
                    >
                      Carregar na Ficha
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(rec.id)}
                      aria-label="Excluir registro"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
