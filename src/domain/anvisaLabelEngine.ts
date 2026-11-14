import {
  AnvisaAuditIssue,
  AnvisaFoodEntry,
  CalculatedRecipeResult,
  FormattedAnvisaRow,
  LupaWarningResult,
  MeasureUnit,
  NutrientProfile100g,
  PhysicalState,
  RecipeIngredientLine,
  RegulatoryNutrientCheckItem,
  RegulatoryNutrientStatus,
  RegulatoryRuleEntry,
  TechnicalSheetRecipe
} from '../types/nutritionLabel';

/**
 * NUTRITION LABEL AI — Motor Matemático Determinístico & Regras Regulatórias ANVISA
 *
 * Fontes Oficiais:
 * - RDC ANVISA nº 429, de 8 de outubro de 2020 (Rotulagem Nutricional de Alimentos Embalados)
 * - IN ANVISA nº 75, de 8 de outubro de 2020 (Requisitos Técnicos para Declaração, VDR, Arredondamento Anexo IV e Lupa Anexo XV)
 * - RDC ANVISA nº 727, de 1º de julho de 2022 (Lista de Ingredientes em ordem decrescente de massa)
 * - RDC ANVISA nº 26, de 2 de julho de 2015 (Alergênicos)
 * - Lei Federal nº 10.674/2003 (Obrigatoriedade de declaração de Glúten)
 * - RDC ANVISA nº 136/2017 (Declaração de Lactose > 100 mg / 100 g)
 */

export const IN75_VDR = {
  energyKcal: 2000,
  carbsG: 300,
  totalSugarsG: null as null, // IN 75/2020 Anexo II: Não possui VDR estabelecido
  addedSugarsG: 50,
  proteinG: 50,
  totalFatG: 65,
  saturatedFatG: 20,
  transFatG: null as null, // IN 75/2020 Anexo II: VDR não estabelecido (declarar ** ou vazio conforme modelo)
  fiberG: 25,
  sodiumMg: 2000
} as const;

export const ANVISA_REGULATORY_RULES: RegulatoryRuleEntry[] = [
  {
    id: 'RDC429-ART3',
    norma: 'RDC ANVISA nº 429/2020',
    artigoAnexo: 'Art. 3º e Art. 4º',
    titulo: 'Definição de Açúcares Totais e Adicionados',
    regraResumo:
      'Açúcares adicionados incluem todos os monossacarídeos e dissacarídeos adicionados durante o processamento, incluindo mel, xaropes, açúcares de coco/mascavo e sucos concentrados adicionados para dulçor.',
    vigencia: 'Vigente desde 09/10/2022',
    versao: '2020.1'
  },
  {
    id: 'IN75-ANEXO-II',
    norma: 'IN ANVISA nº 75/2020',
    artigoAnexo: 'Anexo II',
    titulo: 'Valores Diários de Referência (VDR)',
    regraResumo:
      'Base 2.000 kcal: Carboidratos 300 g, Açúcares adicionados 50 g, Proteínas 50 g, Gorduras totais 65 g, Gorduras saturadas 20 g, Fibras alimentares 25 g, Sódio 2.000 mg. Açúcares totais e gorduras trans não possuem %VD.',
    vigencia: 'Vigente desde 09/10/2022',
    versao: '2020.1'
  },
  {
    id: 'IN75-ANEXO-IV',
    norma: 'IN ANVISA nº 75/2020',
    artigoAnexo: 'Anexo IV',
    titulo: 'Regras de Arredondamento e Valores Não Significativos',
    regraResumo:
      'Valores ≥ 10: inteiro mais próximo; < 10: 1 casa decimal (exceto kcal/sódio conforme limiar). Valores não significativos por porção e 100g: Energia ≤ 4 kcal, Carboidratos/Proteínas/Gorduras Totais/Açúcares/Fibras ≤ 0,5 g, Saturadas/Trans ≤ 0,2 g, Sódio ≤ 5 mg devem ser declarados como "0".',
    vigencia: 'Vigente desde 09/10/2022',
    versao: '2020.1'
  },
  {
    id: 'IN75-ANEXO-XV',
    norma: 'RDC 429/2020 & IN 75/2020',
    artigoAnexo: 'Anexo XV',
    titulo: 'Rotulagem Nutricional Frontal (Lupa "ALTO EM")',
    regraResumo:
      'Sólidos/semissólidos (por 100 g): Açúcar adicionado ≥ 15 g | Gordura saturada ≥ 6 g | Sódio ≥ 600 mg. Líquidos (por 100 ml): Açúcar adicionado ≥ 7,5 g | Gordura saturada ≥ 3 g | Sódio ≥ 300 mg.',
    vigencia: 'Vigente desde 09/10/2022',
    versao: '2020.1'
  },
  {
    id: 'RDC429-ANEXO-XXIII',
    norma: 'RDC ANVISA nº 429/2020',
    artigoAnexo: 'Art. 11 / Fatores Atwater',
    titulo: 'Fatores de Conversão Energética',
    regraResumo:
      'Carboidratos 4 kcal/g (17 kJ/g), Proteínas 4 kcal/g (17 kJ/g), Gorduras totais 9 kcal/g (37 kJ/g), Álcool 7 kcal/g, Polióis 2,4 kcal/g, Fibras solúveis/alimentares (quando aplicável) 2 kcal/g. 1 kcal = 4,184 kJ.',
    vigencia: 'Vigente desde 09/10/2022',
    versao: '2020.1'
  },
  {
    id: 'RDC727-2022',
    norma: 'RDC ANVISA nº 727/2022',
    artigoAnexo: 'Art. 10',
    titulo: 'Lista de Ingredientes em Ordem Decrescente de Peso',
    regraResumo:
      'Todos os ingredientes devem ser declarados em ordem decrescente da respectiva proporção em massa (peso líquido na formulação). Água adicionada deve ser declarada, salvo se evaporada integralmente no processo.',
    vigencia: 'Vigente desde 01/09/2022',
    versao: '2022.1'
  },
  {
    id: 'RDC26-LEI10674',
    norma: 'RDC 26/2015 & Lei 10.674/2003',
    artigoAnexo: 'Declarações Obrigatórias',
    titulo: 'Alergênicos, Glúten e Lactose',
    regraResumo:
      'Exige declaração em caixa alta e negrito para principais alergênicos (trigo, leite, ovos, soja, amendoim, castanhas, peixes, crustáceos), além de CONTÉM GLÚTEN / NÃO CONTÉM GLÚTEN e presença de lactose (>100 mg/100g pela RDC 136/2017).',
    vigencia: 'Vigente',
    versao: '2015.1'
  }
];

/**
 * Sanitiza texto livre para prevenir injeção de markup ao exportar HTML/SVG/PDF.
 */
export function sanitizeLabelText(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/[<>&"']/g, (ch) => {
      switch (ch) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        default:
          return ch;
      }
    })
    .trim();
}

/**
 * Converte quantidade e unidade de medida para gramas brutas usando densidade/peso unitário do alimento.
 */
export function convertUnitToGrossGrams(
  quantity: number,
  unit: MeasureUnit,
  food?: Pick<AnvisaFoodEntry, 'densityGPerMl' | 'standardUnitWeightG'>
): number {
  const safeQty = Math.max(0, Number.isFinite(quantity) ? quantity : 0);
  const density = food?.densityGPerMl && food.densityGPerMl > 0 ? food.densityGPerMl : 1.0;

  switch (unit) {
    case 'g':
      return safeQty;
    case 'kg':
      return safeQty * 1000;
    case 'ml':
      return safeQty * density;
    case 'l':
      return safeQty * 1000 * density;
    case 'colher_sopa':
      return safeQty * 15 * density;
    case 'colher_cha':
      return safeQty * 5 * density;
    case 'xicara':
      return safeQty * (food?.standardUnitWeightG && food.standardUnitWeightG >= 80 ? food.standardUnitWeightG : 160 * density);
    case 'unidade':
      return safeQty * (food?.standardUnitWeightG || 100);
    default:
      return safeQty;
  }
}

/**
 * Calcula Peso Líquido = Peso Bruto / Fator de Correção (FC >= 1)
 * e Peso Final = Peso Líquido * Fator de Cocção/Rendimento (Fyc > 0)
 */
export function computeIngredientWeights(
  quantity: number,
  unit: MeasureUnit,
  correctionFactor: number,
  cookingFactor: number,
  food?: Pick<AnvisaFoodEntry, 'densityGPerMl' | 'standardUnitWeightG'>
) {
  const safeFC = Math.max(1, Number.isFinite(correctionFactor) ? correctionFactor : 1);
  const safeFyc = Math.max(0.1, Number.isFinite(cookingFactor) ? cookingFactor : 1);
  const grossWeightG = Math.round(convertUnitToGrossGrams(quantity, unit, food) * 100) / 100;
  const netWeightG = Math.round((grossWeightG / safeFC) * 100) / 100;
  const finalWeightG = Math.round(netWeightG * safeFyc * 100) / 100;
  return { grossWeightG, netWeightG, finalWeightG };
}

/**
 * Fatores específicos de energia conforme RDC 429/2020 (Anexo XXIII) / FAO Atwater.
 * Nota: Carboidratos disponíveis = 4 kcal/g; Proteínas = 4 kcal/g; Gorduras = 9 kcal/g;
 * Fibras alimentares = 2 kcal/g (opcional/solúvel); Álcool = 7 kcal/g; Polióis = 2,4 kcal/g.
 */
export function calculateAtwaterEnergy(params: {
  carbsG: number;
  proteinG: number;
  totalFatG: number;
  fiberG?: number;
  alcoholG?: number;
  polyolsG?: number;
  includeFiberFactor?: boolean;
}) {
  const carbs = Math.max(0, params.carbsG);
  const protein = Math.max(0, params.proteinG);
  const fat = Math.max(0, params.totalFatG);
  const fiber = Math.max(0, params.fiberG || 0);
  const alcohol = Math.max(0, params.alcoholG || 0);
  const polyols = Math.max(0, params.polyolsG || 0);

  const effectiveCarbs = params.includeFiberFactor ? Math.max(0, carbs - fiber) : carbs;
  const fiberKcal = params.includeFiberFactor ? fiber * 2 : 0;

  const kcal =
    effectiveCarbs * 4 +
    protein * 4 +
    fat * 9 +
    fiberKcal +
    alcohol * 7 +
    polyols * 2.4;

  const kj = kcal * 4.184;
  return {
    kcal: Math.round(kcal * 10) / 10,
    kj: Math.round(kj)
  };
}

/**
 * Verifica se o valor é não significativo conforme IN 75/2020 Anexo IV.
 */
export function isNonSignificantAnvisa(
  key: FormattedAnvisaRow['key'],
  value: number | null
): boolean {
  if (value === null) return false;
  switch (key) {
    case 'energy':
      return value <= 4; // ≤ 4 kcal
    case 'carbs':
    case 'totalSugars':
    case 'addedSugars':
    case 'protein':
    case 'totalFat':
    case 'fiber':
      return value <= 0.5; // ≤ 0,5 g
    case 'saturatedFat':
    case 'transFat':
      return value <= 0.2; // ≤ 0,2 g
    case 'sodium':
      return value <= 5; // ≤ 5 mg
    default:
      return false;
  }
}

/**
 * Aplica arredondamento oficial da IN 75/2020 Anexo IV.
 * Formata no padrão brasileiro (vírgula decimal) ou retorna '-' se dado ausente (null).
 */
export function formatAnvisaNumber(
  key: FormattedAnvisaRow['key'],
  rawValue: number | null
): { numericRounded: number | null; formatted: string; isNonSignificant: boolean } {
  if (rawValue === null || !Number.isFinite(rawValue)) {
    return { numericRounded: null, formatted: 'N/I', isNonSignificant: false };
  }

  const nonSig = isNonSignificantAnvisa(key, rawValue);
  if (nonSig) {
    return { numericRounded: 0, formatted: '0', isNonSignificant: true };
  }

  let rounded: number;
  if (key === 'energy' || key === 'sodium') {
    // Energia e sódio significativos são expressos como inteiros ≥ 10; entre 4/5 e 10: inteiro mais próximo ou 1 decimal
    rounded = rawValue >= 10 ? Math.round(rawValue) : Math.round(rawValue * 10) / 10;
  } else {
    // Macronutrientes: ≥ 10 g -> inteiro; < 10 g -> 1 casa decimal
    rounded = rawValue >= 10 ? Math.round(rawValue) : Math.round(rawValue * 10) / 10;
  }

  const formatted = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace('.', ',');

  return { numericRounded: rounded, formatted, isNonSignificant: false };
}

function formatPtBrDelta(value: number, unit: 'g' | 'mg'): string {
  const abs = Math.abs(value);
  if (unit === 'mg') {
    const rounded = Math.round(abs * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded} mg` : `${rounded.toFixed(1).replace('.', ',')} mg`;
  }
  const rounded = Math.round(abs * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} g` : `${rounded.toFixed(1).replace('.', ',')} g`;
}

function buildNutrientCheckItem(params: {
  key: RegulatoryNutrientCheckItem['key'];
  label: string;
  unit: 'g' | 'mg';
  lupaClaim: RegulatoryNutrientCheckItem['lupaClaim'];
  rawPer100: number | null;
  threshold: number;
  baseLabel: '100 g' | '100 ml';
}): RegulatoryNutrientCheckItem {
  const { key, label, unit, lupaClaim, rawPer100, threshold, baseLabel } = params;
  const formattedObj = formatAnvisaNumber(key, rawPer100);
  const roundedPer100 = formattedObj.numericRounded;

  if (rawPer100 === null || !Number.isFinite(rawPer100)) {
    return {
      key,
      label,
      unit,
      lupaClaim,
      rawPer100: null,
      roundedPer100: null,
      formattedPer100: 'N/I',
      threshold,
      percentOfLimit: null,
      deltaToThreshold: null,
      status: 'missing_data',
      exceedsLimit: false,
      roundingBoundaryAlert: false,
      recommendationText: `Dado não informado na ficha técnica. Preencha ou vincule laudo para validar ${label.toLowerCase()} por ${baseLabel}.`
    };
  }

  const exceedsLimit = rawPer100 >= threshold;
  const roundingBoundaryAlert =
    !exceedsLimit && roundedPer100 !== null && roundedPer100 >= threshold;
  const percentOfLimit = Math.round((rawPer100 / threshold) * 1000) / 10;
  const deltaToThreshold = Math.round((rawPer100 - threshold) * 100) / 100;

  let status: RegulatoryNutrientStatus = 'within_limit';
  if (exceedsLimit) {
    status = 'exceeds';
  } else if (percentOfLimit >= 85) {
    status = 'near_limit';
  }

  let recommendationText: string;
  if (exceedsLimit) {
    const reductionNeeded = Math.max(0.1, rawPer100 - (threshold - (unit === 'mg' ? 1 : 0.1)));
    recommendationText = `Exige Lupa "ALTO EM ${lupaClaim}". Reduza ${formatPtBrDelta(
      reductionNeeded,
      unit
    )} por ${baseLabel} para ficar abaixo do limite (${threshold} ${unit}).`;
  } else if (roundingBoundaryAlert) {
    recommendationText = `Atenção de arredondamento (IN 75/2020): teor real (${rawPer100
      .toFixed(1)
      .replace('.', ',')} ${unit}) está abaixo do corte, porém arredonda para ${
      formattedObj.formatted
    } ${unit} na tabela declarada.`;
  } else if (status === 'near_limit') {
    recommendationText = `Zona crítica (${percentOfLimit
      .toFixed(1)
      .replace('.', ',')}% do limite): margem de apenas ${formatPtBrDelta(
      deltaToThreshold,
      unit
    )} por ${baseLabel} antes de acionar a Lupa.`;
  } else {
    recommendationText = `Dentro do limite regulatório (${percentOfLimit
      .toFixed(1)
      .replace('.', ',')}% do teto; margem de ${formatPtBrDelta(
      deltaToThreshold,
      unit
    )} por ${baseLabel}).`;
  }

  return {
    key,
    label,
    unit,
    lupaClaim,
    rawPer100,
    roundedPer100,
    formattedPer100: formattedObj.formatted,
    threshold,
    percentOfLimit,
    deltaToThreshold,
    status,
    exceedsLimit,
    roundingBoundaryAlert,
    recommendationText
  };
}

/**
 * Avalia obrigatoriedade da Rotulagem Nutricional Frontal (Lupa "ALTO EM")
 * e calcula o detalhamento regulatório por nutriente conforme
 * RDC ANVISA nº 429/2020 (Art. 23–25) e IN ANVISA nº 75/2020 Anexo XV.
 */
export function evaluateAnvisaFrontalLupa(
  per100Base: Pick<NutrientProfile100g, 'addedSugarsG' | 'saturatedFatG' | 'sodiumMg'>,
  physicalState: PhysicalState,
  isExempt: boolean = false,
  exemptionReason?: string
): LupaWarningResult {
  const isLiquid = physicalState === 'liquido';
  const thresholds = {
    addedSugar: isLiquid ? 7.5 : 15.0,
    saturatedFat: isLiquid ? 3.0 : 6.0,
    sodium: isLiquid ? 300.0 : 600.0,
    baseLabel: (isLiquid ? '100 ml' : '100 g') as '100 g' | '100 ml'
  };

  const addedSugar = per100Base.addedSugarsG;
  const saturatedFat = per100Base.saturatedFatG;
  const sodium = per100Base.sodiumMg;

  const checks: RegulatoryNutrientCheckItem[] = [
    buildNutrientCheckItem({
      key: 'addedSugars',
      label: 'Açúcares adicionados',
      unit: 'g',
      lupaClaim: 'AÇÚCAR ADICIONADO',
      rawPer100: addedSugar,
      threshold: thresholds.addedSugar,
      baseLabel: thresholds.baseLabel
    }),
    buildNutrientCheckItem({
      key: 'saturatedFat',
      label: 'Gorduras saturadas',
      unit: 'g',
      lupaClaim: 'GORDURA SATURADA',
      rawPer100: saturatedFat,
      threshold: thresholds.saturatedFat,
      baseLabel: thresholds.baseLabel
    }),
    buildNutrientCheckItem({
      key: 'sodium',
      label: 'Sódio',
      unit: 'mg',
      lupaClaim: 'SÓDIO',
      rawPer100: sodium,
      threshold: thresholds.sodium,
      baseLabel: thresholds.baseLabel
    })
  ];

  const sugarExceeded = checks[0].exceedsLimit;
  const satFatExceeded = checks[1].exceedsLimit;
  const sodiumExceeded = checks[2].exceedsLimit;

  const suggestedClaims = checks
    .filter((item) => item.exceedsLimit)
    .map((item) => item.lupaClaim);

  const highAddedSugar = !isExempt && sugarExceeded;
  const highSaturatedFat = !isExempt && satFatExceeded;
  const highSodium = !isExempt && sodiumExceeded;
  const hasMissingCriticalData = checks.some((item) => item.status === 'missing_data');
  const hasExemptionConflict = isExempt && (sugarExceeded || satFatExceeded || sodiumExceeded);

  return {
    required: !isExempt && (highAddedSugar || highSaturatedFat || highSodium),
    exempted: isExempt,
    exemptionReason,
    highAddedSugar,
    highSaturatedFat,
    highSodium,
    hasMissingCriticalData,
    hasExemptionConflict,
    suggestedClaims,
    checks,
    thresholds,
    values: {
      addedSugar,
      saturatedFat,
      sodium
    }
  };
}

/**
 * Converte dados diretos de tabela nutricional (ex.: tabela calculada ou editada manualmente por 100 g / 100 ml)
 * para execução direta do motor regulatório da RDC 429/2020.
 */
export function evaluateCalculatedTableRegulatoryLimits(params: {
  addedSugarsPer100: number | null;
  saturatedFatPer100: number | null;
  sodiumMgPer100: number | null;
  physicalState: PhysicalState;
  isExempt?: boolean;
  exemptionReason?: string;
}): LupaWarningResult {
  return evaluateAnvisaFrontalLupa(
    {
      addedSugarsG: params.addedSugarsPer100,
      saturatedFatG: params.saturatedFatPer100,
      sodiumMg: params.sodiumMgPer100
    },
    params.physicalState,
    params.isExempt ?? false,
    params.exemptionReason
  );
}

/**
 * Soma segura de valores possivelmente nulos:
 * Se algum ingrediente ativo contribuir com dado nulo (N/I), propaga a marcação de campo incompleto
 * sem fingir que "não informado = zero".
 */
function aggregateNutrient(
  ingredients: Array<{ line: RecipeIngredientLine; food: AnvisaFoodEntry | undefined }>,
  extractor: (n: NutrientProfile100g) => number | null | undefined,
  fieldLabel: string,
  missingFieldsSet: Set<string>
): number | null {
  if (ingredients.length === 0) return 0;

  let sum = 0;
  let hasAtLeastOneMeasured = false;
  let hasMissingInWeight = false;

  for (const { line, food } of ingredients) {
    if (line.netWeightG <= 0) continue;
    if (!food) {
      hasMissingInWeight = true;
      continue;
    }
    const per100 = extractor(food.nutrientsPer100g);
    if (per100 === null || per100 === undefined) {
      hasMissingInWeight = true;
    } else {
      hasAtLeastOneMeasured = true;
      sum += (line.netWeightG * per100) / 100;
    }
  }

  if (hasMissingInWeight) {
    missingFieldsSet.add(fieldLabel);
  }

  if (!hasAtLeastOneMeasured && hasMissingInWeight) {
    return null;
  }

  return sum;
}

/**
 * Motor Principal Determinístico: Calcula composição nutricional completa da ficha técnica,
 * base por 100g/100ml, por porção, %VD (IN 75/2020), Lupa Frontal, Lista de Ingredientes (RDC 727/2022),
 * Alergênicos (RDC 26/2015) e Auditoria em 3 níveis (Verde / Amarelo / Vermelho).
 */
export function calculateRecipeNutrition(
  recipe: TechnicalSheetRecipe,
  foodDatabase: AnvisaFoodEntry[]
): CalculatedRecipeResult {
  const foodById = new Map<string, AnvisaFoodEntry>();
  for (const f of foodDatabase) {
    foodById.set(f.id, f);
    foodById.set(f.code, f);
  }

  const resolvedLines = recipe.ingredients.map((line) => {
    const food = line.foodId ? foodById.get(line.foodId) : undefined;
    return { line, food };
  });

  const totalRawWeightG = resolvedLines.reduce((acc, item) => acc + Math.max(0, item.line.grossWeightG), 0);
  const totalNetWeightG = resolvedLines.reduce((acc, item) => acc + Math.max(0, item.line.netWeightG), 0);

  // Rendimento estimado considerando fator de cocção individual, perda hídrica global e absorção de óleo
  const sumIngredientFinalWeight = resolvedLines.reduce(
    (acc, item) => acc + Math.max(0, item.line.finalWeightG),
    0
  );
  const waterLossFactor = Math.max(0.1, 1 - Math.max(0, Math.min(85, recipe.waterLossPercent || 0)) / 100);
  const estimatedYieldBeforeOverrideG = Math.max(
    1,
    Math.round((sumIngredientFinalWeight * waterLossFactor + Math.max(0, recipe.oilAbsorptionG || 0)) * 10) / 10
  );

  const finalYieldGrams =
    recipe.useManualYield && recipe.finalYieldGrams > 0
      ? recipe.finalYieldGrams
      : estimatedYieldBeforeOverrideG;

  const missingFieldsSet = new Set<string>();

  const totalEnergy = aggregateNutrient(resolvedLines, (n) => n.energyKcal, 'Valor energético', missingFieldsSet);
  const totalCarbs = aggregateNutrient(resolvedLines, (n) => n.carbsG, 'Carboidratos', missingFieldsSet);
  const totalSugars = aggregateNutrient(resolvedLines, (n) => n.totalSugarsG, 'Açúcares totais', missingFieldsSet);
  const totalAddedSugars = aggregateNutrient(resolvedLines, (n) => n.addedSugarsG, 'Açúcares adicionados', missingFieldsSet);
  const totalProtein = aggregateNutrient(resolvedLines, (n) => n.proteinG, 'Proteínas', missingFieldsSet);
  let totalFat = aggregateNutrient(resolvedLines, (n) => n.totalFatG, 'Gorduras totais', missingFieldsSet);
  let totalSatFat = aggregateNutrient(resolvedLines, (n) => n.saturatedFatG, 'Gorduras saturadas', missingFieldsSet);
  const totalTransFat = aggregateNutrient(resolvedLines, (n) => n.transFatG, 'Gorduras trans', missingFieldsSet);
  const totalFiber = aggregateNutrient(resolvedLines, (n) => n.fiberG, 'Fibras alimentares', missingFieldsSet);
  const totalSodium = aggregateNutrient(resolvedLines, (n) => n.sodiumMg, 'Sódio', missingFieldsSet);

  // Contabilizar absorção de óleo na fritura se informado na ficha técnica (~15% saturada padrão óleo vegetal)
  let extraOilEnergy = 0;
  if (recipe.oilAbsorptionG > 0) {
    if (totalFat !== null) totalFat += recipe.oilAbsorptionG;
    if (totalSatFat !== null) totalSatFat += recipe.oilAbsorptionG * 0.15;
    extraOilEnergy = recipe.oilAbsorptionG * 9;
  }

  const effectiveTotalEnergy = totalEnergy !== null ? totalEnergy + extraOilEnergy : null;

  const scaleTo100 = (val: number | null) =>
    val === null ? null : (val / Math.max(1, finalYieldGrams)) * 100;

  const safePortion = Math.max(0.1, recipe.portionSize || 1);
  const scaleToPortion = (val100: number | null) =>
    val100 === null ? null : (val100 * safePortion) / 100;

  const per100g: NutrientProfile100g = {
    energyKcal: scaleTo100(effectiveTotalEnergy),
    energyKj: effectiveTotalEnergy !== null ? scaleTo100(effectiveTotalEnergy * 4.184) : null,
    carbsG: scaleTo100(totalCarbs),
    totalSugarsG: scaleTo100(totalSugars),
    addedSugarsG: scaleTo100(totalAddedSugars),
    proteinG: scaleTo100(totalProtein),
    totalFatG: scaleTo100(totalFat),
    saturatedFatG: scaleTo100(totalSatFat),
    transFatG: scaleTo100(totalTransFat),
    fiberG: scaleTo100(totalFiber),
    sodiumMg: scaleTo100(totalSodium)
  };

  const perPortion: NutrientProfile100g = {
    energyKcal: scaleToPortion(per100g.energyKcal),
    energyKj: scaleToPortion(per100g.energyKj),
    carbsG: scaleToPortion(per100g.carbsG),
    totalSugarsG: scaleToPortion(per100g.totalSugarsG),
    addedSugarsG: scaleToPortion(per100g.addedSugarsG),
    proteinG: scaleToPortion(per100g.proteinG),
    totalFatG: scaleToPortion(per100g.totalFatG),
    saturatedFatG: scaleToPortion(per100g.saturatedFatG),
    transFatG: scaleToPortion(per100g.transFatG),
    fiberG: scaleToPortion(per100g.fiberG),
    sodiumMg: scaleToPortion(per100g.sodiumMg)
  };

  // Checagem cruzada de energia Atwater vs Soma das tabelas
  const atwater100 = calculateAtwaterEnergy({
    carbsG: per100g.carbsG || 0,
    proteinG: per100g.proteinG || 0,
    totalFatG: per100g.totalFatG || 0
  });
  const dbKcal100 = per100g.energyKcal || 0;
  const energyDeltaPercent =
    dbKcal100 > 0 ? Math.round((Math.abs(dbKcal100 - atwater100.kcal) / dbKcal100) * 1000) / 10 : 0;

  // Monta as 10 linhas obrigatórias da RDC 429/2020 (Anexo I / IN 75/2020)
  const buildRow = (
    key: FormattedAnvisaRow['key'],
    label: string,
    unit: FormattedAnvisaRow['unit'],
    isBold: boolean,
    indentLevel: 0 | 1 | 2,
    vdrBase: number | null,
    val100: number | null,
    valPortion: number | null,
    missingLabel: string
  ): FormattedAnvisaRow => {
    const f100 = formatAnvisaNumber(key, val100);
    const fPortion = formatAnvisaNumber(key, valPortion);

    let vdPercent = '-';
    if (key === 'transFat') {
      vdPercent = '**';
    } else if (vdrBase === null) {
      vdPercent = '-';
    } else if (fPortion.numericRounded === null) {
      vdPercent = 'N/I';
    } else if (fPortion.isNonSignificant || fPortion.numericRounded === 0) {
      vdPercent = '0';
    } else {
      vdPercent = String(Math.round((fPortion.numericRounded / vdrBase) * 100));
    }

    return {
      key,
      label,
      unit,
      isBold,
      indentLevel,
      raw100g: val100,
      rawPortion: valPortion,
      formatted100g: f100.formatted,
      formattedPortion: fPortion.formatted,
      vdPercent,
      isNonSignificantPortion: fPortion.isNonSignificant,
      hasMissingSourceData: missingFieldsSet.has(missingLabel)
    };
  };

  const rows: FormattedAnvisaRow[] = [
    buildRow('energy', 'Valor energético (kcal)', 'kcal', true, 0, IN75_VDR.energyKcal, per100g.energyKcal, perPortion.energyKcal, 'Valor energético'),
    buildRow('carbs', 'Carboidratos (g)', 'g', true, 0, IN75_VDR.carbsG, per100g.carbsG, perPortion.carbsG, 'Carboidratos'),
    buildRow('totalSugars', 'Açúcares totais (g)', 'g', false, 1, null, per100g.totalSugarsG, perPortion.totalSugarsG, 'Açúcares totais'),
    buildRow('addedSugars', 'Açúcares adicionados (g)', 'g', false, 2, IN75_VDR.addedSugarsG, per100g.addedSugarsG, perPortion.addedSugarsG, 'Açúcares adicionados'),
    buildRow('protein', 'Proteínas (g)', 'g', true, 0, IN75_VDR.proteinG, per100g.proteinG, perPortion.proteinG, 'Proteínas'),
    buildRow('totalFat', 'Gorduras totais (g)', 'g', true, 0, IN75_VDR.totalFatG, per100g.totalFatG, perPortion.totalFatG, 'Gorduras totais'),
    buildRow('saturatedFat', 'Gorduras saturadas (g)', 'g', false, 1, IN75_VDR.saturatedFatG, per100g.saturatedFatG, perPortion.saturatedFatG, 'Gorduras saturadas'),
    buildRow('transFat', 'Gorduras trans (g)', 'g', false, 1, null, per100g.transFatG, perPortion.transFatG, 'Gorduras trans'),
    buildRow('fiber', 'Fibras alimentares (g)', 'g', true, 0, IN75_VDR.fiberG, per100g.fiberG, perPortion.fiberG, 'Fibras alimentares'),
    buildRow('sodium', 'Sódio (mg)', 'mg', true, 0, IN75_VDR.sodiumMg, per100g.sodiumMg, perPortion.sodiumMg, 'Sódio')
  ];

  // Lupa Frontal
  const lupa = evaluateAnvisaFrontalLupa(
    per100g,
    recipe.physicalState,
    recipe.isExemptFromLupa,
    recipe.exemptionReason
  );

  // Ordenação decrescente de ingredientes conforme RDC 727/2022
  const sortedByWeight = [...resolvedLines]
    .filter((item) => item.line.netWeightG > 0)
    .sort((a, b) => b.line.netWeightG - a.line.netWeightG);

  const suggestedIngredientsList =
    sortedByWeight.length > 0
      ? sortedByWeight.map((item) => item.food?.name || item.line.name).join(', ') + '.'
      : '';

  // Validação da declaração manual de ingredientes vs ordem decrescente
  let ingredientsOrderValid = true;
  let ingredientsOrderNotes = 'Ordem decrescente de massa conforme RDC 727/2022 validada pela ficha técnica.';
  if (recipe.ingredientsDeclarationOverride && sortedByWeight.length >= 2) {
    const manualLower = recipe.ingredientsDeclarationOverride.toLowerCase();
    const topName = (sortedByWeight[0].food?.name || sortedByWeight[0].line.name).split(' ')[0].toLowerCase();
    const firstPart = manualLower.split(',')[0] || '';
    if (!firstPart.includes(topName)) {
      ingredientsOrderValid = false;
      ingredientsOrderNotes = `Atenção RDC 727/2022: O ingrediente predominante em massa na ficha técnica é "${sortedByWeight[0].food?.name || sortedByWeight[0].line.name}" (${sortedByWeight[0].line.netWeightG} g), devendo figurar em 1º lugar na lista.`;
    }
  }

  // Alergênicos & Glúten (RDC 26/2015 & Lei 10.674)
  const detectedAllergens = new Set<string>();
  let autoGluten = false;
  let autoLactose = false;

  const allergenNameMap: Record<string, string> = {
    trigo: 'DERIVADOS DE TRIGO',
    aveia: 'DERIVADOS DE AVEIA',
    centeio: 'DERIVADOS DE CENTEIO',
    cevada: 'DERIVADOS DE CEVADA',
    ovo: 'OVOS',
    leite: 'LEITE',
    soja: 'DERIVADOS DE SOJA',
    amendoim: 'AMENDOIM',
    castanhas: 'CASTANHAS',
    peixe: 'PEIXES',
    crustaceos: 'CRUSTÁCEOS'
  };

  for (const { food } of resolvedLines) {
    if (!food) continue;
    for (const tag of food.allergenTags) {
      if (tag === 'gluten') {
        autoGluten = true;
      } else {
        if (tag === 'leite') autoLactose = true;
        if (allergenNameMap[tag]) detectedAllergens.add(allergenNameMap[tag]);
      }
    }
  }

  const suggestedAllergensList =
    detectedAllergens.size > 0
      ? `ALÉRGICOS: CONTÉM ${Array.from(detectedAllergens).join(', ')}.`
      : 'ALÉRGICOS: SEM ALERGÊNICOS PRINCIPAIS IDENTIFICADOS NA FICHA (VERIFICAR CONTAMINAÇÃO CRUZADA).';

  const effectiveGluten = recipe.containsGluten !== null ? recipe.containsGluten : autoGluten;
  const suggestedGlutenText = effectiveGluten ? 'CONTÉM GLÚTEN.' : 'NÃO CONTÉM GLÚTEN.';

  const effectiveLactose = recipe.containsLactose || autoLactose;
  const suggestedLactoseText = effectiveLactose && recipe.lactoseAbove100mgPer100g ? 'CONTÉM LACTOSE.' : '';

  // Auditoria em 3 Níveis (Verde / Amarelo / Vermelho)
  const auditIssues: AnvisaAuditIssue[] = [];

  if (recipe.ingredients.length === 0) {
    auditIssues.push({
      id: 'RED-NO-INGREDIENTS',
      tier: 'red',
      title: 'Ficha técnica vazia',
      detail: 'Adicione ao menos um ingrediente vinculado à tabela nutricional antes de gerar o rótulo final.',
      legalRef: 'RDC 429/2020'
    });
  }

  const unresolved = resolvedLines.filter((i) => !i.food || i.line.resolutionStatus !== 'confirmed');
  if (unresolved.length > 0) {
    auditIssues.push({
      id: 'RED-UNRESOLVED-FOODS',
      tier: 'red',
      title: `${unresolved.length} ingrediente(s) pendente(s) de confirmação ou vínculo`,
      detail: `Associe os itens (${unresolved.map((u) => u.line.name).join(', ')}) a um registro validado da base TACO/TBCA para garantir rastreabilidade.`,
      legalRef: 'Boas Práticas / RDC 429/2020'
    });
  }

  if (finalYieldGrams <= 0 || recipe.portionSize <= 0) {
    auditIssues.push({
      id: 'RED-INVALID-YIELD',
      tier: 'red',
      title: 'Rendimento final ou porção inválidos',
      detail: 'O rendimento final da preparação e o peso da porção precisam ser maiores que zero.',
      legalRef: 'IN 75/2020 Anexo V'
    });
  }

  if (!ingredientsOrderValid) {
    auditIssues.push({
      id: 'RED-INGREDIENTS-ORDER',
      tier: 'red',
      title: 'Ordem da lista de ingredientes divergente da massa',
      detail: ingredientsOrderNotes,
      legalRef: 'RDC 727/2022 Art. 10'
    });
  }

  if (
    per100g.totalSugarsG !== null &&
    per100g.addedSugarsG !== null &&
    per100g.addedSugarsG > per100g.totalSugarsG + 0.05
  ) {
    auditIssues.push({
      id: 'RED-SUGAR-CONSISTENCY',
      tier: 'red',
      title: 'Inconsistência matemática em açúcares',
      detail: 'Açúcares adicionados não podem superar os açúcares totais.',
      legalRef: 'RDC 429/2020'
    });
  }

  if (
    per100g.totalFatG !== null &&
    per100g.saturatedFatG !== null &&
    per100g.saturatedFatG > per100g.totalFatG + 0.05
  ) {
    auditIssues.push({
      id: 'RED-FAT-CONSISTENCY',
      tier: 'red',
      title: 'Inconsistência matemática em gorduras',
      detail: 'Gorduras saturadas não podem superar as gorduras totais.',
      legalRef: 'RDC 429/2020'
    });
  }

  if (missingFieldsSet.size > 0) {
    auditIssues.push({
      id: 'YELLOW-MISSING-DATA',
      tier: 'yellow',
      title: 'Campos nutricionais sem dado analítico na base (N/I)',
      detail: `Um ou mais ingredientes não possuem medição reportada para: ${Array.from(missingFieldsSet).join(', ')}. O sistema não assumiu zero automaticamente — confirme por laudo ou ficha do fornecedor.`,
      legalRef: 'RDC 429/2020 Art. 14'
    });
  }

  const hasEstimated = resolvedLines.some((r) => r.food?.nutrientConfidence === 'estimated');
  if (hasEstimated) {
    auditIssues.push({
      id: 'YELLOW-ESTIMATED-DATA',
      tier: 'yellow',
      title: 'Ingredientes com composição estimada',
      detail: 'Existem ingredientes marcados como dado estimado ou genérico de fabricante. Recomenda-se anexar ficha técnica do fornecedor.',
      legalRef: 'Metodologia / TACO-TBCA'
    });
  }

  if (energyDeltaPercent > 12) {
    auditIssues.push({
      id: 'YELLOW-ATWATER-DELTA',
      tier: 'yellow',
      title: `Diferença energética de ${energyDeltaPercent}% entre banco e cálculo Atwater (4/4/9)`,
      detail: `Soma dos bancos: ${Math.round(dbKcal100)} kcal/100g vs. Fatores específicos Atwater: ${Math.round(atwater100.kcal)} kcal/100g (pode decorrer de fibras solúveis ou arredondamento da TACO).`,
      legalRef: 'RDC 429/2020 Anexo XXIII'
    });
  }

  if (recipe.isExemptFromLupa && !recipe.exemptionReason?.trim()) {
    auditIssues.push({
      id: 'YELLOW-EXEMPTION-REASON',
      tier: 'yellow',
      title: 'Justificativa legal de dispensa de Lupa não informada',
      detail: 'Registre o enquadramento normativo da dispensa (ex.: ingrediente único in natura, sal, azeite puro).',
      legalRef: 'RDC 429/2020 Art. 23–25'
    });
  }

  if (lupa.hasExemptionConflict) {
    auditIssues.push({
      id: 'YELLOW-LUPA-EXEMPTION-CONFLICT',
      tier: 'yellow',
      title: `Dispensa de Lupa ativa com limites ultrapassados (${lupa.suggestedClaims.join(', ')})`,
      detail: `Os teores calculados por ${lupa.thresholds.baseLabel} superam os limiares da IN 75/2020 Anexo XV. Confirme se o produto realmente possui enquadramento legal de dispensa (RDC 429/2020 Art. 23–25) ou aplique a Lupa Frontal obrigatória.`,
      legalRef: 'RDC 429/2020 Art. 23–25'
    });
  }

  const nearLimitItems = lupa.checks.filter((c) => c.status === 'near_limit');
  if (nearLimitItems.length > 0) {
    auditIssues.push({
      id: 'YELLOW-LUPA-NEAR-LIMIT',
      tier: 'yellow',
      title: `Nutriente(s) próximo(s) do limite da Lupa Frontal (≥ 85%)`,
      detail: nearLimitItems
        .map((c) => `${c.label}: ${c.formattedPer100} ${c.unit} (${c.percentOfLimit}% do teto de ${c.threshold} ${c.unit})`)
        .join(' · '),
      legalRef: 'IN 75/2020 Anexo XV'
    });
  }

  const boundaryAlerts = lupa.checks.filter((c) => c.roundingBoundaryAlert);
  if (boundaryAlerts.length > 0) {
    auditIssues.push({
      id: 'YELLOW-LUPA-ROUNDING-BOUNDARY',
      tier: 'yellow',
      title: 'Arredondamento da tabela na fronteira da Lupa Frontal',
      detail: boundaryAlerts.map((c) => c.recommendationText).join(' '),
      legalRef: 'IN 75/2020 Anexo IV & XV'
    });
  }

  // Itens Verdes (conformidades verificadas)
  if (recipe.ingredients.length > 0 && unresolved.length === 0) {
    auditIssues.push({
      id: 'GREEN-FOODS-VERIFIED',
      tier: 'green',
      title: 'Todos os ingredientes vinculados a fontes oficiais',
      detail: `${resolvedLines.length} ingrediente(s) validado(s) com rastreabilidade TACO/TBCA.`,
      legalRef: 'TACO 4ª Ed. / TBCA'
    });
  }

  if (lupa.required) {
    const triggers = [
      lupa.highAddedSugar ? 'Açúcar Adicionado' : null,
      lupa.highSaturatedFat ? 'Gordura Saturada' : null,
      lupa.highSodium ? 'Sódio' : null
    ].filter(Boolean);
    auditIssues.push({
      id: 'GREEN-LUPA-APPLIED',
      tier: 'green',
      title: `Lupa Frontal obrigatória aplicada (${triggers.join(', ')})`,
      detail: `Limiares verificados automaticamente por ${lupa.thresholds.baseLabel}.`,
      legalRef: 'IN 75/2020 Anexo XV'
    });
  } else if (!lupa.exempted && recipe.ingredients.length > 0) {
    auditIssues.push({
      id: 'GREEN-LUPA-CLEAR',
      tier: 'green',
      title: 'Isento de Lupa Frontal pelos teores calculados',
      detail: `Nenhum nutriente crítico atingiu o limite de alerta por ${lupa.thresholds.baseLabel}.`,
      legalRef: 'IN 75/2020 Anexo XV'
    });
  }

  if (ingredientsOrderValid && recipe.ingredients.length > 0) {
    auditIssues.push({
      id: 'GREEN-INGREDIENTS-ORDER',
      tier: 'green',
      title: 'Lista de ingredientes ordenada por massa decrescente',
      detail: 'Ordem decrescente verificada conforme peso líquido da ficha técnica.',
      legalRef: 'RDC 727/2022'
    });
  }

  const ingredientContributions = resolvedLines.map(({ line, food }) => {
    const ratio = line.netWeightG / 100;
    const n = food?.nutrientsPer100g;
    return {
      ingredientId: line.id,
      name: food?.name || line.name,
      netWeightG: line.netWeightG,
      finalWeightG: line.finalWeightG,
      kcal: n && n.energyKcal !== null ? Math.round(n.energyKcal * ratio * 10) / 10 : null,
      carbsG: n && n.carbsG !== null ? Math.round(n.carbsG * ratio * 10) / 10 : null,
      proteinG: n && n.proteinG !== null ? Math.round(n.proteinG * ratio * 10) / 10 : null,
      fatG: n && n.totalFatG !== null ? Math.round(n.totalFatG * ratio * 10) / 10 : null,
      fiberG: n && n.fiberG !== null ? Math.round(n.fiberG * ratio * 10) / 10 : null,
      sodiumMg: n && n.sodiumMg !== null ? Math.round(n.sodiumMg * ratio * 10) / 10 : null
    };
  });

  const hasRed = auditIssues.some((i) => i.tier === 'red');

  return {
    totalRawWeightG: Math.round(totalRawWeightG * 10) / 10,
    totalNetWeightG: Math.round(totalNetWeightG * 10) / 10,
    estimatedYieldBeforeOverrideG,
    finalYieldGrams: Math.round(finalYieldGrams * 10) / 10,
    per100g,
    perPortion,
    totals: {
      energyKcal: effectiveTotalEnergy,
      energyKj: effectiveTotalEnergy !== null ? Math.round(effectiveTotalEnergy * 4.184) : null,
      carbsG: totalCarbs,
      totalSugarsG: totalSugars,
      addedSugarsG: totalAddedSugars,
      proteinG: totalProtein,
      totalFatG: totalFat,
      saturatedFatG: totalSatFat,
      transFatG: totalTransFat,
      fiberG: totalFiber,
      sodiumMg: totalSodium
    },
    missingFields: Array.from(missingFieldsSet),
    rows,
    lupa,
    suggestedIngredientsList,
    ingredientsOrderValid,
    ingredientsOrderNotes,
    suggestedAllergensList,
    suggestedGlutenText,
    suggestedLactoseText,
    auditIssues,
    canApproveOfficialLabel: !hasRed,
    energyDifferenceCheck: {
      databaseKcal100g: Math.round(dbKcal100 * 10) / 10,
      atwaterCalculatedKcal100g: atwater100.kcal,
      deltaPercent: energyDeltaPercent
    },
    ingredientContributions
  };
}

/**
 * Receitas Iniciais Reais para Demonstração e Início Imediato (conforme referência visual e exemplo do prompt)
 */
export const INITIAL_NUTRITION_RECIPES: TechnicalSheetRecipe[] = [
  {
    id: 'rec-bolo-cenoura',
    name: 'Bolo de Cenoura Caseiro',
    category: 'Panificação e Confeitaria',
    physicalState: 'solido',
    ingredients: [
      {
        id: 'ing-bc-1',
        foodId: 'taco-001',
        foodCode: 'TACO-039',
        name: 'Farinha de trigo refinada (enriquecida)',
        category: 'Cereais e Farinhas',
        source: 'TACO',
        quantity: 300,
        unit: 'g',
        grossWeightG: 300,
        correctionFactor: 1,
        netWeightG: 300,
        cookingFactor: 1,
        finalWeightG: 300,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-bc-2',
        foodId: 'taco-025',
        foodCode: 'TACO-091',
        name: 'Cenoura crua (sem casca)',
        category: 'Hortaliças e Vegetais',
        source: 'TACO',
        quantity: 250,
        unit: 'g',
        grossWeightG: 250,
        correctionFactor: 1,
        netWeightG: 250,
        cookingFactor: 1,
        finalWeightG: 250,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-bc-3',
        foodId: 'taco-009',
        foodCode: 'TACO-513',
        name: 'Açúcar refinado / cristal branco',
        category: 'Açúcares e Doces',
        source: 'TACO',
        quantity: 200,
        unit: 'g',
        grossWeightG: 200,
        correctionFactor: 1,
        netWeightG: 200,
        cookingFactor: 1,
        finalWeightG: 200,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-bc-4',
        foodId: 'taco-019',
        foodCode: 'TACO-482',
        name: 'Ovo de galinha inteiro cru',
        category: 'Ovos e Laticínios',
        source: 'TACO',
        quantity: 3,
        unit: 'unidade',
        grossWeightG: 150,
        correctionFactor: 1,
        netWeightG: 150,
        cookingFactor: 1,
        finalWeightG: 150,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-bc-5',
        foodId: 'taco-015',
        foodCode: 'TACO-474',
        name: 'Óleo de soja refinado',
        category: 'Óleos e Gorduras',
        source: 'TACO',
        quantity: 100,
        unit: 'ml',
        grossWeightG: 92,
        correctionFactor: 1,
        netWeightG: 92,
        cookingFactor: 1,
        finalWeightG: 92,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-bc-6',
        foodId: 'taco-042',
        foodCode: 'TBCA-A025',
        name: 'Fermento químico em pó',
        category: 'Condimentos e Aditivos',
        source: 'TBCA',
        quantity: 12,
        unit: 'g',
        grossWeightG: 12,
        correctionFactor: 1,
        netWeightG: 12,
        cookingFactor: 1,
        finalWeightG: 12,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      }
    ],
    waterLossPercent: 20,
    oilAbsorptionG: 0,
    finalYieldGrams: 800,
    useManualYield: true,
    portionSize: 80,
    portionUnit: 'g',
    householdMeasure: '1 fatia média',
    portionsPerPackage: 10,
    packageNetWeightG: 800,
    layoutModel: 'vertical',
    labelWidthMm: 70,
    labelHeightMm: 110,
    fontScalePercent: 100,
    methodology: 'tabela_composicao',
    isExemptFromLupa: false,
    containsGluten: true,
    containsLactose: false,
    lactoseAbove100mgPer100g: false,
    status: 'revisado',
    version: 1,
    versionHistory: [
      {
        version: 1,
        savedAt: '2026-11-10T10:00:00.000Z',
        authorName: 'Dra. Gabriela Santos',
        summary: 'Ficha técnica inicial calculada pela TACO/TBCA',
        portionSize: 80,
        finalYieldGrams: 800,
        energyKcal100g: 363
      }
    ],
    authorName: 'Dra. Gabriela Santos',
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z'
  },
  {
    id: 'rec-cookie-integral',
    name: 'Cookie Integral de Aveia e Castanha',
    category: 'Snacks e Biscoitos',
    physicalState: 'solido',
    ingredients: [
      {
        id: 'ing-ck-1',
        foodId: 'taco-003',
        foodCode: 'TACO-016',
        name: 'Aveia em flocos crua',
        category: 'Cereais e Farinhas',
        source: 'TACO',
        quantity: 200,
        unit: 'g',
        grossWeightG: 200,
        correctionFactor: 1,
        netWeightG: 200,
        cookingFactor: 1,
        finalWeightG: 200,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-ck-2',
        foodId: 'taco-002',
        foodCode: 'TBCA-C045',
        name: 'Farinha de trigo integral',
        category: 'Cereais e Farinhas',
        source: 'TBCA',
        quantity: 120,
        unit: 'g',
        grossWeightG: 120,
        correctionFactor: 1,
        netWeightG: 120,
        cookingFactor: 1,
        finalWeightG: 120,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-ck-3',
        foodId: 'taco-010',
        foodCode: 'TACO-512',
        name: 'Açúcar mascavo',
        category: 'Açúcares e Doces',
        source: 'TACO',
        quantity: 70,
        unit: 'g',
        grossWeightG: 70,
        correctionFactor: 1,
        netWeightG: 70,
        cookingFactor: 1,
        finalWeightG: 70,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-ck-4',
        foodId: 'taco-018',
        foodCode: 'TBCA-G009',
        name: 'Óleo de coco extravirgem',
        category: 'Óleos e Gorduras',
        source: 'TBCA',
        quantity: 60,
        unit: 'g',
        grossWeightG: 60,
        correctionFactor: 1,
        netWeightG: 60,
        cookingFactor: 1,
        finalWeightG: 60,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-ck-5',
        foodId: 'taco-037',
        foodCode: 'TACO-586',
        name: 'Castanha-do-pará (Brasil) crua',
        category: 'Oleaginosas e Sementes',
        source: 'TACO',
        quantity: 50,
        unit: 'g',
        grossWeightG: 50,
        correctionFactor: 1,
        netWeightG: 50,
        cookingFactor: 1,
        finalWeightG: 50,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-ck-6',
        foodId: 'taco-019',
        foodCode: 'TACO-482',
        name: 'Ovo de galinha inteiro cru',
        category: 'Ovos e Laticínios',
        source: 'TACO',
        quantity: 1,
        unit: 'unidade',
        grossWeightG: 50,
        correctionFactor: 1,
        netWeightG: 50,
        cookingFactor: 1,
        finalWeightG: 50,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      }
    ],
    waterLossPercent: 14,
    oilAbsorptionG: 0,
    finalYieldGrams: 475,
    useManualYield: true,
    portionSize: 30,
    portionUnit: 'g',
    householdMeasure: '2 unidades',
    portionsPerPackage: 15,
    packageNetWeightG: 450,
    layoutModel: 'vertical',
    labelWidthMm: 65,
    labelHeightMm: 100,
    fontScalePercent: 100,
    methodology: 'tabela_composicao',
    isExemptFromLupa: false,
    containsGluten: true,
    containsLactose: false,
    lactoseAbove100mgPer100g: false,
    status: 'aprovado',
    version: 2,
    versionHistory: [
      {
        version: 1,
        savedAt: '2026-11-05T09:00:00.000Z',
        authorName: 'Dra. Gabriela Santos',
        summary: 'Formulação inicial com açúcar mascavo',
        portionSize: 30,
        finalYieldGrams: 475,
        energyKcal100g: 432
      }
    ],
    authorName: 'Dra. Gabriela Santos',
    createdAt: '2026-11-05T09:00:00.000Z',
    updatedAt: '2026-11-08T14:20:00.000Z'
  },
  {
    id: 'rec-brownie-cacau',
    name: 'Brownie de Chocolate Meio Amargo',
    category: 'Confeitaria',
    physicalState: 'solido',
    ingredients: [
      {
        id: 'ing-br-1',
        foodId: 'taco-013',
        foodCode: 'TACO-518',
        name: 'Chocolate meio amargo (50% cacau)',
        category: 'Açúcares e Doces',
        source: 'TACO',
        quantity: 200,
        unit: 'g',
        grossWeightG: 200,
        correctionFactor: 1,
        netWeightG: 200,
        cookingFactor: 1,
        finalWeightG: 200,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-br-2',
        foodId: 'taco-017',
        foodCode: 'TACO-472',
        name: 'Manteiga com sal',
        category: 'Óleos e Gorduras',
        source: 'TACO',
        quantity: 120,
        unit: 'g',
        grossWeightG: 120,
        correctionFactor: 1,
        netWeightG: 120,
        cookingFactor: 1,
        finalWeightG: 120,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-br-3',
        foodId: 'taco-009',
        foodCode: 'TACO-513',
        name: 'Açúcar refinado / cristal branco',
        category: 'Açúcares e Doces',
        source: 'TACO',
        quantity: 150,
        unit: 'g',
        grossWeightG: 150,
        correctionFactor: 1,
        netWeightG: 150,
        cookingFactor: 1,
        finalWeightG: 150,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-br-4',
        foodId: 'taco-019',
        foodCode: 'TACO-482',
        name: 'Ovo de galinha inteiro cru',
        category: 'Ovos e Laticínios',
        source: 'TACO',
        quantity: 3,
        unit: 'unidade',
        grossWeightG: 150,
        correctionFactor: 1,
        netWeightG: 150,
        cookingFactor: 1,
        finalWeightG: 150,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      },
      {
        id: 'ing-br-5',
        foodId: 'taco-001',
        foodCode: 'TACO-039',
        name: 'Farinha de trigo refinada (enriquecida)',
        category: 'Cereais e Farinhas',
        source: 'TACO',
        quantity: 90,
        unit: 'g',
        grossWeightG: 90,
        correctionFactor: 1,
        netWeightG: 90,
        cookingFactor: 1,
        finalWeightG: 90,
        processingState: 'assado',
        resolutionStatus: 'confirmed'
      }
    ],
    waterLossPercent: 10,
    oilAbsorptionG: 0,
    finalYieldGrams: 640,
    useManualYield: true,
    portionSize: 60,
    portionUnit: 'g',
    householdMeasure: '1 unidade (60g)',
    portionsPerPackage: 10,
    packageNetWeightG: 600,
    layoutModel: 'vertical',
    labelWidthMm: 70,
    labelHeightMm: 110,
    fontScalePercent: 100,
    methodology: 'tabela_composicao',
    isExemptFromLupa: false,
    containsGluten: true,
    containsLactose: true,
    lactoseAbove100mgPer100g: false,
    status: 'aprovado',
    version: 1,
    versionHistory: [],
    authorName: 'Dra. Gabriela Santos',
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z'
  }
];
