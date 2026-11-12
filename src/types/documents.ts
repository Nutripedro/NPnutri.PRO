/**
 * Interfaces e Tipos da Central Documental Clínica
 * Padrão Clean Sage & Saúde Digital
 */

export type DocumentCategory = 
  | 'relatorios' 
  | 'declaracoes' 
  | 'exames' 
  | 'recibos' 
  | 'prescricoes';

export type DocumentType = 
  | 'relatorio_evolucao'
  | 'informe_irpf'
  | 'declaracao_comparecimento'
  | 'declaracao_acompanhamento'
  | 'requisicao_exames'
  | 'recibo_honorarios'
  | 'receituario_magistral'
  | 'prescricao_dieta';

export interface ProfessionalContext {
  id: string;
  name: string;
  crn: string;
  specialty: string;
  clinicName: string;
  unit: string;
  address: string;
  phone: string;
  email: string;
  cpfCnpj?: string;
  signatureUrl?: string;
}

export interface PatientContext {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  age: number;
  sex: 'male' | 'female';
  phone: string;
  email: string;
  heightCm: number;
  currentWeightKg: number;
  initialWeightKg?: number;
  recordNumber: string;
  unit: string;
}

// ---------------------------------------------------------------------------
// Modelos de Dados por Documento
// ---------------------------------------------------------------------------

// 1. Relatório de Evolução
export interface ClinicalReportData {
  title: string;
  evaluationDate: string;
  objective: string;
  currentWeightKg: number;
  weightDeltaKg: number;
  currentImc: number;
  currentBodyFatPercent: number;
  leanMassKg: number;
  fatMassKg: number;
  sumSkinfoldsMm?: number;
  waistCm?: number;
  rcq?: number;
  phaseAngle?: number;
  evolutionHighlights: string[];
  clinicalOpinion: string;
  nextSteps: string;
  includeAnthropometry: boolean;
  includeBioimpedance: boolean;
  includeSkinfolds: boolean;
}

// 2. Informe Anual IRPF (Padrão Receita Federal)
export interface IrpfReceiptItem {
  date: string;
  receiptNumber: string;
  serviceDescription: string;
  valueBrl: number;
}

export interface IrpfReportData {
  calendarYear: number;
  professionalName: string;
  professionalCpfCnpj: string;
  professionalCrn: string;
  patientName: string;
  patientCpf: string;
  totalPaidBrl: number;
  receipts: IrpfReceiptItem[];
  declarationText: string;
  city: string;
  issueDate: string;
}

// 3. Declaração de Comparecimento
export interface AttendanceDeclarationData {
  consultationDate: string;
  startTime: string; // "14:30"
  endTime: string;   // "15:45"
  patientName: string;
  patientCpf: string;
  hasCompanion: boolean;
  companionName?: string;
  companionCpf?: string;
  companionKinship?: string; // "Cônjuge", "Mãe", etc.
  purpose: 'atendimento_nutricional' | 'avaliacao_antropometrica' | 'retorno_clinico';
  customText?: string;
  city: string;
  issueDate: string;
}

// 4. Declaração de Acompanhamento Nutricional Regular
export interface NutritionDeclarationData {
  patientName: string;
  patientCpf: string;
  startDate: string;
  frequency: string; // "Mensal", "Quinzenal"
  purposeScope: 'academia_atividade_fisica' | 'cirurgia_bariatrica' | 'concurso_clube' | 'plano_saude' | 'geral';
  statementBody: string;
  dietaryPlanAdherence: string;
  physicalActivityClearance: boolean;
  city: string;
  issueDate: string;
}

// 5. Requisição de Exames Laboratoriais Integrativos
export interface RequestedLabExam {
  id: string;
  name: string;
  panel: string;
  clinicalJustification: string;
  idealValueGreen: string;   // Meta Medicina Integrativa / Nutrologia
  referenceYellow: string;   // Referência convencional de laboratório
  selected: boolean;
}

export interface LabExamRequestData {
  requestDate: string;
  urgency: 'rotina' | 'urgente' | 'acompanhamento_trimestral';
  clinicalIndication: string;
  selectedExams: RequestedLabExam[];
  fastingHours: number; // ex: 12
  biotinSuspensionAlert: boolean; // Alerta suspensão 72h antes
  specialInstructions: string;
  diagnosticHypothesis?: string;
  city: string;
}

// 6. Recibo Profissional de Honorários
export interface ReceiptData {
  receiptNumber: string;
  valueBrl: number;
  valueInWords: string; // "Cento e cinquenta reais"
  paymentDate: string;
  paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia';
  serviceRendered: string; // "Consulta de Avaliação Nutricional e Prescrição Dietética"
  payerName: string;
  payerCpfCnpj: string;
  patientName: string;
  patientCpf: string;
  professionalName: string;
  professionalCpfCnpj: string;
  professionalCrn: string;
  city: string;
  issueDate: string;
}

// 7. Receituário Magistral de Suplementos e Fórmulas
export interface PrescribedSupplementFormula {
  id: string;
  title: string; // ex: "Fórmula Otimizadora do Sono & Sono Reparador"
  pharmaceuticalForm: 'capsulas' | 'sache' | 'solucao_gotas' | 'po_efervescente' | 'tintura' | 'creme';
  quantityToDispense: string; // "60 doses", "1 frasco de 30ml"
  actives: {
    name: string;
    chemicalForm: string; // ex: "Bisglicinato", "Metilcobalamina"
    dosage: string;       // ex: "250mg", "1000mcg"
  }[];
  posology: string;       // ex: "Ingerir 1 dose (2 cápsulas) 45 minutos antes de dormir"
  timing: string;         // "Noite", "Manhã em jejum", "Pós-treino"
  clinicalIndications: string;
  warnings?: string;
}

export interface SupplementPrescriptionData {
  prescriptionDate: string;
  usageType: 'uso_interno' | 'uso_externo' | 'misto';
  treatmentDuration: string; // "60 dias", "Uso contínuo"
  formulas: PrescribedSupplementFormula[];
  generalRecommendations: string[];
  city: string;
}

// 8. Prescrição de Plano Alimentar
export interface DietMealItem {
  time: string;
  name: string; // "Café da Manhã"
  foods: string[];
  notes?: string;
}

export interface DietPrescriptionData {
  prescriptionDate: string;
  dailyCaloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterIntakeMl: number;
  objective: string;
  meals: DietMealItem[];
  guidelines: string[];
  forbiddenFoods?: string[];
  allowedSubstitutions?: string[];
  city: string;
}

// ---------------------------------------------------------------------------
// Documento Salvo no Prontuário / Histórico
// ---------------------------------------------------------------------------
export interface SavedClinicalDocument {
  id: string;
  patientId: string;
  patientName: string;
  type: DocumentType;
  category: DocumentCategory;
  title: string;
  issuedAt: string;
  professionalName: string;
  professionalCrn: string;
  authHash: string; // Hash SHA-256 ou código de autenticação (ex: DOC-2026-F8A9)
  contentSummary: string;
  data: 
    | ClinicalReportData 
    | IrpfReportData 
    | AttendanceDeclarationData 
    | NutritionDeclarationData 
    | LabExamRequestData 
    | ReceiptData 
    | SupplementPrescriptionData 
    | DietPrescriptionData;
}
