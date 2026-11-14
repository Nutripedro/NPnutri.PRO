import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  Target, 
  Lightbulb, 
  ArrowRight, 
  Search, 
  Sparkles,
  BookOpen,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { useClinicalHelp } from '../../context/ClinicalHelpContext';
import { CLINICAL_HELP_REGISTRY, ClinicalHelpItem } from '../../data/clinicalHelpRegistry';

export const ClinicalHelpModal: React.FC = () => {
  const { 
    isHelpModalOpen, 
    activeHelpItem, 
    closeHelp, 
    openHelp,
    onNavigateToTab 
  } = useClinicalHelp();

  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHelpModalOpen) {
        closeHelp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpModalOpen, closeHelp]);

  // Focus trap / auto-focus
  useEffect(() => {
    if (isHelpModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
    setSearchTerm('');
  }, [isHelpModalOpen, activeHelpItem]);

  if (!isHelpModalOpen || !activeHelpItem) return null;

  // Filter registry items if user types in search
  const filteredList = searchTerm.trim()
    ? Object.values(CLINICAL_HELP_REGISTRY).filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleNavigateToFeature = () => {
    if (activeHelpItem.targetTab && onNavigateToTab) {
      onNavigateToTab(activeHelpItem.targetTab);
      closeHelp();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeHelp}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 focus:outline-none"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#004f28] text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                  {activeHelpItem.category}
                </span>
                {activeHelpItem.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    {activeHelpItem.badge}
                  </span>
                )}
              </div>
              <h2 id="help-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {activeHelpItem.title}
              </h2>
            </div>
          </div>

          <button
            onClick={closeHelp}
            aria-label="Fechar guia informativo"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search & Switcher Bar */}
        <div className="px-5 py-2.5 bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 shrink-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar outra funcionalidade, botão ou menu..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Search Results Dropdown List if typing */}
        {searchTerm.trim().length > 0 && (
          <div className="px-5 py-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.length > 0 ? (
              filteredList.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    openHelp(item.id);
                    setSearchTerm('');
                  }}
                  className="w-full text-left py-2 px-1 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded transition-colors group cursor-pointer"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {item.title}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.shortDescription}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {item.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="py-3 text-center text-xs text-slate-400">
                Nenhuma funcionalidade encontrada para "{searchTerm}".
              </div>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          
          {/* Section 1: O que ela faz */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>O que ela faz</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              {activeHelpItem.whatItDoes}
            </p>
          </div>

          {/* Section 2: Para que serve */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Para que serve</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              {activeHelpItem.purpose}
            </p>
          </div>

          {/* Section 3: Como utilizar (passo a passo) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Bookmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Como utilizar</span>
            </div>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              {activeHelpItem.howToUse.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-[#004f28]/10 text-[#004f28] dark:bg-emerald-500/20 dark:text-emerald-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Benefícios para o nutricionista */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Benefícios para o nutricionista</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeHelpItem.benefits.map((benefit, idx) => (
                <div 
                  key={idx}
                  className="flex items-start space-x-2 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#004f28] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Exemplo prático de utilização */}
          {activeHelpItem.practicalExample && (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Exemplo prático de consulta</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-slate-800 dark:text-amber-100 leading-relaxed font-sans italic">
                "{activeHelpItem.practicalExample}"
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span>Dica: Pressione</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">Esc</kbd>
            <span>para fechar</span>
          </div>

          <div className="flex items-center space-x-2">
            {activeHelpItem.targetTab && onNavigateToTab && (
              <button
                onClick={handleNavigateToFeature}
                className="px-3.5 py-2 rounded-lg bg-[#004f28] hover:bg-[#003b1e] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Acessar {activeHelpItem.title.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={closeHelp}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
