import React, { useState } from 'react';
import {
  AiRecipeInterpretationResponse,
  AnvisaFoodEntry,
  MeasureUnit,
  ProcessingState,
  RecipeIngredientLine,
  TechnicalSheetRecipe
} from '../../types/nutritionLabel';
import { computeIngredientWeights } from '../../domain/anvisaLabelEngine';
import { apiClient } from '../../lib/api';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileUp,
  HelpCircle,
  Loader2,
  Sparkles,
  UploadCloud
} from 'lucide-react';

interface AiRecipeGeneratorViewProps {
  foodDatabase: AnvisaFoodEntry[];
  authorName: string;
  onApplyToRecipe: (recipe: TechnicalSheetRecipe) => void;
}

const EXAMPLE_RECIPES = [
  {
    label: 'Bolo de Cenoura (Exemplo Padrão)',
    text: 'Quero calcular a tabela nutricional de um bolo de cenoura com 300 g de farinha de trigo, 200 g de açúcar refinado, 3 ovos de 50 g, 100 ml de óleo de soja, 250 g de cenoura crua e 12 g de fermento químico. O rendimento final após assar é de 800 g e a receita produz 10 fatias de 80 g.'
  },
  {
    label: 'Cookie Integral com Castanhas',
    text: 'Cookie assado com 200 g de aveia em flocos, 120 g de farinha de trigo integral, 70 g de açúcar mascavo, 60 g de óleo de coco, 50 g de castanha-do-pará e 1 ovo. Rendimento final 475 g, porção de 30 g (2 unidades), embalagem de 450 g (15 porções).'
  },
  {
    label: 'Vitamina Proteica (Líquido)',
    text: 'Bebida pronta líquida com 300 ml de leite integral, 1 banana prata (65 g), 30 g de whey protein concentrado e 15 g de mel de abelha. Rendimento final 410 ml, porção de 200 ml (1 copo), embalagem com 2 porções.'
  }
];

const UNIT_OPTIONS: Array<{ value: MeasureUnit; label: string }> = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'L' },
  { value: 'colher_sopa', label: 'col. sopa' },
  { value: 'colher_cha', label: 'col. chá' },
  { value: 'xicara', label: 'xícara' },
  { value: 'unidade', label: 'unid.' }
];

const PROCESSING_OPTIONS: Array<{ value: ProcessingState; label: string }> = [
  { value: 'cru', label: 'Cru' },
  { value: 'cozido', label: 'Cozido' },
  { value: 'assado', label: 'Assado' },
  { value: 'frito', label: 'Frito' },
  { value: 'desidratado', label: 'Desidratado' },
  { value: 'processado', label: 'Processado' },
  { value: 'liquido_pronto', label: 'Líquido pronto' }
];

interface DraftAiIngredient {
  id: string;
  rawText: string;
  normalizedName: string;
  quantity: number;
  unit: MeasureUnit;
  processingState: ProcessingState;
  selectedFoodId: string | null;
  confidence: number;
  ambiguityQuestion?: string | null;
}

export const AiRecipeGeneratorView: React.FC<AiRecipeGeneratorViewProps> = ({
  foodDatabase,
  authorName,
  onApplyToRecipe
}) => {
  const [recipeText, setRecipeText] = useState<string>(EXAMPLE_RECIPES[0].text);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<{
    base64?: string;
    mimeType?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<AiRecipeInterpretationResponse | null>(null);
  const [draftIngredients, setDraftIngredients] = useState<DraftAiIngredient[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setUploadedFileName(file.name);

    const lower = file.name.toLowerCase();
    if (lower.endsWith('.txt') || lower.endsWith('.csv') || file.type.startsWith('text/')) {
      const content = await file.text();
      setRecipeText((prev) => (prev.trim() ? `${prev}\n\n[Arquivo ${file.name}]:\n${content}` : content));
      setUploadedFileData(null);
      return;
    }

    // Imagens ou PDF: enviar como inlineData para extração multimodal no servidor
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setUploadedFileData({
        base64: result,
        mimeType: file.type || 'image/png'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInterpret = async () => {
    if (!recipeText.trim() && !uploadedFileData?.base64) {
      setErrorMessage('Descreva a receita ou anexe uma ficha técnica antes de interpretar.');
      return;
    }
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const parsed: AiRecipeInterpretationResponse = await apiClient.interpretRecipeWithAI({
        recipeText: recipeText.trim(),
        documentBase64: uploadedFileData?.base64,
        mimeType: uploadedFileData?.mimeType,
        fileName: uploadedFileName || undefined
      });

      setInterpretation(parsed);

      const mapped: DraftAiIngredient[] = (parsed.ingredients || []).map((item, idx) => {
        const matchedFood = item.matchedFoodCode
          ? foodDatabase.find(
              (f) =>
                f.code.toLowerCase() === item.matchedFoodCode?.toLowerCase() ||
                f.id === item.matchedFoodCode
            )
          : undefined;

        return {
          id: `ai-ing-${Date.now()}-${idx}`,
          rawText: item.rawText,
          normalizedName: item.normalizedName,
          quantity: item.quantity > 0 ? item.quantity : item.gramsEstimate || 100,
          unit: item.unit || 'g',
          processingState: item.processingState || 'processado',
          selectedFoodId: matchedFood ? matchedFood.id : null,
          confidence: item.confidence ?? 0.5,
          ambiguityQuestion: item.ambiguityQuestion
        };
      });

      setDraftIngredients(mapped);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Erro ao interpretar receita. Tente detalhar quantidades e unidades ou use o modo manual.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateDraftItem = (id: string, patch: Partial<DraftAiIngredient>) => {
    setDraftIngredients((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleConfirmAndCalculate = () => {
    if (!interpretation) return;

    const lines: RecipeIngredientLine[] = draftIngredients.map((draft) => {
      const food = draft.selectedFoodId
        ? foodDatabase.find((f) => f.id === draft.selectedFoodId)
        : undefined;
      const weights = computeIngredientWeights(draft.quantity, draft.unit, 1, 1, food);

      return {
        id: draft.id,
        foodId: food ? food.id : null,
        foodCode: food?.code,
        name: food ? food.name : draft.normalizedName,
        category: food?.category,
        source: food?.source,
        quantity: draft.quantity,
        unit: draft.unit,
        grossWeightG: weights.grossWeightG,
        correctionFactor: 1,
        netWeightG: weights.netWeightG,
        cookingFactor: 1,
        finalWeightG: weights.finalWeightG,
        processingState: draft.processingState,
        resolutionStatus: food ? 'confirmed' : 'ambiguous',
        ambiguityQuestion: draft.ambiguityQuestion || undefined,
        aiConfidence: draft.confidence
      };
    });

    const yieldG = Math.max(
      1,
      interpretation.estimatedYieldGrams ||
        lines.reduce((acc, l) => acc + l.finalWeightG, 0)
    );
    const portionG = Math.max(1, interpretation.suggestedServingGrams || 50);
    const now = new Date().toISOString();

    const newRecipe: TechnicalSheetRecipe = {
      id: `rec-${Date.now()}`,
      name: interpretation.recipeName || 'Receita Interpretada por IA',
      category: interpretation.category || 'Preparação',
      physicalState: interpretation.physicalState || 'solido',
      ingredients: lines,
      waterLossPercent: 0,
      oilAbsorptionG: 0,
      finalYieldGrams: yieldG,
      useManualYield: true,
      portionSize: portionG,
      portionUnit: interpretation.physicalState === 'liquido' ? 'ml' : 'g',
      householdMeasure: interpretation.suggestedHouseholdMeasure || '1 porção',
      portionsPerPackage:
        interpretation.servingsPerPackage || Math.max(1, Math.round(yieldG / portionG)),
      packageNetWeightG: yieldG,
      layoutModel: 'vertical',
      labelWidthMm: 70,
      labelHeightMm: 110,
      fontScalePercent: 100,
      methodology: 'tabela_composicao',
      isExemptFromLupa: false,
      containsGluten: null,
      containsLactose: false,
      lactoseAbove100mgPer100g: false,
      status: 'rascunho',
      version: 1,
      versionHistory: [],
      authorName,
      createdAt: now,
      updatedAt: now
    };

    onApplyToRecipe(newRecipe);
  };

  const pendingCount = draftIngredients.filter((d) => !d.selectedFoodId).length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Modo A · Gerador Inteligente de Ficha Técnica por IA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              A IA identifica ingredientes, quantidades, unidades e estado de preparo. Todos os cálculos nutricionais e regras da ANVISA são executados pelo motor matemático determinístico.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_RECIPES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setRecipeText(ex.text);
                  setInterpretation(null);
                  setErrorMessage(null);
                }}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Descreva ou cole a receita / ficha técnica
            </label>
            <textarea
              rows={5}
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Ex.: Bolo de cenoura com 300 g de farinha de trigo, 200 g de açúcar, 3 ovos de 50 g, 100 ml de óleo e 250 g de cenoura. Rendimento final 800 g (10 fatias)."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-3">
            <label className="flex-1 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-400 transition-colors bg-slate-50/70 dark:bg-slate-800/40">
              <UploadCloud className="w-6 h-6 text-slate-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Anexar Ficha Técnica / Planilha
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                CSV, TXT, PNG, JPG ou PDF
              </span>
              {uploadedFileName && (
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <FileUp className="w-3.5 h-3.5" />
                  {uploadedFileName}
                </span>
              )}
              <input
                type="file"
                accept=".txt,.csv,.png,.jpg,.jpeg,.pdf"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={handleInterpret}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Interpretando receita...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Interpretar Receita com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Confirmação Estruturada Antes do Cálculo Determinístico */}
      {interpretation && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Confirmação Técnica dos Ingredientes ({interpretation.recipeName})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rendimento identificado: <strong className="font-mono">{interpretation.estimatedYieldGrams} g</strong> · Porção sugerida:{' '}
                <strong className="font-mono">{interpretation.suggestedServingGrams} g</strong> ({interpretation.suggestedHouseholdMeasure}) · Estado:{' '}
                <strong>{interpretation.physicalState === 'liquido' ? 'Líquido (100 ml)' : 'Sólido (100 g)'}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmAndCalculate}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Aplicar na Ficha Técnica e Calcular Tabela</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {interpretation.clarificationsNeeded && interpretation.clarificationsNeeded.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pontos para confirmação técnica antes da rotulagem final:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {interpretation.clarificationsNeeded.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
              {pendingCount} ingrediente(s) sem vínculo automático seguro no banco TACO/TBCA. Selecione o equivalente nutricional abaixo antes de aprovar o rótulo.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-3 font-semibold">Trecho Original / Item</th>
                  <th className="py-2 px-2 font-semibold text-right">Qtd</th>
                  <th className="py-2 px-2 font-semibold">Unidade</th>
                  <th className="py-2 px-2 font-semibold">Estado</th>
                  <th className="py-2 px-2 font-semibold">Alimento Equivalente (TACO / TBCA)</th>
                  <th className="py-2 pl-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {draftIngredients.map((item) => {
                  const isResolved = Boolean(item.selectedFoodId);
                  return (
                    <tr key={item.id} className="align-top">
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.normalizedName}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.rawText}</div>
                        {item.ambiguityQuestion && (
                          <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                            Dúvida: {item.ambiguityQuestion}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateDraftItem(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-20 px-2 py-1 text-right font-mono tabular-nums rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateDraftItem(item.id, { unit: e.target.value as MeasureUnit })
                          }
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-2">
                        <select
                          value={item.processingState}
                          onChange={(e) =>
                            updateDraftItem(item.id, {
                              processingState: e.target.value as ProcessingState
                            })
                          }
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          {PROCESSING_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-2 min-w-[230px]">
                        <select
                          value={item.selectedFoodId || ''}
                          onChange={(e) =>
                            updateDraftItem(item.id, {
                              selectedFoodId: e.target.value || null
                            })
                          }
                          className={`w-full px-2 py-1 rounded border text-xs ${
                            isResolved
                              ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                              : 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                          }`}
                        >
                          <option value="">-- Selecionar no banco TACO / TBCA --</option>
                          {foodDatabase.map((f) => (
                            <option key={f.id} value={f.id}>
                              [{f.source}] {f.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 pl-2 whitespace-nowrap">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
