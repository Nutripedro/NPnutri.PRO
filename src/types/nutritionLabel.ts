export type DataConfidence = 'measured' | 'calculated' | 'estimated' | 'missing';

export type FoodSource = 'TACO' | 'TBCA' | 'IBGE' | 'FABRICANTE' | 'CUSTOM';

export type PhysicalState = 'solido' | 'liquido';

export type ProcessingState =
  | 'cru'
  | 'cozido'
  | 'assado'
  | 'frito'
  | 'desidratado'
  | 'processado'
  | 'liquido_pronto';

export type MeasureUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'colher_sopa'
  | 'colher_cha'
  | 'xicara'
  | 'unidade';

export type AllergenCode =
  | 'trigo'
  | 'gluten'
  | 'leite'
  | 'ovo'
  | 'soja'
  | 'amendoim'
  | 'castanhas'
  | 'peixe'
  | 'crustaceos'
  | 'aveia'
  | 'centeio'
  | 'cevada';

export type AddedSugarClassification = 'none' | 'intrinsic' | 'added';

/**
 * Nutrient values per 100g (or 100ml).
 * Explicitly nullable to distinguish verified zero (0) from unreported (null).
 */
export interface NutrientProfile100g {
  energyKcal: number | null;
  energyKj: number | null;
  carbsG: number | null;
  totalSugarsG: number | null;
  addedSugarsG: number | null;
  proteinG: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  transFatG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
  // Optional micronutrients for extended declarations
  calciumMg?: number | null;
  ironMg?: number | null;
  potassiumMg?: number | null;
  vitaminCMg?: number | null;
}

export interface AnvisaFoodEntry {
  id: string;
  code: string;
  name: string;
  scientificName?: string;
  brand?: string;
  category:
    | 'Cereais e Farinhas'
    | 'Açúcares e Doces'
    | 'Óleos e Gorduras'
    | 'Ovos e Laticínios'
    | 'Carnes e Pescados'
    | 'Hortaliças e Vegetais'
    | 'Frutas'
    | 'Leguminosas'
    | 'Oleaginosas e Sementes'
    | 'Bebidas'
    | 'Condimentos e Aditivos';
  source: FoodSource;
  sourceVersion: string;
  physicalState: PhysicalState;
  processingState: ProcessingState;
  edibleFraction: number; // 0.0 to 1.0
  densityGPerMl: number; // e.g., 1.0 water, 0.92 oil, 1.03 milk
  standardUnitWeightG?: number; // e.g., 50g egg
  unitLabel?: string; // e.g., "1 unidade média (50g)"
  moistureG: number | null;
  nutrientsPer100g: NutrientProfile100g;
  addedSugarClassification: AddedSugarClassification;
  nutrientConfidence: DataConfidence;
  allergenTags: AllergenCode[];
  notes?: string;
}

export interface RecipeIngredientLine {
  id: string;
  foodId: string | null;
  foodCode?: string;
  name: string;
  category?: string;
  source?: FoodSource;
  quantity: number;
  unit: MeasureUnit;
  grossWeightG: number;
  correctionFactor: number; // FC = pesoBruto / pesoLiquido (>= 1)
  netWeightG: number;
  cookingFactor: number; // Fyc = pesoFinal / pesoLiquido (> 0)
  finalWeightG: number;
  processingState: ProcessingState;
  oilAbsorptionG?: number;
  resolutionStatus: 'confirmed' | 'ambiguous' | 'missing';
  ambiguityQuestion?: string;
  aiConfidence?: number;
}

export type LabelLayoutModel =
  | 'vertical'
  | 'horizontal'
  | 'vertical_quebrado'
  | 'horizontal_quebrado'
  | 'linear';

export type MethodologyType =
  | 'tabela_composicao'
  | 'calculo_teorico'
  | 'analise_laboratorial';

export interface RecipeVersionSnapshot {
  version: number;
  savedAt: string;
  authorName: string;
  summary: string;
  portionSize: number;
  finalYieldGrams: number;
  energyKcal100g: number;
}

export interface TechnicalSheetRecipe {
  id: string;
  name: string;
  category: string;
  physicalState: PhysicalState;
  ingredients: RecipeIngredientLine[];
  waterLossPercent: number; // e.g., evaporation during baking
  oilAbsorptionG: number;
  finalYieldGrams: number; // auto or overridden final weight
  useManualYield: boolean;
  portionSize: number; // g or ml
  portionUnit: 'g' | 'ml';
  householdMeasure: string;
  portionsPerPackage: number;
  packageNetWeightG: number;
  layoutModel: LabelLayoutModel;
  labelWidthMm: number;
  labelHeightMm: number;
  fontScalePercent: number;
  methodology: MethodologyType;
  isExemptFromLupa: boolean;
  exemptionReason?: string;
  ingredientsDeclarationOverride?: string;
  allergensDeclarationOverride?: string;
  containsGluten: boolean | null; // null = check/verify
  containsLactose: boolean;
  lactoseAbove100mgPer100g: boolean;
  status: 'rascunho' | 'revisado' | 'aprovado';
  version: number;
  versionHistory: RecipeVersionSnapshot[];
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedAnvisaRow {
  key:
    | 'energy'
    | 'carbs'
    | 'totalSugars'
    | 'addedSugars'
    | 'protein'
    | 'totalFat'
    | 'saturatedFat'
    | 'transFat'
    | 'fiber'
    | 'sodium';
  label: string;
  unit: 'kcal' | 'g' | 'mg';
  isBold: boolean;
  indentLevel: 0 | 1 | 2;
  raw100g: number | null;
  rawPortion: number | null;
  formatted100g: string;
  formattedPortion: string;
  vdPercent: string; // number string, '0', '-', or '**'
  isNonSignificantPortion: boolean;
  hasMissingSourceData: boolean;
}

export type RegulatoryNutrientStatus =
  | 'exceeds'
  | 'near_limit'
  | 'within_limit'
  | 'missing_data';

export interface RegulatoryNutrientCheckItem {
  key: 'addedSugars' | 'saturatedFat' | 'sodium';
  label: string;
  unit: 'g' | 'mg';
  lupaClaim: 'AÇÚCAR ADICIONADO' | 'GORDURA SATURADA' | 'SÓDIO';
  rawPer100: number | null;
  roundedPer100: number | null;
  formattedPer100: string;
  threshold: number;
  percentOfLimit: number | null;
  deltaToThreshold: number | null; // positive = exceeds threshold, negative = margin below threshold
  status: RegulatoryNutrientStatus;
  exceedsLimit: boolean;
  roundingBoundaryAlert: boolean;
  recommendationText: string;
}

export interface LupaWarningResult {
  required: boolean;
  exempted: boolean;
  exemptionReason?: string;
  highAddedSugar: boolean;
  highSaturatedFat: boolean;
  highSodium: boolean;
  hasMissingCriticalData: boolean;
  hasExemptionConflict: boolean;
  suggestedClaims: Array<'AÇÚCAR ADICIONADO' | 'GORDURA SATURADA' | 'SÓDIO'>;
  checks: RegulatoryNutrientCheckItem[];
  thresholds: {
    addedSugar: number;
    saturatedFat: number;
    sodium: number;
    baseLabel: '100 g' | '100 ml';
  };
  values: {
    addedSugar: number | null;
    saturatedFat: number | null;
    sodium: number | null;
  };
}

export type AuditTier = 'green' | 'yellow' | 'red';

export interface AnvisaAuditIssue {
  id: string;
  tier: AuditTier;
  title: string;
  detail: string;
  legalRef: string;
}

export interface CalculatedRecipeResult {
  totalRawWeightG: number;
  totalNetWeightG: number;
  estimatedYieldBeforeOverrideG: number;
  finalYieldGrams: number;
  per100g: NutrientProfile100g;
  perPortion: NutrientProfile100g;
  totals: NutrientProfile100g;
  missingFields: string[];
  rows: FormattedAnvisaRow[];
  lupa: LupaWarningResult;
  suggestedIngredientsList: string;
  ingredientsOrderValid: boolean;
  ingredientsOrderNotes: string;
  suggestedAllergensList: string;
  suggestedGlutenText: string;
  suggestedLactoseText: string;
  auditIssues: AnvisaAuditIssue[];
  canApproveOfficialLabel: boolean;
  energyDifferenceCheck: {
    databaseKcal100g: number;
    atwaterCalculatedKcal100g: number;
    deltaPercent: number;
  };
  ingredientContributions: Array<{
    ingredientId: string;
    name: string;
    netWeightG: number;
    finalWeightG: number;
    kcal: number | null;
    carbsG: number | null;
    proteinG: number | null;
    fatG: number | null;
    fiberG: number | null;
    sodiumMg: number | null;
  }>;
}

export interface RegulatoryRuleEntry {
  id: string;
  norma: string;
  artigoAnexo: string;
  titulo: string;
  regraResumo: string;
  vigencia: string;
  versao: string;
}

export interface AiRecipeInterpretationResponse {
  recipeName: string;
  category: string;
  physicalState: PhysicalState;
  estimatedYieldGrams: number;
  suggestedServingGrams: number;
  suggestedHouseholdMeasure: string;
  servingsPerPackage: number;
  clarificationsNeeded: string[];
  ingredients: Array<{
    rawText: string;
    normalizedName: string;
    quantity: number;
    unit: MeasureUnit;
    gramsEstimate: number;
    processingState: ProcessingState;
    matchedFoodCode: string | null;
    confidence: number;
    ambiguityQuestion?: string;
  }>;
}
