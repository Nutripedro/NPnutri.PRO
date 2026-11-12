import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

// Histórico simulado de evolução do MEB entre consultas
const evolutionData = [
  { date: '10/10/2025', meb: 10.4 },
  { date: '12/12/2025', meb: 8.8 },
  { date: '15/02/2026', meb: 6.5 },
  { date: '10/04/2026', meb: 4.8 }
];

export const MebEvolutionChart: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <TrendingUp className="w-4 h-4 text-[#4A6B5D]" />
        <h4 className="text-xs font-bold text-slate-900">Evolução Temporal do Índice MEB</h4>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{fontSize: 10}} />
            <YAxis tick={{fontSize: 10}} domain={[0, 15]} />
            <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
            <ReferenceLine y={7} stroke="#16a34a" strokeDasharray="3 3" label={{ value: 'Ideal', fontSize: 10, fill: '#16a34a' }} />
            <ReferenceLine y={9} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Atenção', fontSize: 10, fill: '#eab308' }} />
            <Line type="monotone" dataKey="meb" stroke="#4A6B5D" strokeWidth={3} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
