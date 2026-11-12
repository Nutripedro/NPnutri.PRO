/**
 * Centralized Lab Exam Requisition Catalog
 * Featuring complete integrative panels with Ideal Values (Green) and Lab References (Yellow)
 */

import { LabExamItem, SupplementItem } from '../types';

export const CLINICAL_LAB_EXAMS: LabExamItem[] = [
  // 1. Perfil Metabólico & Glicêmico
  {
    id: 'exam-01',
    codeSUS: '02.02.01.047-3',
    name: 'Glicemia de Jejum',
    panel: 'metabolico',
    clinicalJustification: 'Avaliação da homeostase glicêmica basal e rastreamento precoce de resistência insulínica.',
    idealValueGreen: '75 – 85 mg/dL',
    referenceYellow: '70 – 99 mg/dL',
    selected: true
  },
  {
    id: 'exam-02',
    codeSUS: '02.02.01.050-3',
    name: 'Hemoglobina Glicada (HbA1c)',
    panel: 'metabolico',
    clinicalJustification: 'Média ponderada da glicemia nos últimos 90 a 120 dias; controle de glicosilação.',
    idealValueGreen: '< 5,3%',
    referenceYellow: '< 5,7%',
    selected: true
  },
  {
    id: 'exam-03',
    codeSUS: '02.02.01.053-8',
    name: 'Insulina Basal em Jejum (com HOMA-IR)',
    panel: 'metabolico',
    clinicalJustification: 'Detecção de hiperinsulinemia compensatória e cálculo do índice HOMA-IR de resistência insulínica.',
    idealValueGreen: '2,0 – 5,0 µU/mL (HOMA < 1,0)',
    referenceYellow: '2,6 – 24,9 µU/mL (HOMA < 2,5)',
    selected: true
  },
  {
    id: 'exam-03b',
    codeSUS: '02.02.01.054-6',
    name: 'Peptídeo C',
    panel: 'metabolico',
    clinicalJustification: 'Avaliação da reserva secretora pancreática endógena e função das células beta.',
    idealValueGreen: '0,9 – 2,5 ng/mL',
    referenceYellow: '0,9 – 7,1 ng/mL',
    selected: false
  },
  {
    id: 'exam-03c',
    codeSUS: '02.02.01.055-4',
    name: 'Frutosamina',
    panel: 'metabolico',
    clinicalJustification: 'Avaliação do controle glicêmico de curto prazo (últimas 2 a 3 semanas).',
    idealValueGreen: '205 – 250 µmol/L',
    referenceYellow: '205 – 285 µmol/L',
    selected: false
  },

  // 2. Perfil Lipídico Avançado & Risco Cardiovascular
  {
    id: 'exam-04',
    codeSUS: '02.02.01.029-5',
    name: 'Colesterol Total & Frações (HDL, LDL, VLDL, Não-HDL)',
    panel: 'lipidico',
    clinicalJustification: 'Estratificação de risco aterogênico e adequação do perfil lipídico funcional.',
    idealValueGreen: 'Total: 160-200 | HDL > 60 | LDL < 70 mg/dL',
    referenceYellow: 'Total < 190 | HDL > 40 | LDL < 100 mg/dL',
    selected: true
  },
  {
    id: 'exam-05',
    codeSUS: '02.02.01.067-8',
    name: 'Triglicerídeos em Jejum',
    panel: 'lipidico',
    clinicalJustification: 'Avaliação de lipogênese hepática e relação TG/HDL como marcador de resistência.',
    idealValueGreen: '< 80 mg/dL (ideal < 100)',
    referenceYellow: '< 150 mg/dL',
    selected: true
  },
  {
    id: 'exam-06',
    codeSUS: '02.02.01.011-2',
    name: 'Apolipoproteína B (ApoB)',
    panel: 'lipidico',
    clinicalJustification: 'Contagem direta do número total de partículas aterogênicas circulantes (LDL-p, VLDL).',
    idealValueGreen: '< 70 mg/dL (ideal < 90)',
    referenceYellow: '60 – 133 mg/dL',
    selected: true
  },
  {
    id: 'exam-06b',
    codeSUS: '02.02.01.012-0',
    name: 'Apolipoproteína A1 (ApoA1)',
    panel: 'lipidico',
    clinicalJustification: 'Avaliação das partículas protetoras HDL e capacidade de efluxo de colesterol.',
    idealValueGreen: '130 – 180 mg/dL',
    referenceYellow: '94 – 178 mg/dL',
    selected: false
  },
  {
    id: 'exam-06c',
    codeSUS: '02.02.01.013-9',
    name: 'Lipoproteína (a) - Lp(a)',
    panel: 'lipidico',
    clinicalJustification: 'Fator de risco genético independente para doença cardiovascular e trombose.',
    idealValueGreen: '< 20 mg/dL',
    referenceYellow: '< 30 mg/dL',
    selected: false
  },

  // 3. Marcadores Inflamatórios & Trombóticos
  {
    id: 'exam-17',
    codeSUS: '02.02.03.011-3',
    name: 'Proteína C-Reativa Ultrassensível (PCR-us)',
    panel: 'inflamatorio',
    clinicalJustification: 'Detecção de inflamação subclínica de baixo grau e risco endotelial.',
    idealValueGreen: '< 0,5 mg/L',
    referenceYellow: '< 1,0 mg/L',
    selected: true
  },
  {
    id: 'exam-17b',
    codeSUS: '02.02.03.012-1',
    name: 'Homocisteína Plasmática',
    panel: 'inflamatorio',
    clinicalJustification: 'Marcador de metilação, risco vascular e saúde endotelial (Cofatores B6/B12/Folato).',
    idealValueGreen: '5,0 – 8,0 µmol/L',
    referenceYellow: '5,0 – 15,0 µmol/L',
    selected: true
  },
  {
    id: 'exam-17c',
    codeSUS: '02.02.03.013-0',
    name: 'Velocidade de Hemossedimentação (VHS)',
    panel: 'inflamatorio',
    clinicalJustification: 'Avaliação inespecífica de processos inflamatórios agudos ou crônicos.',
    idealValueGreen: '< 10 mm/h',
    referenceYellow: '0 – 15 mm/h (H) / 0 – 20 (M)',
    selected: false
  },
  {
    id: 'exam-17d',
    codeSUS: '02.02.03.014-9',
    name: 'Fibrinogênio Plasmático',
    panel: 'inflamatorio',
    clinicalJustification: 'Fator de coagulação e marcador de fase aguda inflamatória.',
    idealValueGreen: '200 – 300 mg/dL',
    referenceYellow: '200 – 400 mg/dL',
    selected: false
  },

  // 4. Hemograma Completo & Índices Eritrocitários
  {
    id: 'exam-16',
    codeSUS: '02.02.02.038-0',
    name: 'Hemograma Completo com Plaquetas e Índices',
    panel: 'inflamatorio',
    clinicalJustification: 'Avaliação de séries vermelha, branca, plaquetária, VCM, HCM e RDW (anemias e imunidade).',
    idealValueGreen: 'Hb: 14-16 (H)/13-14.5 (M) | VCM: 86-92 fL',
    referenceYellow: 'Hb: 13.5-17.5 | VCM: 80-100 fL',
    selected: true
  },

  // 5. Função Tireoidiana & Autoimunidade
  {
    id: 'exam-07',
    codeSUS: '02.02.06.025-0',
    name: 'TSH Ultrassensível',
    panel: 'tireoide',
    clinicalJustification: 'Avaliação da regulação central do eixo tireoidiano e impacto no metabolismo basal.',
    idealValueGreen: '1,0 – 2,0 µUI/mL',
    referenceYellow: '0,4 – 4,0 µUI/mL',
    selected: true
  },
  {
    id: 'exam-08',
    codeSUS: '02.02.06.027-6',
    name: 'T4 Livre & T3 Livre',
    panel: 'tireoide',
    clinicalJustification: 'Quantificação dos hormônios tireoidianos ativos circulantes nos tecidos periféricos.',
    idealValueGreen: 'T4L: 1,1-1,5 ng/dL | T3L: 3,2-4,0 pg/mL',
    referenceYellow: 'T4L: 0,8-1,8 | T3L: 2,3-4,2',
    selected: true
  },
  {
    id: 'exam-08b',
    codeSUS: '02.02.06.028-4',
    name: 'T3 Reverso',
    panel: 'tireoide',
    clinicalJustification: 'Avaliação de conversão periférica reduzida (síndrome do T3 baixo / estresse crônico).',
    idealValueGreen: '< 18 ng/dL (Relação T3L/T3R > 20)',
    referenceYellow: '9 – 27 ng/dL',
    selected: false
  },
  {
    id: 'exam-08c',
    codeSUS: '02.02.06.029-2',
    name: 'Anticorpos Anti-TPO e Anti-Tireoglobulina',
    panel: 'tireoide',
    clinicalJustification: 'Rastreamento de tireoidite autoimune de Hashimoto ou Doença de Graves.',
    idealValueGreen: 'Anti-TPO < 10 UI/mL | Anti-Tg < 20',
    referenceYellow: 'Anti-TPO < 35 | Anti-Tg < 115',
    selected: false
  },

  // 6. Perfil Hormonal & Adrenal
  {
    id: 'exam-09',
    codeSUS: '02.02.06.014-4',
    name: 'Cortisol Sérico (8h) / Cortisol Salivar',
    panel: 'adrenal',
    clinicalJustification: 'Avaliação da resposta matinal do eixo adrenal e ritmo circadiano de cortisol.',
    idealValueGreen: 'Sérico 8h: 12 – 18 µg/dL',
    referenceYellow: 'Sérico 8h: 5 – 25 µg/dL',
    selected: false
  },
  {
    id: 'exam-09b',
    codeSUS: '02.02.06.015-2',
    name: 'DHEA-S e Testosterona Total / Livre',
    panel: 'adrenal',
    clinicalJustification: 'Avaliação de andrógenos adrenais e gonadais para composição corporal e vitalidade.',
    idealValueGreen: 'DHEA-S: 250-400 (H)/180-350 (M)',
    referenceYellow: 'DHEA-S: 35 – 430 µg/dL',
    selected: false
  },
  {
    id: 'exam-09c',
    codeSUS: '02.02.06.016-0',
    name: 'Estradiol, Progesterona e SHBG',
    panel: 'adrenal',
    clinicalJustification: 'Equilíbrio hormonal de esteroides sexuais e fração biodisponível.',
    idealValueGreen: 'SHBG: 25-45 (H)/40-80 (M) nmol/L',
    referenceYellow: 'SHBG: 10 – 114 nmol/L',
    selected: false
  },

  // 7. Micronutrientes Essenciais (Vitaminas & Minerais)
  {
    id: 'exam-13',
    codeSUS: '02.02.01.076-7',
    name: '25-Hidroxivitamina D [25(OH)D]',
    panel: 'micronutrientes',
    clinicalJustification: 'Modulação imune, homeostase cálcio/fósforo e saúde musculoesquelética.',
    idealValueGreen: '50 – 80 ng/mL',
    referenceYellow: '20 – 60 ng/mL',
    selected: true
  },
  {
    id: 'exam-14',
    codeSUS: '02.02.01.078-3',
    name: 'Vitamina B12 (Cobalamina) e Folato Sérico',
    panel: 'micronutrientes',
    clinicalJustification: 'Ciclo de metilação, prevenção de anemia megaloblástica e neuroproteção.',
    idealValueGreen: 'B12: 600 – 950 pg/mL | Folato: 12-20',
    referenceYellow: 'B12: 211 – 911 | Folato: 3.1-17.5',
    selected: true
  },
  {
    id: 'exam-15',
    codeSUS: '02.02.01.042-2',
    name: 'Ferro Sérico, Ferritina e Saturação de Transferrina',
    panel: 'micronutrientes',
    clinicalJustification: 'Avaliação completa de estoques e transporte de ferro para oxigenação celular.',
    idealValueGreen: 'Ferritina: 50-150 (H)/40-100 (M) ng/mL',
    referenceYellow: 'Ferritina: 15 – 400 ng/mL',
    selected: true
  },
  {
    id: 'exam-15b',
    codeSUS: '02.02.01.043-0',
    name: 'Zinco, Cobre e Magnésio Eritrocitário',
    panel: 'micronutrientes',
    clinicalJustification: 'Cofatores enzimáticos essenciais para imunidade, tireoide e metabolismo energético.',
    idealValueGreen: 'Zinco: 95-120 | Magnésio Eritro: 5.2-6.5',
    referenceYellow: 'Zinco: 70-120 µg/dL',
    selected: false
  },
  {
    id: 'exam-15c',
    codeSUS: '02.02.01.044-9',
    name: 'Índice de Ômega-3 (EPA + DHA)',
    panel: 'micronutrientes',
    clinicalJustification: 'Percentual de ácidos graxos essenciais nas membranas eritrocitárias (risco cardiovascular).',
    idealValueGreen: '> 8,0% – 10,0%',
    referenceYellow: '> 4,0%',
    selected: false
  },

  // 8. Função Hepática & Detoxificação
  {
    id: 'exam-10',
    codeSUS: '02.02.01.064-3',
    name: 'Transaminases (TGO/AST, TGP/ALT) & GGT Funcional',
    panel: 'hepatico_renal',
    clinicalJustification: 'Monitoramento da integridade de hepatócitos e triagem de esteatose metabólica.',
    idealValueGreen: 'TGO/TGP: 15-25 U/L | GGT < 20 U/L',
    referenceYellow: 'TGO/TGP < 40 U/L | GGT < 60 U/L',
    selected: true
  },
  {
    id: 'exam-10b',
    codeSUS: '02.02.01.065-1',
    name: 'Fosfatase Alcalina, Bilirrubinas e Albumina Sérica',
    panel: 'hepatico_renal',
    clinicalJustification: 'Avaliação do fluxo biliar, síntese proteica visceral e função hepática geral.',
    idealValueGreen: 'Albumina: 4,3 – 4,8 g/dL',
    referenceYellow: 'Albumina: 3,5 – 5,2 g/dL',
    selected: false
  },

  // 9. Função Renal & Equilíbrio Eletrolítico
  {
    id: 'exam-11',
    codeSUS: '02.02.01.038-4',
    name: 'Creatinina com TFG (eGFR) e Ureia Sérica',
    panel: 'hepatico_renal',
    clinicalJustification: 'Taxa de filtração glomerular estimada e segurança para aportes proteicos.',
    idealValueGreen: 'Creatinina: 0,8-1,1 (H)/0,7-0,9 (M)',
    referenceYellow: 'Creatinina: 0,7 – 1,3 mg/dL',
    selected: true
  },
  {
    id: 'exam-12',
    codeSUS: '02.02.01.069-4',
    name: 'Ácido Úrico Sérico',
    panel: 'hepatico_renal',
    clinicalJustification: 'Marcador de estresse oxidativo, frutose e metabolismo purínico.',
    idealValueGreen: '3,5 – 5,5 mg/dL',
    referenceYellow: '3,5 – 7,2 mg/dL',
    selected: true
  },

  // 10. Marcadores Neurometabólicos & Saúde Intestinal
  {
    id: 'exam-18',
    codeSUS: '02.02.09.011-0',
    name: 'Calprotectina Fecal & Zonulina',
    panel: 'intestinal',
    clinicalJustification: 'Avaliação de inflamação intestinal e permeabilidade de barreira (tight junctions).',
    idealValueGreen: 'Calprotectina < 50 µg/g',
    referenceYellow: 'Calprotectina < 150 µg/g',
    selected: false
  }
];

export const CLINICAL_SUPPLEMENTS: SupplementItem[] = [
  {
    id: 'supp-01',
    name: 'Creatina Monoidratada Micronizada (Creapure®)',
    category: 'performance',
    practitionerScope: 'nutricionista',
    activeIngredient: 'Creatina monoidratada 100% pura',
    standardDose: '5g ao dia',
    posology: 'Ingerir 5g (1 dosador) diluído em 200ml de água ou suco junto à refeição rica em carboidratos.',
    timing: 'Uso contínuo diário (inclusive em dias de descanso), preferencialmente pós-treino.',
    route: 'Via Oral',
    clinicalIndications: ['Aumento de força e potência muscular', 'Resistência ao treinamento anaeróbico', 'Neuroproteção e suporte cognitivo'],
    warnings: 'Garantir hidratação diária adequada (> 35-40 ml/kg).'
  },
  {
    id: 'supp-02',
    name: 'Whey Protein Isolado (WPI 90%)',
    category: 'performance',
    practitionerScope: 'nutricionista',
    activeIngredient: 'Proteína isolada do soro do leite',
    standardDose: '30g ao dia (27g proteína líquida)',
    posology: 'Diluir 30g em 200ml de água gelada ou misturado a frutas batidas.',
    timing: 'Pós-treino imediato ou fracionado como lanche hiperproteico da tarde.',
    route: 'Via Oral',
    clinicalIndications: ['Estímulo da síntese proteica muscular (MPS)', 'Aporte de leucina (> 3g)', 'Recuperação muscular acelerada'],
    warnings: 'Contraindicado para pacientes com alergia comprovada à proteína do leite (APLV).'
  },
  {
    id: 'supp-03',
    name: 'Ômega-3 TG Ultra Concentrado (EPA / DHA)',
    category: 'saude_geral',
    practitionerScope: 'nutricionista',
    activeIngredient: 'Óleo de peixe purificado em triglicerídeos (TG): 600mg EPA + 400mg DHA',
    standardDose: '2 cápsulas ao dia (1.000mg EPA/DHA total)',
    posology: 'Tomar 2 cápsulas gelatinosas junto com o almoço ou jantar.',
    timing: 'Junto à maior refeição lipídica para otimizar absorção micelar.',
    route: 'Via Oral',
    clinicalIndications: ['Modulação da inflamação sistêmica (PCR-us)', 'Melhora do perfil lipídico e redução de triglicerídeos', 'Saúde endotelial e cognitiva'],
    warnings: 'Interromper uso 7 dias antes de cirurgias eletivas (efeito antiplaquetário leve).'
  },
  {
    id: 'supp-04',
    name: 'Bisglicinato de Magnésio (Quelado Alta Biodisponibilidade)',
    category: 'longevidade',
    practitionerScope: 'nutricionista',
    activeIngredient: 'Magnésio quelato bisglicinato (350mg de magnésio elementar)',
    standardDose: '350mg ao dia',
    posology: 'Ingerir 1 cápsula à noite, cerca de 45 minutos antes de deitar.',
    timing: 'Noturno, antes de dormir.',
    route: 'Via Oral',
    clinicalIndications: ['Qualidade do sono profundo e relaxamento neuromuscular', 'Cofator em mais de 300 reações enzimáticas', 'Sensibilidade à insulina'],
    warnings: 'Pacientes com insuficiência renal crônica grave devem monitorar magnesemia.'
  },
  {
    id: 'supp-05',
    name: 'Coenzima Q10 (Ubiquinona + Vitamina E)',
    category: 'longevidade',
    practitionerScope: 'nutricionista',
    activeIngredient: 'Coenzima Q10 100mg + Tocoferóis',
    standardDose: '100mg a 200mg ao dia',
    posology: 'Ingerir 1 cápsula pela manhã junto ao café da manhã.',
    timing: 'Pela manhã com fonte lipídica.',
    route: 'Via Oral',
    clinicalIndications: ['Bioenergética mitocondrial', 'Antioxidante lipofílico potente', 'Compensação da depleção induzida por estatinas'],
    warnings: 'Não ingerir em jejum prolongado para não diminuir a taxa de absorção.'
  },
  {
    id: 'supp-06',
    name: 'Vitamina D3 (Colecalciferol) em Gotas Oleosas',
    category: 'imunidade',
    practitionerScope: 'medico_ou_nutricionista',
    activeIngredient: 'Colecalciferol 2.000 UI por gota (veículo TCM)',
    standardDose: '4.000 UI ao dia (2 gotas)',
    posology: 'Pingar 2 gotas diretamente na boca ou sobre um alimento gorduroso.',
    timing: 'Pela manhã ou no almoço.',
    route: 'Via Oral',
    clinicalIndications: ['Modulação da imunidade inata e adaptativa', 'Homeostase de cálcio e mineralização óssea', 'Prevenção de doenças autoimunes'],
    warnings: 'Monitorar calcemia e calciúria em caso de uso prolongado em doses > 10.000 UI/dia.'
  }
];

import { Patient } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-01',
    name: 'Dra. Beatriz Menezes',
    email: 'beatriz.menezes@email.com',
    phone: '+55 11 98877-6655',
    cpf: '123.456.789-00',
    birthDate: '1992-05-14',
    age: 34,
    sex: 'female',
    heightCm: 168,
    currentWeightKg: 64.5,
    initialWeightKg: 68.0,
    imc: 22.8,
    avatarInitials: 'BM',
    recordNumber: 'PR-2026-001',
    goal: 'Hipertrofia & Composição Corporal',
    lastAssessmentDate: '2026-10-24',
    unit: 'São Paulo - Jardins',
    weightHistory: [
      { date: '2026-08-01', weightKg: 68.0, bodyFatPercent: 24.5, leanMassKg: 51.3, waistCm: 80 },
      { date: '2026-09-01', weightKg: 66.2, bodyFatPercent: 23.0, leanMassKg: 51.0, waistCm: 77 },
      { date: '2026-10-24', weightKg: 64.5, bodyFatPercent: 21.2, leanMassKg: 50.8, waistCm: 74 }
    ],
    bioimpedanceHistory: [
      {
        id: 'bia-00',
        date: '2026-08-01',
        patientId: 'pat-01',
        device: 'InBody 770',
        frequencyKhz: '5, 50, 250',
        weightKg: 68.0,
        leanMassKg: 51.3,
        leanMassPercent: 75.5,
        fatMassKg: 16.7,
        fatMassPercent: 24.5,
        totalBodyWaterL: 37.5,
        totalBodyWaterPercent: 55.2,
        intracellularWaterL: 23.6,
        extracellularWaterL: 13.9,
        edemaIndex: 0.370,
        bodyFatPercent: 24.5,
        bmrKcal: 1450,
        tdeeKcal: 2200,
        activityFactor: 1.55,
        bmi: 24.1,
        phaseAngleDeg: 6.8,
        resistanceOhm: 540,
        reactanceOhm: 62,
        fourCompartment: { waterKg: 37.5, proteinKg: 11.0, mineralKg: 3.6, fatKg: 16.7 },
        segmental: { rightArmKg: 2.5, leftArmKg: 2.45, trunkKg: 24.5, rightLegKg: 8.0, leftLegKg: 7.9 },
        clinicalOpinion: 'Avaliação inicial.'
      },
      {
        id: 'bia-00b',
        date: '2026-09-01',
        patientId: 'pat-01',
        device: 'InBody 770',
        frequencyKhz: '5, 50, 250',
        weightKg: 66.2,
        leanMassKg: 51.0,
        leanMassPercent: 77.0,
        fatMassKg: 15.2,
        fatMassPercent: 23.0,
        totalBodyWaterL: 37.3,
        totalBodyWaterPercent: 56.3,
        intracellularWaterL: 23.5,
        extracellularWaterL: 13.8,
        edemaIndex: 0.371,
        bodyFatPercent: 23.0,
        bmrKcal: 1435,
        tdeeKcal: 2180,
        activityFactor: 1.55,
        bmi: 23.5,
        phaseAngleDeg: 7.1,
        resistanceOhm: 530,
        reactanceOhm: 65,
        fourCompartment: { waterKg: 37.3, proteinKg: 10.9, mineralKg: 3.5, fatKg: 15.2 },
        segmental: { rightArmKg: 2.48, leftArmKg: 2.44, trunkKg: 24.3, rightLegKg: 7.9, leftLegKg: 7.85 },
        clinicalOpinion: 'Melhora no ângulo de fase.'
      },
      {
        id: 'bia-01',
        date: '2026-10-24',
        patientId: 'pat-01',
        device: 'InBody 770',
        frequencyKhz: '5, 50, 250',
        weightKg: 64.5,
        leanMassKg: 50.9,
        leanMassPercent: 78.8,
        fatMassKg: 13.6,
        fatMassPercent: 21.2,
        totalBodyWaterL: 37.2,
        totalBodyWaterPercent: 57.7,
        intracellularWaterL: 23.4,
        extracellularWaterL: 13.8,
        edemaIndex: 0.371,
        bodyFatPercent: 21.2,
        bmrKcal: 1420,
        tdeeKcal: 2150,
        activityFactor: 1.55,
        bmi: 22.8,
        phaseAngleDeg: 7.4,
        resistanceOhm: 520,
        reactanceOhm: 68,
        fourCompartment: { waterKg: 37.2, proteinKg: 10.8, mineralKg: 3.5, fatKg: 13.6 },
        segmental: { rightArmKg: 2.45, leftArmKg: 2.42, trunkKg: 24.1, rightLegKg: 7.8, leftLegKg: 7.75 },
        clinicalOpinion: 'Ângulo de fase excelente (7.4°).'
      }
    ]
  },
  {
    id: 'pat-02',
    name: 'Carlos Eduardo Silveira',
    email: 'carlos.silveira@email.com',
    phone: '+55 11 97766-5544',
    cpf: '321.654.987-11',
    birthDate: '1985-11-22',
    age: 40,
    sex: 'male',
    heightCm: 178,
    currentWeightKg: 85.0,
    initialWeightKg: 92.0,
    imc: 26.8,
    avatarInitials: 'CS',
    recordNumber: 'PR-2026-002',
    goal: 'Emagrecimento & Perda de Gordura Visceral',
    lastAssessmentDate: '2026-10-20',
    unit: 'São Paulo - Jardins',
    weightHistory: [
      { date: '2026-07-15', weightKg: 92.0, bodyFatPercent: 28.5 },
      { date: '2026-08-20', weightKg: 89.0, bodyFatPercent: 26.8 },
      { date: '2026-10-20', weightKg: 85.0, bodyFatPercent: 24.0 }
    ]
  },
  {
    id: 'pat-03',
    name: 'Lucas Gabriel Medeiros (Pediátrico)',
    email: 'pediatria@medeiros.com',
    phone: '+55 11 96655-4433',
    cpf: '555.444.333-22',
    birthDate: '2021-04-10',
    age: 5,
    sex: 'male',
    heightCm: 110,
    currentWeightKg: 18.5,
    initialWeightKg: 16.0,
    imc: 15.3,
    avatarInitials: 'LG',
    recordNumber: 'PR-2026-003',
    goal: 'Acompanhamento do Crescimento e Desenvolvimento Pediátrico',
    lastAssessmentDate: '2026-10-25',
    unit: 'São Paulo - Jardins',
    isPediatric: true,
    birthLengthCm: 50,
    birthWeightKg: 3.350,
    birthHeadCircCm: 35.0,
    gestationalWeeksAtBirth: 39,
    motherName: 'Mariana Medeiros',
    pediatricianName: 'Dr. Roberto Santos',
    pediatricMeasurements: [
      { id: 'p-01', consultationDate: '2021-04-10', ageMonths: 0, ageDisplay: 'Ao nascer (0m)', weightKg: 3.35, heightCm: 50, headCircumferenceCm: 35, notes: 'Nascimento a termo' },
      { id: 'p-02', consultationDate: '2022-04-10', ageMonths: 12, ageDisplay: '1 ano (12m)', weightKg: 10.2, heightCm: 76, headCircumferenceCm: 46, notes: 'Acompanhamento 1 ano' },
      { id: 'p-03', consultationDate: '2026-10-25', ageMonths: 66, ageDisplay: '5 anos e 6 meses (66m)', weightKg: 18.5, heightCm: 110, headCircumferenceCm: 50, notes: 'Consulta atual' }
    ]
  }
];

export const INITIAL_ANTHRO_EVALUATION = {
  id: 'anthro-01',
  date: '2026-10-24',
  patientId: 'pat-01',
  protocol: 'jp7' as const,
  equation: 'siri' as const,
  caliperModel: 'Lange Professional',
  weightKg: 64.5,
  heightCm: 168,
  sumSkinfoldsMm: 68.5,
  bodyDensity: 1.0542,
  bodyFatPercent: 21.2,
  fatMassKg: 13.6,
  leanMassKg: 50.9,
  targetBodyFatPercent: 19.0,
  targetWeightKg: 62.5,
  weightDeltaKg: -2.0,
  fatLossGoalKg: -2.1,
  classification: 'Eutrofia / Percentual Adequado',
  clinicalOpinion: 'Excelente evolução na redução de gordura subcutânea mantendo a massa magra preservada.',
  sites: {
    subscapular: { t1: 12, t2: 12, t3: 12, median: 12 },
    triceps: { t1: 15, t2: 15, t3: 16, median: 15 },
    chest: { t1: 8, t2: 8, t3: 9, median: 8 },
    axillary: { t1: 10, t2: 10, t3: 10, median: 10 },
    suprailiac: { t1: 14, t2: 13, t3: 14, median: 14 },
    abdominal: { t1: 18, t2: 19, t3: 18, median: 18 },
    thigh: { t1: 16, t2: 16, t3: 17, median: 16 }
  }
};

export const INITIAL_BIA_EVALUATION = {
  id: 'bia-01',
  date: '2026-10-24',
  patientId: 'pat-01',
  device: 'InBody 770 Multi-Frequency',
  frequencyKhz: '5 kHz, 50 kHz, 250 kHz',
  weightKg: 64.5,
  leanMassKg: 50.9,
  leanMassPercent: 78.8,
  fatMassKg: 13.6,
  fatMassPercent: 21.2,
  totalBodyWaterL: 37.2,
  totalBodyWaterPercent: 57.7,
  intracellularWaterL: 23.4,
  extracellularWaterL: 13.8,
  edemaIndex: 0.371,
  bodyFatPercent: 21.2,
  bmrKcal: 1420,
  tdeeKcal: 2150,
  activityFactor: 1.55,
  bmi: 22.8,
  phaseAngleDeg: 7.4,
  resistanceOhm: 520,
  reactanceOhm: 68,
  fourCompartment: {
    waterKg: 37.2,
    proteinKg: 10.8,
    mineralKg: 3.5,
    fatKg: 13.6
  },
  segmental: {
    rightArmKg: 2.45,
    leftArmKg: 2.42,
    trunkKg: 24.1,
    rightLegKg: 7.8,
    leftLegKg: 7.75
  },
  clinicalOpinion: 'Ângulo de fase excelente (7.4°), indicando ótima integridade de membrana celular e vitalidade.'
};

export const INITIAL_RCQ_EVALUATION = {
  id: 'rcq-01',
  date: '2026-10-24',
  patientId: 'pat-01',
  sex: 'female' as const,
  age: 34,
  waistCm: 74,
  hipCm: 98,
  ratio: 0.755,
  riskCategory: 'BAIXO' as const,
  morphology: 'Ginóide (Pêra)',
  waistRiskWHO: 'Baixo' as const,
  visceralFatClassification: 'Nível Saudável (Nível 3)',
  targetRatio: 0.74,
  clinicalOpinion: 'Relação cintura-quadril excelente, sem risco cardiometabólico associado.'
};

export const INITIAL_NECK_EVALUATION = {
  id: 'neck-01',
  date: '2026-10-24',
  patientId: 'pat-01',
  sex: 'female' as const,
  neckCircumferenceCm: 32.5,
  cutoffCm: 34.0,
  handgripKgf: 32.5,
  relativeStrengthKgfPerKg: 0.50,
  neckHeightRatio: 0.193,
  compositeRisk: 'Baixo Risco' as const,
  insulinResistanceRisk: false,
  sleepApneaRisk: false,
  sarcopeniaRisk: false,
  clinicalOpinion: 'Circunferência cervical e força de preensão manual dentro dos padrões ótimos.'
};

export const INITIAL_PHOTOGRAMMETRY = {
  id: 'photo-01',
  patientId: 'pat-01',
  dateT0: '2026-08-01',
  dateT1: '2026-10-24',
  weightT0Kg: 68.0,
  weightT1Kg: 64.5,
  bodyFatT0Percent: 24.5,
  bodyFatT1Percent: 21.2,
  leanMassT0Kg: 51.3,
  leanMassT1Kg: 50.9,
  fatMassT0Kg: 16.6,
  fatMassT1Kg: 13.6,
  perimetry: {
    waistNarrowT0: 78,
    waistNarrowT1: 74,
    abdomenUmbilicalT0: 84,
    abdomenUmbilicalT1: 79,
    hipMaxT0: 101,
    hipMaxT1: 98,
    thighMedialT0: 58,
    thighMedialT1: 56,
    armRelaxedT0: 28,
    armRelaxedT1: 28,
    chestT0: 92,
    chestT1: 91
  },
  photos: {
    frontalT0Url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    frontalT1Url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  },
  clinicalOpinion: 'Visível redução de adiposidade na região abdominal e cintura, preservando tônus muscular.'
};

export const INITIAL_DIET_PLAN = {
  id: 'diet-01',
  patientId: 'pat-01',
  createdAt: '2026-10-24',
  title: 'Plano Nutricional Clean Bulk / Hipertrofia Funcional',
  formula: 'mifflin' as const,
  bmrKcal: 1420,
  activityFactor: 1.55,
  tdeeKcal: 2150,
  objective: 'superavit_hipertrofia' as const,
  calorieTargetKcal: 2350,
  calorieDeltaKcal: 200,
  proteinGrams: 130,
  proteinGPerKg: 2.0,
  proteinPercent: 22,
  carbsGrams: 280,
  carbsGPerKg: 4.3,
  carbsPercent: 48,
  fatGrams: 75,
  fatGPerKg: 1.1,
  fatPercent: 30,
  waterTargetMl: 2800,
  meals: [
    {
      id: 'meal-01',
      name: 'Café da Manhã Energizante',
      time: '07:30',
      items: [
        { id: 'mi-1', foodId: 'f-1', name: 'Ovos mexidos (2 unidades)', grams: 100, caloriesKcal: 145, proteinG: 13, carbsG: 1, fatG: 10, fiberG: 0 },
        { id: 'mi-2', foodId: 'f-2', name: 'Pão de fermentação natural (Levain)', grams: 60, caloriesKcal: 160, proteinG: 6, carbsG: 32, fatG: 1.5, fiberG: 3 },
        { id: 'mi-3', foodId: 'f-3', name: 'Abacate Hass', grams: 50, caloriesKcal: 80, proteinG: 1, carbsG: 4, fatG: 7, fiberG: 3 }
      ],
      totalCalories: 385,
      totalProtein: 20,
      totalCarbs: 37,
      totalFat: 18.5,
      totalFiber: 6
    },
    {
      id: 'meal-02',
      name: 'Almoço Funcional',
      time: '12:30',
      items: [
        { id: 'mi-4', foodId: 'f-4', name: 'Filé de Patinho grelhado', grams: 140, caloriesKcal: 280, proteinG: 38, carbsG: 0, fatG: 12, fiberG: 0 },
        { id: 'mi-5', foodId: 'f-5', name: 'Arroz Integral Cateto', grams: 120, caloriesKcal: 150, proteinG: 3, carbsG: 32, fatG: 1, fiberG: 3 },
        { id: 'mi-6', foodId: 'f-6', name: 'Feijão Preto com louro', grams: 90, caloriesKcal: 110, proteinG: 7, carbsG: 20, fatG: 0.5, fiberG: 6 },
        { id: 'mi-7', foodId: 'f-7', name: 'Brócolis e Azeite Extravirgem', grams: 150, caloriesKcal: 75, proteinG: 3, carbsG: 6, fatG: 5, fiberG: 4 }
      ],
      totalCalories: 615,
      totalProtein: 51,
      totalCarbs: 58,
      totalFat: 18.5,
      totalFiber: 13
    }
  ],
  clinicalNotes: 'Aumentar gradualmente a ingestão hídrica e fracionar o consumo proteico ao longo do dia.'
};

export const INITIAL_DAILY_LOG = {
  date: '2026-10-24',
  patientId: 'pat-01',
  consumedCaloriesKcal: 1850,
  targetCaloriesKcal: 2350,
  consumedProteinG: 110,
  targetProteinG: 130,
  consumedCarbsG: 220,
  targetCarbsG: 280,
  consumedFatG: 62,
  targetFatG: 75,
  consumedFiberG: 24,
  targetFiberG: 30,
  waterGlassesConsumed: 8,
  waterTargetGlasses: 11,
  mealsLogged: [
    { mealId: 'meal-01', mealName: 'Café da Manhã Energizante', consumed: true, time: '07:35', itemsSummary: 'Ovos, Pão Levain e Abacate', calories: 385 },
    { mealId: 'meal-02', mealName: 'Almoço Funcional', consumed: true, time: '12:40', itemsSummary: 'Patinho, Arroz, Feijão e Brócolis', calories: 615 }
  ]
};

export const INITIAL_ANVISA_LABEL = {
  productName: 'Granola Funcional Proteica & Castanhas',
  portionGrams: 40,
  householdMeasure: '4 colheres de sopa (40g)',
  portionsPerPackage: 7,
  energyKcal100g: 420,
  energyKcalPortion: 168,
  carbs100g: 54,
  totalSugars100g: 12,
  addedSugars100g: 8,
  protein100g: 16,
  totalFat100g: 14,
  saturatedFat100g: 2.5,
  transFat100g: 0,
  fiber100g: 10,
  sodium100gMg: 120,
  highAddedSugar: false,
  highSaturatedFat: false,
  highSodium: false
};

export const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-01',
    patientId: 'pat-01',
    patientName: 'Dra. Beatriz Menezes',
    patientRecord: 'PR-2026-001',
    patientPhone: '+55 11 98877-6655',
    type: 'retorno' as const,
    date: '2026-11-12',
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    status: 'confirmado' as const,
    unit: 'São Paulo - Jardins',
    modality: 'presencial' as const,
    notes: 'Avaliação de bioimpedância de retorno e ajuste de macros.',
    reminderSentWhatsApp: true
  },
  {
    id: 'apt-02',
    patientId: 'pat-02',
    patientName: 'Carlos Eduardo Silveira',
    patientRecord: 'PR-2026-002',
    patientPhone: '+55 11 97766-5544',
    type: 'primeira_consulta' as const,
    date: '2026-11-12',
    startTime: '11:15',
    endTime: '12:30',
    durationMinutes: 75,
    status: 'agendado' as const,
    unit: 'São Paulo - Jardins',
    modality: 'presencial' as const,
    notes: 'Primeira consulta de emagrecimento com exames laboratoriais.',
    reminderSentWhatsApp: false
  }
];

export const INITIAL_REMINDERS = [
  {
    id: 'rem-01',
    patientId: 'pat-01',
    type: 'hidratacao' as const,
    title: 'Meta de Hidratação Matinal',
    time: '10:00',
    enabled: true,
    repeatDaily: true,
    customMessage: 'Beba 500ml de água para manter o metabolismo ativo.',
    soundEnabled: true,
    targetAmount: '500 ml'
  },
  {
    id: 'rem-02',
    patientId: 'pat-01',
    type: 'suplemento' as const,
    title: 'Uso de Ômega-3',
    time: '12:30',
    enabled: true,
    repeatDaily: true,
    customMessage: 'Tomar 2 cápsulas junto ao almoço.',
    soundEnabled: true
  }
];

export const INITIAL_SETTINGS = {
  clinicName: 'Clínica de Nutrição Avançada & Longevidade',
  unit: 'São Paulo - Jardins',
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  allowPatientDeletion: true,
  features: {
    teleconsulta: true,
    whatsappReminders: true,
    anvisaLabeling: true
  }
};

export const INITIAL_PROFESSIONALS = [
  {
    id: 'prof-01',
    name: 'Dra. Gabriela Santos',
    email: 'gabriela@clinica.com',
    phone: '+55 11 99988-7766',
    cpf: '111.222.333-44',
    role: 'nutricionista' as const,
    councilType: 'CRN' as const,
    registrationCode: 'CRN-3 48910',
    specialty: 'Nutrição Clínica Avançada & Funcional',
    unit: 'São Paulo - Jardins',
    isActive: true,
    admissionDate: '2024-01-15',
    permissions: {
      canAccessClinicalRecords: true,
      canPerformAnthropometry: true,
      canManageGrowthCharts: true,
      canPrescribeDiets: true,
      canRequestExams: true,
      canPrescribeSupplements: true,
      canPrescribeMedicalExclusive: false,
      canManageAppointments: true,
      canRegisterPatients: true,
      canDeletePatients: true,
      canManageProfessionals: true,
      canManageSettings: true,
      canViewAuditLogs: true
    },
    avatarInitials: 'GS'
  },
  {
    id: 'prof-02',
    name: 'Dr. Marcelo Vasconcelos',
    email: 'marcelo@clinica.com',
    phone: '+55 11 98877-5544',
    cpf: '222.333.444-55',
    role: 'medico' as const,
    councilType: 'CRM' as const,
    registrationCode: 'CRM-SP 154892',
    specialty: 'Nutrologia & Medicina Esportiva',
    unit: 'São Paulo - Jardins',
    isActive: true,
    admissionDate: '2024-02-10',
    permissions: {
      canAccessClinicalRecords: true,
      canPerformAnthropometry: true,
      canManageGrowthCharts: true,
      canPrescribeDiets: true,
      canRequestExams: true,
      canPrescribeSupplements: true,
      canPrescribeMedicalExclusive: true,
      canManageAppointments: true,
      canRegisterPatients: true,
      canDeletePatients: false,
      canManageProfessionals: false,
      canManageSettings: false,
      canViewAuditLogs: true
    },
    avatarInitials: 'MV'
  },
  {
    id: 'prof-03',
    name: 'Camila Ribeiro',
    email: 'recepcao@clinica.com',
    phone: '+55 11 97766-3322',
    cpf: '333.444.555-66',
    role: 'recepcionista' as const,
    councilType: 'MATRICULA' as const,
    registrationCode: 'REC-2024-01',
    specialty: 'Recepção, LGPD & Atendimento',
    unit: 'São Paulo - Jardins',
    isActive: true,
    admissionDate: '2024-03-01',
    permissions: {
      canAccessClinicalRecords: false,
      canPerformAnthropometry: false,
      canManageGrowthCharts: false,
      canPrescribeDiets: false,
      canRequestExams: false,
      canPrescribeSupplements: false,
      canPrescribeMedicalExclusive: false,
      canManageAppointments: true,
      canRegisterPatients: true,
      canDeletePatients: false,
      canManageProfessionals: false,
      canManageSettings: false,
      canViewAuditLogs: false
    },
    avatarInitials: 'CR'
  }
];

export const TACO_FOOD_DATABASE = [
  { id: 'f-1', name: 'Ovos mexidos', category: 'Proteínas', portionGrams: 100, servingUnit: '100g', caloriesKcal: 145, proteinG: 13, carbsG: 1, fatG: 10, fiberG: 0, sodiumMg: 140 },
  { id: 'f-2', name: 'Pão de fermentação natural (Levain)', category: 'Cereais', portionGrams: 60, servingUnit: '2 fatias', caloriesKcal: 160, proteinG: 6, carbsG: 32, fatG: 1.5, fiberG: 3, sodiumMg: 280 },
  { id: 'f-3', name: 'Abacate Hass', category: 'Gorduras', portionGrams: 50, servingUnit: '2 colheres', caloriesKcal: 80, proteinG: 1, carbsG: 4, fatG: 7, fiberG: 3, sodiumMg: 2 },
  { id: 'f-4', name: 'Filé de Patinho grelhado', category: 'Carnes', portionGrams: 140, servingUnit: '1 filé médio', caloriesKcal: 280, proteinG: 38, carbsG: 0, fatG: 12, fiberG: 0, sodiumMg: 85 },
  { id: 'f-5', name: 'Arroz Integral Cateto', category: 'Cereais', portionGrams: 120, servingUnit: '4 colheres', caloriesKcal: 150, proteinG: 3, carbsG: 32, fatG: 1, fiberG: 3, sodiumMg: 5 },
  { id: 'f-6', name: 'Feijão Preto', category: 'Leguminosas', portionGrams: 90, servingUnit: '1 concha', caloriesKcal: 110, proteinG: 7, carbsG: 20, fatG: 0.5, fiberG: 6, sodiumMg: 12 },
  { id: 'f-7', name: 'Brócolis cozido', category: 'Vegetais', portionGrams: 150, servingUnit: '1 xícara', caloriesKcal: 75, proteinG: 3, carbsG: 6, fatG: 5, fiberG: 4, sodiumMg: 35 }
];

export const ISAK_SKINFOLD_SITES = [
  { siteKey: 'subscapular', namePt: 'Subescapular', code: 'SUB', anatomicalLocation: 'Abaixo do ângulo inferior da escápula', direction: 'Oblíqua', landmark: '45° em direção inferior e lateral', t1: 12, t2: 12, t3: 12, median: 12, imageAlt: 'Subscapular', imageUrl: '' },
  { siteKey: 'triceps', namePt: 'Tríceps', code: 'TRI', anatomicalLocation: 'Ponto médio entre acrômio e olécrano', direction: 'Vertical', landmark: 'Linha média posterior do braço', t1: 15, t2: 15, t3: 16, median: 15, imageAlt: 'Triceps', imageUrl: '' },
  { siteKey: 'chest', namePt: 'Peitoral', code: 'CST', anatomicalLocation: '1/2 da distância (homens) ou 1/3 (mulheres)', direction: 'Diagonal', landmark: 'Linha axilar anterior', t1: 8, t2: 8, t3: 9, median: 8, imageAlt: 'Chest', imageUrl: '' },
  { siteKey: 'axillary', namePt: 'Axilar Média', code: 'AXL', anatomicalLocation: 'Interseção da linha axilar média com o nível do processo xifoide', direction: 'Horizontal', landmark: 'Linha axilar média', t1: 10, t2: 10, t3: 10, median: 10, imageAlt: 'Axillary', imageUrl: '' },
  { siteKey: 'suprailiac', namePt: 'Supra-ilíaca', code: 'SIL', anatomicalLocation: 'Acima da crista ilíaca na linha axilar média', direction: 'Oblíqua', landmark: 'Linha natural de clivagem da pele', t1: 14, t2: 13, t3: 14, median: 14, imageAlt: 'Suprailiac', imageUrl: '' },
  { siteKey: 'abdominal', namePt: 'Abdominal', code: 'ABD', anatomicalLocation: 'A 5 cm lateralmente à cicatriz umbilical', direction: 'Vertical', landmark: 'Lateral ao umbigo', t1: 18, t2: 19, t3: 18, median: 18, imageAlt: 'Abdominal', imageUrl: '' },
  { siteKey: 'thigh', namePt: 'Coxa Medial', code: 'CXA', anatomicalLocation: 'Ponto médio entre prega inguinal e patela', direction: 'Vertical', landmark: 'Face anterior da coxa', t1: 16, t2: 16, t3: 17, median: 16, imageAlt: 'Thigh', imageUrl: '' }
];

export const INITIAL_FINANCIAL_TRANSACTIONS = [
  {
    id: 'tx-001',
    type: 'receita' as const,
    category: 'consulta_primeira' as const,
    description: 'Primeira Consulta Nutricional + Antropometria ISAK',
    amount: 450.00,
    date: '2026-11-10',
    dueDate: '2026-11-10',
    status: 'pago' as const,
    paymentMethod: 'pix' as const,
    patientId: 'pat-01',
    patientName: 'Dra. Beatriz Menezes',
    receiptNumber: 'REC-2026-089',
    notes: 'Pagamento via Pix confirmado no ato do atendimento.'
  },
  {
    id: 'tx-002',
    type: 'receita' as const,
    category: 'pacote_nutricional' as const,
    description: 'Programa Recomposição Corporal 3 Meses (1ª Parcela)',
    amount: 1200.00,
    date: '2026-11-08',
    dueDate: '2026-11-08',
    status: 'pago' as const,
    paymentMethod: 'cartao_credito' as const,
    patientId: 'pat-02',
    patientName: 'Carlos Eduardo Silveira',
    receiptNumber: 'REC-2026-088',
    notes: 'Parcelado em 3x no Cartão de Crédito.'
  },
  {
    id: 'tx-003',
    type: 'receita' as const,
    category: 'consulta_retorno' as const,
    description: 'Consulta de Acompanhamento e Ajuste de Macros',
    amount: 320.00,
    date: '2026-11-05',
    dueDate: '2026-11-05',
    status: 'pago' as const,
    paymentMethod: 'pix' as const,
    patientId: 'pat-01',
    patientName: 'Dra. Beatriz Menezes',
    receiptNumber: 'REC-2026-087'
  },
  {
    id: 'tx-004',
    type: 'receita' as const,
    category: 'bioimpedancia_avulsa' as const,
    description: 'Exame de Bioimpedância Multifrequencial 4C',
    amount: 180.00,
    date: '2026-11-04',
    dueDate: '2026-11-04',
    status: 'pago' as const,
    paymentMethod: 'dinheiro' as const,
    patientId: 'pat-02',
    patientName: 'Carlos Eduardo Silveira',
    receiptNumber: 'REC-2026-086'
  },
  {
    id: 'tx-005',
    type: 'despesa' as const,
    category: 'aluguel_consultorio' as const,
    description: 'Aluguel do Consultório - Unidade Jardins SP',
    amount: 3200.00,
    date: '2026-11-01',
    dueDate: '2026-11-05',
    status: 'pago' as const,
    paymentMethod: 'transferencia' as const,
    notes: 'Comprovante anexado no drive da clínica.'
  },
  {
    id: 'tx-006',
    type: 'despesa' as const,
    category: 'software_sistemas' as const,
    description: 'Assinatura Mensal - Plataforma NutriPro & Prontuário Eletrônico',
    amount: 299.00,
    date: '2026-11-02',
    dueDate: '2026-11-02',
    status: 'pago' as const,
    paymentMethod: 'cartao_credito' as const
  },
  {
    id: 'tx-007',
    type: 'despesa' as const,
    category: 'marketing_anuncios' as const,
    description: 'Campanha Instagram / Google Ads - Captação de Pacientes',
    amount: 650.00,
    date: '2026-11-03',
    dueDate: '2026-11-10',
    status: 'pago' as const,
    paymentMethod: 'cartao_credito' as const
  },
  {
    id: 'tx-008',
    type: 'receita' as const,
    category: 'consulta_primeira' as const,
    description: 'Primeira Consulta Pediátrica + Curvas OMS',
    amount: 480.00,
    date: '2026-11-12',
    dueDate: '2026-11-12',
    status: 'pendente' as const,
    paymentMethod: 'pix' as const,
    patientId: 'pat-03',
    patientName: 'Lucas Gabriel Medeiros (Pediátrico)',
    notes: 'Aguardando confirmação do pagamento no dia da consulta.'
  },
  {
    id: 'tx-009',
    type: 'despesa' as const,
    category: 'material_clinico' as const,
    description: 'Aparelhos e Insumos (Fitas antropométricas & Eletrodos BIA)',
    amount: 420.00,
    date: '2026-11-15',
    dueDate: '2026-11-15',
    status: 'pendente' as const,
    paymentMethod: 'boleto' as const
  },
  {
    id: 'tx-010',
    type: 'receita' as const,
    category: 'suplementos_venda' as const,
    description: 'Venda de Suplementos Recomendados (Creatina + Ômega 3)',
    amount: 240.00,
    date: '2026-10-28',
    dueDate: '2026-10-28',
    status: 'pago' as const,
    paymentMethod: 'pix' as const,
    patientId: 'pat-01',
    patientName: 'Dra. Beatriz Menezes',
    receiptNumber: 'REC-2026-085'
  }
];

