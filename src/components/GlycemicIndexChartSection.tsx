import React, { useMemo, useState } from 'react';
import { MealPlanMeal, MealFoodEntry } from '../types';
import {
  GLYCEMIC_FOOD_CATEGORIES,
  GLYCEMIC_INDEX_DATABASE,
  GlycemicFoodCategory,
  GlycemicFoodItem
} from '../data/glycemicIndexDatabase';
import {
  classifyGlycemicIndex,
  classifyGlycemicLoad,
  calculatePortionGlycemicMetrics,
  GlycemicLevel
} from '../domain/glycemicCalculations';
import { normalizeTacoSearchText } from '../data/tacoCompleteDatabase';
import {
  Search,
  ArrowUpDown,
  ArrowDownRight,
  Minus,
  ArrowUpRight,
  RotateCcw,
  Plus,
  Check,
  Info,
  Scale,
  BookOpen
} from 'lucide-react';

interface GlycemicIndexChartSectionProps {
  meals: MealPlanMeal[];
  onAddFoodToMeal?: (mealIndex: number, entry: MealFoodEntry) => void;
}

type SortKey = 'name' | 'gi-asc' | 'gi-desc' | 'gl-asc' | 'gl-desc' | 'carbs-desc';
type LevelFilterMetric = 'gi' | 'gl' | 'both';

const LEVEL_STYLES: Record<
  GlycemicLevel,
  {
    surface: string;
    activeFilterSurface: string;
    badge: string;
    bar: string;
    text: string;
    accentNum: string;
  }
> = {
  low: {
    surface:
      'bg-emerald-50/75 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-600',
    activeFilterSurface:
      'bg-emerald-100/90 dark:bg-emerald-950/75 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/25',
    badge:
      'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700',
    bar: 'bg-emerald-600 dark:bg-emerald-500',
    text: 'text-emerald-800 dark:text-emerald-300',
    accentNum: 'text-emerald-700 dark:text-emerald-300'
  },
  medium: {
    surface:
      'bg-amber-50/75 dark:bg-amber-950/35 border-amber-200 dark:border-amber-800/80 hover:border-amber-400 dark:hover:border-amber-600',
    activeFilterSurface:
      'bg-amber-100/90 dark:bg-amber-950/75 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/25',
    badge:
      'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
    bar: 'bg-amber-500 dark:bg-amber-400',
    text: 'text-amber-800 dark:text-amber-300',
    accentNum: 'text-amber-700 dark:text-amber-300'
  },
  high: {
    surface:
      'bg-rose-50/75 dark:bg-rose-950/35 border-rose-200 dark:border-rose-800/80 hover:border-rose-400 dark:hover:border-rose-600',
    activeFilterSurface:
      'bg-rose-100/90 dark:bg-rose-950/75 border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/25',
    badge:
      'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700',
    bar: 'bg-rose-600 dark:bg-rose-500',
    text: 'text-rose-800 dark:text-rose-300',
    accentNum: 'text-rose-700 dark:text-rose-300'
  }
};

function LevelIcon({ level, className = 'w-3.5 h-3.5' }: { level: GlycemicLevel; className?: string }) {
  if (level === 'low') return <ArrowDownRight className={className} aria-hidden="true" />;
  if (level === 'medium') return <Minus className={className} aria-hidden="true" />;
  return <ArrowUpRight className={className} aria-hidden="true" />;
}

export const GlycemicIndexChartSection: React.FC<GlycemicIndexChartSectionProps> = ({
  meals,
  onAddFoodToMeal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | GlycemicFoodCategory>('Todas');
  const [levelFilter, setLevelFilter] = useState<'all' | GlycemicLevel>('all');
  const [levelMetric, setLevelMetric] = useState<LevelFilterMetric>('gi');
  const [sortBy, setSortBy] = useState<SortKey>('gi-asc');

  const [selectedFood, setSelectedFood] = useState<GlycemicFoodItem>(GLYCEMIC_INDEX_DATABASE[0]);
  const [customGrams, setCustomGrams] = useState<number>(GLYCEMIC_INDEX_DATABASE[0].standardServingG);
  const [targetMealIndex, setTargetMealIndex] = useState<number>(0);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts = new Map<GlycemicFoodCategory, number>();
    for (const item of GLYCEMIC_INDEX_DATABASE) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    }
    return counts;
  }, []);

  const bandCounts = useMemo(() => {
    const counts: Record<GlycemicLevel, { gi: number; gl: number }> = {
      low: { gi: 0, gl: 0 },
      medium: { gi: 0, gl: 0 },
      high: { gi: 0, gl: 0 }
    };
    for (const item of GLYCEMIC_INDEX_DATABASE) {
      counts[classifyGlycemicIndex(item.glycemicIndex).level].gi += 1;
      counts[classifyGlycemicLoad(item.glycemicLoad).level].gl += 1;
    }
    return counts;
  }, []);

  const filteredFoods = useMemo(() => {
    const query = normalizeTacoSearchText(searchTerm.trim());
    const terms = query ? query.split(/\s+/).filter(Boolean) : [];

    const filtered = GLYCEMIC_INDEX_DATABASE.filter((item) => {
      if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false;

      if (levelFilter !== 'all') {
        const giLvl = classifyGlycemicIndex(item.glycemicIndex).level;
        const glLvl = classifyGlycemicLoad(item.glycemicLoad).level;
        if (levelMetric === 'gi' && giLvl !== levelFilter) return false;
        if (levelMetric === 'gl' && glLvl !== levelFilter) return false;
        if (levelMetric === 'both' && giLvl !== levelFilter && glLvl !== levelFilter) return false;
      }

      if (terms.length === 0) return true;
      const haystack = normalizeTacoSearchText(
        `${item.name} ${item.category} ${item.servingLabel} ${item.clinicalNote || ''}`
      );
      return terms.every((t) => haystack.includes(t));
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'gi-asc':
          return a.glycemicIndex - b.glycemicIndex || a.glycemicLoad - b.glycemicLoad;
        case 'gi-desc':
          return b.glycemicIndex - a.glycemicIndex || b.glycemicLoad - a.glycemicLoad;
        case 'gl-asc':
          return a.glycemicLoad - b.glycemicLoad || a.glycemicIndex - b.glycemicIndex;
        case 'gl-desc':
          return b.glycemicLoad - a.glycemicLoad || b.glycemicIndex - a.glycemicIndex;
        case 'carbs-desc':
          return b.carbsPerServingG - a.carbsPerServingG;
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'pt-BR');
      }
    });
  }, [searchTerm, selectedCategory, levelFilter, levelMetric, sortBy]);

  const portionMetrics = useMemo(
    () =>
      calculatePortionGlycemicMetrics({
        glycemicIndex: selectedFood.glycemicIndex,
        standardServingG: selectedFood.standardServingG,
        carbsPerServingG: selectedFood.carbsPerServingG,
        fiberPerServingG: selectedFood.fiberPerServingG,
        customGrams
      }),
    [selectedFood, customGrams]
  );

  const handleSelectFood = (item: GlycemicFoodItem) => {
    setSelectedFood(item);
    setCustomGrams(item.standardServingG);
    setAddedFeedback(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setLevelFilter('all');
    setLevelMetric('gi');
    setSortBy('gi-asc');
  };

  const handleAddSelectedToMeal = () => {
    if (!onAddFoodToMeal || meals.length === 0) return;
    const safeMealIdx = Math.min(Math.max(0, targetMealIndex), meals.length - 1);
    const factor = portionMetrics.grams / selectedFood.standardServingG;
    const entry: MealFoodEntry = {
      id: `gi-entry-${Date.now()}`,
      foodId: selectedFood.id,
      name: `${selectedFood.name} (IG ${selectedFood.glycemicIndex} · CG ${portionMetrics.glycemicLoad})`,
      grams: portionMetrics.grams,
      caloriesKcal: Math.round(selectedFood.kcalPerServing * factor),
      proteinG: Math.round(selectedFood.proteinPerServingG * factor * 10) / 10,
      carbsG: portionMetrics.carbsG,
      fatG: Math.round(selectedFood.fatPerServingG * factor * 10) / 10,
      fiberG: portionMetrics.fiberG
    };
    onAddFoodToMeal(safeMealIdx, entry);
    setAddedFeedback(
      `${selectedFood.name} (${portionMetrics.grams}g) incluído em ${meals[safeMealIdx].name}.`
    );
  };

  const hasActiveFilter = searchTerm.trim() !== '' || selectedCategory !== 'Todas' || levelFilter !== 'all';

  return (
    <div className="space-y-5">
      {/* Cabeçalho da Tabela de Consulta & Referência de Faixas em Destaque */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[#004f28] dark:text-emerald-400">
                Consulta Clínica IG &amp; CG
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Escala Glicose = 100</span>
              <span aria-hidden="true">·</span>
              <span>Referência University of Sydney / Glycemic-Index.net</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              Tabela de Índice Glicêmico (IG) e Carga Glicêmica (CG)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Consulte rapidamente a velocidade de elevação glicêmica (<strong className="font-semibold text-slate-800 dark:text-slate-200">IG</strong>) e o impacto metabólico real pela quantidade de carboidrato na porção (<strong className="font-semibold text-slate-800 dark:text-slate-200">CG = IG × Carboidrato ÷ 100</strong>). Clique nas faixas abaixo para filtrar.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Base catalogada</div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {GLYCEMIC_INDEX_DATABASE.length} alimentos · {GLYCEMIC_FOOD_CATEGORIES.length} grupos
              </div>
            </div>
          </div>
        </div>

        {/* 3 Faixas de Destaque Semântico (Clicáveis como Filtro Rápido) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            [
              {
                level: 'low' as GlycemicLevel,
                title: 'Baixo Impacto Glicêmico',
                giRange: 'IG ≤ 55',
                glRange: 'CG ≤ 10',
                guidance: 'Absorção gradual e menor pico insulínico pós-prandial.',
                countGi: bandCounts.low.gi,
                countGl: bandCounts.low.gl
              },
              {
                level: 'medium' as GlycemicLevel,
                title: 'Impacto Moderado',
                giRange: 'IG 56 – 69',
                glRange: 'CG 11 – 19',
                guidance: 'Resposta intermediária; ajuste a porção ou associe fibras e proteínas.',
                countGi: bandCounts.medium.gi,
                countGl: bandCounts.medium.gl
              },
              {
                level: 'high' as GlycemicLevel,
                title: 'Alto Impacto Glicêmico',
                giRange: 'IG ≥ 70',
                glRange: 'CG ≥ 20',
                guidance: 'Elevação rápida da glicemia; atenção redobrada em RI, DM2 e SOP.',
                countGi: bandCounts.high.gi,
                countGl: bandCounts.high.gl
              }
            ] as const
          ).map((band) => {
            const isSelected = levelFilter === band.level;
            const st = LEVEL_STYLES[band.level];
            return (
              <button
                key={band.level}
                type="button"
                onClick={() => setLevelFilter((prev) => (prev === band.level ? 'all' : band.level))}
                aria-pressed={isSelected}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004f28] ${
                  isSelected ? st.activeFilterSurface : st.surface
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${st.text}`}>
                    <LevelIcon level={band.level} className="w-4 h-4 shrink-0" />
                    <span>{band.title}</span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {band.countGi} IG · {band.countGl} CG
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 font-mono tabular-nums text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span className={`px-2 py-0.5 rounded ${st.badge}`}>{band.giRange}</span>
                  <span className={`px-2 py-0.5 rounded ${st.badge}`}>{band.glRange}</span>
                </div>

                <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {band.guidance}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Área Principal: Tabela (8 cols) + Simulador de Porção & Conduta (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Coluna Esquerda: Controles de Busca/Ordenação e Tabela Completa */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Barra de Filtros */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Busca */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  aria-label="Buscar alimento na tabela de Índice Glicêmico"
                  placeholder="Buscar alimento (ex.: arroz, batata, melancia, pão)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004f28]/30 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              {/* Grupo Alimentar */}
              <div className="sm:col-span-4">
                <select
                  aria-label="Filtrar por grupo alimentar"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as 'Todas' | GlycemicFoodCategory)
                  }
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004f28]/30"
                >
                  <option value="Todas">Todos os grupos ({GLYCEMIC_INDEX_DATABASE.length})</option>
                  {GLYCEMIC_FOOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({categoryCounts.get(cat) || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenação */}
              <div className="sm:col-span-3 relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <select
                  aria-label="Ordenar tabela glicêmica"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="w-full pl-8 pr-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004f28]/30"
                >
                  <option value="gi-asc">Menor IG primeiro</option>
                  <option value="gi-desc">Maior IG primeiro</option>
                  <option value="gl-asc">Menor CG primeiro</option>
                  <option value="gl-desc">Maior CG primeiro</option>
                  <option value="carbs-desc">Mais Carboidratos</option>
                  <option value="name">Ordem alfabética (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Sub-barra de critério do filtro de cor e contagem */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Aplicar filtro de faixa em:
                </span>
                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {(
                    [
                      { id: 'gi', label: 'Índice (IG)' },
                      { id: 'gl', label: 'Carga (CG)' },
                      { id: 'both', label: 'IG ou CG' }
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLevelMetric(opt.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        levelMetric === opt.id
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {filteredFoods.length} de {GLYCEMIC_INDEX_DATABASE.length} exibidos
                </span>
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#004f28] dark:text-emerald-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpar filtros</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabela Responsiva com Algarismos Tabulares e Cores em Destaque */}
          <div className="overflow-x-auto max-h-[38rem] overflow-y-auto custom-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th scope="col" className="py-3 pl-4 pr-3 min-w-[210px]">
                    Alimento e Medida Caseira
                  </th>
                  <th scope="col" className="py-3 px-2.5 text-right whitespace-nowrap">
                    Porção
                  </th>
                  <th scope="col" className="py-3 px-2.5 text-right whitespace-nowrap">
                    Carbo (g)
                  </th>
                  <th scope="col" className="py-3 px-3 min-w-[165px]">
                    Índice Glicêmico (IG)
                  </th>
                  <th scope="col" className="py-3 pl-2.5 pr-4 text-right min-w-[130px]">
                    Carga Glicêmica (CG)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredFoods.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-4 text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Nenhum alimento encontrado para os critérios selecionados
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tente outro termo de busca ou remova o filtro de faixa clicada.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 px-4 py-1.5 rounded-lg bg-[#004f28] text-white text-xs font-semibold hover:bg-[#003c1e] cursor-pointer"
                      >
                        Restaurar lista completa
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredFoods.map((item) => {
                    const giMeta = classifyGlycemicIndex(item.glycemicIndex);
                    const glMeta = classifyGlycemicLoad(item.glycemicLoad);
                    const giStyle = LEVEL_STYLES[giMeta.level];
                    const glStyle = LEVEL_STYLES[glMeta.level];
                    const isSelected = selectedFood.id === item.id;
                    const barWidth = Math.min(100, Math.max(4, item.glycemicIndex));

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectFood(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectFood(item);
                          }
                        }}
                        tabIndex={0}
                        aria-selected={isSelected}
                        className={`transition-colors cursor-pointer focus:outline-none focus-visible:bg-emerald-50/70 dark:focus-visible:bg-emerald-950/40 ${
                          isSelected
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/35'
                            : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Alimento + metadados limpos sem pílulas */}
                        <td className="py-2.5 pl-4 pr-3 align-middle">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.clinicalNote && (
                              <span
                                title={item.clinicalNote}
                                className="text-slate-400 hover:text-[#004f28] dark:hover:text-emerald-400 shrink-0"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{item.category}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{item.servingLabel}</span>
                            {item.fiberPerServingG > 0 && (
                              <>
                                <span aria-hidden="true"> · </span>
                                <span className="font-mono tabular-nums">
                                  Fibra {item.fiberPerServingG.toFixed(1)}g
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Porção */}
                        <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 align-middle whitespace-nowrap">
                          {item.standardServingG}g
                        </td>

                        {/* Carboidratos */}
                        <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200 align-middle whitespace-nowrap">
                          {item.carbsPerServingG.toFixed(1)}g
                        </td>

                        {/* Índice Glicêmico com Barra Colorida + Rótulo Explícito */}
                        <td className="py-2.5 px-3 align-middle">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${giStyle.badge}`}
                            >
                              <LevelIcon level={giMeta.level} className="w-3 h-3 shrink-0" />
                              <span>{giMeta.shortLabel}</span>
                            </span>
                            <span
                              className={`font-mono tabular-nums font-bold text-sm ${giStyle.accentNum}`}
                            >
                              {item.glycemicIndex}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${giStyle.bar}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </td>

                        {/* Carga Glicêmica em Destaque */}
                        <td className="py-2.5 pl-2.5 pr-4 text-right align-middle whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <span
                              className={`font-mono tabular-nums font-bold text-sm ${glStyle.accentNum}`}
                            >
                              {item.glycemicLoad.toFixed(1)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${glStyle.badge}`}
                            >
                              <LevelIcon level={glMeta.level} className="w-3 h-3 shrink-0" />
                              <span>{glMeta.shortLabel}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coluna Direita: Simulador Dinâmico de Porção & Prescrição */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 lg:sticky lg:top-20">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004f28] dark:text-emerald-400">
                <Scale className="w-4 h-4 shrink-0" />
                <span>Simulador de Carga na Porção</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                Porção real
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1.5 leading-snug">
              {selectedFood.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedFood.category} · Ref: {selectedFood.servingLabel}
            </p>
          </div>

          {/* Controle de Gramatura Prescrita */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="glycemic-custom-grams"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Porção consumida / prescrita (g ou ml)
              </label>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Padrão: {selectedFood.standardServingG}g
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="glycemic-custom-grams"
                type="number"
                min={1}
                max={2000}
                value={customGrams}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomGrams(Number.isFinite(val) ? Math.max(1, Math.min(2000, val)) : 1);
                  setAddedFeedback(null);
                }}
                className="w-28 px-3 py-2 text-sm font-mono tabular-nums font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004f28]/30"
              />
              <div className="flex-1 flex items-center gap-1">
                {[0.5, 1, 1.5, 2].map((mult) => {
                  const targetG = Math.max(1, Math.round(selectedFood.standardServingG * mult));
                  const active = customGrams === targetG;
                  return (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => {
                        setCustomGrams(targetG);
                        setAddedFeedback(null);
                      }}
                      className={`flex-1 py-2 rounded-lg border text-[11px] font-mono tabular-nums font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#004f28] text-white border-[#004f28]'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {mult}x
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resultado Destacado: IG Fixo vs CG Recalculada */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-xl border ${LEVEL_STYLES[portionMetrics.giClass.level].surface}`}
            >
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Índice Glicêmico
              </div>
              <div
                className={`text-2xl font-extrabold font-mono tabular-nums mt-0.5 ${
                  LEVEL_STYLES[portionMetrics.giClass.level].accentNum
                }`}
              >
                {selectedFood.glycemicIndex}
              </div>
              <div
                className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold ${
                  LEVEL_STYLES[portionMetrics.giClass.level].text
                }`}
              >
                <LevelIcon level={portionMetrics.giClass.level} className="w-3.5 h-3.5" />
                <span>{portionMetrics.giClass.label}</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border ${LEVEL_STYLES[portionMetrics.glClass.level].surface}`}
            >
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Carga na Porção ({portionMetrics.grams}g)
              </div>
              <div
                className={`text-2xl font-extrabold font-mono tabular-nums mt-0.5 ${
                  LEVEL_STYLES[portionMetrics.glClass.level].accentNum
                }`}
              >
                {portionMetrics.glycemicLoad.toFixed(1)}
              </div>
              <div
                className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold ${
                  LEVEL_STYLES[portionMetrics.glClass.level].text
                }`}
              >
                <LevelIcon level={portionMetrics.glClass.level} className="w-3.5 h-3.5" />
                <span>{portionMetrics.glClass.label}</span>
              </div>
            </div>
          </div>

          {/* Detalhamento Numérico da Porção */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs font-mono tabular-nums">
            <div className="flex justify-between">
              <span className="font-sans text-slate-600 dark:text-slate-400">
                Carboidratos disponíveis:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {portionMetrics.carbsG.toFixed(1)} g
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-600 dark:text-slate-400">
                Fibras alimentares:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {portionMetrics.fiberG.toFixed(1)} g
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-sans">Cálculo CG:</span>
              <span>
                ({selectedFood.glycemicIndex} × {portionMetrics.carbsG.toFixed(1)}) ÷ 100 ={' '}
                {portionMetrics.glycemicLoad.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Nota Clínica (quando aplicável) */}
          {selectedFood.clinicalNote && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-[#004f28] dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{selectedFood.clinicalNote}</p>
            </div>
          )}

          {/* Integração opcional direta com o cardápio ativo do paciente */}
          {onAddFoodToMeal && meals.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <label
                htmlFor="glycemic-target-meal"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
              >
                Prescrever esta porção em uma refeição:
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="glycemic-target-meal"
                  value={targetMealIndex}
                  onChange={(e) => {
                    setTargetMealIndex(parseInt(e.target.value, 10) || 0);
                    setAddedFeedback(null);
                  }}
                  className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004f28]/30"
                >
                  {meals.map((meal, idx) => (
                    <option key={meal.id} value={idx}>
                      {meal.name} ({meal.time})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddSelectedToMeal}
                  className="px-4 py-2 rounded-lg bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Incluir</span>
                </button>
              </div>

              {addedFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{addedFeedback}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
