import React from 'react';
import { Patient } from '../types';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  FileText, 
  Share2, 
  ChevronDown, 
  UserCheck, 
  MapPin,
  Lock,
  BellRing,
  Sun,
  Moon,
  Users,
  Focus,
  Menu,
  Fingerprint
} from 'lucide-react';
import { Professional } from '../types';
import { ROLE_METADATA } from '../domain/permissions';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentPatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenLaudo: () => void;
  onShareWhatsApp: () => void;
  activeModuleName: string;
  remindersCount?: number;
  onOpenReminders?: () => void;
  currentProfessional?: Professional | null;
  professionals?: Professional[];
  onSelectProfessional?: (prof: Professional) => void;
  onNavigateToProfessionals?: () => void;
  consultationMode?: boolean;
  onToggleConsultationMode?: () => void;
  pushNotificationPermission?: NotificationPermission;
  onRequestPushPermission?: () => Promise<boolean>;
  onToggleMobileMenu?: () => void;
  onOpenBiometrics?: () => void;
  isBiometricEnrolled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  privacyMode,
  onTogglePrivacy,
  darkMode,
  onToggleTheme,
  onOpenLaudo,
  onShareWhatsApp,
  activeModuleName,
  remindersCount,
  onOpenReminders,
  currentProfessional,
  professionals = [],
  onSelectProfessional,
  onNavigateToProfessionals,
  consultationMode = false,
  onToggleConsultationMode,
  pushNotificationPermission,
  onRequestPushPermission,
  onToggleMobileMenu,
  onOpenBiometrics,
  isBiometricEnrolled
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [profDropdownOpen, setProfDropdownOpen] = React.useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Hamburger Button */}
            {!consultationMode && onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                title="Abrir menu de módulos clínicos"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {!consultationMode && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#004f28] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  NP
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-black text-[#004f28] dark:text-emerald-400 tracking-tight uppercase">NUTRI PRO</span>
                </div>
              </div>
            )}

            {!consultationMode && <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700" />}

            {/* Patient Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#004f28]/30"
              >
                <div className="w-7 h-7 rounded-full bg-[#004f28]/10 text-[#004f28] font-bold text-xs flex items-center justify-center">
                  {currentPatient.avatarInitials}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <span className={privacyMode ? 'filter blur-xs select-none' : ''}>{currentPatient.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{currentPatient.recordNumber}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    {currentPatient.age}a • {currentPatient.currentWeightKg}kg • IMC {currentPatient.imc.toFixed(1)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Selecionar Prontuário Ativo
                  </div>
                  {patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPatient(p);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        p.id === currentPatient.id ? 'bg-[#004f28]/5 text-[#004f28] font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold">
                          {p.avatarInitials}
                        </span>
                        <div>
                          <div className={privacyMode ? 'filter blur-xs' : ''}>{p.name}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {p.sex === 'male' ? 'Masc' : 'Fem'} • {p.currentWeightKg}kg • {p.recordNumber}
                          </div>
                        </div>
                      </div>
                      {p.id === currentPatient.id && <UserCheck className="w-4 h-4 text-[#004f28]" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-3 py-1 flex items-center text-[11px] text-slate-400 dark:text-slate-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>Unidade: {currentPatient.unit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Security, Privacy, and Export Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Consultation Mode Focus Toggle */}
            <button
              onClick={onToggleConsultationMode}
              title={consultationMode ? 'Sair do Modo Consulta (Mostrar Navegação)' : 'Ativar Modo Consulta (Focar no Paciente)'}
              className={`p-2 rounded-lg border flex items-center space-x-1.5 text-xs font-bold transition-all ${
                consultationMode
                  ? 'bg-[#004f28] text-white border-[#004f28] shadow-md shadow-[#004f28]/20 ring-2 ring-[#004f28]/20 pulse-green'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Focus className={`w-4 h-4 ${consultationMode ? 'animate-pulse' : ''}`} />
              <span className={consultationMode ? 'inline' : 'hidden md:inline'}>
                {consultationMode ? 'Modo Foco Ativo' : 'Modo Consulta'}
              </span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* WebAuthn Biometric Security Button */}
            {onOpenBiometrics && (
              <button
                onClick={onOpenBiometrics}
                title={isBiometricEnrolled ? 'Segurança Biométrica Ativa (Touch ID / Face ID)' : 'Configurar Autenticação Biométrica no PWA'}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-semibold relative"
              >
                <Fingerprint className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
                {isBiometricEnrolled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
                )}
                <span className="hidden xl:inline text-[11px]">Biometria</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title={darkMode ? 'Alternar para Modo Claro (Diurno)' : 'Alternar para Modo Escuro (Fadiga Visual / Turno Noturno)'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden xl:inline text-[11px] text-slate-200">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="hidden xl:inline text-[11px] text-slate-700">Modo Escuro</span>
                </>
              )}
            </button>

            {/* Lembretes & Notificações Bell */}
            {onOpenReminders && (
              <div className="flex items-center">
                {pushNotificationPermission === 'default' && (
                  <button
                    onClick={onRequestPushPermission}
                    title="Ativar Notificações no Navegador (Push)"
                    className="p-2 rounded-l-lg border border-r-0 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center space-x-1.5 text-[10px] font-bold"
                  >
                    <BellRing className="w-3.5 h-3.5 animate-bounce" />
                    <span className="hidden sm:inline">Ativar Push</span>
                  </button>
                )}
                <button
                  onClick={onOpenReminders}
                  title="Lembretes & Notificações Programadas do Paciente"
                  className={`p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative flex items-center space-x-1.5 ${
                    pushNotificationPermission === 'default' ? 'rounded-r-lg border-l-amber-200' : 'rounded-lg'
                  }`}
                >
                  <BellRing className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
                  {remindersCount !== undefined && (
                    <span className="w-4 h-4 rounded-full bg-[#004f28] dark:bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                      {remindersCount}
                    </span>
                  )}
                  <span className="hidden xl:inline text-[11px] font-medium text-slate-700 dark:text-slate-300">Lembretes</span>
                </button>
              </div>
            )}

            {/* LGPD Privacy Mode Toggle */}
            <button
              onClick={onTogglePrivacy}
              title={privacyMode ? 'Desativar modo privacidade (LGPD)' : 'Ativar modo privacidade (ocultar nomes na tela)'}
              className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 transition-colors ${
                privacyMode 
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {privacyMode ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span className="hidden sm:inline font-medium text-[11px]">Privacidade Ativa</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline text-[11px]">Modo Clínico</span>
                </>
              )}
            </button>

            {/* Compliance Badge */}
            <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-mono border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3 text-[#004f28] dark:text-emerald-400" />
              <span>ISAK II & LGPD</span>
            </div>

            {/* Logged-in Professional & Role Switcher */}
            {currentProfessional && (
              <div className="relative">
                <button
                  onClick={() => setProfDropdownOpen(!profDropdownOpen)}
                  title="Perfil e Função Ativa no Sistema (Clique para simular outro papel)"
                  className="flex items-center space-x-2 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                    ROLE_METADATA[currentProfessional.role]?.badgeBg || 'bg-slate-200 text-slate-800'
                  }`}>
                    {currentProfessional.avatarInitials || currentProfessional.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1">
                      <span>{currentProfessional.name.split(' ')[0]} {currentProfessional.name.split(' ')[1] || ''}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <span className={`px-1 rounded font-bold uppercase ${
                        ROLE_METADATA[currentProfessional.role]?.badgeText || 'text-slate-600'
                      }`}>
                        {ROLE_METADATA[currentProfessional.role]?.shortLabel || currentProfessional.role}
                      </span>
                      <span>• {currentProfessional.registrationCode}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span>Simular Perfil / Usuário</span>
                      <span className="text-[9px] font-normal text-emerald-600">RBAC Ativo</span>
                    </div>

                    <div className="py-1">
                      {professionals.map(prof => {
                        const isSelected = prof.id === currentProfessional.id;
                        const meta = ROLE_METADATA[prof.role] || ROLE_METADATA.nutricionista;
                        return (
                          <button
                            key={prof.id}
                            onClick={() => {
                              onSelectProfessional?.(prof);
                              setProfDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                              isSelected ? 'bg-slate-50 dark:bg-slate-800/80 font-bold' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${meta.badgeBg}`}>
                                {prof.avatarInitials}
                              </span>
                              <div>
                                <div className="text-xs truncate max-w-[140px]">{prof.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {meta.shortLabel} • {prof.registrationCode}
                                </div>
                              </div>
                            </div>
                            {isSelected && <UserCheck className="w-3.5 h-3.5 text-[#004f28]" />}
                          </button>
                        );
                      })}
                    </div>

                    {onNavigateToProfessionals && (
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-2">
                        <button
                          onClick={() => {
                            setProfDropdownOpen(false);
                            onNavigateToProfessionals();
                          }}
                          className="w-full py-1.5 px-2 text-center text-xs font-bold text-[#004f28] hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Gerenciar Equipe & Permissões</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp Share */}
            <button
              onClick={onShareWhatsApp}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center space-x-1.5 text-xs font-medium"
              title="Compartilhar resumo com o paciente no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden md:inline">Enviar WhatsApp</span>
            </button>

            {/* Export Printable Clinical Report */}
            <button
              onClick={onOpenLaudo}
              className="px-3.5 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003b1e] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white transition-colors flex items-center space-x-2 text-xs font-semibold shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laudo Completo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
