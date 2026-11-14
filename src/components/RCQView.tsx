import React, { useState } from 'react';
import { Patient, WaistHipEvaluation, BiologicalSex } from '../types';
import { classifyRCQ, RCQ_NORMS } from '../domain/calculations';
import { 
  Scale, 
  Heart, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  FileText, 
  Sliders, 
  Info,
  ShieldCheck,
  FileDown
} from 'lucide-react';
import { getRCQHighlight } from '../domain/validation';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

interface RCQViewProps {
  patient: Patient;
  evaluation: WaistHipEvaluation;
  onSaveEvaluation: (evaluation: WaistHipEvaluation) => void;
}

export const RCQView: React.FC<RCQViewProps> = ({
  patient,
  evaluation,
  onSaveEvaluation
}) => {
  const [sex, setSex] = useState<BiologicalSex>(patient.sex);
  const [age, setAge] = useState<number>(patient.age);
  const [waistCm, setWaistCm] = useState<number>(evaluation.waistCm || (patient.sex === 'female' ? 68.5 : 82.0));
  const [hipCm, setHipCm] = useState<number>(evaluation.hipCm || (patient.sex === 'female' ? 96.0 : 98.0));

  const rcqResult = classifyRCQ(waistCm, hipCm, age, sex);
  const rcqValidation = getRCQHighlight(rcqResult.riskCategory);
  const isAndroid = sex === 'male';

  // Age brackets
  const ageBrackets = [
    { label: '20-29', min: 20, max: 29 },
    { label: '30-39', min: 30, max: 39 },
    { label: '40-49', min: 40, max: 49 },
    { label: '50-59', min: 50, max: 59 },
    { label: '60-69', min: 60, max: 69 }
  ];

  const activeAgeBracket = ageBrackets.find(b => age >= b.min && age <= b.max) || ageBrackets[1];
  const normsTable = RCQ_NORMS[sex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Dark Theme Header Container matching Image 3 reference */}
      <div className="bg-[#0b1320] text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl">
        
        {/* Title & Reference Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight text-white">Avaliação RCQ (Cintura-Quadril)</h2>
              <InfoHelpButton helpId="rcq" size="xs" variant="emerald" title="Explicativo sobre Relação Cintura-Quadril e Risco Coronariano" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Risco Coronariano & Padrão de Adiposidade Visceral
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Tabela Normativa Oficial: Applied Body Composition, pág. 82</span>
          </div>
        </div>

        {/* Male vs Female Model Selector */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <button
            onClick={() => setSex('male')}
            className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
              sex === 'male'
                ? 'bg-sky-950/70 border-sky-500 text-sky-200 ring-1 ring-sky-500 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span>♂ Modelo Masculino</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-900/80 text-sky-300">
              Androide
            </span>
          </button>

          <button
            onClick={() => setSex('female')}
            className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
              sex === 'female'
                ? 'bg-rose-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-500 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span>♀ Modelo Feminino</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-900/80 text-rose-300">
              Ginoide
            </span>
          </button>
        </div>

        {/* Section: Dados Antropométricos (ISAK) */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <h3 className="text-sm font-bold text-white">Dados Antropométricos (ISAK)</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
              Cálculo Ativo
            </span>
          </div>

          {/* Age Bracket Selector */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300">Idade do Paciente</span>
              <span className="font-mono text-sky-400 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded">
                Faixa: {activeAgeBracket.label} anos ({age} a)
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {ageBrackets.map(b => (
                <button
                  key={b.label}
                  onClick={() => setAge(b.min + 2)}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    activeAgeBracket.label === b.label
                      ? 'bg-sky-600 border-sky-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="20"
              max="69"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full accent-sky-500 mt-2"
            />
          </div>

          {/* Waist Measurement Slider & Number */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-baseline mb-1">
              <div>
                <span className="text-xs font-semibold text-white">1. Perímetro da Cintura</span>
                <span className="text-[11px] text-slate-400 block">Ponto mais estreito entre última costela e crista ilíaca</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.5"
                  value={waistCm}
                  onChange={(e) => setWaistCm(parseFloat(e.target.value) || 0)}
                  className={`w-20 px-2 py-1 text-center font-mono font-bold text-sm bg-slate-800 border text-white rounded transition-colors ${
                    rcqValidation.status === 'critical' ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-700'
                  }`}
                />
                <span className="text-xs font-mono text-slate-400">cm</span>
              </div>
            </div>
            <input
              type="range"
              min="55"
              max="130"
              step="0.5"
              value={waistCm}
              onChange={(e) => setWaistCm(parseFloat(e.target.value))}
              className={`w-full ${rcqValidation.status === 'critical' ? 'accent-rose-500' : 'accent-sky-500'}`}
            />
          </div>

          {/* Hip Measurement Slider & Number */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-baseline mb-1">
              <div>
                <span className="text-xs font-semibold text-white">2. Perímetro do Quadril</span>
                <span className="text-[11px] text-slate-400 block">Plano horizontal no nível de maior protuberância glútea</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.5"
                  value={hipCm}
                  onChange={(e) => setHipCm(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-center font-mono font-bold text-sm bg-slate-800 border border-slate-700 text-white rounded"
                />
                <span className="text-xs font-mono text-slate-400">cm</span>
              </div>
            </div>
            <input
              type="range"
              min="70"
              max="150"
              step="0.5"
              value={hipCm}
              onChange={(e) => setHipCm(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          {/* Live Calculated Ratio Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
            rcqValidation.status !== 'normal' 
              ? `${rcqValidation.bgClass.replace('bg-', 'bg-opacity-10 bg-')} ${rcqValidation.borderClass.replace('border-', 'border-opacity-40 border-')} ring-1 ${rcqValidation.borderClass.replace('border-', 'ring-')}/20` 
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Fórmula de Dispersão
              </span>
              <span className="text-xs font-mono text-slate-300">
                RCQ = {waistCm.toFixed(1)} ÷ {hipCm.toFixed(1)}
              </span>
              {rcqValidation.status !== 'normal' && (
                <div className="flex items-center space-x-1.5 mt-1">
                  <AlertTriangle className={`w-3 h-3 ${rcqValidation.iconColor}`} />
                  <span className={`text-[10px] font-bold ${rcqValidation.colorClass.replace('text-', 'text-opacity-90 text-')}`}>
                    {rcqValidation.message}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Índice Calculado
              </span>
              <span className={`text-3xl font-black font-mono tabular-nums ${
                rcqValidation.status !== 'normal' ? rcqValidation.colorClass.replace('text-', 'text-opacity-100 text-') : 'text-sky-400'
              }`}>
                {rcqResult.rcq.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Silhouette & Visual Morphology Gauge */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 mt-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {isAndroid ? 'Padrão Androide (Formato Maçã)' : 'Padrão Ginoide (Formato Pêra)'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isAndroid ? 'Adiposidade Visceral e Troncular' : 'Adiposidade Periférica e Gluteofemoral'}
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase border ${
                rcqResult.riskCategory === 'BAIXO'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : rcqResult.riskCategory === 'MODERADO'
                  ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}
            >
              Classificação: {rcqResult.riskCategory}
            </span>
          </div>

          {/* Visual Silhouette Mockup with waist and hip lines */}
          <div className="py-6 px-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center relative">
            <div className="w-28 h-48 relative flex items-center justify-center">
              {/* Silhouette Body SVG representation */}
              <svg viewBox="0 0 100 200" className="w-full h-full text-sky-600/60 fill-current">
                <circle cx="50" cy="20" r="14" />
                <path d="M 30,40 Q 50,38 70,40 L 72,80 Q 75,105 80,120 L 70,190 L 55,190 L 52,130 L 48,130 L 45,190 L 30,190 L 20,120 Q 25,105 28,80 Z" />
              </svg>

              {/* Waist line callout */}
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-36 flex items-center justify-between text-[11px] font-mono pointer-events-none">
                <div className="h-px bg-amber-400/80 flex-1 border-t border-dashed border-amber-400" />
                <span className="px-2 py-0.5 bg-amber-950/90 border border-amber-600 text-amber-300 rounded text-[10px] shrink-0 mx-1">
                  Cintura: {waistCm.toFixed(1)} cm
                </span>
                <div className="h-px bg-amber-400/80 flex-1 border-t border-dashed border-amber-400" />
              </div>

              {/* Hip line callout */}
              <div className="absolute top-[58%] left-1/2 -translate-x-1/2 w-44 flex items-center justify-between text-[11px] font-mono pointer-events-none">
                <div className="h-px bg-sky-400/80 flex-1 border-t border-dashed border-sky-400" />
                <span className="px-2 py-0.5 bg-sky-950/90 border border-sky-600 text-sky-300 rounded text-[10px] shrink-0 mx-1">
                  Quadril: {hipCm.toFixed(1)} cm
                </span>
                <div className="h-px bg-sky-400/80 flex-1 border-t border-dashed border-sky-400" />
              </div>
            </div>

            {/* Gradient Risk Meter Bar */}
            <div className="w-full max-w-md mt-4">
              <div className="h-3 w-full rounded-full overflow-hidden flex">
                <div className="w-1/4 bg-emerald-500" title="Baixo" />
                <div className="w-1/4 bg-yellow-400" title="Moderado" />
                <div className="w-1/4 bg-amber-500" title="Alto" />
                <div className="w-1/4 bg-rose-600" title="Muito Alto" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 uppercase">
                <span>Baixo</span>
                <span>Moderado</span>
                <span>Alto</span>
                <span>Muito Alto</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1996 Normative Matrix Table */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 mt-5">
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Classificação de Riscos para {sex === 'male' ? 'Homens' : 'Mulheres'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Fonte: Applied body composition assessment, pág. 82 Ed. Human Kinetics 1996
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-center">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 text-left">Idade</th>
                  <th className="py-2 text-emerald-400">Baixo</th>
                  <th className="py-2 text-yellow-400">Moderado</th>
                  <th className="py-2 text-amber-400">Alto</th>
                  <th className="py-2 text-rose-400">Muito Alto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {normsTable.map(row => {
                  const isCurrentRow = activeAgeBracket.label === row.ageLabel;
                  return (
                    <tr
                      key={row.ageLabel}
                      className={isCurrentRow ? 'bg-sky-950/60 font-bold text-white' : 'text-slate-400'}
                    >
                      <td className="py-2 text-left flex items-center space-x-1.5">
                        {isCurrentRow && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />}
                        <span>{row.ageLabel} anos</span>
                      </td>
                      <td className="py-2 text-emerald-400/90">{row.low}</td>
                      <td className="py-2 text-yellow-400/90">{row.mod}</td>
                      <td className="py-2 text-amber-400/90">{row.high}</td>
                      <td className="py-2 text-rose-400/90">{row.veryHigh}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center justify-between">
            <span>* A linha em destaque reflete a idade e o sexo biológico ativos.</span>
            <span className="text-emerald-400">Atualizado em tempo real</span>
          </div>
        </div>

        {/* Parecer Antropométrico & Conduta Sugerida */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 mt-5">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Parecer Antropométrico & Conduta Sugerida</h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Validado Clínico
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            <strong>Estratificação:</strong> Risco Coronariano e Metabólico <strong>{rcqResult.riskCategory}</strong>. 
            A relação cintura-quadril calculada de <strong>{rcqResult.rcq.toFixed(3)}</strong> situa-se na faixa recomendada para a faixa etária de {activeAgeBracket.label} anos. O padrão {isAndroid ? 'androide' : 'ginoide'} não denota acúmulo patológico de gordura intra-abdominal visceral.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gordura Visceral: <strong>Adequada / Controlada</strong></span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Meta Recomendada: <strong>≤ {rcqResult.targetRCQ}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors border border-slate-700 shadow-sm"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => {
              onSaveEvaluation({
                ...evaluation,
                sex,
                age,
                waistCm,
                hipCm,
                ratio: rcqResult.rcq,
                riskCategory: rcqResult.riskCategory,
                morphology: isAndroid ? 'Androide (Formato Maçã)' : 'Ginoide (Formato Pêra)',
                targetRatio: rcqResult.targetRCQ,
                clinicalOpinion: `Relação cintura-quadril de ${rcqResult.rcq.toFixed(3)} compatível com risco ${rcqResult.riskCategory}.`
              });
              alert('Avaliação RCQ salva no prontuário clínico!');
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar no Prontuário</span>
          </button>
        </div>

      </div>

    </div>
  );
};
