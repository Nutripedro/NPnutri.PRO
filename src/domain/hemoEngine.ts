import {
  AnthropometryEvaluation,
  BioimpedanceEvaluation,
  Patient,
  WaistHipEvaluation,
  DietPlan
} from '../types';
import {
  HematologicalIndexItem,
  HemoClinicalClassification,
  HemoFullEvaluationResult,
  HemoParameterEntry,
  HemoPatientClinicalContext,
  LongitudinalHemogramDelta,
  MebProtocolEvaluation,
  ParameterEvaluationOutput,
  PlateletPatternAssessment,
  RedSeriesPatternAssessment,
  SavedHemogramRecord,
  WhiteSeriesPatternAssessment
} from '../types/hemo';

/**
 * HEMO INTELLIGENCE PRO — Motor Determinístico Hematológico & Índice MEB
 *
 * Regras clínicas implementadas:
 * - Nunca estimar, interpolar ou converter valor ilegível/ausente em número presumido.
 * - Cálculo MEB estritamente pela soma percentual (% Monócitos + % Eosinófilos + % Basófilos).
 * - Faixas operacionais MEB: < 9 (equilíbrio provável), 9–9,9 (limítrofe), 10–15 (alerta), > 15 (elevado).
 * - Índices NLR, PLR, MLR, SII, SIRI, AISI exclusivamente com contagens absolutas e denominador > 0.
 */

export const MEB_CORRELATION_SYMPTOMS: string[] = [
  'Diarreia persistente',
  'Constipação crônica',
  'Dor abdominal',
  'Distensão abdominal',
  'Alterações do hábito intestinal',
  'Dermatite',
  'Rinite',
  'Asma',
  'Otites recorrentes',
  'Seletividade alimentar',
  'Irritabilidade',
  'Infecções frequentes',
  'Perda de peso não intencional',
  'Sangue nas fezes',
  'Histórico de alergias',
  'Viagens / exposição a parasitas'
];

export const DEFAULT_HEMOGRAM_PARAMETERS = (
  sex: 'male' | 'female' = 'female',
  isPregnant = false
): HemoParameterEntry[] => {
  const isMale = sex === 'male';
  const hgbMin = isPregnant ? 11.0 : isMale ? 13.5 : 12.0;
  const hgbMax = isPregnant ? 14.5 : isMale ? 17.5 : 15.5;
  const rbcMin = isMale ? 4.5 : 4.0;
  const rbcMax = isMale ? 5.9 : 5.2;
  const hctMin = isPregnant ? 33.0 : isMale ? 40.0 : 36.0;
  const hctMax = isPregnant ? 44.0 : isMale ? 52.0 : 48.0;

  return [
    // SÉRIE VERMELHA
    {
      id: 'eritr',
      category: 'vermelha',
      name: 'Hemácias (Eritrócitos)',
      unit: 'milhões/µL',
      value: isMale ? 4.95 : 4.55,
      refMin: rbcMin,
      refMax: rbcMax,
      funcMin: isMale ? 4.6 : 4.3,
      funcMax: isMale ? 5.4 : 4.9,
      extractionStatus: 'confirmed'
    },
    {
      id: 'hgb',
      category: 'vermelha',
      name: 'Hemoglobina (Hgb)',
      unit: 'g/dL',
      value: isMale ? 14.6 : 13.1,
      refMin: hgbMin,
      refMax: hgbMax,
      funcMin: isMale ? 14.2 : 13.2,
      funcMax: isMale ? 16.0 : 14.8,
      extractionStatus: 'confirmed'
    },
    {
      id: 'hct',
      category: 'vermelha',
      name: 'Hematócrito (Hct)',
      unit: '%',
      value: isMale ? 43.2 : 39.2,
      refMin: hctMin,
      refMax: hctMax,
      funcMin: isMale ? 41.0 : 38.0,
      funcMax: isMale ? 47.0 : 44.0,
      extractionStatus: 'confirmed'
    },
    {
      id: 'vcm',
      category: 'vermelha',
      name: 'VCM (Volume Corpuscular Médio)',
      unit: 'fL',
      value: 86.2,
      refMin: 80.0,
      refMax: 100.0,
      funcMin: 84.0,
      funcMax: 92.0,
      extractionStatus: 'confirmed'
    },
    {
      id: 'hcm',
      category: 'vermelha',
      name: 'HCM (Hemoglobina Corpuscular Média)',
      unit: 'pg',
      value: 28.8,
      refMin: 27.0,
      refMax: 33.0,
      funcMin: 28.0,
      funcMax: 31.5,
      extractionStatus: 'confirmed'
    },
    {
      id: 'chcm',
      category: 'vermelha',
      name: 'CHCM (Conc. Hemoglobina Corp. Média)',
      unit: 'g/dL',
      value: 33.4,
      refMin: 32.0,
      refMax: 36.0,
      funcMin: 32.5,
      funcMax: 35.0,
      extractionStatus: 'confirmed'
    },
    {
      id: 'rdw',
      category: 'vermelha',
      name: 'RDW (Amplitude de Distribuição)',
      unit: '%',
      value: 13.4,
      refMin: 11.5,
      refMax: 14.5,
      funcMin: 11.5,
      funcMax: 12.8,
      extractionStatus: 'confirmed'
    },
    {
      id: 'retic',
      category: 'vermelha',
      name: 'Reticulócitos',
      unit: '%',
      value: null,
      refMin: 0.5,
      refMax: 2.0,
      funcMin: 0.8,
      funcMax: 1.5,
      extractionStatus: 'missing',
      notes: 'Opcional — incluir quando solicitado ou presente no laudo.'
    },

    // SÉRIE BRANCA (Absoluto em /µL + Percentual em %)
    {
      id: 'leuc',
      category: 'branca',
      name: 'Leucócitos Totais',
      unit: '/µL',
      value: 6600,
      refMin: 4000,
      refMax: 11000,
      funcMin: 4800,
      funcMax: 7800,
      extractionStatus: 'confirmed'
    },
    {
      id: 'neut',
      category: 'branca',
      name: 'Neutrófilos Segmentados',
      unit: '/µL',
      value: 3828,
      percentValue: 58.0,
      refMin: 1800,
      refMax: 7700,
      funcMin: 2400,
      funcMax: 4800,
      extractionStatus: 'confirmed'
    },
    {
      id: 'bast',
      category: 'branca',
      name: 'Bastonetes',
      unit: '/µL',
      value: 66,
      percentValue: 1.0,
      refMin: 0,
      refMax: 500,
      funcMin: 0,
      funcMax: 200,
      extractionStatus: 'confirmed'
    },
    {
      id: 'linf',
      category: 'branca',
      name: 'Linfócitos',
      unit: '/µL',
      value: 2046,
      percentValue: 31.0,
      refMin: 1000,
      refMax: 4500,
      funcMin: 1500,
      funcMax: 3000,
      extractionStatus: 'confirmed'
    },
    {
      id: 'mono',
      category: 'branca',
      name: 'Monócitos',
      unit: '/µL',
      value: 429,
      percentValue: 6.5,
      refMin: 200,
      refMax: 950,
      funcMin: 250,
      funcMax: 650,
      extractionStatus: 'confirmed'
    },
    {
      id: 'eos',
      category: 'branca',
      name: 'Eosinófilos',
      unit: '/µL',
      value: 198,
      percentValue: 3.0,
      refMin: 0,
      refMax: 500,
      funcMin: 40,
      funcMax: 220,
      extractionStatus: 'confirmed'
    },
    {
      id: 'baso',
      category: 'branca',
      name: 'Basófilos',
      unit: '/µL',
      value: 33,
      percentValue: 0.5,
      refMin: 0,
      refMax: 200,
      funcMin: 0,
      funcMax: 100,
      extractionStatus: 'confirmed'
    },
    {
      id: 'gran_imat',
      category: 'branca',
      name: 'Granulócitos Imaturos (IG)',
      unit: '/µL',
      value: null,
      percentValue: null,
      refMin: 0,
      refMax: 60,
      funcMin: 0,
      funcMax: 30,
      extractionStatus: 'missing'
    },

    // PLAQUETAS
    {
      id: 'plt',
      category: 'plaquetas',
      name: 'Plaquetas',
      unit: '/µL',
      value: 258000,
      refMin: 150000,
      refMax: 450000,
      funcMin: 190000,
      funcMax: 330000,
      extractionStatus: 'confirmed'
    },
    {
      id: 'vpm',
      category: 'plaquetas',
      name: 'VPM / MPV (Volume Plaquetário Médio)',
      unit: 'fL',
      value: 9.8,
      refMin: 7.4,
      refMax: 11.5,
      funcMin: 8.2,
      funcMax: 10.4,
      extractionStatus: 'confirmed'
    },
    {
      id: 'pdw',
      category: 'plaquetas',
      name: 'PDW (Amplitude Dist. Plaquetas)',
      unit: '%',
      value: 12.6,
      refMin: 9.0,
      refMax: 17.0,
      funcMin: 10.0,
      funcMax: 14.5,
      extractionStatus: 'confirmed'
    },
    {
      id: 'pct',
      category: 'plaquetas',
      name: 'PCT (Plaquetócrito)',
      unit: '%',
      value: 0.25,
      refMin: 0.15,
      refMax: 0.4,
      funcMin: 0.18,
      funcMax: 0.34,
      extractionStatus: 'confirmed'
    },
    {
      id: 'plcr',
      category: 'plaquetas',
      name: 'P-LCR (Razão Plaquetas Grandes)',
      unit: '%',
      value: null,
      refMin: 15.0,
      refMax: 35.0,
      funcMin: 18.0,
      funcMax: 30.0,
      extractionStatus: 'missing'
    }
  ];
};

export const DEFAULT_COMPLEMENTARY_LABS = (): HemoParameterEntry[] => [
  { id: 'ferritina', category: 'complementar', name: 'Ferritina Sérica', unit: 'ng/mL', value: null, refMin: 15, refMax: 150, funcMin: 70, funcMax: 130, extractionStatus: 'missing' },
  { id: 'ferro', category: 'complementar', name: 'Ferro Sérico', unit: 'µg/dL', value: null, refMin: 50, refMax: 170, funcMin: 80, funcMax: 130, extractionStatus: 'missing' },
  { id: 'sat_transf', category: 'complementar', name: 'Saturação de Transferrina', unit: '%', value: null, refMin: 20, refMax: 50, funcMin: 25, funcMax: 40, extractionStatus: 'missing' },
  { id: 'b12', category: 'complementar', name: 'Vitamina B12', unit: 'pg/mL', value: null, refMin: 200, refMax: 900, funcMin: 500, funcMax: 850, extractionStatus: 'missing' },
  { id: 'folato', category: 'complementar', name: 'Ácido Fólico (Folato)', unit: 'ng/mL', value: null, refMin: 3.1, refMax: 20.0, funcMin: 8.0, funcMax: 18.0, extractionStatus: 'missing' },
  { id: 'pcr', category: 'complementar', name: 'PCR Ultrassensível', unit: 'mg/L', value: null, refMin: 0, refMax: 5.0, funcMin: 0, funcMax: 1.0, extractionStatus: 'missing' },
  { id: 'creatinina', category: 'complementar', name: 'Creatinina Sérica', unit: 'mg/dL', value: null, refMin: 0.6, refMax: 1.2, funcMin: 0.7, funcMax: 1.0, extractionStatus: 'missing' },
  { id: 'tgp', category: 'complementar', name: 'ALT / TGP', unit: 'U/L', value: null, refMin: 0, refMax: 40, funcMin: 10, funcMax: 25, extractionStatus: 'missing' },
  { id: 'vit_d', category: 'complementar', name: '25-OH Vitamina D', unit: 'ng/mL', value: null, refMin: 20, refMax: 100, funcMin: 40, funcMax: 65, extractionStatus: 'missing' }
];

export function buildEmrContextFromPatient(
  patient: Patient,
  anthro?: AnthropometryEvaluation,
  bia?: BioimpedanceEvaluation,
  rcq?: WaistHipEvaluation,
  dietPlan?: DietPlan
): HemoPatientClinicalContext {
  const dietParts: string[] = [];
  if (patient.goal) dietParts.push(`Objetivo clínico: ${patient.goal}`);
  if (dietPlan) {
    dietParts.push(
      `Plano ativo (${dietPlan.title}): ${dietPlan.calorieTargetKcal} kcal/dia (P ${dietPlan.proteinGrams}g / C ${dietPlan.carbsGrams}g / G ${dietPlan.fatGrams}g)`
    );
  }
  return {
    patientId: patient.id,
    recordNumber: patient.recordNumber || 'Não informado',
    age: patient.age || 0,
    birthDate: patient.birthDate || 'Não informado',
    biologicalSex: patient.sex || 'female',
    isPregnant: false,
    gestationalWeeks: null,
    weightKg: patient.currentWeightKg ?? null,
    heightCm: patient.heightCm ?? null,
    imc: patient.imc ?? null,
    waistCm: rcq?.waistCm ?? null,
    bodyFatPercent: bia?.bodyFatPercent ?? anthro?.bodyFatPercent ?? null,
    phaseAngleDeg: bia?.phaseAngleDeg ?? null,
    comorbidities: [],
    medications: '',
    supplements: '',
    surgeriesHistory: '',
    familyHistory: '',
    dietaryHabits: dietParts.join(' · '),
    recall24h: '',
    alcoholUse: 'nao_informado',
    tobaccoUse: 'nao_informado',
    physicalActivity: '',
    sleepQuality: '',
    giAndAllergicSymptoms: [],
    infectionsHistory: '',
    gastrointestinalHistory: ''
  };
}

/**
 * Classificação individual de parâmetro laboratorial (sem inventar valores nulos)
 */
export function classifyHemoParameter(item: HemoParameterEntry): {
  classification: HemoClinicalClassification;
  label: string;
} {
  if (item.value === null || !Number.isFinite(item.value)) {
    return { classification: 'nao_informado', label: 'Não informado' };
  }
  const val = item.value;
  const rMin = item.refMin ?? 0;
  const rMax = item.refMax ?? Number.MAX_SAFE_INTEGER;
  const fMin = item.funcMin ?? rMin;
  const fMax = item.funcMax ?? rMax;

  if (item.refMin !== null && val < rMin * 0.75 && rMin > 0) {
    return { classification: 'critico_baixo', label: 'Crítico (Muito Baixo)' };
  }
  if (item.refMin !== null && val < rMin) {
    return { classification: 'baixo', label: 'Abaixo da Referência' };
  }
  if (val >= fMin && val <= fMax) {
    return { classification: 'ideal', label: 'Faixa Funcional Ideal' };
  }
  if (val >= rMin && val <= rMax) {
    return { classification: 'referencia', label: 'Dentro da Referência Lab.' };
  }
  if (item.refMax !== null && val > rMax * 1.25) {
    return { classification: 'critico_alto', label: 'Crítico (Muito Elevado)' };
  }
  return { classification: 'elevado', label: 'Acima da Referência' };
}

const PARAMETER_KNOWLEDGE: Record<
  string,
  {
    meaning: string;
    clinical: string[];
    nutritional: string[];
    investigation: string;
  }
> = {
  eritr: {
    meaning: 'Quantidade total de eritrócitos circulantes responsáveis pelo transporte de O₂.',
    clinical: ['Anemias carenciais ou de doença crônica', 'Hemodiluição (gestação/hipervolemia)', 'Policitemia ou desidratação (quando elevado)'],
    nutritional: ['Avaliar aporte proteico, ferro, cobre, vitamina B6, B12 e folato'],
    investigation: 'Correlacionar com VCM, RDW, reticulócitos e cinética do ferro.'
  },
  hgb: {
    meaning: 'Proteína tetramérica com grupo heme que transporta oxigênio aos tecidos.',
    clinical: ['Triagem primária de anemia (critério OMS por sexo/idade/gestação)', 'Hipóxia crônica ou hemoconcentração quando elevada'],
    nutritional: ['Ferro biodisponível, vitamina C (absorção), B12, folato e aminoácidos essenciais'],
    investigation: 'Nunca definir etiologia isoladamente; associar ferritina, saturação de transferrina e PCR.'
  },
  hct: {
    meaning: 'Proporção percentual ocupada pelas hemácias no volume total de sangue.',
    clinical: ['Acompanha hemoglobina em anemias; sensível ao estado de hidratação'],
    nutritional: ['Avaliar estado hídrico e ingestão de fluidos (bioimpedância/exame físico)'],
    investigation: 'Avaliar conjuntamente hemoglobina e hidratação plasmática.'
  },
  vcm: {
    meaning: 'Volume médio de cada hemácia (determina microcitose, normocitose ou macrocitose).',
    clinical: ['< 80 fL: ferropenia, talassemias, anemia de doença crônica', '> 100 fL: deficiência de B12/folato, etilismo, hepatopatias, hipotireoidismo'],
    nutritional: ['Microcitose: investigar ferro/cobre/B6; Macrocitose: investigar B12, folato e álcool'],
    investigation: 'Associar obrigatoriamente com RDW, ferritina, B12, folato e TSH.'
  },
  hcm: {
    meaning: 'Conteúdo médio de hemoglobina por hemácia individual.',
    clinical: ['Reduzido na hipocromia (ferropenia, traço talassêmico); elevado na macrocitose'],
    nutritional: ['Síntese de heme dependente de ferro, piridoxina (B6) e glicina'],
    investigation: 'Avaliar junto ao CHCM e perfil de ferro.'
  },
  chcm: {
    meaning: 'Concentração média de hemoglobina dentro de um determinado volume de hemácias.',
    clinical: ['Redução indica hipocromia; elevações reais sugerem esferocitose ou artefato'],
    nutritional: ['Carência de ferro ou sobrecarga oxidativa de membrana'],
    investigation: 'Confirmar em esfregaço periférico se > 36 g/dL.'
  },
  rdw: {
    meaning: 'Índice de anisocitose (grau de variação de tamanho entre as hemácias).',
    clinical: ['Elevação precoce na deficiência mista ou inicial de ferro, B12 ou folato', 'Ajuda a diferenciar ferropenia (RDW alto) de traço talassêmico (RDW geralmente normal)'],
    nutritional: ['Marcador sensível de carências nutricionais eritropoiéticas precoces'],
    investigation: 'Solicitar cinética do ferro, B12, folato e reticulócitos quando > 14,5%.'
  },
  retic: {
    meaning: 'Hemácias jovens recém-liberadas da medula óssea (atividade eritropoiética).',
    clinical: ['Diferencia anemias hipoproliferativas (reticulócitos baixos) de hiperproliferativas/hemólise/sangramento'],
    nutritional: ['Resposta medular à reposição nutricional ou bloqueio inflamatório'],
    investigation: 'Indispensável na investigação de anemias normocíticas ou refratárias.'
  },
  leuc: {
    meaning: 'Soma global dos glóbulos brancos circulantes (vigilância imune inata e adaptativa).',
    clinical: ['Leucocitose: infecções, inflamação aguda, estresse, corticoides', 'Leucopenia: viroses, carências nutricionais graves, imunossupressão'],
    nutritional: ['Zinco, selênio, vitamina A/D/C, proteína adequada e redução de estresse oxidativo'],
    investigation: 'Analisar obrigatoriamente cada subtipo em contagem absoluta (/µL).'
  },
  neut: {
    meaning: 'Primeira linha de defesa fagocítica contra bactérias e resposta inflamatória aguda.',
    clinical: ['Neutrofilia: infecções bacterianas, estresse físico, tabagismo, corticoides', 'Neutropenia: infecções virais, fármacos, carência de B12/folato/cobre'],
    nutritional: ['Vitamina C, zinco, cobre e complexo B mantêm função neutrofílica'],
    investigation: 'Correlacionar com PCR, bastonetes e quadro infeccioso clínico.'
  },
  bast: {
    meaning: 'Formas jovens de neutrófilos liberadas durante demanda medular acelerada.',
    clinical: ['Elevação ("desvio à esquerda") sugere recrutamento medular agudo'],
    nutritional: ['Suporte nutricional e recuperação pós-infecciosa'],
    investigation: 'Avaliar contexto febril/infeccioso clínico.'
  },
  linf: {
    meaning: 'Células T, B e NK responsáveis pela imunidade adaptativa, antiviral e vigilância.',
    clinical: ['Linfocitose: infecções virais, inflamação crônica', 'Linfopenia: desnutrição proteico-energética, cortisol elevado, zinco baixo'],
    nutritional: ['Linfopenia é marcador clássico de risco nutricional, baixa proteína, zinco e vitamina D'],
    investigation: 'Correlacionar com estado nutricional global, vitamina D, zinco e sorologias se indicado.'
  },
  mono: {
    meaning: 'Precursores de macrófagos teciduais envolvidos em fagocitose, reparo e inflamação crônica.',
    clinical: ['Monocitose: fase de recuperação de infecções, inflamação crônica, processos autoimunes ou hematológicos'],
    nutritional: ['Modulação inflamatória intestinal/sistêmica e ômega-3'],
    investigation: 'Avaliar em contagem absoluta e dentro do índice operacional MEB.'
  },
  eos: {
    meaning: 'Granulócitos especializados em resposta alérgica mediada por IgE e defesa anti-helmíntica.',
    clinical: ['Eosinofilia: alergias (rinite, asma, dermatite), parasitoses helmínticas, farmacodermias, doenças eosinofílicas GI'],
    nutritional: ['Investigar gatilhos alérgicos clínicos e história alimentar sem exclusões empíricas amplas'],
    investigation: 'Considerar parasitológico de fezes seriado ou IgE específica conforme quadro.'
  },
  baso: {
    meaning: 'Granulócitos de baixa prevalência ricos em histamina e mediadores de hipersensibilidade.',
    clinical: ['Basofilia persistente exige atenção a alergias ou investigação hematológica'],
    nutritional: ['Evitar superinterpretação de valores baixos ou zero isolados'],
    investigation: 'Não usar redução isolada de basófilos como prova de permeabilidade intestinal.'
  },
  gran_imat: {
    meaning: 'Precursores granulocíticos circulantes (metamielócitos/mielócitos).',
    clinical: ['Presença significativa sugere forte estímulo medular inflamatório/infeccioso ou alteração hematológica'],
    nutritional: ['Acompanhamento médico prioritário em elevações expressivas'],
    investigation: 'Revisão morfológica em lâmina pelo laboratório.'
  },
  plt: {
    meaning: 'Fragmentos citoplasmáticos essenciais para hemostasia primária e reparo endotelial.',
    clinical: ['Trombocitopenia: consumo, destruição, hiperesplenismo, viroses, carência de B12/folato, pseudo-plaquetopenia em EDTA', 'Trombocitose: reativa (ferropenia, inflamação) ou mieloproliferativa'],
    nutritional: ['Ferropenia pode causar trombocitose reativa; deficiência severa de B12/folato pode reduzir plaquetas'],
    investigation: 'Nunca estimar risco individual de trombose ou sangramento apenas por índices plaquetários; confirmar agregação.'
  },
  vpm: {
    meaning: 'Tamanho médio das plaquetas circulantes (plaquetas jovens costumam ser maiores).',
    clinical: ['Alterações acompanham renovação medular ou ativação inflamatória inespecífica'],
    nutritional: ['Correlacionar com perfil cardiometabólico e inflamatório'],
    investigation: 'Interpretar sempre em conjunto com a contagem total de plaquetas.'
  },
  pdw: {
    meaning: 'Grau de heterogeneidade no volume das plaquetas circulantes.',
    clinical: ['Aumento reflete anisocitose plaquetária reativa ou medular'],
    nutritional: ['Marcador auxiliar inespecífico'],
    investigation: 'Considerar artefatos pré-analíticos e tempo entre coleta e leitura.'
  },
  pct: {
    meaning: 'Volume percentual ocupado pelas plaquetas no sangue total (análogo ao hematócrito).',
    clinical: ['Varia proporcionalmente à contagem plaquetária e ao VPM'],
    nutritional: ['Auxiliar na leitura global da massa plaquetária'],
    investigation: 'Sem valor diagnóstico isolado.'
  },
  plcr: {
    meaning: 'Percentual de plaquetas de grande volume (> 12 fL).',
    clinical: ['Pode elevar-se em renovação acelerada ou trombocitopenias periféricas'],
    nutritional: ['Auxiliar descritivo'],
    investigation: 'Analisar em conjunto com plaquetometria e lâmina.'
  }
};

/**
 * Calcula estritamente o Teste MEB conforme Seção 8 do SUPER PROMPT:
 * - Usa EXCLUSIVAMENTE % Monócitos + % Eosinófilos + % Basófilos.
 * - Nunca estima valores ausentes ou mistura absoluto com percentual.
 * - Faixas operacionais: < 9 | >= 9 e < 10 | 10 a 15 | > 15.
 */
export function evaluateMebProtocol(
  parameters: HemoParameterEntry[],
  correlatedSymptoms: string[] = []
): MebProtocolEvaluation {
  const byId = new Map(parameters.map((p) => [p.id, p]));
  const mono = byId.get('mono');
  const eos = byId.get('eos');
  const baso = byId.get('baso');

  const mPct = mono?.percentValue ?? null;
  const ePct = eos?.percentValue ?? null;
  const bPct = baso?.percentValue ?? null;

  const mAbs = mono?.value ?? null;
  const eAbs = eos?.value ?? null;
  const bAbs = baso?.value ?? null;

  const missingPct: string[] = [];
  if (mPct === null || !Number.isFinite(mPct)) missingPct.push('Monócitos (%)');
  if (ePct === null || !Number.isFinite(ePct)) missingPct.push('Eosinófilos (%)');
  if (bPct === null || !Number.isFinite(bPct)) missingPct.push('Basófilos (%)');

  const scientificLimitations = [
    'As faixas do índice MEB são exclusivamente operacionais e experimentais; não constituem intervalos hematológicos validados nem critérios diagnósticos.',
    'MEB < 9 não comprova equilíbrio intestinal.',
    'MEB entre 10 e 15 não comprova disbiose ou parasitose.',
    'MEB > 15 não comprova inflamação crônica, alergia alimentar ou parasitose.',
    'A redução isolada de basófilos não deve ser interpretada como evidência de alteração da permeabilidade intestinal.'
  ];

  const componentAnalyses: MebProtocolEvaluation['componentAnalyses'] = [
    {
      component: 'monocitos',
      label: 'Monócitos',
      percentValue: mPct,
      absoluteValue: mAbs,
      labRefPercent: '2,0% – 10,0%',
      labRefAbsolute: mono && mono.refMin !== null && mono.refMax !== null ? `${mono.refMin} – ${mono.refMax} /µL` : '200 – 950 /µL',
      clinicalAssociations: [
        'Processos infecciosos e fase de recuperação de infecções',
        'Processos inflamatórios crônicos',
        'Condições hematológicas ou outras alterações imunológicas'
      ],
      cautionNote: 'Avaliar o percentual sempre em conjunto com a contagem absoluta (/µL).'
    },
    {
      component: 'eosinofilos',
      label: 'Eosinófilos',
      percentValue: ePct,
      absoluteValue: eAbs,
      labRefPercent: '0,5% – 5,0%',
      labRefAbsolute: eos && eos.refMin !== null && eos.refMax !== null ? `${eos.refMin} – ${eos.refMax} /µL` : '0 – 500 /µL',
      clinicalAssociations: [
        'Alergias respiratórias e cutâneas (rinite, asma, dermatites)',
        'Reações medicamentosas',
        'Parasitoses por determinados helmintos',
        'Doenças eosinofílicas e condições gastrointestinais eosinofílicas'
      ],
      cautionNote: 'Não afirmar que o componente de maior percentual seja necessariamente a causa única do quadro clínico.'
    },
    {
      component: 'basofilos',
      label: 'Basófilos',
      percentValue: bPct,
      absoluteValue: bAbs,
      labRefPercent: '0,0% – 2,0%',
      labRefAbsolute: baso && baso.refMin !== null && baso.refMax !== null ? `${baso.refMin} – ${baso.refMax} /µL` : '0 – 200 /µL',
      clinicalAssociations: [
        'Processos alérgicos mediados por IgE',
        'Condições inflamatórias específicas',
        'Alterações mieloproliferativas (quando persistentemente elevados)'
      ],
      cautionNote: 'Valores baixos ou 0% são comuns em laudos normais e não indicam alteração de permeabilidade intestinal.'
    }
  ];

  if (missingPct.length > 0) {
    const hasOnlyAbs = mAbs !== null || eAbs !== null || bAbs !== null;
    return {
      calculable: false,
      reasonIfNotCalculable: hasOnlyAbs
        ? `Faltam os percentuais (${missingPct.join(', ')}). Quando o documento apresenta apenas contagens absolutas, o cálculo percentual do MEB não pode ser realizado sem confirmação dos valores em %.`
        : `Dados percentuais ausentes para: ${missingPct.join(', ')}. Informe os valores exatos do laudo sem estimativas.`,
      monocytesPercent: mPct,
      eosinophilsPercent: ePct,
      basophilsPercent: bPct,
      monocytesAbsolute: mAbs,
      eosinophilsAbsolute: eAbs,
      basophilsAbsolute: bAbs,
      score: null,
      formulaDisplay: 'MEB = % Monócitos + % Eosinófilos + % Basófilos (aguardando %)',
      classificationKey: 'indisponivel',
      classificationLabel: 'Cálculo pendente de dados percentuais',
      operationalSummary: 'Complete os percentuais de Monócitos, Eosinófilos e Basófilos para calcular o índice MEB.',
      predominantComponent: null,
      predominantComponentLabel: 'Não determinado',
      componentAnalyses,
      correlatedSymptoms,
      investigationSuggestions: [],
      scientificLimitations
    };
  }

  const m = mPct as number;
  const e = ePct as number;
  const b = bPct as number;
  const score = Math.round((m + e + b) * 100) / 100;
  const formulaDisplay = `${m.toFixed(1).replace('.', ',')}% + ${e.toFixed(1).replace('.', ',')}% + ${b.toFixed(1).replace('.', ',')}% = ${score.toFixed(1).replace('.', ',')}`;

  let classificationKey: MebProtocolEvaluation['classificationKey'] = 'equilibrio_provavel';
  let classificationLabel = 'MEB < 9 — Equilíbrio intestinal provável (operacional)';
  let operationalSummary =
    'Resultado abaixo de 9 na escala operacional proposta pelo protocolo, sugerindo baixa probabilidade de ativação conjunta de monócitos, eosinófilos e basófilos no hemograma atual.';

  if (score >= 9 && score < 10) {
    classificationKey = 'limitrofe';
    classificationLabel = 'MEB 9,0 a 9,9 — Limítrofe';
    operationalSummary =
      'Faixa limítrofe operacional. Recomenda-se correlacionar individualmente os subtipos (sobretudo contagens absolutas) e sintomas clínicos.';
  } else if (score >= 10 && score <= 15) {
    classificationKey = 'alerta_investigacao';
    classificationLabel = 'MEB 10,0 a 15,0 — Alerta para investigação';
    operationalSummary =
      'Alerta operacional para investigação de possíveis alterações associadas (alergias, parasitoses, inflamação de mucosa ou eventos pós-infecciosos), sempre mediante correlação clínica.';
  } else if (score > 15) {
    classificationKey = 'elevado';
    classificationLabel = 'MEB > 15,0 — Resultado elevado (merece investigação clínica)';
    operationalSummary =
      'Resultado elevado na escala operacional, merecendo investigação clínica direcionada conforme o componente predominante e sintomas relatados.';
  }

  let predominantComponent: 'monocitos' | 'eosinofilos' | 'basofilos' = 'monocitos';
  let maxVal = m;
  if (e > maxVal) {
    predominantComponent = 'eosinofilos';
    maxVal = e;
  }
  if (b > maxVal) {
    predominantComponent = 'basofilos';
    maxVal = b;
  }

  const predominantLabelMap = {
    monocitos: `Monócitos (${m.toFixed(1).replace('.', ',')}%)`,
    eosinofilos: `Eosinófilos (${e.toFixed(1).replace('.', ',')}%)`,
    basofilos: `Basófilos (${b.toFixed(1).replace('.', ',')}%)`
  };

  const investigationSuggestions: string[] = [];
  if (score >= 10 || e > 5 || (eAbs !== null && eAbs > 500) || correlatedSymptoms.length > 0) {
    if (e > 5 || (eAbs !== null && eAbs > 500)) {
      investigationSuggestions.push(
        'Exame parasitológico de fezes, com metodologia e número de amostras definidos conforme suspeita clínica.',
        'Avaliação de IgE específica ou testes alérgicos direcionados pela história clínica (evitar painéis indiscriminados de alergia alimentar).',
        'Avaliação alergológica ou investigação de doenças eosinofílicas gastrointestinais, conforme sintomas.'
      );
    }
    if (
      correlatedSymptoms.some((s) =>
        ['Diarreia persistente', 'Dor abdominal', 'Sangue nas fezes', 'Perda de peso não intencional'].includes(s)
      )
    ) {
      investigationSuggestions.push(
        'Calprotectina fecal, quando houver indicação clínica de inflamação intestinal.',
        'Avaliação gastroenterológica presencial.'
      );
    }
    investigationSuggestions.push(
      'Repetição do hemograma em momento oportuno para avaliar persistência ou tendência evolutiva, sem prescrição empírica de medicamentos ou antiparasitários.'
    );
  }

  return {
    calculable: true,
    monocytesPercent: m,
    eosinophilsPercent: e,
    basophilsPercent: b,
    monocytesAbsolute: mAbs,
    eosinophilsAbsolute: eAbs,
    basophilsAbsolute: bAbs,
    score,
    formulaDisplay,
    classificationKey,
    classificationLabel,
    operationalSummary,
    predominantComponent,
    predominantComponentLabel: predominantLabelMap[predominantComponent],
    componentAnalyses,
    correlatedSymptoms,
    investigationSuggestions,
    scientificLimitations
  };
}

/**
 * Calcula Índices Hematológicos Automáticos (Seção 9) com fórmula, valores e proteção contra denominador 0.
 */
export function calculateHematologicalIndexes(
  parameters: HemoParameterEntry[]
): HematologicalIndexItem[] {
  const byId = new Map(parameters.map((p) => [p.id, p]));
  const neut = byId.get('neut')?.value ?? null;
  const linf = byId.get('linf')?.value ?? null;
  const mono = byId.get('mono')?.value ?? null;
  const plt = byId.get('plt')?.value ?? null;

  const canDivide = linf !== null && Number.isFinite(linf) && linf > 0;
  const denomNote =
    linf === 0
      ? 'Denominador (Linfócitos absolutos) igual a zero.'
      : 'Linfócitos absolutos (/µL) não informados.';

  const fmt = (n: number | null) => (n !== null ? n.toLocaleString('pt-BR') : 'N/I');

  const nlrCalc = canDivide && neut !== null ? Math.round((neut / linf!) * 100) / 100 : null;
  const plrCalc = canDivide && plt !== null ? Math.round((plt / linf!) * 10) / 10 : null;
  const mlrCalc = canDivide && mono !== null ? Math.round((mono / linf!) * 100) / 100 : null;
  const siiCalc =
    canDivide && plt !== null && neut !== null
      ? Math.round((plt * neut) / linf!)
      : null;
  const siriCalc =
    canDivide && neut !== null && mono !== null
      ? Math.round(((neut * mono) / linf!) * 10) / 10
      : null;
  const aisiCalc =
    canDivide && neut !== null && mono !== null && plt !== null
      ? Math.round((neut * mono * plt) / linf!)
      : null;

  return [
    {
      id: 'NLR',
      name: 'NLR — Relação Neutrófilos/Linfócitos',
      formula: 'Neutrófilos absolutos / Linfócitos absolutos',
      valuesUsedDisplay: `${fmt(neut)} / ${fmt(linf)}`,
      result: nlrCalc,
      calculable: nlrCalc !== null,
      unavailableReason: nlrCalc === null ? (!canDivide ? denomNote : 'Neutrófilos absolutos ausentes.') : undefined,
      clinicalInterpretationNote:
        'Marcador complementar inespecífico do equilíbrio entre imunidade inata (neutrófilos) e adaptativa (linfócitos); não possui limite diagnóstico universal.'
    },
    {
      id: 'PLR',
      name: 'PLR — Relação Plaquetas/Linfócitos',
      formula: 'Plaquetas / Linfócitos absolutos',
      valuesUsedDisplay: `${fmt(plt)} / ${fmt(linf)}`,
      result: plrCalc,
      calculable: plrCalc !== null,
      unavailableReason: plrCalc === null ? (!canDivide ? denomNote : 'Plaquetas ausentes.') : undefined,
      clinicalInterpretationNote:
        'Razão complementar entre atividade trombopoiética/reativa e resposta linfocitária; interpretar no contexto clínico completo.'
    },
    {
      id: 'MLR',
      name: 'MLR — Relação Monócitos/Linfócitos',
      formula: 'Monócitos absolutos / Linfócitos absolutos',
      valuesUsedDisplay: `${fmt(mono)} / ${fmt(linf)}`,
      result: mlrCalc,
      calculable: mlrCalc !== null,
      unavailableReason: mlrCalc === null ? (!canDivide ? denomNote : 'Monócitos absolutos ausentes.') : undefined,
      clinicalInterpretationNote:
        'Marcador auxiliar inespecífico de ativação monocítica relativa; sem valor diagnóstico isolado.'
    },
    {
      id: 'SII',
      name: 'SII — Índice de Imunoinflamação Sistêmica',
      formula: '(Plaquetas × Neutrófilos absolutos) / Linfócitos absolutos',
      valuesUsedDisplay: `(${fmt(plt)} × ${fmt(neut)}) / ${fmt(linf)}`,
      result: siiCalc,
      calculable: siiCalc !== null,
      unavailableReason: siiCalc === null ? (!canDivide ? denomNote : 'Dados insuficientes (Plaquetas/Neutrófilos).') : undefined,
      clinicalInterpretationNote:
        'Índice composto descritivo de inflamação sistêmica e reatividade imunotrombótica; inespecífico e sem ponto de corte universal.'
    },
    {
      id: 'SIRI',
      name: 'SIRI — Índice de Resposta Inflamatória Sistêmica',
      formula: '(Neutrófilos absolutos × Monócitos absolutos) / Linfócitos absolutos',
      valuesUsedDisplay: `(${fmt(neut)} × ${fmt(mono)}) / ${fmt(linf)}`,
      result: siriCalc,
      calculable: siriCalc !== null,
      unavailableReason: siriCalc === null ? (!canDivide ? denomNote : 'Dados insuficientes (Neutrófilos/Monócitos).') : undefined,
      clinicalInterpretationNote:
        'Marcador composto complementar combinando linhagem neutrofílica e monocítica em relação aos linfócitos.'
    },
    {
      id: 'AISI',
      name: 'AISI — Índice Agregado de Inflamação Sistêmica',
      formula: '(Neutrófilos abs. × Monócitos abs. × Plaquetas) / Linfócitos abs.',
      valuesUsedDisplay: `(${fmt(neut)} × ${fmt(mono)} × ${fmt(plt)}) / ${fmt(linf)}`,
      result: aisiCalc,
      calculable: aisiCalc !== null,
      unavailableReason: aisiCalc === null ? (!canDivide ? denomNote : 'Dados insuficientes para os 4 parâmetros.') : undefined,
      clinicalInterpretationNote:
        'Índice agregado complementar de carga inflamatória celular global; uso estritamente exploratório e contextual.'
    }
  ];
}

/**
 * Avalia integralmente o hemograma completo, índices, MEB, correlações e evolução longitudinal.
 */
export function evaluateCompleteHemogram(params: {
  parameters: HemoParameterEntry[];
  complementaryLabs: HemoParameterEntry[];
  context: HemoPatientClinicalContext;
  previousRecord?: SavedHemogramRecord | null;
  currentDate?: string;
}): HemoFullEvaluationResult {
  const { parameters, complementaryLabs, context, previousRecord } = params;
  const byId = new Map(parameters.map((p) => [p.id, p]));
  const compById = new Map(complementaryLabs.map((p) => [p.id, p]));

  const parameterOutputs: ParameterEvaluationOutput[] = parameters.map((item) => {
    const status = classifyHemoParameter(item);
    const knowledge = PARAMETER_KNOWLEDGE[item.id] || {
      meaning: 'Parâmetro laboratorial hematológico.',
      clinical: ['Interpretar conforme referência do laboratório e quadro clínico'],
      nutritional: ['Avaliar estado nutricional global'],
      investigation: 'Correlacionar com exames complementares pertinentes.'
    };

    const needsInv =
      status.classification === 'critico_baixo' ||
      status.classification === 'baixo' ||
      status.classification === 'elevado' ||
      status.classification === 'critico_alto';

    return {
      id: item.id,
      category: item.category,
      name: item.name,
      unit: item.unit,
      value: item.value,
      percentValue: item.percentValue,
      refRangeDisplay:
        item.refMin !== null && item.refMax !== null ? `${item.refMin} – ${item.refMax}` : 'Não informado',
      funcRangeDisplay:
        item.funcMin != null && item.funcMax != null ? `${item.funcMin} – ${item.funcMax}` : '—',
      classification: status.classification,
      classificationLabel: status.label,
      physiologicalMeaning: knowledge.meaning,
      clinicalCorrelations: knowledge.clinical,
      nutritionalCorrelations: knowledge.nutritional,
      needsComplementaryInvestigation: needsInv,
      investigationNote: needsInv ? knowledge.investigation : undefined
    };
  });

  // Série Vermelha & Padrões
  const rbc = byId.get('eritr')?.value ?? null;
  const hgb = byId.get('hgb')?.value ?? null;
  const hct = byId.get('hct')?.value ?? null;
  const vcmLab = byId.get('vcm')?.value ?? null;
  const hcmLab = byId.get('hcm')?.value ?? null;
  const chcmLab = byId.get('chcm')?.value ?? null;
  const rdw = byId.get('rdw')?.value ?? null;
  const hgbRefMin = byId.get('hgb')?.refMin ?? (context.biologicalSex === 'male' ? 13.5 : 12.0);

  const calculatedVCM =
    vcmLab !== null ? vcmLab : rbc && hct && rbc > 0 ? Math.round(((hct * 10) / rbc) * 10) / 10 : null;
  const calculatedHCM =
    hcmLab !== null ? hcmLab : rbc && hgb && rbc > 0 ? Math.round(((hgb * 10) / rbc) * 10) / 10 : null;
  const calculatedCHCM =
    chcmLab !== null ? chcmLab : hct && hgb && hct > 0 ? Math.round(((hgb * 100) / hct) * 10) / 10 : null;

  const vcmClassification =
    calculatedVCM === null
      ? 'Não informado'
      : calculatedVCM < 80
        ? 'Microcítica (< 80 fL)'
        : calculatedVCM > 100
          ? 'Macrocítica (> 100 fL)'
          : 'Normocítica (80–100 fL)';

  const hcmClassification =
    calculatedHCM === null
      ? 'Não informado'
      : calculatedHCM < 27
        ? 'Hipocrômica (< 27 pg)'
        : calculatedHCM > 33
          ? 'Elevada (> 33 pg)'
          : 'Normocrômica (27–33 pg)';

  const chcmClassification =
    calculatedCHCM === null
      ? 'Não informado'
      : calculatedCHCM < 32
        ? 'Hipocrômica (< 32 g/dL)'
        : calculatedCHCM > 36
          ? 'Elevada (> 36 g/dL)'
          : 'Normocrômica (32–36 g/dL)';

  const redPatterns: string[] = [];
  const isAnemic = hgb !== null && hgb < hgbRefMin;
  if (isAnemic && calculatedVCM !== null) {
    if (calculatedVCM < 80) {
      redPatterns.push(
        'Padrão compatível com anemia microcítica (avaliar possível deficiência de ferro, traço talassêmico/hemoglobinopatias ou anemia associada à inflamação).'
      );
    } else if (calculatedVCM > 100) {
      redPatterns.push(
        'Padrão compatível com anemia macrocítica (avaliar possível deficiência de vitamina B12 ou folato, função hepática, etilismo, hipotireoidismo ou reticulocitose).'
      );
    } else {
      redPatterns.push(
        'Padrão compatível com anemia normocítica (investigar anemia associada à inflamação crônica, função renal, perda sanguínea recente ou deficiência nutricional inicial/mista).'
      );
    }
  } else if (calculatedVCM !== null && calculatedVCM < 80) {
    redPatterns.push('Microcitose sem anemia instalada no momento (investigar estoque de ferro / ferritina ou traço talassêmico).');
  } else if (calculatedVCM !== null && calculatedVCM > 100) {
    redPatterns.push('Macrocitose sem anemia franca (investigar B12, folato, função hepática e uso de fármacos/álcool).');
  }

  if (rdw !== null && rdw > 14.5) {
    redPatterns.push('Anisocitose elevada (RDW > 14,5%), compatível com alteração heterogênea da produção eritrocitária ou carência precoce.');
  }
  if (redPatterns.length === 0) {
    redPatterns.push('Série eritrocitária sem padrão morfológico de anemia ou anisocitose evidente nos parâmetros disponíveis.');
  }

  const redSeries: RedSeriesPatternAssessment = {
    calculatedVCM,
    calculatedHCM,
    calculatedCHCM,
    vcmClassification,
    hcmClassification,
    chcmClassification,
    compatiblePatterns: redPatterns,
    corroborationRequirements: [
      'Não concluir a causa de eventual anemia somente pelo hemograma.',
      'Correlacionar sempre com ferritina, ferro sérico, transferrina, saturação da transferrina, PCR, vitamina B12, folato, função renal e hepática.'
    ]
  };

  // Série Branca
  const leuc = byId.get('leuc')?.value ?? null;
  const neut = byId.get('neut')?.value ?? null;
  const linf = byId.get('linf')?.value ?? null;
  const eos = byId.get('eos')?.value ?? null;
  const bast = byId.get('bast')?.value ?? null;
  const whitePatterns: string[] = [];

  if (leuc !== null && leuc > 11000) whitePatterns.push('Leucocitose global — correlacionar com processo infeccioso, inflamatório ou uso de corticoides.');
  if (leuc !== null && leuc < 4000) whitePatterns.push('Leucopenia global — avaliar histórico viral, nutricional, medicamentoso ou imune.');
  if (neut !== null && neut > 7700) whitePatterns.push('Neutrofilia absoluta — possível associação com estímulo bacteriano, estresse agudo ou inflamação.');
  if (bast !== null && bast > 500) whitePatterns.push('Elevação de bastonetes — atenção para demanda medular aguda e correlação clínica.');
  if (linf !== null && linf > 4500) whitePatterns.push('Linfocitose absoluta — pode sugerir resposta viral ou estímulo linfoproliferativo.');
  if (linf !== null && linf < 1000) whitePatterns.push('Linfopenia absoluta — atenção para estado nutricional proteico, estresse, zinco/vitamina D ou imunossupressão.');
  if (eos !== null && eos > 500) whitePatterns.push('Eosinofilia absoluta — investigar processos alérgicos, dermatites, asma, parasitoses ou fármacos.');
  if (whitePatterns.length === 0) {
    whitePatterns.push('Série branca dentro dos parâmetros usuais ou sem desvios expressivos isolados.');
  }

  const whiteSeries: WhiteSeriesPatternAssessment = {
    compatiblePatterns: whitePatterns,
    cautionNote:
      'Nunca utilizar um único parâmetro isolado para estabelecer etiologia infecciosa (bacteriana vs. viral); avaliar contexto clínico, intensidade e evolução temporal.'
  };

  // Plaquetas
  const plt = byId.get('plt')?.value ?? null;
  const vpm = byId.get('vpm')?.value ?? null;
  const pltPatterns: string[] = [];
  if (plt !== null && plt < 150000) {
    pltPatterns.push('Trombocitopenia — avaliar risco clínico, descartar agregação plaquetária em EDTA (pseudo-trombocitopenia) e investigar etiologia médica.');
  } else if (plt !== null && plt > 450000) {
    pltPatterns.push('Trombocitose — avaliar causa reativa (ferropenia, inflamação) vs. investigação hematológica específica.');
  }
  if (vpm !== null && (vpm < 7.4 || vpm > 11.5)) {
    pltPatterns.push('Alteração do volume plaquetário médio (VPM) — interpretar em conjunto com contagem plaquetária e lâmina.');
  }
  if (pltPatterns.length === 0) {
    pltPatterns.push('Contagem e índices plaquetários sem alterações relevantes.');
  }

  const platelets: PlateletPatternAssessment = {
    compatiblePatterns: pltPatterns,
    cautionNote:
      'Não calcular risco individual de trombose ou hemorragia apenas com índices plaquetários; considerar artefatos laboratoriais e confirmação em lâmina quando indicado.'
  };

  // MEB + Índices
  const meb = evaluateMebProtocol(parameters, context.giAndAllergicSymptoms);
  const indexes = calculateHematologicalIndexes(parameters);

  // Correlações cruzadas com exames complementares
  const complementaryCorrelations: string[] = [];
  const ferritina = compById.get('ferritina')?.value ?? null;
  const sat = compById.get('sat_transf')?.value ?? null;
  const pcr = compById.get('pcr')?.value ?? null;
  const b12 = compById.get('b12')?.value ?? null;
  const folato = compById.get('folato')?.value ?? null;
  const creat = compById.get('creatinina')?.value ?? null;

  if (ferritina !== null) {
    if (ferritina < 30) {
      complementaryCorrelations.push(
        `Ferritina baixa (${ferritina} ng/mL) corrobora depleção de estoques de ferro, mesmo antes da queda acentuada da hemoglobina.`
      );
    } else if (ferritina > 150 && pcr !== null && pcr > 3) {
      complementaryCorrelations.push(
        `Ferritina (${ferritina} ng/mL) acompanhada de PCR elevado (${pcr} mg/L): lembrar que a ferritina comporta-se como proteína de fase aguda inflamatória.`
      );
    }
  } else if (isAnemic || (calculatedVCM !== null && calculatedVCM < 80) || (rdw !== null && rdw > 14.5)) {
    complementaryCorrelations.push(
      'Ausência de Ferritina / Saturação de Transferrina no prontuário limita a diferenciação entre ferropenia, anemia inflamatória e traço talassêmico.'
    );
  }

  if (sat !== null && sat < 20) {
    complementaryCorrelations.push(`Saturação de transferrina reduzida (${sat}%) reforça baixa disponibilidade de ferro funcional para eritropoiese.`);
  }
  if (b12 !== null && b12 < 300) {
    complementaryCorrelations.push(`Vitamina B12 reduzida/limítrofe (${b12} pg/mL) correlaciona-se com risco de alteração megaloblástica / elevação de VCM.`);
  }
  if (folato !== null && folato < 4) {
    complementaryCorrelations.push(`Folato sérico baixo (${folato} ng/mL) pode contribuir para macrocitose ou falha na síntese de DNA eritroide.`);
  }
  if (creat !== null && creat > 1.3) {
    complementaryCorrelations.push(`Creatinina elevada (${creat} mg/dL) requer atenção quanto à possível influência renal na eritropoiese (eritropoetina).`);
  }

  // Dados essenciais faltantes no prontuário
  const missingEssentialContext: string[] = [];
  if (!context.medications.trim()) missingEssentialContext.push('Medicamentos em uso (não informado)');
  if (!context.supplements.trim()) missingEssentialContext.push('Suplementos em uso (não informado)');
  if (context.alcoholUse === 'nao_informado') missingEssentialContext.push('Consumo de álcool (não informado)');
  if (context.tobaccoUse === 'nao_informado') missingEssentialContext.push('Tabagismo (não informado)');

  // Comparação Longitudinal com exame anterior
  const longitudinalDeltas: LongitudinalHemogramDelta[] = [];
  if (previousRecord) {
    const prevMap = new Map(previousRecord.parameters.map((p) => [p.id, p]));
    const currDate = params.currentDate || new Date().toISOString().slice(0, 10);
    const prevDate = previousRecord.metadata.collectionDate || previousRecord.createdAt.slice(0, 10);

    for (const curr of parameters) {
      const prev = prevMap.get(curr.id);
      if (!prev) continue;
      if (curr.value === null && prev.value === null) continue;
      const deltaAbs =
        curr.value !== null && prev.value !== null
          ? Math.round((curr.value - prev.value) * 100) / 100
          : null;
      const deltaPct =
        deltaAbs !== null && prev.value !== null && prev.value !== 0
          ? Math.round((deltaAbs / prev.value) * 1000) / 10
          : null;

      longitudinalDeltas.push({
        parameterId: curr.id,
        name: curr.name,
        unit: curr.unit,
        previousValue: prev.value,
        currentValue: curr.value,
        deltaAbsolute: deltaAbs,
        deltaPercent: deltaPct,
        previousDate: prevDate,
        currentDate: currDate
      });
    }
  }

  return {
    parameterOutputs,
    redSeries,
    whiteSeries,
    platelets,
    meb,
    indexes,
    complementaryCorrelations,
    missingEssentialContext,
    longitudinalDeltas
  };
}
