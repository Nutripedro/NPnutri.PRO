import React, { useState } from 'react';
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface CardiometabolicCalculatorCardProps {
  initialWeight?: number;
  initialHeight?: number;
}

export const CardiometabolicCalculatorCard: React.FC<CardiometabolicCalculatorCardProps> = ({
  initialWeight = 70,
  initialHeight = 170
}) => {
  const [weight, setWeight] = useState<number>(initialWeight);
  const [height, setHeight] = useState<number>(initialHeight);

  const heightM = height / 100;
  const bmi = heightM > 0 ? weight / (heightM * heightM) : 0;

  // WHO / SISVAN Adult BMI Risk Classification
  const getRiskClassification = (valBmi: number) => {
    if (valBmi < 18.5) {
      return {
        category: 'Baixo Peso (Magreza)',
        risk: 'Baixo para DCV / Risco Nutricional',
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
        dotColor: 'bg-amber-500',
        icon: AlertTriangle,
        description: 'Atenção para possível depleção de massa magra ou inadequação calórica.'
      };
    } else if (valBmi < 25.0) {
      return {
        category: 'Eutrofia (Peso Adequado)',
        risk: 'Risco Cardiometabólico Mínimo (Baixo)',
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dotColor: 'bg-emerald-500',
        icon: CheckCircle2,
        description: 'Perfil antropométrico dentro dos padrões de homeostase e longevidade.'
      };
    } else if (valBmi < 30.0) {
      return {
        category: 'Sobrepeso (Pré-obesidade)',
        risk: 'Risco Cardiometabólico Aumentado (Moderado)',
        badgeBg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        dotColor: 'bg-yellow-500',
        icon: AlertTriangle,
        description: 'Início de sobrecarga metabólica. Recomenda-se avaliação de circunferência de cintura.'
      };
    } else if (valBmi < 35.0) {
      return {
        category: 'Obesidade Grau I',
        risk: 'Risco Cardiometabólico Alto',
        badgeBg: 'bg-orange-50 border-orange-200 text-orange-800',
        dotColor: 'bg-orange-500',
        icon: ShieldAlert,
        description: 'Elevada probabilidade de resistência insulínica, esteatose hepática e dislipidemia.'
      };
    } else if (valBmi < 40.0) {
      return {
        category: 'Obesidade Grau II',
        risk: 'Risco Cardiometabólico Muito Alto',
        badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
        dotColor: 'bg-rose-600',
        icon: ShieldAlert,
        description: 'Risco expressivo para eventos cardiovasculares e hipertensão arterial sistêmica.'
      };
    } else {
      return {
        category: 'Obesidade Grau III (Grave)',
        risk: 'Risco Cardiometabólico Crítico',
        badgeBg: 'bg-red-100 border-red-300 text-red-900',
        dotColor: 'bg-red-700',
        icon: XCircle,
        description: 'Urgência clínica e nutricional para protocolo intensivo de proteção vascular.'
      };
    }
  };

  const currentClassification = getRiskClassification(bmi);
  const StatusIcon = currentClassification.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#004f28] flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Calculadora & Triagem de Risco Cardiometabólico
            </h3>
            <p className="text-xs text-slate-500">
              Estimativa baseada no IMC (OMS / Diretriz Brasileira de Obesidade)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-400">IMC Calculado:</span>
          <span className="font-bold text-slate-900 text-sm">{bmi > 0 ? bmi.toFixed(1) : '—'} kg/m²</span>
        </div>
      </div>

      {/* Calculator Inputs & Active Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        
        {/* Input Controls */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Parâmetros Antropométricos</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">PESO ATUAL (KG)</label>
              <input
                type="number"
                step="0.5"
                min="30"
                max="300"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004f28]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">ESTATURA (CM)</label>
              <input
                type="number"
                step="1"
                min="100"
                max="250"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004f28]"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            * Altere os valores acima para simular rapidamente diferentes cenários de risco clínico para o paciente em atendimento.
          </p>
        </div>

        {/* Semaphore Alert Result Card */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-3 ${currentClassification.badgeBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${currentClassification.dotColor} animate-pulse`} />
              <span className="text-xs font-bold uppercase tracking-wider">Status de Triagem</span>
            </div>
            <StatusIcon className="w-5 h-5 opacity-80" />
          </div>

          <div>
            <div className="text-lg font-black tracking-tight">{currentClassification.category}</div>
            <div className="text-xs font-bold mt-0.5">{currentClassification.risk}</div>
          </div>

          <p className="text-xs leading-relaxed opacity-90">
            {currentClassification.description}
          </p>
        </div>

      </div>

      {/* Reference Table for Rapid Screening in Adults */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-[#004f28]" />
            <span>Tabela de Referência para Triagem Rápida em Adultos (OMS)</span>
          </h4>
          <span className="text-[10px] font-mono text-slate-400">Classificação IMC & Risco Associado</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">IMC (kg/m²)</th>
                <th className="py-2 px-3">Classificação SISVAN / OMS</th>
                <th className="py-2 px-3">Risco Cardiometabólico</th>
                <th className="py-2 px-3">Sinalizador Semaforizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className={bmi < 18.5 ? 'bg-amber-50/60 font-bold' : ''}>
                <td className="py-2 px-3">&lt; 18,5</td>
                <td className="py-2 px-3">Baixo Peso (Magreza)</td>
                <td className="py-2 px-3">Baixo (Risco Nutricional)</td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">Alerta</span></td>
              </tr>
              <tr className={bmi >= 18.5 && bmi < 25.0 ? 'bg-emerald-50/80 font-bold' : ''}>
                <td className="py-2 px-3">18,5 – 24,9</td>
                <td className="py-2 px-3">Eutrofia (Peso Normal)</td>
                <td className="py-2 px-3 text-[#004f28]">Mínimo / Baixo</td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-[#004f28] font-bold">Ótimo</span></td>
              </tr>
              <tr className={bmi >= 25.0 && bmi < 30.0 ? 'bg-yellow-50/60 font-bold' : ''}>
                <td className="py-2 px-3">25,0 – 29,9</td>
                <td className="py-2 px-3">Sobrepeso (Pré-obesidade)</td>
                <td className="py-2 px-3 text-yellow-800">Aumentado (Moderado)</td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-800 font-bold">Moderado</span></td>
              </tr>
              <tr className={bmi >= 30.0 && bmi < 35.0 ? 'bg-orange-50/60 font-bold' : ''}>
                <td className="py-2 px-3">30,0 – 34,9</td>
                <td className="py-2 px-3">Obesidade Grau I</td>
                <td className="py-2 px-3 text-orange-800">Alto</td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-[10px] bg-orange-100 text-orange-800 font-bold">Alto Risco</span></td>
              </tr>
              <tr className={bmi >= 35.0 && bmi < 40.0 ? 'bg-rose-50/60 font-bold' : ''}>
                <td className="py-2 px-3">35,0 – 39,9</td>
                <td className="py-2 px-3">Obesidade Grau II</td>
                <td className="py-2 px-3 text-rose-800">Muito Alto</td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">Muito Alto</span></td>
              </tr>
              <tr className={bmi >= 40.0 ? 'bg-red-100 font-bold' : ''}>
                <td className="py-2 px-3">&ge; 40,0</td>
                <td className="py-2 px-3">Obesidade Grau III (Grave)</td>
                <td className="py-2 px-3 text-red-900">Crítico</td>
                <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-[10px] bg-red-200 text-red-900 font-bold">Crítico</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
