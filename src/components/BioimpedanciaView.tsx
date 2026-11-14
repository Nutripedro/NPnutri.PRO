import React from 'react';
import { Patient, BioimpedanceEvaluation } from '../types';
import { 
  Zap, 
  Activity, 
  Droplets, 
  ShieldCheck, 
  TrendingUp, 
  Save, 
  FileText,
  Layers,
  Heart,
  Download,
  Printer,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';
import { validatePhaseAngle, validateEdemaIndex } from '../domain/validation';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface BioimpedanciaViewProps {
  patient: Patient;
  evaluation: BioimpedanceEvaluation;
  onSaveEvaluation: (evaluation: BioimpedanceEvaluation) => void;
}

export const BioimpedanciaView: React.FC<BioimpedanciaViewProps> = ({
  patient,
  evaluation,
  onSaveEvaluation
}) => {
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [phaseAngle, setPhaseAngle] = React.useState<number>(evaluation.phaseAngleDeg);
  const [edemaIndex, setEdemaIndex] = React.useState<number>(evaluation.edemaIndex);
  const [tbwL, setTbwL] = React.useState<number>(evaluation.totalBodyWaterL);
  const [isExporting, setIsExporting] = React.useState(false);

  const icwL = Math.round(tbwL * 0.62 * 10) / 10;
  const ecwL = Math.round(tbwL * 0.38 * 10) / 10;
  
  const paValidation = validatePhaseAngle(phaseAngle);
  const edemaValidation = validateEdemaIndex(edemaIndex);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`laudo-bioimpedancia-${patient.name.toLowerCase().replace(/\s+/g, '-')}-${evaluation.date}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o laudo em PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                BIA Multifrequencial 8 Eletrodos
              </span>
              <span className="text-xs text-slate-400 font-mono">1 kHz a 500 kHz Tetrapolar</span>
              <InfoHelpButton helpId="bioimpedancia" size="xs" variant="emerald" title="Explicativo sobre Bioimpedância 4C e Ângulo de Fase" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Bioimpedância & Modelo de 4 Compartimentos (4C)
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Paciente: {patient.name} • Dispositivo: {evaluation.device} • Data: {evaluation.date}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <ClinicalTooltip helpId="bioimpedancia" position="left">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-[#004f28] text-xs font-bold rounded-lg flex items-center space-x-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isExporting ? 'Gerando...' : 'Exportar Laudo Bioimpedância'}</span>
              </button>
            </ClinicalTooltip>

            {/* Core Phase Angle Score */}
            <div className={`px-4 py-2.5 rounded-xl border flex items-center space-x-3 transition-all duration-300 ${
              paValidation.status !== 'normal' 
                ? `${paValidation.bgClass} ${paValidation.borderClass} ring-1 ${paValidation.borderClass.replace('border-', 'ring-')}/40` 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                paValidation.status !== 'normal' ? paValidation.bgClass.replace('bg-', 'bg-opacity-100 bg-').replace('50', '600') : 'bg-[#004f28]'
              }`}>
                {paValidation.status !== 'normal' ? (
                  <AlertTriangle className="w-5 h-5 text-white" />
                ) : (
                  <Zap className="w-5 h-5 text-emerald-300" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    paValidation.status !== 'normal' ? paValidation.colorClass : 'text-emerald-800'
                  }`}>
                    Ângulo de Fase
                  </span>
                </div>
                <span className={`text-2xl font-black font-mono tabular-nums ${
                  paValidation.status !== 'normal' ? paValidation.colorClass : 'text-[#004f28]'
                }`}>
                  {phaseAngle}°
                </span>
                {paValidation.status !== 'normal' && (
                  <span className={`text-[8px] block font-sans font-bold leading-tight mt-0.5 ${paValidation.colorClass}`}>
                    {paValidation.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Container for PDF Export */}
      <div ref={reportRef} className="space-y-6 bg-white dark:bg-slate-900 p-2 rounded-xl">
        {/* Printable Header (Visible only in Export) */}
        <div className="hidden print:block mb-8 border-b-2 border-emerald-800 pb-4">
          <h1 className="text-2xl font-bold text-[#004f28]">Relatório de Bioimpedância Clínica</h1>
          <p className="text-sm text-slate-600 uppercase font-bold tracking-widest mt-1">Nutrição Avançada & Composição Corporal</p>
          <div className="grid grid-cols-2 gap-8 mt-6 text-xs font-mono">
            <div>
              <p><span className="text-slate-500">PACIENTE:</span> <span className="font-bold">{patient.name}</span></p>
              <p><span className="text-slate-500">PRONTUÁRIO:</span> <span className="font-bold">{patient.recordNumber}</span></p>
            </div>
            <div className="text-right">
              <p><span className="text-slate-500">DATA DA AVALIAÇÃO:</span> <span className="font-bold">{evaluation.date}</span></p>
              <p><span className="text-slate-500">EQUIPAMENTO:</span> <span className="font-bold">{evaluation.device}</span></p>
            </div>
          </div>
        </div>

        {/* Historical Evolution Chart */}
        {patient.bioimpedanceHistory && patient.bioimpedanceHistory.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#004f28]" />
                <h3 className="text-base font-bold text-slate-900">
                  Histórico de Evolução Bioelétrica
                </h3>
              </div>
              <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#004f28]" />
                  <span className="text-slate-600">Ângulo de Fase (°)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-500" />
                  <span className="text-slate-600">Massa Magra (kg)</span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={patient.bioimpedanceHistory.map(h => ({
                    ...h,
                    formattedDate: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004f28" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#004f28" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#004f28' }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#0ea5e9' }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-[11px] font-mono">
                            <p className="font-bold border-b border-white/10 pb-1.5 mb-1.5">{new Date(data.date).toLocaleDateString('pt-BR')}</p>
                            <div className="space-y-1">
                              <p className="flex justify-between gap-4">
                                <span className="text-emerald-400">Ângulo de Fase:</span>
                                <span className="font-bold">{data.phaseAngleDeg}°</span>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-sky-400">Massa Magra:</span>
                                <span className="font-bold">{data.leanMassKg} kg</span>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-slate-400">Gordura:</span>
                                <span className="font-bold">{data.bodyFatPercent}%</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="phaseAngleDeg" 
                    stroke="#004f28" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPA)" 
                    animationDuration={1500}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="leanMassKg" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMM)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Historical Composition Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-[#004f28]" />
            <h3 className="text-base font-bold text-slate-900">
              Composição Corporal Histórica
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase font-mono">Data</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase font-mono">Peso (kg)</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase font-mono">Ângulo Fase</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase font-mono">Massa Magra</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase font-mono">Gordura (%)</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase font-mono">Água (L)</th>
                </tr>
              </thead>
              <tbody>
                {(patient.bioimpedanceHistory || []).map((h, i) => (
                  <tr key={h.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-xs font-bold text-slate-700">{new Date(h.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 text-xs font-mono">{h.weightKg} kg</td>
                    <td className="p-3 text-xs font-mono font-bold text-emerald-700">{h.phaseAngleDeg}°</td>
                    <td className="p-3 text-xs font-mono text-sky-700">{h.leanMassKg} kg</td>
                    <td className="p-3 text-xs font-mono text-rose-600">{h.bodyFatPercent}%</td>
                    <td className="p-3 text-xs font-mono text-blue-600">{h.totalBodyWaterL} L</td>
                  </tr>
                ))}
                {!patient.bioimpedanceHistory?.length && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-400 italic">Nenhum registro histórico encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6 Core Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Água Corporal & Matriz de Hidratação */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Distribuição Hídrica</h3>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700">{tbwL} L ({evaluation.totalBodyWaterPercent}%)</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Água Intracelular (ICW)</span>
              <span className="font-bold text-slate-900">{icwL} L (62%)</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Água Extracelular (ECW)</span>
              <span className="font-bold text-slate-900">{ecwL} L (38%)</span>
            </div>
            <div className={`flex justify-between items-center p-2 rounded-lg border transition-all duration-300 ${
              edemaValidation.status !== 'normal' 
                ? `${edemaValidation.bgClass} ${edemaValidation.borderClass} ring-1 ${edemaValidation.borderClass.replace('border-', 'ring-')}/40` 
                : 'bg-emerald-50 text-emerald-900 border-emerald-100'
            }`}>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold">Índice de Edema (ECW/TBW)</span>
                {edemaValidation.status !== 'normal' && (
                  <AlertTriangle className={`w-3 h-3 ${edemaValidation.iconColor}`} />
                )}
              </div>
              <span className={`font-black tabular-nums ${
                edemaValidation.status !== 'normal' ? edemaValidation.colorClass : 'text-[#004f28]'
              }`}>{edemaIndex.toFixed(3)}</span>
            </div>
            {edemaValidation.status !== 'normal' && (
              <span className={`text-[9px] block font-sans font-bold leading-tight mt-0.5 px-2 ${edemaValidation.colorClass}`}>
                {edemaValidation.message}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            * Faixa de normalidade: 0.360 a 0.390 (Sem retenção patológica)
          </span>
        </div>

        {/* Card 2: Modelo de 4 Compartimentos (4C) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Modelo 4C (Padrão Ouro)</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">Total: {patient.currentWeightKg} kg</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-1.5 border-b border-slate-100">
              <span className="text-slate-600">1. Água Corporal (TBW)</span>
              <span className="font-bold text-sky-700">{evaluation.fourCompartment.waterKg} kg (59.8%)</span>
            </div>
            <div className="flex justify-between p-1.5 border-b border-slate-100">
              <span className="text-slate-600">2. Proteínas Musculares</span>
              <span className="font-bold text-indigo-700">{evaluation.fourCompartment.proteinKg} kg (16.0%)</span>
            </div>
            <div className="flex justify-between p-1.5 border-b border-slate-100">
              <span className="text-slate-600">3. Conteúdo Mineral Ósseo</span>
              <span className="font-bold text-amber-700">{evaluation.fourCompartment.mineralKg} kg (5.5%)</span>
            </div>
            <div className="flex justify-between p-1.5">
              <span className="text-slate-600">4. Massa Gorda (Gordura)</span>
              <span className="font-bold text-rose-700">{evaluation.fourCompartment.fatKg} kg (18.7%)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Análise Segmentar de Massa Magra */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#004f28]" />
              <h3 className="text-sm font-bold text-slate-900">Massa Magra Segmentar</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">52.2 kg Total</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-1.5 bg-slate-50 rounded">
              <span className="text-slate-600">Braço Direito</span>
              <span className="font-bold text-slate-800">{evaluation.segmental.rightArmKg} kg (Adequado)</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-50 rounded">
              <span className="text-slate-600">Braço Esquerdo</span>
              <span className="font-bold text-slate-800">{evaluation.segmental.leftArmKg} kg (Adequado)</span>
            </div>
            <div className="flex justify-between p-1.5 bg-emerald-50 rounded">
              <span className="text-emerald-900 font-semibold">Tronco</span>
              <span className="font-bold text-[#004f28]">{evaluation.segmental.trunkKg} kg (105% ref)</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-50 rounded">
              <span className="text-slate-600">Perna Direita</span>
              <span className="font-bold text-slate-800">{evaluation.segmental.rightLegKg} kg (Simétrico)</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-50 rounded">
              <span className="text-slate-600">Perna Esquerda</span>
              <span className="font-bold text-slate-800">{evaluation.segmental.leftLegKg} kg (Simétrico)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Clinical Diagnosis & Phase Angle Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-[#004f28]" />
          <h4 className="text-sm font-bold text-slate-900">Interpretação Clínica e Conduta Sugerida</h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {evaluation.clinicalOpinion}
        </p>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              onSaveEvaluation({
                ...evaluation,
                phaseAngleDeg: phaseAngle,
                edemaIndex,
                totalBodyWaterL: tbwL
              });
              alert('Dados de Bioimpedância salvos com sucesso!');
            }}
            className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar no Prontuário</span>
          </button>
        </div>
      </div>

    </div>
  );
};
