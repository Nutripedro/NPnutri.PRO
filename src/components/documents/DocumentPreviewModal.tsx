import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  BookmarkCheck, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  FileText,
  Loader2,
  PenTool
} from 'lucide-react';
import { exportDocumentToPdf, generateWhatsAppShareUrl } from '../../utils/documentUtils';
import { PatientContext } from '../../types/documents';
import { DigitalSignatureModal } from './DigitalSignatureModal';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  patient: PatientContext;
  onSaveToRecord?: () => void;
  isSaved?: boolean;
  children: React.ReactNode;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  patient,
  onSaveToRecord,
  isSaved = false,
  children
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(isSaved);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [signatureKey, setSignatureKey] = useState<number>(0);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const safeName = `${documentTitle.replace(/\s+/g, '_')}_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    await exportDocumentToPdf('clinical-document-paper-sheet', safeName);
    setIsExporting(false);
  };

  const handleWhatsApp = () => {
    const text = `Olá, ${patient.name}! Segue o link/resumo do seu documento clínico (${documentTitle}) emitido pela clínica. Acesse seu portal ou confirme o recebimento do arquivo em PDF.`;
    const url = generateWhatsAppShareUrl(patient.phone, text);
    window.open(url, '_blank');
  };

  const handleSave = () => {
    if (onSaveToRecord) {
      onSaveToRecord();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  const handleSaveSignature = (dataUrl: string) => {
    if (dataUrl) {
      localStorage.setItem('nutri_digital_signature', dataUrl);
    } else {
      localStorage.removeItem('nutri_digital_signature');
    }
    // Força re-render do preview
    setSignatureKey(prev => prev + 1);
  };

  const currentStoredSignature = typeof window !== 'undefined' ? localStorage.getItem('nutri_digital_signature') || '' : '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      {/* Top Action Bar (Clean Sage Theme) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#4A6B5D] flex items-center justify-center text-white">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Pré-visualização de Impressão (Padrão A4)
              <span className="text-[10px] font-normal bg-[#4A6B5D]/40 text-emerald-300 px-2 py-0.5 rounded border border-[#4A6B5D]/60">
                Clean Sage
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {documentTitle} • Paciente: <strong className="text-slate-300">{patient.name}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center bg-slate-800 rounded border border-slate-700 p-0.5 mr-1 text-xs text-slate-300">
            <button
              onClick={() => setZoom(prev => Math.max(70, prev - 10))}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">{zoom}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(130, prev + 10))}
              className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Configurar Assinatura Digital */}
          <button
            onClick={() => setIsSignatureModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              currentStoredSignature 
                ? 'bg-emerald-800/80 hover:bg-emerald-800 border-emerald-700 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Desenhar ou carregar assinatura digital para os documentos"
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {currentStoredSignature ? 'Assinatura Ativa ✓' : 'Assinatura Digital'}
            </span>
          </button>

          {/* Salvar no Prontuário */}
          {onSaveToRecord && (
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                savedSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Registrar cópia assinada no prontuário do paciente"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  Salvo!
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Salvar no Prontuário
                </>
              )}
            </button>
          )}

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-700 text-white transition-colors"
            title="Notificar paciente via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Baixar PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors disabled:opacity-50"
            title="Download de arquivo PDF de alta definição"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Baixar PDF
              </>
            )}
          </button>

          {/* Imprimir */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-white text-slate-900 transition-colors"
            title="Imprimir na impressora local"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {/* Fechar */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded ml-1 transition-colors"
            title="Fechar Visualização"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Canvas Scroll Area */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-950/60 print:bg-white print:p-0">
        <div 
          key={signatureKey}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 print:transform-none"
        >
          {/* Printable Sheet (Standard A4 dimensions: 210mm x 297mm) */}
          <div 
            id="clinical-document-paper-sheet"
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-200 print:shadow-none print:border-none print:m-0 print:w-full"
          >
            {children}
          </div>
        </div>
      </main>

      {/* Digital Signature Management Modal */}
      <DigitalSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={handleSaveSignature}
        currentSignature={currentStoredSignature}
      />
    </div>
  );
};
