import React from 'react';
import { Info } from 'lucide-react';
import { useClinicalHelp } from '../../context/ClinicalHelpContext';
import { ClinicalTooltip } from './ClinicalTooltip';

interface InfoHelpButtonProps {
  helpId: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'subtle' | 'ghost' | 'emerald' | 'sidebar' | 'header';
  title?: string;
  className?: string;
  withTooltip?: boolean;
  as?: 'button' | 'span';
}

export const InfoHelpButton: React.FC<InfoHelpButtonProps> = ({
  helpId,
  size = 'sm',
  variant = 'subtle',
  title,
  className = '',
  withTooltip = true,
  as = 'button'
}) => {
  const { openHelp, registry } = useClinicalHelp();
  const item = registry[helpId];

  const sizeClasses = {
    xs: 'w-4 h-4 p-0 text-[10px]',
    sm: 'w-5 h-5 p-0.5 text-xs',
    md: 'w-6 h-6 p-1 text-sm'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  };

  const variantClasses = {
    subtle: 'text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-full transition-colors',
    emerald: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-full transition-colors',
    sidebar: 'text-slate-400 group-hover:text-slate-200 hover:bg-slate-800/90 rounded-md transition-colors',
    header: 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openHelp(helpId);
  };

  const commonProps = {
    onClick: handleClick,
    'aria-label': `Ver explicação detalhada sobre ${item?.title || title || 'esta funcionalidade'}`,
    title: title || `Ver explicação detalhada: ${item?.title || ''}`,
    className: `inline-flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  };

  const buttonElement = as === 'span' ? (
    <span
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      {...commonProps}
    >
      <Info className={`${iconSizes[size]} shrink-0`} />
    </span>
  ) : (
    <button
      type="button"
      {...commonProps}
    >
      <Info className={`${iconSizes[size]} shrink-0`} />
    </button>
  );

  if (!withTooltip || !item) {
    return buttonElement;
  }

  return (
    <ClinicalTooltip helpId={helpId} position="auto">
      {buttonElement}
    </ClinicalTooltip>
  );
};
