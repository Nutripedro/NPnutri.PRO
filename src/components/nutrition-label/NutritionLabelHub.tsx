import React, { useEffect, useMemo, useState } from 'react';
import {
  AnvisaFoodEntry,
  AnvisaProductLabel,
  TechnicalSheetRecipe
} from '../../types';
import { ANVISA_FOOD_DATABASE } from '../../data/anvisaFoodDatabase';
import {
  ANVISA_REGULATORY_RULES,
  calculateRecipeNutrition,
  INITIAL_NUTRITION_RECIPES
} from '../../domain/anvisaLabelEngine';
import { apiClient } from '../../lib/api';
import { AnvisaOfficialLabelPreview } from './AnvisaOfficialLabelPreview';
import { AiRecipeGeneratorView } from './AiRecipeGeneratorView';
import { ManualTechnicalSheetView } from './ManualTechnicalSheetView';
import { FoodDatabaseExplorerView } from './FoodDatabaseExplorerView';
import { Rdc429RegulatoryPanel } from './Rdc429RegulatoryPanel';
import { AnvisaPrintReportModal } from './AnvisaPrintReportModal';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Command,
  Copy,
  Database,
  FileSpreadsheet,
  FolderOpen,
  History,
  PenTool,
  Plus,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  XCircle
} from 'lucide-react';

type HubSubView =
  | 'inicio'
  | 'ia'
  | 'manual'
  | 'receitas'
  | 'banco'
  | 'rotulos'
  | 'configuracoes';

interface NutritionLabelHubProps {
  legacyLabelData?: AnvisaProductLabel;
  onSyncLegacyLabel?: (label: AnvisaProductLabel) => void;
  authorName?: string;
}

const SLASH_COMMANDS = [
  { cmd: '/criar-tabela-ia', desc: 'Abrir gerador inteligente por texto, planilha ou imagem', view: 'ia' as HubSubView },
  { cmd: '/criar-tabela-manual', desc: 'Abrir editor de ficha técnica manual', view: 'manual' as HubSubView },
  { cmd: '/importar-receita', desc: 'Importar ficha técnica TXT, CSV, PDF ou imagem', view: 'ia' as HubSubView },
  { cmd: '/calcular-composicao', desc: 'Recalcular ficha técnica e nutrientes por ingrediente', view: 'manual' as HubSubView },
  { cmd: '/calcular-porcao', desc: 'Ajustar tamanho da porção e medida caseira', view: 'manual' as HubSubView },
  { cmd: '/calcular-100g', desc: 'Alternar base sólida para cálculo por 100 g', action: 'set_solid' },
  { cmd: '/calcular-100ml', desc: 'Alternar base líquida para cálculo por 100 ml', action: 'set_liquid' },
  { cmd: '/verificar-lupa', desc: 'Auditar obrigatoriedade da Lupa Frontal ANVISA', view: 'rotulos' as HubSubView },
  { cmd: '/gerar-rotulo', desc: 'Visualizar e configurar modelo oficial do rótulo P&B', view: 'rotulos' as HubSubView },
  { cmd: '/editar-tabela', desc: 'Editar ingredientes, perdas e rendimento na ficha técnica', view: 'manual' as HubSubView },
  { cmd: '/comparar-receitas', desc: 'Comparar duas receitas lado a lado', action: 'open_compare' },
  { cmd: '/gerar-ficha-tecnica', desc: 'Abrir ficha técnica completa para impressão/PDF', view: 'rotulos' as HubSubView },
  { cmd: '/exportar-pdf', desc: 'Ir para exportação de rótulo e ficha em PDF', view: 'rotulos' as HubSubView },
  { cmd: '/exportar-png', desc: 'Ir para exportação de rótulo em PNG alta resolução', view: 'rotulos' as HubSubView },
  { cmd: '/auditar-rotulo', desc: 'Abrir painel de auditoria normativa em 3 níveis', view: 'rotulos' as HubSubView },
  { cmd: '/imprimir-relatorio', desc: 'Abrir relatório A4 formatado da tabela nutricional para impressão', action: 'print_report' }
];

export const NutritionLabelHub: React.FC<NutritionLabelHubProps> = ({
  onSyncLegacyLabel,
  authorName = 'Dra. Gabriela Santos'
}) => {
  const [subView, setSubView] = useState<HubSubView>('inicio');
  const [recipes, setRecipes] = useState<TechnicalSheetRecipe[]>(INITIAL_NUTRITION_RECIPES);
  const [customFoods, setCustomFoods] = useState<AnvisaFoodEntry[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string>(INITIAL_NUTRITION_RECIPES[0].id);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareRecipeId, setCompareRecipeId] = useState<string>(
    INITIAL_NUTRITION_RECIPES[1]?.id || INITIAL_NUTRITION_RECIPES[0].id
  );
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [showPrintReport, setShowPrintReport] = useState(false);

  const fullFoodDatabase = useMemo(
    () => [...customFoods, ...ANVISA_FOOD_DATABASE],
    [customFoods]
  );

  // Carregar receitas e alimentos customizados persistidos no backend Express
  useEffect(() => {
    apiClient
      .getNutritionRecipes()
      .then((data) => {
        if (Array.isArray(data.recipes) && data.recipes.length > 0) {
          setRecipes(data.recipes);
          setActiveRecipeId((prev) =>
            data.recipes.some((r) => r.id === prev) ? prev : data.recipes[0].id
          );
          if (data.recipes.length > 1) {
            setCompareRecipeId(data.recipes[1].id);
          }
        }
        if (Array.isArray(data.customFoods)) {
          setCustomFoods(data.customFoods);
        }
      })
      .catch(() => {
        // Fallback gracioso para receitas iniciais em memória
      });
  }, []);

  const activeRecipe = useMemo(
    () => recipes.find((r) => r.id === activeRecipeId) || recipes[0],
    [recipes, activeRecipeId]
  );

  const calculated = useMemo(
    () => calculateRecipeNutrition(activeRecipe, fullFoodDatabase),
    [activeRecipe, fullFoodDatabase]
  );

  const compareRecipe = useMemo(
    () => recipes.find((r) => r.id === compareRecipeId) || recipes[0],
    [recipes, compareRecipeId]
  );

  const compareCalculated = useMemo(
    () => calculateRecipeNutrition(compareRecipe, fullFoodDatabase),
    [compareRecipe, fullFoodDatabase]
  );

  // Sincronizar resumo com o estado legado da aplicação principal quando houver mudança
  useEffect(() => {
    if (!onSyncLegacyLabel) return;
    onSyncLegacyLabel({
      productName: activeRecipe.name,
      portionGrams: activeRecipe.portionSize,
      householdMeasure: activeRecipe.householdMeasure,
      portionsPerPackage: activeRecipe.portionsPerPackage,
      energyKcal100g: Math.round(calculated.per100g.energyKcal || 0),
      energyKcalPortion: Math.round(calculated.perPortion.energyKcal || 0),
      carbs100g: Number((calculated.per100g.carbsG || 0).toFixed(1)),
      totalSugars100g: Number((calculated.per100g.totalSugarsG || 0).toFixed(1)),
      addedSugars100g: Number((calculated.per100g.addedSugarsG || 0).toFixed(1)),
      protein100g: Number((calculated.per100g.proteinG || 0).toFixed(1)),
      totalFat100g: Number((calculated.per100g.totalFatG || 0).toFixed(1)),
      saturatedFat100g: Number((calculated.per100g.saturatedFatG || 0).toFixed(1)),
      transFat100g: Number((calculated.per100g.transFatG || 0).toFixed(1)),
      fiber100g: Number((calculated.per100g.fiberG || 0).toFixed(1)),
      sodium100gMg: Math.round(calculated.per100g.sodiumMg || 0),
      highAddedSugar: calculated.lupa.highAddedSugar,
      highSaturatedFat: calculated.lupa.highSaturatedFat,
      highSodium: calculated.lupa.highSodium,
      ingredientsList:
        activeRecipe.ingredientsDeclarationOverride || calculated.suggestedIngredientsList,
      allergensWarning: `${
        activeRecipe.allergensDeclarationOverride || calculated.suggestedAllergensList
      } ${calculated.suggestedGlutenText}`
    });
  }, [activeRecipe, calculated, onSyncLegacyLabel]);

  const notify = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3200);
  };

  const handleUpdateActiveRecipe = (next: TechnicalSheetRecipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === next.id ? next : r)));
  };

  const handlePatchActiveRecipe = (patch: Partial<TechnicalSheetRecipe>) => {
    handleUpdateActiveRecipe({ ...activeRecipe, ...patch });
  };

  const handleSaveActiveRecipe = async (bumpVersion = false) => {
    setIsSaving(true);
    try {
      const nextVersion = bumpVersion ? activeRecipe.version + 1 : activeRecipe.version;
      const historyEntry = bumpVersion
        ? [
            {
              version: activeRecipe.version,
              savedAt: new Date().toISOString(),
              authorName,
              summary: `Versão salva (${activeRecipe.ingredients.length} ingredientes, porção ${activeRecipe.portionSize}${activeRecipe.portionUnit})`,
              portionSize: activeRecipe.portionSize,
              finalYieldGrams: calculated.finalYieldGrams,
              energyKcal100g: Math.round(calculated.per100g.energyKcal || 0)
            },
            ...(activeRecipe.versionHistory || [])
          ]
        : activeRecipe.versionHistory || [];

      const payload: TechnicalSheetRecipe = {
        ...activeRecipe,
        version: nextVersion,
        versionHistory: historyEntry,
        updatedAt: new Date().toISOString()
      };

      const existsOnServer = recipes.some((r) => r.id === payload.id);
      let saved: TechnicalSheetRecipe;
      if (existsOnServer) {
        try {
          saved = await apiClient.updateNutritionRecipe(payload.id, payload);
        } catch {
          saved = await apiClient.saveNutritionRecipe(payload);
        }
      } else {
        saved = await apiClient.saveNutritionRecipe(payload);
      }

      handleUpdateActiveRecipe(saved);
      notify(bumpVersion ? `Nova versão v${saved.version} salva no servidor.` : 'Ficha técnica salva com sucesso.');
    } catch (err: any) {
      notify(err?.message || 'Alterações mantidas localmente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBlankManual = () => {
    const now = new Date().toISOString();
    const blank: TechnicalSheetRecipe = {
      id: `rec-${Date.now()}`,
      name: 'Nova Preparação',
      category: 'Preparação Própria',
      physicalState: 'solido',
      ingredients: [],
      waterLossPercent: 0,
      oilAbsorptionG: 0,
      finalYieldGrams: 100,
      useManualYield: false,
      portionSize: 50,
      portionUnit: 'g',
      householdMeasure: '1 porção',
      portionsPerPackage: 2,
      packageNetWeightG: 100,
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
    setRecipes((prev) => [blank, ...prev]);
    setActiveRecipeId(blank.id);
    setSubView('manual');
  };

  const handleApplyAiRecipe = async (newRecipe: TechnicalSheetRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
    setActiveRecipeId(newRecipe.id);
    setSubView('manual');
    try {
      const saved = await apiClient.saveNutritionRecipe(newRecipe);
      setRecipes((prev) => prev.map((r) => (r.id === newRecipe.id ? saved : r)));
      setActiveRecipeId(saved.id);
      notify('Receita interpretada aplicada e salva.');
    } catch {
      notify('Receita aplicada na ficha técnica.');
    }
  };

  const handleDuplicateRecipe = async (source: TechnicalSheetRecipe) => {
    const now = new Date().toISOString();
    const copy: TechnicalSheetRecipe = {
      ...source,
      id: `rec-${Date.now()}`,
      name: `${source.name} (Cópia)`,
      status: 'rascunho',
      version: 1,
      versionHistory: [],
      createdAt: now,
      updatedAt: now
    };
    setRecipes((prev) => [copy, ...prev]);
    setActiveRecipeId(copy.id);
    try {
      await apiClient.saveNutritionRecipe(copy);
    } catch {
      // ok
    }
    notify('Receita duplicada.');
  };

  const handleDeleteRecipe = async (id: string) => {
    if (recipes.length <= 1) {
      notify('Mantenha ao menos uma receita na biblioteca.');
      return;
    }
    const remaining = recipes.filter((r) => r.id !== id);
    setRecipes(remaining);
    if (activeRecipeId === id) {
      setActiveRecipeId(remaining[0].id);
    }
    try {
      await apiClient.deleteNutritionRecipe(id);
    } catch {
      // ok
    }
    notify('Receita removida.');
  };

  const executeSlashCommand = (item: (typeof SLASH_COMMANDS)[number]) => {
    setShowCommandModal(false);
    setCommandQuery('');
    if (item.view) {
      setSubView(item.view);
    } else if (item.action === 'set_solid') {
      handlePatchActiveRecipe({ physicalState: 'solido', portionUnit: 'g' });
      setSubView('manual');
    } else if (item.action === 'set_liquid') {
      handlePatchActiveRecipe({ physicalState: 'liquido', portionUnit: 'ml' });
      setSubView('manual');
    } else if (item.action === 'open_compare') {
      setCompareMode(true);
      setSubView('receitas');
    } else if (item.action === 'print_report') {
      setShowPrintReport(true);
    }
  };

  // Valores por porção para os 4 cards coloridos inspirados na referência visual
  const portionEnergyRow = calculated.rows.find((r) => r.key === 'energy');
  const portionCarbRow = calculated.rows.find((r) => r.key === 'carbs');
  const portionProtRow = calculated.rows.find((r) => r.key === 'protein');
  const portionSodiumRow = calculated.rows.find((r) => r.key === 'sodium');

  const greenCount = calculated.auditIssues.filter((i) => i.tier === 'green').length;
  const yellowCount = calculated.auditIssues.filter((i) => i.tier === 'yellow').length;
  const redCount = calculated.auditIssues.filter((i) => i.tier === 'red').length;

  const filteredRecipes = useMemo(() => {
    const q = recipeSearch.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(
      (r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    );
  }, [recipes, recipeSearch]);

  const filteredCommands = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (c) => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [commandQuery]);

  return (
    <>
    <div className={showPrintReport ? 'space-y-5 print:hidden' : 'space-y-5'}>
      {/* Top Bar Contract (3 Zonas: Wordmark · Navegação 1-linha · Ações) */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setSubView('inicio')}
          className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          NUTRITION LABEL <span className="text-orange-600">AI</span>
        </button>

        <nav
          aria-label="Navegação do Gerador de Rótulos"
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5"
        >
          {(
            [
              { id: 'inicio', label: 'Início' },
              { id: 'ia', label: 'Criar por IA' },
              { id: 'manual', label: 'Criar manualmente' },
              { id: 'receitas', label: 'Minhas receitas' },
              { id: 'banco', label: 'Banco de alimentos' },
              { id: 'rotulos', label: 'Meus rótulos' },
              { id: 'configuracoes', label: 'Configurações' }
            ] as Array<{ id: HubSubView; label: string }>
          ).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => setSubView(nav.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                subView === nav.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCommandModal(true)}
            title="Comandos rápidos (/)"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Command className="w-3.5 h-3.5" />
            <span>/</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrintReport(true)}
            aria-label="Imprimir Relatório da Tabela Nutricional ANVISA"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Imprimir Relatório</span>
          </button>
          <button
            type="button"
            onClick={handleCreateBlankManual}
            className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar nova tabela</span>
          </button>
        </div>
      </header>

      {saveToast && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center justify-between"
        >
          <span>{saveToast}</span>
          <button type="button" onClick={() => setSaveToast(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: INÍCIO / DASHBOARD (Referência Visual ROTULAGEM.png)          */}
      {/* ===================================================================== */}
      {subView === 'inicio' && (
        <div className="space-y-6">
          {/* Hero + Ações Principais + Cards de Composição & Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Esquerda: Ação Direta + 4 Cards Coloridos + Minhas Receitas */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Tabelas nutricionais e rótulos ANVISA com precisão clínica
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                    Crie por inteligência artificial a partir de uma receita ou monte a ficha técnica manual com cálculo determinístico em TACO/TBCA, arredondamentos da IN 75/2020 e Lupa Frontal.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSubView('ia')}
                      className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Criar por IA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView('manual')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Criar manualmente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView('banco')}
                      className="px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Banco de alimentos</span>
                    </button>
                  </div>
                </div>

                {/* 4 Cards de Composição por Porção (Laranja / Verde / Azul / Violeta conforme referência visual) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Receita ativa: <strong className="text-slate-900 dark:text-white">{activeRecipe.name}</strong>
                    </span>
                    <span className="font-mono tabular-nums">
                      Porção de {activeRecipe.portionSize} {activeRecipe.portionUnit} ({activeRecipe.householdMeasure})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-orange-200 bg-orange-50/70 dark:bg-orange-950/30 dark:border-orange-900/60 p-3.5">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Valor Energético
                      </div>
                      <div className="mt-1 text-xl font-extrabold font-mono tabular-nums text-orange-600 dark:text-orange-400">
                        {portionEnergyRow?.formattedPortion} kcal
                      </div>
                      <div className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500">
                        {portionEnergyRow?.formatted100g} kcal / {activeRecipe.physicalState === 'liquido' ? '100 ml' : '100 g'}
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-900/60 p-3.5">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Carboidratos
                      </div>
                      <div className="mt-1 text-xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        {portionCarbRow?.formattedPortion} g
                      </div>
                      <div className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500">
                        {portionCarbRow?.formatted100g} g / {activeRecipe.physicalState === 'liquido' ? '100 ml' : '100 g'}
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-900/60 p-3.5">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Proteínas
                      </div>
                      <div className="mt-1 text-xl font-extrabold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                        {portionProtRow?.formattedPortion} g
                      </div>
                      <div className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500">
                        {portionProtRow?.formatted100g} g / {activeRecipe.physicalState === 'liquido' ? '100 ml' : '100 g'}
                      </div>
                    </div>

                    {(() => {
                      const sodiumExceeded = calculated.lupa.checks.some(
                        (c) => c.key === 'sodium' && c.status === 'exceeds'
                      );
                      return (
                        <div
                          className={`rounded-xl border p-3.5 ${
                            sodiumExceeded
                              ? 'border-rose-300 bg-rose-50/80 dark:bg-rose-950/35 dark:border-rose-800'
                              : 'border-violet-200 bg-violet-50/70 dark:bg-violet-950/30 dark:border-violet-900/60'
                          }`}
                        >
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between gap-1">
                            <span>Sódio</span>
                            {sodiumExceeded && (
                              <AlertOctagon
                                className="w-3.5 h-3.5 text-rose-600 shrink-0"
                                aria-label="Sódio excede limite RDC 429/2020"
                              />
                            )}
                          </div>
                          <div
                            className={`mt-1 text-xl font-extrabold font-mono tabular-nums ${
                              sodiumExceeded
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-violet-600 dark:text-violet-400'
                            }`}
                          >
                            {portionSodiumRow?.formattedPortion} mg
                          </div>
                          <div className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500">
                            {portionSodiumRow?.formatted100g} mg / {activeRecipe.physicalState === 'liquido' ? '100 ml' : '100 g'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Alertas Visuais Imediatos de Limites Excedidos (RDC 429/2020) */}
                  {calculated.lupa.checks.some((c) => c.status === 'exceeds') && (
                    <div
                      role="status"
                      aria-label="Alertas de nutrientes acima do limite RDC 429/2020"
                      className="mt-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/35 px-3.5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs"
                    >
                      <span className="font-bold text-rose-800 dark:text-rose-200 inline-flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Limites RDC 429/2020 excedidos:</span>
                      </span>
                      {calculated.lupa.checks
                        .filter((c) => c.status === 'exceeds')
                        .map((c) => (
                          <span
                            key={c.key}
                            className="inline-flex items-center gap-1 font-mono tabular-nums text-[11px] font-bold text-rose-700 dark:text-rose-300"
                          >
                            <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>
                              {c.label}: {c.formattedPer100} {c.unit} (&ge; {c.threshold} {c.unit})
                            </span>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Painel Minhas Receitas Rápido */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Minhas Receitas ({recipes.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSubView('receitas')}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      Gerenciar todas
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {recipes.slice(0, 4).map((rec) => {
                      const isActive = rec.id === activeRecipe.id;
                      return (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => setActiveRecipeId(rec.id)}
                          className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                            isActive
                              ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {rec.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                            {rec.ingredients.length} ingredientes · v{rec.version} · {rec.portionSize}
                            {rec.portionUnit}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Direita: Visualização Instantânea do Rótulo Oficial ANVISA + Lupa */}
              <div className="lg:col-span-5 space-y-3">
                <AnvisaOfficialLabelPreview
                  recipe={activeRecipe}
                  calculated={calculated}
                  compact={true}
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSubView('manual')}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Editar Ficha Técnica
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView('rotulos')}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 dark:bg-orange-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-orange-700 cursor-pointer"
                  >
                    Abrir Editor & Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Rdc429RegulatoryPanel
            recipe={activeRecipe}
            calculated={calculated}
            onUpdateRecipe={handlePatchActiveRecipe}
            compact={true}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: CRIAR POR IA (MODO A)                                         */}
      {/* ===================================================================== */}
      {subView === 'ia' && (
        <AiRecipeGeneratorView
          foodDatabase={fullFoodDatabase}
          authorName={authorName}
          onApplyToRecipe={handleApplyAiRecipe}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: CRIAÇÃO MANUAL / FICHA TÉCNICA (MODO B) + PREVIEW LATERAL      */}
      {/* ===================================================================== */}
      {subView === 'manual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-8">
              <ManualTechnicalSheetView
                recipe={activeRecipe}
                calculated={calculated}
                foodDatabase={fullFoodDatabase}
                onChangeRecipe={handleUpdateActiveRecipe}
                onSaveRecipe={() => handleSaveActiveRecipe(false)}
                isSaving={isSaving}
              />
            </div>
            <div className="xl:col-span-4 space-y-4">
              <AnvisaOfficialLabelPreview
                recipe={activeRecipe}
                calculated={calculated}
                onUpdateRecipe={handlePatchActiveRecipe}
              />
            </div>
          </div>

          <Rdc429RegulatoryPanel
            recipe={activeRecipe}
            calculated={calculated}
            onUpdateRecipe={handlePatchActiveRecipe}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 4: MINHAS RECEITAS & COMPARAÇÃO LADO A LADO                       */}
      {/* ===================================================================== */}
      {subView === 'receitas' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-orange-600" />
                <span>Minhas Receitas & Histórico de Formulações</span>
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie versões, duplique formulações ou compare duas receitas lado a lado.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="Filtrar receitas..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={() => setCompareMode((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                  compareMode
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{compareMode ? 'Ocultar Comparador' : 'Comparar Receitas'}</span>
              </button>
            </div>
          </div>

          {compareMode && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Receita A
                  </label>
                  <select
                    value={activeRecipe.id}
                    onChange={(e) => setActiveRecipeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Receita B
                  </label>
                  <select
                    value={compareRecipe.id}
                    onChange={(e) => setCompareRecipeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Parâmetro (por 100 g/ml)</th>
                      <th className="py-2 px-3 font-semibold text-right">{activeRecipe.name}</th>
                      <th className="py-2 px-3 font-semibold text-right">{compareRecipe.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                    {calculated.rows.map((rowA, idx) => {
                      const rowB = compareCalculated.rows[idx];
                      const checkA = calculated.lupa.checks.find((c) => c.key === rowA.key);
                      const checkB = compareCalculated.lupa.checks.find((c) => c.key === rowA.key);
                      const aExceeds = checkA?.status === 'exceeds';
                      const bExceeds = checkB?.status === 'exceeds';
                      return (
                        <tr key={rowA.key}>
                          <td className="py-2 pr-3 font-sans text-slate-800 dark:text-slate-200">
                            {rowA.label}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-semibold ${
                              aExceeds ? 'text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/25' : ''
                            }`}
                          >
                            <span className="inline-flex items-center justify-end gap-1">
                              {aExceeds && (
                                <AlertOctagon
                                  className="w-3.5 h-3.5 text-rose-600 shrink-0"
                                  aria-label="Excede limite RDC 429/2020"
                                />
                              )}
                              <span>{rowA.formatted100g}</span>
                            </span>
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-semibold ${
                              bExceeds ? 'text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/25' : ''
                            }`}
                          >
                            <span className="inline-flex items-center justify-end gap-1">
                              {bExceeds && (
                                <AlertOctagon
                                  className="w-3.5 h-3.5 text-rose-600 shrink-0"
                                  aria-label="Excede limite RDC 429/2020"
                                />
                              )}
                              <span>{rowB?.formatted100g ?? '-'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="py-2 pr-3 font-sans font-semibold">Lupa Frontal ANVISA</td>
                      <td className="py-2 px-3 text-right font-sans">
                        {calculated.lupa.required ? 'Obrigatória' : 'Dispensada'}
                      </td>
                      <td className="py-2 px-3 text-right font-sans">
                        {compareCalculated.lupa.required ? 'Obrigatória' : 'Dispensada'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((rec) => {
              const calc = calculateRecipeNutrition(rec, fullFoodDatabase);
              const kcal100 = calc.rows.find((r) => r.key === 'energy')?.formatted100g;
              const exceeded = calc.lupa.checks.filter((c) => c.status === 'exceeds');
              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {exceeded.length > 0 && (
                          <AlertOctagon
                            className="w-4 h-4 text-rose-600 shrink-0"
                            aria-label="Possui nutrientes acima do limite RDC 429/2020"
                          />
                        )}
                        <span>{rec.name}</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        v{rec.version}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {rec.category} · {rec.ingredients.length} ingredientes · Porção {rec.portionSize}
                      {rec.portionUnit}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="text-[10px] font-sans text-slate-500">Energia / 100g</div>
                        <div className="font-bold text-slate-900 dark:text-white">{kcal100} kcal</div>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${
                          exceeded.length > 0
                            ? 'bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-50 dark:bg-slate-800'
                        }`}
                      >
                        <div className="text-[10px] font-sans text-slate-500">Lupa Frontal</div>
                        <div
                          className={`font-bold flex items-center gap-1 ${
                            exceeded.length > 0
                              ? 'text-rose-700 dark:text-rose-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {exceeded.length > 0 && <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />}
                          <span>{calc.lupa.required ? 'ALTO EM' : exceeded.length > 0 ? 'Excede' : 'Isento'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRecipeId(rec.id);
                          setSubView('manual');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-orange-600 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRecipeId(rec.id);
                          setSubView('rotulos');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium cursor-pointer"
                      >
                        Rótulo
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRecipe(rec)}
                        title="Duplicar"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecipe(rec.id)}
                        title="Excluir"
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 5: BANCO DE ALIMENTOS (TACO / TBCA / CUSTOM)                     */}
      {/* ===================================================================== */}
      {subView === 'banco' && (
        <FoodDatabaseExplorerView
          foodDatabase={fullFoodDatabase}
          onFoodCreated={(newFood) => {
            setCustomFoods((prev) => [newFood, ...prev]);
            notify(`Alimento "${newFood.name}" cadastrado no banco.`);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW 6: MEUS RÓTULOS, AUDITORIA EM 3 NÍVEIS E EXPORTAÇÃO              */}
      {/* ===================================================================== */}
      {subView === 'rotulos' && (
        <div className="space-y-6">
          <Rdc429RegulatoryPanel
            recipe={activeRecipe}
            calculated={calculated}
            onUpdateRecipe={handlePatchActiveRecipe}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Esquerda: Auditoria em 3 Níveis + Cruzamento Atwater + Histórico de Versões */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-orange-600" />
                    <span>Auditoria Técnica de Conformidade ANVISA</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verificação automática em 3 níveis (Verde, Amarelo e Vermelho) antes da emissão final.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {greenCount} OK
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {yellowCount} Alertas
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {redCount} Bloqueios
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {calculated.auditIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      issue.tier === 'green'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-100'
                        : issue.tier === 'yellow'
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-100'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100'
                    }`}
                  >
                    {issue.tier === 'green' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {issue.tier === 'yellow' && (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    {issue.tier === 'red' && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between gap-2">
                        <span>{issue.title}</span>
                        <span className="text-[10px] font-mono opacity-80 shrink-0">
                          {issue.legalRef}
                        </span>
                      </div>
                      <p className="mt-0.5 opacity-90 leading-relaxed">{issue.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checagem Energética Cruzada & Versionamento */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                  Conferência Atwater (4/4/9): Banco{' '}
                  <strong>{calculated.energyDifferenceCheck.databaseKcal100g} kcal</strong> vs.
                  Calculado{' '}
                  <strong>{calculated.energyDifferenceCheck.atwaterCalculatedKcal100g} kcal</strong>{' '}
                  (Δ {calculated.energyDifferenceCheck.deltaPercent}%)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveActiveRecipe(true)}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Salvar Nova Versão (v{activeRecipe.version + 1})</span>
                  </button>
                  <button
                    type="button"
                    disabled={!calculated.canApproveOfficialLabel}
                    onClick={() => {
                      handlePatchActiveRecipe({ status: 'aprovado' });
                      notify('Rótulo marcado como Aprovado após auditoria técnica.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {activeRecipe.status === 'aprovado' ? 'Aprovado' : 'Aprovar Rótulo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Histórico de Versões */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Histórico de Versões ({activeRecipe.versionHistory?.length || 0})
              </h4>
              {activeRecipe.versionHistory && activeRecipe.versionHistory.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {activeRecipe.versionHistory.map((snap) => (
                    <div key={snap.version} className="py-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          v{snap.version}
                        </span>{' '}
                        · {snap.summary}
                        <div className="text-[11px] text-slate-500">
                          {snap.authorName} · {new Date(snap.savedAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="font-mono tabular-nums text-right text-slate-700 dark:text-slate-300 shrink-0">
                        {snap.energyKcal100g} kcal/100g
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Nenhuma versão anterior arquivada. Clique em "Salvar Nova Versão" ao concluir revisões.
                </p>
              )}
            </div>
          </div>

          {/* Direita: Editor Visual do Rótulo & Exportações */}
          <div className="lg:col-span-6">
            <AnvisaOfficialLabelPreview
              recipe={activeRecipe}
              calculated={calculated}
              onUpdateRecipe={handlePatchActiveRecipe}
            />
          </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 7: CONFIGURAÇÕES & REGRAS REGULATÓRIAS ANVISA VERSIONADAS         */}
      {/* ===================================================================== */}
      {subView === 'configuracoes' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <span>Registro Versionado de Regras Regulatórias (ANVISA)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regras paramétricas aplicadas automaticamente pelo motor matemático determinístico.
                </p>
              </div>
              <Settings className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ANVISA_REGULATORY_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {rule.titulo}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      v{rule.versao}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400">
                    {rule.norma} · {rule.artigoAnexo} ({rule.vigencia})
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rule.regraResumo}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Status de Arquitetura & Persistência</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              • <strong>Motor Matemático & Arredondamentos:</strong> 100% determinístico em TypeScript puro, testado com cobertura unitária para IN 75/2020 Anexo IV e XV.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              • <strong>Interpretação IA (Gemini):</strong> Executada exclusivamente no backend (`/api/nutrition-label/interpret-recipe`) com Structured Outputs para mapear ingredientes sem inventar valores nutricionais.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              • <strong>Persistência Atual:</strong> Banco de dados local do servidor Express (`clinical_store.json`) para receitas, versões e alimentos customizados. Sincronização em nuvem via Firebase Auth/Firestore permanece opcional caso deseje provisioná-la posteriormente.
            </p>
          </div>
        </div>
      )}

      {/* Modal de Comandos Rápidos (/) */}
      {showCommandModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-start justify-center pt-20 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-orange-600 shrink-0" />
              <input
                autoFocus
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Digite um comando (ex.: /criar-tabela-ia, /verificar-lupa, /exportar-pdf)..."
                className="flex-1 text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowCommandModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCommands.map((item) => (
                <button
                  key={item.cmd}
                  type="button"
                  onClick={() => executeSlashCommand(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="font-mono text-xs font-bold text-orange-600">{item.cmd}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    <AnvisaPrintReportModal
      isOpen={showPrintReport}
      onClose={() => setShowPrintReport(false)}
      recipe={activeRecipe}
      calculated={calculated}
    />
    </>
  );
};
