import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  PediatricBiologicalSex,
  GrowthIndexType,
  PediatricMeasurement,
  ChartPlotDataPoint
} from '../../types/growth';
import { generateChartDataset } from '../../lib/zscore-calculator';
import {
  Activity,
  Ruler,
  Scale,
  Brain,
  Info,
  ChevronDown,
  Calendar,
  Sparkles
} from 'lucide-react';

interface GrowthChartProps {
  sex: PediatricBiologicalSex;
  onSexChange?: (sex: PediatricBiologicalSex) => void;
  measurements: PediatricMeasurement[];
  activeIndex?: GrowthIndexType;
  onIndexChange?: (index: GrowthIndexType) => void;
  patientName?: string;
  privacyMode?: boolean;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  sex,
  onSexChange,
  measurements,
  activeIndex = 'height_for_age',
  onIndexChange,
  patientName = 'Paciente Pediátrico',
  privacyMode = false
}) => {
  const [currentIndex, setCurrentIndex] = useState<GrowthIndexType>(activeIndex);
  const [ageBracket, setAgeBracket] = useState<'0_2' | '0_5' | '5_19'>('0_5');

  const selectedIndex = onIndexChange ? activeIndex : currentIndex;

  const handleSelectIndex = (idx: GrowthIndexType) => {
    setCurrentIndex(idx);
    if (onIndexChange) onIndexChange(idx);
  };

  // Max age in months based on selected bracket
  const maxAgeMonths = useMemo(() => {
    if (ageBracket === '0_2') return 24;
    if (ageBracket === '0_5') return 60;
    return 228; // 19 years
  }, [ageBracket]);

  // Generate unified chart dataset
  const chartData = useMemo(() => {
    return generateChartDataset(selectedIndex, sex, maxAgeMonths, measurements);
  }, [selectedIndex, sex, maxAgeMonths, measurements]);

  // Index configuration metadata
  const indexMeta = useMemo(() => {
    switch (selectedIndex) {
      case 'height_for_age':
        return {
          title: 'Estatura / Comprimento para Idade (E/I)',
          shortName: 'Estatura (E/I)',
          unit: 'cm',
          icon: Ruler,
          yDomain: ageBracket === '5_19' ? [100, 200] : [45, 125],
          description: 'Avaliação do crescimento linear e rastreamento de baixa estatura crônica (OMS 2006/2007).'
        };
      case 'weight_for_age':
        return {
          title: 'Peso para Idade (P/I)',
          shortName: 'Peso (P/I)',
          unit: 'kg',
          icon: Scale,
          yDomain: ageBracket === '5_19' ? [15, 100] : [2, 28],
          description: 'Acompanhamento do ganho ponderal agudo e detecção precoce de desnutrição ou ganho excessivo.'
        };
      case 'bmi_for_age':
        return {
          title: 'Índice de Massa Corporal para Idade (IMC/I)',
          shortName: 'IMC para Idade (IMC/I)',
          unit: 'kg/m²',
          icon: Activity,
          yDomain: [11, 32],
          description: 'Padrão ouro para diagnóstico de sobrepeso, obesidade e magreza segundo os pontos de corte do SISVAN.'
        };
      case 'head_circ_for_age':
        return {
          title: 'Perímetro Cefálico para Idade (PC/I)',
          shortName: 'Perímetro Cefálico (PC/I)',
          unit: 'cm',
          icon: Brain,
          yDomain: [30, 56],
          description: 'Monitoramento do desenvolvimento neurocraniano e triagem de microcefalia ou macrocefalia até 5 anos.'
        };
    }
  }, [selectedIndex, ageBracket]);

  const Icon = indexMeta.icon;

  // Custom interactive tooltip for Recharts
  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartPlotDataPoint; value?: number; name?: string }>;
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasPatient = data.patientValue !== undefined;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs max-w-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Idade: {data.ageMonths} meses
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {sex === 'male' ? '♂ Menino' : '♀ Menina'}
            </span>
          </div>

          {hasPatient && (
            <div className="p-2.5 mb-2 rounded-lg bg-blue-950/80 border border-blue-500/50 shadow-inner">
              <div className="text-[11px] font-bold text-blue-300 flex items-center justify-between">
                <span>Consulta Registrada:</span>
                <span className="font-mono text-blue-200">{data.patientDate}</span>
              </div>
              <div className="text-base font-black text-white tabular-nums mt-0.5">
                {data.patientValue?.toFixed(1)} {indexMeta.unit}
              </div>
              {data.patientZScore !== undefined && (
                <div className="text-[11px] font-mono mt-1 flex items-center gap-2">
                  <span className="text-slate-300">Escore-Z:</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded ${
                    Math.abs(data.patientZScore) <= 1 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : Math.abs(data.patientZScore) <= 2 
                        ? 'bg-amber-500/20 text-amber-300' 
                        : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {data.patientZScore > 0 ? `+${data.patientZScore.toFixed(2)}` : data.patientZScore.toFixed(2)} SD
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1 font-mono text-[11px]">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Curvas OMS (Z-Scores):</div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1F2937] border border-slate-500" /> Z +3 (p99.9)
              </span>
              <span className="tabular-nums font-semibold">{data.sd3pos?.toFixed(1)} {indexMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between text-red-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Z +2 (p97.7)
              </span>
              <span className="tabular-nums font-semibold">{data.sd2pos?.toFixed(1)} {indexMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Z +1 (p84.1)
              </span>
              <span className="tabular-nums font-semibold">{data.sd1pos?.toFixed(1)} {indexMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300 font-bold bg-emerald-950/40 px-1 py-0.5 rounded">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Mediana Z 0 (p50)
              </span>
              <span className="tabular-nums">{data.sd0?.toFixed(1)} {indexMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Z -1 (p15.9)
              </span>
              <span className="tabular-nums font-semibold">{data.sd1neg?.toFixed(1)} {indexMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between text-red-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Z -2 (p2.3)
              </span>
              <span className="tabular-nums font-semibold">{data.sd2neg?.toFixed(1)} {indexMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1F2937] border border-slate-500" /> Z -3 (p0.1)
              </span>
              <span className="tabular-nums font-semibold">{data.sd3neg?.toFixed(1)} {indexMeta.unit}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Top Header & Toolbars */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-[#16A34A] rounded-xl border border-emerald-200">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{indexMeta.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  OMS / SISVAN
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{indexMeta.description}</p>
            </div>
          </div>
        </div>

        {/* Controls: Sex Switcher and Age Bracket */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sex Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSexChange && onSexChange('male')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sex === 'male'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>♂</span>
              <span>Menino</span>
            </button>
            <button
              onClick={() => onSexChange && onSexChange('female')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sex === 'female'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>♀</span>
              <span>Menina</span>
            </button>
          </div>

          {/* Age Bracket Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setAgeBracket('0_2')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                ageBracket === '0_2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              0 a 2 anos
            </button>
            <button
              onClick={() => setAgeBracket('0_5')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                ageBracket === '0_5' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              0 a 5 anos
            </button>
            <button
              onClick={() => setAgeBracket('5_19')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                ageBracket === '5_19' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 a 19 anos
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector: The 4 Pediatric Indices */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => handleSelectIndex('height_for_age')}
          className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
            selectedIndex === 'height_for_age'
              ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A] shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Índice E/I</div>
          <div className="text-xs font-bold truncate">Estatura p/ Idade</div>
        </button>

        <button
          onClick={() => handleSelectIndex('weight_for_age')}
          className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
            selectedIndex === 'weight_for_age'
              ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A] shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Índice P/I</div>
          <div className="text-xs font-bold truncate">Peso p/ Idade</div>
        </button>

        <button
          onClick={() => handleSelectIndex('bmi_for_age')}
          className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
            selectedIndex === 'bmi_for_age'
              ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A] shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Índice IMC/I</div>
          <div className="text-xs font-bold truncate">IMC p/ Idade</div>
        </button>

        <button
          onClick={() => handleSelectIndex('head_circ_for_age')}
          className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
            selectedIndex === 'head_circ_for_age'
              ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A] shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Índice PC/I</div>
          <div className="text-xs font-bold truncate">Perímetro Cefálico</div>
        </button>
      </div>

      {/* Main Recharts Graphic Display */}
      <div className="h-[380px] sm:h-[430px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 25, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} />
            
            <XAxis
              dataKey="ageMonths"
              type="number"
              domain={[0, maxAgeMonths]}
              tickCount={maxAgeMonths <= 24 ? 13 : maxAgeMonths <= 60 ? 11 : 10}
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => {
                if (v >= 12 && v % 12 === 0) return `${v / 12}a`;
                return `${v}m`;
              }}
              label={{
                value: 'Idade da Criança (Meses e Anos)',
                position: 'insideBottom',
                offset: -12,
                fill: '#64748b',
                fontSize: 11
              }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={indexMeta.yDomain as [number, number]}
              tickFormatter={(v) => `${v}`}
              label={{
                value: `${indexMeta.shortName} (${indexMeta.unit})`,
                angle: -90,
                position: 'insideLeft',
                offset: 18,
                fill: '#64748b',
                fontSize: 11
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* WHO Standard Lines (Strict Palette Required by Engineering Constitution) */}
            {/* Linhas Z = +3 e -3: Preto / Grafite escuro (#1F2937 / 1.5px) */}
            <Line
              type="monotone"
              dataKey="sd3pos"
              stroke="#1F2937"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
              name="Z +3"
            />
            <Line
              type="monotone"
              dataKey="sd3neg"
              stroke="#1F2937"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              isAnimationActive={false}
              name="Z -3"
            />

            {/* Linhas Z = +2 e -2: Vermelho / Terracota (#DC2626 / 1.5px) */}
            <Line
              type="monotone"
              dataKey="sd2pos"
              stroke="#DC2626"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Z +2"
            />
            <Line
              type="monotone"
              dataKey="sd2neg"
              stroke="#DC2626"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Z -2"
            />

            {/* Linhas Z = +1 e -1: Laranja suave / Âmbar (#F59E0B / 1.5px) */}
            <Line
              type="monotone"
              dataKey="sd1pos"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
              name="Z +1"
            />
            <Line
              type="monotone"
              dataKey="sd1neg"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
              name="Z -1"
            />

            {/* Linha Mediana (Z = 0): Verde escuro (#16A34A / 2.5px) */}
            <Line
              type="monotone"
              dataKey="sd0"
              stroke="#16A34A"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              name="Mediana Z 0 (p50)"
            />

            {/* Pontos do Paciente: Marcadores circulares azuis (#2563EB) */}
            <Line
              type="monotone"
              dataKey="patientValue"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{
                r: 6,
                fill: '#2563EB',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
              activeDot={{
                r: 8,
                fill: '#1D4ED8',
                stroke: '#ffffff',
                strokeWidth: 3
              }}
              connectNulls={true}
              name={privacyMode ? 'Paciente' : patientName}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Clinical Legend of the WHO curves */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2563EB] ring-2 ring-blue-300" />
            <span className="font-bold text-slate-800">Consultas da Criança</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-[#16A34A] rounded" />
            <span className="font-semibold text-slate-700">Mediana Z=0 (p50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-[#F59E0B] rounded border border-amber-300" />
            <span className="text-slate-600">Z = ±1 (p85 / p15)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-[#DC2626] rounded" />
            <span className="text-slate-600">Z = ±2 (p97 / p3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-[#1F2937] rounded" />
            <span className="text-slate-600">Z = ±3 (Extremos)</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Ref: WHO Child Growth Standards (2006 / 2007)
        </div>
      </div>
    </div>
  );
};
