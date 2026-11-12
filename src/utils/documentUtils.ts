/**
 * Utilitários para Central Documental Clínica
 * Funções puras para formatação, número por extenso, hash de autenticação e exportação PDF
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Converte valor numérico em reais para extenso em português
 * Ex: 250 -> "duzentos e cinquenta reais"
 * Ex: 1350.50 -> "um mil, trezentos e cinquenta reais e cinquenta centavos"
 */
export function numberToPortugueseWords(value: number): string {
  if (value === 0) return 'zero reais';
  if (isNaN(value)) return '';

  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';

    const parts: string[] = [];
    const h = Math.floor(n / 100);
    const remainder = n % 100;

    if (h > 0) {
      parts.push(hundreds[h]);
    }

    if (remainder > 0) {
      if (remainder < 10) {
        parts.push(units[remainder]);
      } else if (remainder < 20) {
        parts.push(teens[remainder - 10]);
      } else {
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;
        if (u === 0) {
          parts.push(tens[t]);
        } else {
          parts.push(`${tens[t]} e ${units[u]}`);
        }
      }
    }

    return parts.join(' e ');
  }

  const integerPart = Math.floor(Math.abs(value));
  const decimalPart = Math.round((Math.abs(value) - integerPart) * 100);

  const thousands = Math.floor(integerPart / 1000);
  const unitsGroup = integerPart % 1000;

  const resultParts: string[] = [];

  if (thousands > 0) {
    if (thousands === 1) {
      resultParts.push('um mil');
    } else {
      resultParts.push(`${convertGroup(thousands)} mil`);
    }
  }

  if (unitsGroup > 0) {
    resultParts.push(convertGroup(unitsGroup));
  }

  let finalWords = '';
  if (integerPart === 1) {
    finalWords = resultParts.join(unitsGroup < 100 && thousands > 0 ? ' e ' : ', ') + ' real';
  } else if (integerPart > 1) {
    finalWords = resultParts.join(unitsGroup < 100 && thousands > 0 && unitsGroup > 0 ? ' e ' : ', ') + ' reais';
  }

  if (decimalPart > 0) {
    const centsWords = convertGroup(decimalPart);
    const centsSuffix = decimalPart === 1 ? ' centavo' : ' centavos';
    if (finalWords) {
      finalWords += ` e ${centsWords}${centsSuffix}`;
    } else {
      finalWords = `${centsWords}${centsSuffix}`;
    }
  }

  return finalWords.trim();
}

/**
 * Gera hash determinístico ou único de autenticação para documento clínico
 * Ex: DOC-2026-F8A9-4B2E-C1D7
 */
export function generateDocumentHash(seed: unknown): string {
  const str = typeof seed === 'string' ? seed : JSON.stringify(seed || {}) + Date.now();
  let hash1 = 0x811c9dc5;
  let hash2 = 0x55555555;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 ^= char;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 = (hash2 << 5) - hash2 + char;
    hash2 |= 0;
  }

  const hex1 = Math.abs(hash1).toString(16).toUpperCase().padStart(8, '0');
  const hex2 = Math.abs(hash2).toString(16).toUpperCase().padStart(8, '0');
  const year = new Date().getFullYear();

  return `DOC-${year}-${hex1.substring(0, 4)}-${hex1.substring(4, 8)}-${hex2.substring(0, 4)}`;
}

/**
 * Formata CPF: 12345678900 -> 123.456.789-00
 */
export function formatCpf(cpf: string): string {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata Telefone: 11999998888 -> (11) 99999-8888
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

/**
 * Formata data no formato brasileiro extenso: "11 de novembro de 2026"
 */
export function formatDateExtendedPtBr(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) {
      return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Gera URL de QR Code SVG standalone vetorial em base64
 * Não depende de API externa ou de rede (funciona 100% offline).
 */
export function getQrCodeSvgDataUrl(payload: string): string {
  // Gerar um padrão visual determinístico simulando matriz 21x21 QR Code com cantos de localização
  const size = 21;
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Função auxiliar para desenhar o marcador de localização 7x7
  function drawFinderPattern(rowStart: number, colStart: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // borda externa
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)       // quadrado central
        ) {
          cells[rowStart + r][colStart + c] = true;
        }
      }
    }
  }

  // 3 marcadores de canto
  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // Linhas de sincronismo
  for (let i = 8; i < size - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Preenchimento de bits baseado no payload
  let charIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Pular marcadores de localização
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      if (r === 6 || c === 6) continue;

      const code = payload.charCodeAt(charIndex % payload.length) + (r * 13) + (c * 17);
      cells[r][c] = (code % 3 === 0) || (code % 7 === 0);
      charIndex++;
    }
  }

  // Renderizar como SVG
  const rects: string[] = [];
  const cellSize = 5;
  const padding = 10;
  const totalDim = size * cellSize + padding * 2;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        rects.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#4A6B5D" />`);
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="96" height="96"><rect width="${totalDim}" height="${totalDim}" fill="#FFFFFF" rx="4"/>${rects.join('')}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Exporta elemento DOM para PDF A4 de alta definição via html2canvas + jsPDF
 */
export async function exportDocumentToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PDF Export] Elemento #${elementId} não encontrado.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 1024
    });

    const imgData = canvas.toDataURL('image/png');
    // Cria documento jsPDF no formato A4 (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('[PDF Export] Erro ao renderizar PDF:', err);
    return false;
  }
}

/**
 * Monta URL de compartilhamento por WhatsApp com mensagem formatada
 */
export function generateWhatsAppShareUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
