import React, { useMemo, useState } from 'react';
import {
  AnvisaFoodEntry,
  CalculatedRecipeResult,
  MeasureUnit,
  MethodologyType,
  ProcessingState,
  RecipeIngredientLine,
  TechnicalSheetRecipe
} from '../../types/nutritionLabel';
import { computeIngredientWeights } from '../../domain/anvisaLabelEngine';
import {
  AlertCircle,
  AlertOctagon,
  Copy,
  Plus,
  Search,
  Sparkles,
  Trash2
} from 'lucide-react';

interface ManualTechnicalSheetViewProps {
  recipe: TechnicalSheetRecipe;
  calculated: CalculatedRecipeResult;
  foodDatabase: AnvisaFoodEntry[];
  onChangeRecipe: (next: TechnicalSheetRecipe) => void;
  onSaveRecipe: () => void;
  isSaving?: boolean;
}

const UNIT_OPTIONS: Array<{ value: MeasureUnit; label: string }> = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'L' },
  { value: 'colher_sopa', label: 'Col. Sopa' },
  { value: 'colher_cha', label: 'Col. Chá' },
  { value: 'xicara', label: 'Xícara' },
  { value: 'unidade', label: 'Unidade' }
];

const PROCESSING_OPTIONS: Array<{ value: ProcessingState; label: string }> = [
  { value: 'cru', label: 'Cru' },
  { value: 'cozido', label: 'Cozido' },
  { value: 'assado', label: 'Assado' },
  { value: 'frito', label: 'Frito' },
  { value: 'desidratado', label: 'Desidratado' },
  { value: 'processado', label: 'Processado' },
  { value: 'liquido_pronto', label: 'Líquido' }
];

export const ManualTechnicalSheetView: React.FC<ManualTechnicalSheetViewProps> = ({
  recipe,
  calculated,
  foodDatabase,
  onChangeRecipe,
  onSaveRecipe,
  isSaving = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [newQty, setNewQty] = useState<number>(100);
  const [newUnit, setNewUnit] = useState<MeasureUnit>('g');

  const categories = useMemo(() => {
    const set = new Set<string>(foodDatabase.map((f) => f.category));
    return ['Todas', ...Array.from(set)];
  }, [foodDatabase]);

  const filteredFoods = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return foodDatabase.filter((f) => {
      const catOk = categoryFilter === 'Todas' || f.category === categoryFilter;
      const textOk =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [foodDatabase, searchTerm, categoryFilter]);

  const patchRecipe = (patch: Partial<TechnicalSheetRecipe>) => {
    onChangeRecipe({ ...recipe, ...patch });
  };

  const handleAddIngredient = (food: AnvisaFoodEntry) => {
    const weights = computeIngredientWeights(newQty, newUnit, 1, 1, food);
    const line: RecipeIngredientLine = {
      id: `ing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      foodId: food.id,
      foodCode: food.code,
      name: food.name,
      category: food.category,
      source: food.source,
      quantity: newQty,
      unit: newUnit,
      grossWeightG: weights.grossWeightG,
      correctionFactor: 1,
      netWeightG: weights.netWeightG,
      cookingFactor: 1,
      finalWeightG: weights.finalWeightG,
      processingState: food.processingState,
      resolutionStatus: 'confirmed'
    };

    patchRecipe({ ingredients: [...recipe.ingredients, line] });
  };

  const handleUpdateLine = (lineId: string, updates: Partial<RecipeIngredientLine>) => {
    const nextIngredients = recipe.ingredients.map((line) => {
      if (line.id !== lineId) return line;
      const merged = { ...line, ...updates };
      const food = merged.foodId ? foodDatabase.find((f) => f.id === merged.foodId) : undefined;
      const weights = computeIngredientWeights(
        merged.quantity,
        merged.unit,
        merged.correctionFactor,
        merged.cookingFactor,
        food
      );
      return {
        ...merged,
        name: food ? food.name : merged.name,
        foodCode: food?.code,
        source: food?.source,
        resolutionStatus: food ? ('confirmed' as const) : ('ambiguous' as const),
        grossWeightG: weights.grossWeightG,
        netWeightG: weights.netWeightG,
        finalWeightG: weights.finalWeightG
      };
    });

    patchRecipe({ ingredients: nextIngredients });
  };

  const handleDuplicateLine = (line: RecipeIngredientLine) => {
    const copy: RecipeIngredientLine = {
      ...line,
      id: `ing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };
    patchRecipe({ ingredients: [...recipe.ingredients, copy] });
  };

  const handleDeleteLine = (lineId: string) => {
    patchRecipe({ ingredients: recipe.ingredients.filter((l) => l.id !== lineId) });
  };

  const contributionMap = new Map(
    calculated.ingredientContributions.map((c) => [c.ingredientId, c])
  );

  return (
    <div className="space-y-5">
      {/* Metadados da Preparação & Parâmetros de Porção/Rendimento */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Modo B · Ficha Técnica de Preparação e Rotulagem
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Todos os cálculos atualizam instantaneamente com fatores de correção (FC), cocção, perda hídrica e regras da IN 75/2020.
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveRecipe}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Ficha Técnica'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Nome do Produto / Preparação
            </label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => patchRecipe({ name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Estado Físico (Limiares Lupa)
            </label>
            <select
              value={recipe.physicalState}
              onChange={(e) => {
                const state = e.target.value as 'solido' | 'liquido';
                patchRecipe({
                  physicalState: state,
                  portionUnit: state === 'liquido' ? 'ml' : 'g'
                });
              }}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="solido">Sólido / Semissólido (100 g)</option>
              <option value="liquido">Líquido (100 ml)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Metodologia Declarada
            </label>
            <select
              value={recipe.methodology}
              onChange={(e) => patchRecipe({ methodology: e.target.value as MethodologyType })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="tabela_composicao">Banco TACO / TBCA</option>
              <option value="calculo_teorico">Cálculo Teórico</option>
              <option value="analise_laboratorial">Análise Laboratorial</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Porção ({recipe.portionUnit})
            </label>
            <input
              type="number"
              min={1}
              step="0.5"
              value={recipe.portionSize}
              onChange={(e) => patchRecipe({ portionSize: Math.max(1, Number(e.target.value) || 1) })}
              className="w-full px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Medida Caseira
            </label>
            <input
              type="text"
              value={recipe.householdMeasure}
              onChange={(e) => patchRecipe({ householdMeasure: e.target.value })}
              placeholder="Ex.: 1 fatia média"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Porções por Embalagem
            </label>
            <input
              type="number"
              min={1}
              value={recipe.portionsPerPackage}
              onChange={(e) =>
                patchRecipe({ portionsPerPackage: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-full px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Rendimento Final (g/ml)
              </label>
              <label className="inline-flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recipe.useManualYield}
                  onChange={(e) => patchRecipe({ useManualYield: e.target.checked })}
                />
                Manual
              </label>
            </div>
            <input
              type="number"
              min={1}
              disabled={!recipe.useManualYield}
              value={recipe.useManualYield ? recipe.finalYieldGrams : calculated.estimatedYieldBeforeOverrideG}
              onChange={(e) =>
                patchRecipe({ finalYieldGrams: Math.max(1, Number(e.target.value) || 1) })
              }
              className="w-full px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
            />
          </div>
        </div>

        {/* Perda Hídrica & Absorção de Óleo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">
              Perda por Evaporação / Cocção (%)
            </label>
            <input
              type="number"
              min={0}
              max={85}
              value={recipe.waterLossPercent}
              onChange={(e) =>
                patchRecipe({ waterLossPercent: Math.max(0, Math.min(85, Number(e.target.value) || 0)) })
              }
              className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">
              Absorção de Óleo em Fritura (g)
            </label>
            <input
              type="number"
              min={0}
              value={recipe.oilAbsorptionG}
              onChange={(e) =>
                patchRecipe({ oilAbsorptionG: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-full px-3 py-1.5 font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div className="flex flex-col justify-end text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span>Peso Bruto: {calculated.totalRawWeightG} g</span>
            <span>
              Peso Líquido: {calculated.totalNetWeightG} g · Rend. Efetivo: {calculated.finalYieldGrams} g
            </span>
          </div>
        </div>
      </div>

      {/* Buscador Instantâneo de Ingredientes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar ingrediente TACO / TBCA (ex.: farinha, açúcar, ovo, cenoura, óleo)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0.1}
              step="1"
              value={newQty}
              onChange={(e) => setNewQty(Math.max(0.1, Number(e.target.value) || 0))}
              className="w-20 px-2.5 py-2 text-xs text-right font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              aria-label="Quantidade padrão ao adicionar"
            />
            <select
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value as MeasureUnit)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg">
          {filteredFoods.slice(0, 12).map((food) => (
            <div
              key={food.id}
              className="px-3 py-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {food.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {food.source} · {food.code} · {food.nutrientsPer100g.energyKcal ?? 'N/I'} kcal · Carb{' '}
                  {food.nutrientsPer100g.carbsG ?? 'N/I'}g · Prot{' '}
                  {food.nutrientsPer100g.proteinG ?? 'N/I'}g · Gord{' '}
                  {food.nutrientsPer100g.totalFatG ?? 'N/I'}g / 100g
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAddIngredient(food)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          ))}
          {filteredFoods.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              Nenhum alimento encontrado para "{searchTerm}". Cadastre um novo ingrediente na aba Banco de Alimentos.
            </div>
          )}
        </div>
      </div>

      {/* Tabela Editável da Ficha Técnica */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Ingredientes da Receita ({recipe.ingredients.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Valores calculados proporcionais ao Peso Líquido
          </span>
        </div>

        {calculated.lupa.checks.some((c) => c.status === 'exceeds') && (
          <div
            role="status"
            className="px-4 py-2 bg-rose-50/90 dark:bg-rose-950/35 border-b border-rose-200 dark:border-rose-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
          >
            <span className="inline-flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Alerta RDC 429/2020 ({calculated.lupa.thresholds.baseLabel}):</span>
            </span>
            {calculated.lupa.checks
              .filter((c) => c.status === 'exceeds')
              .map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums font-bold text-rose-700 dark:text-rose-300"
                >
                  <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>
                    {c.label}: {c.formattedPer100} {c.unit} (teto {c.threshold} {c.unit})
                  </span>
                </span>
              ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                <th className="py-2.5 px-3 font-semibold min-w-[200px]">INGREDIENTE</th>
                <th className="py-2.5 px-2 font-semibold text-right">QUANTIDADE</th>
                <th className="py-2.5 px-2 font-semibold">UNIDADE</th>
                <th className="py-2.5 px-2 font-semibold text-right">FC</th>
                <th className="py-2.5 px-2 font-semibold text-right">PESO LÍQ.</th>
                <th className="py-2.5 px-2 font-semibold">ESTADO</th>
                <th className="py-2.5 px-2 font-semibold text-right">KCAL</th>
                <th className="py-2.5 px-2 font-semibold text-right">CARB (g)</th>
                <th className="py-2.5 px-2 font-semibold text-right">PROT (g)</th>
                <th className="py-2.5 px-2 font-semibold text-right">GORD (g)</th>
                <th className="py-2.5 px-2 font-semibold text-right">FIBRA (g)</th>
                <th className="py-2.5 px-2 font-semibold text-right">SÓDIO (mg)</th>
                <th className="py-2.5 px-3 font-semibold text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recipe.ingredients.map((line) => {
                const contrib = contributionMap.get(line.id);
                const isUnlinked = !line.foodId;
                return (
                  <tr
                    key={line.id}
                    className={
                      isUnlinked
                        ? 'bg-rose-50/60 dark:bg-rose-950/20'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }
                  >
                    <td className="py-2 px-3">
                      <select
                        value={line.foodId || ''}
                        onChange={(e) =>
                          handleUpdateLine(line.id, { foodId: e.target.value || null })
                        }
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        <option value="">{line.name} (Sem vínculo)</option>
                        {foodDatabase.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.source})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        value={line.quantity}
                        onChange={(e) =>
                          handleUpdateLine(line.id, {
                            quantity: Math.max(0, Number(e.target.value) || 0)
                          })
                        }
                        className="w-16 px-1.5 py-1 text-right font-mono tabular-nums rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={line.unit}
                        onChange={(e) =>
                          handleUpdateLine(line.id, { unit: e.target.value as MeasureUnit })
                        }
                        className="px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="0.05"
                        min={1}
                        value={line.correctionFactor}
                        onChange={(e) =>
                          handleUpdateLine(line.id, {
                            correctionFactor: Math.max(1, Number(e.target.value) || 1)
                          })
                        }
                        className="w-14 px-1.5 py-1 text-right font-mono tabular-nums rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        title="Fator de Correção (Peso Bruto / Peso Líquido)"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {line.netWeightG.toFixed(1)} g
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={line.processingState}
                        onChange={(e) =>
                          handleUpdateLine(line.id, {
                            processingState: e.target.value as ProcessingState
                          })
                        }
                        className="px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        {PROCESSING_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">
                      {contrib?.kcal ?? 'N/I'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">
                      {contrib?.carbsG ?? 'N/I'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">
                      {contrib?.proteinG ?? 'N/I'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">
                      {contrib?.fatG ?? 'N/I'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">
                      {contrib?.fiberG ?? 'N/I'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">
                      {contrib?.sodiumMg ?? 'N/I'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateLine(line)}
                          title="Duplicar linha"
                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLine(line.id)}
                          title="Remover ingrediente"
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {recipe.ingredients.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-xs text-slate-500">
                    Nenhum ingrediente adicionado. Pesquise no catálogo acima para iniciar a ficha técnica.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Declarações Legais & Conformidade */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Lista de Ingredientes (RDC 727/2022), Alergênicos & Glúten
          </h4>
          <button
            type="button"
            onClick={() =>
              patchRecipe({ ingredientsDeclarationOverride: calculated.suggestedIngredientsList })
            }
            className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ordenar automaticamente por peso líquido</span>
          </button>
        </div>

        <div>
          <textarea
            rows={2}
            value={recipe.ingredientsDeclarationOverride ?? calculated.suggestedIngredientsList}
            onChange={(e) => patchRecipe({ ingredientsDeclarationOverride: e.target.value })}
            className={`w-full px-3 py-2 text-xs rounded-lg border ${
              calculated.ingredientsOrderValid
                ? 'border-slate-200 dark:border-slate-700'
                : 'border-rose-400 bg-rose-50/50'
            } bg-white dark:bg-slate-800`}
          />
          {!calculated.ingredientsOrderValid && (
            <p className="mt-1 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{calculated.ingredientsOrderNotes}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Alergênicos (RDC 26/2015)
            </label>
            <input
              type="text"
              value={recipe.allergensDeclarationOverride ?? calculated.suggestedAllergensList}
              onChange={(e) => patchRecipe({ allergensDeclarationOverride: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-semibold uppercase rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-end gap-4 text-xs pb-1">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  recipe.containsGluten !== null
                    ? recipe.containsGluten
                    : calculated.suggestedGlutenText.startsWith('CONTÉM')
                }
                onChange={(e) => patchRecipe({ containsGluten: e.target.checked })}
              />
              <span>Contém Glúten (Lei 10.674)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={recipe.lactoseAbove100mgPer100g}
                onChange={(e) =>
                  patchRecipe({
                    containsLactose: e.target.checked,
                    lactoseAbove100mgPer100g: e.target.checked
                  })
                }
              />
              <span>Lactose &gt; 100mg/100g</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={recipe.isExemptFromLupa}
                onChange={(e) => patchRecipe({ isExemptFromLupa: e.target.checked })}
              />
              <span>Dispensa legal de Lupa</span>
            </label>
          </div>
        </div>

        {recipe.isExemptFromLupa && (
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Base normativa para dispensa de Lupa Frontal (RDC 429/2020 Art. 23–25)
            </label>
            <input
              type="text"
              value={recipe.exemptionReason || ''}
              onChange={(e) => patchRecipe({ exemptionReason: e.target.value })}
              placeholder="Ex.: Ingrediente único in natura sem adição de açúcar/sódio/gordura"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-amber-50/40"
            />
          </div>
        )}
      </div>
    </div>
  );
};
