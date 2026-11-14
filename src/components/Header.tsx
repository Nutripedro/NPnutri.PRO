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
  X,
  Move,
  RotateCcw
} from 'lucide-react';
import { Professional } from '../types';
import { ROLE_METADATA } from '../domain/permissions';
import { PWAInstallButton } from './PWAInstallButton';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

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
  onRequestPushPermission
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [profDropdownOpen, setProfDropdownOpen] = React.useState(false);
  const [showWhatsappGif, setShowWhatsappGif] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutripro_whatsapp_gif_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [gifZoomed, setGifZoomed] = React.useState(false);
  const [gifOffset, setGifOffset] = React.useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem('nutripro_whatsapp_gif_offset');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return { x: parsed.x, y: parsed.y };
        }
      }
    } catch {
      // Ignore storage errors
    }
    return { x: 0, y: 0 };
  });
  const [isDraggingGif, setIsDraggingGif] = React.useState(false);
  const [autoViewportShift, setAutoViewportShift] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  });

  const gifContainerRef = React.useRef<HTMLDivElement>(null);
  const dragSessionRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    baseLeft: number;
    baseTop: number;
    width: number;
    height: number;
    hasBounds: boolean;
    moved: boolean;
  } | null>(null);
  const suppressNextClickRef = React.useRef(false);

  const persistGifOffset = React.useCallback((next: { x: number; y: number }) => {
    try {
      localStorage.setItem('nutripro_whatsapp_gif_offset', JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clampWithBounds = React.useCallback(
    (
      candidate: { x: number; y: number },
      bounds: { baseLeft: number; baseTop: number; width: number; height: number; hasBounds: boolean }
    ) => {
      if (!bounds.hasBounds || typeof window === 'undefined') return candidate;
      const margin = 8;
      const minX = margin - bounds.baseLeft;
      const maxX = Math.max(minX, window.innerWidth - margin - bounds.width - bounds.baseLeft);
      const minY = margin - bounds.baseTop;
      const maxY = Math.max(minY, window.innerHeight - margin - bounds.height - bounds.baseTop);
      return {
        x: Math.round(Math.max(minX, Math.min(maxX, candidate.x))),
        y: Math.round(Math.max(minY, Math.min(maxY, candidate.y)))
      };
    },
    []
  );

  const handleResetGifPosition = React.useCallback(() => {
    const zero = { x: 0, y: 0 };
    setGifOffset(zero);
    setAutoViewportShift(zero);
    persistGifOffset(zero);
  }, [persistGifOffset]);

  const handleGifDragStart = (e: React.PointerEvent<HTMLElement>) => {
    // Only primary mouse button or touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = gifContainerRef.current;
    const rect = el?.getBoundingClientRect();
    const totalCurrentX = gifOffset.x + autoViewportShift.x;
    const totalCurrentY = gifOffset.y + autoViewportShift.y;
    dragSessionRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: totalCurrentX,
      origY: totalCurrentY,
      baseLeft: rect ? rect.left - totalCurrentX : 0,
      baseTop: rect ? rect.top - totalCurrentY : 0,
      width: rect ? rect.width : 0,
      height: rect ? rect.height : 0,
      hasBounds: Boolean(rect),
      moved: false
    };
  };

  const handleGifDragMove = (e: React.PointerEvent<HTMLElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    const dx = e.clientX - session.startX;
    const dy = e.clientY - session.startY;
    if (!session.moved && Math.hypot(dx, dy) > 5) {
      session.moved = true;
      setIsDraggingGif(true);
      setAutoViewportShift({ x: 0, y: 0 });
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignore if capture is unsupported
      }
    }
    if (session.moved) {
      const next = clampWithBounds(
        {
          x: session.origX + dx,
          y: session.origY + dy
        },
        session
      );
      setGifOffset(next);
    }
  };

  const handleGifDragEnd = (e: React.PointerEvent<HTMLElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    if (session.moved) {
      suppressNextClickRef.current = true;
      setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 120);
      const dx = e.clientX - session.startX;
      const dy = e.clientY - session.startY;
      const finalOffset = clampWithBounds(
        {
          x: session.origX + dx,
          y: session.origY + dy
        },
        session
      );
      setGifOffset(finalOffset);
      persistGifOffset(finalOffset);
    }
    dragSessionRef.current = null;
    setIsDraggingGif(false);
  };

  const handleGifKeyMove = (e: React.KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 24 : 12;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else if (e.key === 'Home') {
      e.preventDefault();
      handleResetGifPosition();
      return;
    } else {
      return;
    }
    e.preventDefault();
    const el = gifContainerRef.current;
    const rect = el?.getBoundingClientRect();
    const totalCurrentX = gifOffset.x + autoViewportShift.x;
    const totalCurrentY = gifOffset.y + autoViewportShift.y;
    const next = clampWithBounds(
      { x: totalCurrentX + dx, y: totalCurrentY + dy },
      {
        baseLeft: rect ? rect.left - totalCurrentX : 0,
        baseTop: rect ? rect.top - totalCurrentY : 0,
        width: rect ? rect.width : 0,
        height: rect ? rect.height : 0,
        hasBounds: Boolean(rect)
      }
    );
    setAutoViewportShift({ x: 0, y: 0 });
    setGifOffset(next);
    persistGifOffset(next);
  };

  React.useEffect(() => {
    if (!gifZoomed) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (dragSessionRef.current?.moved) return;
      if (gifContainerRef.current && !gifContainerRef.current.contains(e.target as Node)) {
        setGifZoomed(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGifZoomed(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gifZoomed]);

  // Keep GIF strictly inside mobile/desktop viewport on resize, zoom toggle, or layout shifts
  React.useLayoutEffect(() => {
    if (!showWhatsappGif || isDraggingGif) {
      if (!showWhatsappGif) setAutoViewportShift({ x: 0, y: 0 });
      return;
    }
    const ensureInViewport = () => {
      const el = gifContainerRef.current;
      if (!el || typeof window === 'undefined') return;
      const rect = el.getBoundingClientRect();
      const baseLeft = rect.left - autoViewportShift.x;
      const baseTop = rect.top - autoViewportShift.y;
      const margin = 8;
      let shiftX = 0;
      let shiftY = 0;

      if (baseLeft < margin) {
        shiftX = margin - baseLeft;
      } else if (baseLeft + rect.width > window.innerWidth - margin) {
        shiftX = window.innerWidth - margin - rect.width - baseLeft;
      }

      if (baseTop < margin) {
        shiftY = margin - baseTop;
      } else if (baseTop + rect.height > window.innerHeight - margin) {
        shiftY = window.innerHeight - margin - rect.height - baseTop;
      }

      const nextShift = { x: Math.round(shiftX), y: Math.round(shiftY) };
      setAutoViewportShift((prev) =>
        prev.x === nextShift.x && prev.y === nextShift.y ? prev : nextShift
      );
    };

    ensureInViewport();
    window.addEventListener('resize', ensureInViewport);
    return () => window.removeEventListener('resize', ensureInViewport);
  }, [showWhatsappGif, gifZoomed, gifOffset.x, gifOffset.y, isDraggingGif, autoViewportShift.x, autoViewportShift.y]);

  const handleToggleWhatsappGif = () => {
    setShowWhatsappGif((prev) => {
      const next = !prev;
      if (!next) setGifZoomed(false);
      try {
        localStorage.setItem('nutripro_whatsapp_gif_enabled', String(next));
      } catch {
        // Ignore storage errors in restricted environments
      }
      return next;
    });
  };

  const totalGifX = gifOffset.x + autoViewportShift.x;
  const totalGifY = gifOffset.y + autoViewportShift.y;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-4">
            {!consultationMode && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#004f28] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  NP
                </div>
                <div>
                  <span className="text-sm font-black text-[#004f28] dark:text-emerald-400 tracking-tight uppercase">NUTRI PRO</span>
                </div>
              </div>
            )}

            {!consultationMode && <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700" />}

            {/* Patient Selector Dropdown */}
            <div className="relative flex items-center space-x-1.5">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Selecionar outro prontuário de paciente"
                className="flex items-center space-x-3 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#004f28]/30 cursor-pointer"
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

              <InfoHelpButton
                helpId="btn_seletor_paciente"
                size="xs"
                variant="subtle"
                title="Explicação sobre a troca de prontuário ativo"
              />

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
            <ClinicalTooltip helpId="btn_modo_consulta" position="bottom">
              <button
                onClick={onToggleConsultationMode}
                aria-label="Ativar ou desativar Modo Consulta (foco no paciente)"
                className={`p-2 rounded-lg border flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer ${
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
            </ClinicalTooltip>

            {/* PWA Install Button with Tooltip */}
            <ClinicalTooltip helpId="btn_pwa_install" position="bottom">
              <PWAInstallButton />
            </ClinicalTooltip>

            {/* Dark Mode Toggle */}
            <ClinicalTooltip helpId="btn_modo_tema" position="bottom">
              <button
                onClick={onToggleTheme}
                aria-label="Alternar tema claro e escuro"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
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
            </ClinicalTooltip>

            {/* Lembretes & Notificações Bell */}
            {onOpenReminders && (
              <div className="flex items-center">
                {pushNotificationPermission === 'default' && (
                  <button
                    onClick={onRequestPushPermission}
                    title="Ativar Notificações no Navegador (Push)"
                    className="p-2 rounded-l-lg border border-r-0 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center space-x-1.5 text-[10px] font-bold cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5 animate-bounce" />
                    <span className="hidden sm:inline">Ativar Push</span>
                  </button>
                )}
                <ClinicalTooltip helpId="btn_lembretes" position="bottom">
                  <button
                    onClick={onOpenReminders}
                    aria-label="Abrir central de lembretes e notificações"
                    className={`p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative flex items-center space-x-1.5 cursor-pointer ${
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
                </ClinicalTooltip>
              </div>
            )}

            {/* LGPD Privacy Mode Toggle */}
            <ClinicalTooltip helpId="btn_privacidade_lgpd" position="bottom">
              <button
                onClick={onTogglePrivacy}
                aria-label="Ativar ou desativar modo privacidade LGPD"
                className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 transition-colors cursor-pointer ${
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
            </ClinicalTooltip>

            {/* Compliance Badge */}
            <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-mono border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3 text-[#004f28] dark:text-emerald-400" />
              <span>ISAK II & LGPD</span>
            </div>

            {/* Logged-in Professional & Role Switcher */}
            {currentProfessional && (
              <div className="relative">
                <ClinicalTooltip helpId="btn_seletor_profissional" position="bottom">
                  <button
                    onClick={() => setProfDropdownOpen(!profDropdownOpen)}
                    aria-label="Perfil e função ativa no sistema"
                    className="flex items-center space-x-2 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                      ROLE_METADATA[currentProfessional.role]?.badgeBg || 'bg-slate-200 text-slate-800'
                    }`}>
                      {currentProfessional?.avatarInitials || (currentProfessional?.name ? currentProfessional.name.slice(0, 2).toUpperCase() : 'PR')}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1">
                        <span>{(currentProfessional?.name || 'Profissional').split(' ')[0]} {(currentProfessional?.name || '').split(' ')[1] || ''}</span>
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
                </ClinicalTooltip>

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
            <ClinicalTooltip helpId="btn_whatsapp" position="left">
              <button
                onClick={onShareWhatsApp}
                aria-label="Compartilhar resumo da consulta no WhatsApp do paciente"
                className="p-2 sm:px-3 sm:py-1.5 rounded-l-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden md:inline">Enviar WhatsApp</span>
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={showWhatsappGif}
                aria-label={
                  showWhatsappGif
                    ? 'Desativar GIF abaixo do Enviar WhatsApp'
                    : 'Ativar GIF abaixo do Enviar WhatsApp'
                }
                title={
                  showWhatsappGif
                    ? 'GIF ativo — clique para desativar'
                    : 'GIF desativado — clique para ativar'
                }
                onClick={handleToggleWhatsappGif}
                className={`self-stretch px-2 py-1.5 rounded-r-lg border border-l-0 border-emerald-300 dark:border-emerald-800 text-[10px] font-bold transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  showWhatsappGif
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    showWhatsappGif ? 'bg-white' : 'bg-slate-400'
                  }`}
                />
                <span>GIF</span>
              </button>

              {showWhatsappGif && (
                <div
                  ref={gifContainerRef}
                  onFocus={(e) => e.stopPropagation()}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch' && !isDraggingGif) setGifZoomed(true);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== 'touch' && !isDraggingGif) setGifZoomed(false);
                  }}
                  style={
                    totalGifX !== 0 || totalGifY !== 0
                      ? { transform: `translate3d(${totalGifX}px, ${totalGifY}px, 0)` }
                      : undefined
                  }
                  className={`absolute top-full mt-1.5 bg-white dark:bg-slate-900 border rounded-xl flex flex-col items-center touch-none max-h-[calc(100dvh-5rem)] overflow-y-auto ${
                    isDraggingGif
                      ? 'transition-none select-none cursor-grabbing ring-2 ring-emerald-500/40'
                      : 'transition-[width,padding,box-shadow,border-color] duration-200 ease-out'
                  } ${
                    gifZoomed
                      ? 'right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-50 p-2.5 border-emerald-400 dark:border-emerald-700 shadow-2xl w-[min(86vw,17rem)] sm:w-64 max-w-[calc(100vw-1rem)]'
                      : 'right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-40 p-1.5 border-emerald-200 dark:border-emerald-800 shadow-lg w-20 sm:w-20 max-w-[calc(100vw-1rem)]'
                  }`}
                >
                  {/* Barra de arraste manual (desktop, mobile & teclado) */}
                  <div
                    role="region"
                    tabIndex={0}
                    aria-label="Mover posição do GIF (arraste ou use as setas do teclado; Home centraliza)"
                    onKeyDown={handleGifKeyMove}
                    onPointerDown={handleGifDragStart}
                    onPointerMove={handleGifDragMove}
                    onPointerUp={handleGifDragEnd}
                    onPointerCancel={handleGifDragEnd}
                    title="Arraste para mover o GIF manualmente (ou use as setas do teclado)"
                    className={`w-full flex items-center justify-between gap-1.5 select-none touch-none rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDraggingGif ? 'cursor-grabbing' : 'cursor-grab'
                    } ${
                      gifZoomed
                        ? 'pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800'
                        : 'py-0.5 px-1 mb-1 bg-slate-50 dark:bg-slate-800/70 justify-center'
                    }`}
                  >
                    {gifZoomed ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 truncate">
                          <Move className="w-3 h-3 shrink-0" />
                          <span>Mover / Enviar WhatsApp</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {(gifOffset.x !== 0 || gifOffset.y !== 0) && (
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetGifPosition();
                              }}
                              title="Centralizar GIF abaixo do WhatsApp"
                              aria-label="Centralizar posição do GIF"
                              className="p-0.5 rounded text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setGifZoomed(false);
                            }}
                            aria-label="Fechar ampliação do GIF"
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                        <Move className="w-2.5 h-2.5 shrink-0" />
                        <span>Mover</span>
                      </div>
                    )}
                  </div>

                  {/* Imagem do GIF (toque para ampliar no mobile, ou arraste diretamente para mover) */}
                  <button
                    type="button"
                    onPointerDown={handleGifDragStart}
                    onPointerMove={handleGifDragMove}
                    onPointerUp={handleGifDragEnd}
                    onPointerCancel={handleGifDragEnd}
                    onClick={() => {
                      if (suppressNextClickRef.current) return;
                      if (!gifZoomed) {
                        setGifZoomed(true);
                      } else {
                        setGifZoomed(false);
                        onShareWhatsApp();
                      }
                    }}
                    title={
                      gifZoomed
                        ? 'Clique para enviar resumo no WhatsApp (ou arraste para mover)'
                        : 'Toque para ampliar ou arraste para mover'
                    }
                    aria-label={
                      gifZoomed
                        ? 'GIF ampliado — toque para enviar resumo no WhatsApp'
                        : 'Ampliar ou mover GIF do WhatsApp'
                    }
                    className={`rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-center bg-slate-50/60 dark:bg-slate-950/40 touch-none ${
                      isDraggingGif ? 'cursor-grabbing' : 'cursor-pointer'
                    }`}
                  >
                    <img
                      src="/assets/whatsapp-action.gif"
                      alt="Atalho animado para Enviar WhatsApp"
                      draggable={false}
                      className={`object-contain block transition-all duration-200 select-none pointer-events-none ${
                        gifZoomed ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-14 h-14 sm:w-16 sm:h-16'
                      }`}
                    />
                  </button>

                  {gifZoomed ? (
                    <div className="w-full mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setGifZoomed(false);
                          onShareWhatsApp();
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Enviar agora
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleWhatsappGif}
                        className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                      >
                        Desativar
                      </button>
                    </div>
                  ) : (
                    <div className="w-full mt-1 flex items-center justify-between gap-1">
                      {(gifOffset.x !== 0 || gifOffset.y !== 0) && (
                        <button
                          type="button"
                          onClick={handleResetGifPosition}
                          title="Centralizar GIF"
                          aria-label="Centralizar posição do GIF"
                          className="p-0.5 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleToggleWhatsappGif}
                        className="flex-1 py-0.5 px-1 rounded text-[9px] font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap text-center"
                      >
                        Desativar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </ClinicalTooltip>

            {/* Export Printable Clinical Report */}
            <ClinicalTooltip helpId="btn_laudo_completo" position="bottom">
              <button
                onClick={onOpenLaudo}
                aria-label="Gerar e imprimir Laudo Clínico Completo"
                className="px-3.5 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003b1e] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white transition-colors flex items-center space-x-2 text-xs font-semibold shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Laudo Completo</span>
              </button>
            </ClinicalTooltip>
          </div>

        </div>
      </div>
    </header>
  );
};
