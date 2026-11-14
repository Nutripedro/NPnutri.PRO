import React, { useState } from 'react';
import { Patient, AnthropometryEvaluation, WeightEvolutionPoint } from '../types';
import { GraficoEvolucaoPeso } from './GraficoEvolucaoPeso';
import { DashboardEvolucaoClinica } from './DashboardEvolucaoClinica';
import { CardiometabolicCalculatorCard } from './CardiometabolicCalculatorCard';
import { 
  Activity, 
  Target, 
  Scale, 
  TrendingUp, 
  Info,
  CalendarDays,
  Edit,
  Users,
  LineChart as LineChartIcon
} from 'lucide-react';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

interface DashboardViewProps {
  patient: Patient;
  anthro: AnthropometryEvaluation;
  privacyMode: boolean;
  onEdit: () => void;
  allPatients?: Patient[];
  onUpdatePatientWeightHistory?: (newHistory: WeightEvolutionPoint[]) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patient,
  anthro,
  privacyMode,
  onEdit,
  allPatients = [],
  onUpdatePatientWeightHistory
}) => {
  const [evolutionDisplayMode, setEvolutionDisplayMode] = useState<'benchmark_clinica' | 'peso_rapido'>('benchmark_clinica');
  return (
    <div className="space-y-6">
      
      {/* Welcome & Summary Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl border border-emerald-100 dark:border-emerald-800/80">
            <span className="text-xl font-black text-[#004f28] dark:text-emerald-400">{patient?.avatarInitials || (patient?.name ? patient.name.slice(0, 2).toUpperCase() : 'PC')}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Olá, <span className={privacyMode ? 'filter blur-xs' : ''}>{(patient?.name || 'Paciente').split(' ')[0]}</span>!
              </h2>
              <InfoHelpButton helpId="dashboard" size="xs" variant="emerald" title="Explicativo sobre o Dashboard de Progresso" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Prontuário {patient?.recordNumber || 'N/A'} • Unidade: {patient?.unit || 'Clínica Principal'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <ClinicalTooltip helpId="pacientes" position="left">
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar Prontuário</span>
            </button>
          </ClinicalTooltip>
          <div className="flex items-center space-x-2 text-[10px] font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400">
            <CalendarDays className="w-3 h-3" />
            <span>Avaliado em: {patient.lastAssessmentDate}</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Peso Atual</span>
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{patient.currentWeightKg} kg</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">IMC: {patient.imc.toFixed(1)} (Eutrófica)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meta de Gordura</span>
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{anthro.targetBodyFatPercent}%</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">Gordura Atual: {anthro.bodyFatPercent}%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Massa Magra</span>
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{anthro.leanMassKg} kg</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">Preservação muscular: 100%</p>
        </div>
      </div>

      {/* Clinical Evolution Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEvolutionDisplayMode('benchmark_clinica')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              evolutionDisplayMode === 'benchmark_clinica'
                ? 'bg-[#004f28] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dashboard de Evolução & Benchmark Clínico</span>
          </button>

          <button
            onClick={() => setEvolutionDisplayMode('peso_rapido')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              evolutionDisplayMode === 'peso_rapido'
                ? 'bg-[#004f28] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Curva de Peso & Metas Rápidas</span>
          </button>
        </div>

        <span className="text-[11px] font-sans text-slate-400 px-2 hidden md:inline">
          Histórico de Peso e % Gordura comparado à Clínica
        </span>
      </div>

      {/* Render selected Evolution Component */}
      {evolutionDisplayMode === 'benchmark_clinica' ? (
        <DashboardEvolucaoClinica
          patient={patient}
          allPatients={allPatients}
          privacyMode={privacyMode}
          onUpdatePatientWeightHistory={onUpdatePatientWeightHistory}
        />
      ) : (
        <GraficoEvolucaoPeso patient={patient} privacyMode={privacyMode} />
      )}

      {/* Cardiometabolic Risk Calculator & Reference Table Card */}
      <CardiometabolicCalculatorCard 
        initialWeight={patient.currentWeightKg} 
        initialHeight={patient.heightCm} 
      />

      {/* Clinical Notes / Next Steps */}
      <div className="bg-[#004f28] dark:bg-emerald-950 rounded-xl p-6 text-white dark:border dark:border-emerald-800/80 shadow-lg flex items-start space-x-4">
        <Info className="w-10 h-10 text-emerald-300 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base font-bold text-white dark:text-emerald-100 mb-2">Orientações de Conduta Sugerida</h3>
          <p className="text-sm text-emerald-100 dark:text-emerald-200/90 leading-relaxed">
            {anthro.clinicalOpinion}
          </p>
        </div>
      </div>

    </div>
  );
};
