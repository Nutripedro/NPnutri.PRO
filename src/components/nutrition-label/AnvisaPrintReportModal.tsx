import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  CalculatedRecipeResult,
  TechnicalSheetRecipe
} from '../../types/nutritionLabel';
import { AnvisaLupaBadge } from './AnvisaOfficialLabelPreview';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  Printer,
  X
} from 'lucide-react';

interface AnvisaPrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: TechnicalSheetRecipe;
  calculated: CalculatedRecipeResult;
}

export const AnvisaPrintReportModal: React.FC<AnvisaPrintReportModalProps> = ({
  isOpen,
  onClose,
  recipe,
  calculated
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const baseHeader = recipe.physicalState === 'liquido' ? '100 ml' : '100 g';
  const portionHeader = `${recipe.portionSize} ${recipe.portionUnit}`;
  const ingredientsText =
    recipe.ingredientsDeclarationOverride?.trim() || calculated.suggestedIngredientsList;
  const allergensText =
    recipe.allergensDeclarationOverride?.trim() || calculated.suggestedAllergensList;
  const methodologyLabel =
    recipe.methodology === 'tabela_composicao'
      ? 'Tabela de Composição (TACO / TBCA)'
      : recipe.methodology === 'calculo_teorico'
        ? 'Cálculo Teórico de Formulação'
        : 'Análise Laboratorial';

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 2) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const slug = recipe.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      pdf.save(`relatorio-anvisa-${slug || 'tabela-nutricional'}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Relatório Otimizado para Impressão — Tabela Nutricional ANVISA"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 print:static print:inset-auto print:overflow-visible print:bg-white print:p-0 print:block"
    >
      <div className="bg-white rounded-2xl max-w-[216mm] w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:overflow-visible">
        {/* Barra de Controles (Oculta na Impressão) */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600 shrink-0" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Relatório Técnico &amp; Tabela Nutricional ANVISA (Formato A4)
              </h3>
              <p className="text-[11px] text-slate-500">
                Layout otimizado para impressão clínica, arquivamento técnico e revisão de rotulagem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'Gerando PDF...' : 'Baixar PDF A4'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Agora</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar pré-visualização de impressão"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Documento Formatado A4 */}
        <div className="overflow-y-auto bg-slate-100 p-4 sm:p-6 print:overflow-visible print:bg-white print:p-0">
          <div
            ref={reportRef}
            className="bg-white text-slate-900 mx-auto max-w-[194mm] p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5 print:border-none print:shadow-none print:p-0 print:max-w-none"
          >
            {/* Cabeçalho Institucional do Relatório */}
            <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Relatório Técnico de Rotulagem Nutricional · RDC 429/2020 &amp; IN 75/2020
                </div>
                <h1 className="text-xl font-extrabold text-slate-950 tracking-tight mt-0.5">
                  {recipe.name}
                </h1>
                <div className="text-xs text-slate-600 mt-0.5">
                  Categoria: <strong className="text-slate-900">{recipe.category}</strong> · Matriz:{' '}
                  <strong className="text-slate-900">
                    {recipe.physicalState === 'liquido' ? 'Líquido (100 ml)' : 'Sólido / Semissólido (100 g)'}
                  </strong>{' '}
                  · Versão <strong className="font-mono">v{recipe.version}</strong>
                </div>
              </div>
              <div className="text-left sm:text-right text-[11px] font-mono text-slate-600 space-y-0.5 shrink-0">
                <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                <div>Responsável: {recipe.authorName}</div>
                <div>Metodologia: {methodologyLabel}</div>
              </div>
            </div>

            {/* Resumo Paramétrico de Rendimento & Porção */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="border border-slate-300 rounded-md px-3 py-2">
                <div className="text-[10px] text-slate-500">Peso Bruto / Líquido</div>
                <div className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                  {calculated.totalRawWeightG} g / {calculated.totalNetWeightG} g
                </div>
              </div>
              <div className="border border-slate-300 rounded-md px-3 py-2">
                <div className="text-[10px] text-slate-500">Rendimento Final</div>
                <div className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                  {calculated.finalYieldGrams} {recipe.portionUnit}
                </div>
              </div>
              <div className="border border-slate-300 rounded-md px-3 py-2">
                <div className="text-[10px] text-slate-500">Porção Declarada</div>
                <div className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                  {recipe.portionSize} {recipe.portionUnit} ({recipe.householdMeasure})
                </div>
              </div>
              <div className="border border-slate-300 rounded-md px-3 py-2">
                <div className="text-[10px] text-slate-500">Porções / Embalagem</div>
                <div className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                  {recipe.portionsPerPackage} porções
                </div>
              </div>
            </div>

            {/* Bloco Central: Tabela Oficial ANVISA P&B + Lupa Frontal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start break-inside-avoid">
              <div className="md:col-span-7">
                <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                  1. Tabela de Informação Nutricional (Padrão Oficial P&amp;B — IN 75/2020)
                </div>
                <div
                  className="bg-white text-black border-2 border-black"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  <div className="border-b-2 border-black px-2.5 py-1.5">
                    <div className="font-black uppercase text-center tracking-tight text-sm leading-tight">
                      INFORMAÇÃO NUTRICIONAL
                    </div>
                    <div className="text-[10.5px] leading-snug mt-0.5">
                      Porções por embalagem: cerca de {recipe.portionsPerPackage}
                    </div>
                    <div className="text-[10.5px] font-bold leading-snug">
                      Porção: {recipe.portionSize} {recipe.portionUnit} ({recipe.householdMeasure})
                    </div>
                  </div>
                  <div className="grid grid-cols-12 font-bold border-b-2 border-black py-1 px-2 text-[10px]">
                    <div className="col-span-6"></div>
                    <div className="col-span-2 text-right">{baseHeader}</div>
                    <div className="col-span-2 text-right">{portionHeader}</div>
                    <div className="col-span-2 text-right">%VD*</div>
                  </div>
                  <div className="divide-y divide-black/40 text-[11px]">
                    {calculated.rows.map((row) => (
                      <div
                        key={row.key}
                        className={`grid grid-cols-12 items-center py-[3.5px] px-2 ${
                          row.isBold ? 'font-bold' : 'font-normal'
                        }`}
                      >
                        <div
                          className="col-span-6 pr-1"
                          style={{
                            paddingLeft:
                              row.indentLevel === 1 ? '10px' : row.indentLevel === 2 ? '18px' : '0px'
                          }}
                        >
                          {row.label}
                        </div>
                        <div className="col-span-2 text-right font-mono tabular-nums">
                          {row.formatted100g}
                        </div>
                        <div className="col-span-2 text-right font-mono tabular-nums">
                          {row.formattedPortion}
                        </div>
                        <div className="col-span-2 text-right font-mono tabular-nums">
                          {row.vdPercent}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t-2 border-black px-2 py-1 text-[8.5px] leading-tight">
                    *Percentual de valores diários fornecidos pela porção. **Valor diário não estabelecido.
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-3">
                <div className="text-[11px] font-bold text-slate-700">
                  2. Rotulagem Nutricional Frontal (Anexo XV)
                </div>
                <div className="border border-slate-300 rounded-lg p-3.5 flex flex-col items-center justify-center min-h-[120px] bg-slate-50/50">
                  {calculated.lupa.required ? (
                    <div className="flex flex-col items-center gap-2">
                      <AnvisaLupaBadge
                        highAddedSugar={calculated.lupa.highAddedSugar}
                        highSaturatedFat={calculated.lupa.highSaturatedFat}
                        highSodium={calculated.lupa.highSodium}
                      />
                      <span className="text-[10px] font-mono text-slate-600 text-center">
                        Aplicação obrigatória no painel principal superior
                      </span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 mx-auto" />
                      <div className="text-xs font-bold text-slate-900">
                        {calculated.lupa.exempted
                          ? 'Dispensado de Lupa Frontal'
                          : 'Isento de Lupa Frontal'}
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-snug">
                        {calculated.lupa.exempted
                          ? calculated.lupa.exemptionReason || 'Dispensa normativa registrada'
                          : `Teores abaixo dos limites de corte por ${calculated.lupa.thresholds.baseLabel}.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Conferência Energética Atwater */}
                <div className="border border-slate-300 rounded-lg p-2.5 text-[11px] space-y-1">
                  <div className="font-bold text-slate-800">Conferência Energética (Atwater)</div>
                  <div className="font-mono tabular-nums text-slate-700">
                    Banco: <strong>{calculated.energyDifferenceCheck.databaseKcal100g} kcal</strong> ·
                    Atwater: <strong>{calculated.energyDifferenceCheck.atwaterCalculatedKcal100g} kcal</strong>{' '}
                    (Δ {calculated.energyDifferenceCheck.deltaPercent}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Parecer do Motor Regulatório RDC 429/2020 */}
            <div className="space-y-1.5 break-inside-avoid">
              <div className="text-[11px] font-bold text-slate-700">
                3. Verificação Automática de Limites Regulatórios (RDC 429/2020)
              </div>
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                    <th className="py-1.5 px-2.5 text-left font-semibold">Nutriente Crítico</th>
                    <th className="py-1.5 px-2 text-right font-semibold">Calculado ({baseHeader})</th>
                    <th className="py-1.5 px-2 text-right font-semibold">Limite RDC 429</th>
                    <th className="py-1.5 px-2 text-right font-semibold">% Limite</th>
                    <th className="py-1.5 px-2.5 text-left font-semibold">Enquadramento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calculated.lupa.checks.map((c) => (
                    <tr key={c.key}>
                      <td className="py-1.5 px-2.5 font-semibold text-slate-900">{c.label}</td>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                        {c.formattedPer100} {c.rawPer100 !== null ? c.unit : ''}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                        &ge; {c.threshold} {c.unit}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums">
                        {c.percentOfLimit !== null
                          ? `${c.percentOfLimit.toFixed(1).replace('.', ',')}%`
                          : 'N/I'}
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          {c.status === 'exceeds' && (
                            <>
                              <AlertOctagon className="w-3 h-3 text-rose-700 shrink-0" />
                              <span className="text-rose-800">EXCEDE — ALTO EM {c.lupaClaim}</span>
                            </>
                          )}
                          {c.status === 'near_limit' && (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                              <span className="text-amber-800">PRÓXIMO DO LIMITE (&ge;85%)</span>
                            </>
                          )}
                          {c.status === 'within_limit' && (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                              <span className="text-emerald-800">CONFORME (ABAIXO DO CORTE)</span>
                            </>
                          )}
                          {c.status === 'missing_data' && (
                            <>
                              <HelpCircle className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="text-slate-600">DADO AUSENTE (N/I)</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Declarações Legais Obrigatórias */}
            <div className="border border-slate-300 rounded-md p-3 text-xs space-y-1.5 break-inside-avoid">
              <div className="text-[11px] font-bold text-slate-700">
                4. Declarações Obrigatórias de Embalagem (RDC 727/2022 · RDC 26/2015 · Lei 10.674/2003)
              </div>
              {ingredientsText && (
                <p className="leading-snug">
                  <strong className="uppercase">Ingredientes: </strong>
                  <span>{ingredientsText}</span>
                </p>
              )}
              <p className="font-bold uppercase leading-snug">{allergensText}</p>
              <p className="font-bold uppercase leading-snug">
                {calculated.suggestedGlutenText}{' '}
                {calculated.suggestedLactoseText && <span>{calculated.suggestedLactoseText}</span>}
              </p>
            </div>

            {/* Composição por Ingrediente da Ficha Técnica */}
            {calculated.ingredientContributions.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700">
                  5. Memória de Cálculo por Ingrediente ({calculated.ingredientContributions.length} itens)
                </div>
                <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                      <th className="py-1.5 px-2 text-left font-semibold">Ingrediente</th>
                      <th className="py-1.5 px-1.5 text-right font-semibold">Líquido (g)</th>
                      <th className="py-1.5 px-1.5 text-right font-semibold">Kcal</th>
                      <th className="py-1.5 px-1.5 text-right font-semibold">Carb (g)</th>
                      <th className="py-1.5 px-1.5 text-right font-semibold">Prot (g)</th>
                      <th className="py-1.5 px-1.5 text-right font-semibold">Gord (g)</th>
                      <th className="py-1.5 px-1.5 text-right font-semibold">Fibra (g)</th>
                      <th className="py-1.5 px-2 text-right font-semibold">Sódio (mg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    {calculated.ingredientContributions.map((item) => (
                      <tr key={item.ingredientId}>
                        <td className="py-1 px-2 font-sans text-slate-900">{item.name}</td>
                        <td className="py-1 px-1.5 text-right">{item.netWeightG.toFixed(1)}</td>
                        <td className="py-1 px-1.5 text-right">{item.kcal ?? 'N/I'}</td>
                        <td className="py-1 px-1.5 text-right">{item.carbsG ?? 'N/I'}</td>
                        <td className="py-1 px-1.5 text-right">{item.proteinG ?? 'N/I'}</td>
                        <td className="py-1 px-1.5 text-right">{item.fatG ?? 'N/I'}</td>
                        <td className="py-1 px-1.5 text-right">{item.fiberG ?? 'N/I'}</td>
                        <td className="py-1 px-2 text-right">{item.sodiumMg ?? 'N/I'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rodapé & Assinatura Técnica */}
            <div className="pt-5 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-[11px] break-inside-avoid">
              <div className="text-slate-600 max-w-md leading-snug">
                Relatório gerado em conformidade com a RDC ANVISA nº 429/2020 e IN ANVISA nº 75/2020.
                Recomenda-se conferência com fichas técnicas de fornecedores antes da impressão gráfica definitiva.
              </div>
              <div className="w-60 text-center pt-4">
                <div className="border-t border-slate-900 pt-1 font-semibold text-slate-900">
                  {recipe.authorName}
                </div>
                <div className="text-[10px] text-slate-500">Responsável Técnico · Nutrição</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
