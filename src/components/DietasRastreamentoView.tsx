import React, { useMemo, useState } from 'react';
import { 
  Patient, 
  DietPlan, 
  DailyFoodLog, 
  EnergyFormula, 
  DietObjective, 
  MealFoodEntry,
  ScheduledReminder 
} from '../types';
import { calculateBMR, calculateTDEE } from '../domain/calculations';
import { CalculadoraMacrosAvancadaView } from './CalculadoraMacrosAvancadaView';
import { TACO_FOOD_DATABASE } from '../data/clinicalData';
import {
  normalizeTacoSearchText,
  TACO_4A_CATEGORIES,
  TACO_COMPLETE_DIET_FOODS,
  TacoDietFoodItem
} from '../data/tacoCompleteDatabase';
import { GLYCEMIC_INDEX_DATABASE } from '../data/glycemicIndexDatabase';
import { GlycemicIndexChartSection } from './GlycemicIndexChartSection';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';
import { 
  Flame, 
  Droplets, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sliders, 
  Search, 
  Trash2, 
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  BellRing,
  Volume2,
  Play,
  Share2,
  ArrowRight,
  Scale,
  Brain,
  Check,
  RotateCcw,
  Loader2,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Wand2,
  ChevronDown,
  ChevronUp,
  Database
} from 'lucide-react';

export interface GeminiAdjustedItem {
  id: string;
  name: string;
  originalGrams: number;
  adjustedGrams: number;
  deltaGrams: number;
  originalCalories: number;
  adjustedCalories: number;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
  adjustedFiber: number;
  unit: string;
  justification: string;
}

export interface GeminiAdjustedMeal {
  id: string;
  name: string;
  time: string;
  consumedToday?: boolean;
  items: GeminiAdjustedItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
}

export interface GeminiDietAdjustmentResult {
  deviationDiagnosis: string;
  rebalanceStrategy: string;
  suggestedMeals: GeminiAdjustedMeal[];
  totalAdjustedCalories: number;
  macroSummary: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number;
  };
  clinicalNotes: string[];
}

interface DietasRastreamentoViewProps {
  patient: Patient;
  dietPlan: DietPlan;
  onUpdateDietPlan: (plan: DietPlan) => void;
  dailyLog: DailyFoodLog;
  onUpdateDailyLog: (log: DailyFoodLog) => void;
  reminders?: ScheduledReminder[];
  onOpenRemindersModal?: () => void;
  onTriggerInstantToast?: (reminder: ScheduledReminder) => void;
}

export const DietasRastreamentoView: React.FC<DietasRastreamentoViewProps> = ({
  patient,
  dietPlan,
  onUpdateDietPlan,
  dailyLog,
  onUpdateDailyLog,
  reminders = [],
  onOpenRemindersModal,
  onTriggerInstantToast
}) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'calculator' | 'cardapio' | 'glycemic'>('tracker');
  const [searchTerm, setSearchTerm] = useState('');
  const [tacoCategoryFilter, setTacoCategoryFilter] = useState<string>('Todas');
  const [visibleFoodLimit, setVisibleFoodLimit] = useState<number>(60);
  const [showTacoMicronutrients, setShowTacoMicronutrients] = useState<boolean>(true);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number>(0);
  const [foodGrams, setFoodGrams] = useState<number>(100);
  const [selectedFood, setSelectedFood] = useState<TacoDietFoodItem | null>(TACO_FOOD_DATABASE[0]);

  // Gemini Portion Rebalance States (Deviation > 15%)
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);
  const [geminiAdjustments, setGeminiAdjustments] = useState<GeminiDietAdjustmentResult | null>(null);
  const [adjustmentNotice, setAdjustmentNotice] = useState<string | null>(null);
  const [isAdjustmentPanelOpen, setIsAdjustmentPanelOpen] = useState<boolean>(true);

  // Calculations for BMR and TDEE
  const currentBmr = calculateBMR(
    dietPlan.formula,
    patient.currentWeightKg,
    patient.heightCm,
    patient.age,
    patient.sex,
    52.2 // Lean mass from anthropometry
  );

  const currentTdee = calculateTDEE(currentBmr, dietPlan.activityFactor);

  // Handle formula change
  const handleFormulaChange = (newFormula: EnergyFormula) => {
    const newBmr = calculateBMR(newFormula, patient.currentWeightKg, patient.heightCm, patient.age, patient.sex, 52.2);
    const newTdee = calculateTDEE(newBmr, dietPlan.activityFactor);
    let delta = 0;
    if (dietPlan.objective === 'deficit_moderado') delta = -350;
    else if (dietPlan.objective === 'deficit_agressivo') delta = -600;
    else if (dietPlan.objective === 'superavit_leve') delta = 250;
    else if (dietPlan.objective === 'superavit_hipertrofia') delta = 500;

    const newTarget = newTdee + delta;

    onUpdateDietPlan({
      ...dietPlan,
      formula: newFormula,
      bmrKcal: newBmr,
      tdeeKcal: newTdee,
      calorieTargetKcal: newTarget,
      calorieDeltaKcal: delta
    });
  };

  // Handle Objective change
  const handleObjectiveChange = (obj: DietObjective) => {
    let delta = 0;
    if (obj === 'deficit_moderado') delta = -350;
    else if (obj === 'deficit_agressivo') delta = -600;
    else if (obj === 'superavit_leve') delta = 250;
    else if (obj === 'superavit_hipertrofia') delta = 500;

    const newTarget = currentTdee + delta;

    // Recalibrate macros based on weight
    const pGrams = Math.round(patient.currentWeightKg * (obj.includes('deficit') ? 2.1 : 1.9));
    const fGrams = Math.round(patient.currentWeightKg * 0.9);
    const pKcal = pGrams * 4;
    const fKcal = fGrams * 9;
    const cKcal = Math.max(0, newTarget - pKcal - fKcal);
    const cGrams = Math.round(cKcal / 4);

    onUpdateDietPlan({
      ...dietPlan,
      objective: obj,
      calorieDeltaKcal: delta,
      calorieTargetKcal: newTarget,
      proteinGrams: pGrams,
      proteinGPerKg: Math.round((pGrams / patient.currentWeightKg) * 10) / 10,
      proteinPercent: Math.round((pKcal / newTarget) * 100),
      carbsGrams: cGrams,
      carbsGPerKg: Math.round((cGrams / patient.currentWeightKg) * 10) / 10,
      carbsPercent: Math.round((cKcal / newTarget) * 100),
      fatGrams: fGrams,
      fatGPerKg: Math.round((fGrams / patient.currentWeightKg) * 10) / 10,
      fatPercent: Math.round((fKcal / newTarget) * 100)
    });
  };

  // Toggle meal consumed in daily tracker
  const handleToggleMealConsumed = (mealId: string) => {
    const updatedMeals = dietPlan.meals.map(m => {
      if (m.id === mealId) {
        return { ...m, consumedToday: !m.consumedToday };
      }
      return m;
    });

    // Recalculate daily totals from consumed meals
    const consumedMeals = updatedMeals.filter(m => m.consumedToday);
    const totalCals = consumedMeals.reduce((acc, m) => acc + m.totalCalories, 0);
    const totalProt = consumedMeals.reduce((acc, m) => acc + m.totalProtein, 0);
    const totalCarb = consumedMeals.reduce((acc, m) => acc + m.totalCarbs, 0);
    const totalFat = consumedMeals.reduce((acc, m) => acc + m.totalFat, 0);
    const totalFib = consumedMeals.reduce((acc, m) => acc + m.totalFiber, 0);

    const updatedLogged = dailyLog.mealsLogged.map(ml => {
      if (ml.mealId === mealId) {
        return { ...ml, consumed: !ml.consumed };
      }
      return ml;
    });

    onUpdateDietPlan({
      ...dietPlan,
      meals: updatedMeals
    });

    onUpdateDailyLog({
      ...dailyLog,
      consumedCaloriesKcal: totalCals,
      consumedProteinG: totalProt,
      consumedCarbsG: totalCarb,
      consumedFatG: totalFat,
      consumedFiberG: totalFib,
      mealsLogged: updatedLogged
    });
  };

  // Add water glass
  const handleWaterChange = (delta: number) => {
    const nextVal = Math.max(0, dailyLog.waterGlassesConsumed + delta);
    onUpdateDailyLog({
      ...dailyLog,
      waterGlassesConsumed: nextVal
    });
  };

  // Add custom MealFoodEntry (shared by TACO builder & IG/CG lookup table)
  const handleAddCustomFoodEntryToMeal = (mealIdx: number, newEntry: MealFoodEntry) => {
    const targetMeal = dietPlan.meals[mealIdx];
    if (!targetMeal) return;
    const updatedItems = [...targetMeal.items, newEntry];

    const mealCals = updatedItems.reduce((acc, i) => acc + i.caloriesKcal, 0);
    const mealProt = Math.round(updatedItems.reduce((acc, i) => acc + i.proteinG, 0));
    const mealCarb = Math.round(updatedItems.reduce((acc, i) => acc + i.carbsG, 0));
    const mealFat = Math.round(updatedItems.reduce((acc, i) => acc + i.fatG, 0));
    const mealFib = Math.round(updatedItems.reduce((acc, i) => acc + i.fiberG, 0));

    const updatedMeals = dietPlan.meals.map((m, idx) => {
      if (idx === mealIdx) {
        return {
          ...m,
          items: updatedItems,
          totalCalories: mealCals,
          totalProtein: mealProt,
          totalCarbs: mealCarb,
          totalFat: mealFat,
          totalFiber: mealFib
        };
      }
      return m;
    });

    onUpdateDietPlan({
      ...dietPlan,
      meals: updatedMeals
    });
  };

  // Add food to meal
  const handleAddFoodToMeal = () => {
    if (!selectedFood) return;
    const factor = foodGrams / selectedFood.portionGrams;
    const newEntry: MealFoodEntry = {
      id: `entry-${Date.now()}`,
      foodId: selectedFood.id,
      name: selectedFood.name,
      grams: foodGrams,
      caloriesKcal: Math.round(selectedFood.caloriesKcal * factor),
      proteinG: Math.round(selectedFood.proteinG * factor * 10) / 10,
      carbsG: Math.round(selectedFood.carbsG * factor * 10) / 10,
      fatG: Math.round(selectedFood.fatG * factor * 10) / 10,
      fiberG: Math.round(selectedFood.fiberG * factor * 10) / 10
    };

    handleAddCustomFoodEntryToMeal(selectedMealIndex, newEntry);
  };

  // Remove food from meal
  const handleRemoveFoodEntry = (mealIdx: number, entryId: string) => {
    const targetMeal = dietPlan.meals[mealIdx];
    const updatedItems = targetMeal.items.filter(i => i.id !== entryId);

    const mealCals = updatedItems.reduce((acc, i) => acc + i.caloriesKcal, 0);
    const mealProt = Math.round(updatedItems.reduce((acc, i) => acc + i.proteinG, 0));
    const mealCarb = Math.round(updatedItems.reduce((acc, i) => acc + i.carbsG, 0));
    const mealFat = Math.round(updatedItems.reduce((acc, i) => acc + i.fatG, 0));
    const mealFib = Math.round(updatedItems.reduce((acc, i) => acc + i.fiberG, 0));

    const updatedMeals = dietPlan.meals.map((m, idx) => {
      if (idx === mealIdx) {
        return {
          ...m,
          items: updatedItems,
          totalCalories: mealCals,
          totalProtein: mealProt,
          totalCarbs: mealCarb,
          totalFat: mealFat,
          totalFiber: mealFib
        };
      }
      return m;
    });

    onUpdateDietPlan({
      ...dietPlan,
      meals: updatedMeals
    });
  };

  // Filtered TACO food list (accent-insensitive + code + official 15 TACO categories)
  const tacoCategoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of TACO_FOOD_DATABASE) {
      counts.set(f.category, (counts.get(f.category) || 0) + 1);
    }
    return TACO_4A_CATEGORIES.map((cat) => ({
      name: cat,
      count: counts.get(cat) || 0
    }));
  }, []);

  const filteredFoods = useMemo(() => {
    const q = normalizeTacoSearchText(searchTerm.trim());
    const terms = q ? q.split(/\s+/).filter(Boolean) : [];
    return TACO_FOOD_DATABASE.filter((f) => {
      if (tacoCategoryFilter !== 'Todas' && f.category !== tacoCategoryFilter) {
        return false;
      }
      if (terms.length === 0) return true;
      const haystack = normalizeTacoSearchText(
        `${f.name} ${f.category} ${f.tacoCode} ${f.sourceLabel}`
      );
      return terms.every((t) => haystack.includes(t));
    });
  }, [searchTerm, tacoCategoryFilter]);

  const visibleFoods = useMemo(
    () => filteredFoods.slice(0, visibleFoodLimit),
    [filteredFoods, visibleFoodLimit]
  );

  const calProgress = Math.min(100, Math.round((dailyLog.consumedCaloriesKcal / dietPlan.calorieTargetKcal) * 100));
  const remainingCals = Math.max(0, dietPlan.calorieTargetKcal - dailyLog.consumedCaloriesKcal);

  // Caloric Deviation calculations for clinical monitoring
  const calorieDeviationKcal = dailyLog.consumedCaloriesKcal - dietPlan.calorieTargetKcal;
  const calorieDeviationPercent = Math.round(
    Math.abs(calorieDeviationKcal / dietPlan.calorieTargetKcal) * 1000
  ) / 10;
  const isSignificantDeviation = calorieDeviationPercent > 15;
  const isUnderEating = calorieDeviationKcal < 0;

  // Request intelligent portion rebalance from Gemini API
  const handleRequestGeminiAdjustment = async () => {
    setIsAdjusting(true);
    setAdjustmentNotice(null);
    try {
      const response = await fetch('/api/gemini/suggest-diet-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patient.name,
          patientWeightKg: patient.currentWeightKg,
          objective: dietPlan.objective,
          calorieTargetKcal: dietPlan.calorieTargetKcal,
          consumedCaloriesKcal: dailyLog.consumedCaloriesKcal,
          deviationPercent: calorieDeviationPercent,
          isUnderEating,
          meals: dietPlan.meals
        })
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor Gemini');
      }

      const data: GeminiDietAdjustmentResult = await response.json();
      setGeminiAdjustments(data);
      setIsAdjustmentPanelOpen(true);
    } catch (err) {
      console.error('[Gemini AI] Adjustment error:', err);
      setAdjustmentNotice('Erro ao calcular rebalanceamento inteligente com Gemini. Tente novamente.');
    } finally {
      setIsAdjusting(false);
    }
  };

  // Apply suggested adjustments to the actual DietPlan
  const handleApplyGeminiAdjustments = () => {
    if (!geminiAdjustments) return;

    const updatedMeals = geminiAdjustments.suggestedMeals.map(sm => {
      const existingMeal = dietPlan.meals.find(m => m.id === sm.id);
      return {
        id: sm.id,
        name: sm.name,
        time: sm.time,
        consumedToday: sm.consumedToday ?? existingMeal?.consumedToday ?? false,
        totalCalories: sm.totalCalories,
        totalProtein: sm.totalProtein,
        totalCarbs: sm.totalCarbs,
        totalFat: sm.totalFat,
        totalFiber: sm.totalFiber,
        items: sm.items.map(si => {
          const origItem = existingMeal?.items.find(i => i.id === si.id);
          return {
            id: si.id,
            foodId: origItem?.foodId || 'custom',
            name: si.name,
            grams: si.adjustedGrams,
            caloriesKcal: si.adjustedCalories,
            proteinG: si.adjustedProtein,
            carbsG: si.adjustedCarbs,
            fatG: si.adjustedFat,
            fiberG: si.adjustedFiber
          };
        })
      };
    });

    onUpdateDietPlan({
      ...dietPlan,
      meals: updatedMeals
    });

    // Recalculate consumed nutrients if any meals were already marked consumed
    const consumedMeals = updatedMeals.filter(m => m.consumedToday);
    const totalCals = consumedMeals.reduce((acc, m) => acc + m.totalCalories, 0);
    const totalProt = consumedMeals.reduce((acc, m) => acc + m.totalProtein, 0);
    const totalCarb = consumedMeals.reduce((acc, m) => acc + m.totalCarbs, 0);
    const totalFat = consumedMeals.reduce((acc, m) => acc + m.totalFat, 0);
    const totalFib = consumedMeals.reduce((acc, m) => acc + m.totalFiber, 0);

    onUpdateDailyLog({
      ...dailyLog,
      consumedCaloriesKcal: totalCals,
      consumedProteinG: totalProt,
      consumedCarbsG: totalCarb,
      consumedFatG: totalFat,
      consumedFiberG: totalFib
    });

    setAdjustmentNotice('Porções e quantidades (g/ml) atualizadas com sucesso no plano alimentar do paciente!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Header & Sub-navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#004f28]/10 text-[#004f28]">
                Módulo Clínico Central
              </span>
              <span className="text-xs text-slate-400 font-mono">Prescrição & Aderência</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Dietas Personalizadas & Rastreamento Calórico Diário
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocolo para {patient.name} • Meta: {dietPlan.calorieTargetKcal} kcal/dia ({dietPlan.objective.replace('_', ' ')})
            </p>
          </div>

          {/* Tab switcher buttons with Interactive Clinical Tooltips */}
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto border border-slate-200 dark:border-slate-700 text-xs">
            <ClinicalTooltip helpId="recordatorio_24h" position="bottom">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'tracker'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>Diário de Ingestão Hoje</span>
                <InfoHelpButton helpId="recordatorio_24h" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>

            <ClinicalTooltip helpId="calculo_nutricional" position="bottom">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'calculator'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>Calculadora TMB & Macros</span>
                <InfoHelpButton helpId="calculo_nutricional" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>

            <ClinicalTooltip helpId="planejamento_alimentar" position="bottom">
              <button
                onClick={() => setActiveTab('cardapio')}
                title={`Tabela TACO Completa (${TACO_COMPLETE_DIET_FOODS.length} alimentos oficiais NEPA/UNICAMP)`}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'cardapio'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>Montador de Cardápio (TACO)</span>
                <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#004f28] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {TACO_COMPLETE_DIET_FOODS.length}
                </span>
                <InfoHelpButton helpId="planejamento_alimentar" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>

            <ClinicalTooltip helpId="indice_glicemico" position="bottom">
              <button
                onClick={() => setActiveTab('glycemic')}
                title={`Tabela de Índice Glicêmico e Carga Glicêmica (${GLYCEMIC_INDEX_DATABASE.length} alimentos)`}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'glycemic'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>Índice & Carga Glicêmica (IG/CG)</span>
                <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#004f28] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {GLYCEMIC_INDEX_DATABASE.length}
                </span>
                <InfoHelpButton helpId="indice_glicemico" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>

            {onOpenRemindersModal && (
              <button
                onClick={onOpenRemindersModal}
                className="px-3 py-1.5 rounded-md font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center space-x-1.5 ml-1 whitespace-nowrap shrink-0"
                title="Configurar lembretes de refeições e água"
              >
                <BellRing className="w-3.5 h-3.5 text-[#004f28]" />
                <span>Lembretes ({reminders.filter(r => r.enabled).length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: DAILY INTAKE TRACKER (User Core Feature) */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Gauges, Calorie Breakdown & Water Counter */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Calorie Progress Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#004f28] flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Ingestão Calórica Diária</h3>
                    <div className="text-[11px] text-slate-400 font-mono">Data: {dailyLog.date}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 bg-emerald-50 text-[#004f28] rounded border border-emerald-100">
                  {calProgress}% Atingido
                </span>
              </div>

              {/* Progress Ring / Bar Display */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                      {dailyLog.consumedCaloriesKcal}
                    </span>
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      / {dietPlan.calorieTargetKcal} kcal
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Restante: {remainingCals} kcal
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#004f28] rounded-full transition-all duration-500"
                    style={{ width: `${calProgress}%` }}
                  />
                </div>
              </div>

              {/* Macro Bars */}
              <div className="mt-5 space-y-3.5">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Macronutrientes Consumidos vs Meta
                </h4>

                {/* Protein */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="font-semibold text-slate-700">Proteínas (4 kcal/g)</span>
                    <span className="text-slate-900 font-bold tabular-nums">
                      {dailyLog.consumedProteinG}g <span className="text-slate-400">/ {dietPlan.proteinGrams}g ({dietPlan.proteinGPerKg} g/kg)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (dailyLog.consumedProteinG / dietPlan.proteinGrams) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="font-semibold text-slate-700">Carboidratos (4 kcal/g)</span>
                    <span className="text-slate-900 font-bold tabular-nums">
                      {dailyLog.consumedCarbsG}g <span className="text-slate-400">/ {dietPlan.carbsGrams}g ({dietPlan.carbsGPerKg} g/kg)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (dailyLog.consumedCarbsG / dietPlan.carbsGrams) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="font-semibold text-slate-700">Lipídios (9 kcal/g)</span>
                    <span className="text-slate-900 font-bold tabular-nums">
                      {dailyLog.consumedFatG}g <span className="text-slate-400">/ {dietPlan.fatGrams}g ({dietPlan.fatGPerKg} g/kg)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (dailyLog.consumedFatG / dietPlan.fatGrams) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fiber */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="font-semibold text-slate-700">Fibras Alimentares</span>
                    <span className="text-slate-900 font-bold tabular-nums">
                      {dailyLog.consumedFiberG}g <span className="text-slate-400">/ {dailyLog.targetFiberG}g</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (dailyLog.consumedFiberG / dailyLog.targetFiberG) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Caloric Deviation Monitor & Gemini Trigger Card */}
            <div className={`rounded-xl border p-5 shadow-xs transition-all ${
              isSignificantDeviation 
                ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSignificantDeviation ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-[#004f28]'
                  }`}>
                    {isSignificantDeviation ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Scale className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Monitor de Desvio Calórico</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Limiar Clínico: ±15%</span>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  isSignificantDeviation
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {isUnderEating ? '-' : '+'}{calorieDeviationPercent}% Desvio
                </span>
              </div>

              {/* Deviation Details */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-slate-500">Balanço do Diário:</span>
                  <span className={`font-bold ${isSignificantDeviation ? 'text-amber-900' : 'text-slate-800'}`}>
                    {calorieDeviationKcal > 0 ? `+${calorieDeviationKcal}` : calorieDeviationKcal} kcal
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isSignificantDeviation ? (
                    <span>
                      <strong>Alerta Clínico:</strong> O diário apresenta variação de <strong>{calorieDeviationPercent}%</strong> em relação à meta ({dietPlan.calorieTargetKcal} kcal), superando a tolerância de 15%.
                      Recomenda-se recalibrar as porções das refeições para restabelecer a conduta.
                    </span>
                  ) : (
                    <span>
                      Aderência calórica dentro da faixa de tolerância fisiológica (&lt; 15% de variação).
                    </span>
                  )}
                </p>

                {/* Gemini Portion Rebalance Button */}
                <button
                  onClick={handleRequestGeminiAdjustment}
                  disabled={isAdjusting}
                  className={`w-full mt-2 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all shadow-xs ${
                    isSignificantDeviation
                      ? 'bg-[#004f28] hover:bg-[#003c1e] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  } disabled:opacity-50`}
                >
                  {isAdjusting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Calibrando Porções com Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Sugerir Ajustes de Porções (Gemini)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Hydration Tracker */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Rastreamento de Hidratação</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Meta: {dietPlan.waterTargetMl} ml (40 ml/kg)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-sky-700 font-mono tabular-nums">
                    {dailyLog.waterGlassesConsumed * 250} ml
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {dailyLog.waterGlassesConsumed} / {dailyLog.waterTargetGlasses} copos
                  </span>
                </div>
              </div>

              {/* Water glasses icons */}
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 my-3">
                {Array.from({ length: dailyLog.waterTargetGlasses }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (i < dailyLog.waterGlassesConsumed) {
                        onUpdateDailyLog({ ...dailyLog, waterGlassesConsumed: i });
                      } else {
                        onUpdateDailyLog({ ...dailyLog, waterGlassesConsumed: i + 1 });
                      }
                    }}
                    className={`h-9 rounded-md flex items-center justify-center border transition-all ${
                      i < dailyLog.waterGlassesConsumed
                        ? 'bg-sky-500 border-sky-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-sky-300'
                    }`}
                    title={`Copo ${i + 1} (250ml)`}
                  >
                    <Droplets className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">Cada copo representa 250ml</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleWaterChange(-1)}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 font-mono font-bold"
                  >
                    - 250ml
                  </button>
                  <button
                    onClick={() => handleWaterChange(1)}
                    className="px-2.5 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 font-mono font-bold"
                  >
                    + 250ml
                  </button>
                </div>
              </div>
            </div>

            {/* Scheduled Reminders & Alerts Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#004f28] flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Lembretes & Notificações Diárias</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Disparo sonoro e alerta no navegador</span>
                  </div>
                </div>

                {onOpenRemindersModal && (
                  <button
                    onClick={onOpenRemindersModal}
                    className="text-xs font-semibold text-[#004f28] hover:text-[#003c1e] hover:underline"
                  >
                    Gerenciar
                  </button>
                )}
              </div>

              {/* Reminders List Preview */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                {reminders.slice(0, 4).map(rem => (
                  <div
                    key={rem.id}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors text-xs font-mono"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-bold text-[#004f28]">{rem.time}</span>
                      <span className="font-sans text-slate-800 truncate">{rem.title}</span>
                      {rem.targetAmount && (
                        <span className="text-[10px] text-slate-400">({rem.targetAmount})</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      {onTriggerInstantToast && (
                        <button
                          onClick={() => onTriggerInstantToast(rem)}
                          className="p-1 text-slate-400 hover:text-[#004f28] hover:bg-white rounded"
                          title="Simular disparo de notificação agora"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      )}
                      <span className={`w-2 h-2 rounded-full ${rem.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                  </div>
                ))}
              </div>

              {reminders.length > 4 && onOpenRemindersModal && (
                <button
                  onClick={onOpenRemindersModal}
                  className="w-full py-1 text-center text-[11px] font-mono text-[#004f28] hover:underline block"
                >
                  Ver todos os {reminders.length} lembretes agendados →
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Daily Meal Checklist & Timeline */}
          <div className="lg:col-span-7 space-y-4">

            {/* Notice / Toast Banner */}
            {adjustmentNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#004f28] shrink-0" />
                  <span className="font-medium">{adjustmentNotice}</span>
                </div>
                <button
                  onClick={() => setAdjustmentNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs ml-3"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Gemini AI Portion Rebalance Panel */}
            {geminiAdjustments && isAdjustmentPanelOpen && (
              <div className="bg-white rounded-xl border border-emerald-300 p-5 shadow-sm space-y-4 ring-1 ring-emerald-200/60 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#004f28] flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4 text-[#004f28]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Rebalanceamento de Porções (g/ml) • Gemini AI
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#004f28]">
                          Desvio &gt; 15%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Meta: {dietPlan.calorieTargetKcal} kcal • Total Ajustado: {geminiAdjustments.totalAdjustedCalories} kcal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={handleApplyGeminiAdjustments}
                      className="px-3.5 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
                      title="Aplicar novas gramaturas ao cardápio"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicar Ajustes ao Cardápio</span>
                    </button>
                    <button
                      onClick={() => setIsAdjustmentPanelOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      title="Fechar painel"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Clinical Strategy Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      Diagnóstico do Desvio
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {geminiAdjustments.deviationDiagnosis}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block font-mono">
                      Estratégia de Rebalanceamento
                    </span>
                    <p className="text-emerald-950 leading-relaxed font-medium">
                      {geminiAdjustments.rebalanceStrategy}
                    </p>
                  </div>
                </div>

                {/* Per-Meal Suggested Food Portions List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ajuste Quantitativo por Alimento (g/ml)
                  </h4>

                  {geminiAdjustments.suggestedMeals.map((meal) => (
                    <div key={meal.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{meal.name}</span>
                          <span className="text-slate-400 text-[11px]">({meal.time})</span>
                        </div>
                        <span className="font-bold text-[#004f28] bg-white px-2 py-0.5 rounded border border-slate-200">
                          Total: {meal.totalCalories} kcal • P: {meal.totalProtein}g • C: {meal.totalCarbs}g • G: {meal.totalFat}g
                        </span>
                      </div>

                      {/* Items table with old vs new grams */}
                      <div className="space-y-1.5">
                        {meal.items.map((item) => {
                          const isIncreased = item.deltaGrams > 0;
                          const isDecreased = item.deltaGrams < 0;
                          return (
                            <div
                              key={item.id}
                              className="p-2 bg-white rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                            >
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-900">{item.name}</span>
                                <span className="text-[11px] text-slate-500 block">
                                  {item.justification}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto font-mono">
                                {/* Old grams */}
                                <span className="text-slate-400 line-through text-[11px]">
                                  {item.originalGrams}g ({item.originalCalories} kcal)
                                </span>

                                <ArrowRight className="w-3 h-3 text-slate-300" />

                                {/* New adjusted grams */}
                                <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                  {item.adjustedGrams}g ({item.adjustedCalories} kcal)
                                </span>

                                {/* Delta badge */}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isIncreased
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : isDecreased
                                      ? 'bg-amber-100 text-amber-900 font-bold'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {item.deltaGrams > 0 ? `+${item.deltaGrams}` : item.deltaGrams}g
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Macro Summary & Notes */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="font-bold text-slate-700">Novos Totais Prescritos:</span>
                    <div className="flex space-x-2">
                      <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-bold">
                        P: {geminiAdjustments.macroSummary.proteinGrams}g
                      </span>
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-bold">
                        C: {geminiAdjustments.macroSummary.carbsGrams}g
                      </span>
                      <span className="text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-bold">
                        G: {geminiAdjustments.macroSummary.fatGrams}g
                      </span>
                      <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                        VET: {geminiAdjustments.totalAdjustedCalories} kcal
                      </span>
                    </div>
                  </div>

                  {geminiAdjustments.clinicalNotes && geminiAdjustments.clinicalNotes.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                      {geminiAdjustments.clinicalNotes.map((note, idx) => (
                        <p key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[#004f28] font-bold">•</span>
                          <span>{note}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action button bottom */}
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={() => setIsAdjustmentPanelOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleApplyGeminiAdjustments}
                    className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar Ajustes ao Cardápio</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Checklist de Refeições Prescritas</h3>
                  <p className="text-xs text-slate-500">
                    Clique para alternar o status de consumo. O somatório calórico e os macros são sincronizados em tempo real.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#004f28] bg-emerald-50 px-2 py-1 rounded">
                    {dietPlan.meals.filter(m => m.consumedToday).length} de {dietPlan.meals.length} Realizadas
                  </span>
                </div>
              </div>

              {/* Meal Cards */}
              <div className="space-y-3.5">
                {dietPlan.meals.map((meal) => {
                  const isConsumed = meal.consumedToday;
                  return (
                    <div
                      key={meal.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isConsumed
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => handleToggleMealConsumed(meal.id)}
                            className="mt-0.5 focus:outline-none"
                            title={isConsumed ? 'Marcar como não consumido' : 'Marcar como consumido'}
                          >
                            {isConsumed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#004f28] fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className={`text-sm font-bold ${isConsumed ? 'text-slate-900' : 'text-slate-700'}`}>
                                {meal.name}
                              </h4>
                              <span className="text-[11px] font-mono text-slate-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                {meal.time}
                              </span>
                            </div>

                            {/* Macro Badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-mono">
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {meal.totalCalories} kcal
                              </span>
                              <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                P: {meal.totalProtein}g
                              </span>
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                C: {meal.totalCarbs}g
                              </span>
                              <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                G: {meal.totalFat}g
                              </span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Fib: {meal.totalFiber}g
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            isConsumed
                              ? 'bg-emerald-100 text-[#004f28]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isConsumed ? 'Consumido' : 'Pendente'}
                        </span>
                      </div>

                      {/* Items details list */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100/80 text-xs space-y-1">
                        {meal.items.map(item => (
                          <div key={item.id} className="flex justify-between text-slate-600 font-mono text-[11px]">
                            <span className="truncate pr-2">
                              • {item.name} ({item.grams}g)
                            </span>
                            <span className="text-slate-400 shrink-0">
                              {item.caloriesKcal} kcal | P: {item.proteinG}g | C: {item.carbsG}g
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Patient Note Box */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#004f28] shrink-0 mt-0.5" />
                <p>
                  <strong>Orientação Clínica:</strong> O consumo fracionado de proteínas em 4 tomadas (mínimo de 32g por refeição) garante o limiar de leucina necessário para manutenção de massa magra em déficit calórico.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ENERGY CALCULATOR & MACRO DISTRIBUTION */}
      {activeTab === 'calculator' && (
        <CalculadoraMacrosAvancadaView
          patient={patient}
          dietPlan={dietPlan}
          onUpdateDietPlan={onUpdateDietPlan}
          privacyMode={false}
        />
      )}


      {/* TAB 3: TACO FOOD BUILDER & MEAL PLANNER */}
      {activeTab === 'cardapio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Complete TACO 4th Edition Food Database Search & Addition */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#004f28] dark:text-emerald-400 shrink-0" />
                    <span>Tabela TACO Completa (4ª Edição)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                    {TACO_COMPLETE_DIET_FOODS.length} alimentos oficiais · {TACO_4A_CATEGORIES.length} grupos
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#004f28] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded shrink-0">
                  NEPA / UNICAMP
                </span>
              </div>

              {/* Search & Category Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    aria-label="Buscar alimento na Tabela TACO completa"
                    placeholder="Buscar por nome ou código (ex.: arroz cozido, TACO-001, patinho)..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setVisibleFoodLimit(60);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004f28]/30"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label="Filtrar por grupo da Tabela TACO"
                    value={tacoCategoryFilter}
                    onChange={(e) => {
                      setTacoCategoryFilter(e.target.value);
                      setVisibleFoodLimit(60);
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#004f28]/30"
                  >
                    <option value="Todas">
                      Todas as categorias ({TACO_FOOD_DATABASE.length})
                    </option>
                    {tacoCategoriesWithCounts.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>

                  {(searchTerm || tacoCategoryFilter !== 'Todas') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setTacoCategoryFilter('Todas');
                        setVisibleFoodLimit(60);
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  <span>
                    {filteredFoods.length} resultado{filteredFoods.length === 1 ? '' : 's'}
                  </span>
                  <span>Valores de referência por 100g</span>
                </div>
              </div>

              {/* Food List */}
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5">
                {visibleFoods.length === 0 ? (
                  <div className="py-6 px-3 text-center text-xs text-slate-500 dark:text-slate-400">
                    Nenhum alimento encontrado na Tabela TACO para os filtros atuais.
                  </div>
                ) : (
                  visibleFoods.map((food) => {
                    const isSelected = selectedFood?.id === food.id;
                    return (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => {
                          setSelectedFood(food);
                          setFoodGrams(food.portionGrams);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 dark:border-emerald-700 text-slate-900 dark:text-slate-100'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{food.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            <span className="font-mono text-slate-600 dark:text-slate-300">
                              {food.tacoCode}
                            </span>{' '}
                            · {food.category}
                          </div>
                        </div>
                        <div className="text-right font-mono tabular-nums text-[11px] text-slate-700 dark:text-slate-200 shrink-0">
                          <div className="font-semibold">{food.caloriesKcal} kcal</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            P:{food.proteinG}g C:{food.carbsG}g G:{food.fatG}g
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}

                {filteredFoods.length > visibleFoods.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleFoodLimit((prev) => prev + 80)}
                    className="w-full py-2 mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Carregar mais ({filteredFoods.length - visibleFoods.length} restantes)
                  </button>
                )}
              </div>

              {/* Selected TACO Food Details & Portion Calculation */}
              {selectedFood && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  {(() => {
                    const factor = foodGrams / selectedFood.portionGrams;
                    const calcKcal = Math.round(selectedFood.caloriesKcal * factor);
                    const calcProt = Math.round(selectedFood.proteinG * factor * 10) / 10;
                    const calcCarb = Math.round(selectedFood.carbsG * factor * 10) / 10;
                    const calcFat = Math.round(selectedFood.fatG * factor * 10) / 10;
                    const calcFib = Math.round(selectedFood.fiberG * factor * 10) / 10;
                    const fmtOpt = (v: number | null, unit: string, isNa?: boolean) => {
                      if (isNa) return 'N/A';
                      if (v === null || v === undefined) return 'N/I';
                      return `${v} ${unit}`;
                    };

                    return (
                      <>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-[#004f28] dark:text-emerald-400">
                                {selectedFood.tacoCode} · {selectedFood.sourceLabel}
                              </span>
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {selectedFood.name}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowTacoMicronutrients((v) => !v)}
                              className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline cursor-pointer shrink-0"
                            >
                              {showTacoMicronutrients ? 'Ocultar micros' : 'Ver micros TACO'}
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 text-center font-mono tabular-nums pt-1">
                            <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-1.5">
                              <div className="text-[9px] font-sans text-slate-500">
                                Energia ({foodGrams}g)
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {calcKcal} kcal
                              </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-1.5">
                              <div className="text-[9px] font-sans text-slate-500">Prot</div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {calcProt} g
                              </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-1.5">
                              <div className="text-[9px] font-sans text-slate-500">Carb</div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {calcCarb} g
                              </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-1.5">
                              <div className="text-[9px] font-sans text-slate-500">Gord</div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {calcFat} g
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                            <span>
                              Base ({selectedFood.portionGrams}g): {selectedFood.caloriesKcal} kcal
                              {selectedFood.energyKj !== null ? ` (${selectedFood.energyKj} kJ)` : ''}
                            </span>
                            <span>Fibra ({foodGrams}g): {calcFib} g</span>
                          </div>

                          {showTacoMicronutrients && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Saturada:</span>
                                <span>{fmtOpt(selectedFood.saturatedFatG, 'g')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Mono:</span>
                                <span>{fmtOpt(selectedFood.monounsaturatedFatG, 'g')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Poli:</span>
                                <span>{fmtOpt(selectedFood.polyunsaturatedFatG, 'g')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Colest.:</span>
                                <span>{fmtOpt(selectedFood.cholesterolMg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Sódio:</span>
                                <span>{fmtOpt(selectedFood.sodiumMg ?? null, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Fibra 100g:</span>
                                <span>
                                  {fmtOpt(selectedFood.fiberG, 'g', selectedFood.fiberNotApplicable)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Cálcio:</span>
                                <span>{fmtOpt(selectedFood.calciumMg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Ferro:</span>
                                <span>{fmtOpt(selectedFood.ironMg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Potássio:</span>
                                <span>{fmtOpt(selectedFood.potassiumMg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Magnésio:</span>
                                <span>{fmtOpt(selectedFood.magnesiumMg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Zinco:</span>
                                <span>{fmtOpt(selectedFood.zincMg, 'mg')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-sans text-slate-500">Vit. C:</span>
                                <span>{fmtOpt(selectedFood.vitaminCMg, 'mg')}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500">Atalhos:</span>
                          {[50, 100, 150, 200].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setFoodGrams(g)}
                              className={`px-2 py-1 rounded border text-[11px] font-mono tabular-nums cursor-pointer ${
                                foodGrams === g
                                  ? 'border-[#004f28] bg-emerald-50 text-[#004f28] font-bold'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              {g}g
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}

                  <div className="flex items-center space-x-2">
                    <div className="w-1/2">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        QUANTIDADE (g)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={foodGrams}
                        onChange={(e) => setFoodGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div className="w-1/2">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        DESTINAR PARA:
                      </label>
                      <select
                        value={selectedMealIndex}
                        onChange={(e) => setSelectedMealIndex(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        {dietPlan.meals.map((m, idx) => (
                          <option key={m.id} value={idx}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddFoodToMeal}
                    className="w-full py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar à Refeição</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Planned Meals Structure */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Refeições Estruturadas</h3>
                <span className="text-xs font-mono text-slate-500">
                  Total Planejado: {dietPlan.meals.reduce((acc, m) => acc + m.totalCalories, 0)} / {dietPlan.calorieTargetKcal} kcal
                </span>
              </div>

              <div className="space-y-4">
                {dietPlan.meals.map((meal, mealIdx) => (
                  <div key={meal.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-800">{meal.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">({meal.time})</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-[#004f28]">
                        {meal.totalCalories} kcal
                      </div>
                    </div>

                    {/* Meal items */}
                    <div className="space-y-1.5 mb-2">
                      {meal.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-100 text-xs font-mono">
                          <div>
                            <span className="font-semibold text-slate-800">{item.name}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">({item.grams}g)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-600 text-[11px]">
                              {item.caloriesKcal} kcal | P:{item.proteinG}g C:{item.carbsG}g G:{item.fatG}g
                            </span>
                            <button
                              onClick={() => handleRemoveFoodEntry(mealIdx, item.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors"
                              title="Remover alimento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: GLYCEMIC INDEX & GLYCEMIC LOAD CONSULTATION TABLE */}
      {activeTab === 'glycemic' && (
        <GlycemicIndexChartSection
          meals={dietPlan.meals}
          onAddFoodToMeal={handleAddCustomFoodEntryToMeal}
        />
      )}

    </div>
  );
};
