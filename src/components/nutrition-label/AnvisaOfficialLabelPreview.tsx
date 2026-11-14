import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  CalculatedRecipeResult,
  LabelLayoutModel,
  TechnicalSheetRecipe
} from '../../types/nutritionLabel';
import { sanitizeLabelText } from '../../domain/anvisaLabelEngine';
import { useMagnifier } from '../../hooks/useMagnifier';
import {
  AnvisaCameraCaptureModal,
  AnvisaRealLabelLupaModal,
  generateSimulatedRealLabelDataUrl
} from './AnvisaRealLabelLupaModal';
import {
  AlertOctagon,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Printer,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  ZoomIn
} from 'lucide-react';

interface AnvisaOfficialLabelPreviewProps {
  recipe: TechnicalSheetRecipe;
  calculated: CalculatedRecipeResult;
  onUpdateRecipe?: (updates: Partial<TechnicalSheetRecipe>) => void;
  compact?: boolean;
}

/**
 * Vetor SVG oficial simplificado da Lupa Frontal ANVISA (IN 75/2020 Anexo XV)
 * Sempre em alto contraste P&B (#FFFFFF fundo, #000000 traço e blocos).
 */
export const AnvisaLupaBadge: React.FC<{
  highAddedSugar: boolean;
  highSaturatedFat: boolean;
  highSodium: boolean;
  scale?: number;
}> = ({ highAddedSugar, highSaturatedFat, highSodium, scale = 1 }) => {
  const activeLabels = [
    highAddedSugar ? 'AÇÚCAR ADICIONADO' : null,
    highSaturatedFat ? 'GORDURA SATURADA' : null,
    highSodium ? 'SÓDIO' : null
  ].filter(Boolean) as string[];

  if (activeLabels.length === 0) return null;

  return (
    <div
      className="inline-flex flex-col bg-white text-black border-2 border-black rounded-[10px] p-2 select-none"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left'
      }}
      aria-label={`Rotulagem Nutricional Frontal: Alto em ${activeLabels.join(', ')}`}
    >
      <div className="flex items-center gap-1.5 border-b border-black pb-1 mb-1 px-0.5">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="10.5" cy="10.5" r="6.5" stroke="#000000" strokeWidth="2.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-black tracking-wide uppercase leading-none text-black">
          ALTO EM
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {activeLabels.map((item) => (
          <div
            key={item}
            className="bg-black text-white text-[10px] font-black uppercase tracking-tight px-2.5 py-1 rounded-[5px] text-center leading-tight whitespace-nowrap"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export function buildAnvisaLabelSvg(
  recipe: TechnicalSheetRecipe,
  calculated: CalculatedRecipeResult
): string {
  const safeName = sanitizeLabelText(recipe.name);
  const safeMeasure = sanitizeLabelText(recipe.householdMeasure);
  const baseHeader = recipe.physicalState === 'liquido' ? '100 ml' : '100 g';
  const portionHeader = `${recipe.portionSize}${recipe.portionUnit}`;

  const rowYStart = 92;
  const rowHeight = 20;
  const rowsSvg = calculated.rows
    .map((r, idx) => {
      const y = rowYStart + idx * rowHeight;
      const indent = r.indentLevel === 1 ? 18 : r.indentLevel === 2 ? 26 : 10;
      const weight = r.isBold ? '700' : '400';
      return `
        <line x1="8" y1="${y - 13}" x2="332" y2="${y - 13}" stroke="#000000" stroke-width="0.6" />
        <text x="${indent}" y="${y}" font-family="Arial, sans-serif" font-size="10.5" font-weight="${weight}" fill="#000000">${sanitizeLabelText(r.label)}</text>
        <text x="218" y="${y}" font-family="Arial, sans-serif" font-size="10.5" font-weight="${weight}" text-anchor="end" fill="#000000">${sanitizeLabelText(r.formatted100g)}</text>
        <text x="275" y="${y}" font-family="Arial, sans-serif" font-size="10.5" font-weight="${weight}" text-anchor="end" fill="#000000">${sanitizeLabelText(r.formattedPortion)}</text>
        <text x="330" y="${y}" font-family="Arial, sans-serif" font-size="10.5" font-weight="${weight}" text-anchor="end" fill="#000000">${sanitizeLabelText(r.vdPercent)}</text>
      `;
    })
    .join('');

  const lupaItems: string[] = [];
  if (calculated.lupa.highAddedSugar) lupaItems.push('AÇÚCAR ADICIONADO');
  if (calculated.lupa.highSaturatedFat) lupaItems.push('GORDURA SATURADA');
  if (calculated.lupa.highSodium) lupaItems.push('SÓDIO');

  const lupaSvg =
    lupaItems.length > 0
      ? `
      <g transform="translate(8, 326)">
        <rect x="0" y="0" width="168" height="${34 + lupaItems.length * 22}" rx="8" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
        <circle cx="16" cy="15" r="5" fill="none" stroke="#000000" stroke-width="2" />
        <line x1="20" y1="19" x2="25" y2="24" stroke="#000000" stroke-width="2.2" />
        <text x="32" y="19" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#000000">ALTO EM</text>
        ${lupaItems
          .map(
            (lbl, i) => `
          <rect x="8" y="${28 + i * 21}" width="152" height="17" rx="4" fill="#000000" />
          <text x="84" y="${40 + i * 21}" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" text-anchor="middle" fill="#FFFFFF">${lbl}</text>
        `
          )
          .join('')}
      </g>`
      : '';

  const totalHeight = lupaItems.length > 0 ? 375 + lupaItems.length * 22 : 335;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="${totalHeight}" viewBox="0 0 340 ${totalHeight}">
  <rect x="0" y="0" width="340" height="${totalHeight}" fill="#FFFFFF" />
  <rect x="4" y="4" width="332" height="314" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
  <text x="170" y="22" font-family="Arial, sans-serif" font-size="13" font-weight="900" text-anchor="middle" fill="#000000">INFORMAÇÃO NUTRICIONAL</text>
  <line x1="4" y1="28" x2="336" y2="28" stroke="#000000" stroke-width="1.5" />
  <text x="10" y="42" font-family="Arial, sans-serif" font-size="10" fill="#000000">Porções por embalagem: cerca de ${recipe.portionsPerPackage}</text>
  <text x="10" y="55" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#000000">Porção: ${recipe.portionSize} ${recipe.portionUnit} (${safeMeasure})</text>
  <line x1="4" y1="61" x2="336" y2="61" stroke="#000000" stroke-width="2" />
  <text x="10" y="74" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#000000">${safeName.slice(0, 24)}</text>
  <text x="218" y="74" font-family="Arial, sans-serif" font-size="10" font-weight="700" text-anchor="end" fill="#000000">${baseHeader}</text>
  <text x="275" y="74" font-family="Arial, sans-serif" font-size="10" font-weight="700" text-anchor="end" fill="#000000">${portionHeader}</text>
  <text x="330" y="74" font-family="Arial, sans-serif" font-size="10" font-weight="700" text-anchor="end" fill="#000000">%VD*</text>
  ${rowsSvg}
  <line x1="4" y1="292" x2="336" y2="292" stroke="#000000" stroke-width="1.8" />
  <text x="10" y="304" font-family="Arial, sans-serif" font-size="8.5" fill="#000000">*Percentual de valores diários fornecidos pela porção.</text>
  <text x="10" y="314" font-family="Arial, sans-serif" font-size="8.5" fill="#000000">**VD não estabelecido. (RDC 429/2020 &amp; IN 75/2020)</text>
  ${lupaSvg}
</svg>`;
}

export const AnvisaOfficialLabelPreview: React.FC<AnvisaOfficialLabelPreviewProps> = ({
  recipe,
  calculated,
  onUpdateRecipe,
  compact = false
}) => {
  const captureRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [showPackagingFrame, setShowPackagingFrame] = useState<boolean>(!compact);
  const [highlightLimitsOnScreen, setHighlightLimitsOnScreen] = useState<boolean>(true);
  const [isLupaModalOpen, setIsLupaModalOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [inlineMagnifierEnabled, setInlineMagnifierEnabled] = useState<boolean>(true);
  const [inlineOverlayEnabled, setInlineOverlayEnabled] = useState<boolean>(true);
  const [inlineOverlayOpacity, setInlineOverlayOpacity] = useState<number>(68);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [realLabelImage, setRealLabelImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`anvisa_real_label_${recipe.id}`);
    } catch {
      return null;
    }
  });

  const magnifier = useMagnifier({
    initialScale: 2,
    minScale: 1.5,
    maxScale: 3.5,
    enabled: inlineMagnifierEnabled && Boolean(realLabelImage)
  });

  useEffect(() => {
    try {
      setRealLabelImage(localStorage.getItem(`anvisa_real_label_${recipe.id}`));
    } catch {
      setRealLabelImage(null);
    }
    setUploadError(null);
    magnifier.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.id]);

  const saveRealLabelImage = (dataUrl: string | null) => {
    setRealLabelImage(dataUrl);
    setUploadError(null);
    magnifier.reset();
    try {
      if (dataUrl) {
        localStorage.setItem(`anvisa_real_label_${recipe.id}`, dataUrl);
      } else {
        localStorage.removeItem(`anvisa_real_label_${recipe.id}`);
      }
    } catch {
      // Ignora erro de cota de armazenamento mantendo a imagem em memória
    }
  };

  const handleRealLabelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione apenas arquivos de imagem (JPG, PNG ou WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('A imagem excede o limite de 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        saveRealLabelImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateRealLabelImage = () => {
    const generated = generateSimulatedRealLabelDataUrl(recipe, calculated);
    if (generated) {
      saveRealLabelImage(generated);
    }
  };

  const showRegulatoryHighlight = highlightLimitsOnScreen && exporting === null;
  const checkByKey = new Map(calculated.lupa.checks.map((c) => [c.key, c]));

  const baseHeader = recipe.physicalState === 'liquido' ? '100 ml' : '100 g';
  const portionHeader = `${recipe.portionSize} ${recipe.portionUnit}`;
  const ingredientsText =
    recipe.ingredientsDeclarationOverride?.trim() || calculated.suggestedIngredientsList;
  const allergensText =
    recipe.allergensDeclarationOverride?.trim() || calculated.suggestedAllergensList;

  const fontScale = Math.max(0.75, Math.min(1.25, (recipe.fontScalePercent || 100) / 100));

  const waitNextPaint = () =>
    new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

  const handleExportPng = async () => {
    if (!captureRef.current) return;
    setExporting('png');
    try {
      await waitNextPaint();
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 3,
        useCORS: true
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `rotulo-anvisa-${recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.click();
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (!captureRef.current) return;
    setExporting('pdf');
    try {
      await waitNextPaint();
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 3
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text(`NUTRITION LABEL AI — Rótulo Oficial ANVISA`, 15, 16);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(
        `Produto: ${recipe.name} | Normas: RDC 429/2020 & IN 75/2020 | Modelo: ${recipe.layoutModel}`,
        15,
        22
      );
      pdf.text(
        `Dimensões simuladas: ${recipe.labelWidthMm} mm × ${recipe.labelHeightMm} mm | Metodologia: ${recipe.methodology}`,
        15,
        27
      );

      const imgWidthMm = Math.max(55, Math.min(170, recipe.labelWidthMm * 1.4));
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      pdf.addImage(imgData, 'PNG', 15, 34, imgWidthMm, imgHeightMm);

      pdf.save(`rotulo-anvisa-${recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportSvg = () => {
    const svg = buildAnvisaLabelSvg(recipe, calculated);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotulo-anvisa-${recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['Nutriente', baseHeader, portionHeader, '%VD*'];
    const lines = [
      `Produto;${recipe.name}`,
      `Porção;${recipe.portionSize} ${recipe.portionUnit} (${recipe.householdMeasure})`,
      `Porções por embalagem;${recipe.portionsPerPackage}`,
      headers.join(';'),
      ...calculated.rows.map(
        (r) => `${r.label};${r.formatted100g};${r.formattedPortion};${r.vdPercent}`
      )
    ];
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tabela-nutricional-${recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTechnicalSheetPdf = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('FICHA TÉCNICA DE PREPARAÇÃO & AUDITORIA ANVISA', 14, 16);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(`Produto: ${recipe.name} (${recipe.category})`, 14, 24);
    pdf.text(
      `Rendimento Final: ${calculated.finalYieldGrams} g | Peso Líquido Total: ${calculated.totalNetWeightG} g | Porção: ${recipe.portionSize}${recipe.portionUnit} (${recipe.householdMeasure})`,
      14,
      30
    );
    pdf.text(
      `Autor: ${recipe.authorName} | Versão: v${recipe.version} | Metodologia: ${recipe.methodology}`,
      14,
      36
    );

    let y = 46;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ingredientes da Formulação:', 14, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    calculated.ingredientContributions.forEach((item, idx) => {
      if (y > 265) {
        pdf.addPage();
        y = 18;
      }
      pdf.text(
        `${idx + 1}. ${item.name} — Liq: ${item.netWeightG}g | Kcal: ${item.kcal ?? 'N/I'} | Carb: ${item.carbsG ?? 'N/I'}g | Prot: ${item.proteinG ?? 'N/I'}g | Gord: ${item.fatG ?? 'N/I'}g | Na: ${item.sodiumMg ?? 'N/I'}mg`,
        14,
        y
      );
      y += 5.5;
    });

    y += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.text(`Tabela Nutricional (${baseHeader} / ${portionHeader} / %VD*):`, 14, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    calculated.rows.forEach((r) => {
      pdf.text(`${r.label}: ${r.formatted100g} | ${r.formattedPortion} | ${r.vdPercent}%`, 14, y);
      y += 5;
    });

    y += 4;
    const ingLines = pdf.splitTextToSize(`INGREDIENTES: ${ingredientsText}`, 180);
    pdf.text(ingLines, 14, y);
    y += ingLines.length * 4.5 + 3;
    const alLines = pdf.splitTextToSize(
      `${allergensText} ${calculated.suggestedGlutenText} ${calculated.suggestedLactoseText}`.trim(),
      180
    );
    pdf.text(alLines, 14, y);

    pdf.save(`ficha-tecnica-${recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
  };

  const renderTableRows = (rowsSubset = calculated.rows) => (
    <div className="divide-y divide-black/40 text-black" style={{ fontSize: `${11 * fontScale}px` }}>
      {rowsSubset.map((row) => {
        const regCheck =
          row.key === 'addedSugars' || row.key === 'saturatedFat' || row.key === 'sodium'
            ? checkByKey.get(row.key)
            : undefined;
        const isExceeds = showRegulatoryHighlight && regCheck?.status === 'exceeds';
        const isNear = showRegulatoryHighlight && regCheck?.status === 'near_limit';

        return (
          <div
            key={row.key}
            title={isExceeds || isNear ? regCheck?.recommendationText : undefined}
            className={`grid grid-cols-12 items-center py-[3px] px-1.5 ${
              row.isBold ? 'font-bold' : 'font-normal'
            } ${
              isExceeds
                ? 'bg-rose-50 text-rose-900 border-l-[3px] border-l-rose-600'
                : isNear
                  ? 'bg-amber-50/80 text-amber-900 border-l-[3px] border-l-amber-500'
                  : ''
            }`}
          >
            <div
              className="col-span-6 pr-1 flex items-center justify-between gap-1 min-w-0"
              style={{
                paddingLeft: row.indentLevel === 1 ? '10px' : row.indentLevel === 2 ? '18px' : '0px'
              }}
            >
              <span className="truncate flex items-center gap-1 min-w-0">
                {isExceeds && (
                  <AlertOctagon
                    className="w-3 h-3 text-rose-600 shrink-0"
                    aria-label="Limite RDC 429/2020 excedido"
                  />
                )}
                {isNear && (
                  <AlertTriangle
                    className="w-3 h-3 text-amber-600 shrink-0"
                    aria-label="Próximo ao limite RDC 429/2020"
                  />
                )}
                <span className="truncate">{row.label}</span>
              </span>
              {isExceeds && (
                <span className="text-[8.5px] font-black uppercase tracking-tight px-1 py-[1px] rounded bg-rose-700 text-white shrink-0">
                  ALTO EM
                </span>
              )}
              {isNear && (
                <span className="text-[8.5px] font-bold uppercase tracking-tight px-1 py-[1px] rounded bg-amber-600 text-white shrink-0">
                  &ge;85%
                </span>
              )}
            </div>
            <div
              className={`col-span-2 text-right font-mono tabular-nums ${
                isExceeds ? 'text-rose-700 font-extrabold' : ''
              }`}
            >
              {row.formatted100g}
            </div>
            <div className="col-span-2 text-right font-mono tabular-nums">{row.formattedPortion}</div>
            <div className="col-span-2 text-right font-mono tabular-nums">{row.vdPercent}</div>
          </div>
        );
      })}
    </div>
  );

  const renderTableHeader = () => (
    <div
      className="grid grid-cols-12 font-bold border-b-2 border-black py-1 px-1.5 text-black bg-white"
      style={{ fontSize: `${10 * fontScale}px` }}
    >
      <div className="col-span-6"></div>
      <div className="col-span-2 text-right">{baseHeader}</div>
      <div className="col-span-2 text-right">{portionHeader}</div>
      <div className="col-span-2 text-right">%VD*</div>
    </div>
  );

  const renderOfficialTableByModel = (model: LabelLayoutModel) => {
    if (model === 'linear') {
      return (
        <div
          className="bg-white text-black border-2 border-black p-2.5 leading-snug"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: `${10 * fontScale}px` }}
        >
          <span className="font-black uppercase">INFORMAÇÃO NUTRICIONAL: </span>
          <span>
            Porções por embalagem: cerca de {recipe.portionsPerPackage} · Porção: {recipe.portionSize}{' '}
            {recipe.portionUnit} ({recipe.householdMeasure}).{' '}
          </span>
          <span className="font-bold">Por {baseHeader} ({portionHeader}, %VD*): </span>
          {calculated.rows.map((r, i) => {
            const regCheck =
              r.key === 'addedSugars' || r.key === 'saturatedFat' || r.key === 'sodium'
                ? checkByKey.get(r.key)
                : undefined;
            const isExceeds = showRegulatoryHighlight && regCheck?.status === 'exceeds';
            return (
              <span
                key={r.key}
                className={isExceeds ? 'bg-rose-100 text-rose-900 px-1 rounded font-bold' : ''}
              >
                {isExceeds && (
                  <AlertOctagon
                    className="inline w-3 h-3 text-rose-700 mr-0.5 align-text-bottom"
                    aria-hidden="true"
                  />
                )}
                {r.isBold ? <strong>{r.label}</strong> : r.label}{' '}
                <span className="font-mono tabular-nums">
                  {r.formatted100g} ({r.formattedPortion}, {r.vdPercent}%)
                </span>
                {isExceeds ? ' [ALTO EM]' : ''}
                {i < calculated.rows.length - 1 ? ' · ' : '. '}
              </span>
            );
          })}
          <span className="block mt-1 text-[8.5px]">
            *Percentual de valores diários fornecidos pela porção. **VD não estabelecido.
          </span>
        </div>
      );
    }

    if (model === 'horizontal') {
      return (
        <div
          className="bg-white text-black border-2 border-black grid grid-cols-12"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          <div className="col-span-4 border-r-2 border-black p-2 flex flex-col justify-between">
            <div>
              <div className="font-black uppercase leading-tight text-xs">
                INFORMAÇÃO NUTRICIONAL
              </div>
              <div className="mt-2 text-[10px] leading-tight">
                Porções por embalagem: cerca de {recipe.portionsPerPackage}
              </div>
              <div className="mt-1 text-[10px] font-bold leading-tight">
                Porção: {recipe.portionSize} {recipe.portionUnit} ({recipe.householdMeasure})
              </div>
            </div>
            <div className="text-[8.5px] leading-tight pt-2 border-t border-black mt-2">
              *Percentual de valores diários fornecidos pela porção. **VD não estabelecido.
            </div>
          </div>
          <div className="col-span-8">
            {renderTableHeader()}
            {renderTableRows()}
          </div>
        </div>
      );
    }

    if (model === 'vertical_quebrado' || model === 'horizontal_quebrado') {
      const half = Math.ceil(calculated.rows.length / 2);
      const firstHalf = calculated.rows.slice(0, half);
      const secondHalf = calculated.rows.slice(half);
      return (
        <div
          className="bg-white text-black border-2 border-black"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          <div className="border-b-2 border-black px-2 py-1.5 text-center">
            <div className="font-black uppercase text-xs tracking-tight">
              INFORMAÇÃO NUTRICIONAL
            </div>
            <div className="text-[10px]">
              Porções por embalagem: cerca de {recipe.portionsPerPackage} · Porção:{' '}
              <strong>
                {recipe.portionSize} {recipe.portionUnit} ({recipe.householdMeasure})
              </strong>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black">
            <div>
              {renderTableHeader()}
              {renderTableRows(firstHalf)}
            </div>
            <div>
              {renderTableHeader()}
              {renderTableRows(secondHalf)}
            </div>
          </div>
          <div className="border-t-2 border-black px-2 py-1 text-[8.5px] leading-tight">
            *Percentual de valores diários fornecidos pela porção. **VD não estabelecido.
          </div>
        </div>
      );
    }

    // Default: Modelo Vertical Oficial (IN 75/2020 Anexo V)
    return (
      <div
        className="bg-white text-black border-2 border-black"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        <div className="border-b-2 border-black px-2.5 py-1.5">
          <div className="font-black uppercase text-center tracking-tight text-sm leading-tight">
            INFORMAÇÃO NUTRICIONAL
          </div>
          <div className="text-[10.5px] leading-snug mt-0.5">
            Porções por embalagem: cerca de {recipe.portionsPerPackage}
          </div>
          <div className="text-[10.5px] font-bold leading-snug">
            Porção: {recipe.portionSize} {recipe.portionUnit} ({recipe.householdMeasure})
          </div>
        </div>
        {renderTableHeader()}
        {renderTableRows()}
        <div className="border-t-2 border-black px-2 py-1 text-[8.5px] leading-tight">
          *Percentual de valores diários fornecidos pela porção.
          <br />
          **Valor diário não estabelecido.
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar de Modelos Oficiais & Simulador de Embalagem */}
      {!compact && onUpdateRecipe && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Modelo Oficial ANVISA (IN 75/2020 Anexo V)
            </span>
            <button
              type="button"
              onClick={() => setShowPackagingFrame((v) => !v)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{showPackagingFrame ? 'Ocultar guia dimensional' : 'Simular embalagem'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'vertical', label: 'Vertical' },
                { id: 'horizontal', label: 'Horizontal' },
                { id: 'vertical_quebrado', label: 'Vert. Quebrado' },
                { id: 'horizontal_quebrado', label: 'Horiz. Quebrado' },
                { id: 'linear', label: 'Linear (<100cm²)' }
              ] as Array<{ id: LabelLayoutModel; label: string }>
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateRecipe({ layoutModel: m.id })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  recipe.layoutModel === m.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {showPackagingFrame && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Largura (mm)</label>
                <input
                  type="number"
                  min={40}
                  max={220}
                  value={recipe.labelWidthMm}
                  onChange={(e) =>
                    onUpdateRecipe({ labelWidthMm: Math.max(40, Number(e.target.value) || 70) })
                  }
                  className="w-full px-2 py-1 text-xs font-mono tabular-nums rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Altura (mm)</label>
                <input
                  type="number"
                  min={40}
                  max={250}
                  value={recipe.labelHeightMm}
                  onChange={(e) =>
                    onUpdateRecipe({ labelHeightMm: Math.max(40, Number(e.target.value) || 100) })
                  }
                  className="w-full px-2 py-1 text-xs font-mono tabular-nums rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Escala Fonte (%)</label>
                <input
                  type="number"
                  min={75}
                  max={125}
                  step={5}
                  value={recipe.fontScalePercent}
                  onChange={(e) =>
                    onUpdateRecipe({
                      fontScalePercent: Math.max(75, Math.min(125, Number(e.target.value) || 100))
                    })
                  }
                  className="w-full px-2 py-1 text-xs font-mono tabular-nums rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Área Imprimível do Rótulo Oficial P&B */}
      <div
        id="anvisa-product-label-container"
        className="bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center"
      >
        <div className="w-full flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2">
          <span>
            {showPackagingFrame
              ? `Área útil: ${recipe.labelWidthMm} × ${recipe.labelHeightMm} mm`
              : 'Padrão oficial ANVISA P&B'}
          </span>
          <button
            type="button"
            onClick={() => setHighlightLimitsOnScreen((v) => !v)}
            className={`px-2 py-0.5 rounded border text-[10px] font-sans font-semibold cursor-pointer transition-colors ${
              highlightLimitsOnScreen
                ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                : 'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {highlightLimitsOnScreen
              ? 'Alertas RDC 429 destacados (exportação P&B)'
              : 'Mostrar alertas RDC 429 na tabela'}
          </button>
        </div>

        <div
          ref={captureRef}
          className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs w-full space-y-3"
          style={{
            maxWidth:
              recipe.layoutModel === 'horizontal' ||
              recipe.layoutModel === 'vertical_quebrado' ||
              recipe.layoutModel === 'horizontal_quebrado'
                ? '540px'
                : '370px'
          }}
        >
          {/* Lupa Frontal Obrigatória no Topo da Embalagem */}
          {calculated.lupa.required ? (
            <div className="flex items-start justify-between gap-2 pb-1">
              <AnvisaLupaBadge
                highAddedSugar={calculated.lupa.highAddedSugar}
                highSaturatedFat={calculated.lupa.highSaturatedFat}
                highSodium={calculated.lupa.highSodium}
              />
              <span className="text-[9px] font-mono text-slate-500 text-right leading-tight">
                Painel Principal Superior
                <br />
                IN 75/2020 Anexo XV
              </span>
            </div>
          ) : (
            <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                {calculated.lupa.exempted
                  ? `Dispensado de Lupa Frontal (${calculated.lupa.exemptionReason || 'Justificativa registrada'})`
                  : `Isento de Lupa Frontal (abaixo dos limiares por ${calculated.lupa.thresholds.baseLabel})`}
              </span>
            </div>
          )}

          {/* Tabela Nutricional Oficial */}
          {renderOfficialTableByModel(recipe.layoutModel)}

          {/* Declaração Legal de Ingredientes & Alergênicos */}
          {(ingredientsText || allergensText || calculated.suggestedGlutenText) && (
            <div
              className="text-black border-t border-black pt-2 space-y-1 leading-snug"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: `${9.5 * fontScale}px` }}
            >
              {ingredientsText && (
                <p>
                  <strong className="uppercase">Ingredientes: </strong>
                  <span>{ingredientsText}</span>
                </p>
              )}
              {allergensText && <p className="font-bold uppercase">{allergensText}</p>}
              <p className="font-bold uppercase">
                {calculated.suggestedGlutenText}{' '}
                {calculated.suggestedLactoseText && <span>{calculated.suggestedLactoseText}</span>}
              </p>
            </div>
          )}
        </div>

        {/* Comparação Visual: Rótulo Real (Câmera / Gerado) + Lupa Interativa */}
        <div className="w-full mt-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Comparar com Rótulo Real (Lupa)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Capture o rótulo da embalagem pela câmera, envie uma foto ou gere uma amostra e clique na miniatura para abrir a Lupa de sobreposição.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleRealLabelFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-700 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>Adicionar Rótulo Real</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
              <span>Enviar Foto</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateRealLabelImage}
              className="px-2.5 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/70 text-orange-800 dark:text-orange-200 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Gerar Amostra</span>
            </button>

            {realLabelImage && (
              <button
                type="button"
                onClick={() => saveRealLabelImage(null)}
                title="Remover imagem do rótulo real"
                className="ml-auto px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remover</span>
              </button>
            )}
          </div>

          {uploadError && (
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
              {uploadError}
            </p>
          )}

          {realLabelImage && (
            <div className="space-y-2.5 pt-1">
              {/* Thumbnail de Referência + Abertura em Tela Cheia */}
              <button
                type="button"
                onClick={() => setIsLupaModalOpen(true)}
                className="group relative w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <div className="flex items-center gap-3 p-2">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 bg-white shrink-0">
                    <img
                      src={realLabelImage}
                      alt="Thumbnail do rótulo real capturado"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                        <Maximize2 className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                      <span>Rótulo Real Armazenado · Abrir Lupa Expandida</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Clique na thumbnail para comparação em tela cheia (Sobreposição arrastável, Cortina e Lado a Lado) ou inspecione diretamente abaixo.
                    </p>
                  </div>
                </div>
              </button>

              {/* Inspeção Direta com Hook useMagnifier dentro de #anvisa-product-label-container */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInlineMagnifierEnabled((v) => !v)}
                      className={`px-2 py-1 rounded border text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                        inlineMagnifierEnabled
                          ? 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <ZoomIn className="w-3 h-3 shrink-0" />
                      <span>Lupa: {inlineMagnifierEnabled ? 'Ativa' : 'Pausada'}</span>
                    </button>

                    {inlineMagnifierEnabled &&
                      [1.5, 2, 2.5, 3].map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => magnifier.setScale(z)}
                          className={`px-1.5 py-1 rounded font-mono text-[10px] font-bold cursor-pointer ${
                            magnifier.scale === z
                              ? 'bg-slate-900 dark:bg-orange-600 text-white'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {z}×
                        </button>
                      ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInlineOverlayEnabled((v) => !v)}
                      className={`px-2 py-1 rounded border text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                        inlineOverlayEnabled
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-orange-600 dark:bg-orange-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Layers className="w-3 h-3 shrink-0" />
                      <span>Dados Sobrepostos</span>
                    </button>

                    {(magnifier.isMagnifying || magnifier.isPinned) && (
                      <button
                        type="button"
                        onClick={magnifier.reset}
                        title="Resetar zoom e posição"
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resetar</span>
                      </button>
                    )}
                  </div>
                </div>

                {inlineOverlayEnabled && (
                  <label className="flex items-center justify-between gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                    <span>Transparência da tabela sobreposta ({inlineOverlayOpacity}%)</span>
                    <input
                      type="range"
                      min={20}
                      max={95}
                      value={inlineOverlayOpacity}
                      onChange={(e) => setInlineOverlayOpacity(Number(e.target.value))}
                      className="w-28 accent-orange-600 cursor-pointer"
                    />
                  </label>
                )}

                <div
                  ref={magnifier.containerRef}
                  tabIndex={0}
                  aria-label="Área de inspeção com lupa do rótulo real"
                  {...magnifier.magnifierHandlers}
                  className="relative w-full h-64 sm:h-72 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden select-none touch-none cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center"
                >
                  <img
                    src={realLabelImage}
                    alt="Imagem do rótulo real em inspeção ampliada"
                    style={magnifier.transformStyle}
                    className="max-w-full max-h-full w-auto h-auto object-contain block pointer-events-none"
                  />

                  {inlineOverlayEnabled && (
                    <div
                      aria-hidden="true"
                      style={{ opacity: inlineOverlayOpacity / 100 }}
                      className="pointer-events-none absolute inset-x-3 top-3 bottom-7 flex items-center justify-center"
                    >
                      <div
                        className="w-full max-w-[270px] bg-white text-black border-2 border-black rounded p-1.5 shadow-lg text-[9px] leading-tight"
                        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                      >
                        <div className="flex items-center justify-between border-b border-black pb-0.5 mb-1">
                          <span className="font-black uppercase text-[9.5px]">
                            INFORMAÇÃO NUTRICIONAL (TÉCNICA)
                          </span>
                          {calculated.lupa.required && (
                            <span className="px-1 py-0.2 bg-black text-white font-black text-[8px] rounded">
                              ALTO EM
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-12 font-bold border-b border-black pb-0.5 mb-0.5 text-[8.5px]">
                          <div className="col-span-6">Nutriente</div>
                          <div className="col-span-2 text-right">{baseHeader}</div>
                          <div className="col-span-2 text-right">{portionHeader}</div>
                          <div className="col-span-2 text-right">%VD*</div>
                        </div>
                        <div className="divide-y divide-black/20">
                          {calculated.rows.slice(0, 10).map((row) => {
                            const regCheck =
                              row.key === 'addedSugars' ||
                              row.key === 'saturatedFat' ||
                              row.key === 'sodium'
                                ? checkByKey.get(row.key)
                                : undefined;
                            const exceeds = regCheck?.status === 'exceeds';
                            return (
                              <div
                                key={row.key}
                                className={`grid grid-cols-12 items-center py-[1.5px] ${
                                  row.isBold ? 'font-bold' : 'font-normal'
                                } ${exceeds ? 'bg-rose-50 text-rose-900' : ''}`}
                              >
                                <div className="col-span-6 truncate flex items-center gap-0.5 pr-1">
                                  {exceeds && (
                                    <AlertOctagon className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                  )}
                                  <span className="truncate">{row.label}</span>
                                </div>
                                <div className="col-span-2 text-right font-mono tabular-nums">
                                  {row.formatted100g}
                                </div>
                                <div className="col-span-2 text-right font-mono tabular-nums">
                                  {row.formattedPortion}
                                </div>
                                <div className="col-span-2 text-right font-mono tabular-nums">
                                  {row.vdPercent}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 px-2.5 py-1 bg-slate-900/80 text-white text-[10px] font-mono tabular-nums flex items-center justify-between">
                    <span>
                      {magnifier.isMagnifying
                        ? `Zoom: ${magnifier.activeScale.toFixed(1)}× · Foco: ${Math.round(
                            magnifier.origin.xPercent
                          )}%, ${Math.round(magnifier.origin.yPercent)}%`
                        : 'Passe o mouse ou toque para ampliar o rótulo'}
                    </span>
                    <span className="text-orange-300">
                      {magnifier.isPinned ? 'Fixado' : 'Dinâmico'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status de Auditoria Resumido abaixo do Rótulo */}
        <div className="w-full mt-3 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
          <span>
            Metodologia:{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              {recipe.methodology === 'tabela_composicao'
                ? 'Banco TACO / TBCA'
                : recipe.methodology === 'calculo_teorico'
                  ? 'Cálculo Teórico'
                  : 'Análise Laboratorial'}
            </strong>
          </span>
          {!calculated.canApproveOfficialLabel && (
            <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Revisar pendências na auditoria
            </span>
          )}
        </div>
      </div>

      {/* Modais da Lupa Interativa e Câmera */}
      {realLabelImage && (
        <AnvisaRealLabelLupaModal
          isOpen={isLupaModalOpen}
          onClose={() => setIsLupaModalOpen(false)}
          imageUrl={realLabelImage}
          recipe={recipe}
          calculated={calculated}
        />
      )}

      <AnvisaCameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptured={(dataUrl) => saveRealLabelImage(dataUrl)}
      />

      {/* Barra de Exportação */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting !== null}
            className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting === 'pdf' ? 'Gerando PDF...' : 'Exportar Rótulo PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            disabled={exporting !== null}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{exporting === 'png' ? 'Gerando...' : 'PNG Alta Res.'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportSvg}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>SVG Vetorial</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Planilha</span>
          </button>

          <button
            type="button"
            onClick={handleExportTechnicalSheetPdf}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ficha Técnica PDF</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      )}
    </div>
  );
};
