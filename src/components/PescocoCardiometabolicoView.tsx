import React, { useState } from 'react';
import { Patient, NeckCardiometabolicEvaluation, BiologicalSex } from '../types';
import { evaluateNeckCardiometabolic } from '../domain/calculations';
import { 
  HeartPulse, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Save, 
  Moon, 
  Flame, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

interface PescocoCardiometabolicoViewProps {
  patient: Patient;
  evaluation: NeckCardiometabolicEvaluation;
  onSaveEvaluation: (evaluation: NeckCardiometabolicEvaluation) => void;
}

export const PescocoCardiometabolicoView: React.FC<PescocoCardiometabolicoViewProps> = ({
  patient,
  evaluation,
  onSaveEvaluation
}) => {
  const [neckCm, setNeckCm] = useState<number>(evaluation.neckCircumferenceCm || (patient.sex === 'female' ? 31.0 : 38.5));
  const [handgripKgf, setHandgripKgf] = useState<number>(evaluation.handgripKgf || 34.0);

  const riskResult = evaluateNeckCardiometabolic(
    neckCm,
    handgripKgf,
    patient.currentWeightKg,
    patient.heightCm,
    patient.sex
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800">
                Estratificação Avançada de Risco
              </span>
              <span className="text-xs text-slate-400 font-mono">Consenso SBD / Framingham</span>
              <InfoHelpButton helpId="pescoco" size="xs" variant="emerald" title="Explicativo sobre Circunferência do Pescoço e Risco Cardiometabólico" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Circunferência do Pescoço & Risco Cardiometabólico
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Paciente: {patient.name} ({patient.sex === 'female' ? 'Mulher' : 'Homem'}, {patient.age}a) • Ponto de Corte: {riskResult.neckCutoff} cm
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl border flex items-center space-x-3 bg-slate-50 border-slate-200">
            <HeartPulse className="w-6 h-6 text-rose-600" />
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Risco Composto (IRC-CP/FMR)
              </span>
              <span className="text-xl font-black font-mono text-slate-900">
                {riskResult.compositeRisk}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs & Live Stratification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Neck & Dynamometry Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Medições Antropométricas Clínicas
            </h3>

            {/* Neck Circumference Input */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Circunferência do Pescoço</span>
                  <span className="text-[11px] text-slate-400 block">Plano horizontal na altura da cartilagem cricóide</span>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.5"
                    value={neckCm}
                    onChange={(e) => setNeckCm(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-center font-mono font-bold text-sm border border-slate-200 rounded"
                  />
                  <span className="text-xs font-mono text-slate-400">cm</span>
                </div>
              </div>
              <input
                type="range"
                min="25"
                max="50"
                step="0.5"
                value={neckCm}
                onChange={(e) => setNeckCm(parseFloat(e.target.value))}
                className="w-full accent-[#004f28]"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>Limiar Seguro: ≤ {riskResult.neckCutoff} cm</span>
                <span className={riskResult.isNeckHigh ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {riskResult.deltaFromCutoff > 0 ? `+${riskResult.deltaFromCutoff} cm acima do corte` : `${Math.abs(riskResult.deltaFromCutoff)} cm abaixo do corte`}
                </span>
              </div>
            </div>

            {/* Jamar Handgrip Dynamometer */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Dinamometria Palmar (Jamar)</span>
                  <span className="text-[11px] text-slate-400 block">Melhor de 3 tentativas na mão dominante</span>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.5"
                    value={handgripKgf}
                    onChange={(e) => setHandgripKgf(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-center font-mono font-bold text-sm border border-slate-200 rounded"
                  />
                  <span className="text-xs font-mono text-slate-400">kgf</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="75"
                step="0.5"
                value={handgripKgf}
                onChange={(e) => setHandgripKgf(parseFloat(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>Força Relativa (FMR = Força / Peso):</span>
                <span className="font-bold text-sky-800">{riskResult.fmr} kgf/kg (Corte: ≥ 0.33)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Pathophysiology Risk Indicators */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Marcadores de Risco Fisiológico
            </h3>

            {/* Insulin Resistance Marker */}
            <div className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
              riskResult.insulinResistanceRisk ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <Flame className={`w-5 h-5 shrink-0 mt-0.5 ${
                riskResult.insulinResistanceRisk ? 'text-amber-600' : 'text-[#004f28]'
              }`} />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Resistência Periférica à Insulina (Gordura Cervical Superior)</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {riskResult.insulinResistanceRisk 
                    ? 'Circunferência aumentada indica liberação acentuada de ácidos graxos livres na circulação jugular e risco de esteatose.'
                    : 'Dentro da normalidade anatômica. Sem deposição patológica de tecido adiposo no segmento cervical.'}
                </p>
              </div>
            </div>

            {/* Sleep Apnea Marker */}
            <div className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
              riskResult.sleepApneaRisk ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <Moon className={`w-5 h-5 shrink-0 mt-0.5 ${
                riskResult.sleepApneaRisk ? 'text-rose-600' : 'text-slate-500'
              }`} />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Risco de Apneia Obstrutiva do Sono (SAOS)</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {riskResult.sleepApneaRisk 
                    ? 'Perímetro cervical crítico associado a colapso de vias aéreas superiores e fragmentação do sono.'
                    : 'Risco de colapsabilidade das vias aéreas superiores baixo.'}
                </p>
              </div>
            </div>

            {/* Sarcopenia & Functional Frailty */}
            <div className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
              riskResult.sarcopeniaRisk ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <Activity className={`w-5 h-5 shrink-0 mt-0.5 ${
                riskResult.sarcopeniaRisk ? 'text-rose-600' : 'text-[#004f28]'
              }`} />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fragilidade Muscular & Sarcopenia</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {riskResult.sarcopeniaRisk 
                    ? 'Razão de força muscular relativa insuficiente (< 0.33 kgf/kg). Risco de dinapenia.'
                    : 'Excelente força muscular relativa (FMR > 0.33 kgf/kg). Densidade muscular íntegra.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onSaveEvaluation({
                    ...evaluation,
                    neckCircumferenceCm: neckCm,
                    handgripKgf,
                    relativeStrengthKgfPerKg: riskResult.fmr,
                    compositeRisk: riskResult.compositeRisk,
                    insulinResistanceRisk: riskResult.insulinResistanceRisk,
                    sleepApneaRisk: riskResult.sleepApneaRisk,
                    sarcopeniaRisk: riskResult.sarcopeniaRisk
                  });
                  alert('Estratificação de risco cardiometabólico salva com sucesso!');
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

    </div>
  );
};
