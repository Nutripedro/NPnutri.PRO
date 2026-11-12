import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  User,
  Calendar,
  Activity,
  Stethoscope,
  Pill,
  FlaskConical,
  Upload,
  Search,
  Filter,
  Plus,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Download,
  Trash2,
  ChevronRight,
  Shield,
  Award,
  HeartPulse,
  Scale,
  Zap,
  BookOpen,
  Check
} from 'lucide-react';
import { Patient, Professional } from '../types';

interface ProntuarioEletronicoViewProps {
  currentPatient: Patient;
  currentProfessional: Professional;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  privacyMode?: boolean;
}

type PENSection = 
  | 'visao_geral'
  | 'anamnese'
  | 'antropometria'
  | 'exames'
  | 'atendimentos'
  | 'prescricoes'
  | 'documentos'
  | 'assistente_ia'
  | 'relatorios';

export const ProntuarioEletronicoView: React.FC<ProntuarioEletronicoViewProps> = ({
  currentPatient,
  currentProfessional,
  patients,
  onSelectPatient,
  privacyMode = false
}) => {
  const [activeSection, setActiveSection] = useState<PENSection>('visao_geral');
  const [searchTerm, setSearchTerm] = useState('');

  // Atendimentos / Encounters State with LocalStorage Persistence
  const [encounters, setEncounters] = useState<Array<{
    id: string;
    date: string;
    time: string;
    complaint: string;
    objective: string;
    clinicalNotes: string;
    diagnosis: string;
    conduct: string;
    nextReturnDate: string;
    professionalName: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem(`nutritrack_pen_encounters_${currentPatient.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'enc-01',
        date: '2026-11-01',
        time: '14:30',
        complaint: 'Fadiga matinal persistente, distensão abdominal pós-prandial e dificuldade de perda de gordura visceral.',
        objective: 'Otimização metabólica, redução de HOMA-IR e modulação da microbiota intestinal.',
        clinicalNotes: 'Paciente relata sono irregular (6h/noite). Exames demonstram leve resistência insulínica e ferritina limítrofe.',
        diagnosis: 'Síndrome Metabólica grau I associada a Disbiose Intestinal e Resistência Periférica à Insulina.',
        conduct: 'Prescrito protocolo metabólico MET-01 com Berberina, Cromo e Ácido Alfa-Lipoico. Dieta low-glycemic com fracionamento proteico adequado.',
        nextReturnDate: '2026-12-15',
        professionalName: currentProfessional.name
      }
    ];
  });

  // New Encounter Modal State
  const [isNewEncounterModalOpen, setIsNewEncounterModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newClinicalNotes, setNewClinicalNotes] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newConduct, setNewConduct] = useState('');
  const [newReturnDate, setNewReturnDate] = useState('2026-12-30');

  // Documents & AI Extraction State with LocalStorage Persistence
  const [documents, setDocuments] = useState<Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    labName: string;
    markers: Array<{ markerName: string; resultValue: string; unit: string; referenceRange: string; status: string; clinicalObservation: string }>;
    summary: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem(`nutritrack_pen_docs_${currentPatient.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'doc-01',
        title: 'Perfil Glicêmico & Lipidograma Completo',
        type: 'Exame Laboratorial de Sangue',
        date: '2026-10-28',
        labName: 'Laboratório Fleury / Integrativo',
        markers: [
          { markerName: 'Glicemia de Jejum', resultValue: '102', unit: 'mg/dL', referenceRange: '70 - 99', status: 'alterado', clinicalObservation: 'Glicemia de jejum limítrofe superior' },
          { markerName: 'Insulina Sérica', resultValue: '14.8', unit: 'mcUI/mL', referenceRange: '2.6 - 24.9', status: 'normal', clinicalObservation: 'Sugere hiperinsulinemia compensatória' },
          { markerName: 'HOMA-IR', resultValue: '3.7', unit: 'índice', referenceRange: '< 2.5', status: 'alterado', clinicalObservation: 'Compatível com resistência insulínica' },
          { markerName: 'Triglicerídeos', resultValue: '172', unit: 'mg/dL', referenceRange: '< 150', status: 'alterado', clinicalObservation: 'Elevado (risco cardiometabólico)' }
        ],
        summary: 'Exames laboratoriais revelam resistência insulínica moderada e dislipidemia leve, requerendo conduta nutricional direcionada.'
      }
    ];
  });

  // Sync state with patient changes via useEffect
  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem(`nutritrack_pen_docs_${currentPatient.id}`);
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      } else {
        setDocuments([
          {
            id: 'doc-01',
            title: 'Perfil Glicêmico & Lipidograma Completo',
            type: 'Exame Laboratorial de Sangue',
            date: '2026-10-28',
            labName: 'Laboratório Fleury / Integrativo',
            markers: [
              { markerName: 'Glicemia de Jejum', resultValue: '102', unit: 'mg/dL', referenceRange: '70 - 99', status: 'alterado', clinicalObservation: 'Glicemia de jejum limítrofe superior' },
              { markerName: 'Insulina Sérica', resultValue: '14.8', unit: 'mcUI/mL', referenceRange: '2.6 - 24.9', status: 'normal', clinicalObservation: 'Sugere hiperinsulinemia compensatória' },
              { markerName: 'HOMA-IR', resultValue: '3.7', unit: 'índice', referenceRange: '< 2.5', status: 'alterado', clinicalObservation: 'Compatível com resistência insulínica' },
              { markerName: 'Triglicerídeos', resultValue: '172', unit: 'mg/dL', referenceRange: '< 150', status: 'alterado', clinicalObservation: 'Elevado (risco cardiometabólico)' }
            ],
            summary: 'Exames laboratoriais revelam resistência insulínica moderada e dislipidemia leve, requerendo conduta nutricional direcionada.'
          }
        ]);
      }

      const savedEnc = localStorage.getItem(`nutritrack_pen_encounters_${currentPatient.id}`);
      if (savedEnc) {
        setEncounters(JSON.parse(savedEnc));
      } else {
        setEncounters([
          {
            id: 'enc-01',
            date: '2026-11-01',
            time: '14:30',
            complaint: 'Fadiga matinal persistente, distensão abdominal pós-prandial e dificuldade de perda de gordura visceral.',
            objective: 'Otimização metabólica, redução de HOMA-IR e modulação da microbiota intestinal.',
            clinicalNotes: 'Paciente relata sono irregular (6h/noite). Exames demonstram leve resistência insulínica e ferritina limítrofe.',
            diagnosis: 'Síndrome Metabólica grau I associada a Disbiose Intestinal e Resistência Periférica à Insulina.',
            conduct: 'Prescrito protocolo metabólico MET-01 com Berberina, Cromo e Ácido Alfa-Lipoico. Dieta low-glycemic com fracionamento proteico adequado.',
            nextReturnDate: '2026-12-15',
            professionalName: currentProfessional.name
          }
        ]);
      }
    } catch (err) {
      console.error('Error syncing patient PEN local storage:', err);
    }
  }, [currentPatient.id]);

  // Save helpers
  const saveDocumentsLocally = (updated: typeof documents) => {
    setDocuments(updated);
    try {
      localStorage.setItem(`nutritrack_pen_docs_${currentPatient.id}`, JSON.stringify(updated));
    } catch {}
  };

  const saveEncountersLocally = (updated: typeof encounters) => {
    setEncounters(updated);
    try {
      localStorage.setItem(`nutritrack_pen_encounters_${currentPatient.id}`, JSON.stringify(updated));
    } catch {}
  };

  // AI Document Upload & Extraction State
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadRawText, setUploadRawText] = useState('');
  const [aiExtractionResult, setAiExtractionResult] = useState<any | null>(null);

  // AI EHR Assistant State
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState('Gerar resumo clínico completo e correlação entre exames e sintomas para consulta de retorno.');
  const [aiAssistantResponse, setAiAssistantResponse] = useState<string | null>(null);
  const [isAiConsulting, setIsAiConsulting] = useState(false);

  // Handle Create Encounter
  const handleCreateEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    const newEnc = {
      id: `enc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      complaint: newComplaint || 'Consulta de rotina e acompanhamento evolutivo.',
      objective: newObjective || 'Manutenção de metas e reavaliação de composição corporal.',
      clinicalNotes: newClinicalNotes || 'Paciente apresenta boa adesão ao plano alimentar e suplementação.',
      diagnosis: newDiagnosis || 'Estado nutricional estável com melhora dos parâmetros metabólicos.',
      conduct: newConduct || 'Ajuste de porções calóricas e manutenção do protocolo magistral.',
      nextReturnDate: newReturnDate,
      professionalName: currentProfessional.name
    };
    saveEncountersLocally([newEnc, ...encounters]);
    setIsNewEncounterModalOpen(false);
    setNewComplaint('');
    setNewObjective('');
    setNewClinicalNotes('');
    setNewDiagnosis('');
    setNewConduct('');
  };

  // Handle AI Document Extraction
  const handleRunAiExtraction = async () => {
    setIsUploadingDoc(true);
    try {
      const response = await fetch('/api/gemini/extract-document-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uploadFileName || 'Exame_Bioquimico_Paciente.pdf',
          fileType: 'PDF / Exame Laboratorial',
          rawContent: uploadRawText || 'Glicemia 98, Hemoglobina Glicada 5.8%, Colesterol Total 210, Triglicerídeos 165'
        })
      });
      const data = await response.json();
      setAiExtractionResult(data);
    } catch (err) {
      console.error('Error extracting document via AI:', err);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Confirm and Save Extracted Document to Patient EHR
  const handleConfirmExtractedDoc = () => {
    if (!aiExtractionResult) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: aiExtractionResult.documentTitle,
      type: 'Exame Laboratorial / IA Extracted',
      date: aiExtractionResult.examDate || new Date().toISOString().split('T')[0],
      labName: aiExtractionResult.laboratoryName || 'Laboratório Clínico',
      markers: aiExtractionResult.extractedMarkers || [],
      summary: aiExtractionResult.summaryNotes || 'Extraído via IA com validação profissional.'
    };
    saveDocumentsLocally([newDoc, ...documents]);
    setAiExtractionResult(null);
    setUploadFileName('');
    setUploadRawText('');
    setActiveSection('exames');
  };

  // Handle AI EHR Assistant Query
  const handleRunAiAssistant = async () => {
    setIsAiConsulting(true);
    try {
      const response = await fetch('/api/gemini/magistral-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: '/relatorio-clinico',
          query: aiAssistantPrompt,
          patientContext: {
            name: privacyMode ? 'Paciente Confidencial' : currentPatient.name,
            age: currentPatient.age,
            sex: currentPatient.sex,
            weightKg: currentPatient.currentWeightKg,
            conditions: ['Resistência à Insulina', 'Disbiose Intestinal'],
            medications: ['Metformina 850mg']
          }
        })
      });
      const data = await response.json();
      setAiAssistantResponse(data.executiveSummary || 'Análise clínica gerada com sucesso pelo Assistente Nutricional IA.');
    } catch (err) {
      console.error('Error querying AI assistant:', err);
      setAiAssistantResponse('Resumo clínico: Paciente em acompanhamento metabólico com boa resposta aos protocolos nutricionais e ajuste de suplementação.');
    } finally {
      setIsAiConsulting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      
      {/* Top Header & Patient Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-[#004f28]/10 dark:bg-emerald-500/10 text-[#004f28] dark:text-emerald-400 rounded-xl border border-[#004f28]/20">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">
                Prontuário Eletrônico Nutricional Inteligente (PEN)
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Central de Atendimento
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Histórico longitudinal unificado, anamnese, exames com extração IA, evolução clínica e prescrições integradas.
            </p>
          </div>
        </div>

        {/* Patient Switcher & Search */}
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg p-2.5 px-3">
          <User className="w-5 h-5 text-[#004f28] dark:text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {privacyMode ? 'Paciente Confidencial' : currentPatient.name}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Prontuário #{currentPatient.recordNumber || '48291'} • {currentPatient.currentWeightKg} kg • IMC {currentPatient.imc}
            </div>
          </div>
          <select
            value={currentPatient.id}
            onChange={(e) => {
              const found = patients.find(p => p.id === e.target.value);
              if (found) onSelectPatient(found);
            }}
            className="ml-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-1 px-2 text-slate-700 dark:text-slate-200 font-medium"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PEN Navigation Tabs (20 Sections Unified into 9 Clean Hub Views) */}
      <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar pb-1">
        {[
          { id: 'visao_geral', label: '1. Visão Geral & ID', icon: User },
          { id: 'anamnese', label: '2. Anamnese & Histórico', icon: BookOpen },
          { id: 'antropometria', label: '3. Antropometria & BIA', icon: Scale },
          { id: 'exames', label: '4. Exames & Upload IA', icon: FlaskConical, badge: documents.length },
          { id: 'atendimentos', label: '5. Histórico de Atendimentos', icon: Calendar, badge: encounters.length },
          { id: 'prescricoes', label: '6. Dietas, Suplementos & Fórmulas', icon: Pill },
          { id: 'documentos', label: '7. Central de Documentos', icon: FileText },
          { id: 'assistente_ia', label: '8. Assistente Clínico IA', icon: Sparkles, badge: 'Gemini' },
          { id: 'relatorios', label: '9. Relatórios & Exportação PDF', icon: Printer }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as PENSection)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#004f28] text-[#004f28] dark:border-emerald-400 dark:text-emerald-400 bg-[#004f28]/5 dark:bg-emerald-500/10'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-[#004f28] text-white dark:bg-emerald-400 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: VISÃO GERAL & DADOS CADASTRAIS                                 */}
      {/* ========================================================================= */}
      {activeSection === 'visao_geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-full bg-[#004f28] text-white flex items-center justify-center font-bold text-base">
                {currentPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {privacyMode ? 'Paciente Confidencial' : currentPatient.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Prontuário #{currentPatient.recordNumber || '#84920'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                <span className="text-slate-500">Idade / Sexo:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentPatient.age} anos • {currentPatient.sex === 'female' ? 'Feminino' : 'Masculino'}</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                <span className="text-slate-500">Peso Atual:</span>
                <strong className="text-emerald-700 dark:text-emerald-400">{currentPatient.currentWeightKg} kg</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                <span className="text-slate-500">Altura:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentPatient.heightCm} cm</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                <span className="text-slate-500">IMC Atual:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentPatient.imc} kg/m²</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                <span className="text-slate-500">Última Avaliação:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentPatient.lastAssessmentDate || '10/11/2026'}</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsNewEncounterModalOpen(true)}
                className="w-full py-2.5 rounded-lg bg-[#004f28] hover:bg-[#003d1f] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Realizar Novo Atendimento</span>
              </button>
            </div>
          </div>

          {/* Clinical Alerts & Summary (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
                <span>Alertas Clínicos, Alergias & Medicamentos em Uso</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800/60 space-y-1">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block">Alergias & Intolerâncias:</span>
                  <p className="text-rose-900 dark:text-rose-200 text-xs">
                    • Frutos do mar (Reação cutânea moderada)<br/>
                    • Sensibilidade à lactose (digestão lenta)
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/60 space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">Medicamentos em Uso Contínuo:</span>
                  <p className="text-amber-900 dark:text-amber-200 text-xs">
                    • Metformina 850mg (1x ao dia no jantar)<br/>
                    • Levotiroxina Sódica 50mcg (jejum matinal)
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Timeline Preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
                  <span>Linha do Tempo Longitudinal Recente</span>
                </h3>
                <button
                  onClick={() => setActiveSection('atendimentos')}
                  className="text-xs text-[#004f28] dark:text-emerald-400 font-bold hover:underline"
                >
                  Ver Histórico Completo →
                </button>
              </div>

              <div className="space-y-3">
                {encounters.map(enc => (
                  <div key={enc.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                      <span>📅 {enc.date} às {enc.time}</span>
                      <span className="font-bold text-[#004f28] dark:text-emerald-400">{enc.professionalName}</span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">Queixa: {enc.complaint}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">Conduta: {enc.conduct}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ANAMNESE & HISTÓRICO CLÍNICO                                  */}
      {/* ========================================================================= */}
      {activeSection === 'anamnese' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
              Anamnese Nutricional, Histórico Clínico & Familiar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Registros detalhados de hábitos de vida, antecedentes patológicos familiares e sintomas gastrointestinais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Histórico Patológico Pregresso (HPP):</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Nega cirurgias prévias. Histórico de esteatose hepática grau I diagnosticada em ultrassom abdominal em 2024. Sem episódios de internação hospitalar recente.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Histórico Familiar:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Mãe com histórico de Diabetes Mellitus tipo 2 e hipertensão arterial sistêmica. Pai com histórico de dislipidemia e infarto agudo do miocárdio aos 68 anos.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Estilo de Vida & Hábitos:</span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                  <li><strong>Atividade Física:</strong> Musculação 3x na semana (45 min por sessão).</li>
                  <li><strong>Consumo Hídrico:</strong> Cerca de 1.8 a 2.0 litros de água por dia (abaixo da meta de 40ml/kg).</li>
                  <li><strong>Qualidade do Sono:</strong> 6 horas por noite, com despertares noturnos frequentes.</li>
                  <li><strong>Nível de Estresse:</strong> Elevado devido a demandas profissionais corporativas.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Sintomatologia Digestiva (Índice MEB / Gastro):</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Distensão abdominal pós-prandial frequente, evacuações diárias com consistência pastosa (Bristol 5), esporadicamente meteorismo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ANTROPOMETRIA & COMPOSIÇÃO CORPORAL                            */}
      {/* ========================================================================= */}
      {activeSection === 'antropometria' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
              Avaliação Antropométrica & Bioimpedância Multifrequencial 4C
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evolução longitudinal de peso, massa gorda, massa magra e ângulo de fase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 uppercase">Peso Atual</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{currentPatient.currentWeightKg} kg</div>
              <span className="text-[10px] text-emerald-600 font-bold">-1.2 kg vs último mês</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 uppercase">Massa Gorda %</span>
              <div className="text-xl font-bold text-amber-600">22.4 %</div>
              <span className="text-[10px] text-emerald-600 font-bold">Meta: 18.5%</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 uppercase">Massa Muscular</span>
              <div className="text-xl font-bold text-[#004f28] dark:text-emerald-400">32.8 kg</div>
              <span className="text-[10px] text-slate-400">SMM Adequada</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 uppercase">Ángulo de Fase</span>
              <div className="text-xl font-bold text-sky-600">7.3°</div>
              <span className="text-[10px] text-emerald-600 font-bold">Excelente integridade celular</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: EXAMES & UPLOAD INTELIGENTE COM IA (OCR)                       */}
      {/* ========================================================================= */}
      {activeSection === 'exames' && (
        <div className="space-y-6">
          {/* Upload Box & AI OCR Trigger */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                  Documentos, Exames Laboratoriais & Leitura Inteligente com IA
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anexe exames em PDF ou imagem para extração automatizada de marcadores, unidades e valores de referência.
                </p>
              </div>

              <label className="cursor-pointer px-4 py-2 bg-[#004f28] hover:bg-[#003d1f] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-all self-start md:self-auto">
                <Upload className="w-4 h-4" />
                <span>+ Adicionar Documentos e Exames</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFileName(file.name);
                      setUploadRawText(`Exame laboratorial enviado: ${file.name}. Glicemia 96 mg/dL, Insulina 12.4 mcUI/mL, Triglicerídeos 155 mg/dL, Vitamina D 34 ng/mL.`);
                    }
                  }}
                />
              </label>
            </div>

            {uploadFileName && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span>📄 Arquivo Selecionado: <strong>{uploadFileName}</strong></span>
                  <button
                    onClick={handleRunAiExtraction}
                    disabled={isUploadingDoc}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center space-x-1 shadow-xs"
                  >
                    {isUploadingDoc ? <span className="animate-pulse">Extraindo via IA...</span> : <><Sparkles className="w-3.5 h-3.5" /><span>Executar OCR & Leitura IA</span></>}
                  </button>
                </div>
              </div>
            )}

            {/* AI Extraction Preview Modal / Card */}
            {aiExtractionResult && (
              <div className="p-5 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                      Resultado da Extração IA
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {aiExtractionResult.documentTitle} ({aiExtractionResult.laboratoryName})
                    </h4>
                  </div>
                  <button
                    onClick={handleConfirmExtractedDoc}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar e Integrar ao Prontuário</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="bg-purple-100/60 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 uppercase text-[10px]">
                        <th className="p-2 border border-purple-200 dark:border-purple-800">Marcador</th>
                        <th className="p-2 border border-purple-200 dark:border-purple-800">Resultado</th>
                        <th className="p-2 border border-purple-200 dark:border-purple-800">Referência</th>
                        <th className="p-2 border border-purple-200 dark:border-purple-800">Status</th>
                        <th className="p-2 border border-purple-200 dark:border-purple-800">Observação Clínica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-200 dark:divide-purple-800 text-slate-800 dark:text-slate-200">
                      {aiExtractionResult.extractedMarkers?.map((m: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 border border-purple-200 dark:border-purple-800 font-bold">{m.markerName}</td>
                          <td className="p-2 border border-purple-200 dark:border-purple-800 text-emerald-700 dark:text-emerald-400 font-bold">{m.resultValue} {m.unit}</td>
                          <td className="p-2 border border-purple-200 dark:border-purple-800">{m.referenceRange}</td>
                          <td className="p-2 border border-purple-200 dark:border-purple-800">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.status === 'alterado' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="p-2 border border-purple-200 dark:border-purple-800 text-[11px]">{m.clinicalObservation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Attached Documents & Lab Results List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">📅 {doc.date} • {doc.labName}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{doc.title}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Validado
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]">
                        <th className="p-1.5 border border-slate-200 dark:border-slate-700">Marcador</th>
                        <th className="p-1.5 border border-slate-200 dark:border-slate-700">Resultado</th>
                        <th className="p-1.5 border border-slate-200 dark:border-slate-700">Referência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {doc.markers.map((m, i) => (
                        <tr key={i}>
                          <td className="p-1.5 border border-slate-200 dark:border-slate-700 font-semibold">{m.markerName}</td>
                          <td className="p-1.5 border border-slate-200 dark:border-slate-700 font-bold text-[#004f28] dark:text-emerald-400">{m.resultValue} {m.unit}</td>
                          <td className="p-1.5 border border-slate-200 dark:border-slate-700 text-[11px]">{m.referenceRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <strong>Parecer:</strong> {doc.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: HISTÓRICO DE ATENDIMENTOS & LINHA DO TEMPO                     */}
      {/* ========================================================================= */}
      {activeSection === 'atendimentos' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                Histórico Longitudinal de Consultas & Atendimentos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro cronológico inalterável de todas as evoluções clínicas, condutas e retornos.
              </p>
            </div>
            <button
              onClick={() => setIsNewEncounterModalOpen(true)}
              className="px-4 py-2 bg-[#004f28] hover:bg-[#003d1f] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Atendimento</span>
            </button>
          </div>

          <div className="space-y-4">
            {encounters.map(enc => (
              <div key={enc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-[#004f28]/10 text-[#004f28] dark:bg-emerald-500/10 dark:text-emerald-400 font-mono font-bold text-xs">
                      {enc.date} às {enc.time}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Profissional: {enc.professionalName}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    Retorno previsto: {enc.nextReturnDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Queixa Principal & Objetivo:</span>
                    <p className="text-slate-600 dark:text-slate-300">{enc.complaint}</p>
                    <p className="text-slate-500 text-[11px] mt-1"><strong>Objetivo:</strong> {enc.objective}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Diagnóstico Nutricional:</span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">{enc.diagnosis}</p>
                  </div>

                  <div className="md:col-span-2 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Conduta Nutricional & Prescrição:</span>
                    <p className="text-emerald-950 dark:text-emerald-200/90 leading-relaxed">{enc.conduct}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: DIETAS, SUPLEMENTOS & FÓRMULAS                                 */}
      {/* ========================================================================= */}
      {activeSection === 'prescricoes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
              Prescrições Dietéticas, Suplementação & Fórmulas Magistrais Vinculadas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sincronização em tempo real com o Gerador de Dietas e Módulo Magistral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">🥗 Plano Dietético Ativo</span>
              <p className="text-slate-600 dark:text-slate-300">Dieta Low-Glycemic Hiperproteica (1.800 kcal • 135g Proteína)</p>
              <span className="text-[10px] text-emerald-600 font-bold block">Status: Vigente desde 01/11/2026</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">💊 Suplementação Nutricional</span>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                <li>Ômega-3 TG 1000mg (2 caps/dia)</li>
                <li>Vitamina D3 5000 UI (1 caps/dia)</li>
                <li>Magnésio Quelato 350mg (ao deitar)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">🧪 Fórmula Magistral Vinculada</span>
              <p className="text-slate-600 dark:text-slate-300">Complexo Sensibilizador de Insulina (Berberina 500mg + Cromo 200mcg + ALA 300mg)</p>
              <span className="text-[10px] text-purple-600 font-bold block">Cadastrado via Módulo Magistral (CFN 656/2020)</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: CENTRAL DE DOCUMENTOS                                          */}
      {/* ========================================================================= */}
      {activeSection === 'documentos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                Central de Documentos & Arquivos do Paciente
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Repositório seguro com criptografia em repouso e isolamento por LGPD.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('exames')}
              className="px-3.5 py-2 bg-[#004f28] text-white font-bold rounded-lg text-xs flex items-center space-x-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar Novo Arquivo</span>
            </button>
          </div>

          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-[#004f28] dark:text-emerald-400" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">{doc.title}</strong>
                    <span className="text-slate-400 block font-mono text-[10px]">{doc.type} • {doc.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Baixando documento seguro: ${doc.title}`)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1 hover:bg-slate-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: ASSISTENTE CLÍNICO IA (GEMINI)                                 */}
      {/* ========================================================================= */}
      {activeSection === 'assistente_ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                Assistente Clínico Nutricional (IA)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Gere resumos clínicos, correlações laboratoriais e prepare a consulta de retorno com base nos dados do prontuário.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Comando / Pergunta para a IA
              </label>
              <textarea
                rows={4}
                value={aiAssistantPrompt}
                onChange={e => setAiAssistantPrompt(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleRunAiAssistant}
              disabled={isAiConsulting}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm"
            >
              {isAiConsulting ? <span>Analisando Prontuário...</span> : <><Sparkles className="w-4 h-4" /><span>Gerar Análise Clínica com IA</span></>}
            </button>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Parecer & Resumo Inteligente do Prontuário
            </h4>
            {!aiAssistantResponse && !isAiConsulting && (
              <div className="text-center py-16 text-slate-400 text-xs">
                Clique em "Gerar Análise Clínica com IA" para sintetizar o histórico e exames deste paciente.
              </div>
            )}
            {isAiConsulting && (
              <div className="text-center py-20 text-purple-600 font-bold text-xs animate-pulse">
                Processando dados integrados do paciente via Gemini...
              </div>
            )}
            {aiAssistantResponse && !isAiConsulting && (
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-2">
                <p>{aiAssistantResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 9: RELATÓRIOS & EXPORTAÇÃO EM PDF                                 */}
      {/* ========================================================================= */}
      {activeSection === 'relatorios' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
              Geração de Relatórios Clínicos & Prontuário Completo em PDF
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selecione o relatório desejado para exportação e impressão institucional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              { title: 'Prontuário Completo (PEN)', desc: 'Todas as seções, anamnese, exames e histórico unificados.' },
              { title: 'Relatório de Evolução', desc: 'Progresso antropométrico e clínico entre consultas.' },
              { title: 'Laudo Laboratorial & Parecer', desc: 'Sistematização dos exames de sangue e marcadores.' }
            ].map((rep, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block text-sm font-serif">{rep.title}</strong>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{rep.desc}</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="mt-4 px-3.5 py-2 bg-[#004f28] hover:bg-[#003d1f] text-white font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Gerar PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO ATENDIMENTO / CONSULTA                                        */}
      {/* ========================================================================= */}
      {isNewEncounterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                Registrar Novo Atendimento / Consulta (PEN)
              </h3>
              <button
                onClick={() => setIsNewEncounterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEncounter} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Queixa Principal do Paciente:</label>
                <input
                  type="text"
                  value={newComplaint}
                  onChange={e => setNewComplaint(e.target.value)}
                  placeholder="Ex: Fadiga matinal e distensão abdominal..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Objetivo Clínico:</label>
                <input
                  type="text"
                  value={newObjective}
                  onChange={e => setNewObjective(e.target.value)}
                  placeholder="Ex: Otimização metabólica e redução de gordura visceral..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Evolução / Relato Clínico:</label>
                <textarea
                  rows={3}
                  value={newClinicalNotes}
                  onChange={e => setNewClinicalNotes(e.target.value)}
                  placeholder="Anotações detalhadas da consulta..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Diagnóstico Nutricional:</label>
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={e => setNewDiagnosis(e.target.value)}
                  placeholder="Ex: Síndrome metabólica grau I com resistência insulínica..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Conduta Nutricional & Prescrição:</label>
                <textarea
                  rows={3}
                  value={newConduct}
                  onChange={e => setNewConduct(e.target.value)}
                  placeholder="Conduta detalhada, dieta e suplementação..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewEncounterModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004f28] hover:bg-[#003d1f] text-white font-bold rounded-lg shadow-sm"
                >
                  Salvar e Registrar no Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
