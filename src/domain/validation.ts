/**
 * Clinical Validation Layer
 * Highlights values outside physiological expected ranges.
 */

import { BiologicalSex } from '../types';

export type ValidationStatus = 'normal' | 'warning' | 'critical';

export interface ValidationFeedback {
  status: ValidationStatus;
  message?: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  iconColor: string;
}

/**
 * Body Fat Percentage (%G) Validation
 * Based on American Council on Exercise (ACE) & WHO
 */
export function validateBodyFat(bf: number, sex: BiologicalSex): ValidationFeedback {
  const essential = sex === 'male' ? 2 : 10;
  const high = sex === 'male' ? 25 : 32;
  const veryHigh = sex === 'male' ? 30 : 38;

  if (bf < essential) {
    return {
      status: 'critical',
      message: 'Gordura essencial crítica. Risco de disfunção hormonal.',
      colorClass: 'text-amber-800',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-400',
      iconColor: 'text-amber-600'
    };
  }

  if (bf > veryHigh) {
    return {
      status: 'critical',
      message: 'Obesidade. Elevado risco cardiometabólico.',
      colorClass: 'text-rose-800',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-400',
      iconColor: 'text-rose-600'
    };
  }

  if (bf > high) {
    return {
      status: 'warning',
      message: 'Acima da média saudável (Sobrepeso).',
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      iconColor: 'text-amber-500'
    };
  }

  return {
    status: 'normal',
    colorClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    iconColor: 'text-emerald-600'
  };
}

/**
 * Phase Angle (Ângulo de Fase) Validation
 * Clinical indicator of cellular health and integrity.
 */
export function validatePhaseAngle(pa: number): ValidationFeedback {
  if (pa < 4.5) {
    return {
      status: 'critical',
      message: 'Ângulo de fase crítico. Integridade celular comprometida.',
      colorClass: 'text-rose-800',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-400',
      iconColor: 'text-rose-600'
    };
  }

  if (pa < 5.5) {
    return {
      status: 'warning',
      message: 'Abaixo do ideal. Atenção à saúde celular e inflamação.',
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      iconColor: 'text-amber-500'
    };
  }

  return {
    status: 'normal',
    colorClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    iconColor: 'text-emerald-600'
  };
}

/**
 * Edema Index (ECW/TBW) Validation
 * Indicator of water retention or inflammatory state.
 */
export function validateEdemaIndex(index: number): ValidationFeedback {
  if (index > 0.400) {
    return {
      status: 'critical',
      message: 'Retenção hídrica severa (Edema/Inflamação).',
      colorClass: 'text-rose-800',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-400',
      iconColor: 'text-rose-600'
    };
  }

  if (index > 0.390) {
    return {
      status: 'warning',
      message: 'Retenção leve. Possível estado inflamatório.',
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      iconColor: 'text-amber-500'
    };
  }

  return {
    status: 'normal',
    colorClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    iconColor: 'text-emerald-600'
  };
}

/**
 * Waist-to-Hip Ratio (RCQ) Risk Highlight
 */
export function getRCQHighlight(category: string): ValidationFeedback {
  switch (category) {
    case 'ALTO':
      return {
        status: 'warning',
        message: 'Risco cardiovascular aumentado.',
        colorClass: 'text-amber-800',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-400',
        iconColor: 'text-amber-600'
      };
    case 'MUITO ALTO':
      return {
        status: 'critical',
        message: 'Risco cardiovascular MUITO elevado.',
        colorClass: 'text-rose-800',
        bgClass: 'bg-rose-50',
        borderClass: 'border-rose-400',
        iconColor: 'text-rose-600'
      };
    default:
      return {
        status: 'normal',
        colorClass: 'text-emerald-800',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
        iconColor: 'text-emerald-600'
      };
  }
}
