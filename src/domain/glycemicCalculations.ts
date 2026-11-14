/**
 * Funções puras de cálculo e classificação de Índice Glicêmico (IG) e Carga Glicêmica (CG).
 *
 * Fontes científicas de referência:
 * - Jenkins DJA et al. Glycemic index of foods: a physiological basis for carbohydrate exchange.
 *   Am J Clin Nutr. 1981;34(3):362-366.
 * - Salmerón J et al. Dietary fiber, glycemic load, and risk of NIDDM in men. Diabetes Care. 1997.
 * - Atkinson FS, Foster-Powell K, Brand-Miller JC. International Tables of Glycemic Index and
 *   Glycemic Load Values: 2008. Diabetes Care. 2008;31(12):2281-2283.
 * - Atkinson FS et al. International Tables of Glycemic Index and Glycemic Load Values 2021:
 *   a systematic review. Am J Clin Nutr. 2021;114(5):1625-1632.
 * - Referência complementar de tabela clínica: Glycemic-Index.net (University of Sydney GI Database).
 */

export type GlycemicLevel = 'low' | 'medium' | 'high';

export interface GlycemicClassificationMeta {
  level: GlycemicLevel;
  label: string;
  shortLabel: string;
  rangeDescription: string;
}

/**
 * Classifica o Índice Glicêmico (escala Glicose = 100).
 * Critério internacional padrão (Atkinson et al., 2008/2021):
 * - Baixo IG: <= 55
 * - Médio IG: 56 a 69
 * - Alto IG: >= 70
 */
export function classifyGlycemicIndex(gi: number): GlycemicClassificationMeta {
  const safeGi = Number.isFinite(gi) ? Math.max(0, gi) : 0;

  if (safeGi <= 55) {
    return {
      level: 'low',
      label: 'Baixo IG',
      shortLabel: 'Baixo',
      rangeDescription: '0 – 55'
    };
  }

  if (safeGi <= 69) {
    return {
      level: 'medium',
      label: 'Médio IG',
      shortLabel: 'Moderado',
      rangeDescription: '56 – 69'
    };
  }

  return {
    level: 'high',
    label: 'Alto IG',
    shortLabel: 'Alto',
    rangeDescription: '≥ 70'
  };
}

/**
 * Calcula a Carga Glicêmica (CG) para uma porção específica.
 * Fórmula: CG = (IG × Carboidratos disponíveis na porção [g]) / 100
 *
 * @param gi Índice Glicêmico do alimento (0–100+)
 * @param availableCarbsG Quantidade de carboidratos disponíveis na porção (em gramas)
 * @returns Carga glicêmica arredondada para 1 casa decimal
 */
export function calculateGlycemicLoad(gi: number, availableCarbsG: number): number {
  if (!Number.isFinite(gi) || !Number.isFinite(availableCarbsG)) return 0;
  const safeGi = Math.max(0, gi);
  const safeCarbs = Math.max(0, availableCarbsG);
  return Math.round(((safeGi * safeCarbs) / 100) * 10) / 10;
}

/**
 * Classifica a Carga Glicêmica (CG) por porção.
 * Critério internacional padrão (University of Sydney / glycemic-index.net):
 * - Baixa CG: <= 10
 * - Média CG: > 10 e < 20 (11 – 19 na tabela inteira)
 * - Alta CG: >= 20
 */
export function classifyGlycemicLoad(gl: number): GlycemicClassificationMeta {
  const safeGl = Number.isFinite(gl) ? Math.max(0, gl) : 0;

  if (safeGl <= 10) {
    return {
      level: 'low',
      label: 'Baixa CG',
      shortLabel: 'Baixa',
      rangeDescription: '0 – 10'
    };
  }

  if (safeGl < 20) {
    return {
      level: 'medium',
      label: 'Média CG',
      shortLabel: 'Média',
      rangeDescription: '11 – 19'
    };
  }

  return {
    level: 'high',
    label: 'Alta CG',
    shortLabel: 'Alta',
    rangeDescription: '≥ 20'
  };
}

/**
 * Calcula dinamicamente os carboidratos e a Carga Glicêmica para uma gramatura customizada
 * com base nos dados da porção de referência do alimento.
 */
export function calculatePortionGlycemicMetrics(params: {
  glycemicIndex: number;
  standardServingG: number;
  carbsPerServingG: number;
  fiberPerServingG: number;
  customGrams: number;
}): {
  grams: number;
  carbsG: number;
  fiberG: number;
  glycemicLoad: number;
  giClass: GlycemicClassificationMeta;
  glClass: GlycemicClassificationMeta;
} {
  const safeStandardG = Math.max(1, Number.isFinite(params.standardServingG) ? params.standardServingG : 100);
  const safeCustomG = Math.max(1, Math.min(2000, Number.isFinite(params.customGrams) ? params.customGrams : safeStandardG));
  const factor = safeCustomG / safeStandardG;

  const carbsG = Math.round(Math.max(0, params.carbsPerServingG) * factor * 10) / 10;
  const fiberG = Math.round(Math.max(0, params.fiberPerServingG) * factor * 10) / 10;
  const glycemicLoad = calculateGlycemicLoad(params.glycemicIndex, carbsG);

  return {
    grams: safeCustomG,
    carbsG,
    fiberG,
    glycemicLoad,
    giClass: classifyGlycemicIndex(params.glycemicIndex),
    glClass: classifyGlycemicLoad(glycemicLoad)
  };
}
