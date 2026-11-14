import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  FileText,
  HelpCircle,
  History,
  Info,
  Loader2,
  Printer,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  User
} from 'lucide-react';
import {
  AnthropometryEvaluation,
  BioimpedanceEvaluation,
  DietPlan,
  Patient,
  Professional,
  WaistHipEvaluation
} from '../types';
import {
  ExtractionValueStatus,
  HemoAiStructuredReport,
  HemoClinicalClassification,
  HemoDocumentMetadata,
  HemoParameterEntry,
  HemoPatientClinicalContext,
  SavedHemogramRecord
} from '../types/hemo';
import {
  DEFAULT_COMPLEMENTARY_LABS,
  DEFAULT_HEMOGRAM_PARAMETERS,
  buildEmrContextFromPatient,
  evaluateCompleteHemogram
} from '../domain/hemoEngine';
import { apiClient } from '../lib/api';
import { ProfessionalContext } from '../types/documents';
import { generateDocumentHash } from '../utils/documentUtils';
import { DocumentPreviewModal } from './documents/DocumentPreviewModal';
import { DocumentHeader } from './documents/DocumentHeader';
import { DocumentFooter } from './documents/DocumentFooter';
import { MebCalculatorCard } from './MebCalculatorCard';
import { HemoDocumentUploadPanel } from './hemo/HemoDocumentUploadPanel';
import { HemoEmrContextPanel } from './hemo/HemoEmrContextPanel';
import { HemoLongitudinalPanel } from './hemo/HemoLongitudinalPanel';

interface HemoIntelligenceViewProps {
  currentPatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  professional?: Professional;
  anthroData?: AnthropometryEvaluation;
  biaData?: BioimpedanceEvaluation;
  rcqData?: WaistHipEvaluation;
  dietData?: DietPlan;
}

type HemoWorkspaceTab = 'prontuario_ocr' | 'series' | 'meb_indices' | 'evolucao_ia';

function parseNullableNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getStatusBadgeVisual(classification: HemoClinicalClassification) {
  switch (classification) {
    case 'critico_baixo':
    case 'critico_alto':
      return { textClass: 'text-red-800', Icon: ShieldAlert };
    case 'baixo':
    case 'elevado':
      return { textClass: 'text-amber-800', Icon: AlertTriangle };
    case 'ideal':
      return { textClass: 'text-emerald-800', Icon: CheckCircle2 };
    case 'referencia':
      return { textClass: 'text-slate-700', Icon: CheckCircle2 };
    default:
      return { textClass: 'text-slate-500', Icon: HelpCircle };
  }
}

export const HemoIntelligenceView: React.FC<HemoIntelligenceViewProps> = ({
  currentPatient,
  patients,
  onSelectPatient,
  professional,
  anthroData,
  biaData,
  rcqData,
  dietData
}) => {
  const [activeTab, setActiveTab] = useState<HemoWorkspaceTab>('prontuario_ocr');
  const [clinicalContext, setClinicalContext] = useState<HemoPatientClinicalContext>(() =>
    buildEmrContextFromPatient(currentPatient, anthroData, biaData, rcqData, dietData)
  );
  const [metadata, setMetadata] = useState<HemoDocumentMetadata>({
    laboratoryName: 'Não informado',
    collectionDate: new Date().toISOString().slice(0, 10),
    examType: 'Hemograma Completo',
    extractedByOcr: false,
    ocrWarnings: []
  });
  const [ocrConfirmed, setOcrConfirmed] = useState<boolean>(true);
  const [parameters, setParameters] = useState<HemoParameterEntry[]>(() =>
    DEFAULT_HEMOGRAM_PARAMETERS(currentPatient.sex || 'female', false)
  );
  const [complementaryLabs, setComplementaryLabs] = useState<HemoParameterEntry[]>(() =>
    DEFAULT_COMPLEMENTARY_LABS()
  );

  const [savedRecords, setSavedRecords] = useState<SavedHemogramRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<HemoAiStructuredReport | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const loadPatientHistory = useCallback(async (patientId: string) => {
    setIsLoadingHistory(true);
    try {
      const list = await apiClient.getHemoRecords(patientId);
      setSavedRecords(Array.isArray(list) ? list : []);
    } catch {
      setSavedRecords([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Recarrega prontuário & histórico ao trocar paciente
  useEffect(() => {
    const nextCtx = buildEmrContextFromPatient(
      currentPatient,
      anthroData,
      biaData,
      rcqData,
      dietData
    );
    setClinicalContext(nextCtx);
    setParameters(DEFAULT_HEMOGRAM_PARAMETERS(currentPatient.sex || 'female', false));
    setComplementaryLabs(DEFAULT_COMPLEMENTARY_LABS());
    setMetadata({
      laboratoryName: 'Não informado',
      collectionDate: new Date().toISOString().slice(0, 10),
      examType: 'Hemograma Completo',
      extractedByOcr: false,
      ocrWarnings: []
    });
    setOcrConfirmed(true);
    setAiReport(null);
    setAiError(null);
    setSaveFeedback(null);
    loadPatientHistory(currentPatient.id);
  }, [currentPatient.id, loadPatientHistory]);

  // Atualiza referências de Hb/Hct quando sexo/gestação mudam
  useEffect(() => {
    const template = DEFAULT_HEMOGRAM_PARAMETERS(
      clinicalContext.biologicalSex,
      clinicalContext.isPregnant
    );
    const tplById = new Map(template.map((t) => [t.id, t]));
    setParameters((prev) =>
      prev.map((item) => {
        if (item.id === 'hgb' || item.id === 'hct' || item.id === 'eritr') {
          const refTpl = tplById.get(item.id);
          if (refTpl && !metadata.extractedByOcr) {
            return {
              ...item,
              refMin: refTpl.refMin,
              refMax: refTpl.refMax,
              funcMin: refTpl.funcMin,
              funcMax: refTpl.funcMax
            };
          }
        }
        return item;
      })
    );
  }, [clinicalContext.biologicalSex, clinicalContext.isPregnant, metadata.extractedByOcr]);

  const previousRecord = useMemo(() => {
    if (savedRecords.length === 0) return null;
    return savedRecords[0];
  }, [savedRecords]);

  const evaluation = useMemo(
    () =>
      evaluateCompleteHemogram({
        parameters,
        complementaryLabs,
        context: clinicalContext,
        previousRecord,
        currentDate: metadata.collectionDate
      }),
    [parameters, complementaryLabs, clinicalContext, previousRecord, metadata.collectionDate]
  );

  const outputById = useMemo(
    () => new Map(evaluation.parameterOutputs.map((o) => [o.id, o])),
    [evaluation.parameterOutputs]
  );

  const updateAnyParameter = (
    id: string,
    field: 'value' | 'percentValue' | 'refMin' | 'refMax' | 'extractionStatus',
    nextValue: number | ExtractionValueStatus | null
  ) => {
    const updater = (list: HemoParameterEntry[]) =>
      list.map((item) => {
        if (item.id !== id) return item;
        const next: HemoParameterEntry = { ...item, [field]: nextValue } as HemoParameterEntry;
        if (field === 'value' || field === 'percentValue') {
          if (nextValue !== null) {
            next.extractionStatus = 'confirmed';
          }
        }
        return next;
      });

    if (parameters.some((p) => p.id === id)) {
      setParameters((prev) => updater(prev));
    } else {
      setComplementaryLabs((prev) => updater(prev));
    }
  };

  const handleApplyExtractedData = (
    nextMetadata: HemoDocumentMetadata,
    nextParams: HemoParameterEntry[],
    nextComplementary: HemoParameterEntry[],
    requiresConfirmation: boolean
  ) => {
    setMetadata(nextMetadata);
    setParameters(nextParams);
    setComplementaryLabs(nextComplementary);
    setOcrConfirmed(!requiresConfirmation);
    setAiReport(null);
  };

  const handleConfirmOcrReview = () => {
    setParameters((prev) =>
      prev.map((p) => ({
        ...p,
        extractionStatus:
          p.value !== null || p.percentValue != null
            ? 'confirmed'
            : p.extractionStatus === 'extracted'
              ? 'missing'
              : p.extractionStatus
      }))
    );
    setComplementaryLabs((prev) =>
      prev.map((p) => ({
        ...p,
        extractionStatus:
          p.value !== null
            ? 'confirmed'
            : p.extractionStatus === 'extracted'
              ? 'missing'
              : p.extractionStatus
      }))
    );
    setOcrConfirmed(true);
    setActiveTab('series');
  };

  const handleResetTemplate = () => {
    setParameters(DEFAULT_HEMOGRAM_PARAMETERS(clinicalContext.biologicalSex, clinicalContext.isPregnant));
    setComplementaryLabs(DEFAULT_COMPLEMENTARY_LABS());
    setMetadata({
      laboratoryName: 'Não informado',
      collectionDate: new Date().toISOString().slice(0, 10),
      examType: 'Hemograma Completo',
      extractedByOcr: false,
      ocrWarnings: []
    });
    setOcrConfirmed(true);
    setAiReport(null);
    setAiError(null);
  };

  const handleSaveRecord = async () => {
    setIsSavingRecord(true);
    setSaveFeedback(null);
    try {
      const saved = await apiClient.saveHemoRecord({
        patientId: currentPatient.id,
        metadata,
        parameters,
        complementaryLabs,
        clinicalContextSnapshot: clinicalContext,
        mebScore: evaluation.meb.score,
        aiReport
      });
      setSavedRecords((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
      setSaveFeedback('Hemograma salvo no prontuário com sucesso.');
    } catch (err: any) {
      setSaveFeedback(err?.message || 'Erro ao salvar exame.');
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await apiClient.deleteHemoRecord(currentPatient.id, recordId);
      setSavedRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err: any) {
      setSaveFeedback(err?.message || 'Erro ao excluir registro.');
    }
  };

  const handleLoadRecordIntoEditor = (record: SavedHemogramRecord) => {
    setMetadata(record.metadata);
    setParameters(record.parameters);
    if (record.complementaryLabs && record.complementaryLabs.length > 0) {
      setComplementaryLabs(record.complementaryLabs);
    }
    if (record.clinicalContextSnapshot?.patientId) {
      setClinicalContext(record.clinicalContextSnapshot);
    }
    setAiReport(record.aiReport ?? null);
    setOcrConfirmed(true);
    setActiveTab('series');
  };

  const handleRunAiAnalysis = async () => {
    if (!ocrConfirmed) {
      setAiError('Confirme os valores extraídos pelo OCR antes de gerar o parecer clínico.');
      setActiveTab('prontuario_ocr');
      return;
    }
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const report = await apiClient.analyzeHemogramWithAI({
        clinicalContext,
        metadata,
        parameterOutputs: evaluation.parameterOutputs,
        redSeries: evaluation.redSeries,
        whiteSeries: evaluation.whiteSeries,
        platelets: evaluation.platelets,
        meb: evaluation.meb,
        indexes: evaluation.indexes,
        complementaryLabs: complementaryLabs.filter((c) => c.value !== null),
        longitudinalDeltas: evaluation.longitudinalDeltas
      });
      setAiReport(report);
      setActiveTab('evolucao_ia');
    } catch (err: any) {
      setAiError(
        err?.message || 'Falha ao gerar parecer clínico por IA. Tente novamente em instantes.'
      );
      setActiveTab('evolucao_ia');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const professionalContext: ProfessionalContext = useMemo(
    () => ({
      id: professional?.id || 'prof-01',
      name: professional?.name || 'Dra. Gabriela Santos',
      crn: professional?.registrationCode || 'CRN-3 48910',
      specialty: professional?.specialty || 'Nutrição Clínica Avançada',
      clinicName: 'Clínica de Nutrição Avançada',
      unit: professional?.unit || currentPatient.unit || 'Matriz',
      address: 'Unidade Clínica Integrada',
      phone: professional?.phone || '(11) 99988-7766',
      email: professional?.email || 'contato@clinica.com.br',
      cpfCnpj: professional?.cpf || '111.222.333-44'
    }),
    [professional, currentPatient.unit]
  );

  const authHash = useMemo(
    () => generateDocumentHash(`hemo-pro-${currentPatient.id}-${metadata.collectionDate}`),
    [currentPatient.id, metadata.collectionDate]
  );

  const redItems = parameters.filter((p) => p.category === 'vermelha');
  const whiteItems = parameters.filter((p) => p.category === 'branca');
  const plateletItems = parameters.filter((p) => p.category === 'plaquetas');

  const renderStandardSeriesTable = (
    title: string,
    items: HemoParameterEntry[],
    includePercentColumn = false
  ) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="text-[11px] text-slate-500 tabular-nums">{items.length} parâmetros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/70 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Parâmetro</th>
              <th className="py-2.5 px-3 font-semibold text-right">
                {includePercentColumn ? 'Absoluto (/µL)' : 'Resultado'}
              </th>
              {includePercentColumn && (
                <th className="py-2.5 px-3 font-semibold text-right">Percentual (%)</th>
              )}
              <th className="py-2.5 px-3 font-semibold text-right">Ref. Laboratório</th>
              <th className="py-2.5 px-3 font-semibold text-right">Faixa Funcional</th>
              <th className="py-2.5 px-3 font-semibold">Classificação & Significado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => {
              const out = outputById.get(item.id);
              const badge = getStatusBadgeVisual(out?.classification || 'nao_informado');
              const Icon = badge.Icon;
              return (
                <tr key={item.id} className="hover:bg-slate-50/60 align-top">
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.unit}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      step="any"
                      placeholder="N/I"
                      value={item.value ?? ''}
                      onChange={(e) =>
                        updateAnyParameter(item.id, 'value', parseNullableNumber(e.target.value))
                      }
                      className="w-24 border border-slate-300 rounded px-2 py-1 text-right font-mono tabular-nums font-semibold text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
                    />
                  </td>
                  {includePercentColumn && (
                    <td className="py-2.5 px-3 text-right">
                      {item.percentValue !== undefined ? (
                        <input
                          type="number"
                          step="0.1"
                          placeholder="N/I"
                          value={item.percentValue ?? ''}
                          onChange={(e) =>
                            updateAnyParameter(
                              item.id,
                              'percentValue',
                              parseNullableNumber(e.target.value)
                            )
                          }
                          className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-mono tabular-nums text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {out?.refRangeDisplay || 'Não informado'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {out?.funcRangeDisplay || '—'}
                  </td>
                  <td className="py-2.5 px-3 space-y-1">
                    <div className={`inline-flex items-center gap-1.5 font-semibold ${badge.textClass}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{out?.classificationLabel || 'Não informado'}</span>
                    </div>
                    {out && (
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {out.physiologicalMeaning}
                        {out.needsComplementaryInvestigation && out.investigationNote
                          ? ` Atenção: ${out.investigationNote}`
                          : ''}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Bar Clínica (Seleção de Paciente + Metadados Limpos + Ação Primária) */}
      <header className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Droplet className="w-5 h-5 text-[#4A6B5D] shrink-0" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                HEMO INTELLIGENCE PRO
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>{currentPatient.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {currentPatient.recordNumber || 'Sem prontuário'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{clinicalContext.biologicalSex === 'female' ? 'Feminino' : 'Masculino'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{clinicalContext.age} anos</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Coleta: {metadata.collectionDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={currentPatient.id}
                onChange={(e) => {
                  const found = patients.find((p) => p.id === e.target.value);
                  if (found) onSelectPatient(found);
                }}
                aria-label="Selecionar paciente ativo"
                className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetTemplate}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Limpar / Padrão</span>
            </button>

            <button
              type="button"
              onClick={handleSaveRecord}
              disabled={isSavingRecord}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingRecord ? 'Salvando...' : 'Salvar Exame'}</span>
            </button>

            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#4A6B5D] text-[#4A6B5D] hover:bg-[#4A6B5D]/5 flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isAnalyzing ? 'Analisando...' : 'Parecer IA'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#4A6B5D] hover:bg-[#3d594c] text-white flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Laudo / PDF</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação entre Etapas Clínicas */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'prontuario_ocr', label: '1. Prontuário & OCR' },
                { id: 'series', label: '2. Séries & Complementares' },
                { id: 'meb_indices', label: '3. Teste MEB & Índices' },
                { id: 'evolucao_ia', label: '4. Evolução & Parecer IA' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-600 font-mono tabular-nums">
            MEB:{' '}
            <strong>
              {evaluation.meb.calculable && evaluation.meb.score !== null
                ? evaluation.meb.score.toFixed(1).replace('.', ',')
                : 'N/I'}
            </strong>{' '}
            · VCM:{' '}
            <strong>
              {evaluation.redSeries.calculatedVCM !== null
                ? `${evaluation.redSeries.calculatedVCM} fL`
                : 'N/I'}
            </strong>{' '}
            · Hist.: <strong>{savedRecords.length}</strong>
          </div>
        </div>

        {!ocrConfirmed && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-2.5 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Dados importados via OCR aguardam conferência profissional na aba{' '}
                <strong>1. Prontuário &amp; OCR</strong> antes da emissão do parecer IA.
              </span>
            </div>
            <button
              type="button"
              onClick={handleConfirmOcrReview}
              className="px-3 py-1 rounded bg-amber-800 text-white text-xs font-medium whitespace-nowrap shrink-0"
            >
              Confirmar Agora
            </button>
          </div>
        )}

        {saveFeedback && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800">
            {saveFeedback}
          </div>
        )}
      </header>

      {/* ABA 1: PRONTUÁRIO & UPLOAD OCR */}
      {activeTab === 'prontuario_ocr' && (
        <div className="space-y-5">
          <HemoDocumentUploadPanel
            metadata={metadata}
            parameters={parameters}
            complementaryLabs={complementaryLabs}
            ocrConfirmed={ocrConfirmed}
            onUpdateMetadata={setMetadata}
            onApplyExtractedData={handleApplyExtractedData}
            onUpdateParameterValue={updateAnyParameter}
            onConfirmReview={handleConfirmOcrReview}
          />
          <HemoEmrContextPanel
            context={clinicalContext}
            missingEssentialContext={evaluation.missingEssentialContext}
            onChangeContext={setClinicalContext}
          />
        </div>
      )}

      {/* ABA 2: SÉRIES HEMATOLÓGICAS & EXAMES COMPLEMENTARES */}
      {activeTab === 'series' && (
        <div className="space-y-5">
          {/* Resumo Índices Hematimétricos & Padrões da Série Vermelha */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Índices Hematimétricos &amp; Padrões da Série Vermelha
              </h3>
              <span className="text-xs text-slate-500">
                Suporte não diagnóstico — requer correlação bioquímica
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-200 rounded-lg p-3.5">
                <span className="text-slate-500 block">VCM</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {evaluation.redSeries.calculatedVCM ?? 'N/I'}{' '}
                  <span className="text-xs font-normal text-slate-500">fL</span>
                </span>
                <span className="block text-slate-700 mt-1">
                  {evaluation.redSeries.vcmClassification}
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg p-3.5">
                <span className="text-slate-500 block">HCM</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {evaluation.redSeries.calculatedHCM ?? 'N/I'}{' '}
                  <span className="text-xs font-normal text-slate-500">pg</span>
                </span>
                <span className="block text-slate-700 mt-1">
                  {evaluation.redSeries.hcmClassification}
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg p-3.5">
                <span className="text-slate-500 block">CHCM</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {evaluation.redSeries.calculatedCHCM ?? 'N/I'}{' '}
                  <span className="text-xs font-normal text-slate-500">g/dL</span>
                </span>
                <span className="block text-slate-700 mt-1">
                  {evaluation.redSeries.chcmClassification}
                </span>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1.5">
              <div className="font-semibold text-slate-900">Padrões morfológicos identificados:</div>
              <ul className="list-disc pl-5 text-slate-700 space-y-1">
                {evaluation.redSeries.compatiblePatterns.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">
                {evaluation.redSeries.corroborationRequirements.join(' ')}
              </p>
            </div>
          </div>

          {renderStandardSeriesTable('Série Vermelha (Eritrograma)', redItems, false)}

          <div className="space-y-3">
            {renderStandardSeriesTable(
              'Série Branca (Leucograma — Absoluto /µL e Percentual %)',
              whiteItems,
              true
            )}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1">
              <div className="font-semibold text-slate-900">Leitura contextual da Série Branca:</div>
              <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                {evaluation.whiteSeries.compatiblePatterns.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">{evaluation.whiteSeries.cautionNote}</p>
            </div>
          </div>

          <div className="space-y-3">
            {renderStandardSeriesTable('Série Plaquetária (Plaquetograma)', plateletItems, false)}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1">
              <div className="font-semibold text-slate-900">Leitura contextual de Plaquetas:</div>
              <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                {evaluation.platelets.compatiblePatterns.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">{evaluation.platelets.cautionNote}</p>
            </div>
          </div>

          {/* Exames Bioquímicos & Nutricionais Complementares */}
          <div className="space-y-3">
            {renderStandardSeriesTable(
              'Exames Bioquímicos e Nutricionais Complementares (Correlação Cruzada)',
              complementaryLabs,
              false
            )}
            {evaluation.complementaryCorrelations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                <div className="font-semibold text-slate-900">
                  Correlações Cruzadas Automáticas (Hemograma × Bioquímica):
                </div>
                <ul className="list-disc pl-5 text-slate-700 space-y-1">
                  {evaluation.complementaryCorrelations.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: TESTE MEB (8 PARTES) & ÍNDICES HEMATOLÓGICOS */}
      {activeTab === 'meb_indices' && (
        <div className="space-y-5">
          <MebCalculatorCard
            parameters={parameters}
            selectedSymptoms={clinicalContext.giAndAllergicSymptoms}
            onUpdateWhiteDifferential={(id, field, nextVal) =>
              updateAnyParameter(id, field, nextVal)
            }
            onUpdateSymptoms={(symptoms) =>
              setClinicalContext((prev) => ({ ...prev, giAndAllergicSymptoms: symptoms }))
            }
          />

          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#4A6B5D] shrink-0" />
                Índices Hematológicos Automáticos (Contagens Absolutas)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Marcadores complementares inespecíficos calculados exclusivamente com valores absolutos (/µL). Não possuem ponto de corte diagnóstico universal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluation.indexes.map((idx) => (
                <div
                  key={idx.id}
                  className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">{idx.name}</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-900 shrink-0">
                        {idx.calculable && idx.result !== null
                          ? idx.result.toLocaleString('pt-BR')
                          : 'N/I'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600">
                      Fórmula: {idx.formula}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500">
                      Valores: {idx.valuesUsedDisplay}
                    </div>
                  </div>
                  {idx.unavailableReason ? (
                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
                      Bloqueado: {idx.unavailableReason}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {idx.clinicalInterpretationNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ABA 4: EVOLUÇÃO LONGITUDINAL & PARECER IA */}
      {activeTab === 'evolucao_ia' && (
        <div className="space-y-5">
          {/* Parecer IA Estruturado */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4A6B5D] shrink-0" />
                  Síntese Clínica Assistida por IA (Suporte à Decisão)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Correlação integrada anonimizada entre hemograma, bioquímica, MEB, índices e prontuário. Não substitui diagnóstico médico.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors flex items-center gap-2 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando Parecer...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{aiReport ? 'Atualizar Parecer IA' : 'Gerar Parecer Clínico IA'}</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {!aiReport && !isAnalyzing && !aiError && (
              <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center space-y-2 text-xs text-slate-600">
                <p className="font-medium text-slate-800">
                  Nenhum parecer integrado gerado para os valores atuais.
                </p>
                <p>
                  Clique em <strong>Gerar Parecer Clínico IA</strong> após confirmar os dados do hemograma para obter hipóteses não diagnósticas e correlações nutricionais.
                </p>
              </div>
            )}

            {aiReport && (
              <div className="space-y-5 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                  <div className="font-semibold text-slate-900">Síntese Executiva</div>
                  <p className="text-slate-700 leading-relaxed">{aiReport.executiveSummary}</p>
                </div>

                {aiReport.nonDiagnosticHypotheses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">
                      Hipóteses Clínicas Não Diagnósticas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aiReport.nonDiagnosticHypotheses.map((hyp, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{hyp.title}</span>
                            <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap">
                              {hyp.series} · {hyp.priority}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{hyp.rationale}</p>
                          {hyp.corroboratingMarkers.length > 0 && (
                            <p className="text-[11px] text-slate-500">
                              Marcadores: {hyp.corroboratingMarkers.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiReport.nutritionalCorrelations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">
                      Correlações e Condutas Nutricionais Seguras
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Nutriente / Eixo</th>
                            <th className="py-2 px-3 font-semibold">Status</th>
                            <th className="py-2 px-3 font-semibold">Racional & Orientação Dietética</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {aiReport.nutritionalCorrelations.map((nc, idx) => (
                            <tr key={idx} className="align-top">
                              <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                                {nc.nutrientOrAxis}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                                {nc.status}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 space-y-1">
                                <p>{nc.clinicalRationale}</p>
                                <p className="text-[#4A6B5D] font-medium">{nc.dietaryGuidance}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                    <div className="font-semibold text-slate-900">
                      Investigações Complementares Sugeridas
                    </div>
                    <ul className="list-disc pl-5 text-slate-700 space-y-1">
                      {aiReport.suggestedInvestigations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                    <div className="font-semibold text-slate-900">
                      Perguntas de Acompanhamento Clínico
                    </div>
                    <ul className="list-disc pl-5 text-slate-700 space-y-1">
                      {aiReport.followUpQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>{aiReport.clinicalSafetyDisclaimer}</span>
                </div>
              </div>
            )}
          </section>

          <HemoLongitudinalPanel
            records={savedRecords}
            longitudinalDeltas={evaluation.longitudinalDeltas}
            isLoading={isLoadingHistory}
            isSaving={isSavingRecord}
            onSaveCurrentRecord={handleSaveRecord}
            onLoadRecordIntoEditor={handleLoadRecordIntoEditor}
            onDeleteRecord={handleDeleteRecord}
          />
        </div>
      )}

      {/* Modal de Pré-visualização / Exportação PDF */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentTitle="Hemo Intelligence Pro — Relatório Técnico Hematológico & Índice MEB"
        patient={{
          id: currentPatient.id,
          name: currentPatient.name,
          cpf: currentPatient.cpf || 'Não informado',
          birthDate: currentPatient.birthDate || 'Não informado',
          age: clinicalContext.age,
          sex: clinicalContext.biologicalSex,
          phone: currentPatient.phone || 'Não informado',
          email: currentPatient.email || 'Não informado',
          heightCm: clinicalContext.heightCm || 0,
          currentWeightKg: clinicalContext.weightKg || 0,
          recordNumber: clinicalContext.recordNumber,
          unit: currentPatient.unit || 'Matriz'
        }}
      >
        <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
          <div className="space-y-5">
            <DocumentHeader
              professional={professionalContext}
              patient={{
                id: currentPatient.id,
                name: currentPatient.name,
                cpf: currentPatient.cpf || 'Não informado',
                birthDate: currentPatient.birthDate || 'Não informado',
                age: clinicalContext.age,
                sex: clinicalContext.biologicalSex,
                phone: currentPatient.phone || 'Não informado',
                email: currentPatient.email || 'Não informado',
                heightCm: clinicalContext.heightCm || 0,
                currentWeightKg: clinicalContext.weightKg || 0,
                recordNumber: clinicalContext.recordNumber,
                unit: currentPatient.unit || 'Matriz'
              }}
              documentTitle="Relatório Técnico de Interpretação Hematológica & Teste MEB"
              documentSubtitle={`Laboratório: ${metadata.laboratoryName} · Coleta: ${metadata.collectionDate} · Sexo biológico: ${clinicalContext.biologicalSex === 'female' ? 'Feminino' : 'Masculino'}, ${clinicalContext.age} anos`}
            />

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs space-y-1.5">
              <div className="font-semibold text-slate-900">Síntese Clínica Integrada</div>
              <p className="text-slate-700">
                {aiReport?.executiveSummary ||
                  'Avaliação hematológica estruturada com análise das séries vermelha, branca e plaquetária, cálculo percentual do índice MEB e razões hematológicas absolutas para suporte à decisão clínica.'}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 border-b border-[#4A6B5D]/20 pb-1">
                Parâmetros Hematológicos &amp; Complementares
              </h3>
              <table className="w-full text-left border-collapse text-[11px] border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-1.5 px-2.5">Parâmetro</th>
                    <th className="py-1.5 px-2.5 text-right">Resultado</th>
                    <th className="py-1.5 px-2.5 text-right">%</th>
                    <th className="py-1.5 px-2.5 text-right">Ref. Lab.</th>
                    <th className="py-1.5 px-2.5 text-right">Classificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {evaluation.parameterOutputs.map((out) => (
                    <tr key={out.id}>
                      <td className="py-1.5 px-2.5 font-medium text-slate-900">{out.name}</td>
                      <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">
                        {out.value !== null ? `${out.value.toLocaleString('pt-BR')} ${out.unit}` : 'Não informado'}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono tabular-nums">
                        {out.percentValue != null ? `${out.percentValue.toFixed(1).replace('.', ',')}%` : '—'}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono tabular-nums text-slate-600">
                        {out.refRangeDisplay}
                      </td>
                      <td className="py-1.5 px-2.5 text-right text-slate-800">{out.classificationLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div className="border border-slate-200 rounded-md p-3 space-y-1">
                <div className="font-bold text-slate-900">Teste MEB (Protocolo Operacional)</div>
                <div className="font-mono tabular-nums">{evaluation.meb.formulaDisplay}</div>
                <div>{evaluation.meb.classificationLabel}</div>
                <div>Componente predominante: {evaluation.meb.predominantComponentLabel}</div>
              </div>
              <div className="border border-slate-200 rounded-md p-3 space-y-1">
                <div className="font-bold text-slate-900">Índices Hematológicos Absolutos</div>
                <div className="grid grid-cols-2 gap-x-2 font-mono tabular-nums">
                  {evaluation.indexes.map((idx) => (
                    <span key={idx.id}>
                      {idx.id}: {idx.calculable && idx.result !== null ? idx.result.toLocaleString('pt-BR') : 'N/I'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DocumentFooter
            professional={professionalContext}
            authHash={authHash}
            customDisclaimer="Documento técnico de suporte à decisão clínica (HEMO INTELLIGENCE PRO). Não substitui diagnóstico médico, julgamento clínico presencial ou prescrição médica."
          />
        </div>
      </DocumentPreviewModal>
    </div>
  );
};
