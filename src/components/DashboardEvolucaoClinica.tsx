import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart, 
  AreaChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  Scale, 
  Activity, 
  Target, 
  Users, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Filter, 
  HelpCircle,
  Layers,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { 
  Patient, 
  WeightEvolutionPoint, 
  ClinicCohortType, 
  ClinicCohortMetrics, 
  EvolutionComparisonPoint 
} from '../types';
import { 
  calculateClinicCohortBenchmarks, 
  buildEvolutionComparisonSeries 
} from '../domain/calculations';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

interface DashboardEvolucaoClinicaProps {
  patient: Patient;
  allPatients?: Patient[];
  privacyMode?: boolean;
  onUpdatePatientWeightHistory?: (newHistory: WeightEvolutionPoint[]) => void;
}

type ViewMode = 'combinado' | 'peso' | 'gordura';

export const DashboardEvolucaoClinica: React.FC<DashboardEvolucaoClinicaProps> = ({
  patient,
  allPatients = [],
  privacyMode = false,
  onUpdatePatientWeightHistory
}) => {
  // Local history state to allow immediate addition of new evaluation points
  const [history, setHistory] = useState<WeightEvolutionPoint[]>(() => {
    if (patient.weightHistory && patient.weightHistory.length > 0) {
      return patient.weightHistory;
    }
    // Fallback if patient has no registered history
    return [
      { date: '2026-08-01', weightKg: 68.0, bodyFatPercent: 24.5, leanMassKg: 51.3, targetWeightKg: 62.9, eventLabel: 'Consulta Inicial (T0)' },
      { date: '2026-09-01', weightKg: 66.2, bodyFatPercent: 23.0, leanMassKg: 51.0, targetWeightKg: 62.9, eventLabel: 'Retorno 30 dias (T1)' },
      { date: '2026-10-24', weightKg: patient.currentWeightKg || 64.5, bodyFatPercent: 21.2, leanMassKg: 50.8, targetWeightKg: 62.9, eventLabel: 'Consulta Atual (T2)' }
    ];
  });

  // Selected Cohort for Benchmark Comparison
  const [selectedCohort, setSelectedCohort] = useState<ClinicCohortType>('todos_adultos');

  // Chart View Mode: Combined (Dual Axis), Weight Only, or Body Fat Only
  const [viewMode, setViewMode] = useState<ViewMode>('combinado');

  // Chart Series Visibility Toggles
  const [showClinicBenchmark, setShowClinicBenchmark] = useState<boolean>(true);
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);

  // Modal State for Adding New Assessment Point
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState<string>(String(patient.currentWeightKg || 64.5));
  const [newBf, setNewBf] = useState<string>('20.8');
  const [newLeanMass, setNewLeanMass] = useState<string>('51.0');
  const [newEventLabel, setNewEventLabel] = useState<string>('Reavaliação Trimestral');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // 1. Calculate Active Clinic Cohort Metrics
  const cohortMetrics: ClinicCohortMetrics = useMemo(() => {
    return calculateClinicCohortBenchmarks(allPatients, patient, selectedCohort);
  }, [allPatients, patient, selectedCohort]);

  // 2. Build Longitudinal Comparison Series
  const comparisonSeries: EvolutionComparisonPoint[] = useMemo(() => {
    return buildEvolutionComparisonSeries(history, cohortMetrics);
  }, [history, cohortMetrics]);

  // 3. Current Key Statistical Summary
  const initialPoint = history[0];
  const latestPoint = history[history.length - 1];
  const latestComparison = comparisonSeries[comparisonSeries.length - 1];

  const targetWeight = latestPoint?.targetWeightKg || 62.9;
  const targetBf = 19.5;

  // Patient total variations
  const totalWeightDeltaKg = latestPoint && initialPoint 
    ? Math.round((latestPoint.weightKg - initialPoint.weightKg) * 10) / 10 
    : 0;
  
  const totalWeightDeltaPercent = initialPoint && initialPoint.weightKg > 0
    ? Math.round(((latestPoint.weightKg - initialPoint.weightKg) / initialPoint.weightKg) * 1000) / 10
    : 0;

  const totalBfDelta = latestPoint?.bodyFatPercent !== undefined && initialPoint?.bodyFatPercent !== undefined
    ? Math.round((latestPoint.bodyFatPercent - initialPoint.bodyFatPercent) * 10) / 10
    : null;

  // Days and monthly pace
  const daysTotal = useMemo(() => {
    if (!initialPoint || !latestPoint) return 1;
    const diff = new Date(latestPoint.date).getTime() - new Date(initialPoint.date).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [initialPoint, latestPoint]);

  const monthsTotal = Math.max(0.3, daysTotal / 30.4);
  const patientMonthlyWeightRate = Math.round((totalWeightDeltaKg / monthsTotal) * 100) / 100;
  const patientMonthlyBfRate = totalBfDelta !== null ? Math.round((totalBfDelta / monthsTotal) * 100) / 100 : null;

  // Comparison vs Clinic Benchmark
  const currentWeightDeltaVsClinic = latestComparison ? latestComparison.weightDeltaKg : 0;
  const currentBfDeltaVsClinic = latestComparison?.bfDeltaPercent ?? null;

  // Relative progress rating
  const clinicalProgressEfficiency = useMemo(() => {
    const clinicRate = Math.abs(cohortMetrics.avgMonthlyWeightChangeKg);
    const patientRate = Math.abs(patientMonthlyWeightRate);
    if (patientRate > clinicRate * 1.25) return { label: 'Evolução Acelerada (+Superior à Média)', color: 'text-emerald-700 dark:text-emerald-400', badge: 'Top 15% da Clínica' };
    if (patientRate >= clinicRate * 0.85) return { label: 'Conforme Esperado para a Coorte', color: 'text-sky-700 dark:text-sky-400', badge: 'Média Padrão' };
    return { label: 'Evolução Gradual / Ajuste de Aderência', color: 'text-amber-700 dark:text-amber-400', badge: 'Atenção Clínica' };
  }, [patientMonthlyWeightRate, cohortMetrics]);

  // Handler: Add new assessment point
  const handleAddNewPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    const bfNum = newBf ? parseFloat(newBf) : undefined;
    const leanNum = newLeanMass ? parseFloat(newLeanMass) : undefined;

    const newPoint: WeightEvolutionPoint = {
      date: newDate,
      weightKg: weightNum,
      bodyFatPercent: bfNum,
      leanMassKg: leanNum,
      targetWeightKg: targetWeight,
      eventLabel: newEventLabel || `Consulta ${history.length + 1}`
    };

    const updatedHistory = [...history, newPoint].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setHistory(updatedHistory);
    if (onUpdatePatientWeightHistory) {
      onUpdatePatientWeightHistory(updatedHistory);
    }
    setIsAddModalOpen(false);
  };

  // Handler: Copy clinical comparison report to clipboard
  const handleCopyReport = () => {
    const patientDisplayName = privacyMode ? 'Paciente Confidencial' : patient.name;
    const reportText = `RELATÓRIO DE EVOLUÇÃO CLÍNICA & BENCHMARK DA CLÍNICA
Prontuário: ${patient.recordNumber} • Paciente: ${patientDisplayName}
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}

1. PARÂMETROS ATUAIS & BENCHMARK (${cohortMetrics.label}):
• Peso Atual: ${latestPoint.weightKg} kg (Média da Clínica: ${latestComparison.clinicAvgWeightKg} kg | Delta: ${currentWeightDeltaVsClinic > 0 ? `+${currentWeightDeltaVsClinic}` : currentWeightDeltaVsClinic} kg)
• Percentual de Gordura: ${latestPoint.bodyFatPercent ?? '--'}% (Média da Clínica: ${latestComparison.clinicAvgBodyFatPercent}% | Delta: ${currentBfDeltaVsClinic !== null ? (currentBfDeltaVsClinic > 0 ? `+${currentBfDeltaVsClinic}` : currentBfDeltaVsClinic) : '--'}%)
• Meta Calibrada: Peso ${targetWeight} kg | %G ${targetBf}%

2. VELOCIDADE LONGITUDINAL:
• Variação Acumulada: ${totalWeightDeltaKg > 0 ? `+${totalWeightDeltaKg}` : totalWeightDeltaKg} kg (${totalWeightDeltaPercent}%) em ${daysTotal} dias
• Taxa Mensal do Paciente: ${patientMonthlyWeightRate} kg/mês vs. Média da Clínica: ${cohortMetrics.avgMonthlyWeightChangeKg} kg/mês
• Desempenho Clínico: ${clinicalProgressEfficiency.label}

NutriTrack Pro - Sistema de Nutrição Clínica Avançada`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    });
  };

  // Custom Recharts Tooltip for Clinical Details
  const CustomClinicalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0]?.payload as EvolutionComparisonPoint;
      if (!point) return null;

      return (
        <div className="bg-slate-900/95 text-slate-100 p-4 rounded-xl border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-mono max-w-xs sm:max-w-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
            <div>
              <span className="font-bold text-emerald-400 text-sm">{point.displayDate}</span>
              <span className="text-[10px] text-slate-400 block font-sans">{point.date}</span>
            </div>
            {point.eventLabel && (
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-sans font-medium">
                {point.eventLabel}
              </span>
            )}
          </div>

          {/* Metrics Comparative Grid */}
          <div className="space-y-2.5">
            {/* Weight Row */}
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 font-sans mb-1">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  Peso Corporal
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {point.weightDeltaKg <= 0 ? `${point.weightDeltaKg} kg` : `+${point.weightDeltaKg} kg`} vs. média
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Paciente:</span>
                  <span className="font-black text-white text-sm">{point.patientWeightKg.toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Média Clínica:</span>
                  <span className="font-bold text-slate-300 text-sm">{point.clinicAvgWeightKg.toFixed(1)} kg</span>
                </div>
              </div>
            </div>

            {/* Body Fat Row */}
            {point.patientBodyFatPercent !== undefined && (
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 font-sans mb-1">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Percentual de Gordura (%G)
                  </span>
                  {point.bfDeltaPercent !== undefined && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {point.bfDeltaPercent <= 0 ? `${point.bfDeltaPercent}%` : `+${point.bfDeltaPercent}%`} vs. média
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Paciente:</span>
                    <span className="font-black text-amber-300 text-sm">{point.patientBodyFatPercent.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Média Clínica:</span>
                    <span className="font-bold text-slate-300 text-sm">{point.clinicAvgBodyFatPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Lean Mass if registered */}
            {point.patientLeanMassKg !== undefined && (
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Massa Magra Preservada:</span>
                <span className="font-bold text-sky-300 font-mono">{point.patientLeanMassKg.toFixed(1)} kg</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Clinical Header Bar with Info Guide & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800/80 text-[#004f28] dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Evolução Clínica & Benchmark da Clínica
                  </h2>
                  <InfoHelpButton 
                    helpId="relatorio_evolutivo" 
                    size="sm" 
                    variant="emerald" 
                    title="Explicativo do Dashboard de Evolução Clínica" 
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparação individualizada do paciente <span className={`font-semibold text-slate-800 dark:text-slate-200 ${privacyMode ? 'filter blur-xs' : ''}`}>
                    {patient.name || 'Paciente'}
                  </span> ({patient.recordNumber}) com a coorte da clínica.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add Point & Copy Report */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyReport}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Copiar relatório comparativo estruturado para prontuário"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copiado para o Prontuário!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copiar Resumo Clínico</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#004f28] hover:bg-[#003d1f] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Consulta</span>
            </button>
          </div>
        </div>

        {/* Coorte Comparison Selector Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Coorte de Comparação:
            </span>

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700">
              <button
                onClick={() => setSelectedCohort('todos_adultos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCohort === 'todos_adultos'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Geral (Adultos)
              </button>

              <button
                onClick={() => setSelectedCohort('mesmo_sexo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCohort === 'mesmo_sexo'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Mesmo Sexo ({patient.sex === 'female' ? 'Feminino' : 'Masculino'})
              </button>

              <button
                onClick={() => setSelectedCohort('faixa_etaria')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCohort === 'faixa_etaria'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Faixa Etária (~{patient.age || 30}a)
              </button>

              <button
                onClick={() => setSelectedCohort('mesmo_objetivo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCohort === 'mesmo_objetivo'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Mesmo Objetivo
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Amostra ativa: <strong>N = {cohortMetrics.sampleSize}</strong> pacientes da clínica ({cohortMetrics.sublabel})</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip: Patient vs Clinic Benchmark */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Current Weight vs Clinic Average */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Peso vs. Média Clínica
            </span>
            <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
              {cohortMetrics.id}
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {latestPoint.weightKg.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">kg</span>

            <div className={`ml-auto flex items-center text-xs font-bold px-2 py-0.5 rounded-lg ${
              currentWeightDeltaVsClinic <= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
            }`}>
              {currentWeightDeltaVsClinic <= 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              <span>{Math.abs(currentWeightDeltaVsClinic).toFixed(1)} kg</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Média da Clínica:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{latestComparison.clinicAvgWeightKg.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Card 2: Current Body Fat vs Clinic Average */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              % Gordura vs. Média Clínica
            </span>
            <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
              ISAK II
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {latestPoint.bodyFatPercent !== undefined ? `${latestPoint.bodyFatPercent.toFixed(1)}%` : '--'}
            </span>

            {currentBfDeltaVsClinic !== null && (
              <div className={`ml-auto flex items-center text-xs font-bold px-2 py-0.5 rounded-lg ${
                currentBfDeltaVsClinic <= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
              }`}>
                {currentBfDeltaVsClinic <= 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                <span>{Math.abs(currentBfDeltaVsClinic).toFixed(1)}%</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Média da Clínica:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{latestComparison.clinicAvgBodyFatPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 3: Total Patient Variation (From T0 to Current) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Variação Total (T0 → Atual)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {daysTotal} dias
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl sm:text-3xl font-black tabular-nums ${
              totalWeightDeltaKg <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {totalWeightDeltaKg > 0 ? `+${totalWeightDeltaKg}` : totalWeightDeltaKg}
            </span>
            <span className="text-xs font-bold text-slate-500">kg</span>
            <span className="text-xs font-bold text-slate-400 font-mono">({totalWeightDeltaPercent}%)</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Redução de %G:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {totalBfDelta !== null ? `${totalBfDelta > 0 ? `+${totalBfDelta}` : totalBfDelta}%` : '--'}
            </span>
          </div>
        </div>

        {/* Card 4: Monthly Pace vs Clinic Efficiency */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Ritmo Mensal de Evolução
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {clinicalProgressEfficiency.badge}
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {Math.abs(patientMonthlyWeightRate).toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-500">kg/mês</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Média da Clínica:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{Math.abs(cohortMetrics.avgMonthlyWeightChangeKg).toFixed(2)} kg/mês</span>
          </div>
        </div>

      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        
        {/* Controls Bar for View Mode & Series Visibility */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          {/* View Mode Tabs (Segmented Buttons) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('combinado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'combinado'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Visão Integrada (Dual-Axis)
            </button>
            <button
              onClick={() => setViewMode('peso')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'peso'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Foco em Peso (kg)
            </button>
            <button
              onClick={() => setViewMode('gordura')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'gordura'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Foco em % Gordura
            </button>
          </div>

          {/* Visibility Checkbox Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showClinicBenchmark}
                onChange={(e) => setShowClinicBenchmark(e.target.checked)}
                className="rounded border-slate-300 text-[#004f28] focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium">Média da Clínica</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showConfidenceBand}
                onChange={(e) => setShowConfidenceBand(e.target.checked)}
                className="rounded border-slate-300 text-[#004f28] focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium">Faixa de Variação (±1σ)</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showTargetLine}
                onChange={(e) => setShowTargetLine(e.target.checked)}
                className="rounded border-slate-300 text-[#004f28] focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium">Linha de Meta</span>
            </label>
          </div>

        </div>

        {/* Legend Indicator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Patient Weight */}
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-1 rounded-full bg-[#004f28] dark:bg-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Peso do Paciente (kg)</span>
            </div>

            {/* Clinic Avg Weight */}
            {showClinicBenchmark && (viewMode === 'combinado' || viewMode === 'peso') && (
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-slate-500 dark:border-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">Média da Clínica (kg)</span>
              </div>
            )}

            {/* Patient Body Fat */}
            {(viewMode === 'combinado' || viewMode === 'gordura') && (
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-1 rounded-full bg-[#d97706] dark:bg-amber-400" />
                <span className="font-bold text-amber-700 dark:text-amber-400">% Gordura do Paciente</span>
              </div>
            )}

            {/* Clinic Avg Body Fat */}
            {showClinicBenchmark && (viewMode === 'combinado' || viewMode === 'gordura') && (
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Média da Clínica (%G)</span>
              </div>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Valores tabulares aferidos por consulta clínica
          </span>
        </div>

        {/* Chart Canvas */}
        <div className="h-[380px] sm:h-[440px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'combinado' ? (
              <ComposedChart data={comparisonSeries} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="gradientWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004f28" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#004f28" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  dy={10}
                />
                
                {/* Left Y-Axis: Weight (kg) */}
                <YAxis 
                  yAxisId="weight"
                  orientation="left"
                  domain={['dataMin - 3', 'dataMax + 3']}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#004f28' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}kg`}
                />

                {/* Right Y-Axis: Body Fat (%) */}
                <YAxis 
                  yAxisId="bf"
                  orientation="right"
                  domain={[12, 35]}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#d97706' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />

                <Tooltip content={<CustomClinicalTooltip />} />

                {/* Target Lines */}
                {showTargetLine && (
                  <ReferenceLine 
                    yAxisId="weight" 
                    y={targetWeight} 
                    stroke="#10b981" 
                    strokeDasharray="3 3" 
                    strokeWidth={1.5}
                    label={{ value: `Meta: ${targetWeight}kg`, position: 'insideBottomLeft', fill: '#059669', fontSize: 10, fontWeight: 700 }}
                  />
                )}

                {/* Patient Weight Area & Line */}
                <Area
                  yAxisId="weight"
                  type="monotone"
                  dataKey="patientWeightKg"
                  name="Peso do Paciente"
                  fill="url(#gradientWeight)"
                  stroke="#004f28"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#004f28', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#004f28' }}
                />

                {/* Clinic Avg Weight Line */}
                {showClinicBenchmark && (
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="clinicAvgWeightKg"
                    name="Média da Clínica (Peso)"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 5, fill: '#64748b' }}
                  />
                )}

                {/* Patient Body Fat Line */}
                <Line
                  yAxisId="bf"
                  type="monotone"
                  dataKey="patientBodyFatPercent"
                  name="% Gordura do Paciente"
                  stroke="#d97706"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#d97706' }}
                />

                {/* Clinic Avg Body Fat Line */}
                {showClinicBenchmark && (
                  <Line
                    yAxisId="bf"
                    type="monotone"
                    dataKey="clinicAvgBodyFatPercent"
                    name="Média da Clínica (%G)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 5, fill: '#f59e0b' }}
                  />
                )}
              </ComposedChart>
            ) : viewMode === 'peso' ? (
              <ComposedChart data={comparisonSeries} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="gradientWeightOnly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004f28" stopOpacity={0.16}/>
                    <stop offset="95%" stopColor="#004f28" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 3', 'dataMax + 3']}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#004f28' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}kg`}
                />
                <Tooltip content={<CustomClinicalTooltip />} />

                {/* Confidence Range Band for Clinic Cohort */}
                {showConfidenceBand && (
                  <Area
                    type="monotone"
                    dataKey="clinicWeightRangeMax"
                    stroke="none"
                    fill="#94a3b8"
                    fillOpacity={0.12}
                    name="Faixa Superior da Clínica"
                  />
                )}

                {showTargetLine && (
                  <ReferenceLine 
                    y={targetWeight} 
                    stroke="#10b981" 
                    strokeDasharray="3 3" 
                    strokeWidth={1.5}
                    label={{ value: `Meta: ${targetWeight}kg`, position: 'insideBottomLeft', fill: '#059669', fontSize: 10, fontWeight: 700 }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="patientWeightKg"
                  name="Peso do Paciente"
                  fill="url(#gradientWeightOnly)"
                  stroke="#004f28"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#004f28', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#004f28' }}
                />

                {showClinicBenchmark && (
                  <Line
                    type="monotone"
                    dataKey="clinicAvgWeightKg"
                    name="Média da Clínica"
                    stroke="#475569"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 5, fill: '#475569' }}
                  />
                )}
              </ComposedChart>
            ) : (
              <ComposedChart data={comparisonSeries} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="gradientBfOnly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.16}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={[10, 35]}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#d97706' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomClinicalTooltip />} />

                {showConfidenceBand && (
                  <Area
                    type="monotone"
                    dataKey="clinicBfRangeMax"
                    stroke="none"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    name="Faixa de Variação Clínica"
                  />
                )}

                {showTargetLine && (
                  <ReferenceLine 
                    y={targetBf} 
                    stroke="#059669" 
                    strokeDasharray="3 3" 
                    strokeWidth={1.5}
                    label={{ value: `Meta %G: ${targetBf}%`, position: 'insideBottomLeft', fill: '#059669', fontSize: 10, fontWeight: 700 }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="patientBodyFatPercent"
                  name="% Gordura do Paciente"
                  fill="url(#gradientBfOnly)"
                  stroke="#d97706"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#d97706' }}
                />

                {showClinicBenchmark && (
                  <Line
                    type="monotone"
                    dataKey="clinicAvgBodyFatPercent"
                    name="Média da Clínica"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 5, fill: '#f59e0b' }}
                  />
                )}
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>

      {/* Detailed Assessment Timeline & Clinic Benchmark Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
              Tabela de Consultas e Comparativo Individualizado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Histórico ponto a ponto comparado à trajetória média de pacientes da clínica no mesmo marco temporal.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {comparisonSeries.length} avaliações registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3 px-3">Consulta / Data</th>
                <th className="py-3 px-3 text-right">Peso Paciente</th>
                <th className="py-3 px-3 text-right">Média Clínica</th>
                <th className="py-3 px-3 text-right">Delta Peso</th>
                <th className="py-3 px-3 text-right">%G Paciente</th>
                <th className="py-3 px-3 text-right">%G Média Clínica</th>
                <th className="py-3 px-3 text-right">Delta %G</th>
                <th className="py-3 px-3 text-center">Status Clínico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {comparisonSeries.map((row, idx) => {
                const isFavorableWeight = row.weightDeltaKg <= 0;
                const isFavorableBf = row.bfDeltaPercent !== undefined && row.bfDeltaPercent <= 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {row.eventLabel}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {row.date}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-slate-100 text-sm">
                      {row.patientWeightKg.toFixed(1)} kg
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400">
                      {row.clinicAvgWeightKg.toFixed(1)} kg
                    </td>

                    <td className="py-3 px-3 text-right font-bold">
                      <span className={isFavorableWeight ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {row.weightDeltaKg > 0 ? `+${row.weightDeltaKg.toFixed(1)}` : row.weightDeltaKg.toFixed(1)} kg
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-amber-700 dark:text-amber-400 text-sm">
                      {row.patientBodyFatPercent !== undefined ? `${row.patientBodyFatPercent.toFixed(1)}%` : '--'}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400">
                      {row.clinicAvgBodyFatPercent.toFixed(1)}%
                    </td>

                    <td className="py-3 px-3 text-right font-bold">
                      {row.bfDeltaPercent !== undefined ? (
                        <span className={isFavorableBf ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                          {row.bfDeltaPercent > 0 ? `+${row.bfDeltaPercent.toFixed(1)}` : row.bfDeltaPercent.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                        idx === 0 
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                          : isFavorableWeight && (row.bfDeltaPercent === undefined || isFavorableBf)
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}>
                        {idx === 0 ? 'Ponto de Partida' : isFavorableWeight ? 'Superior à Coorte' : 'Em Acompanhamento'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Nova Consulta de Evolução */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-[#004f28] dark:text-emerald-400 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Registrar Nova Medição de Evolução
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adiciona um novo ponto ao gráfico e recalcula o benchmark.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddNewPoint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Data da Consulta
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peso Corporal (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    % Gordura Corporal (%G)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="60"
                    value={newBf}
                    onChange={(e) => setNewBf(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Massa Magra Estimada (kg - opcional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newLeanMass}
                  onChange={(e) => setNewLeanMass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="Ex: 51.2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rótulo do Marco Clínico
                </label>
                <input
                  type="text"
                  value={newEventLabel}
                  onChange={(e) => setNewEventLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Retorno 60 dias, Reavaliação Pós-Dieta"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#004f28] hover:bg-[#003d1f] text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Salvar Medição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
