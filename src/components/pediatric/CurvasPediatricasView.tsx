import React, { useState, useMemo } from 'react';
import { Patient } from '../../types';
import {
  PediatricMeasurement,
  GrowthIndexType,
  PediatricBiologicalSex
} from '../../types/growth';
import { GrowthChart } from './GrowthChart';
import { DiagnosticCard } from './DiagnosticCard';
import {
  calculateExactAge,
  evaluateFullMeasurement,
  evaluatePediatricIndex
} from '../../lib/zscore-calculator';
import { apiClient } from '../../lib/api';
import {
  Baby,
  PlusCircle,
  Calendar,
  Ruler,
  Scale,
  Brain,
  FileText,
  UserCheck,
  Check,
  Printer,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Info,
  Sparkles,
  ArrowUpDown,
  X,
  Users,
  AlertCircle
} from 'lucide-react';

interface CurvasPediatricasViewProps {
  currentPatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  privacyMode?: boolean;
}

export const CurvasPediatricasView: React.FC<CurvasPediatricasViewProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  onUpdatePatient,
  privacyMode = false
}) => {
  const [activeIndex, setActiveIndex] = useState<GrowthIndexType>('height_for_age');
  const [isNewMeasurementOpen, setIsNewMeasurementOpen] = useState<boolean>(false);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filter list of pediatric patients in clinic (< 19 years old or flagged as pediatric)
  const pediatricPatients = useMemo(() => {
    return patients.filter(p => p.isPediatric || p.age < 19);
  }, [patients]);

  const isCurrentPediatric = currentPatient.isPediatric || currentPatient.age < 19;

  // Active measurements list for currently selected patient
  const patientMeasurements: PediatricMeasurement[] = useMemo(() => {
    if (currentPatient.pediatricMeasurements && currentPatient.pediatricMeasurements.length > 0) {
      return currentPatient.pediatricMeasurements;
    }

    // If patient is pediatric but has no measurements list yet, generate baseline from current height/weight
    if (isCurrentPediatric && currentPatient.currentWeightKg > 0 && currentPatient.heightCm > 0) {
      const ageCalc = calculateExactAge(currentPatient.birthDate, currentPatient.lastAssessmentDate || new Date().toISOString().split('T')[0]);
      const baseline: PediatricMeasurement = evaluateFullMeasurement({
        id: `meas-baseline-${currentPatient.id}`,
        consultationDate: currentPatient.lastAssessmentDate || new Date().toLocaleDateString('pt-BR'),
        ageMonths: ageCalc.months,
        ageDisplay: ageCalc.display,
        weightKg: currentPatient.currentWeightKg,
        heightCm: currentPatient.heightCm,
        headCircumferenceCm: currentPatient.birthHeadCircCm,
        notes: `Medição inicial sincronizada do prontuário (${currentPatient.goal || 'Consulta de rotina'}).`
      }, currentPatient.sex);
      return [baseline];
    }

    return [];
  }, [currentPatient, isCurrentPediatric]);

  // Selected consultation measurement (defaults to the latest one)
  const activeMeasurement = useMemo(() => {
    if (patientMeasurements.length === 0) return null;
    if (selectedMeasurementId) {
      const match = patientMeasurements.find(m => m.id === selectedMeasurementId);
      if (match) return match;
    }
    // Return latest consultation
    return patientMeasurements[patientMeasurements.length - 1];
  }, [patientMeasurements, selectedMeasurementId]);

  // Form State for New Consultation Measurement
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formWeight, setFormWeight] = useState<string>('');
  const [formHeight, setFormHeight] = useState<string>('');
  const [formHeadCirc, setFormHeadCirc] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Live Age Calculation based on birthDate and formDate
  const liveAge = useMemo(() => {
    return calculateExactAge(currentPatient.birthDate, formDate);
  }, [currentPatient.birthDate, formDate]);

  // Live Preview of Z-Scores & IMC as user types in form
  const livePreview = useMemo(() => {
    const w = parseFloat(formWeight);
    const h = parseFloat(formHeight);

    let bmi: number | undefined;
    if (w > 0 && h > 0) {
      const hm = h / 100;
      bmi = Math.round((w / (hm * hm)) * 10) / 10;
    }

    const zHeight = h > 0 ? evaluatePediatricIndex(h, liveAge.months, 'height_for_age', currentPatient.sex).zScore : undefined;
    const zWeight = w > 0 ? evaluatePediatricIndex(w, liveAge.months, 'weight_for_age', currentPatient.sex).zScore : undefined;
    const zBmi = bmi ? evaluatePediatricIndex(bmi, liveAge.months, 'bmi_for_age', currentPatient.sex).zScore : undefined;

    return { bmi, zHeight, zWeight, zBmi };
  }, [formWeight, formHeight, formHeadCirc, liveAge.months, currentPatient.sex]);

  // Handle Sex Switcher directly in patient record
  const handleSexChange = async (newSex: PediatricBiologicalSex) => {
    const updatedMeasurements = patientMeasurements.map(m => evaluateFullMeasurement(m, newSex));
    const updatedPatient: Patient = {
      ...currentPatient,
      sex: newSex,
      pediatricMeasurements: updatedMeasurements
    };

    onUpdatePatient(updatedPatient);

    try {
      await apiClient.updatePatient(currentPatient.id, {
        sex: newSex,
        pediatricMeasurements: updatedMeasurements
      });
    } catch (err) {
      console.warn('[Sync] Offline or fallback:', err);
    }
  };

  // Handle Add New Measurement & Synchronize with Backend
  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(formWeight);
    const h = parseFloat(formHeight);
    const hc = formHeadCirc ? parseFloat(formHeadCirc) : undefined;

    if (!w && !h) {
      alert('Por favor, informe ao menos o peso ou a estatura para registrar a consulta.');
      return;
    }

    setIsSaving(true);

    const newRaw: PediatricMeasurement = {
      id: `meas-${Date.now()}`,
      consultationDate: formDate,
      ageMonths: liveAge.months,
      ageDisplay: liveAge.display,
      weightKg: w > 0 ? w : undefined,
      heightCm: h > 0 ? h : undefined,
      headCircumferenceCm: hc && hc > 0 ? hc : undefined,
      notes: formNotes.trim() || undefined
    };

    const evaluated = evaluateFullMeasurement(newRaw, currentPatient.sex);

    // Insert and sort measurements chronologically
    const updatedMeasurements = [...patientMeasurements, evaluated].sort((a, b) => a.ageMonths - b.ageMonths);

    // Synchronize vital anthropometry in main Patient object
    const updatedWeightHistory = [...(currentPatient.weightHistory || [])];
    if (evaluated.weightKg) {
      updatedWeightHistory.push({
        date: evaluated.consultationDate,
        weightKg: evaluated.weightKg,
        eventLabel: evaluated.ageDisplay
      });
    }

    const updatedPatient: Patient = {
      ...currentPatient,
      currentWeightKg: evaluated.weightKg || currentPatient.currentWeightKg,
      heightCm: evaluated.heightCm || currentPatient.heightCm,
      imc: evaluated.bmi || currentPatient.imc,
      lastAssessmentDate: evaluated.consultationDate,
      isPediatric: true,
      pediatricMeasurements: updatedMeasurements,
      weightHistory: updatedWeightHistory
    };

    // Update in React State immediately
    onUpdatePatient(updatedPatient);
    setSelectedMeasurementId(evaluated.id);
    setIsNewMeasurementOpen(false);

    // Reset inputs
    setFormWeight('');
    setFormHeight('');
    setFormHeadCirc('');
    setFormNotes('');

    // Persist to Express Backend
    try {
      await apiClient.addPediatricMeasurement(currentPatient.id, newRaw);
    } catch (err) {
      console.warn('[Sync Backend] Measurement stored locally in state:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Clinical Header & Patient Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200 shrink-0">
            <Baby className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Curvas de Crescimento & Escore-Z Infantil
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Padrão OMS 2006 / 2007 • Sincronizado
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Avaliação antropométrica determinística Box-Cox LMS e classificação nutricional segundo o SISVAN integrada ao banco de dados.
            </p>
          </div>
        </div>

        {/* Global Patient Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            <span className="text-slate-500 font-bold px-2 text-[10px] uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>Paciente:</span>
            </span>
            <select
              value={currentPatient.id}
              onChange={(e) => {
                const found = patients.find(p => p.id === e.target.value);
                if (found) {
                  onSelectPatient(found);
                  setSelectedMeasurementId(null);
                }
              }}
              className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs outline-none focus:ring-2 focus:ring-[#16A34A]"
            >
              <optgroup label="Crianças & Adolescentes (0 a 19 anos)">
                {pediatricPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {privacyMode ? p.recordNumber : p.name} ({p.age} anos)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Outros Pacientes">
                {patients.filter(p => !p.isPediatric && p.age >= 19).map(p => (
                  <option key={p.id} value={p.id}>
                    {privacyMode ? p.recordNumber : p.name} ({p.age} anos)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={() => setIsNewMeasurementOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Medição</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Imprimir Curvas & Diagnóstico"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Laudo</span>
          </button>
        </div>
      </div>

      {/* Adult Notification Warning Banner (If an adult is selected) */}
      {!isCurrentPediatric && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs">
              <span className="font-bold">{currentPatient.name} ({currentPatient.age} anos)</span> é um(a) paciente adulto(a).
              As Curvas da OMS de 0 a 19 anos aplicam-se a lactentes, crianças e adolescentes.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pediatricPatients.slice(0, 2).map(ped => (
              <button
                key={ped.id}
                onClick={() => onSelectPatient(ped)}
                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg text-xs transition-colors border border-amber-300"
              >
                Mudar para {ped.name.split(' ')[0]} ({ped.age}a)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Patient Vital Info Strip */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Paciente Selecionado:</span>
            <span className={`text-base font-bold text-white ${privacyMode ? 'filter blur-xs' : ''}`}>
              {currentPatient.name}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Nascimento & Idade:</span>
            <span className="font-mono text-slate-300">
              {currentPatient.birthDate} ({currentPatient.age} anos)
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Sexo Biológico:</span>
            <span className={`font-semibold ${currentPatient.sex === 'male' ? 'text-blue-400' : 'text-rose-400'}`}>
              {currentPatient.sex === 'male' ? '♂ Masculino (Menino)' : '♀ Feminino (Menina)'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Medidas Atuais:</span>
            <span className="font-mono text-emerald-300 font-bold">
              {currentPatient.currentWeightKg} kg • {currentPatient.heightCm} cm • IMC {currentPatient.imc}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Prontuário:</span>
            <span className="font-mono text-emerald-400 font-bold">{currentPatient.recordNumber}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Consultas Registradas:</span>
          <span className="text-lg font-black font-mono text-white">
            {patientMeasurements.length} avaliações
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Growth Chart */}
      <GrowthChart
        sex={currentPatient.sex}
        onSexChange={handleSexChange}
        measurements={patientMeasurements}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        patientName={currentPatient.name}
        privacyMode={privacyMode}
      />

      {/* Active Consultation SISVAN Diagnostic Card */}
      <DiagnosticCard
        measurement={activeMeasurement}
        privacyMode={privacyMode}
      />

      {/* Longitudinal Consultation History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#16A34A]" />
              <span>Histórico de Consultas Sincronizado ({currentPatient.name})</span>
            </h3>
            <p className="text-xs text-slate-500">Clique em qualquer consulta para carregar o diagnóstico e marcar o ponto na curva.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {patientMeasurements.length} registros cronológicos
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] bg-slate-50/80">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Idade</th>
                <th className="py-2.5 px-3 text-right">Peso (kg)</th>
                <th className="py-2.5 px-3 text-right">Estatura (cm)</th>
                <th className="py-2.5 px-3 text-right">IMC (kg/m²)</th>
                <th className="py-2.5 px-3 text-right">PC (cm)</th>
                <th className="py-2.5 px-3 text-center">Z E/I</th>
                <th className="py-2.5 px-3 text-center">Z IMC/I</th>
                <th className="py-2.5 px-3">Diagnóstico SISVAN</th>
                <th className="py-2.5 px-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {patientMeasurements.map((m) => {
                const isSelected = activeMeasurement?.id === m.id;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMeasurementId(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {m.consultationDate}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-sans">
                      {m.ageDisplay}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                      {m.weightKg ? m.weightKg.toFixed(2) : '---'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                      {m.heightCm ? m.heightCm.toFixed(1) : '---'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {m.bmi ? m.bmi.toFixed(2) : '---'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {m.headCircumferenceCm ? m.headCircumferenceCm.toFixed(1) : '---'}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">
                      {m.zScores?.heightForAge !== undefined ? (
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          Math.abs(m.zScores.heightForAge) <= 1 ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                        }`}>
                          {m.zScores.heightForAge > 0 ? `+${m.zScores.heightForAge.toFixed(1)}` : m.zScores.heightForAge.toFixed(1)}
                        </span>
                      ) : '---'}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">
                      {m.zScores?.bmiForAge !== undefined ? (
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          Math.abs(m.zScores.bmiForAge) <= 1 ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                        }`}>
                          {m.zScores.bmiForAge > 0 ? `+${m.zScores.bmiForAge.toFixed(1)}` : m.zScores.bmiForAge.toFixed(1)}
                        </span>
                      ) : '---'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                      {m.diagnostics?.bmiForAge ? (
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${m.diagnostics.bmiForAge.badgeBgColor} ${m.diagnostics.bmiForAge.badgeTextColor} ${m.diagnostics.bmiForAge.borderColor}`}>
                          {m.diagnostics.bmiForAge.classification}
                        </span>
                      ) : 'Aferido'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase font-sans ${
                        isSelected ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isSelected ? 'Selecionado' : 'Ver'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nova Medição Antropométrica */}
      {isNewMeasurementOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-[#16A34A] rounded-xl border border-emerald-200">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Registrar Medição Pediátrica (Sincronizada)</h3>
                  <p className="text-xs text-slate-500">
                    Criança: <span className="font-semibold text-slate-700">{currentPatient.name}</span> ({currentPatient.sex === 'male' ? 'Menino' : 'Menina'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewMeasurementOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Data da Consulta
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Idade Calculada
                  </label>
                  <div className="px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-800">
                    {liveAge.display}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="ex: 11.45"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Estatura / Comp. (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ex: 83.0"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Perímetro Cefálico (cm) <span className="text-slate-400 font-normal lowercase">(opcional até 5 anos)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ex: 48.5"
                    value={formHeadCirc}
                    onChange={(e) => setFormHeadCirc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Observações Clínicas
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Alimentação habitual, vacinas em dia, bom desenvolvimento motor."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              {/* Real-time Z-Score & SISVAN Preview box */}
              {(livePreview.bmi || livePreview.zHeight !== undefined) && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
                  <div className="font-bold flex items-center justify-between">
                    <span>Prévia de Diagnóstico em Tempo Real:</span>
                    {livePreview.bmi && <span className="font-mono">IMC: {livePreview.bmi} kg/m²</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1 border-t border-emerald-200/60">
                    <div>
                      Estatura/Idade: <span className="font-bold">{livePreview.zHeight ? `${livePreview.zHeight > 0 ? `+${livePreview.zHeight}` : livePreview.zHeight} SD` : '---'}</span>
                    </div>
                    <div>
                      IMC/Idade: <span className="font-bold">{livePreview.zBmi ? `${livePreview.zBmi > 0 ? `+${livePreview.zBmi}` : livePreview.zBmi} SD` : '---'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMeasurementOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Gravando no Servidor...' : 'Salvar Consulta & Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
