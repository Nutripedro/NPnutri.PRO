import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileUp,
  HelpCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import {
  ExtractionValueStatus,
  HemoDocumentMetadata,
  HemoParameterEntry
} from '../../types/hemo';
import { apiClient } from '../../lib/api';

interface HemoDocumentUploadPanelProps {
  metadata: HemoDocumentMetadata;
  parameters: HemoParameterEntry[];
  complementaryLabs: HemoParameterEntry[];
  ocrConfirmed: boolean;
  onUpdateMetadata: (next: HemoDocumentMetadata) => void;
  onApplyExtractedData: (
    nextMetadata: HemoDocumentMetadata,
    nextParams: HemoParameterEntry[],
    nextComplementary: HemoParameterEntry[],
    requiresConfirmation: boolean
  ) => void;
  onUpdateParameterValue: (
    id: string,
    field: 'value' | 'percentValue' | 'refMin' | 'refMax' | 'extractionStatus',
    nextValue: number | ExtractionValueStatus | null
  ) => void;
  onConfirmReview: () => void;
}

const STATUS_META: Record<
  ExtractionValueStatus,
  { label: string; colorClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  extracted: {
    label: 'Extraído (Revisar)',
    colorClass: 'text-amber-800',
    Icon: AlertTriangle
  },
  confirmed: {
    label: 'Confirmado',
    colorClass: 'text-emerald-800',
    Icon: CheckCircle2
  },
  unidentified: {
    label: 'Não identificado (ilegível)',
    colorClass: 'text-red-800',
    Icon: AlertTriangle
  },
  missing: {
    label: 'Ausente no laudo',
    colorClass: 'text-slate-500',
    Icon: HelpCircle
  }
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

function parseOptionalFloat(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export const HemoDocumentUploadPanel: React.FC<HemoDocumentUploadPanelProps> = ({
  metadata,
  parameters,
  complementaryLabs,
  ocrConfirmed,
  onUpdateMetadata,
  onApplyExtractedData,
  onUpdateParameterValue,
  onConfirmReview
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const allEntries = [...parameters, ...complementaryLabs];
  const needsReviewCount = allEntries.filter(
    (p) => p.extractionStatus === 'extracted' || p.extractionStatus === 'unidentified'
  ).length;

  const handleFile = async (file: File) => {
    setExtractError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setExtractError('Formato inválido. Envie um arquivo PDF, JPG, JPEG ou PNG do laudo.');
      return;
    }

    setIsExtracting(true);
    try {
      const base64 = await fileToBase64(file);
      const extracted = await apiClient.extractHemogramDocument({
        documentBase64: base64,
        mimeType: file.type,
        fileName: file.name
      });

      const byId = new Map<string, any>(
        (extracted.parameters || []).map((item: any) => [item.id, item])
      );

      const mergeList = (currentList: HemoParameterEntry[]): HemoParameterEntry[] =>
        currentList.map((entry) => {
          const hit = byId.get(entry.id);
          if (!hit) {
            return {
              ...entry,
              value: null,
              percentValue: entry.percentValue !== undefined ? null : undefined,
              extractionStatus: 'missing'
            };
          }
          return {
            ...entry,
            value: typeof hit.value === 'number' ? hit.value : null,
            percentValue:
              entry.percentValue !== undefined
                ? typeof hit.percentValue === 'number'
                  ? hit.percentValue
                  : null
                : undefined,
            refMin: typeof hit.refMin === 'number' ? hit.refMin : entry.refMin,
            refMax: typeof hit.refMax === 'number' ? hit.refMax : entry.refMax,
            extractionStatus: hit.extractionStatus || 'extracted',
            rawTextSnippet: hit.rawTextSnippet,
            confidence: hit.confidence
          };
        });

      const nextMeta: HemoDocumentMetadata = {
        laboratoryName: extracted.laboratoryName || 'Não informado',
        collectionDate: extracted.collectionDate || 'Não informado',
        examType: extracted.examType || 'Hemograma Completo',
        sourceFileName: file.name,
        extractedByOcr: true,
        ocrWarnings: Array.isArray(extracted.ocrWarnings) ? extracted.ocrWarnings : []
      };

      onApplyExtractedData(
        nextMeta,
        mergeList(parameters),
        mergeList(complementaryLabs),
        true
      );
    } catch (err: any) {
      setExtractError(err?.message || 'Erro durante a leitura OCR do hemograma.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <FileUp className="w-4 h-4 text-[#4A6B5D] shrink-0" />
            Importação Inteligente de Hemograma (OCR)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Suporta PDF multipágina, JPG, JPEG e PNG. Valores ilegíveis permanecem nulos para confirmação clínica obrigatória.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtracting}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors flex items-center gap-2 disabled:opacity-60 whitespace-nowrap shrink-0"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processando OCR...</span>
            </>
          ) : (
            <>
              <FileUp className="w-4 h-4" />
              <span>Anexar Laudo (PDF / Imagem)</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Área Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#4A6B5D] bg-[#4A6B5D]/5'
            : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-600">
          <FileText className="w-5 h-5 text-[#4A6B5D] shrink-0" />
          <span>
            {metadata.sourceFileName
              ? `Documento atual: ${metadata.sourceFileName} — clique ou arraste outro laudo para substituir.`
              : 'Arraste um hemograma em PDF, JPG ou PNG aqui ou clique para selecionar do computador.'}
          </span>
        </div>
      </div>

      {extractError && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <span>{extractError}</span>
        </div>
      )}

      {/* Metadados do Laudo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Laboratório</label>
          <input
            type="text"
            value={metadata.laboratoryName}
            onChange={(e) =>
              onUpdateMetadata({ ...metadata, laboratoryName: e.target.value })
            }
            placeholder="Ex.: Fleury / Sabin / Dasa"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Data da Coleta</label>
          <input
            type="text"
            value={metadata.collectionDate}
            onChange={(e) =>
              onUpdateMetadata({ ...metadata, collectionDate: e.target.value })
            }
            placeholder="YYYY-MM-DD"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono tabular-nums text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Tipo de Exame</label>
          <input
            type="text"
            value={metadata.examType}
            onChange={(e) =>
              onUpdateMetadata({ ...metadata, examType: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
      </div>

      {/* Alertas de OCR */}
      {metadata.ocrWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
          <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Observações de Leitura do Documento ({metadata.ocrWarnings.length})</span>
          </div>
          <ul className="list-disc pl-5 text-[11px] text-amber-900 space-y-0.5">
            {metadata.ocrWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Revisão obrigatória pós-OCR (ou revisão rápida de conferência) */}
      {metadata.extractedByOcr && (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-900">
                Conferência Clínica dos Parâmetros Extraídos
              </h4>
              <p className="text-[11px] text-slate-600">
                {ocrConfirmed
                  ? 'Valores confirmados pelo profissional para interpretação.'
                  : `${needsReviewCount} campo(s) aguardam conferência ou preenchimento antes de liberar a interpretação completa.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onConfirmReview}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                ocrConfirmed
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#4A6B5D] hover:bg-[#3d594c] text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{ocrConfirmed ? 'Dados Confirmados' : 'Confirmar Dados e Interpretar'}</span>
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2 px-3 font-semibold">Parâmetro</th>
                  <th className="py-2 px-3 font-semibold text-right">Valor</th>
                  <th className="py-2 px-3 font-semibold text-right">% (Branca)</th>
                  <th className="py-2 px-3 font-semibold text-right">Ref. Min</th>
                  <th className="py-2 px-3 font-semibold text-right">Ref. Max</th>
                  <th className="py-2 px-3 font-semibold">Status OCR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allEntries.map((item) => {
                  const st = STATUS_META[item.extractionStatus];
                  const Icon = st.Icon;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.unit}</div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          placeholder="N/I"
                          value={item.value ?? ''}
                          onChange={(e) => {
                            const val = parseOptionalFloat(e.target.value);
                            onUpdateParameterValue(item.id, 'value', val);
                            if (val !== null) {
                              onUpdateParameterValue(item.id, 'extractionStatus', 'confirmed');
                            }
                          }}
                          className="w-24 border border-slate-300 rounded px-2 py-1 text-right font-mono tabular-nums text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        {item.percentValue !== undefined ? (
                          <input
                            type="number"
                            step="0.1"
                            placeholder="N/I"
                            value={item.percentValue ?? ''}
                            onChange={(e) => {
                              const val = parseOptionalFloat(e.target.value);
                              onUpdateParameterValue(item.id, 'percentValue', val);
                              if (val !== null) {
                                onUpdateParameterValue(item.id, 'extractionStatus', 'confirmed');
                              }
                            }}
                            className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-mono tabular-nums text-xs"
                          />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          placeholder="—"
                          value={item.refMin ?? ''}
                          onChange={(e) =>
                            onUpdateParameterValue(item.id, 'refMin', parseOptionalFloat(e.target.value))
                          }
                          className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-mono tabular-nums text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          placeholder="—"
                          value={item.refMax ?? ''}
                          onChange={(e) =>
                            onUpdateParameterValue(item.id, 'refMax', parseOptionalFloat(e.target.value))
                          }
                          className="w-20 border border-slate-300 rounded px-2 py-1 text-right font-mono tabular-nums text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${st.colorClass}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{st.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
