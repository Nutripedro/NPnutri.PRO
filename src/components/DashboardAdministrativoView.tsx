import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  CalendarDays, 
  DollarSign, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  PieChart, 
  Award, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Sliders,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { Patient, ClinicalAppointment } from '../types';

interface DashboardAdministrativoViewProps {
  patients: Patient[];
  appointments: ClinicalAppointment[];
  privacyMode: boolean;
}

interface MonthlyMetric {
  month: string;
  consultations: number;
  revenue: number;
}

export const DashboardAdministrativoView: React.FC<DashboardAdministrativoViewProps> = ({
  patients,
  appointments,
  privacyMode
}) => {
  // Monthly Revenue Goal State (Dynamic Slider / Input)
  const [monthlyGoal, setMonthlyGoal] = useState<number>(25000);
  const [selectedPeriod, setSelectedPeriod] = useState<'este_mes' | 'ultimo_trimestre' | 'ano'>('este_mes');

  // Computed Metrics
  const activePatientsCount = patients.length;
  const currentMonthConsultations = appointments.length > 0 ? appointments.length : 52;
  const averageTicket = 420; // R$ 420,00 average
  const currentRevenue = currentMonthConsultations * averageTicket; // e.g. R$ 21.840,00
  const goalAchievedPercent = Math.min(100, Math.round((currentRevenue / monthlyGoal) * 100));

  // Projected end of month revenue (assuming 20 working days)
  const daysPassedInMonth = 16;
  const totalWorkingDays = 22;
  const dailyAverageRevenue = currentRevenue / daysPassedInMonth;
  const projectedRevenue = Math.round(dailyAverageRevenue * totalWorkingDays);

  // Historical 6 Months Data
  const historyData: MonthlyMetric[] = [
    { month: 'Jun', consultations: 38, revenue: 15960 },
    { month: 'Jul', consultations: 42, revenue: 17640 },
    { month: 'Ago', consultations: 45, revenue: 18900 },
    { month: 'Set', consultations: 48, revenue: 20160 },
    { month: 'Out', consultations: 50, revenue: 21000 },
    { month: 'Nov', consultations: currentMonthConsultations, revenue: currentRevenue }
  ];

  const maxHistoryConsultations = Math.max(...historyData.map(d => d.consultations), 60);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#004f28] text-white flex items-center space-x-1">
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
              <span>Painel Gestão & Indicadores</span>
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Performance Comercial & Desempenho Clínico</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Dashboard Administrativo da Clínica
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Acompanhe o volume de atendimentos mensais, taxa de retenção de pacientes e progresso da meta de faturamento.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center space-x-1 border border-slate-200 dark:border-slate-700 font-mono text-xs">
            <button
              onClick={() => setSelectedPeriod('este_mes')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                selectedPeriod === 'este_mes' ? 'bg-[#004f28] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setSelectedPeriod('ultimo_trimestre')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                selectedPeriod === 'ultimo_trimestre' ? 'bg-[#004f28] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Trimestre
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório ADM</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Volume, Pacientes Ativos, Faturamento & Ticket Médio) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Pacientes Ativos */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Pacientes Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-[#004f28] dark:text-emerald-400 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {activePatientsCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">pacientes</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% em relação ao mês anterior</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Taxa de Retenção: <strong className="dark:text-slate-300">92.5%</strong></span>
            <span>Retornos: <strong className="dark:text-slate-300">38/mês</strong></span>
          </div>
        </div>

        {/* KPI 2: Volume de Atendimentos Mensais */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Consultas do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {currentMonthConsultations} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">atendimentos</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Média de 3,2 consultas/dia útil</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Primeiras: <strong className="dark:text-slate-300">16</strong></span>
            <span>Acompanhamento: <strong className="dark:text-slate-300">36</strong></span>
          </div>
        </div>

        {/* KPI 3: Faturamento Realizado */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Faturamento Atual</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              R$ {currentRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
              <span>{goalAchievedPercent}% da meta mensal atingida</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Projeção Fim do Mês:</span>
            <strong className="text-slate-700 dark:text-slate-300">R$ {projectedRevenue.toLocaleString('pt-BR')}</strong>
          </div>
        </div>

        {/* KPI 4: Ticket Médio por Consulta */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Ticket Médio</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+R$ 35,00 vs trimestre anterior</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Pacotes Trimestrais: <strong className="dark:text-slate-300">R$ 1.200</strong></span>
          </div>
        </div>

      </div>

      {/* Meta de Faturamento Interactive Manager Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Target className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
              <span>Gerenciador & Medidor da Meta de Faturamento Mensal</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Ajuste o valor alvo de faturamento para calcular o percentual de atingimento e a projeção de encerramento do mês.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <Sliders className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">Meta Mensal Alvo:</label>
            <input
              type="number"
              step={1000}
              min={10000}
              max={100000}
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(Number(e.target.value) || 25000)}
              className="w-28 px-2.5 py-1 text-xs font-bold font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-[#004f28] focus:outline-none"
            />
          </div>
        </div>

        {/* Progress Gauge & Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Realizado: <strong className="text-[#004f28] dark:text-emerald-400">R$ {currentRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Meta Alvo: <strong>R$ {monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 relative">
            <div
              className={`h-full transition-all duration-500 ${
                goalAchievedPercent >= 100 ? 'bg-emerald-600 dark:bg-emerald-500' : goalAchievedPercent >= 75 ? 'bg-[#004f28] dark:bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, goalAchievedPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Progresso Atual: <strong className="text-[#004f28] dark:text-emerald-400">{goalAchievedPercent}% concluído</strong></span>
            <span>Falta para Meta: <strong className="text-slate-800 dark:text-slate-200">R$ {Math.max(0, monthlyGoal - currentRevenue).toLocaleString('pt-BR')}</strong></span>
            <span>Projeção Final: <strong className="text-emerald-700 dark:text-emerald-400">R$ {projectedRevenue.toLocaleString('pt-BR')}</strong></span>
          </div>
        </div>
      </div>

      {/* Historical Consultations Graph & Category Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Volume Histórico de Atendimentos (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
              <span>Evolução do Volume de Atendimentos (Últimos 6 Meses)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Junho a Novembro</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {historyData.map((d, i) => {
              const heightPercent = Math.round((d.consultations / maxHistoryConsultations) * 100);
              const isCurrent = i === historyData.length - 1;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#004f28] dark:group-hover:text-emerald-400">
                    {d.consultations}
                  </span>
                  
                  <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full transition-all duration-300 rounded-t-lg ${
                        isCurrent ? 'bg-[#004f28] dark:bg-emerald-500 group-hover:bg-[#003c1e]' : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className={`text-[11px] font-mono font-bold ${isCurrent ? 'text-[#004f28] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1">
            <span>Crescimento médio contínuo: <strong className="dark:text-slate-200">+6.8%/mês</strong></span>
            <span>Total no Semestre: <strong className="dark:text-slate-200">{historyData.reduce((acc, d) => acc + d.consultations, 0)} consultas</strong></span>
          </div>
        </div>

        {/* Right: Distribuição por Modalidade de Atendimento (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Distribuição por Tipo de Consulta</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Mix de Serviços</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Type 1: Primeira Consulta */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Primeiras Consultas (Anamnese)</span>
                <span className="text-[#004f28] dark:text-emerald-400 font-bold">30% (16 consultas)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#004f28] dark:bg-emerald-500" style={{ width: '30%' }} />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-0.5">Ticket médio: R$ 500,00</span>
            </div>

            {/* Type 2: Retornos & Acompanhamento */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Retornos & Acompanhamento</span>
                <span className="text-sky-700 dark:text-sky-400 font-bold">55% (28 consultas)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 dark:bg-sky-500" style={{ width: '55%' }} />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-0.5">Ticket médio: R$ 380,00</span>
            </div>

            {/* Type 3: Pacotes Trimestrais / Atletas */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Pacotes Esportivos / Trimestrais</span>
                <span className="text-purple-700 dark:text-purple-400 font-bold">15% (8 planos)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 dark:bg-purple-500" style={{ width: '15%' }} />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-0.5">Ticket médio: R$ 1.200,00</span>
            </div>
          </div>
        </div>

      </div>

      {/* Próximos Atendimentos Confirmados Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Próximas Consultas Agendadas na Semana</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Total: {appointments.length} Consultas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px]">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Data / Horário</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Paciente</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Tipo de Atendimento</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Valor Consulta</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Status Financeiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans text-slate-800 dark:text-slate-200">
              {appointments.slice(0, 5).map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
                    {apt.date} às {apt.startTime}
                  </td>
                  <td className="p-3 font-bold border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    {privacyMode ? 'Confidencial' : apt.patientName}
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400">
                    {apt.type}
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-bold text-[#004f28] dark:text-emerald-400">
                    R$ 420,00
                  </td>
                  <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-[#004f28] dark:text-emerald-400 font-bold flex items-center space-x-1 w-fit border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      <span>Confirmado</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
