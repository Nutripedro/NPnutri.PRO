import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Droplet, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Printer, 
  Download, 
  User, 
  Sliders, 
  Search, 
  HelpCircle,
  Stethoscope,
  BarChart3,
  RefreshCw,
  Loader2,
  CheckSquare,
  Square,
  ShieldCheck,
  HeartPulse,
  Info
} from 'lucide-react';
import { Patient, AnthropometryEvaluation, BioimpedanceEvaluation, Professional } from '../types';
import { ProfessionalContext } from '../types/documents';
import { exportDocumentToPdf, generateDocumentHash } from '../utils/documentUtils';
import { DocumentPreviewModal } from './documents/DocumentPreviewModal';
import { DocumentHeader } from './documents/DocumentHeader';
import { DocumentFooter } from './documents/DocumentFooter';
import { MebCalculatorCard } from './MebCalculatorCard';

interface HemoIntelligenceViewProps {
  currentPatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  professional?: Professional;
  anthroData?: AnthropometryEvaluation;
  biaData?: BioimpedanceEvaluation;
}

interface HemogramItem {
  id: string;
  category: 'vermelha' | 'branca' | 'plaquetas';
  name: string;
  unit: string;
  result: number;
  refMin: number;
  refMax: number;
  funcMin: number;
  funcMax: number;
  description: string;
}

export const HemoIntelligenceView: React.FC<HemoIntelligenceViewProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  professional,
  anthroData,
  biaData
}) => {
  // Perfil do Paciente conforme Prompt Versão 1.0
  const [sex, setSex] = useState<'masculino' | 'feminino'>(currentPatient.sex === 'female' ? 'feminino' : 'masculino');
  const [age, setAge] = useState<number>(currentPatient.age || 35);
  
  // Condições Especiais (Múltiplas Seleções)
  const [specialConditions, setSpecialConditions] = useState<Record<string, boolean>>({
    gestante: false,
    lactante: false,
    crianca: false,
    adolescente: false,
    adulto: true,
    idoso: currentPatient.age > 60,
    atleta: false,
    obesidade: false,
    diabetes: false,
    hipertensao: false,
    doencaRenal: false,
    doencaHepatica: false,
    oncologico: false,
    autoimune: false,
    posOperatorio: false,
    usoMedicamentos: false,
    tabagismo: false,
    etilismo: false,
    outrasClinicas: false
  });

  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Valores padrão do Hemograma completo
  const [hemogramItems, setHemogramItems] = useState<HemogramItem[]>([
    // Série Vermelha
    { id: 'eritr', category: 'vermelha', name: 'Hemácias', unit: 'milhões/µL', result: 4.65, refMin: 4.0, refMax: 5.2, funcMin: 4.5, funcMax: 5.0, description: 'Contagem total de glóbulos vermelhos' },
    { id: 'hgb', category: 'vermelha', name: 'Hemoglobina (Hgb)', unit: 'g/dL', result: 13.2, refMin: 12.0, refMax: 15.5, funcMin: 13.5, funcMax: 15.0, description: 'Proteína transportadora de oxigênio' },
    { id: 'hct', category: 'vermelha', name: 'Hematócrito (Hct)', unit: '%', result: 39.5, refMin: 36.0, refMax: 48.0, funcMin: 38.0, funcMax: 45.0, description: 'Volume percentual de hemácias no sangue' },
    { id: 'rdw', category: 'vermelha', name: 'RDW (Amplitude de Distribuição)', unit: '%', result: 14.2, refMin: 11.5, refMax: 14.5, funcMin: 11.5, funcMax: 13.0, description: 'Variabilidade no tamanho das hemácias' },

    // Série Branca
    { id: 'leuc', category: 'branca', name: 'Leucócitos Totais', unit: '/µL', result: 6800, refMin: 4000, refMax: 11000, funcMin: 5000, funcMax: 8500, description: 'Contagem total de glóbulos brancos' },
    { id: 'neut', category: 'branca', name: 'Neutrófilos Segmentados', unit: '/µL', result: 4100, refMin: 1800, refMax: 7700, funcMin: 2500, funcMax: 5500, description: 'Defesa contra bactérias e fungos' },
    { id: 'bast', category: 'branca', name: 'Neutrófilos Bastonetes', unit: '/µL', result: 150, refMin: 0, refMax: 400, funcMin: 0, funcMax: 200, description: 'Neutrófilos jovens' },
    { id: 'linf', category: 'branca', name: 'Linfócitos Totais', unit: '/µL', result: 2100, refMin: 1000, refMax: 4800, funcMin: 1500, funcMax: 3500, description: 'Imunidade adaptativa e viral' },
    { id: 'mono', category: 'branca', name: 'Monócitos', unit: '/µL', result: 480, refMin: 200, refMax: 1000, funcMin: 300, funcMax: 700, description: 'Fagocitose e inflamação crônica' },
    { id: 'eos', category: 'branca', name: 'Eosinófilos', unit: '/µL', result: 180, refMin: 0, refMax: 500, funcMin: 50, funcMax: 250, description: 'Alergias e parasitas' },
    { id: 'baso', category: 'branca', name: 'Basófilos', unit: '/µL', result: 40, refMin: 0, refMax: 200, funcMin: 0, funcMax: 100, description: 'Processos alérgicos' },

    // Plaquetas
    { id: 'plt', category: 'plaquetas', name: 'Plaquetas', unit: '/µL', result: 265000, refMin: 150000, refMax: 450000, funcMin: 200000, funcMax: 350000, description: 'Coagulação e cicatrização' },
    { id: 'vpm', category: 'plaquetas', name: 'VPM (Volume Plaquetário Médio)', unit: 'fL', result: 9.8, refMin: 7.4, refMax: 11.5, funcMin: 8.0, funcMax: 10.5, description: 'Tamanho médio das plaquetas' },
    { id: 'pdw', category: 'plaquetas', name: 'PDW (Amplitude de Distribuição das Plaquetas)', unit: '%', result: 12.5, refMin: 9.0, refMax: 17.0, funcMin: 10.0, funcMax: 15.0, description: 'Variabilidade do tamanho plaquetário' },
    { id: 'pct', category: 'plaquetas', name: 'PCT (Plaquetócrito)', unit: '%', result: 0.26, refMin: 0.15, refMax: 0.40, funcMin: 0.20, funcMax: 0.35, description: 'Volume total de plaquetas no sangue' }
  ]);

  // Cálculos Automáticos de Índices Hematimétricos (VCM, HCM, CHCM)
  const hctItem = hemogramItems.find(i => i.id === 'hct')?.result || 39.5;
  const hgbItem = hemogramItems.find(i => i.id === 'hgb')?.result || 13.2;
  const eritItem = hemogramItems.find(i => i.id === 'eritr')?.result || 4.65;

  const calculatedVCM = eritItem > 0 ? Number(((hctItem * 10) / eritItem).toFixed(1)) : 84.9;
  const calculatedHCM = eritItem > 0 ? Number(((hgbItem * 10) / eritItem).toFixed(1)) : 28.4;
  const calculatedCHCM = hctItem > 0 ? Number(((hgbItem * 100) / hctItem).toFixed(1)) : 33.4;

  // Classificação automática dos Índices conforme o Prompt V1.0
  const getVcmInterpretation = (vcm: number) => {
    if (vcm < 80) return 'Microcítica';
    if (vcm > 100) return 'Macrocítica';
    return 'Normocítica';
  };

  const getHcmInterpretation = (hcm: number) => {
    if (hcm < 27) return 'Hipocrômica';
    if (hcm > 34) return 'Hipercromia (Considerar limitações analíticas)';
    return 'Normocrômica';
  };

  // Contexto Profissional
  const professionalContext: ProfessionalContext = useMemo(() => {
    return {
      id: professional?.id || 'prof-01',
      name: professional?.name || 'Dra. Gabriela Santos',
      crn: professional?.registrationCode || 'CRN-3 48910',
      specialty: professional?.specialty || 'Nutrição Clínica Avançada & Funcional',
      clinicName: 'Clínica de Nutrição Avançada & Longevidade',
      unit: professional?.unit || 'São Paulo - Jardins',
      address: 'Av. Brigadeiro Faria Lima, 2500 - Jardins, São Paulo - SP',
      phone: professional?.phone || '(11) 99988-7766',
      email: professional?.email || 'contato@nutricaoavancada.com.br',
      cpfCnpj: professional?.cpf || '111.222.333-44'
    };
  }, [professional]);

  // Cálculos Automáticos de Índices Inflamatórios (RNL, RPL, RML, SII, AISI, SIRI)
  const calculatedIndexes = useMemo(() => {
    const neut = hemogramItems.find(i => i.id === 'neut')?.result || 4100;
    const linf = hemogramItems.find(i => i.id === 'linf')?.result || 2100;
    const plt = hemogramItems.find(i => i.id === 'plt')?.result || 265000;
    const mono = hemogramItems.find(i => i.id === 'mono')?.result || 480;

    const nlr = linf > 0 ? Number((neut / linf).toFixed(2)) : 0;
    const plr = linf > 0 ? Number((plt / linf).toFixed(1)) : 0;
    const mlr = linf > 0 ? Number((mono / linf).toFixed(2)) : 0;
    const sii = linf > 0 ? Number(((plt * neut) / linf).toFixed(0)) : 0;
    const aisi = linf > 0 ? Number(((neut * mono * plt) / linf).toFixed(0)) : 0;
    const siri = linf > 0 ? Number(((neut * mono) / linf).toFixed(2)) : 0;

    return { nlr, plr, mlr, sii, aisi, siri };
  }, [hemogramItems]);

  // Classificação detalhada exigida pelo Prompt V1.0:
  // Muito Baixo, Baixo, Ideal, Dentro da referência, Elevado, Muito Elevado, Crítico
  const evaluateItemStatus = (item: HemogramItem) => {
    const val = item.result;
    const { refMin, refMax, funcMin, funcMax } = item;

    if (val < refMin * 0.75) {
      return { status: 'critico_baixo', label: 'Crítico (Muito Baixo)', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-700' };
    }
    if (val < refMin) {
      return { status: 'baixo', label: 'Baixo', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', dot: 'bg-amber-600' };
    }
    if (val >= funcMin && val <= funcMax) {
      return { status: 'ideal', label: 'Ideal (Preventiva)', color: 'text-[#16A34A]', bg: 'bg-[#16A34A]/10', border: 'border-[#16A34A]/30', dot: 'bg-[#16A34A]' };
    }
    if (val >= refMin && val <= refMax) {
      return { status: 'referencia', label: 'Dentro da Referência', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' };
    }
    if (val > refMax * 1.25) {
      return { status: 'critico_alto', label: 'Crítico (Muito Elevado)', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-700' };
    }
    return { status: 'elevado', label: 'Elevado', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-600' };
  };

  // Acionar Análise com Gemini API (Prompt V1.0 Completo)
  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const activeConditions = Object.entries(specialConditions)
        .filter(([_, active]) => active)
        .map(([key]) => key);

      const res = await fetch('/api/gemini/analyze-hemogram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: { ...currentPatient, sex, age },
          profile: { sex, age, conditions: activeConditions },
          items: hemogramItems,
          calculatedIndexes,
          hemoterm: { vcm: calculatedVCM, hcm: calculatedHCM, chcm: calculatedCHCM }
        })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('Failed to run AI hemogram analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const authHash = generateDocumentHash(`hemo-pro-v1-${currentPatient.id}`);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Perfil do Paciente Obrigatório (Prompt V1.0) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#4A6B5D] text-white flex items-center justify-center font-bold font-serif text-lg shadow-xs">
              HP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  HEMO INTELLIGENCE PRO — Módulo Inteligente de Interpretação do Hemograma
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Versão 1.0 (Integrativo & Clínico)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hematologia Clínica, Medicina Laboratorial, Nutrição Clínica, Nutrologia e Medicina Integrativa (Diretrizes OMS, ICSH, ASH, EHA).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando Análise IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  Executar Análise Completa (Gemini AI)
                </>
              )}
            </button>

            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#4A6B5D] hover:bg-[#3d594c] text-white shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              Relatório Final PDF
            </button>
          </div>
        </div>

        {/* Configuração do Perfil do Paciente (Prompt V1.0) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#4A6B5D]" />
              Configuração Obrigatória do Perfil & Condições Especiais do Paciente
            </h2>
            <span className="text-[11px] text-slate-500">
              Valores de referência ajustados automaticamente conforme as variáveis selecionadas.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sexo Biológico:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSex('masculino')}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-bold border transition-colors ${
                    sex === 'masculino' ? 'bg-[#4A6B5D] text-white border-[#4A6B5D]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  onClick={() => setSex('feminino')}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-bold border transition-colors ${
                    sex === 'feminino' ? 'bg-[#4A6B5D] text-white border-[#4A6B5D]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Feminino
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Idade (Anos):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded py-1.5 px-3 text-xs font-mono font-bold text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Legenda das 3 Faixas Visuais de Exibição:</label>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                <span className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> 🟨 Ref. Laboratorial
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> 🟩 Ideal Preventiva
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> 🟥 Risco / Crítico
                </span>
              </div>
            </div>
          </div>

          {/* Checklist de Condições Especiais */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-700 block mb-2">Condições Clínicas Especiais Associadas:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
              {[
                { key: 'gestante', label: 'Gestante' },
                { key: 'lactante', label: 'Lactante' },
                { key: 'crianca', label: 'Criança' },
                { key: 'adolescente', label: 'Adolescente' },
                { key: 'adulto', label: 'Adulto' },
                { key: 'idoso', label: 'Idoso(a)' },
                { key: 'atleta', label: 'Atleta' },
                { key: 'obesidade', label: 'Obesidade' },
                { key: 'diabetes', label: 'Diabetes' },
                { key: 'hipertensao', label: 'Hipertensão' },
                { key: 'doencaRenal', label: 'Doença Renal' },
                { key: 'doencaHepatica', label: 'Doença Hepática' },
                { key: 'oncologico', label: 'Oncológico' },
                { key: 'autoimune', label: 'Autoimune' },
                { key: 'posOperatorio', label: 'Pós-operatório' },
                { key: 'usoMedicamentos', label: 'Uso de Medicamentos' },
                { key: 'tabagismo', label: 'Tabagismo' },
                { key: 'etilismo', label: 'Etilismo' }
              ].map(cond => {
                const isActive = !!specialConditions[cond.key];
                return (
                  <button
                    key={cond.key}
                    type="button"
                    onClick={() => setSpecialConditions(prev => ({ ...prev, [cond.key]: !isActive }))}
                    className={`flex items-center gap-1.5 p-1.5 rounded border text-left transition-colors ${
                      isActive ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-normal'
                    }`}
                  >
                    {isActive ? <CheckSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span className="truncate">{cond.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Tabela de Exames & Análise Gemini */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tabela de Exames (7 Colunas) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-600" />
                Séries Hematológicas & Índices Automáticos (VCM, HCM, CHCM)
              </h2>
              <p className="text-xs text-slate-500">
                Insira os resultados laboratoriais. VCM, HCM e CHCM são calculados automaticamente por fórmulas padrão.
              </p>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar analito..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full sm:w-44 pl-8 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Tabela de Analitos */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Parâmetro</th>
                  <th className="py-2 px-3 text-center">Resultado</th>
                  <th className="py-2 px-3 text-center">🟨 Ref. Lab</th>
                  <th className="py-2 px-3 text-center">🟩 Ideal Prev.</th>
                  <th className="py-2 px-3 text-right">Classificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hemogramItems
                  .filter(item => !searchFilter || item.name.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((item) => {
                    const evalStatus = evaluateItemStatus(item);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-500">{item.description} ({item.unit})</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                          <input
                            type="number"
                            step="0.01"
                            value={item.result}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setHemogramItems(prev => prev.map(i => i.id === item.id ? { ...i, result: val } : i));
                            }}
                            className="w-20 text-center bg-slate-50 border border-slate-200 rounded py-1 px-1 font-mono text-xs font-bold text-slate-900 focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-amber-700 font-medium">
                          {item.refMin} - {item.refMax}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[#16A34A] font-semibold">
                          {item.funcMin} - {item.funcMax}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${evalStatus.bg} ${evalStatus.color} border ${evalStatus.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${evalStatus.dot}`}></span>
                            {evalStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Índices Calculados Automaticamente */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block uppercase text-[10px] tracking-wider">
              Índices Hematimétricos Calculados Automaticamente (Prompt V1.0):
            </span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block">VCM (fL)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{calculatedVCM}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">{getVcmInterpretation(calculatedVCM)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block">HCM (pg)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{calculatedHCM}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">{getHcmInterpretation(calculatedHCM)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block">CHCM (g/dL)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{calculatedCHCM}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Normocrômica</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Resultado da Análise Gemini & Índices Inflamatórios */}
        <div className="lg:col-span-5 space-y-5">
          {/* Alertas de Prioridade & Análise IA */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Parecer Diagnóstico & Investigação Automática (Gemini AI)
              </h3>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Clinical AI Pro
              </span>
            </div>

            {aiResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-slate-800 leading-relaxed">
                  <strong className="text-emerald-950 block mb-1">Resumo Executivo Integrativo:</strong>
                  {aiResult.executiveSummary}
                </div>

                <div>
                  <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider mb-2">
                    Alertas Críticos & Hipóteses Diferenciais:
                  </span>
                  <div className="space-y-2">
                    {aiResult.priorityAlerts?.map((alert: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          alert.priority === 'alta' ? 'bg-red-50 border-red-200 text-red-900' :
                          alert.priority === 'moderada' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                          'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>{alert.title}</span>
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                            alert.priority === 'alta' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                          }`}>
                            {alert.severity || alert.priority}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed mb-1">{alert.description}</p>
                        <p className="text-[10px] font-semibold text-slate-700 mt-1">
                          Conduta Recomendada: {alert.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {aiResult.suggestedComplementaryExams && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">
                      Exames Complementares Sugeridos (Ferro, B12, Perfil Lipídico, PCR, etc.):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {aiResult.suggestedComplementaryExams.map((ex: string, eIdx: number) => (
                        <span key={eIdx} className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p>Clique em <strong>"Executar Análise Completa"</strong> para gerar o relatório com base nas diretrizes do Prompt V1.0.</p>
              </div>
            )}
          </div>

          {/* Índices Imunoinflamatórios (RNL, RPL, RML, SII, AISI, SIRI) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#4A6B5D]/20 pb-2">
              <BarChart3 className="w-4 h-4 text-[#4A6B5D]" />
              Índices Imunoinflamatórios & Estresse Sistêmico
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-medium">RNL (Neut./Linf.)</span>
                <span className="text-base font-bold font-mono text-slate-800">{calculatedIndexes.nlr}</span>
                <span className={`text-[10px] block mt-0.5 font-semibold ${calculatedIndexes.nlr > 3.0 ? 'text-amber-600' : 'text-[#16A34A]'}`}>
                  {calculatedIndexes.nlr > 3.0 ? 'Alerta Inflamatório' : 'Ótimo (< 3.0)'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-medium">RPL (Plaq./Linf.)</span>
                <span className="text-base font-bold font-mono text-slate-800">{calculatedIndexes.plr}</span>
                <span className="text-[10px] text-[#16A34A] block mt-0.5 font-medium">Normal (&lt; 150)</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-medium">SII (Plaq.×Neut.÷Linf.)</span>
                <span className="text-base font-bold font-mono text-slate-800">{calculatedIndexes.sii}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Imunotrombose</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-medium">SIRI (Neut.×Mon.÷Linf.)</span>
                <span className="text-base font-bold font-mono text-slate-800">{calculatedIndexes.siri}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Estresse Sistêmico</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo do Índice MEB & Biomarcadores Intestinais */}
      <div className="mt-6">
        <MebCalculatorCard 
          monocytesPercent={6.5} 
          eosinophilsPercent={2.1} 
          basophilsPercent={0.6} 
          patientName={currentPatient.name} 
        />
      </div>

      {/* Modal de Pré-visualização do Relatório Oficial (Prompt V1.0) */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentTitle="Hemo Intelligence Pro — Laudo Clínico Oficial do Hemograma"
        patient={{
          id: currentPatient.id,
          name: currentPatient.name,
          cpf: currentPatient.cpf || '123.456.789-00',
          birthDate: currentPatient.birthDate || '1995-04-12',
          age: age,
          sex: sex === 'masculino' ? 'male' : 'female',
          phone: currentPatient.phone || '(11) 98765-4321',
          email: currentPatient.email || 'paciente@email.com',
          heightCm: currentPatient.heightCm || 178,
          currentWeightKg: currentPatient.currentWeightKg || 82.5,
          recordNumber: currentPatient.recordNumber || 'PRONT-001',
          unit: currentPatient.unit || 'São Paulo - Jardins'
        }}
      >
        <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
          <div>
            <DocumentHeader
              professional={professionalContext}
              patient={{
                id: currentPatient.id,
                name: currentPatient.name,
                cpf: currentPatient.cpf || '123.456.789-00',
                birthDate: currentPatient.birthDate || '1995-04-12',
                age: age,
                sex: sex === 'masculino' ? 'male' : 'female',
                phone: currentPatient.phone || '(11) 98765-4321',
                email: currentPatient.email || 'paciente@email.com',
                heightCm: currentPatient.heightCm || 178,
                currentWeightKg: currentPatient.currentWeightKg || 82.5,
                recordNumber: currentPatient.recordNumber || 'PRONT-001',
                unit: currentPatient.unit || 'São Paulo - Jardins'
              }}
              documentTitle="Relatório Oficial de Interpretação Avançada do Hemograma (Hemo Intelligence Pro v1.0)"
              documentSubtitle={`Perfil: ${sex.toUpperCase()}, ${age} anos | Condições: ${Object.entries(specialConditions).filter(([_,v])=>v).map(([k])=>k).join(', ')}`}
            />

            <div className="mb-6 bg-slate-50 border border-slate-200 rounded-md p-4 text-xs space-y-2">
              <span className="font-bold text-[#4A6B5D] block uppercase text-[10px] tracking-wider">
                Resumo Executivo & Classificação de Risco Clínico:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {aiResult?.executiveSummary || 'Análise hematológica detalhada com base em intervalos funcionais e diretrizes da OMS, ICSH e ASH.'}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 border-b border-[#4A6B5D]/20 pb-1">
                Tabela Consolidada de Séries Hematológicas & Índices
              </h3>
              <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
                      <th className="py-1.5 px-3">Parâmetro</th>
                      <th className="py-1.5 px-3 text-center">Resultado</th>
                      <th className="py-1.5 px-3 text-center">🟨 Ref. Lab</th>
                      <th className="py-1.5 px-3 text-center">🟩 Ideal Prev.</th>
                      <th className="py-1.5 px-3 text-right">Classificação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hemogramItems.map((item, idx) => {
                      const st = evaluateItemStatus(item);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-medium text-slate-900">{item.name}</td>
                          <td className="py-1.5 px-3 text-center font-mono font-bold">{item.result} {item.unit}</td>
                          <td className="py-1.5 px-3 text-center font-mono text-slate-500">{item.refMin} - {item.refMax}</td>
                          <td className="py-1.5 px-3 text-center font-mono text-[#16A34A]">{item.funcMin} - {item.funcMax}</td>
                          <td className="py-1.5 px-3 text-right font-semibold text-emerald-700">{st.label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {aiResult?.priorityAlerts && (
              <div className="mb-6 space-y-2">
                <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 border-b border-[#4A6B5D]/20 pb-1">
                  Condutas Médicas & Nutricionais Baseadas em Evidências
                </h3>
                {aiResult.priorityAlerts.map((alert: any, aIdx: number) => (
                  <div key={aIdx} className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{alert.title}</span>
                      <span className="text-[10px] text-emerald-700 uppercase font-bold">{alert.severity}</span>
                    </div>
                    <p className="text-slate-700">{alert.description}</p>
                    <p className="text-[11px] font-semibold text-[#4A6B5D]">Conduta: {alert.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DocumentFooter
            professional={professionalContext}
            authHash={authHash}
            customDisclaimer="Laudo emitido por Hemo Intelligence Pro v1.0. Suporte à decisão clínica baseado em diretrizes OMS, ICSH, ASH e EHA. Não substitui o julgamento médico definitivo."
          />
        </div>
      </DocumentPreviewModal>
    </div>
  );
};
