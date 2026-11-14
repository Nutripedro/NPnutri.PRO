import React, { useState, useRef, useEffect } from 'react';
import { CLINICAL_HELP_REGISTRY, ClinicalHelpItem } from '../../data/clinicalHelpRegistry';
import { useClinicalHelp } from '../../context/ClinicalHelpContext';
import { HelpCircle, ChevronRight } from 'lucide-react';

interface ClinicalTooltipProps {
  helpId?: string;
  customTitle?: string;
  customDescription?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const ClinicalTooltip: React.FC<ClinicalTooltipProps> = ({
  helpId,
  customTitle,
  customDescription,
  position = 'auto',
  delay = 200,
  children,
  className = '',
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const triggerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { registry, openHelp } = useClinicalHelp();

  const item: ClinicalHelpItem | undefined = helpId ? registry[helpId] : undefined;
  const title = customTitle || item?.title;
  const description = customDescription || item?.shortDescription;

  // Don't render tooltip on touch-only mobile devices if hovering isn't standard
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 260;
    const tooltipHeight = 110;
    const padding = 8;

    let targetPos = position;
    if (position === 'auto') {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.right;
      if (spaceBelow < tooltipHeight + 20 && rect.top > tooltipHeight + 20) {
        targetPos = 'top';
      } else if (spaceRight < tooltipWidth + 20 && rect.left > tooltipWidth + 20) {
        targetPos = 'left';
      } else {
        targetPos = 'bottom';
      }
    }

    let top = 0;
    let left = 0;

    switch (targetPos) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
    }

    // Boundary check
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }
    if (top < 10) top = 10;
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = window.innerHeight - tooltipHeight - 10;
    }

    setCoords({ top, left });
    setActualPosition(targetPos as any);
  };

  const handleMouseEnter = () => {
    if (disabled || (!title && !description)) return;
    timerRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={`relative inline-flex items-center ${className}`}
    >
      {children}

      {/* Floating Tooltip Window */}
      {isVisible && (title || description) && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999
          }}
          className="w-64 p-3 rounded-lg bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-slate-100 shadow-xl border border-slate-700/80 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          {title && (
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {title}
              </span>
              {item?.badge && (
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded">
                  {item.badge}
                </span>
              )}
            </div>
          )}

          {description && (
            <p className="text-[11px] leading-relaxed text-slate-300 font-sans line-clamp-3">
              {description}
            </p>
          )}

          {helpId && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-emerald-400 font-medium">
              <span>Toque em ⓘ para o guia clínico</span>
              <ChevronRight className="w-3 h-3 text-emerald-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
