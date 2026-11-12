import React, { useState, useEffect } from 'react';
import { Patient, BiologicalSex } from '../types';
import { calculateAge, calculateIMC, getSemaforoIMC } from '../domain/calculations';
import { UserPlus, Save, Info, User, Trash2, Mail, Phone, Fingerprint, AlertCircle, AlertTriangle, CheckCircle2, Baby, Stethoscope } from 'lucide-react';
import { evaluateFullMeasurement, calculateExactAge } from '../lib/zscore-calculator';
import { PediatricMeasurement } from '../types/growth';

interface CadastroPacienteViewProps {
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
  onDeletePatient?: (id: string) => void;
  patientToEdit?: Patient | null;
  allowDelete?: boolean;
}

export const CadastroPacienteView: React.FC<CadastroPacienteViewProps> = ({ 
  onAddPatient, 
  onUpdatePatient,
  onDeletePatient,
  patientToEdit,
  allowDelete = false
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<BiologicalSex>('female');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [goal, setGoal] = useState('');
  const [manualGoal, setManualGoal] = useState(false);
  const [age, setAge] = useState(0);
  const [imc, setImc] = useState(0);

  // Pediatric & Neonatal specific fields
  const [isPediatric, setIsPediatric] = useState(false);
  const [birthWeightKg, setBirthWeightKg] = useState<string>('');
  const [birthLengthCm, setBirthLengthCm] = useState<string>('');
  const [birthHeadCircCm, setBirthHeadCircCm] = useState<string>('');
  const [gestationalWeeks, setGestationalWeeks] = useState<string>('39');
  const [motherName, setMotherName] = useState('');
  const [pediatricianName, setPediatricianName] = useState('');
  const [currentHeadCirc, setCurrentHeadCirc] = useState<string>('');

  const isEditMode = !!patientToEdit;

  useEffect(() => {
    if (patientToEdit) {
      setName(patientToEdit.name);
      setEmail(patientToEdit.email || '');
      setPhone(patientToEdit.phone || '');
      setCpf(patientToEdit.cpf || '');
      setBirthDate(patientToEdit.birthDate);
      setSex(patientToEdit.sex);
      setHeight(patientToEdit.heightCm);
      setWeight(patientToEdit.currentWeightKg);
      setGoal(patientToEdit.goal);
      setManualGoal(true);
      setIsPediatric(patientToEdit.isPediatric ?? (patientToEdit.age < 19));
      setBirthWeightKg(patientToEdit.birthWeightKg ? String(patientToEdit.birthWeightKg) : '');
      setBirthLengthCm(patientToEdit.birthLengthCm ? String(patientToEdit.birthLengthCm) : '');
      setBirthHeadCircCm(patientToEdit.birthHeadCircCm ? String(patientToEdit.birthHeadCircCm) : '');
      setGestationalWeeks(patientToEdit.gestationalWeeksAtBirth ? String(patientToEdit.gestationalWeeksAtBirth) : '39');
      setMotherName(patientToEdit.motherName || '');
      setPediatricianName(patientToEdit.pediatricianName || '');
      const latestHeadCirc = patientToEdit.pediatricMeasurements?.slice(-1)[0]?.headCircumferenceCm;
      setCurrentHeadCirc(latestHeadCirc ? String(latestHeadCirc) : '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCpf('');
      setBirthDate('');
      setSex('female');
      setHeight(170);
      setWeight(70);
      setGoal('');
      setManualGoal(false);
      setIsPediatric(false);
      setBirthWeightKg('');
      setBirthLengthCm('');
      setBirthHeadCircCm('');
      setGestationalWeeks('39');
      setMotherName('');
      setPediatricianName('');
      setCurrentHeadCirc('');
    }
  }, [patientToEdit]);

  const semaforo = getSemaforoIMC(imc);

  useEffect(() => {
    if (!manualGoal) {
      if (imc > 0) {
        setGoal(semaforo.sugestaoObjetivo);
      }
    }
  }, [imc, manualGoal, semaforo.sugestaoObjetivo]);

  useEffect(() => {
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate);
      setAge(calculatedAge);
      if (!isEditMode) {
        // Automatically activate pediatric monitoring when age is under 19
        setIsPediatric(calculatedAge < 19);
      }
    }
  }, [birthDate, isEditMode]);

  useEffect(() => {
    setImc(calculateIMC(weight, height));
  }, [weight, height]);

  const getImcColor = (val: number) => {
    if (val < 18.5) return 'text-sky-600 bg-sky-50';
    if (val < 25) return 'text-[#004f28] bg-emerald-50';
    if (val < 30) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedBirthWeight = birthWeightKg ? parseFloat(birthWeightKg) : undefined;
    const parsedBirthLength = birthLengthCm ? parseFloat(birthLengthCm) : undefined;
    const parsedBirthHeadCirc = birthHeadCircCm ? parseFloat(birthHeadCircCm) : undefined;
    const parsedGestationalWeeks = gestationalWeeks ? parseInt(gestationalWeeks, 10) : undefined;
    const parsedCurrentHeadCirc = currentHeadCirc ? parseFloat(currentHeadCirc) : undefined;

    // Pediatric synchronization: generate initial measurement if pediatric
    let updatedPediatricMeasurements = patientToEdit?.pediatricMeasurements ? [...patientToEdit.pediatricMeasurements] : [];
    
    if (isPediatric && updatedPediatricMeasurements.length === 0 && birthDate) {
      const today = new Date().toISOString().split('T')[0];
      const ageCalc = calculateExactAge(birthDate, today);
      
      const newMeasurements: PediatricMeasurement[] = [];

      // 1. Birth measurement at 0 months if birth stats provided
      if (parsedBirthWeight || parsedBirthLength || parsedBirthHeadCirc) {
        const birthMeas: PediatricMeasurement = evaluateFullMeasurement({
          id: `meas-birth-${Date.now()}`,
          consultationDate: birthDate,
          ageMonths: 0,
          ageDisplay: 'Ao nascer (0m)',
          weightKg: parsedBirthWeight,
          heightCm: parsedBirthLength,
          headCircumferenceCm: parsedBirthHeadCirc,
          notes: `Dados neonatais ao nascer (${parsedGestationalWeeks || 39} sem).`
        }, sex);
        newMeasurements.push(birthMeas);
      }

      // 2. Current baseline measurement
      const currentMeas: PediatricMeasurement = evaluateFullMeasurement({
        id: `meas-initial-${Date.now() + 1}`,
        consultationDate: today,
        ageMonths: ageCalc.months,
        ageDisplay: ageCalc.display,
        weightKg: weight,
        heightCm: height,
        headCircumferenceCm: parsedCurrentHeadCirc || parsedBirthHeadCirc,
        notes: `Medição inicial sincronizada do cadastro (${goal || 'Consulta de rotina'}).`
      }, sex);
      newMeasurements.push(currentMeas);

      updatedPediatricMeasurements = newMeasurements;
    }

    if (isEditMode && patientToEdit && onUpdatePatient) {
      const updatedPatient: Patient = {
        ...patientToEdit,
        name,
        email,
        phone,
        cpf,
        birthDate,
        age,
        sex,
        heightCm: height,
        currentWeightKg: weight,
        imc,
        goal,
        avatarInitials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        isPediatric,
        pediatricMeasurements: updatedPediatricMeasurements,
        birthLengthCm: parsedBirthLength,
        birthWeightKg: parsedBirthWeight,
        birthHeadCircCm: parsedBirthHeadCirc,
        gestationalWeeksAtBirth: parsedGestationalWeeks,
        motherName: motherName || undefined,
        pediatricianName: pediatricianName || undefined,
      };
      onUpdatePatient(updatedPatient);
    } else {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        name,
        email,
        phone,
        cpf,
        birthDate,
        age,
        sex,
        heightCm: height,
        currentWeightKg: weight,
        initialWeightKg: weight,
        imc,
        avatarInitials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        recordNumber: `#${Math.floor(Math.random() * 90000) + 10000}`,
        goal,
        lastAssessmentDate: new Date().toLocaleDateString('pt-BR'),
        unit: 'Clínica Jardins - SP',
        isPediatric,
        pediatricMeasurements: updatedPediatricMeasurements,
        birthLengthCm: parsedBirthLength,
        birthWeightKg: parsedBirthWeight,
        birthHeadCircCm: parsedBirthHeadCirc,
        gestationalWeeksAtBirth: parsedGestationalWeeks,
        motherName: motherName || undefined,
        pediatricianName: pediatricianName || undefined,
        weightHistory: [
          {
            date: new Date().toLocaleDateString('pt-BR'),
            weightKg: weight,
            eventLabel: 'Consulta Inicial'
          }
        ]
      };
      onAddPatient(newPatient);
    }
  };

  const handleDelete = () => {
    if (patientToEdit && onDeletePatient && confirm(`Tem certeza que deseja excluir o paciente ${patientToEdit.name}?`)) {
      onDeletePatient(patientToEdit.id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-6 shadow-xs animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#004f28] flex items-center justify-center">
            {isEditMode ? <User className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditMode ? 'Editar Cadastro do Paciente' : 'Novo Cadastro de Paciente'}
          </h2>
        </div>
        
        {isEditMode && allowDelete && (
          <button 
            type="button" 
            onClick={handleDelete}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Excluir Paciente"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dados Pessoais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-600 block mb-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none" placeholder="Nome do paciente" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none" placeholder="paciente@exemplo.com" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Telefone / WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none" placeholder="(00) 00000-0000" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">CPF</label>
            <div className="relative">
              <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" required value={cpf} onChange={e => setCpf(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none" placeholder="000.000.000-00" />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Data de Nascimento</label>
            <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#004f28] outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Idade</label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 font-mono">
              {age} anos
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Sexo Biológico</label>
            <select value={sex} onChange={e => setSex(e.target.value as BiologicalSex)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#004f28] outline-none">
              <option value="female">Feminino</option>
              <option value="male">Masculino</option>
            </select>
          </div>

          <div className={`sm:col-span-2 p-3.5 rounded-xl border transition-all ${
            semaforo.nivel === 'verde'
              ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
              : semaforo.nivel === 'amarelo'
                ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
                : semaforo.nivel === 'vermelho'
                  ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                  : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>Objetivo Clínico</span>
                {!manualGoal && imc > 0 ? (
                  <span className="text-[10px] text-[#004f28] font-bold uppercase tracking-wider bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                    Sugerido via IMC
                  </span>
                ) : manualGoal ? (
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                    Entrada Manual
                  </span>
                ) : null}
              </label>

              {/* Cápsula Visual Semáforo (Vermelho, Amarelo, Verde) */}
              <div className="flex items-center gap-2">
                <div 
                  className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-sm"
                  title={`Semáforo Clínico: ${semaforo.rotulo}`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-300 mr-1">Alerta:</span>
                  <span 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      semaforo.nivel === 'vermelho' 
                        ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] ring-2 ring-white scale-110' 
                        : 'bg-rose-950/40 opacity-30'
                    }`} 
                    title="Vermelho: Risco Alto (Obesidade IMC ≥ 30)"
                  />
                  <span 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      semaforo.nivel === 'amarelo' 
                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)] ring-2 ring-white scale-110' 
                        : 'bg-amber-950/40 opacity-30'
                    }`} 
                    title="Amarelo: Atenção (Sobrepeso ou Baixo Peso)"
                  />
                  <span 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      semaforo.nivel === 'verde' 
                        ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] ring-2 ring-white scale-110' 
                        : 'bg-emerald-950/40 opacity-30'
                    }`} 
                    title="Verde: Normal / Saudável (Eutrofia)"
                  />
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 shadow-2xs ${semaforo.badgeBgClass}`}>
                  {semaforo.nivel === 'verde' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {semaforo.nivel === 'amarelo' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  {semaforo.nivel === 'vermelho' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                  <span>{semaforo.badge}</span>
                </span>
              </div>
            </div>

            <input 
              type="text" 
              required 
              value={goal} 
              onChange={e => {
                setGoal(e.target.value);
                setManualGoal(true);
              }} 
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm transition-all outline-none ${
                semaforo.nivel === 'verde'
                  ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold focus:ring-2 focus:ring-emerald-500 shadow-xs'
                  : semaforo.nivel === 'amarelo'
                    ? 'border-2 border-amber-500 bg-amber-50 text-amber-950 font-bold focus:ring-2 focus:ring-amber-500 shadow-xs'
                    : semaforo.nivel === 'vermelho'
                      ? 'border-2 border-rose-500 bg-rose-50 text-rose-950 font-black focus:ring-2 focus:ring-rose-500 shadow-sm'
                      : 'border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#004f28]'
              }`}
              placeholder="Ex: Emagrecimento e redução de gordura"
            />

            {/* Alerta tipo semáforo informativo */}
            <div className={`mt-2 p-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
              semaforo.nivel === 'verde'
                ? 'bg-emerald-100/60 border-emerald-200 text-emerald-900'
                : semaforo.nivel === 'amarelo'
                  ? 'bg-amber-100/60 border-amber-200 text-amber-900'
                  : semaforo.nivel === 'vermelho'
                    ? 'bg-rose-100/60 border-rose-200 text-rose-900'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">
                  {semaforo.nivel === 'vermelho' ? '🔴' : semaforo.nivel === 'amarelo' ? '🟡' : semaforo.nivel === 'verde' ? '🟢' : '⚪'}
                </span>
                <div>
                  <span className="font-bold">{semaforo.rotulo}: </span>
                  <span className="opacity-90">{semaforo.descricao}</span>
                </div>
              </div>

              {manualGoal && (
                <button 
                  type="button" 
                  onClick={() => {
                    setManualGoal(false);
                    if (imc > 0) setGoal(semaforo.sugestaoObjetivo);
                  }}
                  className="text-[10px] font-bold uppercase underline tracking-wider hover:opacity-80 ml-auto"
                >
                  Restaurar Sugestão Automática
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Peso (kg)</label>
            <input type="number" step="0.1" required value={weight} onChange={e => setWeight(parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#004f28] outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Altura (cm)</label>
            <input type="number" step="0.1" required value={height} onChange={e => setHeight(parseFloat(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#004f28] outline-none" />
          </div>
        </div>

        {/* Módulo Pediátrico & Neonatal Sincronizado (OMS 0 a 19 anos) */}
        <div className={`p-4 rounded-xl border transition-all ${
          isPediatric 
            ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isPediatric ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Acompanhamento Pediátrico & Curvas OMS
                </span>
                <span className="text-[11px] text-slate-500">
                  {age < 19 
                    ? `Paciente com ${age} anos (elegível para Curvas de Crescimento OMS/SISVAN)` 
                    : 'Ativar acompanhamento de curvas antropométricas pediátricas'}
                </span>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPediatric} 
                onChange={e => setIsPediatric(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004f28]"></div>
            </label>
          </div>

          {isPediatric && (
            <div className="mt-4 pt-3 border-t border-emerald-200/60 space-y-3 animate-in fade-in duration-200">
              <div className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200 flex items-start gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Sincronização em tempo real:</strong> Ao salvar, o sistema calculará os Escores-Z e Percentis (E/I, P/I, IMC/I, PC/I) e gerará o diagnóstico nutricional automático do SISVAN/OMS.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Idade Gestacional ao Nascer (semanas)
                  </label>
                  <input 
                    type="number" 
                    min="24" 
                    max="44" 
                    value={gestationalWeeks} 
                    onChange={e => setGestationalWeeks(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-[#004f28] outline-none" 
                    placeholder="Ex: 39" 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Peso ao Nascer (kg)
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={birthWeightKg} 
                    onChange={e => setBirthWeightKg(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-[#004f28] outline-none" 
                    placeholder="Ex: 3.25" 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Comprimento ao Nascer (cm)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={birthLengthCm} 
                    onChange={e => setBirthLengthCm(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-[#004f28] outline-none" 
                    placeholder="Ex: 49.5" 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Perímetro Cefálico ao Nascer (cm)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={birthHeadCircCm} 
                    onChange={e => setBirthHeadCircCm(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-[#004f28] outline-none" 
                    placeholder="Ex: 34.5" 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Perímetro Cefálico Atual (cm)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={currentHeadCirc} 
                    onChange={e => setCurrentHeadCirc(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-[#004f28] outline-none" 
                    placeholder="Opcional (OMS 0 a 60m)" 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Nome da Mãe / Responsável
                  </label>
                  <input 
                    type="text" 
                    value={motherName} 
                    onChange={e => setMotherName(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#004f28] outline-none" 
                    placeholder="Nome da mãe ou responsável" 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Pediatra Assistente
                  </label>
                  <input 
                    type="text" 
                    value={pediatricianName} 
                    onChange={e => setPediatricianName(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#004f28] outline-none" 
                    placeholder="Ex: Dr(a). Nome do Pediatra (CRM)" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${getImcColor(imc)}`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">IMC Atual</span>
            <span className="text-3xl font-black tabular-nums">{imc.toFixed(1)}</span>
          </div>
          <Info className="w-6 h-6 opacity-50" />
        </div>

        <button type="submit" className="w-full py-3 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xs transition-colors">
          <Save className="w-4 h-4" />
          <span>{isEditMode ? 'Salvar Alterações' : 'Cadastrar Paciente'}</span>
        </button>
      </form>
    </div>
  );
};
