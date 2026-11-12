import React from 'react';
import {
  CalendarDays,
  UtensilsCrossed,
  Activity,
  Zap,
  Scale,
  HeartPulse,
  Camera,
  FileSpreadsheet,
  FileText,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  LayoutDashboard,
  UserPlus,
  Settings,
  Baby,
  Users,
  Lock,
  Smartphone,
  Pill,
  GraduationCap,
  BarChart3,
  TrendingUp,
  Calculator,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Droplet,
  FlaskConical
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'prontuario'
  | 'dashboard_admin'
  | 'financeiro'
  | 'meu_professor'
  | 'agenda'
  | 'sms_lembretes'
  | 'documentos'
  | 'prescricoes'
  | 'formulacao_magistral'
  | 'dietas'
  | 'pediatria'
  | 'calculadora_macros'
  | 'dobras'
  | 'bioimpedancia'
  | 'rcq'
  | 'pescoco'
  | 'fotos'
  | 'anvisa'
  | 'relatorio_evolutivo'
  | 'exames_suplementos'
  | 'hemo_intelligence'
  | 'pacientes'
  | 'profissionais'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  collapsedMobile: boolean;
  onCloseMobile: () => void;
  currentRole?: UserRole;
  isCollapsedDesktop?: boolean;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsedMobile,
  onCloseMobile,
  isCollapsedDesktop = false
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard de Progresso',
      sublabel: 'Visão Geral do Paciente',
      icon: LayoutDashboard,
      badge: 'Geral',
      highlight: true
    },
    {
      id: 'prontuario',
      label: 'Prontuário Eletrônico (PEN)',
      sublabel: 'Central Clínica & IA',
      icon: Stethoscope,
      badge: 'PEN',
      highlight: true
    },
    {
      id: 'dashboard_admin',
      label: 'Gestão & Indicadores ADM',
      sublabel: 'Faturamento, Metas & Volume',
      icon: BarChart3,
      badge: 'ADM',
      highlight: true
    },
    {
      id: 'financeiro',
      label: 'Módulo Financeiro',
      sublabel: 'Caixa, DRE, Recibos & IR',
      icon: DollarSign,
      badge: 'R$',
      highlight: true
    },
    {
      id: 'meu_professor',
      label: 'Meu Professor (IA)',
      sublabel: 'Tutor, Feynman & Flashcards',
      icon: GraduationCap,
      badge: 'Skill',
      highlight: true
    },
    {
      id: 'agenda',
      label: 'Agenda Clínica',
      sublabel: 'Consultas, Retornos & Exames',
      icon: CalendarDays,
      badge: 'Ativo',
      highlight: false
    },
    {
      id: 'sms_lembretes',
      label: 'Lembretes SMS Automáticos',
      sublabel: 'Gateway Twilio & Templates',
      icon: Smartphone,
      badge: 'SMS',
      highlight: true
    },
    {
      id: 'documentos',
      label: 'Central de Documentos',
      sublabel: 'Relatórios, Declarações & Recibos',
      icon: FileText,
      badge: 'Hub',
      highlight: true
    },
    {
      id: 'prescricoes',
      label: 'Gerador de Prescrições',
      sublabel: 'Suplementos, Fitoterápicos & PDF',
      icon: Pill,
      badge: 'Receituário',
      highlight: true
    },
    {
      id: 'formulacao_magistral',
      label: 'Formulação Magistral',
      sublabel: '50 Protocolos, ADME & IA',
      icon: FlaskConical,
      badge: 'CFN',
      highlight: true
    },
    {
      id: 'dietas',
      label: 'Dietas & Rastreamento',
      sublabel: 'TMB, Macros g/kg & Diário',
      icon: UtensilsCrossed,
      badge: 'Principal',
      highlight: false
    },
    {
      id: 'pediatria',
      label: 'Curvas Pediátricas OMS',
      sublabel: 'Escore-Z, LMS & SISVAN',
      icon: Baby,
      badge: 'Novo',
      highlight: true
    },
    {
      id: 'dobras',
      label: 'Dobras Cutâneas ISAK',
      sublabel: '7 Dobras, Siri & Brozek',
      icon: Activity
    },
    {
      id: 'calculadora_macros',
      label: 'Calculadora de Macros',
      sublabel: 'TMB, GET & Simulação g/kg',
      icon: Calculator,
      badge: 'Quick',
      highlight: true
    },
    {
      id: 'bioimpedancia',
      label: 'Bioimpedância 4C',
      sublabel: 'Ângulo Fase 7.2°, Segmentar',
      icon: Zap
    },
    {
      id: 'rcq',
      label: 'Avaliação RCQ',
      sublabel: 'Cintura-Quadril & Androide',
      icon: Scale
    },
    {
      id: 'pescoco',
      label: 'Risco Cardiometabólico',
      sublabel: 'Pescoço, Jamar & FMR',
      icon: HeartPulse
    },
    {
      id: 'fotos',
      label: 'Fotogrametria T0/T1',
      sublabel: 'Ghosting, Recomposição & Deltas',
      icon: Camera
    },
    {
      id: 'anvisa',
      label: 'Tabela ANVISA',
      sublabel: 'RDC 429/2020 & Lupa Frontal',
      icon: FileSpreadsheet
    },
    {
      id: 'relatorio_evolutivo',
      label: 'Relatório Evolutivo',
      sublabel: 'Gráficos, Tendências & Metas',
      icon: TrendingUp,
      badge: 'BI',
      highlight: true
    },
    {
      id: 'exames_suplementos',
      label: 'Exames & Suplementos',
      sublabel: 'Requisição & Posologia Clínica',
      icon: Stethoscope
    },
    {
      id: 'hemo_intelligence',
      label: 'Hemo Intelligence Pro',
      sublabel: 'RX Completo do Hemograma',
      icon: Droplet,
      badge: 'IA',
      highlight: true
    },
    {
      id: 'pacientes',
      label: 'Cadastrar Paciente',
      sublabel: 'Novo Prontuário',
      icon: UserPlus
    },
    {
      id: 'profissionais',
      label: 'Profissionais & Permissões',
      sublabel: 'Nutri, Médico, Recepção & ADM',
      icon: Users,
      badge: 'RBAC',
      highlight: true
    },
    {
      id: 'settings',
      label: 'Configurações',
      sublabel: 'Sistema & Governança',
      icon: Settings
    }
  ];

  const [isHovered, setIsHovered] = React.useState(false);
  const effectivelyCollapsed = isCollapsedDesktop && !isHovered;

  return (
    <>
      {/* Mobile backdrop */}
      {!collapsedMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-16 bottom-0 left-0 bg-slate-900 text-slate-200 z-40 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          collapsedMobile ? '-translate-x-full' : 'translate-x-0'
        } ${
          effectivelyCollapsed ? 'lg:w-16' : 'lg:w-64'
        } w-64 flex flex-col border-r border-slate-800 shadow-xl`}
      >
        {/* Navigation Category Label */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-800/80 flex items-center justify-between min-h-[36px]">
          {!effectivelyCollapsed ? (
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
              Módulos de Avaliação
            </span>
          ) : (
            <div className="w-full text-center">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500">AUTO</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full group text-left rounded-lg flex items-center transition-all relative ${
                  isCollapsedDesktop ? 'justify-center py-2.5 px-0' : 'px-3 py-2.5 justify-between'
                } ${
                  isActive
                    ? 'bg-[#004f28] text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                {/* Icon and label container */}
                <div className={`flex items-center space-x-3 ${effectivelyCollapsed ? 'justify-center' : 'min-w-0'}`}>
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!effectivelyCollapsed && (
                    <div className="truncate">
                      <div className="text-xs truncate flex items-center space-x-1.5">
                        <span>{item.label}</span>
                        {item.highlight && !isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-emerald-100/80' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  )}
                </div>

                {!effectivelyCollapsed && (
                  <div className="shrink-0 flex items-center space-x-1 ml-1.5">
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </div>
                )}

                {/* Floating Tooltip for Mini Collapsed Mode */}
                {effectivelyCollapsed && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-900 text-white rounded-lg p-2.5 shadow-2xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none min-w-[190px] animate-in fade-in slide-in-from-left-2 duration-150">
                    <div className="text-xs font-bold text-slate-100 flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-300/80 font-sans mt-0.5">{item.sublabel}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info box: Clinical Norms & Standards */}
        {!effectivelyCollapsed ? (
          <div className="p-3 m-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-300 text-xs">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Padrões Ativos</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 uppercase bg-emerald-950 px-1 rounded border border-emerald-800/60">
                Auto
              </span>
            </div>
            <ul className="space-y-0.5 text-[10px] font-mono text-slate-400">
              <li>• ISAK II (1996 / 2001)</li>
              <li>• ANVISA RDC 429/20 & IN 75/20</li>
              <li>• Tabela TACO / NEPA Unicamp</li>
              <li>• Diretriz SBD & SBC 2023</li>
            </ul>
          </div>
        ) : (
          <div className="p-2 m-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-center relative group">
            <Sparkles className="w-4 h-4 text-emerald-400 mx-auto" />
            <div className="absolute left-14 bottom-2 hidden group-hover:block bg-slate-900 text-white rounded-lg p-3 shadow-2xl border border-slate-700 text-left z-50 pointer-events-none w-52 animate-in fade-in slide-in-from-left-2 duration-150">
              <div className="text-xs font-bold text-slate-200 mb-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                <span>Padrões Clínicos Ativos</span>
              </div>
              <ul className="space-y-0.5 text-[10px] font-mono text-slate-300">
                <li>• ISAK II (1996 / 2001)</li>
                <li>• ANVISA RDC 429/20 & IN 75/20</li>
                <li>• Tabela TACO / NEPA Unicamp</li>
                <li>• Diretriz SBD & SBC 2023</li>
              </ul>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
