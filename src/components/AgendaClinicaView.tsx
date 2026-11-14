import React, { useState } from 'react';
import { 
  Patient, 
  ClinicalAppointment, 
  AppointmentType, 
  AppointmentStatus 
} from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Video, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Filter, 
  User, 
  X, 
  Phone, 
  FileText,
  CalendarDays,
  ExternalLink,
  Search,
  Sparkles
} from 'lucide-react';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

interface AgendaClinicaViewProps {
  patients: Patient[];
  appointments: ClinicalAppointment[];
  onAddAppointment: (appointment: ClinicalAppointment) => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onSelectPatientAndNavigate: (patientId: string, targetModule: 'dietas' | 'dobras' | 'bioimpedancia') => void;
  privacyMode: boolean;
}

export const AgendaClinicaView: React.FC<AgendaClinicaViewProps> = ({
  patients,
  appointments,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onSelectPatientAndNavigate,
  privacyMode
}) => {
  // Calendar view mode: 'semana' or 'mes'
  const [viewMode, setViewMode] = useState<'semana' | 'mes'>('semana');
  
  // Active date cursor: reference date (Default: Monday 2026-11-09)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 9)); // Month 10 is November (0-indexed)

  // Filters
  const [selectedUnit, setSelectedUnit] = useState<string>('todos');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected appointment for detail drawer / modal
  const [selectedApt, setSelectedApt] = useState<ClinicalAppointment | null>(null);

  // New appointment modal
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [formPatientId, setFormPatientId] = useState<string>(patients[0]?.id || '');
  const [formPatientName, setFormPatientName] = useState<string>(patients[0]?.name || '');
  const [formPatientPhone, setFormPatientPhone] = useState<string>('(11) 98765-4321');
  const [formType, setFormType] = useState<AppointmentType>('retorno');
  const [formDate, setFormDate] = useState<string>('2026-11-09');
  const [formStartTime, setFormStartTime] = useState<string>('11:00');
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formModality, setFormModality] = useState<'presencial' | 'teleconsulta'>('presencial');
  const [formUnit, setFormUnit] = useState<string>('Clínica Jardins - SP');
  const [formNotes, setFormNotes] = useState<string>('');

  // Helper: Format Portuguese Month / Date
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNamesShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Calculate Monday of the active week
  const getStartOfWeek = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday is day 1, Sunday is 0
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const startOfWeek = getStartOfWeek(currentDate);

  // Generate 7 days of current week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'semana') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'semana') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 9));
  };

  // Format YYYY-MM-DD
  const formatDateISO = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesUnit = selectedUnit === 'todos' || apt.unit === selectedUnit;
    const matchesType = selectedType === 'todos' || apt.type === selectedType;
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientRecord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.notes && apt.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesUnit && matchesType && matchesSearch;
  });

  // Calculate appointment end time
  const calculateEndTime = (start: string, durationMin: number): string => {
    const [h, m] = start.split(':').map(Number);
    const totalMin = h * 60 + m + durationMin;
    const endH = Math.floor(totalMin / 60);
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  // Handle Create Appointment
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const endTime = calculateEndTime(formStartTime, formDuration);
    const matchedPatient = patients.find(p => p.id === formPatientId);

    const newApt: ClinicalAppointment = {
      id: `apt-${Date.now()}`,
      patientId: formPatientId || 'pat-custom',
      patientName: matchedPatient ? matchedPatient.name : formPatientName,
      patientRecord: matchedPatient ? matchedPatient.recordNumber : '#08599',
      patientPhone: formPatientPhone,
      type: formType,
      date: formDate,
      startTime: formStartTime,
      endTime,
      durationMinutes: formDuration,
      status: 'confirmado',
      unit: formUnit,
      modality: formModality,
      meetLink: formModality === 'teleconsulta' ? `https://meet.google.com/nutri-${Date.now().toString().slice(-6)}` : undefined,
      notes: formNotes,
      reminderSentWhatsApp: true
    };

    onAddAppointment(newApt);
    setIsNewModalOpen(false);
    setSelectedApt(newApt);
  };

  // Appointment Type Label & Styling Helper
  const getTypeBadge = (type: AppointmentType) => {
    switch (type) {
      case 'primeira_consulta':
        return { label: 'Primeira Consulta', bg: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' };
      case 'retorno':
        return { label: 'Retorno & Reavaliação', bg: 'bg-emerald-50 text-[#004f28] border-emerald-200', dot: 'bg-[#004f28]' };
      case 'avaliacao_antropometrica':
        return { label: 'Antropometria ISAK', bg: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-600' };
      case 'coleta_exames':
        return { label: 'Exames & Laboratório', bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
      case 'entrega_plano':
        return { label: 'Entrega de Plano', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-600' };
      default:
        return { label: 'Consulta', bg: 'bg-slate-50 text-slate-800 border-slate-200', dot: 'bg-slate-500' };
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado', bg: 'bg-emerald-100 text-[#004f28]' };
      case 'agendado':
        return { label: 'Agendado', bg: 'bg-slate-100 text-slate-600' };
      case 'em_atendimento':
        return { label: 'Em Atendimento', bg: 'bg-blue-100 text-blue-800 animate-pulse' };
      case 'concluido':
        return { label: 'Concluído', bg: 'bg-slate-100 text-slate-400 line-through' };
      case 'cancelado':
        return { label: 'Cancelado', bg: 'bg-rose-100 text-rose-700' };
    }
  };

  // Send WhatsApp Reminder
  const handleSendWhatsAppReminder = (apt: ClinicalAppointment) => {
    const text = `*Lembrete de Consulta - NUTRI PRO*%0A` +
      `Olá, *${privacyMode ? 'Paciente' : apt.patientName}*!%0A` +
      `Confirmamos seu atendimento para *${apt.date.split('-').reverse().join('/')}* às *${apt.startTime}h*.%0A` +
      `*Modalidade:* ${apt.modality === 'presencial' ? `Presencial na ${apt.unit}` : `Teleconsulta Online (${apt.meetLink || 'Google Meet'})`}%0A` +
      `*Tipo:* ${getTypeBadge(apt.type).label}.%0A` +
      `*Orientações Clínicas:* Manter hidratação habitual e evitar treino exaustivo ou cafeína 2h antes caso haja medição de bioimpedância.%0A` +
      `Em caso de imprevisto, responda a esta mensagem.`;

    window.open(`https://api.whatsapp.com/send?phone=${apt.patientPhone.replace(/\D/g, '')}&text=${text}`, '_blank');
  };

  // Hours displayed on the weekly grid (08:00 to 18:00)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Quick stats
  const totalWeekAppointments = weekDays.reduce((acc, day) => {
    const dStr = formatDateISO(day);
    return acc + appointments.filter(a => a.date === dStr).length;
  }, 0);

  const confirmedCount = appointments.filter(a => a.status === 'confirmado').length;
  const teleconsultaCount = appointments.filter(a => a.modality === 'teleconsulta').length;
  const isakCount = appointments.filter(a => a.type === 'avaliacao_antropometrica').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#004f28]/10 text-[#004f28]">
                Gestão de Consultório
              </span>
              <span className="text-xs text-slate-400 font-mono">Agenda Clínica & Reavaliações</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Agenda Integrada de Consultas, Retornos & Exames
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Visualização sincronizada com prontuários, antropometria e disparos automáticos de lembretes.
            </p>
          </div>

          {/* Action: New Appointment & View Switcher */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* View Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('semana')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'semana'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visão Semanal
              </button>
              <button
                onClick={() => setViewMode('mes')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'mes'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visão Mensal
              </button>
            </div>

            <InfoHelpButton helpId="agenda" size="sm" variant="emerald" title="Explicativo sobre a Agenda Clínica" />

            <ClinicalTooltip helpId="agenda" position="left">
              <button
                onClick={() => {
                  setFormDate(formatDateISO(currentDate));
                  setIsNewModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Marcar Compromisso</span>
              </button>
            </ClinicalTooltip>
          </div>
        </div>

        {/* High-Contrast Clinical Dashboard Cards (Inspired by Reference System UI) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          
          {/* Card 1: Agenda & Atendimentos (Orange) */}
          <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg border border-amber-400/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-wider uppercase bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs font-mono">
                AGENDA DA SEMANA
              </span>
              <CalendarDays className="w-7 h-7 text-white/90" />
            </div>
            <div className="space-y-1 my-2">
              <div className="flex justify-between items-center text-xs font-medium text-amber-100">
                <span>Atendimentos na semana:</span>
                <strong className="font-mono text-sm text-white">{totalWeekAppointments}</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-amber-100">
                <span>Confirmados hoje:</span>
                <strong className="font-mono text-sm text-white">{confirmedCount}</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-amber-100">
                <span>Teleconsultas:</span>
                <strong className="font-mono text-sm text-white">{teleconsultaCount}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Atendimentos & Produtividade (Green) */}
          <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-wider uppercase bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs font-mono">
                PRODUTIVIDADE CLÍNICA
              </span>
              <CheckCircle2 className="w-7 h-7 text-white/90" />
            </div>
            <div className="space-y-1 my-2">
              <div className="flex justify-between items-center text-xs font-medium text-emerald-100">
                <span>Avaliações ISAK:</span>
                <strong className="font-mono text-sm text-white">{isakCount} agendadas</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-emerald-100">
                <span>Taxa de Confirmação:</span>
                <strong className="font-mono text-sm text-white">96.2%</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-emerald-100">
                <span>Retornos do mês:</span>
                <strong className="font-mono text-sm text-white">38</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Financeiro / Faturamento (Purple) */}
          <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-purple-600 to-indigo-700 shadow-lg border border-purple-500/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-wider uppercase bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs font-mono">
                FLUXO FINANCEIRO
              </span>
              <Sparkles className="w-7 h-7 text-white/90" />
            </div>
            <div className="space-y-1 my-2">
              <div className="flex justify-between items-center text-xs font-medium text-purple-100">
                <span>Receber hoje:</span>
                <strong className="font-mono text-sm text-white">R$ 1.680</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-purple-100">
                <span>A vencer no mês:</span>
                <strong className="font-mono text-sm text-white">R$ 21.840</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-purple-100">
                <span>Ticket Médio:</span>
                <strong className="font-mono text-sm text-white">R$ 420</strong>
              </div>
            </div>
          </div>

          {/* Card 4: Operacional / Unidades (Blue) */}
          <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-600 to-sky-700 shadow-lg border border-blue-500/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-wider uppercase bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-xs font-mono">
                UNIDADES & SALAS
              </span>
              <MapPin className="w-7 h-7 text-white/90" />
            </div>
            <div className="space-y-1 my-2">
              <div className="flex justify-between items-center text-xs font-medium text-blue-100">
                <span>Jardins - SP:</span>
                <strong className="font-mono text-sm text-white">Sala 02 (Ativa)</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-blue-100">
                <span>Itaim - SP:</span>
                <strong className="font-mono text-sm text-white">Sala 01 (Livre)</strong>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-blue-100">
                <span>Status de Rede:</span>
                <strong className="font-mono text-sm text-white">Online (Sync)</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation & Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Date Selector with Prev / Today / Next */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Período anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Próximo período"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold text-slate-900 ml-2 font-mono">
              {viewMode === 'semana' ? (
                <>
                  {startOfWeek.getDate()} de {monthNames[startOfWeek.getMonth()]} a{' '}
                  {weekDays[6].getDate()} de {monthNames[weekDays[6].getMonth()]} de {weekDays[6].getFullYear()}
                </>
              ) : (
                <>
                  {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
                </>
              )}
            </span>
          </div>

          {/* Filters: Unit, Type, and Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Buscar paciente / prontuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 w-44 focus:w-56 transition-all"
              />
            </div>

            {/* Unit Filter */}
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="todos">Todas as Unidades</option>
              <option value="Clínica Jardins - SP">Clínica Jardins - SP</option>
              <option value="Clínica Itaim - SP">Clínica Itaim - SP</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="primeira_consulta">Primeira Consulta</option>
              <option value="retorno">Retorno & Reavaliação</option>
              <option value="avaliacao_antropometrica">Antropometria ISAK</option>
              <option value="coleta_exames">Exames & Laboratório</option>
              <option value="entrega_plano">Entrega de Plano</option>
            </select>
          </div>

        </div>
      </div>

      {/* VIEW MODE 1: WEEKLY CALENDAR GRID */}
      {viewMode === 'semana' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Days of week header row */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center text-xs font-mono">
            {/* Hour column spacer */}
            <div className="p-3 border-r border-slate-200 text-slate-400 font-semibold text-[11px]">
              Horário
            </div>

            {weekDays.map((d, index) => {
              const dISO = formatDateISO(d);
              const isToday = dISO === '2026-11-09';
              const aptsForDay = filteredAppointments.filter(a => a.date === dISO);

              return (
                <div
                  key={index}
                  className={`p-2.5 border-r border-slate-200 last:border-r-0 ${
                    isToday ? 'bg-emerald-50/70' : ''
                  }`}
                >
                  <div className="text-[11px] font-sans text-slate-500 uppercase tracking-wider font-semibold">
                    {dayNamesShort[index]}
                  </div>
                  <div className={`text-base font-bold my-0.5 ${isToday ? 'text-[#004f28]' : 'text-slate-800'}`}>
                    {d.getDate()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {aptsForDay.length} {aptsForDay.length === 1 ? 'consulta' : 'consultas'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto custom-scrollbar">
            {timeSlots.map(time => {
              const currentHour = parseInt(time.split(':')[0]);

              return (
                <div key={time} className="grid grid-cols-8 min-h-[82px]">
                  {/* Hour Label */}
                  <div className="p-2 border-r border-slate-200 bg-slate-50/50 text-right pr-3 text-[11px] font-mono text-slate-400 select-none">
                    {time}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((d, dayIdx) => {
                    const dStr = formatDateISO(d);
                    const isToday = dStr === '2026-11-09';

                    // Find appointments matching this day and hour
                    const slotAppointments = filteredAppointments.filter(apt => {
                      if (apt.date !== dStr) return false;
                      const aptHour = parseInt(apt.startTime.split(':')[0]);
                      return aptHour === currentHour;
                    });

                    return (
                      <div
                        key={dayIdx}
                        onClick={() => {
                          setFormDate(dStr);
                          setFormStartTime(time);
                          setIsNewModalOpen(true);
                        }}
                        className={`p-1.5 border-r border-slate-100 last:border-r-0 relative group hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isToday ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        {/* Plus button on hover */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormDate(dStr);
                              setFormStartTime(time);
                              setIsNewModalOpen(true);
                            }}
                            className="p-1 rounded bg-slate-200 hover:bg-[#004f28] hover:text-white text-slate-600 transition-colors"
                            title="Agendar neste horário"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Appointment Cards */}
                        <div className="space-y-1.5">
                          {slotAppointments.map(apt => {
                            const badge = getTypeBadge(apt.type);
                            const status = getStatusBadge(apt.status);

                            return (
                              <div
                                key={apt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApt(apt);
                                }}
                                className={`p-2 rounded-lg border text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer ${badge.bg}`}
                              >
                                <div className="flex items-center justify-between font-mono text-[10px]">
                                  <span className="font-bold flex items-center space-x-1">
                                    <Clock className="w-3 h-3 inline mr-0.5" />
                                    <span>{apt.startTime} - {apt.endTime}</span>
                                  </span>
                                  {apt.modality === 'teleconsulta' && (
                                    <span title="Teleconsulta Online">
                                      <Video className="w-3 h-3 text-sky-600 shrink-0" />
                                    </span>
                                  )}
                                </div>

                                <div className="font-bold text-slate-900 mt-0.5 truncate leading-tight">
                                  <span className={privacyMode ? 'filter blur-xs select-none' : ''}>
                                    {apt.patientName}
                                  </span>
                                </div>

                                <div className="text-[10px] text-slate-500 font-mono truncate">
                                  {apt.patientRecord} • {badge.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW MODE 2: MONTHLY CALENDAR GRID */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600 py-2.5">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => (
              <div key={day} className="text-slate-500 uppercase tracking-wider text-[11px]">
                {day}
              </div>
            ))}
          </div>

          {/* Month Days (35 cells for November 2026: Nov 1 was Sunday, so previous month offset = 6 days) */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {Array.from({ length: 35 }).map((_, i) => {
              // November 2026 starts on Sunday (day 0). In a Mon-start grid, Nov 1 is day index 6.
              // So dayNumber = i - 5.
              const dayNum = i - 5;
              const isCurrentMonth = dayNum >= 1 && dayNum <= 30;
              const dateStr = isCurrentMonth 
                ? `2026-11-${String(dayNum).padStart(2, '0')}`
                : '';

              const isToday = dateStr === '2026-11-09';
              const dayAppointments = isCurrentMonth
                ? filteredAppointments.filter(a => a.date === dateStr)
                : [];

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (isCurrentMonth) {
                      setFormDate(dateStr);
                      setIsNewModalOpen(true);
                    }
                  }}
                  className={`min-h-[110px] p-2 relative group transition-colors cursor-pointer ${
                    !isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'hover:bg-slate-50/60'
                  } ${isToday ? 'bg-emerald-50/30' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#004f28] text-white shadow-2xs'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {isCurrentMonth ? dayNum : ''}
                    </span>

                    {isCurrentMonth && (
                      <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        + Marcar
                      </span>
                    )}
                  </div>

                  {/* Appointments previews */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(apt => {
                      const badge = getTypeBadge(apt.type);
                      return (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApt(apt);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border truncate transition-all ${badge.bg}`}
                          title={`${apt.startTime} - ${apt.patientName} (${badge.label})`}
                        >
                          <span className="font-bold mr-1">{apt.startTime}</span>
                          <span className={privacyMode ? 'filter blur-xs' : ''}>{apt.patientName.split(' ')[0]}</span>
                        </div>
                      );
                    })}

                    {dayAppointments.length > 3 && (
                      <div className="text-[9px] font-mono font-bold text-[#004f28] text-right pr-1">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* APPOINTMENT DETAIL MODAL / DRAWER */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${getTypeBadge(selectedApt.type).dot}`} />
                <h3 className="text-sm font-bold text-slate-900">Detalhes do Agendamento Clínico</h3>
              </div>
              <button
                onClick={() => setSelectedApt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              {/* Patient Banner */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Paciente</span>
                  <div className="font-bold text-base text-slate-900">
                    <span className={privacyMode ? 'filter blur-xs' : ''}>{selectedApt.patientName}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedApt.patientRecord} • {selectedApt.patientPhone}
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${getStatusBadge(selectedApt.status).bg}`}>
                  {getStatusBadge(selectedApt.status).label}
                </span>
              </div>

              {/* Timing & Modality Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 text-[10px] block">DATA & HORÁRIO</span>
                  <div className="font-bold text-slate-800 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedApt.date.split('-').reverse().join('/')}</span>
                  </div>
                  <div className="text-slate-600 font-bold">
                    {selectedApt.startTime} às {selectedApt.endTime} ({selectedApt.durationMinutes} min)
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 text-[10px] block">MODALIDADE & LOCAL</span>
                  <div className="font-bold text-slate-800 flex items-center space-x-1">
                    {selectedApt.modality === 'teleconsulta' ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        <span>Teleconsulta Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-[#004f28]" />
                        <span>Presencial</span>
                      </>
                    )}
                  </div>
                  <div className="text-slate-600 truncate">
                    {selectedApt.unit}
                  </div>
                </div>
              </div>

              {/* Google Meet Link if teleconsulta */}
              {selectedApt.modality === 'teleconsulta' && selectedApt.meetLink && (
                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-sky-600" />
                    <span className="font-mono text-sky-900 font-semibold truncate max-w-xs">
                      {selectedApt.meetLink}
                    </span>
                  </div>
                  <a
                    href={selectedApt.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-sky-600 text-white rounded font-mono text-[11px] font-bold hover:bg-sky-700 flex items-center space-x-1"
                  >
                    <span>Entrar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Notes */}
              {selectedApt.notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Notas Clínicas & Preparo:</span>
                  <p>{selectedApt.notes}</p>
                </div>
              )}

              {/* Status Action Switcher */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Atualizar Status do Atendimento
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  {(['agendado', 'confirmado', 'em_atendimento', 'concluido'] as AppointmentStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateAppointmentStatus(selectedApt.id, st);
                        setSelectedApt({ ...selectedApt, status: st });
                      }}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        selectedApt.status === st
                          ? 'bg-[#004f28] text-white font-bold border-[#004f28]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {getStatusBadge(st).label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Actions: WhatsApp reminder & Jump to Clinical Chart */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleSendWhatsAppReminder(selectedApt)}
                  className="flex-1 py-2 px-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enviar Lembrete WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    const target = selectedApt.type === 'avaliacao_antropometrica' ? 'dobras' : 'dietas';
                    onSelectPatientAndNavigate(selectedApt.patientId, target);
                    setSelectedApt(null);
                  }}
                  className="flex-1 py-2 px-3 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Abrir Prontuário Clínico</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* NEW APPOINTMENT MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-[#004f28]" />
                <h3 className="text-sm font-bold text-slate-900">Novo Agendamento Clínico</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 text-xs">
              
              {/* Patient Selection */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Paciente Ativo
                </label>
                <select
                  value={formPatientId}
                  onChange={(e) => {
                    setFormPatientId(e.target.value);
                    const p = patients.find(pat => pat.id === e.target.value);
                    if (p) {
                      setFormPatientName(p.name);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.recordNumber}) - {p.age}a • {p.currentWeightKg}kg
                    </option>
                  ))}
                  <option value="new_patient">+ Novo Paciente (Preenchimento Rápido)</option>
                </select>
              </div>

              {formPatientId === 'new_patient' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do paciente"
                      value={formPatientName}
                      onChange={(e) => setFormPatientName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">WhatsApp / Celular</label>
                    <input
                      type="text"
                      placeholder="(11) 9...."
                      value={formPatientPhone}
                      onChange={(e) => setFormPatientPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Type and Modality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Tipo de Atendimento
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AppointmentType)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="primeira_consulta">Primeira Consulta Nutricional</option>
                    <option value="retorno">Retorno & Reavaliação</option>
                    <option value="avaliacao_antropometrica">Antropometria ISAK (Dobras / BIA)</option>
                    <option value="coleta_exames">Exames Laboratoriais</option>
                    <option value="entrega_plano">Entrega do Plano Alimentar</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Modalidade
                  </label>
                  <select
                    value={formModality}
                    onChange={(e) => setFormModality(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="presencial">Presencial no Consultório</option>
                    <option value="teleconsulta">Teleconsulta Online (Meet)</option>
                  </select>
                </div>
              </div>

              {/* Date, Time and Duration */}
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1 font-sans">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1 font-sans">
                    Início
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1 font-sans">
                    Duração
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={75}>75 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>

              {/* Unit */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Unidade de Atendimento
                </label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="Clínica Jardins - SP">Clínica Jardins - SP (Av. Brigadeiro Faria Lima)</option>
                  <option value="Clínica Itaim - SP">Clínica Itaim - SP (Rua Joaquim Floriano)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Notas Clínicas / Objetivos da Sessão
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Reavaliação de dobras supra-ilíaca e abdominal, conferência do diário de 7 dias..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg font-semibold flex items-center space-x-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Agendamento</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
