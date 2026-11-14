import assert from 'node:assert/strict';
import {
  classifyGlycemicIndex,
  calculateGlycemicLoad,
  classifyGlycemicLoad,
  calculatePortionGlycemicMetrics
} from '../glycemicCalculations';
import { GLYCEMIC_INDEX_DATABASE } from '../../data/glycemicIndexDatabase';

// 1. Classificação do Índice Glicêmico (Baixo <= 55, Médio 56-69, Alto >= 70)
assert.equal(classifyGlycemicIndex(0).level, 'low');
assert.equal(classifyGlycemicIndex(55).level, 'low');
assert.equal(classifyGlycemicIndex(56).level, 'medium');
assert.equal(classifyGlycemicIndex(69).level, 'medium');
assert.equal(classifyGlycemicIndex(70).level, 'high');
assert.equal(classifyGlycemicIndex(100).level, 'high');

// 2. Fórmula da Carga Glicêmica: CG = (IG * Carboidratos Disponíveis) / 100
// Caso clássico da melancia: IG = 76, 120g têm 8.5g de carbo -> CG = 6.5 (Baixa)
const watermelonGl = calculateGlycemicLoad(76, 8.5);
assert.equal(watermelonGl, 6.5);
assert.equal(classifyGlycemicLoad(watermelonGl).level, 'low');

// Caso limiar de Carga Glicêmica: Baixa <= 10, Média > 10 e < 20, Alta >= 20
assert.equal(classifyGlycemicLoad(10).level, 'low');
assert.equal(classifyGlycemicLoad(10.1).level, 'medium');
assert.equal(classifyGlycemicLoad(19.9).level, 'medium');
assert.equal(classifyGlycemicLoad(20).level, 'high');

// 3. Simulador dinâmico de porção (dobrando a porção de arroz branco de 150g para 300g)
const whiteRice = GLYCEMIC_INDEX_DATABASE.find((f) => f.id === 'gi-arroz-branco');
assert.ok(whiteRice, 'Arroz branco deve existir na base IG/CG');
const doubledRice = calculatePortionGlycemicMetrics({
  glycemicIndex: whiteRice.glycemicIndex,
  standardServingG: whiteRice.standardServingG,
  carbsPerServingG: whiteRice.carbsPerServingG,
  fiberPerServingG: whiteRice.fiberPerServingG,
  customGrams: 300
});
assert.equal(doubledRice.carbsG, 84);
assert.equal(doubledRice.glycemicLoad, 61.3);
assert.equal(doubledRice.glClass.level, 'high');

// 4. Integridade da base única (IDs únicos, IG válido, CG consistente)
const seenIds = new Set<string>();
for (const item of GLYCEMIC_INDEX_DATABASE) {
  assert.ok(!seenIds.has(item.id), `ID duplicado: ${item.id}`);
  seenIds.add(item.id);
  assert.ok(item.glycemicIndex >= 0 && item.glycemicIndex <= 110, `IG inválido para ${item.name}`);
  assert.ok(item.standardServingG > 0, `Porção inválida para ${item.name}`);
  assert.equal(
    item.glycemicLoad,
    calculateGlycemicLoad(item.glycemicIndex, item.carbsPerServingG),
    `CG inconsistente para ${item.name}`
  );
}

console.log(`✓ glycemicCalculations tests passed (${GLYCEMIC_INDEX_DATABASE.length} foods verified)`);
