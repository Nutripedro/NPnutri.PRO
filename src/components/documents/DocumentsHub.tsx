import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  CheckSquare, 
  Receipt, 
  Pill, 
  Sparkles, 
  Eye, 
  History, 
  Plus, 
  Search, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Download, 
  Printer, 
  Share2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { InfoHelpButton } from '../help/InfoHelpButton';
import { ClinicalTooltip } from '../help/ClinicalTooltip';
import { 
  Patient, 
  Professional, 
  AppSettings, 
  AnthropometryEvaluation,
  BioimpedanceEvaluation,
  DietPlan
} from '../../types';
import { 
  DocumentCategory, 
  DocumentType, 
  ProfessionalContext, 
  PatientContext,
  ClinicalReportData,
  IrpfReportData,
  AttendanceDeclarationData,
  NutritionDeclarationData,
  LabExamRequestData,
  ReceiptData,
  SupplementPrescriptionData,
  DietPrescriptionData,
  SavedClinicalDocument,
  RequestedLabExam
} from '../../types/documents';
import { CLINICAL_LAB_EXAMS, CLINICAL_SUPPLEMENTS } from '../../data/clinicalData';
import { 
  generateDocumentHash, 
  numberToPortugueseWords, 
  formatCpf, 
  formatPhone 
} from '../../utils/documentUtils';

import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ClinicalReportTemplate } from './templates/ClinicalReportTemplate';
import { AttendanceDeclarationTemplate } from './templates/AttendanceDeclarationTemplate';
import { LabExamRequestTemplate } from './templates/LabExamRequestTemplate';
import { ReceiptTemplate } from './templates/ReceiptTemplate';
import { SupplementPrescriptionTemplate } from './templates/SupplementPrescriptionTemplate';
import { NutritionDeclarationTemplate } from './templates/NutritionDeclarationTemplate';
import { IrpfReportTemplate } from './templates/IrpfReportTemplate';
import { DietPrescriptionTemplate } from './templates/DietPrescriptionTemplate';

interface DocumentsHubProps {
  currentPatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  professional?: Professional;
  settings?: AppSettings;
  anthroData?: AnthropometryEvaluation;
  biaData?: BioimpedanceEvaluation;
  dietPlan?: DietPlan;
}

export const DocumentsHub: React.FC<DocumentsHubProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  professional,
  settings,
  anthroData,
  biaData,
  dietPlan
}) => {
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>('relatorios');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('relatorio_evolucao');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [viewHistory, setViewHistory] = useState<boolean>(false);

  // Search in templates/exams
  const [examSearchFilter, setExamSearchFilter] = useState<string>('');
  const [supplementSearchFilter, setSupplementSearchFilter] = useState<string>('');

  // -------------------------------------------------------------------------
  // Context Engine: Mapeamento determinístico de paciente e profissional
  // -------------------------------------------------------------------------
  const patientContext: PatientContext = useMemo(() => {
    return {
      id: currentPatient.id,
      name: currentPatient.name,
      cpf: currentPatient.cpf || '123.456.789-00',
      birthDate: currentPatient.birthDate || '1995-04-12',
      age: currentPatient.age || 30,
      sex: currentPatient.sex || 'male',
      phone: currentPatient.phone || '(11) 98765-4321',
      email: currentPatient.email || 'paciente@email.com',
      heightCm: currentPatient.heightCm || 178,
      currentWeightKg: currentPatient.currentWeightKg || 82.5,
      initialWeightKg: currentPatient.initialWeightKg || 87.0,
      recordNumber: currentPatient.recordNumber || 'PRONT-2024-001',
      unit: currentPatient.unit || 'São Paulo - Jardins'
    };
  }, [currentPatient]);

  const professionalContext: ProfessionalContext = useMemo(() => {
    return {
      id: professional?.id || 'prof-01',
      name: professional?.name || 'Dra. Gabriela Santos',
      crn: professional?.registrationCode || 'CRN-3 48910',
      specialty: professional?.specialty || 'Nutrição Clínica Avançada & Funcional',
      clinicName: settings?.clinicName || 'Clínica de Nutrição Avançada & Longevidade',
      unit: professional?.unit || settings?.unit || 'São Paulo - Jardins',
      address: 'Av. Brigadeiro Faria Lima, 2500 - Jardins, São Paulo - SP',
      phone: professional?.phone || '(11) 99988-7766',
      email: professional?.email || 'contato@nutricaoavancada.com.br',
      cpfCnpj: professional?.cpf || '111.222.333-44'
    };
  }, [professional, settings]);

  // -------------------------------------------------------------------------
  // Estados Locais Editáveis de Cada Tipo de Documento
  // -------------------------------------------------------------------------
  
  // 1. Relatório Clínico
  const [reportData, setReportData] = useState<ClinicalReportData>(() => ({
    title: 'Relatório de Evolução Nutricional e Antropométrica',
    evaluationDate: new Date().toISOString().split('T')[0],
    objective: currentPatient.goal || 'Hipertrofia limpa com redução percentual de gordura visceral',
    currentWeightKg: currentPatient.currentWeightKg || 82.5,
    weightDeltaKg: (currentPatient.currentWeightKg || 82.5) - (currentPatient.initialWeightKg || 87.0),
    currentImc: currentPatient.imc || 26.0,
    currentBodyFatPercent: anthroData?.bodyFatPercent || 16.4,
    leanMassKg: anthroData?.leanMassKg || 68.9,
    fatMassKg: anthroData?.fatMassKg || 13.6,
    sumSkinfoldsMm: anthroData?.sumSkinfoldsMm || 84.5,
    waistCm: 79.0,
    rcq: 0.77,
    phaseAngle: 7.2,
    evolutionHighlights: [
      'Redução de 4,5 kg de gordura corporal desde o início do acompanhamento.',
      'Aumento expressivo na espessura do perímetro de braço e retenção de massa magra.',
      'Melhora relatada no vigor matinal, sono reparador e ausência de compulsão tardia.'
    ],
    clinicalOpinion: 'Paciente demonstra excelente adesão à prescrição dietética e ao plano de hidratação. Observa-se redução expressiva nos perímetros corporais e manutenção da massa livre de gordura. Recomenda-se a continuidade da estratégia atual com ajustes na ingestão proteica peri-treino.',
    nextSteps: 'Manter fracionamento de 5 refeições, hidratação de 35ml/kg e retornar em 45 dias para reavaliação com fotogrametria comparativa.',
    includeAnthropometry: true,
    includeBioimpedance: true,
    includeSkinfolds: true
  }));

  // 2. Informe IRPF
  const [irpfData, setIrpfData] = useState<IrpfReportData>(() => ({
    calendarYear: new Date().getFullYear(),
    professionalName: professionalContext.name,
    professionalCpfCnpj: professionalContext.cpfCnpj || '111.222.333-44',
    professionalCrn: professionalContext.crn,
    patientName: currentPatient.name,
    patientCpf: currentPatient.cpf || '123.456.789-00',
    totalPaidBrl: 1800.00,
    receipts: [
      { date: '15/01/2026', receiptNumber: 'REC-2026-012', serviceDescription: 'Consulta Inicial e Avaliação ISAK', valueBrl: 450.00 },
      { date: '18/02/2026', receiptNumber: 'REC-2026-048', serviceDescription: 'Retorno Clínico e Ajuste de Macros', valueBrl: 450.00 },
      { date: '25/03/2026', receiptNumber: 'REC-2026-089', serviceDescription: 'Reavaliação por Bioimpedância 4C', valueBrl: 450.00 },
      { date: '29/04/2026', receiptNumber: 'REC-2026-134', serviceDescription: 'Consulta e Prescrição Magistral', valueBrl: 450.00 }
    ],
    declarationText: 'Comprovante anual emitido para dedução de despesas médicas na declaração de ajuste anual do IRPF.',
    city: 'São Paulo - SP',
    issueDate: new Date().toISOString().split('T')[0]
  }));

  // 3. Declaração de Comparecimento
  const [attendanceData, setAttendanceData] = useState<AttendanceDeclarationData>(() => ({
    consultationDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:15',
    patientName: currentPatient.name,
    patientCpf: currentPatient.cpf || '123.456.789-00',
    hasCompanion: false,
    companionName: '',
    companionCpf: '',
    companionKinship: 'Cônjuge',
    purpose: 'atendimento_nutricional',
    customText: '',
    city: 'São Paulo - SP',
    issueDate: new Date().toISOString().split('T')[0]
  }));

  // 4. Declaração de Acompanhamento Regular
  const [nutritionDeclarationData, setNutritionDeclarationData] = useState<NutritionDeclarationData>(() => ({
    patientName: currentPatient.name,
    patientCpf: currentPatient.cpf || '123.456.789-00',
    startDate: '2024-01-15',
    frequency: 'Mensal',
    purposeScope: 'academia_atividade_fisica',
    statementBody: 'O paciente mantém plano alimentar equilibrado e avaliação da composição corporal estável, encontrando-se apto para atividades esportivas supervisionadas.',
    dietaryPlanAdherence: 'Excelente adesão ao plano de micronutrientes e balanço hídrico.',
    physicalActivityClearance: true,
    city: 'São Paulo - SP',
    issueDate: new Date().toISOString().split('T')[0]
  }));

  // 5. Requisição de Exames
  const [labExamData, setLabExamData] = useState<LabExamRequestData>(() => {
    const initialExams: RequestedLabExam[] = CLINICAL_LAB_EXAMS.map(exam => ({
      id: exam.id,
      name: exam.name,
      panel: exam.panel,
      clinicalJustification: exam.clinicalJustification,
      idealValueGreen: exam.idealValueGreen,
      referenceYellow: exam.referenceYellow,
      // Selecionar alguns essenciais por padrão
      selected: ['exam-01', 'exam-02', 'exam-04', 'exam-07', 'exam-09', 'exam-12'].includes(exam.id)
    }));

    return {
      requestDate: new Date().toISOString().split('T')[0],
      urgency: 'rotina',
      clinicalIndication: 'Rastreamento metabólico, avaliação inflamatória e acompanhamento de perfil lipídico e glicêmico.',
      selectedExams: initialExams,
      fastingHours: 12,
      biotinSuspensionAlert: true,
      specialInstructions: 'Evitar consumo de álcool e treinos extenuantes nas 24h antecedentes à coleta.',
      city: 'São Paulo - SP'
    };
  });

  // 6. Recibo de Honorários
  const [receiptData, setReceiptData] = useState<ReceiptData>(() => ({
    receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    valueBrl: 450.00,
    valueInWords: numberToPortugueseWords(450.00),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix',
    serviceRendered: 'Consulta Clínica de Avaliação Nutricional, Antropometria ISAK e Prescrição Dietética',
    payerName: currentPatient.name,
    payerCpfCnpj: currentPatient.cpf || '123.456.789-00',
    patientName: currentPatient.name,
    patientCpf: currentPatient.cpf || '123.456.789-00',
    professionalName: professionalContext.name,
    professionalCpfCnpj: professionalContext.cpfCnpj || '111.222.333-44',
    professionalCrn: professionalContext.crn,
    city: 'São Paulo - SP',
    issueDate: new Date().toISOString().split('T')[0]
  }));

  // 7. Receituário Magistral
  const [supplementData, setSupplementData] = useState<SupplementPrescriptionData>(() => ({
    prescriptionDate: new Date().toISOString().split('T')[0],
    usageType: 'uso_interno',
    treatmentDuration: '60 dias',
    formulas: [
      {
        id: 'formula-01',
        title: 'Fórmula Noturna & Otimização de Sono Profundo',
        pharmaceuticalForm: 'capsulas',
        quantityToDispense: '60 doses',
        actives: [
          { name: 'Magnésio Inositol', chemicalForm: 'Quelato / Mio-inositol', dosage: '350mg' },
          { name: 'L-Teanina', chemicalForm: 'Grau Farmacêutico', dosage: '200mg' },
          { name: 'Zinco Quelado', chemicalForm: 'Bisglicinato', dosage: '15mg' },
          { name: 'Piridoxal-5-Fosfato (Vitamina B6)', chemicalForm: 'Forma ativa', dosage: '20mg' }
        ],
        posology: 'Ingerir 1 dose (2 cápsulas) 45 minutos antes de deitar com 100ml de água.',
        timing: 'Noite (antes de dormir)',
        clinicalIndications: 'Indução da fase 3 do sono não-REM, relaxamento neuromuscular e alívio do estresse.',
        warnings: 'Não associar com bebidas alcoólicas ou sedativos sintéticos.'
      },
      {
        id: 'formula-02',
        title: 'Composto Antioxidante Mitocondrial & Longevidade',
        pharmaceuticalForm: 'capsulas',
        quantityToDispense: '60 doses',
        actives: [
          { name: 'Coenzima Q10', chemicalForm: 'Ubiquinona micronizada', dosage: '100mg' },
          { name: 'Ácido Alfa-Lipóico', chemicalForm: 'R-ALA', dosage: '150mg' },
          { name: 'Trans-Resveratrol', chemicalForm: 'Polygonum cuspidatum', dosage: '100mg' }
        ],
        posology: 'Ingerir 1 dose pela manhã junto à refeição que contenha lipídios saudáveis.',
        timing: 'Café da manhã',
        clinicalIndications: 'Biogênese mitocondrial, suporte cardiovascular e neutralização de espécies reativas de oxigênio.'
      }
    ],
    generalRecommendations: [
      'Manipular em farmácia de manipulação certificada com Boas Práticas (RDC 67/2007).',
      'Manter os frascos ao abrigo de luz, calor e umidade excessiva.',
      'Em caso de gravidez, amamentação ou efeito adverso, suspender e contatar o consultório.'
    ],
    city: 'São Paulo - SP'
  }));

  // 8. Prescrição do Plano Alimentar
  const [dietPrescriptionData, setDietPrescriptionData] = useState<DietPrescriptionData>(() => ({
    prescriptionDate: new Date().toISOString().split('T')[0],
    dailyCaloriesKcal: dietPlan?.calorieTargetKcal || 2150,
    proteinGrams: dietPlan?.proteinGrams || 155,
    carbsGrams: dietPlan?.carbsGrams || 230,
    fatGrams: dietPlan?.fatGrams || 58,
    waterIntakeMl: 2800,
    objective: currentPatient.goal || 'Composição Corporal Otimizada',
    meals: [
      {
        time: '07:30',
        name: 'Café da Manhã Energético',
        foods: [
          '3 ovos mexidos com cúrcuma e azeite extravirgem (5ml)',
          '2 fatias de pão integral de fermentação natural (60g)',
          '1 xícara de café puro sem açúcar ou chá verde',
          '1 fatia média de mamão formosa (120g) com 1 colher de sopa de sementes de chia (15g)'
        ],
        notes: 'Excelente aporte de colina, proteínas de alto valor biológico e carotenoides.'
      },
      {
        time: '12:30',
        name: 'Almoço Funcional',
        foods: [
          'Filé de peito de frango grelhado ou tilápia (150g peso cozido)',
          'Arroz integral ou batata-doce assada (140g)',
          'Feijão carioca ou lentilha cozida (80g)',
          'Prato cheio de salada crua variada (rúcula, alface romana, tomate, cenoura ralada) temperada com 10ml de azeite e limão'
        ]
      },
      {
        time: '16:30',
        name: 'Lanche Pré-Treino / Tarde',
        foods: [
          'Iogurte natural desnatado ou grego sem açúcar (170g)',
          '1 scoop de Whey Protein Isolado (30g)',
          '1 banana prata picada (70g) com aveia em flocos finos (20g)'
        ]
      },
      {
        time: '20:00',
        name: 'Jantar Reparador',
        foods: [
          'Patinho moído ou filé de salmão (130g)',
          'Abóbora cabotiá cozida no vapor com alecrim (120g)',
          'Mix de folhas verdes escuras (espinafre, couve) refogados rapidamente'
        ]
      }
    ],
    guidelines: [
      'Manter a ingestão hídrica distribuída ao longo do dia, cessando grandes volumes 1h antes de dormir.',
      'Mastigar cada garfada calmamente, pausando os talheres na mesa entre as porções.',
      'Priorizar alimentos frescos (in natura) e evitar ultraprocessados com excesso de xarope de frutose.'
    ],
    city: 'São Paulo - SP'
  }));

  // -------------------------------------------------------------------------
  // Histórico de Documentos Salvos no Prontuário
  // -------------------------------------------------------------------------
  const [savedDocuments, setSavedDocuments] = useState<SavedClinicalDocument[]>(() => {
    const saved = localStorage.getItem(`nutri_saved_docs_${currentPatient.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Documento inicial de demonstração
    return [
      {
        id: 'doc-demo-01',
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        type: 'relatorio_evolucao',
        category: 'relatorios',
        title: 'Relatório Evolutivo T0 vs T1',
        issuedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        professionalName: professionalContext.name,
        professionalCrn: professionalContext.crn,
        authHash: generateDocumentHash('demo-01'),
        contentSummary: 'Redução de gordura corporal (-2.4kg), ganho de massa magra e alcance de metas metabólicas.',
        data: reportData
      }
    ];
  });

  // -------------------------------------------------------------------------
  // Context Engine: Sincronização e Preenchimento Automático Dinâmico
  // -------------------------------------------------------------------------
  useEffect(() => {
    // 1. Atualizar dados do paciente no Relatório de Evolução
    setReportData(prev => ({
      ...prev,
      objective: currentPatient.goal || prev.objective,
      currentWeightKg: currentPatient.currentWeightKg || prev.currentWeightKg,
      weightDeltaKg: (currentPatient.currentWeightKg || prev.currentWeightKg) - (currentPatient.initialWeightKg || currentPatient.currentWeightKg || 0),
      currentImc: currentPatient.imc || (currentPatient.heightCm ? (currentPatient.currentWeightKg / ((currentPatient.heightCm / 100) ** 2)) : prev.currentImc),
      currentBodyFatPercent: anthroData?.bodyFatPercent ?? prev.currentBodyFatPercent,
      leanMassKg: anthroData?.leanMassKg ?? prev.leanMassKg,
      fatMassKg: anthroData?.fatMassKg ?? prev.fatMassKg,
      sumSkinfoldsMm: anthroData?.sumSkinfoldsMm ?? prev.sumSkinfoldsMm
    }));

    // 2. Atualizar Informe IRPF
    setIrpfData(prev => ({
      ...prev,
      patientName: currentPatient.name,
      patientCpf: currentPatient.cpf || '123.456.789-00',
      professionalName: professionalContext.name,
      professionalCpfCnpj: professionalContext.cpfCnpj || '111.222.333-44',
      professionalCrn: professionalContext.crn
    }));

    // 3. Atualizar Declaração de Comparecimento
    setAttendanceData(prev => ({
      ...prev,
      patientName: currentPatient.name,
      patientCpf: currentPatient.cpf || '123.456.789-00'
    }));

    // 4. Atualizar Declaração de Acompanhamento Regular
    setNutritionDeclarationData(prev => ({
      ...prev,
      patientName: currentPatient.name,
      patientCpf: currentPatient.cpf || '123.456.789-00'
    }));

    // 5. Atualizar Recibo de Honorários
    setReceiptData(prev => ({
      ...prev,
      patientName: currentPatient.name,
      patientCpf: currentPatient.cpf || '123.456.789-00',
      payerName: prev.payerName === prev.patientName ? currentPatient.name : prev.payerName,
      payerCpfCnpj: prev.payerCpfCnpj === prev.patientCpf ? (currentPatient.cpf || '123.456.789-00') : prev.payerCpfCnpj,
      professionalName: professionalContext.name,
      professionalCpfCnpj: professionalContext.cpfCnpj || '111.222.333-44',
      professionalCrn: professionalContext.crn
    }));

    // 6. Atualizar Prescrição Dietética se houver dietPlan
    if (dietPlan) {
      setDietPrescriptionData(prev => ({
        ...prev,
        dailyCaloriesKcal: dietPlan.calorieTargetKcal || prev.dailyCaloriesKcal,
        proteinGrams: dietPlan.proteinGrams || prev.proteinGrams,
        carbsGrams: dietPlan.carbsGrams || prev.carbsGrams,
        fatGrams: dietPlan.fatGrams || prev.fatGrams,
        objective: currentPatient.goal || prev.objective
      }));
    }

    // 7. Carregar histórico persistente do paciente ativo
    const saved = localStorage.getItem(`nutri_saved_docs_${currentPatient.id}`);
    if (saved) {
      try {
        setSavedDocuments(JSON.parse(saved));
      } catch {
        // manter
      }
    } else {
      setSavedDocuments([
        {
          id: `doc-demo-${currentPatient.id}`,
          patientId: currentPatient.id,
          patientName: currentPatient.name,
          type: 'relatorio_evolucao',
          category: 'relatorios',
          title: 'Relatório Evolutivo T0 vs T1',
          issuedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
          professionalName: professionalContext.name,
          professionalCrn: professionalContext.crn,
          authHash: generateDocumentHash(`demo-${currentPatient.id}`),
          contentSummary: 'Redução de gordura corporal, recomposição física e alcance de metas metabólicas.',
          data: reportData
        }
      ]);
    }
  }, [currentPatient, professionalContext, anthroData, dietPlan]);

  // Salvar documento atual no histórico
  const handleSaveCurrentDocument = () => {
    const hash = generateDocumentHash({
      patientId: currentPatient.id,
      docType: selectedDocType,
      time: Date.now()
    });

    let currentPayload: any = reportData;
    let docTitle = 'Documento Clínico';

    if (selectedDocType === 'relatorio_evolucao') {
      currentPayload = reportData;
      docTitle = 'Relatório de Evolução Nutricional';
    } else if (selectedDocType === 'informe_irpf') {
      currentPayload = irpfData;
      docTitle = `Informe IRPF Ano ${irpfData.calendarYear}`;
    } else if (selectedDocType === 'declaracao_comparecimento') {
      currentPayload = attendanceData;
      docTitle = 'Declaração de Comparecimento';
    } else if (selectedDocType === 'declaracao_acompanhamento') {
      currentPayload = nutritionDeclarationData;
      docTitle = 'Declaração de Acompanhamento Regular';
    } else if (selectedDocType === 'requisicao_exames') {
      currentPayload = labExamData;
      docTitle = 'Requisição de Exames Laboratoriais Integrativos';
    } else if (selectedDocType === 'recibo_honorarios') {
      currentPayload = receiptData;
      docTitle = `Recibo de Honorários nº ${receiptData.receiptNumber}`;
    } else if (selectedDocType === 'receituario_magistral') {
      currentPayload = supplementData;
      docTitle = 'Receituário Magistral de Suplementos';
    } else if (selectedDocType === 'prescricao_dieta') {
      currentPayload = dietPrescriptionData;
      docTitle = 'Prescrição do Plano Alimentar';
    }

    const newDoc: SavedClinicalDocument = {
      id: `doc-${Date.now()}`,
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      type: selectedDocType,
      category: activeCategory,
      title: docTitle,
      issuedAt: new Date().toISOString(),
      professionalName: professionalContext.name,
      professionalCrn: professionalContext.crn,
      authHash: hash,
      contentSummary: `Documento oficial emitido em ${new Date().toLocaleDateString('pt-BR')} para ${currentPatient.name}.`,
      data: currentPayload
    };

    const updated = [newDoc, ...savedDocuments];
    setSavedDocuments(updated);
    try {
      localStorage.setItem(`nutri_saved_docs_${currentPatient.id}`, JSON.stringify(updated));
    } catch {}
  };

  // Hash dinâmico para o documento atual
  const currentAuthHash = useMemo(() => {
    return generateDocumentHash(`${selectedDocType}-${currentPatient.id}`);
  }, [selectedDocType, currentPatient.id]);

  // Documentos nas 5 Abas
  const categoryTabs = [
    { id: 'relatorios' as DocumentCategory, label: '1. Relatórios', icon: FileSpreadsheet, count: 2 },
    { id: 'declaracoes' as DocumentCategory, label: '2. Declarações', icon: FileText, count: 2 },
    { id: 'exames' as DocumentCategory, label: '3. Requisição de Exames', icon: CheckSquare, count: 1, highlight: true },
    { id: 'recibos' as DocumentCategory, label: '4. Recibos & IRPF', icon: Receipt, count: 1 },
    { id: 'prescricoes' as DocumentCategory, label: '5. Receituários & Prescrições', icon: Pill, count: 2 }
  ];

  // Alternar exame selecionado
  const toggleExam = (id: string) => {
    setLabExamData(prev => ({
      ...prev,
      selectedExams: prev.selectedExams.map(e => e.id === id ? { ...e, selected: !e.selected } : e)
    }));
  };

  // Selecionar todos os exames
  const toggleAllExams = (select: boolean) => {
    setLabExamData(prev => ({
      ...prev,
      selectedExams: prev.selectedExams.map(e => ({ ...e, selected: select }))
    }));
  };

  // Renderizador do Template ativo para o Modal de Pré-visualização
  const renderActiveTemplate = () => {
    switch (selectedDocType) {
      case 'relatorio_evolucao':
        return (
          <ClinicalReportTemplate
            professional={professionalContext}
            patient={patientContext}
            data={reportData}
            authHash={currentAuthHash}
          />
        );
      case 'informe_irpf':
        return (
          <IrpfReportTemplate
            professional={professionalContext}
            patient={patientContext}
            data={irpfData}
            authHash={currentAuthHash}
          />
        );
      case 'declaracao_comparecimento':
        return (
          <AttendanceDeclarationTemplate
            professional={professionalContext}
            patient={patientContext}
            data={attendanceData}
            authHash={currentAuthHash}
          />
        );
      case 'declaracao_acompanhamento':
        return (
          <NutritionDeclarationTemplate
            professional={professionalContext}
            patient={patientContext}
            data={nutritionDeclarationData}
            authHash={currentAuthHash}
          />
        );
      case 'requisicao_exames':
        return (
          <LabExamRequestTemplate
            professional={professionalContext}
            patient={patientContext}
            data={labExamData}
            authHash={currentAuthHash}
          />
        );
      case 'recibo_honorarios':
        return (
          <ReceiptTemplate
            professional={professionalContext}
            patient={patientContext}
            data={receiptData}
            authHash={currentAuthHash}
          />
        );
      case 'receituario_magistral':
        return (
          <SupplementPrescriptionTemplate
            professional={professionalContext}
            patient={patientContext}
            data={supplementData}
            authHash={currentAuthHash}
          />
        );
      case 'prescricao_dieta':
        return (
          <DietPrescriptionTemplate
            professional={professionalContext}
            patient={patientContext}
            data={dietPrescriptionData}
            authHash={currentAuthHash}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Context Engine do Paciente Ativo & Profissional */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#4A6B5D] text-white flex items-center justify-center font-bold font-serif text-lg shadow-xs">
              {currentPatient.avatarInitials || currentPatient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Central de Documentos Clínicos & Fiscais
                </h1>
                <span className="bg-[#4A6B5D]/10 text-[#4A6B5D] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#4A6B5D]/20">
                  Clean Sage
                </span>
                <InfoHelpButton helpId="relatorios_clinicos" size="xs" variant="emerald" title="Explicativo sobre emissão de relatórios, declarações e atestados" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Emissão formal, assinatura digital, conformidade com CFN e exportação em alta resolução (A4).
              </p>
            </div>
          </div>

          {/* Seletor Rápido de Paciente e Alternância de Histórico */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Paciente Ativo:</span>
              <select
                value={currentPatient.id}
                onChange={(e) => {
                  const found = patients.find(p => p.id === e.target.value);
                  if (found) onSelectPatient(found);
                }}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.recordNumber || 'Prontuário'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setViewHistory(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                viewHistory 
                  ? 'bg-[#4A6B5D] text-white border-[#4A6B5D]' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Histórico ({savedDocuments.length})
            </button>
          </div>
        </div>

        {/* Faixa do Context Engine: Preenchimento Automático em Tempo Real */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#4A6B5D]/5 border border-[#4A6B5D]/15 rounded-lg px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
            </span>
            <span className="font-semibold text-slate-800">
              Context Engine Ativo: Preenchimento Automático Sincronizado
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              Paciente: <strong>{currentPatient.name}</strong> (CPF: <span className="font-mono">{formatCpf(currentPatient.cpf || '')}</span>)
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span>Profissional Emitente:</span>
            <strong className="text-[#4A6B5D]">{professionalContext.name}</strong>
            <span className="bg-[#4A6B5D]/10 text-[#4A6B5D] px-2 py-0.5 rounded font-mono font-bold text-[10px]">
              {professionalContext.crn}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Menu Lateral dos 5 Pilares + Área de Configuração & Edição Prévia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Menu Lateral dos 5 Pilares Documentais */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 pt-2 pb-1 block">
            Pilares Documentais
          </span>

          {categoryTabs.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setViewHistory(false);
                  // Ajusta documento padrão da aba
                  if (cat.id === 'relatorios') setSelectedDocType('relatorio_evolucao');
                  if (cat.id === 'declaracoes') setSelectedDocType('declaracao_comparecimento');
                  if (cat.id === 'exames') setSelectedDocType('requisicao_exames');
                  if (cat.id === 'recibos') setSelectedDocType('recibo_honorarios');
                  if (cat.id === 'prescricoes') setSelectedDocType('prescricao_dieta');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive 
                    ? 'bg-[#4A6B5D] text-white shadow-xs font-semibold' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#4A6B5D]'}`} />
                  <span>{cat.label}</span>
                </div>
                {cat.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                )}
              </button>
            );
          })}

          <div className="border-t border-slate-100 my-2 pt-2 px-3">
            <div className="bg-[#4A6B5D]/5 border border-[#4A6B5D]/20 rounded-lg p-2.5 text-[11px] text-slate-600">
              <span className="font-semibold text-[#4A6B5D] block mb-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                Assinatura & Hash
              </span>
              Todos os modelos possuem timbragem elegante, carimbo do CRN e QR Code criptográfico rastreável.
            </div>
          </div>
        </div>

        {/* Área Central: Configuração & Edição Prévia do Documento Selecionado */}
        <div className="lg:col-span-9 space-y-5">
          {viewHistory ? (
            /* Visualização do Histórico de Documentos Salvos */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Histórico de Documentos do Paciente: {currentPatient.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Documentos gerados e registrados no prontuário eletrônico com hash de autenticidade.
                  </p>
                </div>
                <button
                  onClick={() => setViewHistory(false)}
                  className="text-xs text-[#4A6B5D] font-semibold hover:underline"
                >
                  Voltar à Emissão
                </button>
              </div>

              {savedDocuments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum documento salvo até o momento para este paciente.
                </div>
              ) : (
                <div className="space-y-3">
                  {savedDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                          <span className="bg-[#4A6B5D]/10 text-[#4A6B5D] text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                            {doc.authHash.substring(0, 17)}...
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Emitido em: {new Date(doc.issuedAt).toLocaleString('pt-BR')} • {doc.professionalName} ({doc.professionalCrn})
                        </p>
                        <p className="text-xs text-slate-600 mt-1 italic">
                          {doc.contentSummary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedDocType(doc.type);
                            setIsPreviewOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-[#4A6B5D] hover:bg-[#3d594c] text-white shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Visualizar / Imprimir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Formulário de Configuração & Edição do Documento Atual */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              {/* Seletor do Subtipo de Documento da Categoria */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Modelo:</span>
                  {activeCategory === 'relatorios' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDocType('relatorio_evolucao')}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          selectedDocType === 'relatorio_evolucao'
                            ? 'bg-[#4A6B5D] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Relatório de Evolução & Antropometria
                      </button>
                      <button
                        onClick={() => setSelectedDocType('informe_irpf')}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          selectedDocType === 'informe_irpf'
                            ? 'bg-[#4A6B5D] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Informe Anual IRPF (Receita Federal)
                      </button>
                    </div>
                  )}

                  {activeCategory === 'declaracoes' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDocType('declaracao_comparecimento')}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          selectedDocType === 'declaracao_comparecimento'
                            ? 'bg-[#4A6B5D] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Declaração de Comparecimento (Horário)
                      </button>
                      <button
                        onClick={() => setSelectedDocType('declaracao_acompanhamento')}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          selectedDocType === 'declaracao_acompanhamento'
                            ? 'bg-[#4A6B5D] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Declaração de Acompanhamento Regular
                      </button>
                    </div>
                  )}

                  {activeCategory === 'exames' && (
                    <span className="text-xs font-bold text-slate-800">
                      Requisição de Exames Laboratoriais Integrativos (Nutrologia)
                    </span>
                  )}

                  {activeCategory === 'recibos' && (
                    <span className="text-xs font-bold text-slate-800">
                      Recibo de Pagamento de Honorários Profissionais (Com Extenso)
                    </span>
                  )}

                  {activeCategory === 'prescricoes' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDocType('prescricao_dieta')}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          selectedDocType === 'prescricao_dieta'
                            ? 'bg-[#4A6B5D] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Prescrição do Plano Alimentar
                      </button>
                      <button
                        onClick={() => setSelectedDocType('receituario_magistral')}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          selectedDocType === 'receituario_magistral'
                            ? 'bg-[#4A6B5D] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Receituário Magistral de Suplementos
                      </button>
                    </div>
                  )}
                </div>

                {/* Botão de Pré-visualização A4 */}
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#4A6B5D] hover:bg-[#3d594c] text-white shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Pré-visualizar & Imprimir A4
                </button>
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* Formulários Específicos de Edição Prévia para cada Documento */}
              {/* ------------------------------------------------------------------ */}

              {/* 1. RELATÓRIO DE EVOLUÇÃO */}
              {selectedDocType === 'relatorio_evolucao' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Data da Avaliação:</label>
                      <input
                        type="date"
                        value={reportData.evaluationDate}
                        onChange={(e) => setReportData(prev => ({ ...prev, evaluationDate: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Peso Atual (kg):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={reportData.currentWeightKg}
                        onChange={(e) => setReportData(prev => ({ ...prev, currentWeightKg: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">% Gordura Corporal:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={reportData.currentBodyFatPercent}
                        onChange={(e) => setReportData(prev => ({ ...prev, currentBodyFatPercent: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Objetivo Terapêutico:</label>
                    <input
                      type="text"
                      value={reportData.objective}
                      onChange={(e) => setReportData(prev => ({ ...prev, objective: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Parecer Clínico & Análise Nutricional:</label>
                    <textarea
                      rows={3}
                      value={reportData.clinicalOpinion}
                      onChange={(e) => setReportData(prev => ({ ...prev, clinicalOpinion: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Metas & Próximos Passos:</label>
                    <input
                      type="text"
                      value={reportData.nextSteps}
                      onChange={(e) => setReportData(prev => ({ ...prev, nextSteps: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* 2. INFORME IRPF */}
              {selectedDocType === 'informe_irpf' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Ano-Calendário da Declaração:</label>
                      <input
                        type="number"
                        value={irpfData.calendarYear}
                        onChange={(e) => setIrpfData(prev => ({ ...prev, calendarYear: parseInt(e.target.value) || 2026 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Valor Total Quitado (R$):</label>
                      <input
                        type="number"
                        step="50"
                        value={irpfData.totalPaidBrl}
                        onChange={(e) => setIrpfData(prev => ({ ...prev, totalPaidBrl: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Cidade da Emissão:</label>
                      <input
                        type="text"
                        value={irpfData.city}
                        onChange={(e) => setIrpfData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-3">
                    <span className="font-bold text-slate-700 block mb-2">Recibos Vinculados no Ano ({irpfData.receipts?.length || 0}):</span>
                    <div className="space-y-2">
                      {irpfData.receipts?.map((rec, rIdx) => (
                        <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2 rounded border border-slate-200">
                          <input
                            type="text"
                            value={rec.date}
                            onChange={(e) => {
                              const updated = [...irpfData.receipts];
                              updated[rIdx].date = e.target.value;
                              setIrpfData(prev => ({ ...prev, receipts: updated }));
                            }}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                          />
                          <input
                            type="text"
                            value={rec.receiptNumber}
                            onChange={(e) => {
                              const updated = [...irpfData.receipts];
                              updated[rIdx].receiptNumber = e.target.value;
                              setIrpfData(prev => ({ ...prev, receipts: updated }));
                            }}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                          />
                          <input
                            type="text"
                            value={rec.serviceDescription}
                            onChange={(e) => {
                              const updated = [...irpfData.receipts];
                              updated[rIdx].serviceDescription = e.target.value;
                              setIrpfData(prev => ({ ...prev, receipts: updated }));
                            }}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-[10px]">R$</span>
                            <input
                              type="number"
                              value={rec.valueBrl}
                              onChange={(e) => {
                                const updated = [...irpfData.receipts];
                                updated[rIdx].valueBrl = parseFloat(e.target.value) || 0;
                                const total = updated.reduce((sum, item) => sum + item.valueBrl, 0);
                                setIrpfData(prev => ({ ...prev, receipts: updated, totalPaidBrl: total }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. DECLARAÇÃO DE COMPARECIMENTO */}
              {selectedDocType === 'declaracao_comparecimento' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Data da Consulta:</label>
                      <input
                        type="date"
                        value={attendanceData.consultationDate}
                        onChange={(e) => setAttendanceData(prev => ({ ...prev, consultationDate: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Horário de Início:</label>
                      <input
                        type="time"
                        value={attendanceData.startTime}
                        onChange={(e) => setAttendanceData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Horário de Término:</label>
                      <input
                        type="time"
                        value={attendanceData.endTime}
                        onChange={(e) => setAttendanceData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Finalidade Formal:</label>
                    <select
                      value={attendanceData.purpose}
                      onChange={(e) => setAttendanceData(prev => ({ ...prev, purpose: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                    >
                      <option value="atendimento_nutricional">Atendimento Nutricional Clínico</option>
                      <option value="avaliacao_antropometrica">Avaliação Antropométrica e Bioimpedância</option>
                      <option value="retorno_clinico">Retorno Clínico e Reavaliação Dietoterápica</option>
                    </select>
                  </div>

                  {/* Opção de Acompanhante */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={attendanceData.hasCompanion}
                        onChange={(e) => setAttendanceData(prev => ({ ...prev, hasCompanion: e.target.checked }))}
                        className="w-4 h-4 text-[#4A6B5D] rounded"
                      />
                      <span className="font-semibold text-slate-800">Incluir Acompanhante na Declaração</span>
                    </label>

                    {attendanceData.hasCompanion && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200">
                        <input
                          type="text"
                          placeholder="Nome do Acompanhante"
                          value={attendanceData.companionName || ''}
                          onChange={(e) => setAttendanceData(prev => ({ ...prev, companionName: e.target.value }))}
                          className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="CPF do Acompanhante"
                          value={attendanceData.companionCpf || ''}
                          onChange={(e) => setAttendanceData(prev => ({ ...prev, companionCpf: e.target.value }))}
                          className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Parentesco (ex: Mãe, Cônjuge)"
                          value={attendanceData.companionKinship || ''}
                          onChange={(e) => setAttendanceData(prev => ({ ...prev, companionKinship: e.target.value }))}
                          className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. DECLARAÇÃO DE ACOMPANHAMENTO REGULAR */}
              {selectedDocType === 'declaracao_acompanhamento' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Data de Início do Seguimento:</label>
                      <input
                        type="date"
                        value={nutritionDeclarationData.startDate}
                        onChange={(e) => setNutritionDeclarationData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Frequência das Consultas:</label>
                      <input
                        type="text"
                        value={nutritionDeclarationData.frequency}
                        onChange={(e) => setNutritionDeclarationData(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                        placeholder="ex: Mensal, Quinzenal"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Finalidade / Destino:</label>
                      <select
                        value={nutritionDeclarationData.purposeScope}
                        onChange={(e) => setNutritionDeclarationData(prev => ({ ...prev, purposeScope: e.target.value as any }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      >
                        <option value="academia_atividade_fisica">Academia & Atividade Física</option>
                        <option value="cirurgia_bariatrica">Bariátrica / Pré-operatório</option>
                        <option value="concurso_clube">Clube Recreativo / Concurso</option>
                        <option value="plano_saude">Plano de Saúde / Reembolso</option>
                        <option value="geral">Comprovação Geral</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Texto Adicional da Declaração:</label>
                    <textarea
                      rows={2}
                      value={nutritionDeclarationData.statementBody}
                      onChange={(e) => setNutritionDeclarationData(prev => ({ ...prev, statementBody: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nutritionDeclarationData.physicalActivityClearance}
                      onChange={(e) => setNutritionDeclarationData(prev => ({ ...prev, physicalActivityClearance: e.target.checked }))}
                      className="w-4 h-4 text-[#4A6B5D] rounded"
                    />
                    <span className="font-semibold text-slate-800">
                      Declarar que o paciente está plenamente apto do ponto de vista nutricional para treinos físicos
                    </span>
                  </label>
                </div>
              )}

              {/* 5. REQUISIÇÃO DE EXAMES LABORATORIAIS INTEGRATIVOS */}
              {selectedDocType === 'requisicao_exames' && (
                <div className="space-y-4 text-xs">
                  {/* Alerta de Biotina e Jejum */}
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Protocolo de Segurança para Exames:</span>
                      <p className="mt-0.5">
                        Alerta de suspensão de biotina (72h) configurado automaticamente para evitar interferência em ensaios hormonais.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Horas de Jejum:</label>
                      <input
                        type="number"
                        value={labExamData.fastingHours}
                        onChange={(e) => setLabExamData(prev => ({ ...prev, fastingHours: parseInt(e.target.value) || 12 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Caráter da Requisição:</label>
                      <select
                        value={labExamData.urgency}
                        onChange={(e) => setLabExamData(prev => ({ ...prev, urgency: e.target.value as any }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      >
                        <option value="rotina">Rotina Ambulatorial</option>
                        <option value="acompanhamento_trimestral">Acompanhamento Trimestral</option>
                        <option value="urgente">Prioritário / Urgente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Busca Rápida de Exame:</label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filtrar por nome ou analito..."
                          value={examSearchFilter}
                          onChange={(e) => setExamSearchFilter(e.target.value)}
                          className="w-full pl-8 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seleção de Exames com Checkboxes, Meta Verde e Ref Amarela */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-2.5 flex items-center justify-between border-b border-slate-200">
                      <span className="font-bold text-slate-700">
                        Painel de Exames ({labExamData.selectedExams.filter(e => e.selected).length} selecionados):
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAllExams(true)}
                          className="text-[11px] font-semibold text-[#4A6B5D] hover:underline"
                        >
                          Marcar Todos
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => toggleAllExams(false)}
                          className="text-[11px] font-semibold text-slate-500 hover:underline"
                        >
                          Desmarcar
                        </button>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
                      {labExamData.selectedExams
                        .filter(e => !examSearchFilter || e.name.toLowerCase().includes(examSearchFilter.toLowerCase()))
                        .map((exam) => (
                          <label
                            key={exam.id}
                            className={`flex items-start justify-between p-2 rounded cursor-pointer transition-colors ${
                              exam.selected ? 'bg-[#4A6B5D]/5' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={exam.selected}
                                onChange={() => toggleExam(exam.id)}
                                className="w-4 h-4 text-[#4A6B5D] rounded mt-0.5"
                              />
                              <div>
                                <span className={`font-semibold block ${exam.selected ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {exam.name}
                                </span>
                                <span className="text-[11px] text-slate-500">{exam.clinicalJustification}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 ml-3">
                              <span className="text-[11px] font-semibold text-[#16A34A] block">
                                Meta: {exam.idealValueGreen}
                              </span>
                              <span className="text-[10px] text-[#ca8a04] block">
                                Lab: {exam.referenceYellow}
                              </span>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. RECIBO DE HONORÁRIOS */}
              {selectedDocType === 'recibo_honorarios' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nº do Recibo:</label>
                      <input
                        type="text"
                        value={receiptData.receiptNumber}
                        onChange={(e) => setReceiptData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Valor dos Honorários (R$):</label>
                      <input
                        type="number"
                        step="10"
                        value={receiptData.valueBrl}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setReceiptData(prev => ({
                            ...prev,
                            valueBrl: val,
                            valueInWords: numberToPortugueseWords(val)
                          }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono font-bold text-base text-[#4A6B5D]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Forma de Pagamento:</label>
                      <select
                        value={receiptData.paymentMethod}
                        onChange={(e) => setReceiptData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      >
                        <option value="pix">PIX</option>
                        <option value="cartao_credito">Cartão de Crédito</option>
                        <option value="cartao_debito">Cartão de Débito</option>
                        <option value="dinheiro">Dinheiro em Espécie</option>
                        <option value="transferencia">Transferência Bancária</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Valor por Extenso (Gerado Automaticamente):</label>
                    <input
                      type="text"
                      value={receiptData.valueInWords}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, valueInWords: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 italic"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nome do Pagador:</label>
                      <input
                        type="text"
                        value={receiptData.payerName}
                        onChange={(e) => setReceiptData(prev => ({ ...prev, payerName: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">CPF do Pagador:</label>
                      <input
                        type="text"
                        value={receiptData.payerCpfCnpj}
                        onChange={(e) => setReceiptData(prev => ({ ...prev, payerCpfCnpj: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Discriminação do Serviço Prestado:</label>
                    <input
                      type="text"
                      value={receiptData.serviceRendered}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, serviceRendered: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* 7. RECEITUÁRIO MAGISTRAL */}
              {selectedDocType === 'receituario_magistral' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Fórmulas Manipuladas e Fitoterápicos:</span>
                      <p className="text-slate-500 text-[11px]">Personalização de ativos, formas químicas queladas e posologia.</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#4A6B5D] font-semibold bg-[#4A6B5D]/10 px-2 py-0.5 rounded">
                      {supplementData.formulas?.length || 0} fórmula(s)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {supplementData.formulas?.map((formula, fIdx) => (
                      <div key={fIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Título da Fórmula"
                            value={formula.title}
                            onChange={(e) => {
                              const updated = [...supplementData.formulas];
                              updated[fIdx].title = e.target.value;
                              setSupplementData(prev => ({ ...prev, formulas: updated }));
                            }}
                            className="bg-white border border-slate-200 rounded px-2.5 py-1.5 font-bold text-slate-900"
                          />
                          <select
                            value={formula.pharmaceuticalForm}
                            onChange={(e) => {
                              const updated = [...supplementData.formulas];
                              updated[fIdx].pharmaceuticalForm = e.target.value as any;
                              setSupplementData(prev => ({ ...prev, formulas: updated }));
                            }}
                            className="bg-white border border-slate-200 rounded px-2.5 py-1.5"
                          >
                            <option value="capsulas">Cápsulas Vegetais</option>
                            <option value="sache">Sachês Solúveis</option>
                            <option value="solucao_gotas">Solução em Gotas</option>
                            <option value="tintura">Tintura Hidroalcoólica</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Quantidade (ex: 60 doses)"
                            value={formula.quantityToDispense}
                            onChange={(e) => {
                              const updated = [...supplementData.formulas];
                              updated[fIdx].quantityToDispense = e.target.value;
                              setSupplementData(prev => ({ ...prev, formulas: updated }));
                            }}
                            className="bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Posologia:</label>
                          <input
                            type="text"
                            value={formula.posology}
                            onChange={(e) => {
                              const updated = [...supplementData.formulas];
                              updated[fIdx].posology = e.target.value;
                              setSupplementData(prev => ({ ...prev, formulas: updated }));
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. PRESCRIÇÃO DO PLANO ALIMENTAR */}
              {selectedDocType === 'prescricao_dieta' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Calorias (kcal):</label>
                      <input
                        type="number"
                        value={dietPrescriptionData.dailyCaloriesKcal}
                        onChange={(e) => setDietPrescriptionData(prev => ({ ...prev, dailyCaloriesKcal: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Proteínas (g):</label>
                      <input
                        type="number"
                        value={dietPrescriptionData.proteinGrams}
                        onChange={(e) => setDietPrescriptionData(prev => ({ ...prev, proteinGrams: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Carboidratos (g):</label>
                      <input
                        type="number"
                        value={dietPrescriptionData.carbsGrams}
                        onChange={(e) => setDietPrescriptionData(prev => ({ ...prev, carbsGrams: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Lipídios (g):</label>
                      <input
                        type="number"
                        value={dietPrescriptionData.fatGrams}
                        onChange={(e) => setDietPrescriptionData(prev => ({ ...prev, fatGrams: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Meta de Hidratação Diária (ml):</label>
                    <input
                      type="number"
                      step="100"
                      value={dietPrescriptionData.waterIntakeMl}
                      onChange={(e) => setDietPrescriptionData(prev => ({ ...prev, waterIntakeMl: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pré-visualização A4 e Exportação */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentTitle={
          selectedDocType === 'relatorio_evolucao' ? 'Relatório de Evolução Nutricional' :
          selectedDocType === 'informe_irpf' ? 'Informe de Pagamentos IRPF' :
          selectedDocType === 'declaracao_comparecimento' ? 'Declaração de Comparecimento' :
          selectedDocType === 'declaracao_acompanhamento' ? 'Declaração de Acompanhamento Regular' :
          selectedDocType === 'requisicao_exames' ? 'Requisição de Exames Laboratoriais' :
          selectedDocType === 'recibo_honorarios' ? 'Recibo Profissional de Honorários' :
          selectedDocType === 'receituario_magistral' ? 'Receituário Magistral de Suplementos' :
          'Prescrição do Plano Alimentar'
        }
        patient={patientContext}
        onSaveToRecord={handleSaveCurrentDocument}
      >
        {renderActiveTemplate()}
      </DocumentPreviewModal>
    </div>
  );
};
