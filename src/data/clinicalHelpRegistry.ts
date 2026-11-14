/**
 * Centralized Clinical Help Registry
 * Single Source of Truth for interactive help, tooltips, and clinical guides across the SaaS.
 * 
 * Normas e referências:
 * - ISAK II (International Society for the Advancement of Kinanthropometry)
 * - ANVISA RDC 429/2020 & IN 75/2020 (Rotulagem Nutricional Obrigatória e Lupa Frontal)
 * - OMS 2006/2007 (Padrões de Crescimento Infantil e Escore-Z)
 * - CFM / CFN (Conselho Federal de Nutricionistas & Medicina)
 * - LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018)
 */

export interface ClinicalHelpItem {
  id: string;
  title: string;
  shortDescription: string;
  whatItDoes: string;
  purpose: string;
  howToUse: string[];
  benefits: string[];
  practicalExample: string;
  category: 
    | 'Navegação Principal'
    | 'Avaliação Antropométrica & Composição'
    | 'Planejamento Dietético & Macros'
    | 'Conduta Clínica & Prescrição'
    | 'Exames Laboratoriais'
    | 'Gestão & Governança'
    | 'Controles do Sistema';
  badge?: string;
  targetTab?: string;
}

export const CLINICAL_HELP_REGISTRY: Record<string, ClinicalHelpItem> = {
  // ==========================================
  // NAVEGAÇÃO PRINCIPAL / MENUS DA SIDEBAR
  // ==========================================
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard de Progresso e Visão Geral',
    shortDescription: 'Painel clínico consolidado com status biométrico, metas e alertas do paciente ativo.',
    whatItDoes: 'Reúne em tempo real todos os marcadores clínicos essenciais do paciente selecionado: evolução ponderal, composição corporal (massa gorda vs. massa magra), aderência à dieta, balanço calórico diário e histórico de consultas.',
    purpose: 'Fornecer ao profissional uma fotografia clínica instantânea no momento em que o paciente entra no consultório, eliminando a necessidade de abrir múltiplos prontuários.',
    howToUse: [
      'Selecione o paciente desejado no seletor do cabeçalho superior.',
      'Analise o resumo de peso, IMC e percentual de gordura comparado à consulta anterior.',
      'Verifique o status do diário alimentar e o cumprimento das metas hídricas e de macronutrientes.',
      'Clique nos atalhos rápidos para navegar direto para reavaliação de dobras, dietas ou prescrições.'
    ],
    benefits: [
      'Reduz em até 70% o tempo gasto na revisão pré-consulta.',
      'Permite identificar rapidamente estagnações de peso ou déficits de adesão.',
      'Interface visual limpa e focada em dados numéricos precisos.'
    ],
    practicalExample: 'Durante o retorno mensal de um paciente em hipertrofia, o nutricionista bate o olho no Dashboard e percebe que ele manteve os 78kg, mas reduziu a gordura corporal em 1,4% e preservou toda a massa magra, confirmando o sucesso do protocolo.',
    category: 'Navegação Principal',
    badge: 'Visão Geral',
    targetTab: 'dashboard'
  },

  dashboard_admin: {
    id: 'dashboard_admin',
    title: 'Gestão & Indicadores Administrativos (ADM)',
    shortDescription: 'Métricas de negócio da clínica: taxa de ocupação, faturamento mensal e retenção.',
    whatItDoes: 'Consolida indicadores de desempenho gerencial e financeiro: consultas realizadas, taxa de comparecimento (show-rate), faturamento acumulado, ticket médio por atendimento e metas de crescimento.',
    purpose: 'Permitir ao gestor da clínica e aos profissionais acompanharem a sustentabilidade financeira e a produtividade operacional do consultório.',
    howToUse: [
      'Acesse a aba para visualizar os gráficos de faturamento por período.',
      'Monitore a taxa de cancelamentos e faltas para ajustar confirmações de agendamento.',
      'Acompanhe o atingimento da meta mensal de faturamento e volume de consultas.',
      'Filtre resultados por profissional ou período contábil.'
    ],
    benefits: [
      'Visão estratégica do crescimento do negócio sem necessitar de planilhas externas.',
      'Identificação precoce de ociosidade na agenda clínica.',
      'Controle absoluto do retorno financeiro das consultas.'
    ],
    practicalExample: 'O administrador nota que a taxa de faltas às sextas-feiras estava em 22% e decide utilizar o módulo de Lembretes SMS para disparar avisos automáticos 2 horas antes da consulta, derrubando o absenteísmo para 4%.',
    category: 'Gestão & Governança',
    badge: 'ADM',
    targetTab: 'dashboard_admin'
  },

  financeiro: {
    id: 'financeiro',
    title: 'Módulo Financeiro, Caixa & DRE Clínico',
    shortDescription: 'Gestão de fluxo de caixa, recibos para Imposto de Renda e DRE simplificado.',
    whatItDoes: 'Gerencia lançamentos de receitas e despesas da clínica, calcula o fluxo de caixa líquido, gera recibos oficiais com CPF/CNPJ para dedução de Imposto de Renda (IRPF) do paciente e emite extrato contábil.',
    purpose: 'Cumprir as obrigações fiscais e sanitárias de registro contábil de serviços de saúde, garantindo a rastreabilidade financeira dos honorários nutricionais.',
    howToUse: [
      'Registre cada entrada com o paciente correspondente, forma de pagamento e valor.',
      'Cadastre as despesas operacionais da clínica (aluguel, softwares, insumos).',
      'Gere o Recibo de Pagamento de Saúde em PDF assinado com código de autenticidade.',
      'Consulte o DRE do mês para avaliar a margem de lucro operacional.'
    ],
    benefits: [
      'Emissão de recibos válidos perante a Receita Federal do Brasil em 1 clique.',
      'Prevenção de glosas fiscais e cálculo correto do Carnê-Leão.',
      'Segregação clara entre caixa da pessoa física e da pessoa jurídica.'
    ],
    practicalExample: 'Ao término da consulta particular de R$ 350,00, o nutricionista clica em "Emitir Recibo", o sistema preenche automaticamente os dados fiscais do paciente e envia a via em PDF com QR Code de autenticação.',
    category: 'Gestão & Governança',
    badge: 'R$ & Fiscal',
    targetTab: 'financeiro'
  },

  meu_professor: {
    id: 'meu_professor',
    title: 'Meu Professor (IA & Educação Continuada)',
    shortDescription: 'Tutor clínico inteligente para tirar dúvidas de fisiologia, técnica de Feynman e flashcards.',
    whatItDoes: 'Ambiente de suporte técnico-científico que permite ao nutricionista sanar dúvidas complexas sobre bioquímica dos nutrientes, interações fármaco-nutriente e fisiologia clínica com base na literatura mais recente.',
    purpose: 'Capacitar o profissional continuamente durante a prática diária, oferecendo fundamentação científica rápida e segura para casos atípicos.',
    howToUse: [
      'Digite a dúvida clínica ou o caso fisiopatológico na barra de pesquisa.',
      'Utilize o método Feynman para simplificar explicações aos pacientes.',
      'Revise os flashcards de dosagens, biodisponibilidade e limites de toxicidade de micronutrientes.'
    ],
    benefits: [
      'Apoio em tempo real sem precisar parar o atendimento para consultar manuais volumosos.',
      'Melhora a segurança nas condutas prescritivas mais desafiadoras.',
      'Estimula o aprendizado contínuo da equipe.'
    ],
    practicalExample: 'O nutricionista atende um paciente com esteatose hepática não alcoólica em uso de metformina e consulta o tutor sobre a melhor estratégia de suplementação de colina e fosfatidilcolina sem sobrecarga gastrointestinal.',
    category: 'Gestão & Governança',
    badge: 'Skill IA',
    targetTab: 'meu_professor'
  },

  agenda: {
    id: 'agenda',
    title: 'Agenda Clínica de Consultas & Retornos',
    shortDescription: 'Organização de horários, status de comparecimento e agendamento de avaliações.',
    whatItDoes: 'Sistema completo de agendamento clínico que gerencia horários de primeira consulta, retornos, bioimpedância express e coletas de exames, sincronizando o status de confirmação e faltas.',
    purpose: 'Otimizar o tempo de atendimento do profissional e da equipe de recepção, garantindo pontualidade e previsibilidade no fluxo de pacientes.',
    howToUse: [
      'Clique em "Novo Agendamento" para vincular o paciente ao dia e horário desejado.',
      'Selecione a modalidade: Primeira Consulta, Retorno, Avaliação Antropométrica ou Teleconsulta.',
      'Atualize o status conforme o andamento: Confirmado, Aguardando na Recepção, Em Consulta ou Concluído.',
      'Use o atalho para iniciar a avaliação do paciente diretamente a partir do cartão do agendamento.'
    ],
    benefits: [
      'Eliminação de conflitos de horário e sobreposições na agenda.',
      'Integração direta com o prontuário do paciente em um toque.',
      'Facilidade de visualização diária, semanal e mensal.'
    ],
    practicalExample: 'A secretária confirma a chegada de um paciente às 14:00. O nutricionista vê o cartão mudar para "Aguardando" no seu monitor e, com um único clique em "Iniciar Consulta", já abre o prontuário e as metas pré-definidas.',
    category: 'Navegação Principal',
    badge: 'Consultório',
    targetTab: 'agenda'
  },

  sms_lembretes: {
    id: 'sms_lembretes',
    title: 'Lembretes SMS Automáticos',
    shortDescription: 'Disparo de confirmações de consulta e avisos de jejum via SMS e WhatsApp.',
    whatItDoes: 'Automatiza o envio de mensagens de texto SMS e notificações para os pacientes antes de consultas, alertando sobre horário, endereço e instruções preparatórias (ex.: jejum para bioimpedância).',
    purpose: 'Reduzir drasticamente o no-show (faltas) e assegurar que o paciente chegue ao consultório preparado com os protocolos pré-avaliação cumpridos.',
    howToUse: [
      'Escolha o template desejado: Confirmação 24h Antes, Lembrete de Jejum 4h, ou Mensagem Pós-Consulta.',
      'Verifique a lista de pacientes com agendamento próximo e dispare os envios automáticos.',
      'Acompanhe o relatório de entrega e confirmações registradas.'
    ],
    benefits: [
      'Redução de até 40% no absenteísmo de consultas.',
      'Garante adesão correta aos protocolos preparatórios de bioimpedância e exames.',
      'Comunicação direta sem depender de aplicativos de terceiros que possam estar sem internet.'
    ],
    practicalExample: 'Para um paciente com bioimpedância agendada, o sistema envia: "Olá Carlos! Sua consulta é amanhã às 09:00. Lembre-se: jejum hídrico de 2h, não ingerir cafeína/álcool e não realizar treino pesado hoje."',
    category: 'Navegação Principal',
    badge: 'Automação',
    targetTab: 'sms_lembretes'
  },

  documentos: {
    id: 'documentos',
    title: 'Central de Documentos & Atestados',
    shortDescription: 'Emissão padronizada de declarações de comparecimento, laudos e atestados nutricionais.',
    whatItDoes: 'Gera documentos clínicos oficiais com layout profissional, cabeçalho da clínica, dados cadastrais do paciente, numeração de prontuário, assinatura digitalizada e conformidade com o Código de Ética do CFN.',
    purpose: 'Padronizar e agilizar a emissão de declarações de comparecimento para trabalho/estudo, laudos para procedimentos cirúrgicos (bariátrica) e relatórios periciais.',
    howToUse: [
      'Escolha o modelo de documento necessário (Declaração de Comparecimento, Laudo de Aptidão, Atestado Nutricional).',
      'Revise o texto padrão, que já é preenchido com data, horário e dados do paciente ativo.',
      'Personalize o corpo do texto com observações clínicas específicas, se necessário.',
      'Exporte em PDF de alta resolução com cabeçalho institucional para impressão ou envio por e-mail.'
    ],
    benefits: [
      'Documentos com apresentação visual impecável que reforçam a autoridade clínica.',
      'Economia de tempo com preenchimento automático das informações cadastrais.',
      'Conformidade jurídica e ética com as normativas do CFN e LGPD.'
    ],
    practicalExample: 'Ao final do atendimento de uma funcionária pública, o nutricionista clica em "Declaração de Comparecimento", e o documento já sai pronto com horário de entrada (14:15) e saída (15:20) carimbado e assinado digitalmente.',
    category: 'Conduta Clínica & Prescrição',
    badge: 'Hub Clínico',
    targetTab: 'documentos'
  },

  prescricoes: {
    id: 'prescricoes',
    title: 'Gerador de Prescrições & Fitoterápicos',
    shortDescription: 'Prescrição personalizada de suplementos, vitaminas, minerais e fórmulas magistrais.',
    whatItDoes: 'Permite formular receitas de suplementos com posologia detalhada, veículo (cápsula, sachê, líquido), horário de ingestão, interações alimentares e alertas de dosagem máxima permitida por lei para nutricionistas.',
    purpose: 'Garantir que a prescrição de suplementos seja segura, cientificamente embasada e clara para a farmácia de manipulação e para o paciente.',
    howToUse: [
      'Selecione os ativos a partir do banco de dados estruturado ou cadastre uma fórmula própria.',
      'Defina a concentração, unidade (mg, mcg, UI, g) e posologia (ex: "Tomar 1 dose 30 min antes de dormir").',
      'Verifique se a dosagem respeita os limites estabelecidos pela ANVISA para suplementos alimentares.',
      'Gere o receituário com QR Code para dispensação ou manipulação rápida.'
    ],
    benefits: [
      'Evita erros de dosagem e unidades de medida nas receitas.',
      'Modelagem estruturada de via de administração, horário e interação.',
      'Diferenciação clara entre doses de Nutricionista vs. Profissional Médico.'
    ],
    practicalExample: 'Prescrição de Creatina Monohidratada 5g ao dia associada a Magnésio Bisglicinato 250mg à noite, com instrução explícita de ingestão junto a uma refeição contendo carboidratos para maximizar a captação tecidual.',
    category: 'Conduta Clínica & Prescrição',
    badge: 'Receituário',
    targetTab: 'prescricoes'
  },

  dietas: {
    id: 'dietas',
    title: 'Dietas & Rastreamento Calórico Diário',
    shortDescription: 'Cálculo de TMB/GET, divisão de macronutrientes em g/kg e cardápio quantitativo.',
    whatItDoes: 'Calcula a Taxa Metabólica Basal (Mifflin-St Jeor, Harris-Benedict, Katch-McArdle) e Gasto Energético Total (GET), distribui carboidratos, proteínas e gorduras em gramas e gramas por quilo (g/kg), e monta o plano com refeições fracionadas.',
    purpose: 'Traduzir a necessidade biológica do paciente em um plano alimentar realista, quantificado e adaptado à rotina do paciente.',
    howToUse: [
      'Escolha a equação preditiva de TMB mais adequada ao perfil (ex.: Katch-McArdle para atletas com composição conhecida).',
      'Defina o fator de atividade física (1.2 a 1.9) e o objetivo (déficit para emagrecimento, superávit para hipertrofia ou manutenção).',
      'Ajuste os macronutrientes nos controles deslizantes ou digite diretamente as metas em g/kg.',
      'Distribua as calorias entre as refeições (Café da Manhã, Almoço, Lanche, Jantar) e registre os alimentos.'
    ],
    benefits: [
      'Fórmulas clínicas puras e rastreáveis isoladas no domínio da aplicação.',
      'Controle simultâneo por percentual (%) calórico e razão biológica (g/kg).',
      'Suporte a rebalanceamento inteligente de porções quando houver desvio de ingestão no diário.'
    ],
    practicalExample: 'Para um maratonista de 70kg em fase de preparação, o nutricionista define 45 kcal/kg (3.150 kcal), com 2,0 g/kg de proteína (140g), 1,0 g/kg de gordura (70g) e 7,0 g/kg de carboidratos (490g), distribuídos em 5 refeições.',
    category: 'Planejamento Dietético & Macros',
    badge: 'Cardápio',
    targetTab: 'dietas'
  },

  pediatria: {
    id: 'pediatria',
    title: 'Curvas Pediátricas OMS & Escore-Z',
    shortDescription: 'Avaliação de crescimento infantil de 0 a 19 anos conforme padrões oficiais da OMS e SISVAN.',
    whatItDoes: 'Calcula com precisão matemática os Escores-Z para Peso para Idade, Estatura para Idade, IMC para Idade e Perímetro Cefálico, plotando a trajetória do paciente sobre as curvas percentilares da Organização Mundial da Saúde.',
    purpose: 'Identificar precocemente desvios de crescimento, risco de desnutrição, baixa estatura ou sobrepeso em lactentes, crianças e adolescentes.',
    howToUse: [
      'Informe a data de nascimento, data da consulta e as medidas antropométricas da criança.',
      'O sistema converte a idade exata em meses e calcula os valores LMS da OMS.',
      'Visualize o gráfico interativo de percentis (p3, p15, p50, p85, p97) e desvios-padrão (-3z a +3z).',
      'Gere o relatório evolutivo pediátrico para orientação dos pais ou responsáveis.'
    ],
    benefits: [
      'Cálculo determinístico com fórmulas originais Box-Cox (LMS da OMS).',
      'Diagnóstico nutricional imediato alinhado às diretrizes do Ministério da Saúde / SISVAN.',
      'Comunicação visual clara e tranquilizadora para a família da criança.'
    ],
    practicalExample: 'Uma menina de 4 anos com peso de 14,2 kg e altura de 98 cm tem seu Escore-Z de IMC/Idade calculado em -0,48 Z (Eutrofia, percentil 32), demonstrando crescimento harmônico e saudável.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'OMS / Escore-Z',
    targetTab: 'pediatria'
  },

  dobras: {
    id: 'dobras',
    title: 'Calculadora de Dobras Cutâneas ISAK',
    shortDescription: 'Protocolo internacional de 7 dobras (Jackson & Pollock / Petroski / Faulkner).',
    whatItDoes: 'Coleta a espessura das dobras cutâneas (Tríceps, Subescapular, Bíceps, Crista Ilíaca, Supraespinal, Abdominal e Coxa) e calcula densidade corporal, percentual de gordura (%G), massa gorda (kg) e massa livre de gordura.',
    purpose: 'Fornecer o método padrão-ouro de campo para monitorar o emagrecimento real e a retenção de massa muscular ao longo do tempo.',
    howToUse: [
      'Utilize um plicômetro calibrado e marque os pontos anatômicos padronizados pela ISAK.',
      'Insira as medidas em milímetros no formulário clínico.',
      'Selecione a equação de predição adequada ao sexo, idade e etnia do paciente.',
      'Compare os resultados com as avaliações passadas para mensurar a perda seletiva de gordura subcutânea.'
    ],
    benefits: [
      'Normatização estrita com os critérios internacionais da ISAK Nível 2.',
      'Separação nítida entre perda de água/peso na balança e redução efetiva de gordura.',
      'Geração de gráficos comparativos de dobras individuais para análise regional.'
    ],
    practicalExample: 'Um paciente perdeu apenas 1 kg na balança em 60 dias, mas a soma das 7 dobras caiu de 118 mm para 92 mm, comprovando que ele perdeu 2,6 kg de gordura e ganhou 1,6 kg de massa magra (recomposição corporal).',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'ISAK II',
    targetTab: 'dobras'
  },

  calculadora_macros: {
    id: 'calculadora_macros',
    title: 'Calculadora de Macros Rápida & GET',
    shortDescription: 'Simulador metabólico ágil para estimativas instantâneas de calorias e macros.',
    whatItDoes: 'Permite simular cenários de TMB e GET de forma independente do prontuário, testando diferentes distribuições de carboidratos, proteínas e lipídios em segundos.',
    purpose: 'Facilitar simulações rápidas durante a conversa inicial com o paciente ou para cálculos pedagógicos e estimativas preliminares.',
    howToUse: [
      'Preencha peso, altura, idade e nível de atividade física.',
      'Defina se deseja superávit para ganho de peso, déficit para perda ou balanço neutro.',
      'Ajuste os valores de proteína em g/kg e veja o impacto imediato na soma calórica.',
      'Transfira os resultados calculados para o plano alimentar definitivo com 1 clique.'
    ],
    benefits: [
      'Agilidade máxima sem necessidade de salvar rascunhos.',
      'Excelente ferramenta didática para demonstrar metas energéticas ao paciente na tela.',
      'Validação automática para impedir totais energéticos matematicamente incoerentes.'
    ],
    practicalExample: 'O nutricionista demonstra ao paciente na tela que aumentar a proteína de 1,2 g/kg para 1,8 g/kg eleva o gasto térmico dos alimentos e preserva mais massa magra durante o corte de calorias.',
    category: 'Planejamento Dietético & Macros',
    badge: 'Express',
    targetTab: 'calculadora_macros'
  },

  bioimpedancia: {
    id: 'bioimpedancia',
    title: 'Bioimpedância Multifrequencial 4C',
    shortDescription: 'Análise de água corporal (TBW/ECW), Ângulo de Fase celular e massa magra segmentar.',
    whatItDoes: 'Interpreta dados de impedância, resistência e reatância corporal, calculando água intra e extracelular, taxa de hidratação, massa muscular esquelética segmentar (braços, pernas, tronco) e o Ângulo de Fase a 50 kHz.',
    purpose: 'Avaliar a integridade da membrana celular, estado de hidratação, desnutrição celular oculta e distribuição muscular de forma rápida e não invasiva.',
    howToUse: [
      'Garanta que o paciente cumpriu as diretrizes pré-exame (jejum, bexiga vazia, sem metais).',
      'Insira os valores brutos de impedância ou os percentuais fornecidos pelo equipamento.',
      'Analise o Ângulo de Fase: valores acima de 6,5° indicam excelente integridade e vitalidade celular.',
      'Verifique a proporção de água extracelular para descartar retenção hídrica inflamatória.'
    ],
    benefits: [
      'Detecção de retenção de líquidos que mascara a perda de gordura.',
      'Marcador prognóstico robusto de saúde celular e capacidade de recuperação.',
      'Avaliação de assimetrias musculares entre membros inferiores e superiores.'
    ],
    practicalExample: 'Um paciente em recuperação de lesão apresenta ângulo de fase de 7,4° e água extracelular normalizada (ECW/TBW = 0,38), confirmando ausência de edema e excelente prontidão para intensificar a periodização de treinos.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'Biofísica 4C',
    targetTab: 'bioimpedancia'
  },

  rcq: {
    id: 'rcq',
    title: 'Avaliação RCQ (Cintura-Quadril)',
    shortDescription: 'Relação Cintura-Quadril, padrão de distribuição androide/ginoide e risco cardiovascular.',
    whatItDoes: 'Calcula a razão entre a circunferência da cintura e do quadril, classificando o risco cardiometabólico do paciente segundo os pontos de corte da Organização Mundial da Saúde (OMS).',
    purpose: 'Identificar o acúmulo de gordura visceral intra-abdominal profunda, diretamente associada a aterosclerose, hipertensão e diabetes tipo 2.',
    howToUse: [
      'Aferir a circunferência da cintura no ponto médio entre a última costela e a crista ilíaca.',
      'Aferir o quadril no nível de maior protuberância dos glúteos.',
      'Insira as medidas em centímetros.',
      'O sistema classifica instantaneamente o risco: Baixo, Moderado, Alto ou Muito Alto.'
    ],
    benefits: [
      'Método de triagem cardiovascular universalmente validado e de baixo custo.',
      'Sensibiliza o paciente para os riscos da gordura visceral interna além da estética.',
      'Facilidade de acompanhamento longitudinal em cada retorno.'
    ],
    practicalExample: 'Um homem de 42 anos com cintura de 102 cm e quadril de 100 cm tem RCQ = 1,02 (Risco Muito Alto), justificando intervenção dietética com foco anti-inflamatório e controle glicêmico rigoroso.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'Risco Clínico',
    targetTab: 'rcq'
  },

  pescoco: {
    id: 'pescoco',
    title: 'Risco Cardiometabólico & Pescoço',
    shortDescription: 'Circunferência do pescoço, dinamometria Jamar e triagem de apneia obstrutiva do sono.',
    whatItDoes: 'Mede a adiposidade da parte superior do corpo por meio da circunferência do pescoço, correlacionando com resistência à insulina, síndrome metabólica e apneia obstrutiva do sono, além de integrar com força de preensão manual (Jamar).',
    purpose: 'Identificar riscos metabólicos em pacientes nos quais a circunferência da cintura pode sofrer variações por distensão abdominal, gases ou gravidez.',
    howToUse: [
      'Posicione a fita métrica logo abaixo da proeminência laríngea (pomo de Adão) com o paciente ereto.',
      'Insira a medida do pescoço em centímetros (valores de alerta: > 37 cm para homens, > 34 cm para mulheres).',
      'Opcionalmente, registre a força de preensão palmar (kgf) obtida no dinamômetro Jamar para triagem de sarcopenia.',
      'Analise o escore integrado de risco cardiovascular.'
    ],
    benefits: [
      'Medida rápida que não requer despir o paciente, ideal para consultas dinâmicas.',
      'Alta correlação com esteatose hepática e distúrbios respiratórios do sono.',
      'Triagem precoce de perda de funcionalidade e força muscular.'
    ],
    practicalExample: 'Mulher sedentária de 50 anos apresenta pescoço de 36,5 cm e queixas de sonolência diurna; o achado apoia a hipótese de resistência insulínica e suspeita de apneia, direcionando o plano para perda de peso e higiene do sono.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'Cardiometabólico',
    targetTab: 'pescoco'
  },

  fotos: {
    id: 'fotos',
    title: 'Fotogrametria Comparativa T0/T1',
    shortDescription: 'Comparativo visual padronizado antes e depois com modo ghosting e análise visual.',
    whatItDoes: 'Armazena fotografias posturais padronizadas (frente, costas, perfis) com alinhamento por grade e efeito "fantasma" (ghosting) de sobreposição, destacando a evolução da recomposição corporal entre o início (T0) e o momento atual (T1).',
    purpose: 'Materializar a evolução estética e postural do paciente, fortalecendo a motivação e a fidelização mesmo em períodos de peso estável na balança.',
    howToUse: [
      'Fotografe o paciente sempre com a mesma distância, iluminação e fundo neutro.',
      'Faça o upload das imagens do registro basal (T0) e da reavaliação (T1).',
      'Utilize o slider de sobreposição para confrontar silhueta, cintura e definição.',
      'Gere o card de comparação para incluir no laudo do paciente.'
    ],
    benefits: [
      'Poderoso elemento de adesão ao tratamento e engajamento emocional do paciente.',
      'Detecção de melhoras posturais e simetria muscular não captadas por números.',
      'Armazenamento seguro em conformidade com as exigências da LGPD para imagens de saúde.'
    ],
    practicalExample: 'O paciente desanima porque a balança não oscilou nos últimos 30 dias. Ao visualizar o comparativo T0/T1 lado a lado, a redução do diâmetro abdominal e o aumento do contorno dos deltoides tornam-se incontestáveis.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'Visual T0/T1',
    targetTab: 'fotos'
  },

  anvisa: {
    id: 'anvisa',
    title: 'Tabela ANVISA (RDC 429/20 & IN 75/20)',
    shortDescription: 'Gerador oficial de rotulagem nutricional obrigatória e lupa de alerta frontal.',
    whatItDoes: 'Gera tabelas nutricionais segundo os padrões da RDC 429/2020 e IN 75/2020 da ANVISA, aplicando automaticamente as regras oficiais de arredondamento de casas decimais, cálculo por 100g e porção caseira, além da avaliação da Lupa Frontal ("ALTO EM: Açúcar Adicionado / Gordura Saturada / Sódio").',
    purpose: 'Auxiliar nutricionistas que prestam consultoria para a indústria de alimentos, confeitarias saudáveis, restaurantes e marmitarias na criação de rótulos 100% legalizados.',
    howToUse: [
      'Informe o tamanho da embalagem, peso total e a porção de referência do alimento com a medida caseira.',
      'Preencha os nutrientes por 100g (Valor Energético, Carboidratos, Açúcares Totais, Adicionados, Proteínas, Gorduras, Fibras e Sódio).',
      'O sistema aplica as regras matemáticas oficiais de arredondamento e calcula os %VD (Valores Diários).',
      'A lupa frontal é ativada automaticamente caso os limites da IN 75/2020 sejam superados.',
      'Exporte o modelo em vetor ou PDF pronto para impressão gráfica.'
    ],
    benefits: [
      'Garantia jurídica de conformidade estrita com a legislação sanitária brasileira.',
      'Elimina o risco de multas ou autuações da vigilância sanitária por rotulagem incorreta.',
      'Cálculo e arredondamento automáticos seguindo a tabela de precisão da ANVISA.'
    ],
    practicalExample: 'Ao formular uma barra proteica artesanal de 50g contendo 18g de gordura saturada por 100g, o sistema sinaliza obrigatoriamente a lupa frontal "ALTO EM GORDURA SATURADA" com o desenho geométrico oficial da norma.',
    category: 'Conduta Clínica & Prescrição',
    badge: 'RDC 429/2020',
    targetTab: 'anvisa'
  },

  relatorio_evolutivo: {
    id: 'relatorio_evolutivo',
    title: 'Dashboard de Evolução Clínica & Benchmark da Clínica',
    shortDescription: 'Histórico longitudinal de peso e % gordura comparado à média de pacientes da clínica com Recharts.',
    whatItDoes: 'Traça curvas temporais interativas em múltiplos eixos (Dual-Axis) do peso corporal (kg) e do percentual de gordura (%G) do paciente, confrontando-os em tempo real com a média e faixas de desvio padrão da coorte de pacientes da clínica (geral, mesmo sexo, faixa etária ou mesmo objetivo).',
    purpose: 'Fornecer inteligência epidemiológica e clínica para posicionar a evolução do paciente frente aos resultados médios observados no consultório, calibrando expectativas e motivando com base em dados reais.',
    howToUse: [
      'Alterne entre a Visão Integrada (Dual-Axis), Foco em Peso (kg) e Foco em % Gordura.',
      'Selecione a coorte de comparação: Geral da Clínica, Mesmo Sexo, Mesma Faixa Etária ou Mesmo Objetivo.',
      'Visualize o delta pontual e acumulado (kg e %G) em relação à média da clínica na tabela analítica.',
      'Registre novas medições diretamente no dashboard para recalibrar as curvas imediatamente.',
      'Copie o resumo clínico estruturado para anexar ao prontuário do paciente.'
    ],
    benefits: [
      'Comparação contextualizada e cientificamente embasada com pacientes de perfil similar.',
      'Identificação rápida de respostas acima ou abaixo da média esperada da clínica.',
      'Demonstração visual do valor e eficácia do acompanhamento nutricional para o paciente.'
    ],
    practicalExample: 'Ao analisar o retorno de 60 dias da paciente Beatriz (64.5 kg, 21.2% gordura), o gráfico evidencia que sua taxa de perda de peso (-1.25 kg/mês) supera em 73% o ritmo médio da clínica (-0.72 kg/mês) para mulheres na mesma faixa etária.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'Benchmark',
    targetTab: 'relatorio_evolutivo'
  },

  exames_suplementos: {
    id: 'exames_suplementos',
    title: 'Requisição de Exames & Suplementação',
    shortDescription: 'Requisição inteligente de exames laboratoriais por painéis clínicos e posologia.',
    whatItDoes: 'Disponibiliza catálogo de exames laboratoriais categorizados por painéis funcionais (Glicêmico, Lipídico, Tireoidiano, Hepático, Renal, Inflamatório e Hormonal), gerando a guia de requisição oficial e cruzando com necessidades de suplementação.',
    purpose: 'Subsidiar o diagnóstico nutricional com dados bioquímicos precisos e orientar a solicitação fundamentada de exames laboratoriais permitidos pelo CFN.',
    howToUse: [
      'Selecione os exames desejados clicando nos painéis pré-configurados ou adicione parâmetros avulsos.',
      'Adicione a justificativa clínica exigida pelos planos de saúde e laboratórios.',
      'Gere a guia de solicitação de exames pronta para assinatura.',
      'Vincule os resultados obtidos à prescrição de micronutrientes correspondente.'
    ],
    benefits: [
      'Fonte única de dados com nomenclatura laboratorial padronizada.',
      'Agilidade na seleção de pacotes específicos (ex: Pré-bariátrica, Check-up Vegetariano, Performance).',
      'Conformidade com a Resolução CFN nº 656/2020 para solicitação de exames.'
    ],
    practicalExample: 'Para um paciente com queixa de fadiga crônica, o nutricionista seleciona com um clique o "Painel Metabólico e Anemia" (Hemograma, Ferritina, Ferro Sérico, Vitamina B12, Ácido Fólico, PCR-us e TSH), imprimindo a guia em segundos.',
    category: 'Exames Laboratoriais',
    badge: 'Laboratorial',
    targetTab: 'exames_suplementos'
  },

  hemo_intelligence: {
    id: 'hemo_intelligence',
    title: 'Hemo Intelligence Pro (RX do Hemograma)',
    shortDescription: 'Interpretação integrativa e funcional avançada dos parâmetros hematológicos.',
    whatItDoes: 'Analisa o hemograma completo sob a ótica da Nutrição Funcional e Integrativa, confrontando valores de referência convencionais com intervalos ideais ótimos e identificando deficiências subclínicas de ferro, B12, inflamação crônica e estresse imunológico.',
    purpose: 'Detectar carências nutricionais em estágio celular antes que elas evoluam para anemia clínica manifesta na medicina tradicional.',
    howToUse: [
      'Insira os valores do laudo laboratorial do paciente (Hemácias, Hemoglobina, VCM, HCM, RDW, Leucócitos, Plaquetas).',
      'O sistema compara automaticamente com as faixas funcionais integrativas.',
      'Analise a identificação automática de padrões (ex: macrocitose oculta, anemia ferropriva incipiente ou inflamação subclínica).',
      'Obtenha sugestões de exames complementares e intervenções dietoterápicas.'
    ],
    benefits: [
      'Diferencial competitivo clínico de alto nível na consulta nutricional.',
      'Interpretação funcional profunda que vai muito além do "normal / alterado" dos laboratórios comuns.',
      'Melhoria rápida nos sintomas de disposição, foco e cognição do paciente.'
    ],
    practicalExample: 'Um paciente com hemoglobina "normal" de 13,2 g/dL apresenta VCM de 98 fL e RDW de 14,8%. O Hemo Intelligence detecta prontamente uma suspeita de carência funcional de vitamina B12 e folato, muito antes do surgimento de macrocitose severa.',
    category: 'Exames Laboratoriais',
    badge: 'Integrativa',
    targetTab: 'hemo_intelligence'
  },

  pacientes: {
    id: 'pacientes',
    title: 'Cadastro & Histórico de Pacientes',
    shortDescription: 'Prontuário eletrônico completo, anamnese, dados de contato e consentimento LGPD.',
    whatItDoes: 'Centraliza todas as informações do paciente: dados demográficos, contatos de emergência, histórico patológico pregresso, alergias e intolerâncias alimentares, medicamentos em uso, termos de consentimento da LGPD e histórico de atendimentos.',
    purpose: 'Manter a custódia segura, organizada e confidencial do prontuário nutricional, garantindo acesso instantâneo durante as consultas.',
    howToUse: [
      'Clique em "Novo Paciente" para preencher o formulário cadastral.',
      'Registre os hábitos alimentares, histórico clínico, restrições e objetivos.',
      'Gere e colete o termo de consentimento de tratamento de dados sensíveis de saúde.',
      'Edite ou atualize as informações sempre que houver mudanças de contato ou quadro de saúde.'
    ],
    benefits: [
      'Atendimento 100% aderente ao art. 5º da Lei Geral de Proteção de Dados (LGPD).',
      'Histórico completo e ininterrupto da vida clínica do paciente.',
      'Facilidade de busca por nome, número de prontuário ou CPF.'
    ],
    practicalExample: 'Ao atender um paciente com doença celíaca, o nutricionista registra o diagnóstico no cadastro; o sistema ativa alertas automáticos para impedir qualquer inclusão de glúten nos cardápios elaborados para ele.',
    category: 'Navegação Principal',
    badge: 'Prontuário',
    targetTab: 'pacientes'
  },

  profissionais: {
    id: 'profissionais',
    title: 'Gestão de Profissionais & Permissões (RBAC)',
    shortDescription: 'Controle de acesso baseado em funções: Nutricionistas, Médicos, Recepção e ADM.',
    whatItDoes: 'Gerencia os usuários do sistema com controle estrito de permissões (Role-Based Access Control): define quem pode visualizar dados clínicos, quem pode editar prescrições, quem tem acesso apenas à agenda e quem pode acessar o módulo financeiro.',
    purpose: 'Garantir a segurança dos dados sensíveis e o sigilo profissional médico-nutricional, impedindo acessos não autorizados por secretárias ou membros sem atribuição clínica.',
    howToUse: [
      'Cadastre novos membros da equipe informando nome, registro profissional (CRN/CRM) e função.',
      'Selecione o papel: Administrador, Nutricionista, Médico ou Recepção.',
      'Habilite ou desabilite permissões granulares (ex: Acesso a Prontuários, Emissão de Recibos, Exclusão de Registros).',
      'Alterne o perfil ativo para auditar a experiência de cada colaborador.'
    ],
    benefits: [
      'Blindagem jurídica contra vazamentos internos de dados de saúde.',
      'Segregação clara de responsabilidades entre área clínica e administrativa.',
      'Auditoria de ações por usuário.'
    ],
    practicalExample: 'A secretária da clínica acessa o sistema pelo seu perfil e consegue agendar consultas e confirmar horários, mas a visualização de fotos corporais, laudos e exames laboratoriais fica rigorosamente bloqueada com aviso de acesso restrito.',
    category: 'Gestão & Governança',
    badge: 'RBAC',
    targetTab: 'profissionais'
  },

  settings: {
    id: 'settings',
    title: 'Configurações de Sistema & Governança',
    shortDescription: 'Personalização do consultório, regras de governança, backup e dados institucionais.',
    whatItDoes: 'Permite configurar o nome e logo da clínica, dados fiscais para cabeçalhos de laudos, políticas de retenção de dados, bloqueio de exclusão acidental de pacientes e parâmetros regionais.',
    purpose: 'Garantir que todos os documentos gerados pelo software carreguem a identidade visual e as exigências sanitárias da instituição de saúde.',
    howToUse: [
      'Insira a razão social, CNPJ, telefone e endereço do consultório.',
      'Ative ou desative regras de governança (ex: "Permitir exclusão de prontuários por não-administradores").',
      'Personalize as mensagens padrão de envio por WhatsApp.',
      'Salve as configurações para aplicação global imediata.'
    ],
    benefits: [
      'Identidade corporativa consistente em todos os laudos, dietas e receitas emitidas.',
      'Prevenção de exclusão inadvertida de dados de saúde.',
      'Flexibilidade para clínicas individuais ou policlínicas multiprofissionais.'
    ],
    practicalExample: 'Ao atualizar o endereço da clínica nas Configurações, todos os novos atestados, declarações e receituários gerados passam a exibir o novo endereço no rodapé automaticamente.',
    category: 'Gestão & Governança',
    badge: 'Sistema',
    targetTab: 'settings'
  },

  // ==========================================
  // BOTÕES E CONTROLES DO CABEÇALHO (HEADER)
  // ==========================================
  btn_modo_consulta: {
    id: 'btn_modo_consulta',
    title: 'Modo Consulta (Foco Clínico)',
    shortDescription: 'Oculta menus laterais e elementos secundários para foco exclusivo no paciente.',
    whatItDoes: 'Recolhe a barra de navegação e expande a área útil de trabalho para 100% da tela, minimizando distrações visuais e maximizando a ergonomia durante o atendimento presencial ou teleconsulta.',
    purpose: 'Oferecer ao profissional um ambiente limpo e imersivo para tomada de decisão e digitação de dados sem ruídos visuais na tela.',
    howToUse: [
      'Clique no botão "Modo Consulta" ou "Modo Foco" no cabeçalho superior.',
      'A interface expandirá ocupando toda a largura da tela.',
      'Para reexibir a navegação completa, basta clicar no botão novamente.'
    ],
    benefits: [
      'Mais espaço para tabelas dietéticas longas e gráficos comparativos.',
      'Postura mais humanizada de atendimento sem a sensação de estar "navegando em softwares".',
      'Atalho ágil com 1 clique.'
    ],
    practicalExample: 'Ao compartilhar a tela com o paciente em uma teleconsulta, o nutricionista ativa o Modo Foco para que o paciente veja apenas a sua dieta e seus gráficos em tela cheia, sem menus administrativos à vista.',
    category: 'Controles do Sistema',
    badge: 'Ergonomia'
  },

  btn_privacidade_lgpd: {
    id: 'btn_privacidade_lgpd',
    title: 'Modo Privacidade (Conformidade LGPD)',
    shortDescription: 'Aplica desfoque (blur) sobre nomes e dados identificáveis em telas compartilhadas.',
    whatItDoes: 'Aplica um filtro de desfoque criptográfico sobre o nome do paciente, número de documento e foto em toda a interface, permitindo que a tela seja exibida ou demonstrada sem expor a identidade da pessoa.',
    purpose: 'Cumprir as exigências da Lei Geral de Proteção de Dados (LGPD) ao projetar telas em salas com outras pessoas, gravar videoaulas ou compartilhar estudos de caso clínicos.',
    howToUse: [
      'Clique no botão com o ícone de olho no cabeçalho.',
      'Imediatamente todos os nomes de pacientes na tela ficam borrados e ilegíveis.',
      'Os dados quantitativos (calorias, macros, percentuais) continuam visíveis para análise técnica.',
      'Clique novamente para restaurar a visualização dos nomes quando estiver em atendimento individual sigiloso.'
    ],
    benefits: [
      'Elimina o risco de processos e penalidades por vazamento visual de dados de saúde sensíveis.',
      'Permite gravar demonstrações e apresentar casos em congressos sem edição pós-produção.',
      'Segurança jurídica e postura ética exemplar perante o paciente.'
    ],
    practicalExample: 'O nutricionista precisa demonstrar a evolução de um paciente para um médico colega em uma reunião clínica. Ele ativa o Modo Privacidade: todos os dados corporais continuam legíveis, mas a identidade do paciente permanece 100% anônima.',
    category: 'Controles do Sistema',
    badge: 'LGPD'
  },

  btn_modo_tema: {
    id: 'btn_modo_tema',
    title: 'Alternador de Tema (Modo Escuro / Claro)',
    shortDescription: 'Alterna entre o modo diurno e noturno para reduzir a fadiga visual do profissional.',
    whatItDoes: 'Altera o esquema de cores de toda a aplicação entre o tema claro clínico e o tema escuro de alto contraste, preservando a legibilidade e a paleta sóbria do sistema.',
    purpose: 'Reduzir a fadiga ocular em jornadas longas de atendimento, especialmente em consultórios com iluminação suave ou plantões noturnos.',
    howToUse: [
      'Clique no botão de sol/lua no cabeçalho superior.',
      'A preferência é salva automaticamente no seu navegador para os próximos acessos.'
    ],
    benefits: [
      'Maior conforto visual em dias com muitas horas seguidas de atendimento em frente à tela.',
      'Economia de bateria em notebooks e dispositivos móveis OLED.',
      'Acessibilidade visual aprimorada.'
    ],
    practicalExample: 'No início da tarde com luz natural forte, o nutricionista utiliza o Modo Claro; ao final do expediente às 19:30, aciona o Modo Escuro para relaxar a visão sem perder o foco na elaboração de cardápios.',
    category: 'Controles do Sistema',
    badge: 'Visual'
  },

  btn_lembretes: {
    id: 'btn_lembretes',
    title: 'Central de Lembretes & Notificações',
    shortDescription: 'Alarmes e alertas programados de hidratação, horários de refeição e suplementos.',
    whatItDoes: 'Centraliza os lembretes do paciente ativo: alertas de ingestão de água, horários de shakes e refeições intermediárias, consultas futuras e notificações push do navegador.',
    purpose: 'Facilitar a monitorização de horários críticos prescritos para o paciente e verificar a prontidão dos alertas clínicos.',
    howToUse: [
      'Clique no sino de lembretes no cabeçalho superior.',
      'No modal, ative ou edite lembretes de hidratação e refeições.',
      'Teste o toque sonoro clínico ou acione uma notificação instantânea para o paciente.',
      'Autorize o recebimento de notificações Push do navegador para receber avisos mesmo com a aba em segundo plano.'
    ],
    benefits: [
      'Ajuda a fixar a rotina do paciente com reforço pontual.',
      'Avisos com sinal sonoro discreto e agradável.',
      'Controle integrado do consumo hídrico diário.'
    ],
    practicalExample: 'O nutricionista programa alertas a cada 2 horas para lembrar uma paciente idosa de ingerir 250ml de água, garantindo a meta de 2.000ml/dia recomendada para sua função renal.',
    category: 'Controles do Sistema',
    badge: 'Alertas'
  },

  btn_seletor_paciente: {
    id: 'btn_seletor_paciente',
    title: 'Seletor de Prontuário Ativo',
    shortDescription: 'Alterna instantaneamente o paciente em atendimento em todos os módulos da aplicação.',
    whatItDoes: 'Permite selecionar qual paciente está atualmente sob consulta. Ao trocar o paciente neste menu, todos os cálculos, gráficos, cardápios e prescrições de todas as telas são imediatamente sincronizados para os dados do novo paciente.',
    purpose: 'Evitar confusão entre prontuários de diferentes pessoas e proporcionar transição ágil entre um atendimento e outro.',
    howToUse: [
      'Clique sobre o nome do paciente no canto superior esquerdo do cabeçalho.',
      'Pesquise pelo nome ou número de prontuário na lista suspensa.',
      'Clique no paciente desejado para carregar o prontuário completo instantaneamente.'
    ],
    benefits: [
      'Troca de contexto instantânea sem precisar recarregar a página.',
      'Exibição imediata de idade, peso e IMC logo no cartão do seletor.',
      'Proteção contra misturas inadvertidas de dados clínicos.'
    ],
    practicalExample: 'Terminada a consulta do Carlos, o nutricionista clica no seletor, escolhe a Beatriz na lista e, em menos de 1 segundo, toda a tela já exibe a anamnese e os dados de bioimpedância dela.',
    category: 'Controles do Sistema',
    badge: 'Contexto'
  },

  btn_seletor_profissional: {
    id: 'btn_seletor_profissional',
    title: 'Perfil & Função Ativa (Simulador RBAC)',
    shortDescription: 'Mostra o usuário logado e permite simular permissões de outros papéis da clínica.',
    whatItDoes: 'Identifica o profissional de saúde responsável pela sessão ativa, exibindo seu nome, conselho regional (CRN/CRM) e nível de permissão (Nutricionista, Médico, Secretária ou Administrador).',
    purpose: 'Assegurar que cada laudo e prescrição saia carimbado com o nome do profissional correto e permitir testes de controle de acesso aos recursos restritos da clínica.',
    howToUse: [
      'Clique sobre o avatar do profissional no canto direito do cabeçalho.',
      'Visualize seus dados de conselho profissional e funções atribuídas.',
      'Selecione outro profissional da equipe para simular a visão dele no sistema ou clique em "Gerenciar Equipe" para editar permissões.'
    ],
    benefits: [
      'Rastreabilidade de quem assinou e gerou cada documento clínico.',
      'Segurança contra o exercício ilegal da profissão ou emissão incorreta de receitas.',
      'Auditoria interna de governança hospitalar e clínica.'
    ],
    practicalExample: 'Para conferir se a secretária não conseguirá ver dados sensíveis de exames, o administrador clica no seletor, escolhe a função "Recepção" e comprova que os módulos clínicos exibem a tela de acesso negado.',
    category: 'Controles do Sistema',
    badge: 'Governança'
  },

  btn_whatsapp: {
    id: 'btn_whatsapp',
    title: 'Compartilhamento Direto via WhatsApp',
    shortDescription: 'Gera e envia o resumo da consulta diretamente para o WhatsApp do paciente.',
    whatItDoes: 'Formata um texto elegante com as principais conclusões da consulta (meta calórica, gramas de proteína por quilo, meta de água em copos e principais conquistas de recomposição corporal) e abre uma conversa no WhatsApp.',
    purpose: 'Entregar ao paciente um resumo imediato e palatável no canal que ele mais utiliza, aumentando a motivação e a clareza sobre os próximos passos.',
    howToUse: [
      'Revise se a meta de calorias e macros da consulta foram definidas.',
      'Clique no botão "Enviar WhatsApp" no cabeçalho superior.',
      'O WhatsApp Web ou app móvel será aberto com a mensagem formatada e pronta para envio.',
      'Envie a mensagem diretamente ao número do paciente.'
    ],
    benefits: [
      'Fidelização imediata do paciente logo após a consulta.',
      'O paciente não sai do consultório com dúvidas sobre quanto deve comer ou beber.',
      'Economia de tempo de digitação de resumos manuais.'
    ],
    practicalExample: 'Ao se despedir do paciente, o nutricionista clica no botão; o paciente recebe no celular a mensagem: "Carlos, parabéns pela perda de 1,4% de gordura! Sua meta atual: 2.100 kcal, 140g proteína e 2,8 litros de água/dia."',
    category: 'Controles do Sistema',
    badge: 'Comunicação'
  },

  btn_laudo_completo: {
    id: 'btn_laudo_completo',
    title: 'Emissão de Laudo Clínico Completo',
    shortDescription: 'Gera o laudo pericial impresso ou em PDF com todos os dados antropométricos e dietéticos.',
    whatItDoes: 'Compila em um documento único de alta resolução todos os exames do paciente: Antropometria ISAK (7 dobras), Bioimpedância 4C, RCQ, Risco de Pescoço, Fotos T0/T1, Metas de Macronutrientes e Prescrições ativas.',
    purpose: 'Fornecer ao paciente e a médicos parceiros um dossiê clínico completo, assinado e carimbado para acompanhamento multidisciplinar.',
    howToUse: [
      'Clique em "Laudo Completo" no cabeçalho.',
      'Revise a pré-visualização paginada e selecione quais seções deseja incluir no laudo.',
      'Adicione pareceres clínicos ou observações de conduta personalizadas.',
      'Clique em "Imprimir" ou "Salvar em PDF" para disponibilizar o arquivo.'
    ],
    benefits: [
      'Apresentação gráfica de altíssimo padrão com selo de rigor científico.',
      'Facilita a interlocução com endocrinologistas, cardiologistas e ortopedistas.',
      'Valorização tangível do serviço prestado pelo nutricionista.'
    ],
    practicalExample: 'Para um paciente que fará cirurgia eletiva ou que precisa de liberação para treino de alta intensidade, o nutricionista emite o Laudo Completo consolidando composição corporal, RCQ e plano dietético estruturado.',
    category: 'Controles do Sistema',
    badge: 'Laudo Oficial'
  },

  btn_pwa_install: {
    id: 'btn_pwa_install',
    title: 'Instalar Aplicativo (PWA Nativo)',
    shortDescription: 'Instala o NUTRI PRO no computador, tablet ou celular para acesso rápido e offline.',
    whatItDoes: 'Transforma o software em um aplicativo instalado no sistema operacional (Windows, macOS, Android, iOS), permitindo abertura em janela própria sem barra de navegador e funcionamento mesmo sem conexão com a internet.',
    purpose: 'Garantir agilidade no acesso diário e permitir que o nutricionista consulte ou registre dados mesmo durante visitas domiciliares sem sinal de Wi-Fi.',
    howToUse: [
      'Clique no botão de instalação "Instalar App" no cabeçalho.',
      'Confirme a instalação no diálogo nativo do seu navegador.',
      'O ícone do NUTRI PRO será criado na sua área de trabalho e gaveta de aplicativos.',
      'Abra o app como qualquer outro software nativo.'
    ],
    benefits: [
      'Acesso com 1 clique diretamente da barra de tarefas.',
      'Mais velocidade e funcionamento contínuo com sincronização em segundo plano.',
      'Experiência nativa em tablets iPad e Android durante consultas.'
    ],
    practicalExample: 'Em uma consulta domiciliar na qual o Wi-Fi do cliente caiu, o nutricionista abre o app instalado, registra as dobras e a evolução normalmente; assim que recupera sinal, o app sincroniza tudo com o servidor em background.',
    category: 'Controles do Sistema',
    badge: 'PWA Offline'
  },

  // ==========================================
  // SUBMENUS & FUNCIONALIDADES ESPECÍFICAS
  // ==========================================
  anamnese: {
    id: 'anamnese',
    title: 'Anamnese Clínica & Hábitos Alimentares',
    shortDescription: 'Coleta aprofundada de histórico de saúde, rotina, preferências, aversões e patologias.',
    whatItDoes: 'Estrutura a entrevista clínica inicial investigando queixa principal, funcionamento intestinal (Escala de Bristol), histórico familiar, qualidade do sono, consumo hídrico, tabagismo e histórico de peso.',
    purpose: 'Compreender a raiz metabólica e comportamental das queixas do paciente, estabelecendo a base para o diagnóstico nutricional.',
    howToUse: [
      'Acesse o cadastro do paciente e preencha as seções de histórico patológico e estilo de vida.',
      'Identifique sintomas gastrointestinais, alergias alimentares e medicações em uso contínuo.',
      'Registre os horários habituais em que o paciente sente mais fome ou compulsão.',
      'Utilize os dados registrados para personalizar os intervalos das refeições no cardápio.'
    ],
    benefits: [
      'Entendimento holístico e integrativo do paciente.',
      'Evita prescrições que conflitem com a rotina de trabalho ou medicamentos.',
      'Conformidade com a legislação de custódia de dados de saúde sensíveis (LGPD).'
    ],
    practicalExample: 'Durante a anamnese, o paciente relata constipação crônica e distensão pós-prandial. O nutricionista investiga o consumo de água (apenas 800ml/dia) e uso prévio de antibióticos, direcionando a estratégia para modulação da microbiota intestinal e hidratação guiada.',
    category: 'Navegação Principal',
    badge: 'Clínica',
    targetTab: 'pacientes'
  },

  avaliacao_antropometrica: {
    id: 'avaliacao_antropometrica',
    title: 'Avaliação Antropométrica Integrada',
    shortDescription: 'Mensuração de peso, altura, circunferências corporais e densidade de dobras.',
    whatItDoes: 'Integra a aferição de estatura, peso corporal, circunferências (braço, cintura, abdômen, quadril, coxa e panturrilha) e dobras cutâneas no padrão ISAK II.',
    purpose: 'Mapear a distribuição de gordura e massa muscular por segmentos anatômicos, monitorando os efeitos da intervenção dietética.',
    howToUse: [
      'Posicione o paciente na postura padrão anatômica com peso distribuído uniformemente.',
      'Aferir as medidas com fita inelástica sem comprimir os tecidos moles.',
      'Lance os valores no formulário para cálculo de somatório de circunferências e dobras.',
      'Compare com as medições anteriores para observar a perda localizada de medidas.'
    ],
    benefits: [
      'Rigor científico e reprodutibilidade entre diferentes avaliadores.',
      'Comprovação de redução de medidas mesmo quando o peso na balança oscila pouco.',
      'Geração de dados quantitativos para o laudo nutricional.'
    ],
    practicalExample: 'Mesmo sem alteração no peso total (75 kg), a circunferência da cintura diminuiu 4 cm (de 88 cm para 84 cm), comprovando a redução da adiposidade visceral e melhora da sensibilidade à insulina.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'Antropometria',
    targetTab: 'dobras'
  },

  recordatorio_24h: {
    id: 'recordatorio_24h',
    title: 'Recordatório 24h & Diário de Consumo',
    shortDescription: 'Investigação minuciosa de todos os alimentos e bebidas consumidos nas últimas 24 horas.',
    whatItDoes: 'Registra hora a hora todas as preparações, porções, marcas e métodos de cocção consumidos pelo paciente em um dia habitual, calculando a ingestão calórica e de micronutrientes pré-consulta.',
    purpose: 'Quantificar a ingestão real e espontânea do paciente para identificar desequilíbrios calóricos, horários de carência de proteína e excessos de açúcares ou sódio.',
    howToUse: [
      'Peça para o paciente relatar o que consumiu desde o momento em que acordou até a hora de dormir no dia anterior.',
      'Estimule a lembrança de "beliscos", balas, café adoçado, óleos de preparo e líquidos.',
      'Lance as porções em gramas ou medidas caseiras.',
      'Analise o gráfico de calorias consumidas versus a meta calculada.'
    ],
    benefits: [
      'Diagnóstico fidedigno do padrão dietético basal do paciente.',
      'Identifica pontos críticos de fome emocional ou desorganização de horários.',
      'Permite criar uma dieta nova que respeite as preferências do paciente, facilitando a adesão.'
    ],
    practicalExample: 'O recordatório de um paciente revelou um consumo calórico noturno que correspondia a 55% de toda a sua energia diária, permitindo ao nutricionista remanejar carboidratos complexos para o lanche da tarde e mitigar a fome noturna.',
    category: 'Planejamento Dietético & Macros',
    badge: 'Consumo',
    targetTab: 'dietas'
  },

  planejamento_alimentar: {
    id: 'planejamento_alimentar',
    title: 'Planejamento Alimentar & Fracionamento',
    shortDescription: 'Estruturação do plano alimentar em refeições ao longo do dia com densidade nutricional.',
    whatItDoes: 'Organiza as metas energéticas em horários estratégicos (pré-treino, pós-treino, desjejum, ceia), fracionando calorias, proteínas, carboidratos e gorduras de forma equilibrada.',
    purpose: 'Garantir saciedade prolongada, otimizar a síntese proteica muscular e estabilizar a glicemia plasmática durante todo o dia.',
    howToUse: [
      'Defina o número de refeições do dia conforme a rotina do paciente (ex: 3 a 6 refeições).',
      'Associe o horário e o tipo de refeição com o horário de trabalho e treino físico.',
      'Distribua as porções de alimentos e verifique o somatório nutricional em tempo real.',
      'Cadastre opções de substituição equivalentes para cada grupo alimentar.'
    ],
    benefits: [
      'Adequação cronobiológica aos picos de gasto energético do paciente.',
      'Estímulo constante à síntese proteica (mínimo de 0,3g a 0,4g/kg de proteína por refeição).',
      'Flexibilidade com alimentos equivalentes, evitando a monotonia alimentar.'
    ],
    practicalExample: 'Para um profissional que treina às 06:30 da manhã, o planejamento inclui um pré-treino de rápida digestão (fruta + mel) e transfere a maior densidade de proteína e carboidratos para o café pós-treino às 08:00.',
    category: 'Planejamento Dietético & Macros',
    badge: 'Dietética',
    targetTab: 'dietas'
  },

  indice_glicemico: {
    id: 'indice_glicemico',
    title: 'Tabela de Índice Glicêmico (IG) & Carga Glicêmica (CG)',
    shortDescription: 'Consulta rápida da velocidade de resposta glicêmica e impacto real por porção dos alimentos.',
    whatItDoes: 'Apresenta valores de Índice Glicêmico (0–100) e Carga Glicêmica por porção com destaque cromático por faixas (Baixo, Moderado e Alto), além de simulador dinâmico de gramatura.',
    purpose: 'Apoiar o nutricionista no manejo de diabetes mellitus, resistência insulínica, SOP, obesidade e nutrição esportiva, diferenciando qualidade do carboidrato (IG) do impacto da porção consumida (CG).',
    howToUse: [
      'Pesquise o alimento ou filtre por grupo alimentar e faixa de IG/CG.',
      'Compare a barra visual de IG com o indicador de Carga Glicêmica (CG) da porção.',
      'Clique em qualquer alimento para simular a porção exata em gramas prescrita ao paciente.',
      'Adicione a porção calculada diretamente em uma refeição do plano alimentar.'
    ],
    benefits: [
      'Evita restrições desnecessárias de alimentos com IG alto mas CG baixa (como melancia e abóbora).',
      'Calcula automaticamente a Carga Glicêmica ajustada à gramatura individualizada.',
      'Visualização imediata por cores semânticas durante a consulta.'
    ],
    practicalExample: 'A melancia possui IG elevado (76), mas em uma fatia de 120g fornece apenas 8,5g de carboidratos, resultando em Carga Glicêmica baixa (6,5) — perfeitamente viável em planos para controle glicêmico.',
    category: 'Planejamento Dietético & Macros',
    badge: 'IG & CG',
    targetTab: 'dietas'
  },

  calculo_nutricional: {
    id: 'calculo_nutricional',
    title: 'Cálculo Nutricional & Macros (g/kg)',
    shortDescription: 'Cálculo algorítmico rigoroso de TMB, GET, balanço calórico e proporção de macros.',
    whatItDoes: 'Executa as equações de predição do gasto energético (Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, Cunningham) e calcula as necessidades de proteínas, lipídios e carboidratos tanto em gramas por quilo (g/kg) quanto em percentual sobre o valor calórico total (%VCT).',
    purpose: 'Fundamentar matematicamente a prescrição energética, assegurando déficit calórico controlado para emagrecimento ou superávit eficiente para hipertrofia.',
    howToUse: [
      'Insira peso, altura, idade e nível de atividade.',
      'Selecione a fórmula desejada conforme as características clínicas do paciente.',
      'Defina as metas em g/kg (ex.: 2,0 g/kg de proteína, 0,8 g/kg de gordura e o restante em carboidratos).',
      'Confira o cálculo automático de calorias e distribuição percentual.'
    ],
    benefits: [
      'Precisão matemática absoluta sem aproximações empíricas.',
      'Fórmulas clínicas puras e rastreáveis documentadas no código.',
      'Garante aporte proteico adequado para prevenção de catabolismo muscular.'
    ],
    practicalExample: 'Para um indivíduo de 80 kg em emagrecimento severo, o sistema calcula TMB = 1.740 kcal, GET = 2.436 kcal, e aplica déficit de 500 kcal (meta = 1.936 kcal), com 160g de proteína (2,0 g/kg), 56g de gordura (0,7 g/kg) e 198g de carboidratos.',
    category: 'Planejamento Dietético & Macros',
    badge: 'Bioenergética',
    targetTab: 'calculadora_macros'
  },

  prescricao_dietetica: {
    id: 'prescricao_dietetica',
    title: 'Prescrição Dietética Individualizada',
    shortDescription: 'Emissão oficial do plano alimentar com orientações, receitas e conduta clínica.',
    whatItDoes: 'Gera o documento final do plano alimentar entregue ao paciente, contendo cardápio detalhado, opções de substituição, orientações gerais de estilo de vida, lista de compras e metas da consulta.',
    purpose: 'Fornecer ao paciente um guia prático, claro e estimulante para ser seguido com facilidade no cotidiano.',
    howToUse: [
      'Revise todas as refeições montadas e as opções de substituição.',
      'Adicione orientações de mastigação, hidratação e horários de descanso.',
      'Exporte em PDF de alta resolução com layout premium e diagramação visual impecável.',
      'Envie diretamente para o WhatsApp ou e-mail do paciente com um toque.'
    ],
    benefits: [
      'Comunicação clara sem termos herméticos que confundem o paciente.',
      'Layout profissional com a logomarca e dados do nutricionista.',
      'Aumento expressivo na taxa de adesão ao plano nutricional.'
    ],
    practicalExample: 'O paciente recebe no seu celular um PDF colorido e organizado com cardápio, tabela de substitutos para viagem e lista de compras semanal organizada por corredores do supermercado.',
    category: 'Conduta Clínica & Prescrição',
    badge: 'Prescrição',
    targetTab: 'dietas'
  },

  suplementacao_clinica: {
    id: 'suplementacao_clinica',
    title: 'Suplementação Nutricional & Fitoterápicos',
    shortDescription: 'Prescrição magistral estruturada com posologia, veículos e limites legais da ANVISA.',
    whatItDoes: 'Permite formular estratégias de suplementação vitamínica, mineral, proteica e fitoterápica, validando doses seguras e especificando horários de tomada, veículos (cápsula, pó, gotas) e finalidades terapêuticas.',
    purpose: 'Corrigir deficiências bioquímicas celulares, potencializar a recuperação muscular, regular o sono e modular processos inflamatórios ou metabólicos.',
    howToUse: [
      'Selecione os princípios ativos necessários a partir do banco de dados.',
      'Ajuste concentrações e verifique alertas de dosagem para nutricionistas.',
      'Especifique a posologia (ex: "Ingerir 1 dose após o almoço junto com fonte de lipídios").',
      'Emita a receita com assinatura digital e código de autenticidade.'
    ],
    benefits: [
      'Total segurança farmacológica e proteção contra interações negativas.',
      'Diferenciação clara entre doses de Nutricionista vs. Profissional Médico.',
      'Facilidade de manipulação para as farmácias parceiras.'
    ],
    practicalExample: 'Prescrição de Vitamina D3 2.000 UI associada a Vitamina K2 (MK-7) 100 mcg e Zinco Quelato 15 mg em cápsula oleosa para otimização da imunidade e saúde osteometabólica de uma paciente com deficiência solar.',
    category: 'Conduta Clínica & Prescrição',
    badge: 'Suplementos',
    targetTab: 'prescricoes'
  },

  exames_laboratoriais: {
    id: 'exames_laboratoriais',
    title: 'Exames Laboratoriais & Painéis Clínicos',
    shortDescription: 'Solicitação e interpretação funcional de biomarcadores sanguíneos e metabólicos.',
    whatItDoes: 'Centraliza a solicitação de exames de sangue, fezes e urina organizados por painéis clínicos (Glicemia, Lipídios, Função Renal, Hepática, Tireoidiana e Vitaminas), emitindo a guia de requisição com justificativa clínica.',
    purpose: 'Subsidiar o diagnóstico nutricional com evidências laboratoriais e acompanhar o impacto biológico das intervenções dietoterápicas.',
    howToUse: [
      'Selecione o painel clínico adequado à suspeita diagnóstica do paciente.',
      'Adicione a justificativa fundamentada de acordo com as normas do CFN.',
      'Gere a guia com a identificação do paciente para apresentação ao laboratório ou convênio.',
      'Ao receber o laudo, lance os resultados para cruzamento de dados com a conduta nutricional.'
    ],
    benefits: [
      'Seleção ágil de pacotes laboratoriais completos em menos de 30 segundos.',
      'Redução de glosas ou recusas de planos de saúde graças à justificativa padronizada.',
      'Histórico evolutivo de biomarcadores para comprovação de melhora clínica.'
    ],
    practicalExample: 'O nutricionista solicita o painel metabólico completo para um paciente com obesidade e constata queda nos triglicerídeos de 240 mg/dL para 120 mg/dL após 90 dias de protocolo low-carb e restrição de açúcares simples.',
    category: 'Exames Laboratoriais',
    badge: 'Exames',
    targetTab: 'exames_suplementos'
  },

  evolucao_nutricional: {
    id: 'evolucao_nutricional',
    title: 'Evolução Nutricional & Linha do Tempo',
    shortDescription: 'Acompanhamento longitudinal de peso, gordura, massa magra e circunferências.',
    whatItDoes: 'Gera gráficos de dispersão e curvas de tendência que mostram a trajetória ponderal e a recomposição corporal ao longo de todos os atendimentos desde o início do acompanhamento.',
    purpose: 'Oferecer feedback visual e estatístico ao paciente sobre o progresso conquistado, prevenindo abandonos de tratamento em momentos de platô transitório.',
    howToUse: [
      'Acesse a tela para visualizar a linha do tempo completa do prontuário.',
      'Analise a velocidade média de evolução por quinzena ou mês.',
      'Correlacione eventos marcantes (ex: viagens, lesões, mudanças de dieta) com oscilações nos gráficos.',
      'Utilize as métricas para recalibrar as metas do próximo trimestre.'
    ],
    benefits: [
      'Poderosa ferramenta de retenção e fidelização de pacientes no consultório.',
      'Validação clínica da eficácia da conduta nutricional adotada.',
      'Exportação de relatórios comparativos para o paciente e médicos assistentes.'
    ],
    practicalExample: 'O paciente achava que "não estava evoluindo", mas a curva da Linha do Tempo provou que nos últimos 6 meses ele eliminou 8 kg de gordura e construiu 3,5 kg de músculo, transformando radicalmente sua composição corporal.',
    category: 'Avaliação Antropométrica & Composição',
    badge: 'Metas',
    targetTab: 'relatorio_evolutivo'
  },

  relatorios_clinicos: {
    id: 'relatorios_clinicos',
    title: 'Geração de Relatórios e Indicadores Clínicos',
    shortDescription: 'Emissão de laudos periciais, relatórios para convênio e atestados em PDF.',
    whatItDoes: 'Compila todos os dados coletados na consulta em documentos formatados para impressão ou exportação digital, com assinatura eletrônica e identidade visual do consultório.',
    purpose: 'Formalizar os resultados das avaliações para entrega ao paciente, a outros profissionais de saúde ou a órgãos públicos e convênios.',
    howToUse: [
      'Selecione o tipo de relatório desejado (Laudo Completo, Atestado de Comparecimento ou Relatório de Evolução).',
      'Selecione quais módulos devem compor o documento (Antropometria, Dieta, Exames, Fotos).',
      'Insira comentários clínicos ou orientações específicas.',
      'Clique em Imprimir ou salvar em PDF de alta qualidade.'
    ],
    benefits: [
      'Eliminação total de retrabalho manual em editores de texto externos.',
      'Padrão visual de excelência que valoriza a marca da clínica.',
      'Armazenamento seguro no histórico do prontuário eletrônico.'
    ],
    practicalExample: 'Emissão de relatório detalhado de aptidão e adequação nutricional para paciente candidato a cirurgia bariátrica, comprovando o cumprimento de 6 meses de preparo nutricional pré-operatório exigido pelo plano de saúde.',
    category: 'Conduta Clínica & Prescrição',
    badge: 'Laudos',
    targetTab: 'documentos'
  },

  background_sync_offline: {
    id: 'background_sync_offline',
    title: 'Sincronização Offline & Background Sync PWA',
    shortDescription: 'Filas inteligentes com replicação automática para o Firebase ao reconectar à internet.',
    whatItDoes: 'Garante o funcionamento ininterrupto do aplicativo mesmo em caso de perda total de sinal de internet no consultório ou em visitas domiciliares. As alterações em prontuários, dobras ISAK, dietas e configurações são gravadas transacionalmente no IndexedDB local e registradas na fila do Service Worker (W3C Background Sync API), sendo automaticamente replicadas para a nuvem Firebase Firestore assim que a conexão retornar.',
    purpose: 'Proteger o nutricionista contra a perda de dados clínicos durante consultas sem sinal de internet estável, garantindo sincronização sem atrito e rastreabilidade total.',
    howToUse: [
      'Continue atendendo normalmente mesmo se o aviso "Modo Offline" aparecer na tela.',
      'Cadastre pacientes, insira dobras e altere cardápios normalmente; os dados são armazenados com segurança no banco local.',
      'Assim que a internet for restabelecida, o Service Worker processa automaticamente as filas por prioridade.',
      'Abra a Central de Filas no canto inferior direito para visualizar os recibos de replicação com carimbo de data/hora.'
    ],
    benefits: [
      'Segurança absoluta contra perda de dados clínicos no meio do atendimento.',
      'Filas priorizadas (Prontuários > Avaliações Antropométricas > Dietas > Firebase Cloud Sync).',
      'Compatível com a W3C Background Sync API em navegadores modernos e fallback automático com backoff exponencial.',
      'Conformidade com a LGPD através de registros de auditoria e recibos com carimbo de data/hora.'
    ],
    practicalExample: 'Durante um atendimento em uma clínica em subsolo sem sinal 4G/Wi-Fi, o nutricionista registra 7 dobras cutâneas e cria um plano alimentar completo. Ao sair para o almoço e o smartphone reconectar ao 4G, o Service Worker em segundo plano replica tudo para o Firebase Firestore sem nenhuma intervenção manual.',
    category: 'Controles do Sistema',
    badge: 'PWA Sync',
    targetTab: 'dashboard'
  }
};

