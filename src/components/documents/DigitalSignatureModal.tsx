import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, Upload, Eraser, Check, Trash2 } from 'lucide-react';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureDataUrl: string) => void;
  currentSignature?: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  currentSignature
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [signatureUrl, setSignatureUrl] = useState<string>(currentSignature || '');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    if (currentSignature) {
      setSignatureUrl(currentSignature);
    }
  }, [currentSignature]);

  // Setup Canvas drawing context
  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a'; // slate-900
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureUrl(dataUrl);
    onSaveSignature(dataUrl);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSignatureUrl(result);
        onSaveSignature(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setSignatureUrl('');
    onSaveSignature('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#4A6B5D] flex items-center justify-center text-white">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Assinatura Digital do Nutricionista</h3>
              <p className="text-xs text-slate-400">Desenhe na tela ou envie uma imagem da sua assinatura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Tabs: Desenhar vs Upload */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('draw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'draw'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-[#4A6B5D]" />
              Desenhar na Tela
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#4A6B5D]" />
              Carregar Imagem (PNG/JPG)
            </button>
          </div>

          {/* Current Signature Preview */}
          {signatureUrl && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Assinatura Ativa Atual:
              </span>
              <div className="h-16 flex items-center justify-center bg-white border border-slate-200 rounded p-1 mb-2">
                <img src={signatureUrl} alt="Assinatura Digital" className="max-h-full object-contain" />
              </div>
              <button
                onClick={handleRemoveSignature}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 mx-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover / Limpar Assinatura
              </button>
            </div>
          )}

          {/* Tab 1: Draw on Canvas */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-2">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={160}
                  className="bg-white rounded border border-slate-200 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <span className="text-[10px] text-slate-400 mt-1.5">
                  Use o mouse ou o dedo na tela para assinar dentro do quadro acima
                </span>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Limpar Quadro
                </button>

                <button
                  onClick={saveDrawnSignature}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Salvar Assinatura
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-4 py-4 text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#4A6B5D]/10 text-[#4A6B5D] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Clique para carregar ou arraste a imagem da assinatura
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Recomendado: Fundo transparente (PNG) com dimensões 400x150px
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
