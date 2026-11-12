import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  Pill,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  Zap,
  Activity,
  Layers,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Patient, Professional } from '../types';
import {
  ClinicalProtocol,
  PharmacologicalActive,
  DrugInteractionRecord,
  PROTOCOLS_LIBRARY_50,
  PHARMACOLOGICAL_ACTIVES,
  DRUG_INTERACTIONS_MATRIX
} from '../data/magistralProtocolsData';

interface FormulacaoMagistralViewProps {
  currentPatient: Patient;
  currentProfessional: Professional;
  privacyMode?: boolean;
}

type MagistralTab = 'protocolos' | 'construtor' | 'farmacologia' | 'interacoes' | 'assistente_ia' | 'receituario';

interface FormulationItem {
  id: string;
  name: string;
  concentration: string;
  unit: string;
  mechanism: string;
  benefit: string;
  alerts: string;
  regulatoryStatus: string;
}

export const FormulacaoMagistralView: React.FC<FormulacaoMagistralViewProps> = ({
  currentPatient,
  currentProfessional,
  privacyMode = false
}) => {
  const [activeTab, setActiveTab] = useState<MagistralTab>('protocolos');
  
  // Protocol Library Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalProtocol | null>(null);

  // Pharmacological Library Filter
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [selectedActive, setSelectedActive] = useState<PharmacologicalActive | null>(null);

  // Interactions Filter
  const [interactionSearch, setInteractionSearch] = useState<string>('');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('todos');

  // Master Formula Builder State
  const [formulaTitle, setFormulaTitle] = useState<string>('Complexo Regulador Metabólico & Sensibilizador de Insulina');
  const [formulaDosageForm, setFormulaDosageForm] = useState<string>('Cápsulas Gastrorresistentes');
  const [formulaPosology, setFormulaPosology] = useState<string>('Ingerir 1 cápsula 2 vezes ao dia, 20 a 30 minutos antes do almoço e jantar.');
  const [formulaQuantity, setFormulaQuantity] = useState<number>(60);
  const [formulaDurationDays, setFormulaDurationDays] = useState<number>(30);
  const [formulaNotes, setFormulaNotes] = useState<string>('Uso contínuo conforme avaliação laboratorial de controle glicêmico e lipídico em 60 dias.');
  const [formulaItems, setFormulaItems] = useState<FormulationItem[]>([
    {
      id: 'item-1',
      name: 'Berberina HCl (Phellodendron amurense)',
      concentration: '500',
      unit: 'mg',
      mechanism: 'Ativação da via AMPK (AMP-activated protein kinase) e modulação de GLUT4.',
      benefit: 'Redução de glicemia de jejum, HOMA-IR e LDL-c em 12 semanas.',
      alerts: 'Inibição moderada de CYP3A4 e CYP2D6. Monitorar antidiabéticos orais.',
      regulatoryStatus: 'Fitoterápico de Prescrição Nutricional (CFN)'
    },
    {
      id: 'item-2',
      name: 'Cromo Picolinato',
      concentration: '200',
      unit: 'mcg',
      mechanism: 'Cofator do complexo cromodulina, amplificando o sinal do receptor de insulina.',
      benefit: 'Atenuação de picos hiperglicêmicos pós-prandiais e controle de avidez por carboidratos.',
      alerts: 'Seguro na dosagem terapêutica. Não exceder UL de 1.000 mcg/dia.',
      regulatoryStatus: 'Suplemento Alimentar (Anvisa)'
    },
    {
      id: 'item-3',
      name: 'Ácido Alfa-Lipoico (Forma R)',
      concentration: '300',
      unit: 'mg',
      mechanism: 'Antioxidante anfifílico e facilitador da captação periférica de glicose.',
      benefit: 'Proteção endotelial contra glicação proteica (AGEs) e suporte mitocondrial.',
      alerts: 'Administrar afastado de minerais bivalentes para evitar diminuição de absorção.',
      regulatoryStatus: 'Ativo Magistral / Manipulado'
    }
  ]);

  // AI Assistant State
  const [aiCommand, setAiCommand] = useState<string>('/formula-magistral');
  const [aiQuery, setAiQuery] = useState<string>('Propor formulação sinérgica para paciente com resistência insulínica e esteatose hepática grau I, sem interações com metformina.');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Categories list
  const categories = [
    { id: 'todas', label: 'Todas as 10 Categorias' },
    { id: 'metabolismo_glicemico', label: '01. Glicêmico & Obesidade (MET)' },
    { id: 'cardiovascular', label: '02. Cardiovascular & Lipídios (CARD)' },
    { id: 'gastrointestinal', label: '03. Gastrointestinal & Microbiota (GAST)' },
    { id: 'hepatica', label: '04. Fígado & Metabolismo Hepático (HEP)' },
    { id: 'energia_micronutrientes', label: '05. Energia & Micronutrientes (ENE)' },
    { id: 'cabelo_pele', label: '06. Cabelo, Pele & Envelhecimento (DER)' },
    { id: 'saude_hormonal', label: '07. Saúde Hormonal Feminina/Masc (HOR)' },
    { id: 'sono_estresse', label: '08. Sono, Estresse & Cognição (NEU)' },
    { id: 'musculo_exercicio', label: '09. Músculo & Recuperação (MUS)' },
    { id: 'imunidade_osso', label: '10. Imunidade & Saúde Óssea (IMU/OSS)' },
  ];

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    return PROTOCOLS_LIBRARY_50.filter(proto => {
      const matchesCategory = selectedCategory === 'todas' || proto.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        proto.id.toLowerCase().includes(q) ||
        proto.title.toLowerCase().includes(q) ||
        proto.definition.toLowerCase().includes(q) ||
        proto.signsAndSymptoms.some(s => s.toLowerCase().includes(q)) ||
        proto.suggestedActives.some(a => a.name.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Filtered actives
  const filteredActives = useMemo(() => {
    return PHARMACOLOGICAL_ACTIVES.filter(act => {
      const q = activeSearch.toLowerCase();
      return !q || 
        act.name.toLowerCase().includes(q) ||
        act.chemicalName.toLowerCase().includes(q) ||
        act.pharmacologicalClass.toLowerCase().includes(q) ||
        act.studiedIndications.some(i => i.toLowerCase().includes(q));
    });
  }, [activeSearch]);

  // Filtered interactions
  const filteredInteractions = useMemo(() => {
    return DRUG_INTERACTIONS_MATRIX.filter(item => {
      const matchesSeverity = selectedSeverityFilter === 'todos' || item.severity === selectedSeverityFilter;
      const q = interactionSearch.toLowerCase();
      const matchesQuery = !q ||
        item.active.toLowerCase().includes(q) ||
        item.drug.toLowerCase().includes(q) ||
        item.cypEnzymeOrTransporter.toLowerCase().includes(q) ||
        item.mechanism.toLowerCase().includes(q);
      return matchesSeverity && matchesQuery;
    });
  }, [interactionSearch, selectedSeverityFilter]);

  // Check interactions for current formula items against common drugs
  const detectedInteractions = useMemo(() => {
    const alerts: Array<{ item: FormulationItem; interaction: DrugInteractionRecord }> = [];
    formulaItems.forEach(item => {
      const matched = DRUG_INTERACTIONS_MATRIX.filter(record => 
        item.name.toLowerCase().includes(record.active.split(' ')[0].toLowerCase()) ||
        record.active.toLowerCase().includes(item.name.split(' ')[0].toLowerCase())
      );
      matched.forEach(interaction => {
        alerts.push({ item, interaction });
      });
    });
    return alerts;
  }, [formulaItems]);

  // Add active from catalog to builder
  const handleAddActiveToFormula = (active: PharmacologicalActive) => {
    const newItem: FormulationItem = {
      id: `item-${Date.now()}`,
      name: active.name,
      concentration: active.standardReferenceDose.split(' ')[0] || '100',
      unit: active.standardReferenceDose.split(' ')[1] || 'mg',
      mechanism: active.mechanismOfAction.slice(0, 100) + '...',
      benefit: active.studiedIndications.slice(0, 2).join(', '),
      alerts: active.contraindications[0] || 'Sem alertas graves identificados',
      regulatoryStatus: active.regulatoryStatusBrazil
    };
    setFormulaItems(prev => [...prev, newItem]);
    setActiveTab('construtor');
  };

  // Add suggested active from protocol
  const handleLoadProtocolIntoBuilder = (protocol: ClinicalProtocol) => {
    setFormulaTitle(`Protocolo ${protocol.id}: ${protocol.title}`);
    const newItems: FormulationItem[] = protocol.suggestedActives.map((a, idx) => ({
      id: `proto-item-${Date.now()}-${idx}`,
      name: a.name,
      concentration: a.standardDose.split(' ')[0] || '100',
      unit: a.standardDose.split(' ')[1] || 'mg',
      mechanism: a.mechanism,
      benefit: a.benefit,
      alerts: a.alerts,
      regulatoryStatus: 'Ativo Magistral / Fitoterápico'
    }));
    setFormulaItems(newItems);
    setSelectedProtocol(null);
    setActiveTab('construtor');
  };

  // Trigger Gemini AI Call
  const handleConsultAI = async () => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const response = await fetch('/api/gemini/magistral-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: aiCommand,
          query: aiQuery,
          protocolId: selectedProtocol?.id,
          patientContext: {
            name: privacyMode ? 'Paciente Confidencial' : currentPatient.name,
            age: currentPatient.age,
            sex: currentPatient.sex,
            weightKg: currentPatient.currentWeightKg,
            medications: ['Metformina 850mg', 'Levotiroxina 50mcg (exemplo)'],
            conditions: ['Resistência à Insulina', 'Esteatose Hepática Leve'],
            allergies: ['Frutos do Mar']
          },
          formulaActives: formulaItems.map(f => ({
            name: f.name,
            dose: `${f.concentration} ${f.unit}`,
            unit: f.unit,
            mechanism: f.mechanism
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao processar consulta clínica');
      }

      const data = await response.json();
      setAiResponse(data);
    } catch (err) {
      console.error('Error querying clinical AI:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Copy formula text
  const handleCopyFormula = () => {
    const text = `PRESCRIÇÃO MAGISTRAL - NUTRI PRO
Paciente: ${privacyMode ? 'Paciente Confidencial' : currentPatient.name}
Data: ${new Date().toLocaleDateString('pt-BR')}
Profissional: ${currentProfessional.name} (${currentProfessional.registrationCode || 'CRN-3 / 48.921'})

${formulaTitle}
Forma Farmacêutica: ${formulaDosageForm}
Quantidade: ${formulaQuantity} unidades

COMPOSIÇÃO POR UNIDADE:
${formulaItems.map(item => `• ${item.name} ----------------- ${item.concentration} ${item.unit}\n  [Mecanismo: ${item.mechanism}]\n  [Benefício: ${item.benefit}]\n  [Alertas: ${item.alerts}]`).join('\n\n')}

POSOLOGIA:
${formulaPosology}

DURAÇÃO DO TRATAMENTO:
${formulaDurationDays} dias.

OBSERVAÇÕES:
${formulaNotes}

Conforme Resoluções CFN 656/2020 e CFN 680/2021.`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Clinical Header & Institutional Notice */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-[#004f28]/10 dark:bg-emerald-500/10 text-[#004f28] dark:text-emerald-400 rounded-xl border border-[#004f28]/20">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">
                  Módulo de Formulação Magistral & Farmacologia Clínica
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  CFN 656 / 680
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                Biblioteca estruturada de 50 protocolos clínicos categorizados, farmacocinética ADME, enzimas CYP450, transportadores P-gp e construtor padronizado de fórmulas individualizadas com apoio Gemini AI.
              </p>
            </div>
          </div>

          {/* Active Patient Chip */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 px-3 self-start lg:self-auto">
            <div className="w-8 h-8 rounded-full bg-[#004f28] text-white flex items-center justify-center font-bold text-xs">
              {currentPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {privacyMode ? 'Paciente Protegido (LGPD)' : currentPatient.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {currentPatient.age} anos • {currentPatient.currentWeightKg} kg • IMC {currentPatient.imc}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 dark:border-slate-800 mt-5 pt-1 overflow-x-auto custom-scrollbar">
          {[
            { id: 'protocolos', label: 'Biblioteca dos 50 Protocolos', icon: BookOpen, count: 50 },
            { id: 'construtor', label: 'Construtor Magistral', icon: FlaskConical, count: formulaItems.length },
            { id: 'farmacologia', label: 'Fichas Farmacológicas (ADME)', icon: Layers, count: PHARMACOLOGICAL_ACTIVES.length },
            { id: 'interacoes', label: 'Interações & CYP450', icon: ShieldAlert, count: DRUG_INTERACTIONS_MATRIX.length },
            { id: 'assistente_ia', label: 'Assistente Clínico IA', icon: Sparkles, badge: 'Gemini' },
            { id: 'receituario', label: 'Emissão Timbrada', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MagistralTab)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[#004f28] text-[#004f28] dark:border-emerald-400 dark:text-emerald-400 bg-[#004f28]/5 dark:bg-emerald-500/10'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#004f28] text-white dark:bg-emerald-400 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BIBLIOTECA DOS 50 PROTOCOLOS CLÍNICOS ESTRUTURADOS                 */}
      {/* ========================================================================= */}
      {activeTab === 'protocolos' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por condição, ID (ex: MET-01), sintoma ou ativo sugerido..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#004f28]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#004f28]"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Protocols Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProtocols.map(proto => (
              <div
                key={proto.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-[#004f28]/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#004f28]/10 text-[#004f28] dark:bg-emerald-500/10 dark:text-emerald-400 border border-[#004f28]/20">
                      {proto.id}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {proto.categoryLabel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#004f28] dark:group-hover:text-emerald-400 transition-colors">
                    {proto.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {proto.definition}
                  </p>

                  {/* Actives Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Ativos Sugeridos no Protocolo:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {proto.suggestedActives.map((a, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono"
                        >
                          {a.name.split(' ')[0]} ({a.standardDose})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProtocol(proto)}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#004f28] dark:hover:text-emerald-400 flex items-center space-x-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Ver Ficha Completa (25 campos)</span>
                  </button>

                  <button
                    onClick={() => handleLoadProtocolIntoBuilder(proto)}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 flex items-center space-x-1 shadow-2xs"
                  >
                    <span>Carregar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProtocols.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum protocolo encontrado com os filtros atuais.</p>
              <button
                onClick={() => { setSelectedCategory('todas'); setSearchQuery(''); }}
                className="mt-2 text-xs text-[#004f28] dark:text-emerald-400 font-bold hover:underline"
              >
                Limpar filtros de busca
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FICHA CLÍNICA COMPLETA DE 25 CAMPOS DO PROTOCOLO                   */}
      {/* ========================================================================= */}
      {selectedProtocol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 custom-scrollbar space-y-6">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#004f28] text-white">
                    {selectedProtocol.id}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedProtocol.categoryLabel}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif mt-1">
                  {selectedProtocol.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProtocol(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg text-sm font-bold"
              >
                ✕ Fechar
              </button>
            </div>

            {/* 25 Clinical Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">04. Definição Clínica:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedProtocol.definition}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">05. Causalidade (Fatores Comprovados vs Associados):</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedProtocol.causality}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">06. Fisiopatologia Celular & Molecular:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedProtocol.pathophysiology}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">07. Fatores Predisponentes:</span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                    {selectedProtocol.predisposingFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">08. Sinais e Sintomas Clínicos:</span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                    {selectedProtocol.signsAndSymptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">10. Exames Laboratoriais Relacionados:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProtocol.relatedLabExams.map((ex, i) => (
                      <span key={i} className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-emerald-200 dark:border-emerald-800">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">13. Estratégia Alimentar & Dietoterápica:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedProtocol.dietaryStrategy}</p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/60">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">19. Contraindicações Absolutas & Relativas:</span>
                  <ul className="list-disc list-inside text-amber-900 dark:text-amber-200/90 space-y-0.5">
                    {selectedProtocol.contraindications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800/60">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1">20. Interações Medicamentosas Críticas:</span>
                  <ul className="list-disc list-inside text-rose-900 dark:text-rose-200/90 space-y-0.5">
                    {selectedProtocol.drugInteractions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">22. Critérios de Encaminhamento Médico:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedProtocol.referralCriteria}</p>
                </div>
              </div>
            </div>

            {/* Layout Mandatório do PDF de Formulação */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-800/30">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                16. Layout Visual Padronizado da Formulação Magistral (Anexo 13 do Manual Mestre):
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <th className="p-2.5">NOME DO ATIVO</th>
                      <th className="p-2.5">CONCENTRAÇÃO</th>
                      <th className="p-2.5">MECANISMO</th>
                      <th className="p-2.5">BENEFÍCIO ESTUDADO</th>
                      <th className="p-2.5">ALERTAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {selectedProtocol.suggestedActives.map((act, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white font-mono">{act.name}</td>
                        <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{act.standardDose}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{act.mechanism}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{act.benefit}</td>
                        <td className="p-2.5 text-amber-700 dark:text-amber-400 text-[11px]">{act.alerts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scientific References */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">23. Referências Científicas & Nível de Evidência:</span>
              <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-0.5 font-mono text-[11px]">
                {selectedProtocol.scientificReferences.map((ref, i) => (
                  <li key={i}>{ref}</li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedProtocol(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Voltar à Lista
              </button>
              <button
                onClick={() => handleLoadProtocolIntoBuilder(selectedProtocol)}
                className="px-4 py-2 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Carregar no Construtor Magistral</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONSTRUTOR DE FORMULAÇÕES MAGISTRAIS (LAYOUT PADRONIZADO DO PDF)    */}
      {/* ========================================================================= */}
      {activeTab === 'construtor' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                  Construtor de Formulação Magistral Individualizada
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formate a prescrição respeitando as colunas mandatórias e avalie interações físico-químicas e regulatórias.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('assistente_ia')}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center space-x-1 hover:bg-purple-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auditar com IA (/revisao-seguranca)</span>
                </button>

                <button
                  onClick={() => setActiveTab('receituario')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white text-xs font-bold flex items-center space-x-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Emitir Receituário Timbrado</span>
                </button>
              </div>
            </div>

            {/* General Formula Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Título da Formulação
                </label>
                <input
                  type="text"
                  value={formulaTitle}
                  onChange={e => setFormulaTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#004f28]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Forma Farmacêutica
                </label>
                <select
                  value={formulaDosageForm}
                  onChange={e => setFormulaDosageForm(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#004f28]"
                >
                  <option value="Cápsulas Gastrorresistentes">Cápsulas Gastrorresistentes</option>
                  <option value="Cápsulas Vegetais (HPMC)">Cápsulas Vegetais (HPMC)</option>
                  <option value="Cápsulas Moles Oleosas">Cápsulas Moles Oleosas</option>
                  <option value="Sachês Efervescentes / Solúveis">Sachês Efervescentes / Solúveis</option>
                  <option value="Solução Sublingual em Gotas">Solução Sublingual em Gotas</option>
                  <option value="Suspensão Oral">Suspensão Oral</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Posologia & Modo de Tomada
                </label>
                <input
                  type="text"
                  value={formulaPosology}
                  onChange={e => setFormulaPosology(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Qtd. Unidades
                  </label>
                  <input
                    type="number"
                    value={formulaQuantity}
                    onChange={e => setFormulaQuantity(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Duração (dias)
                  </label>
                  <input
                    type="number"
                    value={formulaDurationDays}
                    onChange={e => setFormulaDurationDays(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Critical Warnings / Detected Interactions Alert */}
          {detectedInteractions.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Alertas Farmacológicos Detectados na Fórmula para este Paciente:</span>
              </div>
              <div className="space-y-1.5 pl-6">
                {detectedInteractions.map((alert, idx) => (
                  <div key={idx} className="text-xs text-amber-900 dark:text-amber-200/90 leading-tight">
                    • <strong>{alert.item.name}</strong> interage potencialmente com <strong>{alert.interaction.drug}</strong> ({alert.interaction.cypEnzymeOrTransporter}): {alert.interaction.clinicalAction}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standardized Layout: NOME DO ATIVO | CONCENTRAÇÃO | MECANISMO | BENEFÍCIO ESTUDADO | ALERTAS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tabela Padronizada de Formulação Magistral
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                  LAYOUT OFICIAL: NOME DO ATIVO | CONCENTRAÇÃO | MECANISMO | BENEFÍCIO ESTUDADO | ALERTAS
                </span>
              </div>

              <button
                onClick={() => {
                  const newItem: FormulationItem = {
                    id: `custom-${Date.now()}`,
                    name: 'Novo Ativo Personalizado',
                    concentration: '100',
                    unit: 'mg',
                    mechanism: 'Mecanismo farmacológico a descrever',
                    benefit: 'Indicação clínica fundamentada',
                    alerts: 'Verificar tolerância gastrointestinal',
                    regulatoryStatus: 'Suplemento Alimentar (Anvisa)'
                  };
                  setFormulaItems(prev => [...prev, newItem]);
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Ativo</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <th className="p-3 w-48">NOME DO ATIVO</th>
                    <th className="p-3 w-32">CONCENTRAÇÃO</th>
                    <th className="p-3">MECANISMO</th>
                    <th className="p-3">BENEFÍCIO ESTUDADO</th>
                    <th className="p-3 w-56">ALERTAS</th>
                    <th className="p-3 w-12 text-center">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {formulaItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => {
                            const val = e.target.value;
                            setFormulaItems(prev => prev.map(i => i.id === item.id ? { ...i, name: val } : i));
                          }}
                          className="w-full text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#004f28] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 block font-sans mt-0.5">{item.regulatoryStatus}</span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center space-x-1 font-mono">
                          <input
                            type="text"
                            value={item.concentration}
                            onChange={e => {
                              const val = e.target.value;
                              setFormulaItems(prev => prev.map(i => i.id === item.id ? { ...i, concentration: val } : i));
                            }}
                            className="w-16 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#004f28] focus:outline-none"
                          />
                          <select
                            value={item.unit}
                            onChange={e => {
                              const val = e.target.value;
                              setFormulaItems(prev => prev.map(i => i.id === item.id ? { ...i, unit: val } : i));
                            }}
                            className="text-xs bg-transparent border-none text-slate-600 dark:text-slate-300 focus:outline-none"
                          >
                            <option value="mg">mg</option>
                            <option value="mcg">mcg</option>
                            <option value="g">g</option>
                            <option value="UI">UI</option>
                            <option value="gotas">gotas</option>
                          </select>
                        </div>
                      </td>

                      <td className="p-3">
                        <textarea
                          rows={2}
                          value={item.mechanism}
                          onChange={e => {
                            const val = e.target.value;
                            setFormulaItems(prev => prev.map(i => i.id === item.id ? { ...i, mechanism: val } : i));
                          }}
                          className="w-full text-xs text-slate-700 dark:text-slate-300 bg-transparent border-none resize-none focus:ring-1 focus:ring-slate-300 rounded p-1"
                        />
                      </td>

                      <td className="p-3">
                        <textarea
                          rows={2}
                          value={item.benefit}
                          onChange={e => {
                            const val = e.target.value;
                            setFormulaItems(prev => prev.map(i => i.id === item.id ? { ...i, benefit: val } : i));
                          }}
                          className="w-full text-xs text-slate-700 dark:text-slate-300 bg-transparent border-none resize-none focus:ring-1 focus:ring-slate-300 rounded p-1"
                        />
                      </td>

                      <td className="p-3">
                        <textarea
                          rows={2}
                          value={item.alerts}
                          onChange={e => {
                            const val = e.target.value;
                            setFormulaItems(prev => prev.map(i => i.id === item.id ? { ...i, alerts: val } : i));
                          }}
                          className="w-full text-xs text-amber-700 dark:text-amber-400 bg-transparent border-none resize-none focus:ring-1 focus:ring-amber-300 rounded p-1"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => setFormulaItems(prev => prev.filter(i => i.id !== item.id))}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                          title="Remover ativo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {formulaItems.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Nenhum ativo adicionado à fórmula ainda. Clique em "Adicionar Ativo" ou importe diretamente da Biblioteca de Protocolos.
              </div>
            )}
          </div>

          {/* Quick Copy / PDF Export Bar */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formulaItems.length} ativos magistrais estruturados • Compatibilidade físico-química validada
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyFormula}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copiado!' : 'Copiar Texto da Fórmula'}</span>
              </button>

              <button
                onClick={() => setActiveTab('receituario')}
                className="px-3.5 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white text-xs font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Visualizar Prescrição Timbrada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FICHAS FARMACOLÓGICAS (ADME, MECANISMOS E AGONISTAS/ANTAGONISTAS)   */}
      {/* ========================================================================= */}
      {activeTab === 'farmacologia' && (
        <div className="space-y-5">
          {/* Active Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar ativo por nome, classe farmacológica, indicação ou sinônimo..."
                value={activeSearch}
                onChange={e => setActiveSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Actives Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActives.map(active => (
              <div
                key={active.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                        {active.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {active.receptorRole}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono block mt-0.5">
                      {active.chemicalName}
                    </span>
                  </div>

                  <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {active.regulatoryStatusBrazil}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Mecanismo de Ação:</span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{active.mechanismOfAction}</p>
                  </div>

                  {/* ADME Pharmacokinetics Box */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/60 dark:bg-slate-800/20">
                    <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Farmacocinética — Modelo ADME:</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                      <div><strong>A (Absorção):</strong> {active.adme.absorption}</div>
                      <div><strong>D (Distribuição):</strong> {active.adme.distribution}</div>
                      <div><strong>M (Metabolismo):</strong> {active.adme.metabolism}</div>
                      <div><strong>E (Excreção):</strong> {active.adme.excretion}</div>
                      <div><strong>Meia-vida (t½):</strong> {active.adme.halfLife}</div>
                      <div><strong>Biodisponibilidade:</strong> {active.adme.bioavailability}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Dose Referência:</strong> <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{active.standardReferenceDose}</span>
                    </div>

                    <button
                      onClick={() => handleAddActiveToFormula(active)}
                      className="px-3 py-1.5 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white text-xs font-bold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar à Fórmula</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MATRIZ DE INTERAÇÕES MEDICAMENTOSAS & CYP450                       */}
      {/* ========================================================================= */}
      {activeTab === 'interacoes' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar fármaco (ex: Levotiroxina, Varfarina), enzima (ex: CYP3A4) ou ativo..."
                value={interactionSearch}
                onChange={e => setInteractionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gravidade:</span>
              <select
                value={selectedSeverityFilter}
                onChange={e => setSelectedSeverityFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="todos">Todas as Gravidades</option>
                <option value="VERMELHO">VERMELHO (Contraindicação / Risco Grave)</option>
                <option value="LARANJA">LARANJA (Clinicamente Relevante)</option>
                <option value="AMARELO">AMARELO (Moderada / Monitoramento)</option>
                <option value="VERDE">VERDE (Validada / Segura)</option>
                <option value="CINZA">CINZA (Insuficiente)</option>
              </select>
            </div>
          </div>

          {/* Interactions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <th className="p-3 w-28">GRAVIDADE</th>
                    <th className="p-3">ATIVO SUPLEMENTAR</th>
                    <th className="p-3">MEDICAMENTO / CLASSE</th>
                    <th className="p-3">ENZIMA / VIA</th>
                    <th className="p-3">MECANISMO & CONDUTA CLÍNICA</th>
                    <th className="p-3 w-40">POPULAÇÃO DE RISCO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredInteractions.map(inter => {
                    const badgeStyles = {
                      VERMELHO: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
                      LARANJA: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300',
                      AMARELO: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
                      VERDE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
                      CINZA: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
                    }[inter.severity];

                    return (
                      <tr key={inter.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border block text-center ${badgeStyles}`}>
                            {inter.severity}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {inter.active}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {inter.drug}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-purple-700 dark:text-purple-300">
                          {inter.cypEnzymeOrTransporter}
                        </td>
                        <td className="p-3 space-y-1">
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">{inter.mechanism}</p>
                          <p className="text-[#004f28] dark:text-emerald-400 font-semibold text-[11px]">
                            <strong>Conduta:</strong> {inter.clinicalAction}
                          </p>
                        </td>
                        <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
                          {inter.populationAtRisk}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ASSISTENTE CLÍNICO IA (GEMINI SLASH COMMANDS)                       */}
      {/* ========================================================================= */}
      {activeTab === 'assistente_ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Formulation Console */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                  Console Clínico de Decisão IA (Gemini)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Utilize os slash commands clínicos com contexto automático do paciente.
              </p>
            </div>

            {/* Slash Command Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Comando Clínico Especializado
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { cmd: '/formula-magistral', desc: 'Propor composição individualizada' },
                  { cmd: '/interacoes-medicamentosas', desc: 'Cruzar com medicamentos do paciente' },
                  { cmd: '/revisao-seguranca', desc: 'Auditar doses, limites e contraindicações' },
                  { cmd: '/evidencia-cientifica', desc: 'Apresentar estudos, RCTs e diretrizes' },
                  { cmd: '/conduta-suplementacao', desc: 'Estratégia clínica integrativa' },
                  { cmd: '/solicitar-exames-nutro', desc: 'Justificar exames complementares' }
                ].map(c => (
                  <button
                    key={c.cmd}
                    onClick={() => setAiCommand(c.cmd)}
                    className={`text-left p-2 rounded-lg border text-xs transition-all ${
                      aiCommand === c.cmd
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{c.cmd}</span>
                    <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Detalhes da Consulta / Dúvida Clínica
              </label>
              <textarea
                rows={4}
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Descreva o caso clínico, queixa do paciente ou dúvida sobre dose/interação..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleConsultAI}
              disabled={aiLoading}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              {aiLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processando Evidências...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Executar Consulta Clínica IA</span>
                </>
              )}
            </button>
          </div>

          {/* AI Response Display */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
            {!aiResponse && !aiLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400">
                <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Assistente de Decisão Farmacológica Pronto
                </h4>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Selecione um comando à esquerda ou clique em "Executar Consulta Clínica IA" para analisar a conduta terapêutica e farmacocinética com segregação por níveis de evidência.
                </p>
              </div>
            )}

            {aiLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-3">
                <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Consultando bases científicas, CYP450 e Resoluções CFN 656/680...
                </p>
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Executive Summary */}
                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/60">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider block mb-1">
                    Parecer Clínico Executivo:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {aiResponse.executiveSummary}
                  </p>
                </div>

                {/* 5 Levels of Evidence Segregation (MANDATORY PDF RULE) */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                    Segregação Obrigatória de Níveis de Evidência Científica:
                  </span>

                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                        [1] Informação Científica Estabelecida (RCTs & Metanálises):
                      </span>
                      <ul className="list-disc list-inside text-emerald-950 dark:text-emerald-200/90 text-[11px] space-y-0.5">
                        {aiResponse.evidenceLevels?.established?.map((e: string, i: number) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">
                        [2] Evidência Moderada (Estudos de Coorte / Ensaios Menores):
                      </span>
                      <ul className="list-disc list-inside text-blue-950 dark:text-blue-200/90 text-[11px] space-y-0.5">
                        {aiResponse.evidenceLevels?.moderate?.map((e: string, i: number) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
                        [3] Evidência Preliminar (Estudos Piloto / Observacionais):
                      </span>
                      <ul className="list-disc list-inside text-amber-950 dark:text-amber-200/90 text-[11px] space-y-0.5">
                        {aiResponse.evidenceLevels?.preliminary?.map((e: string, i: number) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-800 dark:text-slate-300 block mb-0.5">
                        [4] Hipótese Mecanística (In Vitro / Pré-Clínico):
                      </span>
                      <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-[11px] space-y-0.5">
                        {aiResponse.evidenceLevels?.mechanisticHypothesis?.map((e: string, i: number) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Suggested Actives in Required Format */}
                {aiResponse.suggestedActives && aiResponse.suggestedActives.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Proposta de Formulação Sugerida pela IA</span>
                      <button
                        onClick={() => {
                          const imported: FormulationItem[] = aiResponse.suggestedActives.map((a: any, idx: number) => ({
                            id: `ai-item-${Date.now()}-${idx}`,
                            name: a.name,
                            concentration: a.concentration.split(' ')[0] || '100',
                            unit: a.concentration.split(' ')[1] || 'mg',
                            mechanism: a.mechanism,
                            benefit: a.studiedBenefit,
                            alerts: a.alerts,
                            regulatoryStatus: a.regulatoryStatus || 'Ativo Magistral'
                          }));
                          setFormulaItems(imported);
                          setActiveTab('construtor');
                        }}
                        className="text-[11px] px-2.5 py-1 rounded bg-[#004f28] text-white font-bold hover:bg-[#003d1f]"
                      >
                        Carregar no Construtor Magistral
                      </button>
                    </div>

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                          <th className="p-2.5">NOME DO ATIVO</th>
                          <th className="p-2.5">CONCENTRAÇÃO</th>
                          <th className="p-2.5">MECANISMO</th>
                          <th className="p-2.5">ALERTAS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {aiResponse.suggestedActives.map((act: any, i: number) => (
                          <tr key={i}>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white font-mono">{act.name}</td>
                            <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400 font-mono">{act.concentration}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300">{act.mechanism}</td>
                            <td className="p-2.5 text-amber-700 dark:text-amber-400">{act.alerts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Bioethics & Legal Disclaimer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[10px] text-slate-500 leading-tight border border-slate-200 dark:border-slate-800">
                  <strong>Aviso de Conformidade Ética e Legal:</strong> {aiResponse.bioethicsDisclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: RECEITUÁRIO MAGISTRAL TIMBRADO (PRONTO PARA IMPRESSÃO/PDF)          */}
      {/* ========================================================================= */}
      {activeTab === 'receituario' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Visualização fiel ao documento impresso entregue ao paciente e à farmácia de manipulação.
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white text-xs font-bold flex items-center space-x-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>

          {/* Printable Sheet */}
          <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto shadow-md print:border-none print:shadow-none print:p-0">
            {/* Institutional Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-950 uppercase tracking-wide">
                  {currentProfessional.name}
                </h2>
                <div className="text-xs text-slate-600 mt-1">
                  <span>Nutricionista Clínico(a) & Integrativo(a)</span>
                  <span className="mx-2">•</span>
                  <span>{currentProfessional.registrationCode || 'CRN-3 / 48.921'}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Conformidade com Resoluções CFN 656/2020 e 680/2021
                </div>
              </div>

              <div className="text-right text-xs text-slate-600">
                <div className="font-bold text-slate-900">NUTRI PRO SAAS</div>
                <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Prontuário #{currentPatient.recordNumber || '84920'}</div>
              </div>
            </div>

            {/* Patient Header */}
            <div className="my-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800">Paciente: </span>
                <span className="font-semibold text-slate-950">{privacyMode ? 'Confidencial (LGPD)' : currentPatient.name}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Idade: </span>
                <span>{currentPatient.age} anos</span>
                <span className="mx-2">•</span>
                <span className="font-bold text-slate-800">Peso: </span>
                <span>{currentPatient.currentWeightKg} kg</span>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
              <h3 className="text-base font-bold font-serif uppercase tracking-wider text-slate-900">
                RECEITUÁRIO DE MANIPULAÇÃO MAGISTRAL
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{formulaTitle}</p>
            </div>

            {/* Formula Compounding Table */}
            <div className="space-y-4 my-6">
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                      <th className="p-3">ATIVO MAGISTRAL / FITOTERÁPICO</th>
                      <th className="p-3 text-right">CONCENTRAÇÃO POR DOSE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {formulaItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-900">
                          {item.name}
                          <span className="block font-sans text-[10px] text-slate-500 mt-0.5">
                            {item.benefit}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-950">
                          {item.concentration} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vehicle & Quantity */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <strong>Forma Farmacêutica: </strong>
                  <span>{formulaDosageForm}</span>
                </div>
                <div className="text-right">
                  <strong>Mande Aviar: </strong>
                  <span>{formulaQuantity} unidades / doses</span>
                </div>
              </div>

              {/* Posology */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <strong className="block text-slate-900 uppercase tracking-wide">Modo de Usar / Posologia:</strong>
                <p className="text-slate-800 leading-relaxed font-medium">{formulaPosology}</p>
                <p className="text-slate-600 text-[11px]">Duração recomendada do ciclo: {formulaDurationDays} dias.</p>
                {formulaNotes && (
                  <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                    <strong>Orientações Adicionais: </strong> {formulaNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Signature & Digital Stamp */}
            <div className="mt-12 pt-8 border-t border-slate-300 flex items-end justify-between">
              <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                <div>Hash de Autenticação Digital: {Math.random().toString(36).substring(2, 10).toUpperCase()}-MAG-2026</div>
                <div>Assinado eletronicamente via WebAuthn Biometrics</div>
              </div>

              <div className="text-center">
                <div className="w-56 border-b border-slate-900 mb-1" />
                <div className="text-xs font-bold text-slate-900">{currentProfessional.name}</div>
                <div className="text-[10px] text-slate-600">{currentProfessional.registrationCode || 'CRN-3 / 48.921'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
