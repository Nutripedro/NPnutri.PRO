import React, { useState, useMemo } from 'react';
import { Patient, DietPlan, EnergyFormula, DietObjective, BiologicalSex } from '../types';
import { calculateBMR, calculateTDEE } from '../domain/calculations';
import { 
  Calculator, 
  Flame, 
  Zap, 
  Target, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  User, 
  ChevronRight,
  Sparkles,
  PieChart as PieIcon,
  Save,
  RotateCcw
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

interface CalculadoraMacrosAvancadaViewProps {
  patient: Patient;
  dietPlan: DietPlan;
  onUpdateDietPlan: (plan: DietPlan) => void;
  privacyMode?: boolean;
}

export const CalculadoraMacrosAvancadaView: React.FC<CalculadoraMacrosAvancadaViewProps> = ({
  patient,
  dietPlan,
  onUpdateDietPlan,
  privacyMode = false
}) => {
  // Local state for simulation before saving
  const [formula, setFormula] = useState<EnergyFormula>(dietPlan.formula);
  const [activityFactor, setActivityFactor] = useState<number>(dietPlan.activityFactor);
  const [objective, setObjective] = useState<DietObjective>(dietPlan.objective);
  const [proteinGPerKg, setProteinGPerKg] = useState<number>(dietPlan.proteinGPerKg);
  const [fatGPerKg, setFatGPerKg] = useState<number>(dietPlan.fatGPerKg);
  
  // Derived state for the simulation
  const bmr = useMemo(() => {
    // Note: Katch-McArdle needs Lean Body Mass. 
    // In this app, we mock LBM as 52.2 for Dra. Beatriz or calculate a default 78% for others if not provided.
    const lbm = patient.id === 'pat-01' ? 50.8 : (patient.currentWeightKg * 0.78);
    return calculateBMR(formula, patient.currentWeightKg, patient.heightCm, patient.age, patient.sex, lbm);
  }, [formula, patient]);

  const tdee = useMemo(() => calculateTDEE(bmr, activityFactor), [bmr, activityFactor]);

  const caloricDelta = useMemo(() => {
    switch (objective) {
      case 'deficit_agressivo': return -600;
      case 'deficit_moderado': return -350;
      case 'eucalorica': return 0;
      case 'superavit_leve': return 250;
      case 'superavit_hipertrofia': return 500;
      default: return 0;
    }
  }, [objective]);

  const targetCalories = tdee + caloricDelta;

  const macros = useMemo(() => {
    const pGrams = Math.round(patient.currentWeightKg * proteinGPerKg);
    const fGrams = Math.round(patient.currentWeightKg * fatGPerKg);
    const pKcal = pGrams * 4;
    const fKcal = fGrams * 9;
    
    const remainingKcal = Math.max(0, targetCalories - pKcal - fKcal);
    const cGrams = Math.round(remainingKcal / 4);
    const cKcal = cGrams * 4;
    
    const totalCalcKcal = pKcal + fKcal + cKcal;
    
    return {
      protein: { grams: pGrams, kcal: pKcal, pct: Math.round((pKcal / totalCalcKcal) * 100) || 0 },
      fat: { grams: fGrams, kcal: fKcal, pct: Math.round((fKcal / totalCalcKcal) * 100) || 0 },
      carbs: { grams: cGrams, kcal: cKcal, pct: Math.round((cKcal / totalCalcKcal) * 100) || 0 },
      totalKcal: totalCalcKcal,
      carbsGPerKg: Math.round((cGrams / patient.currentWeightKg) * 10) / 10
    };
  }, [patient.currentWeightKg, proteinGPerKg, fatGPerKg, targetCalories]);

  const chartData = [
    { name: 'Proteína', value: macros.protein.kcal, color: '#0ea5e9' },
    { name: 'Gordura', value: macros.fat.kcal, color: '#f43f5e' },
    { name: 'Carboidratos', value: macros.carbs.kcal, color: '#f59e0b' }
  ];

  const handleApplyToPlan = () => {
    onUpdateDietPlan({
      ...dietPlan,
      formula,
      activityFactor,
      objective,
      bmrKcal: bmr,
      tdeeKcal: tdee,
      calorieTargetKcal: targetCalories,
      calorieDeltaKcal: caloricDelta,
      proteinGrams: macros.protein.grams,
      proteinGPerKg,
      proteinPercent: macros.protein.pct,
      carbsGrams: macros.carbs.grams,
      carbsGPerKg: macros.carbsGPerKg,
      carbsPercent: macros.carbs.pct,
      fatGrams: macros.fat.grams,
      fatGPerKg,
      fatPercent: macros.fat.pct
    });
    alert('Simulação energética e de macros aplicada com sucesso ao plano do paciente!');
  };

  const handleReset = () => {
    setFormula(dietPlan.formula);
    setActivityFactor(dietPlan.activityFactor);
    setObjective(dietPlan.objective);
    setProteinGPerKg(dietPlan.proteinGPerKg);
    setFatGPerKg(dietPlan.fatGPerKg);
  };

  const ACTIVITY_FACTORS = [
    { val: 1.2, label: 'Sedentário', desc: 'Trabalho de escritório, pouco exercício' },
    { val: 1.375, label: 'Leve', desc: 'Exercício leve 1-3 dias/semana' },
    { val: 1.55, label: 'Moderado', desc: 'Exercício moderado 3-5 dias/semana' },
    { val: 1.725, label: 'Intenso', desc: 'Exercício intenso 6-7 dias/semana' },
    { val: 1.9, label: 'Extremo', desc: 'Atleta, treino pesado 2x ao dia' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Simulation Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[#004f28] dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-100 dark:border-emerald-900/50">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Calculadora Avançada de GET & Macros</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Paciente: {privacyMode ? 'Confidencial' : patient.name} • {patient.currentWeightKg} kg • {patient.age}a
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar</span>
          </button>
          <button
            onClick={handleApplyToPlan}
            className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-bold rounded-lg flex items-center space-x-2 transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Aplicar ao Plano Clínico</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Energy Parameters */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Step 1: BMR Formula */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">1. Fórmula Metabólica (TMB)</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { id: 'mifflin', label: 'Mifflin-St Jeor', desc: 'Padrão moderno (1990)' },
                { id: 'harris', label: 'Harris-Benedict', desc: 'Revisada Roza & Shizgal (1984)' },
                { id: 'katch', label: 'Katch-McArdle', desc: 'Baseado em Massa Magra (LBM)' },
                { id: 'who', label: 'OMS / FAO / UNU', desc: 'Estratificada por faixa etária (2004)' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormula(f.id as EnergyFormula)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between group ${
                    formula === f.id
                      ? 'border-[#004f28] bg-emerald-50/50 dark:bg-emerald-950/20 text-[#004f28] dark:text-emerald-400 ring-1 ring-[#004f28]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{f.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{f.desc}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${formula === f.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">TMB Estimada</span>
              <div className="flex items-center justify-center space-x-1.5 mt-1">
                <Flame className="w-4 h-4 text-rose-500" />
                <span className="text-2xl font-black font-mono text-white tabular-nums">{bmr}</span>
                <span className="text-xs font-bold text-slate-400">kcal</span>
              </div>
            </div>
          </div>

          {/* Step 2: Activity Factor */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Activity className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">2. Nível de Atividade (FA)</h3>
            </div>

            <div className="space-y-2">
              {ACTIVITY_FACTORS.map(fa => (
                <button
                  key={fa.val}
                  onClick={() => setActivityFactor(fa.val)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                    activityFactor === fa.val
                      ? 'border-sky-600 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 ring-1 ring-sky-600'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs font-mono">
                      {fa.val.toFixed(3)}
                    </span>
                    <div>
                      <div className="font-bold text-xs">{fa.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{fa.desc}</div>
                    </div>
                  </div>
                  {activityFactor === fa.val && <Zap className="w-4 h-4 text-sky-600 animate-pulse" />}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-900 dark:bg-black rounded-xl text-white shadow-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">GET / TDEE Total</span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black font-mono tracking-tighter text-white">{tdee}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">kcal / dia</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">
                Calculado: {bmr} kcal x {activityFactor}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Objective & Macro Simulation */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Left Side: Objective & Final Target */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <Target className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">3. Estratégia & VET Alvo</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'deficit_agressivo', label: 'Déficit Intenso', delta: '-600 kcal', color: 'rose' },
                      { id: 'deficit_moderado', label: 'Déficit Moderado', delta: '-350 kcal', color: 'amber' },
                      { id: 'eucalorica', label: 'Manutenção', delta: 'Eucalórica', color: 'emerald' },
                      { id: 'superavit_leve', label: 'Superávit Leve', delta: '+250 kcal', color: 'sky' },
                      { id: 'superavit_hipertrofia', label: 'Hipertrofia', delta: '+500 kcal', color: 'indigo' }
                    ].map(obj => (
                      <button
                        key={obj.id}
                        onClick={() => setObjective(obj.id as DietObjective)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-center ${
                          objective === obj.id
                            ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-slate-800 text-white font-bold shadow-md scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="text-xs uppercase tracking-wide opacity-80">{obj.label}</div>
                        <div className="text-[11px] font-mono font-black">{obj.delta}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-black text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Prescrição Final Calórica</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-black font-mono tracking-tighter text-white">{targetCalories}</span>
                    <span className="text-sm font-bold text-slate-400 uppercase">kcal/dia</span>
                  </div>
                  <div className="mt-4 flex items-center space-x-3 text-xs font-mono">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-white/5 rounded border border-white/10">
                      <span className="text-slate-500">Saldo:</span>
                      <span className={caloricDelta > 0 ? 'text-emerald-400' : caloricDelta < 0 ? 'text-rose-400' : 'text-sky-400'}>
                        {caloricDelta > 0 ? `+${caloricDelta}` : caloricDelta} kcal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macro Simulation Controls */}
                <div className="space-y-5 pt-2">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <PieIcon className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">4. Partição de Macronutrientes</h3>
                  </div>

                  {/* Protein g/kg */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span className="text-sky-600">Proteína: {proteinGPerKg} g/kg</span>
                      <span className="text-slate-900 dark:text-white tabular-nums">{macros.protein.grams}g ({macros.protein.pct}%)</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={proteinGPerKg}
                      onChange={(e) => setProteinGPerKg(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600"
                    />
                  </div>

                  {/* Fat g/kg */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span className="text-rose-500">Gordura: {fatGPerKg} g/kg</span>
                      <span className="text-slate-900 dark:text-white tabular-nums">{macros.fat.grams}g ({macros.fat.pct}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={fatGPerKg}
                      onChange={(e) => setFatGPerKg(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  {/* Carbs g/kg (Calculated) */}
                  <div className="space-y-2 opacity-80">
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span className="text-amber-500">Carboidratos (Restante): {macros.carbsGPerKg} g/kg</span>
                      <span className="text-slate-900 dark:text-white tabular-nums">{macros.carbs.grams}g ({macros.carbs.pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${macros.carbs.pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Charts & Summary */}
              <div className="flex flex-col justify-center items-center">
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="55%"
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1500}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                          backgroundColor: '#0f172a',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="center" 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '0px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alvo Final</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">{targetCalories}</span>
                    <span className="text-[10px] font-bold text-slate-400">kcal / dia</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 w-full">
                  <div className="text-center p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50">
                    <span className="text-[10px] font-bold text-sky-600 uppercase block mb-1">Proteína</span>
                    <span className="text-xl font-black text-sky-700 dark:text-sky-400 font-mono">{macros.protein.grams}g</span>
                    <span className="text-[10px] font-bold text-sky-500 font-mono">{macros.protein.pct}%</span>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
                    <span className="text-[10px] font-bold text-rose-500 uppercase block mb-1">Gordura</span>
                    <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">{macros.fat.grams}g</span>
                    <span className="text-[10px] font-bold text-rose-400 font-mono">{macros.fat.pct}%</span>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                    <span className="text-[10px] font-bold text-amber-500 uppercase block mb-1">Carbos</span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{macros.carbs.grams}g</span>
                    <span className="text-[10px] font-bold text-amber-400 font-mono">{macros.carbs.pct}%</span>
                  </div>
                </div>

                {/* Insight Box */}
                <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-start space-x-3 w-full">
                  <div className="mt-0.5 shrink-0">
                    <Info className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Raciocínio Clínico</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-500 leading-relaxed mt-1">
                      A simulação com **{formula.toUpperCase()}** e FA de **{activityFactor}** indica um GET de **{tdee} kcal**.
                      Com o objetivo de **{objective.replace('_', ' ')}**, o plano atual prevê um balanço de **{caloricDelta > 0 ? `+${caloricDelta}` : caloricDelta} kcal**.
                      As proteínas foram fixadas em **{proteinGPerKg} g/kg** para maximizar a retenção de nitrogênio e o efeito térmico dos alimentos (TEF).
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
