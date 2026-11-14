export type BiologicalSex = 'male' | 'female';

export interface WeightEvolutionPoint {
  date: string;
  weightKg: number;
  bodyFatPercent?: number;
  waistCm?: number;
  leanMassKg?: number;
  fatMassKg?: number;
  targetWeightKg?: number;
  eventLabel?: string;
}

import { PediatricMeasurement } from './growth';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  age: number;
  sex: BiologicalSex;
  heightCm: number;
  currentWeightKg: number;
  initialWeightKg: number;
  imc: number;
  avatarInitials: string;
  recordNumber: string;
  goal: string;
  lastAssessmentDate: string;
  unit: string;
  weightHistory?: WeightEvolutionPoint[];
  // Pediatric synchronization fields (0 to 19 years)
  isPediatric?: boolean;
  pediatricMeasurements?: PediatricMeasurement[];
  birthLengthCm?: number;
  birthWeightKg?: number;
  birthHeadCircCm?: number;
  gestationalWeeksAtBirth?: number;
  motherName?: string;
  pediatricianName?: string;
  bioimpedanceHistory?: BioimpedanceEvaluation[];
  mebIndex?: number;
}

export type ProtocolType = 'jp7' | 'jp3' | 'dw4' | 'faulkner4';
export type DensityEquation = 'siri' | 'brozek';

export interface SkinfoldSiteData {
  siteKey: 'subscapular' | 'triceps' | 'chest' | 'axillary' | 'suprailiac' | 'abdominal' | 'thigh';
  namePt: string;
  code: string;
  anatomicalLocation: string;
  direction: string;
  landmark: string;
  t1: number;
  t2: number;
  t3: number;
  median: number;
  deviationPercent: number;
  imageAlt: string;
  imageUrl: string;
}

export interface AnthropometryEvaluation {
  id: string;
  date: string;
  patientId: string;
  protocol: ProtocolType;
  equation: DensityEquation;
  caliperModel: string;
  weightKg: number;
  heightCm: number;
  sumSkinfoldsMm: number;
  bodyDensity: number;
  bodyFatPercent: number;
  fatMassKg: number;
  leanMassKg: number;
  targetBodyFatPercent: number;
  targetWeightKg: number;
  weightDeltaKg: number;
  fatLossGoalKg: number;
  classification: string;
  clinicalOpinion: string;
  sites: Record<string, { t1: number; t2: number; t3: number; median: number }>;
}

export interface BioimpedanceEvaluation {
  id: string;
  date: string;
  patientId: string;
  device: string;
  frequencyKhz: string;
  weightKg: number;
  leanMassKg: number;
  leanMassPercent: number;
  fatMassKg: number;
  fatMassPercent: number;
  totalBodyWaterL: number;
  totalBodyWaterPercent: number;
  intracellularWaterL: number;
  extracellularWaterL: number;
  edemaIndex: number; // ECW / TBW (0.360 - 0.390)
  bodyFatPercent: number;
  bmrKcal: number;
  tdeeKcal: number;
  activityFactor: number;
  bmi: number;
  phaseAngleDeg: number;
  resistanceOhm: number;
  reactanceOhm: number;
  fourCompartment: {
    waterKg: number;
    proteinKg: number;
    mineralKg: number;
    fatKg: number;
  };
  segmental: {
    rightArmKg: number;
    leftArmKg: number;
    trunkKg: number;
    rightLegKg: number;
    leftLegKg: number;
  };
  clinicalOpinion: string;
}

export interface WaistHipEvaluation {
  id: string;
  date: string;
  patientId: string;
  sex: BiologicalSex;
  age: number;
  waistCm: number;
  hipCm: number;
  ratio: number;
  riskCategory: 'BAIXO' | 'MODERADO' | 'ALTO' | 'MUITO ALTO';
  morphology: string;
  waistRiskWHO: 'Baixo' | 'Aumentado' | 'Muito Alto';
  visceralFatClassification: string;
  targetRatio: number;
  clinicalOpinion: string;
}

export interface NeckCardiometabolicEvaluation {
  id: string;
  date: string;
  patientId: string;
  sex: BiologicalSex;
  neckCircumferenceCm: number;
  cutoffCm: number;
  handgripKgf: number;
  relativeStrengthKgfPerKg: number;
  neckHeightRatio: number;
  compositeRisk: 'Baixo Risco' | 'Moderado' | 'Risco Aumentado' | 'Muito Alto';
  insulinResistanceRisk: boolean;
  sleepApneaRisk: boolean;
  sarcopeniaRisk: boolean;
  clinicalOpinion: string;
}

export interface PhotogrammetrySession {
  id: string;
  patientId: string;
  dateT0: string;
  dateT1: string;
  weightT0Kg: number;
  weightT1Kg: number;
  bodyFatT0Percent: number;
  bodyFatT1Percent: number;
  leanMassT0Kg: number;
  leanMassT1Kg: number;
  fatMassT0Kg: number;
  fatMassT1Kg: number;
  perimetry: {
    waistNarrowT0: number;
    waistNarrowT1: number;
    abdomenUmbilicalT0: number;
    abdomenUmbilicalT1: number;
    hipMaxT0: number;
    hipMaxT1: number;
    thighMedialT0: number;
    thighMedialT1: number;
    armRelaxedT0: number;
    armRelaxedT1: number;
    chestT0: number;
    chestT1: number;
  };
  photos: {
    frontalT0Url: string;
    frontalT1Url: string;
    sagittalRightUrl?: string;
    sagittalLeftUrl?: string;
    posteriorUrl?: string;
  };
  clinicalOpinion: string;
}

// Diet and Daily Calorie Tracking Models
export type EnergyFormula = 'mifflin' | 'harris' | 'katch' | 'who';
export type DietObjective = 'deficit_moderado' | 'deficit_agressivo' | 'eucalorica' | 'superavit_leve' | 'superavit_hipertrofia';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  portionGrams: number;
  servingUnit: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg?: number;
}

export interface MealFoodEntry {
  id: string;
  foodId: string;
  name: string;
  grams: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface MealPlanMeal {
  id: string;
  name: string; // e.g., "Café da Manhã", "Almoço"
  time: string; // e.g., "07:30"
  items: MealFoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  consumedToday?: boolean;
}

export interface DietPlan {
  id: string;
  patientId: string;
  createdAt: string;
  title: string;
  formula: EnergyFormula;
  bmrKcal: number;
  activityFactor: number;
  tdeeKcal: number;
  objective: DietObjective;
  calorieTargetKcal: number;
  calorieDeltaKcal: number;
  // Macro Targets
  proteinGrams: number;
  proteinGPerKg: number;
  proteinPercent: number;
  carbsGrams: number;
  carbsGPerKg: number;
  carbsPercent: number;
  fatGrams: number;
  fatGPerKg: number;
  fatPercent: number;
  waterTargetMl: number;
  meals: MealPlanMeal[];
  clinicalNotes: string;
}

export interface DailyFoodLog {
  date: string; // YYYY-MM-DD
  patientId: string;
  consumedCaloriesKcal: number;
  targetCaloriesKcal: number;
  consumedProteinG: number;
  targetProteinG: number;
  consumedCarbsG: number;
  targetCarbsG: number;
  consumedFatG: number;
  targetFatG: number;
  consumedFiberG: number;
  targetFiberG: number;
  waterGlassesConsumed: number; // e.g. 250ml each
  waterTargetGlasses: number;
  mealsLogged: Array<{
    mealId: string;
    mealName: string;
    consumed: boolean;
    time: string;
    itemsSummary: string;
    calories: number;
  }>;
}

// ANVISA RDC 429/2020 & IN 75/2020 Nutritional Table Models
export interface AnvisaNutritionalFact {
  name: string;
  per100g: number;
  perPortion: number;
  dailyValuePercent: number | null;
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  decimalPlaces: number;
  isBold?: boolean;
  indentLevel?: number;
}

export interface AnvisaProductLabel {
  productName: string;
  portionGrams: number;
  householdMeasure: string; // e.g. "2 fatias (50g)"
  portionsPerPackage: number;
  energyKcal100g: number;
  energyKcalPortion: number;
  carbs100g: number;
  totalSugars100g: number;
  addedSugars100g: number;
  protein100g: number;
  totalFat100g: number;
  saturatedFat100g: number;
  transFat100g: number;
  fiber100g: number;
  sodium100gMg: number;
  // Front of package magnifying glass warnings (Rotulagem Nutricional Frontal)
  highAddedSugar: boolean;
  highSaturatedFat: boolean;
  highSodium: boolean;
  // Ingredients list & allergens (RDC 727/2022 & RDC 26/2015)
  ingredientsList?: string;
  allergensWarning?: string;
}

// Lab Exam Requisition & Supplement Prescription
export interface LabExamItem {
  id: string;
  codeSUS?: string;
  name: string;
  panel: 'metabolico' | 'lipidico' | 'hormonal' | 'hepatico_renal' | 'micronutrientes' | 'inflamatorio' | 'tireoide' | 'adrenal' | 'detox' | 'neurometabolico' | 'intestinal';
  clinicalJustification: string;
  idealValueGreen: string;
  referenceYellow: string;
  selected: boolean;
}

export interface SupplementItem {
  id: string;
  name: string;
  category: 'performance' | 'saude_geral' | 'longevidade' | 'imunidade';
  practitionerScope: 'nutricionista' | 'medico_ou_nutricionista';
  activeIngredient: string;
  standardDose: string;
  posology: string; // "Tomar 5g diluído em 200ml de água no pós-treino"
  timing: string;
  route: string;
  clinicalIndications: string[];
  warnings: string;
  selected?: boolean;
}

// Clinical Scheduling & Appointment Types
export type AppointmentType = 
  | 'primeira_consulta' 
  | 'retorno' 
  | 'avaliacao_antropometrica' 
  | 'coleta_exames' 
  | 'entrega_plano';

export type AppointmentStatus = 
  | 'agendado' 
  | 'confirmado' 
  | 'em_atendimento' 
  | 'concluido' 
  | 'cancelado';

export interface ClinicalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientRecord: string;
  patientPhone: string;
  type: AppointmentType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  status: AppointmentStatus;
  unit: string;
  modality: 'presencial' | 'teleconsulta';
  notes?: string;
  meetLink?: string;
  reminderSentWhatsApp: boolean;
}

// Scheduled Local Reminders for Daily Tracker
export type ReminderType = 'refeicao' | 'hidratacao' | 'suplemento' | 'pesagem';

export interface ScheduledReminder {
  id: string;
  patientId: string;
  type: ReminderType;
  title: string;
  time: string; // HH:MM
  enabled: boolean;
  repeatDaily: boolean;
  customMessage: string;
  soundEnabled: boolean;
  relatedMealId?: string;
  targetAmount?: string; // e.g. "250 ml" or "32g proteína"
}

export type UserRole = 'nutricionista' | 'medico' | 'recepcionista' | 'adm' | 'admin' | 'secretaria';

export interface RolePermissions {
  // Prontuário & Avaliação Clínica
  canAccessClinicalRecords: boolean;      // Acesso a anamnese, prontuário e histórico
  canPerformAnthropometry: boolean;       // Dobras ISAK, Bioimpedância, RCQ, Pescoço, Fotogrametria
  canManageGrowthCharts: boolean;         // Curvas OMS & Escore-Z Infantil
  
  // Prescrição & Condutas
  canPrescribeDiets: boolean;             // TMB/GET, Macronutrientes e Cardápios
  canRequestExams: boolean;               // Requisição de Exames Laboratoriais (CFN / CFM)
  canPrescribeSupplements: boolean;       // Suplementação clínica (fitoterápicos, nutracêuticos)
  canPrescribeMedicalExclusive: boolean;  // Medicamentos e fórmulas de uso exclusivo médico
  
  // Recepção & Atendimento
  canManageAppointments: boolean;         // Agenda, confirmações e teleconsulta
  canRegisterPatients: boolean;           // Criar e editar dados cadastrais de pacientes
  
  // Governança, Equipe & Segurança
  canDeletePatients: boolean;             // Excluir pacientes do sistema
  canManageProfessionals: boolean;        // Cadastrar, editar e gerenciar profissionais e permissões
  canManageSettings: boolean;             // Configurações do sistema e governança
  canViewAuditLogs: boolean;              // Relatórios de auditoria e conformidade LGPD
}

export type CouncilType = 'CRN' | 'CRM' | 'MATRICULA' | 'OUTRO';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: UserRole;
  councilType: CouncilType;
  registrationCode: string; // ex: CRN-3 48910, CRM-SP 123456, REC-2024-08, ADM-001
  specialty: string;        // ex: "Nutrição Clínica & Esportiva"
  unit: string;
  isActive: boolean;
  admissionDate: string;
  permissions: RolePermissions;
  avatarInitials?: string;
}

export interface AppSettings {
  clinicName: string;
  unit: string;
  timezone: string;
  currency: string;
  allowPatientDeletion: boolean;
  features: {
    teleconsulta: boolean;
    whatsappReminders: boolean;
    anvisaLabeling: boolean;
  };
}

export interface PrescriptionSupplementEntry {
  id: string;
  name: string;
  activeIngredient: string;
  doseConcentration: string; // e.g. "5g", "1000mg", "350mg"
  posology: string;          // e.g. "Ingerir 1 dose diluída em 200ml de água"
  timing: string;            // e.g. "No pós-treino imediato"
  route: string;             // e.g. "Via Oral"
  duration: string;          // e.g. "Uso contínuo (60 dias)"
  notes?: string;
}

export interface PrescriptionPhytotherapeuticEntry {
  id: string;
  name: string;              // e.g. "Ashwagandha (Withania somnifera)"
  botanicalName: string;     // e.g. "Withania somnifera (L.) Dunal"
  standardization: string;   // e.g. "Extrato seco padronizado a 5% de Withanolídeos"
  dose: string;              // e.g. "500 mg por cápsula"
  vehicle: string;           // e.g. "Cápsulas Vegetais Gastroresistentes", "Gotas", "Sachê"
  posology: string;          // e.g. "Tomar 1 cápsula à noite, 1 hora antes de dormir"
  timing: string;            // e.g. "Noturno (21h00)"
  warnings?: string;         // e.g. "Evitar associação com sedativos sem orientação"
}

export interface PrescriptionDietaryRecommendation {
  id: string;
  category: 'hidratação' | 'horários' | 'interações' | 'alimentos_prioritários' | 'estilo_vida';
  title: string;
  guideline: string;
}

export interface ClinicalPrescription {
  id: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientRecord: string;
  patientAge: number;
  patientSex: BiologicalSex;
  professionalName: string;
  professionalRegistration: string; // e.g. "CRN-3 48910"
  date: string;                       // YYYY-MM-DD
  title: string;
  supplements: PrescriptionSupplementEntry[];
  phytotherapeutics: PrescriptionPhytotherapeuticEntry[];
  dietaryRecommendations: PrescriptionDietaryRecommendation[];
  generalNotes?: string;
  isDigitallySigned: boolean;
  digitalSignatureHash?: string;
  signatureTimestamp?: string;
}

// Financial Module Models
export type FinancialTransactionType = 'receita' | 'despesa';
export type FinancialCategory = 
  | 'consulta_primeira' 
  | 'consulta_retorno' 
  | 'pacote_nutricional' 
  | 'bioimpedancia_avulsa' 
  | 'suplementos_venda' 
  | 'aluguel_consultorio' 
  | 'software_sistemas' 
  | 'marketing_anuncios' 
  | 'impostos_taxas' 
  | 'material_clinico' 
  | 'outros';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'transferencia';
export type PaymentStatus = 'pago' | 'pendente' | 'atrasado' | 'cancelado';

export interface FinancialTransaction {
  id: string;
  type: FinancialTransactionType;
  category: FinancialCategory;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  patientId?: string;
  patientName?: string;
  notes?: string;
  receiptNumber?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMarginPercent: number;
  pendingIncome: number;
  pendingExpense: number;
}

// ---------------------------------------------------------------------------
// Clinical Evolution & Clinic Benchmark Comparison Types
// ---------------------------------------------------------------------------
export type ClinicCohortType = 'todos_adultos' | 'mesmo_sexo' | 'faixa_etaria' | 'mesmo_objetivo';

export interface ClinicCohortMetrics {
  id: ClinicCohortType;
  label: string;
  sublabel: string;
  sampleSize: number;
  avgWeightKg: number;
  weightStdDevKg: number;
  avgBodyFatPercent: number;
  bfStdDevPercent: number;
  avgMonthlyWeightChangeKg: number;
  avgMonthlyBfChangePercent: number;
}

export interface EvolutionComparisonPoint {
  date: string;
  displayDate: string;
  eventLabel?: string;
  patientWeightKg: number;
  patientBodyFatPercent?: number;
  patientLeanMassKg?: number;
  clinicAvgWeightKg: number;
  clinicAvgBodyFatPercent: number;
  clinicWeightRangeMin: number;
  clinicWeightRangeMax: number;
  clinicBfRangeMin: number;
  clinicBfRangeMax: number;
  weightDeltaKg: number;
  bfDeltaPercent?: number;
  isProjected?: boolean;
}

export * from './nutritionLabel';
export * from './hemo';



