import { calculateGlycemicLoad } from '../domain/glycemicCalculations';

/**
 * Base Clínica Unificada de Índice Glicêmico (IG) e Carga Glicêmica (CG)
 *
 * Escala de referência: Glicose pura = 100.
 * Fontes:
 * - Glycemic-Index.net — Glycemic Index & Glycemic Load Chart
 * - Atkinson FS, Brand-Miller JC et al. International Tables of Glycemic Index and Glycemic Load Values (2008 / 2021)
 * - Foster-Powell K, Holt SH, Brand-Miller JC. Am J Clin Nutr. 2002;76(1):5-56.
 */

export type GlycemicFoodCategory =
  | 'Cereais, Pães & Massas'
  | 'Arroz & Grãos'
  | 'Raízes, Tubérculos & Legumes'
  | 'Frutas Frescas & Secas'
  | 'Leguminosas'
  | 'Laticínios & Bebidas Vegetais'
  | 'Hortaliças & Verduras'
  | 'Açúcares, Doces & Bebidas'
  | 'Oleaginosas & Sementes';

export interface GlycemicFoodItem {
  id: string;
  name: string;
  category: GlycemicFoodCategory;
  glycemicIndex: number;
  standardServingG: number;
  servingLabel: string;
  carbsPerServingG: number;
  fiberPerServingG: number;
  glycemicLoad: number;
  /** Calorías aproximadas na porção padrão para integração opcional com cardápio */
  kcalPerServing: number;
  proteinPerServingG: number;
  fatPerServingG: number;
  clinicalNote?: string;
}

export const GLYCEMIC_FOOD_CATEGORIES: GlycemicFoodCategory[] = [
  'Cereais, Pães & Massas',
  'Arroz & Grãos',
  'Raízes, Tubérculos & Legumes',
  'Frutas Frescas & Secas',
  'Leguminosas',
  'Laticínios & Bebidas Vegetais',
  'Hortaliças & Verduras',
  'Açúcares, Doces & Bebidas',
  'Oleaginosas & Sementes'
];

interface RawGlycemicSeed {
  id: string;
  name: string;
  category: GlycemicFoodCategory;
  gi: number;
  servingG: number;
  servingLabel: string;
  carbsG: number;
  fiberG: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  note?: string;
}

const RAW_GLYCEMIC_FOODS: RawGlycemicSeed[] = [
  // ==========================================================
  // CEREAIS, PÃES & MASSAS
  // ==========================================================
  {
    id: 'gi-aveia-flocos',
    name: 'Aveia em flocos cozida (mingau)',
    category: 'Cereais, Pães & Massas',
    gi: 55,
    servingG: 250,
    servingLabel: '1 tigela média (250g)',
    carbsG: 23,
    fiberG: 3.8,
    kcal: 145,
    proteinG: 5.2,
    fatG: 2.8,
    note: 'Beta-glucanas reduzem a velocidade de absorção pós-prandial.'
  },
  {
    id: 'gi-aveia-farelo',
    name: 'Farelo de aveia',
    category: 'Cereais, Pães & Massas',
    gi: 50,
    servingG: 30,
    servingLabel: '2 colheres de sopa (30g)',
    carbsG: 16,
    fiberG: 4.6,
    kcal: 98,
    proteinG: 5.1,
    fatG: 2.1
  },
  {
    id: 'gi-muesli-sem-acucar',
    name: 'Muesli integral sem adição de açúcar',
    category: 'Cereais, Pães & Massas',
    gi: 56,
    servingG: 45,
    servingLabel: '1/2 xícara (45g)',
    carbsG: 27,
    fiberG: 4.0,
    kcal: 162,
    proteinG: 4.5,
    fatG: 3.1
  },
  {
    id: 'gi-granola-tradicional',
    name: 'Granola tradicional adoçada',
    category: 'Cereais, Pães & Massas',
    gi: 66,
    servingG: 40,
    servingLabel: '3 colheres de sopa (40g)',
    carbsG: 28,
    fiberG: 2.6,
    kcal: 172,
    proteinG: 3.5,
    fatG: 4.8
  },
  {
    id: 'gi-flocos-milho',
    name: 'Flocos de milho (Corn Flakes)',
    category: 'Cereais, Pães & Massas',
    gi: 81,
    servingG: 30,
    servingLabel: '1 xícara (30g)',
    carbsG: 26,
    fiberG: 0.9,
    kcal: 112,
    proteinG: 2.1,
    fatG: 0.2,
    note: 'Cereal extrusado de alto IG e elevada carga glicêmica por porção.'
  },
  {
    id: 'gi-all-bran',
    name: 'Cereal matinal rico em fibras (All-Bran)',
    category: 'Cereais, Pães & Massas',
    gi: 42,
    servingG: 30,
    servingLabel: '1/2 xícara (30g)',
    carbsG: 15,
    fiberG: 9.0,
    kcal: 86,
    proteinG: 4.0,
    fatG: 1.2
  },
  {
    id: 'gi-pao-branco',
    name: 'Pão branco de forma / Pão francês',
    category: 'Cereais, Pães & Massas',
    gi: 75,
    servingG: 50,
    servingLabel: '1 unidade média ou 2 fatias (50g)',
    carbsG: 27,
    fiberG: 1.2,
    kcal: 145,
    proteinG: 4.3,
    fatG: 1.5,
    note: 'Amido altamente gelatinizado. Associe com proteína/gordura para atenuar pico.'
  },
  {
    id: 'gi-pao-integral',
    name: 'Pão 100% integral',
    category: 'Cereais, Pães & Massas',
    gi: 51,
    servingG: 50,
    servingLabel: '2 fatias (50g)',
    carbsG: 20,
    fiberG: 3.5,
    kcal: 122,
    proteinG: 5.0,
    fatG: 1.8
  },
  {
    id: 'gi-pao-centeio',
    name: 'Pão de centeio escuro (Pumpernickel)',
    category: 'Cereais, Pães & Massas',
    gi: 46,
    servingG: 50,
    servingLabel: '2 fatias (50g)',
    carbsG: 21,
    fiberG: 4.2,
    kcal: 118,
    proteinG: 4.1,
    fatG: 1.1
  },
  {
    id: 'gi-pao-fermentacao-natural',
    name: 'Pão de trigo fermentação natural (Sourdough)',
    category: 'Cereais, Pães & Massas',
    gi: 54,
    servingG: 50,
    servingLabel: '1 fatia grande (50g)',
    carbsG: 24,
    fiberG: 1.8,
    kcal: 130,
    proteinG: 4.5,
    fatG: 0.9,
    note: 'Ácidos orgânicos da fermentação longa retardam o esvaziamento gástrico.'
  },
  {
    id: 'gi-baguette-francesa',
    name: 'Baguete branca tradicional',
    category: 'Cereais, Pães & Massas',
    gi: 95,
    servingG: 50,
    servingLabel: '1 pedaço médio (50g)',
    carbsG: 28,
    fiberG: 1.1,
    kcal: 142,
    proteinG: 4.6,
    fatG: 0.8
  },
  {
    id: 'gi-pao-sirio-pita',
    name: 'Pão sírio (Pita branco)',
    category: 'Cereais, Pães & Massas',
    gi: 57,
    servingG: 50,
    servingLabel: '1 unidade pequena (50g)',
    carbsG: 27,
    fiberG: 1.2,
    kcal: 138,
    proteinG: 4.6,
    fatG: 0.7
  },
  {
    id: 'gi-tortilha-trigo',
    name: 'Tortilha de trigo (Wrap)',
    category: 'Cereais, Pães & Massas',
    gi: 52,
    servingG: 45,
    servingLabel: '1 unidade média (45g)',
    carbsG: 22,
    fiberG: 1.5,
    kcal: 132,
    proteinG: 3.6,
    fatG: 3.2
  },
  {
    id: 'gi-tapioca-goma',
    name: 'Goma de tapioca hidratada (pura)',
    category: 'Cereais, Pães & Massas',
    gi: 78,
    servingG: 60,
    servingLabel: '3 colheres de sopa (60g)',
    carbsG: 38,
    fiberG: 0.2,
    kcal: 154,
    proteinG: 0.1,
    fatG: 0.0,
    note: 'Sem fibras e alto IG/CG isolada. Sempre associar sementes (chia/linhaça) e recheio proteico.'
  },
  {
    id: 'gi-cuscuz-milho',
    name: 'Cuscuz de milho cozido',
    category: 'Cereais, Pães & Massas',
    gi: 65,
    servingG: 135,
    servingLabel: '1 fatia média (135g)',
    carbsG: 34,
    fiberG: 2.8,
    kcal: 152,
    proteinG: 3.0,
    fatG: 0.9
  },
  {
    id: 'gi-espaguete-al-dente',
    name: 'Macarrão espaguete branco cozido al dente',
    category: 'Cereais, Pães & Massas',
    gi: 46,
    servingG: 180,
    servingLabel: '1 prato fundo (180g cozido)',
    carbsG: 44,
    fiberG: 2.5,
    kcal: 220,
    proteinG: 7.8,
    fatG: 1.3,
    note: 'Cozimento al dente preserva a rede proteica glúten-amido, mantendo o IG baixo, porém com CG elevada em porções grandes.'
  },
  {
    id: 'gi-espaguete-integral',
    name: 'Macarrão espaguete integral cozido',
    category: 'Cereais, Pães & Massas',
    gi: 42,
    servingG: 180,
    servingLabel: '1 prato fundo (180g cozido)',
    carbsG: 38,
    fiberG: 5.8,
    kcal: 205,
    proteinG: 8.5,
    fatG: 1.8
  },
  {
    id: 'gi-nhoque-batata',
    name: 'Nhoque de batata cozido',
    category: 'Cereais, Pães & Massas',
    gi: 68,
    servingG: 180,
    servingLabel: '1 porção média (180g)',
    carbsG: 45,
    fiberG: 2.0,
    kcal: 235,
    proteinG: 6.2,
    fatG: 2.1
  },
  {
    id: 'gi-biscoito-agua-sal',
    name: 'Biscoito água e sal (Cream Cracker)',
    category: 'Cereais, Pães & Massas',
    gi: 74,
    servingG: 30,
    servingLabel: '5 unidades (30g)',
    carbsG: 21,
    fiberG: 0.7,
    kcal: 130,
    proteinG: 2.8,
    fatG: 3.8
  },
  {
    id: 'gi-biscoito-arroz',
    name: 'Biscoito de arroz expandido',
    category: 'Cereais, Pães & Massas',
    gi: 82,
    servingG: 25,
    servingLabel: '3 discos (25g)',
    carbsG: 20,
    fiberG: 0.6,
    kcal: 96,
    proteinG: 2.0,
    fatG: 0.7
  },
  {
    id: 'gi-pipoca-sem-acucar',
    name: 'Pipoca estourada sem açúcar (baixa gordura)',
    category: 'Cereais, Pães & Massas',
    gi: 65,
    servingG: 25,
    servingLabel: '3 xícaras estouradas (25g)',
    carbsG: 15,
    fiberG: 3.5,
    kcal: 95,
    proteinG: 3.1,
    fatG: 1.2,
    note: 'IG moderado, porém baixa densidade energética confere CG baixa em porções usuais.'
  },

  // ==========================================================
  // ARROZ & GRÃOS
  // ==========================================================
  {
    id: 'gi-arroz-branco',
    name: 'Arroz branco polido cozido',
    category: 'Arroz & Grãos',
    gi: 73,
    servingG: 150,
    servingLabel: '4 colheres de sopa (150g)',
    carbsG: 42,
    fiberG: 0.8,
    kcal: 192,
    proteinG: 3.8,
    fatG: 0.4,
    note: 'Combinar com feijão reduz significativamente o IG combinado da refeição.'
  },
  {
    id: 'gi-arroz-parboilizado',
    name: 'Arroz parboilizado cozido',
    category: 'Arroz & Grãos',
    gi: 55,
    servingG: 150,
    servingLabel: '4 colheres de sopa (150g)',
    carbsG: 39,
    fiberG: 1.2,
    kcal: 185,
    proteinG: 3.9,
    fatG: 0.5,
    note: 'Retrogradação parcial do amido no beneficiamento reduz o IG frente ao arroz branco comum.'
  },
  {
    id: 'gi-arroz-integral',
    name: 'Arroz integral cozido',
    category: 'Arroz & Grãos',
    gi: 50,
    servingG: 150,
    servingLabel: '4 colheres de sopa (150g)',
    carbsG: 36,
    fiberG: 2.7,
    kcal: 186,
    proteinG: 4.0,
    fatG: 1.5
  },
  {
    id: 'gi-arroz-basmati',
    name: 'Arroz Basmati cozido',
    category: 'Arroz & Grãos',
    gi: 52,
    servingG: 150,
    servingLabel: '4 colheres de sopa (150g)',
    carbsG: 38,
    fiberG: 1.1,
    kcal: 182,
    proteinG: 4.2,
    fatG: 0.6,
    note: 'Maior proporção de amilose reduz a taxa de digestão enzimática.'
  },
  {
    id: 'gi-arroz-jasmim',
    name: 'Arroz Jasmim cozido',
    category: 'Arroz & Grãos',
    gi: 89,
    servingG: 150,
    servingLabel: '4 colheres de sopa (150g)',
    carbsG: 42,
    fiberG: 0.6,
    kcal: 195,
    proteinG: 3.6,
    fatG: 0.3
  },
  {
    id: 'gi-quinoa-cozida',
    name: 'Quinoa em grãos cozida',
    category: 'Arroz & Grãos',
    gi: 53,
    servingG: 150,
    servingLabel: '1 xícara cozida (150g)',
    carbsG: 27,
    fiberG: 4.2,
    kcal: 180,
    proteinG: 6.6,
    fatG: 2.9
  },
  {
    id: 'gi-cevada-cozida',
    name: 'Cevada em grãos cozida',
    category: 'Arroz & Grãos',
    gi: 28,
    servingG: 150,
    servingLabel: '1 xícara cozida (150g)',
    carbsG: 32,
    fiberG: 6.0,
    kcal: 178,
    proteinG: 3.5,
    fatG: 0.7,
    note: 'Um dos cereais de menor resposta glicêmica.'
  },
  {
    id: 'gi-trigo-sarraceno',
    name: 'Trigo sarraceno cozido',
    category: 'Arroz & Grãos',
    gi: 51,
    servingG: 150,
    servingLabel: '1 xícara cozida (150g)',
    carbsG: 30,
    fiberG: 4.0,
    kcal: 155,
    proteinG: 5.4,
    fatG: 1.0
  },
  {
    id: 'gi-cuscuz-marroquino',
    name: 'Cuscuz marroquino (sêmola) cozido',
    category: 'Arroz & Grãos',
    gi: 65,
    servingG: 150,
    servingLabel: '1 xícara cozida (150g)',
    carbsG: 34,
    fiberG: 2.1,
    kcal: 176,
    proteinG: 5.8,
    fatG: 0.3
  },
  {
    id: 'gi-milho-verde-cozido',
    name: 'Milho verde cozido em grãos',
    category: 'Arroz & Grãos',
    gi: 52,
    servingG: 100,
    servingLabel: '4 colheres de sopa (100g)',
    carbsG: 18,
    fiberG: 2.7,
    kcal: 96,
    proteinG: 3.4,
    fatG: 1.5
  },

  // ==========================================================
  // RAÍZES, TUBÉRCULOS & LEGUMES AMILÁCEOS
  // ==========================================================
  {
    id: 'gi-batata-doce-cozida',
    name: 'Batata-doce cozida (com casca / vapor)',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 46,
    servingG: 150,
    servingLabel: '1 unidade média (150g)',
    carbsG: 27,
    fiberG: 3.8,
    kcal: 116,
    proteinG: 2.0,
    fatG: 0.1,
    note: 'Cozimento em água/vapor mantém IG baixo; assada por longo tempo pode elevar o IG para ~70.'
  },
  {
    id: 'gi-batata-inglesa-cozida',
    name: 'Batata inglesa cozida quente',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 78,
    servingG: 150,
    servingLabel: '1 unidade média (150g)',
    carbsG: 26,
    fiberG: 2.2,
    kcal: 115,
    proteinG: 2.5,
    fatG: 0.1,
    note: 'Se resfriada por 12–24h (salada), forma amido resistente e reduz o IG para ~56.'
  },
  {
    id: 'gi-batata-inglesa-assada',
    name: 'Batata inglesa assada no forno',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 85,
    servingG: 150,
    servingLabel: '1 unidade média (150g)',
    carbsG: 30,
    fiberG: 2.5,
    kcal: 140,
    proteinG: 3.1,
    fatG: 0.2
  },
  {
    id: 'gi-pure-batata',
    name: 'Purê de batata tradicional',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 87,
    servingG: 150,
    servingLabel: '3 colheres de servir (150g)',
    carbsG: 24,
    fiberG: 1.8,
    kcal: 148,
    proteinG: 2.9,
    fatG: 4.5
  },
  {
    id: 'gi-batata-frita',
    name: 'Batata frita',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 63,
    servingG: 150,
    servingLabel: '1 porção média (150g)',
    carbsG: 48,
    fiberG: 3.6,
    kcal: 468,
    proteinG: 5.1,
    fatG: 22.0,
    note: 'A gordura retarda o esvaziamento gástrico (IG moderado), mas a alta densidade de carboidratos gera CG elevada.'
  },
  {
    id: 'gi-mandioca-cozida',
    name: 'Mandioca / Aipim cozido',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 46,
    servingG: 120,
    servingLabel: '2 pedaços médios (120g)',
    carbsG: 36,
    fiberG: 1.9,
    kcal: 150,
    proteinG: 0.8,
    fatG: 0.3
  },
  {
    id: 'gi-inhame-cozido',
    name: 'Inhame / Cará cozido',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 37,
    servingG: 150,
    servingLabel: '2 fatias médias (150g)',
    carbsG: 34,
    fiberG: 4.2,
    kcal: 148,
    proteinG: 2.3,
    fatG: 0.2
  },
  {
    id: 'gi-mandioquinha-cozida',
    name: 'Mandioquinha (Batata-baroa) cozida',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 58,
    servingG: 120,
    servingLabel: '1 unidade média (120g)',
    carbsG: 23,
    fiberG: 2.2,
    kcal: 96,
    proteinG: 1.1,
    fatG: 0.2
  },
  {
    id: 'gi-abobora-cabotia',
    name: 'Abóbora cozida (Cabotiá / Moranga)',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 64,
    servingG: 120,
    servingLabel: '4 colheres de sopa (120g)',
    carbsG: 9,
    fiberG: 2.4,
    kcal: 45,
    proteinG: 1.4,
    fatG: 0.2,
    note: 'Apesar do IG moderado, tem poucos carboidratos por porção -> Carga Glicêmica muito baixa (5,8).'
  },
  {
    id: 'gi-cenoura-cozida',
    name: 'Cenoura cozida',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 41,
    servingG: 80,
    servingLabel: '1 unidade média (80g)',
    carbsG: 5.5,
    fiberG: 2.2,
    kcal: 26,
    proteinG: 0.6,
    fatG: 0.1
  },
  {
    id: 'gi-beterraba-cozida',
    name: 'Beterraba cozida',
    category: 'Raízes, Tubérculos & Legumes',
    gi: 64,
    servingG: 80,
    servingLabel: '4 fatias médias (80g)',
    carbsG: 6.2,
    fiberG: 1.6,
    kcal: 34,
    proteinG: 1.1,
    fatG: 0.1,
    note: 'Baixíssima Carga Glicêmica (4,0) por porção usual — segura em planos para controle glicêmico.'
  },

  // ==========================================================
  // FRUTAS FRESCAS & SECAS
  // ==========================================================
  {
    id: 'gi-maca-fresca',
    name: 'Maçã fresca (com casca)',
    category: 'Frutas Frescas & Secas',
    gi: 36,
    servingG: 130,
    servingLabel: '1 unidade média (130g)',
    carbsG: 16,
    fiberG: 2.8,
    kcal: 72,
    proteinG: 0.4,
    fatG: 0.2
  },
  {
    id: 'gi-pera-fresca',
    name: 'Pera fresca (com casca)',
    category: 'Frutas Frescas & Secas',
    gi: 38,
    servingG: 140,
    servingLabel: '1 unidade média (140g)',
    carbsG: 17,
    fiberG: 4.1,
    kcal: 78,
    proteinG: 0.5,
    fatG: 0.2
  },
  {
    id: 'gi-laranja-fresca',
    name: 'Laranja fresca (in natura com bagaço)',
    category: 'Frutas Frescas & Secas',
    gi: 43,
    servingG: 130,
    servingLabel: '1 unidade média (130g)',
    carbsG: 12,
    fiberG: 2.9,
    kcal: 60,
    proteinG: 1.2,
    fatG: 0.2
  },
  {
    id: 'gi-morango-fresco',
    name: 'Morangos frescos',
    category: 'Frutas Frescas & Secas',
    gi: 40,
    servingG: 120,
    servingLabel: '8 unidades médias (120g)',
    carbsG: 7.0,
    fiberG: 2.4,
    kcal: 38,
    proteinG: 0.8,
    fatG: 0.4
  },
  {
    id: 'gi-mirtilo-blueberry',
    name: 'Mirtilo (Blueberry) fresco',
    category: 'Frutas Frescas & Secas',
    gi: 53,
    servingG: 100,
    servingLabel: '2/3 de xícara (100g)',
    carbsG: 12,
    fiberG: 2.4,
    kcal: 57,
    proteinG: 0.7,
    fatG: 0.3
  },
  {
    id: 'gi-cereja-fresca',
    name: 'Cerejas frescas',
    category: 'Frutas Frescas & Secas',
    gi: 22,
    servingG: 120,
    servingLabel: '15 unidades (120g)',
    carbsG: 15,
    fiberG: 2.5,
    kcal: 74,
    proteinG: 1.2,
    fatG: 0.2
  },
  {
    id: 'gi-toranja-grapefruit',
    name: 'Toranja (Grapefruit)',
    category: 'Frutas Frescas & Secas',
    gi: 25,
    servingG: 120,
    servingLabel: '1/2 unidade (120g)',
    carbsG: 9.0,
    fiberG: 1.9,
    kcal: 42,
    proteinG: 0.9,
    fatG: 0.2
  },
  {
    id: 'gi-pessego-fresco',
    name: 'Pêssego fresco',
    category: 'Frutas Frescas & Secas',
    gi: 28,
    servingG: 120,
    servingLabel: '1 unidade média (120g)',
    carbsG: 10,
    fiberG: 1.8,
    kcal: 47,
    proteinG: 1.1,
    fatG: 0.3
  },
  {
    id: 'gi-ameixa-fresca',
    name: 'Ameixa vermelha fresca',
    category: 'Frutas Frescas & Secas',
    gi: 39,
    servingG: 120,
    servingLabel: '2 unidades médias (120g)',
    carbsG: 12,
    fiberG: 1.7,
    kcal: 55,
    proteinG: 0.8,
    fatG: 0.3
  },
  {
    id: 'gi-kiwi-fresco',
    name: 'Kiwi fresco',
    category: 'Frutas Frescas & Secas',
    gi: 50,
    servingG: 120,
    servingLabel: '2 unidades médias (120g)',
    carbsG: 14,
    fiberG: 3.6,
    kcal: 73,
    proteinG: 1.4,
    fatG: 0.6
  },
  {
    id: 'gi-uva-fresca',
    name: 'Uva fresca (Itália / Rubi)',
    category: 'Frutas Frescas & Secas',
    gi: 53,
    servingG: 120,
    servingLabel: '1 cacho pequeno (120g)',
    carbsG: 19,
    fiberG: 1.1,
    kcal: 82,
    proteinG: 0.8,
    fatG: 0.2
  },
  {
    id: 'gi-banana-madura',
    name: 'Banana prata / nanica madura',
    category: 'Frutas Frescas & Secas',
    gi: 51,
    servingG: 100,
    servingLabel: '1 unidade média (100g)',
    carbsG: 23,
    fiberG: 2.3,
    kcal: 92,
    proteinG: 1.2,
    fatG: 0.2,
    note: 'Quanto mais verde a banana, menor o IG (~35) devido ao maior teor de amido resistente.'
  },
  {
    id: 'gi-manga-fresca',
    name: 'Manga fresca (Palmer / Tommy)',
    category: 'Frutas Frescas & Secas',
    gi: 51,
    servingG: 120,
    servingLabel: '1 xícara em cubos (120g)',
    carbsG: 16,
    fiberG: 1.9,
    kcal: 72,
    proteinG: 0.9,
    fatG: 0.4
  },
  {
    id: 'gi-mamao-papaia',
    name: 'Mamão papaia / formosa',
    category: 'Frutas Frescas & Secas',
    gi: 59,
    servingG: 140,
    servingLabel: '1/2 papaia ou 1 fatia (140g)',
    carbsG: 12,
    fiberG: 2.2,
    kcal: 56,
    proteinG: 0.7,
    fatG: 0.2
  },
  {
    id: 'gi-abacaxi-fresco',
    name: 'Abacaxi pérola fresco',
    category: 'Frutas Frescas & Secas',
    gi: 59,
    servingG: 120,
    servingLabel: '2 fatias médias (120g)',
    carbsG: 14,
    fiberG: 1.6,
    kcal: 58,
    proteinG: 0.6,
    fatG: 0.1
  },
  {
    id: 'gi-melao-fresco',
    name: 'Melão cantaloupe / amarelo',
    category: 'Frutas Frescas & Secas',
    gi: 65,
    servingG: 150,
    servingLabel: '1 fatia grande (150g)',
    carbsG: 10,
    fiberG: 1.2,
    kcal: 45,
    proteinG: 1.1,
    fatG: 0.2
  },
  {
    id: 'gi-melancia-fresca',
    name: 'Melancia fresca',
    category: 'Frutas Frescas & Secas',
    gi: 76,
    servingG: 120,
    servingLabel: '1 fatia pequena (120g)',
    carbsG: 8.5,
    fiberG: 0.5,
    kcal: 36,
    proteinG: 0.7,
    fatG: 0.2,
    note: 'Clássico paradoxo clínico: IG alto (76), mas 92% de água resulta em CG baixa (6,5) na porção.'
  },
  {
    id: 'gi-abacate',
    name: 'Abacate fresco',
    category: 'Frutas Frescas & Secas',
    gi: 15,
    servingG: 100,
    servingLabel: '3 colheres de sopa (100g)',
    carbsG: 2.0,
    fiberG: 6.3,
    kcal: 160,
    proteinG: 2.0,
    fatG: 14.7
  },
  {
    id: 'gi-tamaras-secas',
    name: 'Tâmaras secas sem caroço',
    category: 'Frutas Frescas & Secas',
    gi: 42,
    servingG: 40,
    servingLabel: '4 unidades (40g)',
    carbsG: 27,
    fiberG: 2.7,
    kcal: 112,
    proteinG: 0.8,
    fatG: 0.1,
    note: 'IG baixo a moderado, porém elevada concentração de açúcar eleva a CG em grandes quantidades.'
  },
  {
    id: 'gi-uva-passa',
    name: 'Uva passa seca',
    category: 'Frutas Frescas & Secas',
    gi: 64,
    servingG: 40,
    servingLabel: '2 colheres de sopa (40g)',
    carbsG: 30,
    fiberG: 1.6,
    kcal: 120,
    proteinG: 1.2,
    fatG: 0.2
  },

  // ==========================================================
  // LEGUMINOSAS
  // ==========================================================
  {
    id: 'gi-feijao-carioca',
    name: 'Feijão carioca cozido (apenas grãos + caldo)',
    category: 'Leguminosas',
    gi: 29,
    servingG: 130,
    servingLabel: '1 concha média (130g)',
    carbsG: 14,
    fiberG: 8.5,
    kcal: 99,
    proteinG: 6.2,
    fatG: 0.6,
    note: 'Excelente modulador glicêmico para combinar com arroz ou tubérculos.'
  },
  {
    id: 'gi-feijao-preto',
    name: 'Feijão preto cozido',
    category: 'Leguminosas',
    gi: 30,
    servingG: 130,
    servingLabel: '1 concha média (130g)',
    carbsG: 15,
    fiberG: 9.0,
    kcal: 100,
    proteinG: 6.0,
    fatG: 0.5
  },
  {
    id: 'gi-lentilha-cozida',
    name: 'Lentilha cozida',
    category: 'Leguminosas',
    gi: 32,
    servingG: 150,
    servingLabel: '1 concha cheia (150g)',
    carbsG: 18,
    fiberG: 7.9,
    kcal: 140,
    proteinG: 9.5,
    fatG: 0.6
  },
  {
    id: 'gi-grao-de-bico',
    name: 'Grão-de-bico cozido',
    category: 'Leguminosas',
    gi: 28,
    servingG: 150,
    servingLabel: '5 colheres de sopa (150g)',
    carbsG: 26,
    fiberG: 8.1,
    kcal: 195,
    proteinG: 10.2,
    fatG: 3.1
  },
  {
    id: 'gi-soja-cozida',
    name: 'Soja em grãos cozida',
    category: 'Leguminosas',
    gi: 16,
    servingG: 150,
    servingLabel: '1 xícara cozida (150g)',
    carbsG: 8.0,
    fiberG: 6.5,
    kcal: 210,
    proteinG: 21.0,
    fatG: 9.2
  },
  {
    id: 'gi-ervilha-cozida',
    name: 'Ervilha verde fresca cozida',
    category: 'Leguminosas',
    gi: 48,
    servingG: 100,
    servingLabel: '4 colheres de sopa (100g)',
    carbsG: 10,
    fiberG: 5.1,
    kcal: 78,
    proteinG: 5.2,
    fatG: 0.4
  },
  {
    id: 'gi-homus-pasta',
    name: 'Homus (pasta de grão-de-bico e tahine)',
    category: 'Leguminosas',
    gi: 14,
    servingG: 60,
    servingLabel: '2 colheres de sopa (60g)',
    carbsG: 6.0,
    fiberG: 3.5,
    kcal: 105,
    proteinG: 4.5,
    fatG: 6.0
  },

  // ==========================================================
  // LATICÍNIOS & BEBIDAS VEGETAIS
  // ==========================================================
  {
    id: 'gi-leite-integral',
    name: 'Leite de vaca integral',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 39,
    servingG: 200,
    servingLabel: '1 copo americano (200ml)',
    carbsG: 9.6,
    fiberG: 0,
    kcal: 122,
    proteinG: 6.4,
    fatG: 6.5
  },
  {
    id: 'gi-leite-desnatado',
    name: 'Leite de vaca desnatado',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 37,
    servingG: 200,
    servingLabel: '1 copo americano (200ml)',
    carbsG: 10,
    fiberG: 0,
    kcal: 70,
    proteinG: 6.8,
    fatG: 0.3
  },
  {
    id: 'gi-iogurte-natural',
    name: 'Iogurte natural integral sem açúcar',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 36,
    servingG: 170,
    servingLabel: '1 pote padrão (170g)',
    carbsG: 8.0,
    fiberG: 0,
    kcal: 108,
    proteinG: 6.8,
    fatG: 5.6
  },
  {
    id: 'gi-iogurte-grego-zero',
    name: 'Iogurte grego natural desnatado',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 19,
    servingG: 150,
    servingLabel: '1 pote (150g)',
    carbsG: 5.5,
    fiberG: 0,
    kcal: 88,
    proteinG: 14.5,
    fatG: 0.5
  },
  {
    id: 'gi-leite-soja-sem-acucar',
    name: 'Bebida vegetal de soja sem açúcar',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 34,
    servingG: 200,
    servingLabel: '1 copo (200ml)',
    carbsG: 4.0,
    fiberG: 1.0,
    kcal: 68,
    proteinG: 6.4,
    fatG: 3.2
  },
  {
    id: 'gi-bebida-aveia',
    name: 'Bebida vegetal de aveia',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 69,
    servingG: 200,
    servingLabel: '1 copo (200ml)',
    carbsG: 14,
    fiberG: 1.5,
    kcal: 92,
    proteinG: 2.0,
    fatG: 2.5,
    note: 'A hidrólise enzimática do amido de aveia no processamento eleva o IG próximo ao limiar alto.'
  },
  {
    id: 'gi-bebida-amendoas',
    name: 'Bebida vegetal de amêndoas sem açúcar',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 25,
    servingG: 200,
    servingLabel: '1 copo (200ml)',
    carbsG: 1.5,
    fiberG: 0.8,
    kcal: 30,
    proteinG: 1.1,
    fatG: 2.4
  },
  {
    id: 'gi-sorvete-creme',
    name: 'Sorvete de creme tradicional',
    category: 'Laticínios & Bebidas Vegetais',
    gi: 57,
    servingG: 65,
    servingLabel: '1 bola média (65g)',
    carbsG: 16,
    fiberG: 0.4,
    kcal: 138,
    proteinG: 2.3,
    fatG: 7.2
  },

  // ==========================================================
  // HORTALIÇAS & VERDURAS
  // ==========================================================
  {
    id: 'gi-brocolis-cozido',
    name: 'Brócolis cozido no vapor',
    category: 'Hortaliças & Verduras',
    gi: 15,
    servingG: 100,
    servingLabel: '1 xícara (100g)',
    carbsG: 4.0,
    fiberG: 3.4,
    kcal: 25,
    proteinG: 2.4,
    fatG: 0.3
  },
  {
    id: 'gi-tomate-fresco',
    name: 'Tomate fresco cru',
    category: 'Hortaliças & Verduras',
    gi: 15,
    servingG: 100,
    servingLabel: '1 unidade média (100g)',
    carbsG: 3.1,
    fiberG: 1.2,
    kcal: 18,
    proteinG: 0.9,
    fatG: 0.2
  },
  {
    id: 'gi-abobrinha-cozida',
    name: 'Abobrinha italiana cozida',
    category: 'Hortaliças & Verduras',
    gi: 15,
    servingG: 100,
    servingLabel: '4 colheres de sopa (100g)',
    carbsG: 2.5,
    fiberG: 1.4,
    kcal: 17,
    proteinG: 1.1,
    fatG: 0.2
  },
  {
    id: 'gi-berinjela-grelhada',
    name: 'Berinjela grelhada / cozida',
    category: 'Hortaliças & Verduras',
    gi: 15,
    servingG: 100,
    servingLabel: '4 fatias (100g)',
    carbsG: 3.5,
    fiberG: 2.5,
    kcal: 22,
    proteinG: 0.9,
    fatG: 0.2
  },
  {
    id: 'gi-couve-flor',
    name: 'Couve-flor cozida',
    category: 'Hortaliças & Verduras',
    gi: 15,
    servingG: 100,
    servingLabel: '1 xícara (100g)',
    carbsG: 2.8,
    fiberG: 2.1,
    kcal: 23,
    proteinG: 1.8,
    fatG: 0.3
  },
  {
    id: 'gi-folhosos-alface-rucula',
    name: 'Folhosos (alface, rúcula, espinafre)',
    category: 'Hortaliças & Verduras',
    gi: 10,
    servingG: 80,
    servingLabel: '1 prato de sobremesa (80g)',
    carbsG: 1.2,
    fiberG: 1.8,
    kcal: 14,
    proteinG: 1.3,
    fatG: 0.2
  },

  // ==========================================================
  // AÇÚCARES, DOCES & BEBIDAS
  // ==========================================================
  {
    id: 'gi-glicose-pura',
    name: 'Glicose pura / Dextrose (Padrão)',
    category: 'Açúcares, Doces & Bebidas',
    gi: 100,
    servingG: 20,
    servingLabel: '1 colher de sopa (20g)',
    carbsG: 20,
    fiberG: 0,
    kcal: 80,
    proteinG: 0,
    fatG: 0,
    note: 'Padrão ouro da escala internacional (IG = 100).'
  },
  {
    id: 'gi-maltodextrina',
    name: 'Maltodextrina (suplemento)',
    category: 'Açúcares, Doces & Bebidas',
    gi: 95,
    servingG: 30,
    servingLabel: '2 colheres de sopa (30g)',
    carbsG: 29,
    fiberG: 0,
    kcal: 116,
    proteinG: 0,
    fatG: 0
  },
  {
    id: 'gi-acucar-branco',
    name: 'Açúcar refinado (Sacarose)',
    category: 'Açúcares, Doces & Bebidas',
    gi: 65,
    servingG: 15,
    servingLabel: '1 colher de sopa (15g)',
    carbsG: 15,
    fiberG: 0,
    kcal: 60,
    proteinG: 0,
    fatG: 0,
    note: 'Sacarose é 50% glicose e 50% frutose, por isso seu IG é ~65, mas a densidade calórica e glicêmica em excesso é elevada.'
  },
  {
    id: 'gi-mel-abelha',
    name: 'Mel de abelha puro',
    category: 'Açúcares, Doces & Bebidas',
    gi: 61,
    servingG: 20,
    servingLabel: '1 colher de sopa (20g)',
    carbsG: 16.4,
    fiberG: 0,
    kcal: 64,
    proteinG: 0.1,
    fatG: 0
  },
  {
    id: 'gi-frutose-pura',
    name: 'Frutose cristalina pura',
    category: 'Açúcares, Doces & Bebidas',
    gi: 19,
    servingG: 15,
    servingLabel: '1 colher de sopa (15g)',
    carbsG: 15,
    fiberG: 0,
    kcal: 60,
    proteinG: 0,
    fatG: 0,
    note: 'IG baixo por metabolização hepática preferencial; excesso isolado favorece esteatose hepática e hipertrigliceridemia.'
  },
  {
    id: 'gi-chocolate-70',
    name: 'Chocolate amargo 70% cacau',
    category: 'Açúcares, Doces & Bebidas',
    gi: 25,
    servingG: 25,
    servingLabel: '4 quadradinhos (25g)',
    carbsG: 8.0,
    fiberG: 2.8,
    kcal: 142,
    proteinG: 2.2,
    fatG: 10.8
  },
  {
    id: 'gi-chocolate-ao-leite',
    name: 'Chocolate ao leite',
    category: 'Açúcares, Doces & Bebidas',
    gi: 43,
    servingG: 30,
    servingLabel: '1 barrinha pequena (30g)',
    carbsG: 17,
    fiberG: 0.8,
    kcal: 162,
    proteinG: 2.1,
    fatG: 9.3
  },
  {
    id: 'gi-suco-laranja',
    name: 'Suco de laranja integral (sem açúcar)',
    category: 'Açúcares, Doces & Bebidas',
    gi: 50,
    servingG: 200,
    servingLabel: '1 copo (200ml)',
    carbsG: 21,
    fiberG: 0.4,
    kcal: 90,
    proteinG: 1.4,
    fatG: 0.2,
    note: 'Ausência de bagaço eleva a velocidade de absorção e aumenta a Carga Glicêmica em relação à fruta inteira.'
  },
  {
    id: 'gi-refrigerante-cola',
    name: 'Refrigerante tipo cola tradicional',
    category: 'Açúcares, Doces & Bebidas',
    gi: 63,
    servingG: 350,
    servingLabel: '1 lata (350ml)',
    carbsG: 37,
    fiberG: 0,
    kcal: 149,
    proteinG: 0,
    fatG: 0
  },
  {
    id: 'gi-isotonic-esportivo',
    name: 'Bebida isotônica esportiva (Gatorade)',
    category: 'Açúcares, Doces & Bebidas',
    gi: 78,
    servingG: 250,
    servingLabel: '1 copo (250ml)',
    carbsG: 15,
    fiberG: 0,
    kcal: 60,
    proteinG: 0,
    fatG: 0
  },

  // ==========================================================
  // OLEAGINOSAS & SEMENTES
  // ==========================================================
  {
    id: 'gi-amendoim-torrado',
    name: 'Amendoim torrado sem casca',
    category: 'Oleaginosas & Sementes',
    gi: 14,
    servingG: 30,
    servingLabel: '1 punhado (30g)',
    carbsG: 2.5,
    fiberG: 2.6,
    kcal: 176,
    proteinG: 7.8,
    fatG: 14.8
  },
  {
    id: 'gi-castanha-caju',
    name: 'Castanha de caju torrada',
    category: 'Oleaginosas & Sementes',
    gi: 22,
    servingG: 30,
    servingLabel: '15 unidades (30g)',
    carbsG: 8.1,
    fiberG: 1.1,
    kcal: 172,
    proteinG: 5.5,
    fatG: 13.8
  },
  {
    id: 'gi-nozes-amendoas',
    name: 'Nozes e amêndoas mistas',
    category: 'Oleaginosas & Sementes',
    gi: 15,
    servingG: 30,
    servingLabel: '1 punhado (30g)',
    carbsG: 2.2,
    fiberG: 3.1,
    kcal: 185,
    proteinG: 5.6,
    fatG: 16.5
  },
  {
    id: 'gi-chia-linhaca',
    name: 'Sementes de chia / linhaça dourada',
    category: 'Oleaginosas & Sementes',
    gi: 12,
    servingG: 15,
    servingLabel: '1 colher de sopa (15g)',
    carbsG: 1.0,
    fiberG: 5.2,
    kcal: 73,
    proteinG: 2.6,
    fatG: 4.8,
    note: 'Formam gel viscoso no TGI, reduzindo significativamente a resposta glicêmica da refeição associada.'
  }
];

export const GLYCEMIC_INDEX_DATABASE: GlycemicFoodItem[] = RAW_GLYCEMIC_FOODS.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  glycemicIndex: item.gi,
  standardServingG: item.servingG,
  servingLabel: item.servingLabel,
  carbsPerServingG: item.carbsG,
  fiberPerServingG: item.fiberG,
  glycemicLoad: calculateGlycemicLoad(item.gi, item.carbsG),
  kcalPerServing: item.kcal,
  proteinPerServingG: item.proteinG,
  fatPerServingG: item.fatG,
  clinicalNote: item.note
}));
