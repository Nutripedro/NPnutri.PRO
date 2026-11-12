import React from 'react';
import { Patient, AnthropometryEvaluation } from '../types';
import { GraficoEvolucaoPeso } from './GraficoEvolucaoPeso';
import { CardiometabolicCalculatorCard } from './CardiometabolicCalculatorCard';
import { 
  Activity, 
  Target, 
  Scale, 
  TrendingUp, 
  Info,
  CalendarDays,
  Edit
} from 'lucide-react';

interface DashboardViewProps {
  patient: Patient;
  anthro: AnthropometryEvaluation;
  privacyMode: boolean;
  onEdit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patient,
  anthro,
  privacyMode,
  onEdit
}) => {
  return (
    <div className="space-y-6">
      
      {/* Welcome & Summary Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl border border-emerald-100 dark:border-emerald-800/80">
            <span className="text-xl font-black text-[#004f28] dark:text-emerald-400">{patient.avatarInitials}</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Olá, <span className={privacyMode ? 'filter blur-xs' : ''}>{patient.name.split(' ')[0]}</span>!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Prontuário {patient.recordNumber} • Unidade: {patient.unit}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Editar Prontuário
          </button>
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

      {/* Weight Evolution Graph (Reused Component) */}
      <GraficoEvolucaoPeso patient={patient} privacyMode={privacyMode} />

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
