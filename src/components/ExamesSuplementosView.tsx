import React, { useState } from 'react';
import { Patient, LabExamItem, SupplementItem } from '../types';
import { CLINICAL_LAB_EXAMS, CLINICAL_SUPPLEMENTS } from '../data/clinicalData';
import { 
  Stethoscope, 
  FileText, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Printer, 
  Search, 
  Plus, 
  Clock, 
  AlertCircle,
  Pill,
  SlidersHorizontal
} from 'lucide-react';
import { InfoHelpButton } from './help/InfoHelpButton';
import { ClinicalTooltip } from './help/ClinicalTooltip';

interface ExamesSuplementosViewProps {
  patient: Patient;
}

export const ExamesSuplementosView: React.FC<ExamesSuplementosViewProps> = ({
  patient
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'exames' | 'suplementos'>('exames');
  const [exams, setExams] = useState<LabExamItem[]>(CLINICAL_LAB_EXAMS);
  const [supplements, setSupplements] = useState<SupplementItem[]>(CLINICAL_SUPPLEMENTS);
  const [practitionerScope, setPractitionerScope] = useState<'todos' | 'nutricionista' | 'medico'>('todos');
  const [examSearch, setExamSearch] = useState('');
  const [suppSearch, setSuppSearch] = useState('');
  const [selectedPanel, setSelectedPanel] = useState<string>('todos');

  // Toggle Exam
  const handleToggleExam = (id: string) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e));
  };

  // Select all in panel
  const handleSelectAllInPanel = (panelName: string) => {
    setExams(prev => prev.map(e => {
      if (panelName === 'todos' || e.panel === panelName) {
        return { ...e, selected: true };
      }
      return e;
    }));
  };

  // Toggle Supplement selection
  const handleToggleSupplement = (id: string) => {
    setSupplements(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  // Filtered exams
  const filteredExams = exams.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(examSearch.toLowerCase()) ||
      e.clinicalJustification.toLowerCase().includes(examSearch.toLowerCase());
    const matchesPanel = selectedPanel === 'todos' || e.panel === selectedPanel;
    return matchesSearch && matchesPanel;
  });

  // Filtered supplements
  const filteredSupplements = supplements.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(suppSearch.toLowerCase()) ||
      s.activeIngredient.toLowerCase().includes(suppSearch.toLowerCase());
    const matchesScope = practitionerScope === 'todos' || 
      (practitionerScope === 'nutricionista' && s.practitionerScope === 'nutricionista') ||
      (practitionerScope === 'medico' && s.practitionerScope === 'medico_ou_nutricionista');
    return matchesSearch && matchesScope;
  });

  const selectedExamsCount = exams.filter(e => e.selected).length;
  const selectedSuppsCount = supplements.filter(s => s.selected).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#004f28]">
                Conduta Clínica Integrada
              </span>
              <span className="text-xs text-slate-400 font-mono">CFN & CRM Compliant</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Requisição de Exames & Prescrição de Suplementos
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Paciente: {patient.name} • Prontuário: {patient.recordNumber}
            </p>
          </div>

          {/* Sub-tab switcher with Clinical Tooltips */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
            <ClinicalTooltip helpId="exames_laboratoriais" position="bottom">
              <button
                onClick={() => setActiveSubTab('exames')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeSubTab === 'exames'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Requisição de Exames ({selectedExamsCount})</span>
                <InfoHelpButton helpId="exames_laboratoriais" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>

            <ClinicalTooltip helpId="suplementacao_clinica" position="bottom">
              <button
                onClick={() => setActiveSubTab('suplementos')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeSubTab === 'suplementos'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Receituário de Suplementos ({selectedSuppsCount})</span>
                <InfoHelpButton helpId="suplementacao_clinica" size="xs" variant="subtle" withTooltip={false} as="span" />
              </button>
            </ClinicalTooltip>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: LAB EXAMS REQUISITION */}
      {activeSubTab === 'exames' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar exame (Glicemia, Insulina, TSH, PCR...)"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Panel Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-semibold text-[11px]">Painel:</span>
              <select
                value={selectedPanel}
                onChange={(e) => setSelectedPanel(e.target.value)}
                className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="todos">Todos os Painéis</option>
                <option value="metabolico">Metabólico & Glicêmico</option>
                <option value="lipidico">Lipídico & Cardiovascular</option>
                <option value="hormonal">Tireoidiano & Hormonal</option>
                <option value="hepatico_renal">Hepático & Renal</option>
                <option value="micronutrientes">Micronutrientes & Vitaminas</option>
                <option value="inflamatorio">Inflamatório & Hematológico</option>
              </select>
            </div>

            <button
              onClick={() => handleSelectAllInPanel(selectedPanel)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px]"
            >
              Selecionar Painel Completo
            </button>

            <button
              onClick={() => alert(`Guia de Requisição com ${selectedExamsCount} exames formatada para convênio/laboratório gerada!`)}
              className="px-3.5 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Guia Laboratorial ({selectedExamsCount})</span>
            </button>
          </div>

          {/* Categorized List of Lab Exams */}
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <span>🟢 Valores Ideais (Nutrologia & Longevidade)</span>
                <span className="text-slate-400">|</span>
                <span className="text-amber-800">🟡 Valores de Referência (Laboratório Convencional)</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 font-bold">
                {selectedExamsCount} exames selecionados para guia
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredExams.map(exam => (
                <div
                  key={exam.id}
                  onClick={() => handleToggleExam(exam.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    exam.selected
                      ? 'border-[#004f28] bg-emerald-50/30 ring-1 ring-[#004f28]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        {exam.selected ? (
                          <CheckSquare className="w-5 h-5 text-[#004f28]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{exam.name}</h4>
                          {exam.codeSUS && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border">
                              SUS: {exam.codeSUS}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {exam.clinicalJustification}
                        </p>
                      </div>
                    </div>

                    {/* Faixas Comparativas (Verde vs Amarelo) */}
                    <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-2 shrink-0 text-xs font-mono">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-1.5" title="Valor Ideal Funcional (Nutrologia & Longevidade)">
                        <span className="text-xs">🟢</span>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-bold block text-emerald-800">Ideal (Verde):</span>
                          <span className="font-bold">{exam.idealValueGreen || '75 – 85 mg/dL'}</span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 flex items-center gap-1.5" title="Valor de Referência Convencional de Laboratório">
                        <span className="text-xs">🟡</span>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-bold block text-amber-800">Ref. Lab (Amarelo):</span>
                          <span className="font-semibold">{exam.referenceYellow || '70 – 99 mg/dL'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: SUPPLEMENTS PRESCRIPTION */}
      {activeSubTab === 'suplementos' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar suplemento (Creatina, Whey, Ômega-3...)"
                value={suppSearch}
                onChange={(e) => setSuppSearch(e.target.value)}
                className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Scope Filter: Nutricionista vs Médico */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-semibold text-[11px]">Escopo Profissional:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  onClick={() => setPractitionerScope('todos')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                    practitionerScope === 'todos' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setPractitionerScope('nutricionista')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                    practitionerScope === 'nutricionista' ? 'bg-[#004f28] font-bold text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Nutricionista (CFN)
                </button>
                <button
                  onClick={() => setPractitionerScope('medico')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                    practitionerScope === 'medico' ? 'bg-sky-700 font-bold text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Médico / Doses Altas
                </button>
              </div>
            </div>

            <button
              onClick={() => alert(`Receituário estruturado com ${selectedSuppsCount} fórmulas prescritas gerado com sucesso!`)}
              className="px-3.5 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Emitir Receita Clínica ({selectedSuppsCount})</span>
            </button>
          </div>

          {/* Supplements Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSupplements.map(supp => {
              const isSelected = !!supp.selected;
              return (
                <div
                  key={supp.id}
                  onClick={() => handleToggleSupplement(supp.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#004f28] bg-emerald-50/40 ring-1 ring-[#004f28]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#004f28]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900">{supp.name}</h4>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            supp.practitionerScope === 'nutricionista'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {supp.practitionerScope === 'nutricionista' ? 'Nutricionista' : 'Médico/Nutri'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                          {supp.activeIngredient} • Dose Padrão: {supp.standardDose}
                        </span>

                        <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-xs font-mono space-y-1 text-slate-700">
                          <div><strong>Posologia:</strong> {supp.posology}</div>
                          <div><strong>Horário:</strong> {supp.timing} ({supp.route})</div>
                          {supp.warnings && (
                            <div className="text-[10px] text-amber-800 pt-1 border-t border-slate-200">
                              ⚠️ <strong>Atenção:</strong> {supp.warnings}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
