export type ExtractionValueStatus =
  | 'extracted'
  | 'confirmed'
  | 'unidentified'
  | 'missing';

export type HemoSeriesCategory = 'vermelha' | 'branca' | 'plaquetas' | 'complementar';

export type HemoClinicalClassification =
  | 'critico_baixo'
  | 'baixo'
  | 'ideal'
  | 'referencia'
  | 'elevado'
  | 'critico_alto'
  | 'nao_informado';

export interface HemoParameterEntry {
  id: string;
  category: HemoSeriesCategory;
  name: string;
  unit: string;
  /** Valor numérico confirmado ou extraído; null indica dado ausente ou ilegível */
  value: number | null;
  /** Para série branca quando o laudo traz % além do absoluto (ou vice-versa) */
  percentValue?: number | null;
  refMin: number | null;
  refMax: number | null;
  funcMin?: number | null;
  funcMax?: number | null;
  extractionStatus: ExtractionValueStatus;
  rawTextSnippet?: string;
  confidence?: number;
  notes?: string;
}

export interface HemoDocumentMetadata {
  laboratoryName: string;
  collectionDate: string; // YYYY-MM-DD ou texto extraído
  examType: string;
  sourceFileName?: string;
  extractedByOcr: boolean;
  ocrWarnings: string[];
}

export interface HemoPatientClinicalContext {
  patientId: string;
  recordNumber: string;
  age: number;
  birthDate: string;
  biologicalSex: 'male' | 'female';
  isPregnant: boolean;
  gestationalWeeks?: number | null;
  weightKg: number | null;
  heightCm: number | null;
  imc: number | null;
  waistCm: number | null;
  bodyFatPercent: number | null;
  phaseAngleDeg: number | null;
  comorbidities: string[];
  medications: string;
  supplements: string;
  surgeriesHistory: string;
  familyHistory: string;
  dietaryHabits: string;
  recall24h: string;
  alcoholUse: 'nenhum' | 'ocasional' | 'frequente' | 'nao_informado';
  tobaccoUse: 'nao' | 'ex_tabagista' | 'ativo' | 'nao_informado';
  physicalActivity: string;
  sleepQuality: string;
  giAndAllergicSymptoms: string[];
  infectionsHistory: string;
  gastrointestinalHistory: string;
}

export interface MebProtocolEvaluation {
  calculable: boolean;
  reasonIfNotCalculable?: string;
  monocytesPercent: number | null;
  eosinophilsPercent: number | null;
  basophilsPercent: number | null;
  monocytesAbsolute: number | null;
  eosinophilsAbsolute: number | null;
  basophilsAbsolute: number | null;
  score: number | null;
  formulaDisplay: string;
  classificationKey:
    | 'equilibrio_provavel'
    | 'limitrofe'
    | 'alerta_investigacao'
    | 'elevado'
    | 'indisponivel';
  classificationLabel: string;
  operationalSummary: string;
  predominantComponent: 'monocitos' | 'eosinofilos' | 'basofilos' | null;
  predominantComponentLabel: string;
  componentAnalyses: Array<{
    component: 'monocitos' | 'eosinofilos' | 'basofilos';
    label: string;
    percentValue: number | null;
    absoluteValue: number | null;
    labRefPercent: string;
    labRefAbsolute: string;
    clinicalAssociations: string[];
    cautionNote: string;
  }>;
  correlatedSymptoms: string[];
  investigationSuggestions: string[];
  scientificLimitations: string[];
}

export interface HematologicalIndexItem {
  id: 'NLR' | 'PLR' | 'MLR' | 'SII' | 'SIRI' | 'AISI';
  name: string;
  formula: string;
  valuesUsedDisplay: string;
  result: number | null;
  calculable: boolean;
  unavailableReason?: string;
  clinicalInterpretationNote: string;
}

export interface RedSeriesPatternAssessment {
  calculatedVCM: number | null;
  calculatedHCM: number | null;
  calculatedCHCM: number | null;
  vcmClassification: string;
  hcmClassification: string;
  chcmClassification: string;
  compatiblePatterns: string[];
  corroborationRequirements: string[];
}

export interface WhiteSeriesPatternAssessment {
  compatiblePatterns: string[];
  cautionNote: string;
}

export interface PlateletPatternAssessment {
  compatiblePatterns: string[];
  cautionNote: string;
}

export interface ParameterEvaluationOutput {
  id: string;
  category: HemoSeriesCategory;
  name: string;
  unit: string;
  value: number | null;
  percentValue?: number | null;
  refRangeDisplay: string;
  funcRangeDisplay: string;
  classification: HemoClinicalClassification;
  classificationLabel: string;
  physiologicalMeaning: string;
  clinicalCorrelations: string[];
  nutritionalCorrelations: string[];
  needsComplementaryInvestigation: boolean;
  investigationNote?: string;
}

export interface LongitudinalHemogramDelta {
  parameterId: string;
  name: string;
  unit: string;
  previousValue: number | null;
  currentValue: number | null;
  deltaAbsolute: number | null;
  deltaPercent: number | null;
  previousDate: string;
  currentDate: string;
}

export interface HemoFullEvaluationResult {
  parameterOutputs: ParameterEvaluationOutput[];
  redSeries: RedSeriesPatternAssessment;
  whiteSeries: WhiteSeriesPatternAssessment;
  platelets: PlateletPatternAssessment;
  meb: MebProtocolEvaluation;
  indexes: HematologicalIndexItem[];
  complementaryCorrelations: string[];
  missingEssentialContext: string[];
  longitudinalDeltas: LongitudinalHemogramDelta[];
}

export interface SavedHemogramRecord {
  id: string;
  patientId: string;
  createdAt: string;
  metadata: HemoDocumentMetadata;
  parameters: HemoParameterEntry[];
  complementaryLabs: HemoParameterEntry[];
  clinicalContextSnapshot: HemoPatientClinicalContext;
  mebScore: number | null;
  aiReport?: HemoAiStructuredReport | null;
}

export interface HemoAiStructuredReport {
  executiveSummary: string;
  nonDiagnosticHypotheses: Array<{
    title: string;
    priority: 'alta' | 'moderada' | 'informativa';
    series: string;
    rationale: string;
    corroboratingMarkers: string[];
  }>;
  nutritionalCorrelations: Array<{
    nutrientOrAxis: string;
    status: string;
    clinicalRationale: string;
    dietaryGuidance: string;
  }>;
  suggestedInvestigations: string[];
  followUpQuestions: string[];
  clinicalSafetyDisclaimer: string;
}
