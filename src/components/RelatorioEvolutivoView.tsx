import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Calendar, 
  Scale, 
  Activity, 
  Info,
  ChevronRight
} from 'lucide-react';
import { Patient, WeightEvolutionPoint } from '../types';
import { format, parseISO, addMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatorioEvolutivoViewProps {
  patient: Patient;
}

export const RelatorioEvolutivoView: React.FC<RelatorioEvolutivoViewProps> = ({ patient }) => {
  const history = useMemo(() => patient.weightHistory || [], [patient.weightHistory]);

  // Linear Regression Logic for Projection
  const calculateProjection = (data: any[], key: string, monthsForward: number = 3) => {
    if (data.length < 2) return [];

    const points = data.map((p, i) => ({
      x: new Date(p.date).getTime(),
      y: p[key]
    })).filter(p => p.y !== undefined);

    if (points.length < 2) return [];

    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    points.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    const lastDate = new Date(points[points.length - 1].x);
    const projections = [];

    for (let i = 1; i <= monthsForward; i++) {
      const projDate = addMonths(lastDate, i);
      const projX = projDate.getTime();
      const projY = m * projX + b;
      
      projections.push({
        date: format(projDate, 'yyyy-MM-dd'),
        [`${key}_proj`]: parseFloat(projY.toFixed(1)),
        isProjection: true
      });
    }

    return projections;
  };

  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    const weightProj = calculateProjection(history, 'weightKg');
    const bfProj = calculateProjection(history, 'bodyFatPercent');
    const waistProj = calculateProjection(history, 'waistCm');

    // Merge history with projections
    const combined = [...history.map(h => ({ ...h, isProjection: false }))];
    
    // Add projections (matching by date index if possible or just appending)
    // For simplicity in Recharts, we append them
    const futureData = weightProj.map((wp, i) => ({
      ...wp,
      bodyFatPercent_proj: bfProj[i]?.bodyFatPercent_proj,
      waistCm_proj: waistProj[i]?.waistCm_proj
    }));

    return [...combined, ...futureData];
  }, [history]);

  const stats = useMemo(() => {
    if (history.length < 2) return null;
    const first = history[0];
    const last = history[history.length - 1];
    
    const weightDiff = last.weightKg - first.weightKg;
    const bfDiff = (last.bodyFatPercent || 0) - (first.bodyFatPercent || 0);
    const waistDiff = (last.waistCm || 0) - (first.waistCm || 0);

    return {
      weightDiff,
      bfDiff,
      waistDiff,
      daysTotal: differenceInDays(parseISO(last.date), parseISO(first.date))
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
        <Activity className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Sem histórico de evolução</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2">
          Adicione registros de peso e medidas nas avaliações para visualizar o relatório evolutivo.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isProj = payload[0].payload.isProjection;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xl rounded-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
            {format(parseISO(label), "dd 'de' MMMM", { locale: ptBR })}
            {isProj && <span className="ml-2 text-emerald-500 font-mono">(Projeção)</span>}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4 py-0.5">
              <span className="text-xs text-slate-600 dark:text-slate-400">{entry.name}:</span>
              <span className="text-xs font-bold font-mono" style={{ color: entry.color }}>
                {entry.value} {entry.unit}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{patient.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">{patient.recordNumber}</p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Início:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {format(parseISO(history[0].date), 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Última:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {format(parseISO(history[history.length - 1].date), 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Período:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{stats?.daysTotal} dias</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            {stats && stats.weightDiff < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Variação Peso</p>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className={`text-3xl font-black ${stats && stats.weightDiff <= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
              {stats && stats.weightDiff > 0 ? `+${stats.weightDiff.toFixed(1)}` : stats?.weightDiff.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-500">kg</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Média de {((stats?.weightDiff || 0) / ((stats?.daysTotal || 30) / 30)).toFixed(2)} kg/mês</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-slate-400" />
            {stats && stats.bfDiff < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variação Gordura</p>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className={`text-3xl font-black ${stats && stats.bfDiff <= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
              {stats && stats.bfDiff > 0 ? `+${stats.bfDiff.toFixed(1)}` : stats?.bfDiff.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-500">%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Foco: Recomposição Corporal</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-slate-400" />
            {stats && stats.waistDiff < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cintura</p>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className={`text-3xl font-black ${stats && stats.waistDiff <= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
              {stats && stats.waistDiff > 0 ? `+${stats.waistDiff.toFixed(1)}` : stats?.waistDiff.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-500">cm</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Risco Coronariano: Baixo</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <Scale className="w-4 h-4 mr-2 text-emerald-600" />
                Evolução de Peso & Projeção de Tendência
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Valores em quilogramas (kg)</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-[#004f28]" />
                <span className="text-[9px] text-slate-500 font-bold">REAL</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-emerald-400 border-t border-dashed" />
                <span className="text-[9px] text-emerald-500 font-bold uppercase">Projeção</span>
              </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004f28" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#004f28" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), 'MMM/yy', { locale: ptBR })}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}kg`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="weightKg" 
                  name="Peso" 
                  unit="kg"
                  stroke="#004f28" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#004f28' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weightKg_proj" 
                  name="Tendência Peso" 
                  unit="kg"
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Fat Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500" />
                Percentual de Gordura & Projeção
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Estimativa em percentual (%)</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), 'MMM/yy', { locale: ptBR })}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="bodyFatPercent" 
                  name="Gordura" 
                  unit="%"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bodyFatPercent_proj" 
                  name="Tendência Gordura" 
                  unit="%"
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waist Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <Target className="w-4 h-4 mr-2 text-orange-500" />
                Circunferência da Cintura
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Medida em centímetros (cm)</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWaist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), 'MMM/yy', { locale: ptBR })}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}cm`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="waistCm" 
                  name="Cintura" 
                  unit="cm"
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWaist)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="waistCm_proj" 
                  name="Tendência Cintura" 
                  unit="cm"
                  stroke="#fb923c" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4, fill: '#fb923c' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Future Goals & Projections Card */}
        <div className="bg-[#004f28] text-white p-8 rounded-xl border border-emerald-900 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-lg font-bold">Projeção de Metas</h3>
            </div>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Com base na taxa de evolução dos últimos meses, aqui estão os valores projetados para os próximos 90 dias caso a aderência ao plano seja mantida em 100%.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Peso Projetado (90d)</span>
                  <span className="text-2xl font-black">{(chartData[chartData.length - 1] as any)?.weightKg_proj || '--'} kg</span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scale className="w-5 h-5 text-emerald-300" />
                </div>
              </div>
              
              <div className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Gordura Projetada (90d)</span>
                  <span className="text-2xl font-black">{(chartData[chartData.length - 1] as any)?.bodyFatPercent_proj || '--'} %</span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-emerald-300" />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Cintura Projetada (90d)</span>
                  <span className="text-2xl font-black">{(chartData[chartData.length - 1] as any)?.waistCm_proj || '--'} cm</span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-emerald-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-700/50 flex items-center justify-between text-[11px] text-emerald-200/60">
            <div className="flex items-center">
              <Info className="w-3 h-3 mr-1" />
              <span>Cálculo por Regressão Linear</span>
            </div>
            <button className="flex items-center text-white hover:text-emerald-300 transition-colors font-bold uppercase tracking-tighter">
              Imprimir Relatório
              <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
