import React, { useState } from 'react';
import { Patient, WeightEvolutionPoint } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  Target,
  Scale,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface GraficoEvolucaoPesoProps {
  patient: Patient;
  onAddWeightPoint?: (newPoint: WeightEvolutionPoint) => void;
  privacyMode: boolean;
}

export const GraficoEvolucaoPeso: React.FC<GraficoEvolucaoPesoProps> = ({
  patient,
  onAddWeightPoint,
  privacyMode
}) => {
  // Local state for weight history points (default to patient.weightHistory or a calculated fallback)
  const [history, setHistory] = useState<WeightEvolutionPoint[]>(
    patient.weightHistory || [
      { date: '10/10/24', weightKg: 68.5, bodyFatPercent: 23.8, leanMassKg: 52.2, targetWeightKg: 62.9, eventLabel: 'Início' },
      { date: '10/11/24', weightKg: 67.8, bodyFatPercent: 22.4, leanMassKg: 52.6, targetWeightKg: 62.9, eventLabel: '30 dias' },
      { date: '10/12/24', weightKg: 66.4, bodyFatPercent: 21.0, leanMassKg: 52.4, targetWeightKg: 62.9, eventLabel: 'T0' },
      { date: '15/01/25', weightKg: 65.1, bodyFatPercent: 19.8, leanMassKg: 52.2, targetWeightKg: 62.9, eventLabel: 'Ajuste' },
      { date: '12/02/25', weightKg: patient.currentWeightKg, bodyFatPercent: 18.7, leanMassKg: 52.2, targetWeightKg: 62.9, eventLabel: 'Atual' }
    ]
  );

  // Toggle visible series
  const [showBodyFat, setShowBodyFat] = useState<boolean>(true);
  const [showLeanMass, setShowLeanMass] = useState<boolean>(true);

  // Quick modal for adding a new measurement
  const [isAddingPoint, setIsAddingPoint] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('20/02/25');
  const [newWeight, setNewWeight] = useState<number>(patient.currentWeightKg);
  const [newBf, setNewBf] = useState<number>(18.5);
  const [newEventLabel, setNewEventLabel] = useState<string>('Reavaliação');

  // Stats calculation
  const initialPoint = history[0];
  const latestPoint = history[history.length - 1];
  const targetWeight = latestPoint?.targetWeightKg || 62.9;

  const totalDeltaKg = latestPoint && initialPoint 
    ? Math.round((latestPoint.weightKg - initialPoint.weightKg) * 10) / 10 
    : 0;

  const totalDeltaPercent = initialPoint 
    ? Math.round(((latestPoint.weightKg - initialPoint.weightKg) / initialPoint.weightKg) * 1000) / 10 
    : 0;

  const remainingToTarget = latestPoint 
    ? Math.round((latestPoint.weightKg - targetWeight) * 10) / 10 
    : 0;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as WeightEvolutionPoint;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-xl text-xs font-mono backdrop-blur-md">
          <div className="flex items-center justify-between space-x-3 mb-1.5 pb-1 border-b border-slate-700">
            <span className="font-bold text-emerald-400">{dataPoint.date}</span>
            {dataPoint.eventLabel && (
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-sans">
                {dataPoint.eventLabel}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between space-x-4">
              <span className="text-slate-400">Peso Corporal:</span>
              <span className="font-extrabold text-white">{dataPoint.weightKg.toFixed(1)} kg</span>
            </div>
            {dataPoint.bodyFatPercent !== undefined && (
              <div className="flex justify-between space-x-4">
                <span className="text-amber-400">Gordura (%G):</span>
                <span className="font-bold text-amber-300">{dataPoint.bodyFatPercent.toFixed(1)}%</span>
              </div>
            )}
            {dataPoint.leanMassKg !== undefined && (
              <div className="flex justify-between space-x-4">
                <span className="text-sky-400">Massa Magra:</span>
                <span className="font-bold text-sky-300">{dataPoint.leanMassKg.toFixed(1)} kg</span>
              </div>
            )}
            {dataPoint.targetWeightKg !== undefined && (
              <div className="flex justify-between space-x-4 pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Peso Alvo:</span>
                <span className="text-emerald-400">{dataPoint.targetWeightKg.toFixed(1)} kg</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const newPt: WeightEvolutionPoint = {
      date: newDate,
      weightKg: newWeight,
      bodyFatPercent: newBf,
      leanMassKg: Math.round(newWeight * (1 - newBf / 100) * 10) / 10,
      targetWeightKg: targetWeight,
      eventLabel: newEventLabel
    };

    setHistory(prev => [...prev, newPt]);
    if (onAddWeightPoint) {
      onAddWeightPoint(newPt);
    }
    setIsAddingPoint(false);
  };

  // Min and max for clean Y-axis bounds
  const weights = history.map(h => h.weightKg);
  const minWeight = Math.floor(Math.min(...weights, targetWeight) - 2);
  const maxWeight = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Histórico de Evolução Ponderal & Composição Corporal
            </h3>
            <span className="text-[10px] font-mono text-[#004f28] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded font-bold border border-emerald-100 dark:border-emerald-800">
              Recharts Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoramento temporal de peso, gordura e preservação de massa magra apendicular.
          </p>
        </div>

        {/* Action button to record new weigh-in */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddingPoint(true)}
            className="px-3 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Pesagem</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Telemetry Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
          <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-sans">PESO INICIAL ({initialPoint?.date})</span>
          <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
            {initialPoint?.weightKg.toFixed(1)} kg
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-sans">
            IMC {((initialPoint?.weightKg || 68.5) / Math.pow(patient.heightCm / 100, 2)).toFixed(1)}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800/80">
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block font-sans">PESO ATUAL ({latestPoint?.date})</span>
          <span className="text-lg font-extrabold text-[#004f28] dark:text-emerald-400 tabular-nums">
            {latestPoint?.weightKg.toFixed(1)} kg
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-sans">
            IMC {(latestPoint?.weightKg / Math.pow(patient.heightCm / 100, 2)).toFixed(1)} (Eutrófica)
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
          <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-sans">DELTA ACUMULADO</span>
          <div className="flex items-center space-x-1">
            {totalDeltaKg < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline shrink-0" />
            ) : (
              <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400 inline shrink-0" />
            )}
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalDeltaKg > 0 ? `+${totalDeltaKg}` : totalDeltaKg} kg
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block font-sans">
            {totalDeltaPercent}% da massa corporal
          </span>
        </div>

        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/60 rounded-xl border border-amber-100 dark:border-amber-800/80">
          <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block font-sans">PESO META ALVO</span>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 inline shrink-0" />
            <span className="text-lg font-extrabold text-amber-900 dark:text-amber-200 tabular-nums">
              {targetWeight.toFixed(1)} kg
            </span>
          </div>
          <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-sans">
            Faltam: {Math.abs(remainingToTarget)} kg
          </span>
        </div>
      </div>

      {/* Series Filter Checkboxes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-[#004f28] dark:bg-emerald-400" />
            <span>Peso Corporal (kg)</span>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <input
              type="checkbox"
              checked={showBodyFat}
              onChange={(e) => setShowBodyFat(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Gordura Corporal (%G)</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
            <input
              type="checkbox"
              checked={showLeanMass}
              onChange={(e) => setShowLeanMass(e.target.checked)}
              className="accent-sky-600 rounded"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>Massa Magra (kg)</span>
          </label>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="w-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 inline-block border-t border-dashed border-emerald-600 dark:border-emerald-400" />
          <span>Meta: {targetWeight.toFixed(1)} kg</span>
        </div>
      </div>

      {/* Recharts Responsive Line Chart */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              stroke="#94a3b8"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `${v}kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target Weight Reference Line */}
            <ReferenceLine
              y={targetWeight}
              stroke="#059669"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Meta: ${targetWeight} kg`,
                position: 'right',
                fill: '#059669',
                fontSize: 10,
                fontFamily: 'monospace'
              }}
            />

            {/* Primary Weight Line */}
            <Line
              type="monotone"
              dataKey="weightKg"
              name="Peso Corporal"
              stroke="#004f28"
              strokeWidth={3}
              dot={{ r: 4, fill: '#004f28', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 7, fill: '#004f28', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {/* Optional Body Fat % */}
            {showBodyFat && (
              <Line
                type="monotone"
                dataKey="bodyFatPercent"
                name="% Gordura"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#ffffff' }}
              />
            )}

            {/* Optional Lean Mass kg */}
            {showLeanMass && (
              <Line
                type="monotone"
                dataKey="leanMassKg"
                name="Massa Magra"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0284c7', strokeWidth: 1, stroke: '#ffffff' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Clinical Interpretation Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-[#004f28] dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-100">Parecer da Curva de Peso: </span>
          <span>
            A curva exibe velocidade de redução ponderal consistente (-0,86 kg/mês) com excelente linearidade e estabilização de massa magra em 52,2 kg, confirmando que a perda é seletiva de tecido adiposo subcutâneo e visceral.
          </span>
        </div>
      </div>

      {/* Modal to add a new weigh-in */}
      {isAddingPoint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Registrar Nova Pesagem</h4>
              <button
                onClick={() => setIsAddingPoint(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMeasurement} className="space-y-3 font-mono">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1 font-sans font-semibold">
                  Data da Medição (DD/MM/AA)
                </label>
                <input
                  type="text"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1 font-sans font-semibold">
                  Peso Balança (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1 font-sans font-semibold">
                  Gordura Estimada (%G)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newBf}
                  onChange={(e) => setNewBf(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1 font-sans font-semibold">
                  Rótulo do Evento (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Retorno 90d, Troca de Dieta"
                  value={newEventLabel}
                  onChange={(e) => setNewEventLabel(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 font-sans">
                <button
                  type="button"
                  onClick={() => setIsAddingPoint(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg font-semibold flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Adicionar ao Gráfico</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
