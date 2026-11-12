import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, ChevronRight, Info, Sliders } from 'lucide-react';
import { MebSymptomsModal } from './MebSymptomsModal';
import { MebEvolutionChart } from './MebEvolutionChart';

interface MebCalculatorCardProps {
  monocytesPercent?: number; // ex: 6.5 (%)
  eosinophilsPercent?: number; // ex: 2.1 (%)
  basophilsPercent?: number; // ex: 0.8 (%)
  patientName?: string;
  onUpdateSymptoms?: (symptoms: string[]) => void;
}

export const MebCalculatorCard: React.FC<MebCalculatorCardProps> = ({
  monocytesPercent = 6.2,
  eosinophilsPercent = 2.0,
  basophilsPercent = 0.5,
  patientName = 'Paciente',
  onUpdateSymptoms
}) => {
  const [mono, setMono] = useState<number>(monocytesPercent);
  const [eos, setEos] = useState<number>(eosinophilsPercent);
  const [baso, setBaso] = useState<number>(basophilsPercent);

  const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Distensão abdominal / Estufamento', 'Gases excessivos / Flatulência']);
  const [activeTab, setActiveTab] = useState<'calculator' | 'evolution'>('calculator');

  // Cálculo determinístico do Índice MEB (%) = Monócitos + Eosinófilos + Basófilos
  const mebValue = Number((Number(mono) + Number(eos) + Number(baso)).toFixed(2));

  // Classificação conforme Prompt V1.0
  const getMebClassification = (val: number) => {
    if (val < 5.0) {
      return {
        level: 'excelente',
        title: 'EXCELENTE (< 5.0%)',
        status: 'Equilíbrio imunológico pleno',
        interpretation: 'Sem evidências laboratoriais de ativação inflamatória ou disbiose.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        dot: 'bg-emerald-600',
        progressColor: 'bg-emerald-500'
      };
    }
    if (val <= 7.0) {
      return {
        level: 'ideal',
        title: 'IDEAL / VERDE (5.0% a 7.0%)',
        status: 'Faixa funcional ideal para saúde preventiva e longevidade',
        interpretation: 'Baixa probabilidade de disbiose ou processos alérgicos ativos.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50/80',
        border: 'border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        dot: 'bg-emerald-500',
        progressColor: 'bg-emerald-600'
      };
    }
    if (val <= 9.0) {
      return {
        level: 'atencao',
        title: 'ATENÇÃO / AMARELO (7,1% a 9,0%)',
        status: 'Alerta clínico inicial / Limiar de risco',
        interpretation: 'Possível início de disbiose, aumento da permeabilidade intestinal, inflamação subclínica ou intolerâncias alimentares. Requer correlação clínica.',
        color: 'text-amber-800',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        badgeBg: 'bg-amber-100 text-amber-900',
        dot: 'bg-amber-500',
        progressColor: 'bg-amber-500'
      };
    }
    if (val <= 12.0) {
      return {
        level: 'moderado',
        title: 'MODERADO / LARANJA (9,1% a 12,0%)',
        status: 'Ativação imunológica moderada',
        interpretation: 'Maior probabilidade de disbiose intestinal, parasitoses assintomáticas, alergias alimentares ativas ou inflamação de mucosa. Sugere investigação complementar.',
        color: 'text-orange-800',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        badgeBg: 'bg-orange-100 text-orange-900',
        dot: 'bg-orange-500',
        progressColor: 'bg-orange-500'
      };
    }
    return {
      level: 'elevado',
      title: 'ELEVADO / VERMELHO (> 12,0%)',
      status: 'Alerta clínico importante',
      interpretation: 'Forte indício de disbiose importante, parasitose, alergias alimentares severas, hipersensibilidade, SIBO/SIFO, esofagite eosinofílica ou DII.',
      color: 'text-red-800',
      bg: 'bg-red-50',
      border: 'border-red-300',
      badgeBg: 'bg-red-100 text-red-900',
      dot: 'bg-red-600',
      progressColor: 'bg-red-600'
    };
  };

  const classification = getMebClassification(mebValue);
  const needsSymptomsCheck = mebValue > 7.0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4A6B5D]" />
            Módulo Clínico: Índice MEB (Monócitos + Eosinófilos + Basófilos)
          </h3>
          <p className="text-xs text-slate-500">
            Marcador auxiliar de alerta precoce para suspeita de disbiose intestinal, alergias e inflamação crônica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeTab === 'calculator' ? 'bg-[#4A6B5D] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cálculo & Entrada
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeTab === 'evolution' ? 'bg-[#4A6B5D] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Evolução Temporal
          </button>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        <div className="space-y-4">
          {/* Seção de Entrada dos Dados do Hemograma (Monócitos, Eosinófilos, Basófilos) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-[#4A6B5D]" />
              Entrada de Dados do Hemograma para o Cálculo MEB (%)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Monócitos (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={mono}
                  onChange={(e) => setMono(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded py-1.5 px-3 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Eosinófilos (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={eos}
                  onChange={(e) => setEos(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded py-1.5 px-3 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Basófilos (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={baso}
                  onChange={(e) => setBaso(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded py-1.5 px-3 text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Valor Calculado & Badge */}
          <div className={`p-4 rounded-xl border ${classification.bg} ${classification.border} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${classification.badgeBg} border shadow-xs`}>
                  <span className={`w-2 h-2 rounded-full ${classification.dot}`}></span>
                  {classification.title}
                </span>
                <span className="text-xs font-semibold text-slate-600">MEB = Monócitos + Eosinófilos + Basófilos</span>
              </div>
              <p className={`text-xs font-medium ${classification.color} leading-relaxed`}>
                <strong>Status:</strong> {classification.status} — {classification.interpretation}
              </p>
            </div>

            <div className="text-right bg-white px-6 py-3.5 rounded-lg border border-slate-200 shadow-xs shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Índice MEB</span>
              <span className="text-3xl font-black font-mono text-slate-900">{mebValue}%</span>
            </div>
          </div>

          {/* Barra de Progresso Colorida Baseada nas Faixas */}
          <div className="space-y-1.5 bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between text-[11px] text-slate-600 font-bold mb-1">
              <span className="text-emerald-700">&lt; 5% Excelente</span>
              <span className="text-emerald-600">5-7% Ideal</span>
              <span className="text-amber-600">7-9% Atenção</span>
              <span className="text-orange-600">9-12% Moderado</span>
              <span className="text-red-600">&gt;12% Elevado</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${classification.progressColor} shadow-xs`}
                style={{ width: `${Math.min(100, (mebValue / 16) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Sugestão automática de exames quando MEB > 9.0% */}
          {mebValue > 9.0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4" />
                Sugestão Clínica: Exames Complementares (MEB &gt; 9.0%)
              </div>
              <p className="text-[11px] text-red-800">
                O índice MEB elevado sugere investigação de disbiose ou inflamação. Recomenda-se selecionar os seguintes exames na aba <strong>Requisição de Exames</strong>:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Calprotectina Fecal', 'PCR Ultrassensível', 'Zonulina Sérica', 'Parasitológico', 'Vitamina D3', 'Ferritina'].map(exam => (
                  <span key={exam} className="bg-white text-[10px] font-bold text-red-700 px-2 py-1 rounded border border-red-200">
                    {exam}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rastreamento de Sintomas se MEB > 7.0% */}
          {needsSymptomsCheck && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">MEB Elevado (&gt; 7,0%): Rastreamento de Sintomas Recomendado</h4>
                  <p className="text-[11px] text-amber-800">
                    {selectedSymptoms.length > 0 ? `${selectedSymptoms.length} sintomas gastrointestinais / sistêmicos assinalados no prontuário.` : 'Nenhum sintoma assinalado até o momento.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSymptomsOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <span>Checklist de Sintomas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Cruzamento com Biomarcadores Intestinais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 shadow-xs">
              <span className="font-bold text-[#4A6B5D] uppercase text-[10px] tracking-wider block">Permeabilidade & Barreira</span>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li className="flex justify-between"><span>Calprotectina Fecal:</span> <span className="font-mono font-medium text-emerald-700">&lt; 50 µg/g</span></li>
                <li className="flex justify-between"><span>Zonulina Sérica:</span> <span className="font-mono font-medium text-amber-700">Normal / Limiar</span></li>
                <li className="flex justify-between"><span>Parasitológico:</span> <span className="font-mono font-medium text-slate-600">Negativo</span></li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 shadow-xs">
              <span className="font-bold text-[#4A6B5D] uppercase text-[10px] tracking-wider block">Inflamação Sistêmica</span>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li className="flex justify-between"><span>PCR Ultrassensível:</span> <span className="font-mono font-medium text-emerald-700">0.12 mg/dL</span></li>
                <li className="flex justify-between"><span>Razão NLR:</span> <span className="font-mono font-medium text-slate-800">1.95 (Ótimo)</span></li>
                <li className="flex justify-between"><span>Ferritina:</span> <span className="font-mono font-medium text-slate-800">85 ng/mL</span></li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 shadow-xs">
              <span className="font-bold text-[#4A6B5D] uppercase text-[10px] tracking-wider block">Eixo Imune & Nutricional</span>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li className="flex justify-between"><span>IgE Total:</span> <span className="font-mono font-medium text-slate-800">74 UI/mL</span></li>
                <li className="flex justify-between"><span>Vitamina D3:</span> <span className="font-mono font-medium text-emerald-700">48 ng/mL</span></li>
                <li className="flex justify-between"><span>Zinco Plasmático:</span> <span className="font-mono font-medium text-slate-800">92 µg/dL</span></li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <MebEvolutionChart />
      )}

      {/* Aviso de Segurança Clínica Obrigatório (Rodapé) */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#4A6B5D] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Aviso de Segurança Clínica:</strong> O índice MEB (Monócitos + Eosinófilos + Basófilos) é um biomarcador funcional complementar utilizado na prática clínica integrativa como indício preliminar de alerta. Ele <strong>NÃO</strong> constitui um diagnóstico médico isolado de disbiose, parasitose ou patologia gastrointestinal. Todos os resultados devem ser correlacionados com anamnese, sinais clínicos e exames complementares validados.
        </p>
      </div>

      {/* Modal de Sintomas */}
      <MebSymptomsModal
        isOpen={isSymptomsOpen}
        onClose={() => setIsSymptomsOpen(false)}
        selectedSymptoms={selectedSymptoms}
        onSave={(symptoms) => {
          setSelectedSymptoms(symptoms);
          if (onUpdateSymptoms) onUpdateSymptoms(symptoms);
        }}
      />
    </div>
  );
};
