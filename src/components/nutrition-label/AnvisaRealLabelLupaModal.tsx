import React, { useEffect, useRef, useState } from 'react';
import {
  CalculatedRecipeResult,
  TechnicalSheetRecipe
} from '../../types/nutritionLabel';
import { AnvisaLupaBadge } from './AnvisaOfficialLabelPreview';
import {
  AlertOctagon,
  Camera,
  CheckCircle2,
  Eye,
  Layers,
  Move,
  RotateCcw,
  Search,
  SplitSquareHorizontal,
  X,
  ZoomIn
} from 'lucide-react';

export type LupaCompareMode = 'overlay' | 'side_by_side' | 'curtain';

interface AnvisaRealLabelLupaModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  recipe: TechnicalSheetRecipe;
  calculated: CalculatedRecipeResult;
}

/**
 * Gera uma imagem realista simulada de rótulo impresso em embalagem
 * (útil para demonstração, validação de layout e comparação visual sem foto física).
 */
export function generateSimulatedRealLabelDataUrl(
  recipe: TechnicalSheetRecipe,
  calculated: CalculatedRecipeResult
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 760;
  canvas.height = 980;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fundo simulando embalagem kraft/creme suave com vinheta leve
  const grad = ctx.createLinearGradient(0, 0, 760, 980);
  grad.addColorStop(0, '#f3efe6');
  grad.addColorStop(1, '#e4ddd0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 760, 980);

  // Marca d'água sutil de embalagem comercial
  ctx.fillStyle = '#d6cebe';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('EMBALAGEM COMERCIAL · AMOSTRA SIMULADA', 40, 48);

  // Etiqueta adesiva branca com sombra realista
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(58, 76, 644, 856);
  ctx.restore();

  // Título do produto na embalagem
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText(recipe.name.slice(0, 34), 86, 122);
  ctx.fillStyle = '#4b5563';
  ctx.font = '15px Arial, sans-serif';
  ctx.fillText(
    `Peso Líq.: ${recipe.packageNetWeightG || calculated.finalYieldGrams} ${recipe.portionUnit} · Lote #2411`,
    86,
    148
  );

  // Lupa Frontal no canto superior direito da etiqueta se aplicável
  const lupaItems: string[] = [];
  if (calculated.lupa.highAddedSugar) lupaItems.push('AÇÚCAR ADICIONADO');
  if (calculated.lupa.highSaturatedFat) lupaItems.push('GORDURA SATURADA');
  if (calculated.lupa.highSodium) lupaItems.push('SÓDIO');

  if (lupaItems.length > 0) {
    const lx = 438;
    const ly = 166;
    const lw = 236;
    const lh = 46 + lupaItems.length * 32;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, lh, 12);
    ctx.fill();
    ctx.stroke();

    // Ícone lupa simples
    ctx.beginPath();
    ctx.arc(lx + 24, ly + 22, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx + 30, ly + 28);
    ctx.lineTo(lx + 38, ly + 36);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 16px Arial, sans-serif';
    ctx.fillText('ALTO EM', lx + 48, ly + 28);

    lupaItems.forEach((lbl, idx) => {
      const by = ly + 42 + idx * 32;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(lx + 10, by, lw - 20, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, lx + lw / 2, by + 18);
      ctx.textAlign = 'left';
    });
  }

  // Quadro da Tabela Nutricional na embalagem
  const tx = 86;
  const ty = lupaItems.length > 0 ? 316 : 186;
  const tw = 588;
  const rowH = 38;
  const th = 124 + calculated.rows.length * rowH;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(tx, ty, tw, th);

  ctx.fillStyle = '#000000';
  ctx.font = '900 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('INFORMAÇÃO NUTRICIONAL', tx + tw / 2, ty + 28);
  ctx.textAlign = 'left';

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tx, ty + 38);
  ctx.lineTo(tx + tw, ty + 38);
  ctx.stroke();

  ctx.font = '14px Arial, sans-serif';
  ctx.fillText(`Porções por embalagem: cerca de ${recipe.portionsPerPackage}`, tx + 14, ty + 60);
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillText(
    `Porção: ${recipe.portionSize} ${recipe.portionUnit} (${recipe.householdMeasure})`,
    tx + 14,
    ty + 80
  );

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tx, ty + 90);
  ctx.lineTo(tx + tw, ty + 90);
  ctx.stroke();

  const baseHeader = recipe.physicalState === 'liquido' ? '100 ml' : '100 g';
  const portionHeader = `${recipe.portionSize}${recipe.portionUnit}`;
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(baseHeader, tx + 390, ty + 112);
  ctx.fillText(portionHeader, tx + 492, ty + 112);
  ctx.fillText('%VD*', tx + 572, ty + 112);
  ctx.textAlign = 'left';

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tx, ty + 120);
  ctx.lineTo(tx + tw, ty + 120);
  ctx.stroke();

  calculated.rows.forEach((r, idx) => {
    const ry = ty + 120 + idx * rowH;
    if (idx > 0) {
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + 8, ry);
      ctx.lineTo(tx + tw - 8, ry);
      ctx.stroke();
    }

    ctx.fillStyle = '#000000';
    ctx.font = r.isBold ? 'bold 15px Arial, sans-serif' : '15px Arial, sans-serif';
    const indent = r.indentLevel === 1 ? 26 : r.indentLevel === 2 ? 40 : 14;
    ctx.fillText(r.label, tx + indent, ry + 25);

    ctx.textAlign = 'right';
    ctx.fillText(r.formatted100g, tx + 390, ry + 25);
    ctx.fillText(r.formattedPortion, tx + 492, ry + 25);
    ctx.fillText(r.vdPercent, tx + 572, ry + 25);
    ctx.textAlign = 'left';
  });

  // Declaração de ingredientes no rodapé da embalagem
  const footerY = ty + th + 28;
  if (footerY < 890) {
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText('INGREDIENTES:', tx, footerY);
    ctx.font = '13px Arial, sans-serif';
    const ing = (recipe.ingredientsDeclarationOverride || calculated.suggestedIngredientsList).slice(0, 95);
    ctx.fillText(ing, tx, footerY + 20);
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(calculated.suggestedGlutenText, tx, footerY + 42);
  }

  return canvas.toDataURL('image/png');
}

export const AnvisaCameraCaptureModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCaptured: (dataUrl: string) => void;
}> = ({ isOpen, onClose, onCaptured }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setErrorMsg(null);
    setIsReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Câmera ao vivo não suportada neste navegador. Utilize o botão de foto/arquivo.');
      return;
    }

    const startCamera = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          if (videoRef.current.readyState >= 1) {
            setIsReady(true);
          }
        }
      } catch {
        if (active) {
          setErrorMsg(
            'Não foi possível acessar a câmera (permissão negada ou dispositivo indisponível). Use o envio de imagem.'
          );
        }
      }
    };

    void startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCaptured(dataUrl);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Capturar foto do rótulo real pela câmera"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Camera className="w-4 h-4 text-orange-600" />
            <span>Fotografar Rótulo da Embalagem</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar câmera"
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
              {errorMsg}
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => setIsReady(true)}
                className="w-full h-full object-cover"
              />
              <div className="pointer-events-none absolute inset-4 border-2 border-dashed border-white/60 rounded-lg" />
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            {!errorMsg && (
              <button
                type="button"
                disabled={!isReady}
                onClick={handleCapture}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Capturar Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnvisaRealLabelLupaModal: React.FC<AnvisaRealLabelLupaModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  recipe,
  calculated
}) => {
  const [mode, setMode] = useState<LupaCompareMode>('overlay');
  const [loupeEnabled, setLoupeEnabled] = useState<boolean>(true);
  const [zoomFactor, setZoomFactor] = useState<number>(2);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(78);
  const [overlayScale, setOverlayScale] = useState<number>(95);
  const [overlayOffset, setOverlayOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [curtainPercent, setCurtainPercent] = useState<number>(50);
  const [loupePos, setLoupePos] = useState<{
    active: boolean;
    pxX: number;
    pxY: number;
    imgRelX: number;
    imgRelY: number;
    imgW: number;
    imgH: number;
  }>({ active: false, pxX: 0, pxY: 0, imgRelX: 0, imgRelY: 0, imgW: 0, imgH: 0 });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStateRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const baseHeader = recipe.physicalState === 'liquido' ? '100 ml' : '100 g';
  const portionHeader = `${recipe.portionSize} ${recipe.portionUnit}`;
  const checkByKey = new Map(calculated.lupa.checks.map((c) => [c.key, c]));

  const updateLoupePointer = (clientX: number, clientY: number) => {
    if (!stageRef.current || !imgRef.current || !loupeEnabled) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(stageRect.width, clientX - stageRect.left));
    const y = Math.max(0, Math.min(stageRect.height, clientY - stageRect.top));
    const imgRelX = Math.max(0, Math.min(imgRect.width, clientX - imgRect.left));
    const imgRelY = Math.max(0, Math.min(imgRect.height, clientY - imgRect.top));
    setLoupePos({
      active: true,
      pxX: x,
      pxY: y,
      imgRelX,
      imgRelY,
      imgW: imgRect.width,
      imgH: imgRect.height
    });
  };

  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: overlayOffset.x,
      origY: overlayOffset.y
    };
  };

  const handleOverlayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current?.dragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    setOverlayOffset({
      x: dragStateRef.current.origX + dx,
      y: dragStateRef.current.origY + dy
    });
  };

  const handleOverlayPointerUp = () => {
    dragStateRef.current = null;
  };

  const renderCalculatedOverlayTable = (compactOverlay = false) => (
    <div className="bg-white text-black border-2 border-black rounded-md shadow-xl p-2.5 space-y-2 select-none">
      {calculated.lupa.required && (
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-black/20">
          <AnvisaLupaBadge
            highAddedSugar={calculated.lupa.highAddedSugar}
            highSaturatedFat={calculated.lupa.highSaturatedFat}
            highSodium={calculated.lupa.highSodium}
            scale={compactOverlay ? 0.85 : 0.95}
          />
          <span className="text-[9px] font-mono text-slate-600 text-right">
            Cálculo Técnico
            <br />
            RDC 429/2020
          </span>
        </div>
      )}

      <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="border-b-2 border-black pb-1 mb-1">
          <div className="font-black uppercase text-center text-xs tracking-tight">
            INFORMAÇÃO NUTRICIONAL (CÁLCULO TÉCNICO)
          </div>
          <div className="text-[10px]">
            Porções: {recipe.portionsPerPackage} · Porção: {recipe.portionSize}{' '}
            {recipe.portionUnit} ({recipe.householdMeasure})
          </div>
        </div>
        <div className="grid grid-cols-12 font-bold border-b border-black py-0.5 text-[10px]">
          <div className="col-span-6">Nutriente</div>
          <div className="col-span-2 text-right">{baseHeader}</div>
          <div className="col-span-2 text-right">{portionHeader}</div>
          <div className="col-span-2 text-right">%VD*</div>
        </div>
        <div className="divide-y divide-black/30 text-[10.5px]">
          {calculated.rows.map((row) => {
            const regCheck =
              row.key === 'addedSugars' || row.key === 'saturatedFat' || row.key === 'sodium'
                ? checkByKey.get(row.key)
                : undefined;
            const exceeds = regCheck?.status === 'exceeds';
            return (
              <div
                key={row.key}
                className={`grid grid-cols-12 items-center py-[2.5px] px-1 ${
                  row.isBold ? 'font-bold' : 'font-normal'
                } ${exceeds ? 'bg-rose-50 text-rose-900' : ''}`}
              >
                <div
                  className="col-span-6 flex items-center gap-1 truncate pr-1"
                  style={{
                    paddingLeft:
                      row.indentLevel === 1 ? '8px' : row.indentLevel === 2 ? '16px' : '0px'
                  }}
                >
                  {exceeds && <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />}
                  <span className="truncate">{row.label}</span>
                </div>
                <div className="col-span-2 text-right font-mono tabular-nums">
                  {row.formatted100g}
                </div>
                <div className="col-span-2 text-right font-mono tabular-nums">
                  {row.formattedPortion}
                </div>
                <div className="col-span-2 text-right font-mono tabular-nums">{row.vdPercent}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lupa Interativa de Comparação: Rótulo Real vs Tabela Técnica ANVISA"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-6xl w-full max-h-[94vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Cabeçalho & Controles da Lupa */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Lupa de Auditoria Visual — Rótulo Real vs. Cálculo Técnico
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Passe o cursor/dedo para ampliar o rótulo real e sobreponha os dados da{' '}
                <strong>TabelaAnvisaView</strong> para conferência.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode('overlay')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                mode === 'overlay'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sobreposição</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('side_by_side')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                mode === 'side_by_side'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lado a Lado</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('curtain')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                mode === 'curtain'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              <span>Cortina</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar Lupa de Comparação"
              className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Ajustes Finos */}
        <div className="px-4 sm:px-5 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex flex-wrap items-center gap-4 text-xs">
          <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={loupeEnabled}
              onChange={(e) => setLoupeEnabled(e.target.checked)}
            />
            <ZoomIn className="w-3.5 h-3.5 text-orange-600" />
            <span>Lente de Aumento</span>
          </label>

          {loupeEnabled && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Zoom:</span>
              {[1.5, 2, 3].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoomFactor(z)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold cursor-pointer ${
                    zoomFactor === z
                      ? 'bg-slate-900 dark:bg-orange-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {z}×
                </button>
              ))}
            </div>
          )}

          {mode === 'overlay' && (
            <>
              <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <span>Opacidade Tabela ({overlayOpacity}%):</span>
                <input
                  type="range"
                  min={15}
                  max={100}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-24 accent-orange-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <span>Escala ({overlayScale}%):</span>
                <input
                  type="range"
                  min={65}
                  max={130}
                  value={overlayScale}
                  onChange={(e) => setOverlayScale(Number(e.target.value))}
                  className="w-20 accent-orange-600 cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setOverlayOffset({ x: 0, y: 0 });
                  setOverlayScale(95);
                  setOverlayOpacity(78);
                }}
                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Centralizar</span>
              </button>
            </>
          )}

          {mode === 'curtain' && (
            <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <span>Divisor Cortina ({curtainPercent}%):</span>
              <input
                type="range"
                min={5}
                max={95}
                value={curtainPercent}
                onChange={(e) => setCurtainPercent(Number(e.target.value))}
                className="w-36 accent-orange-600 cursor-pointer"
              />
            </label>
          )}
        </div>

        {/* Palco de Comparação */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Área da Imagem + Lupa / Sobreposição */}
            <div className={mode === 'side_by_side' ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <div
                ref={stageRef}
                onPointerDown={(e) => updateLoupePointer(e.clientX, e.clientY)}
                onPointerMove={(e) => updateLoupePointer(e.clientX, e.clientY)}
                onPointerEnter={(e) => updateLoupePointer(e.clientX, e.clientY)}
                onPointerLeave={() => setLoupePos((p) => ({ ...p, active: false }))}
                onTouchMove={(e) => {
                  if (e.touches[0]) {
                    updateLoupePointer(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                className="relative mx-auto max-w-2xl rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-md select-none touch-none flex items-center justify-center"
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Imagem do rótulo real para comparação visual"
                  className="max-w-full max-h-[65vh] w-auto h-auto object-contain block"
                />

                {/* Lupa Óptica Circular */}
                {loupeEnabled && loupePos.active && loupePos.imgW > 0 && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute w-40 h-40 rounded-full border-[3px] border-orange-600 shadow-2xl z-20"
                    style={{
                      left: `${loupePos.pxX - 80}px`,
                      top: `${loupePos.pxY - 80}px`,
                      backgroundImage: `url("${imageUrl}")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${loupePos.imgW * zoomFactor}px ${loupePos.imgH * zoomFactor}px`,
                      backgroundPosition: `${80 - loupePos.imgRelX * zoomFactor}px ${
                        80 - loupePos.imgRelY * zoomFactor
                      }px`,
                      backgroundColor: '#ffffff'
                    }}
                  />
                )}

                {/* Modo Sobreposição Arrastável */}
                {mode === 'overlay' && (
                  <div
                    onPointerDown={handleOverlayPointerDown}
                    onPointerMove={handleOverlayPointerMove}
                    onPointerUp={handleOverlayPointerUp}
                    style={{
                      opacity: overlayOpacity / 100,
                      transform: `translate(calc(-50% + ${overlayOffset.x}px), calc(-50% + ${overlayOffset.y}px)) scale(${
                        overlayScale / 100
                      })`
                    }}
                    className="absolute top-1/2 left-1/2 w-[88%] max-w-[360px] z-30 cursor-grab active:cursor-grabbing"
                  >
                    <div className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-semibold">
                      <Move className="w-3 h-3 text-orange-400" />
                      <span>Arraste para alinhar com o rótulo real</span>
                    </div>
                    {renderCalculatedOverlayTable(true)}
                  </div>
                )}

                {/* Modo Cortina Deslizante */}
                {mode === 'curtain' && (
                  <>
                    <div
                      className="absolute inset-0 bg-white/95 p-4 flex items-center justify-center z-20 pointer-events-none overflow-hidden"
                      style={{
                        clipPath: `inset(0 0 0 ${curtainPercent}%)`
                      }}
                    >
                      <div className="w-full max-w-[360px]">{renderCalculatedOverlayTable(false)}</div>
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-orange-600 z-30 pointer-events-none"
                      style={{ left: `${curtainPercent}%` }}
                    >
                      <span className="absolute top-2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-orange-600 text-white text-[9px] font-bold whitespace-nowrap">
                        Real | Técnico
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Coluna Lado a Lado: Tabela Calculada + Lupa Frontal */}
            {mode === 'side_by_side' && (
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>Dados Calculados (TabelaAnvisaView)</span>
                  <span className="text-[11px] font-mono text-slate-500">{recipe.name}</span>
                </div>
                {renderCalculatedOverlayTable(false)}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Conferência Rápida RDC 429/2020 */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {calculated.lupa.checks.map((c) => (
              <span
                key={c.key}
                className={`inline-flex items-center gap-1 font-mono tabular-nums text-[11px] font-semibold ${
                  c.status === 'exceeds'
                    ? 'text-rose-700 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {c.status === 'exceeds' ? (
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span>
                  {c.label}: {c.formattedPer100} {c.unit}
                </span>
              </span>
            ))}
          </div>
          <span className="text-[11px] text-slate-500">
            Rendimento: <strong className="font-mono">{calculated.finalYieldGrams} g</strong> · Porção:{' '}
            <strong className="font-mono">
              {recipe.portionSize} {recipe.portionUnit}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
