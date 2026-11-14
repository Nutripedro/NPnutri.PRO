import React from 'react';
import {
  CalculatedRecipeResult,
  PhysicalState,
  RegulatoryNutrientCheckItem,
  TechnicalSheetRecipe
} from '../../types/nutritionLabel';
import { AnvisaLupaBadge } from './AnvisaOfficialLabelPreview';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Scale,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

interface Rdc429RegulatoryPanelProps {
  recipe: TechnicalSheetRecipe;
  calculated: CalculatedRecipeResult;
  onUpdateRecipe?: (updates: Partial<TechnicalSheetRecipe>) => void;
  compact?: boolean;
}

function formatDeltaDisplay(check: RegulatoryNutrientCheckItem): string {
  if (check.deltaToThreshold === null) return 'N/I';
  const sign = check.deltaToThreshold >= 0 ? '+' : '-';
  const abs = Math.abs(check.deltaToThreshold);
  const formatted =
    check.unit === 'mg'
      ? Number.isInteger(Math.round(abs * 10) / 10)
        ? String(Math.round(abs))
        : (Math.round(abs * 10) / 10).toFixed(1).replace('.', ',')
      : Number.isInteger(Math.round(abs * 10) / 10)
        ? String(Math.round(abs))
        : (Math.round(abs * 10) / 10).toFixed(1).replace('.', ',');
  return `${sign}${formatted} ${check.unit}`;
}

export const Rdc429RegulatoryPanel: React.FC<Rdc429RegulatoryPanelProps> = ({
  recipe,
  calculated,
  onUpdateRecipe,
  compact = false
}) => {
  const { lupa } = calculated;
  const exceededCount = lupa.checks.filter((c) => c.status === 'exceeds').length;
  const nearLimitCount = lupa.checks.filter((c) => c.status === 'near_limit').length;

  const handleSwitchPhysicalState = (nextState: PhysicalState) => {
    if (!onUpdateRecipe || recipe.physicalState === nextState) return;
    onUpdateRecipe({
      physicalState: nextState,
      portionUnit: nextState === 'liquido' ? 'ml' : 'g'
    });
  };

  return (
    <section
      aria-label="Motor Regulatório RDC 429/2020 — Verificação de Limites para Lupa Frontal"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4"
    >
      {/* Cabeçalho Clínico & Seletor de Matriz */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Scale className="w-4 h-4 text-orange-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Motor Regulatório RDC 429/2020 &amp; IN 75/2020
            </h3>
            {exceededCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-[11px] font-bold">
                <AlertOctagon className="w-3 h-3 shrink-0" />
                <span>{exceededCount} limite(s) excedido(s)</span>
              </span>
            ) : nearLimitCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{nearLimitCount} próximo(s) do corte</span>
              </span>
            ) : lupa.hasMissingCriticalData ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold">
                <HelpCircle className="w-3 h-3 shrink-0" />
                <span>Dados pendentes (N/I)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>Conforme sem Lupa Frontal</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cálculo determinístico automático sobre a tabela por{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-200">
              {lupa.thresholds.baseLabel}
            </strong>{' '}
            para Açúcares Adicionados, Gorduras Saturadas e Sódio (Anexo XV).
          </p>
        </div>

        {/* Toggle rápido Sólido vs Líquido */}
        {onUpdateRecipe && (
          <div
            role="group"
            aria-label="Matriz física para cálculo dos limiares"
            className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0 self-start sm:self-auto"
          >
            <button
              type="button"
              onClick={() => handleSwitchPhysicalState('solido')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                recipe.physicalState === 'solido'
                  ? 'bg-slate-900 dark:bg-orange-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sólido (100 g)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPhysicalState('liquido')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                recipe.physicalState === 'liquido'
                  ? 'bg-slate-900 dark:bg-orange-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Líquido (100 ml)
            </button>
          </div>
        )}
      </div>

      {/* Alerta de Conflito quando Dispensa de Lupa está marcada apesar de exceder limites */}
      {lupa.hasExemptionConflict && (
        <div
          role="alert"
          className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-900 dark:text-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
        >
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                Dispensa de Lupa ativa, porém os teores excedem a RDC 429/2020 (
                {lupa.suggestedClaims.join(', ')})
              </div>
              <p className="mt-0.5 opacity-90">
                Só mantenha a dispensa se o alimento estiver enquadrado nos Art. 23–25 da RDC 429/2020 (ex.: in natura, minimamente processado ou embalagem &lt; 100 cm² isenta).
              </p>
            </div>
          </div>
          {onUpdateRecipe && (
            <button
              type="button"
              onClick={() => onUpdateRecipe({ isExemptFromLupa: false })}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Aplicar Lupa Sugerida
            </button>
          )}
        </div>
      )}

      {/* Grade Principal: Tabela de Limites + Sugestão Automática de Lupa */}
      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-12' : 'xl:grid-cols-12'} gap-4 items-start`}>
        {/* Tabela Estruturada de Verificação */}
        <div className={`${compact ? 'lg:col-span-8' : 'xl:col-span-8'} overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg`}>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                <th className="py-2 px-3 font-semibold">Nutriente Crítico</th>
                <th className="py-2 px-2.5 font-semibold text-right whitespace-nowrap">
                  Calculado ({lupa.thresholds.baseLabel})
                </th>
                <th className="py-2 px-2.5 font-semibold text-right whitespace-nowrap">
                  Limite RDC 429
                </th>
                <th className="py-2 px-2.5 font-semibold text-right whitespace-nowrap">
                  % do Limite
                </th>
                <th className="py-2 px-2.5 font-semibold text-right whitespace-nowrap">
                  Margem / Excesso
                </th>
                <th className="py-2 px-3 font-semibold">Parecer &amp; Lupa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lupa.checks.map((check) => {
                const isExceeds = check.status === 'exceeds';
                const isNear = check.status === 'near_limit';
                const isMissing = check.status === 'missing_data';
                const barWidth =
                  check.percentOfLimit === null ? 0 : Math.min(100, Math.max(2, check.percentOfLimit));

                return (
                  <tr
                    key={check.key}
                    className={
                      isExceeds
                        ? 'bg-rose-50/75 dark:bg-rose-950/25'
                        : isNear
                          ? 'bg-amber-50/60 dark:bg-amber-950/20'
                          : 'bg-white dark:bg-slate-900'
                    }
                  >
                    <td className="py-2.5 px-3 align-top">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {check.label}
                      </div>
                      {/* Barra proporcional de uso do limite regulatório */}
                      <div className="mt-1.5 w-full max-w-[140px] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isExceeds
                              ? 'bg-rose-600'
                              : isNear
                                ? 'bg-amber-500'
                                : isMissing
                                  ? 'bg-slate-400'
                                  : 'bg-emerald-600'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>

                    <td
                      className={`py-2.5 px-2.5 text-right align-top font-mono tabular-nums font-bold whitespace-nowrap ${
                        isExceeds
                          ? 'text-rose-700 dark:text-rose-300'
                          : isNear
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div>
                        {check.formattedPer100} {check.rawPer100 !== null ? check.unit : ''}
                      </div>
                      {check.rawPer100 !== null && (
                        <div className="text-[10px] font-normal text-slate-500">
                          bruto {check.rawPer100.toFixed(1).replace('.', ',')} {check.unit}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-2.5 text-right align-top font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      &ge; {check.threshold} {check.unit}
                    </td>

                    <td
                      className={`py-2.5 px-2.5 text-right align-top font-mono tabular-nums font-bold whitespace-nowrap ${
                        isExceeds
                          ? 'text-rose-700 dark:text-rose-300'
                          : isNear
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {check.percentOfLimit !== null
                        ? `${check.percentOfLimit.toFixed(1).replace('.', ',')}%`
                        : 'N/I'}
                    </td>

                    <td
                      className={`py-2.5 px-2.5 text-right align-top font-mono tabular-nums font-semibold whitespace-nowrap ${
                        isExceeds
                          ? 'text-rose-700 dark:text-rose-300'
                          : isNear
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {formatDeltaDisplay(check)}
                    </td>

                    <td className="py-2.5 px-3 align-top min-w-[200px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isExceeds && (
                          <>
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400 shrink-0" />
                            <span className="text-rose-800 dark:text-rose-200">
                              ALTO EM {check.lupaClaim}
                            </span>
                          </>
                        )}
                        {isNear && (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                            <span className="text-amber-800 dark:text-amber-200">
                              Próximo ao limite
                            </span>
                          </>
                        )}
                        {check.status === 'within_limit' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                            <span className="text-emerald-800 dark:text-emerald-200">
                              Abaixo do corte
                            </span>
                          </>
                        )}
                        {isMissing && (
                          <>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300">
                              Dado ausente
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {check.recommendationText}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Coluna Lateral: Lupa Frontal Sugerida pelo Motor */}
        <div
          className={`${compact ? 'lg:col-span-4' : 'xl:col-span-4'} border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between gap-3`}
        >
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Lupa Frontal Sugerida (IN 75/2020)
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              {lupa.suggestedClaims.length > 0
                ? lupa.exempted
                  ? 'Dispensa normativa ativa — abaixo estão as alegações sugeridas caso não se enquadre em isenção:'
                  : 'Declaração frontal obrigatória sincronizada automaticamente com a tabela nutricional:'
                : 'Nenhum nutriente atingiu os limites da RDC 429/2020. Lupa Frontal não aplicável.'}
            </p>
          </div>

          <div className="flex items-center justify-center py-2">
            {lupa.suggestedClaims.length > 0 ? (
              <AnvisaLupaBadge
                highAddedSugar={lupa.checks[0].exceedsLimit}
                highSaturatedFat={lupa.checks[1].exceedsLimit}
                highSodium={lupa.checks[2].exceedsLimit}
              />
            ) : (
              <div className="w-full rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Rótulo sem Lupa Frontal
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Todos os limites por {lupa.thresholds.baseLabel} respeitados
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
            Referência: Sólidos &ge;15g açúc. / &ge;6g sat. / &ge;600mg Na · Líquidos &ge;7,5g / &ge;3g / &ge;300mg
          </div>
        </div>
      </div>
    </section>
  );
};
