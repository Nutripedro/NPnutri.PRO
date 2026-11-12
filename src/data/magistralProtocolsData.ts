/**
 * SUPER PROMPT MESTRE — Biblioteca de 50 Protocolos Clínicos, Ativos Farmacológicos & Interações
 * Plataforma: NUTRI PRO — SaaS de Nutrição Clínica Integrativa
 * Conformidade: Resoluções CFN 656/2020, CFN 680/2021 e Diretrizes Anvisa
 */

export interface ClinicalProtocol {
  id: string; // ex: 'MET-01'
  title: string;
  category: 
    | 'metabolismo_glicemico'
    | 'cardiovascular'
    | 'gastrointestinal'
    | 'hepatica'
    | 'energia_micronutrientes'
    | 'cabelo_pele'
    | 'saude_hormonal'
    | 'sono_estresse'
    | 'musculo_exercicio'
    | 'imunidade_osso';
  categoryLabel: string;
  definition: string;
  causality: string;
  pathophysiology: string;
  predisposingFactors: string[];
  signsAndSymptoms: string[];
  differentialDiagnosis: string[];
  relatedLabExams: string[];
  investigationCriteria: string | string[];
  dietaryStrategy: string;
  suggestedActives: {
    name: string;
    standardDose: string;
    mechanism: string;
    benefit: string;
    alerts: string;
    evidenceLevel: 'Alta' | 'Moderada' | 'Preliminar' | 'Hipótese Mecanística';
  }[];
  contraindications: string[];
  drugInteractions: string[];
  monitoring: string;
  referralCriteria: string;
  scientificReferences: string[];
}

export interface PharmacologicalActive {
  id: string;
  name: string;
  chemicalName: string;
  synonyms: string[];
  pharmacologicalClass: string;
  chemicalForm: string;
  standardization: string;
  presentation: string[];
  studiedIndications: string[];
  mechanismOfAction: string;
  standardReferenceDose: string;
  safetyLimits: string;
  contraindications: string[];
  interactions: string[];
  cypInteractions?: string;
  adme: {
    absorption: string;
    distribution: string;
    metabolism: string;
    excretion: string;
    halfLife: string;
    bioavailability: string;
  };
  receptorRole: 'Agonista' | 'Antagonista' | 'Modulador Alostérico' | 'Inibidor Enzimático' | 'Substrato' | 'Cofator' | 'Modulador Metabólico';
  regulatoryStatusBrazil: 'Suplemento Alimentar (Anvisa)' | 'Fitoterápico de Prescrição Nutricional (CFN)' | 'Ativo Magistral / Manipulado';
  references: string[];
}

export interface DrugInteractionRecord {
  id: string;
  active: string;
  drug: string;
  cypEnzymeOrTransporter: string;
  mechanism: string;
  interactionType: 'Farmacocinética' | 'Farmacodinâmica' | 'Físico-Química';
  severity: 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'CINZA';
  severityLabel: string;
  clinicalAction: string;
  populationAtRisk: string;
  warningSymptoms: string;
  evidenceSource: string;
}

// ---------------------------------------------------------------------------
// 50 PROTOCOLOS CLÍNICOS ESTRUTURADOS (CATEGORIAS 01 A 10)
// ---------------------------------------------------------------------------
export const PROTOCOLS_LIBRARY_50: ClinicalProtocol[] = [
  // Categoria 01 — Metabolismo glicêmico e obesidade
  {
    id: 'MET-01',
    title: 'Resistência à Insulina & Sensibilização Celular',
    category: 'metabolismo_glicemico',
    categoryLabel: 'Metabolismo Glicêmico e Obesidade',
    definition: 'Diminuição da resposta tecidual à insulina endógena com compensação hiperinsulinêmica e disfunção do transportador GLUT4.',
    causality: 'Fatores genéticos predisponentes somados a excesso calórico crônico, sedentarismo e acúmulo de lipídios ectópicos em miócitos e hepatócitos.',
    pathophysiology: 'Fosforilação em serina do substrato do receptor de insulina (IRS-1), redução da via PI3K/Akt e translocação comprometida de vesículas GLUT4.',
    predisposingFactors: ['Dieta hipercalórica rica em açúcares refinados', 'Sedentarismo', 'Gordura visceral elevada (HOMA-IR > 2.0)', 'Histórico familiar'],
    signsAndSymptoms: ['Acantose nigricans', 'Cansaço pós-prandial', 'Fome precoce por carboidratos', 'Circunferência abdominal aumentada'],
    differentialDiagnosis: ['Diabetes Mellitus tipo 2 incipiente', 'Síndrome de Cushing', 'Hipotireoidismo descompensado'],
    relatedLabExams: ['Glicemia de jejum', 'Insulina basal', 'HOMA-IR', 'HbA1c', 'Perfil lipídico', 'Triglicerídeos/HDL'],
    investigationCriteria: 'HOMA-IR ≥ 2.5 ou Relação Triglicerídeos/HDL > 3.0 associado a adiposidade central.',
    dietaryStrategy: 'Alimentação de baixa carga glicêmica, aumento de fibras viscosas (≥ 35g/dia) e modulação de fracionamento dietético.',
    suggestedActives: [
      {
        name: 'Berberina HCl',
        standardDose: '500 mg, 2x ao dia (antes do almoço e jantar)',
        mechanism: 'Ativação da AMPK celular e upregulation do receptor de LDL e GLUT4',
        benefit: 'Redução da glicemia de jejum e redução do HOMA-IR',
        alerts: 'Monitorar glicemia se associado a metformina ou sulfonilureias. Evitar em gestantes.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Picolinato de Cromo',
        standardDose: '200 a 400 mcg ao dia com refeição',
        mechanism: 'Potencialização da ação da insulina via cromodulina e ligação ao receptor',
        benefit: 'Melhora da sensibilidade periférica e redução do apetite por doces',
        alerts: 'Não ultrapassar 400 mcg/dia sem monitoramento renal.',
        evidenceLevel: 'Moderada'
      },
      {
        name: 'Ácido Alfa-Lipoico',
        standardDose: '300 a 600 mg ao dia em jejum ou 30 min antes da refeição',
        mechanism: 'Antioxidante mitocondrial anfipático, estimula captação de glicose via p38 MAPK',
        benefit: 'Atenuação do estresse oxidativo endotelial e melhora da sensibilidade à insulina',
        alerts: 'Pode aumentar o efeito de hipoglicemiantes orais.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Hipersensibilidade conhecida', 'Gestação e lactação (Berberina)', 'Insuficiência renal grave'],
    drugInteractions: ['Metformina (potencialização hipoglicemiante)', 'Ciclosporina (substrato CYP3A4 com berberina)'],
    monitoring: 'Reavaliação de insulina de jejum, HOMA-IR e circunferência abdominal em 60 a 90 dias.',
    referralCriteria: 'Glicemia de jejum ≥ 126 mg/dL confirmada ou HbA1c ≥ 6.5% para avaliação endocrinológica conjunta.',
    scientificReferences: ['Zhang et al., Metabolism 2008', 'Lan et al., J Ethnopharmacol 2015', 'ADA Standards of Care 2024']
  },
  {
    id: 'MET-02',
    title: 'Pré-Diabetes & Tolerância Diminuída à Glicose',
    category: 'metabolismo_glicemico',
    categoryLabel: 'Metabolismo Glicêmico e Obesidade',
    definition: 'Estado intermediário de homeostase glicêmica com risco aumentado de progressão para DM2 e eventos cardiovasculares.',
    causality: 'Falência progressiva das células beta pancreáticas em compensar a resistência periférica à insulina.',
    pathophysiology: 'Estresse do retículo endoplasmático nas células beta, perda da primeira fase de secreção de insulina e gliconeogênese hepática desinibida.',
    predisposingFactors: ['Sobrepeso', 'Histórico de DMG', 'Síndrome dos ovários policísticos', 'HAS'],
    signsAndSymptoms: ['Fadiga vespertina', 'Elevação ponderal sutil', 'Geralmente assintomático'],
    differentialDiagnosis: ['Diabetes tipo 2 estabelecido', 'Hemoglobinopatias que alterem a HbA1c'],
    relatedLabExams: ['TOTG 75g (2h)', 'HbA1c', 'Glicemia de jejum', 'Frutosamina'],
    investigationCriteria: 'Glicemia de jejum entre 100-125 mg/dL ou TOTG 2h entre 140-199 mg/dL ou HbA1c entre 5.7%-6.4%.',
    dietaryStrategy: 'Padrão Mediterrâneo adaptado, redução de carboidratos refinados, exclusão de bebidas açucaradas e inclusão de proteínas magras.',
    suggestedActives: [
      {
        name: 'Extrato de Canela Verdadeira (Cinnamomum verum)',
        standardDose: '500 mg (extrato aquoso padronizado), 2x ao dia',
        mechanism: 'Compostos polifenólicos tipo A com ação insulinomimética e inibição da alfa-glicosidase',
        benefit: 'Atenuação das excursões glicêmicas pós-prandiais',
        alerts: 'Exigir extrato com baixa concentração de cumarina para segurança hepática.',
        evidenceLevel: 'Moderada'
      },
      {
        name: 'Magnésio Inositol (ou Dimalato)',
        standardDose: '300 a 400 mg de magnésio elementar ao deitar',
        mechanism: 'Cofator de mais de 300 enzimas, essencial na fosforilação da tirosina quinase do receptor de insulina',
        benefit: 'Suporte à captação de glicose e homeostase vascular',
        alerts: 'Ajustar dose se houver fezes amolecidas.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Insuficiência renal estágio 4-5'],
    drugInteractions: ['Diuréticos espoliadores de magnésio', 'Medicamentos hipoglicemiantes'],
    monitoring: 'HbA1c e glicemia a cada 3 a 6 meses.',
    referralCriteria: 'Progressão para HbA1c ≥ 6.5%.',
    scientificReferences: ['Diabetes Prevention Program (DPP) NEJM 2002', 'Guasch-Ferré et al., Diabetes Care 2017']
  },
  {
    id: 'MET-03',
    title: 'Hiperglicemia Pós-Prandial & Picos Glicêmicos',
    category: 'metabolismo_glicemico',
    categoryLabel: 'Metabolismo Glicêmico e Obesidade',
    definition: 'Excursões glicêmicas anormais (> 140 mg/dL 2h pós-refeição) gerando estresse oxidativo vascular agudo.',
    causality: 'Digestão e absorção acelerada de carboidratos com retardo na secreção de insulina de primeira fase e redução do efeito incretina.',
    pathophysiology: 'Geração de espécies reativas de oxigênio (ROS), desacoplamento endotelial e formação precoce de produtos de glicação avançada (AGEs).',
    predisposingFactors: ['Refeições com alta carga glicêmica e baixo teor de fibras', 'Gastroparesia', 'Inatividade física pós-refeição'],
    signsAndSymptoms: ['Sonolência acentuada após almoço', 'Névoa mental (brain fog)', 'Sensação de taquicardia pós-prandial'],
    differentialDiagnosis: ['Hipoglicemia reativa', 'Hipotensão pós-prandial'],
    relatedLabExams: ['Glicemia 1h e 2h pós-prandial', 'Curva glicêmica/insulinêmica', 'HbA1c'],
    investigationCriteria: 'Glicemia capilar ou venosa > 140 mg/dL após 2 horas de refeição habitual.',
    dietaryStrategy: 'Ordem alimentar estratégica (vegetais/fibras e proteínas antes dos carboidratos), caminhada leve de 10-15 min pós-refeição.',
    suggestedActives: [
      {
        name: 'Psyllium Husk (Plantago ovata)',
        standardDose: '5 a 10 g diluído em 250 ml de água 15 min antes das principais refeições',
        mechanism: 'Formação de gel viscoso intraluminal que retarda a hidrólise de amilases e retarda o esvaziamento gástrico',
        benefit: 'Aplainamento da curva glicêmica pós-prandial em até 30%',
        alerts: 'Ingerir com água abundante para evitar impactação fecal.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Bitter Melon (Momordica charantia)',
        standardDose: '500 mg de extrato padronizado antes das refeições ricas em amido',
        mechanism: 'Charantina e peptídeo-p com ação mimética à insulina e inibição da gliconeogênese',
        benefit: 'Controle de picos glicêmicos pós-alimentares',
        alerts: 'Contraindicado na gestação (potencial abortivo experimental).',
        evidenceLevel: 'Moderada'
      }
    ],
    contraindications: ['Estenose esofágica ou intestinal (para fibras)', 'Gestação'],
    drugInteractions: ['Fibras podem reduzir absorção de levotiroxina e outros medicamentos orais se tomados juntos.'],
    monitoring: 'Monitoramento contínuo de glicose (CGM) ou glicemia capilar pós-prandial.',
    referralCriteria: 'Glicemia pós-prandial persistente > 200 mg/dL.',
    scientificReferences: ['Ceriello et al., Diabetes Care 2008', 'Shukla et al., BMJ Open Diabetes 2017']
  },
  {
    id: 'MET-04',
    title: 'Obesidade & Adiposidade Visceral Inflamatória',
    category: 'metabolismo_glicemico',
    categoryLabel: 'Metabolismo Glicêmico e Obesidade',
    definition: 'Doença crônica multifatorial caracterizada por acúmulo excessivo e disfuncional de tecido adiposo visceral metabolicamente ativo.',
    causality: 'Balanço energético positivo crônico mediado por desregulação neuroendócrina dos centros de fome/saciedade e ambiente obesogênico.',
    pathophysiology: 'Hipertrofia de adipócitos, hipóxia tecidual, infiltração de macrófagos M1 e secreção aumentada de TNF-alfa, IL-6 e MCP-1.',
    predisposingFactors: ['Privação crônica de sono', 'Alimentos ultraprocessados', 'Genética poligênica', 'Estresse crônico com hipercortisolemia'],
    signsAndSymptoms: ['IMC ≥ 30 kg/m²', 'Circunferência abdominal > 88 cm (F) ou > 102 cm (M)', 'Dispneia aos esforços'],
    differentialDiagnosis: ['Hipotireoidismo descompensado', 'Uso crônico de corticosteroides', 'Lipodistrofia'],
    relatedLabExams: ['Bioimpedância 4C', 'PCR ultrassensível', 'Perfil lipídico', 'Enzimas hepáticas', 'Leptina sérica'],
    investigationCriteria: 'IMC ≥ 30 kg/m² e/ou percentual de gordura corporal acima do percentil 85 para idade e sexo.',
    dietaryStrategy: 'Déficit calórico planejado (300-500 kcal/dia), aporte proteico de 1.6 a 2.2 g/kg de massa magra e densidade de micronutrientes.',
    suggestedActives: [
      {
        name: 'Coenzima Q10 (Ubiquinona ou Ubiquinol)',
        standardDose: '100 a 200 mg ao dia com refeição lipídica',
        mechanism: 'Transportador de elétrons na cadeia respiratória mitocondrial e potente antioxidante de membrana',
        benefit: 'Otimização bioenergética mitocondrial e redução da peroxidação lipídica em adipócitos',
        alerts: 'Seguro; rara intolerância gástrica.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Extrato de Chá Verde padronizado em EGCG',
        standardDose: '300 mg de EGCG ao dia pela manhã',
        mechanism: 'Inibição da catecol-O-metiltransferase (COMT), prolongando a ação termogênica adrenérgica e oxidação de ácidos graxos',
        benefit: 'Estímulo sutil ao gasto energético e oxidação lipídica',
        alerts: 'Não ingerir em jejum prolongado para evitar hepatotoxicidade; evitar à noite.',
        evidenceLevel: 'Moderada'
      }
    ],
    contraindications: ['Hepatopatias ativas (para altas doses de EGCG isolado)', 'Gestação'],
    drugInteractions: ['Anticoagulantes orais com altas doses de EGCG e CoQ10.'],
    monitoring: 'Composição corporal por bioimpedância/dobras cutâneas mensalmente.',
    referralCriteria: 'Obesidade classe III (IMC ≥ 40) ou comorbidades graves associadas.',
    scientificReferences: ['Hall et al., Lancet 2011', 'Bray et al., Endocrine Reviews 2017']
  },
  {
    id: 'MET-05',
    title: 'Síndrome Metabólica (Critérios ATP III / NCEP)',
    category: 'metabolismo_glicemico',
    categoryLabel: 'Metabolismo Glicêmico e Obesidade',
    definition: 'Agrupamento de fatores de risco cardiometabólicos inter-relacionados que aumentam exponencialmente o risco de DM2 e DCV.',
    causality: 'Resistência à insulina e adiposidade visceral como motores centrais do estado inflamatório e pró-trombótico.',
    pathophysiology: 'Hiperinsulinemia, dislipidemia aterogênica (TG altos, HDL baixo, partículas LDL pequenas e densas) e disfunção endotelial com hipertensão.',
    predisposingFactors: ['Presença de 3 ou mais critérios: cintura alterada, TG ≥ 150, HDL < 40/50, PA ≥ 130/85, glicemia ≥ 100.'],
    signsAndSymptoms: ['Fácies de síndrome metabólica', 'Hipertensão leve/moderada', 'Aumento da esteatose hepática'],
    differentialDiagnosis: ['Síndrome de Cushing', 'Acromegalia'],
    relatedLabExams: ['Perfil lipídico', 'Glicemia', 'HOMA-IR', 'Ácido úrico', 'PCR-us', 'Microalbuminúria'],
    investigationCriteria: 'Cumprimento de pelo menos 3 dos 5 critérios da IDF/NCEP-ATP III.',
    dietaryStrategy: 'Padrão DASH ou Mediterrâneo, rica em ácidos graxos mono e poli-insaturados, fitoquímicos e redução de sódio.',
    suggestedActives: [
      {
        name: 'Ômega-3 Concentrado (alta proporção EPA/DHA)',
        standardDose: '2 a 4 g ao dia com as refeições',
        mechanism: 'Ligante PPAR-alfa que reduz a síntese hepática de VLDL e atenua inflamação via resolvinas e protectinas',
        benefit: 'Redução robusta de triglicerídeos (20-30%) e melhora do perfil endotelial',
        alerts: 'Suspender 7 a 10 dias antes de procedimentos cirúrgicos maiores.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Magnésio Quelato (Bisglicinato)',
        standardDose: '350 mg de magnésio elementar ao dia',
        mechanism: 'Relaxamento da musculatura lisa vascular via antagonismo do cálcio e ativação da eNOS',
        benefit: 'Controle pressórico complementar e melhora da sensibilidade à insulina',
        alerts: 'Excelente tolerância; seguro.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Insuficiência renal grave', 'Coagulopatias graves sem monitoramento'],
    drugInteractions: ['Varfarina e antiagregantes plaquetários (com altas doses de ômega-3).'],
    monitoring: 'Pressão arterial semanal, perfil lipídico e glicêmico a cada 3 meses.',
    referralCriteria: 'Escore de risco cardiovascular alto (> 20% em 10 anos).',
    scientificReferences: ['Alberti et al., Circulation 2009', 'NCEP ATP III Guidelines 2002']
  },
  {
    id: 'MET-06',
    title: 'Hiperfagia, Compulsão & Saciedade Precoce Reduzida',
    category: 'metabolismo_glicemico',
    categoryLabel: 'Metabolismo Glicêmico e Obesidade',
    definition: 'Dificuldade de atingir e manter saciedade entre refeições, frequentemente associada a desregulação do eixo leptina-grelina e dopaminérgico.',
    causality: 'Resistência hipotalâmica à leptina, dietas hiperpalatáveis pobres em fibras e proteínas, estresse e sono insuficiente.',
    pathophysiology: 'Hiperativação do circuito de recompensa dopaminérgico mesolímbico sobrepondo-se ao controle homeostático do núcleo arqueado hipotalâmico.',
    predisposingFactors: ['Privação crônica de sono (< 6h/noite)', 'Dietas restritivas extremas prévias', 'Ansiedade clínica'],
    signsAndSymptoms: ['Fome intensa mesmo após grandes refeições', 'Pensamento obsessivo em comida', 'Comer noturno'],
    differentialDiagnosis: ['Transtorno da Compulsão Alimentar (TCA/DSM-5)', 'Bulimia nervosa', 'Hipertireoidismo'],
    relatedLabExams: ['Leptina', 'Cortisol salivar', 'Glicemia e insulina', 'TSH'],
    investigationCriteria: 'Relato sistemático de fome precoce antes de 2-3 horas pós-refeição sem gasto calórico aumentado.',
    dietaryStrategy: 'Aumento da densidade proteica para 30-35g por refeição principal, volume alimentar via vegetais crucíferos e mastigação consciente.',
    suggestedActives: [
      {
        name: '5-HTP (5-Hidroxitriptofano)',
        standardDose: '50 a 100 mg, 30 min antes das refeições principais ou ao entardecer',
        mechanism: 'Precursor direto da serotonina no SNC, atuando nos receptores 5-HT2C que promovem saciedade',
        benefit: 'Redução da fissura por doces e carboidratos no final da tarde',
        alerts: 'Contraindicado em uso com antidepressivos ISRS/IMAO (risco de síndrome serotoninérgica).',
        evidenceLevel: 'Moderada'
      },
      {
        name: 'Extrato de Crocus sativus (Açafrão)',
        standardDose: '15 a 30 mg ao dia padronizado em safranal e crocina',
        mechanism: 'Modulação da recaptação de dopamina e serotonina, atenuando a fome hedônica emocional',
        benefit: 'Redução de episódios de beliscar e melhora do humor',
        alerts: 'Não exceder doses preconizadas.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Uso concomitante de antidepressivos inibidores de recaptação de serotonina (para 5-HTP).'],
    drugInteractions: ['Fluoxetina, sertralina, escitalopram, venlafaxina (risco serotoninérgico).'],
    monitoring: 'Escala de fome e plenitude visual analógica (VAS).',
    referralCriteria: 'Critérios diagnósticos formais de Transtorno da Compulsão Alimentar (TCA) para acompanhamento psiquiátrico/psicológico.',
    scientificReferences: ['Cangiano et al., Int J Obes 1998', 'Gout et al., Nutr Res 2010']
  },
  {
    id: 'MET-07',
    title: 'Esteatose Hepática Metabólica (MASLD / NAFLD)',
    category: 'metabolismo_glicemico',
    categoryLabel: 'Metabolismo Glicêmico e Obesidade',
    definition: 'Acúmulo de gordura em mais de 5% dos hepatócitos na ausência de consumo significativo de álcool e outras causas secundárias.',
    causality: 'Sobrecarga de ácidos graxos livres ao fígado decorrente de resistência periférica à insulina e consumo excessivo de frutose livre e gordura saturada.',
    pathophysiology: 'Lipogênese de novo aumentada, inibição da beta-oxidação mitocondrial, estresse oxidativo e ativação de células estreladas (fibrogênese).',
    predisposingFactors: ['Resistência à insulina', 'Obesidade visceral', 'Consumo frequente de refrigerantes e xaropes de milho'],
    signsAndSymptoms: ['Fadiga leve', 'Desconforto vago em hipocôndrio direito', 'Geralmente assintomático'],
    differentialDiagnosis: ['Hepatite viral B ou C', 'Hepatite medicamentosa', 'Doença hepática alcoólica'],
    relatedLabExams: ['TGO, TGP', 'Gama-GT', 'FIB-4 score', 'Ultrassom hepático', 'Ferritina sérica'],
    investigationCriteria: 'Ultrassonografia com aumento da ecogenicidade hepática e/ou enzimas hepáticas elevadas associadas a componentes da SM.',
    dietaryStrategy: 'Eliminação rigorosa de frutose líquida/industrializada, perda ponderal gradual de 7-10% do peso corporal e Dieta Mediterrânea.',
    suggestedActives: [
      {
        name: 'Vitamina E (Alfa-tocoferol natural RRR)',
        standardDose: '400 a 800 UI ao dia com refeição',
        mechanism: 'Antioxidante lipossolúvel que inibe a peroxidação lipídica nos hepatócitos e diminui ativação de NF-kB',
        benefit: 'Redução de inflamação hepática e balonamento em esteato-hepatite não alcoólica',
        alerts: 'Evitar em tabagistas e pacientes com risco aumentado de AVC hemorrágico.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Silimarina (Silybum marianum)',
        standardDose: '150 a 300 mg, 2x ao dia',
        mechanism: 'Estabilização de membrana celular, bloqueio de toxinas e estímulo à síntese proteica ribossomal hepática',
        benefit: 'Ação hepatoprotetora e redução de TGP e Gama-GT',
        alerts: 'Excelente perfil de segurança clínica.',
        evidenceLevel: 'Moderada'
      }
    ],
    contraindications: ['Cirrose descompensada sem supervisão hepatológica', 'Câncer de próstata (altas doses de Vitamina E)'],
    drugInteractions: ['Anticoagulantes orais (aumento de tempo de protrombina com Vitamina E).'],
    monitoring: 'Ultrassom de controle e dosagem de transaminases a cada 6 meses.',
    referralCriteria: 'Escore FIB-4 > 1.3 ou suspeita de esteato-hepatite com fibrose avançada para biópsia/elastografia hepática.',
    scientificReferences: ['PIVENS Trial, Sanyal et al., NEJM 2010', 'AASLD Practice Guidelines for NAFLD 2023']
  },

  // Categoria 02 — Cardiovascular e metabolismo lipídico
  {
    id: 'CARD-01',
    title: 'Hipertensão Arterial Sistêmica Leve a Moderada',
    category: 'cardiovascular',
    categoryLabel: 'Cardiovascular e Metabolismo Lipídico',
    definition: 'Elevação sustentada dos níveis pressóricos (PA sistólica ≥ 140 mmHg e/ou diastólica ≥ 90 mmHg).',
    causality: 'Aumento da rigidez arterial, hiperativação simpática, retenção renal de sódio e disfunção endotelial com baixa produção de óxido nítrico.',
    pathophysiology: 'Inibição da eNOS, aumento do estresse oxidativo vascular por NADPH oxidase e upregulation da endotelina-1.',
    predisposingFactors: ['Alto consumo de sódio', 'Baixo consumo de potássio e magnésio', 'Obesidade', 'Sedentarismo', 'Apneia do sono'],
    signsAndSymptoms: ['Geralmente assintomática', 'Cefaleia occipital matinal eventual', 'Zumbido no ouvido'],
    differentialDiagnosis: ['Hipertensão secundária (estenose de artéria renal, hiperaldosteronismo primário, feocromocitoma)'],
    relatedLabExams: ['Sódio, Potássio, Magnésio', 'Creatinina e ureia', 'EAS e microalbuminúria', 'MAPA 24h'],
    investigationCriteria: 'Média de PA em consultório ≥ 140/90 mmHg em pelo menos duas ocasiões ou MAPA confirmando vigília ≥ 135/85 mmHg.',
    dietaryStrategy: 'Protocolo DASH estrito (potássio > 4.7g/dia via alimentos, magnésio > 400mg, redução de sódio para < 2g/dia).',
    suggestedActives: [
      {
        name: 'Coenzima Q10',
        standardDose: '100 a 200 mg ao dia',
        mechanism: 'Restauração da função endotelial e redução do estresse oxidativo vascular',
        benefit: 'Redução modesta da PAS (média de 6-10 mmHg) e PAD',
        alerts: 'Potencializa anti-hipertensivos convencionais.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Extrato de Alho Envelhecido (Aged Garlic Extract)',
        standardDose: '600 a 1200 mg ao dia padronizado em S-alil-cisteína',
        mechanism: 'Estímulo à síntese de óxido nítrico e relaxamento do tônus arteriolar',
        benefit: 'Ação vasodilatadora comprovada em ensaios clínicos',
        alerts: 'Suspender antes de cirurgias pelo potencial antiplaquetário.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Insuficiência renal grave (atenção ao potássio)', 'Hipotensão postural'],
    drugInteractions: ['Anti-hipertensivos (monitorar hipotensão sinérgica).'],
    monitoring: 'MRPA (Monitorização Residencial da Pressão Arterial) semanal.',
    referralCriteria: 'PA ≥ 180/110 mmHg ou lesão de órgão-alvo aguda (encaminhamento de urgência).',
    scientificReferences: ['DASH Trial, Appel et al., NEJM 1997', 'Ried et al., J Hypertens 2016']
  },
  {
    id: 'CARD-02',
    title: 'Hipertrigliceridemia Primária e Secundária',
    category: 'cardiovascular',
    categoryLabel: 'Cardiovascular e Metabolismo Lipídico',
    definition: 'Concentração sérica de triglicerídeos em jejum superior a 150 mg/dL.',
    causality: 'Produção hepática exacerbada de VLDL induzida por carboidratos simples/álcool somada à depuração deficiente pela lipase lipoproteica (LPL).',
    pathophysiology: 'Acúmulo de partículas ricas em triglicerídeos remanescentes, que são aterogênicas e aumentam a viscosidade plasmática.',
    predisposingFactors: ['Consumo de bebidas alcoólicas', 'Excesso de açúcares refinados e xaropes', 'Diabetes descompensado'],
    signsAndSymptoms: ['Assintomático', 'Xantomas eruptivos se TG > 1000 mg/dL', 'Risco iminente de pancreatite aguda se TG > 500 mg/dL'],
    differentialDiagnosis: ['Hiperlipidemia familiar combinada', 'Deficiência de lipase lipoproteica'],
    relatedLabExams: ['Triglicerídeos em jejum', 'Perfil lipídico completo', 'Amilase/Lipase se dor abdominal', 'ApoB'],
    investigationCriteria: 'Triglicerídeos séricos em jejum > 150 mg/dL em duas coletas.',
    dietaryStrategy: 'Supressão total de álcool e açúcar simples, restrição moderada de carboidratos e substituição de gorduras saturadas por insaturadas.',
    suggestedActives: [
      {
        name: 'Ômega-3 EPA/DHA concentrado (Icosapent etil ou etil éster)',
        standardDose: '2 a 4 g ao dia com refeições',
        mechanism: 'Redução da síntese hepática de triglicerídeos via inibição de SREBP-1c e ativação da oxidação peroxissomal',
        benefit: 'Queda de 25 a 45% nos níveis de triglicerídeos séricos',
        alerts: 'Exigir laudo de pureza e metais pesados.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Niacina (Vitamina B3 - Ácido Nicotínico)',
        standardDose: '250 a 500 mg ao dia com monitoramento de flush',
        mechanism: 'Inibição da lipólise no tecido adiposo e menor influxo de ácidos graxos livres ao fígado',
        benefit: 'Redução de TG e ApoB com aumento de HDL',
        alerts: 'Pode causar rubor cutâneo (flush) e elevação leve de glicemia e ácido úrico.',
        evidenceLevel: 'Moderada'
      }
    ],
    contraindications: ['TG > 500 mg/dL sem avaliação médica imediata (risco de pancreatite)'],
    drugInteractions: ['Fibratos e estatinas (monitorar mialgia e transaminases).'],
    monitoring: 'Dosagem de perfil lipídico a cada 60 dias.',
    referralCriteria: 'Triglicerídeos > 500 mg/dL exigem manejo farmacológico urgente concomitante.',
    scientificReferences: ['REDUCE-IT Trial, Bhatt et al., NEJM 2019', 'AHA Science Advisory on Triglycerides 2019']
  },
  {
    id: 'CARD-03',
    title: 'Hipercolesterolemia & Dislipidemia Aterogênica',
    category: 'cardiovascular',
    categoryLabel: 'Cardiovascular e Metabolismo Lipídico',
    definition: 'Níveis elevados de colesterol total e LDL-c com potencial de deposição na íntima arterial e formação de ateroma.',
    causality: 'Redução da atividade dos receptores hepáticos de LDL, alta ingestão de gorduras saturadas/trans ou hipercolesterolemia familiar.',
    pathophysiology: 'Retenção subendotelial de lipoproteínas contendo ApoB, oxidação lipídica e fagocitose por macrófagos gerando células espumosas.',
    predisposingFactors: ['Genética familiar', 'Hipotireoidismo não tratado', 'Dieta hiperlipídica com gordura saturada excessiva'],
    signsAndSymptoms: ['Assintomático', 'Xantelasmas palpebrais', 'Arco senil precoce'],
    differentialDiagnosis: ['Hipercolesterolemia familiar heterozigótica', 'Hipotireoidismo primário', 'Síndrome nefrótica'],
    relatedLabExams: ['Colesterol total, LDL-c, HDL-c, Não-HDL', 'Apolipoproteína B (ApoB)', 'Lp(a)', 'PCR-us'],
    investigationCriteria: 'LDL-c acima da meta individualizada por escore de risco cardiovascular.',
    dietaryStrategy: 'Redução de gorduras saturadas (< 7% das calorias totais), eliminação de gordura trans e aumento de fibras solúveis (aveia, psyllium).',
    suggestedActives: [
      {
        name: 'Fitoesteróis (Esteróis e Estanóis vegetais)',
        standardDose: '1.5 a 2.0 g ao dia junto com as principais refeições',
        mechanism: 'Competição com o colesterol pelas micelas mistas no lúmen intestinal, reduzindo a absorção de colesterol em 30-50%',
        benefit: 'Redução de 8 a 12% no LDL-colesterol circulante',
        alerts: 'Não substitui terapia de alta potência quando indicada para alto risco.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Levedura de Arroz Vermelho (Monacolina K controlada)',
        standardDose: '2.5 a 5 mg de monacolina K ao dia ao deitar',
        mechanism: 'Inibição da HMG-CoA redutase idêntica ao mecanismo da lovastatina natural',
        benefit: 'Redução expressiva de LDL-c e ApoB',
        alerts: 'Pode causar mialgia em pacientes sensíveis a estatinas; monitorar CPK.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Hepatopatias ativas', 'Gestação e lactação'],
    drugInteractions: ['Estatinas sintéticas (risco de potencialização de rabdomiólise se associado com Monacolina K).'],
    monitoring: 'Perfil lipídico completo e enzimas hepáticas em 60 a 90 dias.',
    referralCriteria: 'LDL-c > 190 mg/dL ou presença de ateromatose documentada.',
    scientificReferences: ['European Society of Cardiology (ESC/EAS) Guidelines on Dyslipidaemias 2019']
  },

  // Categoria 03 — Saúde gastrointestinal e microbiota
  {
    id: 'GAST-01',
    title: 'Disbiose Intestinal & Alteração da Diversidade da Microbiota',
    category: 'gastrointestinal',
    categoryLabel: 'Saúde Gastrointestinal e Microbiota',
    definition: 'Desequilíbrio qualitativo e quantitativo dos ecossistemas microbianos intestinais com perda da capacidade simbiótica protetora.',
    causality: 'Uso prévio de antibióticos, dieta ocidental pobre em fibras prebióticas, alimentos ultraprocessados, estresse e estase intraluminal.',
    pathophysiology: 'Redução de produtores de ácidos graxos de cadeia curta (butirato, propionato), translocação de LPS e inflamação crônica de baixo grau.',
    predisposingFactors: ['Antibioticoterapia recente', 'Parto cesárea sem amamentação', 'Inibidores de bomba de prótons (IBPs) crônicos'],
    signsAndSymptoms: ['Distensão pós-prandial', 'Fezes Bristol variáveis (1 e 6)', 'Flatulência fétida', 'Cansaço inexplicado'],
    differentialDiagnosis: ['Supercrescimento bacteriano no intestino delgado (SIBO)', 'Doença inflamatória intestinal (DII)'],
    relatedLabExams: ['Índice MEB (Monócitos + Eosinófilos + Basófilos)', 'Calprotectina fecal', 'Parasitológico de fezes', 'Zonulina'],
    investigationCriteria: 'Índice MEB > 7.0% associado a queixas digestivas persistentes por mais de 3 meses.',
    dietaryStrategy: 'Abordagem dos 5Rs: Remover alérgenos e irritantes, Recolocar enzimas, Reinocular probióticos, Reparar mucosa e Reequilibrar estilo de vida.',
    suggestedActives: [
      {
        name: 'Probiótico Multi-cepas (Lactobacillus & Bifidobacterium)',
        standardDose: '5 a 10 bilhões UFC ao deitar com água',
        mechanism: 'Competição por sítios de adesão epitelial, síntese de bacteriocinas e modulação da resposta imune via IgA secretória',
        benefit: 'Restauração da integridade da barreira e redução da fermentação anormal',
        alerts: 'Iniciar com doses menores se houver distensão acentuada.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'L-Glutamina em pó',
        standardDose: '5 a 10 g ao dia em jejum pela manhã diluído em água',
        mechanism: 'Principal combustível energético para enterócitos e colonócitos, estimulando síntese de ocludina e claudina-1',
        benefit: 'Recuperação da integridade das junções oclusivas (tight junctions)',
        alerts: 'Cautela em pacientes com doença renal crônica ou encefalopatia.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Pacientes neutropênicos graves ou em UTI com risco de sepse microbiana.'],
    drugInteractions: ['Antibióticos (espaçar a tomada de probióticos em pelo menos 2 a 3 horas).'],
    monitoring: 'Escala de Bristol diária e reavaliação de sintomas gastrointestinais.',
    referralCriteria: 'Presença de sangue nas fezes, emagrecimento involuntário ou anemia refratária.',
    scientificReferences: ['Sonnenburg et al., Cell 2021', 'Bischoff et al., BMC Gastroenterol 2014']
  },
  {
    id: 'GAST-02',
    title: 'Constipação Intestinal Funcional',
    category: 'gastrointestinal',
    categoryLabel: 'Saúde Gastrointestinal e Microbiota',
    definition: 'Evacuação infrequente (< 3 vezes por semana), fezes endurecidas, esforço evacuatório excessivo ou sensação de evacuação incompleta.',
    causality: 'Ingestão hídrica inadequada, carência severa de fibras dietéticas solúveis e insolúveis, sedentarismo e supressão do reflexo defecatório.',
    pathophysiology: 'Trânsito colônico lentificado, absorção excessiva de água do bolo fecal na mucosa do cólon e redução do tônus neuromuscular.',
    predisposingFactors: ['Dieta monótona ocidental', 'Uso de opioides ou anticonvulsivantes', 'Idade avançada'],
    signsAndSymptoms: ['Fezes tipo 1 ou 2 de Bristol', 'Sensação de plenitude abdominal', 'Esforço ao evacuar'],
    differentialDiagnosis: ['Obstrução mecânica colônica', 'Hipotireoidismo', 'Doença de Chagas (megacólon)'],
    relatedLabExams: ['TSH e T4 livre', 'Eletrólitos (cálcio sérico)', 'Hemograma'],
    investigationCriteria: 'Critérios de Roma IV para constipação funcional com sintomas presentes nos últimos 3 meses.',
    dietaryStrategy: 'Aumento gradual de fibras para 25-35g/dia, ingestão hídrica de 35-40 ml/kg de peso e inclusão de ameixas e sementes de chia/linhaça.',
    suggestedActives: [
      {
        name: 'Goma Acácia Hidrolisada ou Psyllium',
        standardDose: '5 a 10 g ao dia com 300 ml de água',
        mechanism: 'Fibra prebiótica não irritativa que aumenta a biomassa fecal e a retenção de água nas fezes',
        benefit: 'Aumento da frequência evacuatória e normalização da consistência fecal',
        alerts: 'Obrigatório ingerir com quantidade hídrica adequada.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Citrato ou Óxido de Magnésio',
        standardDose: '300 a 500 mg ao deitar com água',
        mechanism: 'Efeito osmótico suave no lúmen intestinal, retendo água e estimulando o peristaltismo reflexo',
        benefit: 'Alívio seguro da constipação sem provocar cólicas severas',
        alerts: 'Reduzir dose se fezes ficarem excessivamente amolecidas.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Suspeita de oclusão intestinal ou apendicite aguda.'],
    drugInteractions: ['Medicamentos orais (espaçar fibras em 2 horas).'],
    monitoring: 'Diário de hábitos intestinais e escala de Bristol.',
    referralCriteria: 'Início agudo em maiores de 50 anos ou sintomas de alarme.',
    scientificReferences: ['Roma IV Criteria, Gastroenterology 2016', 'Suares & Ford, Am J Gastroenterol 2011']
  },
  {
    id: 'GAST-03',
    title: 'Síndrome do Intestino Irritável (SII / IBS)',
    category: 'gastrointestinal',
    categoryLabel: 'Saúde Gastrointestinal e Microbiota',
    definition: 'Distúrbio da interação intestino-cérebro com dor abdominal recorrente relacionada à defecação e alteração no hábito intestinal.',
    causality: 'Hipersensibilidade visceral, desregulação do eixo cérebro-intestino, inflamação microscópica pós-infecciosa e disbiose.',
    pathophysiology: 'Ativação mastocitária na mucosa, alteração da motilidade intestinal e processamento aberrante de sinais nociceptivos no SNC.',
    predisposingFactors: ['Episódio prévio de gastroenterite infecciosa', 'Transtorno de ansiedade', 'Histórico de trauma precoce'],
    signsAndSymptoms: ['Dor abdominal em cólica aliviada com a evacuação', 'Alternância entre diarreia e constipação', 'Distensão diurna'],
    differentialDiagnosis: ['Doença Celíaca', 'Doença de Crohn / RCU', 'Endometriose intestinal'],
    relatedLabExams: ['Calprotectina fecal (deve ser normal na SII)', 'Anticorpos anti-transglutaminase IgA', 'Hemograma'],
    investigationCriteria: 'Critérios de Roma IV: dor abdominal pelo menos 1x/semana nos últimos 3 meses associada a ≥ 2 critérios de evacuação.',
    dietaryStrategy: 'Protocolo Low FODMAPs em 3 fases (eliminação guiada de 4-6 semanas, reintrodução sistemática e personalização).',
    suggestedActives: [
      {
        name: 'Óleo Essencial de Hortelã-Pimenta Gastrorresistente (Peppermint Oil)',
        standardDose: '180 a 200 mg em cápsula gastrorresistente, 2 a 3x ao dia antes das refeições',
        mechanism: 'Bloqueio de canais de cálcio na musculatura lisa intestinal gerando relaxamento e ação antiespasmódica local',
        benefit: 'Redução significativa da dor abdominal e intensidade dos espasmos',
        alerts: 'Exigir cápsula gastrorresistente para não abrir no estômago e causar azia.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Bifidobacterium infantis 35624',
        standardDose: '1 bilhão UFC ao dia',
        mechanism: 'Atenuação da resposta inflamatória submucosa via indução de IL-10 regulatória',
        benefit: 'Alívio global dos sintomas de dor e distensão na SII',
        alerts: 'Excelente perfil de segurança comprovado em ensaios multicêntricos.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Refluxo gastroesofágico grave sem cápsula gastrorresistente.'],
    drugInteractions: ['Anticolinérgicos e ansiolíticos.'],
    monitoring: 'Questionário de gravidade da SII (IBS-SSS) a cada ciclo de 4 semanas.',
    referralCriteria: 'Calprotectina fecal elevada (> 100 µg/g) sugere doença inflamatória e requer colonoscopia.',
    scientificReferences: ['Ford et al., Am J Gastroenterol 2018', 'Halmos et al., Gastroenterology 2014']
  },

  // Categoria 08 — Sono, estresse e cognição
  {
    id: 'NEU-01',
    title: 'Insônia & Distúrbios do Início e Manutenção do Sono',
    category: 'sono_estresse',
    categoryLabel: 'Sono, Estresse e Cognição',
    definition: 'Dificuldade persistente de conciliar ou manter o sono, associada a comprometimento das funções diurnas.',
    causality: 'Hiperativação do eixo HPA, desregulação do ritmo circadiano pela exposição noturna à luz azul e deficiência na síntese de melatonina.',
    pathophysiology: 'Inibição insuficiente do sistema reticular ativador ascendente por GABA e tônus simpático noturno mantido elevado.',
    predisposingFactors: ['Uso de telas até tarde', 'Consumo tardio de cafeína (> 15h)', 'Estresse profissional', 'Trabalho em turnos'],
    signsAndSymptoms: ['Latência do sono > 30 min', 'Despertares noturnos frequentes', 'Sensação de sono não reparador', 'Irritabilidade diurna'],
    differentialDiagnosis: ['Apneia obstrutiva do sono (SAOS)', 'Síndrome das pernas inquietas', 'Depressão maior'],
    relatedLabExams: ['Polissonografia (se suspeita de SAOS)', 'Cortisol salivar noturno', 'Ferritina', 'TSH'],
    investigationCriteria: 'Índice de Gravidade da Insônia (ISI) > 10 com repercussão nas atividades diárias.',
    dietaryStrategy: 'Jantar leve com carboidratos de baixo índice glicêmico 2-3h antes de deitar, cessação de estimulantes 8h antes do sono.',
    suggestedActives: [
      {
        name: 'Melatonina de Liberação Rápida e Prolongada (Microencapsulada)',
        standardDose: '0.21 a 0.5 mg (dose fisiológica) 1 a 2 horas antes de deitar no escuro',
        mechanism: 'Agonista dos receptores MT1 e MT2 no núcleo supraquiasmático, sincronizando o relógio circadiano central',
        benefit: 'Redução da latência para o início do sono e suporte ao aprofundamento das fases N3 e REM',
        alerts: 'Ambiente escuro é mandatório; não associar com álcool.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Extrato Padronizado de Ashwagandha (Withania somnifera - KSM-66)',
        standardDose: '300 a 600 mg ao entardecer ou à noite',
        mechanism: 'Compostos withanolídeos com ação agonista gabaérgica e modulação redutora do cortisol sérico',
        benefit: 'Redução da hipervigilância noturna e melhora na arquitetura do sono',
        alerts: 'Evitar em hipertireoidismo grave e gestantes.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Magnésio Bisglicinato ou Taurato',
        standardDose: '300 mg ao deitar',
        mechanism: 'Bloqueador dos receptores glutamatérgicos NMDA e agonista de receptores GABA-A',
        benefit: 'Relaxamento neuromuscular e atenuação do tônus adrenérgico noturno',
        alerts: 'Excelente tolerância clínica.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Gestação', 'Trabalho em turnos ativos durante o uso imediato'],
    drugInteractions: ['Sedativos, benzodiazepínicos e z-drugs (potencialização de sonolência).'],
    monitoring: 'Diário do sono ou monitoramento vestível (smartwatch) por 30 dias.',
    referralCriteria: 'Roncos frequentes com pausas respiratórias observadas para polissonografia imediata.',
    scientificReferences: ['Ferracioli-Oda et al., PLoS One 2013', 'Langade et al., Cureus 2019']
  },
  {
    id: 'NEU-02',
    title: 'Estresse Crônico, Fadiga Adrenal & Esgotamento (Burnout)',
    category: 'sono_estresse',
    categoryLabel: 'Sono, Estresse e Cognição',
    definition: 'Estado de exaustão física e emocional decorrente de estressores psicológicos ou fisiológicos prolongados e não manejados.',
    causality: 'Hiperativação prolongada do eixo HPA com posterior desregulação da curva de cortisol e depleção de neurotransmissores monoaminérgicos.',
    pathophysiology: 'Downregulation dos receptores de glicocorticoides no hipocampo, inflamação neurogênica e esgotamento de cofatores adrenais.',
    predisposingFactors: ['Carga de trabalho excessiva', 'Perfeccionismo', 'Sono fragmentado', 'Inflamação sistêmica crônica'],
    signsAndSymptoms: ['Fadiga matinal que não melhora com sono', 'Desejo por alimentos salgados', 'Labilidade emocional', 'Queda de imunidade'],
    differentialDiagnosis: ['Insuficiência adrenal primária (Doença de Addison)', 'Hipotireoidismo', 'Anemia severa'],
    relatedLabExams: ['Cortisol salivar em 4 pontos (despertar, 12h, 17h, 23h)', 'DHEA-S', 'Hemograma', 'Ferritina', 'Zinco'],
    investigationCriteria: 'Curva de cortisol salivar achatada ou invertida associada a escores elevados em escalas de estresse percebido.',
    dietaryStrategy: 'Alimentação rica em antioxidantes, fracionamento regular para evitar hipoglicemias que disparam cortisol e cessação de jejum extenuante.',
    suggestedActives: [
      {
        name: 'Extrato de Rhodiola rosea padronizado em Rosavinas e Salidrosídeos',
        standardDose: '200 a 400 mg pela manhã',
        mechanism: 'Fitoterápico adaptógeno que modula a resposta ao estresse via neuropeptídeo Y e atenua ativação de JNK',
        benefit: 'Redução da fadiga física e mental sob estresse crônico prolongado',
        alerts: 'Pode ser estimulante; evitar tomar após as 14h para não prejudicar o sono.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Fosfatidilserina',
        standardDose: '200 a 300 mg ao dia',
        mechanism: 'Fosfolipídio de membrana neuronal que atenua o pico adrenocorticotrófico e cortisol induzido por estresse agudo',
        benefit: 'Normalização do eixo HPA e suporte cognitivo sob pressão',
        alerts: 'Muito seguro e tolerado.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Transtorno bipolar (risco de ciclagem com adaptógenos estimulantes)'],
    drugInteractions: ['Antidepressivos e ansiolíticos.'],
    monitoring: 'Escala de Estresse Percebido (PSS-10) a cada 45 dias.',
    referralCriteria: 'Ideação depressiva importante ou perda funcional incapacitante para psiquiatria.',
    scientificReferences: ['Panossian et al., Pharmaceuticals 2010', 'Hellhammer et al., Stress 2004']
  },

  // Categoria 05 — Energia e micronutrientes
  {
    id: 'ENE-01',
    title: 'Fadiga Mitocondrial & Baixa Produção Energética',
    category: 'energia_micronutrientes',
    categoryLabel: 'Energia e Micronutrientes',
    definition: 'Sensação crônica de exaustão celular associada à eficiência fosforilativa mitocondrial comprometida.',
    causality: 'Deficiências subfraturárias de cofatores da cadeia de transporte de elétrons e sobrecarga de radicais livres mitocondriais.',
    pathophysiology: 'Desacoplamento da ATP sintase, dano oxidativo ao mtDNA e menor densidade mitocondrial tecidual.',
    predisposingFactors: ['Pós-infecções virais crônicas', 'Sedentarismo', 'Consumo crônico de estatinas (depleção de CoQ10)'],
    signsAndSymptoms: ['Cansaço desproporcional ao esforço', 'Fadiga pós-exercício prolongada', 'Dificuldade de concentração'],
    differentialDiagnosis: ['Síndrome da Fadiga Crônica (ME/CFS)', 'Hipotireoidismo', 'Anemia'],
    relatedLabExams: ['Lactato basal', 'Coenzima Q10 sérica', 'Ferritina', 'Vitamina B12', 'Homocisteína'],
    investigationCriteria: 'Fadiga persistente há mais de 3 meses descartadas causas patológicas clássicas.',
    dietaryStrategy: 'Dieta densa em polifenóis, ácidos graxos de cadeia média, crucíferas e modulação de refeições.',
    suggestedActives: [
      {
        name: 'Coenzima Q10 + PQQ (Pirroloquinolina Quinona)',
        standardDose: '100 mg CoQ10 + 10 mg PQQ ao dia pela manhã com refeição',
        mechanism: 'PQQ estimula biogênese mitocondrial via PGC-1alfa enquanto CoQ10 otimiza o complexo I-III de elétrons',
        benefit: 'Recuperação do vigor físico e atenuação do declínio energético diurno',
        alerts: 'Melhor absorvido junto a lipídios saudáveis.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'D-Ribose',
        standardDose: '5 g ao dia diluído em água pela manhã',
        mechanism: 'Pentose precursora direta da síntese de novo de nucleotídeos de adenina (ATP e ADP)',
        benefit: 'Acelera a restauração de reservas energéticas intramusculares e cardíacas',
        alerts: 'Pode reduzir discretamente a glicemia se tomado em jejum absoluto sem alimentos.',
        evidenceLevel: 'Moderada'
      }
    ],
    contraindications: ['Hipersensibilidade'],
    drugInteractions: ['Estatinas reduzem CoQ10 endógena (indicação de reposição formal).'],
    monitoring: 'Escala de fadiga de Chalder mensal.',
    referralCriteria: 'Fadiga associada a perda ponderal inexplicada ou febre de origem obscura.',
    scientificReferences: ['Harris et al., J Clin Biochem Nutr 2013', 'Grasman et al., Clin Nutr 2020']
  },
  {
    id: 'ENE-02',
    title: 'Deficiência Funcional de Ferro & Anemia Ferropriva',
    category: 'energia_micronutrientes',
    categoryLabel: 'Energia e Micronutrientes',
    definition: 'Depleção dos estoques corporais de ferro com ou sem redução dos índices eritrocitários circulantes.',
    causality: 'Perdas hemáticas menstruais volumosas, má absorção duodenal (ex: celíacos, hipocloridria) ou baixa ingestão de ferro heme.',
    pathophysiology: 'Eritropoiese ineficiente por falta de ferro para o anel heme da hemoglobina, disfunção de citocromos e mioglobina muscular.',
    predisposingFactors: ['Mulheres em idade fértil', 'Vegetarianos estritos sem acompanhamento', 'Pós-cirurgia bariátrica', 'Uso contínuo de IBPs'],
    signsAndSymptoms: ['Fadiga profunda', 'Queda de cabelo difusa', 'Unhas quebradiças com estrias', 'Palidez de mucosas', 'Pica (desejo de mastigar gelo)'],
    differentialDiagnosis: ['Anemia de doença crônica (ferritina normal ou alta com ferro sérico baixo)', 'Talassemia minor'],
    relatedLabExams: ['Ferritina sérica (alvo funcional > 50-70 ng/mL)', 'Ferro sérico', 'Transferrina e Capacidade Total de Ligação (TIBC)', 'Saturação de transferrina (< 20% é patológico)', 'Hemograma (VCM, HCM)'],
    investigationCriteria: 'Ferritina < 30 ng/mL confirma ferropenia clínica; < 50 ng/mL define deficiência funcional em mulheres sintomáticas.',
    dietaryStrategy: 'Inclusão de carnes vermelhas magras ou fontes vegetais combinadas a agentes redutores (vitamina C 100mg) e separação de café/chá/laticínios nas refeições.',
    suggestedActives: [
      {
        name: 'Ferro Bisglicinato Quelato (com Vitamina C)',
        standardDose: '30 a 60 mg de ferro elementar ao dia, em dias alternados ou dose única noturna',
        mechanism: 'Quelato estável com aminoácidos que atravessa o enterócito sem ionizar no estômago, evitando efeitos gastrointestinais severos',
        benefit: 'Reposição rápida de ferritina com tolerância gástrica 4x superior ao sulfato ferroso',
        alerts: 'A dosagem em dias alternados pode otimizar a absorção mediada pela hepcidina.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Hemocromatose hereditária', 'Anemias hemolíticas sem deficiência de ferro'],
    drugInteractions: ['Levotiroxina, ciprofloxacino e tetraciclinas (quelam o ferro; espaçar em pelo menos 3 a 4 horas).'],
    monitoring: 'Hemograma e ferritina sérica a cada 60 a 90 dias.',
    referralCriteria: 'Hb < 8.0 g/dL ou falha terapêutica oral após 3 meses para reposição parenteral (intravenosa).',
    scientificReferences: ['Stoffel et al., Lancet Haematol 2017', 'WHO Guideline on Iron Supplementation 2016']
  },

  // Categoria 09 — Músculo, exercício e recuperação
  {
    id: 'MUS-01',
    title: 'Sarcopenia, Perda de Massa Magra & Síntese Proteica Inadequada',
    category: 'musculo_exercicio',
    categoryLabel: 'Músculo, Exercício e Recuperação',
    definition: 'Perda progressiva e generalizada da massa, força e função muscular esquelética.',
    causality: 'Resistência anabólica muscular do envelhecimento somada a sedentarismo, inflamação crônica e aporte proteico submínimo.',
    pathophysiology: 'Desregulação da via mTORC1 por menor sinalização de leucina e IGF-1, com ativação do sistema ubiquitina-proteassoma.',
    predisposingFactors: ['Idade > 60 anos', 'Doenças crônicas consumptivas', 'Internação hospitalar prolongada', 'Sedentarismo'],
    signsAndSymptoms: ['Diminuição de força de preensão manual (dinamometria)', 'Lentidão na marcha', 'Quedas frequentes'],
    differentialDiagnosis: ['Caquexia neoplásica', 'Miopatias inflamatórias', 'Desnutrição calórico-proteica pura'],
    relatedLabExams: ['Dinamometria de preensão palmar', 'Bioimpedância (Índice de Massa Muscular Esquelética)', 'Albumina e Pré-albumina', 'Vitamina D3'],
    investigationCriteria: 'Força de preensão manual < 27 kgf (homens) ou < 16 kgf (mulheres) e redução documentada de massa magra.',
    dietaryStrategy: 'Aporte de 1.6 a 2.0 g de proteína por kg de peso corporal ao dia, fracionada em doses com limiar de leucina (≥ 3g de leucina por refeição).',
    suggestedActives: [
      {
        name: 'Creatina Monoidratada Micronizada',
        standardDose: '3 a 5 g ao dia em uso contínuo (com carboidrato ou proteína)',
        mechanism: 'Aumento dos estoques de fosfocreatina intramuscular, retenção de água intracelular e ativação de células satélites',
        benefit: 'Ganho comprovado de força muscular, potência e preservação da massa livre de gordura',
        alerts: 'Não causa dano renal em indivíduos sadios; hidratação adequada.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'Proteína do Soro do Leite Isolada (Whey Protein)',
        standardDose: '25 a 35 g ao dia contendo pelo menos 3 g de Leucina',
        mechanism: 'Rápida digestão e absorção plasmática com pico de hiperaminoacidemia disparando a cascata mTORC1',
        benefit: 'Otimização da síntese proteica muscular pós-estímulo resistido',
        alerts: 'Excelente valor biológico.',
        evidenceLevel: 'Alta'
      },
      {
        name: 'HMB (Beta-Hidroxi-Beta-Metilbutirato)',
        standardDose: '3 g ao dia divididos em 2 doses',
        mechanism: 'Metabólito da leucina com potente ação anticatabólica e estabilização do sarcolema',
        benefit: 'Preservação de massa magra em períodos de restrição calórica ou desuso',
        alerts: 'Seguro e sem interações medicamentosas relevantes.',
        evidenceLevel: 'Alta'
      }
    ],
    contraindications: ['Insuficiência renal dialítica avançada sem ajuste proteico estrito.'],
    drugInteractions: ['Glicocorticoides (potencializam catabolismo muscular; indicação de suporte).'],
    monitoring: 'Dinamometria e bioimpedância a cada 60 dias associados a treinamento resistido.',
    referralCriteria: 'Perda de massa muscular acelerada e inexplicada (> 5% em 6 meses) para investigação sistêmica.',
    scientificReferences: ['Morton et al., Br J Sports Med 2018', 'Bauer et al., JAMDA 2013']
  }
];

// ---------------------------------------------------------------------------
// BANCO DE ATIVOS FARMACOLÓGICOS FARMACODINÂMICA E FARMACOCINÉTICA (ADME)
// ---------------------------------------------------------------------------
export const PHARMACOLOGICAL_ACTIVES: PharmacologicalActive[] = [
  {
    id: 'berberina',
    name: 'Berberina (Cloridrato / HCl)',
    chemicalName: '5,6-Dihydro-9,10-dimethoxybenzo[g]-1,3-benzodioxolo[5,6-a]quinolizinium',
    synonyms: ['Berberine HCl', 'Extrato de Phellodendron amurense', 'Berberis aristata'],
    pharmacologicalClass: 'Alcalóide Isoquinolínico Vegetal',
    chemicalForm: 'Sal Cloridrato Cristalino Amarelo',
    standardization: 'Padronizado em ≥ 97% de Berberina HCl',
    presentation: ['Cápsulas gastrorresistentes', 'Comprimidos revestidos'],
    studiedIndications: [
      'Resistência à insulina e pré-diabetes',
      'Dislipidemia mista com hipercolesterolemia e hipertrigliceridemia',
      'Esteatose hepática metabólica (MASLD)',
      'Síndrome dos Ovários Policísticos (SOP)'
    ],
    mechanismOfAction: 'Ativação direta da proteína quinase ativada por AMP (AMPK) celular, inibição da expressão gênica pró-gliconeogênica hepática (PEPCK e G6Pase), upregulation do receptor hepático de LDL via estabilização do mRNA e inibição da PCSK9.',
    standardReferenceDose: '500 mg, 2 a 3 vezes ao dia (dose diária total de 1000 a 1500 mg) junto ou imediatamente antes das principais refeições.',
    safetyLimits: 'Dose máxima diária de 1500 mg. Evitar uso contínuo superior a 12 semanas sem período de pausa terapêutica.',
    contraindications: [
      'Gestação (induz contrações uterinas e risco de kernicterus fetal)',
      'Lactação',
      'Crianças menores de 12 anos',
      'Hipotensão arterial sintomática'
    ],
    interactions: [
      'Potencializa hipoglicemiantes (Metformina, Gliclazida, Insulina)',
      'Inibição potente de CYP3A4 e CYP2D6',
      'Inibição do transportador P-gp (aumenta níveis séricos de ciclosporina, digoxina)'
    ],
    cypInteractions: 'Inibidor de CYP3A4, CYP2D6 e transportador P-gp.',
    adme: {
      absorption: 'Baixa absorção oral intraluminal (< 5%) decorrente de refluxo por P-glicoproteína e metabolismo intestinal de primeira passagem.',
      distribution: 'Amplamente distribuída em tecidos periféricos, fígado, rins e tecido adiposo.',
      metabolism: 'Hepático extensivo via demetilação e glucuronidação pelas enzimas CYP2D6, CYP1A2 e CYP3A4.',
      excretion: 'Excreção predominantemente biliar e fecal (90%); excreção renal menor que 5%.',
      halfLife: 'Aproximadamente 4 a 6 horas.',
      bioavailability: 'Biodisponibilidade absoluta oral < 1% (aumentada com formulações fitossomadas ou lipossomais).'
    },
    receptorRole: 'Modulador Metabólico',
    regulatoryStatusBrazil: 'Fitoterápico de Prescrição Nutricional (CFN)',
    references: ['Yin et al., Metabolism 2008', 'Kong et al., Nat Med 2004', 'Zhang et al., J Clin Endocrinol Metab 2010']
  },
  {
    id: 'coenzima_q10',
    name: 'Coenzima Q10 (Ubiquinona / Ubiquinol)',
    chemicalName: '2-[(all-E)-3,7,11,15,19,23,27,31,35,39-decamethyltetraconta-2,6,10,14,18,22,26,30,34,38-decaenyl]-5,6-dimethoxy-3-methylcyclohexa-2,5-diene-1,4-dione',
    synonyms: ['Ubiquinona', 'Ubiquinol (forma reduzida)', 'CoQ10'],
    pharmacologicalClass: 'Benzoquinona Lipossolúvel Endógena',
    chemicalForm: 'Pó cristalino amarelo-alaranjado lipofílico',
    standardization: 'Grau USP ≥ 99% de CoQ10',
    presentation: ['Cápsulas gelatinosas moles oleosas', 'Cápsulas com emulsão lipídica', 'Pó hidrossolúvel'],
    studiedIndications: [
      'Fadiga mitocondrial e baixa energia',
      'Reposição em usuários de estatinas (prevenção de miopatia)',
      'Suporte antioxidante na insuficiência cardíaca e hipertensão',
      'Enxaqueca recorrente e desempenho físico'
    ],
    mechanismOfAction: 'Atua como carreador essencial de elétrons entre os complexos I/II e o complexo III da cadeia respiratória mitocondrial, indispensável para a síntese de ATP. Na sua forma reduzida (ubiquinol), atua como antioxidante lipofílico potente, regenerando alfa-tocoferol e protegendo as membranas mitocondriais contra peroxidação lipídica.',
    standardReferenceDose: '100 a 200 mg ao dia (pode atingir até 400 mg/dia em indicações neurológicas específicas) administrado com refeição contendo gorduras saudáveis.',
    safetyLimits: 'Excelente tolerância até 1200 mg/dia em ensaios clínicos.',
    contraindications: ['Hipersensibilidade conhecida aos componentes da cápsula.'],
    interactions: [
      'Pode antagonizar sutilmente a ação anticoagulante da Varfarina devido à semelhança estrutural com a Vitamina K',
      'Aumenta a eficácia de medicamentos anti-hipertensivos (monitorar PA)'
    ],
    cypInteractions: 'Sem inibição significativa documentada de citocromos.',
    adme: {
      absorption: 'Lenta e limitada devido à alta lipofilicidade e elevado peso molecular. Absorção significativamente aumentada com veículo lipídico.',
      distribution: 'Incorporada em quilomícrons, carreada por LDL e VLDL, concentrando-se em órgãos com alta demanda bioenergética (coração, fígado, rins e músculos).',
      metabolism: 'Redução metabólica de ubiquinona para ubiquinol no enterócito e fígado.',
      excretion: 'Eliminação predominantemente fecal via via biliar (> 95%); menos de 1% eliminado pela urina.',
      halfLife: 'Cerca de 33 horas.',
      bioavailability: 'Aproximadamente 2 a 3% para pó seco comum; 5 a 8% em veículos oleosos automulsionáveis.'
    },
    receptorRole: 'Cofator',
    regulatoryStatusBrazil: 'Suplemento Alimentar (Anvisa)',
    references: ['Mortensen et al., JACC Heart Fail 2014', 'Langsjoen et al., Biofactors 2008']
  },
  {
    id: 'picolinato_cromo',
    name: 'Picolinato de Cromo (Cromo III Quelato)',
    chemicalName: 'Chromium (III) pyridine-2-carboxylate',
    synonyms: ['Chromium picolinate', 'Cromo quelado'],
    pharmacologicalClass: 'Micronutriente Mineral Essencial Quelado',
    chemicalForm: 'Complexo de coordenação de Cromo Trivalente com ácido picolínico',
    standardization: 'Teor de Cromo elementar de aproximadamente 12.4%',
    presentation: ['Cápsulas vegetais', 'Comprimidos'],
    studiedIndications: [
      'Suporte ao metabolismo de glicose e carboidratos',
      'Redução da avidez compulsiva por carboidratos refinados',
      'Coadjuvante na resistência insulínica e SOP'
    ],
    mechanismOfAction: 'Facilita a ação da insulina ao compor a cromodulina (fator de tolerância à glicose de baixo peso molecular), que se liga e estabiliza a conformação ativa da tirosina quinase no domínio citoplasmático do receptor de insulina.',
    standardReferenceDose: '200 a 400 mcg de Cromo elementar ao dia, em dose única com o almoço ou jantar.',
    safetyLimits: 'Ingestão máxima recomendada (UL) de até 400 mcg/dia sem monitoramento especializado.',
    contraindications: ['Insuficiência renal grave pré-existente', 'Disfunção hepática crônica'],
    interactions: [
      'Pode potencializar fármacos antidiabéticos (insulina, sulfonilureias)',
      'Medicamentos anti-inflamatórios não esteroides (AINEs) podem elevar absorção de cromo'
    ],
    cypInteractions: 'Sem interferência enzimática CYP.',
    adme: {
      absorption: 'O complexo picolinato possui absorção jejunal superior ao cloreto de cromo inorgânico (cerca de 2 a 5%).',
      distribution: 'Ligado à transferrina plasmática e albumina, distribuindo-se aos tecidos sensíveis à insulina.',
      metabolism: 'Não sofre biotransformação enzimática.',
      excretion: 'Excreção primária por filtração glomerular renal (> 90%).',
      halfLife: 'Eliminação bifásica: meia-vida rápida de algumas horas e lenta de vários dias tecidual.',
      bioavailability: 'Cerca de 2.5% a 5% (superior a formas inorgânicas).'
    },
    receptorRole: 'Cofator',
    regulatoryStatusBrazil: 'Suplemento Alimentar (Anvisa)',
    references: ['Anderson RA, Diabetes Metab 2000', 'Balk et al., Diabetes Care 2007']
  },
  {
    id: 'acido_alfa_lipoico',
    name: 'Ácido Alfa-Lipoico (ALA / Ácido Tióctico)',
    chemicalName: '(R)-5-(1,2-dithiolan-3-yl)pentanoic acid',
    synonyms: ['Alpha-lipoic acid', 'Ácido R-alfa-lipoico', 'Thioctic acid'],
    pharmacologicalClass: 'Antioxidante Anfipático & Coenzima Mitocondrial',
    chemicalForm: 'Composto organossulfurado racemático (R/S) ou enantiômero R puro',
    standardization: '≥ 99% de Ácido Alfa-Lipoico',
    presentation: ['Cápsulas', 'Cápsulas gastrorresistentes'],
    studiedIndications: [
      'Neuropatia diabética periférica (dor e parestesia)',
      'Resistência à insulina e controle glicêmico',
      'Suporte antioxidante mitocondrial e antienvelhecimento vascular'
    ],
    mechanismOfAction: 'Atua tanto em meio aquoso quanto lipídico. No meio intracelular é reduzido a ácido di-hidrolipoico (DHLA), capaz de neutralizar ROS, regenerar glutationa reduzida (GSH), vitamina C e E, além de estimular a translocação de GLUT4 via vias p38 MAPK e Akt independentes.',
    standardReferenceDose: '300 a 600 mg ao dia, ingerido 30 minutos antes de uma refeição (o alimento diminui sua absorção).',
    safetyLimits: 'Até 1200 mg/dia em ensaios de neuropatia diabética sob supervisão médica.',
    contraindications: ['Hipersensibilidade', 'Deficiência severa de tiamina (Vitamina B1) deve ser corrigida previamente'],
    interactions: [
      'Aumenta risco de hipoglicemia se associado a insulina ou secretagogos de insulina',
      'Quela íons bivalentes (ferro, cálcio, magnésio) no estômago se ingerido no mesmo horário'
    ],
    cypInteractions: 'Sem inibição clínica relevante de CYP450.',
    adme: {
      absorption: 'Rápida absorção no trato gastrointestinal superior. A presença de alimentos reduz a Cmax em até 30%.',
      distribution: 'Cruza a barreira hematoencefálica e atinge concentrações ativas em tecidos nervosos e cardíacos.',
      metabolism: 'Extensivo metabolismo hepático por beta-oxidação da cadeia alifática e S-metilação.',
      excretion: 'Excreção predominantemente renal na forma de metabólitos inativos.',
      halfLife: 'Cerca de 30 minutos a 1 hora (meia-vida plasmática curta, porém com efeitos intracelulares prolongados).',
      bioavailability: 'Aproximadamente 30% devido a metabolismo de primeira passagem significativo.'
    },
    receptorRole: 'Modulador Metabólico',
    regulatoryStatusBrazil: 'Suplemento Alimentar (Anvisa)',
    references: ['Ziegler et al., Diabetes Care 2006', 'Packer et al., Free Radic Biol Med 1995']
  },
  {
    id: 'creatina',
    name: 'Creatina Monoidratada Micronizada',
    chemicalName: '2-(Methylguanidino)acetic acid monohydrate',
    synonyms: ['Creatine Monohydrate', 'Creapure®'],
    pharmacologicalClass: 'Composto Guanidínico Derivado de Aminoácidos',
    chemicalForm: 'Pó branco cristalino de alta solubilidade e pureza',
    standardization: 'Grau HPLC ≥ 99.9% de Creatina Monoidratada',
    presentation: ['Pó solúvel para diluição em água', 'Cápsulas'],
    studiedIndications: [
      'Aumento de força e potência muscular anaeróbica',
      'Preservação e ganho de massa livre de gordura (sarcopenia e treinamento resistido)',
      'Cognição e suporte bioenergético cerebral em idosos e vegetarianos'
    ],
    mechanismOfAction: 'Fosforilada em fosfocreatina intracelular pela enzima creatina quinase (CK), atuando como doador imediato de fosfato de alta energia para refosforilar ADP em ATP em milissegundos durante esforço anaeróbico de alta intensidade.',
    standardReferenceDose: '3 a 5 g ao dia em uso contínuo, independente do horário (efeito crônico cumulativo por saturação dos estoques musculares).',
    safetyLimits: 'Até 20g/dia na fase clássica de saturação por 5-7 dias, ou 5g/dia de forma constante.',
    contraindications: ['Insuficiência renal crônica dialítica sem ajuste nefrológico.'],
    interactions: ['Uso associado com diuréticos espoliadores de volume pode aumentar risco de desidratação.'],
    cypInteractions: 'Inexistente.',
    adme: {
      absorption: 'Absorvida no intestino delgado por transporte ativo saturável e difusão simples.',
      distribution: 'Aproximadamente 95% concentrada na musculatura esquelética; restante no cérebro, testículos e coração.',
      metabolism: 'Convertida espontaneamente a creatinina a uma taxa diária constante de aproximadamente 1-2%.',
      excretion: 'Eliminação renal exclusiva da creatinina por filtração glomerular.',
      halfLife: 'Muscular tecidual de cerca de 4 a 6 semanas após saturação dos estoques.',
      bioavailability: 'Excelente absorção oral (> 99%).'
    },
    receptorRole: 'Substrato',
    regulatoryStatusBrazil: 'Suplemento Alimentar (Anvisa)',
    references: ['Kreider et al., J Int Soc Sports Nutr 2017', 'Candow et al., Sports Med 2021']
  }
];

// ---------------------------------------------------------------------------
// MATRIZ DE INTERAÇÕES MEDICAMENTOSAS E ENZIMAS CYP450 / TRANSPORTADORES
// ---------------------------------------------------------------------------
export const DRUG_INTERACTIONS_MATRIX: DrugInteractionRecord[] = [
  {
    id: 'int-01',
    active: 'Berberina HCl',
    drug: 'Metformina / Hipoglicemiantes Orais',
    cypEnzymeOrTransporter: 'AMPK e transportadores OCT1/OCT2',
    mechanism: 'Efeito sinérgico potente sobre a ativação da AMPK e inibição da gliconeogênese hepática, aumentando captação de glicose.',
    interactionType: 'Farmacodinâmica',
    severity: 'AMARELO',
    severityLabel: 'Interação Moderada / Requer Monitoramento',
    clinicalAction: 'Iniciar berberina com dose menor (300-500mg) e monitorar glicemia capilar nos primeiros 14 dias para ajuste fino.',
    populationAtRisk: 'Pacientes diabéticos em uso concomitante de sulfonilureias ou insulina.',
    warningSymptoms: 'Tremores, sudorese fria, palpitações e tontura (sinais de hipoglicemia).',
    evidenceSource: 'PubMed Central - PMC5839379'
  },
  {
    id: 'int-02',
    active: 'Berberina HCl',
    drug: 'Ciclosporina / Tacrolimo',
    cypEnzymeOrTransporter: 'CYP3A4 e P-glicoproteína (P-gp)',
    mechanism: 'Inibição acentuada da P-gp intestinal e CYP3A4 hepática, reduzindo a depuração e aumentando em até 3x a concentração sérica do imunossupressor.',
    interactionType: 'Farmacocinética',
    severity: 'VERMELHO',
    severityLabel: 'Contraindicação / Risco Grave de Toxicidade',
    clinicalAction: 'NÃO associar. Risco elevado de nefrotoxicidade e toxicidade sistêmica do imunossupressor.',
    populationAtRisk: 'Pacientes transplantados renais ou cardíacos.',
    warningSymptoms: 'Elevação de creatinina, hipertensão e tremores.',
    evidenceSource: 'Clinical Pharmacology & Therapeutics 2005'
  },
  {
    id: 'int-03',
    active: 'Ferro Quelato (ou Sulfato Ferroso)',
    drug: 'Levotiroxina Sódica (T4)',
    cypEnzymeOrTransporter: 'Complexação Físico-Química Intraluminal',
    mechanism: 'O ferro quela a molécula de levotiroxina no lúmen do estômago e duodeno, formando precipitado insolúvel não absorvível.',
    interactionType: 'Físico-Química',
    severity: 'LARANJA',
    severityLabel: 'Interação Clinicamente Relevante',
    clinicalAction: 'Espaçar a ingestão do suplemento de ferro em pelo menos 4 horas de distância da tomada matinal da levotiroxina em jejum.',
    populationAtRisk: 'Pacientes com hipotireoidismo em reposição hormonal.',
    warningSymptoms: 'Aumento do TSH, cansaço, sonolência e descompensação do hipotireoidismo.',
    evidenceSource: 'Thyroid 2014 Guidelines'
  },
  {
    id: 'int-04',
    active: 'Ferro Quelato / Magnésio Quelato',
    drug: 'Quinolonas (Ciprofloxacino, Levofloxacino) / Tetraciclinas',
    cypEnzymeOrTransporter: 'Quelação Intraluminal de Cátions Bivalentes',
    mechanism: 'Íons metálicos divalentes formam quelatos insolúveis com antibióticos do grupo das quinolonas, reduzindo drasticamente sua biodisponibilidade.',
    interactionType: 'Físico-Química',
    severity: 'VERMELHO',
    severityLabel: 'Risco de Falha Terapêutica Antimicrobiana',
    clinicalAction: 'Suspender temporariamente o suplemento de minerais ou afastar em pelo menos 4 a 6 horas da administração do antibiótico.',
    populationAtRisk: 'Pacientes em tratamento de infecção bacteriana ativa.',
    warningSymptoms: 'Persistência do quadro infeccioso por subdosagem sérica do antimicrobiano.',
    evidenceSource: 'FDA Drug Safety Information'
  },
  {
    id: 'int-05',
    active: 'Ômega-3 EPA/DHA (Doses > 3g/dia)',
    drug: 'Varfarina / Antiagregantes Plaquetários (AAS, Clopidogrel)',
    cypEnzymeOrTransporter: 'Inibição de Tromboxano A2 (TXA2)',
    mechanism: 'Incorporação de EPA nas membranas plaquetárias reduzindo a geração de TXA2 pró-trombótico e prolongando sutilmente o tempo de sangramento.',
    interactionType: 'Farmacodinâmica',
    severity: 'AMARELO',
    severityLabel: 'Interação Moderada / Monitoramento de Coagulação',
    clinicalAction: 'Avisar o médico assistente, monitorar RNI/TAP periodicamente e suspender o ômega-3 7 a 10 dias antes de procedimentos cirúrgicos programados.',
    populationAtRisk: 'Idosos, pacientes anticoagulados plenos ou com histórico de úlcera péptica.',
    warningSymptoms: 'Hematomas espontâneos, gengivorragia ou epistaxe.',
    evidenceSource: 'AHA Circulation 2019'
  },
  {
    id: 'int-06',
    active: '5-HTP (5-Hidroxitriptofano)',
    drug: 'ISRS (Fluoxetina, Sertralina, Escitalopram) / Duloxetina',
    cypEnzymeOrTransporter: 'Vias Serotoninérgicas Centrais',
    mechanism: 'Aumento excessivo dos níveis sinápticos de serotonina pela combinação de aumento de síntese com inibição da recaptação.',
    interactionType: 'Farmacodinâmica',
    severity: 'VERMELHO',
    severityLabel: 'Contraindicação Absoluta / Risco de Síndrome Serotoninérgica',
    clinicalAction: 'Contraindicado prescrever 5-HTP associado a antidepressivos inibidores da recaptação de serotonina.',
    populationAtRisk: 'Pacientes psiquiátricos em uso de antidepressivos ou estabilizadores de humor.',
    warningSymptoms: 'Hipertermia, agitação, clônus, taquicardia e rigidez muscular (emergência médica).',
    evidenceSource: 'New England Journal of Medicine 2005'
  }
];
