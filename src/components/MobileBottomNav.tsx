import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Pill, 
  Menu,
  Apple
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { InfoHelpButton } from './help/InfoHelpButton';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSidebar
}) => {
  const primaryTabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: CalendarDays },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'prescricoes', label: 'Receitas', icon: Pill },
    { id: 'dietas', label: 'Dietas', icon: Apple }
  ];

  return (
    <nav 
      aria-label="Navegação Rápida Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg safe-area-pb"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {primaryTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div key={tab.id} className="relative flex flex-col items-center">
              <button
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-[#004f28] dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div className={`p-1 rounded-md relative ${isActive ? 'bg-[#004f28]/10 dark:bg-emerald-500/20' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>

              {/* Discreet Mobile Info Trigger when tab is active */}
              {isActive && (
                <div className="absolute -top-1 -right-1">
                  <InfoHelpButton
                    helpId={tab.id}
                    size="xs"
                    variant="emerald"
                    withTooltip={false}
                    title={`Guia clínico de ${tab.label}`}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Menu More / Todos os Módulos */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all"
        >
          <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800">
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
