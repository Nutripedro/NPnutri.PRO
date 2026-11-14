import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Scale, 
  User, 
  Activity, 
  Dna, 
  ChevronRight, 
  Copy, 
  RefreshCcw, 
  Zap, 
  Target,
  Flame,
  Info,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus
} from 'lucide-react';
import { 
  calculateBMR, 
  calculateTDEE 
} from '../domain/calculations';
import { BiologicalSex, EnergyFormula, DietObjective } from '../types';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip as RechartsTooltip 
} from 'recharts';

interface QuickMacroCalculatorProps {
  initialWeight?: number;
  initialHeight?: number;
  initialAge?: number;
  initialSex?: BiologicalSex;
}

export const QuickMacroCalculator: React.FC<QuickMacroCalculatorProps> = ({
  initialWeight = 70,
  initialHeight = 170,
  initialAge = 30,
  initialSex = 'male'
}) => {
  // Input State
  const [weight, setWeight] = useState(initialWeight);
  const [height, setHeight] = useState(initialHeight);
  const [age, setAge] = useState(initialAge);
  const [sex, setSex] = useState<BiologicalSex>(initialSex);
  const [activityFactor, setActivityFactor] = useState(1.55);
  const [formula, setFormula] = useState<EnergyFormula>('mifflin');
  const [objective, setObjective] = useState<DietObjective>('eucalorica');
  const [calorieDelta, setCalorieDelta] = useState(0);

  // Macro State (g/kg)
  const [proteinGPerKg, setProteinGPerKg] = useState(2.0);
  const [fatGPerKg, setFatGPerKg] = useState(0.8);
  const [carbsGPerKg, setCarbsGPerKg] = useState(3.0);

  // Derived Calculations
  const bmr = useMemo(() => calculateBMR(formula, weight, height, age, sex), [formula, weight, height, age, sex]);
  const tdee = useMemo(() => calculateTDEE(bmr, activityFactor), [bmr, activityFactor]);
  
  const targetCalories = useMemo(() => {
    let delta = calorieDelta;
    if (objective === 'deficit_moderado') delta = -350;
    else if (objective === 'deficit_agressivo') delta = -600;
    else if (objective === 'superavit_leve') delta = 250;
    else if (objective === 'superavit_hipertrofia') delta = 500;
    return tdee + delta;
  }, [tdee, objective, calorieDelta]);

  // Macro Grams & Percentages
  const macros = useMemo(() => {
    const pG = Math.round(weight * proteinGPerKg);
    const fG = Math.round(weight * fatGPerKg);
    
    // Remaining calories for carbs
    const pKcal = pG * 4;
    const fKcal = fG * 9;
    const remainingKcal = Math.max(0, targetCalories - pKcal - fKcal);
    const cG = Math.round(remainingKcal / 4);
    
    const cKcal = cG * 4;
    const totalCalcKcal = pKcal + fKcal + cKcal;

    return {
      protein: { grams: pG, kcal: pKcal, pct: Math.round((pKcal / totalCalcKcal) * 100) || 0 },
      fat: { grams: fG, kcal: fKcal, pct: Math.round((fKcal / totalCalcKcal) * 100) || 0 },
      carbs: { grams: cG, kcal: cKcal, pct: Math.round((cKcal / totalCalcKcal) * 100) || 0 },
      totalKcal: totalCalcKcal
    };
  }, [weight, proteinGPerKg, fatGPerKg, targetCalories]);

  const chartData = [
    { name: 'Proteína', value: macros.protein.kcal, color: '#0ea5e9' },
    { name: 'Gordura', value: macros.fat.kcal, color: '#f43f5e' },
    { name: 'Carboidratos', value: macros.carbs.kcal, color: '#f59e0b' }
  ];

  const handleCopySummary = () => {
    const summary = `CÁLCULO RÁPIDO DE MACROS\n` +
      `Perfil: ${sex === 'male' ? 'Masculino' : 'Feminino'}, ${age} anos, ${weight}kg, ${height}cm\n` +
      `Fórmula: ${formula.toUpperCase()} | GET: ${tdee} kcal\n` +
      `Objetivo: ${objective.replace('_', ' ')} | Alvo: ${targetCalories} kcal\n` +
      `------------------------\n` +
      `Proteína: ${macros.protein.grams}g (${proteinGPerKg} g/kg)\n` +
      `Gordura: ${macros.fat.grams}g (${fatGPerKg} g/kg)\n` +
      `Carboidratos: ${macros.carbs.grams}g (${(macros.carbs.grams / weight).toFixed(1)} g/kg)`;
    
    navigator.clipboard.writeText(summary);
    alert('Resumo copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <Calculator className="w-5 h-5 text-[#004f28] dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Parâmetros de Simulação</h3>
              </div>
              <InfoHelpButton helpId="calculadora_macros" size="xs" variant="emerald" title="Explicativo sobre a calculadora de macros e fórmulas de TMB/GET" />
            </div>

            <div className="space-y-5">
              {/* Sex Toggle */}
              <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => setSex('male')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-bold transition-all ${
                    sex === 'male' 
                      ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Dna className="w-3 h-3 mr-2" /> Masculino
                </button>
                <button
                  onClick={() => setSex('female')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-bold transition-all ${
                    sex === 'female' 
                      ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Dna className="w-3 h-3 mr-2" /> Feminino
                </button>
              </div>

              {/* Weight & Height Input Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                    <Scale className="w-3 h-3 mr-1" /> Peso (kg)
                  </label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button onClick={() => setWeight(prev => Math.max(20, prev - 0.5))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-mono font-bold text-sm focus:outline-none"
                    />
                    <button onClick={() => setWeight(prev => prev + 0.5)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                    <User className="w-3 h-3 mr-1" /> Altura (cm)
                  </label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button onClick={() => setHeight(prev => Math.max(100, prev - 1))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-mono font-bold text-sm focus:outline-none"
                    />
                    <button onClick={() => setHeight(prev => prev + 1)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Age Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Idade (anos)</label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#004f28]"
                />
                <div className="flex justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  <span>15a</span>
                  <span className="text-emerald-600">{age} anos</span>
                  <span>90a</span>
                </div>
              </div>

              {/* Activity Factor Buttons */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center">
                  <Activity className="w-3 h-3 mr-1" /> Nível de Atividade (FA)
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { val: 1.2, label: 'Sed', title: 'Sedentário' },
                    { val: 1.375, label: 'Leve', title: 'Leve' },
                    { val: 1.55, label: 'Mod', title: 'Moderado' },
                    { val: 1.725, label: 'Int', title: 'Intenso' },
                    { val: 1.9, label: 'Ext', title: 'Extremo' }
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => setActivityFactor(f.val)}
                      title={f.title}
                      className={`py-2 px-1 rounded border text-[9px] font-bold uppercase transition-all ${
                        activityFactor === f.val 
                          ? 'bg-[#004f28] text-white border-[#004f28]' 
                          : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formula Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Fórmula de TMB</label>
                <select
                  value={formula}
                  onChange={(e) => setFormula(e.target.value as EnergyFormula)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-[#004f28] outline-none"
                >
                  <option value="mifflin">Mifflin-St Jeor (Moderno)</option>
                  <option value="harris">Harris-Benedict (Revisado)</option>
                  <option value="who">OMS / FAO (2004)</option>
                  <option value="katch">Katch-McArdle (LBM)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 dark:bg-black rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">GET Calculado (TDEE)</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black font-mono tracking-tighter">{tdee}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">kcal / dia</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Basal (TMB)</span>
                <span className="text-lg font-bold font-mono">{bmr}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 uppercase block">Fator Ativ.</span>
                <span className="text-lg font-bold font-mono">x{activityFactor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Objective & Macros */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <Target className="w-5 h-5 text-[#004f28] dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Objetivo & Distribuição de Macros</h3>
              </div>
              <button 
                onClick={handleCopySummary}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Resumo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strategy */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-3 block">Estratégia de Balanço</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'deficit_moderado' as DietObjective, label: 'Cut Mod.', delta: '-350' },
                      { id: 'deficit_agressivo' as DietObjective, label: 'Cut Int.', delta: '-600' },
                      { id: 'eucalorica' as DietObjective, label: 'Manut.', delta: '0' },
                      { id: 'superavit_leve' as DietObjective, label: 'Bulk Leve', delta: '+250' },
                      { id: 'superavit_hipertrofia' as DietObjective, label: 'Hipertrofia', delta: '+500' }
                    ].map(obj => (
                      <button
                        key={obj.id}
                        onClick={() => setObjective(obj.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          objective === obj.id 
                            ? 'border-[#004f28] bg-emerald-50 dark:bg-emerald-950/30 text-[#004f28] dark:text-emerald-400 font-bold' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-[10px]">{obj.label}</div>
                        <div className="text-[11px] font-mono opacity-60">{obj.delta} kcal</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Alvo Calórico Final</span>
                    <span className="text-xs font-mono font-bold text-emerald-600">{targetCalories} kcal</span>
                  </div>
                  
                  {/* Macro Sliders (g/kg) */}
                  <div className="space-y-5">
                    {/* Protein */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-sky-600 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-sky-500 mr-1.5" /> Proteína
                        </span>
                        <span className="font-mono">{proteinGPerKg} g/kg</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="3.5"
                        step="0.1"
                        value={proteinGPerKg}
                        onChange={(e) => setProteinGPerKg(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                    </div>

                    {/* Fat */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-rose-500 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" /> Gordura
                        </span>
                        <span className="font-mono">{fatGPerKg} g/kg</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="1.8"
                        step="0.1"
                        value={fatGPerKg}
                        onChange={(e) => setFatGPerKg(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>

                    {/* Carbs (Visual indicator only as it's calculated from remaining) */}
                    <div className="space-y-2 opacity-80">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-amber-500 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" /> Carboidratos (Restante)
                        </span>
                        <span className="font-mono">{(macros.carbs.grams / weight).toFixed(1)} g/kg</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-300" 
                          style={{ width: `${macros.carbs.pct}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart & Summary */}
              <div className="flex flex-col justify-center">
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">{targetCalories}</span>
                    <span className="text-[10px] font-bold text-slate-400">kcal</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="text-center p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50">
                    <span className="text-[10px] font-bold text-sky-600 uppercase block mb-1">Proteína</span>
                    <span className="text-lg font-black text-sky-700 dark:text-sky-400 font-mono">{macros.protein.grams}g</span>
                    <span className="text-[9px] text-sky-500 block">{macros.protein.pct}%</span>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
                    <span className="text-[10px] font-bold text-rose-500 uppercase block mb-1">Gordura</span>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">{macros.fat.grams}g</span>
                    <span className="text-[9px] text-rose-400 block">{macros.fat.pct}%</span>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                    <span className="text-[10px] font-bold text-amber-500 uppercase block mb-1">Carbos</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{macros.carbs.grams}g</span>
                    <span className="text-[9px] text-amber-400 block">{macros.carbs.pct}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-start space-x-3">
              <div className="mt-1">
                <Info className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Interpretador Clínico</h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-500 leading-relaxed mt-0.5">
                  Esta simulação utiliza o peso total ({weight}kg). Para pacientes com obesidade grau II ou III, recomenda-se recalcular usando o **Peso Ajustado** ou a fórmula de **Katch-McArdle** baseada na massa magra para evitar superestimação energética.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
