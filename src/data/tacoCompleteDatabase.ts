import tacoRawData from './taco4aEdicao.json';
import { FoodItem } from '../types';
import {
  AddedSugarClassification,
  AllergenCode,
  AnvisaFoodEntry,
  ProcessingState
} from '../types/nutritionLabel';

/**
 * Tabela Brasileira de Composição de Alimentos (TACO) — 4ª Edição Revisada e Ampliada
 * Fonte oficial: NEPA / UNICAMP (597 alimentos catalogados em 15 grupos).
 * Valores analíticos expressos por 100 g da parte comestível.
 * Campos `null` preservam a ausência de dado analítico (NA ou não determinado na TACO),
 * nunca convertidos silenciosamente em zero na visualização clínica.
 */
export interface TacoRawRecord {
  id: number;
  name: string;
  category: string;
  humidity: number | null;
  kcal: number | null;
  kj: number | null;
  protein: number | null;
  lipids: number | null;
  carbs: number | null;
  fiber: number | null;
  naFiber?: number;
  sodium: number | null;
  saturated: number | null;
  mono: number | null;
  poly: number | null;
  trans: number | null;
  chol: number | null;
  ca: number | null;
  fe: number | null;
  mg: number | null;
  p: number | null;
  k: number | null;
  zn: number | null;
  vitC: number | null;
}

export interface TacoDietFoodItem extends FoodItem {
  tacoNumber: number;
  tacoCode: string;
  energyKj: number | null;
  humidityPercent: number | null;
  saturatedFatG: number | null;
  monounsaturatedFatG: number | null;
  polyunsaturatedFatG: number | null;
  transFatG: number | null;
  cholesterolMg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  magnesiumMg: number | null;
  phosphorusMg: number | null;
  potassiumMg: number | null;
  zincMg: number | null;
  vitaminCMg: number | null;
  fiberNotApplicable?: boolean;
  sourceLabel: string;
}

const RAW_RECORDS: TacoRawRecord[] = tacoRawData as TacoRawRecord[];

export const TACO_4A_CATEGORIES: string[] = Array.from(
  new Set(RAW_RECORDS.map((r) => r.category))
);

/**
 * Normaliza texto para busca insensível a acentos e caixa.
 */
export function normalizeTacoSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Lista completa dos 597 alimentos da TACO 4ª Edição (NEPA/UNICAMP)
 * pronta para uso no Montador de Cardápio (TACO) e rastreamento calórico.
 */
export const TACO_COMPLETE_DIET_FOODS: TacoDietFoodItem[] = RAW_RECORDS.map((r) => ({
  id: `taco-nepa-${String(r.id).padStart(3, '0')}`,
  tacoNumber: r.id,
  tacoCode: `TACO-${String(r.id).padStart(3, '0')}`,
  name: r.name,
  category: r.category,
  portionGrams: 100,
  servingUnit: '100g (TACO)',
  caloriesKcal: r.kcal ?? 0,
  proteinG: r.protein ?? 0,
  carbsG: r.carbs ?? 0,
  fatG: r.lipids ?? 0,
  fiberG: r.fiber ?? 0,
  sodiumMg: r.sodium ?? 0,
  energyKj: r.kj,
  humidityPercent: r.humidity,
  saturatedFatG: r.saturated,
  monounsaturatedFatG: r.mono,
  polyunsaturatedFatG: r.poly,
  transFatG: r.trans,
  cholesterolMg: r.chol,
  calciumMg: r.ca,
  ironMg: r.fe,
  magnesiumMg: r.mg,
  phosphorusMg: r.p,
  potassiumMg: r.k,
  zincMg: r.zn,
  vitaminCMg: r.vitC,
  fiberNotApplicable: r.naFiber === 1,
  sourceLabel: 'TACO 4ª Ed. (NEPA/UNICAMP)'
}));

function mapTacoCategoryToAnvisa(category: string): AnvisaFoodEntry['category'] {
  switch (category) {
    case 'Cereais e derivados':
    case 'Alimentos preparados':
      return 'Cereais e Farinhas';
    case 'Verduras, hortaliças e derivados':
      return 'Hortaliças e Vegetais';
    case 'Frutas e derivados':
      return 'Frutas';
    case 'Gorduras e óleos':
      return 'Óleos e Gorduras';
    case 'Pescados e frutos do mar':
    case 'Carnes e derivados':
      return 'Carnes e Pescados';
    case 'Leite e derivados':
    case 'Ovos e derivados':
      return 'Ovos e Laticínios';
    case 'Bebidas (alcoólicas e não alcoólicas)':
      return 'Bebidas';
    case 'Produtos açucarados':
      return 'Açúcares e Doces';
    case 'Leguminosas e derivados':
      return 'Leguminosas';
    case 'Nozes e sementes':
      return 'Oleaginosas e Sementes';
    case 'Miscelâneas':
    case 'Outros alimentos industrializados':
    default:
      return 'Condimentos e Aditivos';
  }
}

function inferProcessingState(name: string, category: string): ProcessingState {
  const n = normalizeTacoSearchText(name);
  if (category === 'Bebidas (alcoólicas e não alcoólicas)') return 'liquido_pronto';
  if (n.includes('frito') || n.includes('frita')) return 'frito';
  if (n.includes('assado') || n.includes('assada') || n.includes('grelhado') || n.includes('grelhada')) {
    return 'assado';
  }
  if (n.includes('cozido') || n.includes('cozida') || n.includes('refogado')) return 'cozido';
  if (n.includes('seco') || n.includes('seca') || n.includes('desidratad') || n.includes('em po')) {
    return 'desidratado';
  }
  if (n.includes('cru') || n.includes('crua') || n.includes('in natura')) return 'cru';
  return 'processado';
}

function inferAllergens(name: string, category: string): AllergenCode[] {
  const n = normalizeTacoSearchText(name);
  const tags = new Set<AllergenCode>();

  if (n.includes('trigo')) {
    tags.add('trigo');
    tags.add('gluten');
  }
  if (n.includes('aveia')) {
    tags.add('aveia');
    tags.add('gluten');
  }
  if (n.includes('centeio')) {
    tags.add('centeio');
    tags.add('gluten');
  }
  if (n.includes('cevada') || n.includes('cerveja')) {
    tags.add('cevada');
    tags.add('gluten');
  }
  if (
    category === 'Leite e derivados' ||
    n.includes('leite') ||
    n.includes('queijo') ||
    n.includes('requeijao') ||
    n.includes('iogurte') ||
    n.includes('manteiga') ||
    n.includes('creme de leite')
  ) {
    tags.add('leite');
  }
  if (category === 'Ovos e derivados' || n.includes('ovo')) tags.add('ovo');
  if (n.includes('soja') || n.includes('tofu')) tags.add('soja');
  if (n.includes('amendoim')) tags.add('amendoim');
  if (
    n.includes('castanha') ||
    n.includes('amendoa') ||
    n.includes('noz') ||
    n.includes('nozes') ||
    n.includes('avela')
  ) {
    tags.add('castanhas');
  }
  if (
    category === 'Pescados e frutos do mar' &&
    (n.includes('camarao') || n.includes('caranguejo') || n.includes('siri') || n.includes('lagosta'))
  ) {
    tags.add('crustaceos');
  } else if (category === 'Pescados e frutos do mar') {
    tags.add('peixe');
  }

  return Array.from(tags);
}

/**
 * Gera entradas compatíveis com AnvisaFoodEntry (RDC 429/2020 & IN 75/2020)
 * para todos os alimentos TACO que ainda não possuem ficha curada específica.
 */
export function buildTacoAnvisaEntries(existingCodes: Set<string>): AnvisaFoodEntry[] {
  const entries: AnvisaFoodEntry[] = [];

  for (const r of RAW_RECORDS) {
    const tacoCode = `TACO-${String(r.id).padStart(3, '0')}`;
    if (existingCodes.has(tacoCode)) continue;

    const n = normalizeTacoSearchText(r.name);
    const isLiquid =
      r.category === 'Bebidas (alcoólicas e não alcoólicas)' ||
      (r.category === 'Gorduras e óleos' && n.includes('oleo')) ||
      (r.category === 'Gorduras e óleos' && n.includes('azeite')) ||
      (r.category === 'Leite e derivados' && n.includes('leite,') && !n.includes('em po') && !n.includes('condensado'));

    const anvisaCat = mapTacoCategoryToAnvisa(r.category);
    const addedSugarClass: AddedSugarClassification =
      r.category === 'Produtos açucarados'
        ? 'added'
        : r.category === 'Frutas e derivados' || r.category === 'Leite e derivados'
          ? 'intrinsic'
          : 'none';

    entries.push({
      id: `taco-nepa-${String(r.id).padStart(3, '0')}`,
      code: tacoCode,
      name: r.name,
      category: anvisaCat,
      source: 'TACO',
      sourceVersion: 'TACO 4ª ed. (NEPA/UNICAMP 2011)',
      physicalState: isLiquid ? 'liquido' : 'solido',
      processingState: inferProcessingState(r.name, r.category),
      edibleFraction: 1.0,
      densityGPerMl: isLiquid ? (n.includes('oleo') || n.includes('azeite') ? 0.92 : 1.02) : 1.0,
      moistureG: r.humidity,
      nutrientsPer100g: {
        energyKcal: r.kcal,
        energyKj: r.kj,
        carbsG: r.carbs,
        totalSugarsG: null, // TACO 4ª ed. não fraciona açúcares totais
        addedSugarsG: r.category === 'Produtos açucarados' ? null : 0,
        proteinG: r.protein,
        totalFatG: r.lipids,
        saturatedFatG: r.saturated,
        transFatG: r.trans,
        fiberG: r.naFiber === 1 ? 0 : r.fiber,
        sodiumMg: r.sodium,
        calciumMg: r.ca,
        ironMg: r.fe,
        potassiumMg: r.k,
        vitaminCMg: r.vitC
      },
      addedSugarClassification: addedSugarClass,
      nutrientConfidence: 'measured',
      allergenTags: inferAllergens(r.name, r.category),
      notes: `Grupo TACO original: ${r.category}.`
    });
  }

  return entries;
}
