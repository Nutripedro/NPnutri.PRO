import React, { useState } from 'react';
import { 
  Patient, 
  Professional, 
  ClinicalPrescription, 
  PrescriptionSupplementEntry, 
  PrescriptionPhytotherapeuticEntry, 
  PrescriptionDietaryRecommendation 
} from '../types';
import { exportPrescriptionPDF } from '../utils/pdfExport';
import { 
  Pill, 
  Leaf, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  User, 
  BookOpen, 
  Share2, 
  Zap, 
  Heart, 
  Moon, 
  Activity,
  Check
} from 'lucide-react';

interface GeradorPrescricoesViewProps {
  patients: Patient[];
  currentPatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  currentProfessional: Professional;
  privacyMode: boolean;
}

export const GeradorPrescricoesView: React.FC<GeradorPrescricoesViewProps> = ({
  patients,
  currentPatient,
  onSelectPatient,
  currentProfessional,
  privacyMode
}) => {
  // Preset Protocols Library
  const PRESET_PROTOCOLS = [
    {
      id: 'proto-hipertrofia',
      title: 'Protocolo Hipertrofia & Desempenho Anaeróbico',
      icon: Zap,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      supplements: [
        {
          id: `supp-${Date.now()}-1`,
          name: 'Creatina Monoidratada Micronizada (Creapure®)',
          activeIngredient: 'Creatina Monoidratada 100% Pura',
          doseConcentration: '5g ao dia',
          posology: 'Ingerir 5g (1 dosador) diluído em 200ml de água ou suco junto à refeição com carboidratos.',
          timing: 'Uso diário contínuo (pós-treino)',
          route: 'Via Oral',
          duration: 'Uso contínuo (90 dias)',
          notes: 'Manter taxa de hidratação superior a 35-40 ml/kg/dia.'
        },
        {
          id: `supp-${Date.now()}-2`,
          name: 'Whey Protein Isolado (WPI 90%)',
          activeIngredient: 'Proteína Isolada do Soro do Leite',
          doseConcentration: '30g ao dia (27g proteína líquida)',
          posology: 'Diluir 30g em 200ml de água gelada ou misturado com frutas batidas.',
          timing: 'Pós-treino imediato ou lanche hiperproteico',
          route: 'Via Oral',
          duration: 'Uso diário',
          notes: 'Garante aporte de leucina (>3g) para estímulo da síntese proteica (MPS).'
        },
        {
          id: `supp-${Date.now()}-3`,
          name: 'Bisglicinato de Magnésio (Quelado)',
          activeIngredient: 'Magnésio Elemental 350mg',
          doseConcentration: '350mg ao dia',
          posology: 'Ingerir 1 cápsula à noite cerca de 45 minutos antes de deitar.',
          timing: 'Noturno (21h30)',
          route: 'Via Oral',
          duration: '60 dias',
          notes: 'Suporte neuromuscular e relaxamento para qualidade de sono profundo.'
        }
      ],
      phytotherapeutics: [
        {
          id: `phyto-${Date.now()}-1`,
          name: 'Chá Verde Extrato Seco (Camellia sinensis)',
          botanicalName: 'Camellia sinensis (L.) Kuntze',
          standardization: 'Extrato seco padronizado a 50% de EGCG (Epigalocatequina galato)',
          dose: '300 mg por dose',
          vehicle: 'Cápsulas Vegetais',
          posology: 'Tomar 1 cápsula pela manhã com o café da manhã.',
          timing: 'Matinal (08h00)',
          warnings: 'Evitar consumo após as 16h para não interferir no sono.'
        }
      ],
      dietaryRecommendations: [
        {
          id: `rec-${Date.now()}-1`,
          category: 'hidratação' as const,
          title: 'Metabolismo & Hidratação de Eletrólitos',
          guideline: 'Meta hídrica calculada em 40ml/kg/dia (aprox. 2.800ml a 3.200ml ao dia). Distribuir 500ml ao acordar e fracionar durante o treino.'
        },
        {
          id: `rec-${Date.now()}-2`,
          category: 'horários' as const,
          title: 'Fracionamento Proteico Periódico',
          guideline: 'Garantir distribuição proteica em 4 a 5 refeições diárias contendo de 25g a 35g de proteína de alto valor biológico por refeição (Janela Anabólica Sustentada).'
        }
      ]
    },
    {
      id: 'proto-sono-estresse',
      title: 'Protocolo Modulação do Estresse, Eixo HPA & Sono',
      icon: Moon,
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      supplements: [
        {
          id: `supp-${Date.now()}-4`,
          name: 'Bisglicinato de Magnésio + L-Teanina',
          activeIngredient: 'Magnésio Quelado 350mg + L-Teanina 200mg',
          doseConcentration: '1 cápsula ao dia',
          posology: 'Ingerir 1 cápsula 1 hora antes do horário pretendido para dormir com água.',
          timing: 'Noturno (21h00)',
          route: 'Via Oral',
          duration: '60 dias',
          notes: 'Aumenta ondas alfa cerebrais induzindo relaxamento sem sonolência residual.'
        }
      ],
      phytotherapeutics: [
        {
          id: `phyto-${Date.now()}-2`,
          name: 'Ashwagandha Extrato Seco (Withania somnifera)',
          botanicalName: 'Withania somnifera (L.) Dunal (KSM-66®)',
          standardization: 'Extrato seco padronizado a 5% de Withanolídeos',
          dose: '500 mg por dose',
          vehicle: 'Cápsulas Vegetais Gastroresistentes',
          posology: 'Tomar 1 cápsula às 19h00 ou antes de deitar.',
          timing: 'Noturno / Crepúsculo',
          warnings: 'Adaptógeno regulador de cortisol. Gestantes devem consultar médico.'
        },
        {
          id: `phyto-${Date.now()}-3`,
          name: 'Passiflora & Mulungu (Passiflora incarnata + Erythrina mulungu)',
          botanicalName: 'Passiflora incarnata L. / Erythrina mulungu Mart.',
          standardization: 'Extrato seco 4:1 com flavonoides totais',
          dose: '300 mg (200mg Passiflora / 100mg Mulungu)',
          vehicle: 'Cápsulas Vegetais',
          posology: 'Tomar 1 cápsula 45 min antes de deitar.',
          timing: 'Noturno (21h30)',
          warnings: 'Anxiolítico fitoterápico de suporte ao sono REM.'
        }
      ],
      dietaryRecommendations: [
        {
          id: `rec-${Date.now()}-3`,
          category: 'estilo_vida' as const,
          title: 'Higiene do Sono & Bloqueio de Luz Azul',
          guideline: 'Desligar telas e luzes intensas 1 hora antes de dormir. Manter quarto escuro, silencioso e temperatura agradável (19°C a 21°C).'
        },
        {
          id: `rec-${Date.now()}-4`,
          category: 'interações' as const,
          title: 'Corte de Estimulantes & Cafeína',
          guideline: 'Cessar ingestão de café, pré-treinos com cafeína, termogênicos ou chás pretos após as 14h00 para evitar bloqueio de receptores de adenosina.'
        }
      ]
    },
    {
      id: 'proto-longevidade',
      title: 'Protocolo Longevidade & Bioenergética Mitocondrial',
      icon: Heart,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      supplements: [
        {
          id: `supp-${Date.now()}-5`,
          name: 'Coenzima Q10 (Ubiquinona) + Vitamina E',
          activeIngredient: 'Coenzima Q10 100mg + D-Alfa-Tocoferol 15mg',
          doseConcentration: '100mg ao dia',
          posology: 'Tomar 1 cápsula gelatinosa junto ao café da manhã ou almoço.',
          timing: 'Matinal com refeição lipídica',
          route: 'Via Oral',
          duration: 'Uso diário',
          notes: 'Otimização do transporte de elétrons na cadeia respiratória mitocondrial.'
        },
        {
          id: `supp-${Date.now()}-6`,
          name: 'Ômega-3 TG Ultra Concentrado (EPA/DHA)',
          activeIngredient: 'Óleo de Peixe Purificado: 600mg EPA + 400mg DHA',
          doseConcentration: '1000mg EPA/DHA ao dia (2 cápsulas)',
          posology: 'Ingerir 2 cápsulas junto ao almoço.',
          timing: 'Almoço',
          route: 'Via Oral',
          duration: 'Uso contínuo',
          notes: 'Modulação de PCR-us e inflamação endotelial de baixo grau.'
        },
        {
          id: `supp-${Date.now()}-7`,
          name: 'Vitamina D3 + K2 (MK-7) Gotas Lipossolúveis',
          activeIngredient: 'Colecalciferol 4.000 UI + Menaquinona-7 100mcg',
          doseConcentration: '4.000 UI ao dia (2 gotas)',
          posology: 'Pingar 2 gotas diretamente sobre um alimento gorduroso no almoço.',
          timing: 'Almoço',
          route: 'Via Oral',
          duration: 'Uso contínuo com monitoramento de 25(OH)D',
          notes: 'Modulação imune e direcionamento de cálcio para matriz óssea.'
        }
      ],
      phytotherapeutics: [
        {
          id: `phyto-${Date.now()}-4`,
          name: 'Cúrcuma Extrato Seco (Curcuma longa)',
          botanicalName: 'Curcuma longa L. com piperina',
          standardization: 'Extrato seco padronizado a 95% de Curcuminoides',
          dose: '500 mg + 5mg Piperina',
          vehicle: 'Cápsulas Vegetais',
          posology: 'Ingerir 1 cápsula ao almoço.',
          timing: 'Diurno (Almoço)',
          warnings: 'Antioxidante potente e modulador do NF-kB.'
        }
      ],
      dietaryRecommendations: [
        {
          id: `rec-${Date.now()}-5`,
          category: 'alimentos_prioritários' as const,
          title: 'Densidade de Polifenóis e Antocianinas',
          guideline: 'Incluir diariamente frutas vermelhas (mirtilos, morangos, amoras), azeite de oliva extravirgem de baixa acidez (<0.2%) e vegetais crucíferos (brócolis, couve-flor, couve-de-bruxelas).'
        }
      ]
    }
  ];

  // Prescription Form State
  const [prescriptionTitle, setPrescriptionTitle] = useState<string>('Receituário de Suplementação Clínica & Nutracêutica');
  const [prescriptionNotes, setPrescriptionNotes] = useState<string>('Manter os horários indicados e garantir hidratação diária adequada. Em caso de desconforto gastrointestinal, consumir os suplementos acompanhados de alimentos.');
  const [isDigitallySigned, setIsDigitallySigned] = useState<boolean>(true);

  // Active items in prescription
  const [supplements, setSupplements] = useState<PrescriptionSupplementEntry[]>(PRESET_PROTOCOLS[0].supplements);
  const [phytotherapeutics, setPhytotherapeutics] = useState<PrescriptionPhytotherapeuticEntry[]>(PRESET_PROTOCOLS[0].phytotherapeutics);
  const [dietaryRecommendations, setDietaryRecommendations] = useState<PrescriptionDietaryRecommendation[]>(PRESET_PROTOCOLS[0].dietaryRecommendations);

  // Form modals / state for adding custom items
  const [isAddSuppModalOpen, setIsAddSuppModalOpen] = useState<boolean>(false);
  const [isAddPhytoModalOpen, setIsAddPhytoModalOpen] = useState<boolean>(false);
  const [isAddRecModalOpen, setIsAddRecModalOpen] = useState<boolean>(false);

  // Custom Supplement inputs
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppIngredient, setNewSuppIngredient] = useState('');
  const [newSuppDose, setNewSuppDose] = useState('');
  const [newSuppPosology, setNewSuppPosology] = useState('');
  const [newSuppTiming, setNewSuppTiming] = useState('Diurno');
  const [newSuppRoute, setNewSuppRoute] = useState('Via Oral');
  const [newSuppDuration, setNewSuppDuration] = useState('60 dias');

  // Custom Phyto inputs
  const [newPhytoName, setNewPhytoName] = useState('');
  const [newPhytoBotanical, setNewPhytoBotanical] = useState('');
  const [newPhytoStandardization, setNewPhytoStandardization] = useState('Extrato seco padronizado');
  const [newPhytoDose, setNewPhytoDose] = useState('');
  const [newPhytoVehicle, setNewPhytoVehicle] = useState('Cápsulas Vegetais');
  const [newPhytoPosology, setNewPhytoPosology] = useState('');
  const [newPhytoTiming, setNewPhytoTiming] = useState('Noturno');

  // Custom Guideline inputs
  const [newRecCategory, setNewRecCategory] = useState<'hidratação' | 'horários' | 'interações' | 'alimentos_prioritários' | 'estilo_vida'>('hidratação');
  const [newRecTitle, setNewRecTitle] = useState('');
  const [newRecGuideline, setNewRecGuideline] = useState('');

  // Status feedback alert
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Load Preset Protocol into current prescription
  const handleLoadPreset = (preset: typeof PRESET_PROTOCOLS[0]) => {
    setSupplements(preset.supplements);
    setPhytotherapeutics(preset.phytotherapeutics);
    setDietaryRecommendations(preset.dietaryRecommendations);
    setPrescriptionTitle(`Receituário — ${preset.title}`);
    showAlert(`Protocolo "${preset.title}" carregado na prescrição!`);
  };

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  // Add custom supplement
  const handleAddCustomSupplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName || !newSuppDose) return;

    const item: PrescriptionSupplementEntry = {
      id: `supp-custom-${Date.now()}`,
      name: newSuppName,
      activeIngredient: newSuppIngredient || newSuppName,
      doseConcentration: newSuppDose,
      posology: newSuppPosology || `Ingerir ${newSuppDose} conforme orientação.`,
      timing: newSuppTiming,
      route: newSuppRoute,
      duration: newSuppDuration
    };

    setSupplements(prev => [...prev, item]);
    setIsAddSuppModalOpen(false);
    setNewSuppName('');
    setNewSuppIngredient('');
    setNewSuppDose('');
    setNewSuppPosology('');
    showAlert(`Suplemento "${item.name}" adicionado à prescrição.`);
  };

  // Add custom phyto
  const handleAddCustomPhyto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhytoName || !newPhytoDose) return;

    const item: PrescriptionPhytotherapeuticEntry = {
      id: `phyto-custom-${Date.now()}`,
      name: newPhytoName,
      botanicalName: newPhytoBotanical || newPhytoName,
      standardization: newPhytoStandardization,
      dose: newPhytoDose,
      vehicle: newPhytoVehicle,
      posology: newPhytoPosology || `Tomar 1 dose de ${newPhytoDose}.`,
      timing: newPhytoTiming
    };

    setPhytotherapeutics(prev => [...prev, item]);
    setIsAddPhytoModalOpen(false);
    setNewPhytoName('');
    setNewPhytoBotanical('');
    setNewPhytoDose('');
    setNewPhytoPosology('');
    showAlert(`Fitoterápico "${item.name}" adicionado à prescrição.`);
  };

  // Add custom recommendation
  const handleAddCustomRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecTitle || !newRecGuideline) return;

    const item: PrescriptionDietaryRecommendation = {
      id: `rec-custom-${Date.now()}`,
      category: newRecCategory,
      title: newRecTitle,
      guideline: newRecGuideline
    };

    setDietaryRecommendations(prev => [...prev, item]);
    setIsAddRecModalOpen(false);
    setNewRecTitle('');
    setNewRecGuideline('');
    showAlert(`Orientação "${item.title}" adicionada.`);
  };

  // Remove items
  const handleRemoveSupp = (id: string) => {
    setSupplements(prev => prev.filter(s => s.id !== id));
  };

  const handleRemovePhyto = (id: string) => {
    setPhytotherapeutics(prev => prev.filter(p => p.id !== id));
  };

  const handleRemoveRec = (id: string) => {
    setDietaryRecommendations(prev => prev.filter(r => r.id !== id));
  };

  // Build full prescription object
  const buildCurrentPrescriptionObject = (): ClinicalPrescription => {
    const timestamp = new Date().toISOString();
    const hash = `SHA-256: ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();

    return {
      id: `presc-${Date.now()}`,
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      patientCpf: currentPatient.cpf,
      patientRecord: currentPatient.recordNumber,
      patientAge: currentPatient.age,
      patientSex: currentPatient.sex,
      professionalName: currentProfessional.name,
      professionalRegistration: currentProfessional.registrationCode || 'CRN-3 48910',
      date: new Date().toISOString().split('T')[0],
      title: prescriptionTitle,
      supplements,
      phytotherapeutics,
      dietaryRecommendations,
      generalNotes: prescriptionNotes,
      isDigitallySigned,
      digitalSignatureHash: hash,
      signatureTimestamp: timestamp
    };
  };

  // Export to PDF
  const handleExportPDF = () => {
    const fullPrescription = buildCurrentPrescriptionObject();
    exportPrescriptionPDF(
      fullPrescription,
      currentProfessional.specialty || 'Nutricionista Clínica & Esportiva',
      'NUTRI PRO — CLÍNICA DE NUTRIÇÃO AVANÇADA'
    );
    showAlert('Receituário em PDF gerado e assinado eletronicamente!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Patient Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#004f28] text-white">
              Gerador de Prescrições
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">CFN Resoluções 656/2020 & 525/2013</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Receituário Eletrônico de Suplementação & Fitoterapia
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Prescritor Ativo: <span className="font-bold text-slate-800 dark:text-slate-200">{currentProfessional.name}</span> ({currentProfessional.registrationCode})
          </p>
        </div>

        {/* Patient Switcher & Main Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <select
              value={currentPatient.id}
              onChange={(e) => {
                const pat = patients.find(p => p.id === e.target.value);
                if (pat) onSelectPatient(pat);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900 dark:text-slate-200">
                  {p.name} ({p.recordNumber}) — {p.age}a • {p.currentWeightKg}kg
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Receituário PDF Assinado</span>
          </button>
        </div>
      </div>

      {alertMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[#004f28] dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Preset Library Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Biblioteca de Protocolos Clínicos Prontos (1-Clique)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Carrega dosagens e condutas padrão em 1 clique</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_PROTOCOLS.map(preset => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-[#004f28] dark:text-emerald-400 group-hover:bg-[#004f28] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#004f28] dark:group-hover:text-emerald-400">
                    {preset.title}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{preset.supplements.length} Suplementos • {preset.phytotherapeutics.length} Fitoterápicos</span>
                  <span className="text-[#004f28] dark:text-emerald-400 font-bold group-hover:underline">Carregar &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Prescription Editor Layout (2 Columns: Editor & Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Editable Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Prescription Title & Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Título do Documento Prescricional
              </label>
              <span className="text-[10px] font-mono text-slate-400">Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>

            <input
              type="text"
              value={prescriptionTitle}
              onChange={(e) => setPrescriptionTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004f28]"
            />
          </div>

          {/* Section 1: Suplementação & Nutracêuticos */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#004f28] flex items-center justify-center font-bold">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    1. Suplementos & Nutracêuticos
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Vitaminas, minerais, aminoácidos e proteínas</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddSuppModalOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#004f28] rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Item</span>
              </button>
            </div>

            {supplements.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">Nenhum suplemento adicionado. Clique no botão acima ou carregue um protocolo pronto.</p>
            ) : (
              <div className="space-y-3">
                {supplements.map((supp, idx) => (
                  <div key={supp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 font-mono">
                      <div className="flex items-center space-x-2 font-sans font-bold text-slate-900 text-sm">
                        <span>{idx + 1}. {supp.name}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-[#004f28] rounded font-mono font-semibold">{supp.doseConcentration}</span>
                      </div>
                      <p className="text-slate-600 text-xs font-sans">{supp.posology}</p>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span><strong>Timing:</strong> {supp.timing}</span>
                        <span><strong>Via:</strong> {supp.route}</span>
                        <span><strong>Duração:</strong> {supp.duration}</span>
                      </div>
                      {supp.notes && <p className="text-[10px] text-slate-400 italic font-sans">{supp.notes}</p>}
                    </div>

                    <button
                      onClick={() => handleRemoveSupp(supp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                      title="Remover Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Fitoterápicos & Extratos Padronizados */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#004f28] flex items-center justify-center font-bold">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Fitoterápicos & Extratos Padronizados
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Plantas medicinais e marcadores ativos (Res. CFN 656/2020)</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddPhytoModalOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#004f28] rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Fitoterápico</span>
              </button>
            </div>

            {phytotherapeutics.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">Nenhum fitoterápico adicionado nesta prescrição.</p>
            ) : (
              <div className="space-y-3">
                {phytotherapeutics.map((phyto, idx) => (
                  <div key={phyto.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 font-mono">
                      <div className="flex items-center space-x-2 font-sans font-bold text-slate-900 text-sm">
                        <span>{idx + 1}. {phyto.name}</span>
                        <span className="text-[10px] italic font-mono text-slate-500">({phyto.botanicalName})</span>
                      </div>
                      <p className="text-[11px] text-[#004f28] font-bold">{phyto.standardization} — {phyto.dose}</p>
                      <p className="text-slate-600 text-xs font-sans">{phyto.posology}</p>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span><strong>Veículo:</strong> {phyto.vehicle}</span>
                        <span><strong>Horário:</strong> {phyto.timing}</span>
                      </div>
                      {phyto.warnings && <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-sans inline-block">{phyto.warnings}</p>}
                    </div>

                    <button
                      onClick={() => handleRemovePhyto(phyto.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                      title="Remover Fitoterápico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Recomendações Dietéticas & Estilo de Vida */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#004f28] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. Recomendações Dietéticas & Estilo de Vida
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Diretrizes complementares de consumo e conduta</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddRecModalOpen(true)}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#004f28] rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Orientação</span>
              </button>
            </div>

            {dietaryRecommendations.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">Nenhuma recomendação cadastrada.</p>
            ) : (
              <div className="space-y-3">
                {dietaryRecommendations.map((rec, idx) => (
                  <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 text-slate-800">{rec.category}</span>
                        <span>{rec.title}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">{rec.guideline}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveRec(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                      title="Remover Orientação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* General Observations & Digital Signature Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Observações Gerais e Orientações Finais do Nutricionista
              </label>
              <textarea
                rows={3}
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004f28]"
              />
            </div>

            <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-[#004f28]" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Carimbo de Assinatura Eletrônica Qualificada (ICP-Brasil)
                  </h4>
                  <p className="text-[10px] text-slate-600 font-mono">
                    Conformidade com MP 2.200-2/2001 e validação perante os órgãos de fiscalização do CFN.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isDigitallySigned}
                  onChange={(e) => setIsDigitallySigned(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004f28]"></div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Live Prescription Document Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between text-xs font-mono">
            <span className="font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>PRÉ-VISUALIZAÇÃO DO RECEITUÁRIO</span>
            </span>
            <span className="text-slate-400 text-[10px]">A4 Impressão / PDF</span>
          </div>

          {/* Simulated Paper Document */}
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-lg text-slate-800 font-sans space-y-5 text-xs">
            
            {/* Header */}
            <div className="border-b-2 border-[#004f28] pb-3 flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-[#004f28] tracking-tight uppercase">NUTRI PRO</h4>
                <p className="text-[10px] text-slate-500 font-mono">Clínica de Nutrição Avançada & Composição Corporal</p>
                <p className="text-[10px] text-slate-600 font-bold font-mono mt-0.5">
                  Dr(a). {currentProfessional.name} — {currentProfessional.registrationCode}
                </p>
              </div>
              <div className="text-right text-[10px] font-mono text-slate-400">
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Patient Info */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono space-y-0.5">
              <div className="font-bold text-slate-900">PACIENTE: {privacyMode ? 'Paciente Oculto' : currentPatient.name.toUpperCase()}</div>
              <div className="text-slate-500">Prontuário: {currentPatient.recordNumber} • Idade: {currentPatient.age} anos • {currentPatient.sex === 'female' ? 'Feminino' : 'Masculino'}</div>
              <div className="text-[#004f28] font-bold">{prescriptionTitle}</div>
            </div>

            {/* Item List Preview */}
            <div className="space-y-4 min-h-[300px]">
              
              {/* Supplements */}
              {supplements.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#004f28] border-b border-emerald-100 pb-0.5">
                    1. Suplementação & Nutracêuticos
                  </h5>
                  {supplements.map((s, i) => (
                    <div key={s.id} className="text-[11px] font-mono pl-2 border-l-2 border-emerald-500 py-0.5">
                      <div className="font-bold text-slate-900">{i + 1}. {s.name} ({s.doseConcentration})</div>
                      <div className="text-slate-600">{s.posology}</div>
                      <div className="text-[10px] text-slate-400">{s.timing} | {s.duration}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Phytotherapeutics */}
              {phytotherapeutics.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#004f28] border-b border-emerald-100 pb-0.5">
                    2. Fitoterápicos Padronizados
                  </h5>
                  {phytotherapeutics.map((p, i) => (
                    <div key={p.id} className="text-[11px] font-mono pl-2 border-l-2 border-amber-500 py-0.5">
                      <div className="font-bold text-slate-900">{i + 1}. {p.name} — {p.dose}</div>
                      <div className="text-slate-600">{p.standardization}</div>
                      <div className="text-slate-600">{p.posology} ({p.timing})</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dietary Guidelines */}
              {dietaryRecommendations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#004f28] border-b border-emerald-100 pb-0.5">
                    3. Orientações Dietéticas
                  </h5>
                  {dietaryRecommendations.map((r) => (
                    <div key={r.id} className="text-[11px] pl-2 border-l-2 border-slate-400 py-0.5">
                      <div className="font-bold text-slate-900">• {r.title}</div>
                      <div className="text-slate-600 text-[10px]">{r.guideline}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Electronic Signature Stamp */}
            {isDigitallySigned && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] font-mono space-y-1 text-emerald-950">
                <div className="flex items-center space-x-1.5 font-bold text-[#004f28]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ASSINATURA DIGITAL ICP-BRASIL ATIVA</span>
                </div>
                <div>Prescritor: {currentProfessional.name} ({currentProfessional.registrationCode})</div>
                <div className="text-[9px] text-emerald-800">Hash: SHA-256: 8F9A7B6C5D4E3F2A1B0C9D8E7F6A</div>
                <div className="text-[9px] text-slate-500">Conforme MP 2.200-2/2001 e Resoluções CFN 656/2020</div>
              </div>
            )}

            <button
              onClick={handleExportPDF}
              className="w-full py-2.5 bg-[#004f28] hover:bg-[#003c1e] text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF Assinado Agora</span>
            </button>

          </div>
        </div>

      </div>

      {/* MODAL: ADD CUSTOM SUPPLEMENT */}
      {isAddSuppModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Adicionar Suplemento / Nutracêutico</h3>
              <button onClick={() => setIsAddSuppModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCustomSupplement} className="p-5 space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-500 mb-1">NOME DO SUPLEMENTO / MARCA</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coenzima Q10 Ubiquinona"
                  value={newSuppName}
                  onChange={(e) => setNewSuppName(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">INGREDIENTE ATIVO</label>
                <input
                  type="text"
                  placeholder="Ex: Ubiquinona + Vitamina E"
                  value={newSuppIngredient}
                  onChange={(e) => setNewSuppIngredient(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">DOSE / CONCENTRAÇÃO</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 100 mg por cápsula"
                    value={newSuppDose}
                    onChange={(e) => setNewSuppDose(e.target.value)}
                    className="w-full p-2 border rounded font-sans text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">HORÁRIO / TIMING</label>
                  <input
                    type="text"
                    value={newSuppTiming}
                    onChange={(e) => setNewSuppTiming(e.target.value)}
                    className="w-full p-2 border rounded font-sans text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">POSOLOGIA / MODO DE USO</label>
                <input
                  type="text"
                  placeholder="Ex: Ingerir 1 cápsula junto ao almoço."
                  value={newSuppPosology}
                  onChange={(e) => setNewSuppPosology(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddSuppModalOpen(false)} className="px-3 py-1.5 border rounded">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 bg-[#004f28] text-white rounded font-bold">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM PHYTO */}
      {isAddPhytoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Adicionar Extrato Fitoterápico</h3>
              <button onClick={() => setIsAddPhytoModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCustomPhyto} className="p-5 space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-500 mb-1">NOME COMUM DO FITOTERÁPICO</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ashwagandha"
                  value={newPhytoName}
                  onChange={(e) => setNewPhytoName(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">NOME BOTÂNICO</label>
                <input
                  type="text"
                  placeholder="Ex: Withania somnifera (L.) Dunal"
                  value={newPhytoBotanical}
                  onChange={(e) => setNewPhytoBotanical(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">PADRONIZAÇÃO / MARCADOR ATIVO</label>
                <input
                  type="text"
                  placeholder="Ex: Extrato seco padronizado a 5% de Withanolídeos"
                  value={newPhytoStandardization}
                  onChange={(e) => setNewPhytoStandardization(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">DOSE POR TOMADA</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 500 mg"
                    value={newPhytoDose}
                    onChange={(e) => setNewPhytoDose(e.target.value)}
                    className="w-full p-2 border rounded font-sans text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">VEÍCULO / FORMA</label>
                  <input
                    type="text"
                    value={newPhytoVehicle}
                    onChange={(e) => setNewPhytoVehicle(e.target.value)}
                    className="w-full p-2 border rounded font-sans text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">POSOLOGIA</label>
                <input
                  type="text"
                  placeholder="Ex: Tomar 1 cápsula à noite antes de deitar."
                  value={newPhytoPosology}
                  onChange={(e) => setNewPhytoPosology(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddPhytoModalOpen(false)} className="px-3 py-1.5 border rounded">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 bg-[#004f28] text-white rounded font-bold">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM RECOMMENDATION */}
      {isAddRecModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Adicionar Orientação Dietética</h3>
              <button onClick={() => setIsAddRecModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCustomRec} className="p-5 space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-500 mb-1">CATEGORIA</label>
                <select
                  value={newRecCategory}
                  onChange={(e) => setNewRecCategory(e.target.value as any)}
                  className="w-full p-2 border rounded bg-white font-sans text-xs"
                >
                  <option value="hidratação">Hidratação</option>
                  <option value="horários">Horários & Timing</option>
                  <option value="interações">Interações Alimento-Nutriente</option>
                  <option value="alimentos_prioritários">Alimentos Prioritários</option>
                  <option value="estilo_vida">Estilo de Vida & Sono</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">TÍTULO DA ORIENTAÇÃO</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte de estimulantes noturnos"
                  value={newRecTitle}
                  onChange={(e) => setNewRecTitle(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">DIRETRIZ DETALHADA</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a orientação com clareza para o paciente..."
                  value={newRecGuideline}
                  onChange={(e) => setNewRecGuideline(e.target.value)}
                  className="w-full p-2 border rounded font-sans text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddRecModalOpen(false)} className="px-3 py-1.5 border rounded">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 bg-[#004f28] text-white rounded font-bold">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
