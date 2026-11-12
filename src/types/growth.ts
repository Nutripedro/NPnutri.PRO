/**
 * Pediatric Growth Charts & Z-Score Engine Data Models
 * Standards: WHO Child Growth Standards (2006, 0-5y) & WHO Reference (2007, 5-19y) / SISVAN Brasil
 */

export type PediatricBiologicalSex = 'male' | 'female';

export type GrowthIndexType = 
  | 'height_for_age'   // Estatura/Comprimento para Idade (E/I)
  | 'weight_for_age'   // Peso para Idade (P/I)
  | 'bmi_for_age'      // IMC para Idade (IMC/I)
  | 'head_circ_for_age'; // Perímetro Cefálico para Idade (PC/I)

export type AgeGroupCategory = '0_2_years' | '0_5_years' | '5_19_years';

/**
 * WHO LMS (Lambda, Mu, Sigma) Parameters for a specific age point
 * L: Box-Cox power (skewness)
 * M: Median
 * S: Coefficient of variation
 */
export interface WHOLMSPoint {
  ageMonths: number;
  L: number;
  M: number;
  S: number;
  // Computed curve values across Z-Scores (-3 to +3)
  sd3neg?: number;
  sd2neg?: number;
  sd1neg?: number;
  sd0?: number;
  sd1pos?: number;
  sd2pos?: number;
  sd3pos?: number;
}

/**
 * Single pediatric clinical measurement recorded during a consultation
 */
export interface PediatricMeasurement {
  id: string;
  consultationDate: string; // YYYY-MM-DD
  ageMonths: number;        // Exact age in months with fractional days
  ageDisplay: string;       // e.g. "1 ano e 4 meses (16m)"
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  bmi?: number;
  notes?: string;
  // Computed Z-Scores & Percentiles
  zScores?: {
    heightForAge?: number;
    weightForAge?: number;
    bmiForAge?: number;
    headCircForAge?: number;
  };
  percentiles?: {
    heightForAge?: number;
    weightForAge?: number;
    bmiForAge?: number;
    headCircForAge?: number;
  };
  diagnostics?: {
    heightForAge?: SISVANDiagnosis;
    weightForAge?: SISVANDiagnosis;
    bmiForAge?: SISVANDiagnosis;
    headCircForAge?: SISVANDiagnosis;
  };
}

/**
 * SISVAN / WHO Nutritional Status Diagnosis
 */
export type SISVANSeverity = 'grave' | 'alerta' | 'eutrofico' | 'sobrepeso' | 'obesidade' | 'neutro';

export interface SISVANDiagnosis {
  index: GrowthIndexType;
  indexLabel: string;
  zScore: number;
  percentile: number;
  classification: string;
  severity: SISVANSeverity;
  clinicalGuidance: string;
  badgeBgColor: string;
  badgeTextColor: string;
  borderColor: string;
}

/**
 * Growth Chart plotting point combines WHO LMS standard curves and patient visit point
 */
export interface ChartPlotDataPoint {
  ageMonths: number;
  ageLabel: string;
  // Standard WHO curves
  sd3neg: number;
  sd2neg: number;
  sd1neg: number;
  sd0: number;
  sd1pos: number;
  sd2pos: number;
  sd3pos: number;
  // Patient actual measured value at this age (if visited)
  patientValue?: number;
  patientZScore?: number;
  patientDate?: string;
  patientId?: string;
}

/**
 * Full Pediatric Patient Record
 */
export interface PediatricPatient {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  sex: PediatricBiologicalSex;
  gestationalWeeksAtBirth?: number; // e.g. 39 weeks (for prematurity correction if needed)
  birthWeightKg?: number;
  birthLengthCm?: number;
  birthHeadCircCm?: number;
  motherName?: string;
  pediatricianName?: string;
  recordNumber: string;
  measurements: PediatricMeasurement[];
}
