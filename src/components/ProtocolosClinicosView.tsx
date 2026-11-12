import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Zap, 
  Target, 
  Pill, 
  CheckSquare, 
  FileText, 
  User, 
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { Patient, Professional } from '../types';

export interface ClinicalProtocolTemplate {
  id: string;
  title: string;
  category: 'emagrecimento' | 'hipertrofia' | 'performance' | 'saude_intestinal' | 'longevidade' | 'bariatrica';
  objective: string;
  targetCalorieDelta: number; // ex: -500 ou +400
  proteinPerKg: number;      // ex: 2.2
  waterMlPerKg: number;      // ex: 40
  supplements: {
    title: string;
    dosage: string;
    timing: string;
  }[];
  labExams: string[];
  guidelines: string[];
  createdAt: string;
}

interface ProtocolosClinicosViewProps {
  currentPatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  professional?: Professional;
  onApplyProtocolToPatient?: (protocol: ClinicalProtocolTemplate) => void;
}

const DEFAULT_PROTOCOLS: ClinicalProtocolTemplate[] = [
  {
    id: 'proto-01',
    title: 'Protocolo de Emagrecimento Metabólico & Déficit Limpo',
    category: 'emagrecimento',
    objective: 'Redução de gordura corporal com preservação máxima de massa magra e regulação da saciedade.',
    targetCalorieDelta: -450,
    proteinPerKg: 2.2,
    waterMlPerKg: 40,
    supplements: [
      { title: 'Magnésio Inositol (Quelato)', dosage: '350mg', timing: 'Noite (45 min antes de deitar)' },
      { title: 'Coenzima Q10 (Ubiquinona)', dosage: '100mg', timing: 'Café da manhã' },
      { title: 'Cromo Picolinato', dosage: '300mcg', timing: 'Almoço' }
    ],
    labExams: ['Ferritina Sérica', 'Perfil Lipídico Completo', 'Glicemia de Jejum & Insulina', 'TSH, T4 Livre e T3 Reverso', 'Vitamina D3'],
    guidelines: [
      'Manter ingestão hídrica de 40ml por kg de peso corporal.',
      'Priorizar proteínas de alto valor biológico em todas as refeições principais.',
      'Evitar carboidratos simples isolados nas duas últimas refeições do dia.'
    ],
    createdAt: '2026-01-10'
  },
  {
    id: 'proto-02',
    title: 'Protocolo de Hipertrofia Limpa & Síntese Proteica',
    category: 'hipertrofia',
    objective: 'Aumento progressivo de massa livre de gordura com controle de lipídios e suporte ergogênico.',
    targetCalorieDelta: 350,
    proteinPerKg: 2.4,
    waterMlPerKg: 45,
    supplements: [
      { title: 'Creatina Monohidratada Micronizada', dosage: '5g', timing: 'Pós-treino ou horário fixo' },
      { title: 'Whey Protein Isolado / Hidrolisado', dosage: '30g', timing: 'Pós-treino' },
      { title: 'Ômega 3 (EPA/DHA alta concentração)', dosage: '2g', timing: 'Almoço e Jantar' }
    ],
    labExams: ['Creatinina & Ureia', 'TGP, TGO e Gama-GT', 'Perfil Lipídico', 'Hemograma Completo'],
    guidelines: [
      'Fracionar o consumo proteico em 4 a 5 tomadas diárias de pelo menos 30g.',
      'Garantir carboidratos de baixo/médio índice glicêmico no pré-treino.',
      'Descanso noturno de 7 a 9 horas para otimização do GH e recuperação.'
    ],
    createdAt: '2026-01-15'
  },
  {
    id: 'proto-03',
    title: 'Protocolo de Saúde Intestinal & Modulação da Barreira (FODMAP)',
    category: 'saude_intestinal',
    objective: 'Redução de disbiose, recuperação da mucosa intestinal e eliminação de sintomas de distensão.',
    targetCalorieDelta: 0,
    proteinPerKg: 1.8,
    waterMlPerKg: 35,
    supplements: [
      { title: 'L-Glutamina em Pó', dosage: '10g', timing: 'Em jejum pela manhã' },
      { title: 'Probiótico Multi-cepas (Lactobacillus & Bifidobacterium)', dosage: '10 bilhões UFC', timing: 'Ao deitar' },
      { title: 'Enzimas Digestivas (Protease, Lipase, Amilase)', dosage: '1 cápsula', timing: 'Principal refeição (almoço/jantar)' }
    ],
    labExams: ['Calprotectina Fecal', 'Parasitológico de Fezes', 'Zinco Plasmático', 'PCR-US'],
    guidelines: [
      'Evitar alimentos ultraprocessados, adoçantes artificiais e glúten por 30 dias.',
      'Mastigar cada refeição pelo menos 25 vezes antes de deglutir.',
      'Consumir caldos de ossos ricos em colágeno e aminoácidos precursores da mucosa.'
    ],
    createdAt: '2026-02-01'
  }
];

export const ProtocolosClinicosView: React.FC<ProtocolosClinicosViewProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  professional,
  onApplyProtocolToPatient
}) => {
  const [protocols, setProtocols] = useState<ClinicalProtocolTemplate[]>(() => {
    const saved = localStorage.getItem('nutri_clinical_protocols');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PROTOCOLS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form state for new/editing protocol
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<any>('emagrecimento');
  const [formObjective, setFormObjective] = useState<string>('');
  const [formCalories, setFormCalories] = useState<number>(-400);
  const [formProtein, setFormProtein] = useState<number>(2.0);
  const [formWater, setFormWater] = useState<number>(40);
  const [formSupplementsText, setFormSupplementsText] = useState<string>('Magnésio: 350mg (Noite)\nCreatina: 5g (Pós-treino)');
  const [formExamsText, setFormExamsText] = useState<string>('Ferritina\nPerfil Lipídico\nGlicemia de Jejum');
  const [formGuidelinesText, setFormGuidelinesText] = useState<string>('Beber 40ml de água por kg.\nEvitar ultraprocessados.');

  const handleSaveProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newProto: ClinicalProtocolTemplate = {
      id: `proto-${Date.now()}`,
      title: formTitle,
      category: formCategory,
      objective: formObjective || 'Conduta clínica personalizada.',
      targetCalorieDelta: formCalories,
      proteinPerKg: formProtein,
      waterMlPerKg: formWater,
      supplements: formSupplementsText.split('\n').filter(Boolean).map(line => {
        const parts = line.split(':');
        return {
          title: parts[0]?.trim() || 'Suplemento',
          dosage: parts[1]?.trim() || '1 dose',
          timing: 'Conforme orientação'
        };
      }),
      labExams: formExamsText.split('\n').filter(Boolean),
      guidelines: formGuidelinesText.split('\n').filter(Boolean),
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newProto, ...protocols];
    setProtocols(updated);
    localStorage.setItem('nutri_clinical_protocols', JSON.stringify(updated));
    setIsModalOpen(false);
    setFormTitle('');
    setFormObjective('');
  };

  const handleDeleteProtocol = (id: string) => {
    const updated = protocols.filter(p => p.id !== id);
    setProtocols(updated);
    localStorage.setItem('nutri_clinical_protocols', JSON.stringify(updated));
  };

  const handleApplyToPatient = (protocol: ClinicalProtocolTemplate) => {
    if (onApplyProtocolToPatient) {
      onApplyProtocolToPatient(protocol);
    }
    setSuccessMessage(`Protocolo "${protocol.title}" aplicado com sucesso ao paciente ${currentPatient.name}!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredProtocols = protocols.filter(p => {
    const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.objective.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#4A6B5D] text-white flex items-center justify-center font-bold font-serif text-lg shadow-xs">
              PR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Protocolos Clínicos & Templates de Conduta
                </h1>
                <span className="bg-[#4A6B5D]/10 text-[#4A6B5D] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#4A6B5D]/20">
                  Clean Sage
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Crie e gerencie templates pré-configurados (emagrecimento, hipertrofia, performance) para aplicação instantânea em novos pacientes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Paciente Alvo:</span>
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
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#4A6B5D] hover:bg-[#3d594c] text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Template de Protocolo
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'emagrecimento', label: 'Emagrecimento' },
            { id: 'hipertrofia', label: 'Hipertrofia' },
            { id: 'performance', label: 'Performance' },
            { id: 'saude_intestinal', label: 'Saúde Intestinal' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#4A6B5D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <BookOpen className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar protocolo..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
          />
        </div>
      </div>

      {/* Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProtocols.map(proto => (
          <div 
            key={proto.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#4A6B5D]/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  proto.category === 'emagrecimento' ? 'bg-amber-100 text-amber-800' :
                  proto.category === 'hipertrofia' ? 'bg-emerald-100 text-emerald-800' :
                  proto.category === 'saude_intestinal' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {proto.category.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleDeleteProtocol(proto.id)}
                  className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                  title="Excluir Protocolo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{proto.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{proto.objective}</p>

              {/* Metas Macro & Calorias */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Calorias</span>
                  <strong className="text-slate-800 font-mono text-xs">
                    {proto.targetCalorieDelta > 0 ? `+${proto.targetCalorieDelta}` : proto.targetCalorieDelta} kcal
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Proteína</span>
                  <strong className="text-[#4A6B5D] font-mono text-xs">{proto.proteinPerKg}g/kg</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Água</span>
                  <strong className="text-slate-800 font-mono text-xs">{proto.waterMlPerKg}ml/kg</strong>
                </div>
              </div>

              {/* Fórmulas e Exames */}
              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-700">
                  • Suplementos ({proto.supplements?.length || 0}) & Exames ({proto.labExams?.length || 0})
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Criado em {proto.createdAt}</span>
              <button
                onClick={() => handleApplyToPatient(proto)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors shadow-2xs"
              >
                <span>Aplicar ao Paciente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar Novo Protocolo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#4A6B5D] flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Novo Template de Protocolo Clínico</h3>
                  <p className="text-xs text-slate-400">Configure as metas, suplementos e condutas padrão</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProtocol} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Título do Protocolo:</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Protocolo de Emagrecimento Avançado"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoria:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800"
                  >
                    <option value="emagrecimento">Emagrecimento</option>
                    <option value="hipertrofia">Hipertrofia</option>
                    <option value="performance">Performance</option>
                    <option value="saude_intestinal">Saúde Intestinal</option>
                    <option value="longevidade">Longevidade</option>
                    <option value="bariatrica">Bariátrica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Balanço Calórico (kcal):</label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Proteína Alvo (g/kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formProtein}
                    onChange={(e) => setFormProtein(parseFloat(e.target.value) || 2.0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hidratação (ml/kg):</label>
                  <input
                    type="number"
                    value={formWater}
                    onChange={(e) => setFormWater(parseInt(e.target.value) || 40)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Objetivo Clínico:</label>
                <textarea
                  rows={2}
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  placeholder="Descreva o objetivo terapêutico do protocolo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Suplementos Padrão (Um por linha: Nome: Dosagem):</label>
                <textarea
                  rows={3}
                  value={formSupplementsText}
                  onChange={(e) => setFormSupplementsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exames Laboratoriais (Um por linha):</label>
                <textarea
                  rows={3}
                  value={formExamsText}
                  onChange={(e) => setFormExamsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded text-xs font-bold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors shadow-xs"
                >
                  Salvar Template de Protocolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
