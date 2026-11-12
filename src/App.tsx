/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PATIENTS, 
  INITIAL_ANTHRO_EVALUATION, 
  INITIAL_BIA_EVALUATION, 
  INITIAL_RCQ_EVALUATION, 
  INITIAL_NECK_EVALUATION, 
  INITIAL_PHOTOGRAMMETRY, 
  INITIAL_DIET_PLAN, 
  INITIAL_DAILY_LOG, 
  INITIAL_ANVISA_LABEL,
  INITIAL_APPOINTMENTS,
  INITIAL_REMINDERS,
  INITIAL_SETTINGS,
  INITIAL_PROFESSIONALS,
  INITIAL_FINANCIAL_TRANSACTIONS
} from './data/clinicalData';
import { 
  Patient, 
  ClinicalAppointment, 
  AppointmentStatus, 
  ScheduledReminder, 
  AppSettings, 
  Professional,
  DietPlan,
  DailyFoodLog,
  AnthropometryEvaluation,
  BioimpedanceEvaluation,
  WaistHipEvaluation,
  NeckCardiometabolicEvaluation,
  PhotogrammetrySession,
  AnvisaProductLabel,
  FinancialTransaction
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DashboardAdministrativoView } from './components/DashboardAdministrativoView';
import { ModuloFinanceiroView } from './components/ModuloFinanceiroView';
import { AgendaClinicaView } from './components/AgendaClinicaView';
import { SmsRemindersView } from './components/SmsRemindersView';
import { GeradorPrescricoesView } from './components/GeradorPrescricoesView';
import { FormulacaoMagistralView } from './components/FormulacaoMagistralView';
import { ProntuarioEletronicoView } from './components/ProntuarioEletronicoView';
import { MeuProfessorView } from './components/MeuProfessorView';
import { QuickMacroCalculator } from './components/QuickMacroCalculator';
import { DietasRastreamentoView } from './components/DietasRastreamentoView';
import { CalculadoraDobrasView } from './components/CalculadoraDobrasView';
import { BioimpedanciaView } from './components/BioimpedanciaView';
import { RCQView } from './components/RCQView';
import { PescocoCardiometabolicoView } from './components/PescocoCardiometabolicoView';
import { FotosComparativasView } from './components/FotosComparativasView';
import { TabelaAnvisaView } from './components/TabelaAnvisaView';
import { RelatorioEvolutivoView } from './components/RelatorioEvolutivoView';
import { ExamesSuplementosView } from './components/ExamesSuplementosView';
import { HemoIntelligenceView } from './components/HemoIntelligenceView';
import { CadastroPacienteView } from './components/CadastroPacienteView';
import { SettingsView } from './components/SettingsView';
import { GestaoProfissionaisView } from './components/GestaoProfissionaisView';
import { ClinicalAccessDenied } from './components/common/ClinicalAccessDenied';
import { CurvasPediatricasView } from './components/pediatric/CurvasPediatricasView';
import { DocumentsHub } from './components/documents/DocumentsHub';
import { LaudoModal } from './components/LaudoModal';
import { LembretesNotificacoesModal } from './components/LembretesNotificacoesModal';
import { NotificationToastBanner } from './components/NotificationToastBanner';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { isBiometricEnrolled, isBiometricLockEnabled } from './lib/webauthn';
import { playClinicalChime } from './utils/audioNotification';
import { apiClient } from './lib/api';
import { usePushNotifications } from './hooks/usePushNotifications';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Bell } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [currentPatient, setCurrentPatient] = useState<Patient>(INITIAL_PATIENTS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutritrack_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return typeof window !== 'undefined' && typeof window.matchMedia === 'function' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches 
        : false;
    } catch {
      return false;
    }
  });
  const [isLaudoOpen, setIsLaudoOpen] = useState<boolean>(false);
  const [collapsedMobile, setCollapsedMobile] = useState<boolean>(true);
  const [consultationMode, setConsultationMode] = useState<boolean>(false);

  // Biometric WebAuthn Authentication State
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(() => {
    try {
      return isBiometricLockEnabled() && isBiometricEnrolled();
    } catch {
      return false;
    }
  });
  const [isBiometricEnrolling, setIsBiometricEnrolling] = useState<boolean>(false);
  const [isAppBiometricEnrolled, setIsAppBiometricEnrolled] = useState<boolean>(() => {
    try {
      return isBiometricEnrolled();
    } catch {
      return false;
    }
  });

  // Desktop Sidebar Collapsible & Automatic Responsive Mode State
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutritrack_sidebar_collapsed');
      if (saved !== null) return saved === 'true';
      return typeof window !== 'undefined' && window.innerWidth < 1280;
    } catch {
      return true;
    }
  });

  const [isAutoResponsive, setIsAutoResponsive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutritrack_sidebar_auto');
      if (saved !== null) return saved === 'true';
      return true; // Auto mode ON by default
    } catch {
      return true;
    }
  });

  // Sync Dark Mode state with document HTML class element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nutritrack_dark_mode', String(darkMode));
  }, [darkMode]);

  // Automatic Responsive Collapse Listener for Notebook/Tablet Viewports
  useEffect(() => {
    const handleResize = () => {
      if (isAutoResponsive) {
        if (window.innerWidth < 1280 && window.innerWidth >= 1024) {
          setIsCollapsedDesktop(true);
        } else if (window.innerWidth >= 1280) {
          setIsCollapsedDesktop(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial evaluation on mount
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoResponsive]);

  const handleToggleCollapseDesktop = () => {
    setIsCollapsedDesktop(prev => {
      const next = !prev;
      localStorage.setItem('nutritrack_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleAutoResponsive = () => {
    setIsAutoResponsive(prev => {
      const next = !prev;
      localStorage.setItem('nutritrack_sidebar_auto', String(next));
      return next;
    });
  };

  // Clinical Evaluations State
  const [dietPlan, setDietPlan] = useState<DietPlan>(INITIAL_DIET_PLAN as DietPlan);
  const [dailyLog, setDailyLog] = useState<DailyFoodLog>(INITIAL_DAILY_LOG as DailyFoodLog);
  const [anthroEval, setAnthroEval] = useState<AnthropometryEvaluation>(INITIAL_ANTHRO_EVALUATION as AnthropometryEvaluation);
  const [biaEval, setBiaEval] = useState<BioimpedanceEvaluation>(INITIAL_BIA_EVALUATION as BioimpedanceEvaluation);
  const [rcqEval, setRcqEval] = useState<WaistHipEvaluation>(INITIAL_RCQ_EVALUATION as WaistHipEvaluation);
  const [neckEval, setNeckEval] = useState<NeckCardiometabolicEvaluation>(INITIAL_NECK_EVALUATION as NeckCardiometabolicEvaluation);
  const [photoSession, setPhotoSession] = useState<PhotogrammetrySession>(INITIAL_PHOTOGRAMMETRY as PhotogrammetrySession);
  const [anvisaLabel, setAnvisaLabel] = useState<AnvisaProductLabel>(INITIAL_ANVISA_LABEL as AnvisaProductLabel);
  const [appointments, setAppointments] = useState<ClinicalAppointment[]>(INITIAL_APPOINTMENTS);
  const [reminders, setReminders] = useState<ScheduledReminder[]>(INITIAL_REMINDERS);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState<boolean>(false);
  const [activeToastReminder, setActiveToastReminder] = useState<ScheduledReminder | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [currentProfessional, setCurrentProfessional] = useState<Professional>(INITIAL_PROFESSIONALS[0]);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(INITIAL_FINANCIAL_TRANSACTIONS);

  const { permission, requestPermission, sendLocalNotification } = usePushNotifications();

  // Appointment Notification Scheduler
  useEffect(() => {
    if (permission !== 'granted') return;

    const interval = setInterval(() => {
      const now = new Date();
      const nowTime = now.getHours() * 60 + now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];

      appointments.forEach(apt => {
        if (apt.date === todayStr && apt.status === 'confirmado') {
          const [h, m] = apt.startTime.split(':').map(Number);
          const aptTime = h * 60 + m;
          const diff = aptTime - nowTime;

          // Notify 15 minutes before the appointment
          if (diff === 15) {
            sendLocalNotification(`Próxima Consulta em 15 min`, {
              body: `${apt.patientName} (${apt.type}) - ${apt.startTime}`,
              tag: `apt-${apt.id}`,
              renotify: true
            } as any);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [appointments, permission, sendLocalNotification]);

  // Sync state with backend on mount
  useEffect(() => {
    apiClient.getPatients()
      .then(serverPatients => {
        if (serverPatients && serverPatients.length > 0) {
          setPatients(serverPatients);
          setCurrentPatient(prev => serverPatients.find(p => p.id === prev.id) || serverPatients[0]);
        }
      })
      .catch(() => {});

    apiClient.getSettings()
      .then(serverSettings => {
        if (serverSettings) setSettings(serverSettings);
      })
      .catch(() => {});

    apiClient.getProfessionals()
      .then(profs => {
        if (profs && profs.length > 0) {
          setProfessionals(profs);
          setCurrentProfessional(prev => profs.find(p => p.id === prev.id) || profs[0]);
        }
      })
      .catch(() => {});

    apiClient.getCurrentUser()
      .then(user => {
        if (user) setCurrentProfessional(user);
      })
      .catch(() => {});

    // Listen for background sync completion to update state
    const handleSyncComplete = () => {
      apiClient.getPatients()
        .then(serverPatients => {
          if (serverPatients && serverPatients.length > 0) {
            setPatients(serverPatients);
            setCurrentPatient(prev => serverPatients.find(p => p.id === prev.id) || serverPatients[0]);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('nutripro:sync-complete', handleSyncComplete);
    return () => {
      window.removeEventListener('nutripro:sync-complete', handleSyncComplete);
    };
  }, []);

  // Patient Handlers with Backend Sync
  const handleAddPatient = async (newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
    setCurrentPatient(newPatient);
    setPatientToEdit(null);
    setActiveTab('dashboard');
    try {
      await apiClient.createPatient(newPatient);
    } catch (err) {
      console.warn('[Sync API] Stored locally:', err);
    }
  };

  const handleUpdatePatient = async (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    setCurrentPatient(updated);
    setPatientToEdit(null);
    setActiveTab('dashboard');
    try {
      await apiClient.updatePatient(updated.id, updated);
    } catch (err) {
      console.warn('[Sync API] Updated locally:', err);
    }
  };

  const handleDeletePatient = async (id: string) => {
    const remaining = patients.filter(p => p.id !== id);
    setPatients(remaining);
    if (remaining.length > 0) {
      setCurrentPatient(remaining[0]);
    }
    setPatientToEdit(null);
    setActiveTab('dashboard');
    try {
      await apiClient.deletePatient(id);
    } catch (err) {
      console.warn('[Sync API] Deleted locally:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      await apiClient.updateSettings(newSettings);
    } catch (err) {
      console.warn('[Sync API] Settings updated locally:', err);
    }
  };

  // Trigger Toast Reminder & Audio Chime
  const handleTriggerToast = (rem: ScheduledReminder) => {
    setActiveToastReminder(rem);
    if (rem.soundEnabled) {
      playClinicalChime();
    }
  };

  // Consume action from toast notification
  const handleMarkReminderConsumed = (rem: ScheduledReminder) => {
    if (rem.type === 'hidratacao') {
      setDailyLog(prev => ({
        ...prev,
        waterGlassesConsumed: prev.waterGlassesConsumed + 1
      }));
    } else if (rem.type === 'refeicao' && rem.relatedMealId) {
      const updatedMeals = dietPlan.meals.map(m => {
        if (m.id === rem.relatedMealId) {
          return { ...m, consumedToday: true };
        }
        return m;
      });
      setDietPlan(prev => ({ ...prev, meals: updatedMeals }));

      const consumedMeals = updatedMeals.filter(m => m.consumedToday);
      const totalCals = consumedMeals.reduce((acc, m) => acc + m.totalCalories, 0);
      const totalProt = consumedMeals.reduce((acc, m) => acc + m.totalProtein, 0);
      const totalCarb = consumedMeals.reduce((acc, m) => acc + m.totalCarbs, 0);
      const totalFat = consumedMeals.reduce((acc, m) => acc + m.totalFat, 0);
      const totalFib = consumedMeals.reduce((acc, m) => acc + m.totalFiber, 0);

      setDailyLog(prev => ({
        ...prev,
        consumedCaloriesKcal: totalCals,
        consumedProteinG: totalProt,
        consumedCarbsG: totalCarb,
        consumedFatG: totalFat,
        consumedFiberG: totalFib
      }));
    }
  };

  // Appointment Handlers
  const handleAddAppointment = (newApt: ClinicalAppointment) => {
    setAppointments(prev => [newApt, ...prev]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleSelectPatientAndNavigate = (patientId: string, targetModule: 'dietas' | 'dobras' | 'bioimpedancia') => {
    const matched = patients.find(p => p.id === patientId);
    if (matched) {
      setCurrentPatient(matched);
    }
    setActiveTab(targetModule);
  };

  // Switch Patient Handler
  const handleSelectPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    // Adjust diet plan targets based on newly selected patient
    setDietPlan(prev => ({
      ...prev,
      patientId: patient.id
    }));
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const summary = `*NUTRI PRO - Relatório Clínico de Consulta*%0A` +
      `*Paciente:* ${privacyMode ? 'Confidencial' : currentPatient.name} (${currentPatient.recordNumber})%0A` +
      `*Meta Calórica:* ${dietPlan.calorieTargetKcal} kcal/dia%0A` +
      `*Proteínas:* ${dietPlan.proteinGrams}g (${dietPlan.proteinGPerKg} g/kg)%0A` +
      `*Carboidratos:* ${dietPlan.carbsGrams}g | *Gorduras:* ${dietPlan.fatGrams}g%0A` +
      `*Meta Hídrica:* ${dietPlan.waterTargetMl} ml (${Math.round(dietPlan.waterTargetMl / 250)} copos)%0A` +
      `*Gordura Corporal Atual:* ${anthroEval.bodyFatPercent}% (%G Jackson 7)%0A` +
      `*Massa Magra Preservada:* ${anthroEval.leanMassKg} kg%0A` +
      `*Evolução:* Recomposição Corporal Notável (ISAK II).`;

    window.open(`https://api.whatsapp.com/send?text=${summary}`, '_blank');
  };

  // Module Title Dispatcher
  const getModuleName = (tab: ActiveTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard de Progresso e Visão Geral do Paciente';
      case 'prontuario':
        return 'Prontuário Eletrônico Nutricional Inteligente (PEN) - Central Clínica';
      case 'dashboard_admin':
        return 'Painel de Indicadores Administrativos, Metas & Faturamento';
      case 'financeiro':
        return 'Módulo Financeiro, Fluxo de Caixa & DRE Clínico';
      case 'agenda':
        return 'Agenda Clínica de Consultas, Retornos & Exames';
      case 'dietas':
        return 'Dietas Personalizadas & Rastreamento Calórico Diário';
      case 'calculadora_macros':
        return 'Calculadora Rápida de Macro-Nutrientes & Simulação GET';
      case 'pediatria':
        return 'Gráficos de Crescimento Infantil & Escore-Z (OMS / SISVAN)';
      case 'dobras':
        return 'Calculadora Antropométrica de Dobras Cutâneas (ISAK II)';
      case 'bioimpedancia':
        return 'Bioimpedância Multifrequencial 4C & Ângulo de Fase';
      case 'rcq':
        return 'Avaliação RCQ (Cintura-Quadril) & Risco Coronariano';
      case 'pescoco':
        return 'Circunferência do Pescoço & Risco Cardiometabólico';
      case 'fotos':
        return 'Fotogrametria Comparativa & Recomposição T0/T1';
      case 'anvisa':
        return 'Gerador de Tabela Nutricional & Lupa Frontal ANVISA';
      case 'relatorio_evolutivo':
        return 'Relatório Evolutivo: Tendências de Peso, Gordura & Metas Futuras';
      case 'prescricoes':
        return 'Gerador de Prescrições Eletrônicas e Fitoterápicos';
      case 'formulacao_magistral':
        return 'Módulo de Formulação Magistral, 50 Protocolos & Farmacologia Clínica';
      case 'pacientes':
        return patientToEdit ? 'Editar Prontuário do Paciente' : 'Novo Cadastro de Paciente';
      case 'profissionais':
        return 'Cadastro de Profissionais & Permissões (RBAC)';
      case 'settings':
        return 'Configurações de Sistema & Governança';
      default:
        return 'Módulo Clínico';
    }
  };

  const isClinicalDenied = currentProfessional.role === 'recepcionista' || 
    currentProfessional.role === 'secretaria' || 
    !currentProfessional.permissions.canAccessClinicalRecords;

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Clinical Header */}
      <Header
        currentPatient={currentPatient}
        patients={patients}
        onSelectPatient={handleSelectPatient}
        privacyMode={privacyMode}
        onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenLaudo={() => setIsLaudoOpen(true)}
        onShareWhatsApp={handleShareWhatsApp}
        activeModuleName={getModuleName(activeTab)}
        remindersCount={reminders.filter(r => r.enabled).length}
        onOpenReminders={() => setIsRemindersModalOpen(true)}
        currentProfessional={currentProfessional}
        professionals={professionals}
        onSelectProfessional={setCurrentProfessional}
        onNavigateToProfessionals={() => setActiveTab('profissionais')}
        consultationMode={consultationMode}
        onToggleConsultationMode={() => setConsultationMode(!consultationMode)}
        pushNotificationPermission={permission}
        onRequestPushPermission={requestPermission}
        onToggleMobileMenu={() => setCollapsedMobile(prev => !prev)}
        onOpenBiometrics={() => {
          setIsBiometricEnrolling(!isAppBiometricEnrolled);
          setIsBiometricModalOpen(true);
        }}
        isBiometricEnrolled={isAppBiometricEnrolled}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        {!consultationMode && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            collapsedMobile={collapsedMobile}
            onCloseMobile={() => setCollapsedMobile(true)}
            currentRole={currentProfessional.role}
            isCollapsedDesktop={isCollapsedDesktop}
          />
        )}

        {/* Main Clinical Viewport */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          consultationMode ? 'lg:pl-0' : (isCollapsedDesktop ? 'lg:pl-16' : 'lg:pl-64')
        } overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8`}>
          
          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setCollapsedMobile(!collapsedMobile)}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center space-x-2 text-xs font-semibold shadow-xs"
            >
              <Menu className="w-4 h-4" />
              <span>Navegar Módulos Clínicos</span>
            </button>

            <span className="text-xs font-mono font-bold text-[#004f28] dark:text-emerald-400">
              {currentPatient.name.split(' ')[0]} • {currentPatient.currentWeightKg}kg
            </span>
          </div>

          {/* Active Module Renderer with Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  patient={currentPatient}
                  anthro={anthroEval}
                  privacyMode={privacyMode}
                  onEdit={() => {
                    setPatientToEdit(currentPatient);
                    setActiveTab('pacientes');
                  }}
                />
              )}

              {activeTab === 'prontuario' && (
                <ProntuarioEletronicoView
                  currentPatient={currentPatient}
                  currentProfessional={currentProfessional}
                  patients={patients}
                  onSelectPatient={setCurrentPatient}
                  privacyMode={privacyMode}
                />
              )}

              {activeTab === 'dashboard_admin' && (
                <DashboardAdministrativoView
                  patients={patients}
                  appointments={appointments}
                  privacyMode={privacyMode}
                />
              )}

              {activeTab === 'financeiro' && (
                <ModuloFinanceiroView
                  transactions={financialTransactions}
                  onUpdateTransactions={setFinancialTransactions}
                  patients={patients}
                  currentProfessional={currentProfessional}
                  privacyMode={privacyMode}
                />
              )}

              {activeTab === 'meu_professor' && (
                <MeuProfessorView />
              )}

              {activeTab === 'pacientes' && (
                <CadastroPacienteView
                  onAddPatient={handleAddPatient}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={handleDeletePatient}
                  patientToEdit={patientToEdit}
                  allowDelete={settings.allowPatientDeletion}
                />
              )}

              {activeTab === 'profissionais' && (
                <GestaoProfissionaisView
                  professionals={professionals}
                  currentProfessional={currentProfessional}
                  onUpdateProfessionals={setProfessionals}
                  onSelectCurrentProfessional={setCurrentProfessional}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onNavigateToProfessionals={() => setActiveTab('profissionais')}
                />
              )}

              {activeTab === 'agenda' && (
                <AgendaClinicaView
                  patients={patients}
                  appointments={appointments}
                  onAddAppointment={handleAddAppointment}
                  onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                  onSelectPatientAndNavigate={handleSelectPatientAndNavigate}
                  privacyMode={privacyMode}
                />
              )}

              {activeTab === 'sms_lembretes' && (
                <SmsRemindersView
                  appointments={appointments}
                  patients={patients}
                  privacyMode={privacyMode}
                />
              )}

              {activeTab === 'documentos' && (
                <DocumentsHub
                  currentPatient={currentPatient}
                  patients={patients}
                  onSelectPatient={setCurrentPatient}
                  professional={currentProfessional}
                  settings={settings}
                  anthroData={anthroEval}
                  biaData={biaEval}
                  dietPlan={dietPlan}
                />
              )}

              {activeTab === 'prescricoes' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Gerador de Prescrições Eletrônicas"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <GeradorPrescricoesView
                    patients={patients}
                    currentPatient={currentPatient}
                    onSelectPatient={setCurrentPatient}
                    currentProfessional={currentProfessional}
                    privacyMode={privacyMode}
                  />
                )
              )}

              {activeTab === 'formulacao_magistral' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Módulo de Formulação Magistral & Farmacologia"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <FormulacaoMagistralView
                    currentPatient={currentPatient}
                    currentProfessional={currentProfessional}
                    privacyMode={privacyMode}
                  />
                )
              )}

              {activeTab === 'dietas' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Dietas & Rastreamento Calórico"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <DietasRastreamentoView
                    patient={currentPatient}
                    dietPlan={dietPlan}
                    onUpdateDietPlan={setDietPlan}
                    dailyLog={dailyLog}
                    onUpdateDailyLog={setDailyLog}
                    reminders={reminders}
                    onOpenRemindersModal={() => setIsRemindersModalOpen(true)}
                    onTriggerInstantToast={handleTriggerToast}
                  />
                )
              )}

              {activeTab === 'calculadora_macros' && (
                <QuickMacroCalculator
                  initialWeight={currentPatient.currentWeightKg}
                  initialHeight={currentPatient.heightCm}
                  initialAge={currentPatient.age}
                  initialSex={currentPatient.sex}
                />
              )}

              {activeTab === 'pediatria' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Curvas de Crescimento Pediátrico OMS"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <CurvasPediatricasView
                    currentPatient={currentPatient}
                    patients={patients}
                    onSelectPatient={handleSelectPatient}
                    onUpdatePatient={handleUpdatePatient}
                    privacyMode={privacyMode}
                  />
                )
              )}

              {activeTab === 'dobras' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Calculadora de Dobras Cutâneas ISAK"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <CalculadoraDobrasView
                    patient={currentPatient}
                    evaluation={anthroEval}
                    onSaveEvaluation={setAnthroEval}
                    privacyMode={privacyMode}
                  />
                )
              )}

              {activeTab === 'bioimpedancia' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Bioimpedância Multifrequencial 4C"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <BioimpedanciaView
                    patient={currentPatient}
                    evaluation={biaEval}
                    onSaveEvaluation={setBiaEval}
                  />
                )
              )}

              {activeTab === 'rcq' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Avaliação RCQ Cintura-Quadril"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <RCQView
                    patient={currentPatient}
                    evaluation={rcqEval}
                    onSaveEvaluation={setRcqEval}
                  />
                )
              )}

              {activeTab === 'pescoco' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Circunferência do Pescoço & Cardiometabólico"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <PescocoCardiometabolicoView
                    patient={currentPatient}
                    evaluation={neckEval}
                    onSaveEvaluation={setNeckEval}
                  />
                )
              )}

              {activeTab === 'fotos' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Fotogrametria Comparativa T0/T1"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <FotosComparativasView
                    patient={currentPatient}
                    session={photoSession}
                    onSaveToLaudo={() => setIsLaudoOpen(true)}
                  />
                )
              )}

              {activeTab === 'anvisa' && (
                <TabelaAnvisaView
                  labelData={anvisaLabel}
                  onUpdateLabel={setAnvisaLabel}
                />
              )}

              {activeTab === 'relatorio_evolutivo' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Relatório Evolutivo de Metas"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <RelatorioEvolutivoView
                    patient={currentPatient}
                  />
                )
              )}

              {activeTab === 'exames_suplementos' && (
                isClinicalDenied ? (
                  <ClinicalAccessDenied
                    moduleName="Requisição de Exames & Suplementação"
                    currentProfessional={currentProfessional}
                    professionals={professionals}
                    onSwitchProfessional={setCurrentProfessional}
                    onNavigateToSchedule={() => setActiveTab('agenda')}
                  />
                ) : (
                  <ExamesSuplementosView
                    patient={currentPatient}
                  />
                )
              )}

              {activeTab === 'hemo_intelligence' && (
                <HemoIntelligenceView
                  currentPatient={currentPatient}
                  patients={patients}
                  onSelectPatient={setCurrentPatient}
                  professional={currentProfessional}
                  anthroData={anthroEval}
                  biaData={biaEval}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>

      {/* Comprehensive Printable Clinical Report Modal */}
      <LaudoModal
        isOpen={isLaudoOpen}
        onClose={() => setIsLaudoOpen(false)}
        patient={currentPatient}
        anthro={anthroEval}
        bia={biaEval}
        rcq={rcqEval}
        neck={neckEval}
        diet={dietPlan}
        privacyMode={privacyMode}
        photoSession={photoSession}
      />

      {/* Local Notifications & Reminders Modal */}
      <LembretesNotificacoesModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        patient={currentPatient}
        reminders={reminders}
        onUpdateReminders={setReminders}
        onTriggerInstantToast={handleTriggerToast}
      />

      {/* Floating Notification Toast Banner */}
      <NotificationToastBanner
        reminder={activeToastReminder}
        onClose={() => setActiveToastReminder(null)}
        onMarkConsumed={handleMarkReminderConsumed}
        onSnooze={() => setActiveToastReminder(null)}
      />

      {/* Floating Offline Sync Indicator & Queue Banner */}
      <OfflineSyncBanner />

      {/* Mobile Bottom Navigation Bar (Fast Thumb Access on Mobile Devices) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSidebar={() => setCollapsedMobile(false)}
      />

      {/* Web Authentication API (WebAuthn) Biometric Unlock Modal */}
      <BiometricAuthModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onSuccess={() => {
          setIsBiometricModalOpen(false);
          setIsAppBiometricEnrolled(isBiometricEnrolled());
        }}
        professional={currentProfessional}
        isEnrolling={isBiometricEnrolling}
      />

    </div>
  );
}
