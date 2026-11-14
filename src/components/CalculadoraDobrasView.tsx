import React, { useState } from 'react';
import { Patient, AnthropometryEvaluation, BiologicalSex, ProtocolType, DensityEquation } from '../types';
import { ISAK_SKINFOLD_SITES } from '../data/clinicalData';
import { 
  calculateJacksonPollock7Density, 
  calculateJacksonPollock3Density, 
  calculateDurninWomersleyDensity, 
  convertDensityToBodyFat, 
  calculateCompartments, 
  calculateTargetWeight 
} from '../domain/calculations';
import { 
  Activity, 
  CheckCircle2, 
  Sliders, 
  Target, 
  Scale, 
  Save, 
  RotateCcw, 
  Layers, 
  Info,
  ChevronDown,
  Camera,
  TrendingDown,
  LineChart as ChartLine,
  AlertTriangle
} from 'lucide-react';
import { validateBodyFat } from '../domain/validation';
import { GraficoEvolucaoPeso } from './GraficoEvolucaoPeso';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

interface CalculadoraDobrasViewProps {
  patient: Patient;
  evaluation: AnthropometryEvaluation;
  onSaveEvaluation: (evaluation: AnthropometryEvaluation) => void;
  privacyMode?: boolean;
}

export const CalculadoraDobrasView: React.FC<CalculadoraDobrasViewProps> = ({
  patient,
  evaluation,
  onSaveEvaluation,
  privacyMode = false
}) => {
  const [subTab, setSubTab] = useState<'dobras' | 'grafico' | 'completo'>('dobras');
  const [protocol, setProtocol] = useState<ProtocolType>(evaluation.protocol);
  const [equation, setEquation] = useState<DensityEquation>(evaluation.equation);
  const [activeSiteKey, setActiveSiteKey] = useState<string>('suprailiac');
  
  // Local state for skinfold measurements
  const [sitesData, setSitesData] = useState<Record<string, { t1: number; t2: number; t3: number; median: number }>>(
    evaluation.sites
  );

  const [targetBfPercent, setTargetBfPercent] = useState<number>(evaluation.targetBodyFatPercent || 17.0);

  // Helper to update T1/T2/T3
  const handleUpdateTrial = (siteKey: string, trial: 't1' | 't2' | 't3', delta: number) => {
    const current = sitesData[siteKey] || { t1: 10, t2: 10, t3: 10, median: 10 };
    const newVal = Math.max(1, Math.round((current[trial] + delta) * 10) / 10);
    const updatedTrial = { ...current, [trial]: newVal };

    // Calculate median of active trials
    const arr = [updatedTrial.t1, updatedTrial.t2];
    if (updatedTrial.t3 > 0) arr.push(updatedTrial.t3);
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    const median = arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;

    setSitesData({
      ...sitesData,
      [siteKey]: {
        ...updatedTrial,
        median: Math.round(median * 10) / 10
      }
    });
  };

  // Set direct value
  const handleSetTrialValue = (siteKey: string, trial: 't1' | 't2' | 't3', value: number) => {
    const current = sitesData[siteKey] || { t1: 10, t2: 10, t3: 10, median: 10 };
    const updatedTrial = { ...current, [trial]: Math.max(0, value) };
    const arr = [updatedTrial.t1, updatedTrial.t2];
    if (updatedTrial.t3 > 0) arr.push(updatedTrial.t3);
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    const median = arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;

    setSitesData({
      ...sitesData,
      [siteKey]: {
        ...updatedTrial,
        median: Math.round(median * 10) / 10
      }
    });
  };

  // Sum of skinfolds
  const sumSkinfolds = Math.round(
    Object.values(sitesData).reduce((acc, curr) => acc + (curr.median || 0), 0) * 10
  ) / 10;

  // Density calculation
  let density = 1.0568;
  if (protocol === 'jp7') {
    density = calculateJacksonPollock7Density(sumSkinfolds, patient.age, patient.sex);
  } else if (protocol === 'jp3') {
    density = calculateJacksonPollock3Density(sumSkinfolds, patient.age, patient.sex);
  } else if (protocol === 'dw4') {
    density = calculateDurninWomersleyDensity(sumSkinfolds, patient.age, patient.sex);
  }

  // Body Fat %
  const bodyFat = convertDensityToBodyFat(density, equation);
  const bfValidation = validateBodyFat(bodyFat, patient.sex);
  const { fatMassKg, leanMassKg } = calculateCompartments(patient.currentWeightKg, bodyFat);
  const { targetWeightKg, fatToLoseKg } = calculateTargetWeight(leanMassKg, targetBfPercent);

  const activeSite = ISAK_SKINFOLD_SITES.find(s => s.siteKey === activeSiteKey) || ISAK_SKINFOLD_SITES[4];
  const activeTrials = sitesData[activeSiteKey] || { t1: 15.0, t2: 15.2, t3: 15.1, median: 15.1 };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Patient Info & Assessment Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#004f28] flex items-center justify-center font-bold text-lg border border-emerald-100">
              {patient.avatarInitials}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
                <span className="text-xs font-mono text-slate-400">{patient.age}a</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-50 text-[#004f28] font-semibold">
                  ISAK II Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {patient.currentWeightKg} kg • {patient.heightCm} cm • IMC {patient.imc.toFixed(1)} • Última Avaliação: {evaluation.date}
              </p>
            </div>
          </div>

          {/* Quick Metrics Live Tally */}
          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <div className={`px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              bfValidation.status !== 'normal' 
                ? `${bfValidation.bgClass} ${bfValidation.borderClass} ring-1 ${bfValidation.borderClass.replace('border-', 'ring-')}/40` 
                : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-[10px] text-slate-400 block font-sans uppercase">Gordura</span>
                {bfValidation.status !== 'normal' && (
                  <AlertTriangle className={`w-2.5 h-2.5 ${bfValidation.iconColor}`} />
                )}
              </div>
              <span className={`text-base font-extrabold tabular-nums ${
                bfValidation.status !== 'normal' ? bfValidation.colorClass : 'text-[#004f28]'
              }`}>{bodyFat}%</span>
              {bfValidation.status !== 'normal' && (
                <span className={`text-[8px] block font-sans font-bold leading-tight mt-0.5 ${bfValidation.colorClass}`}>
                  {bfValidation.message}
                </span>
              )}
            </div>
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">MASSA MAGRA</span>
              <span className="text-base font-extrabold text-sky-800 tabular-nums">{leanMassKg} kg</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">SOMATÓRIO (Σ7)</span>
              <span className="text-base font-extrabold text-slate-800 tabular-nums">{sumSkinfolds} mm</span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <ClinicalTooltip helpId="dobras" position="bottom">
              <button
                onClick={() => setSubTab('dobras')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  subTab === 'dobras'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>Medições ISAK (7 Dobras)</span>
                <InfoHelpButton helpId="dobras" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>

            <ClinicalTooltip helpId="evolucao_nutricional" position="bottom">
              <button
                onClick={() => setSubTab('grafico')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  subTab === 'grafico'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <ChartLine className="w-3.5 h-3.5 text-[#004f28] dark:text-emerald-400" />
                <span>Gráfico de Evolução de Peso</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-[#004f28] dark:text-emerald-300 rounded font-bold">
                  Recharts
                </span>
                <InfoHelpButton helpId="evolucao_nutricional" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>

            <ClinicalTooltip helpId="avaliacao_antropometrica" position="bottom">
              <button
                onClick={() => setSubTab('completo')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  subTab === 'completo'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>Visão Completa</span>
                <InfoHelpButton helpId="avaliacao_antropometrica" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <span>Histórico Ponderal:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{patient.initialWeightKg} kg → {patient.currentWeightKg} kg</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              ({(patient.currentWeightKg - patient.initialWeightKg).toFixed(1)} kg)
            </span>
          </div>
        </div>
      </div>

      {/* Render Recharts Graph if in 'grafico' or 'completo' mode */}
      {(subTab === 'grafico' || subTab === 'completo') && (
        <GraficoEvolucaoPeso
          patient={patient}
          privacyMode={privacyMode}
        />
      )}

      {/* Render 7 Dobras ISAK if in 'dobras' or 'completo' mode */}
      {(subTab === 'dobras' || subTab === 'completo') && (
        <>

      {/* Protocol & Equation Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Protocolo:</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setProtocol('jp7')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  protocol === 'jp7' ? 'bg-[#004f28] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jackson-Pollock 7
              </button>
              <button
                onClick={() => setProtocol('jp3')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  protocol === 'jp3' ? 'bg-[#004f28] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jackson-Pollock 3
              </button>
              <button
                onClick={() => setProtocol('dw4')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  protocol === 'dw4' ? 'bg-[#004f28] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Durnin-Womersley 4
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Equação de Conversão (Densidade → %G):</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setEquation('siri')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  equation === 'siri' ? 'bg-[#004f28] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Siri (1961)
              </button>
              <button
                onClick={() => setEquation('brozek')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  equation === 'brozek' ? 'bg-[#004f28] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Brožek (1963)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sites List on Left, Active Triplicate & Anatomy on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 7 Dobras List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Pontos Anatômicos ISAK ({ISAK_SKINFOLD_SITES.length} Dobras)</span>
            <span className="font-mono text-emerald-800">100% Preenchido</span>
          </div>

          {ISAK_SKINFOLD_SITES.map((site, index) => {
            const data = sitesData[site.siteKey] || { t1: site.t1, t2: site.t2, t3: site.t3, median: site.median };
            const isSelected = activeSiteKey === site.siteKey;

            return (
              <div
                key={site.siteKey}
                onClick={() => setActiveSiteKey(site.siteKey)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#004f28] bg-emerald-50/40 ring-1 ring-[#004f28]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      0{index + 1} • {site.code} • {site.direction}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{site.namePt}</h4>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold font-mono tabular-nums text-slate-900">
                      {data.median.toFixed(1)} <span className="text-xs font-normal text-slate-400">mm</span>
                    </span>
                    <div className="text-[10px] font-mono text-emerald-700 flex items-center justify-end space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                      <span>Mediana Ativa</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Triplicate Measurement & Target Weight Simulator */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Site Detailed Capture Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#004f28] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Ponto de Foco Atual
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeSite.namePt} ({activeSite.code})</h3>
                <p className="text-xs text-slate-500">{activeSite.anatomicalLocation}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Mediana Final</span>
                <span className="text-2xl font-black font-mono tabular-nums text-[#004f28]">
                  {activeTrials.median.toFixed(1)} mm
                </span>
              </div>
            </div>

            {/* Triplicate Inputs (T1, T2, T3) */}
            <div className="grid grid-cols-3 gap-3 my-4">
              {/* T1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tomada 1 (T1)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={activeTrials.t1}
                  onChange={(e) => handleSetTrialValue(activeSiteKey, 't1', parseFloat(e.target.value) || 0)}
                  className="w-full text-center text-xl font-black font-mono bg-white border border-slate-200 rounded-lg py-1 text-slate-900"
                />
                <div className="flex justify-center space-x-1 mt-2">
                  <button
                    onClick={() => handleUpdateTrial(activeSiteKey, 't1', -0.5)}
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                  >
                    -0.5
                  </button>
                  <button
                    onClick={() => handleUpdateTrial(activeSiteKey, 't1', 0.5)}
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                  >
                    +0.5
                  </button>
                </div>
              </div>

              {/* T2 */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-center ring-1 ring-emerald-300">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Tomada 2 (T2)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={activeTrials.t2}
                  onChange={(e) => handleSetTrialValue(activeSiteKey, 't2', parseFloat(e.target.value) || 0)}
                  className="w-full text-center text-xl font-black font-mono bg-white border border-emerald-300 rounded-lg py-1 text-slate-900"
                />
                <div className="flex justify-center space-x-1 mt-2">
                  <button
                    onClick={() => handleUpdateTrial(activeSiteKey, 't2', -0.5)}
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                  >
                    -0.5
                  </button>
                  <button
                    onClick={() => handleUpdateTrial(activeSiteKey, 't2', 0.5)}
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                  >
                    +0.5
                  </button>
                </div>
              </div>

              {/* T3 (Triplicate) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tomada 3 (T3 - Opcional)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={activeTrials.t3}
                  onChange={(e) => handleSetTrialValue(activeSiteKey, 't3', parseFloat(e.target.value) || 0)}
                  className="w-full text-center text-xl font-black font-mono bg-white border border-slate-200 rounded-lg py-1 text-slate-900"
                />
                <div className="flex justify-center space-x-1 mt-2">
                  <button
                    onClick={() => handleUpdateTrial(activeSiteKey, 't3', -0.5)}
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                  >
                    -0.5
                  </button>
                  <button
                    onClick={() => handleUpdateTrial(activeSiteKey, 't3', 0.5)}
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-slate-100"
                  >
                    +0.5
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-start space-x-2">
              <Info className="w-4 h-4 text-[#004f28] shrink-0 mt-0.5" />
              <span>
                <strong>Diretriz ISAK:</strong> Se a diferença entre T1 e T2 for maior que 5%, a tomada T3 é mandatória e a mediana das três medições é adotada como valor canônico.
              </span>
            </div>
          </div>

          {/* Simulator: Target Weight & Lean Body Mass Preservation */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#004f28]" />
                <h4 className="text-sm font-bold text-slate-900">Simulador de Peso Meta (%G Alvo)</h4>
              </div>
              <span className="text-xs font-mono font-bold text-[#004f28] bg-emerald-50 px-2 py-0.5 rounded">
                Massa Magra Preservada (52.2 kg)
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-600">Meta de Gordura Corporal:</span>
                <span className="font-bold text-slate-900">{targetBfPercent}%</span>
              </div>
              <input
                type="range"
                min="12.0"
                max="28.0"
                step="0.5"
                value={targetBfPercent}
                onChange={(e) => setTargetBfPercent(parseFloat(e.target.value))}
                className="w-full accent-[#004f28]"
              />
            </div>

            {/* Simulated Results */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">PESO META ESTIMADO</span>
                <span className="text-xl font-extrabold text-[#004f28] tabular-nums">{targetWeightKg} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">GORDURA A ELIMINAR</span>
                <span className="text-xl font-extrabold text-amber-700 tabular-nums">
                  {Math.abs(Math.round((patient.currentWeightKg - targetWeightKg) * 10) / 10)} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">MASSA MAGRA LIVRE</span>
                <span className="text-xl font-extrabold text-sky-800 tabular-nums">{leanMassKg} kg</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  onSaveEvaluation({
                    ...evaluation,
                    protocol,
                    equation,
                    sumSkinfoldsMm: sumSkinfolds,
                    bodyDensity: density,
                    bodyFatPercent: bodyFat,
                    fatMassKg,
                    leanMassKg,
                    targetBodyFatPercent: targetBfPercent,
                    targetWeightKg,
                    sites: sitesData
                  });
                  alert('Avaliação de Dobras Cutâneas ISAK salva com sucesso no prontuário!');
                }}
                className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Avaliação no Prontuário</span>
              </button>
            </div>
          </div>

        </div>

      </div>
      </>
      )}

    </div>
  );
};
