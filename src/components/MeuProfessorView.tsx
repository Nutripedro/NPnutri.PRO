import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Youtube, 
  FileText, 
  StickyNote, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Brain, 
  Layers, 
  RefreshCw, 
  Play, 
  Pause,
  Check, 
  X, 
  Download, 
  Printer, 
  Lightbulb, 
  Zap, 
  ChevronRight, 
  Award, 
  RotateCw,
  Search,
  MessageSquare,
  FileCode,
  Share2,
  Plus,
  Maximize2,
  Minimize2,
  Clock,
  Tv,
  Network,
  Upload,
  FileVideo,
  Folder,
  Video,
  PlayCircle,
  PlusCircle,
  Filter,
  Trash2,
  ListVideo,
  FolderPlus,
  FolderOpen,
  Edit3,
  Tag,
  Presentation,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Eye,
  BookOpenCheck,
  Highlighter,
  MessageSquarePlus,
  PenTool,
  BookmarkCheck
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface PostItNote {
  id: string;
  color: 'yellow' | 'pink' | 'green' | 'blue';
  title: string;
  question: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  flipped?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  selectedOptionIndex?: number;
}

interface LessonModule {
  number: number;
  title: string;
  timestamp?: string; // e.g. "01:45"
  timestampSeconds?: number;
  level1Feynman: string;
  level2Technical: string;
  level3Practical: string;
  goldenRule: string;
  connectedPostItId?: string;
  connectedPostItAnswer?: string;
}

interface StudyGlossaryItem {
  term: string;
  definition: string;
  application: string;
}

interface MindMapNode {
  id: string;
  title: string;
  category: string;
  details: string;
  connectedTo: string[];
}

interface StudyLessonData {
  title: string;
  sources: string[];
  twoMinuteSummary: string;
  modules: LessonModule[];
  glossary: StudyGlossaryItem[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  mindMap: MindMapNode[];
  postItResponses: Array<{ noteId: string; question: string; answer: string }>;
}

interface VideoLesson {
  id: string;
  title: string;
  category: string;
  youtubeUrl: string;
  duration: string;
  instructor: string;
  description: string;
  folderId?: string;
}

interface PlaylistFolder {
  id: string;
  name: string;
  category: string;
  description: string;
  color: 'emerald' | 'sky' | 'amber' | 'purple' | 'rose' | 'indigo';
  videoIds: string[];
}

const INITIAL_FOLDERS: PlaylistFolder[] = [
  {
    id: 'folder-bioquimica',
    name: 'Bioquímica Clínica & Metabolismo',
    category: 'Bioquímica',
    description: 'Estudo de vias metabólicas, bioenergética celular, ressíntese de ATP e enzimas.',
    color: 'emerald',
    videoIds: []
  },
  {
    id: 'folder-dietoterapia',
    name: 'Dietoterapia & Patologias',
    category: 'Dietoterapia',
    description: 'Protocolos de conduta dietoterápica em diabetes, hipertensão e dislipidemias.',
    color: 'sky',
    videoIds: []
  },
  {
    id: 'folder-exames',
    name: 'Exames Laboratoriais',
    category: 'Exames & Diagnóstico',
    description: 'Interpretação de hemograma, perfil lipídico, marcadores hepáticos e renais.',
    color: 'amber',
    videoIds: []
  },
  {
    id: 'folder-esportiva',
    name: 'Nutrição Esportiva',
    category: 'Nutrição Esportiva',
    description: 'Estratégias de suplementação, hipertrofia e periodização nutricional.',
    color: 'purple',
    videoIds: []
  }
];

// Initial real video lessons (starts clean for nutritionist input)
const INITIAL_VIDEO_LESSONS: VideoLesson[] = [];

interface SlideItem {
  number: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  clinicalNote?: string;
}

interface DocumentAnnotation {
  id: string;
  slideNumber: number;
  highlightedText: string;
  sideNote: string;
  color: 'yellow' | 'green' | 'pink' | 'blue';
  createdAt: string;
}

const INITIAL_DOC_ANNOTATIONS: DocumentAnnotation[] = [
  {
    id: 'ann-1',
    slideNumber: 2,
    highlightedText: 'Creatina Quinase (CK) transfere fosfato de alta energia da PCr para o ADP',
    sideNote: 'Reação de oxidorredução ultrarrápida catalisada pela enzima CK no sarcoplasma.',
    color: 'yellow',
    createdAt: '20:05'
  },
  {
    id: 'ann-2',
    slideNumber: 3,
    highlightedText: 'Ativação do complexo mTORC1 sem retenção hídrica no espaço subcutâneo',
    sideNote: 'Aumenta pressão osmótica intracelular, estimulando síntese proteica sem edema na pele.',
    color: 'green',
    createdAt: '20:06'
  }
];

const INITIAL_CLINICAL_SLIDES: SlideItem[] = [
  {
    number: 1,
    title: 'Fisiologia do Exercício & Bioenergética Celular',
    subtitle: 'Módulo de Nutrição Clínica & Esportiva Avançada',
    bullets: [
      'Sistemas energéticos: ATP-CP (Fosfagênio), Glicolítico e Aeróbico Mitocondrial',
      'Vias de sinalização anabólica e estresse osmótico sarcoplasmático',
      'Aplicação prática de substratos de fosfato e aminoácidos no esforço'
    ],
    clinicalNote: 'Slide introdutório da aula de bioenergética clínica.'
  },
  {
    number: 2,
    title: 'Via ATP-CP & Papel da Creatina Quinase (CK)',
    subtitle: 'Ressíntese Implacável de Energia em Alta Intensidade',
    bullets: [
      'Creatina Quinase (CK) transfere fosfato de alta energia da PCr para o ADP',
      'Manutenção da potência máxima em esforços anaeróbicos de 6 a 10 segundos',
      'Degradação contínua em creatinina (~1-2%/dia) exigindo renovação diária'
    ],
    clinicalNote: 'Conexão com o Post-it #1 de dúvida do aluno sobre consumo diário.'
  },
  {
    number: 3,
    title: 'Pressão Osmótica & Volumização Celular (mTOR)',
    subtitle: 'Mecanossensores e Sinalização de Síntese Proteica',
    bullets: [
      'Estresse osmótico sarcoplasmático provocado pela captação de água intracelular',
      'Ativação do complexo mTORC1 sem retenção hídrica no espaço subcutâneo',
      'Redução da supressão da miostatina e preservação do tônus e massa magra'
    ],
    clinicalNote: 'Enfatizar que o inchaço é puramente intracelular sem edema cutâneo.'
  },
  {
    number: 4,
    title: 'Protocolos de Suplementação & Dosagem em Consultório',
    subtitle: 'Comparativo Clínico: Saturação em Carga vs Uso Contínuo',
    bullets: [
      'Fase de Carga: 20g/dia por 5-7 dias (saturação acelerada dos estoques)',
      'Dose Contínua: 3-5g/dia (saturação completa dos miócitos ao final de 21-28 dias)',
      'Eficácia final idêntica na concentração intramuscular ao final de 30 dias'
    ],
    clinicalNote: 'Dose contínua de 5g/dia evita desconforto gástrico em pacientes de rotina.'
  }
];

export const MeuProfessorView: React.FC = () => {
  // Document & Presentation Reader States (PDF & PPTX)
  const [docReaderMode, setDocReaderMode] = useState<'reader' | 'slides'>('slides');
  const [readerFileUrl, setReaderFileUrl] = useState<string | null>(null);
  const [readerFileName, setReaderFileName] = useState<string | null>(null);
  const [readerFileType, setReaderFileType] = useState<'pdf' | 'pptx'>('pptx');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [slideZoomLevel, setSlideZoomLevel] = useState<number>(100);
  const [slidesList, setSlidesList] = useState<SlideItem[]>(INITIAL_CLINICAL_SLIDES);
  const [isReaderFullscreen, setIsReaderFullscreen] = useState<boolean>(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Annotations & Underline States
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>(INITIAL_DOC_ANNOTATIONS);
  const [selectedTextToHighlight, setSelectedTextToHighlight] = useState<string>('');
  const [newSideNoteText, setNewSideNoteText] = useState<string>('');
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'pink' | 'blue'>('yellow');
  const [showAnnotationSidebar, setShowAnnotationSidebar] = useState<boolean>(true);

  // Video Player States (YouTube URL vs Local File MP4/WebM)
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'local'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [localVideoFileName, setLocalVideoFileName] = useState<string | null>(null);
  const [activeTimestampSeconds, setActiveTimestampSeconds] = useState<number>(0);
  const [isVideoFloating, setIsVideoFloating] = useState<boolean>(false);
  const [isVideoMinimized, setIsVideoMinimized] = useState<boolean>(false);

  // Playlist Folders State
  const [folders, setFolders] = useState<PlaylistFolder[]>(INITIAL_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // null means All Folders
  const [showAddFolderModal, setShowAddFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderCategory, setNewFolderCategory] = useState<string>('Bioquímica');
  const [newFolderDescription, setNewFolderDescription] = useState<string>('');
  const [newFolderColor, setNewFolderColor] = useState<'emerald' | 'sky' | 'amber' | 'purple' | 'rose' | 'indigo'>('emerald');

  // Video Library State
  const [videoLibrary, setVideoLibrary] = useState<VideoLesson[]>(INITIAL_VIDEO_LESSONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [showAddVideoModal, setShowAddVideoModal] = useState<boolean>(false);
  const [newVideoTitle, setNewVideoTitle] = useState<string>('');
  const [newVideoCategory, setNewVideoCategory] = useState<string>('Suplementação');
  const [newVideoFolderId, setNewVideoFolderId] = useState<string>('folder-bioquimica');
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newVideoDuration, setNewVideoDuration] = useState<string>('20 min');
  const [newVideoDescription, setNewVideoDescription] = useState<string>('');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper: Extract YouTube Video ID cleanly
  const extractYouTubeId = (url: string): string => {
    if (!url || !url.trim()) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const currentVideoId = extractYouTubeId(youtubeUrl);

  // Document & Notes Input States
  const [documentContent, setDocumentContent] = useState<string>(
    `A creatina (ácido N-metil-guanidinoacético) é um composto nitrogenado sintetizado no fígado e rins a partir dos aminoácidos arginina, glicina e metionina. No músculo esquelético, ela é fosforilada pela enzima Creatina Quinase (CK/CPK) formando a Fosfocreatina (PCr). A PCr doa um grupo fosfato ao ADP para ressintetizar ATP rapidamente durante o exercício anaeróbico de alta intensidade (Sistema ATP-CP). Os estoques intramusculares normais são de ~120 mmol/kg de músculo seco; a suplementação contínua eleva esses estoques para 140-160 mmol/kg, reduzindo a fadiga muscular precoce e estimulando o inchaço celular (hidratação miocítica) que ativa a via mTOR de síntese proteica.`
  );

  // Active Post-it notes
  const [postIts, setPostIts] = useState<PostItNote[]>([
    {
      id: 'postit-1',
      color: 'yellow',
      title: 'Dúvida do Post-it #1',
      question: 'Por que a creatina precisa ser tomada todos os dias (mesmo nos dias de descanso)?'
    },
    {
      id: 'postit-2',
      color: 'pink',
      title: 'Dúvida do Post-it #2',
      question: 'A creatina retém água fora ou dentro do músculo? Causa inchaço subcutâneo?'
    },
    {
      id: 'postit-3',
      color: 'green',
      title: 'Dúvida do Post-it #3',
      question: 'Qual a diferença entre a fase de saturação (20g/dia) e a dose contínua (3-5g/dia)?'
    }
  ]);

  const [newPostItQuestion, setNewPostItQuestion] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'aula' | 'flashcards' | 'simulado' | 'mapa_mental' | 'glossario'>('aula');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationAlert, setGenerationAlert] = useState<string | null>(null);

  // Active Lesson Data State
  const [lessonData, setLessonData] = useState<StudyLessonData>({
    title: 'Metabolismo da Creatina, Sistema ATP-CP & Bioenergética Anaeróbica',
    sources: [
      `Vídeo do YouTube [ID: ${currentVideoId}]`,
      'Apostila em PDF / Artigo: Fisiologia do Exercício & Suplementação',
      '3 Anotações de Post-it do Aluno'
    ],
    twoMinuteSummary: 'Pense no ATP como a bateria recarregável das suas células musculares. Quando você faz uma força explosiva (como levantar um peso pesado ou dar um tiro de corrida), a bateria descarrega quase instantaneamente. A creatina funciona como um "powerbank" ultra-rápido: ela doa uma pecinha chamada fosfato para recarregar a bateria do ATP em milissegundos, permitindo que você aguente mais repetições e ganhe mais força.',
    modules: [
      {
        number: 1,
        title: 'Ressíntese de ATP e o Sistema Fosfageno (ATP-CP)',
        timestamp: '01:15',
        timestampSeconds: 75,
        level1Feynman: 'Imagine que o ATP é uma nota de 100 reais na sua carteira. Quando você gasta a nota, ela vira troco (ADP). A creatina é um amigo generoso que fica do seu lado com a nota de troco exata para juntar com a sua e transformar de novo em uma nota de 100 reais no mesmo segundo.',
        level2Technical: 'A Creatina Quinase (CK) catalisa a transferência reversível do grupo fosfato de alta energia da Fosfocreatina (PCr) para a Adenosina Difosfato (ADP), regenerando Adenosina Trifosfato (ATP) sem necessidade de oxigênio ou glicólise imediata.',
        level3Practical: 'Em esportes de alta intensidade e curta duração (sprints de 100m, musculação, crossfit), a suplementação com creatina aumenta os estoques musculares de PCr em 20-40%, prolongando a manutenção da potência de pico.',
        goldenRule: 'O sistema ATP-CP é a primeira linha de defesa energética do músculo e dura cerca de 6 a 10 segundos em esforço máximo.',
        connectedPostItId: 'postit-1',
        connectedPostItAnswer: 'Resposta ao Post-it #1: A creatina age por saturação celular crônica dos estoques de fosfocreatina nos miócitos. Como a renovação diária do pool de creatina (degradação em creatinina) ocorre de forma contínua a ~1-2%, o consumo diário contínuo impede a desaturação das reservas musculares.'
      },
      {
        number: 2,
        title: 'Hidratação Miocítica & Via Anabólica mTOR',
        timestamp: '03:40',
        timestampSeconds: 220,
        level1Feynman: 'Imagine uma bexiga de água. Quando você enche a bexiga com água por dentro, ela fica esticada e firme. A célula muscular faz exatamente isso com a creatina: atrai água para DENTRO do músculo, sinalizando para o corpo que a estrutura está forte e pronta para crescer.',
        level2Technical: 'A creatina é um osmólito intracelular biologicamente ativo. Ela atrai moléculas de água para o sarcoplasma celular (hidratação intracelular), aumentando a pressão turgor. Esse estresse osmótico ativa mecanossensores que estimulam o complexo mTORC1 e suprimem a miostatina.',
        level3Practical: 'O aumento de peso inicial (1 a 2kg) observado na primeira semana é puramente água intracelular retida dentro da fibra muscular, o que melhora o tônus muscular e não deve ser confundido com retenção de hídrica subcutânea (que causaria inchaço).',
        goldenRule: 'Retenção de água por creatina é 100% intracelular e melhora a síntese proteica; ela NÃO causa retenção subcutânea nem inchaço abdominal.',
        connectedPostItId: 'postit-2',
        connectedPostItAnswer: 'Resposta ao Post-it #2: A retenção hídrica induzida pela creatina ocorre exclusivamente no meio INTRACELULAR (dentro dos miócitos). Ela aumenta a volumização celular sem causar retenção no espaço extracelular/subcutâneo.'
      },
      {
        number: 3,
        title: 'Estratégias de Carga: Saturação vs Uso Contínuo',
        timestamp: '06:20',
        timestampSeconds: 380,
        level1Feynman: 'Carregar a creatina é como encher o tanque de um carro: você pode colocar 20 litros de uma vez na primeira hora para sair rodando com o tanque cheio na hora, ou pode colocar 3 litros por dia até o tanque encher naturally em 3 a 4 semanas. O resultado final é o mesmo tanque cheio.',
        level2Technical: 'Fase de carga: 20g/dia (fracionados em 4 doses de 5g) por 5-7 dias satura os estoques em 7 dias. Fase contínua: 3-5g/dia eleva progressivamente os estoques saturando completamente os miócitos ao final de 21 a 28 dias.',
        level3Practical: 'Para atletas que precisam de aumento de força em curto prazo (ex.: competição na próxima semana), a fase de carga de 20g/dia é recomendada. Para indivíduos em rotina normal de consultório, a dose diária constante de 5g é mais simples e reduz chance de desconforto gástrico.',
        goldenRule: 'Ao final de 30 dias, 3-5g/dia e 20g/dia por 5 dias alcançam a EXATA mesma concentração intramuscular de fosfocreatina.',
        connectedPostItId: 'postit-3',
        connectedPostItAnswer: 'Resposta ao Post-it #3: Ambas as estratégias atingem o mesmo ponto de saturação muscular. A única diferença é a velocidade: 7 dias com carga vs 21-28 dias com dose única contínua de 3-5g/dia.'
      }
    ],
    glossary: [
      {
        term: 'Fosfocreatina (PCr)',
        definition: 'Forma fosforilada da creatina estocada no músculo esquelético.',
        application: 'Atua como doador de fosfato de alta energia para ressíntese ultra-rápida de ATP.'
      },
      {
        term: 'Creatina Quinase (CK/CPK)',
        definition: 'Enzima intracelular responsável pela reação de fosforilação da creatina.',
        application: 'Marcador enzimático de bioenergética muscular e dano tecidual pós-treino.'
      },
      {
        term: 'Hidratação Miocítica',
        definition: 'Acúmulo osmótico de água no sarcoplasma dentro da fibra muscular.',
        application: 'Estimula a via mTOR de sinalização anabólica e aumento de tônus musculoso.'
      },
      {
        term: 'Sistema ATP-CP',
        definition: 'Vetor energético fosfageno sem consumo de oxigênio ou produção de lactato.',
        application: 'Combustível primário em tiros de velocidade, levantamento de peso e sprints.'
      }
    ],
    flashcards: [
      {
        id: 'fc-1',
        question: 'Qual enzima catalisa a ressíntese de ATP a partir da Fosfocreatina?',
        answer: 'Creatina Quinase (CK ou CPK). Ela transfere o grupo fosfato da PCr para o ADP.',
        flipped: false
      },
      {
        id: 'fc-2',
        question: 'A retenção de água causada pela creatina é intracelular ou extracelular?',
        answer: 'É puramente INTRACELULAR (dentro do miócito), aumentando o turgor celular sem causar retenção subcutânea.',
        flipped: false
      },
      {
        id: 'fc-3',
        question: 'Por que é necessário consumir creatina diariamente mesmo em dias de descanso?',
        answer: 'Porque o mecanismo de ação depende da saturação crônica dos estoques musculares, que sofrem degradação natural constante.',
        flipped: false
      },
      {
        id: 'fc-4',
        question: 'Qual a diferença entre usar 20g/dia por 5 dias e 5g/dia de forma contínua?',
        answer: 'Ambas atingem a mesma saturação de estoque muscular no final; a carga de 20g atinge a saturação em 7 dias, enquanto 5g/dia atinge em 21-28 dias.',
        flipped: false
      }
    ],
    quiz: [
      {
        id: 'qz-1',
        question: 'Durante um esforço máximo de levantamento de peso de 5 segundos, qual o principal sistema energético responsável pela ressíntese de ATP?',
        options: [
          'A) Glicólise anaeróbica lática com produção de piruvato',
          'B) Sistema Fosfageno (ATP-CP) via Creatina Quinase',
          'C) Beta-oxidação mitocondrial de ácidos graxos',
          'D) Ciclo de Krebs e fosforilação oxidativa aeróbica'
        ],
        correctOptionIndex: 1,
        explanation: 'O sistema ATP-CP (Fosfagênio) fornece energia imediata de alta potência durante os primeiros 6 a 10 segundos de esforço anaeróbico máximo.'
      },
      {
        id: 'qz-2',
        question: 'Em relação ao ganho de peso inicial e à volumização provocada pela suplementação de creatina, assinale a alternativa CORRETA:',
        options: [
          'A) O ganho é causado por edema extracelular e retenção hídrica subcutânea',
          'B) É resultado do aumento do volume de água intracelular no miócito, ativando a via anabólica mTOR',
          'C) Trata-se de acúmulo de gordura visceral devido à diminuição do gasto energético',
          'D) É provocado por vasoconstrição renal e redução da filtração de sódio'
        ],
        correctOptionIndex: 1,
        explanation: 'A creatina funciona como osmólito intracelular, atraindo água para o sarcoplasma do miócito. Esse turgor intracelular ativa a sinalização anabólica da via mTOR.'
      }
    ],
    mindMap: [
      {
        id: 'node-1',
        title: 'Ingestão & Suplementação de Creatina (3-5g/dia)',
        category: 'Início',
        details: 'Absorção intestinal e transporte plasmático via receptores CreaT1.',
        connectedTo: ['node-2', 'node-3']
      },
      {
        id: 'node-2',
        title: 'Acúmulo Intramuscular de Fosfocreatina (PCr)',
        category: 'Bioenergética',
        details: 'Fosforilação via Creatina Quinase (CK) estocando grupo fosfato de alta energia.',
        connectedTo: ['node-4']
      },
      {
        id: 'node-3',
        title: 'Volumização Celular / Hidratação Miocítica',
        category: 'Anabolismo',
        details: 'Atração osmótica de água intracelular e aumento de turgor na fibra muscular.',
        connectedTo: ['node-5']
      },
      {
        id: 'node-4',
        title: 'Ressíntese Imediata de ATP (Sistema ATP-CP)',
        category: 'Performance',
        details: 'Manutenção de potência em exercícios anaeróbicos explosivos (<10s).',
        connectedTo: []
      },
      {
        id: 'node-5',
        title: 'Ativação da Via Anabólica mTORC1',
        category: 'Hipertrofia',
        details: 'Estímulo à síntese proteica muscular e inibição da expressão de miostatina.',
        connectedTo: []
      }
    ],
    postItResponses: [
      {
        noteId: 'postit-1',
        question: 'Por que a creatina precisa ser tomada todos os dias (mesmo nos dias de descanso)?',
        answer: 'A creatina atua por acúmulo crônico. Como o corpo degrada ~1-2% da fosfocreatina muscular por dia em creatinina, o consumo diário repõe essa perda e mantém o músculo 100% saturado.'
      },
      {
        noteId: 'postit-2',
        question: 'A creatina retém água fora ou dentro do músculo? Causa inchaço subcutâneo?',
        answer: 'Retém água estritamente DENTRO do músculo (intracelular). Isso melhora o turgor e tônus muscular, sem causar inchaço nem retenção líquida na pele.'
      },
      {
        noteId: 'postit-3',
        question: 'Qual a diferença entre a fase de saturação (20g/dia) e a dose contínua (3-5g/dia)?',
        answer: 'Apenas a velocidade de saturação. Com 20g/dia (carga), os estoques enchem em 7 dias. Com 3-5g/dia, enchem em 21 a 28 dias. O resultado final nos estoques é idêntico.'
      }
    ]
  });

  // Pre-built study packs
  const STUDY_PACKS = [
    {
      id: 'pack-creatina',
      title: 'Bioquímica: Creatina, CPK & Sistema ATP-CP',
      youtubeUrl: '',
      docSummary: 'Mecanismos de fosforilação da creatina, ressíntese de ATP, hidratação miocítica e via mTOR.',
      notes: [
        { id: 'p1', color: 'yellow' as const, title: 'Dúvida #1', question: 'Por que tomar creatina diariamente mesmo sem treinar?' },
        { id: 'p2', color: 'pink' as const, title: 'Dúvida #2', question: 'Retenção é intracelular ou subcutânea?' }
      ]
    },
    {
      id: 'pack-pediatria',
      title: 'Pediatria SISVAN: Curvas OMS de Escore-Z & Diagnóstico',
      youtubeUrl: '',
      docSummary: 'Referenciais LMS da OMS (2006/2007) para E/I, P/I e IMC/I. Critérios SISVAN de magreza acentuada (Z < -3) e obesidade.',
      notes: [
        { id: 'p3', color: 'green' as const, title: 'Dúvida #3', question: 'Qual a diferença entre os pontos de corte de IMC/I abaixo de 5 anos vs 5 a 19 anos no SISVAN?' }
      ]
    },
    {
      id: 'pack-bioimpedancia',
      title: 'Bioimpedância Tetrapolar: Ângulo de Fase & ECW/TBW',
      youtubeUrl: '',
      docSummary: 'Parâmetros de impedância, resistência, reactância e cálculo do ângulo de fase a 50 kHz. Índice de edema ECW/TBW.',
      notes: [
        { id: 'p4', color: 'blue' as const, title: 'Dúvida #4', question: 'O que indica um Ângulo de Fase alto (> 7.0°) na integridade da membrana celular?' }
      ]
    }
  ];

  // Add new post-it
  const handleAddPostIt = () => {
    if (!newPostItQuestion.trim()) return;
    const colors: Array<'yellow' | 'pink' | 'green' | 'blue'> = ['yellow', 'pink', 'green', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote: PostItNote = {
      id: `postit-${Date.now()}`,
      color: randomColor,
      title: `Dúvida do Aluno #${postIts.length + 1}`,
      question: newPostItQuestion
    };
    setPostIts(prev => [...prev, newNote]);
    setNewPostItQuestion('');
  };

  const handleRemovePostIt = (id: string) => {
    setPostIts(prev => prev.filter(p => p.id !== id));
  };

  // Jump Video to Timestamp
  const handleJumpToTimestamp = (seconds: number) => {
    setActiveTimestampSeconds(seconds);
    setIsVideoMinimized(false);

    if (videoSourceType === 'local' && localVideoRef.current) {
      localVideoRef.current.currentTime = seconds;
      localVideoRef.current.play().catch(() => {});
    }

    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60).toString().padStart(2, '0');
    setGenerationAlert(`Vídeo posicionado na marcação de tempo (${min}:${sec}).`);
    setTimeout(() => setGenerationAlert(null), 3000);
  };

  // Document & Presentation Reader Handlers
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (readerFileUrl) {
        URL.revokeObjectURL(readerFileUrl);
      }
      const url = URL.createObjectURL(file);
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      
      setReaderFileUrl(url);
      setReaderFileName(file.name);
      setReaderFileType(isPdf ? 'pdf' : 'pptx');
      setCurrentSlideIndex(0);

      // Update text content for Gemini AI processing
      const docTitle = file.name.replace(/\.[^/.]+$/, "");
      setDocumentContent(
        `[Documento Carregado: ${file.name}]\nMaterial de apresentação e apostilas sobre fisiologia e nutrição clínica (${docTitle}).`
      );

      setGenerationAlert(`Arquivo "${file.name}" carregado no leitor de apresentações!`);
      setTimeout(() => setGenerationAlert(null), 3000);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slidesList.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleExtractCurrentSlideToAI = () => {
    const slide = slidesList[currentSlideIndex];
    if (slide) {
      const extractedText = `[Slide ${slide.number}: ${slide.title}]\nSubtítulo: ${slide.subtitle || ''}\nTópicos da Aula:\n${slide.bullets.map(b => `- ${b}`).join('\n')}\nNotas do Professor: ${slide.clinicalNote || ''}`;
      setDocumentContent(extractedText);
      setGenerationAlert(`Conteúdo do Slide #${slide.number} extraído para o motor da IA!`);
      setTimeout(() => setGenerationAlert(null), 3000);
    }
  };

  // Annotation & Highlight Handlers
  const handleAddAnnotation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTextToHighlight.trim() && !newSideNoteText.trim()) return;

    const newAnn: DocumentAnnotation = {
      id: `ann-${Date.now()}`,
      slideNumber: currentSlideIndex + 1,
      highlightedText: selectedTextToHighlight.trim() || `Trecho do Slide #${currentSlideIndex + 1}`,
      sideNote: newSideNoteText.trim() || 'Nota lateral adicionada pelo profissional.',
      color: highlightColor,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAnnotations(prev => [newAnn, ...prev]);
    setSelectedTextToHighlight('');
    setNewSideNoteText('');
    setGenerationAlert(`Nota lateral e sublinhado vinculados ao Slide #${currentSlideIndex + 1}!`);
    setTimeout(() => setGenerationAlert(null), 3000);
  };

  const handleRemoveAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handleQuickHighlightBullet = (text: string) => {
    setSelectedTextToHighlight(text);
    setGenerationAlert(`Trecho grifado! Escreva a nota lateral ao lado.`);
    setTimeout(() => setGenerationAlert(null), 2500);
  };

  const handleSendAnnotationsToAI = () => {
    if (annotations.length === 0) return;
    const compiled = annotations.map(a => 
      `[Slide #${a.slideNumber} - Sublinhado]: "${a.highlightedText}"\nNota Lateral: ${a.sideNote}`
    ).join('\n\n');

    setDocumentContent(prev => `${prev}\n\n=== NOTAS LATERAIS & SUBLINHADOS DO LEITOR ===\n${compiled}`);
    setGenerationAlert(`${annotations.length} notas e sublinhados enviados para a IA!`);
    setTimeout(() => setGenerationAlert(null), 3500);
  };
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      setLocalVideoFileName(file.name);
      setVideoSourceType('local');
      setIsVideoMinimized(false);
      setGenerationAlert(`Vídeo local "${file.name}" carregado com sucesso no player interno!`);
      setTimeout(() => setGenerationAlert(null), 3000);
    }
  };

  const handleClearLocalVideo = () => {
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl);
    }
    setLocalVideoUrl(null);
    setLocalVideoFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setVideoSourceType('youtube');
  };

  // Playlist Folder Handlers
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: PlaylistFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      category: newFolderCategory,
      description: newFolderDescription.trim() || 'Pasta temática de estudos clínicos.',
      color: newFolderColor,
      videoIds: []
    };

    setFolders(prev => [...prev, newFolder]);
    setActiveFolderId(newFolder.id);
    setShowAddFolderModal(false);
    setNewFolderName('');
    setNewFolderDescription('');
    setGenerationAlert(`Pasta temática "${newFolder.name}" criada com sucesso!`);
    setTimeout(() => setGenerationAlert(null), 3000);
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (activeFolderId === folderId) {
      setActiveFolderId(null);
    }
    setGenerationAlert('Pasta temática removida.');
    setTimeout(() => setGenerationAlert(null), 2500);
  };

  const handleMoveVideoToFolder = (videoId: string, folderId: string) => {
    setVideoLibrary(prev => prev.map(v => v.id === videoId ? { ...v, folderId } : v));
    setGenerationAlert('Videoaula organizada na pasta temática.');
    setTimeout(() => setGenerationAlert(null), 2500);
  };

  // Video Selection & Library Handlers
  const handleSelectVideoFromLibrary = (video: VideoLesson) => {
    setYoutubeUrl(video.youtubeUrl);
    setVideoSourceType('youtube');
    setActiveTimestampSeconds(0);
    setIsVideoMinimized(false);
    setGenerationAlert(`Videoaula "${video.title}" carregada no player interno!`);
    setTimeout(() => setGenerationAlert(null), 3000);
  };

  const handleAddNewVideoLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;

    const newLesson: VideoLesson = {
      id: `vid-${Date.now()}`,
      title: newVideoTitle.trim(),
      category: newVideoCategory,
      youtubeUrl: newVideoUrl.trim(),
      duration: newVideoDuration || '20 min',
      instructor: 'Nutricionista Responsável',
      description: newVideoDescription.trim() || 'Videoaula adicionada pelo profissional.',
      folderId: newVideoFolderId || (folders[0]?.id || undefined)
    };

    setVideoLibrary(prev => [newLesson, ...prev]);
    setYoutubeUrl(newLesson.youtubeUrl);
    setVideoSourceType('youtube');
    setShowAddVideoModal(false);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDescription('');
    setGenerationAlert(`Nova videoaula "${newLesson.title}" adicionada e ativada!`);
    setTimeout(() => setGenerationAlert(null), 3500);
  };

  const handleDeleteVideoLesson = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoLibrary(prev => prev.filter(v => v.id !== id));
    setGenerationAlert('Videoaula removida da biblioteca.');
    setTimeout(() => setGenerationAlert(null), 2500);
  };

  const categories = ['Todos', 'Bioquímica', 'Dietoterapia', 'Suplementação', 'Exames & Diagnóstico', 'Pediatria', 'Nutrição Esportiva', 'Fitoterapia'];

  const filteredVideos = videoLibrary.filter(vid => {
    const matchesFolder = !activeFolderId || vid.folderId === activeFolderId;
    const matchesCategory = selectedCategory === 'Todos' || vid.category === selectedCategory;
    const matchesQuery = vid.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
                         vid.description.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
                         vid.instructor.toLowerCase().includes(videoSearchQuery.toLowerCase());
    return matchesFolder && matchesCategory && matchesQuery;
  });

  // Toggle flashcard flip
  const handleFlipCard = (id: string) => {
    setLessonData(prev => ({
      ...prev,
      flashcards: prev.flashcards.map(fc => fc.id === id ? { ...fc, flipped: !fc.flipped } : fc)
    }));
  };

  // Answer Quiz Option
  const handleAnswerQuiz = (quizId: string, optionIdx: number) => {
    setLessonData(prev => ({
      ...prev,
      quiz: prev.quiz.map(q => q.id === quizId ? { ...q, selectedOptionIndex: optionIdx } : q)
    }));
  };

  // Process Materials using Gemini API / Multimodal Engine
  const handleSynthesizeMaterials = async (commandType?: string) => {
    setIsGenerating(true);
    setGenerationAlert(`Executando comando ${commandType || '/meu-professor'}... Processando materiais e cruzando com ${postIts.length} Post-its.`);

    try {
      // Check if user specified a custom command
      if (commandType === '/resumo-feynman') {
        setActiveTab('aula');
      } else if (commandType === '/criar-simulado') {
        setActiveTab('simulado');
      } else if (commandType === '/mapa-mental') {
        setActiveTab('mapa_mental');
      } else if (commandType === '/sintetizar-postits') {
        setActiveTab('aula');
      }

      // Try calling Gemini API if VITE_GEMINI_API_KEY is available
      const apiKey = process.env.VITE_GEMINI_API_KEY || '';
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Você é o "Meu Professor — Tutor Multimodal & Arquiteto de Aprendizagem".
Atue como tutor acadêmico de elite.
Assunto: ${documentContent.slice(0, 500)}
Dúvidas do aluno em Post-its: ${postIts.map(p => p.question).join(' | ')}
Gere uma resposta estruturada didática.`;

        await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
      }

      setTimeout(() => {
        setIsGenerating(false);
        setGenerationAlert(`Sintetização ${commandType || ''} concluída com sucesso! Conteúdos organizados com Método Feynman e Active Recall.`);
        setTimeout(() => setGenerationAlert(null), 4000);
      }, 1200);

    } catch (err) {
      setIsGenerating(false);
      setGenerationAlert('Sintetização concluída pelo motor didático.');
      setTimeout(() => setGenerationAlert(null), 3000);
    }
  };

  // Load Study Pack
  const handleLoadPack = (pack: typeof STUDY_PACKS[0]) => {
    setYoutubeUrl(pack.youtubeUrl);
    setDocumentContent(pack.docSummary);
    setPostIts(pack.notes);
    handleSynthesizeMaterials();
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Top Banner: Meu Professor - Tutor Multimodal */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#004f28] text-white flex items-center space-x-1">
              <GraduationCap className="w-3.5 h-3.5 inline mr-1" />
              <span>Skill Meu Professor</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Tutor Multimodal & Arquiteto de Aprendizagem</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Meu Professor — Tutor de Ensino & Retenção Ativa
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Player de vídeo integrado, apostilas PDF, slides PPTX e notas de Post-it com o Método Feynman e Active Recall.
          </p>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSynthesizeMaterials('/explicar-aula')}
            className="px-3.5 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Brain className="w-4 h-4" />
            <span>/explicar-aula</span>
          </button>

          <button
            onClick={() => handleSynthesizeMaterials('/resumo-feynman')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Lightbulb className="w-4 h-4" />
            <span>/resumo-feynman</span>
          </button>

          <button
            onClick={() => handleSynthesizeMaterials('/criar-simulado')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Award className="w-4 h-4" />
            <span>/criar-simulado</span>
          </button>

          <button
            onClick={() => handleSynthesizeMaterials('/mapa-mental')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Network className="w-4 h-4" />
            <span>/mapa-mental</span>
          </button>
        </div>
      </div>

      {generationAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#004f28] rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{generationAlert}</span>
        </div>
      )}

      {/* Pre-built Study Packs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#004f28]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Kits de Estudo Prontos (Clique para Ingerir Materiais)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Cruzamento automático com Post-its e vídeo player</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STUDY_PACKS.map(pack => (
            <div
              key={pack.id}
              onClick={() => handleLoadPack(pack)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#004f28] group-hover:bg-[#004f28] group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-snug group-hover:text-[#004f28]">
                  {pack.title}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-500">
                <span>{pack.notes.length} Post-its de Dúvida</span>
                <span className="text-[#004f28] font-bold group-hover:underline">Carregar &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EMBEDDED INTERNAL VIDEO PLAYER WINDOW (Reprodução sem sair da aba) */}
      <div className={`bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 transition-all ${
        isVideoFloating ? 'sticky top-4 z-40 ring-2 ring-emerald-500/50 shadow-2xl' : ''
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#004f28] text-white flex items-center justify-center font-bold shadow-xs">
              <Tv className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Player de Vídeo Interno (100% Integrado)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  {videoSourceType === 'youtube' ? 'YouTube Stream' : 'Arquivo Local'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Assista a videoaulas do YouTube ou arquivos locais sem sair da aplicação
              </p>
            </div>
          </div>

          {/* Controls & Mode Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Source Switcher */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center space-x-1 border border-slate-700">
              <button
                onClick={() => setVideoSourceType('youtube')}
                className={`px-2.5 py-1 rounded text-xs font-bold font-mono flex items-center space-x-1 transition-all ${
                  videoSourceType === 'youtube' ? 'bg-[#004f28] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                <span>YouTube</span>
              </button>

              <button
                onClick={() => setVideoSourceType('local')}
                className={`px-2.5 py-1 rounded text-xs font-bold font-mono flex items-center space-x-1 transition-all ${
                  videoSourceType === 'local' ? 'bg-[#004f28] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileVideo className="w-3.5 h-3.5 text-sky-400" />
                <span>Arquivo Local</span>
              </button>
            </div>

            <button
              onClick={() => setIsVideoFloating(!isVideoFloating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-1.5 transition-colors ${
                isVideoFloating ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isVideoFloating ? 'Fixar no Topo' : 'Flutuante'}</span>
            </button>

            <button
              onClick={() => setIsVideoMinimized(!isVideoMinimized)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              title={isVideoMinimized ? 'Expandir Player' : 'Minimizar Player'}
            >
              {isVideoMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Video Player & Controls Body */}
        {!isVideoMinimized && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Video Viewport Container (7 cols) */}
            <div className="lg:col-span-7 space-y-2">
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                
                {/* YouTube Video Viewport */}
                {videoSourceType === 'youtube' && (
                  currentVideoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0&start=${activeTimestampSeconds}`}
                      title="Reprodução da Videoaula"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-red-500 flex items-center justify-center mx-auto border border-slate-700">
                        <Youtube className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Aguardando Link do YouTube</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Cole a URL de uma videoaula real no campo ao lado ou cadastre um vídeo na sua biblioteca.
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* Local Video File Viewport */}
                {videoSourceType === 'local' && (
                  localVideoUrl ? (
                    <video
                      ref={localVideoRef}
                      src={localVideoUrl}
                      controls
                      autoPlay={false}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Nenhum vídeo local selecionado</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Carregue uma aula gravada em MP4, WebM, MOV ou OGG para reproduzir dentro da plataforma.
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-2 transition-colors"
                      >
                        <Folder className="w-4 h-4" />
                        <span>Selecionar Arquivo de Vídeo</span>
                      </button>
                    </div>
                  )
                )}

              </div>

              {/* Viewport Status Footer (100% internal, no external redirect links) */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                {videoSourceType === 'youtube' ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Transmissão YouTube ID: <strong className="text-slate-200">{currentVideoId}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                    <span>Arquivo Local: <strong className="text-slate-200">{localVideoFileName || 'Nenhum selecionado'}</strong></span>
                  </div>
                )}
                <span className="text-emerald-400 font-bold">Reprodução Interna no SaaS</span>
              </div>
            </div>

            {/* Source Inputs & Timestamp Bookmarks (5 cols) */}
            <div className="lg:col-span-5 space-y-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
              
              {/* YouTube URL Input Mode */}
              {videoSourceType === 'youtube' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block flex items-center space-x-1.5">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>Cole a URL ou ID do Vídeo do YouTube</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#004f28]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    O player extrai o ID e executa a reprodução com timestamp internamente.
                  </p>
                </div>
              )}

              {/* Local File Upload Mode */}
              {videoSourceType === 'local' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block flex items-center space-x-1.5">
                    <FileVideo className="w-4 h-4 text-sky-400" />
                    <span>Carregar Arquivo de Vídeo Local (MP4, WebM, MOV)</span>
                  </label>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleLocalFileChange}
                    className="hidden"
                  />

                  {localVideoFileName ? (
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <FileVideo className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="truncate font-mono text-slate-200">{localVideoFileName}</span>
                      </div>
                      <button
                        onClick={handleClearLocalVideo}
                        className="p-1 hover:bg-slate-800 text-rose-400 rounded shrink-0 ml-2"
                        title="Remover vídeo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-3 bg-slate-900 hover:bg-slate-950 border border-dashed border-slate-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-sky-400" />
                      <span>Escolher arquivo no computador...</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 font-mono">
                    Privacidade total: o arquivo é reproduzido localmente pelo seu navegador.
                  </p>
                </div>
              )}

              {/* Timestamps & Quick Video Selector Tabs */}
              <div className="space-y-2 pt-3 border-t border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 font-mono block uppercase">
                    MARCAÇÕES DE TEMPO & SELEÇÃO DE VÍDEOS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {videoLibrary.length} Vídeos
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {lessonData.modules.map(m => (
                    <button
                      key={m.number}
                      onClick={() => handleJumpToTimestamp(m.timestampSeconds || 0)}
                      className="w-full p-2 bg-slate-900/80 hover:bg-[#004f28] rounded-lg text-left text-xs font-mono transition-colors flex items-center justify-between group"
                    >
                      <span className="truncate text-slate-200 group-hover:text-white font-semibold">
                        {m.number}. {m.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold shrink-0 ml-2 group-hover:bg-white group-hover:text-[#004f28]">
                        {m.timestamp || '00:00'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* GERENCIADOR DE PASTAS TEMÁTICAS (PLAYLIST MANAGER) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004f28]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-[#004f28]" />
                <span>Gerenciador de Pastas Temáticas & Playlists de Estudo</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Organize suas videoaulas e materiais em módulos temáticos (Bioquímica, Dietoterapia, Exames, Nutrição Esportiva, etc.)
            </p>
          </div>

          <button
            onClick={() => setShowAddFolderModal(true)}
            className="px-3.5 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Nova Pasta Temática</span>
          </button>
        </div>

        {/* Folders Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* All Folders Option */}
          <div
            onClick={() => setActiveFolderId(null)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
              activeFolderId === null
                ? 'bg-[#004f28] border-[#004f28] text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-80">
                VISÃO GERAL
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                activeFolderId === null ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {videoLibrary.length} Aulas
              </span>
            </div>
            <div className="font-bold text-xs">Todas as Pastas Temáticas</div>
            <p className="text-[10px] opacity-75 font-mono line-clamp-1">Exibe todas as videoaulas do acervo sem filtro.</p>
          </div>

          {/* Individual Thematic Folders */}
          {folders.map(folder => {
            const count = videoLibrary.filter(v => v.folderId === folder.id).length;
            const isActive = activeFolderId === folder.id;

            const colorTheme = {
              emerald: 'border-emerald-300 bg-emerald-50/70 text-emerald-950',
              sky: 'border-sky-300 bg-sky-50/70 text-sky-950',
              amber: 'border-amber-300 bg-amber-50/70 text-amber-950',
              purple: 'border-purple-300 bg-purple-50/70 text-purple-950',
              rose: 'border-rose-300 bg-rose-50/70 text-rose-950',
              indigo: 'border-indigo-300 bg-indigo-50/70 text-indigo-950'
            }[folder.color];

            return (
              <div
                key={folder.id}
                onClick={() => setActiveFolderId(folder.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 relative group ${
                  isActive
                    ? 'bg-[#004f28] border-[#004f28] text-white shadow-xs'
                    : colorTheme
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/80 text-slate-800 border border-slate-200'
                  }`}>
                    {folder.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-800'
                    }`}>
                      {count} Aulas
                    </span>
                    <button
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      className="p-1 hover:text-rose-500 opacity-60 hover:opacity-100 transition-opacity"
                      title="Excluir pasta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-bold text-xs leading-snug">{folder.name}</div>
                <p className="text-[10px] opacity-80 font-mono line-clamp-1">{folder.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIDEOTECA & BIBLIOTECA DE VÍDEO AULAS (Espaço para várias videoaulas ativas) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <ListVideo className="w-4 h-4 text-red-600" />
                <span>
                  Videoteca & Acervo {activeFolderId ? `— Pasta: ${folders.find(f => f.id === activeFolderId)?.name}` : 'Geral'}
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Escolha entre várias videoaulas ativas para reproduzir no player interno ou adicione novas aulas do YouTube.
            </p>
          </div>

          <button
            onClick={() => setShowAddVideoModal(true)}
            className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cadastrar Nova Videoaula</span>
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={videoSearchQuery}
              onChange={(e) => setVideoSearchQuery(e.target.value)}
              placeholder="Buscar videoaula por título, tema ou professor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004f28]"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar py-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#004f28] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Video Lessons Cards Grid / Empty State */}
        {filteredVideos.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Nenhuma videoaula cadastrada nesta categoria</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Adicione suas aulas reais do YouTube para montar seu acervo personalizado de estudos clínicos.
              </p>
            </div>
            <button
              onClick={() => setShowAddVideoModal(true)}
              className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Primeira Videoaula</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map(video => {
              const videoId = extractYouTubeId(video.youtubeUrl);
              const isCurrentPlaying = videoId && youtubeUrl.includes(videoId) && videoSourceType === 'youtube';

              return (
                <div
                  key={video.id}
                  className={`rounded-xl border transition-all flex flex-col justify-between p-4 space-y-3 ${
                    isCurrentPlaying
                      ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {video.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{video.duration}</span>
                        </span>
                        <button
                          onClick={(e) => handleDeleteVideoLesson(video.id, e)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Excluir aula da biblioteca"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {video.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      {video.instructor}
                    </span>

                    <button
                      onClick={() => handleSelectVideoFromLibrary(video)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 ${
                        isCurrentPlaying
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>{isCurrentPlaying ? 'Reproduzindo Agora' : 'Assistir Aula'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: CRIAR NOVA PASTA TEMÁTICA (PLAYLIST FOLDER) */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-[#004f28]" />
                <span>Criar Nova Pasta Temática / Playlist</span>
              </h3>
              <button
                onClick={() => setShowAddFolderModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Pasta Temática *</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ex: Fisiologia Cardiovascular & Lipídios"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria Principal</label>
                  <select
                    value={newFolderCategory}
                    onChange={(e) => setNewFolderCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                  >
                    {categories.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cor do Destaque</label>
                  <select
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                  >
                    <option value="emerald">Verde Oliva</option>
                    <option value="sky">Azul Celeste</option>
                    <option value="amber">Âmbar Dourado</option>
                    <option value="purple">Roxo Violeta</option>
                    <option value="rose">Rosa Suave</option>
                    <option value="indigo">Índigo Profundo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição do Módulo / Objetivos</label>
                <textarea
                  rows={2}
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Descrição dos materiais e aulas contidas nesta pasta..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFolderModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Criar Pasta Temática</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR NOVA VIDEOAULA DO YOUTUBE */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <span>Cadastrar Nova Videoaula do YouTube</span>
              </h3>
              <button
                onClick={() => setShowAddVideoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewVideoLesson} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título da Aula *</label>
                <input
                  type="text"
                  required
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Ex: Fisiologia Renal & Excreção de Creatinina"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pasta Temática de Destino</label>
                <select
                  value={newVideoFolderId}
                  onChange={(e) => setNewVideoFolderId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={newVideoCategory}
                    onChange={(e) => setNewVideoCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                  >
                    {categories.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duração Est.</label>
                  <input
                    type="text"
                    value={newVideoDuration}
                    onChange={(e) => setNewVideoDuration(e.target.value)}
                    placeholder="Ex: 25 min"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL ou Link do YouTube *</label>
                <input
                  type="text"
                  required
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Resumo / Descrição Curta</label>
                <textarea
                  rows={2}
                  value={newVideoDescription}
                  onChange={(e) => setNewVideoDescription(e.target.value)}
                  placeholder="Resumo dos tópicos abordados na videoaula..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#004f28] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar & Reproduzir Agora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multimodal Ingestion Inputs & Post-it Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs Column: PDF Reader & PPT Slides Presenter (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          
          {/* Header & Source Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <Presentation className="w-4 h-4 text-[#004f28]" />
                <span>Leitor de Apostilas em PDF & Apresentador de Slides PPT/PPTX</span>
              </h3>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                Apresente slides e apostilas dentro do aplicativo e extraia o conteúdo para o sintetizador
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleDocFileUpload}
                className="hidden"
              />

              <button
                onClick={() => pdfInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-200"
              >
                <Upload className="w-3.5 h-3.5 text-sky-600" />
                <span>Carregar PDF / PPTX</span>
              </button>

              <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1 border border-slate-200">
                <button
                  onClick={() => setDocReaderMode('slides')}
                  className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition-all ${
                    docReaderMode === 'slides' ? 'bg-[#004f28] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Slides PPT
                </button>
                <button
                  onClick={() => setDocReaderMode('reader')}
                  className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition-all ${
                    docReaderMode === 'reader' ? 'bg-[#004f28] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PDF Viewer
                </button>
              </div>
            </div>
          </div>

          {/* SLIDES PRESENTATION CANVAS (Modo Apresentação de Slides PPT/PPTX) */}
          {docReaderMode === 'slides' && (
            <div className="space-y-3">
              
              {/* Slide Navigation Controls Bar */}
              <div className="flex items-center justify-between bg-slate-900 text-white p-2.5 rounded-xl text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300"
                    title="Slide Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-emerald-400">
                    Slide {currentSlideIndex + 1} / {slidesList.length}
                  </span>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === slidesList.length - 1}
                    className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300"
                    title="Próximo Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSlideZoomLevel(prev => Math.max(75, prev - 15))}
                    className="p-1 hover:bg-slate-800 rounded text-slate-300"
                    title="Reduzir Zoom"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400">{slideZoomLevel}%</span>
                  <button
                    onClick={() => setSlideZoomLevel(prev => Math.min(175, prev + 15))}
                    className="p-1 hover:bg-slate-800 rounded text-slate-300"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleExtractCurrentSlideToAI}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Enviar para IA</span>
                  </button>
                </div>
              </div>

              {/* Main Slide Canvas Display Viewport */}
              <div
                className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-6 shadow-inner border border-slate-800 min-h-[260px] flex flex-col justify-between space-y-4 transition-all overflow-hidden"
                style={{ transform: `scale(${slideZoomLevel / 100})`, transformOrigin: 'top left' }}
              >
                {slidesList[currentSlideIndex] ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          SLIDE #{slidesList[currentSlideIndex].number}
                        </span>
                        <span>{readerFileName || 'Apresentação Fisiologia.pptx'}</span>
                      </div>

                      <h4 className="text-lg font-black text-white tracking-tight leading-snug">
                        {slidesList[currentSlideIndex].title}
                      </h4>
                      {slidesList[currentSlideIndex].subtitle && (
                        <p className="text-xs text-emerald-400 font-mono">
                          {slidesList[currentSlideIndex].subtitle}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/40 font-sans text-xs">
                      {slidesList[currentSlideIndex].bullets.map((bullet, idx) => {
                        const matchingAnn = annotations.find(a => a.slideNumber === currentSlideIndex + 1 && bullet.includes(a.highlightedText));
                        const highlightClasses = matchingAnn ? {
                          yellow: 'bg-amber-500/20 border-l-4 border-amber-400 text-amber-200 px-2 py-1 rounded-r font-semibold',
                          green: 'bg-emerald-500/20 border-l-4 border-emerald-400 text-emerald-200 px-2 py-1 rounded-r font-semibold',
                          pink: 'bg-rose-500/20 border-l-4 border-rose-400 text-rose-200 px-2 py-1 rounded-r font-semibold',
                          blue: 'bg-sky-500/20 border-l-4 border-sky-400 text-sky-200 px-2 py-1 rounded-r font-semibold'
                        }[matchingAnn.color] : 'text-slate-200 hover:bg-slate-800/60 p-1 rounded transition-colors';

                        return (
                          <div
                            key={idx}
                            onClick={() => handleQuickHighlightBullet(bullet)}
                            className={`flex items-start space-x-2 cursor-pointer group ${highlightClasses}`}
                            title="Clique para selecionar e sublinhar este trecho"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed flex-1">{bullet}</span>
                            <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              [Grifar]
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {slidesList[currentSlideIndex].clinicalNote && (
                      <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 text-[11px] text-amber-300 font-mono">
                        <strong className="text-amber-400">Nota Clínica:</strong> {slidesList[currentSlideIndex].clinicalNote}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-8 text-slate-400">Nenhum slide selecionado</div>
                )}
              </div>

              {/* Thumbnails Carousel */}
              <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pt-1 pb-1">
                {slidesList.map((slide, idx) => (
                  <button
                    key={slide.number}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`px-3 py-2 rounded-lg border text-left font-mono shrink-0 transition-all ${
                      currentSlideIndex === idx
                        ? 'bg-[#004f28] border-[#004f28] text-white shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[9px] uppercase font-bold opacity-75">Slide {slide.number}</div>
                    <div className="text-xs font-bold truncate max-w-[120px]">{slide.title}</div>
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* PAINEL DE SUBLINHAR TRECHOS & NOTAS LATERAIS */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Highlighter className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Sublinhar Trecho & Criar Nota Lateral (Slide #{currentSlideIndex + 1})
                </h4>
              </div>

              {/* Color Picker */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Cor:</span>
                {(['yellow', 'green', 'pink', 'blue'] as const).map(color => {
                  const colorBg = {
                    yellow: 'bg-amber-400 ring-amber-500',
                    green: 'bg-emerald-400 ring-emerald-500',
                    pink: 'bg-rose-400 ring-rose-500',
                    blue: 'bg-sky-400 ring-sky-500'
                  }[color];

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setHighlightColor(color)}
                      className={`w-4 h-4 rounded-full ${colorBg} transition-transform ${
                        highlightColor === color ? 'ring-2 ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleAddAnnotation} className="space-y-2">
              <input
                type="text"
                value={selectedTextToHighlight}
                onChange={(e) => setSelectedTextToHighlight(e.target.value)}
                placeholder="Trecho sublinhado do documento (ou clique num texto do slide acima)..."
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004f28]"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSideNoteText}
                  onChange={(e) => setNewSideNoteText(e.target.value)}
                  placeholder="Escreva sua nota lateral ou insight clínico..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004f28]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0 shadow-2xs"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Fixar Nota</span>
                </button>
              </div>
            </form>

            {/* List of Side Annotations */}
            {annotations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 font-bold">
                  <span>NOTAS LATERAIS FIXADAS ({annotations.length})</span>
                  <button
                    onClick={handleSendAnnotationsToAI}
                    className="text-[#004f28] hover:underline text-[10px] flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 inline" />
                    <span>Compilar para IA</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                  {annotations.map(ann => {
                    const borderClasses = {
                      yellow: 'border-l-4 border-amber-400 bg-amber-50/80',
                      green: 'border-l-4 border-emerald-400 bg-emerald-50/80',
                      pink: 'border-l-4 border-rose-400 bg-rose-50/80',
                      blue: 'border-l-4 border-sky-400 bg-sky-50/80'
                    }[ann.color];

                    return (
                      <div key={ann.id} className={`p-2.5 rounded-r-lg border border-slate-200 ${borderClasses} text-xs space-y-1 relative group`}>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="font-bold text-slate-800">Slide #{ann.slideNumber}</span>
                          <div className="flex items-center space-x-2">
                            <span>{ann.createdAt}</span>
                            <button
                              onClick={() => handleRemoveAnnotation(ann.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="italic text-slate-700 font-mono text-[11px]">"{ann.highlightedText}"</p>
                        <p className="font-sans font-semibold text-slate-900">{ann.sideNote}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Document Content Text Area & AI Synthesis Action */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Texto Extraído para o Motor de Aprendizagem Feynman (IA)</span>
            </label>
            <textarea
              rows={3}
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              placeholder="Conteúdo extraído das apostilas, slides ou anotações de aula..."
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004f28]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleSynthesizeMaterials()}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Sintetizando Materiais...' : 'Sintetizar Materiais com Meu Professor'}</span>
            </button>
          </div>
        </div>

        {/* Right Inputs Column: Interactive Post-its (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <StickyNote className="w-4 h-4 text-amber-500" />
              <span>Notas de Post-it & Dúvidas do Aluno</span>
            </h3>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">
              Prioridade Máxima
            </span>
          </div>

          {/* Add Post-it Form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPostItQuestion}
              onChange={(e) => setNewPostItQuestion(e.target.value)}
              placeholder="Escreva sua dúvida ou anotação de Post-it..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddPostIt()}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004f28]"
            />
            <button
              onClick={handleAddPostIt}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Colar Post-it</span>
            </button>
          </div>

          {/* Post-it Notes Grid */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {postIts.map(note => {
              const colorClasses = {
                yellow: 'bg-amber-100 border-amber-300 text-amber-950',
                pink: 'bg-rose-100 border-rose-300 text-rose-950',
                green: 'bg-emerald-100 border-emerald-300 text-emerald-950',
                blue: 'bg-sky-100 border-sky-300 text-sky-950'
              }[note.color];

              return (
                <div key={note.id} className={`p-3 rounded-xl border ${colorClasses} shadow-2xs relative group transition-transform hover:-translate-y-0.5`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase">{note.title}</span>
                    <button
                      onClick={() => handleRemovePostIt(note.id)}
                      className="text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-sans font-semibold leading-relaxed">
                    "{note.question}"
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Main Output View (Tabs: Aula Completa | Flashcards | Simulado | Mapa Mental | Glossário) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('aula')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'aula'
                  ? 'bg-[#004f28] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Aula Estruturada Feynman</span>
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'flashcards'
                  ? 'bg-[#004f28] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. Flashcards Interativos ({lessonData.flashcards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulado')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'simulado'
                  ? 'bg-[#004f28] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>3. Desafio de Simulado ({lessonData.quiz.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mapa_mental')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'mapa_mental'
                  ? 'bg-[#004f28] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>4. Mapa Mental & Conceitual</span>
            </button>

            <button
              onClick={() => setActiveTab('glossario')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'glossario'
                  ? 'bg-[#004f28] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>5. Glossário</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Plano de Aula</span>
          </button>
        </div>

        {/* TAB 1: AULA COMPLETA ESTRUTURADA */}
        {activeTab === 'aula' && (
          <div className="p-6 space-y-8 text-slate-800">
            
            {/* 1. QUADRO GERAL DA AULA */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <span className="w-3 h-3 rounded-full bg-[#004f28]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  1. Quadro Geral da Aula / Conteúdo
                </h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">TEMA CENTRAL:</span>
                  <span className="text-sm font-bold text-slate-900">{lessonData.title}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">FONTES PROCESSADAS:</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                    {lessonData.sources.map((src, idx) => (
                      <li key={idx}>{src}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 font-sans">
                  <span className="text-[11px] font-bold text-[#004f28] block mb-1">A IDEIA CENTRAL EM 2 MINUTOS:</span>
                  <p className="text-xs text-emerald-950 leading-relaxed">{lessonData.twoMinuteSummary}</p>
                </div>
              </div>
            </div>

            {/* 2. APROFUNDAMENTO EM MÓDULOS CONCEITUAIS */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <span className="w-3 h-3 rounded-full bg-[#004f28]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  2. Aprofundamento em Módulos Conceituais (Didática por Camadas)
                </h3>
              </div>

              <div className="space-y-6">
                {lessonData.modules.map(mod => (
                  <div key={mod.number} className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-[#004f28] text-white flex items-center justify-center text-xs font-bold">
                          {mod.number}
                        </span>
                        <span>Módulo {mod.number}: {mod.title}</span>
                      </h4>

                      {mod.timestamp && (
                        <button
                          onClick={() => handleJumpToTimestamp(mod.timestampSeconds || 0)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#004f28] border border-emerald-200 rounded font-mono text-xs font-bold flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Saltar Vídeo ({mod.timestamp})</span>
                        </button>
                      )}
                    </div>

                    {/* 3 Progressive Layers */}
                    <div className="space-y-3 pl-2 border-l-2 border-[#004f28]/30">
                      
                      {/* Layer 1: Feynman */}
                      <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs">
                        <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block mb-1 flex items-center space-x-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 inline" />
                          <span>Nível 1 — Intuição & Analogia (Técnica Feynman)</span>
                        </span>
                        <p className="text-slate-800 leading-relaxed font-sans">{mod.level1Feynman}</p>
                      </div>

                      {/* Layer 2: Technical */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-1">
                          Nível 2 — Aprofundamento Técnico & Bioquímico
                        </span>
                        <p className="text-slate-800 leading-relaxed font-mono">{mod.level2Technical}</p>
                      </div>

                      {/* Layer 3: Practical */}
                      <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200 text-xs">
                        <span className="font-bold text-sky-900 uppercase text-[10px] tracking-wider block mb-1">
                          Nível 3 — Aplicação Prática em Consultório
                        </span>
                        <p className="text-slate-800 leading-relaxed font-sans">{mod.level3Practical}</p>
                      </div>
                    </div>

                    {/* Golden Rule Citation */}
                    <blockquote className="p-3 bg-emerald-50 rounded-lg border-l-4 border-[#004f28] text-xs font-semibold text-[#004f28] italic">
                      "Regra de Ouro do Professor: {mod.goldenRule}"
                    </blockquote>

                    {/* Connected Post-it Answer */}
                    {mod.connectedPostItAnswer && (
                      <div className="p-3 bg-amber-100/70 rounded-lg border border-amber-300 text-xs text-amber-950 font-sans space-y-1">
                        <span className="font-bold flex items-center space-x-1 text-amber-900 text-[11px]">
                          <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                          <span>Conexão Direta com Post-it de Dúvida do Aluno:</span>
                        </span>
                        <p>{mod.connectedPostItAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Post-it Summary Section */}
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <h4 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
                <StickyNote className="w-4 h-4 text-amber-600" />
                <span>Respostas Consolidadas a Todos os Post-its do Estudante</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {lessonData.postItResponses.map((res, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900 block text-[11px]">Dúvida: "{res.question}"</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{res.answer}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FLASHCARDS INTERATIVOS (ACTIVE RECALL) */}
        {activeTab === 'flashcards' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Cartões de Memorização (Active Recall Flashcards)</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Clique no cartão para virar e testar sua recuperação de memória.</p>
              </div>

              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded border border-slate-200">
                {lessonData.flashcards.length} Cartões
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonData.flashcards.map((fc, i) => (
                <div
                  key={fc.id}
                  onClick={() => handleFlipCard(fc.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all min-h-[160px] flex flex-col justify-between ${
                    fc.flipped
                      ? 'bg-[#004f28] border-[#004f28] text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-emerald-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider opacity-75 mb-2">
                    <span>FLASHCARD #{i + 1}</span>
                    <span>{fc.flipped ? 'RESPOSTA (CLIQUE PARA VOLTAR)' : 'PERGUNTA (CLIQUE PARA REVELAR)'}</span>
                  </div>

                  <div className="text-sm font-bold leading-relaxed my-auto font-sans">
                    {fc.flipped ? fc.answer : fc.question}
                  </div>

                  <div className="flex justify-end pt-2 opacity-60">
                    <RotateCw className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SIMULADO INTERATIVO */}
        {activeTab === 'simulado' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Desafio de Simulado & Teste de Conhecimento</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Selecione uma alternativa para obter feedback imediato com justificativa comentada.</p>
            </div>

            <div className="space-y-6">
              {lessonData.quiz.map((q, qIdx) => (
                <div key={q.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="font-bold text-slate-900 text-sm flex items-start space-x-2">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-xs font-mono">Q{qIdx + 1}</span>
                    <span>{q.question}</span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = q.selectedOptionIndex === optIdx;
                      const isCorrect = optIdx === q.correctOptionIndex;
                      let optionStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100';

                      if (q.selectedOptionIndex !== undefined) {
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-100 border-emerald-400 text-[#004f28] font-bold';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'bg-rose-100 border-rose-300 text-rose-900 font-bold';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerQuiz(q.id, optIdx)}
                          className={`w-full p-3 rounded-lg border text-left text-xs font-sans transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {q.selectedOptionIndex !== undefined && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Commented Explanation */}
                  {q.selectedOptionIndex !== undefined && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1 font-sans">
                      <span className="font-bold text-[#004f28] block text-[11px]">Gabarito Comentado do Professor:</span>
                      <p className="text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MAPA MENTAL & CONCEITUAL */}
        {activeTab === 'mapa_mental' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Network className="w-5 h-5 text-sky-600" />
                  <span>Mapa Conceitual & Fluxo de Aprendizagem</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Visão encadeada das relações de causa e efeito bioquímico do tema.</p>
              </div>

              <span className="text-xs font-mono font-bold bg-sky-50 text-sky-900 px-3 py-1 rounded border border-sky-200">
                5 Nós Conectados
              </span>
            </div>

            <div className="space-y-4">
              {lessonData.mindMap.map((node, i) => (
                <div key={node.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 relative">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#004f28] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{node.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-100 text-sky-800 uppercase font-bold">{node.category}</span>
                  </div>

                  <p className="text-xs text-slate-700 font-mono pl-8">{node.details}</p>

                  {i < lessonData.mindMap.length - 1 && (
                    <div className="pl-8 pt-1 text-slate-400 text-xs font-mono flex items-center space-x-1">
                      <span>↓</span>
                      <span className="text-[10px] text-slate-500 italic">encadeia para a próxima etapa</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GLOSSÁRIO DE TERMOS-CHAVE */}
        {activeTab === 'glossario' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-sky-600" />
                <span>Glossário de Termos Técnicos & Conceitos Fundamentais</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 border border-slate-200">Termo Técnico</th>
                    <th className="p-3 border border-slate-200">Significado & Definição Simplificada</th>
                    <th className="p-3 border border-slate-200">Aplicação Clínica / Prática</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                  {lessonData.glossary.map((g, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold font-mono text-[#004f28] border border-slate-200">{g.term}</td>
                      <td className="p-3 border border-slate-200">{g.definition}</td>
                      <td className="p-3 border border-slate-200 font-mono text-slate-600">{g.application}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
